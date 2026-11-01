import React, {useEffect, useState} from 'react';

const SearchPage = (props) => {
  const [ClientComponent, setClientComponent] = useState(null);

  useEffect(() => {
    let isMounted = true;
    import('./SearchPage.client').then((mod) => {
      if (isMounted) {
        setClientComponent(() => mod.SearchPage);
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
};

export {SearchPage};