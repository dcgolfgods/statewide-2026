// ChannelSight (Philips "Buy Now") order tracking.
//
// Visitors from a brand's Buy Now button land with ?cstrackid=... in the URL.
// ChannelSight's own script keeps that ID in a cookie on www, but the order is
// completed on the Shopify checkout, where the Customer Events pixel runs in a
// sandbox and can't read that cookie. So we keep the ID ourselves and copy it
// onto the cart as the hidden attribute `_cstrackid`. The Customer Events
// pixel reads it from the completed checkout and sends the sale to ChannelSight.

export const CS_TRACK_ID_COOKIE = 'cs_trackid';
export const CS_TRACK_ID_ATTRIBUTE = '_cstrackid';
const CS_TRACK_ID_DAYS = 30; // same lifetime as ChannelSight's own cookie

function readTrackIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  for (const [key, value] of params) {
    if (key.toLowerCase() === 'cstrackid' && value) return value.trim();
  }
  return null;
}

/** Save ?cstrackid=... from the landing URL (runs once on page load). */
export const captureChannelSightTrackId = () => {
  if (typeof window === 'undefined') return;

  const trackId = readTrackIdFromUrl();
  if (!trackId) return;

  const expires = new Date();
  expires.setDate(expires.getDate() + CS_TRACK_ID_DAYS);
  document.cookie = `${CS_TRACK_ID_COOKIE}=${encodeURIComponent(
    trackId,
  )}; Path=/; SameSite=Lax; Secure; Expires=${expires.toUTCString()}`;
};

/** The saved ChannelSight track ID, or null. */
export const getChannelSightTrackId = () => {
  if (typeof document === 'undefined') return null;

  for (const cookie of document.cookie.split(';')) {
    const [name, ...rest] = cookie.trim().split('=');
    if (name === CS_TRACK_ID_COOKIE) {
      const value = decodeURIComponent(rest.join('='));
      return value || null;
    }
  }
  return null;
};
