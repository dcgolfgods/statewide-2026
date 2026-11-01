import { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import { AlgoliaProduct } from './AlgoliaProduct';
import { CollectionProductSkeleton } from './CollectionProductSkeleton';
import { useLocation, useNavigate } from '@remix-run/react';
import { Image } from '@shopify/hydrogen';
import { convertTitleToHandle, DEFAULT_LOCALE, excludeAppliances, excludeBrands, getPricesData, makeLastWordSingular } from '~/lib/utils';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import { CustomSelect } from './CustomSelect';
import { useMatches } from '@remix-run/react';
import { FindModelPopup } from './FindModel';
import {
  CustomPagination,
  IconUp, IconDown
} from '~/components';

const EMPTY_COLLECTION_DATA = {
  preText: [],
  replaceTexts: [],
  noSpares: [],
  appliancesPartsCustomText: [],
  specialAppliancesPartsCustomText: [],
  brandBanners: [],
  customDescription: [],
};

const COLLECTION_DATA_CACHE_KEY = 'collection_custom_data_v2';
let collectionDataMemoryCache = null;
let collectionDataInFlight = null;

function getPageFromSearch(search) {
  const pageParam = new URLSearchParams(search).get('page');
  const pageNumber = Number.parseInt(pageParam || '1', 10);
  return Number.isFinite(pageNumber) && pageNumber > 1 ? pageNumber - 1 : 0;
}

function normalizeCollectionData(data) {
  return {
    preText: data?.preText || [],
    replaceTexts: data?.replaceTexts || [],
    noSpares: data?.noSpares || [],
    appliancesPartsCustomText: data?.appliancesPartsCustomText || [],
    specialAppliancesPartsCustomText: data?.specialAppliancesPartsCustomText || [],
    brandBanners: data?.brandBanners || [],
    customDescription: data?.customDescription || [],
  };
}

function readCollectionDataFromSession() {
  if (typeof window === 'undefined') return null;
  try {
    const raw =
      window.localStorage.getItem(COLLECTION_DATA_CACHE_KEY) ||
      window.sessionStorage.getItem(COLLECTION_DATA_CACHE_KEY);
    if (!raw) return null;
    return normalizeCollectionData(JSON.parse(raw));
  } catch (_) {
    return null;
  }
}

function writeCollectionDataToSession(data) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(COLLECTION_DATA_CACHE_KEY, JSON.stringify(data));
    window.sessionStorage.setItem(COLLECTION_DATA_CACHE_KEY, JSON.stringify(data));
  } catch (_) {
    // Ignore session storage quota or parse issues.
  }
}

async function fetchCollectionDataFromStorefront() {
  const query = `
    query GetCollectionCustomData {
      shop {
        customData: metafield(namespace: "custom", key: "custom_data") {
          value
        }
      }
    }
  `;

  const response = await fetch('https://statewide-appliances.myshopify.com/api/2025-01/graphql.json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': '6f5fe6042334dcabb6c9b260d87c8ba9',
    },
    body: JSON.stringify({query}),
  });

  if (!response.ok) return null;
  const payload = await response.json();
  const rawValue = payload?.data?.shop?.customData?.value;
  if (!rawValue) return null;
  return normalizeCollectionData(JSON.parse(rawValue));
}

function getCollectionDataPromise() {
  if (!collectionDataInFlight) {
    collectionDataInFlight = fetchCollectionDataFromStorefront()
      .then((data) => {
        if (data) {
          collectionDataMemoryCache = data;
          writeCollectionDataToSession(data);
        }
        return data;
      })
      .catch(() => null)
      .finally(() => {
        collectionDataInFlight = null;
      });
  }
  return collectionDataInFlight;
}

if (typeof window !== 'undefined' && !collectionDataMemoryCache) {
  const cached = readCollectionDataFromSession();
  if (cached) {
    collectionDataMemoryCache = cached;
  } else {
    void getCollectionDataPromise();
  }
}

const CollectionTemplate = ({
  searchClient,
  collection,
  vendor,
  applianceType,
  partType,
  model,
  custom,
  title,
  item,
  customer,
  searchQuery,
  noFilter
}) => {
  const [root] = useMatches();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const pageFromUrl = getPageFromSearch(search);
  const [collectionData, setCollectionData] = useState(() => {
    if (collectionDataMemoryCache) return collectionDataMemoryCache;
    const cached = readCollectionDataFromSession();
    if (cached) {
      collectionDataMemoryCache = cached;
      return cached;
    }
    return EMPTY_COLLECTION_DATA;
  });
  const shop = root.data.shop;
  const [userSelected, setUserSelected] = useState(false);
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(pageFromUrl);
  const belowDiscriptionRef = useRef(null);
  const [pageCount, setPageCount] = useState(0);
  const [query, setQuery] = useState(searchQuery);
  const [count, setCount] = useState(0);
  const [popup, showPopup] = useState(false);
  const [findpopup, showFindPopup] = useState(false);

  const [results, setResults] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [meta1, setMeta1] = useState([]);
  const [meta2, setMeta2] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(vendor);
  const [selectedProductType, setSelectedProductType] = useState(applianceType);
  const [selectedMeta1, setSelectedMeta1] = useState(model);
  const [selectedMeta2, setSelectedMeta2] = useState(partType);
  const selectedLocale = root.data?.selectedLocale ?? DEFAULT_LOCALE;
  const {
    preText,
    replaceTexts,
    noSpares,
    appliancesPartsCustomText,
    specialAppliancesPartsCustomText,
    brandBanners,
    customDescription,
  } = collectionData;

  useEffect(() => {
    let isMounted = true;

    if (collectionDataMemoryCache) {
      if (collectionData !== collectionDataMemoryCache) {
        setCollectionData(collectionDataMemoryCache);
      }
      return () => {
        isMounted = false;
      };
    }

    const sessionCachedData = readCollectionDataFromSession();
    if (sessionCachedData) {
      collectionDataMemoryCache = sessionCachedData;
      if (collectionData !== sessionCachedData) {
        setCollectionData(sessionCachedData);
      }
      return () => {
        isMounted = false;
      };
    }

    getCollectionDataPromise().then((data) => {
      if (!isMounted || !data) return;
      setCollectionData(data);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  let applianceTypeText = makeLastWordSingular(applianceType);
  replaceTexts.forEach(({ label, value }) => {
    // Perform case-insensitive replacement
    const regex = new RegExp(label, 'gi');
    applianceTypeText = applianceTypeText.replace(regex, value);
  });
  if (vendor && applianceType) {
    applianceTypeText = applianceTypeText.toLowerCase()
  }

  preText.forEach(text => {
    const regex = new RegExp(text, 'i');  // Create a case-insensitive regex
    applianceTypeText = applianceTypeText.replace(regex, text);  // Replace the match with the exact case from `preText`
  });

  if (!noSpares.map(item => item.toLowerCase()).includes(applianceTypeText.toLowerCase())) {
    applianceTypeText = `${applianceTypeText} spare parts`;
  }


  let vendorText = vendor;
  if (vendor) {
    vendorText = makeLastWordSingular(vendorText)
    if (vendorText == 'Ge') {
      vendorText = "GE"
    }
    preText.forEach(text => {
      const regex = new RegExp(text, 'i');  // Create a case-insensitive regex
      vendorText = vendorText.replace(regex, text);  // Replace the match with the exact case from `preText`
    });
    replaceTexts.forEach(({ label, value }) => {
      // Perform case-insensitive replacement
      const regex = new RegExp(label, 'gi');
      vendorText = vendorText.replace(regex, value);
    });
  }
  let collectionLongTitle = custom ? item?.custom_title?.value || item?.title
    : `${vendorText ? (vendorText) : ''} ${applianceTypeText ? applianceTypeText : ''}`.trim();
  if (!vendor && !applianceType && partType && !item?.custom_title?.value) {
    collectionLongTitle = partType
  }

  let customTextExistForAppliacePart = appliancesPartsCustomText.find((item) => item.part == selectedMeta2)
  if (customTextExistForAppliacePart && !selectedVendor && selectedProductType && !item?.custom_title?.value) {
    collectionLongTitle = `${applianceTypeText.replace(' spare parts', '')} ${customTextExistForAppliacePart.text}`;
  }
  let specialCustomTextExistForAppliacePart = specialAppliancesPartsCustomText.find((item) => item.appliance == selectedProductType && item.part == selectedMeta2)
  if (specialCustomTextExistForAppliacePart && !selectedVendor && selectedProductType) {
    collectionLongTitle = `${specialCustomTextExistForAppliacePart.text}`;
  }

  if (vendorText && selectedVendor && selectedMeta2) {
    if (selectedMeta2.toLowerCase() == "cleaning products") {
      collectionLongTitle = `${vendorText} cleaning products`;
    }
  }


  let collectionLongTitle1 = custom
    ? item.title
    : `${vendor ? vendor : ''} ${applianceType ? applianceType : ''} ${partType ? partType : ''
      }`.trim();
  collectionLongTitle1 = collectionLongTitle1.charAt(0).toUpperCase() + collectionLongTitle1.slice(1).toLowerCase();

  if(collectionLongTitle.toLowerCase().includes("sudz")) {
    collectionLongTitle = "Sudz";
    collectionLongTitle1 = "Sudz";
  }
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check if the target of the event has the class 'collection-read-more'
      if (e.target.classList.contains('collection-read-more')) {
        // scrollToBelowDiscription();
        belowDiscriptionRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    };

    // Add event listener
    document.addEventListener('click', handleKeyDown);

    // Cleanup event listener on component unmount
    return () => {
      document.removeEventListener('click', handleKeyDown);
    };
  }, []);
  useEffect(() => {
    setUserSelected(false);
  }, [query])
  // useEffect(() => {
  //   setQuery("");
  // }, [pathname]);

  useEffect(() => {
    setSelectedVendor(vendor);
    setSelectedProductType(applianceType);
    setSelectedMeta1(model);
    setSelectedMeta2(partType);
  }, [pathname, vendor, applianceType, model, partType]);

  useEffect(() => {
    setPage((currentPage) => currentPage === pageFromUrl ? currentPage : pageFromUrl);
  }, [pageFromUrl]);

  
  useEffect(() => {
    handleSearch();
  }, [
    searchClient,
    page,
    query,
    searchQuery,
    selectedVendor,
    selectedProductType,
    selectedMeta1,
    selectedMeta2,
    pathname,
  ]);

  const handleAutoDropDownOpen = () => {
    if (userSelected) {
      if (!selectedVendor) {
        if (document.querySelector('#vendor-search')) {
          setTimeout(() => {
            document.querySelector('#vendor-search').click()
          }, 1000)
        }
      } else if (!selectedProductType) {
        if (document.querySelector('#appliance-search')) {
          setTimeout(() => {
            document.querySelector('#appliance-search').click()
          }, 1000)
        }
      } else if (!selectedMeta1) {
        if (document.querySelector('#model-search')) {
          setTimeout(() => {
            document.querySelector('#model-search').click()
          }, 1000)
        }
      } else if (!selectedMeta2) {
        if (document.querySelector('#part-search')) {
          setTimeout(() => {
            document.querySelector('#part-search').click()
          }, 1000)
        }
      }
    }
  }


  // Replace with your Algolia credentials
  //   const searchClient = algoliasearch('CW8UTBJWAG', '9238d494978f4cb3614880a79561abfa');
  const index = searchClient?.initIndex('shopify_products_new');



  const handleSearch = async () => {
    try {
      setLoading(true)
      let facetFilters = [];
      if (!noFilter) {
        if (selectedVendor) {
          facetFilters.push([
            `meta.product_extended_property.brands_filters:${selectedVendor}`,
          ]);
        }
        // Algolia: values in the same array are OR'd. When a model is selected,
        // OR it with appliance type so parts linked to that model aren't dropped
        // solely because Sybiz allows only one appliance type per part.
        if (selectedProductType && selectedMeta1) {
          facetFilters.push([
            `meta.product_extended_property.appliance_types_filters:${selectedProductType}`,
            `meta.product_extended_property.model_numbers:${selectedMeta1}`,
          ]);
          facetFilters.push([
            `meta.product_extended_property.model_numbers:${selectedMeta1}`,
          ]);
        } else {
          if (selectedProductType) {
            facetFilters.push([
              `meta.product_extended_property.appliance_types_filters:${selectedProductType}`,
            ]);
          }
          if (selectedMeta1) {
            facetFilters.push([
              `meta.product_extended_property.model_numbers:${selectedMeta1}`,
            ]);
          }
        }
        if (selectedMeta2) {
          facetFilters.push([
            `meta.product_extended_property.part_type:${selectedMeta2}`,
          ]);
        }
        if (selectedLocale.country == 'NZ') {
          facetFilters.push([
            `meta.product_extended_property.australia_only:false`,
          ]);
        }
      }
      let kitchenware = query == "Kitchenware" || query == "kitchenware" ? true : false;
      if (kitchenware) {
        facetFilters.push([
          `meta.product_extended_property.enabled_popular_part_category:Kitchenware`,
        ]);
        // meta.product_extended_property.appliance_types_filters
      }

      // facetFilters.push(['is_variant:false']);
      const obj = await index?.search(kitchenware ? "" : query, {
        facets: ['*'],
        maxValuesPerFacet: 200,
        // maxFacetHits: 100,
        hitsPerPage: 20,
        page: page,
        // sortFacetValuesBy: ['inventory_quantity',"meta.product_extended_property.is_active", "meta.product_extended_property.bin_no"],
        sortFacetValuesBy: "alpha",
        facetFilters: facetFilters, // Remove empty filters
      });
      if (!obj) {
        return;
      }
      const { nbHits, hits, nbPages } = obj;
      setCount(nbHits);

      // debugger;
      // let priceData = await getPricesData(allSku, customer);
      setResults(hits);
      setLoading(false)
      setPageCount(nbPages);
      if (!noFilter) {
        getVendors();
        getProductTypes();
        getMeta1();
        getMeta2();
      }
      // const vendorKeys = Object.keys(facets.vendor || {});
      // const productTypeKeys = Object.keys(facets.product_type || {});
      // setVendors(vendorKeys);
      // setProductTypes(productTypeKeys);
      if (!noFilter) {
        handleAutoDropDownOpen();
      }
    } catch (error) {
      console.error('Error searching:', error);
    }
  };
  const autoSelectDropdown = (facetValues, setSelectedFunction) => {
    let lowercaseQuery = query?.trim().toLowerCase();
    if (lowercaseQuery?.endsWith('/')) {
      lowercaseQuery = lowercaseQuery?.slice(0, -1);
    }
    const index = facetValues.findIndex((value, i) => {
      const lowercaseValue = value.toLowerCase();
      return (
        lowercaseQuery !== '' && (lowercaseValue?.includes(lowercaseQuery) || lowercaseQuery?.includes(lowercaseValue) || lowercaseValue === lowercaseQuery)) || (lowercaseQuery !== '' && lowercaseValue?.split(' ').some(word => lowercaseQuery?.includes(word))
        )
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
    const { facets, ...data } = await index?.search(query, {
      facets: ['*'],
      maxValuesPerFacet: 200,
      facetFilters: facetFilters, // Remove empty filters
    });
    const vendorKeys = Object.keys(
      facets['meta.product_extended_property.brands_filters'] || {},
    );
    const options = vendorKeys.filter((item) => !excludeBrands.includes(item) && item != "N/A" && item.toLowerCase() != "please select").map((item) => {
      return { value: item, label: item };
    });
    setVendors(options);
    autoSelectDropdown(
      options.map((option) => option.value),
      setSelectedVendor,
    );
  };
  const getProductTypes = async () => {
    let facetFilters = getFacetFilters("productType");
    if (selectedLocale.country == 'NZ') {
      facetFilters.push([
        `meta.product_extended_property.australia_only:false`,
      ]);
    }
    const { facets } = await index?.search(query, {
      facets: ['*'],
      maxValuesPerFacet: 200,
      facetFilters: facetFilters, // Remove empty filters
    });
    const productTypeKeys = Object.keys(
      facets['meta.product_extended_property.appliance_types_filters'] || {},
    );
    const options = productTypeKeys.filter((item) => !excludeAppliances.includes(item) && item != "N/A" && item.toLowerCase() != "Cleaning Products" && item.toLowerCase() != "please select").map((item) => {
      return { value: item, label: item };
    });

    setProductTypes(options);
    autoSelectDropdown(
      options.map((option) => option.value),
      setSelectedProductType,
    );
  };
  const getMeta1 = async () => {
    let facetFilters = getFacetFilters("model");

    if (selectedLocale.country == 'NZ') {
      facetFilters.push([
        `meta.product_extended_property.australia_only:false`,
      ]);
    }
    const { facets } = await index?.search(query, {
      facets: ['*'],
      maxValuesPerFacet: 200,
      facetFilters: facetFilters, // Remove empty filters
      hitsPerPage: 20,
      
      page: page,
        // sortFacetValuesBy: ['inventory_quantity',"meta.product_extended_property.is_active", "meta.product_extended_property.bin_no"],
      sortFacetValuesBy: "alpha",
    });
    const productTypeKeys = Object.keys(
      facets['meta.product_extended_property.model_numbers'] ||
      {},
    );
    const options = productTypeKeys.filter((item) => item != "N/A" && item.toLowerCase() != "please select").map((item) => {
      return { value: item, label: item };
    });
    setMeta1(options);
    autoSelectDropdown(
      options.map((option) => option.value),
      setSelectedMeta1,
    );
  };
  const getMeta2 = async () => {
    let facetFilters = getFacetFilters("part");

    const { facets } = await index?.search(query, {
      facets: ['*'],
      maxValuesPerFacet: 200,
      facetFilters: facetFilters, // Remove empty filters
    });
    const productTypeKeys = Object.keys(
      facets['meta.product_extended_property.part_type'] || {},
    );
    const options = productTypeKeys.filter((item) => item != "N/A" && item.toLowerCase() != "kitchenware" && item.toLowerCase() != "please select").map((item) => {
      return { value: item, label: item };
    });
    setMeta2(options);
    autoSelectDropdown(
      options.map((option) => option.value),
      setSelectedMeta2,
    );
  };
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
    if (value) {
      const brandHandle = convertTitleToHandle(value.value);
      const url = `/${brandHandle ? `${brandHandle}/` : ''}${applianceType ? `${convertTitleToHandle(applianceType)}/` : ''
        }${partType ? `${convertTitleToHandle(partType)}` : ''}${model ? `?ModelNoId=${model}` : ''
        }`;
      if (url != "/") {
        navigate(url);
      }
      if (!value) {
        setQuery('');
      }
      setSelectedVendor(value ? value.value : '');
    } else {
      const removeHandle = convertTitleToHandle(selectedVendor);
      let url = generateUrlForRedirection(removeHandle);
      if (custom) {
        url = `/${selectedProductType ? `/${convertTitleToHandle(selectedProductType)}` : ''
          }${selectedMeta2 ? `/${convertTitleToHandle(selectedMeta2)}` : ''}${selectedMeta1 ? `?ModelNoId=${selectedMeta1}` : ''
          } `;
      }
      setSelectedVendor('');
      if (url != "/") {
        navigate(url);
      }
    }
  };
  const handleSelectProductType = (value) => {
    if (value) {
      const applianceHandle = convertTitleToHandle(value.value);
      const url = `/${vendor ? `${convertTitleToHandle(vendor)}/` : ''
        }${applianceHandle ? `${applianceHandle}/` : ''}${partType ? `${convertTitleToHandle(partType)}/` : ''}${model ? `?ModelNoId=${model}` : ''
        }`;
      if (url != "/") {
        navigate(url);
      }
      if (!value) {
        setQuery('');
      }
      setSelectedProductType(value ? value.value : '');
    } else {
      const removeHandle = convertTitleToHandle(selectedProductType);
      let url = generateUrlForRedirection(removeHandle);
      if (custom) {
        url = `/${selectedVendor ? `/${convertTitleToHandle(selectedVendor)}` : ''}${selectedMeta2 ? `/${convertTitleToHandle(selectedMeta2)}` : ''
          }${selectedMeta1 ? `?ModelNoId=${selectedMeta1}` : ''} `;
      }
      setSelectedProductType('');
      if (url != "/") {
        navigate(url);
      }
    }
  };
  const handleSelectMeta1 = (value) => {

    if (value && value?.value) {
      const url = `/${vendor ? `${convertTitleToHandle(vendor)}/` : ''}${applianceType ? `${convertTitleToHandle(applianceType)}/` : ''
        }${partType ? `${convertTitleToHandle(partType)}` : ''}?ModelNoId=${value.value
        } `;
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
  const generateUrlForRedirection = (removeHandle) => {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.delete('page');

    let url = currentUrl.toString()
      .replace(`/${removeHandle}`, '')
      .replace(window.location.origin, '');
    if (url === '?index') {
      url = '/';
    }
    if (url === `?ModelNoId=${selectedMeta1}`) {
      url = `/search?q=${selectedMeta1}`;
    }
    return url;
  };
  const handleSelectMeta2 = (value) => {
    if (value) {
      let partTypeHandler = convertTitleToHandle(value.value);
      if (!partTypeHandler) {
        partTypeHandler = value.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '').replace(/^-/, '');
      }
      const url = `/${vendor ? `${convertTitleToHandle(vendor)}/` : ''}${applianceType ? `${convertTitleToHandle(applianceType)}/` : ''
        }${partTypeHandler ? partTypeHandler : ''}${model ? `?ModelNoId=${model}` : ''}`;
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
      let url = `/${selectedVendor ? `/${convertTitleToHandle(selectedVendor)}` : ''}${selectedProductType ? `/${convertTitleToHandle(selectedProductType)}` : ''
        }${selectedMeta1 ? `?ModelNoId=${selectedMeta1}` : ''}`;
      // }

      if (url != "/") {
        navigate(url);
      }
      if(url == "/"){
        navigate('/search');
      }
      setSelectedMeta2('');
    }
  };

  function stripHtmlTags(html) {
    return html.replace(/<[^>]*>/g, '');
  }

  let logo = collection?.image?.url;
  // let logo =  ? collection?.image?.url : '';
  let description = collection?.top_description?.value;
  if (item?.top_description?.value) {
    description = item?.top_description?.value;
  }
  let below_description = collection?.below_description?.value;
  if (item?.below_description?.value) {
    below_description = item?.below_description?.value;
  }
  let customImages = [];
  let customXSImages = [];


  if (!logo && item?.vendor?.image?.url) {
    logo = item?.vendor?.image?.url
  }
  // if (item?.vendor?.custom_des?.value) {
  //   // logo = item?.vendor?.custom_logo?.reference?.image?.url;
  //   description = item?.vendor?.custom_des?.value;
  //   below_description = item?.vendor?.below_description?.value;
  // }else if (item?.appliance_type?.custom_des?.value) {
  //   // logo = item?.vendor?.custom_logo?.reference?.image?.url;
  //   description = item?.appliance_type?.custom_des?.value;
  //   below_description = item?.appliance_type?.below_description?.value;
  // }

  // if (
  //   !item?.vendor?.custom_des?.value &&
  //   item?.appliance_type?.custom_des?.value
  // ) {
  //   // logo = item?.appliance_type?.custom_logo?.reference?.image?.url;
  //   description = item?.appliance_type?.custom_des?.value;
  // }

  if (collection?.custom_images?.references?.nodes) {
    customImages = collection.custom_images?.references?.nodes;
  } else if (item?.appliance_type?.custom_images?.references?.nodes) {
    customImages = collection?.custom_images?.references?.nodes;
  }

  if (collection?.custom_images_for_mobile?.references?.nodes) {
    customXSImages = collection?.custom_images_for_mobile?.references?.nodes;
  } else if (collection?.custom_images_for_mobile?.references?.nodes) {
    customXSImages = collection?.custom_images_for_mobile?.references?.nodes;
  }
  if (selectedLocale.country == 'NZ') {
    customImages = []
    customXSImages = []

    if (collection?.custom_images_nz?.references?.nodes) {
      customImages = collection?.custom_images_nz?.references?.nodes;
    } else if (collection?.custom_images_nz?.references?.nodes) {
      customImages = collection?.custom_images_nz?.references?.nodes;
    }

    if (collection?.custom_images_for_mobile_nz?.references?.nodes) {
      customXSImages = collection?.custom_images_for_mobile_nz?.references?.nodes;
    } else if (collection?.custom_images_for_mobile_nz?.references?.nodes) {
      customXSImages = collection?.custom_images_for_mobile_nz?.references?.nodes;
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
  let showBanner = false;
  let showLogo = true;
  // if(pathname.includes('lg-water-filters') || pathname.includes('oven-cooktop-elements')|| pathname.includes('miele-vacuum-bags-filters')){
  //   showBanner = true;
  // }

  let showBannerValue = brandBanners.find((item) => item.brand == selectedVendor && item.appliance == selectedProductType && item.part == selectedMeta2)
  if (showBannerValue) {
    showBanner = true;
    if (showBannerValue?.title) {
      collectionLongTitle = showBannerValue?.title;
    }
    if (showBannerValue?.hideLogo) {
      showLogo = false;
    }
  }

  // let customDescriptionFound = customDescription.find((item)=> item.brand == selectedVendor && item.appliance == selectedProductType && item.part == selectedMeta2)
  let customDescriptionFound = customDescription.find((item) => {
    return (
      ((item.dontCompareNull && !item.brand) || item.brand === selectedVendor) &&
      ((item.dontCompareNull && !item.appliance) || item.appliance === selectedProductType) &&
      ((item.dontCompareNull && !item.part) || item.part === selectedMeta2)
    );
  });

  if (customDescriptionFound) {
    description = customDescriptionFound.top_description;
    below_description = customDescriptionFound.below_description;
  }

  return (
    <div className="max-w-[1140px] mx-auto px-4 my-4">
      <div className={`ajax-loading-block-window ${loading ? ' active' : ''}`}></div>



      <div className="page-title  pb-[6px] lg:block hidden">
        <h1 className="border-b-[1px] mb-[15px] pb-[15px] border-b-[#b0b0b0]  text-[#1e5097] text-center text-[24px] lg:text-[30px] font-bold">
          {collectionLongTitle}
        </h1>
      </div>

      {showBanner && <>
        {customImages.length > 0 && (
          <div className="mb-8 hidden lg:block">
            <Swiper
              spaceBetween={50}
              slidesPerView={1}
              modules={[Pagination]}
              pagination={{ clickable: true }}
            >
              {customImages.map((image, index) => {
                return (
                  <SwiperSlide key={image?.id}>
                    {image && (
                      <Image
                        fetchPriority={index === 0 ? 'high' : 'low'}
                        loading={index === 0 ? 'eager' : 'lazy'}
                        src={image.image.url}
                        className="block w-full h-auto"
                      />
                    )}
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        )}


      </>}
      <div className="flex gap-7 justify-center">
        <div className="w-full hidden lg:block  items-center collection-top-details">
          <div className='flex mb-4 items-center'>
            {logo && showLogo && (
              <div className="w-[130px] image mr-[3%]  justify-center">
                <div className="img w-[130px]">
                  <Image className="w-full max-w-full" src={logo} />
                </div>
              </div>
            )}

            {description && (
              <div className="short-description w-full text-[13px]">
                <div className="details">
                  <div
                    className="details-content"
                    dangerouslySetInnerHTML={{__html: description}}
                  />
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
      {!noFilter && <div className="bg-[#1e5097] px-[26px] pt-[15px] pb-[15px] lg:px-[10px] rounded-md lg:pt-[7px] lg:pb-4  flex flex-wrap lg:flex-nowrap gap-[10px] filter-box  items-end">
        <div className='max-w-[978px] w-full flex flex-wrap lg:flex-nowrap gap-[2px] lg:gap-[10px]'>
          <div className="w-full lg:flex-1 mb-0 lg:mb-0">
            <p className="text-white model-label cursor-pointer  relative inline-block pb-[2px] font-bold text-[14px] model-label">
              Brand
              {/* {showImg == 'vendor' && 
            <img className='absolute min-w-[112px] h-[26px] left-[101%] bottom-[2px] z-30 search-tooltip' src="https://cdn.shopify.com/s/files/1/0799/5929/4245/files/selectbrand.png?v=1722797392"/>} */}
            </p>
            <CustomSelect
              filterName="meta.product_extended_property.brands_filters" handleGetFacetValues={()=> {return getFacetFilters('vendor')}} query={query} index={index}
              id="vendor-search"
              setUserSelected={setUserSelected}
              isSearchable={true}
              isClearable={true}
              key="vendor-select"
              styles={customStyles}
              showBorder={showImg == 'vendor'}
              className="search-page-select-search"
              value={
                selectedVendor
                  ? { value: selectedVendor, label: selectedVendor }
                  : null
              }
              placeholder="Select your brand"
              name="vendor"
              options={vendors}
              onChange={(value) => handleSelectVendor(value)}
            />
          </div>
          <div className="w-full lg:flex-1 mb-0 lg:mb-0">
            <p className="text-white model-label cursor-pointer  relative inline-block pb-[2px] font-bold text-[14px] model-label">
              Appliance Type
              {/* {showImg == 'appliance' &&
            <img className='absolute min-w-[160px] h-[26px] left-[101%] bottom-[2px] z-30 search-tooltip ' src="https://cdn.shopify.com/s/files/1/0799/5929/4245/files/selectappliancetype.png?v=1722797392"/>} */}
            </p>
            <CustomSelect
              filterName="meta.product_extended_property.appliance_types_filters" handleGetFacetValues={()=> {return getFacetFilters('productType')}} query={query} index={index}
              id="appliance-search"
              setUserSelected={setUserSelected}
              isClearable={true}
              key="appliance-select"
              styles={customStyles}
              showBorder={showImg == 'appliance'}
              className="search-page-select-search"
              value={
                selectedProductType
                  ? { value: selectedProductType, label: selectedProductType }
                  : null
              }
              placeholder="Select your appliance"
              name="vendor"
              isSearchable={true}
              options={productTypes}
              onChange={(value) => handleSelectProductType(value)}
            />
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
            <CustomSelect
              filterName="meta.product_extended_property.model_numbers" handleGetFacetValues={()=> {return getFacetFilters('model')}} query={query} index={index}
              id="model-search"
              setUserSelected={setUserSelected}
              isClearable={true}
              key="model-select"
              showBorder={showImg == 'model'}
              styles={customStyles}
              className="search-page-select-search"
              value={
                selectedMeta1
                  ? { value: selectedMeta1, label: selectedMeta1 }
                  : null
              }
              placeholder="Select your model number"
              name="vendor"
              isSearchable={true}
              options={meta1}
              onChange={(value) => handleSelectMeta1(value)}
            />
          </div>
          <div className="w-full lg:flex-1 mb-0 lg:mb-0">
            <p className="text-white model-label cursor-pointer  relative inline-block pb-[2px] font-bold text-[14px] part-label">Part Type</p>
            <CustomSelect
              filterName="meta.product_extended_property.part_type" handleGetFacetValues={()=> {return getFacetFilters('part')}} query={query} index={index}
              id="part-search"
              setUserSelected={setUserSelected}
              isClearable={true}
              key="type-select"
              showBorder={showImg == 'part'}
              styles={customStyles}
              value={
                selectedMeta2
                  ? { value: selectedMeta2, label: selectedMeta2 }
                  : null
              }
              placeholder="Select your part type"
              name="vendor"
              isSearchable={true}
              options={meta2}
              onChange={(value) => handleSelectMeta2(value)}
            />
          </div>
        </div>
        <div className='max-w-[100px] mx-auto  lg:max-w-[110px] w-full button-wrap mt-1 lg:mt-0'>
          <button onClick={handleSearch} className='bg-[#00aeef] rounded-md text-white h-[36px]  w-full flex items-center justify-center openSansBold' type='button'>
            Search
          </button>
        </div>
      </div>}

      {showBanner && <>
        {customXSImages.length > 0 && (
          <div className="my-8  lg:hidden">
            <Swiper
              spaceBetween={50}
              slidesPerView={1}
              modules={[Pagination]}
              pagination={{ clickable: true }}
            >
              {customXSImages.map((image, index) => {
                return (
                  <SwiperSlide key={image?.id}>
                    {image && (
                      <Image
                        loading={index === 0 ? 'eager' : 'lazy'}
                        fetchPriority={index === 0 ? 'high' : 'low'}
                        src={image.image.url}
                        className="block w-full h-auto"
                      />
                    )}
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        )}
      </>}

      <div className="collection-title text-left mt-[30px]">
        <h2 className="font-bold text-[#1e5097] text-[18px] lg:text-[24px] my-2">
          {collectionLongTitle} {!loading && <span className='font-normal'>{'>'} {count} results</span>}
        </h2>
        {/* {!loading && <p className="text-xl text-[#004085] font-bold">{`${count} results for "${collectionLongTitle}"`}</p>} */}
      </div>
      <div className='min-h-[380px] lg:min-h-[500px]'> 

      {loading && <CollectionProductSkeleton count={8} />}

      {!loading && count > 0 && <ul className="mt-[30px] mb-[50px] grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
        {results.map((hit, index) => {
          const product = {
            ...hit,
          };
          return <AlgoliaProduct loading={index <= 1 ? 'eager' : 'lazy'} shop={shop} selectedLocale={selectedLocale} customer={customer} showPopup={showPopup} key={hit.id} product={product} />;
        })}
      </ul>}
      </div>
      {pageCount > 1 &&
        <CustomPagination currentPage={page} onPageChange={handlePageClick} totalPages={pageCount} />}
      {count <= 0 && !loading && <NoResult showFindPopup={showFindPopup} />}

      {/* <div className="page-title  py-[6px] lg:hidden">
              <h1 className="border-b-[1px] mb-[15px] py-[15px] border-b-[#b0b0b0]  text-[#1e5097] text-center text-[20px] font-bold">
                {collectionLongTitle}
              </h1>
        </div> */}

   
{selectedVendor && logo && showLogo && <div className='flex lg:hidden justify-center my-[25px]'>
        {selectedVendor && logo && showLogo && (
          <div className="w-[130px] image   justify-center">
            <div className="img w-[130px]">
              <Image className="w-full max-w-full" src={logo} />
            </div>
          </div>
        )}
      </div>}


      {description && (
        <div className="short-description bottom-description lg:hidden mt-4 mb-1 w-full text-[13px]">
          <div className="details">
            <div dangerouslySetInnerHTML={{__html: description}} />
          </div>
        </div>
      )}
      <DescriptionComponent count={count} below_description={below_description} belowDiscriptionRef={belowDiscriptionRef} collectionLongTitle={collectionLongTitle} />
      {findpopup && <FindModelPopup showPopup={showFindPopup} />}
      {popup && <InStockPopup showPopup={showPopup} />}
    </div>
  );
};

export { CollectionTemplate };

const DescriptionComponent = ({ count, below_description, belowDiscriptionRef, collectionLongTitle }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const contentRef = useRef(null);
  const hiddenRef = useRef(null);

  const handleToggle = () => {
    setIsExpanded((prev) => !prev);
  };

  // Check if the content overflows more than 3 lines
  useEffect(() => {
    const checkOverflow = () => {
      if (!below_description || !contentRef.current) return;

      // Create a hidden clone to measure actual content height
      const clone = contentRef.current.cloneNode(true);
      clone.style.position = 'absolute';
      clone.style.visibility = 'hidden';
      clone.style.height = 'auto';
      clone.style.maxHeight = 'none';
      clone.style.overflow = 'visible';
      clone.style.display = 'block';
      clone.style.webkitLineClamp = 'none';
      clone.style.webkitBoxOrient = 'horizontal';
      clone.style.whiteSpace = 'normal';
      clone.style.width = getComputedStyle(contentRef.current).width;

      document.body.appendChild(clone);

      const actualHeight = clone.offsetHeight;
      const lineHeight = parseFloat(getComputedStyle(contentRef.current).lineHeight) || 20;
      const maxHeight = lineHeight * 3;

      document.body.removeChild(clone);

      const shouldShowOverflow = actualHeight > maxHeight + 10;
      setHasOverflow(shouldShowOverflow);

      // If this is the first load and we found overflow, mark first load as complete
      if (isFirstLoad && shouldShowOverflow) {
        setIsFirstLoad(false);
      }
    };

    // Use requestAnimationFrame for better timing
    const checkWithRAF = () => {
      requestAnimationFrame(() => {
        setTimeout(checkOverflow, 50);
      });
    };

    // More aggressive checking for first load
    const timeouts = isFirstLoad ? [
      setTimeout(checkOverflow, 50),
      setTimeout(checkOverflow, 100),
      setTimeout(checkOverflow, 200),
      setTimeout(checkOverflow, 400),
      setTimeout(checkOverflow, 800),
      setTimeout(checkOverflow, 1500),
      setTimeout(checkOverflow, 3000)
    ] : [
      setTimeout(checkOverflow, 100),
      setTimeout(checkOverflow, 300),
      setTimeout(checkOverflow, 600)
    ];

    // Check after images load
    const checkAfterImages = () => {
      const images = contentRef.current?.querySelectorAll('img');
      if (images && images.length > 0) {
        Promise.all(Array.from(images).map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise(resolve => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        })).then(() => {
          setTimeout(checkOverflow, 100);
        });
      } else {
        setTimeout(checkOverflow, 100);
      }
    };

    // Initial checks
    checkWithRAF();
    setTimeout(checkAfterImages, 200);

    // Event listeners
    window.addEventListener('resize', checkOverflow);
    window.addEventListener('load', () => setTimeout(checkOverflow, 100));

    // Mutation observer for content changes
    const observer = new MutationObserver(() => {
      setTimeout(checkOverflow, 100);
    });

    if (contentRef.current) {
      observer.observe(contentRef.current, {
        childList: true,
        subtree: true,
        attributes: true
      });
    }

    // Force a final check after a longer delay for first load
    if (isFirstLoad) {
      setTimeout(() => {
        checkOverflow();
        setIsFirstLoad(false);
      }, 5000);
    }

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
      window.removeEventListener('resize', checkOverflow);
      window.removeEventListener('load', checkOverflow);
      observer.disconnect();
    };
  }, [below_description, isFirstLoad]);

  // Reset first load state when description changes
  useEffect(() => {
    setIsFirstLoad(true);
    setHasOverflow(false);
  }, [below_description]);

  return (
    <div>
      {count > 0 && below_description && below_description != "null" && (
        <div className="short-description mt-8" ref={belowDiscriptionRef}>
          <h4 className="text-[#1e5097] text-[18px] lg:text-[24px] my-2 font-normal">
            {collectionLongTitle}
          </h4>

          <div className="mb-4">
            <div
              ref={contentRef}
              className={isExpanded ? '' : 'line-clamp-3'}
              dangerouslySetInnerHTML={{__html: below_description}}
              style={
                !isExpanded
                  ? {
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }
                  : {}
              }
            />
          </div>

          {hasOverflow && (
            <button
              onClick={handleToggle}
              className="text-[#1e5097] text-[14px] underline hover:text-[#004085] transition-colors duration-200 flex items-center gap-2"
            >
              {isExpanded ? 'Read less' : 'Read more'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};



const InStockPopup = ({ showPopup }) => {
  return (
    <>
      <div onClick={() => showPopup(false)} className='bg-black/[.6] z-[1000]  in-stock-popup fixed top-0 bottom-0 left-0 right-0 h-full w-full bg'>
      </div>
      <div className='in-stock-popup-box z-[1005] fixed top-1/2 left-1/2  -translate-y-1/2 -translate-x-1/2 w-[100%] max-w-[500px] bg-white p-4 rounded-[5px]'>
        <button onClick={() => showPopup(false)} type="button" className="absolute right-4 top-2 cursor-pointer" data-dismiss="modal" aria-label="Close"> <span className='font-bold' aria-hidden="true">×</span> </button>
        <div className='flex mb-4'>
          <p className='tracking-[-0.5px] w-[100px] text-[#1e5097]  text-[15px] font-bold'>In Stock</p>
          <p className='tracking-[-0.5px] in-stock-popup-text text-[15px]'>This item is typically held in stock and will usually be despatched within 2 business days of your order being placed.</p>
        </div>
        <div className='flex mb-4'>
          <p className='tracking-[-0.5px] w-[100px] text-[#1e5097]  text-[15px] font-bold'>Special Order</p>
          <p className='tracking-[-0.5px] in-stock-popup-text text-[15px]'>This item is ordered from our supplier and is usually despatched within 4–10 business days of your order being placed. Supplier delays may occasionally extend this timeframe.<span className='block'>Despatch time is <b className='openSansBold'>additional</b> to shipping time. Your total delivery time includes both the time to despatch <b className='openSansBold'>and</b> ship your order.</span></p>
        </div>

        <div className='flex mb-4'>
          <p className='tracking-[-0.5px] w-[100px] text-[#1e5097]  text-[15px] font-bold'>Part Number Updated</p>
          <p className='tracking-[-0.5px] in-stock-popup-text text-[15px]'>This part has been updated. The current part number will be shown with a link.
          </p>
        </div>

        <div className='flex'>
          <p className='tracking-[-0.5px] w-[100px] text-[#1e5097]  text-[15px] font-bold'>No Longer Available</p>
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
