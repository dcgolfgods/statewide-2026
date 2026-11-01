import {useEffect, useState} from 'react';

export function TradePromotionTerms() {
  const [ClientComponent, setClientComponent] = useState(null);

  useEffect(() => {
    let isMounted = true;
    import('./TradePromotionTerms.client').then((mod) => {
      if (isMounted) {
        setClientComponent(() => mod.TradePromotionTerms);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!ClientComponent) {
    return null;
  }

  return <ClientComponent />;
}
  