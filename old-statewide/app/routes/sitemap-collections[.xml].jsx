import {QUERY_PAGE_SIZE, renderSitemapUrlSet} from '~/lib/sitemap.server';

export async function loader({request, context: {storefront}}) {
  const baseUrl = new URL(request.url).origin;

  const data = await storefront.query(COLLECTIONS_QUERY, {
    variables: {
      first: QUERY_PAGE_SIZE,
      language: storefront.i18n.language,
    },
    cache: storefront.CacheNone(),
  });

  const nodes = data?.collections?.nodes ?? [];

  const entries = nodes
    .filter((c) => c.onlineStoreUrl)
    .map((c) => ({
      url: `${baseUrl}/${c.handle}`,
      lastMod: c.updatedAt,
      changeFreq: 'daily',
    }));

  return new Response(renderSitemapUrlSet(entries), {
    headers: {
      'content-type': 'application/xml',
      'cache-control': `max-age=${60 * 60 * 24}`,
    },
  });
}

const COLLECTIONS_QUERY = `#graphql
  query sitemapCollections($first: Int!, $language: LanguageCode)
  @inContext(language: $language) {
    collections(
      first: $first
      query: "published_status:'online_store:visible'"
    ) {
      nodes {
        updatedAt
        handle
        onlineStoreUrl
      }
    }
  }
`;
