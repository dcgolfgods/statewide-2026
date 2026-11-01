import {getSeoMeta} from '@shopify/hydrogen';

/**
 * Merges the `seo` payload every matched route returned from its loader,
 * the same way Hydrogen's removed `<Seo />` component did. Later matches
 * win, and `overrides` win over everything.
 * @param {Array<{data?: {seo?: SeoConfig}}>} matches
 * @param {...SeoConfig} overrides
 */
export function getRouteSeoMeta(matches = [], ...overrides) {
  const tags = getSeoMeta(
    ...matches.map((match) => match?.data?.seo),
    ...overrides,
  );
  return tags.map(withRootTrailingSlash).map(withTwitterNameAttribute);
}

/**
 * getSeoMeta emits `property="twitter:*"`; Twitter cards (and the old
 * `<Seo />`) use `name="twitter:*"`.
 * @param {Record<string, unknown>} tag
 */
function withTwitterNameAttribute(tag) {
  if (typeof tag?.property !== 'string' || !tag.property.startsWith('twitter:')) {
    return tag;
  }
  const {property, ...rest} = tag;
  return {name: property, ...rest};
}

/**
 * getSeoMeta strips every trailing slash, which turns the homepage canonical
 * into a bare origin; keep `https://host/` as the old `<Seo />` emitted it.
 * @param {Record<string, unknown>} tag
 */
function withRootTrailingSlash(tag) {
  const isUrlTag =
    (tag?.tagName === 'link' && tag.rel === 'canonical') ||
    tag?.property === 'og:url';
  if (!isUrlTag) return tag;

  const key = tag.tagName === 'link' ? 'href' : 'content';
  const value = tag[key];
  if (typeof value !== 'string' || !/^https?:\/\/[^/]+$/i.test(value)) {
    return tag;
  }
  return {...tag, [key]: `${value}/`};
}

/** @typedef {import('@shopify/hydrogen').SeoConfig} SeoConfig */
