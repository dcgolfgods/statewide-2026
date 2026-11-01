import {useEffect, useState} from 'react';

/**
 * SSR shell: cart drawer contents load from CartDrawerFly.client.jsx
 * so they are excluded from the Oxygen/Remix server worker bundle.
 */
export function CartDrawerFly(props) {
  const [ClientComponent, setClientComponent] = useState(null);

  useEffect(() => {
    let isMounted = true;
    import('./CartDrawerFly.client').then((mod) => {
      if (isMounted) {
        setClientComponent(() => mod.CartDrawerFly);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  if (!ClientComponent) {
    // Keep drawer chrome empty until client chunk loads (drawer opens after interaction).
    return null;
  }

  return <ClientComponent {...props} />;
}
