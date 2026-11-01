import {useEffect, useState} from 'react';
import {Link} from '~/components';
import {Image} from '@shopify/hydrogen';
import {FIRST_HOME_SLIDE} from './home-slider-data';

export function HomeSlider() {
  const [ClientComponent, setClientComponent] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const load = () => {
      import('./HomeSlider.client').then((mod) => {
        if (isMounted) {
          setClientComponent(() => mod.HomeSlider);
        }
      });
    };

    const idleId =
      'requestIdleCallback' in window
        ? window.requestIdleCallback(load, {timeout: 2500})
        : window.setTimeout(load, 1500);

    return () => {
      isMounted = false;
      if ('requestIdleCallback' in window) {
        window.cancelIdleCallback(idleId);
      } else {
        clearTimeout(idleId);
      }
    };
  }, []);

  if (!ClientComponent) {
    return (
      <div className="home-slider container mx-auto lg:px-0 px-4">
        <div className="lg:mt-8 mt-4">
          <div className="image relative home-slider-frame">
            <Link to={FIRST_HOME_SLIDE.url} className="hidden lg:block w-full">
              <Image
                className="w-full object-cover"
                src={FIRST_HOME_SLIDE.img}
                sizes="(min-width: 1024px) 1140px, 100vw"
                fetchPriority="low"
                loading="lazy"
              />
            </Link>
            <Link to={FIRST_HOME_SLIDE.url} className="block lg:hidden w-full">
              <Image
                className="w-full object-cover"
                src={FIRST_HOME_SLIDE.mobImg}
                sizes="100vw"
                fetchPriority="high"
                loading="eager"
              />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <ClientComponent />;
}
