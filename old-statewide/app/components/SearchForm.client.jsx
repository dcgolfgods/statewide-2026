import {Form, useLocation, useTransition} from '@remix-run/react';
import React, {useState, useEffect, useRef} from 'react';
import {Image} from '@shopify/hydrogen';
import {getImageLoadingPriority} from '~/lib/const';
import {Input} from './Input';
import {IconClose} from './Icon';
import {Link} from './Link';

const SearchForm = ({ params }) => {
    const [index, setIndex] = useState(null);
    const [suggestionsIndex, setSuggestionsIndex] = useState(null);
    const [searchClient, setSearchClient] = useState(null);
    const popupRef = useRef(null);
    const inputRef = useRef(null);
    const [results, setResults] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [isMobilePopupOpen, setIsMobilePopupOpen] = useState(false);
    const [mobileInputRef, setMobileInputRef] = useState(null);
    const {pathname} = useLocation();
    const transition=useTransition()
    const searchForm=useRef()
    const searchFormAction=params.locale?`/${params.locale}/api/predictivesearch` : '/api/predictivesearch'
    const isSearching=transition.state === "submitting" && transition.submission.action == searchFormAction
    
    const initializeSearchClient = async () => {
        const [{ default: algoliasearch }, { createFetchRequester }] = await Promise.all([
            import('algoliasearch'),
            import('@algolia/requester-fetch'),
        ]);
        let client = await algoliasearch('CW8UTBJWAG', '9238d494978f4cb3614880a79561abfa', {
            requester: createFetchRequester(),
        });
        const indexObj = client?.initIndex('shopify_products_new');
        const suggestionsIndexObj = client?.initIndex('shopify_products_new_query_suggestions');
        
        setSearchClient(client);
        setIndex(indexObj);
        setSuggestionsIndex(suggestionsIndexObj); // This is where suggestionsIndexObj is used - stored in state
    }
    
    useEffect(()=>{
        if(!isSearching){
         searchForm.current.reset()
        }
     },[isSearching])
    const searchClientInitialized = useRef(false);
    const ensureSearchClient = () => {
        if (!searchClientInitialized.current) {
            searchClientInitialized.current = true;
            initializeSearchClient();
        }
    };
    useEffect(() => {
        setSearchTerm("");
        setIsMobilePopupOpen(false);
        if(inputRef.current){
            inputRef.current.blur()
        }
    }, [pathname])
    
    // Handle mobile input focus - show popup immediately
    const handleInputFocus = (e) => {
        ensureSearchClient();
        if (window.innerWidth < 1024) {
            setIsMobilePopupOpen(true);
        }
    };
    
    // Handle mobile input blur - keep popup open if there's content
    const handleInputBlur = (e) => {
        // Don't close if clicking inside popup
        if (popupRef.current && popupRef.current.contains(e.relatedTarget)) {
            return;
        }
    };
    
    // Handle mobile popup input focus
    const handleMobileInputFocus = () => {
        ensureSearchClient();
        setIsMobilePopupOpen(true);
    };
    
    useEffect(() => {
        if (index && suggestionsIndex) {
            handleSearch()
        }
    }, [searchTerm])
    
    // Prevent body scroll when mobile overlay is open
    useEffect(() => {
        if (isMobilePopupOpen) {
            // Check if mobile (viewport width < 1024px)
            const isMobile = window.innerWidth < 1024;
            if (isMobile) {
                document.body.style.overflow = 'hidden';
            }
            return () => {
                if (isMobile) {
                    document.body.style.overflow = '';
                }
            };
        } else {
            document.body.style.overflow = '';
        }
    }, [isMobilePopupOpen])
    
  const closePopup = () => {
    setSearchTerm("");
    setIsMobilePopupOpen(false);
    inputRef.current?.blur();
  };

  const handleSearchButtonClick = (e) => {
    if (showPopup) {
      e.preventDefault();
      closePopup();
      return;
    }

    const trimmed = (searchTerm || '').trim();
    if (!trimmed) {
      e.preventDefault();
      inputRef.current?.focus();
    }
  };

  useEffect(() => {
    // Close popup when clicking outside (desktop and mobile)
    function handleClickOutside(event) {
      const target = event.target;
      const formEl = searchForm.current;
      // Close when tap/click is outside the entire form (input + button + popup)
      if (formEl && target && !formEl.contains(target)) {
        closePopup();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);
  
    const handleSearch = async () => {
        try {
            const trimmed = (searchTerm || '').trim();
            if (trimmed.length < 2) {
                setResults([]);
                setSuggestions([]);
                return;
            }
            
            // Search for products and Query Suggestions in parallel (use trimmed for API)
            const [productsResponse, suggestionsResponse] = await Promise.all([
                index?.search(trimmed, {
                    facets: ['*'],
                    hitsPerPage: 5,
                }),
                suggestionsIndex?.search(trimmed, {
                    hitsPerPage: 6,
                }).catch(() => ({hits: []})),
            ]);
            
            const productHits = productsResponse?.hits || [];
            setResults(productHits);
            
            // Extract query suggestions from hits
            const querySuggestions = (suggestionsResponse?.hits || [])
                .map(hit => hit.query || hit.objectID || '')
                .filter(s => s && s.trim().length > 0)
                .map((item) =>
                    item
                        .replace(/\s+/g, ' ')
                        .replace(/\s*\\+\s*$/g, '')
                        .replace(/"+$/g, '')
                        .trim()
                )
                .filter((item) => item.length > 0);
            
            // Keep exact matches too (e.g. "lg"), do not drop full suggestion words
            const suggestions = [...querySuggestions];
            setSuggestions(Array.from(new Set(suggestions)).slice(0, 6));

        } catch (error) {   
            setResults([]);
            setSuggestions([]);
        }
    };
    
    const handleSuggestionClick = (suggestion) => {
        const trimmed = (suggestion || '').trim();
        if (!trimmed) return;
        if (inputRef.current) {
            inputRef.current.value = trimmed;
        }
        setSearchTerm(trimmed);
        setIsMobilePopupOpen(false);
        searchForm.current?.requestSubmit();
    };
    
    const handleViewAllResults = (e) => {
        e.preventDefault();
        const trimmed = searchTerm.trim();
        if (!trimmed) return;
        if (inputRef.current) {
            inputRef.current.value = trimmed;
        }
        setSearchTerm(trimmed);
        setIsMobilePopupOpen(false);
        searchForm.current?.requestSubmit();
    };
    
    const handleProductClick = () => {
        // Close popup when product is clicked
        setTimeout(() => {
            setSearchTerm("");
        }, 100);
    };
    
    // Helper function to highlight matching characters
    const highlightMatch = (text, query) => {
        if (!query || !text) return text;
        
        const textLower = text.toLowerCase();
        const queryLower = query.toLowerCase();
        const parts = [];
        let lastIndex = 0;
        let index = textLower.indexOf(queryLower, lastIndex);
        
        while (index !== -1) {
            // Add text before match
            if (index > lastIndex) {
                parts.push({ text: text.substring(lastIndex, index), isMatch: false });
            }
            // Add matched text
            parts.push({ text: text.substring(index, index + query.length), isMatch: true });
            lastIndex = index + query.length;
            index = textLower.indexOf(queryLower, lastIndex);
        }
        
        // Add remaining text
        if (lastIndex < text.length) {
            parts.push({ text: text.substring(lastIndex), isMatch: false });
        }
        
        // If no matches found, return original text
        if (parts.length === 0) {
            return text;
        }
        
        return (
            <>
                {parts.map((part, i) => 
                    part.isMatch ? (
                        <span key={i} className="text-[#1e5097] OpenSansBold">{part.text}</span>
                    ) : (
                        <span className='text-[#1e5097]' key={i}>{part.text}</span>
                    )
                )}
            </>
        );
    };
    
    
    // Check if mobile (only on client side)
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    
    // Show popup on mobile when input is focused, or on desktop when there are results
    // const showPopup = isMobile 
    //     ? isMobilePopupOpen 
    //     : (searchTerm && searchTerm.trim().length >= 2 && (suggestions.length > 0 || results.length > 0));

    const showPopup =  (searchTerm && searchTerm.trim().length >= 2 && (suggestions.length > 0 || results.length > 0));

    const topProducts = isMobile ? results.slice(0, 2) : results.slice(0, 3); // Show 6 products

    return (
        <Form
            ref={searchForm}
            method="POST"
            action={searchFormAction}
            onSubmit={(e) => {
                const trimmed = searchTerm.trim();
                console.log('[SearchForm] submit ->', searchFormAction, 'q=', trimmed);
                if (trimmed !== searchTerm && inputRef.current) {
                    inputRef.current.value = trimmed;
                    setSearchTerm(trimmed);
                }
            }}
            className={`relative lg:w-[90%] mx-auto flex items-center w-full text-[#00aeef] search-form ${showPopup && isMobile ? 'z-[100]' : ''}`}
        >
            {/* Mobile: tap outside (on backdrop) to close popup */}
            {showPopup && isMobile && (
                <div
                    className="fixed inset-0 z-[99] lg:hidden"
                    aria-hidden
                    onClick={closePopup}
                    onTouchEnd={closePopup}
                />
            )}
            <label htmlFor="header-search-input" className="sr-only">
                Search spare parts
            </label>
            <Input
                id="header-search-input"
                value={searchTerm}
                ref={inputRef}
                onChange={(e) => {setSearchTerm(e.target.value)}}
                onFocus={handleInputFocus}
                className="text-[11.2px] w-full placeholder:text-black rounded-md text-black border-2 border-[#00aeef] focus:border-[#00aeef] h-[40px]"
                type="search"
                placeholder="Start typing a brand, appliance, part no. or model no."
                autoComplete="off"
                variant="minisearch"
                name="q"
                data-copy-allowed="true"
            />
            <button
                type={showPopup || !searchTerm.trim() ? "button" : "submit"}
                className="absolute top-1/2 transform right-[4px] -translate-y-1/2 flex items-center justify-center w-8 h-8"
                aria-label={showPopup ? "Close search" : "Search spare parts"}
                // onClick={showPopup ? (e) => { e.preventDefault(); closePopup(); } : undefined}
                onClick={handleSearchButtonClick}
            >
                {showPopup ? (
                    <IconClose className="w-5 h-5 text-[#00aeef]" />
                ) : (
                    <i className="fa fa-search text-[20px]" aria-hidden="true"></i>
                )}
            </button>
            {showPopup && (
                <div 
                    ref={popupRef}
                    className='z-[100] absolute left-0 right-0 top-[100%] bg-white lg:max-h-[390px] max-h-[550px] overflow-y-auto shadow-lg border border-gray-200 rounded-b-md'
                >
                    <div className='flex flex-col lg:flex-row flex-1 overflow-hidden'>
                        {/* Left Column - Text Suggestions */}
                        {suggestions.length > 0 && (
                            <div className='w-full lg:w-[30%] border-b lg:border-b-0 lg:border-r border-gray-200 py-3 lg:py-3 px-4 lg:px-4 overflow-y-auto'>
                                {/* <h4 className='lg:hidden text-[14px] font-semibold mb-2 text-gray-700'>Suggestions</h4> */}
                                <div className='space-y-0 lg:max-h-none'>
                                    {suggestions.map((suggestion, index) => {
                                        return (
                                            <div
                                                key={index}
                                                onClick={() => handleSuggestionClick(suggestion)}
                                                className='cursor-pointer hover:bg-gray-50 py-2 lg:px-2 rounded text-[13px] lg:text-[14px] text-gray-800 transition-colors'
                                            >
                                                <span>{highlightMatch(suggestion, searchTerm)}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        
                        {/* Right Column - Product Suggestions with Images */}
                        {topProducts.length > 0 && (
                            <div className='w-full lg:w-[70%] flex flex-col justify-between relative py-3 px-4 lg:px-4 flex-1 overflow-y-auto'>
                                <div>
                                    <h3 className='text-[14px] lg:text-[14px] font-semibold mb-3 OpenSansBold text-[#1e5097] text-left'>
                                        {searchTerm ? `Suggestions for '${searchTerm}'` : 'Search Products'}
                                    </h3>
                                    <div className='grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-2 mb-3'>
                                        {topProducts.map((product, i) => {
                                            const { image, price } = product;
                                            
                                            return (
                                                <Link
                                                    key={product.objectID || i}
                                                    to={`/${product.handle}`}
                                                    prefetch="intent"
                                                    onClick={handleProductClick}
                                                    className='flex flex-col items-center text-center group'
                                                >
                                                    <div className='bg-[#f5f5f5] w-full mb-2 rounded-sm overflow-hidden flex items-center justify-center max-w-full'>
                                                        {image ? (
                                                            <Image
                                                                className="h-auto w-full"
                                                                sizes="(min-width: 64em) 25vw, (min-width: 48em) 30vw, 45vw"
                                                                src={image}
                                                                alt={image.altText || `Picture of ${product.title}`}
                                                                loading={getImageLoadingPriority(i)}
                                                            />
                                                        ) : (
                                                            <Image
                                                                className="object-contain h-full w-full fadeIn"
                                                                sizes="(min-width: 64em) 25vw, (min-width: 48em) 30vw, 45vw"
                                                                src={"https://cdn.shopify.com/s/files/1/0799/5929/4245/files/Image_coming_soon_Website.webp?v=1724582291"}
                                                                alt={`${product.title}`}
                                                                loading={getImageLoadingPriority(i)}
                                                            />
                                                        )}
                                                    </div>
                                                    <div className='w-full text-left px-1'>
                                                        {product.sku && (
                                                            <p className='hover:underline mb-[2px] w-full text-[11px] lg:text-[11px] text-left text-black OpenSansBold font-bold'>
                                                                {/* {highlightMatch(product.sku, searchTerm)} */}
                                                                {product.sku}
                                                            </p>
                                                        )}
                                                        <p className='hover:underline break-words w-full  text-[11px] leading-[1.4] lg:text-[11px] text-left text-black line-clamp-2'>
                                                            {/* {highlightMatch(product.title, searchTerm)} */}
                                                            {product.title}
                                                        </p>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                                {results.length > 3 && (
                                    <div className={`text-right mt-2 pt-2 border-t border-gray-100`}>
                                        <button onClick={handleViewAllResults} className='text-[#00aeef] text-[12px]  lg:text-[13px] hover:underline'>
                                            View all results &gt;
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {/* Fallback when no products but has suggestions */}
                        {topProducts.length === 0 && suggestions.length > 0 && (
                            <div className='w-full lg:w-[70%] p-4 flex items-center justify-center'>
                                <p className='text-gray-500 text-[14px]'>No products found for this search</p>
                            </div>
                        )}

                        
                        {/* Empty state for mobile when no results yet */}
                        {/* {isMobile && isMobilePopupOpen && topProducts.length === 0 && suggestions.length === 0 && (
                            <div className='w-full lg:w-[70%] p-8 flex flex-col items-center justify-center text-center'>
                                <i className="fa fa-search text-[48px] text-gray-300 mb-4"></i>
                                <p className='text-gray-500 text-[14px]'>Start typing to search for products</p>
                            </div>
                        )} */}
                    </div>
                </div>
            )}
        </Form>
    )
}

export { SearchForm };
