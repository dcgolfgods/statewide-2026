import {ProductCard, Section} from '~/components';
import { AlgoliaProduct } from './AlgoliaProduct';
import { useEffect, useState } from 'react';
import { getPricesData } from '~/lib/utils';
const mockProducts = {
  nodes: new Array(12).fill(''),
};
import {useMatches} from 'react-router';

export function ProductSwimlane({
  title = 'Featured Products',
  products = mockProducts,
  count = 12,
  customer,
  numRelatedProducts = 4,
  ...props
}) {
  const [root] = useMatches();
  const selectedLocale = root.data?.selectedLocale ?? DEFAULT_LOCALE;
  const [qtyPrices, setQtyPrices] = useState([])
  const getData = async () =>{
    let allSku = products?.nodes?.map((item)=> item.sku);
    let priceData = await getPricesData(allSku, customer);
    setQtyPrices(priceData);
  }
  useEffect(()=>{
    getData()
  },[])
  if (!products) {
    return null;
  }
  
  return (
    <div  heading={title} {...props}>
            <h4 className='text-[#1e5097] mb-[32px] w-full text-[18px] font-bold'>You may also like</h4>

      <div className={`grid grid-cols-2 gap-4 ${numRelatedProducts == 2 ? 'md:grid-cols-2':'md:grid-cols-4'}`}>
        {products?.nodes?.slice(0, numRelatedProducts)?.map((product) => {
          
          if (product) {
            let vid = product?.variants?.nodes[0]?.id;
            if(vid){
              vid = vid.split('/');
              if(vid.length > 0){
                vid = vid[vid.length -1]
              }
            }
            let algoliaProduct = {
              ...product,
              shopify: true,
              image: product?.variants?.nodes[0].image?.url || product?.featuredImage?.url,
              price: product?.variants?.nodes[0].price?.amount,
              currencyCode:product?.variants?.nodes[0].price?.currencyCode || "AUD",
              inventory_quantity: product?.variants?.nodes[0]?.availableForSale ? 1 : 0,
              inventory_available: product?.variants?.nodes[0]?.availableForSale ? 1 : 0,
              objectID: vid,
              sku: product?.variants?.nodes[0]?.sku,
              meta: {
                product_extended_property: {
                  is_always_in_stock: product?.is_always_in_stock?.value,
                  bin_no: product?.bin_no?.value,
                  is_active_value: product?.is_active_value?.value == "1" || product?.is_active_value?.value == 1 ? true : false,
                }
              }
            }
            // algoliaProduct['meta']['product_extended_property']['bin_no'] =  product?.bin_no?.value;
            // algoliaProduct['meta']['product_extended_property']['active'] =  product?.bin_no?.is_active;
            return (
              <AlgoliaProduct
                qtyPrices={qtyPrices}
                customer={customer}
                product={algoliaProduct}
                key={algoliaProduct.id}
                className="snap-start w-80"
              />
            );
          } else {
            return null;
          }
        })}
      </div>
    </div>
  );
}
