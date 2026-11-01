import {xmlEncode, renderSitemapIndexXml} from '~/lib/sitemap.server';

export async function loader({request}) {
  const baseUrl = new URL(request.url).origin;
  const now = new Date().toISOString();

  const sitemapUrls = [1, 2].map((part) => ({
    loc: xmlEncode(`${baseUrl}/sitemap-new-${part}.xml`),
    lastMod: now,
  }));

  const xml = renderSitemapIndexXml(sitemapUrls);

  return new Response(xml, {
    headers: {
      'content-type': 'application/xml',
      'cache-control': `max-age=${60 * 60}`,
    },
  });
}

