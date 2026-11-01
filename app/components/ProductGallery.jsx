import React, {useEffect, useState} from 'react';
import {Image} from '@shopify/hydrogen';
import {
  filterProductGalleryMedia,
  GOOGLE_SHOPPING_OVERLAY_CLASS,
  GOOGLE_SHOPPING_OVERLAY_STYLE,
} from '~/lib/productMedia';

const PLACEHOLDER_MEDIA = [
  {
    id: '123',
    image: {
      id: 'gid://shopify/ImageSource/37303470850341',
      url: 'https://cdn.shopify.com/s/files/1/0799/5929/4245/files/Image_coming_soon_Website.webp?v=1724582291',
      width: 1500,
      height: 1000,
    },
    __typename: 'MediaImage',
  },
];

export function ProductGallery(props) {
  const [ClientComponent, setClientComponent] = useState(null);
  const {
    media,
    className,
    compatibility,
    showMultiDiscount,
    title,
    sku,
    imageAlt,
  } = props;

  useEffect(() => {
    let isMounted = true;
    import('./ProductGallery.client').then((mod) => {
      if (isMounted) {
        setClientComponent(() => mod.ProductGallery);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  if (!ClientComponent) {
    const {media: filteredMedia, firstIsGoogleShopping} =
      filterProductGalleryMedia(media);
    const displayMedia = filteredMedia.length
      ? filteredMedia
      : PLACEHOLDER_MEDIA;
    const first =
      displayMedia.find((med) => med.__typename === 'MediaImage') ||
      displayMedia[0];
    const image = first?.__typename === 'MediaImage' ? first.image : null;
    const alt = imageAlt || (sku ? `${sku} ${title}` : title);
    const showOverlay =
      filteredMedia.length > 0 &&
      firstIsGoogleShopping &&
      first?.__typename === 'MediaImage';
    return (
      <div
        className={`w-full lg:w-[50%] px-[15px] ${className} product-page-slider relative min-h-[321px]`}
      >
        {compatibility && (
          <div className="absolute top-0 left-0 bg-[#00aeef] text-white px-[5px] ml-[4px] mt-[4px] font-bold lg:text-[12px] text-[8px] py-[4px] z-[2]">
            Check compatibility
          </div>
        )}
        {!compatibility && showMultiDiscount && (
          <div className="absolute top-0 left-0 bg-[#1e5097] text-white px-[15px] font-bold text-[12px] py-[4px] z-[10]">
            Multi-buy discount
          </div>
        )}
        <div className="max-w-[100%] lg:px-[60px] mx-auto relative">
          {image && (
            <div className="relative lg:max-w-[90%] mx-auto">
              <Image
                alt={alt}
                loading="eager"
                decoding="sync"
                data={{...image, altText: alt}}
                sizes="(min-width: 1024px) 540px, 100vw"
                fetchPriority="high"
                className="max-h-[300px] object-cover w-full h-full aspect-square"
              />
              {showOverlay && (
                <div
                  aria-hidden="true"
                  className={GOOGLE_SHOPPING_OVERLAY_CLASS}
                  style={GOOGLE_SHOPPING_OVERLAY_STYLE}
                />
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return <ClientComponent {...props} />;
}
