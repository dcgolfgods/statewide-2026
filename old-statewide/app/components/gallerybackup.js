import React, { useState, useRef, useEffect, useCallback  } from 'react';
import { Image } from '@shopify/hydrogen';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Thumbs, Navigation } from 'swiper/modules';
import 'swiper/css/navigation';

// import 'swiper/swiper-bundle.min.css';

export function ProductGallery({ media, className, showMultiDiscount }) {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  const navigationPrevRef = React.useRef(null)
  const navigationNextRef = React.useRef(null);

  const [swiperRef, setSwiperRef] = useState(null);

  useEffect(()=>{
    try{
      if(window.innerWidth > 1024){
        // $(".zoom-img").ezPlus({
        //   // zoomWindowWidth: 300,
        //   // zoomWindowHeight: 300,
        //   zoomWindowOffsetX: 100
        // });
      }
      // Fancybox?.bind('[data-fancybox="gallery"]', {
      //   //
      // });  
    }catch(e){

    }
  }, [])

  const handleLeftClick = useCallback(() => {
    if (!swiperRef) return;
    swiperRef.slidePrev();
  }, [swiperRef]);

  const handleRightClick = useCallback(() => {
    if (!swiperRef) return;
    swiperRef.slideNext();
  }, [swiperRef]);
 
  
  // Ensure media is initialized properly
  if (!media || media.length === 0) {
    media = [
      {
        id: "123",
        image: { id: 'gid://shopify/ImageSource/37303470850341', url: 'https://cdn.shopify.com/s/files/1/0799/5929/4245/files/Image_coming_soon_Website.webp?v=1724582291', width: 1500, height: 1000 },
        __typename: "MediaImage",
        previewImage: { url: 'https://cdn.shopify.com/s/files/1/0799/5929/4245/files/Image_coming_soon_Website.webp?v=1724582291' }
      }
    ];
  }

  

  return (
    <div className={`w-full lg:w-[50%] px-[15px] ${className} product-page-slider relative`}>
      {showMultiDiscount && <div className='absolute top-0 left-0 bg-[#1e5097] text-white px-[15px] font-bold text-[12px] py-[4px] z-[10]'>
        Multi-buy discount
      </div>}
      <div className='max-w-[100%] lg:px-[60px] mx-auto relative'>
      <div onClick={handleLeftClick} ref={navigationPrevRef} className={`border-none swiper-button-prev cursor-pointer z-10 absolute left-0 top-1/2 transform  -translate-y-1/2 ${media.length <= 1 && ' hidden'}`}>
      </div>
      <div onClick={handleRightClick} ref={navigationNextRef} className={`border-none swiper-button-next cursor-pointer z-10 absolute  top-1/2 transform right-0 -translate-y-1/2 ${media.length <= 1 && ' hidden'}`}>
      </div>
      <Swiper
        onSwiper={setSwiperRef}
        spaceBetween={50}
        slidesPerView={1}
        modules={[Navigation]}
        thumbs={{swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null}}
        className="main-slider mb-6"
      >
        {media.map((med, i) => {
          const image =
            med.__typename === 'MediaImage'
              ? { ...med.image, altText: med.alt || 'Product image' }
              : null;

          return (
            <SwiperSlide key={med.id || image?.id}>
              {image && (
                 <a
                 data-fancybox="gallery"
                 data-src={image.url}
                 >
                                  <Image
                  loading={i === 0 ? 'eager' : 'lazy'}
                  data={image}
                  // onClick={()=> photoZoom()}
                  data-zoom-image={image.url}
                  className={`zoom-img zoom-img-${i} lg:max-w-[90%] max-h-[300px] object-cover w-full h-full aspect-square fadeIn`}
                />
                </a>

              )}
            </SwiperSlide>
          );
        })}
      </Swiper>
      </div>
      <div className={`${media.length == 1 && 'hidden'}`}>
      <Swiper
        onSwiper={setThumbsSwiper}
        modules={[Thumbs]}
        className="thumbs-slider"
        slidesPerView={4}
      >
        {media.map((med, i) => {
          const image =
            med.__typename === 'MediaImage'
              ? { ...med.image, altText: med.alt || 'Product image' }
              : null;

          return (
            <SwiperSlide key={med.id || image?.id}>
              {image && (
                <Image
                  loading={i === 0 ? 'eager' : 'lazy'}
                  data={image}
                  className="w-full h-auto"
                />
              )}
            </SwiperSlide>
          );
        })}
      </Swiper>
      </div>
      {/* <ProductSwipe media={media} /> */}
    </div>
  );
}


const ProductSwipe = (media) =>{
  
  

  return (
  <div className="pswp" id="product-photo-swipe" tabindex="-1" role="dialog" aria-hidden="true">
 
  <div className="pswp__bg"></div>

  <div className="pswp__scroll-wrap">

  
      <div className="pswp__container">
          <div className="pswp__item"></div>
          <div className="pswp__item"></div>
          <div className="pswp__item"></div>
      </div>

      <div className="pswp__ui pswp__ui--hidden">

          <div className="pswp__top-bar">


              <div className="pswp__counter"></div>

              <button className="pswp__button pswp__button--close" title="Close (Esc)"></button>

              <button className="pswp__button pswp__button--share" title="Share"></button>

              <button className="pswp__button pswp__button--fs" title="Toggle fullscreen"></button>

              <button className="pswp__button pswp__button--zoom" title="Zoom in/out"></button>

              <div className="pswp__preloader">
                  <div className="pswp__preloader__icn">
                    <div className="pswp__preloader__cut">
                      <div className="pswp__preloader__donut"></div>
                    </div>
                  </div>
              </div>
          </div>

          <div className="pswp__share-modal pswp__share-modal--hidden pswp__single-tap">
              <div className="pswp__share-tooltip"></div> 
          </div>

          <button className="pswp__button pswp__button--arrow--left" title="Previous (arrow left)">
          </button>

          <button className="pswp__button pswp__button--arrow--right" title="Next (arrow right)">
          </button>

          <div className="pswp__caption">
              <div className="pswp__caption__center"></div>
          </div>

      </div>

  </div>

</div>
  )
}
