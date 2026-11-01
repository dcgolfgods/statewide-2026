const ANNOUNCEMENT_TYPE = 'announcement';
const DEFAULT_PAGE_SIZE = 250;
const DEFAULT_MAX_PAGES = 4;

export async function fetchAnnouncements(
  storefront,
  {pageSize = DEFAULT_PAGE_SIZE, maxPages = DEFAULT_MAX_PAGES} = {},
) {
  if (!storefront) return [];

  let hasNextPage = true;
  let after = null;
  let page = 0;
  const nodes = [];

  while (hasNextPage && page < maxPages) {
    const {metaobjects} = await storefront.query(ANNOUNCEMENTS_QUERY, {
      variables: {
        type: ANNOUNCEMENT_TYPE,
        first: pageSize,
        after,
        country: storefront.i18n.country,
        language: storefront.i18n.language,
      },
    });

    nodes.push(...(metaobjects?.nodes || []));
    hasNextPage = Boolean(metaobjects?.pageInfo?.hasNextPage);
    after = metaobjects?.pageInfo?.endCursor || null;
    page += 1;
  }

  return nodes
    .map(mapAnnouncementNode)
    .filter((item) => item.handle && item.title)
    .sort((a, b) => {
      const aTime = new Date(a.dateForSort).getTime();
      const bTime = new Date(b.dateForSort).getTime();
      return bTime - aTime;
    });
}

export function getAnnouncementMonthKey(value) {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function mapAnnouncementNode(node) {
  const title = getFieldValue(node, 'announcement_title');
  const body = getFieldValue(node, 'announcement_text');
  const dateValue = getFieldValue(node, 'date');
  const parsedDate = new Date(dateValue || node?.updatedAt || '');
  const safeDateValue = Number.isNaN(parsedDate.getTime())
    ? node?.updatedAt || ''
    : parsedDate.toISOString();

  return {
    id: node?.id,
    handle: node?.handle,
    title: title || '',
    body: body || '',
    date: safeDateValue,
    dateForSort: safeDateValue,
    coverImage: getFieldImage(node, 'cover_image'),
    bannerImage: getFieldImage(node, 'banner_image'),
  };
}

function getFieldValue(node, key) {
  return (
    node?.fields?.find((field) => field?.key === key)?.value ||
    node?.[key]?.value ||
    ''
  );
}

function getFieldImage(node, key) {
  const field =
    node?.fields?.find((entry) => entry?.key === key) || node?.[key] || null;
  const image = field?.reference?.image;
  if (!image?.url) return null;

  return {
    url: image.url,
    altText: image.altText || '',
    width: image.width || null,
    height: image.height || null,
  };
}

const ANNOUNCEMENTS_QUERY = `#graphql
  query Announcements(
    $type: String!
    $first: Int!
    $after: String
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    metaobjects(type: $type, first: $first, after: $after, reverse: true) {
      nodes {
        id
        handle
        updatedAt
        fields {
          key
          value
          reference {
            ... on MediaImage {
              image {
                url
                altText
                width
                height
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;