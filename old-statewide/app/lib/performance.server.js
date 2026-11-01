import {Cache} from '@shopify/hydrogen';

const cache = new Cache();

export async function withPerformanceHeaders(response, options = {}) {
  const {
    maxAge = 60 * 60 * 24, // 24 hours
    staleWhileRevalidate = 60 * 60, // 1 hour
    cacheKey,
  } = options;

  // Add cache headers
  response.headers.set(
    'Cache-Control',
    `public, max-age=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`
  );

  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Add performance headers
  response.headers.set('Keep-Alive', 'timeout=5, max=1000');
  response.headers.set('Connection', 'keep-alive');

  return response;
}

export async function cacheResponse(key, response, options = {}) {
  const {
    maxAge = 60 * 60 * 24, // 24 hours
  } = options;

  await cache.set(key, response, {
    maxAge,
  });

  return response;
}

export async function getCachedResponse(key) {
  return cache.get(key);
}

// Compression middleware
export function withCompression(response) {
  const acceptEncoding = response.headers.get('Accept-Encoding');
  
  if (acceptEncoding?.includes('br')) {
    response.headers.set('Content-Encoding', 'br');
  } else if (acceptEncoding?.includes('gzip')) {
    response.headers.set('Content-Encoding', 'gzip');
  }

  return response;
} 