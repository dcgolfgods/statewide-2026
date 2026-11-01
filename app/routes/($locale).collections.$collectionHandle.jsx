import {data as json, redirect} from 'react-router';
import { Image } from '@shopify/hydrogen';
import {useLoaderData} from 'react-router';
import {
  flattenConnection,
  AnalyticsPageType,
  Pagination,
  getPaginationVariables,
} from '@shopify/hydrogen';
import invariant from 'tiny-invariant';

import {
  PageHeader,
  Section,
  Text,
  // SortFilter,
  Grid,
  ProductCard,
  Button,
} from '~/components';
import {PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import {routeHeaders} from '~/data/cache';
import {seoPayload} from '~/lib/seo.server';
import {getImageLoadingPriority} from '~/lib/const';

export const headers = routeHeaders;

export async function loader({params, request, context}) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 8,
  });
  const {collectionHandle} = params;
  // return redirect(`/${collectionHandle}`);
  return redirect(`https://www.statewideapp.com.au/${collectionHandle}`, { status: 301 }); 
  invariant(collectionHandle, 'Missing collectionHandle param');

  const searchParams = new URL(request.url).searchParams;
  const knownFilters = ['productVendor', 'productType'];
  const available = 'available';
  const variantOption = 'variantOption';
  const {sortKey, reverse} = getSortValuesFromParam(searchParams.get('sort'));
  const filters = [];
  const appliedFilters = [];

  for (const [key, value] of searchParams.entries()) {
    if (available === key) {
      filters.push({available: value === 'true'});
      appliedFilters.push({
        label: value === 'true' ? 'In stock' : 'Out of stock',
        urlParam: {
          key: available,
          value,
        },
      });
    } else if (knownFilters.includes(key)) {
      filters.push({[key]: value});
      appliedFilters.push({label: value, urlParam: {key, value}});
    } else if (key.includes(variantOption)) {
      const [name, val] = value.split(':');
      filters.push({variantOption: {name, value: val}});
      appliedFilters.push({label: val, urlParam: {key, value}});
    }
  }

  // Builds min and max price filter since we can't stack them separately into
  // the filters array. See price filters limitations:
  // https://shopify.dev/custom-storefronts/products-collections/filter-products#limitations
  if (searchParams.has('minPrice') || searchParams.has('maxPrice')) {
    const price = {};
    if (searchParams.has('minPrice')) {
      price.min = Number(searchParams.get('minPrice')) || 0;
      appliedFilters.push({
        label: `Min: $${price.min}`,
        urlParam: {key: 'minPrice', value: searchParams.get('minPrice')},
      });
    }
    if (searchParams.has('maxPrice')) {
      price.max = Number(searchParams.get('maxPrice')) || 0;
      appliedFilters.push({
        label: `Max: $${price.max}`,
        urlParam: {key: 'maxPrice', value: searchParams.get('maxPrice')},
      });
    }
    filters.push({
      price,
    });
  }

  const {collection, collections} = await context.storefront.query(
    COLLECTION_QUERY,
    {
      variables: {
        ...paginationVariables,
        handle: collectionHandle,
        filters,
        sortKey,
        reverse,
        country: context.storefront.i18n.country,
        language: context.storefront.i18n.language,
      },
    },
  );

  if (!collection) {
    throw new Response('collection', {status: 404});
  }

  const seo = seoPayload.collection({collection, url: request.url});

  return json({
    collection,
    appliedFilters,
    collections: flattenConnection(collections),
    analytics: {
      pageType: AnalyticsPageType.collection,
      collectionHandle,
      resourceId: collection.id,
    },
    seo,
  });
}

export default function Collection() {
  const {collection, collections, appliedFilters} = useLoaderData();
  return (
    <>
     
      <div className='collection-page max-w-[1140px] mx-auto mt-[10px] px-[15px]'>
          <div className='hidden lg:flex page-title mb-[15px] py-[25px] border-b-[1px] border-b-[#ccc]'>
          {collection?.image?.url && 
            <div className='image ml-[20px] mr-[1%]  justify-center'>
              <div className='img w-[60px] h-[60px]'>
                <Image className='w-full max-w-full' src={collection?.image?.url} />
              </div>
            </div>}
            <h1 className='text-[#1e5097] text-[24px] flex justify-center items-center font-bold text-center'>{collection.title}</h1>
          </div>
          <div className='hidden lg:flex pb-[10px]  items-center collection-top-details'>
            {collection?.image?.url && 
            <div className='w-[25%] image ml-[20px] mr-[1%] hidden justify-center'>
              <div className='img w-[150px] h-[150px] p-[30px] border-[2px] border-[#1e5097] rounded-full'>
                <Image className='w-full max-w-full' src={collection?.image?.url} />
              </div>
            </div>}
            {collection?.short_description?.value && 
            <div className='short-description w-full text-[13px]'>
                <div className='details'>
                  {collection?.short_description?.value}  <a className="show-full" href=""> Read more...</a>
                </div>
                
            </div>}
          </div>

          <div className='result-message py-[1px] px-[1em]'>
            <h2 className='text-[34px] my-[10px] text-[#1e5097] text-center'>{collection.title}</h2>
          </div>
          {/* <Pagination connection={collection.products}>
            {({nodes, isLoading, PreviousLink, NextLink}) => (
              <>
                <div className="flex items-center justify-center mb-6">
                  <Button as={PreviousLink} variant="secondary" width="full">
                    {isLoading ? 'Loading...' : 'Load previous'}
                  </Button>
                </div>
                <Grid layout="products">
                  {nodes.map((product, i) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      loading={getImageLoadingPriority(i)}
                    />
                  ))}
                </Grid>
                <div className="flex items-center justify-center mt-6">
                  <Button as={NextLink} variant="secondary" width="full">
                    {isLoading ? 'Loading...' : 'Load more products'}
                  </Button>
                </div>
              </>
            )}
          </Pagination> */}

          <div heading={collection.title}>
            <h4 className='text-[#1e5097] text-[24px] mb-[8px]'>{collection.title}</h4>
        {collection?.description && (
          <div className="w-full mb-[50px]">
            <div className='collection-description text-[13px]'>
            <div className="w-full text-black" dangerouslySetInnerHTML={{ __html: collection.descriptionHtml }} />
            </div>
          </div>
        )}
      </div>
      </div>
      
    </>
  );
}

const COLLECTION_QUERY = `#graphql
  query CollectionDetails(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $filters: [ProductFilter!]
    $sortKey: ProductCollectionSortKeys!
    $reverse: Boolean
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
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
      short_description: metafield(namespace: "custom", key: "short_description") {
        value
      }
      products(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor,
        filters: $filters,
        sortKey: $sortKey,
        reverse: $reverse
      ) {
        filters {
          id
          label
          type
          values {
            id
            label
            count
            input
          }
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
    collections(first: 100) {
      edges {
        node {
          title
          handle
        }
      }
    }
  }
`;

function getSortValuesFromParam(sortParam) {
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
