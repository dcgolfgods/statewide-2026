import {useEffect, useState} from 'react';

export function UpsellProducts(props) {
  const [ClientComponent, setClientComponent] = useState(null);

  useEffect(() => {
    let isMounted = true;
    import('./UpsellProducts.client').then((mod) => {
      if (isMounted) {
        setClientComponent(() => mod.UpsellProducts);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  if (!ClientComponent) return null;

  return <ClientComponent {...props} />;
}
