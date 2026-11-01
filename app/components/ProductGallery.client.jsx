import React, { useState, useRef, useEffect } from 'react';
import { Image } from '@shopify/hydrogen';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Thumbs, Navigation } from 'swiper/modules';
import { IconClose } from './Icon';
import { CustomZoom, ZoomControls } from './CustomZoom';
import {
  filterProductGalleryMedia,
  GOOGLE_SHOPPING_OVERLAY_CLASS,
  GOOGLE_SHOPPING_OVERLAY_STYLE,
} from '~/lib/productMedia';



export function ProductGallery({
  media,
  className,
  showMultiDiscount,
  compatibility,
  title,
  sku,
  imageAlt,
}) {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [mainSwiper, setMainSwiper] = useState(null);
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false); // State for popup
  const [currentSlide, setCurrentSlide] = useState(0); // State to track the current slide
  const alt = imageAlt || (sku ? `${sku} ${title}` : title);

   // Clean up Swiper instance on component unmount
  
  useEffect(() => {
    if (isFullScreenOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isFullScreenOpen]);
  const openFullScreen = (index) => {
    setCurrentSlide(index); // Set the current slide to the clicked image
    setIsFullScreenOpen(true); // Open the full-screen modal
  };

  // Fallback media if none provided.
  if (!media || media.length === 0) {
    media = [
      {
        id: '123',
        image: {
          id: 'gid://shopify/ImageSource/37303470850341',
          url: 'https://cdn.shopify.com/s/files/1/0799/5929/4245/files/Image_coming_soon_Website.webp?v=1724582291',
          width: 1500,
          height: 1000,
        },
        __typename: 'MediaImage',
        previewImage: { url: 'https://cdn.shopify.com/s/files/1/0799/5929/4245/files/Image_coming_soon_Website.webp?v=1724582291' }
      }
    ];
  }
  const {media: filteredMedia, firstIsGoogleShopping} =
    filterProductGalleryMedia(media);
  const isMediaExist = filteredMedia.length > 0;
  let widthClass = 'w-full';
  if(filteredMedia.length == 1){
    widthClass = 'w-[25%] !ml-0'
  }else if(filteredMedia.length == 2){
    widthClass = 'w-[50%] !ml-0'
  }else if(filteredMedia.length == 3){
    widthClass = 'w-[75%] !ml-0'
  }
  return (
    <>
      <div className={`w-full lg:w-[50%] px-[15px] ${className} product-page-slider relative min-h-[321px]`}>
        {compatibility &&  <div className='absolute top-0 left-0 bg-[#00aeef] text-white px-[5px] ml-[4px] mt-[4px] font-bold lg:text-[12px] text-[8px] py-[4px] z-[2]'>
          Check compatibility
        </div>}
        {!compatibility &&showMultiDiscount && (
          <div className="absolute top-0 left-0 bg-[#1e5097] text-white px-[15px] font-bold text-[12px] py-[4px] z-[10]">
            Multi-buy discount
          </div>
        )}
        <div className="max-w-[100%] lg:px-[60px] mx-auto relative">
          <Swiper
            onSwiper={setMainSwiper}
            spaceBetween={10}
            slidesPerView={1}
            modules={[Thumbs, Navigation]}
            thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
            navigation={filteredMedia.length > 1}
            loop={filteredMedia.length > 1}
            className="main-slider mb-6"
          >
            {filteredMedia.map((med, i) => {
              const image =
                med.__typename === 'MediaImage'
                  ? { ...med.image, altText: alt }
                  : null;
              const showOverlay = i === 0 && firstIsGoogleShopping && image;
              return (
                <SwiperSlide key={med.id || image?.id}>
                  {image && (
                    <a onClick={() => openFullScreen(i)} data-fancybox="gallery" data-src={image.url} className="relative block lg:max-w-[90%]">
                      <Image
                        alt={alt}
                        loading={i === 0 ? 'eager' : 'lazy'}
                        decoding={i === 0 ? 'sync' : 'async'}
                        data={image}
                        sizes="(min-width: 1024px) 540px, 100vw"
                        fetchpriority={i === 0 ? 'high' : 'low'}
                        className={`zoom-img zoom-img-${i} max-h-[300px] object-cover w-full h-full aspect-square fadeIn cursor-pointer`}
                      />
                      {showOverlay && (
                        <div
                          aria-hidden="true"
                          className={GOOGLE_SHOPPING_OVERLAY_CLASS}
                          style={GOOGLE_SHOPPING_OVERLAY_STYLE}
                        />
                      )}
                    </a>
                  )}
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>

        <div className="flex justify-start">
          <Swiper
            onSwiper={setThumbsSwiper}
            modules={[Thumbs]}
            className={`thumbs-slider ${widthClass}`}
            slidesPerView={filteredMedia.length > 4 ? 4 : filteredMedia.length}
            spaceBetween={10}
            watchSlidesProgress={true}
            freeMode={true}
          >
            {filteredMedia.map((med, i) => {
              const image =
                med.__typename === 'MediaImage'
                  ? { ...med.image, altText: alt }
                  : null;
              const showOverlay = i === 0 && firstIsGoogleShopping && image;

              return (
                <SwiperSlide key={med.id || image?.id}>
                  {image && (
                    <div className="relative">
                      <Image
                        alt={alt}
                        loading={'lazy'}
                        data={image}
                        sizes="120px"
                        className="cursor-pointer w-full h-auto"
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
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>

      {/* Full-screen modal with zoom functionality */}
      {isFullScreenOpen && isMediaExist && (
        <FullScreenGallery
          media={filteredMedia}
          alt={alt}
          currentSlide={currentSlide}
          firstIsGoogleShopping={firstIsGoogleShopping}
          onClose={() => setIsFullScreenOpen(false)} // Function to close modal
        />
      )}
    </>
  );
}

const MobileFullScreenGallery = ({ media, currentSlide, onClose, alt, firstIsGoogleShopping }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(currentSlide);
  const [currentScale, setCurrentScale] = useState(1);
  const zoomRef = useRef(null);

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
    if (zoomRef.current && zoomRef.current.reset) {
      zoomRef.current.reset();
    }
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
    if (zoomRef.current && zoomRef.current.reset) {
      zoomRef.current.reset();
    }
  };

  const handleZoomIn = () => {
    if (zoomRef.current && zoomRef.current.zoomIn) {
      setCurrentScale(1.5);
      zoomRef.current.zoomIn(1.5);
    }
  };

  const handleZoomOut = () => {
    if (zoomRef.current && zoomRef.current.zoomOut) {
      setCurrentScale(1);
      zoomRef.current.zoomOut(1);
    }
  };

  const currentImage = media[currentImageIndex];
  const image = currentImage?.__typename === 'MediaImage'
    ? { ...currentImage.image, altText: alt || 'Product image' }
    : null;
  const showOverlay =
    currentImageIndex === 0 && firstIsGoogleShopping && image;

  return (
    <div className="fixed inset-0 bg-gray-500/90 z-[1000] lg:hidden flex items-center justify-center">
      {/* Desktop modal container */}
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-screen max-h-[100vh] relative overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#1e5097] text-xl z-20 p-2 hover:bg-gray-100 rounded-full transition-all duration-200"
        >
          <IconClose className="w-8 h-8" />
        </button>

        {/* Navigation arrows */}
        {media.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-gray-600 hover:text-gray-800 rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-gray-600 hover:text-gray-800 rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Image container */}
        <div className="w-full h-full relative flex items-center justify-center p-8">
          {image && (
            <div className="relative max-w-full max-h-full">
              <CustomZoom
                ref={zoomRef}
                key={`mobile-${currentImageIndex}`}
                minScale={1}
                maxScale={3}
                initialScale={1}
                onZoomChange={setCurrentScale}
              >
                <Image
                  alt={alt || 'Product image'}
                  loading="eager"
                  data={image}
                  sizes="100vw"
                  className="max-w-full max-h-full object-contain"
                />
              </CustomZoom>
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

        {/* Zoom Controls */}
        {/* <ZoomControls
          key={`mobile-${currentScale}`}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          canZoomIn={currentScale < 3}
          canZoomOut={currentScale > 1}
          currentScale={currentScale}
        /> */}
      </div>
    </div>
  );
};



// Desktop FullScreenGallery Component
const DesktopFullScreenGallery = ({ media, currentSlide, onClose, alt, firstIsGoogleShopping }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(currentSlide);
  const [currentScale, setCurrentScale] = useState(1);
  const zoomRef = useRef(null);

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
    if (zoomRef.current && zoomRef.current.reset) {
      zoomRef.current.reset();
    }
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
    if (zoomRef.current && zoomRef.current.reset) {
      zoomRef.current.reset();
    }
  };

  const handleZoomIn = () => {
    if (zoomRef.current && zoomRef.current.zoomIn) {
      zoomRef.current.zoomIn(1.5);
    }
  };

  const handleZoomOut = () => {
    if (zoomRef.current && zoomRef.current.zoomOut) {
      zoomRef.current.zoomOut(1.5);
    }
  };

  const currentImage = media[currentImageIndex];
  const image = currentImage?.__typename === 'MediaImage'
    ? { ...currentImage.image, altText: alt || 'Product image' }
    : null;
  const showOverlay =
    currentImageIndex === 0 && firstIsGoogleShopping && image;

  return (
    <div className="fixed inset-0 bg-gray-500/90 z-[1000] hidden lg:flex items-center justify-center p-4">
      {/* Desktop modal container */}
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-full max-h-[90vh] relative overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#1e5097] text-xl z-20 p-2 hover:bg-gray-100 rounded-full transition-all duration-200"
        >
          <IconClose className="w-8 h-8" />
        </button>

        {/* Navigation arrows */}
        {media.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-gray-600 hover:text-gray-800 rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-gray-600 hover:text-gray-800 rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Image container */}
        <div className="w-full h-full relative flex items-center justify-center p-8">
          {image && (
            <div className="relative max-w-full max-h-full">
              <CustomZoom
                ref={zoomRef}
                key={`desktop-${currentImageIndex}`}
                minScale={1}
                maxScale={1.5}
                pinch={false}
                initialScale={1}
                onZoomChange={setCurrentScale}
              >
                <Image
                  alt={alt || 'Product image'}
                  loading="eager"
                  data={image}
                  sizes="100vw"
                  className="max-w-full max-h-full object-contain"
                />
              </CustomZoom>
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

        {/* Zoom Controls */}
        <ZoomControls
          key={`desktop-${currentScale}`}
          currentScale={currentScale}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          canZoomIn={currentScale === 1}
          canZoomOut={currentScale > 1}
        />

      </div>
    </div>
  );
};

// Main FullScreenGallery Component that renders appropriate version
const FullScreenGallery = ({ media, currentSlide, onClose, alt, firstIsGoogleShopping }) => {
  return (
    <>
      <MobileFullScreenGallery media={media} currentSlide={currentSlide} onClose={onClose} alt={alt} firstIsGoogleShopping={firstIsGoogleShopping} />
      <DesktopFullScreenGallery media={media} currentSlide={currentSlide} onClose={onClose} alt={alt} firstIsGoogleShopping={firstIsGoogleShopping} />
    </>
  );
};
