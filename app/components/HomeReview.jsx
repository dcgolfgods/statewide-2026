import {useEffect, useState} from 'react';
import {Link} from '~/components';
import {Image} from '@shopify/hydrogen';
import {homeReviewDesk, homeImages} from './home-data';

export function HomeReviews({skipResources}) {
  const [ClientComponent, setClientComponent] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const load = () => {
      import('./HomeReview.client').then((mod) => {
        if (isMounted) {
          setClientComponent(() => mod.HomeReviews);
        }
      });
    };
    const idleId =
      'requestIdleCallback' in window
        ? window.requestIdleCallback(load, {timeout: 3000})
        : window.setTimeout(load, 2000);
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
    const firstReview = homeReviewDesk?.[0];
    const firstImage = homeImages?.[0];
    return (
      <div className="home-reviews py-[15px]">
        <div className="container mx-auto px-4">
          {firstReview && (
            <Link to="/reviews" className="text-[#00aeef] block">
              <h4 className="mb-[10px] text-[#1e5097] font-bold text-center text-[16px] lg:text-[24px]">
                What our customers say about us...
              </h4>
              <p className="msg text-[14px] text-black mb-[12px] text-center">"{firstReview.msg}"</p>
              <p className="author text-[14px] text-[#1e5097] font-bold mb-[10px] text-center">{firstReview.user}</p>
            </Link>
          )}
          {firstImage && (
            <Link to={firstImage.url} className="w-full block text-[#00aeef]">
              <Image src={firstImage.img} alt={firstImage.alt} className="w-full block" sizes="(min-width: 1024px) 1140px, 100vw" width={1200} height={400} loading="lazy" />
            </Link>
          )}
        </div>
      </div>
    );
  }

  return <ClientComponent skipResources={skipResources} />;
}


