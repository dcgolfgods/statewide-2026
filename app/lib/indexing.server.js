/**
 * Production storefront hosts that should remain crawlable/indexable.
 * Any other host (Oxygen staging, preview, localhost) is treated as noindex.
 */
const PRODUCTION_HOSTS = new Set([
  'www.statewideapp.com.au',
  'statewideapp.com.au',
]);

/**
 * @param {Request | string} requestOrUrl
 * @returns {boolean}
 */
export function isSearchEngineIndexable(requestOrUrl) {
  const url =
    typeof requestOrUrl === 'string'
      ? new URL(requestOrUrl)
      : new URL(requestOrUrl.url);
  return PRODUCTION_HOSTS.has(url.hostname.toLowerCase());
}
