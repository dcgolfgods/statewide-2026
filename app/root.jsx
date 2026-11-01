import {parse as parseCookie} from 'worktop/cookie';
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  redirect,
  Scripts,
  ScrollRestoration,
  useRouteError,
  useRouteLoaderData,
} from 'react-router';
import {useEffect} from 'react';
import {ShopifySalesChannel, useNonce} from '@shopify/hydrogen';
import invariant from 'tiny-invariant';

import {Layout as SiteLayout} from '~/components';
import {SeoImageMeta} from '~/components/SeoImageMeta';
import {seoPayload} from '~/lib/seo.server';
import {isSearchEngineIndexable} from '~/lib/indexing.server';
import {getRouteSeoMeta} from '~/lib/meta';
import {getRedirectionByHandle} from '~/lib/shopifyAdminMetaobjects';
import {getLowercasePathRedirect, isStaticAssetPath} from '~/lib/urlRedirects';

import favicon from '../public/favicon.ico';

import {GenericError} from './components/GenericError';
import {NotFound} from './components/NotFound';
import styles from './styles/app.css?url';
import globalCss from './styles/global.css?url';
import customFonts from './styles/custom-font.css?url';
import {DEFAULT_LOCALE, parseMenu} from './lib/utils';
import {useAnalytics} from './hooks/useAnalytics';

const LOWERCASE_PATH_REDIRECT_SCRIPT =
  '(function(){var p=location.pathname;function h(v){try{return /[^\\x00-\\x7F]/.test(decodeURIComponent(v));}catch(e){return /[^\\x00-\\x7F]/.test(v);}}if(!/\\.[a-z0-9]+$/i.test(p)&&!h(p)&&p!==p.toLowerCase()){location.replace(p.toLowerCase()+location.search+location.hash);}})();';

// Wrapped in the `utilities` layer (declared in Tailwind's order first) so the
// layered rules in app.css/global.css can still override it, e.g. revealing body.
const CRITICAL_CSS =
  '@layer theme,base,components,utilities;@layer utilities{body{margin:0;opacity:0}.announcement-bar{height:42px;min-height:42px;display:flex;align-items:center;justify-content:center;text-align:center;background:#f1f2f2}.announcement-bar .hidden{display:none}.header-desktop{height:180px;min-height:180px}.header-wrapper{box-sizing:border-box;height:141px;min-height:141px;display:flex;align-items:center;justify-content:space-between;width:100%;padding:17px 32px 17px 15px}.header-left{min-height:106px}.header-logo{height:106px}.header-logo img{display:block;width:100%;max-width:440px;height:auto;max-height:106px;object-fit:contain}.mobile-header{box-sizing:border-box;height:147.5px;min-height:147.5px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;width:100%;padding:5px 10px;line-height:1;background:#fff}.mobile-header-logo{height:59px;min-height:59px;max-height:59px;overflow:hidden;display:flex;align-items:center;justify-content:center}.mobile-header-logo img{display:block;width:100%;max-width:100%;height:auto;max-height:59px;object-fit:contain}.mobile-header .search-form input{box-sizing:border-box;height:40px;width:100%}.home-slider-frame{aspect-ratio:2094/400;width:100%;overflow:hidden}@media (max-width:1024px){.sm-hide{display:none!important}}@media (min-width:1025px){.sm-show{display:none!important}.announcement-bar{height:48px;min-height:48px}.announcement-bar .hidden{display:block}.announcement-bar .lg\\:hidden{display:none}.home-slider-frame{aspect-ratio:2094/350}.search-form input{height:46px}}}';

/**
 * This is important to avoid re-fetching root queries on sub-navigations
 * @type {ShouldRevalidateFunction}
 */
export const shouldRevalidate = ({formMethod, currentUrl, nextUrl}) => {
  // revalidate when a mutation is performed e.g add to cart, login...
  if (formMethod && formMethod !== 'GET') {
    return true;
  }

  // revalidate when manually revalidating via useRevalidator
  if (currentUrl.toString() === nextUrl.toString()) {
    return true;
  }

  // Re-run root loader on client-side path changes so global
  // redirect/metaobject rules are applied for navigations as well.
  if (currentUrl.pathname !== nextUrl.pathname) {
    return true;
  }

  return false;
};

export function links() {
  return [
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'preconnect',
      href: 'https://shop.app',
    },
    {rel: 'icon', type: 'image/svg+xml', href: favicon},
  ];
}

/**
 * Hydrogen's `<Seo />` component was removed; every route still returns a
 * `seo` payload from its loader, so merge them here for all routes.
 * @type {Route.MetaFunction}
 */
export const meta = ({matches, error}) => {
  if (error) {
    return [{title: isRouteErrorResponse(error) ? 'Not found' : 'Error'}];
  }
  return getRouteSeoMeta(matches);
};

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({request, context}) {
  let url = new URL(request.url);
  let urlPath = url.pathname;

  // Force lowercase URLs (e.g. /Vacuums-floor-care -> /vacuums-floor-care)
  const isStaticAssetRequest = isStaticAssetPath(urlPath);
  const redirectUrl = getLowercasePathRedirect(
    urlPath,
    url.search,
    url.hash,
  );
  if (redirectUrl) {
    return redirect(redirectUrl, {status: 301});
  }

  if (urlPath === '/blog' || urlPath.startsWith('/blog/')) {
    const blogRedirectPath = urlPath.replace(/^\/blog/, '/blogs');
    const redirectUrl = `${blogRedirectPath}${url.search || ''}${url.hash || ''}`;
    return redirect(redirectUrl, {status: 301});
  }

  if (urlPath === '/announcements' || urlPath.startsWith('/announcements/')) {
    const announcementRedirectPath = urlPath.replace(
      /^\/announcements/,
      '/announcement',
    );
    const redirectUrl = `${announcementRedirectPath}${url.search || ''}${url.hash || ''}`;
    return redirect(redirectUrl, {status: 301});
  }

  if (!isStaticAssetRequest && urlPath !== '/') {
    try {
      const redirectEntry = await getRedirectionByHandle(
        context.storefront,
        urlPath,
      );
      if (redirectEntry?.to) {
        return redirect(redirectEntry.to, {status: 301});
      }
    } catch (error) {
      console.error('global redirection metaobject lookup failed', error);
    }
  }

  if (urlPath.includes('plugin')) {
    return redirect(`/`, {status: 301});
  }

  const hasTagSegment = /(^|\/)tag(\/|$)/i.test(urlPath);
  const hasWpContentSegment = /(^|\/)wp-content(\/|$)/i.test(urlPath);
  const hasMaytagSegment = /(^|\/)maytag(\/|$)/i.test(urlPath);
  if ((hasTagSegment && !hasMaytagSegment) || hasWpContentSegment) {
    return redirect('/blogs', {status: 301});
  }

  // Redirect trailing slash to non-trailing (e.g. /air-conditioners/ -> /air-conditioners)
  if (urlPath !== '/' && urlPath.endsWith('/')) {
    const pathWithoutSlash = urlPath.slice(0, -1);
    const redirectUrl =
      pathWithoutSlash + (url.search || '') + (url.hash || '');
    return redirect(redirectUrl, {status: 301});
  }

  const {session, storefront} = context;
  const [customerAccessToken, layout] = await Promise.all([
    session.get('customerAccessToken'),
    getLayoutData(context),
  ]);
  const allowIndexing = isSearchEngineIndexable(request);
  const seo = seoPayload.root({shop: layout.shop, url: request.url});
  if (!allowIndexing) {
    seo.robots = {
      noIndex: true,
      noFollow: true,
    };
  }
  let userCountry = request.headers.get('oxygen-buyer-country') || 'AU';
  const shopCookies = parseCookie(request.headers.get('Cookie') || '');
  const cookieLocale = shopCookies.locale;

  if (cookieLocale) {
    userCountry = cookieLocale.toLocaleUpperCase();
  }

  const currencyParam = url.searchParams.get('currency');
  if (currencyParam) {
    const currencyToCountry = {AUD: 'AU', NZD: 'NZ'};
    const mappedCountry = currencyToCountry[currencyParam.toUpperCase()];
    if (mappedCountry) {
      userCountry = mappedCountry;
    }
  }

  if (userCountry != 'AU' && userCountry != 'NZ') {
    userCountry = 'AU';
  }

  const isLoggedIn = Boolean(customerAccessToken);
  let customeFirstName = null;
  let customer = null;
  let customerToken = null;
  if (isLoggedIn) {
    customerToken = customerAccessToken;
    const data = await storefront.query(CUSTOMER_NAME, {
      variables: {
        customerAccessToken,
      },
    });
    customeFirstName = data?.customer?.firstName;
    customer = data?.customer;
  }

  return {
    isLoggedIn,
    customeFirstName,
    customer,
    customerToken,
    layout,
    shop: layout.shop,
    isProduction: process.env.NODE_ENV === 'production',
    allowIndexing,
    userCountry,
    selectedLocale: storefront.i18n,
    analytics: {
      shopifySalesChannel: ShopifySalesChannel.hydrogen,
      shopId: layout.shop.id,
    },
    seo,
  };
}

/**
 * Document shell shared by the App and the ErrorBoundary.
 * @param {{children?: React.ReactNode}}
 */
export function Layout({children}) {
  const nonce = useNonce();
  /** @type {RootLoader | undefined} */
  const data = useRouteLoaderData('root');
  const error = useRouteError();
  const locale = data?.selectedLocale ?? DEFAULT_LOCALE;

  return (
    <html
      lang={locale.language}
      className={data?.isProduction ? 'env-production' : ''}
    >
      <head>
        <meta charSet="utf-8" />
        {error ? (
          <meta name="viewport" content="width=device-width,initial-scale=1" />
        ) : (
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
          />
        )}
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: LOWERCASE_PATH_REDIRECT_SCRIPT,
          }}
        />
        {!error && data && !data.allowIndexing && (
          <meta name="robots" content="noindex, nofollow" />
        )}
        {!error && <SeoImageMeta />}
        <Meta />
        <Links />
        {!error && data?.customer?.email ? (
          <script
            nonce={nonce}
            dangerouslySetInnerHTML={{
              __html: `
                window.customerEmail = ${JSON.stringify(data.customer.email)};
                var _hsq = window._hsq = window._hsq || [];
                _hsq.push(['identify', { email: window.customerEmail }]);
              `,
            }}
          />
        ) : null}
        {!error && (
          <style
            nonce={nonce}
            dangerouslySetInnerHTML={{__html: CRITICAL_CSS}}
          />
        )}
      </head>
      <body>
        {children}
        {/* Stylesheets load after the content; app.css reveals the body. */}
        <link rel="stylesheet" href={styles} />
        <link rel="stylesheet" href={globalCss} />
        <link rel="stylesheet" href={customFonts} />
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export default function App() {
  /** @type {RootLoader} */
  const data = useRouteLoaderData('root');
  const locale = data.selectedLocale ?? DEFAULT_LOCALE;
  const hasUserConsent = true;

  useAnalytics(hasUserConsent);
  useCopyProtection();

  return (
    <>
      <SiteLayout
        key={`${locale.language}-${locale.country}`}
        layout={data.layout}
        customeFirstName={data.customeFirstName}
      >
        <Outlet />
      </SiteLayout>
      <div id="google-reviews-badge"></div>
    </>
  );
}

export function ErrorBoundary() {
  /** @type {RootLoader | undefined} */
  const root = useRouteLoaderData('root');
  const locale = root?.selectedLocale ?? DEFAULT_LOCALE;
  const routeError = useRouteError();
  const isRouteError = isRouteErrorResponse(routeError);

  let pageType = 'page';

  if (isRouteError) {
    if (routeError.status === 404) pageType = routeError.data || pageType;
  }

  return (
    <SiteLayout
      layout={root?.layout}
      key={`${locale.language}-${locale.country}`}
    >
      {isRouteError ? (
        <>
          {routeError.status === 404 ? (
            <NotFound type={pageType} />
          ) : (
            <GenericError
              error={{message: `${routeError.status} ${routeError.data}`}}
            />
          )}
        </>
      ) : (
        <GenericError
          error={routeError instanceof Error ? routeError : undefined}
        />
      )}
    </SiteLayout>
  );
}

/**
 * Blocks right-click, copy, cut, text selection and dragging everywhere
 * except inside elements marked with `data-copy-allowed`.
 */
function useCopyProtection() {
  useEffect(() => {
    const getAllowedContainerFromNode = (node) => {
      if (!node) return null;
      const element =
        node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
      if (!(element instanceof Element)) return null;

      // Use the highest allowed ancestor so nested allowed nodes
      // are treated as a single copy-allowed region.
      let current = element;
      let topAllowed = null;
      while (current) {
        if (current.hasAttribute('data-copy-allowed')) {
          topAllowed = current;
        }
        current = current.parentElement;
      }

      return topAllowed;
    };

    const isSelectionAllowed = () => {
      const selection = window.getSelection?.();
      if (!selection || selection.rangeCount === 0) {
        return false;
      }

      for (let i = 0; i < selection.rangeCount; i += 1) {
        const range = selection.getRangeAt(i);
        const startAllowedContainer = getAllowedContainerFromNode(
          range.startContainer,
        );
        const endAllowedContainer = getAllowedContainerFromNode(
          range.endContainer,
        );

        if (!startAllowedContainer || !endAllowedContainer) {
          return false;
        }

        const sameAllowedGroup =
          startAllowedContainer === endAllowedContainer ||
          startAllowedContainer.contains(endAllowedContainer) ||
          endAllowedContainer.contains(startAllowedContainer);

        if (!sameAllowedGroup) {
          return false;
        }
      }

      return true;
    };

    let isMouseSelecting = false;

    const enforceAllowedSelection = () => {
      if (isMouseSelecting) {
        return;
      }
      const selection = window.getSelection?.();
      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
        return;
      }

      if (!isSelectionAllowed()) {
        selection.removeAllRanges();
      }
    };

    const handleMouseDown = () => {
      isMouseSelecting = true;
    };

    const handleMouseUp = () => {
      isMouseSelecting = false;
      enforceAllowedSelection();
    };

    const prevent = (event) => {
      const target = event.target;
      const targetAllowed = Boolean(getAllowedContainerFromNode(target));

      if (
        (event.type === 'selectstart' || event.type === 'dragstart') &&
        targetAllowed
      ) {
        return;
      }

      if (event.type === 'contextmenu') {
        if (targetAllowed) {
          return;
        }
        event.preventDefault();
        return;
      }

      if (
        (event.type === 'copy' || event.type === 'cut') &&
        (isSelectionAllowed() || targetAllowed)
      ) {
        return;
      }

      event.preventDefault();
    };
    document.addEventListener('contextmenu', prevent);
    document.addEventListener('copy', prevent);
    document.addEventListener('cut', prevent);
    document.addEventListener('selectstart', prevent);
    document.addEventListener('dragstart', prevent);
    document.addEventListener('selectionchange', enforceAllowedSelection);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('contextmenu', prevent);
      document.removeEventListener('copy', prevent);
      document.removeEventListener('cut', prevent);
      document.removeEventListener('selectstart', prevent);
      document.removeEventListener('dragstart', prevent);
      document.removeEventListener('selectionchange', enforceAllowedSelection);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);
}

const LAYOUT_QUERY = `#graphql
  query layout(
    $language: LanguageCode
  ) @inContext(language: $language) {
    shop {
      ...Shop
    }
    headerMenu: menu(handle: "main-menu") {
      ...Menu
    }
    siteNav: menu(handle: "new-header-menu") {
      ...Menu
    }
    footerMenu: menu(handle: "footer") {
      ...Menu
    }
  }
  fragment Shop on Shop {
    id
    name
    description
    primaryDomain {
      url
    }
    specialPrice: metafield(namespace: "app--55618142209--sybiz_info", key: "special_price") {
      value
    }
    brand {
      logo {
        image {
          url
        }
      }
    }
  }
  fragment MenuItem on MenuItem {
    id
    resourceId
    tags
    title
    type
    url
    items {
      id
      resourceId
      tags
      title
      type
      url
      items {
        id
        resourceId
        tags
        title
        type
        url
      }
    }
  }
  fragment Menu on Menu {
    id
    items {
      ...MenuItem
    }
  }
`;

const CUSTOMER_NAME = `#graphql
  query customer(
    $customerAccessToken: String!
  ) {
    customer(customerAccessToken: $customerAccessToken) {
      firstName
      email
      id
      scale: metafield(namespace: "custom", key: "price_scale") {
        value
      }
    }
  }
`;

/**
 * @param {Route.LoaderArgs['context']}
 */
async function getLayoutData({storefront, env}) {
  const data = await storefront.query(LAYOUT_QUERY, {
    variables: {
      language: storefront.i18n.language,
    },
  });

  invariant(data, 'No data returned from Shopify API');

  const primaryDomain = data.shop.primaryDomain.url;

  // Parse menus using parseMenu utility
  const headerMenu = data.headerMenu
    ? parseMenu(data.headerMenu, primaryDomain, env)
    : null;
  const siteNav = data.siteNav
    ? parseMenu(data.siteNav, primaryDomain, env)
    : null;
  const footerMenu = data.footerMenu
    ? parseMenu(data.footerMenu, primaryDomain, env)
    : null;

  return {
    shop: data.shop,
    headerMenu,
    siteNav,
    footerMenu,
  };
}

/** @typedef {LoaderReturnData} RootLoader */

/** @typedef {import('react-router').ShouldRevalidateFunction} ShouldRevalidateFunction */
/** @typedef {import('./+types/root').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
