import {useMatches} from '@remix-run/react';

import {getImageMimeType} from '~/lib/productSeo';

function getSeoMedia(matches = []) {
  for (let index = matches.length - 1; index >= 0; index -= 1) {
    const seo = matches[index]?.data?.seo;
    const media = seo?.image || seo?.media;
    if (!media) continue;
    return Array.isArray(media) ? media[0] : media;
  }
  return null;
}

/**
 * Hydrogen's Seo component emits og:image:* from a media object, but not
 * property="og:image" or twitter:image. Those are the tags Google and
 * social crawlers use most often for product thumbnails.
 */
export function SeoImageMeta() {
  const matches = useMatches();
  const media = getSeoMedia(matches);
  const url = typeof media === 'string' ? media : media?.url;

  if (!url) return null;

  const alt = typeof media === 'object' ? media.altText : '';
  const width = typeof media === 'object' ? media.width : undefined;
  const height = typeof media === 'object' ? media.height : undefined;
  const type = getImageMimeType(url);

  return (
    <>
      <meta property="og:image" content={url} />
      <meta property="og:image:url" content={url} />
      <meta property="og:image:secure_url" content={url} />
      {alt ? <meta property="og:image:alt" content={alt} /> : null}
      {width ? (
        <meta property="og:image:width" content={String(width)} />
      ) : null}
      {height ? (
        <meta property="og:image:height" content={String(height)} />
      ) : null}
      {type ? <meta property="og:image:type" content={type} /> : null}
      <meta name="twitter:image" content={url} />
      <meta name="twitter:card" content="summary_large_image" />
    </>
  );
}
