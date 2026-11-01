import {isSearchEngineIndexable} from '~/lib/indexing.server';

export const loader = ({request}) => {
  const url = new URL(request.url);
  const allowIndexing = isSearchEngineIndexable(request);

  return new Response(
    robotsTxtData({url: url.origin, allowIndexing}),
    {
      status: 200,
      headers: {
        'content-type': 'text/plain',
        // Staging: short cache so changes apply quickly. Production: 24h.
        'cache-control': allowIndexing
          ? `max-age=${60 * 60 * 24}`
          : 'max-age=300',
        ...(allowIndexing
          ? {}
          : {'X-Robots-Tag': 'noindex, nofollow'}),
      },
    },
  );
};

function robotsTxtData({url, allowIndexing}) {
  if (!allowIndexing) {
    return `
User-agent: *
Disallow: /

User-agent: Googlebot
Disallow: /

User-agent: adsbot-google
Disallow: /
`.trim();
  }

  const sitemapUrl = url ? `${url}/sitemap.xml` : undefined;

  return `
User-agent: *
Disallow: /admin
Disallow: /cart
Disallow: /orders
Disallow: /checkouts/
Disallow: /checkout
Disallow: /carts
Disallow: /account
Disallow: /collections
Disallow: /collections/
Disallow: /collections/*
Disallow: /*?variant=
Disallow: /*?Title=Default Title
Disallow: /*?Title=Default+Title
Disallow: /*?Title=Default%20Title
Disallow: /*?SystemName=aboutus
Disallow: /*?SystemName=privacyinfo
Disallow: /*?SystemName=conditionsofUse
Disallow: /*?SystemName=shippinginfo
Disallow: /*?attachment_id=
Disallow: /*?s=
${sitemapUrl ? `Sitemap: ${sitemapUrl}` : ''}

# Google adsbot ignores robots.txt unless specifically named!
User-agent: adsbot-google
Disallow: /checkouts/
Disallow: /checkout
Disallow: /carts
Disallow: /orders

User-agent: Pinterest
Crawl-delay: 1
`.trim();
}
