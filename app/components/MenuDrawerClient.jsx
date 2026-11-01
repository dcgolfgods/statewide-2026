import {useEffect, useState} from 'react';

/** @deprecated Prefer importing MenuDrawer from './MenuDrawer' (already client-gated). */
export function MenuDrawer(props) {
  const [ClientComponent, setClientComponent] = useState(null);

  useEffect(() => {
    let isMounted = true;
    import('./MenuDrawer.client').then((mod) => {
      if (isMounted) {
        setClientComponent(() => mod.MenuDrawer);
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
