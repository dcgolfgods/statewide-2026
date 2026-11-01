import {useEffect, useState} from 'react';

/**
 * SSR shell: mobile menu UI loads from MenuDrawer.client.jsx
 * so it is excluded from the Oxygen/Remix server worker bundle.
 */
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
