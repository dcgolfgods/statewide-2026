const EXTRA_SITEMAP_URL =
  'https://cdn.shopify.com/s/files/1/0799/5929/4245/files/extra-data.xml?v=1781552041';

const URLSET_OPENING_TAG_REGEX = /<urlset\b[^>]*>/i;
const URL_ENTRY_REGEX = /<url>[\s\S]*?<\/url>/gi;

export async function buildSitemapChunk(partNumber, totalParts = 2) {
  const response = await fetch(EXTRA_SITEMAP_URL);
  if (!response.ok) {
    throw new Response(`Failed to fetch source sitemap: ${response.status}`, {
      status: response.status,
    });
  }

  const sourceXml = await response.text();
  const openingTag = sourceXml.match(URLSET_OPENING_TAG_REGEX)?.[0];
  const entries = sourceXml.match(URL_ENTRY_REGEX) || [];

  if (!openingTag || entries.length === 0) {
    throw new Response('Invalid source sitemap format', {status: 502});
  }

  const safePartNumber = Math.max(1, Math.min(partNumber, totalParts));
  const chunkSize = Math.ceil(entries.length / totalParts);
  const start = (safePartNumber - 1) * chunkSize;
  const end = safePartNumber * chunkSize;
  const chunkEntries = entries.slice(start, end);

  return `${openingTag}
${chunkEntries.join('\n')}
</urlset>`;
}

