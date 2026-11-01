/**
 * Query Shopify metaobjects via Admin API (using ADMIN_API_ACCESS_TOKEN).
 * Uses fields.field_name:value syntax per Shopify docs:
 * https://shopify.dev/docs/apps/build/metafields/query-using-metafields
 *
 * Reusable for different metaobject types (e.g. search_data now, brand_index later).
 */
import {COLLECTION_DATA_FRAGMENT} from '~/data/fragments';

const ADMIN_API_VERSION = '2025-01';

/**
 * Run a GraphQL query against the Shopify Admin API.
 *
 * @param {Object} env - App env with PUBLIC_STORE_DOMAIN and ADMIN_API_ACCESS_TOKEN
 * @param {string} query - GraphQL query string
 * @param {Object} [variables] - Optional variables
 * @returns {Promise<Object>} - data or throws on error
 */
export async function adminGraphql(env, query, variables = {}) {
  const shop =
    env.PUBLIC_STORE_DOMAIN?.replace(/^https?:\/\//, '') ||
    env.PUBLIC_STORE_DOMAIN;
  const token = env.ADMIN_API_ACCESS_TOKEN;

  if (!shop || !token) {
    throw new Error(
      'shopifyAdminMetaobjects: PUBLIC_STORE_DOMAIN and ADMIN_API_ACCESS_TOKEN must be set',
    );
  }

  const url = `https://${shop}/admin/api/${ADMIN_API_VERSION}/graphql.json`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token,
    },
    body: JSON.stringify({query, variables}),
  });

  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(
      `Admin API: ${json.errors.map((e) => e.message).join('; ')}`,
    );
  }
  return json.data;
}

/**
 * Metaobject type: Search data (search_data).
 * Fields: tags (list of text), redirect_url (single line text).
 * Query matches if ANY tag equals the search term (case-sensitive in API).
 */
const SEARCH_DATA_METAOBJECT_TYPE = 'search_data';
const REDIRECTION_METAOBJECT_TYPE = 'redirection';
const LOCALE_PREFIX_REGEX = /^\/[a-z]{2}-[a-z]{2}(?=\/|$)/i;

/**
 * Find one "Search data" metaobject entry whose Tags list contains the given tag.
 * Tries exact match first (case-sensitive).
 *
 * @param {Object} env - App env (PUBLIC_STORE_DOMAIN, ADMIN_API_ACCESS_TOKEN)
 * @param {string} tagValue - Tag to match
 * @returns {Promise<{ url: string, handle: string } | null>} - First match or null
 */
export async function getSearchDataRedirectByTag(env, tagValue) {
  if (!tagValue || typeof tagValue !== 'string') return null;

  const trimmed = tagValue.trim();
  if (!trimmed) return null;

  const queryDoc = `#graphql
    query SearchDataByTag($type: String!, $query: String!, $first: Int!) {
      metaobjects(type: $type, first: $first, query: $query) {
        nodes {
          handle
          redirectUrl: field(key: "redirect_url") {
            value
          }
          tags: field(key: "tags") {
            value
          }
        }
      }
    }
  `;

  const variables = {
    type: SEARCH_DATA_METAOBJECT_TYPE,
    first: 1,
    query: `fields.tags:"${trimmed}"`,
  };

  const data = await adminGraphql(env, queryDoc, variables);
  const node = data?.metaobjects?.nodes?.[0];
  const url = node?.redirectUrl?.value?.trim();

  console.log("datadatadata",data, trimmed)
  if (!url) return null;

  return {
    url: url.startsWith('/') ? url : `/${url}`,
    handle: node?.handle ?? '',
  };
}

/**
 * Convert an incoming URL path to Shopify metaobject handle format.
 * - lowercase
 * - remove locale prefix (e.g. /en-au)
 * - remove all slashes
 * - remove special characters (keep letters, numbers, dashes)
 */
export function normalizePathToRedirectionHandle(pathname = '') {
  if (!pathname || typeof pathname !== 'string') return '';

  const decodedPath = safeDecodeURIComponent(pathname);
  const cleanPath = decodedPath
    .split('?')[0]
    .split('#')[0]
    .replace(LOCALE_PREFIX_REGEX, '');

  return cleanPath
    .toLowerCase()
    .replace(/\//g, '')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function safeDecodeURIComponent(value = '') {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/**
 * Lookup a Redirection metaobject from Storefront API by normalized handle.
 *
 * Metaobject type: redirection
 * Fields expected: from, to
 */
export async function getRedirectionByHandle(storefront, pathname) {
  if (!storefront) return null;

  const handle = normalizePathToRedirectionHandle(pathname);
  if (!handle) return null;

  const queryDoc = `#graphql
    query RedirectionByHandle($handle: MetaobjectHandleInput!) {
      metaobject(handle: $handle) {
        handle
        from: field(key: "from") {
          value
        }
        to: field(key: "to") {
          value
        }
      }
    }
  `;

  const data = await storefront.query(queryDoc, {
    variables: {
      handle: {
        type: REDIRECTION_METAOBJECT_TYPE,
        handle,
      },
    },
  });

  const node = data?.metaobject;
  const to = node?.to?.value?.trim();
  if (!to) return null;

  const isAbsolute = /^https?:\/\//i.test(to);
  return {
    handle: node?.handle ?? '',
    from: node?.from?.value?.trim() ?? '',
    to: isAbsolute || to.startsWith('/') ? to : `/${to}`,
  };
}

const COLLECTION_DATA_METAOBJECT_TYPE = 'collection_data';

// Lightweight query for broad matching (keeps query cost low).
const COLLECTION_DATA_LIGHT_QUERY_DOC = `#graphql
  query CollectionDataMetaobjectsLight($type: String!, $first: Int!, $after: String, $query: String) {
    metaobjects(type: $type, first: $first, after: $after, query: $query) {
      nodes {
        id
        handle
        url: field(key: "url") { value }
        top_description: field(key: "top_description") { value }
        below_description: field(key: "below_description") { value }
        custom_title: field(key: "custom_title") { value }
        brandHandle: field(key: "brand_handle") { value }
        applianceHandle: field(key: "appliance_handle") { value }
        partHandle: field(key: "part_handle") { value }
        show_banners: field(key: "show_banners") { value }
        do_not_compare_null: field(key: "do_not_compare") { value }
        searchQuery: field(key: "search_query") { value }
        noFilter: field(key: "no_filter") { value }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

// Full query for a single match only.
const COLLECTION_DATA_FULL_QUERY_DOC = `#graphql
  query CollectionDataMetaobjectsFull($type: String!, $first: Int!, $after: String, $query: String) {
    metaobjects(type: $type, first: $first, after: $after, query: $query) {
      nodes {
        id
        handle
        url: field(key: "url") { value }
        top_description: field(key: "top_description") { value }
        below_description: field(key: "below_description") { value }
        custom_title: field(key: "custom_title") { value }
        brandHandle: field(key: "brand_handle") { value }
        show_banners: field(key: "show_banners") { value }
        do_not_compare_null: field(key: "do_not_compare") { value }
        searchQuery: field(key: "search_query") { value }
        noFilter: field(key: "no_filter") { value }
        seoTitle: field(key: "seo_title") { value }
        seoDescription: field(key: "seo_description") { value }
        brandCollection: field(key: "brand_collection") {
          reference {
            ... on Collection {
              ...CollectionData
            }
          }
        }
        applianceHandle: field(key: "appliance_handle") { value }
        applianceCollection: field(key: "appliance_collection") {
          reference {
            ... on Collection {
              ...CollectionData
            }
          }
        }
        partHandle: field(key: "part_handle") { value }
        partCollection: field(key: "part_collection") {
          reference {
            ... on Collection {
              ...CollectionData
            }
          }
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
  ${COLLECTION_DATA_FRAGMENT}
`;

const COLLECTION_DATA_FULL_BY_ID_QUERY_DOC = `#graphql
  query CollectionDataMetaobjectById($id: ID!) {
    node(id: $id) {
      ... on Metaobject {
        id
        handle
        url: field(key: "url") { value }
        top_description: field(key: "top_description") { value }
        below_description: field(key: "below_description") { value }
        custom_title: field(key: "custom_title") { value }
        brandHandle: field(key: "brand_handle") { value }
        show_banners: field(key: "show_banners") { value }
        do_not_compare_null: field(key: "do_not_compare") { value }
        searchQuery: field(key: "search_query") { value }
        noFilter: field(key: "no_filter") { value }
        brandCollection: field(key: "brand_collection") {
          reference {
            ... on Collection {
              ...CollectionData
            }
          }
        }
        applianceHandle: field(key: "appliance_handle") { value }
        applianceCollection: field(key: "appliance_collection") {
          reference {
            ... on Collection {
              ...CollectionData
            }
          }
        }
        partHandle: field(key: "part_handle") { value }
        partCollection: field(key: "part_collection") {
          reference {
            ... on Collection {
              ...CollectionData
            }
          }
        }
      }
    }
  }
  ${COLLECTION_DATA_FRAGMENT}
`;

// Broad fetch utility used for matching.
export async function getCollectionDataMetaobjects(query, env, first = 25) {
  if (!env?.ADMIN_API_ACCESS_TOKEN) {
    return [];
  }

  const variables = {
    type: COLLECTION_DATA_METAOBJECT_TYPE,
    first,
    query,
  };

  const data = await adminGraphql(
    env,
    COLLECTION_DATA_LIGHT_QUERY_DOC,
    variables,
  );
  return data?.metaobjects?.nodes || [];
}

export async function getCollectionDataMetaobjectById(id, env) {
  if (!env?.ADMIN_API_ACCESS_TOKEN || !id) {
    return null;
  }

  const data = await adminGraphql(env, COLLECTION_DATA_FULL_BY_ID_QUERY_DOC, {
    id,
  });
  return data?.node || null;
}

// Single-row full fetch (kept for compatibility).
export async function getCollectionDataUsingMetaobject(url, query, env) {
  void url;

  if (!env?.ADMIN_API_ACCESS_TOKEN) {
    return null;
  }

  const variables = {
    type: COLLECTION_DATA_METAOBJECT_TYPE,
    first: 1,
    query,
  };

  const data = await adminGraphql(
    env,
    COLLECTION_DATA_FULL_QUERY_DOC,
    variables,
  );
  return data?.metaobjects?.nodes?.[0] || null;
}
