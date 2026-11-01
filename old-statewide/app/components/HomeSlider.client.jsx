import {Swiper, SwiperSlide} from 'swiper/react';
import {Pagination, Autoplay} from 'swiper/modules';
import {Link} from '~/components';
import {Image} from '@shopify/hydrogen';
import {useState, useEffect} from 'react';
import {HOME_SLIDES} from './home-slider-data';

export function HomeSlider() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return (
    <div className="home-slider container mx-auto lg:px-0 px-4">
      <div className="lg:mt-8 mt-4">
        <div className="image relative home-slider-frame">
          <Swiper
            pagination={{clickable: true}}
            modules={[Pagination, Autoplay]}
            slidesPerView={1}
            autoplay={
              isMobile
                ? false
                : {
                    delay: 5000,
                    disableOnInteraction: false,
                  }
            }
            loop={true}
            className="w-full flex h-full"
          >
            {HOME_SLIDES.map((image, index) => (
              <SwiperSlide key={index}>
                <div className="relative w-full h-full">
                  <Link to={image.url} className="hidden lg:block w-full">
                    <Image
                      className="w-full object-cover"
                      src={image.img}
                      sizes="(min-width: 1024px) 1140px, 100vw"
                      fetchPriority="low"
                      loading="lazy"
                    />
                  </Link>
                  <Link to={image.url} className="block lg:hidden w-full">
                    <Image
                      className="w-full object-cover"
                      src={image.mobImg}
                      sizes="100vw"
                      fetchPriority={index === 0 ? 'high' : 'low'}
                      loading={index === 0 ? 'eager' : 'lazy'}
                    />
                  </Link>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
}
