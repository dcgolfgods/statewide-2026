import { useLocation, useMatches } from '@remix-run/react';
import { parse as parseCookie, } from 'worktop/cookie'
import typographicBase from 'typographic-base';
import { countries } from '~/data/countries';
import { redirect } from '@shopify/remix-oxygen';
import { PRODUCT_CARD_FRAGMENT, MEDIA_FRAGMENT } from '~/data/fragments'
import invariant from 'tiny-invariant';


export const excludeBrands = ["Emilia","Ilve","La Germania","St George","Gerni","Lemair","AEG Powertools","Sabco","TGC"];
export const excludeAppliances = ["Kitchen Appliances","Washers & Dryers","Air Conditioning","Vacuum & Floor Care","TV, Audio & Video","Personal Care","Other Appliances"];



export function missingClass(string, prefix) {
  if (!string) {
    return true;
  }

  const regex = new RegExp(` ?${prefix}`, 'g');
  return string.match(regex) === null;
}
export function addObjectIfNotExist(array, target) {
  const exists = array.some(item => item.handle === target.handle && item.title === target.title);

  if (!exists) {
    array.unshift(target); // Add the new object at the beginning
  }

  // Ensure the array only contains the latest 5 objects
  if (array.length > 5) {
    array.splice(5);
  }

  return array;
}
export function formatText(input) {
  if (!input) {
    return;
  }

  if (typeof input !== 'string') {
    return input;
  }

  return typographicBase(input, { locale: 'en-us' }).replace(
    /\s([^\s<]+)\s*$/g,
    '\u00A0$1',
  );
}

export function getExcerpt(text) {
  const regex = /<p.*>(.*?)<\/p>/;
  const match = regex.exec(text);
  return match?.length ? match[0] : text;
}

export function isNewArrival(date, daysOld = 30) {
  return (
    new Date(date).valueOf() >
    new Date().setDate(new Date().getDate() - daysOld).valueOf()
  );
}

export function isDiscounted(price, compareAtPrice) {
  if (compareAtPrice?.amount > price?.amount) {
    return true;
  }
  return false;
}

function resolveToFromType(
  { customPrefixes, pathname, type } = {
    customPrefixes: {},
  },
) {
  if (!pathname || !type) return '';

  /*
        MenuItemType enum
        @see: https://shopify.dev/api/storefront/unstable/enums/MenuItemType
      */
  const defaultPrefixes = {
    BLOG: 'blogs',
    COLLECTION: 'collections',
    COLLECTIONS: 'collections',
    FRONTPAGE: 'frontpage',
    HTTP: '',
    PAGE: 'pages',
    CATALOG: 'collections/all',
    PRODUCT: 'products',
    SEARCH: 'search',
    SHOP_POLICY: 'policies',
  };

  const pathParts = pathname.split('/');
  const handle = pathParts.pop() || '';
  const routePrefix = {
    ...defaultPrefixes,
    ...customPrefixes,
  };

  switch (true) {
    // special cases
    case type === 'FRONTPAGE':
      return '/';

    case type === 'ARTICLE': {
      const blogHandle = pathParts.pop();
      return routePrefix.BLOG
        ? `/${routePrefix.BLOG}/${blogHandle}/${handle}/`
        : `/${blogHandle}/${handle}/`;
    }

    case type === 'COLLECTIONS':
      return `/${routePrefix.COLLECTIONS}`;

    case type === 'SEARCH':
      return `/${routePrefix.SEARCH}`;

    case type === 'CATALOG':
      return `/${routePrefix.CATALOG}`;

    // common cases: BLOG, PAGE, COLLECTION, PRODUCT, SHOP_POLICY, HTTP
    default:
      return routePrefix[type]
        ? `/${routePrefix[type]}/${handle}`
        : `/${handle}`;
  }
}

/*
  Parse each menu link and adding, isExternal, to and target
*/
function parseItem(primaryDomain, env, customPrefixes = {}) {
  return function (item) {
    if (!item?.url || !item?.type) {
      // eslint-disable-next-line no-console
      console.warn('Invalid menu item.  Must include a url and type.');
      return null;
    }

    // extract path from url because we don't need the origin on internal to attributes
    const { host, pathname } = new URL(item.url);

    const isInternalLink =
      host === new URL(primaryDomain).host || host === env.PUBLIC_STORE_DOMAIN;

    const parsedItem = isInternalLink
      ? // internal links
      {
        ...item,
        isExternal: false,
        target: '_self',
        to: resolveToFromType({ type: item.type, customPrefixes, pathname }),
      }
      : // external links
      {
        ...item,
        isExternal: true,
        target: '_blank',
        to: item.url,
      };

    if ('items' in item) {
      return {
        ...parsedItem,
        items: item.items
          .map(parseItem(primaryDomain, env, customPrefixes))
          .filter(Boolean),
      };
    } else {
      return parsedItem;
    }
  };
}

/*
  Recursively adds `to` and `target` attributes to links based on their url
  and resource type.
  It optionally overwrites url paths based on item.type
*/
export function parseMenu(menu, primaryDomain, env, customPrefixes = {}) {
  if (!menu?.items) {
    // eslint-disable-next-line no-console
    console.warn('Invalid menu passed to parseMenu');
    return null;
  }

  const parser = parseItem(primaryDomain, env, customPrefixes);

  const parsedMenu = {
    ...menu,
    items: menu.items.map(parser).filter(Boolean),
  };

  return parsedMenu;
}

export const INPUT_STYLE_CLASSES =
  'appearance-none rounded dark:bg-transparent border focus:ring-0 w-full py-2 px-3 placeholder:text-primary/50 leading-tight focus:shadow-outline';

export const getInputStyleClasses = (isError) => {
  return `${INPUT_STYLE_CLASSES} ${isError ? 'border-red-500' : 'border-[#ced4da]'
    }`;
};

export function statusMessage(status) {
  const translations = {
    ATTEMPTED_DELIVERY: 'Attempted delivery',
    CANCELED: 'Canceled',
    CONFIRMED: 'Confirmed',
    DELIVERED: 'Delivered',
    FAILURE: 'Failure',
    FULFILLED: 'Fulfilled',
    IN_PROGRESS: 'In Progress',
    IN_TRANSIT: 'In transit',
    LABEL_PRINTED: 'Label printed',
    LABEL_PURCHASED: 'Label purchased',
    LABEL_VOIDED: 'Label voided',
    MARKED_AS_FULFILLED: 'Marked as fulfilled',
    NOT_DELIVERED: 'Not delivered',
    ON_HOLD: 'On Hold',
    OPEN: 'Open',
    OUT_FOR_DELIVERY: 'Out for delivery',
    PARTIALLY_FULFILLED: 'Partially Fulfilled',
    PENDING_FULFILLMENT: 'Pending',
    PICKED_UP: 'Displayed as Picked up',
    READY_FOR_PICKUP: 'Ready for pickup',
    RESTOCKED: 'Restocked',
    SCHEDULED: 'Scheduled',
    SUBMITTED: 'Submitted',
    UNFULFILLED: 'Unfulfilled',
  };
  try {
    return translations?.[status];
  } catch (error) {
    return status;
  }
}

/**
 * Errors can exist in an errors object, or nested in a data field.
 */
export function assertApiErrors(data) {
  const errorMessage = data?.customerUserErrors?.[0]?.message;
  if (errorMessage) {
    throw new Error(errorMessage);
  }
}

export const DEFAULT_LOCALE = Object.freeze({
  ...countries.default,
  pathPrefix: '',
});

export function getLocaleFromRequest(request) {
  const url = new URL(request.url);
  const ShopCookies = parseCookie(request.headers.get('Cookie') || '');
  const userCountry = request.headers.get('oxygen-buyer-country') || 'AU';

  const cookieLocale = ShopCookies.locale;

  // ?currency param takes highest priority
  const currencyParam = url.searchParams.get('currency');
  if (currencyParam) {
    const currencyToCountryKey = { AUD: 'default', NZD: '/nz' };
    const countryKey = currencyToCountryKey[currencyParam.toUpperCase()];
    if (countryKey && countries[countryKey]) {
      return {
        ...countries[countryKey],
        pathPrefix: '',
      };
    }
  }

  // Cookie locale takes next priority
  if (cookieLocale && countries[`/${cookieLocale.toLocaleLowerCase()}`]) {
    return {
      ...countries[`/${cookieLocale.toLocaleLowerCase()}`],
      pathPrefix: '',
    };
  }

  if (!cookieLocale && userCountry == 'NZ') {
    return {
      ...countries['/nz'],
      pathPrefix: '',
    };
  }

  // If neither exists, return default
  return {
    ...countries['default'],
    pathPrefix: '',
  };
}

export function usePrefixPathWithLocale(path) {
  const [root] = useMatches();
  const selectedLocale = root.data?.selectedLocale ?? DEFAULT_LOCALE;

  return `${selectedLocale.pathPrefix}${path.startsWith('/') ? path : '/' + path
    }`;
}

export function useIsHomePath() {
  const { pathname } = useLocation();
  const [root] = useMatches();
  const selectedLocale = root.data?.selectedLocale ?? DEFAULT_LOCALE;
  const strippedPathname = pathname.replace(selectedLocale.pathPrefix, '');
  return strippedPathname === '/';
}

/**
 * Validates that a url is local
 * @param url
 * @returns `true` if local `false`if external domain
 */
export function isLocalPath(url) {
  try {
    // We don't want to redirect cross domain,
    // doing so could create fishing vulnerability
    // If `new URL()` succeeds, it's a fully qualified
    // url which is cross domain. If it fails, it's just
    // a path, which will be the current domain.
    new URL(url);
  } catch (e) {
    return true;
  }

  return false;
}

/**
 * Shopify's 'Online Store' stores cart IDs in a 'cart' cookie.
 * By doing the same, merchants can switch from the Online Store to Hydrogen
 * without customers losing carts.
 */
export function getCartId(request) {
  const cookies = parseCookie(request.headers.get('Cookie') || '');
  return cookies.cart ? `gid://shopify/Cart/${cookies.cart}` : undefined;
}
export function removeExtraSpaces(str) {
  return str.replace(/\s+/g, ' ').trim();
}
export const COLLECTION_QUERY = `#graphql
query CollectionDetails(
  $handle: String!
  $country: CountryCode
  $language: LanguageCode
  $first: Int
) @inContext(country: $country, language: $language) {
  collection(handle: $handle) {
    id
    handle
    title
    description
    descriptionHtml
    seo {
      description
      title
    }
    image {
      id
      url
      width
      height
      altText
    }
    top_description: metafield(namespace: "custom", key: "top_description") {
      value
    }
    below_description: metafield(namespace: "custom", key: "below") {
      value
    }
    type: metafield(namespace: "custom", key: "collection_type") {
     value
   }
     custom_images_for_mobile: metafield(namespace: "custom", key: "custom_images_for_mobile") {
      value
      references(first: 10) {
        nodes {
          ... on MediaImage {
            id
            mediaContentType
            image {
              url
            }
          }
        }
      }
    }
    custom_images: metafield(namespace: "custom", key: "custom_images") {
      value
      references(first: 10) {
        nodes {
          ... on MediaImage {
            id
            mediaContentType
            image {
              url
            }
          }
        }
      }
    }

    custom_images_for_mobile_nz: metafield(namespace: "custom", key: "custom_images_for_nz_mobile") {
      value
      references(first: 10) {
        nodes {
          ... on MediaImage {
            id
            mediaContentType
            image {
              url
            }
          }
        }
      }
    }
    custom_images_nz: metafield(namespace: "custom", key: "custom_images_for_nz") {
      value
      references(first: 10) {
        nodes {
          ... on MediaImage {
            id
            mediaContentType
            image {
              url
            }
          }
        }
      }
    }
    products(
      first: $first,
    ) {
      nodes {
        ...ProductCard
      }
    }
  }
}
${PRODUCT_CARD_FRAGMENT}
`;
export const CUSTOME_COLLECTION_QUERY = `#graphql
query CollectionDetails($handle1: String $handle2:String $handle3:String )  {
  vendor:  collection(handle: $handle1) {
    handle
    title
    image {
      id
      url
      width
      height
      altText
    }
    description
    descriptionHtml
    seo {
      description
      title
    }
    products( first: 20 ) {
      nodes {
        ...ProductCard
      }
    }
    type: metafield(namespace: "custom", key: "collection_type") {
     value
    }
    custom_images_for_mobile: metafield(namespace: "custom", key: "custom_images_for_mobile") {
      value
      references(first: 10) {
        nodes {
          ... on MediaImage {
            id
            mediaContentType
            image {
              url
            }
          }
        }
      }
    }
    custom_images: metafield(namespace: "custom", key: "custom_images") {
      value
      references(first: 10) {
        nodes {
          ... on MediaImage {
            id
            mediaContentType
            image {
              url
            }
          }
        }
      }
    }

    custom_images_for_mobile_nz: metafield(namespace: "custom", key: "custom_images_for_nz_mobile") {
      value
      references(first: 10) {
        nodes {
          ... on MediaImage {
            id
            mediaContentType
            image {
              url
            }
          }
        }
      }
    }
    custom_images_nz: metafield(namespace: "custom", key: "custom_images_for_nz") {
      value
      references(first: 10) {
        nodes {
          ... on MediaImage {
            id
            mediaContentType
            image {
              url
            }
          }
        }
      }
    }
    top_description: metafield(namespace: "custom", key: "top_description") {
      value
    }
    below_description: metafield(namespace: "custom", key: "below") {
      value
    }
    custom_logo: metafield(namespace: "custom", key: "custom_logo") {
      value
      reference {
        ... on MediaImage {
          id
          alt
          mediaContentType
          image {
            altText
            height
            id
            url
            width
          }
        }
      }
    }

  }
  appliance_type:  collection(handle: $handle2) {
    handle
    title
    description
    descriptionHtml
    seo {
      description
      title
    }
    image {
      id
      url
      width
      height
      altText
    }
    products( first: 20 ) {
      nodes {
        ...ProductCard
      }
    }
    custom_images_for_mobile: metafield(namespace: "custom", key: "custom_images_for_mobile") {
      value
      references(first: 10) {
        nodes {
          ... on MediaImage {
            id
            mediaContentType
            image {
              url
            }
          }
        }
      }
    }
    custom_images: metafield(namespace: "custom", key: "custom_images") {
      value
      references(first: 10) {
        nodes {
          ... on MediaImage {
            id
            mediaContentType
            image {
              url
            }
          }
        }
      }
    }

    custom_images_for_mobile_nz: metafield(namespace: "custom", key: "custom_images_for_nz_mobile") {
      value
      references(first: 10) {
        nodes {
          ... on MediaImage {
            id
            mediaContentType
            image {
              url
            }
          }
        }
      }
    }
    custom_images_nz: metafield(namespace: "custom", key: "custom_images_for_nz") {
      value
      references(first: 10) {
        nodes {
          ... on MediaImage {
            id
            mediaContentType
            image {
              url
            }
          }
        }
      }
    }
    top_description: metafield(namespace: "custom", key: "top_description") {
      value
    }
    below_description: metafield(namespace: "custom", key: "below") {
      value
    }
  }
  part_type:  collection(handle: $handle3) {
    handle
    title
    description
    descriptionHtml
    seo {
      description
      title
    }
    products( first: 20 ) {
      nodes {
        ...ProductCard
      }
    }
    image {
      id
      url
      width
      height
      altText
    }
      custom_images_for_mobile: metafield(namespace: "custom", key: "custom_images_for_mobile") {
      value
      references(first: 10) {
        nodes {
          ... on MediaImage {
            id
            mediaContentType
            image {
              url
            }
          }
        }
      }
    }
    custom_images: metafield(namespace: "custom", key: "custom_images") {
      value
      references(first: 10) {
        nodes {
          ... on MediaImage {
            id
            mediaContentType
            image {
              url
            }
          }
        }
      }
    }

    custom_images_for_mobile_nz: metafield(namespace: "custom", key: "custom_images_for_nz_mobile") {
      value
      references(first: 10) {
        nodes {
          ... on MediaImage {
            id
            mediaContentType
            image {
              url
            }
          }
        }
      }
    }
    custom_images_nz: metafield(namespace: "custom", key: "custom_images_for_nz") {
      value
      references(first: 10) {
        nodes {
          ... on MediaImage {
            id
            mediaContentType
            image {
              url
            }
          }
        }
      }
    }
    top_description: metafield(namespace: "custom", key: "top_description") {
      value
    }
    below_description: metafield(namespace: "custom", key: "below") {
      value
    }
  }
}
${PRODUCT_CARD_FRAGMENT}
`;

export function getSortValuesFromParam(sortParam) {
  switch (sortParam) {
    case 'price-high-low':
      return {
        sortKey: 'PRICE',
        reverse: true,
      };
    case 'price-low-high':
      return {
        sortKey: 'PRICE',
        reverse: false,
      };
    case 'best-selling':
      return {
        sortKey: 'BEST_SELLING',
        reverse: false,
      };
    case 'newest':
      return {
        sortKey: 'CREATED',
        reverse: true,
      };
    case 'featured':
      return {
        sortKey: 'MANUAL',
        reverse: false,
      };
    default:
      return {
        sortKey: 'RELEVANCE',
        reverse: false,
      };
  }
}

export function getFilterAndAppliedFilter(searchParams) {
  const knownFilters = ['productVendor', 'productType'];
  const available = 'available';
  const variantOption = 'variantOption';
  const filters = [];
  const appliedFilters = [];
  for (const [key, value] of searchParams.entries()) {
    if (available === key) {
      filters.push({ available: value === 'true' });
      appliedFilters.push({
        label: value === 'true' ? 'In stock' : 'Out of stock',
        urlParam: {
          key: available,
          value,
        },
      });
    } else if (knownFilters.includes(key)) {
      filters.push({ [key]: value });
      appliedFilters.push({ label: value, urlParam: { key, value } });
    } else if (key.includes(variantOption)) {
      const [name, val] = value.split(':');
      filters.push({ variantOption: { name, value: val } });
      appliedFilters.push({ label: val, urlParam: { key, value } });
    }
  }
  return { filters, appliedFilters }
}
export function convertToHandle(str) {
  // Remove special characters and convert spaces to dashes
  let handle = str.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');

  // Convert to lowercase
  handle = handle.toLowerCase();

  return handle;
}

export const getCollectionFilterTitle = (brand = null, appliance = null, partType = null) => {
  const data = {
    vendor: null,
    appliance_type: null,
    part_type: null
  }
  if (brand?.collection) {
    data[brand.collection.type?.value] = brand.collection.title.replace(/ spare parts/g, '');
  }
  if (appliance?.collection) {
    data[appliance.collection.type?.value] = appliance.collection.title.replace(/ spare parts/g, '');
  }
  if (partType?.collection) {
    data[partType.collection.type?.value] = partType.collection.title.replace(/ spare parts/g, '');
  }
  return data
}

export const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariantFragment on ProductVariant {
    id
    availableForSale
    selectedOptions {
      name
      value
    }
    image {
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    compareAtPrice {
      amount
      currencyCode
    }
    sku
    title

    unitPrice {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
  }
`;


export const VARIANTS_QUERY = `#graphql
  query variants(
    $country: CountryCode
    $language: LanguageCode
    $handle: String!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      variants(first: 250) {
        nodes {
          ...ProductVariantFragment
        }
      }
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
`;
export const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  query productRecommendations(
    $productId: ID!
    $count: Int
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    recommended: productRecommendations(productId: $productId) {
      ...ProductCard
    }
    additional: products(first: $count, sortKey: BEST_SELLING) {
      nodes {
        ...ProductCard
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;

/** Minimal product query by country — used to output both AUD and NZD offers in JSON-LD for GMC. */
export const PRODUCT_PRICES_BY_COUNTRY_QUERY = `#graphql
  query ProductPricesByCountry(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      id
      variants(first: 99) {
        nodes {
          price { amount currencyCode }
          availableForSale
          sku
          selectedOptions { name value }
        }
      }
    }
  }
`;

export async function getRecommendedProducts(storefront, productId) {
  const products = await storefront.query(RECOMMENDED_PRODUCTS_QUERY, {
    variables: { productId, count: 4, country: storefront.i18n.country },
  });
  invariant(products, 'No data returned from Shopify API');

  const mergedProducts = (products.recommended ?? [])
    .concat(products.additional.nodes)
    .filter(
      (value, index, array) =>
        array.findIndex((value2) => value2.id === value.id) === index,
    );

  const originalProduct = mergedProducts.findIndex(
    (item) => item.id === productId,
  );

  mergedProducts.splice(originalProduct, 1);

  return { nodes: mergedProducts };
}

export function redirectToFirstVariant({ product, request }) {
  const searchParams = new URLSearchParams(new URL(request.url).search);
  const firstVariant = product.variants.nodes[0];
  for (const option of firstVariant.selectedOptions) {
    searchParams.set(option.name, option.value);
  }

  throw redirect(`/${product.handle}?${searchParams.toString()}`, 200);
}

export function handleize(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

export const COLLECTION_AND_PRODUCT_QUERY = `#graphql
query CollectionDetails(
  $handle: String!
  $country: CountryCode
  $language: LanguageCode
  $first: Int
) @inContext(country: $country, language: $language) {
 shop {
   name
   primaryDomain {
     url
   }
   specialPrice: metafield(namespace: "app--55618142209--sybiz_info", key: "special_price") {
      value
   }
   shippingPolicy {
     body
     handle
   }
   refundPolicy {
     body
     handle
   }
 }
  product(handle: $handle) {
   id
   title
   vendor
   handle
   productType
   featuredImage {
      url
      src
      altText
      width
      height
  }
   qtyPrices: metafield(namespace: "product_extended_property", key: "quantity_based_price") {
    value
   }
  tags
  seo {
      description
      title
  }
  show_australia_only: metafield(namespace: "product_extended_property", key: "australia_only") {
    value
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
          sku
          quantityAvailable
          selectedOptions {
            name
            value
          }
          image {
            id
            url
            altText
            width
            height
          }
          compareAtPrice {
            amount
            currencyCode
          }
        }
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
                  bin_no: metafield(namespace: "product_extended_property", key: "bin_no") {
                    value
                  }
                  is_always_in_stock: metafield(namespace: "product_extended_property", key: "is_always_in_stock") {
                    value
                  }
                  is_active_value: metafield(namespace: "product_extended_property", key: "is_active_value") {
                    value
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
                      sku
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

   weight: metafield(namespace: "product_extended_property", key: "part_weight") {
    value
   }
   depth: metafield(namespace: "product_extended_property", key: "part_depth") {
    value
   }
   height: metafield(namespace: "product_extended_property", key: "part_height") {
    value
   }
   width: metafield(namespace: "product_extended_property", key: "part_width") {
    value
   }
   installation_guide_links: metafield(namespace: "custom", key: "installation_guide_link") {
    value
   }
   installation_guide: metafield(namespace: "custom", key: "installation_guide") {
    value
      references(first: 10) {
        nodes {
          ... on MediaImage {
            id
            mediaContentType
            image {
              url
            }
          }
        }
    }
   }
   descriptionHtml
   is_active_value: metafield(namespace: "product_extended_property", key: "is_active_value") {
    value
  }
  you_may_also_like: metafield(namespace: "custom", key: "you_may_also_like") {
      reference {
        ... on Metaobject {
          products: field(key: "products") {
            references(first: 4) {
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
                  bin_no: metafield(namespace: "product_extended_property", key: "bin_no") {
                    value
                  }
                  is_always_in_stock: metafield(namespace: "product_extended_property", key: "is_always_in_stock") {
                    value
                  }
                  is_active_value: metafield(namespace: "product_extended_property", key: "is_active_value") {
                    value
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
                      sku
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
          banners: field(key: "banners") {
            references(first: 1) {
              nodes {
                  ... on MediaImage {
                    image {
                      url
                      altText
                    }
                  }
              }
            }
          }

          bannersLinks: field(key: "banners_links") {
            value
          }

          entryName: field(key: "entry_name") {
            value
          }
        }
      }
   }
   description
  appliances: metafield(namespace: "product_extended_property", key: "appliance_types_filters") {
    value
  }
  parts: metafield(namespace: "product_extended_property", key: "part_type") {
    value
  }
  breadcrumb: metafield(namespace: "product_extended_property", key: "top_menu_category") {
    value
  }
  delivery: metafield(namespace: "product_extended_property", key: "days_to_deliver") {
    value
  }
  priceScale: metafield(namespace: "product_extended_property", key: "product_prices") {
    value
  }
  alternate_products: metafield(namespace: "product_extended_property", key: "alternate_products") {
    value
  }
  alternate_products_sku: metafield(namespace: "product_extended_property", key: "alternate_products_sku") {
    value
  }
     replace_products: metafield(namespace: "product_extended_property", key: "replacements_products") {
    value
  }
  replace_products_sku: metafield(namespace: "product_extended_property", key: "replacements_products_sku") {
    value
  }
   bin_no: metafield(namespace: "product_extended_property", key: "bin_no") {
    value
  }
   specification: metafield(namespace: "custom", key: "specification") {
     value
   }
   shortDescription: metafield(namespace: "custom", key: "short_description") {
     value
   }
   models: metafield(namespace: "product_extended_property", key: "model_numbers") {
     value
   }
   is_always_in_stock: metafield(namespace: "product_extended_property", key: "is_always_in_stock") {
     value
   }
   compatibility: metafield(namespace: "custom", key: "compatibility") {
     value
   }
   multi_buy_price: metafield(namespace: "sybiz_info", key: "special_price_details") {
      value
   }
   options {
     name
     values
   }
   media(first: 99) {
     nodes {
       ...Media
     }
   }
   seo {
     description
     title
   }
 }
collection(handle: $handle) {
    id
    handle
    title
    description
    descriptionHtml
    seo {
      description
      title
    }
    image {
      id
      url
      width
      height
      altText
    }
    top_description: metafield(namespace: "custom", key: "top_description") {
      value
    }
    below_description: metafield(namespace: "custom", key: "below") {
      value
    }
      custom_images_for_mobile: metafield(namespace: "custom", key: "custom_images_for_mobile") {
      value
      references(first: 10) {
        nodes {
          ... on MediaImage {
            id
            mediaContentType
            image {
              url
            }
          }
        }
      }
    }
    custom_images: metafield(namespace: "custom", key: "custom_images") {
      value
      references(first: 10) {
        nodes {
          ... on MediaImage {
            id
            mediaContentType
            image {
              url
            }
          }
        }
      }
    }

    custom_images_for_mobile_nz: metafield(namespace: "custom", key: "custom_images_for_nz_mobile") {
      value
      references(first: 10) {
        nodes {
          ... on MediaImage {
            id
            mediaContentType
            image {
              url
            }
          }
        }
      }
    }
    custom_images_nz: metafield(namespace: "custom", key: "custom_images_for_nz") {
      value
      references(first: 10) {
        nodes {
          ... on MediaImage {
            id
            mediaContentType
            image {
              url
            }
          }
        }
      }
    }
    type: metafield(namespace: "custom", key: "collection_type") {
     value
   }
    products(
      first: $first,
    ) {
      nodes {
        ...ProductCard
      }
    }
  }
}
${PRODUCT_CARD_FRAGMENT}
${MEDIA_FRAGMENT}
`;
export function capitalizeEachWord(str) {
  if (!str) {
    return ""
  }
  return str.replace(/\b\w/g, function (char) {
    return char.toLowerCase();
  });
}
export const convertTitleToHandle = (title) => {
  let collectionHandle = null
  const collections = [
    {
      "handle": "carpets-floors",
      "title": "Carpets & Floors"
    },
    {
      "handle": "new-commercial-equipment",
      "title": "New Commercial Equipment"
    },
    {
      "handle": "general-household",
      "title": "General Household"
    },
    {
      "handle": "frontpage",
      "title": "Home page"
    },
    {
      "handle": "washing-machine",
      "title": "Washing machines"
    },
    {
      "handle": "lg",
      "title": "LG"
    },
    {
      "handle": "asko",
      "title": "ASKO"
    },
    {
      "handle": "cover-facia-panel",
      "title": "Cover/Facia/Panel"
    },
    {
      "handle": "all",
      "title": "all"
    },
    {
      "handle": "hitachi",
      "title": "Hitachi"
    },
    {
      "handle": "volta",
      "title": "Volta"
    },
    {
      "handle": "panasonic",
      "title": "Panasonic"
    },
    {
      "handle": "vax",
      "title": "Vax"
    },
    {
      "handle": "tennant",
      "title": "Tennant"
    },
    {
      "handle": "samsung",
      "title": "Samsung"
    },
    {
      "handle": "hoover",
      "title": "Hoover"
    },
    {
      "handle": "steamvac",
      "title": "Steamvac"
    },
    {
      "handle": "nec",
      "title": "NEC"
    },
    {
      "handle": "electrolux",
      "title": "Electrolux"
    },
    {
      "handle": "sharp",
      "title": "Sharp"
    },
    {
      "handle": "miele",
      "title": "Miele"
    },
    {
      "handle": "nilfisk",
      "title": "Nilfisk"
    },
    {
      "handle": "maytag",
      "title": "Maytag"
    },
    {
      "handle": "mitsubishi-electric",
      "title": "Mitsubishi Electric"
    },
    {
      "handle": "g-e",
      "title": "G.E."
    },
    {
      "handle": "sanyo",
      "title": "Sanyo"
    },
    {
      "handle": "bosch",
      "title": "Bosch"
    },
    {
      "handle": "lux",
      "title": "Lux"
    },
    {
      "handle": "amway",
      "title": "Amway"
    },
    {
      "handle": "bamix",
      "title": "Bamix"
    },
    {
      "handle": "bissell",
      "title": "Bissell"
    },
    {
      "handle": "kitchenaid",
      "title": "Kitchenaid"
    },
    {
      "handle": "kitchenware",
      "title": "Kitchenware"
    },
    {
      "handle": "magimix",
      "title": "Magimix"
    },
    {
      "handle": "vitamix",
      "title": "Vitamix"
    },
    {
      "handle": "cleantech",
      "title": "Cleantech"
    },
    {
      "handle": "polivac",
      "title": "Polivac"
    },
    {
      "handle": "lindhaus",
      "title": "Lindhaus"
    },
    {
      "handle": "kerrick",
      "title": "Kerrick"
    },
    {
      "handle": "fujitsu",
      "title": "Fujitsu"
    },
    {
      "handle": "karcher",
      "title": "Karcher"
    },
    {
      "handle": "shopvac",
      "title": "Shopvac"
    },
    {
      "handle": "pacvac",
      "title": "Pacvac"
    },
    {
      "handle": "kleenmaid",
      "title": "Kleenmaid"
    },
    {
      "handle": "bonn",
      "title": "Bonn"
    },
    {
      "handle": "wertheim",
      "title": "Wertheim"
    },
    {
      "handle": "laurastar",
      "title": "Laurastar"
    },
    {
      "handle": "simpson",
      "title": "Simpson"
    },
    {
      "handle": "pullman",
      "title": "Pullman"
    },
    {
      "handle": "haier",
      "title": "Haier"
    },
    {
      "handle": "ariston",
      "title": "Ariston"
    },
    {
      "handle": "westinghouse",
      "title": "Westinghouse"
    },
    {
      "handle": "kelvinator",
      "title": "Kelvinator"
    },
    {
      "handle": "chef",
      "title": "Chef"
    },
    {
      "handle": "dishlex",
      "title": "Dishlex"
    },
    {
      "handle": "aeg",
      "title": "AEG"
    },
    {
      "handle": "malleys",
      "title": "Malleys"
    },
    {
      "handle": "frigidaire",
      "title": "Frigidaire"
    },
    {
      "handle": "ikea",
      "title": "Ikea"
    },
    {
      "handle": "emilia",
      "title": "Emilia"
    },
    {
      "handle": "whirlpool",
      "title": "Whirlpool"
    },
    {
      "handle": "smeg",
      "title": "Smeg"
    },
    {
      "handle": "daikin",
      "title": "Daikin"
    },
    {
      "handle": "omega",
      "title": "Omega"
    },
    {
      "handle": "blanco",
      "title": "Blanco"
    },
    {
      "handle": "vulcan",
      "title": "Vulcan"
    },
    {
      "handle": "ixl",
      "title": "IXL"
    },
    {
      "handle": "technika",
      "title": "Technika"
    },
    {
      "handle": "windsor",
      "title": "Windsor"
    },
    {
      "handle": "tefal",
      "title": "Tefal"
    },
    {
      "handle": "beefeater",
      "title": "Beefeater"
    },
    {
      "handle": "beko",
      "title": "Beko"
    },
    {
      "handle": "baumatic",
      "title": "Baumatic"
    },
    {
      "handle": "belling",
      "title": "Belling"
    },
    {
      "handle": "cleanstar",
      "title": "Cleanstar"
    },
    {
      "handle": "damani",
      "title": "Damani"
    },
    {
      "handle": "delonghi",
      "title": "Delonghi"
    },
    {
      "handle": "dirt-devil",
      "title": "Dirt Devil"
    },
    {
      "handle": "euro",
      "title": "Euro"
    },
    {
      "handle": "euromaid",
      "title": "Euromaid"
    },
    {
      "handle": "hisense",
      "title": "Hisense"
    },
    {
      "handle": "iag",
      "title": "IAG"
    },
    {
      "handle": "ilve",
      "title": "Ilve"
    },
    {
      "handle": "krups",
      "title": "Krups"
    },
    {
      "handle": "la-germania",
      "title": "La Germania"
    },
    {
      "handle": "linea",
      "title": "Linea"
    },
    {
      "handle": "lofra",
      "title": "Lofra"
    },
    {
      "handle": "moulinex",
      "title": "Moulinex"
    },
    {
      "handle": "neff",
      "title": "Neff"
    },
    {
      "handle": "palsonic",
      "title": "Palsonic"
    },
    {
      "handle": "philips",
      "title": "Philips"
    },
    {
      "handle": "rowenta",
      "title": "Rowenta"
    },
    {
      "handle": "sebo",
      "title": "Sebo"
    },
    {
      "handle": "taski",
      "title": "Taski"
    },
    {
      "handle": "vintec",
      "title": "Vintec"
    },
    {
      "handle": "avent",
      "title": "Avent"
    },
    {
      "handle": "bellini",
      "title": "Bellini"
    },
    {
      "handle": "birko",
      "title": "Birko"
    },
    {
      "handle": "ghibli",
      "title": "Ghibli"
    },
    {
      "handle": "hako",
      "title": "Hako"
    },
    {
      "handle": "other-brand",
      "title": "Other brand"
    },
    {
      "handle": "other-appliances",
      "title": "Other Appliances"
    },
    {
      "handle": "air-conditioning",
      "title": "Air conditioning"
    },
    {
      "handle": "air-treatment",
      "title": "Air Treatment"
    },
    {
      "handle": "ventilation",
      "title": "Ventilation"
    },
    {
      "handle": "heaters",
      "title": "Heaters"
    },
    {
      "handle": "air-conditioners",
      "title": "Air Conditioners"
    },
    {
      "handle": "fridges-and-freezers",
      "title": "Fridges & freezers"
    },
    {
      "handle": "other-electronic-appliances",
      "title": "Other electronic appliances"
    },
    {
      "handle": "retail-sundry-line",
      "title": "Retail sundry line"
    },
    {
      "handle": "test-demo",
      "title": "Test demo"
    },
    {
      "handle": "test-new",
      "title": "Test New"
    },
    {
      "handle": "hot-water-systems",
      "title": "Hot water systems"
    },
    {
      "handle": "cleaning-products",
      "title": "Cleaning products"
    },
    {
      "handle": "garment-care",
      "title": "Garment care"
    },
    {
      "handle": "mother-child-care",
      "title": "Mother & child care"
    },
    {
      "handle": "electronic-appliances",
      "title": "Electronic appliances"
    },
    {
      "handle": "mobile-phones",
      "title": "Mobile phones"
    },
    {
      "handle": "computers",
      "title": "Computers"
    },
    {
      "handle": "gps-systems",
      "title": "GPS systems"
    },
    {
      "handle": "personal-care",
      "title": "Personal care"
    },
    {
      "handle": "cameras",
      "title": "Cameras"
    },
    {
      "handle": "home-phones",
      "title": "Home phones"
    },
    {
      "handle": "shavers",
      "title": "Shavers"
    },
    {
      "handle": "shaver",
      "title": "Shavers"
    },
    {
      "handle": "monitors",
      "title": "Monitors"
    },
    {
      "handle": "kitchen-appliances",
      "title": "Kitchen appliances"
    },
    {
      "handle": "fridge-parts",
      "title": "Fridges & freezers"
    },
    {
      "handle": "microwaves",
      "title": "Microwaves"
    },
    {
      "handle": "dishwashers",
      "title": "Dishwashers"
    },
    {
      "handle": "rangehoods",
      "title": "Rangehoods"
    },
    {
      "handle": "ovens",
      "title": "Ovens"
    },
    {
      "handle": "cooktops",
      "title": "Cooktops"
    },
    {
      "handle": "toasters",
      "title": "Toasters"
    },
    {
      "handle": "mixers",
      "title": "Mixers"
    },
    {
      "handle": "breadmakers",
      "title": "Breadmakers"
    },
    {
      "handle": "rice-cookers",
      "title": "Rice cookers"
    },
    {
      "handle": "food-processors-blenders",
      "title": "Food processors / blenders"
    },
    {
      "handle": "kettles",
      "title": "Kettles"
    },
    {
      "handle": "coffee-machines",
      "title": "Coffee machines"
    },
    {
      "handle": "condenser-evaporator",
      "title": "Condenser/Evaporator"
    },
    {
      "handle": "water-filter",
      "title": "Water Filter"
    },
    {
      "handle": "washers-and-dryers",
      "title": "Washers & dryers"
    },
    {
      "handle": "hose-pipe-tubing",
      "title": "Hose/Pipe/Tubing"
    },
    {
      "handle": "hose",
      "title": "Hose"
    },
    {
      "handle": "motor-gearbox-shaft",
      "title": "Motor/Gearbox/Shaft"
    },
    {
      "handle": "other-equipment-cooking-accessories",
      "title": "Other Equipment / Cooking Accessories"
    },
    {
      "handle": "bbqs",
      "title": "BBQs"
    },
    {
      "handle": "juicers",
      "title": "Juicers"
    },
    {
      "handle": "tv-audio-video",
      "title": "TV, Audio & Video"
    },
    {
      "handle": "ovens-cooktops",
      "title": "Ovens & Cooktops"
    },
    {
      "handle": "actronair",
      "title": "ActronAir"
    },
    {
      "handle": "power-of-4",
      "title": "Power Of 4"
    },
    {
      "handle": "arda",
      "title": "Arda"
    },
    {
      "handle": "blu-ray-dvd",
      "title": "Blu Ray / DVD"
    },
    {
      "handle": "televisions",
      "title": "Televisions"
    },
    {
      "handle": "hi-fi-stereos",
      "title": "Hi Fi / Stereos"
    },
    {
      "handle": "home-theatres",
      "title": "Home theatres"
    },
    {
      "handle": "media-players",
      "title": "Media Players"
    },
    {
      "handle": "battery",
      "title": "Battery"
    },
    {
      "handle": "projectors",
      "title": "Projectors"
    },
    {
      "handle": "video-cameras",
      "title": "Video cameras"
    },
    {
      "handle": "other-audio-video",
      "title": "Other audio video"
    },
    {
      "handle": "dryers",
      "title": "Dryers"
    },
    {
      "handle": "washer-dryer-combo",
      "title": "Washer dryer combo"
    },
    {
      "handle": "comb",
      "title": "Comb"
    },
    {
      "handle": "other-floor-care",
      "title": "Other floor care"
    },
    {
      "handle": "pressure-cleaners",
      "title": "Pressure cleaners"
    },
    {
      "handle": "air-movers",
      "title": "Air movers"
    },
    {
      "handle": "vacuums-floor-care",
      "title": "Vacuum & floor care"
    },
    {
      "handle": "vacuums-and-floor-care",
      "title": "Vacuum & floor care"
    },
    {
      "handle": "vacuum-cleaners",
      "title": "Vacuum cleaners"
    },
    {
      "handle": "carpet-extractors",
      "title": "Carpet Extractors"
    },
    {
      "handle": "polishers",
      "title": "Polishers"
    },
    {
      "handle": "scrubbers",
      "title": "Scrubbers"
    },
    {
      "handle": "sanders",
      "title": "Sanders"
    },
    {
      "handle": "service-domestic",
      "title": "Service - Domestic"
    },
    {
      "handle": "service-commercial",
      "title": "Service - Commercial"
    },
    {
      "handle": "chemicals-all-brands",
      "title": "Chemicals All Brands"
    },
    {
      "handle": "fisher-paykel",
      "title": "Fisher & Paykel"
    },
    {
      "handle": "ge",
      "title": "GE"
    },
    {
      "handle": "glem",
      "title": "Glem"
    },
    {
      "handle": "lemair",
      "title": "Lemair"
    },
    {
      "handle": "other",
      "title": "Other"
    },
    {
      "handle": "other-commercial-unclassified-brands",
      "title": "Other Commercial Unclassified Brands"
    },
    {
      "handle": "other-domestic-euro-brands",
      "title": "Other Domestic Euro Brands"
    },
    {
      "handle": "other-domestic-unclassified-brands",
      "title": "Other Domestic Unclassified Brands"
    },
    {
      "handle": "please-select",
      "title": "Please Select"
    },
    {
      "handle": "speed-queen",
      "title": "Speed Queen"
    },
    {
      "handle": "st-george",
      "title": "St George"
    },
    {
      "handle": "unclassified",
      "title": "Unclassified"
    },
    {
      "handle": "deflecto",
      "title": "Deflecto"
    },
    {
      "handle": "speed",
      "title": "Speed"
    },
    {
      "handle": "hillmark",
      "title": "Hillmark"
    },
    {
      "handle": "aktivo",
      "title": "Aktivo"
    },
    {
      "handle": "arc",
      "title": "ARC"
    },
    {
      "handle": "elba",
      "title": "Elba"
    },
    {
      "handle": "elica",
      "title": "Elica"
    },
    {
      "handle": "everdure",
      "title": "Everdure"
    },
    {
      "handle": "ezidri",
      "title": "Ezidri"
    },
    {
      "handle": "gaggenau",
      "title": "Gaggenau"
    },
    {
      "handle": "new-world",
      "title": "New World"
    },
    {
      "handle": "numatic",
      "title": "Numatic"
    },
    {
      "handle": "pacini",
      "title": "Pacini"
    },
    {
      "handle": "siemens",
      "title": "Siemens"
    },
    {
      "handle": "sv-equipment",
      "title": "SV Equipment"
    },
    {
      "handle": "tisira",
      "title": "Tisira"
    },
    {
      "handle": "transtherm",
      "title": "Transtherm"
    },
    {
      "handle": "venini",
      "title": "Venini"
    },
    {
      "handle": "glem-gas",
      "title": "Glem Gas"
    },
    {
      "handle": "robot-coupe",
      "title": "Robot Coupe"
    },
    {
      "handle": "airconditioners",
      "title": "Airconditioners"
    },
    {
      "handle": "gerni",
      "title": "Gerni"
    },
    {
      "handle": "indesit",
      "title": "Indesit"
    },
    {
      "handle": "enzyme-wizard",
      "title": "Enzyme Wizard"
    },
    {
      "handle": "rubbermaid",
      "title": "Rubbermaid"
    },
    {
      "handle": "jasol",
      "title": "Jasol"
    },
    {
      "handle": "oates",
      "title": "Oates"
    },
    {
      "handle": "tasman-chemicals",
      "title": "Tasman Chemicals"
    },
    {
      "handle": "sweeper",
      "title": "Sweeper"
    },
    {
      "handle": "selleys",
      "title": "Selleys"
    },
    {
      "handle": "pickup",
      "title": "Pickup"
    },
    {
      "handle": "steamer",
      "title": "Steamer"
    },
    {
      "handle": "carpet-cleaners",
      "title": "Carpet Cleaners"
    },
    {
      "handle": "power-tools",
      "title": "Power Tools"
    },
    {
      "handle": "steam-mops",
      "title": "Steam Mops"
    },
    {
      "handle": "milwaukee",
      "title": "Milwaukee"
    },
    {
      "handle": "ryobi",
      "title": "Ryobi"
    },
    {
      "handle": "homelite",
      "title": "Homelite"
    },
    {
      "handle": "Wand/Rod",
      "title": "wand-rod"
    },
    ,
    {
      "handle": "Wand/Rod/Tube",
      "title": "wand-rod-tube"
    },
    {
      "handle": "avent-mother-child-care",
      "title": "AVENT Mother & Child Care"
    },
    {
      "handle": "shavers-trimmers",
      "title": "Shavers / Trimmers"
    },
    {
      "handle": "electric-toothbrushes",
      "title": "Electric Toothbrushes"
    },
    {
      "handle": "pressure-cookers",
      "title": "Pressure Cookers"
    },
    {
      "handle": "irons-steamers",
      "title": "Irons / Steamers"
    },
    {
      "handle": "airfryers",
      "title": "Airfryers"
    },
    {
      "handle": "oral-healthcare",
      "title": "Oral Healthcare"
    },
    {
      "handle": "hair-removal",
      "title": "Hair Removal"
    },
    {
      "handle": "irons-garment-care",
      "title": "Irons & Garment Care"
    },
    {
      "handle": "/split-system",
      "title": "Split system"
    },
    {
      "handle": "multicookers",
      "title": "Multicookers"
    },
    {
      "handle": "skin-care",
      "title": "Skin Care"
    },
    {
      "handle": "aeg-power-tools",
      "title": "AEG Powertools"
    },
    {
      "handle": "dyson",
      "title": "Dyson"
    },
    {
      "handle": "home-cookers",
      "title": "Home Cookers"
    },
    {
      "handle": "philips-avent",
      "title": "Philips Avent"
    },
    {
      "handle": "cordzero-vacuum-cleaners",
      "title": "CordZero Vacuum Cleaners"
    },
    {
      "handle": "fryers",
      "title": "Fryers"
    },
    {
      "handle": "imop",
      "title": "Imop"
    },
    {
      "handle": "ridgid-tools",
      "title": "Ridgid Tools"
    },
    {
      "handle": "door-lid-latch",
      "title": "Door/Lid/Latch"
    },
    {
      "handle": "brush-roller",
      "title": "Brush/Roller"
    },
    {
      "handle": "truvox",
      "title": "Truvox"
    },
    {
      "handle": "bearing",
      "title": "Bearing"
    },
    {
      "handle": "belt",
      "title": "Belt"
    },
    {
      "handle": "bag-holder",
      "title": "Bag Holder"
    },
    {
      "handle": "baby-food-maker-parts",
      "title": "Baby Food Maker Parts"
    },
    {
      "handle": "baby-bottle-parts",
      "title": "Baby Bottle Parts"
    },
    {
      "handle": "blade-disc-head",
      "title": "Blade/Disc/Head"
    },
    {
      "handle": "bowl-container-jug",
      "title": "Bowl/Container/Jug"
    },
    {
      "handle": "belt-chain",
      "title": "Belt/Chain"
    },
    {
      "handle": "agitator",
      "title": "Agitator"
    },
    {
      "handle": "basket-rack",
      "title": "Basket/Rack"
    },
    {
      "handle": "accessories",
      "title": "Accessories"
    },
    {
      "handle": "capacitor-fuse",
      "title": "Capacitor/Fuse"
    },
    {
      "handle": "clamp",
      "title": "Clamp"
    },
    {
      "handle": "button-knob-lever",
      "title": "Button/Knob/Lever"
    },
    {
      "handle": "knob-lever",
      "title": "Knob/Lever"
    },
    {
      "handle": "cable-cord",
      "title": "Cable/Cord"
    },
    {
      "handle": "cable",
      "title": "Cable"
    },
    {
      "handle": "breast-pump-parts",
      "title": "Breast Pump Parts"
    },
    {
      "handle": "bag",
      "title": "Bag"
    },
    {
      "handle": "bracket-guiderail-wallmount",
      "title": "Bracket/Guiderail/Wallmount"
    },
    {
      "handle": "aerial-tuner",
      "title": "Aerial/Tuner"
    },
    {
      "handle": "ac-adapter-charger",
      "title": "AC Adapter/Charger"
    },

    {
      "handle": "crisper-bin-drawer",
      "title": "Crisper Bin/Drawer"
    },
    {
      "handle": "controller-simmerstat",
      "title": "Controller/Simmerstat"
    },
    {
      "handle": "coupling",
      "title": "Coupling"
    },
    {
      "handle": "door-lid-latch",
      "title": "Door/Lid/Latch"
    },
    {
      "handle": "compressor",
      "title": "Compressor"
    },
    {
      "handle": "cutlery-baskets",
      "title": "Cutlery Basket"
    },
    {
      "handle": "ducting",
      "title": "Ducting"
    },
    {
      "handle": "fan-blower",
      "title": "Fan/Blower"
    },
    {
      "handle": "dispenser",
      "title": "Dispenser"
    },
    {
      "handle": "drum",
      "title": "Drum"
    },
    {
      "handle": "dust-bin",
      "title": "Dust Bin"
    },
    {
      "handle": "dock-cradle",
      "title": "Dock/Cradle"
    },
    {
      "handle": "filters",
      "title": "Filter"
    },
    {
      "handle": "freight-item",
      "title": "Freight Item"
    },
    {
      "handle": "element-heater",
      "title": "Element/Heater"
    },
    {
      "handle": "finished-goods",
      "title": "Finished Goods"
    },
    {
      "handle": "floor-tool-nozzle",
      "title": "Floor Tool/Nozzle"
    },
    {
      "handle": "foil",
      "title": "Foil"
    },
    {
      "handle": "seal",
      "title": "Gasket/Seal"
    },
    {
      "handle": "gasket-seal",
      "title": "Gasket/Seal"
    },
    {
      "handle": "foot-leg",
      "title": "Foot/Leg"
    },
    {
      "handle": "mounting-brackets-tv",
      "title": "TV mounting brackets"
    },
    {
      "handle": "grill-plate",
      "title": "Grill/Plate"
    },
    {
      "handle": "glass-hob",
      "title": "Glass/Hob"
    },
    {
      "handle": "hinge",
      "title": "Hinge"
    },
    {
      "handle": "ignitor-gas",
      "title": "Ignitor (Gas)"
    },
    {
      "handle": "ignitor-gas-",
      "title": "Ignitor (Gas)"
    },
    {
      "handle": "hdd-odd",
      "title": "HDD/ODD"
    },
    {
      "handle": "hoses-pipes-tubing",
      "title": "Hose/Pipe/Tubing"
    },
    {
      "handle": "roller-wheel",
      "title": "Roller/Wheel"
    },
    {
      "handle": "air-filter",
      "title": "Air Filter"
    },
    {
      "handle": "grille-louvre-vane",
      "title": "Grille/Louvre/Vane"
    },
    {
      "handle": "keypad",
      "title": "Keypad"
    },
    {
      "handle": "lcd",
      "title": "LCD"
    },
    {
      "handle": "lint-filter",
      "title": "Lint Filter"
    },
    {
      "handle": "ice-water-dispenser-spares",
      "title": "Ice/Water"
    },
    {
      "handle": "ignitor",
      "title": "Ignitor"
    },
    {
      "handle": "other-items",
      "title": "Other Items"
    },
    {
      "handle": "lens",
      "title": "Lens"
    },
    {
      "handle": "motors",
      "title": "Motor/Gearbox/Shaft"
    },
    {
      "handle": "plate-tray",
      "title": "Plate/Tray"
    },
    {
      "handle": "pan-pot",
      "title": "Pan/Pot"
    },
    {
      "handle": "pads",
      "title": "Pads"
    },
    {
      "handle": "magnetron",
      "title": "Magnetron"
    },
    {
      "handle": "pulley",
      "title": "Pulley"
    },
    {
      "handle": "pump",
      "title": "Pump"
    },
    {
      "handle": "pcb",
      "title": "PCB"
    },
    {
      "handle": "regulator",
      "title": "Regulator"
    },
    {
      "handle": "brush-nozzle-floor-tool",
      "title": "Brush/Nozzle/Floor Tool"
    },
    {
      "handle": "sensor-thermistor-thermostat",
      "title": "Sensor/Thermistor/Thermostat"
    },
    {
      "handle": "remote-control",
      "title": "Remote Control"
    },
    {
      "handle": "roller-ring",
      "title": "Roller Ring"
    },
    {
      "handle": "remote-wall-control",
      "title": "Remote Wall Control"
    },
    {
      "handle": "solenoid-coil-valve",
      "title": "Solenoid Coil/Valve"
    },
    {
      "handle": "shelf-rack",
      "title": "Shelf/Rack"
    },
    {
      "handle": "speaker-microphone",
      "title": "Speaker/Microphone"
    },
    {
      "handle": "spray-arm-nozzle",
      "title": "Spray Arm/Nozzle"
    },
    {
      "handle": "spray-arm",
      "title": "Spray Arm/Nozzle"
    },
    {
      "handle": "steam-steriliser-parts",
      "title": "Steam Steriliser Parts"
    },
    {
      "handle": "squeegee",
      "title": "Squeegee"
    },
    {
      "handle": "stand",
      "title": "Stand"
    },
    {
      "handle": "suspension",
      "title": "Suspension"
    },
    {
      "handle": "switch-relay",
      "title": "Switch/Relay"
    },
    {
      "handle": "switch",
      "title": "Switch"
    },
    {
      "handle": "throttle-parts",
      "title": "Throttle Parts"
    },
    {
      "handle": "globe-lamp",
      "title": "Globe/Lamp"
    },
    {
      "handle": "wall-mount-bracket",
      "title": "Wall Mount Bracket"
    },
    {
      "handle": "tank",
      "title": "Tank"
    },
    {
      "handle": "timer",
      "title": "Timer"
    },
    {
      "handle": "artusi",
      "title": "Artusi"
    },
    {
      "handle": "toothbrush-head",
      "title": "Toothbrush Head"
    },
    {
      "handle": "transformer-inverter",
      "title": "Transformer/Inverter"
    },
    {
      "handle": "water",
      "title": "Water"
    },
    {
      "handle": "travel-case",
      "title": "Travel Case"
    },
    {
      "handle": "trivet",
      "title": "Trivet"
    },
    {
      "handle": "water-tank",
      "title": "Water Tank"
    },
    {
      "handle": "wheel",
      "title": "Wheel"
    },
    {
      "handle": "fridges-freezers",
      "title": "Fridges & freezers"
    },
    {
      "handle": "fisher-paykel-water-filters",
      "title": "Fisher & Paykel refrigerator filter"
    },
    {
      "handle": "ovens-and-cooktops",
      "title": "Ovens & Cooktops"
    },
    {
      "handle": "shelf-rack-tray",
      "title": "Shelf/Rack/Tray"
    },
    {
      "handle": "floor-tool-brush-nozzle",
      "title": "Floor Tool/Brush/Nozzle"
    },
    {
      "handle": "dishwashers",
      "title": "Dishwashers"
    },
    {
      "handle": "handle",
      "title": "Handle"
    },
    {
      "handle": "filter",
      "title": "Filter"
    },
    {
      "handle": "burner-gas",
      "title": "Burner (Gas)"
    }

  ]
  const collection = collections.find((cv) => {
    return cv?.title.toLocaleLowerCase() == title?.toLocaleLowerCase()
  })
  if (collection) {
    collectionHandle = collection.handle
  }
  return collectionHandle
}

export const productAvaibilityLabel = (data) => {
  const { binNo, qauntity, active, is_always_in_stock } = data;
  let label = "No Longer Available";
  // console.log("active",data);
  if (active == true) {
    if (binNo && binNo != "null") {
      if (qauntity > 0 || is_always_in_stock ) {
        label = "In Stock"
      } else {
        label = "Special Order"
      }
    } else {
      label = "Special Order"
    }
  }
  return label
}

export const elementInViewport = (el) => {
  let top = el.offsetTop;
  let left = el.offsetLeft;
  let width = el.offsetWidth;
  let height = el.offsetHeight;

  while (el.offsetParent) {
    el = el.offsetParent;
    top += el.offsetTop;
    left += el.offsetLeft;
  }

  return (
    top >= window.pageYOffset &&
    left >= window.pageXOffset &&
    (top + height) <= (window.pageYOffset + window.innerHeight) &&
    (left + width) <= (window.pageXOffset + window.innerWidth)
  );
}

export const getPricesData = async (allSku, customer) => {
  const myHeaders = new Headers();
  myHeaders.append("X-Shopify-Shop-Domain", "statewide-appliances.myshopify.com");
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    "customerEmail": customer?.email ? customer?.email : '',
    "sku": allSku
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
  };
  try {
    const data = await fetch("https://statewide.digitalconverters.com.au/storefront/products/multi-level-discounts", requestOptions);
    const result = await data.json();
    // const result = null;
    return result?.data || [];

  } catch (e) {
    console.log(e);
  }
}

export const PAGE_QUERY = `#graphql
  query PageDetails($language: LanguageCode, $handle: String!)
  @inContext(language: $language) {
    page(handle: $handle) {
      id
      title
      handle
      body
      seo {
        description
        title
      }
    }
  }
`;
//ssssssss
export const SEARCH_ARTICLE = `#graphql
query Blog(
  $language: LanguageCode,
  $blogQuery:String!
) @inContext(language: $language) {
  articles:search(query: $blogQuery, first: 250, types: ARTICLE, reverse: true,sortKey: RELEVANCE) {
    nodes {
      ...Article
    }
  }
  blogs(first: 250) {
    nodes{
      title
      handle
      articles(first: 250) {
        edges {
          node {
            ...Article
          }
        }
      }
    }
  }
}
fragment Article on Article {
  author: authorV2 {
    name
  }
  handle
  id
  content
  excerpt
  image {
    id
    altText
    url
    width
    height
  }
  desktop_image: metafield(namespace: "custom", key: "desktop_banner") {
    value
    reference {
      ... on MediaImage {
        id
        alt
        mediaContentType
        image {
          altText
          height
          id
          url
          width
        }
      }
    }
  }
  mobile_image: metafield(namespace: "custom", key: "mobile_banner") {
    value
    reference {
      ... on MediaImage {
        id
        alt
        mediaContentType
        image {
          altText
          height
          id
          url
          width
        }
      }
    }
  }
  blog {
    seo {
      description
      title
    }
    id
    title
    handle
  }
  publishedAt
  title
}
`
export const BLOGS_QUERY = `#graphql
query Blog(
  $language: LanguageCode
) @inContext(language: $language) {
  articles(first: 250, sortKey:PUBLISHED_AT, reverse: true) {
    nodes{
      ...Article
    }
  }
  blogs(first: 250) {
    nodes{
      title
      handle
      articles(first: 250, sortKey:PUBLISHED_AT, reverse: true) {
        edges {
          node {
            ...Article
          }
        }
      }
    }
  }
}

fragment Article on Article {
  author: authorV2 {
    name
  }
  handle
  id
  image {
    id
    altText
    url
    width
    height
  }
  content
  seo {
      description
      title
  }
  excerpt
  desktop_image: metafield(namespace: "custom", key: "desktop_banner") {
    value
    reference {
      ... on MediaImage {
        id
        alt
        mediaContentType
        image {
          altText
          height
          id
          url
          width
        }
      }
    }
  }
  mobile_image: metafield(namespace: "custom", key: "mobile_banner") {
    value
    reference {
      ... on MediaImage {
        id
        alt
        mediaContentType
        image {
          altText
          height
          id
          url
          width
        }
      }
    }
  }
  blog {
    seo {
      description
      title
    }
    id
    title
    handle
  }
  publishedAt
  title
}
`;
export const ARTICLE_QUERY = `#graphql
  query ArticleDetails(
    $language: LanguageCode
    $articleHandle: String!
  ) @inContext(language: $language) {
      blogs(first: 250) {
        nodes{
          title
          handle
        }
      }
      articles(first: 250, sortKey:CREATED_AT, reverse: true) {
        nodes{
          ...Article
        }
      }
      articleByHandle(handle: $articleHandle) {
        title
        contentHtml
        publishedAt
        author: authorV2 {
          name
        }
        image {
          id
          altText
          url
          width
          height
        }
        seo {
          description
          title
        }
    }
    fragment Article on Article {
      author: authorV2 {
        name
      }
      handle
      id
      content
      excerpt
      image {
        id
        altText
        url
        width
        height
      }
      blog {
        seo {
          description
          title
        }
        id
        title
        handle
      }
      publishedAt
      title
    }
  }
`;

export const getCookie = (e) => {
  for (
    var t = e + "=", n = document.cookie.split(";"), i = 0;
    i < n.length;
    i++
  ) {
    for (var o = n[i]; " " === o.charAt(0);) o = o.substring(1);
    if (0 === o.indexOf(t)) return o.substring(t.length, o.length);
  }
  return "";
};

export const freeCall = (selectedLocale, phone) => {
  let num = "1800005220";
  let num1 = '1800 005 220';
  let tel = '+611800005220';
  let country = "Australia Free"
  if (phone) {
    country = "AU Free"
  }
  if (selectedLocale.country == 'NZ') {
    num = "099655155";
    num1 = '09 965 5155';
    tel = '+6499655155';
    country = "NZ Local"
  }
  return { num, num1, tel, country }
}

export const makeLastWordSingular = (title) => {
  if(!title){
    return ''
  }
  
  // Helper function to convert a word from plural to singular
  const convertToSingular = (word) => {
    if (word.endsWith("ies")) {
      return word.slice(0, -3) + "y"; // e.g., "parties" -> "party"
    } else if (word.endsWith("s") && !word.endsWith("ss")) {
      return word.slice(0, -1); // e.g., "sandwiches" -> "sandwich"
    } else {
      return word;
    }
  };

  // Define separators with spaces around them
  const separators = [' & ', ' / ', ' and '];

  const formatTitle = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  // Check for each separator in the title
  for (let separator of separators) {
    if (title?.includes(separator)) {
      title = title?.replace(/ \/ | and | & /g, ' & ');
      const parts = title.split(separator).map(part => part.trim());
      let singularParts = parts.map(convertToSingular);
      return formatTitle(singularParts.join(separator));
    }
  }
  title = title.replace(/ \/ | and | & /g, ' & ');
  title = formatTitle(title);
  // If no separator is found, convert the whole title
  return convertToSingular(title);
}

export function calculatePriceIncludingTax(basePrice, currency) {
  // Define tax rates for each currency
  const taxRates = {
    AUD: 0.10, // 10% GST for Australian Dollar
    NZD: 0.15  // 15% GST for New Zealand Dollar
  };

  // Check if the currency is supported
  if (!taxRates[currency]) {
    throw new Error('Unsupported currency. Please use "AUD" or "NZD".');
  }

  // Get the tax rate for the given currency
  const taxRate = taxRates["AUD"];

  // Calculate total price including tax
  let totalPrice =  parseFloat(basePrice);
  if(currency == "NZD"){
    // totalPrice = totalPrice  * 1.09;
    totalPrice = totalPrice  * 1.18;
    totalPrice = Math.ceil(totalPrice)
  }else{

    const tenPercent = parseFloat(basePrice) * taxRate;
    const truncated = Math.floor(tenPercent * 100) / 100;
    const finalPrice = parseFloat(basePrice) + truncated;
    totalPrice = finalPrice
  }
  
  // console.log("AUD",basePrice, totalPrice)
  // if(currency == "NZD"){
  //   const exchangeRate = 0.9524; // Example exchange rate from AUD to NZD
  //   const nzdAmount = totalPrice * exchangeRate;
  //   totalPrice =  nzdAmount // Return the amount formatted to 2 decimal places
  //   console.log("NZD",basePrice, totalPrice)
  // }
  // Return the total price rounded to 2 decimal places
  return parseFloat( totalPrice.toFixed(2));
}


export const businessDays = (data) =>{
    const { binNo, qauntity, active, delivery, is_always_in_stock } = data;
    let text = `Usually despatched within ${delivery} business days`;
    let value = parseInt(delivery);
    if (active == true) {
      if (binNo && binNo != "null") {
        if (qauntity > 0 || is_always_in_stock) {
          value = 2;
          text = `Usually despatched within ${value || 2} business days`;
        } else {
          if(delivery < 10){
            value = `4 - 10`
          }else{
            value = `${value - 3} - ${value + 3}`
          }
          // special order
          text = `Ordered from our supplier. Usually despatched within ${value} business days`
        }
      } else {
        // special order
        if(delivery < 10){
          value = `4 - 10 `
        }else{
          value = `${value - 3} - ${value + 3}`
        }
        text = `Ordered from our supplier. Usually despatched within ${value} business days`
      }
    }
    let deliveryValue = value;
    return {text, deliveryValue};
}


export const viewAllMenus = {
  "Other Kitchen Appliances":"kitchen appliance",
  "Blu Ray / DVDs":"Blu Ray & DVD",
  "Hi Fi / Stereos":"Hi Fi & Stereo",
  "Other TV, Audio and Video":"other TV, Audio & Video",
  "Shavers / Trimmers":"Shaver & trimmer",
  "BBQs":"BBQ",
  // Mobile
  "TV, Audio & Video":"other TV, Audio & Video",
}


export const multiBuyCalc = (multiBuyPrice, shopMultiBuy) =>{
  // console.log("multiBuyPrice",multiBuyPrice)
  // console.log("shopMultiBuy",shopMultiBuy)
  const today = new Date().toISOString().split('T')[0]; // Get YYYY-MM-DD format
  const shopDict = Object.fromEntries(shopMultiBuy.map(item => [item.specialPriceId, item]));
  const qtyPrices = multiBuyPrice.map(item => {
      const shopInfo = shopDict[item.specialPriceId];
      if (!shopInfo) return null;

      // Convert startDate and endDate to Date objects
      const startDate = new Date(shopInfo.startDate.split(" ")[0]);
      const endDate = new Date(shopInfo.endDate.split(" ")[0]);

      // Apply filtering criteria
      if (shopInfo.isActive && startDate <= new Date(today) && new Date(today) <= endDate) {
          return {
              ...item,
              isActive: shopInfo.isActive,
              startDate: shopInfo.startDate,
              endDate: shopInfo.endDate
          };
      }
      return null;
  })
  .filter(item => item !== null);
  return qtyPrices;
}
