/**
 * Human check for visitors outside Australia and New Zealand.
 *
 * Statewide only sells to AU and NZ. In Nov 2026 a bot from Singapore loaded
 * /products hundreds of thousands of times a day; every hit ran GA4 and
 * pushed the BigQuery export over its daily limit. Visitors from any other
 * country now get a Cloudflare Turnstile check first. The check page loads
 * no analytics, so bot hits never reach GA4. Passing it sets a signed cookie
 * for 30 days.
 *
 * Search engines and other trusted crawlers are let through so SEO, Merchant
 * Center and link previews keep working.
 *
 * Turned off unless TURNSTILE_SITE_KEY and TURNSTILE_SECRET_KEY are set.
 */

const ALLOWED_COUNTRIES = new Set(['AU', 'NZ']);
const COOKIE_NAME = 'sw_human';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
export const CHALLENGE_PATH = '/__human-check';

/**
 * Crawlers that must always reach the site (matched on User-Agent).
 * AI search and answer bots are allowed so the store can appear in AI search
 * results. AI training crawlers (GPTBot, ClaudeBot, Bytespider, CCBot,
 * meta-externalagent, ...) are left out on purpose.
 */
const TRUSTED_CRAWLERS =
  /googlebot|google-inspectiontool|googleother|storebot-google|adsbot-google|mediapartners-google|apis-google|feedfetcher-google|google-site-verification|chrome-lighthouse|bingbot|bingpreview|msnbot|adidxbot|duckduckbot|applebot|yahoo! slurp|facebookexternalhit|facebot|twitterbot|linkedinbot|pinterest|whatsapp|slackbot|telegrambot|discordbot|shopify|klaviyo|algolia|ahrefsbot|semrushbot|screaming frog|uptimerobot|oai-searchbot|chatgpt-user|perplexitybot|perplexity-user|claude-searchbot|claude-user/i;

/** Files and endpoints that are never challenged. */
const SKIP_PATH =
  /^\/(?:api\/|cdn\/|assets\/|build\/|\.well-known\/|robots\.txt$|sitemap|favicon)|\.[a-z0-9]{2,5}$/i;

function isEnabled(env) {
  return Boolean(env?.TURNSTILE_SITE_KEY && env?.TURNSTILE_SECRET_KEY);
}

/**
 * Oxygen sets oxygen-buyer-country on every request. Locally it's missing, so
 * BOT_CHALLENGE_TEST_COUNTRY can stand in for testing (ignored on Oxygen).
 */
function getCountry(request, env) {
  const country = request.headers.get('oxygen-buyer-country');
  if (country) return country.toUpperCase();
  return (env?.BOT_CHALLENGE_TEST_COUNTRY || '').toUpperCase() || null;
}

function getCookie(request, name) {
  const header = request.headers.get('Cookie') || '';
  const match = header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

async function hmac(secret, value) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    {name: 'HMAC', hash: 'SHA-256'},
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(value),
  );
  return btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function hasValidPass(request, env) {
  const value = getCookie(request, COOKIE_NAME);
  if (!value) return false;
  const [expires, signature] = value.split('.');
  if (!expires || !signature || Number(expires) < Date.now() / 1000) {
    return false;
  }
  return signature === (await hmac(env.SESSION_SECRET, expires));
}

async function createPassCookie(env) {
  const expires = String(Math.floor(Date.now() / 1000) + COOKIE_MAX_AGE);
  const signature = await hmac(env.SESSION_SECRET, expires);
  return `${COOKIE_NAME}=${expires}.${signature}; Path=/; Max-Age=${COOKIE_MAX_AGE}; HttpOnly; Secure; SameSite=Lax`;
}

/** Only same-site paths, so the check can't be used as an open redirect. */
function safeReturnPath(value) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) {
    return '/';
  }
  return value.startsWith(CHALLENGE_PATH) ? '/' : value;
}

const NO_STORE_HEADERS = {
  'Cache-Control': 'private, no-store',
  'X-Robots-Tag': 'noindex, nofollow',
};

/**
 * Returns a Response when the request must be stopped or is the check form
 * itself; null to carry on to the storefront as usual.
 * @param {Request} request
 * @param {Record<string, string>} env
 */
export async function handleBotChallenge(request, env) {
  if (!isEnabled(env)) return null;

  const url = new URL(request.url);

  if (url.pathname === CHALLENGE_PATH && request.method === 'POST') {
    return verifyChallenge(request, env);
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') return null;
  if (SKIP_PATH.test(url.pathname)) return null;

  const country = getCountry(request, env);
  if (!country || ALLOWED_COUNTRIES.has(country)) return null;

  if (TRUSTED_CRAWLERS.test(request.headers.get('User-Agent') || '')) {
    return null;
  }

  if (await hasValidPass(request, env)) return null;

  return challengePage({
    siteKey: env.TURNSTILE_SITE_KEY,
    returnPath: safeReturnPath(url.pathname + url.search),
  });
}

async function verifyChallenge(request, env) {
  const form = await request.formData();
  const token = form.get('cf-turnstile-response');
  const returnPath = safeReturnPath(form.get('return'));

  let success = false;
  if (token) {
    const body = new FormData();
    body.append('secret', env.TURNSTILE_SECRET_KEY);
    body.append('response', token);
    const ip = request.headers.get('oxygen-buyer-ip');
    if (ip) body.append('remoteip', ip);
    try {
      const result = await fetch(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {method: 'POST', body},
      ).then((response) => response.json());
      success = Boolean(result?.success);
    } catch (error) {
      console.error('Turnstile verification failed', error);
    }
  }

  if (!success) {
    return challengePage({
      siteKey: env.TURNSTILE_SITE_KEY,
      returnPath,
      failed: true,
    });
  }

  return new Response(null, {
    status: 303,
    headers: {
      ...NO_STORE_HEADERS,
      Location: returnPath,
      'Set-Cookie': await createPassCookie(env),
    },
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Plain page with no analytics or third-party scripts apart from Turnstile. */
function challengePage({siteKey, returnPath, failed = false}) {
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Quick check | Statewide Appliance Spares</title>
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
<style>
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f2f2f2;font-family:Arial,Helvetica,sans-serif;color:#222}
  main{background:#fff;max-width:420px;margin:16px;padding:32px 24px;border-top:4px solid #1e5097;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,.08)}
  h1{color:#1e5097;font-size:22px;margin:0 0 12px}
  p{font-size:14px;line-height:1.5;margin:0 0 20px}
  .error{color:#b00020}
  .cf-turnstile{display:flex;justify-content:center;margin-bottom:16px}
  button{background:#1e5097;color:#fff;border:0;padding:10px 24px;font-weight:bold;font-size:14px;cursor:pointer}
</style>
</head>
<body>
<main>
  <h1>Statewide Appliance Spares</h1>
  <p>We deliver across Australia and New Zealand. Please confirm you're human to continue.</p>
  ${failed ? '<p class="error">That check didn\'t go through. Please try again.</p>' : ''}
  <form method="post" action="${CHALLENGE_PATH}" id="human-check">
    <input type="hidden" name="return" value="${escapeHtml(returnPath)}">
    <div class="cf-turnstile" data-sitekey="${escapeHtml(siteKey)}" data-callback="onHumanCheck"></div>
    <noscript><p>Please turn on JavaScript to continue.</p></noscript>
    <button type="submit">Continue</button>
  </form>
</main>
<script>
  function onHumanCheck(){document.getElementById('human-check').submit();}
</script>
</body>
</html>`;

  return new Response(html, {
    status: 403,
    headers: {...NO_STORE_HEADERS, 'Content-Type': 'text/html; charset=utf-8'},
  });
}
