import {metaDescription} from '../lib/meta-description.server';
import {headerMenu, siteNav} from '../components/static-menu';

import {isSearchEngineIndexable} from './indexing.server';
import {getProductJsonLdImages, getProductSeoImage} from './productMedia';
import {
  getImportantModelNumbers,
  getProductImageAlt,
  getProductSeoDescription,
  getProductSeoName,
  getProductSku,
} from './productSeo';

const BRAND_NAME = 'Statewide Appliance Spares';
const BRAND_LOGO_URL =
  'https://cdn.shopify.com/s/files/1/0799/5929/4245/files/Statewide_appliance_spares_logo_mob.svg?v=1744808441';

/** Normalize URL for canonical: no trailing slash on pathname (except root "/"). */
function canonicalUrl(url) {
  const u = new URL(url);
  u.search = '';
  u.hash = '';
  if (u.pathname !== '/' && u.pathname.endsWith('/')) {
    u.pathname = u.pathname.slice(0, -1);
  }
  return u.toString();
}

function canonicalOrigin(url) {
  return new URL(url).origin;
}

function absoluteUrl(origin, path = '/') {
  if (!path || path === '/') return `${origin}/`;
  if (/^https?:\/\//i.test(path)) return canonicalUrl(path);
  return canonicalUrl(`${origin}${path.startsWith('/') ? path : `/${path}`}`);
}

function handleize(str = '') {
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function cleanCollectionName(name = '') {
  return String(name)
    .replace(/ spare parts/gi, '')
    .replace(/\s*##\s*/g, ' ')
    .replace(/\//g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanMenuTitle(title = '') {
  const value = String(title);
  return cleanCollectionName(
    value.includes('##') ? value.split('##').pop() : value,
  );
}

function pathnameFromUrl(url) {
  try {
    return new URL(url).pathname.replace(/\/$/, '') || '/';
  } catch {
    return String(url || '').replace(/\/$/, '') || '/';
  }
}

function titleFromPathSegment(path) {
  const segment = pathnameFromUrl(path).split('/').filter(Boolean).pop() || '';
  return cleanCollectionName(
    segment
      .split('-')
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' '),
  );
}

function findMenuPath(items = [], targetPath, parents = []) {
  let bestPath = null;

  for (const item of items) {
    const itemPath = pathnameFromUrl(item.to || item.url);
    const currentPath = [
      ...parents,
      {
        name: cleanMenuTitle(item.title),
        url: itemPath,
      },
    ];

    if (itemPath === targetPath) bestPath = currentPath;

    const nestedPath = findMenuPath(item.items || [], targetPath, currentPath);
    if (nestedPath && (!bestPath || nestedPath.length > bestPath.length)) {
      bestPath = nestedPath;
    }
  }

  return bestPath;
}

function openingHours() {
  return [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '08:30',
      closes: '17:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Saturday',
      opens: '08:30',
      closes: '12:30',
    },
  ];
}

function organizationSchema(origin) {
  return {
    '@type': 'Organization',
    '@id': `${origin}/#organization`,
    name: BRAND_NAME,
    alternateName: ['Statewide', 'Statewide Appliances'],
    url: `${origin}/`,
    logo: {
      '@type': 'ImageObject',
      url: BRAND_LOGO_URL,
    },
    foundingDate: '1985',
    description:
      "Statewide Appliance Spares is one of Australia's most trusted suppliers of appliance spare parts. Since 1985 it has grown from a small Adelaide business into a leading distributor of genuine spare parts for major brands, covering kitchen appliances, washers and dryers, air conditioning, vacuums, personal care and more, with fast delivery across Australia and New Zealand.",
    brand: {
      '@type': 'Brand',
      name: BRAND_NAME,
      url: `${origin}/`,
    },
    identifier: {
      '@type': 'PropertyValue',
      propertyID: 'ABN',
      value: '26 008 171 588',
    },
    areaServed: [
      {
        '@type': 'Country',
        name: 'Australia',
      },
      {
        '@type': 'Country',
        name: 'New Zealand',
      },
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: '105 Sir Donald Bradman Dr',
      addressLocality: 'Hilton',
      addressRegion: 'SA',
      postalCode: '5033',
      addressCountry: 'AU',
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        telephone: '+611800005220',
        email: 'spares@statewideapp.com.au',
        url: `${origin}/contactus`,
        areaServed: 'AU',
        availableLanguage: 'en',
        hoursAvailable: openingHours(),
      },
      {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        telephone: '+6499655155',
        url: `${origin}/contactus`,
        areaServed: 'NZ',
        availableLanguage: 'en',
        hoursAvailable: openingHours(),
      },
    ],
    sameAs: [
      'https://www.facebook.com/statewideapp',
      'https://au.linkedin.com/company/statewide-appliance-spares',
      'https://www.youtube.com/user/StatewideAppliances',
    ],
  };
}

function websiteSchema(origin) {
  return {
    '@type': 'WebSite',
    '@id': `${origin}/#website`,
    url: `${origin}/`,
    name: BRAND_NAME,
    publisher: {
      '@id': `${origin}/#organization`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${origin}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

function root({shop, url}) {
  const urlPath = new URL(url).pathname;
  const matchedElement = metaDescription.find((item) => {
    return item?.matchedUrl?.includes(urlPath);
  });
  if (matchedElement) {
    url = matchedElement?.url;
  }
  const canonical = canonicalUrl(url);
  const isHomePage = /^\/([a-z]{2}-[a-z]{2}\/?)?$/i.test(
    new URL(canonical).pathname,
  );
  const payload = {
    title: shop?.name,
    titleTemplate: 'Statewide Appliance Spares - Shop online | Australia wide',
    description: truncate(
      'Appliance spare parts with fast Australia wide delivery. Search by brand, appliance or model no. Genuine parts, big brands & lowest prices. Buy online now.',
    ),
    url: canonical,
    robots: {
      noIndex: false,
      noFollow: false,
    },
  };

  if (!isHomePage) {
    payload.jsonLd = {
      '@context': 'https://schema.org',
      ...organizationSchema(canonicalOrigin(canonical)),
      name: BRAND_NAME,
    };
  }

  return payload;
}

function home(url) {
  return {
    title: 'Home',
    titleTemplate: 'Statewide Appliance Spares - Shop online | Australia wide',
    description: truncate(
      'Appliance spare parts with fast Australia wide delivery. Search by brand, appliance or model no. Genuine parts, big brands & lowest prices. Buy online now.',
    ),
    robots: {
      noIndex: false,
      noFollow: false,
    },
    url: canonicalUrl(url),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        organizationSchema(canonicalOrigin(url)),
        websiteSchema(canonicalOrigin(url)),
      ],
    },
  };
}

/**
 * Build schema.org Offer entries for product variants using the page's
 * stock/lifecycle fields.
 */
function merchantReturnPolicy() {
  return {
    '@type': 'MerchantReturnPolicy',
    applicableCountry: 'AU',
    returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
    merchantReturnDays: 14,
    returnMethod: 'https://schema.org/ReturnByMail',
    returnFees: 'https://schema.org/ReturnShippingFees',
  };
}

function offerShippingDetails({includeNewZealand = true} = {}) {
  const details = [
    {
      '@type': 'OfferShippingDetails',
      shippingDestination: {
        '@type': 'DefinedRegion',
        addressCountry: 'AU',
      },
      deliveryTime: {
        '@type': 'ShippingDeliveryTime',
        handlingTime: {
          '@type': 'QuantitativeValue',
          minValue: 0,
          maxValue: 1,
          unitCode: 'DAY',
        },
        transitTime: {
          '@type': 'QuantitativeValue',
          minValue: 1,
          maxValue: 3,
          unitCode: 'DAY',
        },
      },
    },
  ];

  if (includeNewZealand) {
    details.push({
      '@type': 'OfferShippingDetails',
      shippingDestination: {
        '@type': 'DefinedRegion',
        addressCountry: 'NZ',
      },
      deliveryTime: {
        '@type': 'ShippingDeliveryTime',
        handlingTime: {
          '@type': 'QuantitativeValue',
          minValue: 0,
          maxValue: 1,
          unitCode: 'DAY',
        },
        transitTime: {
          '@type': 'QuantitativeValue',
          minValue: 1,
          maxValue: 11,
          unitCode: 'DAY',
        },
      },
    });
  }

  return details;
}

function buildOffersFromVariants(
  variants,
  url,
  {
    priceValidUntil,
    seller,
    hasMerchantReturnPolicy,
    shippingDetails,
    product,
  } = {},
) {
  if (!variants?.length) return [];
  const canonicalProductUrl = canonicalUrl(url);
  return variants.map((variant) => {
    const offer = {
      '@type': 'Offer',
      availability: offerAvailability({product, variant}),
      itemCondition: 'https://schema.org/NewCondition',
      sku: variant?.sku ?? '',
      seller,
      url: canonicalProductUrl,
    };

    if (shouldIncludeOfferPrice({product, variant})) {
      offer.price = variant?.price?.amount ?? '0.00';
      offer.priceCurrency = variant?.price?.currencyCode ?? '';
      offer.priceValidUntil = priceValidUntil;
      offer.hasMerchantReturnPolicy = hasMerchantReturnPolicy;
      offer.shippingDetails = shippingDetails;
    }

    return offer;
  });
}

function productLifecycleStatus({product, variant}) {
  const active =
    product?.is_active_value?.value === '1' ||
    product?.is_active_value?.value === 1 ||
    product?.is_active?.value === '1' ||
    product?.is_active?.value === 1;
  const binNo = product?.bin_no?.value;
  const isAlwaysInStock =
    product?.is_always_in_stock?.value === '1' ||
    product?.is_always_in_stock?.value === 1;
  const hasBin = Boolean(binNo && binNo !== 'null');
  const quantity = Number(variant?.quantityAvailable ?? 0);

  if (!active) return 'discontinued';
  if (!hasBin || (quantity <= 0 && !isAlwaysInStock)) return 'special-order';
  if (!variant?.availableForSale) return 'out-of-stock';
  return 'in-stock';
}

function offerAvailability({product, variant}) {
  const status = productLifecycleStatus({product, variant});
  if (status === 'discontinued') return 'https://schema.org/Discontinued';
  if (status === 'special-order') return 'https://schema.org/BackOrder';
  if (status === 'out-of-stock') return 'https://schema.org/OutOfStock';
  return 'https://schema.org/InStock';
}

function shouldIncludeOfferPrice({product, variant}) {
  const status = productLifecycleStatus({product, variant});
  const price = Number(variant?.price?.amount ?? 0);
  return status !== 'discontinued' && price > 0;
}

function hasUsableBrandName(name) {
  const value = String(name ?? '').trim();
  return Boolean(value && !/^n\/?a$/i.test(value));
}

function safePriceValidUntil() {
  const nextYear = new Date().getUTCFullYear() + 1;
  return `${nextYear}-12-31`;
}

function productJsonLd({product, selectedVariant, url}) {
  const canonical = canonicalUrl(url);
  const origin = new URL(canonical).origin;
  const seller = {
    '@type': 'Organization',
    '@id': `${origin}/#organization`,
    name: 'Statewide Appliance Spares',
  };
  const priceValidUntil = safePriceValidUntil();
  const variants = product.variants?.nodes ?? [];
  const isAustraliaOnly =
    product?.show_australia_only?.value === 'true' ||
    product?.show_australia_only?.value === true;
  const productBreadcrumb = product?.breadcrumb?.value;
  const importantModels = getImportantModelNumbers({product, selectedVariant});
  const productName = getProductSeoName({
    product,
    selectedVariant,
    models: importantModels,
  });
  const description = getProductSeoDescription({
    product,
    selectedVariant,
    models: importantModels,
  });
  const imageAlt = getProductImageAlt({
    product,
    selectedVariant,
    models: importantModels,
  });
  const seoImage = getProductSeoImage({
    product,
    selectedVariant,
    productTitle: productName || product?.title,
    altText: imageAlt,
  });
  const jsonLdImages = getProductJsonLdImages({
    product,
    selectedVariant,
    productTitle: productName || product?.title,
    altText: imageAlt,
  });
  // Primary market offers (AUD for AU users, NZD for NZ users)
  let offers = buildOffersFromVariants(variants, canonical, {
    priceValidUntil,
    seller,
    product,
    hasMerchantReturnPolicy: merchantReturnPolicy(),
    shippingDetails: offerShippingDetails({
      includeNewZealand: !isAustraliaOnly,
    }),
  });
  if (isAustraliaOnly) {
    offers = offers.filter((offer) => offer.priceCurrency !== 'NZD');
  }
  offers = offers.filter((offer) => offer.priceCurrency);
  offers = offers.filter((offer, index, allOffers) => {
    return (
      index ===
      allOffers.findIndex(
        (entry) =>
          entry.priceCurrency === offer.priceCurrency &&
          entry.sku === offer.sku,
      )
    );
  });
  const richSnippetId = `${canonical}#richSnippet`;
  const webpageId = `${canonical}#webpage`;
  const breadcrumbItems = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: `${origin}/`,
    },
  ];
  if (productBreadcrumb) {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: breadcrumbItems.length + 1,
      name: productBreadcrumb,
      item: `${origin}/${handleize(productBreadcrumb)}`,
    });
  }
  if (product?.productType) {
    const productTypeUrl = `${origin}/${handleize(product.productType)}`;
    const alreadyAdded = breadcrumbItems.some(
      (item) =>
        item.item === productTypeUrl || item.name === product.productType,
    );
    if (!alreadyAdded) {
      breadcrumbItems.push({
        '@type': 'ListItem',
        position: breadcrumbItems.length + 1,
        name: product.productType,
        item: productTypeUrl,
      });
    }
  }
  breadcrumbItems.push({
    '@type': 'ListItem',
    position: breadcrumbItems.length + 1,
    name: productName || product.title,
    item: canonical,
  });

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': richSnippetId,
    name: productName || product.title,
    description,
    image: jsonLdImages.length
      ? jsonLdImages
      : [seoImage?.url].filter(Boolean),
    sku: getProductSku({product, selectedVariant}),
    url: canonical,
    mainEntityOfPage: {
      '@id': webpageId,
    },
  };

  if (hasUsableBrandName(product.vendor)) {
    productSchema.brand = {
      '@type': 'Brand',
      name: product.vendor,
    };
  }
  if (offers.length) {
    productSchema.offers = offers.length === 1 ? offers[0] : offers;
  }

  const webpageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': webpageId,
    url: canonical,
    name: productName || product.title,
    description,
    mainEntity: {
      '@id': richSnippetId,
    },
  };

  if (seoImage?.url) {
    webpageSchema.primaryImageOfPage = {
      '@type': 'ImageObject',
      url: seoImage.url,
      contentUrl: seoImage.url,
      width: seoImage.width,
      height: seoImage.height,
      name: seoImage.altText,
      description: seoImage.altText,
      caption: seoImage.altText,
    };
  }

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbItems,
    },
    webpageSchema,
    productSchema,
  ];
}

function product({product, url, selectedVariant}) {
  const importantModels = getImportantModelNumbers({product, selectedVariant});
  const title =
    getProductSeoName({
      product,
      selectedVariant,
      models: importantModels,
    }) ||
    product?.title ||
    product?.seo?.title ||
    '';
  const description = truncate(
    getProductSeoDescription({
      product,
      selectedVariant,
      models: importantModels,
    }),
  );
  const canonical = canonicalUrl(url);
  const imageAlt = getProductImageAlt({
    product,
    selectedVariant,
    models: importantModels,
  });
  const seoImage = getProductSeoImage({ 
    product,
    selectedVariant,
    productTitle: title,
    altText: imageAlt, 
  });
  const indexable = isSearchEngineIndexable(url);
  const media = seoImage?.url
    ? {
        type: 'image',
        url: seoImage.url,
        width: seoImage.width,
        height: seoImage.height,
        altText: seoImage.altText || imageAlt,
      }
    : undefined;
  return {
    title,
    titleTemplate: '%s',
    description,
    url: canonical,
    image: media,
    robots: indexable
      ? {
          noIndex: false,
          noFollow: false,
          maxImagePreview: 'large',
        }
      : {
          noIndex: true,
          noFollow: true,
        },
    jsonLd: productJsonLd({
      product,
      selectedVariant,
      url: canonical,
    }),
  };
}

function buildCollectionBreadcrumbItems({
  url,
  collection,
  breadcrumbCollections = [],
}) {
  const canonical = canonicalUrl(url);
  const origin = canonicalOrigin(canonical);
  const menuPath = findMenuPath(
    [...(headerMenu.items || []), ...(siteNav.items || [])],
    pathnameFromUrl(canonical),
  );

  if (menuPath?.length) {
    const finalSegmentName = titleFromPathSegment(canonical);
    const finalPathSegment = pathnameFromUrl(canonical)
      .split('/')
      .filter(Boolean)
      .pop();
    const collectionMatchesFinalPath =
      collection?.handle && collection.handle === finalPathSegment;

    return [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${origin}/`,
      },
      ...menuPath.map((crumb, index) => {
        const isLast = index === menuPath.length - 1;
        return {
          '@type': 'ListItem',
          position: index + 2,
          name: isLast
            ? collectionMatchesFinalPath
              ? cleanCollectionName(collection?.title || crumb.name)
              : finalSegmentName || crumb.name
            : crumb.name,
          item: isLast ? canonical : absoluteUrl(origin, crumb.url),
        };
      }),
    ];
  }

  const collections = [...breadcrumbCollections, collection].filter(Boolean);
  const uniqueCollections = collections.filter((item, index, list) => {
    const key = item?.handle || item?.title;
    return (
      key &&
      list.findIndex((entry) => (entry?.handle || entry?.title) === key) ===
        index
    );
  });
  const crumbCollections = uniqueCollections.length
    ? uniqueCollections
    : [collection];
  const crumbs = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: `${origin}/`,
    },
  ];

  crumbCollections.forEach((crumb, index) => {
    const isLast = index === crumbCollections.length - 1;
    const item = isLast
      ? canonical
      : absoluteUrl(origin, `/${crumb.handle || handleize(crumb.title)}`);
    crumbs.push({
      '@type': 'ListItem',
      position: crumbs.length + 1,
      name: cleanCollectionName(crumb?.title || crumb?.seo?.title || ''),
      item,
    });
  });

  return crumbs;
}

function collectionJsonLd({url, collection, breadcrumbCollections = []}) {
  const canonical = canonicalUrl(url);
  const origin = canonicalOrigin(canonical);
  const itemListId = `${canonical}/#itemlist`;
  const catalogId = `${canonical}/#catalog`;
  const itemListElement = (collection.products?.nodes ?? []).map(
    (product, index) => {
      return {
        '@type': 'ListItem',
        position: index + 1,
        name: product.title,
        url: absoluteUrl(origin, `/${product.handle}`),
      };
    },
  );
  const itemList = {
    '@type': 'ItemList',
    '@id': itemListId,
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    numberOfItems: itemListElement.length,
    itemListElement,
  };

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: buildCollectionBreadcrumbItems({
        url: canonical,
        collection,
        breadcrumbCollections,
      }),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': `${canonical}/#webpage`,
      name: collection?.seo?.title ?? collection?.title ?? '',
      description: truncate(
        collection?.seo?.description ?? collection?.description ?? '',
      ),
      image: collection?.image?.url,
      url: canonical,
      mainEntity: itemList,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'OfferCatalog',
      '@id': catalogId,
      name: collection?.seo?.title ?? collection?.title ?? '',
      url: canonical,
      itemListElement: {
        '@id': itemListId,
      },
    },
  ];
}

function collection({collection, url, breadcrumbCollections = []}) {
  let title = collection.seo?.title;
  if (!title) {
    title = collection.title;
  }
  const canonical = canonicalUrl(url);
  return {
    title,
    description: truncate(
      collection?.seo?.description ?? collection?.description ?? '',
    ),
    url: canonical,
    titleTemplate:
      /authorised/i.test(title ?? '') || /\|/.test(title ?? '')
        ? '%s'
        : '%s | Statewide Appliance Spares',
    media: {
      type: 'image',
      url: collection?.image?.url,
      height: collection?.image?.height,
      width: collection?.image?.width,
      altText: collection?.image?.altText,
    },
    jsonLd: collectionJsonLd({
      collection,
      url: canonical,
      breadcrumbCollections,
    }),
  };
}

function collectionsJsonLd({url, collections}) {
  const itemListElement = collections.nodes.map((collection, index) => {
    return {
      '@type': 'ListItem',
      position: index + 1,
      url: `https://www.statewideapp.com.au/collections/${collection.handle}`,
    };
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Collections',
    description: 'All collections',
    url,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement,
    },
  };
}

function listCollections({collections, url}) {
  const canonical = canonicalUrl(url);
  return {
    title: 'Collections',
    titleTemplate: '%s | Collections',
    description: 'All hydrogen collections',
    url: canonical,
    jsonLd: collectionsJsonLd({collections, url: canonical}),
  };
}

function article({article, url}) {
  const canonical = canonicalUrl(url);
  return {
    title: article?.seo?.title ?? article?.title,
    description: truncate(article?.seo?.description ?? article?.content ?? ''),
    titleTemplate: '%s | Blogs',
    url: canonical,
    type: 'Article',
    media: {
      type: 'image',
      url: article?.image?.url ?? article?.desktop_image?.reference?.image?.url,
      height:
        article?.image?.height ??
        article?.desktop_image?.reference?.image?.height,
      width:
        article?.image?.width ??
        article?.desktop_image?.reference?.image?.width,
      altText: article?.image?.altText ?? article?.title,
    },
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      alternativeHeadline: article.title,
      articleBody: truncate(article.content, 5000),
      datePublished: article?.publishedAt,
      description: truncate(
        article?.seo?.description || article?.excerpt || article?.content,
      ),
      headline: article?.seo?.title || '',
      image: article?.image?.url,
      url: canonical,
    },
  };
}

function blog({blog, url}) {
  const canonical = canonicalUrl(url);
  return {
    title: blog?.seo?.title,
    description: truncate(blog?.seo?.description || ''),
    titleTemplate: '%s | Blog',
    url: canonical,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: blog?.seo?.title || blog?.title || '',
      description: blog?.seo?.description || '',
      url: canonical,
    },
  };
}

/**
 * Page-specific SEO for pages whose Shopify record has no SEO fields filled
 * in. Values set on the page in Shopify admin always win.
 */
const PAGE_SEO_DEFAULTS = {
  findyourmodel: {
    title: 'Where to Find Your Appliance Model Number | Statewide Appliance Spares',
    description:
      'Where to find the model number on your dishwasher, oven, fridge, washing machine, air conditioner and more, by appliance, then shop genuine spare parts.',
  },
};

/**
 * Pages listed in PAGE_SEO_DEFAULTS use that curated title and description
 * (their Shopify page SEO fields still hold the old values); every other page
 * uses its Shopify SEO fields, then its title.
 */
function page({page, url, image}) {
  const defaults = PAGE_SEO_DEFAULTS[page?.handle] ?? {};
  const title = defaults.title || page?.seo?.title || page?.title;
  const description = defaults.description || page?.seo?.description || '';
  const canonical = canonicalUrl(url);
  const origin = canonicalOrigin(canonical);
  return {
    description: truncate(description),
    title,
    titleTemplate: /\|/.test(title ?? '') ? '%s' : `%s | ${BRAND_NAME}`,
    url: canonical,
    ...(image?.url
      ? {
          media: {
            type: 'image',
            url: image.url,
            width: image.width,
            height: image.height,
            altText: image.alt,
          },
        }
      : {}),
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': `${canonical}#webpage`,
        name: page?.title,
        headline: title,
        ...(description ? {description} : {}),
        url: canonical,
        inLanguage: 'en-AU',
        ...(image?.url ? {primaryImageOfPage: {'@type': 'ImageObject', url: image.url}} : {}),
        isPartOf: {'@type': 'WebSite', '@id': `${origin}/#website`, name: BRAND_NAME, url: `${origin}/`},
        publisher: {'@id': `${origin}/#organization`},
        breadcrumb: {'@id': `${canonical}#breadcrumb`},
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        '@id': `${canonical}#breadcrumb`,
        itemListElement: [
          {'@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/`},
          {'@type': 'ListItem', position: 2, name: page?.title, item: canonical},
        ],
      },
    ],
  };
}

function policy({policy, url}) {
  return {
    description: truncate(policy?.body ?? ''),
    title: policy?.title,
    titleTemplate: '%s | Policy',
    url: canonicalUrl(url),
  };
}

function policies({policies, url}) {
  const canonical = canonicalUrl(url);
  const origin = new URL(canonical).origin;
  const itemListElement = policies.filter(Boolean).map((policy, index) => {
    return {
      '@type': 'ListItem',
      position: index + 1,
      name: policy.title,
      item: `${origin}/policies/${policy.handle}`,
    };
  });
  return {
    title: 'Policies',
    titleTemplate: '%s | Policies',
    description: 'Hydroge store policies',
    url: canonical,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        description: 'Hydrogen store policies',
        name: 'Policies',
        url: canonical,
      },
    ],
  };
}

export const seoPayload = {
  article,
  blog,
  collection,
  home,
  listCollections,
  page,
  policies,
  policy,
  product,
  root,
};

/**
 * Truncate a string to a given length, adding an ellipsis if it was truncated
 * @param str - The string to truncate
 * @param num - The maximum length of the string
 * @returns The truncated string
 * @example
 * ```js
 * truncate('Hello world', 5) // 'Hello...'
 * ```
 */
function truncate(str, num = 155) {
  if (typeof str !== 'string') return '';
  if (str.length <= num) {
    return str;
  }
  return str.slice(0, num - 3) + '...';
}
