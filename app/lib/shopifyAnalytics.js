const SHOPIFY_TRACKING_COOKIE_MAP = {
  _shopify_y: 'uniqueToken',
  _shopify_s: 'visitToken',
};

function getCookieValue(name) {
  if (typeof document === 'undefined') return undefined;

  const cookie = document.cookie
    .split('; ')
    .find((item) => item.startsWith(`${name}=`));

  if (!cookie) return undefined;

  return decodeURIComponent(cookie.slice(name.length + 1));
}

export function getShopifyTrackingParameters() {
  return Object.entries(SHOPIFY_TRACKING_COOKIE_MAP).reduce(
    (parameters, [cookieName, payloadKey]) => {
      const value = getCookieValue(cookieName);

      if (value) {
        parameters[payloadKey] = value;
      }

      return parameters;
    },
    {},
  );
}
