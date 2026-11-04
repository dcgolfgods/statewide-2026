/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as StorefrontAPI from '@shopify/hydrogen/storefront-api-types';

export type OrderCardFragment = Pick<
  StorefrontAPI.Order,
  'id' | 'orderNumber' | 'processedAt' | 'financialStatus' | 'fulfillmentStatus'
> & {
  currentTotalPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
  fulfillmentData?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
  lineItems: {
    edges: Array<{
      node: Pick<StorefrontAPI.OrderLineItem, 'title'> & {
        variant?: StorefrontAPI.Maybe<{
          image?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Image, 'url' | 'altText' | 'height' | 'width'>
          >;
        }>;
      };
    }>;
  };
};

type Media_ExternalVideo_Fragment = {__typename: 'ExternalVideo'} & Pick<
  StorefrontAPI.ExternalVideo,
  'id' | 'embedUrl' | 'host' | 'mediaContentType' | 'alt'
> & {previewImage?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>};

type Media_MediaImage_Fragment = {__typename: 'MediaImage'} & Pick<
  StorefrontAPI.MediaImage,
  'id' | 'mediaContentType' | 'alt'
> & {
    image?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.Image, 'id' | 'url' | 'width' | 'height'>
    >;
    previewImage?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
  };

type Media_Model3d_Fragment = {__typename: 'Model3d'} & Pick<
  StorefrontAPI.Model3d,
  'id' | 'mediaContentType' | 'alt'
> & {
    sources: Array<Pick<StorefrontAPI.Model3dSource, 'mimeType' | 'url'>>;
    previewImage?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
  };

type Media_Video_Fragment = {__typename: 'Video'} & Pick<
  StorefrontAPI.Video,
  'id' | 'mediaContentType' | 'alt'
> & {
    sources: Array<Pick<StorefrontAPI.VideoSource, 'mimeType' | 'url'>>;
    previewImage?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
  };

export type MediaFragment =
  | Media_ExternalVideo_Fragment
  | Media_MediaImage_Fragment
  | Media_Model3d_Fragment
  | Media_Video_Fragment;

export type ProductCardFragment = Pick<
  StorefrontAPI.Product,
  'id' | 'title' | 'handle'
> & {
  is_active_value?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
  is_always_in_stock?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Metafield, 'value'>
  >;
  bin_no?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
  variants: {
    nodes: Array<
      Pick<
        StorefrontAPI.ProductVariant,
        'id' | 'availableForSale' | 'quantityAvailable' | 'sku'
      > & {
        image?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
        >;
        price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
        compareAtPrice?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
        >;
      }
    >;
  };
};

export type FeaturedCollectionDetailsFragment = Pick<
  StorefrontAPI.Collection,
  'id' | 'title' | 'handle'
> & {
  image?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Image, 'altText' | 'width' | 'height' | 'url'>
  >;
};

export type ProductRecommendationsQueryVariables = StorefrontAPI.Exact<{
  productId: StorefrontAPI.Scalars['ID']['input'];
  count?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type ProductRecommendationsQuery = {
  recommended?: StorefrontAPI.Maybe<
    Array<
      Pick<StorefrontAPI.Product, 'id' | 'title' | 'handle'> & {
        is_active_value?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'>
        >;
        bin_no?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        variants: {
          nodes: Array<
            Pick<
              StorefrontAPI.ProductVariant,
              'id' | 'availableForSale' | 'quantityAvailable'
            > & {
              image?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.Image,
                  'url' | 'altText' | 'width' | 'height'
                >
              >;
              price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
              compareAtPrice?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
              >;
            }
          >;
        };
      }
    >
  >;
  additional: {
    nodes: Array<
      Pick<
        StorefrontAPI.Product,
        'id' | 'title' | 'publishedAt' | 'handle' | 'vendor'
      > & {
        is_active_value?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'>
        >;
        bin_no?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        variants: {
          nodes: Array<
            Pick<
              StorefrontAPI.ProductVariant,
              'id' | 'availableForSale' | 'quantityAvailable'
            > & {
              image?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.Image,
                  'url' | 'altText' | 'width' | 'height'
                >
              >;
              price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
              compareAtPrice?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
              >;
            }
          >;
        };
      }
    >;
  };
};

export type CollectionDataFragment = Pick<
  StorefrontAPI.Collection,
  'handle' | 'title' | 'description' | 'descriptionHtml'
> & {
  image?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Image, 'id' | 'url' | 'width' | 'height' | 'altText'>
  >;
  seo: Pick<StorefrontAPI.Seo, 'description' | 'title'>;
  products: {nodes: Array<Pick<StorefrontAPI.Product, 'title' | 'handle'>>};
  type?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
  part_type_custom_title?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Metafield, 'value'>
  >;
  custom_images_for_mobile?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Metafield, 'value'> & {
      references?: StorefrontAPI.Maybe<{
        nodes: Array<
          Pick<StorefrontAPI.MediaImage, 'id' | 'mediaContentType'> & {
            image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
          }
        >;
      }>;
    }
  >;
  custom_images?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Metafield, 'value'> & {
      references?: StorefrontAPI.Maybe<{
        nodes: Array<
          Pick<StorefrontAPI.MediaImage, 'id' | 'mediaContentType'> & {
            image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
          }
        >;
      }>;
    }
  >;
  custom_images_for_mobile_nz?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Metafield, 'value'> & {
      references?: StorefrontAPI.Maybe<{
        nodes: Array<
          Pick<StorefrontAPI.MediaImage, 'id' | 'mediaContentType'> & {
            image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
          }
        >;
      }>;
    }
  >;
  custom_images_nz?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Metafield, 'value'> & {
      references?: StorefrontAPI.Maybe<{
        nodes: Array<
          Pick<StorefrontAPI.MediaImage, 'id' | 'mediaContentType'> & {
            image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
          }
        >;
      }>;
    }
  >;
  top_description?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
  below_description?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Metafield, 'value'>
  >;
  custom_logo?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Metafield, 'value'> & {
      reference?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.MediaImage, 'id' | 'alt' | 'mediaContentType'> & {
          image?: StorefrontAPI.Maybe<
            Pick<
              StorefrontAPI.Image,
              'altText' | 'height' | 'id' | 'url' | 'width'
            >
          >;
        }
      >;
    }
  >;
};

export type MoneyFragment = Pick<
  StorefrontAPI.MoneyV2,
  'currencyCode' | 'amount'
>;

export type CartLineFragment = Pick<
  StorefrontAPI.CartLine,
  'id' | 'quantity'
> & {
  attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
  cost: {
    totalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    amountPerQuantity: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
    >;
  };
  merchandise: Pick<
    StorefrontAPI.ProductVariant,
    'id' | 'availableForSale' | 'requiresShipping' | 'title'
  > & {
    compareAtPrice?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
    >;
    preorder?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
    preorderMsg?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
    price: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    image?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
    >;
    product: Pick<StorefrontAPI.Product, 'handle' | 'title' | 'id' | 'tags'> & {
      rewards?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
      upsells?: StorefrontAPI.Maybe<{
        references?: StorefrontAPI.Maybe<{
          nodes: Array<
            Pick<
              StorefrontAPI.Product,
              'availableForSale' | 'id' | 'handle' | 'title'
            > & {
              featuredImage?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.Image,
                  'id' | 'url' | 'altText' | 'width' | 'height'
                >
              >;
              options: Array<
                Pick<StorefrontAPI.ProductOption, 'name' | 'values'>
              >;
              variants: {
                nodes: Array<
                  Pick<
                    StorefrontAPI.ProductVariant,
                    'availableForSale' | 'id' | 'title'
                  > & {
                    price: Pick<
                      StorefrontAPI.MoneyV2,
                      'amount' | 'currencyCode'
                    >;
                    selectedOptions: Array<
                      Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                    >;
                    compareAtPrice?: StorefrontAPI.Maybe<
                      Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
                    >;
                  }
                >;
              };
            }
          >;
        }>;
      }>;
    };
    selectedOptions: Array<
      Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
    >;
  };
};

export type CartApiQueryFragment = Pick<
  StorefrontAPI.Cart,
  'id' | 'checkoutUrl' | 'totalQuantity' | 'note'
> & {
  buyerIdentity: Pick<
    StorefrontAPI.CartBuyerIdentity,
    'countryCode' | 'email' | 'phone'
  > & {
    customer?: StorefrontAPI.Maybe<
      Pick<
        StorefrontAPI.Customer,
        'id' | 'email' | 'firstName' | 'lastName' | 'displayName'
      >
    >;
  };
  lines: {
    nodes: Array<
      Pick<StorefrontAPI.CartLine, 'id' | 'quantity'> & {
        attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
        cost: {
          totalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
          amountPerQuantity: Pick<
            StorefrontAPI.MoneyV2,
            'currencyCode' | 'amount'
          >;
          compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
          >;
        };
        merchandise: Pick<
          StorefrontAPI.ProductVariant,
          'id' | 'availableForSale' | 'requiresShipping' | 'title'
        > & {
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
          >;
          preorder?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Metafield, 'value'>
          >;
          preorderMsg?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Metafield, 'value'>
          >;
          price: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
          image?: StorefrontAPI.Maybe<
            Pick<
              StorefrontAPI.Image,
              'id' | 'url' | 'altText' | 'width' | 'height'
            >
          >;
          product: Pick<
            StorefrontAPI.Product,
            'handle' | 'title' | 'id' | 'tags'
          > & {
            rewards?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Metafield, 'value'>
            >;
            upsells?: StorefrontAPI.Maybe<{
              references?: StorefrontAPI.Maybe<{
                nodes: Array<
                  Pick<
                    StorefrontAPI.Product,
                    'availableForSale' | 'id' | 'handle' | 'title'
                  > & {
                    featuredImage?: StorefrontAPI.Maybe<
                      Pick<
                        StorefrontAPI.Image,
                        'id' | 'url' | 'altText' | 'width' | 'height'
                      >
                    >;
                    options: Array<
                      Pick<StorefrontAPI.ProductOption, 'name' | 'values'>
                    >;
                    variants: {
                      nodes: Array<
                        Pick<
                          StorefrontAPI.ProductVariant,
                          'availableForSale' | 'id' | 'title'
                        > & {
                          price: Pick<
                            StorefrontAPI.MoneyV2,
                            'amount' | 'currencyCode'
                          >;
                          selectedOptions: Array<
                            Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                          >;
                          compareAtPrice?: StorefrontAPI.Maybe<
                            Pick<
                              StorefrontAPI.MoneyV2,
                              'amount' | 'currencyCode'
                            >
                          >;
                        }
                      >;
                    };
                  }
                >;
              }>;
            }>;
          };
          selectedOptions: Array<
            Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
          >;
        };
      }
    >;
  };
  cost: {
    subtotalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    totalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    totalDutyAmount?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
    >;
    totalTaxAmount?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
    >;
  };
  attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
  discountCodes: Array<
    Pick<StorefrontAPI.CartDiscountCode, 'code' | 'applicable'>
  >;
};

export type AnnouncementsQueryVariables = StorefrontAPI.Exact<{
  type: StorefrontAPI.Scalars['String']['input'];
  first: StorefrontAPI.Scalars['Int']['input'];
  after?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['String']['input']>;
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type AnnouncementsQuery = {
  metaobjects: {
    nodes: Array<
      Pick<StorefrontAPI.Metaobject, 'id' | 'handle' | 'updatedAt'> & {
        fields: Array<
          Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
            reference?: StorefrontAPI.Maybe<{
              image?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.Image,
                  'url' | 'altText' | 'width' | 'height'
                >
              >;
            }>;
          }
        >;
      }
    >;
    pageInfo: Pick<StorefrontAPI.PageInfo, 'hasNextPage' | 'endCursor'>;
  };
};

export type ModelNumberGuidesQueryVariables = StorefrontAPI.Exact<{
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type ModelNumberGuidesQuery = {
  metaobjects: {
    nodes: Array<{
      appliance?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.MetaobjectField, 'value'>
      >;
      slug?: StorefrontAPI.Maybe<Pick<StorefrontAPI.MetaobjectField, 'value'>>;
      summary?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.MetaobjectField, 'value'>
      >;
      body?: StorefrontAPI.Maybe<Pick<StorefrontAPI.MetaobjectField, 'value'>>;
      legacy_images?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.MetaobjectField, 'value'>
      >;
      link_label?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.MetaobjectField, 'value'>
      >;
      sort_order?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.MetaobjectField, 'value'>
      >;
      images?: StorefrontAPI.Maybe<{
        references?: StorefrontAPI.Maybe<{
          nodes: Array<{
            image?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
            >;
          }>;
        }>;
      }>;
      collection?: StorefrontAPI.Maybe<{
        reference?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Collection, 'handle' | 'title'>
        >;
      }>;
    }>;
  };
};

export type QuoteCartProductsQueryVariables = StorefrontAPI.Exact<{
  query: StorefrontAPI.Scalars['String']['input'];
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type QuoteCartProductsQuery = {
  products: {
    nodes: Array<{
      variants: {
        nodes: Array<Pick<StorefrontAPI.ProductVariant, 'id' | 'sku'>>;
      };
    }>;
  };
};

export type QuoteCartCreateMutationVariables = StorefrontAPI.Exact<{
  input: StorefrontAPI.CartInput;
}>;

export type QuoteCartCreateMutation = {
  cartCreate?: StorefrontAPI.Maybe<{
    cart?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.Cart, 'id' | 'checkoutUrl' | 'totalQuantity'> & {
        attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
        buyerIdentity: Pick<StorefrontAPI.CartBuyerIdentity, 'email'>;
      }
    >;
    userErrors: Array<Pick<StorefrontAPI.CartUserError, 'field' | 'message'>>;
  }>;
};

export type RedirectionByHandleQueryVariables = StorefrontAPI.Exact<{
  handle: StorefrontAPI.MetaobjectHandleInput;
}>;

export type RedirectionByHandleQuery = {
  metaobject?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Metaobject, 'handle'> & {
      from?: StorefrontAPI.Maybe<Pick<StorefrontAPI.MetaobjectField, 'value'>>;
      to?: StorefrontAPI.Maybe<Pick<StorefrontAPI.MetaobjectField, 'value'>>;
    }
  >;
};

export type FilteredCollectionDetailsQueryVariables = StorefrontAPI.Exact<{
  handle: StorefrontAPI.Scalars['String']['input'];
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  first?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
}>;

export type FilteredCollectionDetailsQuery = {
  collection?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.Collection,
      'id' | 'handle' | 'title' | 'description' | 'descriptionHtml'
    > & {
      seo: Pick<StorefrontAPI.Seo, 'description' | 'title'>;
      image?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'id' | 'url' | 'width' | 'height' | 'altText'>
      >;
      top_description?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'value'>
      >;
      below_description?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'value'>
      >;
      type?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
      custom_images_for_mobile?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'value'> & {
          references?: StorefrontAPI.Maybe<{
            nodes: Array<
              Pick<StorefrontAPI.MediaImage, 'id' | 'mediaContentType'> & {
                image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
              }
            >;
          }>;
        }
      >;
      custom_images?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'value'> & {
          references?: StorefrontAPI.Maybe<{
            nodes: Array<
              Pick<StorefrontAPI.MediaImage, 'id' | 'mediaContentType'> & {
                image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
              }
            >;
          }>;
        }
      >;
      custom_images_for_mobile_nz?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'value'> & {
          references?: StorefrontAPI.Maybe<{
            nodes: Array<
              Pick<StorefrontAPI.MediaImage, 'id' | 'mediaContentType'> & {
                image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
              }
            >;
          }>;
        }
      >;
      custom_images_nz?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'value'> & {
          references?: StorefrontAPI.Maybe<{
            nodes: Array<
              Pick<StorefrontAPI.MediaImage, 'id' | 'mediaContentType'> & {
                image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
              }
            >;
          }>;
        }
      >;
      products: {
        nodes: Array<
          Pick<StorefrontAPI.Product, 'id' | 'title' | 'handle'> & {
            is_active_value?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Metafield, 'value'>
            >;
            is_always_in_stock?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Metafield, 'value'>
            >;
            bin_no?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Metafield, 'value'>
            >;
            variants: {
              nodes: Array<
                Pick<
                  StorefrontAPI.ProductVariant,
                  'id' | 'availableForSale' | 'quantityAvailable' | 'sku'
                > & {
                  image?: StorefrontAPI.Maybe<
                    Pick<
                      StorefrontAPI.Image,
                      'url' | 'altText' | 'width' | 'height'
                    >
                  >;
                  price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
                  compareAtPrice?: StorefrontAPI.Maybe<
                    Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
                  >;
                }
              >;
            };
          }
        >;
      };
    }
  >;
};

export type CustomCollectionsDetailsQueryVariables = StorefrontAPI.Exact<{
  handle1?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['String']['input']>;
  handle2?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['String']['input']>;
  handle3?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['String']['input']>;
}>;

export type CustomCollectionsDetailsQuery = {
  vendor?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.Collection,
      'handle' | 'title' | 'description' | 'descriptionHtml'
    > & {
      image?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'id' | 'url' | 'width' | 'height' | 'altText'>
      >;
      seo: Pick<StorefrontAPI.Seo, 'description' | 'title'>;
      products: {
        nodes: Array<
          Pick<StorefrontAPI.Product, 'id' | 'title' | 'handle'> & {
            is_active_value?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Metafield, 'value'>
            >;
            is_always_in_stock?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Metafield, 'value'>
            >;
            bin_no?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Metafield, 'value'>
            >;
            variants: {
              nodes: Array<
                Pick<
                  StorefrontAPI.ProductVariant,
                  'id' | 'availableForSale' | 'quantityAvailable' | 'sku'
                > & {
                  image?: StorefrontAPI.Maybe<
                    Pick<
                      StorefrontAPI.Image,
                      'url' | 'altText' | 'width' | 'height'
                    >
                  >;
                  price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
                  compareAtPrice?: StorefrontAPI.Maybe<
                    Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
                  >;
                }
              >;
            };
          }
        >;
      };
      type?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
      custom_images_for_mobile?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'value'> & {
          references?: StorefrontAPI.Maybe<{
            nodes: Array<
              Pick<StorefrontAPI.MediaImage, 'id' | 'mediaContentType'> & {
                image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
              }
            >;
          }>;
        }
      >;
      custom_images?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'value'> & {
          references?: StorefrontAPI.Maybe<{
            nodes: Array<
              Pick<StorefrontAPI.MediaImage, 'id' | 'mediaContentType'> & {
                image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
              }
            >;
          }>;
        }
      >;
      custom_images_for_mobile_nz?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'value'> & {
          references?: StorefrontAPI.Maybe<{
            nodes: Array<
              Pick<StorefrontAPI.MediaImage, 'id' | 'mediaContentType'> & {
                image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
              }
            >;
          }>;
        }
      >;
      custom_images_nz?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'value'> & {
          references?: StorefrontAPI.Maybe<{
            nodes: Array<
              Pick<StorefrontAPI.MediaImage, 'id' | 'mediaContentType'> & {
                image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
              }
            >;
          }>;
        }
      >;
      top_description?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'value'>
      >;
      below_description?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'value'>
      >;
      custom_logo?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'value'> & {
          reference?: StorefrontAPI.Maybe<
            Pick<
              StorefrontAPI.MediaImage,
              'id' | 'alt' | 'mediaContentType'
            > & {
              image?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.Image,
                  'altText' | 'height' | 'id' | 'url' | 'width'
                >
              >;
            }
          >;
        }
      >;
    }
  >;
  appliance_type?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.Collection,
      'handle' | 'title' | 'description' | 'descriptionHtml'
    > & {
      seo: Pick<StorefrontAPI.Seo, 'description' | 'title'>;
      image?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'id' | 'url' | 'width' | 'height' | 'altText'>
      >;
      products: {
        nodes: Array<
          Pick<StorefrontAPI.Product, 'id' | 'title' | 'handle'> & {
            is_active_value?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Metafield, 'value'>
            >;
            is_always_in_stock?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Metafield, 'value'>
            >;
            bin_no?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Metafield, 'value'>
            >;
            variants: {
              nodes: Array<
                Pick<
                  StorefrontAPI.ProductVariant,
                  'id' | 'availableForSale' | 'quantityAvailable' | 'sku'
                > & {
                  image?: StorefrontAPI.Maybe<
                    Pick<
                      StorefrontAPI.Image,
                      'url' | 'altText' | 'width' | 'height'
                    >
                  >;
                  price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
                  compareAtPrice?: StorefrontAPI.Maybe<
                    Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
                  >;
                }
              >;
            };
          }
        >;
      };
      custom_images_for_mobile?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'value'> & {
          references?: StorefrontAPI.Maybe<{
            nodes: Array<
              Pick<StorefrontAPI.MediaImage, 'id' | 'mediaContentType'> & {
                image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
              }
            >;
          }>;
        }
      >;
      custom_images?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'value'> & {
          references?: StorefrontAPI.Maybe<{
            nodes: Array<
              Pick<StorefrontAPI.MediaImage, 'id' | 'mediaContentType'> & {
                image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
              }
            >;
          }>;
        }
      >;
      custom_images_for_mobile_nz?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'value'> & {
          references?: StorefrontAPI.Maybe<{
            nodes: Array<
              Pick<StorefrontAPI.MediaImage, 'id' | 'mediaContentType'> & {
                image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
              }
            >;
          }>;
        }
      >;
      custom_images_nz?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'value'> & {
          references?: StorefrontAPI.Maybe<{
            nodes: Array<
              Pick<StorefrontAPI.MediaImage, 'id' | 'mediaContentType'> & {
                image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
              }
            >;
          }>;
        }
      >;
      top_description?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'value'>
      >;
      below_description?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'value'>
      >;
    }
  >;
  part_type?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.Collection,
      'handle' | 'title' | 'description' | 'descriptionHtml'
    > & {
      seo: Pick<StorefrontAPI.Seo, 'description' | 'title'>;
      products: {
        nodes: Array<
          Pick<StorefrontAPI.Product, 'id' | 'title' | 'handle'> & {
            is_active_value?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Metafield, 'value'>
            >;
            is_always_in_stock?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Metafield, 'value'>
            >;
            bin_no?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Metafield, 'value'>
            >;
            variants: {
              nodes: Array<
                Pick<
                  StorefrontAPI.ProductVariant,
                  'id' | 'availableForSale' | 'quantityAvailable' | 'sku'
                > & {
                  image?: StorefrontAPI.Maybe<
                    Pick<
                      StorefrontAPI.Image,
                      'url' | 'altText' | 'width' | 'height'
                    >
                  >;
                  price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
                  compareAtPrice?: StorefrontAPI.Maybe<
                    Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
                  >;
                }
              >;
            };
          }
        >;
      };
      image?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'id' | 'url' | 'width' | 'height' | 'altText'>
      >;
      custom_images_for_mobile?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'value'> & {
          references?: StorefrontAPI.Maybe<{
            nodes: Array<
              Pick<StorefrontAPI.MediaImage, 'id' | 'mediaContentType'> & {
                image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
              }
            >;
          }>;
        }
      >;
      custom_images?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'value'> & {
          references?: StorefrontAPI.Maybe<{
            nodes: Array<
              Pick<StorefrontAPI.MediaImage, 'id' | 'mediaContentType'> & {
                image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
              }
            >;
          }>;
        }
      >;
      custom_images_for_mobile_nz?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'value'> & {
          references?: StorefrontAPI.Maybe<{
            nodes: Array<
              Pick<StorefrontAPI.MediaImage, 'id' | 'mediaContentType'> & {
                image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
              }
            >;
          }>;
        }
      >;
      custom_images_nz?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'value'> & {
          references?: StorefrontAPI.Maybe<{
            nodes: Array<
              Pick<StorefrontAPI.MediaImage, 'id' | 'mediaContentType'> & {
                image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
              }
            >;
          }>;
        }
      >;
      top_description?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'value'>
      >;
      below_description?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'value'>
      >;
    }
  >;
};

export type ProductVariantFragmentFragment = Pick<
  StorefrontAPI.ProductVariant,
  'id' | 'availableForSale' | 'sku' | 'title'
> & {
  selectedOptions: Array<Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>>;
  image?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
  >;
  price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
  compareAtPrice?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
  >;
  unitPrice?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
  >;
  product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
};

export type VariantsQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  handle: StorefrontAPI.Scalars['String']['input'];
}>;

export type VariantsQuery = {
  product?: StorefrontAPI.Maybe<{
    variants: {
      nodes: Array<
        Pick<
          StorefrontAPI.ProductVariant,
          'id' | 'availableForSale' | 'sku' | 'title'
        > & {
          selectedOptions: Array<
            Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
          >;
          image?: StorefrontAPI.Maybe<
            Pick<
              StorefrontAPI.Image,
              'id' | 'url' | 'altText' | 'width' | 'height'
            >
          >;
          price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
          unitPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
          product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
        }
      >;
    };
  }>;
};

export type RelatedProductRecommendationsQueryVariables = StorefrontAPI.Exact<{
  productId: StorefrontAPI.Scalars['ID']['input'];
  count?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type RelatedProductRecommendationsQuery = {
  recommended?: StorefrontAPI.Maybe<
    Array<
      Pick<StorefrontAPI.Product, 'id' | 'title' | 'handle'> & {
        is_active_value?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'>
        >;
        is_always_in_stock?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'>
        >;
        bin_no?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        variants: {
          nodes: Array<
            Pick<
              StorefrontAPI.ProductVariant,
              'id' | 'availableForSale' | 'quantityAvailable' | 'sku'
            > & {
              image?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.Image,
                  'url' | 'altText' | 'width' | 'height'
                >
              >;
              price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
              compareAtPrice?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
              >;
            }
          >;
        };
      }
    >
  >;
  additional: {
    nodes: Array<
      Pick<StorefrontAPI.Product, 'id' | 'title' | 'handle'> & {
        is_active_value?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'>
        >;
        is_always_in_stock?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'>
        >;
        bin_no?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        variants: {
          nodes: Array<
            Pick<
              StorefrontAPI.ProductVariant,
              'id' | 'availableForSale' | 'quantityAvailable' | 'sku'
            > & {
              image?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.Image,
                  'url' | 'altText' | 'width' | 'height'
                >
              >;
              price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
              compareAtPrice?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
              >;
            }
          >;
        };
      }
    >;
  };
};

export type ProductPricesByCountryQueryVariables = StorefrontAPI.Exact<{
  handle: StorefrontAPI.Scalars['String']['input'];
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type ProductPricesByCountryQuery = {
  product?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'id'> & {
      variants: {
        nodes: Array<
          Pick<StorefrontAPI.ProductVariant, 'availableForSale' | 'sku'> & {
            price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
          }
        >;
      };
    }
  >;
};

export type CollectionAndProductDetailsQueryVariables = StorefrontAPI.Exact<{
  handle: StorefrontAPI.Scalars['String']['input'];
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  first?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
}>;

export type CollectionAndProductDetailsQuery = {
  shop: Pick<StorefrontAPI.Shop, 'name'> & {
    primaryDomain: Pick<StorefrontAPI.Domain, 'url'>;
    specialPrice?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
    shippingPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'body' | 'handle'>
    >;
    refundPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'body' | 'handle'>
    >;
  };
  product?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.Product,
      | 'id'
      | 'title'
      | 'vendor'
      | 'handle'
      | 'productType'
      | 'tags'
      | 'descriptionHtml'
      | 'description'
    > & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<
          StorefrontAPI.Image,
          'url' | 'src' | 'altText' | 'width' | 'height'
        >
      >;
      qtyPrices?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
      seo: Pick<StorefrontAPI.Seo, 'description' | 'title'>;
      show_australia_only?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'value'>
      >;
      variants: {
        nodes: Array<
          Pick<
            StorefrontAPI.ProductVariant,
            'availableForSale' | 'id' | 'title' | 'sku' | 'quantityAvailable'
          > & {
            price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
            image?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.Image,
                'id' | 'url' | 'altText' | 'width' | 'height'
              >
            >;
            compareAtPrice?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
            >;
          }
        >;
      };
      upsells?: StorefrontAPI.Maybe<{
        references?: StorefrontAPI.Maybe<{
          nodes: Array<
            Pick<
              StorefrontAPI.Product,
              'availableForSale' | 'id' | 'handle' | 'title'
            > & {
              featuredImage?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.Image,
                  'id' | 'url' | 'altText' | 'width' | 'height'
                >
              >;
              options: Array<
                Pick<StorefrontAPI.ProductOption, 'name' | 'values'>
              >;
              bin_no?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.Metafield, 'value'>
              >;
              is_always_in_stock?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.Metafield, 'value'>
              >;
              is_active_value?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.Metafield, 'value'>
              >;
              variants: {
                nodes: Array<
                  Pick<
                    StorefrontAPI.ProductVariant,
                    'availableForSale' | 'id' | 'title' | 'sku'
                  > & {
                    price: Pick<
                      StorefrontAPI.MoneyV2,
                      'amount' | 'currencyCode'
                    >;
                    selectedOptions: Array<
                      Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                    >;
                    compareAtPrice?: StorefrontAPI.Maybe<
                      Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
                    >;
                  }
                >;
              };
            }
          >;
        }>;
      }>;
      weight?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
      depth?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
      height?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
      width?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
      installation_guide_links?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'value'>
      >;
      installation_guide?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'value'> & {
          references?: StorefrontAPI.Maybe<{
            nodes: Array<
              Pick<StorefrontAPI.MediaImage, 'id' | 'mediaContentType'> & {
                image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
              }
            >;
          }>;
        }
      >;
      is_active_value?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'value'>
      >;
      you_may_also_like?: StorefrontAPI.Maybe<{
        reference?: StorefrontAPI.Maybe<{
          products?: StorefrontAPI.Maybe<{
            references?: StorefrontAPI.Maybe<{
              nodes: Array<
                Pick<
                  StorefrontAPI.Product,
                  'availableForSale' | 'id' | 'handle' | 'title'
                > & {
                  featuredImage?: StorefrontAPI.Maybe<
                    Pick<
                      StorefrontAPI.Image,
                      'id' | 'url' | 'altText' | 'width' | 'height'
                    >
                  >;
                  options: Array<
                    Pick<StorefrontAPI.ProductOption, 'name' | 'values'>
                  >;
                  bin_no?: StorefrontAPI.Maybe<
                    Pick<StorefrontAPI.Metafield, 'value'>
                  >;
                  is_always_in_stock?: StorefrontAPI.Maybe<
                    Pick<StorefrontAPI.Metafield, 'value'>
                  >;
                  is_active_value?: StorefrontAPI.Maybe<
                    Pick<StorefrontAPI.Metafield, 'value'>
                  >;
                  variants: {
                    nodes: Array<
                      Pick<
                        StorefrontAPI.ProductVariant,
                        'availableForSale' | 'id' | 'title' | 'sku'
                      > & {
                        price: Pick<
                          StorefrontAPI.MoneyV2,
                          'amount' | 'currencyCode'
                        >;
                        selectedOptions: Array<
                          Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                        >;
                        compareAtPrice?: StorefrontAPI.Maybe<
                          Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
                        >;
                      }
                    >;
                  };
                }
              >;
            }>;
          }>;
          banners?: StorefrontAPI.Maybe<{
            references?: StorefrontAPI.Maybe<{
              nodes: Array<{
                image?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Image, 'url' | 'altText'>
                >;
              }>;
            }>;
          }>;
          bannersLinks?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MetaobjectField, 'value'>
          >;
          entryName?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MetaobjectField, 'value'>
          >;
        }>;
      }>;
      appliances?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
      parts?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
      breadcrumb?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
      delivery?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
      priceScale?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
      alternate_products?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'value'>
      >;
      alternate_products_sku?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'value'>
      >;
      replace_products?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'value'>
      >;
      replace_products_sku?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'value'>
      >;
      bin_no?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
      specification?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'value'>
      >;
      shortDescription?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'value'>
      >;
      models?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
      is_always_in_stock?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'value'>
      >;
      compatibility?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'value'>
      >;
      multi_buy_price?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'value'>
      >;
      options: Array<Pick<StorefrontAPI.ProductOption, 'name' | 'values'>>;
      media: {
        nodes: Array<
          | ({__typename: 'ExternalVideo'} & Pick<
              StorefrontAPI.ExternalVideo,
              'id' | 'embedUrl' | 'host' | 'mediaContentType' | 'alt'
            > & {
                previewImage?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Image, 'url'>
                >;
              })
          | ({__typename: 'MediaImage'} & Pick<
              StorefrontAPI.MediaImage,
              'id' | 'mediaContentType' | 'alt'
            > & {
                image?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Image, 'id' | 'url' | 'width' | 'height'>
                >;
                previewImage?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Image, 'url'>
                >;
              })
          | ({__typename: 'Model3d'} & Pick<
              StorefrontAPI.Model3d,
              'id' | 'mediaContentType' | 'alt'
            > & {
                sources: Array<
                  Pick<StorefrontAPI.Model3dSource, 'mimeType' | 'url'>
                >;
                previewImage?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Image, 'url'>
                >;
              })
          | ({__typename: 'Video'} & Pick<
              StorefrontAPI.Video,
              'id' | 'mediaContentType' | 'alt'
            > & {
                sources: Array<
                  Pick<StorefrontAPI.VideoSource, 'mimeType' | 'url'>
                >;
                previewImage?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Image, 'url'>
                >;
              })
        >;
      };
    }
  >;
  collection?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.Collection,
      'id' | 'handle' | 'title' | 'description' | 'descriptionHtml'
    > & {
      seo: Pick<StorefrontAPI.Seo, 'description' | 'title'>;
      image?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'id' | 'url' | 'width' | 'height' | 'altText'>
      >;
      top_description?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'value'>
      >;
      below_description?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'value'>
      >;
      custom_images_for_mobile?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'value'> & {
          references?: StorefrontAPI.Maybe<{
            nodes: Array<
              Pick<StorefrontAPI.MediaImage, 'id' | 'mediaContentType'> & {
                image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
              }
            >;
          }>;
        }
      >;
      custom_images?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'value'> & {
          references?: StorefrontAPI.Maybe<{
            nodes: Array<
              Pick<StorefrontAPI.MediaImage, 'id' | 'mediaContentType'> & {
                image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
              }
            >;
          }>;
        }
      >;
      custom_images_for_mobile_nz?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'value'> & {
          references?: StorefrontAPI.Maybe<{
            nodes: Array<
              Pick<StorefrontAPI.MediaImage, 'id' | 'mediaContentType'> & {
                image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
              }
            >;
          }>;
        }
      >;
      custom_images_nz?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'value'> & {
          references?: StorefrontAPI.Maybe<{
            nodes: Array<
              Pick<StorefrontAPI.MediaImage, 'id' | 'mediaContentType'> & {
                image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
              }
            >;
          }>;
        }
      >;
      type?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
      products: {
        nodes: Array<
          Pick<StorefrontAPI.Product, 'id' | 'title' | 'handle'> & {
            is_active_value?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Metafield, 'value'>
            >;
            is_always_in_stock?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Metafield, 'value'>
            >;
            bin_no?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Metafield, 'value'>
            >;
            variants: {
              nodes: Array<
                Pick<
                  StorefrontAPI.ProductVariant,
                  'id' | 'availableForSale' | 'quantityAvailable' | 'sku'
                > & {
                  image?: StorefrontAPI.Maybe<
                    Pick<
                      StorefrontAPI.Image,
                      'url' | 'altText' | 'width' | 'height'
                    >
                  >;
                  price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
                  compareAtPrice?: StorefrontAPI.Maybe<
                    Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
                  >;
                }
              >;
            };
          }
        >;
      };
    }
  >;
};

export type PageByHandleDetailsQueryVariables = StorefrontAPI.Exact<{
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  handle: StorefrontAPI.Scalars['String']['input'];
}>;

export type PageByHandleDetailsQuery = {
  page?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Page, 'id' | 'title' | 'handle' | 'body'> & {
      seo?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Seo, 'description' | 'title'>
      >;
    }
  >;
};

export type SearchArticlesQueryVariables = StorefrontAPI.Exact<{
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  blogQuery: StorefrontAPI.Scalars['String']['input'];
}>;

export type SearchArticlesQuery = {
  articles: {
    nodes: Array<
      Pick<
        StorefrontAPI.Article,
        'handle' | 'id' | 'content' | 'excerpt' | 'publishedAt' | 'title'
      > & {
        author?: StorefrontAPI.Maybe<Pick<StorefrontAPI.ArticleAuthor, 'name'>>;
        image?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'altText' | 'url' | 'width' | 'height'
          >
        >;
        desktop_image?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'> & {
            reference?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.MediaImage,
                'id' | 'alt' | 'mediaContentType'
              > & {
                image?: StorefrontAPI.Maybe<
                  Pick<
                    StorefrontAPI.Image,
                    'altText' | 'height' | 'id' | 'url' | 'width'
                  >
                >;
              }
            >;
          }
        >;
        mobile_image?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'> & {
            reference?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.MediaImage,
                'id' | 'alt' | 'mediaContentType'
              > & {
                image?: StorefrontAPI.Maybe<
                  Pick<
                    StorefrontAPI.Image,
                    'altText' | 'height' | 'id' | 'url' | 'width'
                  >
                >;
              }
            >;
          }
        >;
        blog: Pick<StorefrontAPI.Blog, 'id' | 'title' | 'handle'> & {
          seo?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Seo, 'description' | 'title'>
          >;
        };
      }
    >;
  };
  blogs: {
    nodes: Array<
      Pick<StorefrontAPI.Blog, 'title' | 'handle'> & {
        articles: {
          edges: Array<{
            node: Pick<
              StorefrontAPI.Article,
              'handle' | 'id' | 'content' | 'excerpt' | 'publishedAt' | 'title'
            > & {
              author?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.ArticleAuthor, 'name'>
              >;
              image?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.Image,
                  'id' | 'altText' | 'url' | 'width' | 'height'
                >
              >;
              desktop_image?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.Metafield, 'value'> & {
                  reference?: StorefrontAPI.Maybe<
                    Pick<
                      StorefrontAPI.MediaImage,
                      'id' | 'alt' | 'mediaContentType'
                    > & {
                      image?: StorefrontAPI.Maybe<
                        Pick<
                          StorefrontAPI.Image,
                          'altText' | 'height' | 'id' | 'url' | 'width'
                        >
                      >;
                    }
                  >;
                }
              >;
              mobile_image?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.Metafield, 'value'> & {
                  reference?: StorefrontAPI.Maybe<
                    Pick<
                      StorefrontAPI.MediaImage,
                      'id' | 'alt' | 'mediaContentType'
                    > & {
                      image?: StorefrontAPI.Maybe<
                        Pick<
                          StorefrontAPI.Image,
                          'altText' | 'height' | 'id' | 'url' | 'width'
                        >
                      >;
                    }
                  >;
                }
              >;
              blog: Pick<StorefrontAPI.Blog, 'id' | 'title' | 'handle'> & {
                seo?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Seo, 'description' | 'title'>
                >;
              };
            };
          }>;
        };
      }
    >;
  };
};

export type SearchArticleFragment = Pick<
  StorefrontAPI.Article,
  'handle' | 'id' | 'content' | 'excerpt' | 'publishedAt' | 'title'
> & {
  author?: StorefrontAPI.Maybe<Pick<StorefrontAPI.ArticleAuthor, 'name'>>;
  image?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Image, 'id' | 'altText' | 'url' | 'width' | 'height'>
  >;
  desktop_image?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Metafield, 'value'> & {
      reference?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.MediaImage, 'id' | 'alt' | 'mediaContentType'> & {
          image?: StorefrontAPI.Maybe<
            Pick<
              StorefrontAPI.Image,
              'altText' | 'height' | 'id' | 'url' | 'width'
            >
          >;
        }
      >;
    }
  >;
  mobile_image?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Metafield, 'value'> & {
      reference?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.MediaImage, 'id' | 'alt' | 'mediaContentType'> & {
          image?: StorefrontAPI.Maybe<
            Pick<
              StorefrontAPI.Image,
              'altText' | 'height' | 'id' | 'url' | 'width'
            >
          >;
        }
      >;
    }
  >;
  blog: Pick<StorefrontAPI.Blog, 'id' | 'title' | 'handle'> & {
    seo?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Seo, 'description' | 'title'>>;
  };
};

export type BlogsWithArticlesQueryVariables = StorefrontAPI.Exact<{
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type BlogsWithArticlesQuery = {
  articles: {
    nodes: Array<
      Pick<
        StorefrontAPI.Article,
        'handle' | 'id' | 'content' | 'excerpt' | 'publishedAt' | 'title'
      > & {
        author?: StorefrontAPI.Maybe<Pick<StorefrontAPI.ArticleAuthor, 'name'>>;
        image?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'altText' | 'url' | 'width' | 'height'
          >
        >;
        seo?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Seo, 'description' | 'title'>
        >;
        desktop_image?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'> & {
            reference?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.MediaImage,
                'id' | 'alt' | 'mediaContentType'
              > & {
                image?: StorefrontAPI.Maybe<
                  Pick<
                    StorefrontAPI.Image,
                    'altText' | 'height' | 'id' | 'url' | 'width'
                  >
                >;
              }
            >;
          }
        >;
        mobile_image?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'> & {
            reference?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.MediaImage,
                'id' | 'alt' | 'mediaContentType'
              > & {
                image?: StorefrontAPI.Maybe<
                  Pick<
                    StorefrontAPI.Image,
                    'altText' | 'height' | 'id' | 'url' | 'width'
                  >
                >;
              }
            >;
          }
        >;
        blog: Pick<StorefrontAPI.Blog, 'id' | 'title' | 'handle'> & {
          seo?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Seo, 'description' | 'title'>
          >;
        };
      }
    >;
  };
  blogs: {
    nodes: Array<
      Pick<StorefrontAPI.Blog, 'title' | 'handle'> & {
        articles: {
          edges: Array<{
            node: Pick<
              StorefrontAPI.Article,
              'handle' | 'id' | 'content' | 'excerpt' | 'publishedAt' | 'title'
            > & {
              author?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.ArticleAuthor, 'name'>
              >;
              image?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.Image,
                  'id' | 'altText' | 'url' | 'width' | 'height'
                >
              >;
              seo?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.Seo, 'description' | 'title'>
              >;
              desktop_image?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.Metafield, 'value'> & {
                  reference?: StorefrontAPI.Maybe<
                    Pick<
                      StorefrontAPI.MediaImage,
                      'id' | 'alt' | 'mediaContentType'
                    > & {
                      image?: StorefrontAPI.Maybe<
                        Pick<
                          StorefrontAPI.Image,
                          'altText' | 'height' | 'id' | 'url' | 'width'
                        >
                      >;
                    }
                  >;
                }
              >;
              mobile_image?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.Metafield, 'value'> & {
                  reference?: StorefrontAPI.Maybe<
                    Pick<
                      StorefrontAPI.MediaImage,
                      'id' | 'alt' | 'mediaContentType'
                    > & {
                      image?: StorefrontAPI.Maybe<
                        Pick<
                          StorefrontAPI.Image,
                          'altText' | 'height' | 'id' | 'url' | 'width'
                        >
                      >;
                    }
                  >;
                }
              >;
              blog: Pick<StorefrontAPI.Blog, 'id' | 'title' | 'handle'> & {
                seo?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Seo, 'description' | 'title'>
                >;
              };
            };
          }>;
        };
      }
    >;
  };
};

export type BlogsArticleFragment = Pick<
  StorefrontAPI.Article,
  'handle' | 'id' | 'content' | 'excerpt' | 'publishedAt' | 'title'
> & {
  author?: StorefrontAPI.Maybe<Pick<StorefrontAPI.ArticleAuthor, 'name'>>;
  image?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Image, 'id' | 'altText' | 'url' | 'width' | 'height'>
  >;
  seo?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Seo, 'description' | 'title'>>;
  desktop_image?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Metafield, 'value'> & {
      reference?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.MediaImage, 'id' | 'alt' | 'mediaContentType'> & {
          image?: StorefrontAPI.Maybe<
            Pick<
              StorefrontAPI.Image,
              'altText' | 'height' | 'id' | 'url' | 'width'
            >
          >;
        }
      >;
    }
  >;
  mobile_image?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Metafield, 'value'> & {
      reference?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.MediaImage, 'id' | 'alt' | 'mediaContentType'> & {
          image?: StorefrontAPI.Maybe<
            Pick<
              StorefrontAPI.Image,
              'altText' | 'height' | 'id' | 'url' | 'width'
            >
          >;
        }
      >;
    }
  >;
  blog: Pick<StorefrontAPI.Blog, 'id' | 'title' | 'handle'> & {
    seo?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Seo, 'description' | 'title'>>;
  };
};

export type LayoutQueryVariables = StorefrontAPI.Exact<{
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type LayoutQuery = {
  shop: Pick<StorefrontAPI.Shop, 'id' | 'name' | 'description'> & {
    primaryDomain: Pick<StorefrontAPI.Domain, 'url'>;
    specialPrice?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
    brand?: StorefrontAPI.Maybe<{
      logo?: StorefrontAPI.Maybe<{
        image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
      }>;
    }>;
  };
  headerMenu?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Menu, 'id'> & {
      items: Array<
        Pick<
          StorefrontAPI.MenuItem,
          'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
        > & {
          items: Array<
            Pick<
              StorefrontAPI.MenuItem,
              'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
            > & {
              items: Array<
                Pick<
                  StorefrontAPI.MenuItem,
                  'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
                >
              >;
            }
          >;
        }
      >;
    }
  >;
  siteNav?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Menu, 'id'> & {
      items: Array<
        Pick<
          StorefrontAPI.MenuItem,
          'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
        > & {
          items: Array<
            Pick<
              StorefrontAPI.MenuItem,
              'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
            > & {
              items: Array<
                Pick<
                  StorefrontAPI.MenuItem,
                  'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
                >
              >;
            }
          >;
        }
      >;
    }
  >;
  footerMenu?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Menu, 'id'> & {
      items: Array<
        Pick<
          StorefrontAPI.MenuItem,
          'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
        > & {
          items: Array<
            Pick<
              StorefrontAPI.MenuItem,
              'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
            > & {
              items: Array<
                Pick<
                  StorefrontAPI.MenuItem,
                  'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
                >
              >;
            }
          >;
        }
      >;
    }
  >;
};

export type ShopFragment = Pick<
  StorefrontAPI.Shop,
  'id' | 'name' | 'description'
> & {
  primaryDomain: Pick<StorefrontAPI.Domain, 'url'>;
  specialPrice?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
  brand?: StorefrontAPI.Maybe<{
    logo?: StorefrontAPI.Maybe<{
      image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
    }>;
  }>;
};

export type MenuItemFragment = Pick<
  StorefrontAPI.MenuItem,
  'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
> & {
  items: Array<
    Pick<
      StorefrontAPI.MenuItem,
      'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
    > & {
      items: Array<
        Pick<
          StorefrontAPI.MenuItem,
          'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
        >
      >;
    }
  >;
};

export type MenuFragment = Pick<StorefrontAPI.Menu, 'id'> & {
  items: Array<
    Pick<
      StorefrontAPI.MenuItem,
      'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
    > & {
      items: Array<
        Pick<
          StorefrontAPI.MenuItem,
          'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
        > & {
          items: Array<
            Pick<
              StorefrontAPI.MenuItem,
              'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
            >
          >;
        }
      >;
    }
  >;
};

export type CustomerQueryVariables = StorefrontAPI.Exact<{
  customerAccessToken: StorefrontAPI.Scalars['String']['input'];
}>;

export type CustomerQuery = {
  customer?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Customer, 'firstName' | 'email' | 'id'> & {
      scale?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
    }
  >;
};

export type ArticleLookupQueryVariables = StorefrontAPI.Exact<{
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  articleQuery: StorefrontAPI.Scalars['String']['input'];
}>;

export type ArticleLookupQuery = {
  articles: {
    nodes: Array<
      Pick<
        StorefrontAPI.Article,
        | 'contentHtml'
        | 'handle'
        | 'id'
        | 'content'
        | 'excerpt'
        | 'publishedAt'
        | 'title'
      > & {
        author?: StorefrontAPI.Maybe<Pick<StorefrontAPI.ArticleAuthor, 'name'>>;
        image?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'altText' | 'url' | 'width' | 'height'
          >
        >;
        seo?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Seo, 'description' | 'title'>
        >;
        desktop_image?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'> & {
            reference?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.MediaImage,
                'id' | 'alt' | 'mediaContentType'
              > & {
                image?: StorefrontAPI.Maybe<
                  Pick<
                    StorefrontAPI.Image,
                    'altText' | 'height' | 'id' | 'url' | 'width'
                  >
                >;
              }
            >;
          }
        >;
        mobile_image?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'> & {
            reference?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.MediaImage,
                'id' | 'alt' | 'mediaContentType'
              > & {
                image?: StorefrontAPI.Maybe<
                  Pick<
                    StorefrontAPI.Image,
                    'altText' | 'height' | 'id' | 'url' | 'width'
                  >
                >;
              }
            >;
          }
        >;
        blog: Pick<StorefrontAPI.Blog, 'id' | 'title' | 'handle'> & {
          seo?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Seo, 'description' | 'title'>
          >;
        };
      }
    >;
  };
};

export type ArticleSidebarQueryVariables = StorefrontAPI.Exact<{
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type ArticleSidebarQuery = {
  articles: {
    nodes: Array<
      Pick<
        StorefrontAPI.Article,
        'handle' | 'id' | 'content' | 'excerpt' | 'publishedAt' | 'title'
      > & {
        author?: StorefrontAPI.Maybe<Pick<StorefrontAPI.ArticleAuthor, 'name'>>;
        image?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'altText' | 'url' | 'width' | 'height'
          >
        >;
        seo?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Seo, 'description' | 'title'>
        >;
        blog: Pick<StorefrontAPI.Blog, 'id' | 'title' | 'handle'> & {
          seo?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Seo, 'description' | 'title'>
          >;
        };
      }
    >;
  };
  blogs: {nodes: Array<Pick<StorefrontAPI.Blog, 'title' | 'handle'>>};
};

export type GetShopPrimaryDomainQueryVariables = StorefrontAPI.Exact<{
  [key: string]: never;
}>;

export type GetShopPrimaryDomainQuery = {
  shop: {primaryDomain: Pick<StorefrontAPI.Domain, 'url'>};
};

export type CollectionContentFragment = Pick<
  StorefrontAPI.Collection,
  'id' | 'handle' | 'title' | 'descriptionHtml'
> & {
  heading?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
  byline?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
  cta?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
  spread?: StorefrontAPI.Maybe<{
    reference?: StorefrontAPI.Maybe<
      | ({__typename: 'MediaImage'} & Pick<
          StorefrontAPI.MediaImage,
          'id' | 'mediaContentType' | 'alt'
        > & {
            image?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'id' | 'url' | 'width' | 'height'>
            >;
            previewImage?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url'>
            >;
          })
      | ({__typename: 'Model3d'} & Pick<
          StorefrontAPI.Model3d,
          'id' | 'mediaContentType' | 'alt'
        > & {
            sources: Array<
              Pick<StorefrontAPI.Model3dSource, 'mimeType' | 'url'>
            >;
            previewImage?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url'>
            >;
          })
      | ({__typename: 'Video'} & Pick<
          StorefrontAPI.Video,
          'id' | 'mediaContentType' | 'alt'
        > & {
            sources: Array<Pick<StorefrontAPI.VideoSource, 'mimeType' | 'url'>>;
            previewImage?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url'>
            >;
          })
    >;
  }>;
  spreadSecondary?: StorefrontAPI.Maybe<{
    reference?: StorefrontAPI.Maybe<
      | ({__typename: 'MediaImage'} & Pick<
          StorefrontAPI.MediaImage,
          'id' | 'mediaContentType' | 'alt'
        > & {
            image?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'id' | 'url' | 'width' | 'height'>
            >;
            previewImage?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url'>
            >;
          })
      | ({__typename: 'Model3d'} & Pick<
          StorefrontAPI.Model3d,
          'id' | 'mediaContentType' | 'alt'
        > & {
            sources: Array<
              Pick<StorefrontAPI.Model3dSource, 'mimeType' | 'url'>
            >;
            previewImage?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url'>
            >;
          })
      | ({__typename: 'Video'} & Pick<
          StorefrontAPI.Video,
          'id' | 'mediaContentType' | 'alt'
        > & {
            sources: Array<Pick<StorefrontAPI.VideoSource, 'mimeType' | 'url'>>;
            previewImage?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url'>
            >;
          })
    >;
  }>;
};

export type SeoCollectionContentQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type SeoCollectionContentQuery = {
  shop: Pick<StorefrontAPI.Shop, 'name' | 'description'>;
};

export type HeroCollectionContentQueryVariables = StorefrontAPI.Exact<{
  handle?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['String']['input']>;
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type HeroCollectionContentQuery = {
  hero?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.Collection,
      'id' | 'handle' | 'title' | 'descriptionHtml'
    > & {
      heading?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
      byline?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
      cta?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
      spread?: StorefrontAPI.Maybe<{
        reference?: StorefrontAPI.Maybe<
          | ({__typename: 'MediaImage'} & Pick<
              StorefrontAPI.MediaImage,
              'id' | 'mediaContentType' | 'alt'
            > & {
                image?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Image, 'id' | 'url' | 'width' | 'height'>
                >;
                previewImage?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Image, 'url'>
                >;
              })
          | ({__typename: 'Model3d'} & Pick<
              StorefrontAPI.Model3d,
              'id' | 'mediaContentType' | 'alt'
            > & {
                sources: Array<
                  Pick<StorefrontAPI.Model3dSource, 'mimeType' | 'url'>
                >;
                previewImage?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Image, 'url'>
                >;
              })
          | ({__typename: 'Video'} & Pick<
              StorefrontAPI.Video,
              'id' | 'mediaContentType' | 'alt'
            > & {
                sources: Array<
                  Pick<StorefrontAPI.VideoSource, 'mimeType' | 'url'>
                >;
                previewImage?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Image, 'url'>
                >;
              })
        >;
      }>;
      spreadSecondary?: StorefrontAPI.Maybe<{
        reference?: StorefrontAPI.Maybe<
          | ({__typename: 'MediaImage'} & Pick<
              StorefrontAPI.MediaImage,
              'id' | 'mediaContentType' | 'alt'
            > & {
                image?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Image, 'id' | 'url' | 'width' | 'height'>
                >;
                previewImage?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Image, 'url'>
                >;
              })
          | ({__typename: 'Model3d'} & Pick<
              StorefrontAPI.Model3d,
              'id' | 'mediaContentType' | 'alt'
            > & {
                sources: Array<
                  Pick<StorefrontAPI.Model3dSource, 'mimeType' | 'url'>
                >;
                previewImage?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Image, 'url'>
                >;
              })
          | ({__typename: 'Video'} & Pick<
              StorefrontAPI.Video,
              'id' | 'mediaContentType' | 'alt'
            > & {
                sources: Array<
                  Pick<StorefrontAPI.VideoSource, 'mimeType' | 'url'>
                >;
                previewImage?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Image, 'url'>
                >;
              })
        >;
      }>;
    }
  >;
};

export type HomepageFeaturedProductsQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type HomepageFeaturedProductsQuery = {
  products: {
    nodes: Array<
      Pick<StorefrontAPI.Product, 'id' | 'title' | 'handle'> & {
        is_active_value?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'>
        >;
        is_always_in_stock?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'>
        >;
        bin_no?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        variants: {
          nodes: Array<
            Pick<
              StorefrontAPI.ProductVariant,
              'id' | 'availableForSale' | 'quantityAvailable' | 'sku'
            > & {
              image?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.Image,
                  'url' | 'altText' | 'width' | 'height'
                >
              >;
              price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
              compareAtPrice?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
              >;
            }
          >;
        };
      }
    >;
  };
};

export type HomepageFeaturedCollectionsQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type HomepageFeaturedCollectionsQuery = {
  collections: {
    nodes: Array<
      Pick<StorefrontAPI.Collection, 'id' | 'title' | 'handle'> & {
        image?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Image, 'altText' | 'width' | 'height' | 'url'>
        >;
      }
    >;
  };
};

export type CustomerActivateMutationVariables = StorefrontAPI.Exact<{
  id: StorefrontAPI.Scalars['ID']['input'];
  input: StorefrontAPI.CustomerActivateInput;
}>;

export type CustomerActivateMutation = {
  customerActivate?: StorefrontAPI.Maybe<{
    customerAccessToken?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.CustomerAccessToken, 'accessToken' | 'expiresAt'>
    >;
    customerUserErrors: Array<
      Pick<StorefrontAPI.CustomerUserError, 'code' | 'field' | 'message'>
    >;
  }>;
};

export type CustomerAddressUpdateMutationVariables = StorefrontAPI.Exact<{
  address: StorefrontAPI.MailingAddressInput;
  customerAccessToken: StorefrontAPI.Scalars['String']['input'];
  id: StorefrontAPI.Scalars['ID']['input'];
}>;

export type CustomerAddressUpdateMutation = {
  customerAddressUpdate?: StorefrontAPI.Maybe<{
    customerUserErrors: Array<
      Pick<StorefrontAPI.CustomerUserError, 'code' | 'field' | 'message'>
    >;
  }>;
};

export type CustomerAddressDeleteMutationVariables = StorefrontAPI.Exact<{
  customerAccessToken: StorefrontAPI.Scalars['String']['input'];
  id: StorefrontAPI.Scalars['ID']['input'];
}>;

export type CustomerAddressDeleteMutation = {
  customerAddressDelete?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.CustomerAddressDeletePayload,
      'deletedCustomerAddressId'
    > & {
      customerUserErrors: Array<
        Pick<StorefrontAPI.CustomerUserError, 'code' | 'field' | 'message'>
      >;
    }
  >;
};

export type CustomerDefaultAddressUpdateMutationVariables =
  StorefrontAPI.Exact<{
    addressId: StorefrontAPI.Scalars['ID']['input'];
    customerAccessToken: StorefrontAPI.Scalars['String']['input'];
  }>;

export type CustomerDefaultAddressUpdateMutation = {
  customerDefaultAddressUpdate?: StorefrontAPI.Maybe<{
    customerUserErrors: Array<
      Pick<StorefrontAPI.CustomerUserError, 'code' | 'field' | 'message'>
    >;
  }>;
};

export type CustomerAddressCreateMutationVariables = StorefrontAPI.Exact<{
  address: StorefrontAPI.MailingAddressInput;
  customerAccessToken: StorefrontAPI.Scalars['String']['input'];
}>;

export type CustomerAddressCreateMutation = {
  customerAddressCreate?: StorefrontAPI.Maybe<{
    customerAddress?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MailingAddress, 'id'>
    >;
    customerUserErrors: Array<
      Pick<StorefrontAPI.CustomerUserError, 'code' | 'field' | 'message'>
    >;
  }>;
};

export type AccountEditCustomerUpdateMutationVariables = StorefrontAPI.Exact<{
  customerAccessToken: StorefrontAPI.Scalars['String']['input'];
  customer: StorefrontAPI.CustomerUpdateInput;
}>;

export type AccountEditCustomerUpdateMutation = {
  customerUpdate?: StorefrontAPI.Maybe<{
    customerUserErrors: Array<
      Pick<StorefrontAPI.CustomerUserError, 'code' | 'field' | 'message'>
    >;
  }>;
};

export type CustomerDetailsQueryVariables = StorefrontAPI.Exact<{
  customerAccessToken: StorefrontAPI.Scalars['String']['input'];
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type CustomerDetailsQuery = {
  customer?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.Customer,
      'firstName' | 'lastName' | 'phone' | 'email' | 'acceptsMarketing'
    > & {
      defaultAddress?: StorefrontAPI.Maybe<
        Pick<
          StorefrontAPI.MailingAddress,
          | 'id'
          | 'formatted'
          | 'firstName'
          | 'lastName'
          | 'company'
          | 'address1'
          | 'address2'
          | 'country'
          | 'province'
          | 'city'
          | 'zip'
          | 'phone'
        >
      >;
      addresses: {
        edges: Array<{
          node: Pick<
            StorefrontAPI.MailingAddress,
            | 'id'
            | 'formatted'
            | 'firstName'
            | 'lastName'
            | 'company'
            | 'address1'
            | 'address2'
            | 'country'
            | 'province'
            | 'city'
            | 'zip'
            | 'phone'
          >;
        }>;
      };
      orders: {
        edges: Array<{
          node: Pick<
            StorefrontAPI.Order,
            | 'id'
            | 'orderNumber'
            | 'processedAt'
            | 'financialStatus'
            | 'fulfillmentStatus'
          > & {
            currentTotalPrice: Pick<
              StorefrontAPI.MoneyV2,
              'amount' | 'currencyCode'
            >;
            fulfillmentData?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Metafield, 'value'>
            >;
            lineItems: {
              edges: Array<{
                node: Pick<StorefrontAPI.OrderLineItem, 'title'> & {
                  variant?: StorefrontAPI.Maybe<{
                    image?: StorefrontAPI.Maybe<
                      Pick<
                        StorefrontAPI.Image,
                        'url' | 'altText' | 'height' | 'width'
                      >
                    >;
                  }>;
                };
              }>;
            };
          };
        }>;
      };
    }
  >;
};

export type AddressPartialFragment = Pick<
  StorefrontAPI.MailingAddress,
  | 'id'
  | 'formatted'
  | 'firstName'
  | 'lastName'
  | 'company'
  | 'address1'
  | 'address2'
  | 'country'
  | 'province'
  | 'city'
  | 'zip'
  | 'phone'
>;

export type CustomerDetailsFragment = Pick<
  StorefrontAPI.Customer,
  'firstName' | 'lastName' | 'phone' | 'email' | 'acceptsMarketing'
> & {
  defaultAddress?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.MailingAddress,
      | 'id'
      | 'formatted'
      | 'firstName'
      | 'lastName'
      | 'company'
      | 'address1'
      | 'address2'
      | 'country'
      | 'province'
      | 'city'
      | 'zip'
      | 'phone'
    >
  >;
  addresses: {
    edges: Array<{
      node: Pick<
        StorefrontAPI.MailingAddress,
        | 'id'
        | 'formatted'
        | 'firstName'
        | 'lastName'
        | 'company'
        | 'address1'
        | 'address2'
        | 'country'
        | 'province'
        | 'city'
        | 'zip'
        | 'phone'
      >;
    }>;
  };
  orders: {
    edges: Array<{
      node: Pick<
        StorefrontAPI.Order,
        | 'id'
        | 'orderNumber'
        | 'processedAt'
        | 'financialStatus'
        | 'fulfillmentStatus'
      > & {
        currentTotalPrice: Pick<
          StorefrontAPI.MoneyV2,
          'amount' | 'currencyCode'
        >;
        fulfillmentData?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'>
        >;
        lineItems: {
          edges: Array<{
            node: Pick<StorefrontAPI.OrderLineItem, 'title'> & {
              variant?: StorefrontAPI.Maybe<{
                image?: StorefrontAPI.Maybe<
                  Pick<
                    StorefrontAPI.Image,
                    'url' | 'altText' | 'height' | 'width'
                  >
                >;
              }>;
            };
          }>;
        };
      };
    }>;
  };
};

export type CustomerUpdateMutationVariables = StorefrontAPI.Exact<{
  customerAccessToken: StorefrontAPI.Scalars['String']['input'];
  customer: StorefrontAPI.CustomerUpdateInput;
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type CustomerUpdateMutation = {
  customerUpdate?: StorefrontAPI.Maybe<{
    customer?: StorefrontAPI.Maybe<
      Pick<
        StorefrontAPI.Customer,
        'acceptsMarketing' | 'email' | 'firstName' | 'id' | 'lastName' | 'phone'
      >
    >;
    customerAccessToken?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.CustomerAccessToken, 'accessToken' | 'expiresAt'>
    >;
    customerUserErrors: Array<
      Pick<StorefrontAPI.CustomerUserError, 'code' | 'field' | 'message'>
    >;
  }>;
};

export type OrderMoneyFragment = Pick<
  StorefrontAPI.MoneyV2,
  'amount' | 'currencyCode'
>;

export type AddressFullFragment = Pick<
  StorefrontAPI.MailingAddress,
  | 'address1'
  | 'address2'
  | 'city'
  | 'company'
  | 'country'
  | 'countryCodeV2'
  | 'firstName'
  | 'formatted'
  | 'id'
  | 'lastName'
  | 'name'
  | 'phone'
  | 'province'
  | 'provinceCode'
  | 'zip'
>;

export type DiscountApplicationFragment = {
  value:
    | ({__typename: 'MoneyV2'} & Pick<
        StorefrontAPI.MoneyV2,
        'amount' | 'currencyCode'
      >)
    | ({__typename: 'PricingPercentageValue'} & Pick<
        StorefrontAPI.PricingPercentageValue,
        'percentage'
      >);
};

export type ImageFragment = Pick<
  StorefrontAPI.Image,
  'altText' | 'height' | 'id' | 'width'
> & {src: StorefrontAPI.Image['url']};

export type ProductVariantFragment = Pick<
  StorefrontAPI.ProductVariant,
  'id' | 'sku' | 'title'
> & {
  image?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Image, 'altText' | 'height' | 'id' | 'width'> & {
      src: StorefrontAPI.Image['url'];
    }
  >;
  price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
  product: Pick<StorefrontAPI.Product, 'handle'>;
};

export type LineItemFullFragment = Pick<
  StorefrontAPI.OrderLineItem,
  'title' | 'quantity'
> & {
  discountAllocations: Array<{
    allocatedAmount: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
    discountApplication: {
      value:
        | ({__typename: 'MoneyV2'} & Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >)
        | ({__typename: 'PricingPercentageValue'} & Pick<
            StorefrontAPI.PricingPercentageValue,
            'percentage'
          >);
    };
  }>;
  originalTotalPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
  discountedTotalPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
  variant?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.ProductVariant, 'id' | 'sku' | 'title'> & {
      image?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'altText' | 'height' | 'id' | 'width'> & {
          src: StorefrontAPI.Image['url'];
        }
      >;
      price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      product: Pick<StorefrontAPI.Product, 'handle'>;
    }
  >;
};

export type CustomerOrderQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  orderId: StorefrontAPI.Scalars['ID']['input'];
}>;

export type CustomerOrderQuery = {
  node?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.Order,
      | 'id'
      | 'name'
      | 'orderNumber'
      | 'processedAt'
      | 'financialStatus'
      | 'fulfillmentStatus'
    > & {
      fulfillmentData?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'value'>
      >;
      totalTaxV2?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
      >;
      totalPriceV2: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      totalShippingPrice: Pick<
        StorefrontAPI.MoneyV2,
        'amount' | 'currencyCode'
      >;
      totalShippingPriceV2: Pick<
        StorefrontAPI.MoneyV2,
        'amount' | 'currencyCode'
      >;
      subtotalPriceV2?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
      >;
      shippingAddress?: StorefrontAPI.Maybe<
        Pick<
          StorefrontAPI.MailingAddress,
          | 'address1'
          | 'address2'
          | 'city'
          | 'company'
          | 'country'
          | 'countryCodeV2'
          | 'firstName'
          | 'formatted'
          | 'id'
          | 'lastName'
          | 'name'
          | 'phone'
          | 'province'
          | 'provinceCode'
          | 'zip'
        >
      >;
      discountApplications: {
        nodes: Array<{
          value:
            | ({__typename: 'MoneyV2'} & Pick<
                StorefrontAPI.MoneyV2,
                'amount' | 'currencyCode'
              >)
            | ({__typename: 'PricingPercentageValue'} & Pick<
                StorefrontAPI.PricingPercentageValue,
                'percentage'
              >);
        }>;
      };
      lineItems: {
        nodes: Array<
          Pick<StorefrontAPI.OrderLineItem, 'title' | 'quantity'> & {
            discountAllocations: Array<{
              allocatedAmount: Pick<
                StorefrontAPI.MoneyV2,
                'amount' | 'currencyCode'
              >;
              discountApplication: {
                value:
                  | ({__typename: 'MoneyV2'} & Pick<
                      StorefrontAPI.MoneyV2,
                      'amount' | 'currencyCode'
                    >)
                  | ({__typename: 'PricingPercentageValue'} & Pick<
                      StorefrontAPI.PricingPercentageValue,
                      'percentage'
                    >);
              };
            }>;
            originalTotalPrice: Pick<
              StorefrontAPI.MoneyV2,
              'amount' | 'currencyCode'
            >;
            discountedTotalPrice: Pick<
              StorefrontAPI.MoneyV2,
              'amount' | 'currencyCode'
            >;
            variant?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.ProductVariant, 'id' | 'sku' | 'title'> & {
                image?: StorefrontAPI.Maybe<
                  Pick<
                    StorefrontAPI.Image,
                    'altText' | 'height' | 'id' | 'width'
                  > & {src: StorefrontAPI.Image['url']}
                >;
                price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
                product: Pick<StorefrontAPI.Product, 'handle'>;
              }
            >;
          }
        >;
      };
    }
  >;
};

export type CustomerRecoverMutationVariables = StorefrontAPI.Exact<{
  email: StorefrontAPI.Scalars['String']['input'];
}>;

export type CustomerRecoverMutation = {
  customerRecover?: StorefrontAPI.Maybe<{
    customerUserErrors: Array<
      Pick<StorefrontAPI.CustomerUserError, 'code' | 'field' | 'message'>
    >;
  }>;
};

export type CustomerResetMutationVariables = StorefrontAPI.Exact<{
  id: StorefrontAPI.Scalars['ID']['input'];
  input: StorefrontAPI.CustomerResetInput;
}>;

export type CustomerResetMutation = {
  customerReset?: StorefrontAPI.Maybe<{
    customerAccessToken?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.CustomerAccessToken, 'accessToken' | 'expiresAt'>
    >;
    customerUserErrors: Array<
      Pick<StorefrontAPI.CustomerUserError, 'code' | 'field' | 'message'>
    >;
  }>;
};

export type CustomerCreateMutationVariables = StorefrontAPI.Exact<{
  input: StorefrontAPI.CustomerCreateInput;
}>;

export type CustomerCreateMutation = {
  customerCreate?: StorefrontAPI.Maybe<{
    customer?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Customer, 'id'>>;
    customerUserErrors: Array<
      Pick<StorefrontAPI.CustomerUserError, 'code' | 'field' | 'message'>
    >;
  }>;
};

export type PredictiveSearchQueryVariables = StorefrontAPI.Exact<{
  query: StorefrontAPI.Scalars['String']['input'];
  unavailableProducts?: StorefrontAPI.InputMaybe<StorefrontAPI.SearchUnavailableProductsType>;
  searchableFields?: StorefrontAPI.InputMaybe<
    Array<StorefrontAPI.SearchableField> | StorefrontAPI.SearchableField
  >;
  types?: StorefrontAPI.InputMaybe<
    | Array<StorefrontAPI.PredictiveSearchType>
    | StorefrontAPI.PredictiveSearchType
  >;
}>;

export type PredictiveSearchQuery = {
  predictiveSearch?: StorefrontAPI.Maybe<{
    collections: Array<Pick<StorefrontAPI.Collection, 'handle' | 'title'>>;
    queries: Array<Pick<StorefrontAPI.SearchQuerySuggestion, 'text'>>;
  }>;
};

export type ApiAllProductsQueryVariables = StorefrontAPI.Exact<{
  query?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['String']['input']>;
  count?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  reverse?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Boolean']['input']>;
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  sortKey?: StorefrontAPI.InputMaybe<StorefrontAPI.ProductSortKeys>;
}>;

export type ApiAllProductsQuery = {
  products: {
    nodes: Array<
      Pick<StorefrontAPI.Product, 'id' | 'title' | 'handle'> & {
        is_active_value?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'>
        >;
        is_always_in_stock?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'>
        >;
        bin_no?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        variants: {
          nodes: Array<
            Pick<
              StorefrontAPI.ProductVariant,
              'id' | 'availableForSale' | 'quantityAvailable' | 'sku'
            > & {
              image?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.Image,
                  'url' | 'altText' | 'width' | 'height'
                >
              >;
              price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
              compareAtPrice?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
              >;
            }
          >;
        };
      }
    >;
  };
};

export type ReviewsQueryVariables = StorefrontAPI.Exact<{
  type: StorefrontAPI.Scalars['String']['input'];
  first: StorefrontAPI.Scalars['Int']['input'];
  after?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['String']['input']>;
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type ReviewsQuery = {
  metaobjects: {
    nodes: Array<
      Pick<StorefrontAPI.Metaobject, 'id' | 'updatedAt'> & {
        reviewId?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MetaobjectField, 'value'>
        >;
        user?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MetaobjectField, 'value'>
        >;
        reviewContent?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MetaobjectField, 'value'>
        >;
      }
    >;
    pageInfo: Pick<StorefrontAPI.PageInfo, 'hasNextPage' | 'endCursor'>;
  };
};

export type CollectionDetailsQueryVariables = StorefrontAPI.Exact<{
  handle: StorefrontAPI.Scalars['String']['input'];
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  filters?: StorefrontAPI.InputMaybe<
    Array<StorefrontAPI.ProductFilter> | StorefrontAPI.ProductFilter
  >;
  sortKey: StorefrontAPI.ProductCollectionSortKeys;
  reverse?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Boolean']['input']>;
  first?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  last?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  startCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
  endCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
}>;

export type CollectionDetailsQuery = {
  collection?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.Collection,
      'id' | 'handle' | 'title' | 'description' | 'descriptionHtml'
    > & {
      seo: Pick<StorefrontAPI.Seo, 'description' | 'title'>;
      image?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'id' | 'url' | 'width' | 'height' | 'altText'>
      >;
      short_description?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'value'>
      >;
      products: {
        filters: Array<
          Pick<StorefrontAPI.Filter, 'id' | 'label' | 'type'> & {
            values: Array<
              Pick<
                StorefrontAPI.FilterValue,
                'id' | 'label' | 'count' | 'input'
              >
            >;
          }
        >;
        pageInfo: Pick<
          StorefrontAPI.PageInfo,
          'hasPreviousPage' | 'hasNextPage' | 'endCursor' | 'startCursor'
        >;
      };
    }
  >;
  collections: {
    edges: Array<{node: Pick<StorefrontAPI.Collection, 'title' | 'handle'>}>;
  };
};

export type CollectionsQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  first?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  last?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  startCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
  endCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
}>;

export type CollectionsQuery = {
  collections: {
    nodes: Array<
      Pick<
        StorefrontAPI.Collection,
        'id' | 'title' | 'description' | 'handle'
      > & {
        seo: Pick<StorefrontAPI.Seo, 'description' | 'title'>;
        image?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'url' | 'width' | 'height' | 'altText'
          >
        >;
      }
    >;
    pageInfo: Pick<
      StorefrontAPI.PageInfo,
      'hasPreviousPage' | 'hasNextPage' | 'startCursor' | 'endCursor'
    >;
  };
};

export type FeaturedItemsQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  pageBy?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
}>;

export type FeaturedItemsQuery = {
  featuredCollections: {
    nodes: Array<
      Pick<StorefrontAPI.Collection, 'id' | 'title' | 'handle'> & {
        image?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Image, 'altText' | 'width' | 'height' | 'url'>
        >;
      }
    >;
  };
  featuredProducts: {
    nodes: Array<
      Pick<StorefrontAPI.Product, 'id' | 'title' | 'handle'> & {
        is_active_value?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'>
        >;
        is_always_in_stock?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'>
        >;
        bin_no?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        variants: {
          nodes: Array<
            Pick<
              StorefrontAPI.ProductVariant,
              'id' | 'availableForSale' | 'quantityAvailable' | 'sku'
            > & {
              image?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.Image,
                  'url' | 'altText' | 'width' | 'height'
                >
              >;
              price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
              compareAtPrice?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
              >;
            }
          >;
        };
      }
    >;
  };
};

export type ArticleDetailsQueryVariables = StorefrontAPI.Exact<{
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  blogHandle: StorefrontAPI.Scalars['String']['input'];
  articleHandle: StorefrontAPI.Scalars['String']['input'];
}>;

export type ArticleDetailsQuery = {
  blog?: StorefrontAPI.Maybe<{
    articleByHandle?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.Article, 'title' | 'contentHtml' | 'publishedAt'> & {
        author?: StorefrontAPI.Maybe<Pick<StorefrontAPI.ArticleAuthor, 'name'>>;
        image?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'altText' | 'url' | 'width' | 'height'
          >
        >;
        seo?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Seo, 'description' | 'title'>
        >;
      }
    >;
  }>;
};

export type BlogQueryVariables = StorefrontAPI.Exact<{
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  blogHandle: StorefrontAPI.Scalars['String']['input'];
  pageBy: StorefrontAPI.Scalars['Int']['input'];
  cursor?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['String']['input']>;
}>;

export type BlogQuery = {
  blog?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Blog, 'title'> & {
      seo?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Seo, 'title' | 'description'>
      >;
      articles: {
        edges: Array<{
          node: Pick<
            StorefrontAPI.Article,
            'contentHtml' | 'handle' | 'id' | 'publishedAt' | 'title'
          > & {
            author?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.ArticleAuthor, 'name'>
            >;
            image?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.Image,
                'id' | 'altText' | 'url' | 'width' | 'height'
              >
            >;
          };
        }>;
      };
    }
  >;
};

export type JournalArticleFragment = Pick<
  StorefrontAPI.Article,
  'contentHtml' | 'handle' | 'id' | 'publishedAt' | 'title'
> & {
  author?: StorefrontAPI.Maybe<Pick<StorefrontAPI.ArticleAuthor, 'name'>>;
  image?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Image, 'id' | 'altText' | 'url' | 'width' | 'height'>
  >;
};

export type PageDetailsQueryVariables = StorefrontAPI.Exact<{
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  handle: StorefrontAPI.Scalars['String']['input'];
}>;

export type PageDetailsQuery = {
  page?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Page, 'id' | 'title' | 'body'> & {
      seo?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Seo, 'description' | 'title'>
      >;
    }
  >;
};

export type PolicyHandleFragment = Pick<
  StorefrontAPI.ShopPolicy,
  'body' | 'handle' | 'id' | 'title' | 'url'
>;

export type PoliciesHandleQueryVariables = StorefrontAPI.Exact<{
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  privacyPolicy: StorefrontAPI.Scalars['Boolean']['input'];
  shippingPolicy: StorefrontAPI.Scalars['Boolean']['input'];
  termsOfService: StorefrontAPI.Scalars['Boolean']['input'];
  refundPolicy: StorefrontAPI.Scalars['Boolean']['input'];
}>;

export type PoliciesHandleQuery = {
  shop: {
    privacyPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'body' | 'handle' | 'id' | 'title' | 'url'>
    >;
    shippingPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'body' | 'handle' | 'id' | 'title' | 'url'>
    >;
    termsOfService?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'body' | 'handle' | 'id' | 'title' | 'url'>
    >;
    refundPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'body' | 'handle' | 'id' | 'title' | 'url'>
    >;
  };
};

export type PolicyIndexFragment = Pick<
  StorefrontAPI.ShopPolicy,
  'id' | 'title' | 'handle'
>;

export type PoliciesIndexQueryVariables = StorefrontAPI.Exact<{
  [key: string]: never;
}>;

export type PoliciesIndexQuery = {
  shop: {
    privacyPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'id' | 'title' | 'handle'>
    >;
    shippingPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'id' | 'title' | 'handle'>
    >;
    termsOfService?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'id' | 'title' | 'handle'>
    >;
    refundPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'id' | 'title' | 'handle'>
    >;
    subscriptionPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicyWithDefault, 'id' | 'title' | 'handle'>
    >;
  };
};

export type AllProductsQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  first?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  last?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  startCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
  endCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
}>;

export type AllProductsQuery = {
  products: {
    nodes: Array<
      Pick<StorefrontAPI.Product, 'id' | 'title' | 'handle'> & {
        is_active_value?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'>
        >;
        is_always_in_stock?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'>
        >;
        bin_no?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        variants: {
          nodes: Array<
            Pick<
              StorefrontAPI.ProductVariant,
              'id' | 'availableForSale' | 'quantityAvailable' | 'sku'
            > & {
              image?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.Image,
                  'url' | 'altText' | 'width' | 'height'
                >
              >;
              price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
              compareAtPrice?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
              >;
            }
          >;
        };
      }
    >;
    pageInfo: Pick<
      StorefrontAPI.PageInfo,
      'hasPreviousPage' | 'hasNextPage' | 'startCursor' | 'endCursor'
    >;
  };
};

export type PaginatedProductsSearchQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  endCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
  first?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  last?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  searchTerm?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
  startCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
}>;

export type PaginatedProductsSearchQuery = {
  products: {
    nodes: Array<
      Pick<StorefrontAPI.Product, 'id' | 'title' | 'handle'> & {
        is_active_value?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'>
        >;
        is_always_in_stock?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'>
        >;
        bin_no?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        variants: {
          nodes: Array<
            Pick<
              StorefrontAPI.ProductVariant,
              'id' | 'availableForSale' | 'quantityAvailable' | 'sku'
            > & {
              image?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.Image,
                  'url' | 'altText' | 'width' | 'height'
                >
              >;
              price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
              compareAtPrice?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
              >;
            }
          >;
        };
      }
    >;
    pageInfo: Pick<
      StorefrontAPI.PageInfo,
      'startCursor' | 'endCursor' | 'hasNextPage' | 'hasPreviousPage'
    >;
  };
};

export type ProfileCustomerUpdateMutationVariables = StorefrontAPI.Exact<{
  customerAccessToken: StorefrontAPI.Scalars['String']['input'];
  customer: StorefrontAPI.CustomerUpdateInput;
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type ProfileCustomerUpdateMutation = {
  customerUpdate?: StorefrontAPI.Maybe<{
    customer?: StorefrontAPI.Maybe<
      Pick<
        StorefrontAPI.Customer,
        'acceptsMarketing' | 'email' | 'firstName' | 'id' | 'lastName' | 'phone'
      >
    >;
    customerAccessToken?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.CustomerAccessToken, 'accessToken' | 'expiresAt'>
    >;
    customerUserErrors: Array<
      Pick<StorefrontAPI.CustomerUserError, 'code' | 'field' | 'message'>
    >;
  }>;
};

export type SitemapArticlesQueryVariables = StorefrontAPI.Exact<{
  first: StorefrontAPI.Scalars['Int']['input'];
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type SitemapArticlesQuery = {
  articles: {
    nodes: Array<
      Pick<
        StorefrontAPI.Article,
        'publishedAt' | 'handle' | 'onlineStoreUrl'
      > & {blog: Pick<StorefrontAPI.Blog, 'handle'>}
    >;
  };
};

export type SitemapBlogsQueryVariables = StorefrontAPI.Exact<{
  first: StorefrontAPI.Scalars['Int']['input'];
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type SitemapBlogsQuery = {
  blogs: {nodes: Array<Pick<StorefrontAPI.Blog, 'handle'>>};
};

export type SitemapCollectionsQueryVariables = StorefrontAPI.Exact<{
  first: StorefrontAPI.Scalars['Int']['input'];
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type SitemapCollectionsQuery = {
  collections: {
    nodes: Array<
      Pick<StorefrontAPI.Collection, 'updatedAt' | 'handle' | 'onlineStoreUrl'>
    >;
  };
};

export type SitemapPagesQueryVariables = StorefrontAPI.Exact<{
  first: StorefrontAPI.Scalars['Int']['input'];
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type SitemapPagesQuery = {
  pages: {
    nodes: Array<
      Pick<StorefrontAPI.Page, 'updatedAt' | 'handle' | 'onlineStoreUrl'>
    >;
  };
};

interface GeneratedQueryTypes {
  '#graphql\n  query productRecommendations(\n    $productId: ID!\n    $count: Int\n    $country: CountryCode\n    $language: LanguageCode\n  ) @inContext(country: $country, language: $language) {\n    recommended: productRecommendations(productId: $productId) {\n      id\n      title\n      handle\n      is_active_value: metafield(namespace: "product_extended_property", key: "is_active_value") {\n        value\n      }\n      bin_no: metafield(namespace: "product_extended_property", key: "bin_no") {\n        value\n      }\n      variants(first: 1) {\n        nodes {\n          id\n          availableForSale\n          quantityAvailable\n          image {\n            url\n            altText\n            width\n            height\n          }\n          price {\n            amount\n            currencyCode\n          }\n          compareAtPrice {\n            amount\n            currencyCode\n          }\n        }\n      }\n    }\n    additional: products(first: $count, sortKey: BEST_SELLING) {\n      nodes {\n        id\n        title\n        publishedAt\n        handle\n        vendor\n        is_active_value: metafield(namespace: "product_extended_property", key: "is_active_value") {\n          value\n        }\n        bin_no: metafield(namespace: "product_extended_property", key: "bin_no") {\n          value\n        }\n        variants(first: 1) {\n          nodes {\n            id\n            availableForSale\n            quantityAvailable\n            image {\n              url\n              altText\n              width\n              height\n            }\n            price {\n              amount\n              currencyCode\n            }\n            compareAtPrice {\n              amount\n              currencyCode\n            }\n          }\n        }\n      }\n    }\n  }\n': {
    return: ProductRecommendationsQuery;
    variables: ProductRecommendationsQueryVariables;
  };
  '#graphql\n  query Announcements(\n    $type: String!\n    $first: Int!\n    $after: String\n    $country: CountryCode\n    $language: LanguageCode\n  ) @inContext(country: $country, language: $language) {\n    metaobjects(type: $type, first: $first, after: $after, reverse: true) {\n      nodes {\n        id\n        handle\n        updatedAt\n        fields {\n          key\n          value\n          reference {\n            ... on MediaImage {\n              image {\n                url\n                altText\n                width\n                height\n              }\n            }\n          }\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n': {
    return: AnnouncementsQuery;
    variables: AnnouncementsQueryVariables;
  };
  '#graphql\n  query ModelNumberGuides($language: LanguageCode) @inContext(language: $language) {\n    metaobjects(type: "model_number_guide", first: 50) {\n      nodes {\n        appliance: field(key: "appliance") { value }\n        slug: field(key: "slug") { value }\n        summary: field(key: "summary") { value }\n        body: field(key: "body") { value }\n        legacy_images: field(key: "legacy_images") { value }\n        link_label: field(key: "link_label") { value }\n        sort_order: field(key: "sort_order") { value }\n        images: field(key: "images") {\n          references(first: 10) {\n            nodes {\n              ... on MediaImage {\n                image { url altText width height }\n              }\n            }\n          }\n        }\n        collection: field(key: "collection") {\n          reference {\n            ... on Collection { handle title }\n          }\n        }\n      }\n    }\n  }\n': {
    return: ModelNumberGuidesQuery;
    variables: ModelNumberGuidesQueryVariables;
  };
  '#graphql\n  query QuoteCartProducts(\n    $query: String!\n    $country: CountryCode\n    $language: LanguageCode\n  ) @inContext(country: $country, language: $language) {\n    products(first: 50, query: $query) {\n      nodes {\n        variants(first: 50) {\n          nodes {\n            id\n            sku\n          }\n        }\n      }\n    }\n  }\n': {
    return: QuoteCartProductsQuery;
    variables: QuoteCartProductsQueryVariables;
  };
  '#graphql\n    query RedirectionByHandle($handle: MetaobjectHandleInput!) {\n      metaobject(handle: $handle) {\n        handle\n        from: field(key: "from") {\n          value\n        }\n        to: field(key: "to") {\n          value\n        }\n      }\n    }\n  ': {
    return: RedirectionByHandleQuery;
    variables: RedirectionByHandleQueryVariables;
  };
  '#graphql\nquery FilteredCollectionDetails(\n  $handle: String!\n  $country: CountryCode\n  $language: LanguageCode\n  $first: Int\n) @inContext(country: $country, language: $language) {\n  collection(handle: $handle) {\n    id\n    handle\n    title\n    description\n    descriptionHtml\n    seo {\n      description\n      title\n    }\n    image {\n      id\n      url\n      width\n      height\n      altText\n    }\n    top_description: metafield(namespace: "custom", key: "top_description") {\n      value\n    }\n    below_description: metafield(namespace: "custom", key: "below") {\n      value\n    }\n    type: metafield(namespace: "custom", key: "collection_type") {\n     value\n   }\n     custom_images_for_mobile: metafield(namespace: "custom", key: "custom_images_for_mobile") {\n      value\n      references(first: 10) {\n        nodes {\n          ... on MediaImage {\n            id\n            mediaContentType\n            image {\n              url\n            }\n          }\n        }\n      }\n    }\n    custom_images: metafield(namespace: "custom", key: "custom_images") {\n      value\n      references(first: 10) {\n        nodes {\n          ... on MediaImage {\n            id\n            mediaContentType\n            image {\n              url\n            }\n          }\n        }\n      }\n    }\n\n    custom_images_for_mobile_nz: metafield(namespace: "custom", key: "custom_images_for_nz_mobile") {\n      value\n      references(first: 10) {\n        nodes {\n          ... on MediaImage {\n            id\n            mediaContentType\n            image {\n              url\n            }\n          }\n        }\n      }\n    }\n    custom_images_nz: metafield(namespace: "custom", key: "custom_images_for_nz") {\n      value\n      references(first: 10) {\n        nodes {\n          ... on MediaImage {\n            id\n            mediaContentType\n            image {\n              url\n            }\n          }\n        }\n      }\n    }\n    products(\n      first: $first,\n    ) {\n      nodes {\n        ...ProductCard\n      }\n    }\n  }\n}\n#graphql\n  fragment ProductCard on Product {\n    id\n    title\n    handle\n    is_active_value: metafield(namespace: "product_extended_property", key: "is_active_value") {\n      value\n    }\n    is_always_in_stock: metafield(namespace: "product_extended_property", key: "is_always_in_stock") {\n      value\n    }\n    bin_no: metafield(namespace: "product_extended_property", key: "bin_no") {\n      value\n    }\n    variants(first: 1) {\n      nodes {\n        id\n        availableForSale\n        quantityAvailable\n        sku\n        image {\n          url\n          altText\n          width\n          height\n        }\n        price {\n          amount\n          currencyCode\n        }\n        compareAtPrice {\n          amount\n          currencyCode\n        }\n      }\n    }\n  }\n\n': {
    return: FilteredCollectionDetailsQuery;
    variables: FilteredCollectionDetailsQueryVariables;
  };
  '#graphql\nquery CustomCollectionsDetails($handle1: String $handle2:String $handle3:String )  {\n  vendor:  collection(handle: $handle1) {\n    handle\n    title\n    image {\n      id\n      url\n      width\n      height\n      altText\n    }\n    description\n    descriptionHtml\n    seo {\n      description\n      title\n    }\n    products( first: 20 ) {\n      nodes {\n        ...ProductCard\n      }\n    }\n    type: metafield(namespace: "custom", key: "collection_type") {\n     value\n    }\n    custom_images_for_mobile: metafield(namespace: "custom", key: "custom_images_for_mobile") {\n      value\n      references(first: 10) {\n        nodes {\n          ... on MediaImage {\n            id\n            mediaContentType\n            image {\n              url\n            }\n          }\n        }\n      }\n    }\n    custom_images: metafield(namespace: "custom", key: "custom_images") {\n      value\n      references(first: 10) {\n        nodes {\n          ... on MediaImage {\n            id\n            mediaContentType\n            image {\n              url\n            }\n          }\n        }\n      }\n    }\n\n    custom_images_for_mobile_nz: metafield(namespace: "custom", key: "custom_images_for_nz_mobile") {\n      value\n      references(first: 10) {\n        nodes {\n          ... on MediaImage {\n            id\n            mediaContentType\n            image {\n              url\n            }\n          }\n        }\n      }\n    }\n    custom_images_nz: metafield(namespace: "custom", key: "custom_images_for_nz") {\n      value\n      references(first: 10) {\n        nodes {\n          ... on MediaImage {\n            id\n            mediaContentType\n            image {\n              url\n            }\n          }\n        }\n      }\n    }\n    top_description: metafield(namespace: "custom", key: "top_description") {\n      value\n    }\n    below_description: metafield(namespace: "custom", key: "below") {\n      value\n    }\n    custom_logo: metafield(namespace: "custom", key: "custom_logo") {\n      value\n      reference {\n        ... on MediaImage {\n          id\n          alt\n          mediaContentType\n          image {\n            altText\n            height\n            id\n            url\n            width\n          }\n        }\n      }\n    }\n\n  }\n  appliance_type:  collection(handle: $handle2) {\n    handle\n    title\n    description\n    descriptionHtml\n    seo {\n      description\n      title\n    }\n    image {\n      id\n      url\n      width\n      height\n      altText\n    }\n    products( first: 20 ) {\n      nodes {\n        ...ProductCard\n      }\n    }\n    custom_images_for_mobile: metafield(namespace: "custom", key: "custom_images_for_mobile") {\n      value\n      references(first: 10) {\n        nodes {\n          ... on MediaImage {\n            id\n            mediaContentType\n            image {\n              url\n            }\n          }\n        }\n      }\n    }\n    custom_images: metafield(namespace: "custom", key: "custom_images") {\n      value\n      references(first: 10) {\n        nodes {\n          ... on MediaImage {\n            id\n            mediaContentType\n            image {\n              url\n            }\n          }\n        }\n      }\n    }\n\n    custom_images_for_mobile_nz: metafield(namespace: "custom", key: "custom_images_for_nz_mobile") {\n      value\n      references(first: 10) {\n        nodes {\n          ... on MediaImage {\n            id\n            mediaContentType\n            image {\n              url\n            }\n          }\n        }\n      }\n    }\n    custom_images_nz: metafield(namespace: "custom", key: "custom_images_for_nz") {\n      value\n      references(first: 10) {\n        nodes {\n          ... on MediaImage {\n            id\n            mediaContentType\n            image {\n              url\n            }\n          }\n        }\n      }\n    }\n    top_description: metafield(namespace: "custom", key: "top_description") {\n      value\n    }\n    below_description: metafield(namespace: "custom", key: "below") {\n      value\n    }\n  }\n  part_type:  collection(handle: $handle3) {\n    handle\n    title\n    description\n    descriptionHtml\n    seo {\n      description\n      title\n    }\n    products( first: 20 ) {\n      nodes {\n        ...ProductCard\n      }\n    }\n    image {\n      id\n      url\n      width\n      height\n      altText\n    }\n      custom_images_for_mobile: metafield(namespace: "custom", key: "custom_images_for_mobile") {\n      value\n      references(first: 10) {\n        nodes {\n          ... on MediaImage {\n            id\n            mediaContentType\n            image {\n              url\n            }\n          }\n        }\n      }\n    }\n    custom_images: metafield(namespace: "custom", key: "custom_images") {\n      value\n      references(first: 10) {\n        nodes {\n          ... on MediaImage {\n            id\n            mediaContentType\n            image {\n              url\n            }\n          }\n        }\n      }\n    }\n\n    custom_images_for_mobile_nz: metafield(namespace: "custom", key: "custom_images_for_nz_mobile") {\n      value\n      references(first: 10) {\n        nodes {\n          ... on MediaImage {\n            id\n            mediaContentType\n            image {\n              url\n            }\n          }\n        }\n      }\n    }\n    custom_images_nz: metafield(namespace: "custom", key: "custom_images_for_nz") {\n      value\n      references(first: 10) {\n        nodes {\n          ... on MediaImage {\n            id\n            mediaContentType\n            image {\n              url\n            }\n          }\n        }\n      }\n    }\n    top_description: metafield(namespace: "custom", key: "top_description") {\n      value\n    }\n    below_description: metafield(namespace: "custom", key: "below") {\n      value\n    }\n  }\n}\n#graphql\n  fragment ProductCard on Product {\n    id\n    title\n    handle\n    is_active_value: metafield(namespace: "product_extended_property", key: "is_active_value") {\n      value\n    }\n    is_always_in_stock: metafield(namespace: "product_extended_property", key: "is_always_in_stock") {\n      value\n    }\n    bin_no: metafield(namespace: "product_extended_property", key: "bin_no") {\n      value\n    }\n    variants(first: 1) {\n      nodes {\n        id\n        availableForSale\n        quantityAvailable\n        sku\n        image {\n          url\n          altText\n          width\n          height\n        }\n        price {\n          amount\n          currencyCode\n        }\n        compareAtPrice {\n          amount\n          currencyCode\n        }\n      }\n    }\n  }\n\n': {
    return: CustomCollectionsDetailsQuery;
    variables: CustomCollectionsDetailsQueryVariables;
  };
  '#graphql\n  query variants(\n    $country: CountryCode\n    $language: LanguageCode\n    $handle: String!\n  ) @inContext(country: $country, language: $language) {\n    product(handle: $handle) {\n      variants(first: 250) {\n        nodes {\n          ...ProductVariantFragment\n        }\n      }\n    }\n  }\n  #graphql\n  fragment ProductVariantFragment on ProductVariant {\n    id\n    availableForSale\n    selectedOptions {\n      name\n      value\n    }\n    image {\n      id\n      url\n      altText\n      width\n      height\n    }\n    price {\n      amount\n      currencyCode\n    }\n    compareAtPrice {\n      amount\n      currencyCode\n    }\n    sku\n    title\n\n    unitPrice {\n      amount\n      currencyCode\n    }\n    product {\n      title\n      handle\n    }\n  }\n\n': {
    return: VariantsQuery;
    variables: VariantsQueryVariables;
  };
  '#graphql\n  query RelatedProductRecommendations(\n    $productId: ID!\n    $count: Int\n    $country: CountryCode\n    $language: LanguageCode\n  ) @inContext(country: $country, language: $language) {\n    recommended: productRecommendations(productId: $productId) {\n      ...ProductCard\n    }\n    additional: products(first: $count, sortKey: BEST_SELLING) {\n      nodes {\n        ...ProductCard\n      }\n    }\n  }\n  #graphql\n  fragment ProductCard on Product {\n    id\n    title\n    handle\n    is_active_value: metafield(namespace: "product_extended_property", key: "is_active_value") {\n      value\n    }\n    is_always_in_stock: metafield(namespace: "product_extended_property", key: "is_always_in_stock") {\n      value\n    }\n    bin_no: metafield(namespace: "product_extended_property", key: "bin_no") {\n      value\n    }\n    variants(first: 1) {\n      nodes {\n        id\n        availableForSale\n        quantityAvailable\n        sku\n        image {\n          url\n          altText\n          width\n          height\n        }\n        price {\n          amount\n          currencyCode\n        }\n        compareAtPrice {\n          amount\n          currencyCode\n        }\n      }\n    }\n  }\n\n': {
    return: RelatedProductRecommendationsQuery;
    variables: RelatedProductRecommendationsQueryVariables;
  };
  '#graphql\n  query ProductPricesByCountry(\n    $handle: String!\n    $country: CountryCode\n    $language: LanguageCode\n  ) @inContext(country: $country, language: $language) {\n    product(handle: $handle) {\n      id\n      variants(first: 99) {\n        nodes {\n          price { amount currencyCode }\n          availableForSale\n          sku\n          selectedOptions { name value }\n        }\n      }\n    }\n  }\n': {
    return: ProductPricesByCountryQuery;
    variables: ProductPricesByCountryQueryVariables;
  };
  '#graphql\nquery CollectionAndProductDetails(\n  $handle: String!\n  $country: CountryCode\n  $language: LanguageCode\n  $first: Int\n) @inContext(country: $country, language: $language) {\n shop {\n   name\n   primaryDomain {\n     url\n   }\n   specialPrice: metafield(namespace: "app--55618142209--sybiz_info", key: "special_price") {\n      value\n   }\n   shippingPolicy {\n     body\n     handle\n   }\n   refundPolicy {\n     body\n     handle\n   }\n }\n  product(handle: $handle) {\n   id\n   title\n   vendor\n   handle\n   productType\n   featuredImage {\n      url\n      src\n      altText\n      width\n      height\n  }\n   qtyPrices: metafield(namespace: "product_extended_property", key: "quantity_based_price") {\n    value\n   }\n  tags\n  seo {\n      description\n      title\n  }\n  show_australia_only: metafield(namespace: "product_extended_property", key: "australia_only") {\n    value\n  }\n   variants(first: 99) {\n        nodes {\n          price {\n            amount\n            currencyCode\n          }\n          availableForSale\n          id\n          title\n          sku\n          quantityAvailable\n          selectedOptions {\n            name\n            value\n          }\n          image {\n            id\n            url\n            altText\n            width\n            height\n          }\n          compareAtPrice {\n            amount\n            currencyCode\n          }\n        }\n   }\n   upsells: metafield(namespace: "custom", key: "upsell") {\n             references(first: 5) {\n              nodes {\n                ... on Product {\n                  availableForSale\n                  id\n                  handle\n                  title\n                  featuredImage {\n                    id\n                    url\n                    altText\n                    width\n                    height\n                  }\n                  options {\n                    name\n                    values\n                  }\n                  bin_no: metafield(namespace: "product_extended_property", key: "bin_no") {\n                    value\n                  }\n                  is_always_in_stock: metafield(namespace: "product_extended_property", key: "is_always_in_stock") {\n                    value\n                  }\n                  is_active_value: metafield(namespace: "product_extended_property", key: "is_active_value") {\n                    value\n                  }\n                  variants(first: 99) {\n                    nodes {\n                      price {\n                        amount\n                        currencyCode\n                      }\n                      availableForSale\n                      id\n                      title\n                      sku\n                      selectedOptions {\n                        name\n                        value\n                      }\n                      compareAtPrice {\n                        amount\n                        currencyCode\n                      }\n                    }\n                  }\n\n                }\n              }\n            }\n    }\n\n   weight: metafield(namespace: "product_extended_property", key: "part_weight") {\n    value\n   }\n   depth: metafield(namespace: "product_extended_property", key: "part_depth") {\n    value\n   }\n   height: metafield(namespace: "product_extended_property", key: "part_height") {\n    value\n   }\n   width: metafield(namespace: "product_extended_property", key: "part_width") {\n    value\n   }\n   installation_guide_links: metafield(namespace: "custom", key: "installation_guide_link") {\n    value\n   }\n   installation_guide: metafield(namespace: "custom", key: "installation_guide") {\n    value\n      references(first: 10) {\n        nodes {\n          ... on MediaImage {\n            id\n            mediaContentType\n            image {\n              url\n            }\n          }\n        }\n    }\n   }\n   descriptionHtml\n   is_active_value: metafield(namespace: "product_extended_property", key: "is_active_value") {\n    value\n  }\n  you_may_also_like: metafield(namespace: "custom", key: "you_may_also_like") {\n      reference {\n        ... on Metaobject {\n          products: field(key: "products") {\n            references(first: 4) {\n              nodes {\n                  ... on Product {\n                  availableForSale\n                  id\n                  handle\n                  title\n                  featuredImage {\n                    id\n                    url\n                    altText\n                    width\n                    height\n                  }\n                  options {\n                    name\n                    values\n                  }\n                  bin_no: metafield(namespace: "product_extended_property", key: "bin_no") {\n                    value\n                  }\n                  is_always_in_stock: metafield(namespace: "product_extended_property", key: "is_always_in_stock") {\n                    value\n                  }\n                  is_active_value: metafield(namespace: "product_extended_property", key: "is_active_value") {\n                    value\n                  }\n                  variants(first: 99) {\n                    nodes {\n                      price {\n                        amount\n                        currencyCode\n                      }\n                      availableForSale\n                      id\n                      title\n                      sku\n                      selectedOptions {\n                        name\n                        value\n                      }\n                      compareAtPrice {\n                        amount\n                        currencyCode\n                      }\n                    }\n                  }\n\n                }\n              }\n            }\n          }\n          banners: field(key: "banners") {\n            references(first: 1) {\n              nodes {\n                  ... on MediaImage {\n                    image {\n                      url\n                      altText\n                    }\n                  }\n              }\n            }\n          }\n\n          bannersLinks: field(key: "banners_links") {\n            value\n          }\n\n          entryName: field(key: "entry_name") {\n            value\n          }\n        }\n      }\n   }\n   description\n  appliances: metafield(namespace: "product_extended_property", key: "appliance_types_filters") {\n    value\n  }\n  parts: metafield(namespace: "product_extended_property", key: "part_type") {\n    value\n  }\n  breadcrumb: metafield(namespace: "product_extended_property", key: "top_menu_category") {\n    value\n  }\n  delivery: metafield(namespace: "product_extended_property", key: "days_to_deliver") {\n    value\n  }\n  priceScale: metafield(namespace: "product_extended_property", key: "product_prices") {\n    value\n  }\n  alternate_products: metafield(namespace: "product_extended_property", key: "alternate_products") {\n    value\n  }\n  alternate_products_sku: metafield(namespace: "product_extended_property", key: "alternate_products_sku") {\n    value\n  }\n     replace_products: metafield(namespace: "product_extended_property", key: "replacements_products") {\n    value\n  }\n  replace_products_sku: metafield(namespace: "product_extended_property", key: "replacements_products_sku") {\n    value\n  }\n   bin_no: metafield(namespace: "product_extended_property", key: "bin_no") {\n    value\n  }\n   specification: metafield(namespace: "custom", key: "specification") {\n     value\n   }\n   shortDescription: metafield(namespace: "custom", key: "short_description") {\n     value\n   }\n   models: metafield(namespace: "product_extended_property", key: "model_numbers") {\n     value\n   }\n   is_always_in_stock: metafield(namespace: "product_extended_property", key: "is_always_in_stock") {\n     value\n   }\n   compatibility: metafield(namespace: "custom", key: "compatibility") {\n     value\n   }\n   multi_buy_price: metafield(namespace: "sybiz_info", key: "special_price_details") {\n      value\n   }\n   options {\n     name\n     values\n   }\n   media(first: 99) {\n     nodes {\n       ...Media\n     }\n   }\n   seo {\n     description\n     title\n   }\n }\ncollection(handle: $handle) {\n    id\n    handle\n    title\n    description\n    descriptionHtml\n    seo {\n      description\n      title\n    }\n    image {\n      id\n      url\n      width\n      height\n      altText\n    }\n    top_description: metafield(namespace: "custom", key: "top_description") {\n      value\n    }\n    below_description: metafield(namespace: "custom", key: "below") {\n      value\n    }\n      custom_images_for_mobile: metafield(namespace: "custom", key: "custom_images_for_mobile") {\n      value\n      references(first: 10) {\n        nodes {\n          ... on MediaImage {\n            id\n            mediaContentType\n            image {\n              url\n            }\n          }\n        }\n      }\n    }\n    custom_images: metafield(namespace: "custom", key: "custom_images") {\n      value\n      references(first: 10) {\n        nodes {\n          ... on MediaImage {\n            id\n            mediaContentType\n            image {\n              url\n            }\n          }\n        }\n      }\n    }\n\n    custom_images_for_mobile_nz: metafield(namespace: "custom", key: "custom_images_for_nz_mobile") {\n      value\n      references(first: 10) {\n        nodes {\n          ... on MediaImage {\n            id\n            mediaContentType\n            image {\n              url\n            }\n          }\n        }\n      }\n    }\n    custom_images_nz: metafield(namespace: "custom", key: "custom_images_for_nz") {\n      value\n      references(first: 10) {\n        nodes {\n          ... on MediaImage {\n            id\n            mediaContentType\n            image {\n              url\n            }\n          }\n        }\n      }\n    }\n    type: metafield(namespace: "custom", key: "collection_type") {\n     value\n   }\n    products(\n      first: $first,\n    ) {\n      nodes {\n        ...ProductCard\n      }\n    }\n  }\n}\n#graphql\n  fragment ProductCard on Product {\n    id\n    title\n    handle\n    is_active_value: metafield(namespace: "product_extended_property", key: "is_active_value") {\n      value\n    }\n    is_always_in_stock: metafield(namespace: "product_extended_property", key: "is_always_in_stock") {\n      value\n    }\n    bin_no: metafield(namespace: "product_extended_property", key: "bin_no") {\n      value\n    }\n    variants(first: 1) {\n      nodes {\n        id\n        availableForSale\n        quantityAvailable\n        sku\n        image {\n          url\n          altText\n          width\n          height\n        }\n        price {\n          amount\n          currencyCode\n        }\n        compareAtPrice {\n          amount\n          currencyCode\n        }\n      }\n    }\n  }\n\n#graphql\n  fragment Media on Media {\n    __typename\n    mediaContentType\n    alt\n    previewImage {\n      url\n    }\n    ... on MediaImage {\n      id\n      image {\n        id\n        url\n        width\n        height\n      }\n    }\n    ... on Video {\n      id\n      sources {\n        mimeType\n        url\n      }\n    }\n    ... on Model3d {\n      id\n      sources {\n        mimeType\n        url\n      }\n    }\n    ... on ExternalVideo {\n      id\n      embedUrl\n      host\n    }\n  }\n\n': {
    return: CollectionAndProductDetailsQuery;
    variables: CollectionAndProductDetailsQueryVariables;
  };
  '#graphql\n  query PageByHandleDetails($language: LanguageCode, $handle: String!)\n  @inContext(language: $language) {\n    page(handle: $handle) {\n      id\n      title\n      handle\n      body\n      seo {\n        description\n        title\n      }\n    }\n  }\n': {
    return: PageByHandleDetailsQuery;
    variables: PageByHandleDetailsQueryVariables;
  };
  '#graphql\nquery SearchArticles(\n  $language: LanguageCode,\n  $blogQuery:String!\n) @inContext(language: $language) {\n  articles:search(query: $blogQuery, first: 250, types: ARTICLE, reverse: true,sortKey: RELEVANCE) {\n    nodes {\n      ...SearchArticle\n    }\n  }\n  blogs(first: 250) {\n    nodes{\n      title\n      handle\n      articles(first: 250) {\n        edges {\n          node {\n            ...SearchArticle\n          }\n        }\n      }\n    }\n  }\n}\nfragment SearchArticle on Article {\n  author: authorV2 {\n    name\n  }\n  handle\n  id\n  content\n  excerpt\n  image {\n    id\n    altText\n    url\n    width\n    height\n  }\n  desktop_image: metafield(namespace: "custom", key: "desktop_banner") {\n    value\n    reference {\n      ... on MediaImage {\n        id\n        alt\n        mediaContentType\n        image {\n          altText\n          height\n          id\n          url\n          width\n        }\n      }\n    }\n  }\n  mobile_image: metafield(namespace: "custom", key: "mobile_banner") {\n    value\n    reference {\n      ... on MediaImage {\n        id\n        alt\n        mediaContentType\n        image {\n          altText\n          height\n          id\n          url\n          width\n        }\n      }\n    }\n  }\n  blog {\n    seo {\n      description\n      title\n    }\n    id\n    title\n    handle\n  }\n  publishedAt\n  title\n}\n': {
    return: SearchArticlesQuery;
    variables: SearchArticlesQueryVariables;
  };
  '#graphql\nquery BlogsWithArticles(\n  $language: LanguageCode\n) @inContext(language: $language) {\n  articles(first: 250, sortKey:PUBLISHED_AT, reverse: true) {\n    nodes{\n      ...BlogsArticle\n    }\n  }\n  blogs(first: 250) {\n    nodes{\n      title\n      handle\n      articles(first: 250, sortKey:PUBLISHED_AT, reverse: true) {\n        edges {\n          node {\n            ...BlogsArticle\n          }\n        }\n      }\n    }\n  }\n}\n\nfragment BlogsArticle on Article {\n  author: authorV2 {\n    name\n  }\n  handle\n  id\n  image {\n    id\n    altText\n    url\n    width\n    height\n  }\n  content\n  seo {\n      description\n      title\n  }\n  excerpt\n  desktop_image: metafield(namespace: "custom", key: "desktop_banner") {\n    value\n    reference {\n      ... on MediaImage {\n        id\n        alt\n        mediaContentType\n        image {\n          altText\n          height\n          id\n          url\n          width\n        }\n      }\n    }\n  }\n  mobile_image: metafield(namespace: "custom", key: "mobile_banner") {\n    value\n    reference {\n      ... on MediaImage {\n        id\n        alt\n        mediaContentType\n        image {\n          altText\n          height\n          id\n          url\n          width\n        }\n      }\n    }\n  }\n  blog {\n    seo {\n      description\n      title\n    }\n    id\n    title\n    handle\n  }\n  publishedAt\n  title\n}\n': {
    return: BlogsWithArticlesQuery;
    variables: BlogsWithArticlesQueryVariables;
  };
  '#graphql\n  query layout(\n    $language: LanguageCode\n  ) @inContext(language: $language) {\n    shop {\n      ...Shop\n    }\n    headerMenu: menu(handle: "main-menu") {\n      ...Menu\n    }\n    siteNav: menu(handle: "new-header-menu") {\n      ...Menu\n    }\n    footerMenu: menu(handle: "footer") {\n      ...Menu\n    }\n  }\n  fragment Shop on Shop {\n    id\n    name\n    description\n    primaryDomain {\n      url\n    }\n    specialPrice: metafield(namespace: "app--55618142209--sybiz_info", key: "special_price") {\n      value\n    }\n    brand {\n      logo {\n        image {\n          url\n        }\n      }\n    }\n  }\n  fragment MenuItem on MenuItem {\n    id\n    resourceId\n    tags\n    title\n    type\n    url\n    items {\n      id\n      resourceId\n      tags\n      title\n      type\n      url\n      items {\n        id\n        resourceId\n        tags\n        title\n        type\n        url\n      }\n    }\n  }\n  fragment Menu on Menu {\n    id\n    items {\n      ...MenuItem\n    }\n  }\n': {
    return: LayoutQuery;
    variables: LayoutQueryVariables;
  };
  '#graphql\n  query customer(\n    $customerAccessToken: String!\n  ) {\n    customer(customerAccessToken: $customerAccessToken) {\n      firstName\n      email\n      id\n      scale: metafield(namespace: "custom", key: "price_scale") {\n        value\n      }\n    }\n  }\n': {
    return: CustomerQuery;
    variables: CustomerQueryVariables;
  };
  '#graphql\nquery ArticleLookup(\n  $language: LanguageCode\n  $articleQuery: String!\n) @inContext(language: $language) {\n  articles: search(\n    query: $articleQuery\n    first: 1\n    types: ARTICLE\n    reverse: true\n    sortKey: RELEVANCE\n  ) {\n    nodes {\n      ... on Article {\n        author: authorV2 {\n          name\n        }\n        contentHtml\n        handle\n        id\n        image {\n          id\n          altText\n          url\n          width\n          height\n        }\n        content\n        seo {\n          description\n          title\n        }\n        excerpt\n        desktop_image: metafield(namespace: "custom", key: "desktop_banner") {\n          value\n          reference {\n            ... on MediaImage {\n              id\n              alt\n              mediaContentType\n              image {\n                altText\n                height\n                id\n                url\n                width\n              }\n            }\n          }\n        }\n        mobile_image: metafield(namespace: "custom", key: "mobile_banner") {\n          value\n          reference {\n            ... on MediaImage {\n              id\n              alt\n              mediaContentType\n              image {\n                altText\n                height\n                id\n                url\n                width\n              }\n            }\n          }\n        }\n        blog {\n          seo {\n            description\n            title\n          }\n          id\n          title\n          handle\n        }\n        publishedAt\n        title\n      }\n    }\n  }\n}\n': {
    return: ArticleLookupQuery;
    variables: ArticleLookupQueryVariables;
  };
  '#graphql\nquery ArticleSidebar(\n  $language: LanguageCode\n) @inContext(language: $language) {\n  articles(first: 13, sortKey:PUBLISHED_AT, reverse: true) {\n    nodes{\n      author: authorV2 {\n        name\n      }\n      handle\n      id\n      image {\n        id\n        altText\n        url\n        width\n        height\n      }\n      content\n      seo {\n        description\n        title\n      }\n      excerpt\n      blog {\n        seo {\n          description\n          title\n        }\n        id\n        title\n        handle\n      }\n      publishedAt\n      title\n    }\n  }\n  blogs(first: 250) {\n    nodes{\n      title\n      handle\n    }\n  }\n}\n': {
    return: ArticleSidebarQuery;
    variables: ArticleSidebarQueryVariables;
  };
  '#graphql\n      query getShopPrimaryDomain { shop { primaryDomain { url } } }\n    ': {
    return: GetShopPrimaryDomainQuery;
    variables: GetShopPrimaryDomainQueryVariables;
  };
  '#graphql\n  query seoCollectionContent($country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    shop {\n      name\n      description\n    }\n  }\n': {
    return: SeoCollectionContentQuery;
    variables: SeoCollectionContentQueryVariables;
  };
  '#graphql\n  query heroCollectionContent($handle: String, $country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    hero: collection(handle: $handle) {\n      ...CollectionContent\n    }\n  }\n  #graphql\n  fragment CollectionContent on Collection {\n    id\n    handle\n    title\n    descriptionHtml\n    heading: metafield(namespace: "hero", key: "title") {\n      value\n    }\n    byline: metafield(namespace: "hero", key: "byline") {\n      value\n    }\n    cta: metafield(namespace: "hero", key: "cta") {\n      value\n    }\n    spread: metafield(namespace: "hero", key: "spread") {\n      reference {\n        ...Media\n      }\n    }\n    spreadSecondary: metafield(namespace: "hero", key: "spread_secondary") {\n      reference {\n        ...Media\n      }\n    }\n  }\n  #graphql\n  fragment Media on Media {\n    __typename\n    mediaContentType\n    alt\n    previewImage {\n      url\n    }\n    ... on MediaImage {\n      id\n      image {\n        id\n        url\n        width\n        height\n      }\n    }\n    ... on Video {\n      id\n      sources {\n        mimeType\n        url\n      }\n    }\n    ... on Model3d {\n      id\n      sources {\n        mimeType\n        url\n      }\n    }\n    ... on ExternalVideo {\n      id\n      embedUrl\n      host\n    }\n  }\n\n\n': {
    return: HeroCollectionContentQuery;
    variables: HeroCollectionContentQueryVariables;
  };
  '#graphql\n  query homepageFeaturedProducts($country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    products(first: 8) {\n      nodes {\n        ...ProductCard\n      }\n    }\n  }\n  #graphql\n  fragment ProductCard on Product {\n    id\n    title\n    handle\n    is_active_value: metafield(namespace: "product_extended_property", key: "is_active_value") {\n      value\n    }\n    is_always_in_stock: metafield(namespace: "product_extended_property", key: "is_always_in_stock") {\n      value\n    }\n    bin_no: metafield(namespace: "product_extended_property", key: "bin_no") {\n      value\n    }\n    variants(first: 1) {\n      nodes {\n        id\n        availableForSale\n        quantityAvailable\n        sku\n        image {\n          url\n          altText\n          width\n          height\n        }\n        price {\n          amount\n          currencyCode\n        }\n        compareAtPrice {\n          amount\n          currencyCode\n        }\n      }\n    }\n  }\n\n': {
    return: HomepageFeaturedProductsQuery;
    variables: HomepageFeaturedProductsQueryVariables;
  };
  '#graphql\n  query homepageFeaturedCollections($country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    collections(\n      first: 4,\n      sortKey: UPDATED_AT\n    ) {\n      nodes {\n        id\n        title\n        handle\n        image {\n          altText\n          width\n          height\n          url\n        }\n      }\n    }\n  }\n': {
    return: HomepageFeaturedCollectionsQuery;
    variables: HomepageFeaturedCollectionsQueryVariables;
  };
  '#graphql\n  query CustomerDetails(\n    $customerAccessToken: String!\n    $country: CountryCode\n    $language: LanguageCode\n  ) @inContext(country: $country, language: $language) {\n    customer(customerAccessToken: $customerAccessToken) {\n      ...CustomerDetails\n    }\n  }\n\n  fragment AddressPartial on MailingAddress {\n    id\n    formatted\n    firstName\n    lastName\n    company\n    address1\n    address2\n    country\n    province\n    city\n    zip\n    phone\n  }\n\n  fragment CustomerDetails on Customer {\n    firstName\n    lastName\n    phone\n    email\n    acceptsMarketing\n    defaultAddress {\n      ...AddressPartial\n    }\n    addresses(first: 6) {\n      edges {\n        node {\n          ...AddressPartial\n        }\n      }\n    }\n    orders(first: 250, sortKey: PROCESSED_AT, reverse: true) {\n      edges {\n        node {\n          ...OrderCard\n        }\n      }\n    }\n  }\n\n  #graphql\n  fragment OrderCard on Order {\n    id\n    orderNumber\n    processedAt\n    financialStatus\n    fulfillmentStatus\n    currentTotalPrice {\n      amount\n      currencyCode\n    }\n    fulfillmentData: metafield(namespace: "custom", key: "order_fulfillments") {\n      value\n    }\n    lineItems(first: 2) {\n      edges {\n        node {\n          variant {\n            image {\n              url\n              altText\n              height\n              width\n            }\n          }\n          title\n        }\n      }\n    }\n  }\n\n': {
    return: CustomerDetailsQuery;
    variables: CustomerDetailsQueryVariables;
  };
  '#graphql\n  fragment OrderMoney on MoneyV2 {\n    amount\n    currencyCode\n  }\n  fragment AddressFull on MailingAddress {\n    address1\n    address2\n    city\n    company\n    country\n    countryCodeV2\n    firstName\n    formatted\n    id\n    lastName\n    name\n    phone\n    province\n    provinceCode\n    zip\n  }\n  fragment DiscountApplication on DiscountApplication {\n    value {\n      __typename\n      ... on MoneyV2 {\n        amount\n        currencyCode\n      }\n      ... on PricingPercentageValue {\n        percentage\n      }\n    }\n  }\n  fragment Image on Image {\n    altText\n    height\n    src: url(transform: {crop: CENTER, maxHeight: 96, maxWidth: 96, scale: 2})\n    id\n    width\n  }\n  fragment ProductVariant on ProductVariant {\n    id\n    image {\n      ...Image\n    }\n    price {\n      ...OrderMoney\n    }\n    product {\n      handle\n    }\n    sku\n    title\n  }\n  fragment LineItemFull on OrderLineItem {\n    title\n    quantity\n    discountAllocations {\n      allocatedAmount {\n        ...OrderMoney\n      }\n      discountApplication {\n        ...DiscountApplication\n      }\n    }\n    originalTotalPrice {\n      ...OrderMoney\n    }\n    discountedTotalPrice {\n      ...OrderMoney\n    }\n    variant {\n      ...ProductVariant\n    }\n  }\n\n  query CustomerOrder(\n    $country: CountryCode\n    $language: LanguageCode\n    $orderId: ID!\n  ) @inContext(country: $country, language: $language) {\n    node(id: $orderId) {\n      ... on Order {\n        id\n        name\n        fulfillmentData: metafield(namespace: "custom", key: "order_fulfillments") {\n          value\n        }\n        orderNumber\n        processedAt\n        financialStatus\n        fulfillmentStatus\n        totalTaxV2 {\n          ...OrderMoney\n        }\n        totalPriceV2 {\n          ...OrderMoney\n        }\n        totalShippingPrice {\n          amount\n          currencyCode\n        }\n        totalShippingPriceV2 {\n          amount\n          currencyCode\n        }\n        subtotalPriceV2 {\n          ...OrderMoney\n        }\n        shippingAddress {\n          ...AddressFull\n        }\n        discountApplications(first: 100) {\n          nodes {\n            ...DiscountApplication\n          }\n        }\n        lineItems(first: 100) {\n          nodes {\n            ...LineItemFull\n          }\n        }\n      }\n    }\n  }\n': {
    return: CustomerOrderQuery;
    variables: CustomerOrderQueryVariables;
  };
  '#graphql\nquery PredictiveSearch($query: String!, $unavailableProducts: SearchUnavailableProductsType, $searchableFields: [SearchableField!], $types: [PredictiveSearchType!]) {\n  predictiveSearch(query: $query, unavailableProducts: $unavailableProducts, searchableFields: $searchableFields, types: $types) {\n    collections {\n      handle\n      title\n    }\n    queries {\n      text\n    }\n  }\n}\n': {
    return: PredictiveSearchQuery;
    variables: PredictiveSearchQueryVariables;
  };
  '#graphql\n  query ApiAllProducts(\n    $query: String\n    $count: Int\n    $reverse: Boolean\n    $country: CountryCode\n    $language: LanguageCode\n    $sortKey: ProductSortKeys\n  ) @inContext(country: $country, language: $language) {\n    products(first: $count, sortKey: $sortKey, reverse: $reverse, query: $query) {\n      nodes {\n        ...ProductCard\n      }\n    }\n  }\n  #graphql\n  fragment ProductCard on Product {\n    id\n    title\n    handle\n    is_active_value: metafield(namespace: "product_extended_property", key: "is_active_value") {\n      value\n    }\n    is_always_in_stock: metafield(namespace: "product_extended_property", key: "is_always_in_stock") {\n      value\n    }\n    bin_no: metafield(namespace: "product_extended_property", key: "bin_no") {\n      value\n    }\n    variants(first: 1) {\n      nodes {\n        id\n        availableForSale\n        quantityAvailable\n        sku\n        image {\n          url\n          altText\n          width\n          height\n        }\n        price {\n          amount\n          currencyCode\n        }\n        compareAtPrice {\n          amount\n          currencyCode\n        }\n      }\n    }\n  }\n\n': {
    return: ApiAllProductsQuery;
    variables: ApiAllProductsQueryVariables;
  };
  '#graphql\n  query Reviews(\n    $type: String!\n    $first: Int!\n    $after: String\n    $country: CountryCode\n    $language: LanguageCode\n  ) @inContext(country: $country, language: $language) {\n    metaobjects(type: $type, first: $first, after: $after, reverse: true) {\n      nodes {\n        id\n        updatedAt\n        reviewId: field(key: "review_id") {\n          value\n        }\n        user: field(key: "user") {\n          value\n        }\n        reviewContent: field(key: "review_content") {\n          value\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n': {
    return: ReviewsQuery;
    variables: ReviewsQueryVariables;
  };
  '#graphql\n  query CollectionDetails(\n    $handle: String!\n    $country: CountryCode\n    $language: LanguageCode\n    $filters: [ProductFilter!]\n    $sortKey: ProductCollectionSortKeys!\n    $reverse: Boolean\n    $first: Int\n    $last: Int\n    $startCursor: String\n    $endCursor: String\n  ) @inContext(country: $country, language: $language) {\n    collection(handle: $handle) {\n      id\n      handle\n      title\n      description\n      descriptionHtml\n      seo {\n        description\n        title\n      }\n      image {\n        id\n        url\n        width\n        height\n        altText\n      }\n      short_description: metafield(namespace: "custom", key: "short_description") {\n        value\n      }\n      products(\n        first: $first,\n        last: $last,\n        before: $startCursor,\n        after: $endCursor,\n        filters: $filters,\n        sortKey: $sortKey,\n        reverse: $reverse\n      ) {\n        filters {\n          id\n          label\n          type\n          values {\n            id\n            label\n            count\n            input\n          }\n        }\n        pageInfo {\n          hasPreviousPage\n          hasNextPage\n          hasNextPage\n          endCursor\n          startCursor\n        }\n      }\n    }\n    collections(first: 100) {\n      edges {\n        node {\n          title\n          handle\n        }\n      }\n    }\n  }\n': {
    return: CollectionDetailsQuery;
    variables: CollectionDetailsQueryVariables;
  };
  '#graphql\n  query Collections(\n    $country: CountryCode\n    $language: LanguageCode\n    $first: Int\n    $last: Int\n    $startCursor: String\n    $endCursor: String\n  ) @inContext(country: $country, language: $language) {\n    collections(first: $first, last: $last, before: $startCursor, after: $endCursor) {\n      nodes {\n        id\n        title\n        description\n        handle\n        seo {\n          description\n          title\n        }\n        image {\n          id\n          url\n          width\n          height\n          altText\n        }\n      }\n      pageInfo {\n        hasPreviousPage\n        hasNextPage\n        startCursor\n        endCursor\n      }\n    }\n  }\n': {
    return: CollectionsQuery;
    variables: CollectionsQueryVariables;
  };
  '#graphql\n  query FeaturedItems(\n    $country: CountryCode\n    $language: LanguageCode\n    $pageBy: Int = 12\n  ) @inContext(country: $country, language: $language) {\n    featuredCollections: collections(first: 3, sortKey: UPDATED_AT) {\n      nodes {\n        ...FeaturedCollectionDetails\n      }\n    }\n    featuredProducts: products(first: $pageBy) {\n      nodes {\n        ...ProductCard\n      }\n    }\n  }\n\n  #graphql\n  fragment ProductCard on Product {\n    id\n    title\n    handle\n    is_active_value: metafield(namespace: "product_extended_property", key: "is_active_value") {\n      value\n    }\n    is_always_in_stock: metafield(namespace: "product_extended_property", key: "is_always_in_stock") {\n      value\n    }\n    bin_no: metafield(namespace: "product_extended_property", key: "bin_no") {\n      value\n    }\n    variants(first: 1) {\n      nodes {\n        id\n        availableForSale\n        quantityAvailable\n        sku\n        image {\n          url\n          altText\n          width\n          height\n        }\n        price {\n          amount\n          currencyCode\n        }\n        compareAtPrice {\n          amount\n          currencyCode\n        }\n      }\n    }\n  }\n\n  #graphql\n  fragment FeaturedCollectionDetails on Collection {\n    id\n    title\n    handle\n    image {\n      altText\n      width\n      height\n      url\n    }\n  }\n\n': {
    return: FeaturedItemsQuery;
    variables: FeaturedItemsQueryVariables;
  };
  '#graphql\n  query ArticleDetails(\n    $language: LanguageCode\n    $blogHandle: String!\n    $articleHandle: String!\n  ) @inContext(language: $language) {\n    blog(handle: $blogHandle) {\n      articleByHandle(handle: $articleHandle) {\n        title\n        contentHtml\n        publishedAt\n        author: authorV2 {\n          name\n        }\n        image {\n          id\n          altText\n          url\n          width\n          height\n        }\n        seo {\n          description\n          title\n        }\n      }\n    }\n  }\n': {
    return: ArticleDetailsQuery;
    variables: ArticleDetailsQueryVariables;
  };
  '#graphql\nquery Blog(\n  $language: LanguageCode\n  $blogHandle: String!\n  $pageBy: Int!\n  $cursor: String\n) @inContext(language: $language) {\n  blog(handle: $blogHandle) {\n    title\n    seo {\n      title\n      description\n    }\n    articles(first: $pageBy, after: $cursor) {\n      edges {\n        node {\n          ...JournalArticle\n        }\n      }\n    }\n  }\n}\n\nfragment JournalArticle on Article {\n  author: authorV2 {\n    name\n  }\n  contentHtml\n  handle\n  id\n  image {\n    id\n    altText\n    url\n    width\n    height\n  }\n  publishedAt\n  title\n}\n': {
    return: BlogQuery;
    variables: BlogQueryVariables;
  };
  '#graphql\n  query PageDetails($language: LanguageCode, $handle: String!)\n  @inContext(language: $language) {\n    page(handle: $handle) {\n      id\n      title\n      body\n      seo {\n        description\n        title\n      }\n    }\n  }\n': {
    return: PageDetailsQuery;
    variables: PageDetailsQueryVariables;
  };
  '#graphql\n  fragment PolicyHandle on ShopPolicy {\n    body\n    handle\n    id\n    title\n    url\n  }\n\n  query PoliciesHandle(\n    $language: LanguageCode\n    $privacyPolicy: Boolean!\n    $shippingPolicy: Boolean!\n    $termsOfService: Boolean!\n    $refundPolicy: Boolean!\n  ) @inContext(language: $language) {\n    shop {\n      privacyPolicy @include(if: $privacyPolicy) {\n        ...PolicyHandle\n      }\n      shippingPolicy @include(if: $shippingPolicy) {\n        ...PolicyHandle\n      }\n      termsOfService @include(if: $termsOfService) {\n        ...PolicyHandle\n      }\n      refundPolicy @include(if: $refundPolicy) {\n        ...PolicyHandle\n      }\n    }\n  }\n': {
    return: PoliciesHandleQuery;
    variables: PoliciesHandleQueryVariables;
  };
  '#graphql\n  fragment PolicyIndex on ShopPolicy {\n    id\n    title\n    handle\n  }\n\n  query PoliciesIndex {\n    shop {\n      privacyPolicy {\n        ...PolicyIndex\n      }\n      shippingPolicy {\n        ...PolicyIndex\n      }\n      termsOfService {\n        ...PolicyIndex\n      }\n      refundPolicy {\n        ...PolicyIndex\n      }\n      subscriptionPolicy {\n        id\n        title\n        handle\n      }\n    }\n  }\n': {
    return: PoliciesIndexQuery;
    variables: PoliciesIndexQueryVariables;
  };
  '#graphql\n  query AllProducts(\n    $country: CountryCode\n    $language: LanguageCode\n    $first: Int\n    $last: Int\n    $startCursor: String\n    $endCursor: String\n  ) @inContext(country: $country, language: $language) {\n    products(first: $first, last: $last, before: $startCursor, after: $endCursor) {\n      nodes {\n        ...ProductCard\n      }\n      pageInfo {\n        hasPreviousPage\n        hasNextPage\n        startCursor\n        endCursor\n      }\n    }\n  }\n  #graphql\n  fragment ProductCard on Product {\n    id\n    title\n    handle\n    is_active_value: metafield(namespace: "product_extended_property", key: "is_active_value") {\n      value\n    }\n    is_always_in_stock: metafield(namespace: "product_extended_property", key: "is_always_in_stock") {\n      value\n    }\n    bin_no: metafield(namespace: "product_extended_property", key: "bin_no") {\n      value\n    }\n    variants(first: 1) {\n      nodes {\n        id\n        availableForSale\n        quantityAvailable\n        sku\n        image {\n          url\n          altText\n          width\n          height\n        }\n        price {\n          amount\n          currencyCode\n        }\n        compareAtPrice {\n          amount\n          currencyCode\n        }\n      }\n    }\n  }\n\n': {
    return: AllProductsQuery;
    variables: AllProductsQueryVariables;
  };
  '#graphql\n  query PaginatedProductsSearch(\n    $country: CountryCode\n    $endCursor: String\n    $first: Int\n    $language: LanguageCode\n    $last: Int\n    $searchTerm: String\n    $startCursor: String\n  ) @inContext(country: $country, language: $language) {\n    products(\n      first: $first,\n      last: $last,\n      before: $startCursor,\n      after: $endCursor,\n      sortKey: RELEVANCE,\n      query: $searchTerm\n    ) {\n      nodes {\n        ...ProductCard\n      }\n      pageInfo {\n        startCursor\n        endCursor\n        hasNextPage\n        hasPreviousPage\n      }\n    }\n  }\n\n  #graphql\n  fragment ProductCard on Product {\n    id\n    title\n    handle\n    is_active_value: metafield(namespace: "product_extended_property", key: "is_active_value") {\n      value\n    }\n    is_always_in_stock: metafield(namespace: "product_extended_property", key: "is_always_in_stock") {\n      value\n    }\n    bin_no: metafield(namespace: "product_extended_property", key: "bin_no") {\n      value\n    }\n    variants(first: 1) {\n      nodes {\n        id\n        availableForSale\n        quantityAvailable\n        sku\n        image {\n          url\n          altText\n          width\n          height\n        }\n        price {\n          amount\n          currencyCode\n        }\n        compareAtPrice {\n          amount\n          currencyCode\n        }\n      }\n    }\n  }\n\n': {
    return: PaginatedProductsSearchQuery;
    variables: PaginatedProductsSearchQueryVariables;
  };
  '#graphql\n  query sitemapArticles($first: Int!, $language: LanguageCode)\n  @inContext(language: $language) {\n    articles(first: $first, query: "published_status:\'published\'") {\n      nodes {\n        publishedAt\n        handle\n        onlineStoreUrl\n        blog {\n          handle\n        }\n      }\n    }\n  }\n': {
    return: SitemapArticlesQuery;
    variables: SitemapArticlesQueryVariables;
  };
  '#graphql\n  query sitemapBlogs($first: Int!, $language: LanguageCode)\n  @inContext(language: $language) {\n    blogs(first: $first) {\n      nodes {\n        handle\n      }\n    }\n  }\n': {
    return: SitemapBlogsQuery;
    variables: SitemapBlogsQueryVariables;
  };
  '#graphql\n  query sitemapCollections($first: Int!, $language: LanguageCode)\n  @inContext(language: $language) {\n    collections(\n      first: $first\n      query: "published_status:\'online_store:visible\'"\n    ) {\n      nodes {\n        updatedAt\n        handle\n        onlineStoreUrl\n      }\n    }\n  }\n': {
    return: SitemapCollectionsQuery;
    variables: SitemapCollectionsQueryVariables;
  };
  '#graphql\n  query sitemapPages($first: Int!, $language: LanguageCode)\n  @inContext(language: $language) {\n    pages(first: $first, query: "published_status:\'published\'") {\n      nodes {\n        updatedAt\n        handle\n        onlineStoreUrl\n      }\n    }\n  }\n': {
    return: SitemapPagesQuery;
    variables: SitemapPagesQueryVariables;
  };
}

interface GeneratedMutationTypes {
  '#graphql\n  mutation QuoteCartCreate($input: CartInput!) {\n    cartCreate(input: $input) {\n      cart {\n        id\n        checkoutUrl\n        totalQuantity\n        attributes {\n          key\n          value\n        }\n        buyerIdentity {\n          email\n        }\n      }\n      userErrors {\n        field\n        message\n      }\n    }\n  }\n': {
    return: QuoteCartCreateMutation;
    variables: QuoteCartCreateMutationVariables;
  };
  '#graphql\n  mutation customerActivate($id: ID!, $input: CustomerActivateInput!) {\n    customerActivate(id: $id, input: $input) {\n      customerAccessToken {\n        accessToken\n        expiresAt\n      }\n      customerUserErrors {\n        code\n        field\n        message\n      }\n    }\n  }\n': {
    return: CustomerActivateMutation;
    variables: CustomerActivateMutationVariables;
  };
  '#graphql\n  mutation customerAddressUpdate(\n    $address: MailingAddressInput!\n    $customerAccessToken: String!\n    $id: ID!\n  ) {\n    customerAddressUpdate(\n      address: $address\n      customerAccessToken: $customerAccessToken\n      id: $id\n    ) {\n      customerUserErrors {\n        code\n        field\n        message\n      }\n    }\n  }\n': {
    return: CustomerAddressUpdateMutation;
    variables: CustomerAddressUpdateMutationVariables;
  };
  '#graphql\n  mutation customerAddressDelete($customerAccessToken: String!, $id: ID!) {\n    customerAddressDelete(customerAccessToken: $customerAccessToken, id: $id) {\n      customerUserErrors {\n        code\n        field\n        message\n      }\n      deletedCustomerAddressId\n    }\n  }\n': {
    return: CustomerAddressDeleteMutation;
    variables: CustomerAddressDeleteMutationVariables;
  };
  '#graphql\n  mutation customerDefaultAddressUpdate(\n    $addressId: ID!\n    $customerAccessToken: String!\n  ) {\n    customerDefaultAddressUpdate(\n      addressId: $addressId\n      customerAccessToken: $customerAccessToken\n    ) {\n      customerUserErrors {\n        code\n        field\n        message\n      }\n    }\n  }\n': {
    return: CustomerDefaultAddressUpdateMutation;
    variables: CustomerDefaultAddressUpdateMutationVariables;
  };
  '#graphql\n  mutation customerAddressCreate(\n    $address: MailingAddressInput!\n    $customerAccessToken: String!\n  ) {\n    customerAddressCreate(\n      address: $address\n      customerAccessToken: $customerAccessToken\n    ) {\n      customerAddress {\n        id\n      }\n      customerUserErrors {\n        code\n        field\n        message\n      }\n    }\n  }\n': {
    return: CustomerAddressCreateMutation;
    variables: CustomerAddressCreateMutationVariables;
  };
  '#graphql\n  mutation accountEditCustomerUpdate($customerAccessToken: String!, $customer: CustomerUpdateInput!) {\n    customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {\n      customerUserErrors {\n        code\n        field\n        message\n      }\n    }\n  }\n  ': {
    return: AccountEditCustomerUpdateMutation;
    variables: AccountEditCustomerUpdateMutationVariables;
  };
  '#graphql\n    # https://shopify.dev/docs/api/storefront/latest/mutations/customerUpdate\n    mutation customerUpdate(\n      $customerAccessToken: String!,\n      $customer: CustomerUpdateInput!\n      $country: CountryCode\n      $language: LanguageCode\n    ) @inContext(language: $language, country: $country) {\n      customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {\n        customer {\n          acceptsMarketing\n          email\n          firstName\n          id\n          lastName\n          phone\n        }\n        customerAccessToken {\n          accessToken\n          expiresAt\n        }\n        customerUserErrors {\n          code\n          field\n          message\n        }\n      }\n    }\n  ': {
    return: CustomerUpdateMutation;
    variables: CustomerUpdateMutationVariables;
  };
  '#graphql\n  mutation customerRecover($email: String!) {\n    customerRecover(email: $email) {\n      customerUserErrors {\n        code\n        field\n        message\n      }\n    }\n  }\n': {
    return: CustomerRecoverMutation;
    variables: CustomerRecoverMutationVariables;
  };
  '#graphql\n  mutation customerReset($id: ID!, $input: CustomerResetInput!) {\n    customerReset(id: $id, input: $input) {\n      customerAccessToken {\n        accessToken\n        expiresAt\n      }\n      customerUserErrors {\n        code\n        field\n        message\n      }\n    }\n  }\n': {
    return: CustomerResetMutation;
    variables: CustomerResetMutationVariables;
  };
  '#graphql\n  mutation customerCreate($input: CustomerCreateInput!) {\n    customerCreate(input: $input) {\n      customer {\n        id\n      }\n      customerUserErrors {\n        code\n        field\n        message\n      }\n    }\n  }\n': {
    return: CustomerCreateMutation;
    variables: CustomerCreateMutationVariables;
  };
  '#graphql\n  # https://shopify.dev/docs/api/storefront/latest/mutations/customerUpdate\n  mutation profileCustomerUpdate(\n    $customerAccessToken: String!,\n    $customer: CustomerUpdateInput!\n    $country: CountryCode\n    $language: LanguageCode\n  ) @inContext(language: $language, country: $country) {\n    customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {\n      customer {\n        acceptsMarketing\n        email\n        firstName\n        id\n        lastName\n        phone\n      }\n      customerAccessToken {\n        accessToken\n        expiresAt\n      }\n      customerUserErrors {\n        code\n        field\n        message\n      }\n    }\n  }\n': {
    return: ProfileCustomerUpdateMutation;
    variables: ProfileCustomerUpdateMutationVariables;
  };
}

declare module '@shopify/hydrogen' {
  interface StorefrontQueries extends GeneratedQueryTypes {}
  interface StorefrontMutations extends GeneratedMutationTypes {}
}
