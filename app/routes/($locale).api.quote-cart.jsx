
import {
  createQuoteCart,
  getQuoteApiKey,
  getQuoteSecret,
  isAuthorizedQuoteRequest,
  normalizeQuoteItems,
  normalizeQuoteRef,
  normalizeQuoteEmail,
} from '~/lib/quoteCart.server';
import {assertValidLocaleParam} from '~/lib/locale';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers':
    'Content-Type, X-Quote-Api-Key, Authorization',
};

function apiJson(body, status = 200) {
  return Response.json(body, {
    status,
    headers: CORS_HEADERS,
  });
}

export async function loader({request, params}) {
  assertValidLocaleParam(params);
  if (request.method === 'OPTIONS') {
    return new Response(null, {status: 204, headers: CORS_HEADERS});
  }

  return apiJson({error: 'Method not allowed. Use POST.'}, 405);
}

export async function action({request, context, params}) {
  assertValidLocaleParam(params);
  if (request.method === 'OPTIONS') {
    return new Response(null, {status: 204, headers: CORS_HEADERS});
  }

  if (request.method !== 'POST') {
    return apiJson({error: 'Method not allowed. Use POST.'}, 405);
  }

  const {storefront, env} = context;

  if (!getQuoteApiKey(env) || !getQuoteSecret(env)) {
    return apiJson(
      {
        error:
          'Quote cart API is not configured. Set QUOTE_CART_API_KEY and QUOTE_CART_SECRET.',
      },
      503,
    );
  }

  if (!isAuthorizedQuoteRequest(request, env)) {
    return apiJson({error: 'Unauthorized'}, 401);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return apiJson({error: 'Invalid JSON body'}, 400);
  }

  const items = normalizeQuoteItems(body);
  if (!items.length) {
    return apiJson(
      {
        error: 'Send at least one item with sku and qty',
      },
      400,
    );
  }

  const {email, error: emailError} = normalizeQuoteEmail(body);
  if (emailError) {
    return apiJson({error: emailError}, 400);
  }

  try {
    const result = await createQuoteCart({
      storefront,
      env,
      items,
      quoteRef: normalizeQuoteRef(body),
      email,
    });

    if (!result.ok) {
      return apiJson(result, 422);
    }

    return apiJson(result);
  } catch (error) {
    console.error('quote-cart API failed', error);
    return apiJson(
      {
        error: error?.message || 'Could not create quote cart',
      },
      500,
    );
  }
}
