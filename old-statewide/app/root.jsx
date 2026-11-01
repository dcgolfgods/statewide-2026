import {defer} from '@shopify/remix-oxygen';
import { parse as parseCookie, } from 'worktop/cookie'
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  LiveReload,
  ScrollRestoration,
  useLoaderData,
  useMatches,
  useRouteError,
} from '@remix-run/react'; 
import {useEffect} from 'react'; 
import {ShopifySalesChannel, Seo, useNonce} from '@shopify/hydrogen';
import invariant from 'tiny-invariant';
import customFonts from './styles/custom-font.css';
import { countries } from '~/data/countries';
import { redirect } from '@shopify/remix-oxygen';

import {Layout} from '~/components';
import {SeoImageMeta} from '~/components/SeoImageMeta';
import {seoPayload} from '~/lib/seo.server';
import {isSearchEngineIndexable} from '~/lib/indexing.server';

import favicon from '../public/favicon.ico';

import {GenericError} from './components/GenericError';
import {NotFound} from './components/NotFound';
import styles from './styles/app.css';
import {DEFAULT_LOCALE, parseMenu} from './lib/utils';
import {useAnalytics} from './hooks/useAnalytics';
// import SwiperStyle from  'swiper/css';
// import SwiperNavStyle from 'swiper/css/navigation';
// import {redirectLinks} from './components/redirectLinks';
import globalCss from './styles/global.css';
import {getRedirectionByHandle} from '~/lib/shopifyAdminMetaobjects';
import {getLowercasePathRedirect, isStaticAssetPath} from '~/lib/urlRedirects';

const LOWERCASE_PATH_REDIRECT_SCRIPT =
  '(function(){var p=location.pathname;function h(v){try{return /[^\\x00-\\x7F]/.test(decodeURIComponent(v));}catch(e){return /[^\\x00-\\x7F]/.test(v);}}if(!/\\.[a-z0-9]+$/i.test(p)&&!h(p)&&p!==p.toLowerCase()){location.replace(p.toLowerCase()+location.search+location.hash);}})();';

// This is important to avoid re-fetching root queries on sub-navigations
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

export const links = () => {
  return [
    // {rel: 'stylesheet', href: styles},
    // { rel: 'stylesheet', href: customFonts },
    // {rel: 'stylesheet', href: SwiperStyle},
    // {rel: 'stylesheet', href: SwiperNavStyle},

    // { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick.min.css' },
    // { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick-theme.min.css' },
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'preconnect',
      href: 'https://shop.app',
    },
    {rel: 'icon', type: 'image/svg+xml', href: favicon}
  ];
};

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
    // console.log("isStaticAssetRequest",isStaticAssetRequest, urlPath)
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

  if(urlPath.includes('plugin')){
    return redirect(`/`, { status: 301 }); 
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
    const redirectUrl = pathWithoutSlash + (url.search || '') + (url.hash || '');
    return redirect(redirectUrl, { status: 301 });
  }
  
  // const matchedElement = redirectLinks.find(item => item.matchedUrl.includes(urlPath));
  // if(matchedElement){
  //   throw redirect(`https://www.statewideapp.com.au${matchedElement.redirectTo}`, { status: 301 }); // Ensure 301 status
  // }
  const {session, storefront, cart} = context;
  const [customerAccessToken, layout] = await Promise.all([
    session.get('customerAccessToken'),
    getLayoutData(context,request),
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
  let ShopCookies = parseCookie(request.headers.get('Cookie') || '');
  const cookieLocale = ShopCookies.locale;
  // let userCountry = "NZ"

  if (cookieLocale) {
    userCountry = cookieLocale.toLocaleUpperCase()
  }

  const currencyParam = url.searchParams.get('currency');
  if (currencyParam) {
    const currencyToCountry = { AUD: 'AU', NZD: 'NZ' };
    const mappedCountry = currencyToCountry[currencyParam.toUpperCase()];
    if (mappedCountry) {
      userCountry = mappedCountry;
    }
  }

  if(userCountry != 'AU' && userCountry != 'NZ'){
    userCountry = "AU"
  }

  const  isLoggedIn= Boolean(customerAccessToken)
  let customeFirstName=null;
  let customer = null;
  let customerToken = null;
  if(isLoggedIn){
    customerToken = customerAccessToken;
    const data = await storefront.query(CUSTOMER_NAME, {
      variables: {
        customerAccessToken,
      },
    });
    customeFirstName=data?.customer?.firstName;
    customer = data?.customer
  }
    return defer({
      isLoggedIn ,
      customeFirstName,
      customer,
      customerToken,
      layout,
      shop: layout.shop,
      isProduction: process.env.NODE_ENV === 'production',
      allowIndexing,
      userCountry,
      selectedLocale: storefront.i18n,
      // cart: cart.get(),
      analytics: {
        shopifySalesChannel: ShopifySalesChannel.hydrogen,
        shopId: layout.shop.id,
      },
      seo,
    });
}

export default function App() {
  const nonce = useNonce();
  const data = useLoaderData();
  const locale = data.selectedLocale ?? DEFAULT_LOCALE;
  const hasUserConsent = true;

  useAnalytics(hasUserConsent);
  useEffect(() => {
    if(!data.isProduction){
      // return;
    }
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
  // Moved to Layout.jsx - script loading code
  // const thirdParty = `
  // var continuallySettings = { appID: "ev3yv4444ypn" };
  // window.dataLayer = window.dataLayer || [];
  // function gtag(){dataLayer.push(arguments);}
  // gtag('js', new Date());
  // gtag('config', 'G-L8ZRY2ZJ5B');
 
  // (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  // new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  // j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  // 'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  // })(window,document,'script','dataLayer','GTM-MZTBBM');
  
  // window.renderBadge = function() {
  //   if (!window.gapi) {
  //     console.error("Google API not loaded yet.");
  //     return;
  //   }

  //   var ratingBadgeContainer = document.createElement("div");
  //   document.body.appendChild(ratingBadgeContainer);

  //   window.gapi.load('ratingbadge', function() {
  //     if (window.gapi.ratingbadge) {
  //       window.gapi.ratingbadge.render(ratingBadgeContainer, {"merchant_id": 100455706});
  //     } else {
  //       console.error("gapi.ratingbadge is not available.");
  //     }
  //   });
  // };

  // // Ensure script is loaded before executing renderBadge
  // window.onload = function() {
  //   if (window.gapi) {
  //     renderBadge();
  //   } else {
  //     console.warn("Google API script not ready yet. Retrying in 2 seconds...");
  //     setTimeout(() => {
  //       if (window.gapi) renderBadge();
  //     }, 2000);
  //   }
  // };
  // var gts = gts || [];
  //   gts.push(["id", "511429"]);
  //   gts.push(["badge_position", "BOTTOM_RIGHT"]);
  //   gts.push(["locale", "en_AU"]);

  //   gts.push(["google_base_subaccount_id", "100455706"]);
  //   // gts.push(["google_base_country", "AU"]);
  //   // gts.push(["google_base_language", "en"]);

  //   (function () {
  //       var gts = document.createElement("script");
  //       gts.type = "text/javascript";
  //       gts.async = true;
  //       gts.src = "https://www.googlecommerce.com/trustedstores/api/js";
  //       var s = document.getElementsByTagName("script")[0];
  //       s.parentNode.insertBefore(gts, s);
  //   })(); 
  //   window.dataLayer = window.dataLayer || [];
  //   function gtag(){dataLayer.push(arguments);}
  //   gtag('js', new Date());
  //   gtag('config', 'AW-967205338');

  //    (function(c,l,a,r,i,t,y){
  //       c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
  //       t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
  //       y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  //   })(window, document, "clarity", "script", "axoyaxic62");
  // `;

  // useEffect(() => {
  //   // Prevent scripts from loading multiple times
  //   if (window.scriptsLoaded) return;
  //   window.scriptsLoaded = true;
  
  //   // Function to add scripts dynamically
  //   const addScript = (src, async = true, defer = false) => {
  //     if (document.querySelector(`script[src="${src}"]`)) return; // Avoid duplicate script loading
  //     const script = document.createElement("script");
  //     script.src = src;
  //     script.async = async;
  //     script.defer = defer;
  //     document.body.appendChild(script);
  //   };
  
  //   console.log("All scripts will load after the page has fully loaded.");
  
  //   // Load scripts when the browser is idle (improves performance)
  //   if ("requestIdleCallback" in window) {
  //     requestIdleCallback(() => {
  //       addScript("https://www.googletagmanager.com/gtm.js?id=GTM-MZTBBM"); // Google Tag Manager
  //       addScript("https://www.googletagmanager.com/gtag/js?id=G-L8ZRY2ZJ5B"); // Google Analytics
  //       addScript("https://www.googletagmanager.com/gtag/js?id=AW-967205338"); // Google Ads
  //       addScript("https://static.klaviyo.com/onsite/js/klaviyo.js?company_id=PkGTck", true, true); // Klaviyo
  //       // addScript("https://a.klaviyo.com/media/js/onsite/onsite.js", true, true); // Klaviyo Onsite
  //       addScript("https://cdn-app.continual.ly/js/embed/continually-embed.latest.min.js", true, true); // Continually Chatbot
  //       addScript("https://www.googlecommerce.com/trustedstores/api/js", true); // Google Trusted Stores
  //       addScript("https://apis.google.com/js/platform.js", true); // Google Platform API
  //       const platformScript = document.createElement("script");
  //       platformScript.innerHTML = thirdParty;
  //       platformScript.defer = true;
  //       document.body.appendChild(platformScript);
  //     });
  //   } else {
  //     // Fallback: Load scripts after a short delay
  //     setTimeout(() => {
  //       addScript("https://www.googletagmanager.com/gtm.js?id=GTM-MZTBBM");
  //       addScript("https://www.googletagmanager.com/gtag/js?id=G-L8ZRY2ZJ5B");
  //       addScript("https://www.googletagmanager.com/gtag/js?id=AW-967205338");
  //       addScript("https://static.klaviyo.com/onsite/js/klaviyo.js?company_id=PkGTck", true, true);
  //       // addScript("https://a.klaviyo.com/media/js/onsite/onsite.js", true, true);
  //       addScript("https://cdn-app.continual.ly/js/embed/continually-embed.latest.min.js", true, true);
  //       addScript("https://www.googlecommerce.com/trustedstores/api/js", true);
  //       addScript("https://apis.google.com/js/platform.js", true);
  //       const platformScript = document.createElement("script");
  //       platformScript.innerHTML = thirdParty;
  //       platformScript.defer = true;
  //       document.body.appendChild(platformScript);
  //     }, 4000); // Load after 3 seconds if `requestIdleCallback` is not supported
  //   }
  // }, []);
  
  return (
    <html lang={locale.language} className={data.isProduction ? 'env-production' : ''}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: LOWERCASE_PATH_REDIRECT_SCRIPT,
          }}
        />
        {!data.allowIndexing && (
          <meta name="robots" content="noindex, nofollow" />
        )}
        <Seo />
        <SeoImageMeta />
        <Meta />
        <Links />
        {/* <script src="//cdn.shopify.com/s/javascripts/currencies.js"></script> */}
        {data.customer?.email ? (
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
        <style
          dangerouslySetInnerHTML={{
            __html:
              'body{margin:0;opacity:0}.announcement-bar{height:42px;min-height:42px;display:flex;align-items:center;justify-content:center;text-align:center;background:#f1f2f2}.announcement-bar .hidden{display:none}.header-desktop{height:180px;min-height:180px}.header-wrapper{box-sizing:border-box;height:141px;min-height:141px;display:flex;align-items:center;justify-content:space-between;width:100%;padding:17px 32px 17px 15px}.header-left{min-height:106px}.header-logo{height:106px}.header-logo img{display:block;width:100%;max-width:440px;height:auto;max-height:106px;object-fit:contain}.mobile-header{box-sizing:border-box;height:147.5px;min-height:147.5px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;width:100%;padding:5px 10px;line-height:1;background:#fff}.mobile-header-logo{height:59px;min-height:59px;max-height:59px;overflow:hidden;display:flex;align-items:center;justify-content:center}.mobile-header-logo img{display:block;width:100%;max-width:100%;height:auto;max-height:59px;object-fit:contain}.mobile-header .search-form input{box-sizing:border-box;height:40px;width:100%}.home-slider-frame{aspect-ratio:2094/400;width:100%;overflow:hidden}@media (max-width:1024px){.sm-hide{display:none!important}}@media (min-width:1025px){.sm-show{display:none!important}.announcement-bar{height:48px;min-height:48px}.announcement-bar .hidden{display:block}.announcement-bar .lg\\:hidden{display:none}.home-slider-frame{aspect-ratio:2094/350}.search-form input{height:46px}}',
          }}
        />
      </head>
      <body>
        <Layout
          key={`${locale.language}-${locale.country}`}
          layout={data.layout}
          customeFirstName={data.customeFirstName}
        >
          <Outlet />
        </Layout>
        <link rel="stylesheet" href={styles} />
        <link rel="stylesheet" href={globalCss} />
        <link rel="stylesheet" href={customFonts} />
        <div id="google-reviews-badge" ></div>
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
        <LiveReload nonce={nonce} />


      </body>
    </html>
  );
}

export function ErrorBoundary({error}) {
  const nonce = useNonce();
  const [root] = useMatches();
  const locale = root?.data?.selectedLocale ?? DEFAULT_LOCALE;
  const routeError = useRouteError();
  const isRouteError = isRouteErrorResponse(routeError);

  let title = 'Error';
  let pageType = 'page';

  if (isRouteError) {
    title = 'Not found';
    if (routeError.status === 404) pageType = routeError.data || pageType;
  }

  return (
    <html lang={locale.language} className={root?.data?.isProduction ? 'env-production' : ''}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: LOWERCASE_PATH_REDIRECT_SCRIPT,
          }}
        />
        <title>{title}</title>
        <Meta />
        <Links />
      </head>
      <body>
        <Layout
          layout={root?.data?.layout}
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
            <GenericError error={error instanceof Error ? error : undefined} />
          )}
        </Layout>
        <link rel="stylesheet" href={styles} />
        <link rel="stylesheet" href={globalCss} />
        <link rel="stylesheet" href={customFonts} />
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
        <LiveReload nonce={nonce} />

      </body>
    </html>
  );
}

const LAYOUT_QUERY = `#graphql
  query layout(
    $language: LanguageCode
    $customerAccessToken: String!
  ) @inContext(language: $language) {
    shop {
      ...Shop
    }
    customer:customer(customerAccessToken: $customerAccessToken) {
      firstName
      email
      id
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
const CUSTOMER_NAME=`
#graphql
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
  `
async function getLayoutData({storefront, env},request) {
  const data = await storefront.query(LAYOUT_QUERY, {
    variables: {
      customerAccessToken:"",
      language: storefront.i18n.language,
    },
  });

  invariant(data, 'No data returned from Shopify API');

  const primaryDomain = data.shop.primaryDomain.url;
  
  // Parse menus using parseMenu utility
  const headerMenu = data.headerMenu ? parseMenu(data.headerMenu, primaryDomain, env) : null;
  const siteNav = data.siteNav ? parseMenu(data.siteNav, primaryDomain, env) : null;
  const footerMenu = data.footerMenu ? parseMenu(data.footerMenu, primaryDomain, env) : null;

  return {
    shop: data.shop,
    headerMenu,
    siteNav,
    footerMenu,
  };
}