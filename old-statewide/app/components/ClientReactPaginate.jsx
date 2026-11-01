import {useEffect, useState} from 'react';

/**
 * SSR shell: react-paginate is loaded only from ClientReactPaginate.client.jsx
 * so it is excluded from the Oxygen/Remix server worker bundle.
 */
const ClientReactPaginate = (props) => {
  const [ClientComponent, setClientComponent] = useState(null);

  useEffect(() => {
    let isMounted = true;
    import('./ClientReactPaginate.client').then((mod) => {
      if (isMounted) {
        setClientComponent(() => mod.ClientReactPaginate);
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

export {ClientReactPaginate};
