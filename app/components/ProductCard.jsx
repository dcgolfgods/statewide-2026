import clsx from 'clsx';
import { flattenConnection, Image, Money, useMoney } from '@shopify/hydrogen';
import { Text, Link, AddToCartButton, Button } from '~/components';
import { isDiscounted, isNewArrival } from '~/lib/utils';
import { getProductPlaceholder } from '~/lib/placeholders';

export function ProductCard({
  product,
  label,
  className,
  loading,
  onClick,
  quickAdd,
}) {
  let cardLabel;
  const cardProduct = product?.variants ? product : getProductPlaceholder();
  if (!cardProduct?.variants?.nodes?.length) return null;

  const firstVariant = flattenConnection(cardProduct.variants)[0];

  if (!firstVariant) return null;
  const { image, price, compareAtPrice } = firstVariant;

  if (label) {
    cardLabel = label;
  } else if (isDiscounted(price, compareAtPrice)) {
    cardLabel = 'Sale';
  } else if (isNewArrival(product.publishedAt)) {
    cardLabel = 'New';
  }

  const productAnalytics = {
    productGid: product.id,
    variantGid: firstVariant.id,
    name: product.title,
    variantName: firstVariant.title,
    brand: product.vendor,
    price: firstVariant.price.amount,
    quantity: 1,
  };

  return (
    <div className="border-[1px] border-[#b0b0b0] flex flex-col gap-2">
      <Link
        onClick={onClick}
        to={`/${product.handle}`}
        prefetch="intent"
      >
        <div className={clsx('grid gap-4', className)}>
          <div className="card-image h-[150px]">
            {image && (
              <Image
                className="object-cover h-full w-full fadeIn"
                sizes="(min-width: 64em) 25vw, (min-width: 48em) 30vw, 45vw"
                data={image}
                alt={image.altText || `Picture of ${product.title}`}
                loading={loading}
              />
            )}
            <Text
              as="label"
              size="fine"
              className="absolute top-0 right-0 m-4 text-right text-notice"
            >
              {cardLabel}
            </Text>

          </div>
          <p
            className="px-[3px] w-full text-[12.8px] text-center"
            as="h3"
          >
            {product.title}
          </p>
         
        </div>
      </Link>
      <div className="p-[5px] min-h-[95pxnv] grid gap-1">
            <div className='text-[#00aeef] gap-[4px] availability flex justify-center'>
              <span className='icon '><i className="fa fa-check-circle"></i></span>
              <span className='text font-bold text-[14px]'>In Stock</span>
            </div>
            <div className="flex gap-4">
              <div className="w-full flex gap-4 justify-start font-bold text-[16px]">
                <Money withoutTrailingZeros data={price} />
                {isDiscounted(price, compareAtPrice) && (
                  <CompareAtPrice
                    className={'opacity-50'}
                    data={compareAtPrice}
                  />
                )}
              </div>
            </div>
            <div className='product-form justify-around flex'>
              <div className="qty hidden">
                <div className="hiddenlg:flex text-[16px] items-center quantity-fields">
                  <i className="fa fa-minus qty-more"></i>
                  <input type="text" className="text-[14px] border-[1px] border-[#6b7280] text-center w-[50px] mx-[7px] p-[0] min-h-[25px] quantity-field" defaultValue="1" id="QuantityField-1210253" />
                  <i className="fa fa-plus qty-less"></i>
                </div>
                <select defaultValue={1} className='lg:hidden text-center w-[50px] p-[0]'>
                  {new Array(10).fill(undefined).map((val,i)=> <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div className='w-[45%] '>
              {firstVariant.availableForSale ? 
              <AddToCartButton
              lines={[
                {
                  quantity: 1,
                  merchandiseId: firstVariant.id,
                  attributes:[
                    {key:"_sku",value:firstVariant.sku},
                    ...(
                      product?.show_australia_only?.value === 'true' ||
                      product?.show_australia_only?.value === true
                        ? [{key:"_au_only", value:"true"}]
                        : []
                    ),
                  ]
                },
              ]}
              variant="secondary"
              className="text-white add-to-cart text-[10px] bg-[#00aeef] py-[6px] px-[12px]"
              analytics={{
                products: [productAnalytics],
                totalValue: parseFloat(productAnalytics.price),
              }}
            >
                Add to Cart
            </AddToCartButton>
              : 
              <button className='text-white add-to-cart text-[10px] bg-[#00aeef] py-[6px] px-[12px] disabled' disabled>Soldout</button>
              }</div>
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
