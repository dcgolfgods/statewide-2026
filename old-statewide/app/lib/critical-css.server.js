import {renderToString} from 'react-dom/server';
import {extractCritical} from '@emotion/server';
import {Cache} from '@shopify/hydrogen';

const cache = new Cache();

export async function getCriticalCss(component, props = {}) {
  const cacheKey = `critical-css-${component.name}-${JSON.stringify(props)}`;
  
  // Check cache first
  const cached = await cache.get(cacheKey);
  if (cached) return cached;

  // Render component to string
  const html = renderToString(component(props));
  
  // Extract critical CSS
  const {css} = extractCritical(html);
  
  // Cache the result
  await cache.set(cacheKey, css, {
    maxAge: 60 * 60 * 24, // 24 hours
  });

  return css;
}

export function CriticalCss({css}) {
  return (
    <style
      dangerouslySetInnerHTML={{__html: css}}
      data-emotion-css
    />
  );
} 