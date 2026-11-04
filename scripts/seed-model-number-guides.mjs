/**
 * One-off: creates the `model_number_guide` metaobject definition and one
 * published entry per section of scripts/model-number-guides.seed.js, so the
 * /findyourmodel copy can be edited in Shopify admin (Content > Metaobjects).
 *
 *   node scripts/seed-model-number-guides.mjs          # dry run: prints what it would do
 *   node scripts/seed-model-number-guides.mjs --write  # writes to the store in .env
 *
 * Needs ADMIN_API_ACCESS_TOKEN with write_metaobject_definitions,
 * write_metaobjects and read_products. Re-running is safe: the definition is
 * reused and entries are upserted by handle (the slug).
 */
import fs from 'node:fs';
import {modelData} from './model-number-guides.seed.js';

const WRITE = process.argv.includes('--write');
const API_VERSION = '2026-04';
const TYPE = 'model_number_guide';

const env = Object.fromEntries(
  fs
    .readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n')
    .filter((line) => line.includes('='))
    .map((line) => {
      const index = line.indexOf('=');
      return [line.slice(0, index), line.slice(index + 1).replace(/^"|"$/g, '')];
    }),
);
const shop = env.PUBLIC_STORE_DOMAIN.replace(/^https?:\/\//, '');

async function gql(query, variables = {}) {
  const response = await fetch(`https://${shop}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json', 'X-Shopify-Access-Token': env.ADMIN_API_ACCESS_TOKEN},
    body: JSON.stringify({query, variables}),
  });
  const json = await response.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

const DEFINITION = {
  type: TYPE,
  name: 'Model number guide',
  description: 'One section of the /findyourmodel page: where to find the model number on an appliance.',
  displayNameKey: 'appliance',
  access: {storefront: 'PUBLIC_READ'},
  capabilities: {publishable: {enabled: true}},
  fieldDefinitions: [
    {key: 'appliance', name: 'Appliance', type: 'single_line_text_field', required: true, description: 'Section heading (H2) and tab label, e.g. "Dishwashers".'},
    {key: 'slug', name: 'Slug', type: 'single_line_text_field', required: true, description: 'Anchor id, e.g. "dishwashers" for /findyourmodel#dishwashers. Keep unique and stable.'},
    {key: 'summary', name: 'Summary', type: 'multi_line_text_field', description: 'Direct answer, rendered as the first paragraph.'},
    {key: 'body', name: 'Body', type: 'rich_text_field', description: 'More detail. Use Heading 3 for sub-types (e.g. "Ducted systems").'},
    {key: 'images', name: 'Images', type: 'list.file_reference', description: 'Guide photos. Set alt text on each file in Content > Files. While empty, "Legacy images" is used.', validations: [{name: 'file_type_options', value: '["Image"]'}]},
    {key: 'legacy_images', name: 'Legacy images', type: 'json', description: 'Images migrated from the old page: [{"url","alt","width","height"}]. Used only while "Images" is empty.'},
    {key: 'collection', name: 'Parts collection', type: 'collection_reference', description: 'Parts category linked at the end of the section.'},
    {key: 'link_label', name: 'Link label', type: 'single_line_text_field', description: 'Text of the parts link, e.g. "Shop dishwasher parts".'},
    {key: 'sort_order', name: 'Sort order', type: 'number_integer', required: true, description: 'Tab order, lowest first.'},
  ],
};

/** The bundled bodyHtml only uses <h3> and <p>; turn it into rich text JSON. */
function htmlToRichText(html = '') {
  const children = [];
  const pattern = /<(h3|p)>([\s\S]*?)<\/\1>/g;
  let match;
  while ((match = pattern.exec(html))) {
    const text = match[2].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim();
    if (!text) continue;
    children.push(
      match[1] === 'h3'
        ? {type: 'heading', level: 3, children: [{type: 'text', value: text}]}
        : {type: 'paragraph', children: [{type: 'text', value: text}]},
    );
  }
  return children.length ? JSON.stringify({type: 'root', children}) : null;
}

async function collectionId(handle) {
  const data = await gql(`query($handle: String!) { collectionByHandle(handle: $handle) { id } }`, {handle});
  return data.collectionByHandle?.id ?? null;
}

async function ensureDefinition() {
  const existing = await gql(`query { metaobjectDefinitionByType(type: "${TYPE}") { id } }`);
  if (existing.metaobjectDefinitionByType) {
    console.log(`definition exists: ${existing.metaobjectDefinitionByType.id}`);
    return;
  }
  if (!WRITE) {
    console.log(`would create definition ${TYPE} with ${DEFINITION.fieldDefinitions.length} fields`);
    return;
  }
  const data = await gql(
    `mutation($definition: MetaobjectDefinitionCreateInput!) {
      metaobjectDefinitionCreate(definition: $definition) { metaobjectDefinition { id } userErrors { field message } }
    }`,
    {definition: DEFINITION},
  );
  const {metaobjectDefinition, userErrors} = data.metaobjectDefinitionCreate;
  if (userErrors.length) throw new Error(JSON.stringify(userErrors));
  console.log(`created definition: ${metaobjectDefinition.id}`);
}

async function upsertGuide(guide, index) {
  const fields = [
    {key: 'appliance', value: guide.appliance},
    {key: 'slug', value: guide.slug},
    {key: 'summary', value: guide.summary},
    {key: 'legacy_images', value: JSON.stringify(guide.images)},
    {key: 'sort_order', value: String((index + 1) * 10)},
  ];
  const body = htmlToRichText(guide.bodyHtml);
  if (body) fields.push({key: 'body', value: body});
  if (guide.link) {
    const id = await collectionId(guide.link.url.replace(/^\//, ''));
    if (id) fields.push({key: 'collection', value: id});
    else console.warn(`  ! no collection for ${guide.link.url}; the section will have no parts link`);
    fields.push({key: 'link_label', value: guide.link.label});
  }

  if (!WRITE) {
    console.log(`would upsert ${guide.slug} (${fields.map((field) => field.key).join(', ')})`);
    return;
  }
  const data = await gql(
    `mutation($handle: MetaobjectHandleInput!, $metaobject: MetaobjectUpsertInput!) {
      metaobjectUpsert(handle: $handle, metaobject: $metaobject) { metaobject { id handle } userErrors { field message } }
    }`,
    {
      handle: {type: TYPE, handle: guide.slug},
      metaobject: {fields, capabilities: {publishable: {status: 'ACTIVE'}}},
    },
  );
  const {metaobject, userErrors} = data.metaobjectUpsert;
  if (userErrors.length) throw new Error(`${guide.slug}: ${JSON.stringify(userErrors)}`);
  console.log(`upserted ${metaobject.handle}: ${metaobject.id}`);
}

console.log(`${WRITE ? 'WRITING to' : 'Dry run for'} ${shop}`);
await ensureDefinition();
for (const [index, guide] of modelData.entries()) {
  await upsertGuide(guide, index);
}
