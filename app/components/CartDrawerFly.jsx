import {useEffect, useState} from 'react';

/**
 * SSR shell: cart drawer contents load from CartDrawerFly.client.jsx
 * so they are excluded from the Oxygen/Remix server worker bundle.
 * The chunk is cached at module level so reopening the drawer is instant.
 */
let cachedComponent = null;
let loadPromise = null;

export function preloadCartDrawer() {
  if (!loadPromise) {
    loadPromise = import('./CartDrawerFly.client').then((mod) => {
      cachedComponent = mod.CartDrawerFly;
      return cachedComponent;
    });
  }
  return loadPromise;
}

export function CartDrawerFly(props) {
  const [ClientComponent, setClientComponent] = useState(() => cachedComponent);

  useEffect(() => {
    if (ClientComponent) return;
    let isMounted = true;
    preloadCartDrawer().then((component) => {
      if (isMounted) {
        setClientComponent(() => component);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [ClientComponent]);

  if (!ClientComponent) {
    // Keep drawer chrome empty until client chunk loads.
    return null;
  }

  return <ClientComponent {...props} />;
}
