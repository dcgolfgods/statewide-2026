import React, {useEffect, useState} from 'react';

const ContactForm = (props) => {
  const [ClientComponent, setClientComponent] = useState(null);

  useEffect(() => {
    let isMounted = true;
    import('./ContactForm.client').then((mod) => {
      if (isMounted) {
        setClientComponent(() => mod.ContactForm);
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

export {ContactForm};
