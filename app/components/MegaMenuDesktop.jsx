import {useEffect, useState} from 'react';

/** Pin mega menu open for DevTools — set false before production */
export const MEGA_MENU_DEBUG_PIN_OPEN = false;
/** Top nav index when pinned (0 = first item, e.g. Kitchen Appliances) */
export const MEGA_MENU_DEBUG_PIN_INDEX = 0;

/**
 * SSR shell: desktop mega menu loads from MegaMenuDesktop.client.jsx
 * so it is excluded from the Oxygen/Remix server worker bundle.
 */
function MegaMenuDesktop(props) {
  const [ClientComponent, setClientComponent] = useState(null);

  useEffect(() => {
    let isMounted = true;
    import('./MegaMenuDesktop.client').then((mod) => {
      if (isMounted) {
        setClientComponent(() => mod.default);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  if (!ClientComponent) {
    return null;
  }

  return <ClientComponent {...props} />;
}

export default MegaMenuDesktop;
