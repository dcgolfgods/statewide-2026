// Virtual entry point for the app
import * as remixBuild from '@remix-run/dev/server-build';
import {
  createRequestHandler,
  getStorefrontHeaders,
} from '@shopify/remix-oxygen';
import {
  cartGetIdDefault,
  cartSetIdDefault,
  createCartHandler,
  createStorefrontClient,
  storefrontRedirect,
  cartBuyerIdentityUpdateDefault
} from '@shopify/hydrogen';

import {HydrogenSession} from '~/lib/session.server';
import {getLocaleFromRequest} from '~/lib/utils';
import {isSearchEngineIndexable} from '~/lib/indexing.server';
import {getLowercasePathRedirect} from '~/lib/urlRedirects';

/**
 * Export a fetch handler in module format.
 */
export default {
  async fetch(request, env, executionContext) {
    try {
      const lowercaseRedirect = getLowercaseRedirect(request);
      if (lowercaseRedirect) {
        return lowercaseRedirect;
      }

      /**
       * Open a cache instance in the worker and a custom session instance.
       */
      if (!env?.SESSION_SECRET) {
        throw new Error('SESSION_SECRET environment variable is not set');
      }

      const waitUntil = (p) => executionContext.waitUntil(p);
      const [cache, session] = await Promise.all([
        caches.open('hydrogen'),
        HydrogenSession.init(request, [env.SESSION_SECRET]),
      ]);

      /**
       * Create Hydrogen's Storefront client.
       */
      console.log("getLocaleFromRequest",getLocaleFromRequest(request))
      const {storefront} = createStorefrontClient({
        cache,
        waitUntil,
        i18n: getLocaleFromRequest(request),
        publicStorefrontToken: env.PUBLIC_STOREFRONT_API_TOKEN,
        privateStorefrontToken: env.PRIVATE_STOREFRONT_API_TOKEN,
        storeDomain: env.PUBLIC_STORE_DOMAIN,
        storefrontId: env.PUBLIC_STOREFRONT_ID,
        storefrontHeaders: getStorefrontHeaders(request),
      });

      // const cart = createCartHandler({
      //   storefront,
      //   getCartId: cartGetIdDefault(request.headers),
      //   setCartId: cartSetIdDefault(),
      // });
      /**
       * Create a Remix request handler and pass
       * Hydrogen's Storefront client to the loader context.
       */
      const handleRequest = createRequestHandler({
        build: remixBuild,
        mode: process.env.NODE_ENV,
        getLoadContext: () => ({
          session,
          waitUntil,
          storefront,
          // cart,
          env,
        }),
      });

      const response = await handleRequest(request);

      if (response.status === 404) {
        /**
         * Check for redirects only when there's a 404 from the app.
         * If the redirect doesn't exist, then `storefrontRedirect`
         * will pass through the 404 response.
         */
        const redirectResponse = await storefrontRedirect({
          request,
          response,
          storefront,
        });
        return withNoIndexHeaders(request, redirectResponse);
      }

      return withNoIndexHeaders(request, response);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      return withNoIndexHeaders(
        request,
        new Response('An unexpected error occurred', {status: 500}),
      );
    }
  },
};

function getLowercaseRedirect(request) {
  const url = new URL(request.url);
  const redirectUrl = getLowercasePathRedirect(
    url.pathname,
    url.search,
    url.hash,
  );

  if (!redirectUrl) {
    return null;
  }

  return new Response(null, {
    status: 301,
    headers: {
      Location: new URL(redirectUrl, url.origin).toString(),
    },
  });
}

/**
 * Staging / non-production hosts must not be indexed.
 * X-Robots-Tag is stronger than meta robots alone.
 */
function withNoIndexHeaders(request, response) {
  if (isSearchEngineIndexable(request)) {
    return response;
  }

  const headers = new Headers(response.headers);
  headers.set('X-Robots-Tag', 'noindex, nofollow');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/queries/cart
const CART_QUERY_FRAGMENT = `#graphql
  fragment Money on MoneyV2 {
    currencyCode
    amount
  }
  fragment CartLine on CartLine {
    id
    quantity
    attributes {
      key
      value
    }
    cost {
      totalAmount {
        ...Money
      }
      amountPerQuantity {
        ...Money
      }
      compareAtAmountPerQuantity {
        ...Money
      }
    }
    merchandise {
      ... on ProductVariant {
        id
        availableForSale
        compareAtPrice {
          ...Money
        }
        preorder: metafield(namespace: "my_fields", key: "preorder") {
          value
        }
        preorderMsg: metafield(namespace: "my_fields", key: "preorder_date") {
          value
        }
        price {
          ...Money
        }
        requiresShipping
        title
        image {
          id
          url
          altText
          width
          height

        }
        product {
          handle
          title
          id
          tags
          rewards: metafield(namespace: "custom", key: "customer_reward") {
            value
          }
          upsells: metafield(namespace: "custom", key: "upsell") {
             references(first: 5) {
              nodes {
                ... on Product {
                  availableForSale
                  id
                  handle
                  title
                  featuredImage {
                    id
                    url
                    altText
                    width
                    height
                  }
                  options {
                    name
                    values
                  }
                  variants(first: 99) {
                    nodes {
                      price {
                        amount
                        currencyCode
                      }
                      availableForSale
                      id
                      title
                      selectedOptions {
                        name
                        value
                      }
                      compareAtPrice {
                        amount
                        currencyCode
                      }
                    }
                  }
                  
                }
              }
            }
          }
        }
        selectedOptions {
          name
          value
        }
      }
    }
  }
  fragment CartApiQuery on Cart {
    id
    checkoutUrl
    totalQuantity
    buyerIdentity {
      countryCode
      customer {
        id
        email
        firstName
        lastName
        displayName
      }
      email
      phone
    }
    lines(first: $numCartLines) {
      nodes {
        ...CartLine
      }
    }
    cost {
      subtotalAmount {
        ...Money
      }
      totalAmount {
        ...Money
      }
      totalDutyAmount {
        ...Money
      }
      totalTaxAmount {
        ...Money
      }
    }
    note
    attributes {
      key
      value
    }
    discountCodes {
      code
      applicable
    }
  }
`;