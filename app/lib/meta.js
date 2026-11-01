import {getSeoMeta} from '@shopify/hydrogen';

/**
 * Merges the `seo` payload every matched route returned from its loader,
 * the same way Hydrogen's removed `<Seo />` component did. Later matches
 * win, and `overrides` win over everything.
 * @param {Array<{data?: {seo?: SeoConfig}}>} matches
 * @param {...SeoConfig} overrides
 */
export function getRouteSeoMeta(matches = [], ...overrides) {
  return getSeoMeta(...matches.map((match) => match?.data?.seo), ...overrides);
}

/** @typedef {import('@shopify/hydrogen').SeoConfig} SeoConfig */
