import {HydratedRouter} from 'react-router/dom';
import {startTransition, StrictMode} from 'react';
import {hydrateRoot} from 'react-dom/client';
import {NonceProvider} from '@shopify/hydrogen';

import {handleSpecialUser} from '~/lib/specialUserHelper';
import {getLowercasePathRedirect, hasNonAsciiPath} from '~/lib/urlRedirects';

// Oxygen lowercases the path before the worker, so server 301s never see
// mixed-case URLs. The browser still has the original casing — reload there.
const {pathname, search, hash} = window.location;
const lowercasePathRedirect = getLowercasePathRedirect(pathname, search, hash);
const shouldHydrate =
  !hasNonAsciiPath(pathname) &&
  !window.location.origin.includes('webcache.googleusercontent.com');

if (lowercasePathRedirect) {
  window.location.replace(lowercasePathRedirect);
} else if (shouldHydrate) {
  // Handle specialUser parameter on client side
  handleSpecialUser();

  startTransition(() => {
    // Extract nonce from existing script tags
    const existingNonce = document.querySelector('script[nonce]')?.nonce;

    hydrateRoot(
      document,
      <StrictMode>
        <NonceProvider value={existingNonce}>
          <HydratedRouter />
        </NonceProvider>
      </StrictMode>,
    );
  });
}
