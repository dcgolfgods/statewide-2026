import React, {useEffect, useImperativeHandle, useRef, useState} from 'react';

export const CustomZoom = React.forwardRef((props, ref) => {
  const [ClientComponent, setClientComponent] = useState(null);
  const innerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    import('./CustomZoom.client').then((mod) => {
      if (isMounted) {
        setClientComponent(() => mod.CustomZoom);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  useImperativeHandle(ref, () => innerRef.current);

  if (!ClientComponent) {
    return (
      <div className="w-full h-full flex items-center justify-center overflow-hidden select-none touch-manipulation">
        {props.children}
      </div>
    );
  }

  return <ClientComponent ref={innerRef} {...props} />;
});

export const ZoomControls = (props) => {
  const [ClientComponent, setClientComponent] = useState(null);

  useEffect(() => {
    let isMounted = true;
    import('./CustomZoom.client').then((mod) => {
      if (isMounted) {
        setClientComponent(() => mod.ZoomControls);
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
  