export const QUERY_PAGE_SIZE = 250;

export function xmlEncode(string) {
  return string.replace(/[&<>'"]/g, (char) => `&#${char.charCodeAt(0)};`);
}

export function renderSitemapUrlSet(urlsDatas) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
>
  ${urlsDatas.map(renderUrlTag).join('')}
</urlset>`;
}

export function renderSitemapIndexXml(sitemapUrls) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${sitemapUrls
    .map(
      ({loc, lastMod}) => `
  <sitemap>
    <loc>${loc}</loc>
    <lastmod>${lastMod}</lastmod>
  </sitemap>`,
    )
    .join('')}
</sitemapindex>`;
}

export function renderUrlTag({url, lastMod, changeFreq, image}) {
  return `
  <url>
    <loc>${url}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>${changeFreq}</changefreq>
    ${
      image
        ? `<image:image>
      <image:loc>${image.url}</image:loc>
      <image:title>${image.title ?? ''}</image:title>
      <image:caption>${image.caption ?? ''}</image:caption>
    </image:image>`
        : ''
    }
  </url>`;
}
