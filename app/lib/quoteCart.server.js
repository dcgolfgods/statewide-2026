import {adminGraphql} from '~/lib/shopifyAdminMetaobjects';

export const QUOTE_CART_ATTRIBUTE = 'quote_cart';
export const QUOTE_REF_ATTRIBUTE = 'quote_ref';
export const QUOTE_LINE_SKU_ATTRIBUTE = '_sku';
export const QUOTE_LINE_PRICE_ATTRIBUTE = '_quote_price';
export const QUOTE_LINE_KEY_ATTRIBUTE = '_quote_key';
export const QUOTE_LINE_NOTES_ATTRIBUTE = '_notes';
const QUOTE_CART_FLAG = 'quote_cart';

/**
 * Encode a value the Shopify Function can reverse with the same secret.
 *
 * Format: XOR with QUOTE_CART_SECRET, then Base64.
 * Function decode (JavaScript):
 *
 *   function decodeQuoteKey(token, secret) {
 *     const xored = atob(token);
 *     let plain = '';
 *     for (let i = 0; i < xored.length; i++) {
 *       plain += String.fromCharCode(
 *         xored.charCodeAt(i) ^ secret.charCodeAt(i % secret.length),
 *       );
 *     }
 *     return plain;
 *   }
 *
 * Cart attribute `quote_cart` decodes to "quote_cart".
 * Line attribute `_quote_key` decodes to "SKU|PRICE".
 * If decode matches, apply `_quote_price`.
 */
export function encodeQuoteKey(plainText, secret) {
  if (!secret) {
    throw new Error('QUOTE_CART_SECRET is not configured');
  }

  let xored = '';
  for (let i = 0; i < plainText.length; i++) {
    xored += String.fromCharCode(
      plainText.charCodeAt(i) ^ secret.charCodeAt(i % secret.length),
    );
  }

  return btoa(xored);
}

export function decodeQuoteKey(token, secret) {
  const xored = atob(token);
  let plain = '';
  for (let i = 0; i < xored.length; i++) {
    plain += String.fromCharCode(
      xored.charCodeAt(i) ^ secret.charCodeAt(i % secret.length),
    );
  }
  return plain;
}

export function getQuoteApiKey(env) {
  return env?.QUOTE_CART_API_KEY || '';
}

export function getQuoteSecret(env) {
  return env?.QUOTE_CART_SECRET || env?.QUOTE_CART_API_KEY || '';
}

export function getRequestApiKey(request) {
  const headerKey = request.headers.get('X-Quote-Api-Key');
  if (headerKey) return headerKey.trim();

  const auth = request.headers.get('Authorization') || '';
  if (auth.toLowerCase().startsWith('bearer ')) {
    return auth.slice(7).trim();
  }

  return '';
}

export function isAuthorizedQuoteRequest(request, env) {
  const expected = getQuoteApiKey(env);
  if (!expected) return false;
  return getRequestApiKey(request) === expected;
}

export function normalizeQuoteItems(input) {
  const rawItems = Array.isArray(input)
    ? input
    : Array.isArray(input?.items)
    ? input.items
    : Array.isArray(input?.skus)
    ? input.skus
    : [];

  return rawItems.map((item, index) => {
    const sku =
      typeof item === 'string'
        ? item.trim()
        : String(item?.sku ?? item?.SKU ?? '').trim();
    const qty = Number(item?.qty ?? item?.quantity ?? 1);
    const priceValue = item?.price ?? item?.specialPrice ?? item?.special_price;
    const price =
      priceValue === undefined || priceValue === null || priceValue === ''
        ? null
        : String(priceValue).trim();
    const notesValue = item?.notes ?? item?.note ?? item?.Notes ?? '';
    const notes = String(notesValue).trim() || null;

    return {
      index,
      sku,
      qty: Number.isFinite(qty) ? Math.max(1, Math.floor(qty)) : 1,
      price,
      notes,
    };
  });
}

export function normalizeQuoteRef(input) {
  const value =
    input?.quote_ref ??
    input?.quoteRef ??
    input?.quote_reference ??
    input?.quoteReference ??
    '';

  const quoteRef = String(value).trim();
  return quoteRef || null;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeQuoteEmail(input) {
  const value = input?.email ?? input?.customer_email ?? input?.customerEmail ?? '';
  const email = String(value).trim();

  if (!email) {
    return {email: null, error: null};
  }

  if (!EMAIL_PATTERN.test(email)) {
    return {email: null, error: 'Please provide a valid email address'};
  }

  return {email, error: null};
}

function escapeSkuQueryValue(sku) {
  return String(sku).replace(/"/g, '');
}

function buildSkuSearchQuery(skus) {
  return skus
    .map((sku) => `sku:"${escapeSkuQueryValue(sku)}"`)
    .join(' OR ');
}

function addVariantToMap(map, variant) {
  if (!variant?.id || !variant?.sku) return;
  map.set(String(variant.sku).trim().toLowerCase(), {
    id: variant.id,
    sku: variant.sku,
  });
}

// Admin API document (not validated by Storefront codegen)
const ADMIN_VARIANTS_QUERY = `
  query QuoteCartVariants($query: String!, $first: Int!) {
    productVariants(first: $first, query: $query) {
      nodes {
        id
        sku
      }
    }
  }
`;

const STOREFRONT_PRODUCTS_QUERY = `#graphql
  query QuoteCartProducts(
    $query: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(first: 50, query: $query) {
      nodes {
        variants(first: 50) {
          nodes {
            id
            sku
          }
        }
      }
    }
  }
`;

const CART_CREATE_MUTATION = `#graphql
  mutation QuoteCartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        totalQuantity
        attributes {
          key
          value
        }
        buyerIdentity {
          email
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

async function findVariantsBySkus(env, storefront, skus) {
  const uniqueSkus = [...new Set(skus.map((sku) => sku.trim()).filter(Boolean))];
  const variantsBySku = new Map();

  if (!uniqueSkus.length) {
    return variantsBySku;
  }

  const query = buildSkuSearchQuery(uniqueSkus);

  if (env?.ADMIN_API_ACCESS_TOKEN && env?.PUBLIC_STORE_DOMAIN) {
    try {
      const data = await adminGraphql(env, ADMIN_VARIANTS_QUERY, {
        query,
        first: Math.min(Math.max(uniqueSkus.length * 2, 10), 50),
      });

      for (const variant of data?.productVariants?.nodes || []) {
        addVariantToMap(variantsBySku, variant);
      }
    } catch (error) {
      console.error('quoteCart admin SKU lookup failed', error);
    }
  }

  if (variantsBySku.size < uniqueSkus.length) {
    try {
      const data = await storefront.query(STOREFRONT_PRODUCTS_QUERY, {
        variables: {
          query,
          country: storefront.i18n.country,
          language: storefront.i18n.language,
        },
        cache: storefront.CacheNone(),
      });

      for (const product of data?.products?.nodes || []) {
        for (const variant of product?.variants?.nodes || []) {
          addVariantToMap(variantsBySku, variant);
        }
      }
    } catch (error) {
      console.error('quoteCart storefront SKU lookup failed', error);
    }
  }

  return variantsBySku;
}

function buildNotFoundMessage(addedCount, notFound) {
  if (!notFound.length) {
    return `${addedCount} SKU${addedCount === 1 ? '' : 's'} added.`;
  }

  const missing = notFound.join(', ');
  const foundText = `${addedCount} SKU${addedCount === 1 ? '' : 's'} added`;
  const missingText =
    notFound.length === 1
      ? `This SKU was not found: ${missing}`
      : `These SKUs were not found: ${missing}`;

  return `${foundText}. ${missingText}`;
}

export async function createQuoteCart({
  storefront,
  env,
  items,
  quoteRef = null,
  email = null,
}) {
  const secret = getQuoteSecret(env);
  const variantsBySku = await findVariantsBySkus(
    env,
    storefront,
    items.map((item) => item.sku),
  );

  const added = [];
  const notFound = [];
  const invalid = [];
  const lines = [];

  for (const item of items) {
    if (!item.sku) {
      invalid.push({
        sku: item.sku,
        reason: 'SKU is required',
      });
      continue;
    }

    const variant = variantsBySku.get(item.sku.toLowerCase());
    if (!variant) {
      notFound.push(item.sku);
      continue;
    }

    const attributes = [
      {key: QUOTE_LINE_SKU_ATTRIBUTE, value: variant.sku},
    ];

    if (item.price) {
      attributes.push({
        key: QUOTE_LINE_PRICE_ATTRIBUTE,
        value: item.price,
      });
      attributes.push({
        key: QUOTE_LINE_KEY_ATTRIBUTE,
        value: encodeQuoteKey(`${variant.sku}|${item.price}`, secret),
      });
    }

    if (item.notes) {
      attributes.push({
        key: QUOTE_LINE_NOTES_ATTRIBUTE,
        value: item.notes,
      });
    }

    lines.push({
      merchandiseId: variant.id,
      quantity: item.qty,
      attributes,
    });

    added.push({
      sku: variant.sku,
      qty: item.qty,
      price: item.price,
      notes: item.notes,
      variantId: variant.id,
    });
  }

  if (!lines.length) {
    return {
      ok: false,
      cartUrl: null,
      cartId: null,
      quoteRef,
      email,
      added,
      notFound,
      invalid,
      message: buildNotFoundMessage(0, notFound.length ? notFound : items.map((item) => item.sku)),
    };
  }

  const cartAttributes = [
    {
      key: QUOTE_CART_ATTRIBUTE,
      value: encodeQuoteKey(QUOTE_CART_FLAG, secret),
    },
  ];

  if (quoteRef) {
    cartAttributes.push({
      key: QUOTE_REF_ATTRIBUTE,
      value: quoteRef,
    });
  }

  const cartInput = {
    attributes: cartAttributes,
    lines,
  };

  if (email) {
    cartInput.buyerIdentity = {
      email,
      countryCode: storefront.i18n.country,
    };
  }

  const result = await storefront.mutate(CART_CREATE_MUTATION, {
    variables: {
      input: cartInput,
    },
  });

  const payload = result?.cartCreate;
  const userErrors = payload?.userErrors || [];
  const cart = payload?.cart;

  if (userErrors.length || !cart?.checkoutUrl) {
    const errorMessage =
      userErrors.map((error) => error.message).join('; ') ||
      'Could not create quote cart';

    throw new Error(errorMessage);
  }

  return {
    ok: true,
    cartUrl: cart.checkoutUrl,
    cartId: cart.id,
    quoteRef,
    email: cart.buyerIdentity?.email || email,
    added,
    notFound,
    invalid,
    message: buildNotFoundMessage(added.length, notFound),
  };
}
