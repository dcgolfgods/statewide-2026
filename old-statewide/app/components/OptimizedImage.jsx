import {Image} from '@shopify/hydrogen';
import {useEffect, useState} from 'react';

export function OptimizedImage({
  data,
  src,
  alt,
  className,
  width,
  height,
  loading = 'lazy',
  sizes,
  aspectRatio,
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.1,
      }
    );

    const element = document.querySelector(`[data-image-id="${data?.id || src}"]`);
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [data?.id, src]);

  const imageProps = {
    ...props,
    className: className || '',
    loading: loading,
    sizes: sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    onLoad: () => setIsLoaded(true),
    'data-image-id': data?.id || src,
  };

  if (data) {
    return (
      <Image
        data={data}
        alt={alt || data.altText || ''}
        width={width}
        height={height}
        aspectRatio={aspectRatio}
        {...imageProps}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt || ''}
      width={width}
      height={height}
      aspectRatio={aspectRatio}
      {...imageProps}
    />
  );
} 