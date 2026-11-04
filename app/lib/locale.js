import {countries} from '~/data/countries';

/**
 * The optional ($locale) URL segment only gets a value when the first path
 * segment isn't otherwise matched, e.g. "lg" in /lg/search or a product handle
 * in /<product>/search. Throws a 404 unless it is a real locale prefix (see
 * app/data/countries.js), so those URLs aren't duplicates of the page without
 * the prefix. Brand and collection URLs (/lg, /lg/dishwashers) never set it.
 *
 * Called first in the loader of every ($locale).* route except the $brand
 * ones. (A shared ($locale) layout route can't do it: nesting changes route
 * ranking, so /lg would match the home route with locale "lg".)
 * @param {{locale?: string}} params
 */
export function assertValidLocaleParam(params) {
  if (params?.locale && !countries[`/${params.locale.toLowerCase()}`]) {
    throw new Response('page', {status: 404});
  }
}
