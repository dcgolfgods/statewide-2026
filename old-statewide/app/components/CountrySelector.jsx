import { useFetcher, useLocation, useMatches } from '@remix-run/react';
import { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { Button, IconCaret } from '~/components';
import { DEFAULT_LOCALE } from '~/lib/utils';
import { useCart } from '~/components/cartContext';
import { Image } from '@shopify/hydrogen';


const CountrySelectPopup = ({ countryLocale, label, setConfirmPopup, selectCountry }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { updateCountry } = useCart();

  const handleContinue = async () => {
    document.cookie = `locale=${countryLocale?.country?.toLowerCase()}; path=/`;
    setIsLoading(true);
    try {
      await updateCountry(countryLocale?.country);
    } catch (e) {
      console.error('Error updating country:', e);
    }
    window.location.href = window.location.pathname;
  };

  return <>

    <div className='bg-black/[.6] z-[1000]  in-stock-popup fixed top-0 bottom-0 left-0 right-0 h-full w-full bg'></div>
    <div className='border-[1px] text-center border-[#00000033] rounded-[4.8px] z-[1005] fixed top-1/2 left-1/2  -translate-y-1/2 -translate-x-1/2 w-[500px] max-w-[100%] bg-white p-4'>
      <div className='modal-header'>
        <h5 className='text-[17px] p-[1rem] lg:px-4 mb-2 font-bold leading-[25px] text-[#1e5097]'>You are changing your delivery destination to <span className='block mt-[2px]'>{label?.country == 'AU' ? 'Australia' : 'New Zealand'}</span></h5>
        <p className='text-[14px] text-[#1e5097] mb-0'>
          What happens next?<br />
          You will start a new shopping cart.<br />
          All prices will be displayed in {label?.country == 'AU' ? 'AUD$' : 'NZ$'}
        </p>
        {label?.country == "NZ" && (
        <p className='text-[14px] font-bold text-[#1e5097] mt-2'>
          Any products not eligible for shipping to<br />
          New Zealand will be removed from your cart
        </p>
        )}
        <div className='mb-[10px] mt-4'>
          <button type="button" onClick={handleContinue} className='bg-[#00aeef] text-white w-[150px] uppercase text-[15px] h-[34px]'>
            {isLoading ? 'Loading...' : 'Continue'}
          </button>
        </div>
        <div><button onClick={() => setConfirmPopup(false)} className='bg-white border-[1px] border-[#00aeef] text-[#00aeef]  w-[150px] uppercase text-[15px] h-[34px]'>Close</button></div>
      </div>
    </div>

  </>
}

export function CountrySelector() {
  const [root] = useMatches();
  const [confirmPopup, setConfirmPopup] = useState(false);
  const [dropDownSelectedCounty, setDropDownSelectedCountry] = useState("")
  const fetcher = useFetcher();
  const closeRef = useRef(null);
  const selectedLocale = root.data?.selectedLocale ?? DEFAULT_LOCALE;
  const { pathname, search } = useLocation();
  const pathWithoutLocale = `${pathname.replace(
    selectedLocale.pathPrefix,
    '',
  )}${search}`;

  const countries = fetcher.data ?? {};
  const defaultLocale = countries?.['default'];
  const defaultLocalePrefix = defaultLocale
    ? `${defaultLocale?.language}-${defaultLocale?.country}`
    : '';

  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: true,
  });

  const observerRef = useRef(null);
  useEffect(() => {
    ref(observerRef.current);
  }, [ref, observerRef]);

  // Get available countries list when in view
  useEffect(() => {
    if (!inView || fetcher.data || fetcher.state === 'loading') return;
    try {
      fetcher.load('/api/countries');
    } catch (e) {
      console.log("CE", e)
    }

  }, [inView, fetcher]);

  const closeDropdown = (countryLocale = undefined) => {
    closeRef.current?.removeAttribute('open');
    setConfirmPopup(true)
    setDropDownSelectedCountry(countryLocale)
  }
  const selectCountry = () => {
    if (dropDownSelectedCounty) {
      document.cookie = `locale=en-${dropDownSelectedCounty}`;
    }
    closeDropdown();
    // countryCode: countryLocale.country,
    // ChangeLocaleForm
    // let buyerIdentity={
    //   countryCode: `${dropDownSelectedCounty.toUpperCase()}`,
    // }
    // const buildFormInput = {
    //   action: CartForm.ACTIONS.BuyerIdentityUpdate,
    //   inputs: {buyerIdentity},
    // };
    // fetcher.submit(
    //   {
    //     [CartForm.INPUT_NAME]: JSON.stringify(buildFormInput),
    //   },
    //   {method: 'POST', action: '/cart'},
    // );


    // window.location.reload()
  }
  const closeCountrySelectorPopup = () => {
    setConfirmPopup(false)
    setDropDownSelectedCountry("")
  }
  let label = selectedLocale.label;
  if (label) {
    label = label.split('(')[0];
    label = label.trim();
  }

  return (
    <section
      ref={observerRef}
      className="grid w-full gap-4"
    // onMouseLeave={closeDropdown}
    >
      <div className="relative flex items-center">
        {confirmPopup && dropDownSelectedCounty && <CountrySelectPopup countryLocale={dropDownSelectedCounty} label={dropDownSelectedCounty} selectCountry={selectCountry} setConfirmPopup={closeCountrySelectorPopup} />}

        <div
          className="text-black rounded open:round-b-none overflow-clip country-wrap"
          ref={closeRef}
        >
          <div className={`text-[12.8px] w-full ${label?.toLowerCase() == 'australia' ? 'max-w-[85px]' : 'max-w-[91px]'} uppercase	 text-[#1e5097] flex items-center lg:justify-between cursor-pointer ${selectedLocale.country == 'NZ' ? 'lg:max-w-[100px]' : ''}`}>
            <div className='flex justify-center flex-col items-center'>
              {label?.toLowerCase() == 'australia' ?
                <Image
                  className='min-w-[30px] w-[32px] h-[20px] lg:min-w-[30px] lg:w-[40px] lg:h-[24px]'
                  width={30}
                  height={20}
                  src="https://cdn.shopify.com/s/files/1/0799/5929/4245/files/AusFlag.png?v=1712168223"
                  alt="Australia flag"
                  loading="lazy" />
                :
                <Image
                  className='min-w-[30px] w-[32px] h-[20px] lg:min-w-[30px] lg:w-[40px] lg:h-[24px]'
                  width={40}
                  height={20}
                  src="https://cdn.shopify.com/s/files/1/0799/5929/4245/files/newZealand.png?v=1712168223"
                  alt="New Zealand flag"
                  loading="lazy" />}
              <span className='leading-[14px] text-[10px] hidden lg:block capitalize'>{label?.toLowerCase()}</span>
            </div>

            <span><IconCaret direction='down' className="text-[16px]" /></span>

          </div>
          <div className="absolute country-box text-right top w-full z-10 min-w-[141px] lg:min-w-[175px] bg-white p-[10px] border-[1px] border-[#d3d3d3] lg:right-0 right-auto lg:left-auto left-0">
            {countries &&
              Object.keys(countries).map((countryPath) => {
                const countryLocale = countries[countryPath];
                const isSelected =
                  countryLocale.language === selectedLocale.language &&
                  countryLocale.country === selectedLocale.country;

                const countryUrlPath = getCountryUrlPath({
                  countryLocale,
                  defaultLocalePrefix,
                  pathWithoutLocale,
                });

                return (
                  <Country
                    key={countryPath}
                    closeDropdown={closeDropdown}
                    countryUrlPath={countryUrlPath}
                    isSelected={isSelected}
                    countryLocale={countryLocale}
                  />
                );
              })}
          </div>
        </div>
      </div>
    </section>
  );
}

function Country({ closeDropdown, countryLocale, countryUrlPath, isSelected }) {
  // console.log('countryLocale',countryLocale)
  let label = countryLocale.label;
  if (label) {
    label = label.split('(')[0];
  }
  return (
    <Button
      className={`
        ${isSelected ? "pointer-events-none opacity-50" : ""}
        bg-white w-full font-semibold   text-[12px] uppercase flex gap-[4px] items-center justify-end leading-9 text-[#1e5097]`}
      variant="primary"
      onClick={() => closeDropdown(countryLocale)}
    >
      {label}
      {label.toLowerCase() == 'australia' ?
        <Image
          className='min-w-[32px] w-[32px] h-[15px] lg:min-w-[40px] lg:w-[40px] lg:h-[20px]'
          width={40}
          height={20}
          src="https://cdn.shopify.com/s/files/1/0799/5929/4245/files/AusFlag.png?v=1712168223"
          alt="Australia flag"
          loading="lazy" />
        :
        <Image
          className='min-w-[32px] w-[32px] h-[15px] lg:min-w-[40px] lg:w-[40px] lg:h-[20px]'
          width={40}
          height={20}
          src="https://cdn.shopify.com/s/files/1/0799/5929/4245/files/newZealand.png?v=1712168223"
          alt="New Zealand flag"
          loading="lazy" />}

    </Button>

  );
}


function getCountryUrlPath({
  countryLocale,
  defaultLocalePrefix,
  pathWithoutLocale,
}) {
  let countryPrefixPath = '';
  const countryLocalePrefix = `${countryLocale.language}-${countryLocale.country}`;

  if (countryLocalePrefix !== defaultLocalePrefix) {
    countryPrefixPath = `/${countryLocalePrefix.toLowerCase()}`;
  }
  return `${countryPrefixPath}${pathWithoutLocale}`;
}