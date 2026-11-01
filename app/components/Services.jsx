import {useEffect, useState} from 'react';
import {Link} from '~/components';

const FALLBACK_ITEMS = [
  'Biggest Range in Australia',
  'Fast Australia Wide Delivery',
  'Lowest Price Guarantee',
];

export function Services() {
  const [ClientComponent, setClientComponent] = useState(null);

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
    return (
      <div className="py-1 lg:sticky lg:top-[179px] lg:z-[110] bg-[#f1f2f2] text-[#1e5097] lg:min-h-[48px] min-h-[33px] lg:max-h-[48px] max-h-[33px] desktop-services-wrap">
        <div className="container mx-auto services-container">
          <div className="items flex justify-between">
            {FALLBACK_ITEMS.map((text) => (
              <Link key={text} className="text-xs lg:text-sm OpenSansBold" to="/aboutus">
                {text}
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return <ClientComponent />;
}
