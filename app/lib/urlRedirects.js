const STATIC_ASSET_PATH_REGEX = /\.[a-z0-9]+$/i;

function containsNonAscii(value = '') {
  return Array.from(value).some((character) => character.charCodeAt(0) > 127);
}

export function isStaticAssetPath(pathname = '') {
  return STATIC_ASSET_PATH_REGEX.test(pathname);
}

export function hasNonAsciiPath(pathname = '') {
  try {
    return containsNonAscii(decodeURIComponent(pathname));
  } catch {
    return containsNonAscii(pathname);
  }
}

export function getLowercasePathRedirect(
  pathname = '',
  search = '',
  hash = '',
) {
  if (isStaticAssetPath(pathname) || hasNonAsciiPath(pathname)) {
    return null;
  }

  const lowercasePath = pathname.toLowerCase();
  if (pathname === lowercasePath) {
    return null;
  }

  return `${lowercasePath}${search || ''}${hash || ''}`;
}
