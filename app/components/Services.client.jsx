import {useMatches} from 'react-router';
import {Swiper, SwiperSlide} from 'swiper/react';
import {Autoplay} from 'swiper/modules';
import {DEFAULT_LOCALE} from '~/lib/utils';
import {SERVICES_CONFIG, ServiceItem as Item} from './Services';

export function Services() {
  const [root] = useMatches();
  const selectedLocale = root.data?.selectedLocale ?? DEFAULT_LOCALE;

  return (
    <div className="py-1 lg:sticky lg:top-[179px] lg:z-[110] bg-[#f1f2f2] text-[#1e5097] lg:min-h-[48px] min-h-[33px] lg:max-h-[48px] max-h-[33px] desktop-services-wrap">
      <div className="container mx-auto services-container">
        <div className="sm-hide">
          <div className="items flex justify-between">
            {SERVICES_CONFIG.map((item, index) => (
              <Item text={selectedLocale.country == 'NZ' ? item.textNZ : item.textAU} img={item.iconSrc} key={index} />
            ))}
          </div>
        </div>
        <div className="sm-show">
          <Swiper
            modules={[Autoplay]}
            slidesPerView={1}
            autoplay={{
              delay: 15000,
              disableOnInteraction: false,
            }}
            loop={true}
            className="w-full"
          >
            {SERVICES_CONFIG.map((item, index) => (
              <SwiperSlide key={index}>
                <Item text={selectedLocale.country == 'NZ' ? item.textNZ : item.textAU} img={item.iconSrc} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
}
