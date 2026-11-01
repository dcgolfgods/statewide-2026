import { useParams, Form, Await, useMatches, useLocation } from '@remix-run/react';
import { Suspense, useEffect, useMemo, useState, useRef, createContext, useContext, lazy } from 'react';
import { Image } from '@shopify/hydrogen';
// import { register } from 'swiper/element/bundle';
import {
  Drawer, CartDrawerFly,
  SearchForm,
  useDrawer,
  CountrySelector,
  Services,
  Link,
} from '~/components';
import { freeCall, useIsHomePath,  } from '~/lib/utils';
import { useIsHydrated } from '~/hooks/useIsHydrated';
import { DEFAULT_LOCALE } from '../lib/utils';
// getCartDataOrCreate
import { CartProvider, useCart } from '~/components/cartContext';
import { MenuDrawer } from './MenuDrawer';
import MegaMenuDesktop from './MegaMenuDesktop';

const Footer = lazy(() => import('./Footer'));
const GoogleReview = lazy(() => import('./GoogleReview'));

export function Layout({ children, layout, customeFirstName }) {
  const {headerMenu, footerMenu, siteNav} = layout;
  // console.log("headerMenu",headerMenu)
  const [root] = useMatches(); 
  const location = useLocation();
  const customerToken = root.data.customerToken; 
  const userCountry = root.data.userCountry;
  const email = root.data?.customer?.email;
  const skipResources = root?.data?.skipResources; 

  // Keep HubSpot visitor identity in sync for logged-in customers (SPA navigations).
  useEffect(() => {
    if (email) {
      window.customerEmail = email;
      const _hsq = (window._hsq = window._hsq || []);
      _hsq.push(['identify', {email}]);
    } else {
      delete window.customerEmail;
    }
  }, [email]);
  // register();

  // Third-party scripts configuration
  const thirdParty = `
  var continuallySettings = { appID: "ev3yv4444ypn" };
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-L8ZRY2ZJ5B');
 
  // GTM is injected once below after window load to avoid a double download.
  
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
//  var gts = gts || [];
//     gts.push(["id", "511429"]);
//     gts.push(["badge_position", "BOTTOM_RIGHT"]);
//     gts.push(["locale", "en_AU"]);

//     gts.push(["google_base_subaccount_id", "100455706"]);
    // gts.push(["google_base_country", "AU"]);
    // gts.push(["google_base_language", "en"]);

    // (function () {
    //     var gts = document.createElement("script");
    //     gts.type = "text/javascript";
    //     gts.async = true;
    //     gts.src = "https://www.googlecommerce.com/trustedstores/api/js";
    //     var s = document.getElementsByTagName("script")[0];
    //     s.parentNode.insertBefore(gts, s);
    // })(); 
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'AW-967205338');

     (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "axoyaxic62");
  `;

  useEffect(() => {
    const addScript = (src, async = true, defer = false, id) => {
      if (document.querySelector(`script[src="${src}"]`)) return;
      const script = document.createElement('script');
      script.src = src;
      script.async = async;
      script.defer = defer;
      if (id) script.id = id;
      document.body.appendChild(script);
    };

    const loadThirdParty = () => {
      if (window.scriptsLoaded) return;
      window.scriptsLoaded = true;

      addScript('https://www.googletagmanager.com/gtm.js?id=GTM-MZTBBM');
      addScript('https://www.googletagmanager.com/gtag/js?id=G-L8ZRY2ZJ5B');
      addScript('https://www.googletagmanager.com/gtag/js?id=AW-967205338');
      addScript(
        'https://static.klaviyo.com/onsite/js/klaviyo.js?company_id=PkGTck',
        true,
        true,
      );
      addScript(
        'https://cdn-app.continual.ly/js/embed/continually-embed.latest.min.js',
        true,
        true,
      );
      addScript('https://www.googlecommerce.com/trustedstores/api/js', true);
      addScript(
        'https://js-ap1.hs-scripts.com/443318423.js',
        true,
        true,
        'hs-script-loader',
      );

      const platformScript = document.createElement('script');
      platformScript.innerHTML = thirdParty;
      platformScript.defer = true;
      document.body.appendChild(platformScript);
    };

    const schedule = () => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(loadThirdParty, {timeout: 4000});
      } else {
        setTimeout(loadThirdParty, 4000);
      }
    };

    if (document.readyState === 'complete') {
      schedule();
      return;
    }

    window.addEventListener('load', schedule, {once: true});
    return () => window.removeEventListener('load', schedule);
  }, []); 

  return (
    <CartProvider userCountry={userCountry} email={email} customerToken={customerToken}>

      <div className="flex flex-col">
        <div className="">
          <a href="#mainContent" className="sr-only">
            Skip to content
          </a>
        </div>
        {headerMenu && (
          <Header
            title={layout.shop.name}
            menu={headerMenu}
            siteNav={siteNav}
            customerToken={customerToken}
            customeFirstName={customeFirstName}
            skipResources={skipResources}
          />
        )}
        <main role="main" id="mainContent" className="flex-grow">
          {children}
        </main>
        {/* Lazy load GoogleReview for faster initial paint */}
        <Suspense fallback={null}>
          <GoogleReview />
        </Suspense>
      </div>
      {/* Lazy load Footer for faster initial paint */}
      {footerMenu && (
        <Suspense fallback={null}>
          <Footer menu={footerMenu} />
        </Suspense>
      )}
    </CartProvider>
  );
}

function Header({ title, menu, siteNav, customeFirstName, customerToken, skipResources }) {
  const isHome = useIsHomePath();
  const [root] = useMatches();
  const { cart, cartLoading, isCartOpen, openCart, closeCart } = useCart();
  const selectedLocale = root.data?.selectedLocale ?? DEFAULT_LOCALE;
  const {
    isOpen: isMenuOpen,
    openDrawer: openMenu,
    closeDrawer: closeMenu,
  } = useDrawer();




  return (
    <>
      {!skipResources && <CartDrawer customerToken={customerToken} cart={cart} loading={cartLoading} isOpen={isCartOpen} onClose={closeCart} />}
      {!skipResources && (
        <MenuDrawer selectedLocale={selectedLocale} isOpen={isMenuOpen} onClose={closeMenu} menu={siteNav} />
      )}
      {!skipResources && <Announce />}
      <DesktopHeader
        isHome={isHome}
        siteNav={siteNav}
        title={title}
        menu={menu}
        isCartOpen={isCartOpen}
        closeCart={closeCart}
        openCart={openCart}
        customeFirstName={customeFirstName}
        skipResources={skipResources}
      />
      <MobileHeader
        isHome={isHome}
        title={title}
        openCart={openCart}
        openMenu={openMenu}
        isCartOpen={isCartOpen}
        customeFirstName={customeFirstName}
        skipResources={skipResources}
      />
      <Services />
    </>
  );
}

function Announce() {
  return (
    <div className="announcement-bar flex items-center justify-center text-center min-h-[42px] lg:min-h-[42px] bg-[#f1f2f2]">
        <Link to="/announcement" className="hidden lg:block font-bold cursor-pointer p-3 text-xs md:text-base text-[#1e5097]">
        More than just spares! Australia & NZ's Biggest Range
        </Link>
        <Link to="/announcement" className="lg:hidden block font-bold cursor-pointer p-3 text-xs md:text-sm text-[#1e5097]">
        More than just spares!
        </Link>
    </div>
  );
}
//ss
function CartDrawer({ isOpen, loading, onClose, cart, customerToken }) {
  return (
    <Drawer open={isOpen} onClose={onClose} heading="My Cart" openFrom="right">
      <CartDrawerFly customerToken={customerToken} loading={loading} layout="drawer" onClose={onClose} cart={cart} />
    </Drawer>
  );
}


function ErrorDisplay({ error }) {
  return (
    <div className='carterror'>
      <h2>Error Occurred</h2>
      <p>{error?.message || "Unknown error"}</p>
      <pre>{JSON.stringify(error, null, 2)}</pre> {/* Debugging info */}
    </div>
  );
}




function MobileHeader({ title, isHome, isCartOpen, openCart, openMenu }) {
  // useHeaderStyleFix(containerStyle, setContainerStyle, isHome);
  const [root] = useMatches();
  const isLoggedIn = root.data?.isLoggedIn;
  const params = useParams();
  const handleOpenMenu = () => {
    document.body.classList.add('overflow-hidden');
    openMenu()
  }

  const selectedLocale = root.data?.selectedLocale ?? DEFAULT_LOCALE;
  const call = freeCall(selectedLocale, true);
  let cname = "Au";
  if (call?.country == 'Australia') {
    cname = "Au ";
  } else if (call?.country == 'New Zealand') {
    cname = "NZ "
  }
  return (
    <header
      role="banner"
      className={`mobile-header min-h-[147.5px] flex flex-wrap sm-show items-center bg-[#fff] z-40 sticky top-0 justify-between w-full leading-none px-[10px] py-[5px]`}
    >
      <div className="w-full flex justify-between border-b	border-[#c6ceda] mb-[5px]">
        <div className="w-full max-w-[120px]">
          <CountrySelector />
        </div>
        <div className="text-[#1e5097] flex  items-center text-[12px] w-full justify-end">
          <a href={`tel:${call.tel}`}>
            <div className="freecall-number">
              <span className="">{call?.country} Call </span>
              <span className="font-bold header-call">{call.num1}</span>
            </div>
          </a>

        </div>
      </div>
      <div className='flex w-full'>

        <div className="flex items-center justify-start w-[15%]">
          <button onClick={handleOpenMenu} className="relative mr-[15px] flex items-center justify-center w-8 h-8">
            <i className="fa fa-bars text-[#1e5097] text-[24px]"></i>
          </button>
        </div>
        <div className="w-[65%]">
          <div className='w-full mx-auto mobile-header-logo flex h-[59px] min-h-[59px] max-h-[59px] items-center justify-center overflow-hidden'>
            <Logo mobile={true} />
          </div>
        </div>
        <div className="flex text-[#1e5097] cart-count-wrap items-center justify-end relative  w-[20%]">
          <AccountIcon isLoggedIn={isLoggedIn} />
          <CartCount isHome={isHome} openCart={openCart} />

        </div>
      </div>
      <SearchForm params={params} isHome={isHome} openCart={openCart} />

      {/* <Form
        method="get"
        action={params.locale ? `/${params.locale}/search` : '/search'}
        className="relative w-[95%] mx-auto flex items-center py-[10px] text-[#00aeef]"
        onSubmit={()=> searchInput.current.blur()}
      >
        <Input
          ref={searchInput}
          className="w-full text-[13px] rounded-[4px] border-none border-[#00aeef] h-[40px]"
          type="search"
          variant="minisearch"
          placeholder="Search by brand, appliance type, part no. or model no."
          name="q"
        />
        <button
          type="submit"
          className="absolute  top-1/2 transform right-0 -translate-y-1/2  flex items-center justify-center w-6 h-8"
        >
          <i className="fa fa-search text-[20px]"></i>
        </button>
      </Form> */}
    </header>
  );
}

function Logo({ title, classes, mobile }) {
  return (
    <Link prefetch="intent" to="/" className={`block ${classes}`}>
      <Image
        src={`https://cdn.shopify.com/s/files/1/0799/5929/4245/files/Statewide_appliance_spares_logo_mob.svg?v=1744808441`}
        alt="Statewide Appliance Spares"
        className={`cursor-pointer w-full lg:max-w-[440px]${mobile ? ' h-auto max-h-[59px] object-contain' : ''}`}
        sizes="(min-width: 1024px) 440px, 200px"
        loading="eager"
      />
    </Link>
  );
}



function DesktopHeader({ isHome, menu, siteNav, isCartOpen, openCart, closeCart, title, customeFirstName, skipResources }) {
  const params = useParams();
  const [activeTab, setActiveTab] = useState('');
  const [root] = useMatches();
  const isLoggedIn = root.data?.isLoggedIn;
  const selectedLocale = root.data?.selectedLocale ?? DEFAULT_LOCALE;
  const [selectedMenu, setSelectedMenu] = useState(-1);

  const call = freeCall(selectedLocale, false);
  // console.log(siteNav);
  return (
    <header
      role="banner"
      className={`main-header bg-white z-[111] sticky top-0`}
    >
      <div className="min-h-[172px] header-desktop sm-hide">
        <div className={`top-0 header-wrapper shadow-[0_1px_1px_rgba(0,0,0,0.25)] border-b-[1px] border-white border-solid z-[99] flex items-center justify-between pl-[15px] pr-8 py-[17px] w-full`} >
          <div className="header-left  flex items-center justify-left w-full max-w-[30%] min-h-[106px]">
            <Logo title={title} classes="w-full header-logo desktop-header-logo" />
          </div>

          <div className='w-full max-w-[45%] desktop-search-bar-wrap'>
            <SearchForm params={params} isHome={isHome} openCart={openCart} />
          </div>

          <div className="flex w-search-bar justify-end flex-wrap items-center max-w-[25%]">

            <div className="w-full flex justify-end header-right-wrap">
              <div className='header-call-details'>
                {selectedLocale.country != 'NZ' ?
                  <div className="text-[#1e5097] text-center">
                    <p className='text-sm'>Australia Free Call</p>
                    <a href="tel:+611800005220" className='font-bold text-xl hover:underline'>
                      1800 005 220
                    </a>
                  </div>
                  :
                  <div className="text-[#1e5097]  text-center">
                    <p className='text-sm'>NZ Local Call</p>
                    <a href="tel:+6499655155" className='font-bold text-xl hover:underline'>
                      09 965 5155
                    </a>
                  </div>
                }
              </div>
              <div className='flex ml-8 header-country-selector'>
                <CountrySelector />
              </div>
              <AccountIcon isLoggedIn={isLoggedIn} />
              <div className="text-[#1e5097] cart-count-wrap flex header-cart-count-wrap items-center text-[20px] ml-4 lg:ml-6 relative top-[100%]">
                <CartCount isHome={isHome} openCart={openCart} />

              </div>
            </div>

          </div>
        </div>
        {!skipResources && <div className='bg-[#1e5097] desktop-navigation-wrap'>
          <nav className="flex justify-between	mx-auto items-center desktop-navigation text-white  px-4 lg:px-0 max-w-[1440px]">            {/* Top level menu items */}
            {(siteNav?.items || []).map((item, i) => (
              <div onMouseEnter={() => setSelectedMenu(i)} onMouseLeave={() => setSelectedMenu(-1)} className='first-level-link' key={i}>
                <Link
                  to={item.to}
                  target={item.target}
                  className={`block font-semibold text-[12px] py-[10.4px] hover:text-[#00aeef] ${activeTab === item.title ? 'text-[#00aeef]' : 'text-white'
                    }`}
                >
                  {item.title}
                </Link>
                {selectedMenu == i && <Suspense fallback={null}><MegaMenuDesktop selectedLocale={selectedLocale} item={item} /></Suspense>}
                {selectedMenu == i && <div onMouseEnter={() => setSelectedMenu(-1)} className='megamenu-bg-overlay w-full second-level-main-menu h-[1000vh] z-[10] b-[40px] overflow-y-auto absolute mx-auto justify-center  left-0 right-0 top-full'></div>}
              </div>
            ))}
            {/* mega-menu UI */}
          </nav>
        </div>}
      </div>
    </header>
  );
}

function AccountIcon({ isLoggedIn }) {
  return (
    <div className="flex lg:ml-4 ml-0 lg:mr-0 mr-2 items-center justify-center text-[12.8px] text-[#1e5097] header-account-icon">
      <div className='min-w-8 flex justify-center'>
        {isLoggedIn ?
          <>

            <Link to={'/account'} aria-label="View your account" className={'text-[#1e5097] flex items-center flex-col'}>
              <svg aria-hidden="true" className='header-svg w-5 h-5 lg:w-6 lg:h-6' xmlns="http://www.w3.org/2000/svg" xmlns:v="https://vecta.io/nano" width="500" zoomAndPan="magnify" viewBox="0 0 375 375" height="500" preserveAspectRatio="xMidYMid meet"><defs><clipPath id="A"><path d="M7 227h365.832v129.758H7zm0 0" /></clipPath></defs><g clip-path="url(#A)"><path d="M372.246 351.688c-3.242 3.863-7.473 4.98-12.391 4.98l-339.383-.129c-10.777-.012-14.285-4.332-12.402-14.957 5.156-29.105 20.957-51.902 43.602-69.824 37.707-29.84 81.492-42.891 129.113-44.418 33.336-1.066 65.844 3.051 96.93 15.621 45.793 18.492 81.785 46.629 94.52 97.285l.012 11.441zm0 0" fill="#004990" /></g><path d="M185.523 17.996c43.531-3.277 86.766 37.672 85.684 85.824-1.078 47.863-38.594 86.094-86.469 86.016-47.535-.074-85.277-38.723-85.789-86.75-.508-46.453 40.746-88.355 86.574-85.09zm0 0" fill="#004990" /></svg>
              <span className='leading-[14px] text-[10px] hidden lg:block'>Account</span>
            </Link>
            {/* <Form method="post" action={'/account/logout'}>
    <button type="submit" className="text-[#00aeef] uppercase ">
      Log out
    </button>
  </Form> */}
          </>
          :
          <>
            <Link key="login" to={'/login'} aria-label="Log in to your account" className={'text-[#1e5097] flex-col flex items-center'}>
            <svg aria-hidden="true" className='header-svg w-5 h-5 lg:w-6 lg:h-6' xmlns="http://www.w3.org/2000/svg" xmlns:v="https://vecta.io/nano" width="500" zoomAndPan="magnify" viewBox="0 0 375 375" height="500" preserveAspectRatio="xMidYMid meet"><defs><clipPath id="A"><path d="M7 227h365.832v129.758H7zm0 0" /></clipPath></defs><g clip-path="url(#A)"><path d="M372.246 351.688c-3.242 3.863-7.473 4.98-12.391 4.98l-339.383-.129c-10.777-.012-14.285-4.332-12.402-14.957 5.156-29.105 20.957-51.902 43.602-69.824 37.707-29.84 81.492-42.891 129.113-44.418 33.336-1.066 65.844 3.051 96.93 15.621 45.793 18.492 81.785 46.629 94.52 97.285l.012 11.441zm0 0" fill="#004990" /></g><path d="M185.523 17.996c43.531-3.277 86.766 37.672 85.684 85.824-1.078 47.863-38.594 86.094-86.469 86.016-47.535-.074-85.277-38.723-85.789-86.75-.508-46.453 40.746-88.355 86.574-85.09zm0 0" fill="#004990" /></svg>
            <span className='leading-[14px] text-[10px] hidden lg:block'>Login</span>
            </Link>
          </>
        }
      </div>
    </div>
  );
}


function AccountLink({ className }) {
  const [root] = useMatches();
  const isLoggedIn = root.data?.isLoggedIn;
  return isLoggedIn ? (
    <Link to="/account" className={className}>
      <i className="fa fa-user-circle"></i>
    </Link>
  ) : (
    <Link to="/login" className={className}>
      <i className="fa fa-user-circle text-black text-[32px]"></i>
    </Link>
  );
}

function CartCount({ isHome, openCart }) {
  // const [root] = useMatches();
  const { cart } = useCart()
  return (
    // <Suspense fallback={<Badge count={0} dark={isHome} openCart={openCart} />}>
    //   <Await resolve={root.data?.cart}>
    //     {(cart) => (
    <Badge
      dark={isHome}
      openCart={openCart}
      count={cart?.totalQuantity || 0}
    />
    // )}
    //   </Await>
    // </Suspense>
  );
}

function Badge({ openCart, dark, count }) {
  const isHydrated = useIsHydrated();

  const BadgeCounter = useMemo(
    () => (
      <>
        <div className='flex items-center flex-col'>
          <i aria-hidden="true" className="fa fa-shopping-cart lg:text-[25px] text-[20px]"></i>
          <span className='leading-[14px] text-[10px] hidden lg:block'>Cart</span>
        </div>
        <div
          className={`text-base text-[#1e5097] pl-[2px] ${count <= 0 && ' opacity-0'}`}
        >
          <span>{count || 0}</span>
        </div>
      </>
    ),
    [count, dark],
  );

  return isHydrated ? (
    <button
      onClick={openCart}
      aria-label="Add to cart"
      className="relative flex items-center justify-center min-w-8 focus:ring-primary/5"
    >
      {BadgeCounter}
    </button>
  ) : (
    <button
      onClick={openCart}
      aria-label="Add to cart"
      className="relative flex items-center justify-center min-w-8 focus:ring-primary/5"
    >
      {BadgeCounter}
    </button>
  );
}
