import {getProductImageAlt, isBrandLogoImage} from './productSeo';

export const GOOGLE_SHOPPING_OVERLAY_URL =
  'https://cdn.shopify.com/s/files/1/0799/5929/4245/files/overlay-image-logo.png?v=1785312374';

/** White areas of the overlay become transparent so the product stays visible. */
export const GOOGLE_SHOPPING_OVERLAY_STYLE = {
  backgroundImage: `url(${GOOGLE_SHOPPING_OVERLAY_URL})`,
  mixBlendMode: 'multiply',
};

export const GOOGLE_SHOPPING_OVERLAY_CLASS =
  'absolute inset-0 pointer-events-none bg-center bg-cover bg-no-repeat';

export function isGoogleShoppingImage(...altTexts) {
  return altTexts.some((altText) =>
    (altText || '').trim().toUpperCase().includes('GOOGLE_SHOPPING_IMAGE'),
  );
}

export function isGoogleShoppingMedia(med) {
  if (!med) return false;
  if (med.__typename && med.__typename !== 'MediaImage') return false;
  return isGoogleShoppingImage(
    med.alt,
    med.image?.altText,
    med.previewImage?.altText,
  );
}

/**
 * Show the first media item even if it is a Google Shopping image.
 * Hide every other Google Shopping image.
 * When the first image is Google Shopping, also skip the next normal image —
 * it is the same asset re-uploaded without the baked-in overlay.
 */
export function filterProductGalleryMedia(media) {
  if (!media?.length) {
    return {media: [], firstIsGoogleShopping: false};
  }

  const firstIsGoogleShopping = isGoogleShoppingMedia(media[0]);
  let skippedFirstNormalAfterGoogleShopping = false;

  const filtered = media.filter((med, index) => {
    if (med.__typename !== 'MediaImage') return true;

    if (isGoogleShoppingMedia(med)) {
      return index === 0 && firstIsGoogleShopping;
    }

    // First image is GOOGLE_SHOPPING_IMAGE → drop the following normal image
    if (firstIsGoogleShopping && !skippedFirstNormalAfterGoogleShopping) {
      skippedFirstNormalAfterGoogleShopping = true;
      return false;
    }

    return true;
  });

  return {media: filtered, firstIsGoogleShopping};
}

/** Google Merchant / Product rich-result crops (1:1, 4:3, 16:9). */
export const GOOGLE_PRODUCT_IMAGE_CROPS = [
  {width: 1200, height: 1200},
  {width: 1600, height: 1200},
  {width: 1600, height: 900},
];

function toSeoImage(image, alt) {
  const url = image?.url || image?.src;
  if (!url || isBrandLogoImage(image)) return null;

  return {
    ...image,
    url,
    altText: alt || image?.altText || '',
    width: image?.width,
    height: image?.height,
  };
}

function imageFromMedia(media) {
  if (!media) return null;
  if (media.__typename && media.__typename !== 'MediaImage') return null;
  if (media.image) {
    return {
      ...media.image,
      url: media.image.url || media.previewImage?.url,
      altText: media.image.altText || media.alt || media.previewImage?.altText,
    };
  }
  return media.previewImage || null;
}

function firstProductMediaImage(product) {
  const nodes = product?.media?.nodes || [];
  for (const media of nodes) {
    const image = imageFromMedia(media);
    if (image?.url && !isBrandLogoImage(image)) {
      return image;
    }
  }
  return null;
}

/**
 * Same image set as the PDP gallery carousel (MediaImage only).
 */
export function getProductGalleryImages({
  product,
  selectedVariant,
  productTitle,
  altText,
} = {}) {
  const alt =
    altText ||
    getProductImageAlt({product, selectedVariant}) ||
    productTitle ||
    product?.title ||
    selectedVariant?.image?.altText ||
    '';
  const {media} = filterProductGalleryMedia(product?.media?.nodes || []);
  const images = [];
  const seen = new Set();

  for (const node of media) {
    const image = toSeoImage(imageFromMedia(node), alt);
    if (!image) continue;
    if (seen.has(image.url)) continue;
    seen.add(image.url);
    images.push(image);
  }

  if (!images.length) {
    const fallback = getProductSeoImage({
      product,
      selectedVariant,
      productTitle,
      altText: alt,
    });
    if (fallback) images.push(fallback);
  }

  return images;
}

export function shopifyCdnImageUrl(url, {width, height, crop} = {}) {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    if (width) parsed.searchParams.set('width', String(width));
    if (height) parsed.searchParams.set('height', String(height));
    if (crop) parsed.searchParams.set('crop', crop);
    return parsed.toString();
  } catch {
    return url;
  }
}

/**
 * Product JSON-LD `image` URLs: every gallery photo, plus 1:1 / 4:3 / 16:9
 * Shopify CDN crops of each (same width/height/crop params as srcset).
 */
export function getProductJsonLdImages({
  product,
  selectedVariant,
  productTitle,
  altText,
} = {}) {
  const images = getProductGalleryImages({
    product,
    selectedVariant,
    productTitle,
    altText,
  });
  const urls = [];
  const seen = new Set();

  const push = (url) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    urls.push(url);
  };

  for (const image of images) {
    push(image.url);
    for (const crop of GOOGLE_PRODUCT_IMAGE_CROPS) {
      push(
        shopifyCdnImageUrl(image.url, {
          ...crop,
          crop: 'center',
        }),
      );
    }
  }

  return urls;
}

/**
 * Prefer the main product image for OG / Twitter / primaryImageOfPage,
 * never the store logo, and use descriptive product alt text.
 */
export function getProductSeoImage({
  product,
  selectedVariant,
  productTitle,
  altText,
}) {
  const alt =
    altText ||
    getProductImageAlt({product, selectedVariant}) ||
    productTitle ||
    product?.title ||
    selectedVariant?.image?.altText ||
    '';

  const candidates = [
    firstProductMediaImage(product),
    product?.featuredImage,
    selectedVariant?.image,
  ];

  for (const candidate of candidates) {
    const image = toSeoImage(candidate, alt);
    if (image) return image;
  }

  return null;
}
