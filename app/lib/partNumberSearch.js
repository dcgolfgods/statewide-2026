/**
 * Exact part-number (SKU) matches for Algolia searches.
 *
 * Algolia treats "." as a word separator, so a part number like "03.14.55"
 * is searched as "03" + "14" + "55". Those short numbers also appear in the
 * long model_numbers lists of unrelated products, which then outrank the
 * actual part (custom ranking favours stock). So when the query looks like a
 * part number, we also run a search restricted to `sku` and keep only exact
 * matches, and show those first.
 */

/** Single token with a digit and at least one . - or / between parts. */
const PART_NUMBER_PATTERN = /^(?=.*\d)[a-z0-9]+(?:[.\-/][a-z0-9]+)+$/i;

const normalize = (value) => String(value ?? '').trim().toLowerCase();

/** @param {string} query */
export function looksLikePartNumber(query) {
  return PART_NUMBER_PATTERN.test(normalize(query));
}

/**
 * Hits whose `sku` equals the query (case-insensitive). Empty when the query
 * doesn't look like a part number or the lookup fails.
 * @param {{search: Function}} index Algolia index
 * @param {string} query
 * @param {Record<string, unknown>} [params] extra search params (e.g. facetFilters)
 */
export async function findExactPartNumberHits(index, query, params = {}) {
  if (!index || !looksLikePartNumber(query)) return [];
  try {
    const {hits = []} = await index.search(query.trim(), {
      ...params,
      restrictSearchableAttributes: ['sku'],
      typoTolerance: false,
      hitsPerPage: 10,
      page: 0,
    });
    return hits.filter((hit) => normalize(hit.sku) === normalize(query));
  } catch (error) {
    console.error('Part number lookup failed', error);
    return [];
  }
}

/**
 * `exactHits` first, then `hits` without them.
 * @param {Array<{objectID: string}>} exactHits
 * @param {Array<{objectID: string}>} hits
 */
export function withExactHitsFirst(exactHits, hits = []) {
  if (!exactHits?.length) return hits;
  const exactIds = new Set(exactHits.map((hit) => hit.objectID));
  return [...exactHits, ...hits.filter((hit) => !exactIds.has(hit.objectID))];
}
