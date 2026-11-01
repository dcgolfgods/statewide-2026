import {xmlEncode, renderSitemapIndexXml} from '~/lib/sitemap.server';
import {isSearchEngineIndexable} from '~/lib/indexing.server';

const PRODUCT_SITEMAP_PAGES = 13;

export async function loader({request}) {
  // Do not advertise sitemap URLs on staging / non-production hosts.
  if (!isSearchEngineIndexable(request)) {
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>',
      {
        headers: {
          'content-type': 'application/xml',
          'cache-control': 'max-age=300',
          'X-Robots-Tag': 'noindex, nofollow',
        },
      },
    );
  }

  const baseUrl = new URL(request.url).origin;
  const now = new Date().toISOString();

  const productUrls = [
    ...Array.from({length: PRODUCT_SITEMAP_PAGES}, (_, i) => ({
      loc: xmlEncode(`${baseUrl}/sitemap-products/${i + 1}.xml`),
      lastMod: now,
    })),
    {
      loc: xmlEncode(`${baseUrl}/sitemap-products/a-class.xml`),
      lastMod: now,
    },
  ];

  const otherUrls = [
    'collections',
    'pages',
    'articles',
    'extra',
    // 'blogs',
  ].map((type) => ({
    loc: xmlEncode(`${baseUrl}/sitemap-${type}.xml`),
    lastMod: now,
  }));

  const xml = renderSitemapIndexXml([...productUrls, ...otherUrls]);

  return new Response(xml, {
    headers: {
      'content-type': 'application/xml',
      'cache-control': `max-age=${60 * 60 * 24}`,
    },
  });
}
