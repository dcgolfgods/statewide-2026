import { useState, useEffect } from 'react';
import Select from 'react-select'
import { AlgoliaProduct } from './AlgoliaProduct';
import { convertTitleToHandle, DEFAULT_LOCALE, getPricesData, excludeAppliances, excludeBrands, } from '~/lib/utils';
import { useLocation, useNavigate } from 'react-router';
import { CustomSelect } from './CustomSelect';
import { useParams } from 'react-router';
import { FindModelPopup } from './FindModel';
import { useMatches } from 'react-router';
import {
  CustomPagination
} from '~/components';
import {findExactPartNumberHits, withExactHitsFirst} from '~/lib/partNumberSearch';
const mapSearch = {
  "lg aircon remote": 'lg remote'
}

function getPageFromSearch(search) {
  const pageParam = new URLSearchParams(search).get('page');
  const pageNumber = Number.parseInt(pageParam || '1', 10);
  return Number.isFinite(pageNumber) && pageNumber > 1 ? pageNumber - 1 : 0;
}

const SearchTemplate = ({ searchClient, searchTerm, customer }) => {
  const [root] = useMatches();
  const shop = root.data.shop;
  const [userSelected, setUserSelected] = useState(false);
  const { vendorname, typename } = useParams();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const pageFromUrl = getPageFromSearch(search);
  const [page, setPage] = useState(pageFromUrl);
  const [loading, setLoading] = useState(true)
  const [pageCount, setPageCount] = useState(0);
  const [query, setQuery] = useState(mapSearch[searchTerm] ? mapSearch[searchTerm] : searchTerm);
  const [count, setCount] = useState(0);
  const [popup, showPopup] = useState(false);
  const [findpopup, showFindPopup] = useState(false);

  const [results, setResults] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [meta1, setMeta1] = useState([]);
  const [meta2, setMeta2] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedProductType, setSelectedProductType] = useState(null);
  const [selectedMeta1, setSelectedMeta1] = useState(null);
  const [selectedMeta2, setSelectedMeta2] = useState(null);
  const selectedLocale = root.data?.selectedLocale ?? DEFAULT_LOCALE;

  const collectionTitle = `${selectedVendor ? selectedVendor : ''} ${selectedMeta1 ? selectedMeta1 : ''
    } ${selectedVendor || selectedMeta1 ? 'spare parts' : ''}`.trim();
  let collectionLongTitle = `${selectedVendor ? selectedVendor : ''} ${selectedMeta1 ? selectedMeta1 : ''} ${selectedMeta2 ? selectedMeta2 : ''
    }`.trim();
  if (!collectionLongTitle) {
    collectionLongTitle = query;
  }
  const scrollToBelowDiscriptionRef = () => {
    belowDiscriptionRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    setUserSelected(false);
  }, [query])

  useEffect(() => {
    setSelectedVendor(null)
    setSelectedProductType(null)
    setSelectedMeta1(null)
    setSelectedMeta2(null)
    setQuery(mapSearch[searchTerm] ? mapSearch[searchTerm] : searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    setPage((currentPage) => currentPage === pageFromUrl ? currentPage : pageFromUrl);
  }, [pageFromUrl]);

  useEffect(() => {
    console.log("object");
    handleSearch();
  }, [searchClient, page, query, selectedVendor, selectedProductType, selectedMeta1, selectedMeta2]);

  // Replace with your Algolia credentials
  //   const searchClient = algoliasearch('CW8UTBJWAG', '9238d494978f4cb3614880a79561abfa');
  const index = searchClient?.initIndex('shopify_products_new');
  const handleAutoDropDownOpen = () => {
    if (userSelected) {
      if (!selectedVendor) {
        document.querySelector('#vendor-search').click()
      } else if (!selectedProductType) {
        document.querySelector('#appliance-search').click()
      } else if (!selectedMeta1) {
        document.querySelector('#model-search').click()
      } else if (!selectedMeta2) {
        document.querySelector('#part-search').click()
      }
    }
  }
  // useEffect(()=>{
  //     if(!selectedVendor){
  //         document.querySelector('#vendor-search').click()
  //     }else if(!selectedProductType){
  //         document.querySelector('#appliance-search').click()
  //     }else if(!selectedMeta1){
  //         document.querySelector('#model-search').click()
  //     }else if(!selectedMeta2){
  //         document.querySelector('#part-search').click()
  //     }
  // },[selectedVendor, selectedProductType, selectedMeta1, selectedMeta2])
  const handleSearch = async () => {
    try {
      setLoading(true);
      let facetFilters = [];
      if (selectedVendor) {
        facetFilters.push([`meta.product_extended_property.brands_filters:${selectedVendor}`])
      }
      // Algolia: values in the same array are OR'd. When a model is selected,
      // OR it with appliance type so parts linked to that model aren't dropped
      // solely because Sybiz allows only one appliance type per part.
      if (selectedProductType && selectedMeta1) {
        facetFilters.push([
          `meta.product_extended_property.appliance_types_filters:${selectedProductType}`,
          `meta.product_extended_property.model_numbers:${selectedMeta1}`,
        ]);
        facetFilters.push([`meta.product_extended_property.model_numbers:${selectedMeta1}`]);
      } else {
        if (selectedProductType) {
          facetFilters.push([`meta.product_extended_property.appliance_types_filters:${selectedProductType}`])
        }
        if (selectedMeta1) {
          facetFilters.push([`meta.product_extended_property.model_numbers:${selectedMeta1}`])
        }
      }
      if (selectedMeta2) {
        facetFilters.push([`meta.product_extended_property.part_type:${selectedMeta2}`])
      }
      if (selectedLocale.country == 'NZ') {
        facetFilters.push([
          `meta.product_extended_property.australia_only:false`,
        ]);
      }
      // facetFilters.push(['is_variant:false']);

      const [obj, exactPartHits] = await Promise.all([
        index?.search(query, {
          facets: ['*'],
          maxValuesPerFacet: 5000,
          hitsPerPage: 20,
          page: page,
          facetFilters: facetFilters, // Remove empty filters
        }),
        // "03.14.55" etc.: the exact part goes first (see partNumberSearch.js)
        findExactPartNumberHits(index, query, {facetFilters}),
      ]);
      if (!obj) {
        return;
      }
      const { nbHits, nbPages } = obj;
      // Exact part first on page 1; dropped from later pages so it isn't listed twice.
      const hits = page === 0
        ? withExactHitsFirst(exactPartHits, obj.hits)
        : withExactHitsFirst(exactPartHits, obj.hits).slice(exactPartHits.length);
      setCount(nbHits);
      setResults(hits);
      setPageCount(nbPages)
      let allSku = hits.map((item) => item.sku);
      getVendors();
      getProductTypes();
      getMeta1();
      getMeta2();
      // const vendorKeys = Object.keys(facets.vendor || {});
      // const productTypeKeys = Object.keys(facets.product_type || {});
      // setVendors(vendorKeys);
      // setProductTypes(productTypeKeys);
      setLoading(false);
      handleAutoDropDownOpen();
    } catch (error) {
      console.error('Error searching:', error);
    }
  };
  const autoSelectDropdown = (facetValues, setSelectedFunction, isModalNumbel = false, isType = false) => {
    let lowercaseQuery = query.toLowerCase();
    if (lowercaseQuery?.endsWith('/')) {
      lowercaseQuery = lowercaseQuery.slice(0, -1);
    }
    if (lowercaseQuery == 'mat') {
      return
    }
    const index = facetValues.findIndex((value, i) => {

      const lowercaseValue = value.toLowerCase();
      // const words = lowercaseQuery?.split(' ');
      const words = value.toLowerCase().split(/[^a-z0-9]+/);
      // console.log(`Checking value: "${lowercaseValue}" against query: "${lowercaseQuery}"`);
      const isLgQuery = lowercaseQuery?.includes('lg');
      const condition1 = lowercaseValue?.includes(lowercaseQuery) && lowercaseQuery.length >= 3;
      const condition2 = lowercaseQuery?.includes(lowercaseValue) && (isLgQuery ? lowercaseValue.length >= 2 : lowercaseValue.length >= 3);
      const condition3 = lowercaseValue === lowercaseQuery;
      // const condition4 = words.filter((el)=> el.length > 2).some(word => {
      //     const wordMatch = lowercaseValue?.includes(word) || word?.includes(lowercaseQuery);
      //     console.log(`Word: "${word}" in value: ${wordMatch}`);
      //     return wordMatch;
      // }); 

      const condition4 = words.some(word => {
        // Use regex to allow for singular/plural matching
        const regex = new RegExp(`\\b${word.replace(/s$/, "(s|es)?")}\\b`, "i");
        return regex.test(lowercaseQuery);
      });
      // console.log(`Condition 1 (includes): ${condition1}`);
      // console.log(`Condition 2 (included in query): ${condition2}`);
      // console.log(`Condition 3 (exact match): ${condition3}`);
      // console.log(`Condition 4 (word included in query): ${condition4}`);
      if (isModalNumbel) {
        return (
          lowercaseQuery !== '' && lowercaseQuery == lowercaseValue
        );
      } else {
        return words.some(word => {
          // Check if the word is present in the normalized query or its singular form
          if (word.length <= 3 && word !== 'lg') {
            return false;
          }
          const singularForm = word.endsWith('s') ? word.slice(0, -1) : word;
          return lowercaseQuery.includes(word) || lowercaseQuery.includes(singularForm);
        });
        return (
          lowercaseQuery !== '' && (
            condition1 || condition2 || condition3 || condition4
          )
        );
      }


    });

    if (index !== -1) {
      const matchedOriginalValue = facetValues[index];
      setSelectedFunction(matchedOriginalValue);
    }
  };

  const getFacetFilters = (type) => {
    let facetFilters = [];
    if (selectedVendor && type != "vendor") {
      facetFilters.push([`meta.product_extended_property.brands_filters:${selectedVendor}`])
    }
    // Same OR logic as handleSearch: appliance OR model when both are set
    // (except when refreshing the model dropdown — keep path-scoped discovery).
    if (
      selectedProductType &&
      selectedMeta1 &&
      type != "productType" &&
      type != "model"
    ) {
      facetFilters.push([
        `meta.product_extended_property.appliance_types_filters:${selectedProductType}`,
        `meta.product_extended_property.model_numbers:${selectedMeta1}`,
      ]);
      facetFilters.push([`meta.product_extended_property.model_numbers:${selectedMeta1}`]);
    } else {
      if (selectedProductType && type != "productType") {
        facetFilters.push([`meta.product_extended_property.appliance_types_filters:${selectedProductType}`])
      }
      if (selectedMeta1 && type != "model") {
        facetFilters.push([`meta.product_extended_property.model_numbers:${selectedMeta1}`])
      }
    }
    if (selectedMeta2 && type != "part") {
      facetFilters.push([`meta.product_extended_property.part_type:${selectedMeta2}`])
    }
    return facetFilters;
  }
  const getVendors = async () => {
    let facetFilters = getFacetFilters("vendor");
   
    if (selectedLocale.country == 'NZ') {
      facetFilters.push([
        `meta.product_extended_property.australia_only:false`,
      ]);
    }
    const { facets } = await index?.search(query, {
      facets: ['*'],
      maxValuesPerFacet: 5000,
      facetFilters: facetFilters, // Remove empty filters
    });
    const vendorKeys = Object.keys(facets['meta.product_extended_property.brands_filters'] || {});
    let options = vendorKeys.filter((item) => !excludeBrands.includes(item) && item != "N/A" && item.toLowerCase() != "please select").map((item) => {
      return { value: item, label: item }
    })
    options = options.filter((item) => item.label != "Please Select")
    setVendors(options);
    autoSelectDropdown(options.map((option) => option.value), setSelectedVendor);
  }
  const getProductTypes = async () => {
    let facetFilters = getFacetFilters("productType");
    if (selectedLocale.country == 'NZ') {
      facetFilters.push([
        `meta.product_extended_property.australia_only:false`,
      ]);
    }
    const { facets } = await index?.search(query, {
      facets: ['*'],
      maxValuesPerFacet: 5000,
      facetFilters: facetFilters, // Remove empty filters
    });
    const productTypeKeys = Object.keys(facets['meta.product_extended_property.appliance_types_filters'] || {});
    let options = productTypeKeys.filter((item) => !excludeAppliances.includes(item) && item != "N/A" && item.toLowerCase() != "please select" && item.toLowerCase() != "Cleaning Products").map((item) => {
      return { value: item, label: item }
    })
    options = options.filter((item) => item.label != "Please Select")
    setProductTypes(options);
    autoSelectDropdown(options.map((option) => option.value), setSelectedProductType, false, true);

  }
  const getMeta1 = async () => {
    let facetFilters = getFacetFilters("model");
    
    if (selectedLocale.country == 'NZ') {
      facetFilters.push([
        `meta.product_extended_property.australia_only:false`,
      ]);
    }
    const { facets } = await index?.search(query, {
      facets: ['*'],
      maxValuesPerFacet: 5000,
      facetFilters: facetFilters, // Remove empty filters
      hitsPerPage: 100,
      attributesToRetrieve: ["*"]

      // page: page,fcust
    });
    // const data = await index?.searchForFacetValues("meta.product_extended_property.model_numbers","42PX5D",
    //   {
    //     maxFacetHits: 50,
    //     facetFilters
    //   }
    // )

    // console.log("searchForFacetValues data",data)
    const productTypeKeys = Object.keys(facets['meta.product_extended_property.model_numbers'] || {});
    let options = productTypeKeys.filter((item) => item != "N/A" && item.toLowerCase() != "please select").map((item) => {
      return { value: item, label: item }
    })
    const url = new URL(window.location.href);
    const modelNoId = url.searchParams.get('ModelNoId');
    if (modelNoId) {
      let exist = options.find((item) => item.value == modelNoId);
      if (!exist) {
        // setSelectedMeta1(modelNoId);
        options.push({ value: modelNoId, label: modelNoId });
      }
    }
    options = options.filter((item) => item.label != "Please Select")
    setMeta1(options);
    autoSelectDropdown(options.map((option) => option.value), setSelectedMeta1, true);
  }

  const getMeta2 = async () => {
    let facetFilters = getFacetFilters("part");

    if (selectedLocale.country == 'NZ') {
      facetFilters.push([
        `meta.product_extended_property.australia_only:false`,
      ]);
    }
    const { facets } = await index?.search(query, {
      facets: ['*'],
      maxValuesPerFacet: 5000,
      facetFilters: facetFilters, // Remove empty filters
    });
    const productTypeKeys = Object.keys(facets['meta.product_extended_property.part_type'] || {});
    let options = productTypeKeys.filter((item) => item != "N/A" && item.toLowerCase() != "please select").map((item) => {
      return { value: item, label: item }
    })
    options = options.filter((item) => item.label != "Please Select")
    setMeta2(options);
    autoSelectDropdown(options.map((option) => option.value), setSelectedMeta2);
  }
  const customStyles = {
    control: (provided) => ({
      ...provided,
      fontSize: '12px',
    }),
  };
  const handlePageClick = (value) => {
    const nextPage = Math.max(value, 0);
    const params = new URLSearchParams(search);

    if (nextPage > 0) {
      params.set('page', String(nextPage + 1));
    } else {
      params.delete('page');
    }

    const queryString = params.toString();
    setPage(nextPage);
    navigate(`${pathname}${queryString ? `?${queryString}` : ''}`);
  };


  const handleSelectVendor = (value) => {
    const brandHandle = convertTitleToHandle(value.value);
    const url = `/${brandHandle}${selectedProductType ? `/${convertTitleToHandle(selectedProductType)}` : ''
      }${selectedMeta2 ? `/${convertTitleToHandle(selectedMeta2)}` : ''}${selectedMeta1 ? `?ModelNoId=${selectedMeta1}` : ''
      }`;
    navigate(url);
    if (!value) {
      setQuery("")
    }
    setSelectedVendor(value ? value.value : "")
  }
  const handleSelectProductType = (value) => {

    const applianceHandle = convertTitleToHandle(value?.value);
    const url = `${selectedVendor ? `/${convertTitleToHandle(selectedVendor)}` : ''
      }${applianceHandle ? `/${applianceHandle}` : ''}${selectedMeta2 ? `/${convertTitleToHandle(selectedMeta2)}` : ''}${selectedMeta1 ? `?ModelNoId=${selectedMeta1}` : ''
      }`;


    navigate(url);
    if (!value) {
      setQuery("")
    }
    setSelectedProductType(value ? value.value : "")
  }
  const handleSelectMeta1 = (value) => {

    if (value && value?.value) {
      // const url = `/${selectedVendor ? `${convertTitleToHandle(selectedVendor)}/` : ''}${selectedProductType ? `${convertTitleToHandle(selectedProductType)}/` : ''
      //   }${selectedMeta2 ? `${convertTitleToHandle(selectedMeta2)}` : ''}?ModelNoId=${value.value
      //   } `;
      const url = `/search?q=${query}&ModelNoId=${value.value} `; 
      if (url != "/") {
        navigate(url);
      }
      if (!value) {
        setQuery('');
      }
      setSelectedMeta1(value ? value.value : '');
    } else {
      const url = new URL(window.location.href);
      url.searchParams.delete('ModelNoId');
      url.searchParams.delete('page');
      const redirectUrl = url.toString().replace(window.location.origin, '');
      setSelectedMeta1('');
      if (redirectUrl != "/") {
        navigate(redirectUrl);
      }
    }
  };
  const handleSelectMeta2 = (value) => {
    if (value) {
      let partTypeHandler = convertTitleToHandle(value.value);
      if (!partTypeHandler) {
        partTypeHandler = value.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '').replace(/^-/, '');
      }
      const url = `/${selectedVendor ? `${convertTitleToHandle(selectedVendor)}/` : ''}${selectedProductType ? `${convertTitleToHandle(selectedProductType)}/` : ''
        }${partTypeHandler ? partTypeHandler : ''}${selectedMeta1 ? `?ModelNoId=${selectedMeta1}` : ''}`;
      if (url != "/") {
        navigate(url);
      }
      if (!value) {
        setQuery('');
      }
      setSelectedMeta2(value ? value.value : '');
    } else {
      // const removeHandle = convertTitleToHandle(selectedMeta2);
      // let url = generateUrlForRedirection(removeHandle);
      // if (custom) {
      let url = `${selectedVendor ? `/${convertTitleToHandle(selectedVendor)}` : ''}${selectedProductType ? `/${convertTitleToHandle(selectedProductType)}` : ''
        }${selectedMeta1 ? `?ModelNoId=${selectedMeta1}` : ''}`;
      // }

      if (url != "/") {
        navigate(url);
      }
      setSelectedMeta2('');
    }
  }
  let showImg = "";

  if (!selectedMeta2) {
    showImg = "part"
  }
  if (!selectedMeta1) {
    showImg = "model"
  }
  if (!selectedProductType) {
    showImg = "appliance"
  }
  if (!selectedVendor) {
    showImg = "vendor"
  }

  return (
    <div className='max-w-[1140px] mx-auto px-4 my-4'>
      <div className={`ajax-loading-block-window ${loading ? ' active' : ''}`}></div>
      {findpopup && <FindModelPopup showPopup={showFindPopup} />}
      {popup && <InStockPopup showPopup={showPopup} />}

      <div className='page-title mb-[45px] border-b-[1px] border-[#ccc] py-[6px]'>
        <h1 className='text-[#1e5097] text-center text-[30px] font-bold'>Search</h1>
      </div>

      <div className="bg-[#1e5097] px-[26px] pt-[15px] pb-[15px] lg:px-[10px] rounded-md lg:pt-[7px] lg:pb-4  flex flex-wrap lg:flex-nowrap gap-[10px] filter-box  items-end">
        <div className='max-w-[978px] w-full flex flex-wrap lg:flex-nowrap gap-[2px] lg:gap-[15px]'>
          <div className="w-full lg:flex-1 mb-0 lg:mb-0">
            <p className="text-white model-label cursor-pointer  relative inline-block pb-[2px] font-bold text-[14px] model-label">
              Brand
              {/* {showImg == 'vendor' &&
                <img className='absolute min-w-[112px] h-[26px] left-[101%] bottom-[2px] z-30 search-tooltip' src="https://cdn.shopify.com/s/files/1/0799/5929/4245/files/selectbrand.png?v=1722797392" />} */}
            </p>
            <CustomSelect filterName="meta.product_extended_property.brands_filters" handleGetFacetValues={()=> {return getFacetFilters('vendor')}} query={query} index={index} setUserSelected={setUserSelected} showBorder={showImg == 'vendor'} id="vendor-search" isSearchable={true} isClearable={true} key="vendor-select"
              styles={customStyles} className='search-page-select-search' value={selectedVendor ? { value: selectedVendor, label: selectedVendor } : null} placeholder="Select your brand" name='vendor' options={vendors} onChange={(value) => handleSelectVendor(value)} />
          </div>
          <div className="w-full lg:flex-1 mb-0 lg:mb-0 ">
            <p className="text-white model-label cursor-pointer  relative inline-block pb-[2px] font-bold text-[14px] model-label">
              Appliance Type
              {/* {showImg == 'appliance' &&
                <img className='absolute min-w-[160px] h-[26px] left-[101%] bottom-[2px] z-30 search-tooltip' src="https://cdn.shopify.com/s/files/1/0799/5929/4245/files/selectappliancetype.png?v=1722797392" />} */}
            </p>
            <CustomSelect filterName="meta.product_extended_property.appliance_types_filters" handleGetFacetValues={()=> {return getFacetFilters('productType')}} query={query} index={index} setUserSelected={setUserSelected} showBorder={showImg == 'appliance'} id="appliance-search" isClearable={true} key="appliance-select" styles={customStyles} className='search-page-select-search' value={selectedProductType ? { value: selectedProductType, label: selectedProductType } : null} placeholder="Select your appliance" name='vendor' isSearchable={true}
              options={productTypes} onChange={(value) => handleSelectProductType(value)} />
          </div>
          <div className="w-full lg:flex-1 mb-0 lg:mb-0">
            <p onClick={() => showFindPopup(true)} className="text-white model-label cursor-pointer  relative inline-block pb-[2px] font-bold text-[14px] model-label">
              Model Number
              <span className="relative status-label-tooltip">
                <i className="text-[#00aeef] fa fa-info-circle ml-1"></i>
                <div className="text-[#00aeef]  absolute left-[100%] font-bold py-[2px] rounded-[5px] bg-white z-[1] px-[5px] availability-info-tooltip"><div className="availability-info-point-inner"></div><div className="availability-info-text text-[8.4px]"><a rel="nofollow" className="text-[#00aeef] availability-info-link">How to find your model no. </a></div></div>
              </span>
              {/* <img className='absolute min-w-[160px] h-[26px] left-[101%] bottom-0 z-30 search-tooltip modelno-prompt hidden' src="https://cdn.shopify.com/s/files/1/0799/5929/4245/files/modelno.png?v=1720292843" /> */}
            </p>
            <CustomSelect filterName="meta.product_extended_property.model_numbers" handleGetFacetValues={()=> {return getFacetFilters('model')}} query={query} index={index} setUserSelected={setUserSelected} showBorder={showImg == 'model'} id="model-search" isClearable={true} key="model-select" styles={customStyles} className='search-page-select-search'
              value={selectedMeta1 ? { value: selectedMeta1, label: selectedMeta1 } : null} placeholder="Select your model number"
              name='vendor' isSearchable={true} options={meta1} onChange={(value) => handleSelectMeta1(value)} />
          </div>
          <div className="w-full lg:flex-1 mb-0 lg:mb-0">
            <p className='text-white model-label cursor-pointer  relative inline-block pb-[2px] font-bold text-[14px] part-label'>Part Type</p>
            <CustomSelect filterName="meta.product_extended_property.part_type" handleGetFacetValues={()=> {return getFacetFilters('part')}} query={query} index={index} setUserSelected={setUserSelected} showBorder={showImg == 'part'} id="part-search" isClearable={true} key="type-select" styles={customStyles} value={selectedMeta2 ? { value: selectedMeta2, label: selectedMeta2 } : null}
              placeholder="Select your part type" name='vendor' isSearchable={true} options={meta2} onChange={(value) => handleSelectMeta2(value)} />
          </div>
        </div>
        <div className='max-w-[100px] mx-auto lg:max-w-[110px] w-full button-wrap mt-1 lg:mt-0'>
          <button onClick={handleSearch} className='bg-[#00aeef] rounded-md text-white h-[36px]  w-full flex items-center justify-center openSansBold' type='button'>
            Search
          </button>
        </div>
      </div>

      {(
        <div className="collection-title text-center mt-4">
          <h2 className="text-[#1e5097]  text-2xl lg:text-2xl my-2 font-normal">
            {collectionLongTitle}
          </h2>
          {count > 0 && !loading && <p className="text-xl text-[#004085] font-bold">{`${count} results for "${collectionLongTitle}"`}</p>}
        </div>
      )}

      <div className='min-h-[500px]'> 

      {count > 0 && <><ul className='my-[50px] grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4'>
        {results.map((hit) => {
          const product = {
            ...hit
          }
          return <AlgoliaProduct shop={shop} selectedLocale={selectedLocale} customer={customer} showPopup={showPopup} key={hit.id} product={product} />;
        })}
      </ul>
        {pageCount > 1 &&
          <CustomPagination currentPage={page} onPageChange={handlePageClick} totalPages={pageCount} />}

      </>}
      {count <= 0 && !loading && <NoResult showFindPopup={showFindPopup} />}
      </div>
    </div>
  );
};

export { SearchTemplate };

const InStockPopup = ({ showPopup }) => {
  return (
    <>
      <div onClick={() => showPopup(false)} className='bg-black/[.6] z-[1000]  in-stock-popup fixed top-0 bottom-0 left-0 right-0 h-full w-full bg'>
      </div>
      <div className='in-stock-popup-box z-[1005] fixed top-1/2 left-1/2  -translate-y-1/2 -translate-x-1/2 w-[100%] max-w-[500px] bg-white p-4 rounded-[5px]'>
        <button onClick={() => showPopup(false)} type="button" className="absolute right-4 top-2 cursor-pointer" data-dismiss="modal" aria-label="Close"> <span className='font-bold' aria-hidden="true">×</span> </button>
        <div className='flex mb-4'>
          <p className='tracking-[-0.5px] w-[100px] text-[#1e5097] text-[15px] font-bold'>In Stock</p>
          <p className='tracking-[-0.5px] in-stock-popup-text text-[15px]'>This item is typically held in stock and will usually be despatched within 2 business days of your order being placed.</p>
        </div>
        <div className='flex mb-4'>
          <p className='tracking-[-0.5px] w-[100px] text-[#1e5097] text-[15px] font-bold'>Special Order</p>
          <p className='tracking-[-0.5px] in-stock-popup-text text-[15px]'>This item is ordered from our supplier and is usually despatched within 4–10 business days of your order being placed. Supplier delays may occasionally extend this timeframe.<span className='block'>Despatch time is <b className='openSansBold'>additional</b> to shipping time. Your total delivery time includes both the time to despatch <b className='openSansBold'>and</b> ship your order.</span></p>
        </div>

        <div className='flex mb-4'>
          <p className='tracking-[-0.5px] w-[100px] text-[#1e5097] text-[15px] font-bold'>Part Number Updated</p>
          <p className='tracking-[-0.5px] in-stock-popup-text text-[15px]'>This part has been updated. The current part number will be shown with a link.
          </p>
        </div>

        <div className='flex'>
          <p className='tracking-[-0.5px] w-[100px] text-[#1e5097] text-[15px] font-bold'>No Longer Available</p>
          <p className='tracking-[-0.5px] in-stock-popup-text text-[15px]'>This part has been discontinued by the supplier with no alternative available.
          </p>
        </div>
      </div>
    </>

  )
}

const NoResult = ({ showFindPopup }) => {
  return (
    <div className="text-[#1e5097] text-[16px] zero-results-message offset-lg-3 col-sm-12 col-md-12 col-lg-8">
      <b>We couldn’t find an exact match, but we’re here to help!</b>
      <br />
      <br />
      <div class="text-black">
        <b className='mb-2 block'>Try these steps:</b>
        <div className="zero-results-bold">
          ✔ Double-check your spelling
          <br />
          ✔ Use different keywords
          <br />
          ✔ Check your model number
        </div>
        <br />
      </div>
      <div class="text-black">Still can’t find what you need? Call us on Free call <a className="text-[#1e5097] font-bold" href="tel:+611800005220">1800 005 220</a></div>
    </div>
  )
}