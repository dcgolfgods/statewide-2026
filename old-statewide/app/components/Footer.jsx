import { Link } from '~/components';
import { useIsHomePath } from '~/lib/utils';
import { IconArrow } from '~/components';
import { useMatches } from '@remix-run/react';
import { DEFAULT_LOCALE } from '~/lib/utils';

function FooterLink({ item }) {
  if (item.to.startsWith('http')) {
    return (
      <a
        href={item.to}
        className="text-[#1e5097] text-[14px] hover:underline mb-1"
        target={item.target}
        rel="noopener noreferrer"
      >
        {item.title}
      </a>
    );
  }
  return (
    <Link
      to={item.to}
      className="text-[#1e5097] text-[14px] hover:underline"
      target={item.target}
      prefetch="intent"
    >
      {item.title}
    </Link>
  );
}

function FooterMenu({ menu }) {
  const styles = {
    section: '',
    nav: 'grid  pb-2',
  };
  return (
    <>
      {(menu?.items || []).map((item) => (
        <div key={item.id} className={'lg:w-auto w-full'}>
          <div>
              <>
                <button className="w-full text-left md:cursor-default">
                  <h4
                    className="w-full relative color-[#1e5097] top-[5px] text-[18px] lg:mb-4 mb-1 font-bold leading-[28px] flex justify-between"
                    size="lead"
                    as="h3"
                  >
                    {item.title}
                    
                  </h4>
                </button>
                {item?.items?.length > 0 ? (
                  <div
                    className={`$${true ? `max-h-48 h-fit` : `max-h-0 md:max-h-fit`} overflow-hidden transition-all duration-300`}
                  >
                    {/* <Suspense data-comment="This suspense fixes a hydration bug in Disclosure.Panel with static prop"> */}
                        <nav className={styles.nav}>
                          {item.items.map((subItem) => (
                            <FooterLink key={subItem.id} item={subItem} />
                          ))}
                        </nav>
                    {/* </Suspense> */}
                  </div>
                ) : null}
              </>
          </div>
        </div>
      ))}
    </>
  );
}

function SocialLinks() {
  return (
    <div className="lg:w-auto w-full social-links">
      <>
        <h4
          className="w-full relative color-[#1e5097] top-[5px] text-[18px] mb-4 font-bold leading-[28px] flex justify-between"
          size="lead"
          as="h3"
        >
          Stay connected
        </h4>
        <div className={`max-h-48 h-fit overflow-hidden transition-all duration-300`}>
          <ul className="social-links flex gap-[5px]">
            <li>
              <a target="_blank" href="https://www.facebook.com/statewideapp">
                <img
                  src="https://cdn.shopify.com/s/files/1/0799/5929/4245/files/Facebook.webp?v=1697975772"
                  alt="Facebook"
                  height="40"
                  width="40"
                  loading="lazy"
                />
              </a>
            </li>
            <li>
              <a target="_blank" href="https://au.linkedin.com/company/statewide-appliance-spares">
                <img
                  src="https://cdn.shopify.com/s/files/1/0799/5929/4245/files/LinkedIn.webp?v=1697975772"
                  alt="LinkedIn"
                  height="40"
                  width="40"
                  loading="lazy"
                />
              </a>
            </li>
            <li>
              <a target="_blank" href="https://www.youtube.com/user/StatewideAppliances">
                <img
                  src="https://cdn.shopify.com/s/files/1/0799/5929/4245/files/youtube.webp?v=1697975771"
                  alt="YouTube"
                  height="40"
                  width="40"
                  loading="lazy"
                />
              </a>
            </li>
            <li>
              <a target="_blank" href="https://www.statewideapp.com.au/blogs">
                <img
                  src="https://cdn.shopify.com/s/files/1/0799/5929/4245/files/Blog.webp?v=1697975772"
                  alt="Statewide Appliance Spares Blog"
                  height="40"
                  width="40"
                  loading="lazy"
                />
              </a>
            </li>
          </ul>
        </div>
      </>
    </div>
  );
}

function FooterBottomBar() {
  return (
    <div className="bg-[#1e5097]">
      <div className="footer-upper pt-[15px] px-4 text-left lg:text-center text-white">
        <div className="copyright flex-wrap flex justify-center">
          <div className="hidden lg:block ssl-container mr-[10px]">
            <img
              src="https://cdn.shopify.com/s/files/1/0799/5929/4245/files/SSL.webp?v=1697976016"
              alt="ssl secure"
              height="40"
              className='w-full max-w-[100px]'
              width="115"
              loading="lazy"
            />
          </div>
          <div className='flex flex-wrap items-center'>
          <a
            className="text-[#fff] text-xs my-[5px] lg:mx-[15px] phonenumber"
            href="tel:+611800005220"
          >
            Australia Free Call <span className='openSandBold font-bold'>1800 005 220</span>
          </a>
          <span className='mx-1 lg:hidden inline-block'>|</span>
          <a
            className="text-[#fff] text-xs my-[5px] lg:mx-[15px] phonenumber"
            href="tel:+6499655155"
          >
            NZ Local Call <span className='openSandBold font-bold'>09 965 5155</span>
          </a>
          </div>
          <div className='flex flex-wrap items-center'>
            <a
              className="text-[#fff] text-xs lg:m-[10px]  terms-links"
              href="/privacy-policy"
            >
              {' '}
              Privacy Policy
            </a>
            <a
              className="text-[#fff] text-xs m-[10px] terms-links"
              href="/conditions-of-use"
            >
              {' '}
              Conditions of Use
            </a>
            <div className="lg:hidden yssl-container ml-[10px]">
            <img
              src="https://cdn.shopify.com/s/files/1/0799/5929/4245/files/SSL.webp?v=1697976016"
              alt="ssl secure"
              height="40"
              className='w-full max-w-[70px]'
              width="115"
              loading="lazy"
            />
          </div>
          </div>
        </div>

      </div>
      <div className="text-[12px] pt-[5px] pb-[15px] px-[20px] text-center text-white footer-lower row">
        Copyright © 2026 Statewide Appliance Spares. All Rights Reserved. ABN 26
        008 171 588
      </div>
    </div>
  );
}

function Footer({ menu }) {
  const [root] = useMatches();
  const selectedLocale = root.data?.selectedLocale ?? DEFAULT_LOCALE;

  const isHome = useIsHomePath();
  return (
    <div
      divider={isHome ? 'none' : 'top'}
      as="footer"
      role="contentinfo"
      className={`w-full bg-[#f2f2f2] overflow-hidden`}
    >
      <div className=''>
        <div className='container px-4  lg:px-0'>
          <div className="py-6 lg:py-5  text-[#1e5097] w-full mx-auto flex flex-wrap justify-between">
            <FooterMenu menu={menu} />
            <OpeningHours selectedLocale={selectedLocale} />
            <SocialLinks />
          </div>
        </div>
        <FooterBottomBar  />
      </div>
    </div>
  );
}

export default Footer;

function OpeningHours({selectedLocale}) {
  return (
    <div className="lg:w-auto w-full">
      <>
        <h4
          className="w-full relative color-[#1e5097] top-[5px] text-[18px] lg:mb-4 mb-1 font-bold leading-[28px] flex justify-between"
          size="lead"
          as="h3"
        >
          {selectedLocale?.country == 'NZ' ? 
          <>
          Opening hours (NZDT)
          </>
          : 
          <>
          Opening hours (ACST)
          </>
          }
        </h4>
        <div className={`transition-all duration-300`}>
            {selectedLocale?.country == 'NZ' ? 
            <div className="">
            <p className="text-[#1e5097] text-[14px] hover:underline mb-1">
              <span className='min-w-[113px] inline-block mr-2'>Monday to Friday:</span>
              <Link to="/contactus" className=''>11:00am-7:30pm</Link>
            </p>
            <p className="text-[#1e5097] text-[14px] hover:underline mb-1">
            <span className='min-w-[113px] inline-block mr-2'>Saturday:</span>
              <Link to="/contactus" className=''>11:00am-03:00pm</Link>
            </p>
            <p className="text-[#1e5097] text-[14px] hover:underline mb-1">
            <span className='min-w-[113px] inline-block mr-2'>NZ Local Call</span>
              <span><a href="tel:+6499655155" className='OpenSansBold'>09 965 5155</a></span>
            </p>
          </div>
            :
            <div className="">
            <p className="text-[#1e5097] text-[14px] hover:underline mb-1">
            <span className='min-w-[113px] inline-block mr-2'>Monday to Friday:</span>
              <Link to="/contactus" className=''>8:30am-5:00pm</Link>
            </p>
            <p className="text-[#1e5097] text-[14px] hover:underline mb-1">
            <span className='min-w-[113px] inline-block mr-2'>Saturday:</span>
              <Link to="/contactus" className=''>8:30am-12:30pm</Link>
            </p>
            <p className="text-[#1e5097] text-[14px] hover:underline mb-1">
            <span className='min-w-[113px] inline-block mr-2'>Australia Free Call</span>
              <span><a href="tel:+611800005220" className='OpenSansBold'>1800 005 220</a></span>
            </p>
          </div>
            }
          
        </div>
      </>
    </div>
  );
}