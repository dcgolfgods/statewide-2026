const PRODUCT_SITEMAP_CDN_BASE =
  'https://cdn.shopify.com/s/files/1/0799/5929/4245/files';
const PRODUCT_SITEMAP_CDN_VERSION = '1785479780';
const A_CLASS_SITEMAP_URL = `${PRODUCT_SITEMAP_CDN_BASE}/a-class-sitemap.xml?v=1786298068`;
const MAX_PAGES = 13;

export async function loader({params}) {
  const pageParam = params.page;
  const isAClass = pageParam === 'a-class';
  const page = parseInt(pageParam, 10);

  if (!isAClass && (isNaN(page) || page < 1 || page > MAX_PAGES)) {
    throw new Response('Sitemap page not found', {status: 404});
  }

  const apiUrl = isAClass
    ? A_CLASS_SITEMAP_URL
    : `${PRODUCT_SITEMAP_CDN_BASE}/sitemap-${page}.xml?v=${PRODUCT_SITEMAP_CDN_VERSION}`;

  const response = await fetch(apiUrl);

  if (!response.ok) {
    throw new Response('Failed to fetch product sitemap', {
      status: response.status,
    });
  }

  const xml = await response.text();

  return new Response(xml, {
    headers: {
      'content-type': 'application/xml',
      'cache-control': `max-age=${60 * 60 * 24}`,
    },
  });
}
