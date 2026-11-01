import {QUERY_PAGE_SIZE, renderSitemapUrlSet} from '~/lib/sitemap.server';

export async function loader({request, context: {storefront}}) {
  const baseUrl = new URL(request.url).origin;

  const data = await storefront.query(PAGES_QUERY, {
    variables: {
      first: QUERY_PAGE_SIZE,
      language: storefront.i18n.language,
    },
    cache: storefront.CacheNone(),
  });

  const nodes = data?.pages?.nodes ?? [];

  const entries = nodes
    .filter((p) => p.onlineStoreUrl)
    .map((p) => ({
      url: `${baseUrl}/${p.handle}`,
      lastMod: p.updatedAt,
      changeFreq: 'weekly',
    }));

  return new Response(renderSitemapUrlSet(entries), {
    headers: {
      'content-type': 'application/xml',
      'cache-control': `max-age=${60 * 60 * 24}`,
    },
  });
}

const PAGES_QUERY = `#graphql
  query sitemapPages($first: Int!, $language: LanguageCode)
  @inContext(language: $language) {
    pages(first: $first, query: "published_status:'published'") {
      nodes {
        updatedAt
        handle
        onlineStoreUrl
      }
    }
  }
`;
