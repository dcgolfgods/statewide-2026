
import {Suspense} from 'react';
import {Await, useLoaderData, useMatches} from 'react-router';
import {AnalyticsPageType} from '@shopify/hydrogen';

import {ProductSwimlane, HomeBlogs, Hero, HomeSearch, HomeApplinces, HomeReviews, Brands, AboutUs, HomeSlider} from '~/components';
import {MEDIA_FRAGMENT, PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import {getHeroPlaceholder} from '~/lib/placeholders';
import {seoPayload} from '~/lib/seo.server';
import {routeHeaders} from '~/data/cache';
import {getRouteSeoMeta} from '~/lib/meta';

export const meta = ({matches}) => getRouteSeoMeta(matches);

export const headers = routeHeaders;

export const links = () => [
  {
    rel: 'preload',
    as: 'image',
    href: 'https://cdn.shopify.com/s/files/1/0799/5929/4245/files/Desktop_Pacvac_Superpro.webp?v=1782275641',
    media: '(min-width: 1024px)',
  },
  {
    rel: 'preload',
    as: 'image',
    href: 'https://cdn.shopify.com/s/files/1/0799/5929/4245/files/Mobile_Pacvac_Superpro.webp?v=1782275641',
    media: '(max-width: 1023px)',
  },
];

export async function loader({request, params, context}) {
  const {language, country} = context.storefront.i18n;
  console.log("paramss",request.url)
  if (
    params.locale &&
    params.locale.toLowerCase() !== `${language}-${country}`.toLowerCase()
  ) {
    // If the locale URL param is defined, yet we still are on `EN-US`
    // the the locale param must be invalid, send to the 404 page
    throw new Response(null, {status: 404});
  }

  const {shop, hero} = await context.storefront.query(HOMEPAGE_SEO_QUERY, {
    variables: {handle: 'freestyle'},
  });

  const seo = seoPayload.home(request.url);

  return {
    shop,
    analytics: {
      pageType: AnalyticsPageType.home,
    },
    seo,
  };
}

export default function Homepage() {
  const [root] = useMatches();
  const skipResources = root?.data?.skipResources;
  // const {
  //   primaryHero,
  //   secondaryHero,
  //   tertiaryHero,
  //   featuredCollections,
  //   featuredProducts,
  // } = useLoaderData();

  // TODO: skeletons vs placeholders
  const skeletons = getHeroPlaceholder([{}, {}, {}]);

  return (
    <>
      {/* <HomeSearch classes="sm-hide"/> */}
      <HomeSlider />
      <HomeApplinces />
      <div className='bg-[#f2f2f2] pb-8 lg:pb-12 home-review'>
      {!skipResources && <HomeReviews skipResources={skipResources} />}
      <HomeBlogs />
      </div>
      <Brands />
      <AboutUs skipResources={skipResources} />

     
    </>
  );
}

const COLLECTION_CONTENT_FRAGMENT = `#graphql
  fragment CollectionContent on Collection {
    id
    handle
    title
    descriptionHtml
    heading: metafield(namespace: "hero", key: "title") {
      value
    }
    byline: metafield(namespace: "hero", key: "byline") {
      value
    }
    cta: metafield(namespace: "hero", key: "cta") {
      value
    }
    spread: metafield(namespace: "hero", key: "spread") {
      reference {
        ...Media
      }
    }
    spreadSecondary: metafield(namespace: "hero", key: "spread_secondary") {
      reference {
        ...Media
      }
    }
  }
  ${MEDIA_FRAGMENT}
`;

const HOMEPAGE_SEO_QUERY = `#graphql
  query seoCollectionContent($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    shop {
      name
      description
    }
  }
`;

const COLLECTION_HERO_QUERY = `#graphql
  query heroCollectionContent($handle: String, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    hero: collection(handle: $handle) {
      ...CollectionContent
    }
  }
  ${COLLECTION_CONTENT_FRAGMENT}
`;

// @see: https://shopify.dev/api/storefront/2023-07/queries/products
export const HOMEPAGE_FEATURED_PRODUCTS_QUERY = `#graphql
  query homepageFeaturedProducts($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    products(first: 8) {
      nodes {
        ...ProductCard
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;

// @see: https://shopify.dev/api/storefront/2023-07/queries/collections
export const FEATURED_COLLECTIONS_QUERY = `#graphql
  query homepageFeaturedCollections($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    collections(
      first: 4,
      sortKey: UPDATED_AT
    ) {
      nodes {
        id
        title
        handle
        image {
          altText
          width
          height
          url
        }
      }
    }
  }
`;
