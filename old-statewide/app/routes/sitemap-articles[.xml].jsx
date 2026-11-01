import {QUERY_PAGE_SIZE, xmlEncode, renderSitemapUrlSet} from '~/lib/sitemap.server';

export async function loader({request, context: {storefront}}) {
  const baseUrl = new URL(request.url).origin;

  const data = await storefront.query(ARTICLES_QUERY, {
    variables: {
      first: QUERY_PAGE_SIZE,
      language: storefront.i18n.language,
    },
    cache: storefront.CacheNone(),
  });

  const nodes = data?.articles?.nodes ?? [];

  const entries = nodes
    .filter((a) => a.onlineStoreUrl)
    .map((a) => ({
      url: `${baseUrl}${xmlEncode(`/blogs/${a.handle}`)}`,
      lastMod: a.publishedAt,
      changeFreq: 'weekly',
    }));

  return new Response(renderSitemapUrlSet(entries), {
    headers: {
      'content-type': 'application/xml',
      'cache-control': `max-age=${60 * 60 * 24}`,
    },
  });
}

const ARTICLES_QUERY = `#graphql
  query sitemapArticles($first: Int!, $language: LanguageCode)
  @inContext(language: $language) {
    articles(first: $first, query: "published_status:'published'") {
      nodes {
        publishedAt
        handle
        onlineStoreUrl
        blog {
          handle
        }
      }
    }
  }
`;
