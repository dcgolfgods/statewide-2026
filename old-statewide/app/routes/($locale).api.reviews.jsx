import {json} from '@shopify/remix-oxygen';

/**
 * Fetch reviews from metaobject with pagination
 */
export async function loader({request, context: {storefront}}) {
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);

  const after = searchParams.get('after') || null;
  const first = parseInt(searchParams.get('first') || '250');

  const {metaobjects} = await storefront.query(REVIEWS_QUERY, {
    variables: {
      type: 'reviews',
      first,
      after,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
  });

  return json({
    reviews: metaobjects?.nodes || [],
    pageInfo: metaobjects?.pageInfo || null,
  });
}

const REVIEWS_QUERY = `#graphql
  query Reviews(
    $type: String!
    $first: Int!
    $after: String
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    metaobjects(type: $type, first: $first, after: $after, reverse: true) {
      nodes {
        id
        updatedAt
        reviewId: field(key: "review_id") {
          value
        }
        user: field(key: "user") {
          value
        }
        reviewContent: field(key: "review_content") {
          value
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

// no-op
export default function ReviewsApiRoute() {
  return null;
}

