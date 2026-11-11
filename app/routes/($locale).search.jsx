import { useLoaderData} from 'react-router';
import {data as json} from 'react-router';
import {getPaginationVariables} from '@shopify/hydrogen';

import {
  SearchPage
} from '~/components';
import {PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import {getImageLoadingPriority, PAGINATION_SIZE} from '~/lib/const';
import {seoPayload} from '~/lib/seo.server';

import {getFeaturedData} from './($locale).featured-products';
import {getRouteSeoMeta} from '~/lib/meta';
import {assertValidLocaleParam} from '~/lib/locale';

export const meta = ({matches}) => getRouteSeoMeta(matches);


export async function loader({request, context: {storefront}, params}) {
  assertValidLocaleParam(params);
  const searchParams = new URL(request.url).searchParams;
  const searchTerm = searchParams.get('q') ? searchParams.get('q') : "";
  const variables = getPaginationVariables(request, {pageBy: 8});
  // console.log("searchTerm",searchTerm)
  let q = searchTerm.replace('/', '').toLowerCase();
  const {products} = await storefront.query(SEARCH_QUERY, {
    variables: {
      searchTerm,
      ...variables,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
  });

  const shouldGetRecommendations = !searchTerm || products?.nodes?.length === 0;

  const seo = seoPayload.collection({
    url: request.url,
    collection: {
      id: 'search',
      title: 'Search',
      handle: 'search',
      descriptionHtml: 'Search results',
      description: 'Search results',
      seo: {
        title: 'Search',
        description: `Showing ${products.nodes.length} search results for "${searchTerm}"`,
      },
      metafields: [],
      products,
      updatedAt: new Date().toISOString(),
    },
  });
  seo.robots = {
    noIndex: true,
    noFollow: true,
  };

  return json(
    {
      seo,
      searchTerm,
      products,
      noResultRecommendations: shouldGetRecommendations
        ? getNoResultRecommendations(storefront)
        : Promise.resolve(null),
    },
    {
      headers: {
        'X-Robots-Tag': 'noindex, nofollow',
      },
    },
  );
}

export default function Search() {
  const {searchTerm, products, noResultRecommendations} = useLoaderData();
  const noResults = products?.nodes?.length === 0;

  return (
    <>
    <SearchPage searchTerm={searchTerm} />
    </>
  );
}


export function getNoResultRecommendations(storefront) {
  return getFeaturedData(storefront, {pageBy: PAGINATION_SIZE});
}

const SEARCH_QUERY = `#graphql
  query PaginatedProductsSearch(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $searchTerm: String
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    products(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor,
      sortKey: RELEVANCE,
      query: $searchTerm
    ) {
      nodes {
        ...ProductCard
      }
      pageInfo {
        startCursor
        endCursor
        hasNextPage
        hasPreviousPage
      }
    }
  }

  ${PRODUCT_CARD_FRAGMENT}
`;
