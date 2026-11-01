import {QUERY_PAGE_SIZE, xmlEncode, renderSitemapUrlSet} from '~/lib/sitemap.server';

export async function loader({request, context: {storefront}}) {
  const baseUrl = new URL(request.url).origin;

  const data = await storefront.query(BLOGS_QUERY, {
    variables: {
      first: QUERY_PAGE_SIZE,
      language: storefront.i18n.language,
    },
    cache: storefront.CacheNone(),
  });

  const nodes = data?.blogs?.nodes ?? [];
  const now = new Date().toISOString();

  const entries = nodes
    .filter((b) => b.handle)
    .map((b) => ({
      url: `${baseUrl}/blogs/${xmlEncode(b.handle)}`,
      lastMod: now,
      changeFreq: 'weekly',
    }));

  return new Response(renderSitemapUrlSet(entries), {
    headers: {
      'content-type': 'application/xml',
      'cache-control': `max-age=${60 * 60 * 24}`,
    },
  });
}

const BLOGS_QUERY = `#graphql
  query sitemapBlogs($first: Int!, $language: LanguageCode)
  @inContext(language: $language) {
    blogs(first: $first) {
      nodes {
        handle
      }
    }
  }
`;
