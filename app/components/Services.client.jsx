import {useMatches} from 'react-router';
import {Link} from '~/components';
import {Swiper, SwiperSlide} from 'swiper/react';
import {Autoplay} from 'swiper/modules';
import {Image} from '@shopify/hydrogen';
import {DEFAULT_LOCALE} from '~/lib/utils';

const SERVICES_CONFIG = [
  {id: 'range', textAU: 'Biggest Range in Australia', textNZ: 'Biggest Range of Appliance Spares', iconSrc: 'https://cdn.shopify.com/s/files/1/0799/5929/4245/files/Group.webp?v=1770792414', iconAlt: 'Range'},
  {id: 'delivery', textAU: 'Fast Australia Wide Delivery', textNZ: 'Fast Delivery to NZ', iconSrc: 'https://cdn.shopify.com/s/files/1/0799/5929/4245/files/Group_3.webp?v=1770792414', iconAlt: 'Delivery'},
  {id: 'price', textAU: 'Lowest Price Guarantee', textNZ: 'Lowest Price Guarantee', iconSrc: 'https://cdn.shopify.com/s/files/1/0799/5929/4245/files/Group_1.webp?v=1770792414', iconAlt: 'Price'},
  {id: 'expert', textAU: 'Expert Guidance', textNZ: 'Expert Guidance', iconSrc: 'https://cdn.shopify.com/s/files/1/0799/5929/4245/files/Group_2.webp?v=1770792413', iconAlt: 'Expert'},
  {id: 'aus', textAU: '100% Australian Family Owned', textNZ: '100% Australian Family Owned', iconSrc: 'https://cdn.shopify.com/s/files/1/0799/5929/4245/files/aus-icon-new_1.webp?v=1770792570', iconAlt: 'Australia'},
];

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

function Item({img, text}) {
  return (
    <div className="item min-h-[25px] bg-[#f1f2f2]">
      <Link className="min-h-[25px] flex items-center justify-center" to="/aboutus">
        <Image src={img} alt={text} className='lg:w-[40px] lg:h-[40px] lg:max-w-[40px] max-w-[24px] w-[24px] h-[24px]' />
        <span className="text-xs OpenSansBold text-[#1e5097] lg:text-sm tracking-wide inline-block ml-[10px]">{text}</span>
      </Link>
    </div>
  );
}
