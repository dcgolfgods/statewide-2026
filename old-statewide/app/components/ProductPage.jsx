import { Suspense, useState, useEffect } from 'react';
import { useLoaderData, Await, useMatches, useLocation, useNavigate } from '@remix-run/react';
import {
  useMoney,
} from '@shopify/hydrogen';

import {
  ProductGallery,
  Link,
  IconUp,
  IconDown,
} from '~/components';
import { productAvaibilityLabel, handleize, elementInViewport, calculatePriceIncludingTax, DEFAULT_LOCALE, convertTitleToHandle, businessDays, multiBuyCalc } from '~/lib/utils';
import { UpsellProducts } from './UpsellProducts';
import { useCart } from '~/components/cartContext';
import { gtag_report_conversion, viewKlaviyoProduct } from './KlaviyoEvent';
import { isSpecialUser } from '~/lib/specialUserHelper';
import {
  getCleanedProductTitle,
  getImportantModelNumbers,
  getProductImageAlt,
  getVisibleProductLead,
} from '~/lib/productSeo';
const lgSKUS = [
  "ADQ74793501",
  "ADQ36006101",
  "ADQ73613401",
  "ADQ73693903",
  "ADQ74793501-4404",
  "ADQ32617703",
  "5231JA2002A",
  "ADQ73613401-4404",
  "ADQ36006101-4404",
  "5231JA2006F",
  "AJR73482513",
  "ADQ73693903-4404",
  "ADQ73753313",
  "AJR73482513-4404",
  "ADQ32617703-4404",
  "LT1000P1PK",
  "LT1000P2PK"
];
function ProductPage({ product, shop, recommended }) {
  // console.log("product page",product)
  const {
    media,
    title,
    vendor,
    descriptionHtml,
    partNumber,
    variants,
    tags,
    selectedVariant,
  } = product;
  // const [qtyPrices, setQtyPrices] = useState([])
  const matches = useMatches();
  const cleanedTitle = getCleanedProductTitle(title, {
    vendor,
    sku: product?.selectedVariant?.sku,
  });
  const importantModels = getImportantModelNumbers({
    product,
    selectedVariant: product?.selectedVariant,
  });
  const productImageAlt = getProductImageAlt({
    product,
    selectedVariant: product?.selectedVariant,
    models: importantModels,
  });
  const productLead = getVisibleProductLead({
    product,
    selectedVariant: product?.selectedVariant,
    models: importantModels,
  });
  const [root] = matches;
  const navigate = useNavigate();
  const customer = root?.data?.customer;
  // const shop = root?.data?.shop;

  const selectedLocale = root.data?.selectedLocale ?? DEFAULT_LOCALE;
  const { pathname } = useLocation();
  const localeParam = matches.find((item) => item?.params?.locale)?.params?.locale;


  // console.log("product", product)
  useEffect(() => {
    document.body.classList.add('product-page');

    // Remove class when navigating away
    return () => {
      document.body.classList.remove('product-page');
    };

  }, [pathname])
  // useEffect(() => {
  //   const myHeaders = new Headers();
  //   myHeaders.append("X-Shopify-Shop-Domain", "statewide-appliances.myshopify.com");
  //   myHeaders.append("Content-Type", "application/json");

  //   const raw = JSON.stringify({
  //     "customerEmail": customer?.email ? customer?.email : '',
  //     "sku": [product?.selectedVariant?.sku]
  //   });

  //   const requestOptions = {
  //     method: "POST",
  //     headers: myHeaders,
  //     body: raw,
  //     redirect: "follow"
  //   };

  //   fetch("https://statewide.digitalconverters.com.au/storefront/products/multi-level-discounts", requestOptions)
  //     .then((response) => response.json())
  //     .then((result) => {
  //       if (result.data.length > 0) {
  //         setQtyPrices(result.data[0].discountDetails);
  //       }
  //       console.log("result", result)
  //     })
  //     .catch((error) => console.error(error));
  // }, [])

  useEffect(() => {
    viewKlaviyoProduct(product, selectedVariant);
  }, []);

  // ChannelSight Tracking Pixel — product page Init (Step 1)
  useEffect(() => {
    const CS_INIT_SRC = 'https://tracking.channelsight.com/api/tracking/v2/Init';
    if (document.querySelector('script[data-channelsight-init]')) {
      console.log('[ChannelSight] Init already loaded on PDP');
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = CS_INIT_SRC;
    script.setAttribute('data-channelsight-init', '1');
    script.onload = () => {
      console.log('[ChannelSight] Init loaded on PDP', {
        productId: product?.id,
        sku: selectedVariant?.sku,
      });
    };
    script.onerror = () => {
      console.error('[ChannelSight] Init failed to load on PDP');
    };
    document.head.appendChild(script);
  }, []);

  // return <h1>Hello</h1>
  let countryCode = selectedLocale?.currency || 'AUD';
  const isAustraliaOnly =
    product?.show_australia_only?.value === 'true' ||
    product?.show_australia_only?.value === true;
  const isNzMarket =
    selectedLocale?.currency === 'NZD' || selectedLocale?.country === 'NZ';
  const shouldRedirectToHome = isAustraliaOnly && isNzMarket;
  const homePath = localeParam ? `/${localeParam}` : '/';

  useEffect(() => {
    if (shouldRedirectToHome) {
      navigate(homePath, {replace: true});
    }
  }, [shouldRedirectToHome, homePath, navigate]);

  if (shouldRedirectToHome) {
    return null;
  }

  const priceScale = product?.priceScale?.value ? JSON.parse(product?.priceScale?.value) : [];
  let multiBuyPrice = [];
  if (product?.multi_buy_price?.value) {
    multiBuyPrice = JSON.parse(product?.multi_buy_price?.value)
  }
  let shopMultiBuy = shop.specialPrice?.value ? JSON.parse(shop.specialPrice?.value) : []

  let qtyPrices = multiBuyCalc(multiBuyPrice, shopMultiBuy);
  if(qtyPrices.length > 0){
    qtyPrices = qtyPrices.sort((a, b) => a.quantity - b.quantity);
  }
  // console.log("qtyPrices", qtyPrices)
  let priceScaleFound = false;
  let price = selectedVariant?.price;
  let tradeCustomer = customer?.scale?.value ? true : false;;

  let isSpecialUserExists = isSpecialUser();

  if ((customer?.scale?.value || isSpecialUserExists) && customer && priceScale.length > 0) {
    let cScale = null;
    if (customer?.scale?.value) {
      cScale = customer?.scale?.value?.split(' ')[0];
    }
    if (isSpecialUserExists && !cScale) {
      cScale = 2;
    }
    if (cScale) {
      cScale = parseInt(cScale);
      if (isSpecialUserExists && (!cScale || cScale <= 1)) {
        cScale = 2;
      }
      if (cScale > 1) {
        if (cScale == 4) {
          cScale = 5
        } else if (cScale == 5) {
          cScale = 6
        } else if (cScale == 6) {
          cScale = 7
        } else if (cScale == 7) {
          cScale = 9
        } else if (cScale == 8) {
          cScale = 10
        }
        if (isSpecialUserExists && cScale < 2) {
          cScale = 2;
        }
        let item = priceScale.find((item) => item.scaleId == cScale);
        if (item) {
          console.log("item.price", item.price)
          price.amount = calculatePriceIncludingTax(item.price, countryCode).toFixed(2).toString();
          priceScaleFound = true;
        }
      }
    }
  }
  const isLG = product?.vendor?.toLowerCase() == 'lg' ? true : false;
  let priceDup = selectedVariant;
  let { currencyNarrowSymbol, amount, currencyCode } = useMoney(price);

  let isLgFridge = false;
  if (lgSKUS.includes(product?.selectedVariant?.sku)) {
    isLgFridge = true;
  }
  //  if(product.appliances?.value && product?.parts?.value){
  //    let appliances = JSON.parse(product.appliances?.value);
  //    let findItem = appliances.find((el)=> el == "Fridges & Freezers");

  //    if(findItem && product?.parts?.value == "Filter"){
  //      isLgFridge = true;
  //    }
  //  }
  let breadcrumb = {
    title: null,
    handle: null
  };
  if (product?.breadcrumb?.value) {
    breadcrumb.title = product?.breadcrumb?.value
    breadcrumb.handle = convertTitleToHandle(product?.breadcrumb?.value)

  }
  const stockLabel = productAvaibilityLabel({
    binNo: product?.bin_no?.value,
    qauntity: product?.selectedVariant?.quantityAvailable,
    active: product?.is_active_value?.value == "1" || product?.is_active?.value == 1 ? true : false,
    is_always_in_stock: product?.is_always_in_stock?.value == "1" || product?.is_always_in_stock?.value == 1 ? true : false
  })
  const compatibility = product?.compatibility?.value == "true" ? true : false;

  const replace_products = product?.replace_products?.value ? JSON.parse(product.replace_products.value) : [];
  const replace_products_sku = product?.replace_products_sku?.value ? JSON.parse(product.replace_products_sku.value) : [];
  return (
    <>
      <div className="max-w-[1140px] mx-auto mt-[10px] mb-[50px]">
        <div className="font-[400] mb-[2rem] pt-[1rem] px-[1rem] breadcrumbs">
          <Link className="text-[#6c757d] m-[0 2px] text-[14px]" to="/">
            Home
          </Link>
          {breadcrumb.title && breadcrumb.handle &&
            <>
              <span className="px-[1rem] text-[#6c757d]">/</span>
              <Link className="text-[#6c757d] m-[0 2px] text-[14px]" to={`/${breadcrumb.handle}`}>
                {breadcrumb.title}
              </Link></>
          }
          {product?.productType && <>
            <span className="px-[1rem] text-[#6c757d]">/</span>
            <Link className="text-[#6c757d] m-[0 2px] text-[14px]" to={`/${handleize(product?.productType)}`}>
              {product?.productType}
            </Link></>}
          <span className="px-[1rem] text-[#6c757d]">/</span>
          <span className="text-[#6c757d] m-[0 2px] text-[14px]">{cleanedTitle}</span>
        </div>
        <div className="flex-wrap px-[15px] flex lg:mb-[50px] mb-[30px]">
          <ProductGallery
            media={media.nodes}
            title={cleanedTitle}
            sku={product?.selectedVariant?.sku}
            imageAlt={productImageAlt}
            showMultiDiscount={qtyPrices.length > 0 && !priceScaleFound}
            className="w-full lg:col-span-2"
            compatibility={compatibility}
          />
          <div className="flex-wrap  lg:max-w-[50%] w-full mt-8 lg:mt-0 lg:px-[15px]">
            <div className="flex w-full flex-wrap flex-wrap-initial flex-col-reverse lg:flex-row">
              <div className="w-full relative">
                  <h1
                  as="h1"
                  data-copy-allowed="true"
                  className="mb-[5px] text-[#254e93] text-[22.4px] leading-[1.2]"
                >
                  {product?.selectedVariant?.sku} {cleanedTitle}
                </h1>
                {productLead && (
                  <p
                    data-copy-allowed="true"
                    className="mb-[8px] text-[14px] font-[400] text-[#254e93]"
                  >
                    {productLead}
                  </p>
                )}
                {product?.selectedVariant?.sku && (
                  <div className="flex">
                    <p
                      data-copy-allowed="true"
                      className="mb-[8px] text-[14px] font-[400] "
                    >
                      <span className="text-[#254e93]">
                        Part Number:
                      </span>
                      <span
                        data-copy-allowed="true"
                        className="text-[#254e93] ml-[8px] inline-block pr-[10px]"

                      >
                        {product?.selectedVariant?.sku}
                      </span>
                    </p>
                  </div>
                )}

{replace_products?.length > 0 && replace_products_sku?.length > 0 && (
                  <div className="flex mt-[-10px]">
                    <p
                      data-copy-allowed="true"
                      className="mb-[8px] text-[14px] font-[400] "
                    >
                      <span data-copy-allowed="true" className=" text-[#254e93]">
                        <span className="OpenSansBold"> {replace_products?.length > 1 ? 'Replaces Part Numbers:' : 'Replaces Part Number:'} </span>  {replace_products_sku.join(', ')}
                      </span>
                    </p>
                  </div>
                )}


                {selectedVariant && stockLabel != "No Longer Available" && (
                  <div className='flex mb-4'>
                    <h4 className="leading-[1] font-semibold lg:leading-normal price  text-[#254e93] text-[30px] mr-4">
                      {currencyNarrowSymbol}{amount} {currencyCode == "NZD" ? "NZ" : ""}
                    </h4>
                    {qtyPrices.length > 0 && !priceScaleFound &&
                      <div className='flex lg:items-center'>
                        <div className='mr-2'>
                          <svg className='relative top-[7px] lg:static' xmlns="http://www.w3.org/2000/svg" version="1.0" width="30" height="30" viewBox="0 0 512.000000 512.000000" preserveAspectRatio="xMidYMid meet">
                            <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)" fill="red" stroke="none">
                              <path d="M395 5106 c-181 -44 -346 -213 -384 -394 -14 -70 -16 -1915 -1 -1993 5 -30 26 -88 46 -129 35 -73 67 -106 1248 -1286 1181 -1181 1213 -1213 1286 -1248 150 -72 297 -72 447 -2 77 37 89 47 1035 994 943 943 958 958 993 1034 71 149 71 296 1 445 -37 77 -45 86 -1249 1290 -1081 1080 -1219 1215 -1274 1242 -126 62 -95 61 -1143 60 -714 -1 -968 -4 -1005 -13z m565 -506 c80 -15 149 -51 203 -105 58 -58 91 -120 107 -202 51 -258 -185 -494 -443 -443 -163 32 -277 149 -308 315 -35 192 106 396 301 434 63 12 80 12 140 1z" />
                            </g>
                          </svg>
                        </div>
                        <div>
                          <h4 className='OpenSansBold'>Multi-buy discount</h4>
                          <p>Save when you buy 2 or more</p>
                        </div>
                      </div>}
                  </div>
                )}
                {qtyPrices.length > 0 && !priceScaleFound && <div className='mb-8'>
                  <table className="prices-table table table-hover text-left w-full">
                    <tbody>
                      <tr>
                        <th className="font-semibold text-[12px] lg:text-[16px]  field-header p-[4px] lg:p-[12px] border-[#dee2e6] border-t-[1px]">
                          Quantity
                        </th>
                        <td className="item-quantity text-[14px]  lg:text-[16px] p-[4px] lg:p-[12px] border-[#dee2e6] border-t-[1px]">
                          1
                        </td>
                        {qtyPrices.map((item, i) => {
                          return <td className="item-quantity  text-[14px] lg:text-[16px]  p-[0] lg:p-[12px] border-[#dee2e6] border-t-[1px]">
                            {item.quantity}{(i + 1) >= qtyPrices.length ? '+' : ''}
                          </td>
                        })}

                      </tr>
                      <tr>
                        <th className="font-semibold text-[12px] lg:text-[16px] field-header p-[4px] lg:p-[12px]  border-[#dee2e6] border-t-[1px]">
                          Price (each)
                        </th>
                        <td className="item-price p-[0]  text-[14px] lg:text-[16px]  lg:p-[12px] border-[#dee2e6] border-t-[1px]">
                          {currencyNarrowSymbol}{parseFloat(price.amount).toFixed(2)}
                        </td>
                        {qtyPrices.map((item) => {
                          let newPrice = { ...price }
                          let amt = parseFloat(newPrice.amount)
                          amt = amt - (amt * parseFloat(item.value) / 100);
                          newPrice.amount = amt;
                          // newPrice.amount = calculatePriceIncludingTax(amt - (amt * parseFloat(item.value) / 100), countryCode);

                          return <td className="item-price  text-[14px] lg:text-[16px] p-[0] lg:p-[12px] border-[#dee2e6] border-t-[1px]">
                            {currencyNarrowSymbol}{(newPrice.amount.toFixed(2))}
                          </td>
                        })}
                      </tr>
                    </tbody></table>
                </div>}
                <Suspense fallback={<ProductForm tags={tags} tradeCustomer={tradeCustomer} countryCode={countryCode} priceScaleFound={priceScaleFound} qtyPrices={qtyPrices} variants={[]} />}>
                  <Await
                    errorElement="There was a problem loading related products"
                    resolve={variants}
                  >
                    {(resp) => (
                      <ProductForm countryCode={countryCode} tags={tags}
                        tradeCustomer={tradeCustomer}
                        priceScaleFound={priceScaleFound}
                        qtyPrices={qtyPrices}
                        variants={resp.product?.variants.nodes || []}
                      />
                    )}
                  </Await>
                </Suspense>

                {isLG && isLgFridge && <ul className='list-disc	text-[14px] ml-[17px] mb-8'>
                  <li>LG product warranty</li>
                  <li>6 month replacement refrigerator water filter</li>
                  <li>Easy installation</li>
                  <li>Correct filter design for your fridge model</li>
                  <li>Genuine LG Filter</li>
                  <li>Lowest Price Guarantee</li>
                  {countryCode != "NZD" && <li>Fast, Flat Rate Shipping</li>}
                </ul>}

              </div>

            </div>
          </div>
        </div>
        <ProductDescription compatibility={compatibility} product={product} />
        {/* <ExtraDetails product={product} /> */}
        {product.shortDescription?.value && (
          <div
            className="lg:px-0 px-4 short-description short-description-pdp w-full"
            dangerouslySetInnerHTML={{
              __html: product.shortDescription?.value,
            }}
          />
        )}

        <UpsellProducts product={product} customer={customer} />



      </div>


    </>
  );
}

export function ProductForm({ tradeCustomer, variants, priceScaleFound, qtyPrices, countryCode, tags }) {
  const { product, analytics, storeDomain } = useLoaderData();
  const [popup, showPopup] = useState(false);
  const [qty, setQty] = useState(1);
  const [addingProduct, setAddingProduct] = useState(false);
  const { addItemToCart } = useCart();

  // console.log("product",product)

  const stockLabel = productAvaibilityLabel({
    binNo: product?.bin_no?.value,
    qauntity: product?.selectedVariant?.quantityAvailable,
    active: product?.is_active_value?.value == "1" || product?.is_active_value?.value == 1 ? true : false,
    is_always_in_stock: product?.is_always_in_stock?.value == "1" || product?.is_always_in_stock?.value == 1 ? true : false
  })
  const { bin_no, qauntity, is_active_value } = product;
  const quantityAvailable = product?.selectedVariant?.quantityAvailable;
  let delivery = null;
  if (product?.delivery?.value) {
    delivery = product?.delivery?.value;
  }


  let { text, deliveryValue } = businessDays({
    binNo: product?.bin_no?.value,
    qauntity: product?.selectedVariant?.quantityAvailable,
    active: product?.is_active_value?.value == "1" || product?.is_active_value?.value == 1 ? true : false,
    delivery,
    is_always_in_stock: product?.is_always_in_stock?.value == "1" || product?.is_always_in_stock?.value == 1 ? true : false
  });

  let attributes = [];
  if (stockLabel == "Special Order") {
    attributes.push({
      key: "_special", value: "true"
    })
  }
  if (product?.parts?.value?.toLowerCase() == "pcb") {
    attributes.push({
      key: "_pcb", value: "true"
    })
  }
  if (!priceScaleFound && qtyPrices.length > 0) {
    const pricesAttr = qtyPrices.map((item) => {
      return {
        quantity: item.quantity,
        value: item.value.toString()
      }
    })
    attributes.push({
      key: "_qtyPrices", value: JSON.stringify(pricesAttr)
    })
  }

  /**
   * Likewise, we're defaulting to the first variant for purposes
   * of add to cart if there is none returned from the loader.
   * A developer can opt out of this, too.
   */
  const selectedVariant = product.selectedVariant;
  if (selectedVariant?.sku) {
    attributes.push({ key: "_sku", value: selectedVariant.sku })
  }
  const normalizedWeight = parseFloat(String(product?.weight?.value ?? '').replace(/[^0-9.]/g, ''));
  if (!Number.isNaN(normalizedWeight)) {
    attributes.push({ key: "_weight", value: normalizedWeight.toString() })
  }
  const isAustraliaOnly =
    product?.show_australia_only?.value === 'true' ||
    product?.show_australia_only?.value === true;
  if (isAustraliaOnly) {
    attributes.push({ key: "_au_only", value: "true" })
  }

  const isOutOfStock = !selectedVariant?.availableForSale;

  const isOnSale =
    selectedVariant?.price?.amount &&
    selectedVariant?.compareAtPrice?.amount &&
    selectedVariant?.price?.amount < selectedVariant?.compareAtPrice?.amount;

  const productAnalytics = {
    ...analytics.products[0],
    quantity: 1,
  };
  const alternate_products = product?.alternate_products?.value ? JSON.parse(product.alternate_products.value) : [];
  const alternate_products_sku = product?.alternate_products_sku?.value ? JSON.parse(product.alternate_products_sku.value) : [];

  const isLG = product?.vendor?.toLowerCase() == 'lg' ? true : false;
  let showFreeSHipping = tags.includes("free_shipping") && countryCode == "AUD" ? true : false;
  let lgItems = [
    "LG Authorised Distributor",
    "$12 flat rate shipping"
  ]
  if (tradeCustomer) {
    lgItems = [
      "LG Authorised Distributor",
    ]
  }
  // console.log("product",product)

  let isLgFridge = false;
  if (lgSKUS.includes(product?.selectedVariant?.sku)) {
    isLgFridge = true;
  }
  if (lgSKUS.includes(product?.selectedVariant?.sku) && countryCode == "NZD") {
    lgItems = [
      "LG Authorised Distributor",
    ]
  }
  // if(product.appliances?.value && product?.parts?.value){
  //   let appliances = JSON.parse(product.appliances?.value);
  //   let findItem = appliances.find((el)=> el == "Fridges & Freezers");
  //   if(findItem && product?.parts?.value == "Filter"){
  //     isLgFridge = true;
  //   }
  // }

  useEffect(() => {
    const handleScroll = () => {
      const normalButton = document.querySelector('.normal-btn');
      const mobileStickyButton = document.querySelector('.mobile-sticky-btn');

      if (normalButton && mobileStickyButton) {

        const found = elementInViewport(normalButton);
        if (found) {
          mobileStickyButton.style['opacity'] = "0";
          mobileStickyButton.style['z-index'] = "-1";
          // normalButton.style['opacity'] = "1";
          // normalButton.style['z-index'] = "100";
          document.body.classList.remove("body-float-button-not-exist")
        } else {
          mobileStickyButton.style['opacity'] = "1";
          mobileStickyButton.style['z-index'] = "100";
          // normalButton.style['opacity'] = "0";
          // normalButton.style['z-index'] = "-1";
          document.body.classList.add("body-float-button-not-exist")
        }
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      document.body.classList.remove("body-float-button-not-exist")
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  const add = async (data) => {

    setAddingProduct(true)
    const res = await addItemToCart(data);
    setAddingProduct(false)
    console.log("Res", res)
    try {
      gtag_report_conversion(product, selectedVariant)
    } catch (e) {

    }
  }
  // return null;
  return (
    <div className="mb-[15px]">
    {popup && <InStockPopup stockLabel={stockLabel} showPopup={showPopup} deliveryValue={deliveryValue} />}
    <div className="bg-[#e6e6e6] p-[15px]">
      {stockLabel == "No Longer Available" ?
        <div className={`text-[#00aeef] gap-[4px] availability flex flex-wrap ${alternate_products?.length > 0 && alternate_products_sku?.length > 0 ? '' : 'justify-center'}`}>

          {alternate_products?.length <= 0 && <div className="text-left w-full">
            <span className="text-black text font-bold text-[16px] block w-full OpenSansBold">
              {stockLabel}
            </span>
            <p className='text-[14px] text-[#254e93]'>This part has been discontinued by the supplier with no alternative available</p>
            {/* <p className="text-[14px] text-[#1e5097]">
              <span className="icon text-[1em] text-[#ff0000] mr-[2px]">
                <i className="fa fa-ban  text-red"></i>
              </span>
              <span onClick={() => showPopup(true)} className='hover:underline cursor-pointer'>Discontinued by supplier</span>
            </p> */}
          </div>}

          {alternate_products?.length > 0 && alternate_products_sku?.length > 0 && 
          <div>
            <p className='text-[15px] text-black font-bold'>This part number has been updated</p>
            {alternate_products?.length == 1 && alternate_products_sku?.length == 1 && <>
            <p className='text-[14px] text-black font-normal'>The current part number is <Link to={`/${alternate_products[0]}`} className="OpenSansBold text-[#254e93] font-normal hover:underline">{alternate_products_sku[0]}</Link></p>
          
              <div className='flex'>
            <Link className="text-[#254e93] text-[14px] w-full openSansBold cursor-pointer mt-2 text-center flex justify-start items-center"
                to={`/${alternate_products[0]}`}
                prefetch="intent"
              > 
              <span className='mr-2'>
              <svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" className='w-4 h-4' viewBox="0 0 640 640"><path d="M566.6 342.6C579.1 330.1 579.1 309.8 566.6 297.3L406.6 137.3C394.1 124.8 373.8 124.8 361.3 137.3C348.8 149.8 348.8 170.1 361.3 182.6L466.7 288L96 288C78.3 288 64 302.3 64 320C64 337.7 78.3 352 96 352L466.7 352L361.3 457.4C348.8 469.9 348.8 490.2 361.3 502.7C373.8 515.2 394.1 515.2 406.6 502.7L566.6 342.7z"/></svg>
              </span>
              See updated part
              
              </Link>
              </div>
              </> }
            {alternate_products?.length > 1 && <div className='w-full mt-4'>
              <h4 className='text-[15px] text-black font-bold'>Substitute Parts</h4>
              {alternate_products.map((item, i) => {
                let val = item.split('-');
                return <Link to={`/${item}`} className="block uppercase mb-2">{alternate_products_sku[i]}</Link>
              })}
            </div>}
          </div>}
        </div>
        :
        <>
          <div className="qty ">



          </div>

          <div className="mb-4 gap-4 flex text-[16px] justify-left  quantity-fields">
            <div className='bg-[#f8f8f8] flex justify-center items-center'>
              <div onClick={() => {
                let newValue = qty - 1;
                if (newValue > 0) {
                  setQty(newValue)
                }
              }} className='w-[32px] flex cursor-pointer justify-center border-0'>
                <svg width="18" height="2" viewBox="0 0 18 2" fill="none" className="w-2"><polygon id="Shape" fill="#000000" fill-rule="nonzero" points="0 0 0 2 18 2 18 0"></polygon></svg>
              </div>
              <input name="quantity" type='number' className='bg-[#f8f8f8] w-[32px] appearance-none text-center border-0 p-0 outline-none' value={qty} onChange={(e) => {
                const value = e.target.value;
                setQty(value ? parseInt(value) : 1);
              }} />
              <div onClick={() => {
                let newValue = qty + 1;
                setQty(newValue)
              }} className='w-[32px] flex justify-center cursor-pointer border-0'>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="w-2 fill-black"><polygon id="Shape" fill-rule="nonzero" points="8 0 8 8 0 8 0 10 8 10 8 18 10 18 10 10 18 10 18 8 10 8 10 0"></polygon></svg>
              </div>
            </div>

            <div className='normal-btn w-full'>

              {selectedVariant && (
                <>
                  {isOutOfStock ? (
                    <button className="bg-[#00aeef] text-white h-[40px] text-[15px] px-[24px]   w-full max-w-full rounded-[6px]" variant="secondary" disabled>
                      Sold out
                    </button>
                  ) : (
                    <button
                      onClick={() => add([
                        {
                          merchandiseId: selectedVariant.id,
                          quantity: qty,
                          attributes: attributes
                        }
                      ])}
                      className="bg-[#00aeef] text-white h-[40px] text-[15px] px-[24px] font-[600] w-full lg:max-w-full rounded-[6px]"
                      variant="primary"
                      data-test="add-to-cart"
                      analytics={
                        {
                          // products: [productAnalytics],
                          // totalValue: parseFloat(productAnalytics.price),
                        }
                      }
                    >
                      <span
                        as="span"
                        className="flex items-center justify-center gap-2"
                      >
                        <span>{addingProduct ? 'Adding...' : 'Add to Cart'}</span>
                      </span>
                    </button>
                  )}</>
              )}
            </div>
            <div className="mobile-sticky-btn fixed block lg:hidden bottom-0 left-0 right-0 bg-white">
              {selectedVariant && (
                <>
                  {isOutOfStock ? (
                    <button className="bg-[#00aeef] text-white h-[40px] text-[15px] px-[24px]   w-full max-w-[200px] rounded-[0]" variant="secondary" disabled>
                      Sold out
                    </button>
                  ) : (
                    <button
                      onClick={() => add([
                        {
                          merchandiseId: selectedVariant.id,
                          quantity: qty,
                          attributes: attributes
                        }
                      ])}
                      className="bg-[#00aeef] text-white h-[40px] text-[15px] px-[24px] font-[600] w-full lg:max-w-full rounded-[6px]"
                      variant="primary"
                      data-test="add-to-cart"
                      analytics={
                        {
                          // products: [productAnalytics],
                          // totalValue: parseFloat(productAnalytics.price),
                        }
                      }
                    >
                      <span
                        as="span"
                        className="flex items-center justify-center gap-2"
                      >
                        <span>{addingProduct ? 'Adding...' : 'Add to Cart'}</span>
                      </span>
                    </button>
                  )}</>
              )}
            </div>
          </div>
          {selectedVariant && (
            <div className="text-center grid items-stretch gap-2">

              {
                !isOutOfStock && <div className="text-[#00aeef] gap-[4px] availability flex justify-left">
                  <span className="icon mr-[8px]">
                    <i className="fa fa-check-circle"></i>
                  </span>
                  <div className="text-left">
                    <span className="text-black text text-[15px] block w-full font-bold">
                      {stockLabel}
                    </span>
                    <p onClick={() => showPopup(true)} className="text-[13px] text-[#1e5097] hover:underline cursor-pointer">
                      {text}
                    </p>
                  </div>
                </div>
              }

              {isLG && isLgFridge ? <>
                {lgItems.map((item => {
                  return <div className="text-[#00aeef] gap-[4px] availability flex justify-left w-[75%] lg:w-full">
                    <span className="icon mr-[8px]">
                      <i className="fa fa-check-circle"></i>
                    </span>
                    <span className="text-black text font-bold text-[14px]">
                      {item}
                    </span>
                  </div>
                }))} </>
                :
                <div className="text-[#00aeef] gap-[4px] availability flex justify-left w-[75%] lg:w-full">
                  <img
                    src="https://cdn.shopify.com/s/files/1/0799/5929/4245/files/delivery-icon-no-circle-blue.svg?v=1702320134"
                    className="icon mr-[2px] max-w-[20px]"
                  />
                  <span className="text-black font-bold text text-[15px]">
                    {showFreeSHipping ? <>Free Shipping</> : <>Fast Shipping</>}
                  </span>

                </div>
              }


            </div>
          )}
        </>}
    </div>
  </div>
  );
}

function ProductDescription({ product, compatibility }) {
  const [value, setValue] = useState(1);
  let models = [];
  let { descriptionHtml, specification } = product;
  // const suitsPattern = /SUITS[^<]*|MODELS[^<]*/gi;
  const suitsPattern = /SUITS(?!.*MODELS)[^<]*/gi;
  const matchedText = descriptionHtml.match(suitsPattern);
  // https://admin.shopify.com/store/statewide-appliances/products/9263945974053
  let modifiedDescriptionHtml = descriptionHtml;
  if (matchedText) {
    matchedText.forEach(text => {
      modifiedDescriptionHtml = modifiedDescriptionHtml.replace(text, '').trim();
    });
  }
  const modelsText = matchedText ? matchedText.join(' ') : '';
  if (product.models?.value) {
    models = JSON.parse(product.models?.value);
  }

  let weight = 0, depth = 0, width = 0, height = 0;
  if (product?.weight?.value) {
    weight = parseFloat(product?.weight?.value);
  }
  if (product?.weight?.value) {
    weight = parseFloat(product?.weight?.value);
  }
  if (product?.depth?.value) {
    depth = parseFloat(product?.depth?.value);
  }
  if (product?.height?.value) {
    height = parseFloat(product?.height?.value);
  }
  if (product?.width?.value) {
    width = parseFloat(product?.width?.value);
  }
  const modelTextExist = (models || []).find((item) => modelsText.includes(item))

  // parseFloat(product?.depth?.value) > 0 || parseFloat(product?.height?.value) > 0 || parseFloat(product?.weight?.value) > 0
  return (
    <div className="product-description px-[15px]">
      <ul className="pb-[10px]">

        {(modifiedDescriptionHtml || compatibility) && <li

          className={`product-tab pb-[12px] mb-[12px] border-b-[2px] border-[#ddd]  text-[#000] text-[1.1rem] ${value == 1 && ' active-tab'
            }`}
        >
          <h2 onClick={() => setValue(value == 1 ? 0 : 1)} className='w-full cursor-pointer flex items-center gap-4'>
            {value == 1 ? <IconUp width='20px' height='20px' /> : <IconDown width='20px' height='20px' />}
            Product description</h2>

          <>
          {compatibility && <div className='text-[14px] leading-[24px] font-[400] mt-4 mb-2 short-description w-full'>
              <h4 className='font-bold flex items-center gap-2 text-[#1e5097] text-[16px]'>
                <div className='text-white rounded-full flex items-center justify-center'>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="20" height="20">
  <circle cx="50" cy="50" r="48" fill="#e60000"/>
  <path d="
    M50 22
    C56 22, 58 28, 56 40
    L53 64
    C52.5 68, 47.5 68, 47 64
    L44 40
    C42 28, 44 22, 50 22
    Z
  " fill="white"/>
  <circle cx="50" cy="74" r="5" fill="white"/>
</svg>
                </div>
                PLEASE CHECK PART COMPATIBILITY </h4>
              <div className='text-[16px]'>This part varies based on your appliance's specific details (serial number, manufacturing date, etc).
              Please <Link to="/contactus" className='text-black underline'>contact</Link> our Customer Care team before ordering - we'll help match the correct part to your appliance.</div>
            </div>}
            {value == 1 && (
              <div
                className="text-[16px] leading-[24px] font-[400] mt-4 mb-2 short-description short-description-pdp w-full"
                dangerouslySetInnerHTML={{ __html: modifiedDescriptionHtml }}
              />
            )}
          </>

        </li>}


        {(models.length > 0 || modelsText) && <li className={`product-tab pb-[12px] mb-[12px] border-b-[2px] border-[#ddd] cusron-pointer text-[#000] text-[1.1rem] ${value == 2 && ' active-tab'}`}>
          <h2 onClick={() => setValue(value == 2 ? 0 : 2)} className='w-full flex cursor-pointer items-center gap-4'>
            {value == 2 ? <IconUp width='20px' height='20px' /> : <IconDown width='20px' height='20px' />}
            Models this part suits</h2>

          {value == 2 && (
            <div className="flex flex-wrap mt-4 mb-2">
              {modelsText && !modelTextExist && models?.length <= 0 && (
                <div className="text-[14px] leading-[24px] font-[400] block w-full my-1 lg:my-0">
                  {modelsText}
                </div>
              )}
              {(models || [])
                .slice() // Create a shallow copy to avoid mutating the original array
                .sort((a, b) => a.localeCompare(b)) // Sort alphabetically
                .map((item) => {
                  return (
                    <span className="text-[14px] leading-[24px] font-[400] block w-full my-1 lg:my-0 lg:w-[33.333%]">
                      {item}
                    </span>
                  );
                })}
            </div>
          )}
        </li>}

        <li className={`product-tab pb-[12px] mb-[12px] border-b-[2px] border-[#ddd] cusron-pointer text-[#000] text-[1.1rem] ${value == 3 && ' active-tab'}`}>
          <h2 onClick={() => setValue(value == 3 ? 0 : 3)} className='w-full flex cursor-pointer items-center gap-4'>
            {value == 3 ? <IconUp width='20px' height='20px' /> : <IconDown width='20px' height='20px' />}
            Specifications</h2>

          {value == 3 && (
            <div className="text-[14px] leading-[24px] font-[400] mt-4 mb-2 w-full">
              {weight > 0 &&
                <div className='mb-4'>
                  <p className='mt-0 mb-[4px]'>APPROXIMATE PART UNPACKED WEIGHT (kilograms)</p>
                  <p>Weight: {parseFloat(product?.weight?.value)} Kg</p>
                </div>}
              {(depth > 0 || height > 0 || width > 0) &&
                <div className='mb-4'>
                  <p>APPROXIMATE PART UNPACKED SIZE MEASUREMENTS</p>
                  <>
                    {width > 0 && <p>Width: {product?.width?.value} mm</p>}
                    {height > 0 && <p>Height: {product?.height?.value} mm</p>}
                    {depth > 0 && <p>Depth: {product?.depth?.value} mm</p>}
                  </>
                </div>}
              <p>SHIPPING COST is calculated on SHIPPING WEIGHT using packed weight (kilograms) and cubic dimension size measurement formula</p>
            </div>
          )}
        </li>
      </ul>

    </div>
  );
}



const InStockPopup = ({ showPopup, stockLabel, deliveryValue }) => {
  return (
    <>
      <div onClick={() => showPopup(false)} className='bg-black/[.6] z-[1000]  in-stock-popup fixed top-0 bottom-0 left-0 right-0 h-full w-full bg'>
      </div>
      <div className='in-stock-popup-box z-[1005] fixed top-1/2 left-1/2  -translate-y-1/2 -translate-x-1/2 w-[100%] max-w-[500px] bg-white p-4 rounded-[5px]'>
        <button onClick={() => showPopup(false)} type="button" className="absolute right-4 top-2 cursor-pointer" data-dismiss="modal" aria-label="Close"> <span className='font-bold' aria-hidden="true">×</span> </button>
        {stockLabel == "In Stock" &&
          <div className='flex mb-4'>
            <p className='tracking-[-0.5px] w-[100px] text-[#1e5097] text-[15px] font-bold'>In Stock</p>
            <p className='tracking-[-0.5px] in-stock-popup-text text-[15px]'>This item is typically held in stock and will usually be despatched within {deliveryValue} business days of your order being placed.</p>
          </div>}
        {stockLabel == "Special Order" &&
          <div className='flex mb-4'>
            <p className='tracking-[-0.5px] w-[100px] text-[#1e5097] text-[15px] openSansBold font-bold'>Special Order</p>
            <p className='tracking-[-0.5px] in-stock-popup-text text-[15px]'>This item is ordered from our supplier and is usually despatched within {deliveryValue} business days of your order being placed. Supplier delays may occasionally extend this timeframe.<span className='block'>Despatch time is <b className='openSansBold'>additional</b> to shipping time. Your total delivery time includes both the time to despatch <b className='openSansBold'>and</b> ship your order.</span></p>
          </div>}
        {stockLabel == "No Longer Available" &&
          <div className='flex'>
            <p className='tracking-[-0.5px] w-[100px] text-[#1e5097] text-[15px] font-bold'>No Longer Available</p>
            <p className='tracking-[-0.5px] in-stock-popup-text text-[15px]'>This item is no longer available from our suppliers. If a substitute part is available this will be indicated in the grey product box.
            </p>
          </div>}
      </div>
    </>

  )
}
export { ProductPage };
