import {useEffect, useState} from 'react';

export function FeaturedSection(props) {
  const [ClientComponent, setClientComponent] = useState(null);

  useEffect(() => {
    let isMounted = true;
    import('./FeaturedSection.client').then((mod) => {
      if (isMounted) {
        setClientComponent(() => mod.FeaturedSection);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  if (!ClientComponent) return null;

  return <ClientComponent {...props} />;
}
