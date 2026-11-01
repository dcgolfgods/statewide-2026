export const MEDIA_FRAGMENT = `#graphql
  fragment Media on Media {
    __typename
    mediaContentType
    alt
    previewImage {
      url
    }
    ... on MediaImage {
      id
      image {
        id
        url
        width
        height
      }
    }
    ... on Video {
      id
      sources {
        mimeType
        url
      }
    }
    ... on Model3d {
      id
      sources {
        mimeType
        url
      }
    }
    ... on ExternalVideo {
      id
      embedUrl
      host
    }
  }
`;

export const PRODUCT_CARD_FRAGMENT = `#graphql
  fragment ProductCard on Product {
    id
    title
    handle
    is_active_value: metafield(namespace: "product_extended_property", key: "is_active_value") {
      value
    }
    is_always_in_stock: metafield(namespace: "product_extended_property", key: "is_always_in_stock") {
      value
    }
    bin_no: metafield(namespace: "product_extended_property", key: "bin_no") {
      value
    }
    variants(first: 1) {
      nodes {
        id
        availableForSale
        quantityAvailable
        sku
        image {
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
      }
    }
  }
`;

export const FEATURED_COLLECTION_FRAGMENT = `#graphql
  fragment FeaturedCollectionDetails on Collection {
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
`;


export const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  query productRecommendations(
    $productId: ID!
    $count: Int
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    recommended: productRecommendations(productId: $productId) {
      id
      title
      handle
      is_active_value: metafield(namespace: "product_extended_property", key: "is_active_value") {
        value
      }
      bin_no: metafield(namespace: "product_extended_property", key: "bin_no") {
        value
      }
      variants(first: 1) {
        nodes {
          id
          availableForSale
          quantityAvailable
          image {
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
        }
      }
    }
    additional: products(first: $count, sortKey: BEST_SELLING) {
      nodes {
        id
        title
        publishedAt
        handle
        vendor
        is_active_value: metafield(namespace: "product_extended_property", key: "is_active_value") {
          value
        }
        bin_no: metafield(namespace: "product_extended_property", key: "bin_no") {
          value
        }
        variants(first: 1) {
          nodes {
            id
            availableForSale
            quantityAvailable
            image {
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
          }
        }
      }
    }
  }
`;


export const COLLECTION_DATA_FRAGMENT = `#graphql
  fragment CollectionData on Collection {
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
      products(
            first: 20,
          ) {
            nodes {
              title
              handle
            }
          }
    type: metafield(namespace: "custom", key: "collection_type") {
     value
    }
    part_type_custom_title: metafield(namespace: "custom", key: "custom_part_type_custom_title") {
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
`;
// NOTE: https://shopify.dev/docs/api/storefront/latest/queries/cart
export const CART_QUERY_FRAGMENT = `#graphql
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
