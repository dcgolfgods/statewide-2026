const EXTRA_SITEMAP_URL =
  'https://cdn.shopify.com/s/files/1/0799/5929/4245/files/extra-sitemap.xml?v=1781638183';

export async function loader() {
  const response = await fetch(EXTRA_SITEMAP_URL);
  if (!response.ok) {
    throw new Response('Failed to fetch extra sitemap xml', {
      status: response.status,
    });
  }

  const xml = await response.text();

  return new Response(xml, {
    headers: {
      'content-type': 'application/xml',
      'cache-control': `max-age=${60 * 60}`,
    },
  });
}