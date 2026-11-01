import clsx from 'clsx';
import {useParams, Form, Await, useMatches} from 'react-router';
import {useEffect, useRef, useState} from 'react';
import {useScroll} from 'react-use';
import {flattenConnection, CartForm, Image, Money, useMoney} from '@shopify/hydrogen';
import { DEFAULT_LOCALE } from '../lib/utils';
import { CartProvider, useCart } from '~/components/cartContext';

import {
  Button,
  IconClose,
  IconRemove,
  Text,
  Link,
  FeaturedProducts,
} from '~/components';
import {getInputStyleClasses} from '~/lib/utils';

export function Cart({layout, onClose}) {
  const { cart } = useCart();

  const linesCount = Boolean(cart?.lines?.nodes?.length || 0);
  const [root] = useMatches();
  const selectedLocale = root.data?.selectedLocale ?? DEFAULT_LOCALE;

  return (
    <>
      <CartEmpty hidden={linesCount} onClose={onClose} layout={layout} />
      <CartDetails selectedLocale={selectedLocale} cart={cart} layout={layout} />
    </>
  );
}

export function CartDetails({layout, cart, selectedLocale}) {
  // @todo: get optimistic cart cost
  

  const cartHasItems = !!cart && cart.totalQuantity > 0;
  const container = {
    drawer: 'grid grid-cols-1 h-screen-no-nav grid-rows-[1fr_auto]',
    page: 'w-full pb-12 grid md:grid-cols-2 md:items-start gap-8 md:gap-8 lg:gap-12',
  };
  let countryCode = selectedLocale?.currency || 'AUD';

  return (
    <div className="max-w-[1200px] flex flex-wrap mx-auto px-4 w-full">
      <CartLines countryCode={countryCode} lines={cart?.lines} layout={layout} />
      {cartHasItems && (
        <CartSummary countryCode={countryCode}  cart={cart} cost={cart.cost} layout={layout}>
          <CartCheckoutActions checkoutUrl={cart.checkoutUrl} />
        </CartSummary>
      )}
    </div>
  );
}

/**
 * Temporary discount UI
 * @param discountCodes the current discount codes applied to the cart
 * @todo rework when a design is ready
 */
function CartDiscounts({discountCodes}) {
  const codes =
    discountCodes
      ?.filter((discount) => discount.applicable)
      ?.map(({code}) => code) || [];

  return (
    <>
      {/* Have existing discount, display it with a remove option */}
      <dl className={codes && codes.length !== 0 ? 'grid' : 'hidden'}>
        <div className="flex items-center justify-between font-medium">
          <Text as="dt">Discount(s)</Text>
          <div className="flex items-center justify-between">
            <UpdateDiscountForm>
              <button>
                <IconRemove
                  aria-hidden="true"
                  style={{height: 18, marginRight: 4}}
                />
              </button>
            </UpdateDiscountForm>
            <Text as="dd">{codes?.join(', ')}</Text>
          </div>
        </div>
      </dl>

      {/* Show an input to apply a discount */}
      <UpdateDiscountForm discountCodes={codes}>
        <div
          className={clsx(
            'flex',
            'items-center gap-4 justify-between text-copy',
          )}
        >
          <input
            className={getInputStyleClasses()}
            type="text"
            name="discountCode"
            placeholder="Discount code"
          />
          <button className="flex justify-end font-medium whitespace-nowrap">
            Apply Discount
          </button>
        </div>
      </UpdateDiscountForm>
    </>
  );
}

function UpdateDiscountForm({discountCodes, children}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{
        discountCodes: discountCodes || [],
      }}
    >
      {children}
    </CartForm>
  );
}

function CartLines({layout = 'drawer', lines: cartLines, countryCode}) {
  
  const currentLines = cartLines ? flattenConnection(cartLines) : [];
  const scrollRef = useRef(null);
  const {y} = useScroll(scrollRef);

  const className = clsx([
    y > 0 ? 'border-t' : '',
    layout === 'page'
      ? 'grow md:translate-y-4'
      : 'px-6 pb-6 sm-max:pt-2 overflow-auto transition md:px-12',
  ]);

  return (
    <section
      ref={scrollRef}
      aria-labelledby="cart-contents"
      className={"lg:w-[65%] w-full lg:pr-8 lg:border-r-[1px] lg:border-[#ccc]" }
    >
      <ul className="grid gap-6 md:gap-10">
        {currentLines.map((line) => (
          <CartLineItem countryCode={countryCode} key={line.id} item={line} />
        ))}
      </ul>
    </section>
  );
}

function CartCheckoutActions({checkoutUrl}) {
  if (!checkoutUrl) return null;

  return (
    <div className="flex flex-col mt-2">
      <a href={checkoutUrl} target="_self">
        <Button as="span" width="full">
          Continue to Checkout
        </Button>
      </a>
      {/* @todo: <CartShopPayButton cart={cart} /> */}
    </div>
  );
}

function CartSummary({cart, countryCode, cost, layout, children = null}) {
  const summary = {
    drawer: 'grid gap-4 p-6 border-t md:px-12',
    page: 'sticky top-nav grid gap-6 p-4 md:px-6 md:translate-y-4 bg-primary/5 rounded-sm w-full',
  };
  let { currencyNarrowSymbol: subtotalSymbol, amount: subTotalAmt } = useMoney(cart.cost?.subtotalAmount);

  return (
    <section aria-labelledby="summary-heading" className={"w-full lg:w-[35%] lg:pt:0 pt-[20px] lg:pl-8"}>
     <div className='total-price'>
                    <div className='flex items-center justify-between mb-4'>
                        <div>
                            <h5 className='text-[#2C4F92] font-bold text-[18px]'>
                            Subtotal:
                            </h5>
                            <h6 className='text-[12px] text-[#2C4F92] font-normal'>Excludes delivery</h6>
                        </div>
                        
                        <h5 className='text-[#2C4F92] font-bold text-[18px]'>{subtotalSymbol}{subTotalAmt} {countryCode=="NZD"?"NZ":""}</h5>
                    </div>
                </div>
                <a href={cart.checkoutUrl} target="_self" className='mb-2 bg-[#2092E0] w-full  block text-center text-white py-2 text-[16px] rounded-[4px]'>Checkout</a>
                {/* <div className='text-center'>
                <span  className="text-[16px] text-underline cursor-pointer underline text-[#2092e0]"> Continue shopping</span>
                </div> */}
    </section>
  );
}

function CartLineItem({item, countryCode}) {
  const { updateItemQuantity } = useCart();
  const line = item;
  const sku=line?.attributes?.find((cv)=> cv.key === "_sku")
  const [loading,setLoading] = useState(false);
  const { id, quantity, merchandise } = line;

  const moneyV2 = line.cost.totalAmount.amount;
  let { currencyNarrowSymbol, amount } = useMoney(line.cost.totalAmount);
  const updateItem = async (qty) =>{
    setLoading(true)
    await updateItemQuantity(id,qty)
    setLoading(false)
  }
  // let lineIds={[id]};

  return <div className="flex gap-4 item py-6 border-b-[1px] border-[#ccc] relative">
    {loading && <><div className='absolute top-0 left-0 right-0 bottom-0 bg-white-500'></div>
    <div className='ajax-side-cart-loading line-item-loader'></div></>}
      <Link className="block w-[70px]" to={`/${merchandise.product.handle}`}>
          {merchandise.image && (
              <Image
                  width={90}
                  height={90}
                  data={merchandise.image}
                  className="object-cover object-center "
                  alt={merchandise.title}
              />
          )}
      </Link>
      <div className='details side-cart-details'>
          <Link className="block mb-[2px] text-[#000000] text-[15px] uppercase" to={`/${merchandise.product.handle}`}>
              {merchandise?.product?.title || ''}
          </Link>
          {sku?.value && <p className="block mb-[16px] text-[#747474] text-[14px] uppercase">{sku?.value}</p>}
          <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                  <CartLineQuantityAdjust line={line} updateItem={updateItem} />
                  <div className='price text-[18px]'>
                      {currencyNarrowSymbol}{amount} {countryCode=="NZD"?"NZ":""}
                  </div>
              </div>
              <div>
              <ItemRemoveButton setLoading={setLoading} updateItem={updateItem} />
              </div>
          </div>

      </div>
  </div>
}

function ItemRemoveButton({ updateItem }) {
  return (
       // <CartForm
        //     route="/cart"
        //     action={CartForm.ACTIONS.LinesRemove}
        //     inputs={{
        //         lineIds,
        //     }}
        // >
        <button
        className="text-[#212529] inline-block"
        type="submit"
        onClick={()=> updateItem(0)}
    >
        <IconClose />
    </button>
// </CartForm>
  );
}

function CartLineQuantityAdjust({line, updateItem}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  return (
    <>
      <label htmlFor={`quantity-${lineId}`} className="sr-only">
        Quantity, {quantity}
      </label>
      <div className="flex items-center rounded-sm bg-[#f5f5f5]">
        {/* <UpdateCartButton lines={[{id: lineId, quantity: prevQuantity}]}> */}
          <button
            name="decrease-quantity"
            aria-label="Decrease quantity"
            className="w-10 h-10 text-[28px] transition text-primary/50 hover:text-primary disabled:text-primary/10"
            value={prevQuantity}
            onClick={()=> updateItem(prevQuantity)}
            disabled={quantity <= 1}
          >
            <span className='text-black'>&#8722;</span>
          </button>
        {/* </UpdateCartButton> */}

        <div className="px-2 text-center text-[18px]" data-test="item-quantity">
          {quantity}
        </div>

        {/* <UpdateCartButton lines={[{id: lineId, quantity: nextQuantity}]}> */}
          <button
            className="w-10 h-10 transition text-[28px] text-primary/50 hover:text-primary"
            name="increase-quantity"
            value={nextQuantity}
            onClick={()=> updateItem(nextQuantity)}
            aria-label="Increase quantity"
          >
            <span className='text-black'>&#43;</span>
          </button>
        {/* </UpdateCartButton> */}
      </div>
    </>
  );
}

function UpdateCartButton({children, lines}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{
        lines,
      }}
    >
      {children}
    </CartForm>
  );
}

function CartLinePrice({line, priceType = 'regular', ...passthroughProps}) {
  if (!line?.cost?.amountPerQuantity || !line?.cost?.totalAmount) return null;

  const moneyV2 =
    priceType === 'regular'
      ? line.cost.totalAmount
      : line.cost.compareAtAmountPerQuantity;

  if (moneyV2 == null) {
    return null;
  }

  return <Money withoutTrailingZeros {...passthroughProps} data={moneyV2} />;
}

export function CartEmpty({hidden = false, layout = 'drawer', onClose}) {
  const scrollRef = useRef(null);
  const {y} = useScroll(scrollRef);

  const container = {
    drawer: clsx([
      'content-start gap-4 px-6 pb-8 transition overflow-y-scroll md:gap-12 md:px-12 h-screen-no-nav md:pb-12',
      y > 0 ? 'border-t' : '',
    ]),
    page: clsx([
      hidden ? '' : 'grid',
      `pb-12 w-full md:items-start gap-4 md:gap-8 lg:gap-12`,
    ]),
  };

  return (
    <div ref={scrollRef} className={container[layout]} hidden={hidden}>
      <section className="grid gap-6">
        <Text format>
          Looks like you haven&rsquo;t added anything yet, let&rsquo;s get you
          started!
        </Text>
        <div>
          <Button onClick={onClose}>Continue shopping</Button>
        </div>
      </section>
      <section className="grid gap-8 pt-16">
        <FeaturedProducts
          count={4}
          heading="Shop Best Sellers"
          layout={layout}
          onClose={onClose}
          sortKey="BEST_SELLING"
        />
      </section>
    </div>
  );
}
