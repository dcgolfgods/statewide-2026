import React, { useEffect, useState } from 'react';
import { CollectionProductSkeleton } from './CollectionProductSkeleton';

const CollectionPage = (props) => {
  const [ClientComponent, setClientComponent] = useState(null);
  const fallbackTitle =
    props?.title || props?.collection?.title || 'Spare Parts';

  useEffect(() => {
    let isMounted = true;
    import('./CollectionPage.client').then((mod) => {
      if (isMounted) {
        setClientComponent(() => mod.CollectionPage);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-[600px]">
      {ClientComponent ? (
        <ClientComponent {...props} />
      ) : (
        <div className="max-w-[1140px] mx-auto px-4 my-4">
          <div className="page-title  pb-[6px] lg:block hidden">
            <h1 className="border-b-[1px] mb-[15px] pb-[15px] border-b-[#b0b0b0]  text-[#1e5097] text-center text-[24px] lg:text-[30px] font-bold">
              {fallbackTitle}
            </h1>
          </div>
          <div className="bg-[#1e5097] px-[26px] pt-[15px] pb-[15px] lg:px-[10px] rounded-md lg:pt-[7px] lg:pb-4  flex flex-wrap lg:flex-nowrap gap-[10px] filter-box  items-end">
            <div className='max-w-[978px] w-full flex flex-wrap lg:flex-nowrap gap-[2px] lg:gap-[10px]'>
              <div className="w-full lg:flex-1 mb-0 lg:mb-0">
                <p className="text-white model-label cursor-pointer  relative inline-block pb-[2px] font-bold text-[14px] model-label">
                  Brand
                  {/* {showImg == 'vendor' && 
            <img className='absolute min-w-[112px] h-[26px] left-[101%] bottom-[2px] z-30 search-tooltip' src="https://cdn.shopify.com/s/files/1/0799/5929/4245/files/selectbrand.png?v=1722797392"/>} */}
                </p>
                <CustomSelect />
              </div>
              <div className="w-full lg:flex-1 mb-0 lg:mb-0">
                <p className="text-white model-label cursor-pointer  relative inline-block pb-[2px] font-bold text-[14px] model-label">
                  Appliance Type
                  {/* {showImg == 'appliance' &&
            <img className='absolute min-w-[160px] h-[26px] left-[101%] bottom-[2px] z-30 search-tooltip ' src="https://cdn.shopify.com/s/files/1/0799/5929/4245/files/selectappliancetype.png?v=1722797392"/>} */}
                </p>
                <CustomSelect />
              </div>
              <div className="w-full lg:flex-1 mb-0 lg:mb-0">
                <p onClick={() => showFindPopup(true)} className="text-white model-label cursor-pointer  relative inline-block pb-[2px] font-bold text-[14px] model-label">
                  Model Number
                  <span className="relative status-label-tooltip">
                    <i className="text-[#00aeef] fa fa-info-circle ml-1"></i>
                    <div className="text-[#00aeef] absolute left-[100%] font-bold py-[2px] rounded-[5px] bg-white z-[1] px-[5px] availability-info-tooltip"><div className="availability-info-point-inner"></div><div className="availability-info-text text-[8.4px]"><a rel="nofollow" className="text-[#00aeef] availability-info-link">How to find your model no. </a></div></div>
                  </span>


                  {/* <img className='absolute min-w-[160px] h-[26px] left-[101%] bottom-0 z-30 search-tooltip modelno-prompt hidden' src="https://cdn.shopify.com/s/files/1/0799/5929/4245/files/modelno.png?v=1720292843"/> */}
                </p>
                <CustomSelect />
              </div>
              <div className="w-full lg:flex-1 mb-0 lg:mb-0">
                <p className="text-white model-label cursor-pointer  relative inline-block pb-[2px] font-bold text-[14px] part-label">Part Type</p>
                <CustomSelect />
              </div>
            </div>
            <div className='max-w-[100px] mx-auto  lg:max-w-[110px] w-full button-wrap mt-1 lg:mt-0'>
              <button className='bg-[#00aeef] rounded-md text-white h-[36px]  w-full flex items-center justify-center openSansBold' type='button'>
                Search
              </button>
            </div>
          </div>
          <CollectionProductSkeleton count={8} />
        </div>
      )}
    </div>
  );
};

const CustomSelect = () => {
  return <div className="custom-select-container"><div id="vendor-search" className="selected-value  text-[#444]"><span className="arrow down"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="transparent" stroke="currentColor" className="transition rotate-0 w-8 h-8"><path d="M14 8L10 12L6 8" stroke-width="1.25"></path></svg></span></div></div>
};

export { CollectionPage };