import {useEffect, useState} from 'react';
import {useMatches} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {Link} from '~/components';
import {DEFAULT_LOCALE} from '~/lib/utils';

export const SERVICES_CONFIG = [
  {id: 'range', textAU: 'Biggest Range in Australia', textNZ: 'Biggest Range of Appliance Spares', iconSrc: 'https://cdn.shopify.com/s/files/1/0799/5929/4245/files/Group.webp?v=1770792414', iconAlt: 'Range'},
  {id: 'delivery', textAU: 'Fast Australia Wide Delivery', textNZ: 'Fast Delivery to NZ', iconSrc: 'https://cdn.shopify.com/s/files/1/0799/5929/4245/files/Group_3.webp?v=1770792414', iconAlt: 'Delivery'},
  {id: 'price', textAU: 'Lowest Price Guarantee', textNZ: 'Lowest Price Guarantee', iconSrc: 'https://cdn.shopify.com/s/files/1/0799/5929/4245/files/Group_1.webp?v=1770792414', iconAlt: 'Price'},
  {id: 'expert', textAU: 'Expert Guidance', textNZ: 'Expert Guidance', iconSrc: 'https://cdn.shopify.com/s/files/1/0799/5929/4245/files/Group_2.webp?v=1770792413', iconAlt: 'Expert'},
  {id: 'aus', textAU: '100% Australian Family Owned', textNZ: '100% Australian Family Owned', iconSrc: 'https://cdn.shopify.com/s/files/1/0799/5929/4245/files/aus-icon-new_1.webp?v=1770792570', iconAlt: 'Australia'},
];

export function ServiceItem({img, text}) {
  return (
    <div className="item min-h-[25px] bg-[#f1f2f2]">
      <Link className="min-h-[25px] flex items-center justify-center" to="/aboutus">
        <Image src={img} alt={text} className='lg:w-[40px] lg:h-[40px] lg:max-w-[40px] max-w-[24px] w-[24px] h-[24px]' />
        <span className="text-xs OpenSansBold text-[#1e5097] lg:text-sm tracking-wide inline-block ml-[10px]">{text}</span>
      </Link>
    </div>
  );
}

/**
 * SSR shell: renders the same bar the client component shows (the full row on
 * desktop, the carousel's first slide on mobile) so nothing jumps when the
 * Swiper chunk from Services.client.jsx loads.
 */
export function Services() {
  const [ClientComponent, setClientComponent] = useState(null);
  const [root] = useMatches();
  const selectedLocale = root?.data?.selectedLocale ?? DEFAULT_LOCALE;
  const textFor = (item) =>
    selectedLocale.country == 'NZ' ? item.textNZ : item.textAU;

  useEffect(() => {
    let isMounted = true;
    import('./Services.client').then((mod) => {
      if (isMounted) {
        setClientComponent(() => mod.Services);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  if (!ClientComponent) {
    const [first] = SERVICES_CONFIG;
    return (
      <div className="py-1 lg:sticky lg:top-[179px] lg:z-[110] bg-[#f1f2f2] text-[#1e5097] lg:min-h-[48px] min-h-[33px] lg:max-h-[48px] max-h-[33px] desktop-services-wrap">
        <div className="container mx-auto services-container">
          <div className="sm-hide">
            <div className="items flex justify-between">
              {SERVICES_CONFIG.map((item) => (
                <ServiceItem text={textFor(item)} img={item.iconSrc} key={item.id} />
              ))}
            </div>
          </div>
          <div className="sm-show">
            <ServiceItem text={textFor(first)} img={first.iconSrc} />
          </div>
        </div>
      </div>
    );
  }

  return <ClientComponent />;
}
