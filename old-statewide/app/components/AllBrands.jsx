import React, {useEffect, useState} from 'react';

export const AllBrands = () => {
  const [ClientComponent, setClientComponent] = useState(null);

  useEffect(() => {
      let isMounted = true;
      import('./AllBrands.client').then((mod) => {
        if (isMounted) {
          setClientComponent(() => mod.AllBrands);
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
};