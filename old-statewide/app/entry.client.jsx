import {RemixBrowser} from '@remix-run/react';
import {startTransition, StrictMode} from 'react';
import {hydrateRoot} from 'react-dom/client';

import {handleSpecialUser} from '~/lib/specialUserHelper';
import {getLowercasePathRedirect, hasNonAsciiPath} from '~/lib/urlRedirects';

// Oxygen lowercases the path before the worker, so server 301s never see
// mixed-case URLs. The browser still has the original casing — reload there.
const {pathname, search, hash} = window.location;
const lowercasePathRedirect = getLowercasePathRedirect(pathname, search, hash);
const shouldHydrate = !hasNonAsciiPath(pathname);

if (lowercasePathRedirect) {
  window.location.replace(lowercasePathRedirect);
} else if (shouldHydrate) {
  // Handle specialUser parameter on client side
  handleSpecialUser();

  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <RemixBrowser />
      </StrictMode>,
    );
  });
}
