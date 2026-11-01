import {homeReviewDesk, homeImages, homeImagesNZ} from './home-data';
import {Image} from '@shopify/hydrogen';
import {Link} from '~/components';
import {useMatches} from 'react-router';
import {useState} from 'react';
import {Swiper, SwiperSlide} from 'swiper/react';
import {Autoplay, Navigation, Controller} from 'swiper/modules';
import {DEFAULT_LOCALE} from '~/lib/utils';

export function HomeReviews({skipResources}) {
  return (
    <>
      <DeskHomeReviews skipResources={skipResources} />
      <XSHomeReviews skipResources={skipResources} />
    </>
  );
}

function DeskHomeReviews({skipResources}) {
  const [root] = useMatches();
  const [controlledSwiper, setControlledSwiper] = useState(null);

  const selectedLocale = root.data?.selectedLocale ?? DEFAULT_LOCALE;
  let images = homeImages;
  if (selectedLocale.country == 'NZ') {
    images = homeImagesNZ;
  }
  return (
    <>
      <div className="hidden lg:block">
        <div className="home-reviews py-[15px]">
          <div className="relative lg:px-0 px-4 container mx-auto">
            <div className="relative mx-auto">
              <Swiper
                controller={{control: controlledSwiper}}
                navigation={true}
                loop={true}
                speed={500}
                slidesPerView={1}
                autoHeight={true}
                modules={[Autoplay, Navigation, Controller]}
              >
                {homeReviewDesk.map((review, i) => {
                  return (
                    <SwiperSlide key={i}>
                      <div className="lg:px-[50px]">
                        <Link to="/reviews" className="text-[#00aeef]">
                          <h4 className="mb-[10px] text-[#1e5097] font-bold text-center text-[16px] lg:text-[24px]">What our customers say about us...</h4>
                          <div className="img w-[140px] mx-auto pb-[15px]">
                            <Image src="https://cdn.shopify.com/s/files/1/0799/5929/4245/files/Frame_1597881981.png?v=1754046381" alt="" className="w-full" loading="lazy" />
                          </div>
                          <p className="msg text-[14px] text-black mb-[12px] text-center">"{review.msg}"</p>
                          <p className="author text-[14px] text-[#1e5097] font-bold  mb-[10px] text-center">{review.user}</p>
                        </Link>
                      </div>
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            </div>
          </div>
        </div>
        <div className="home-images ">
          <div className="container mx-auto">
            <Swiper
              modules={[Controller]}
              onSwiper={setControlledSwiper}
              autoHeight={true}
              loop={true}
              slidesPerView={1}
              navigation={false}
              speed={500}
            >
              {images.map((review, i) => {
                if (i % 2 === 0 && i + 1 < images.length) {
                  const image1 = images[i];
                  const image2 = images[i + 1];
                  return (
                    <SwiperSlide key={i}>
                      <div className="flex gap-[30px] justify-center">
                        <Link to={image1.url} className="w-full block text-[#00aeef]">
                          <Image src={image1.img} alt={image1.alt} className="w-full block" loading="lazy" />
                        </Link>
                        <Link to={image2.url} className="w-full block text-[#00aeef]">
                          <Image src={image2.img} alt={image2.alt} className="w-full block" loading="lazy" />
                        </Link>
                      </div>
                    </SwiperSlide>
                  );
                }
                return null;
              })}
            </Swiper>
          </div>
        </div>
      </div>
    </>
  );
}

function XSHomeReviews({skipResources}) {
  const [root] = useMatches();
  const [controlledSwiper, setControlledSwiper] = useState(null);

  const selectedLocale = root.data?.selectedLocale ?? DEFAULT_LOCALE;
  let images = homeImages;
  if (selectedLocale.country == 'NZ') {
    images = homeImagesNZ;
  }
  return (
    <>
      <div className="lg:hidden">
        <div className="home-reviews pt-[15px] pb-[15px]">
          <div className="container">
            <Swiper
              controller={{control: controlledSwiper}}
              navigation={true}
              loop={true}
              speed={500}
              slidesPerView={1}
              autoHeight={true}
              modules={[Autoplay, Navigation, Controller]}
            >
              {homeReviewDesk.map((review, i) => {
                return (
                  <SwiperSlide key={i}>
                    <div className="lg:px-[50px]">
                      <Link to="/reviews" className="text-[#00aeef]">
                        <h4 className="mb-[10px] text-[#1e5097] font-bold text-center text-[14px] lg:text-[24px]">What our customers say about us...</h4>
                        <div className="img w-[100px] lg:w-[140px] mx-auto pb-[12px]">
                          <Image src="https://cdn.shopify.com/s/files/1/0799/5929/4245/files/Frame_1597881981.png?v=1754046381" alt="" className="w-full" loading="lazy" />
                        </div>
                        <p className="msg text-[12px] text-black mb-[12px] text-center">"{review.msg}"</p>
                        <p className="author text-[12px] text-[#00aeef] font-bold  mb-[0] text-center">{review.user}</p>
                      </Link>
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>

            <div className="w-full flex justify-center my-4 relative z-[1]"></div>
          </div>
        </div>
        <div className="home-images ">
          <div className="container mx-auto">
            <Swiper
              modules={[Controller]}
              onSwiper={setControlledSwiper}
              autoHeight={true}
              loop={true}
              slidesPerView={1}
              navigation={false}
              speed={500}
            >
              {images.map((review, i) => {
                return (
                  <SwiperSlide key={i}>
                    <div className="flex gap-[30px] justify-center">
                      <Link to={review.url} className="w-full block text-[#00aeef]">
                        <Image src={review.img_mobile} alt={review.mobileAlt} className="w-full" loading="lazy" />
                      </Link>
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        </div>
      </div>
    </>
  );
}
