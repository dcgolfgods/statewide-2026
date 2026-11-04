import {modelData} from '~/components/findModelData';

/**
 * Sections of the /findyourmodel guide, from published `model_number_guide`
 * metaobjects (sorted by sort_order), falling back to the copy bundled in
 * findModelData.js when none are published yet.
 * @returns {Promise<Array<ModelGuide>>}
 */
export async function getModelGuides(storefront) {
  try {
    const {metaobjects} = await storefront.query(MODEL_GUIDES_QUERY, {
      variables: {language: storefront.i18n.language},
      cache: storefront.CacheShort(),
    });
    const guides = (metaobjects?.nodes ?? [])
      .map(normalizeGuide)
      .filter(Boolean)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    if (guides.length) return guides;
  } catch (error) {
    console.error('model_number_guide query failed, using bundled copy', error);
  }
  return modelData;
}

function normalizeGuide(node) {
  const appliance = node.appliance?.value?.trim();
  const slug = node.slug?.value?.trim();
  if (!appliance || !slug) return null;

  const fileImages = (node.images?.references?.nodes ?? [])
    .map((file) => file?.image)
    .filter((image) => image?.url)
    .map((image) => ({
      url: image.url,
      alt: image.altText || '',
      width: image.width,
      height: image.height,
    }));

  const collection = node.collection?.reference;
  return {
    appliance,
    slug,
    summary: node.summary?.value?.trim() || '',
    bodyHtml: richTextToHtml(node.body?.value),
    images: fileImages.length ? fileImages : parseLegacyImages(node.legacy_images?.value),
    link: collection?.handle
      ? {
          url: `/${collection.handle}`,
          label: node.link_label?.value?.trim() || `Shop ${collection.title} parts`,
        }
      : null,
    sortOrder: Number(node.sort_order?.value ?? 0),
  };
}

function parseLegacyImages(value) {
  try {
    const images = JSON.parse(value || '[]');
    return Array.isArray(images) ? images.filter((image) => image?.url) : [];
  } catch {
    return [];
  }
}

/**
 * Shopify rich_text_field JSON to HTML. Covers the node types the metaobject
 * editor produces: headings, paragraphs, lists, links and bold/italic text.
 */
export function richTextToHtml(value) {
  if (!value) return '';
  let root;
  try {
    root = JSON.parse(value);
  } catch {
    return '';
  }
  return renderNodes(root?.children);
}

function renderNodes(nodes = []) {
  return nodes.map(renderNode).join('');
}

function renderNode(node) {
  switch (node?.type) {
    case 'heading': {
      // H1 is the page title and H2 the section title; keep content at H3+.
      const level = Math.min(Math.max(Number(node.level) || 3, 3), 6);
      return `<h${level}>${renderNodes(node.children)}</h${level}>`;
    }
    case 'paragraph':
      return `<p>${renderNodes(node.children)}</p>`;
    case 'list': {
      const tag = node.listType === 'ordered' ? 'ol' : 'ul';
      return `<${tag}>${renderNodes(node.children)}</${tag}>`;
    }
    case 'list-item':
      return `<li>${renderNodes(node.children)}</li>`;
    case 'link': {
      const href = escapeHtml(node.url || '#');
      const target = node.target ? ` target="${escapeHtml(node.target)}"` : '';
      return `<a href="${href}"${target}>${renderNodes(node.children)}</a>`;
    }
    case 'text': {
      let text = escapeHtml(node.value || '');
      if (node.bold) text = `<strong>${text}</strong>`;
      if (node.italic) text = `<em>${text}</em>`;
      return text;
    }
    default:
      return renderNodes(node?.children);
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const MODEL_GUIDES_QUERY = `#graphql
  query ModelNumberGuides($language: LanguageCode) @inContext(language: $language) {
    metaobjects(type: "model_number_guide", first: 50) {
      nodes {
        appliance: field(key: "appliance") { value }
        slug: field(key: "slug") { value }
        summary: field(key: "summary") { value }
        body: field(key: "body") { value }
        legacy_images: field(key: "legacy_images") { value }
        link_label: field(key: "link_label") { value }
        sort_order: field(key: "sort_order") { value }
        images: field(key: "images") {
          references(first: 10) {
            nodes {
              ... on MediaImage {
                image { url altText width height }
              }
            }
          }
        }
        collection: field(key: "collection") {
          reference {
            ... on Collection { handle title }
          }
        }
      }
    }
  }
`;

/**
 * @typedef {{appliance: string, slug: string, summary: string, bodyHtml?: string,
 *   images: Array<{url: string, alt: string, width?: number, height?: number}>,
 *   link?: {url: string, label: string} | null, sortOrder?: number}} ModelGuide
 */
