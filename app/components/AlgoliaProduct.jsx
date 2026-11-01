import clsx from 'clsx';
import { flattenConnection, Image, Money, useMoney } from '@shopify/hydrogen';
import { Text, Link, AddToCartButton, Button } from '~/components';
import { isDiscounted, isNewArrival, productAvaibilityLabel, businessDays } from '~/lib/utils';
import { getProductPlaceholder } from '~/lib/placeholders';
import {countries} from '~/data/countries';
import { useNavigate } from 'react-router';
import { calculatePriceIncludingTax, multiBuyCalc } from '../lib/utils';
import { useCart } from '~/components/cartContext';
import { useState } from 'react';
import { gtag_report_conversion } from './KlaviyoEvent';
import { isSpecialUser } from '~/lib/specialUserHelper';
export function AlgoliaProduct({
  product,
  label,
  className,
  loading,
  onClick,
  shop,
  quickAdd,showPopup, customer, selectedLocale, addToCart
}) {

  // console.log("product",product)
  let cardLabel;
  const cardProduct = product?.variants ? product : getProductPlaceholder();
  if (!cardProduct?.variants?.nodes?.length) return null;
  const { addItemToCart } = useCart();
const [addingProduct,setAddingProduct] = useState(false);
//   const firstVariant = flattenConnection(cardProduct.variants)[0];

// console.log("product",product)
//   if (!firstVariant) return null;
  let { image, price, compareAtPrice } = product;
  if(product?.meta?.custom?.first_overlay_image?.url){
    image = product?.meta?.custom?.first_overlay_image?.url;
  }
// console.log("product",product)
  if (label) {
    cardLabel = label;
  } else if (isDiscounted(price, compareAtPrice)) {
    cardLabel = 'Sale';
  } else if (isNewArrival(product.publishedAt)) {
    cardLabel = 'New';
  }
  const stockLabel=productAvaibilityLabel({
    binNo:product?.meta?.product_extended_property?.bin_no,
    qauntity:product?.inventory_quantity,
    active:product?.meta?.product_extended_property?.is_active_value == "1" || product?.meta?.product_extended_property?.is_active_value == 1 ? true : false,
    is_always_in_stock: product?.meta?.product_extended_property?.is_always_in_stock == "1" || product?.meta?.product_extended_property?.is_always_in_stock == 1 ? true : false
  })
  let altProduct = [];
  // let altProductSku = [];

  if(product?.meta?.product_extended_property?.alternate_products || product?.meta?.product_extended_property?.alternate_products_sku){
    altProduct = JSON.parse(product?.meta?.product_extended_property?.alternate_products);
    // altProductSku = JSON.parse(product?.meta?.product_extended_property?.alternate_products_sku);
  }
  const productAnalytics = {
    productGid: product.id,
    // variantGid: firstVariant.id,
    name: product.title,
    // variantName: firstVariant.title,
    brand: product.vendor,
    price: product.price,
    quantity: 1,
  };
  let priceScale = [];
  let priceScaleFound = false;
  let isSpecialUserExists = isSpecialUser();

  if(product?.meta?.product_extended_property?.product_prices){
    priceScale = product?.meta?.product_extended_property?.product_prices
  } 

  if((customer?.scale?.value || isSpecialUserExists) && customer && priceScale.length > 0){
    let cScale = null;
    if(customer?.scale?.value){
      cScale = customer?.scale?.value?.split(' ')[0];
    }
    if(!cScale && isSpecialUserExists){
      cScale = 2;
    }
    if(cScale){
      cScale = parseInt(cScale);
      if(isSpecialUserExists && (!cScale || cScale <= 1)){
        cScale = 2;
      }
      if(cScale > 1){
        if(cScale == 4){
          cScale = 5
        }else if(cScale == 5){
          cScale = 6
        }else if(cScale == 6){
          cScale = 7
        }else if(cScale == 7){
          cScale = 9
        }else if(cScale == 8){
          cScale = 10
        }
        if(isSpecialUserExists && cScale < 2){
          cScale = 2;
        }
        let item = priceScale.find((item)=> item.scaleId == cScale);
        if(item){
          priceScaleFound = true;
          price =  item.price?.toFixed(2).toString();
        }
      }
    }
  }
  
  let multiBuyPrice = [];
  if(product?.meta?.sybiz_info?.special_price_details){
    multiBuyPrice = product?.meta?.sybiz_info?.special_price_details
  }
  let shopMultiBuy = shop?.specialPrice?.value ? JSON.parse(shop.specialPrice?.value) : []
  
  let findItem = multiBuyCalc(multiBuyPrice, shopMultiBuy) 
  
 
  let attributes = [];
  if(stockLabel=="Special Order"){
    attributes.push({
     key:"_special", value: "true"
    })
  }
  if(product?.meta?.product_extended_property?.part_type?.toLowerCase() == "pcb"){
    attributes.push({
      key:"_pcb", value: "true"
    })
  }
  if(product?.sku){
    attributes.push({
      key:"_sku",  value: product?.sku
     })
  }
  const partWeightRaw =
    product?.weight ??
    (typeof product?.grams === 'number' ? product.grams / 1000 : null);
  const normalizedWeight = parseFloat(String(partWeightRaw ?? '').replace(/[^0-9.]/g, ''));
  if (!Number.isNaN(normalizedWeight)) {
    attributes.push({
      key: "_weight", value: normalizedWeight.toString()
    })
  }
  const isAustraliaOnly =
    product?.meta?.product_extended_property?.australia_only === 'true' ||
    product?.meta?.product_extended_property?.australia_only === true;
  if (isAustraliaOnly) {
    attributes.push({
      key: "_au_only", value: "true"
    })
  }
  let countryCode = selectedLocale?.currency || 'AUD';
  if(!product?.shopify){
    price = calculatePriceIncludingTax(price,countryCode);
  }else{
    price = parseFloat(price);
  }
  //   if(Currency?.convert && countryCode && countryCode != "AUD"){
  //     price = Currency.convert(price,'AUD',countryCode)
  //     price = Math.round(price)
  // }

  if(!priceScaleFound && findItem){
    if(findItem?.length > 0){
      attributes.push({
        key:"_qtyPrices",  value: JSON.stringify({discountDetails:findItem})
       })

      //  take last pricve
      let lastPrice = findItem[findItem?.length - 1]
      let amt = parseFloat(product.price)
      amt= amt - (amt * parseFloat(lastPrice.value) / 100);
      if(!product?.shopify){
        price = calculatePriceIncludingTax(amt,countryCode);
      }else{
        price = parseFloat(amt);
      }
    }
  }
  
  const add = async(data) =>{
    setAddingProduct(true)
    
    const res = await addItemToCart([
      {
        quantity: 1,
        merchandiseId: `gid://shopify/ProductVariant/${product.objectID}`,
        attributes:attributes
      },
    ]);
    setAddingProduct(false)
    gtag_report_conversion({...product, id:product.id.toString(), productType:product?.product_type},{
      sku: product?.sku,
      id : product.objectID.toString(),
      title: product?.variant_title,
      price: {
        currencyCode:countryCode,
        amount: product.price,
      }
     })
  }
  // console.log("product",product)
  // if(product?.sku == "AJR73482513-4404"){
  //   console.log("findItem",findItem)
  //   console.log("findItem",product,multiBuyPrice, shopMultiBuy)
  //   // debugger;
  // }
  let compatibility = product?.meta?.custom?.compatibility == "true" || product?.meta?.custom?.compatibility == true ? true : false;
  return (
    <div className="border-[1px] border-[#b0b0b0] flex flex-col gap-2 justify-between w-]">
      <Link
        // onClick={onClick}
        to={`/${product.handle}`}
        prefetch="intent"
      >
        <div>
          <div className="item-image relative">
            {compatibility && <div className='absolute top-0 left-0 bg-[#00aeef] text-white px-[5px] ml-[4px] mt-[4px] font-bold lg:text-[12px] text-[8px] py-[4px] z-[2]'>
              Check compatibility
            </div>}
            {!compatibility &&findItem?.length > 0 && !priceScaleFound && 
            <div className='absolute top-0 left-0 bg-[#1e5097] text-white px-[5px] ml-[4px] mt-[4px] font-bold lg:text-[12px] text-[8px] py-[4px] z-[1]'>
              Multi-buy discount
            </div>}
            {image ? (
              <Image
                className="object-contain h-full w-full fadeIn"
                sizes="(min-width: 64em) 25vw, (min-width: 48em) 30vw, 45vw"
                src={image}
                alt={image.altText || `Picture of ${product.title}`}
                loading={loading}
                fetchPriority={loading == 'eager' ? 'high' : 'low'}
              />
            ) : 
            <Image
                className="object-contain h-full w-full fadeIn"
                sizes="(min-width: 64em) 25vw, (min-width: 48em) 30vw, 45vw"
                src={"https://cdn.shopify.com/s/files/1/0799/5929/4245/files/Image_coming_soon_Website.webp?v=1724582291"}
                alt={`${product.title}`}
                loading={loading}
              />
            
            }
            <Text
              as="label"
              size="fine"
              className="absolute top-0 right-0 m-4 text-right text-notice"
            >
              {cardLabel}
            </Text>

          </div>
          <div>
          <p
            className="hover:underline px-[4px] lg:px-4 font-bold mb-[4px] w-full text-[12.8px] text-left"
            as="h3"
          >{product.sku}</p>
          <p
            className="hover:underline break-words px-[4px] uppercase lg:px-4 w-full  text-[11px] lg:text-[12.8px] text-left text-black"
            as="h3"
          >
            {product.title}
          </p>
          </div>
        </div>
      </Link>
      <div className=" pt-[5px] min-h-[95pxnv] grid">
            
            {stockLabel  != "No Longer Available" ? <div className="flex gap-4">
              <div className="w-full flex gap-4 xs justify-start px-[4px] lg:px-4  font-bold text-[16px]">
                {/* <Money withoutTrailingZeros data={price} /> */}
                { findItem?.length > 0 && !priceScaleFound && 'From '}${price?.toFixed(2)} {selectedLocale?.currency=="NZD"?"NZ":""}
                {/* {isDiscounted(price, compareAtPrice) && (
                  <CompareAtPrice
                    className={'opacity-50'}
                    data={compareAtPrice}
                  />
                )} */}
              </div>
            </div> : <div className="flex gap-4"></div>}
            {
              stockLabel  == "No Longer Available" ?
              <div  className='text-[#00aeef] gap-[4px] cursor-pointer availability flex justify-start flex-wrap'>
                {/* {altProduct.length <= 0 && <div className='flex lg:px-4 w-full'>
                  <span onClick={()=> showPopup(true)} className='icon text-[red]'><i className="fa fa-ban"></i></span>
                  <div onClick={()=> showPopup(true)} className='status-label relative ml-1 text font-bold text-[14px]'>
                    {stockLabel}
                    <div className='text-[#00aeef] absolute left-[100%] font-bold py-[2px] rounded-[5px] bg-white z-[1] px-[5px] availability-info-tooltip'>
                      <div className="availability-info-point-inner"></div>
                      <div className="availability-info-text text-[8.4px]">
                        <a rel="nofollow" onClick={()=> showPopup(true)} className="text-[#00aeef] availability-info-link" >What does this mean?</a>
                      </div>
                    </div>  
                  </div>
                </div>} */}
               
                {altProduct.length > 0 && stockLabel  == "No Longer Available" ? 
                <>

                <div class="text-[#00aeef] openSansBold text-[14px] w-full text-center ">Part number updated</div>
                <Link className="hover:bg-[#0069d9] bg-[#00aeef]  text-white h-[40px] text-[15px] px-[24px] w-full cursor-pointer transition delay-150 duration-300  w-full add-to-cart text-[10px] py-[6px] px-[2px] text-center flex justify-center items-center"
                  to={`/${altProduct[0]}`}
                  prefetch="intent"
                > 
                See updated part
                </Link>
                </>
              :
              <span onClick={()=> showPopup(true)} className='h-[40px] openSansBold text-[15px] bg-[#f1f2f2] text-[#1e5097] cursor-pointer hover:underline transition delay-150 duration-300  w-full add-to-cart py-[6px] px-[2px] text-center flex justify-center items-center'>
                Discontinued by supplier
                </span>
              }
              </div>
              :<div onClick={()=> showPopup(true)} className='text-[#00aeef]  px-[4px] lg:px-4  gap-[4px] cursor-pointer availability flex justify-start'>
                <span className='icon relative top-[-1px]'><i className="fa fa-check-circle"></i></span>
                <div className='text font-bold text-[14px] relative status-label'>
                  {stockLabel}
                  <div className='text-[#00aeef] absolute left-[100%] font-bold py-[2px] rounded-[5px] bg-white z-[1] px-[5px] availability-info-tooltip'>
                      <div className="availability-info-point-inner"></div>
                      <div className="availability-info-text text-[8.4px]">
                        <a rel="nofollow" onClick={()=> showPopup(true)} className="text-[#00aeef] availability-info-link" >What does this mean?</a>
                      </div>
                </div>
                </div>
               
              </div>
            }

            <div className='product-form justify-around flex'>
              <div className="qty hidden">
                <div className="hidden lg:flex text-[16px] items-center quantity-fields">
                  <i className="fa fa-minus qty-more"></i>
                  <input type="text" className="text-[14px] border-[1px] border-[#6b7280] text-center w-[50px] mx-[7px] p-[0] min-h-[25px] quantity-field" defaultValue="1" id="QuantityField-1210253" />
                  <i className="fa fa-plus qty-less"></i>
                </div>
                <select defaultValue={1} className='lg:hidden text-center w-[50px] p-[0]'>
                  {new Array(10).fill(undefined).map((val,i)=> <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              
              <div className={`w-full add-to-cart-btn ${product?.inventory_available && stockLabel  != "No Longer Available" ? "" : " hidden"}`}>
              
              {(findItem?.length > 0 && !priceScaleFound) || compatibility ? 
              <Link className="bg-[#00aeef] text-white h-[40px] text-[15px] px-[24px] font-[600] w-full text-white transition delay-150 duration-300  w-full add-to-cart text-[10px] hover:bg-[#0069d9] bg-[#00aeef] py-[6px] px-[12px] text-center flex justify-center items-center" to={`/${product.handle}`}>More info</Link>
              :
              <button
              onClick={add}
              variant="secondary"
              className="text-white transition delay-150 duration-300  w-full add-to-cart text-[10px] hover:bg-[#0069d9] bg-[#00aeef] py-[6px] px-[12px] bg-[#00aeef] text-white h-[40px] text-[15px] px-[24px] font-[600] w-full"
              analytics={{
                products: [productAnalytics],
                totalValue: parseFloat(productAnalytics.price),
              }}
            >
                {addingProduct ? 'Adding...' : 'Add to Cart'}
            </button>}

              </div>
            </div>
          </div>
      
     
    </div>
  );
}

function CompareAtPrice({ data, className }) {
  const { currencyNarrowSymbol, withoutTrailingZerosAndCurrency } =
    useMoney(data);

  const styles = clsx('strike', className);

  return (
    <span className={styles}>
      {currencyNarrowSymbol}
      {withoutTrailingZerosAndCurrency}
    </span>
  );
}