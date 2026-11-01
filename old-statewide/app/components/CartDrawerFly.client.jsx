import {flattenConnection, CartForm, useMoney, Image, Money} from '@shopify/hydrogen';
import {useEffect, useState} from 'react';
import {useCart} from '~/components/cartContext';
import {Link} from './Link';
import {IconClose, IconRemove} from './Icon';


export function CartDrawerFly({ layout, onClose, cart, selectedLocale, loading, customerToken }) {
  const linesCount = Boolean(cart?.lines?.nodes?.length || 0);

  console.log("cart",cart)
  if(loading){
    return <CartLoading />
  }
  return (
    <>
      {linesCount <= 0 && <CartEmpty onClose={onClose}  />} 
      {cart && <CartDetails customerToken={customerToken} loading={loading} onClose={onClose} selectedLocale={selectedLocale} cart={cart} layout={layout} />}
    </>
  );
}

export function CartLoading({ cart, onClose, selectedLocale }) {

  return (
      <div className={`cart-drawer-fly right-0 bg-white top-[100%] text-[12px] cart-drawer h-full`}>
          <div className='px-6  cart-items-wrapper'>
          <header className={`z-[1] justify-between sticky top-0 pt-6 z- bg-[#fff] flex text-[#2C4F92] font-bold text-[16px] items-center`}>
                  <div className='border-b-[1px] flex w-full  pb-4 justify-between border-[#ccc]'>
                  
                      <h4  id="cart-contents">
                        My Cart (-)
                      </h4>
                  
                  <button
                    type="button"
                    className="p-4 -m-4 transition text-black"
                    onClick={onClose}
                    data-test="close-cart"
                  >
                    <IconClose aria-label="Close panel" />
                  </button>
                  </div>
                </header>
               
          <div className="items cart-items">
          <div class="items cart-items">
            <div class="flex gap-4 item py-6 border-b-[1px] border-[#ccc] relative animate-pulse">
              <div class="block w-[70px] h-[70px] bg-gray-300 rounded"></div>
              <div class="details side-cart-details flex-1">
                <div class="block mb-[2px] h-[14px] bg-gray-300 w-[100%] rounded"></div>
                <div class="block mb-[2px] h-[14px] bg-gray-300 w-[70%] rounded"></div>
                <div class="block mb-[16px] h-[14px] bg-gray-300 w-[40%] rounded"></div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-4">
                    <div class="flex w-[110px] h-[40px] bg-gray-300 rounded">
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
          </div>

         
      </div>
  )
}


export function CartEmpty({ onClose }) {
  return <div className={`cart-drawer-fly right-0 bg-white top-[100%] text-[12px] cart-drawer h-full`}>   
  <div className='px-6  cart-items-wrapper'>
      <header className={`z-[1] justify-between sticky top-0 pt-6 z- bg-[#fff] flex text-[#2C4F92] font-bold text-[16px] items-center`}>
          <div className='border-b-[1px] flex w-full  pb-4 justify-between border-[#ccc]'>
          
              <h4  id="cart-contents">
                My Cart (0)
              </h4>
          
          <button
            type="button"
            className="p-4 -m-4 transition text-black"
            onClick={onClose}
            data-test="close-cart"
          >
            <IconClose aria-label="Close panel" />
          </button>
          </div>
        </header>
        <div className="flex h-full justify-center items-center cart-drawer-fly py-6 right-0 bg-white top-[100%] text-[12px] cart-drawer">
        <p className='m-0 text-[16px] text-[#444]'>You have no items in your shopping cart.</p>
    </div>
  </div>
</div>
}

export function CartDetails({ cart, onClose, selectedLocale, customerToken, loading }) {
    let countryCode = selectedLocale?.currency || 'AUD';
    console.log("cart",cart)
    console.log("cartToken",customerToken)

    // if (cart?.lines?.nodes?.length <= 0) {
    //     return 
    // }
    let { currencyNarrowSymbol: subtotalSymbol, amount: subTotalAmt } = useMoney(cart.cost?.subtotalAmount);

    return (
        <div className={`cart-drawer-fly right-0 bg-white top-[100%] text-[12px] cart-drawer h-full`}>
            <div className='px-6  cart-items-wrapper'>
            <header className={`z-[1] justify-between sticky top-0 pt-6 z- bg-[#fff] flex text-[#2C4F92] font-bold text-[16px] items-center`}>
                    <div className='border-b-[1px] flex w-full  pb-4 justify-between border-[#ccc]'>
                    
                        <h4  id="cart-contents">
                          My Cart ({cart.totalQuantity})
                        </h4>
                    
                    <button
                      type="button"
                      className="p-4 -m-4 transition text-black"
                      onClick={onClose}
                      data-test="close-cart"
                    >
                      <IconClose aria-label="Close panel" />
                    </button>
                    </div>
                  </header>
                  {cart?.lines?.nodes?.length <= 0 ? 
                  <div className="flex h-full justify-center items-center cart-drawer-fly py-6 right-0 bg-white top-[100%] text-[12px] cart-drawer">
                  <p className='m-0 text-[16px] text-[#444]'>You have no items in your shopping cart.</p>
              </div>
                  :
            <div className="items cart-items">
                {cart.lines.nodes.map((item) => <Item onClose={onClose} countryCode={countryCode} item={item}  />)}
            </div>}
            </div>
            {cart?.lines?.nodes?.length > 0 && 
            <div className='cart-footer py-2 px-6 bg-[#f5f5f5] absolute left-0 right-0 bottom-0'>
                <div className='total-price'>
                    <div className='flex items-center justify-between mb-2'>
                        <div>
                            <h5 className='text-[#2C4F92] font-bold text-[18px]'>
                            Subtotal:
                            </h5>
                            <h6 className='text-[12px] text-[#2C4F92] font-normal'>Excludes delivery</h6>
                        </div>
                        
                        <h5 className='text-[#2C4F92] font-bold text-[18px]'>{subtotalSymbol}{subTotalAmt} {countryCode=="NZD"?"NZ":""}</h5>
                    </div>
                </div>
                {loading || !cart?.checkoutUrl ? (
                  <button
                    disabled
                    className='mb-2 bg-[#9e9e9e] w-full block text-center text-white py-2 text-[16px] rounded-[4px] cursor-not-allowed flex items-center justify-center gap-2'
                  >
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Loading...
                  </button>
                ) : (
                  <a 
                    href={
                      customerToken
                        ? cart.checkoutUrl
                        : `https://checkout.statewideapp.com.au/pages/checkout?checkout_url=${encodeURIComponent(cart.checkoutUrl)}`
                    }
                    target="_self" className='mb-2 bg-[#2092E0] w-full  block text-center text-white py-2 text-[16px] rounded-[4px]'>Checkout</a>
                )}
                <div className='text-center'>
                <span onClick={onClose} className="text-[16px] text-underline cursor-pointer underline text-[#2092e0]"> Continue shopping</span>
                </div>
            </div>}
        </div>
    )
}

function Item({item, countryCode, onClose}){
    const line = item;
    const { updateItemQuantity } = useCart();
    const sku=line?.attributes?.find((cv)=> cv.key === "_sku")
    const [loading,setLoading] = useState(false);
    const { id, quantity, merchandise } = line;

    const moneyV2 = line.cost.totalAmount.amount;
    let { currencyNarrowSymbol, amount } = useMoney(line.cost.totalAmount);
    // useEffect(()=>{
    //   setLoading(false)
    // },[quantity, id])
    // let lineIds={[id]};

    const updateItem = async (qty) =>{
      setLoading(true)
      await updateItemQuantity(id,qty)
      setLoading(false)
    }

    return <div className="flex gap-4 item py-6 border-b-[1px] border-[#ccc] relative">
      {loading && <><div className='absolute top-0 left-0 right-0 bottom-0 bg-white-500'></div>
      <div className='ajax-side-cart-loading line-item-loader'></div></>}
        <Link className="block w-[70px]" onClick={onClose} to={`/${merchandise.product.handle}`}>
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
            <Link onClick={onClose} className="block mb-[2px] text-[#000000] text-[15px] uppercase" to={`/${merchandise.product.handle}`}>
                {merchandise?.product?.title || ''}
            </Link>
            {sku?.value && <p className="block mb-[16px] text-[#747474] text-[14px] uppercase">{sku?.value}</p>}
            <div className='flex items-center justify-between'>
                <div className='flex items-center lg:gap-4'>
                    <CartLineQuantityAdjust line={line} updateItem={updateItem} />
                    <div className='price text-[16px] lg:text-[18px]'>
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



function CartLineQuantityAdjust({line, updateItem}) {
    if (!line || typeof line?.quantity === 'undefined') return null;
    const {id: lineId, quantity} = line;
    const [qty, setQty] = useState(quantity)
    const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
    const nextQuantity = Number((quantity + 1).toFixed(0));
    useEffect(() => {
      setQty(quantity);
    }, [quantity]);
  
    const handleBlur = () => {
      const validQty = Math.max(1, Number(qty));
      if (validQty !== quantity) {
        updateItem(validQty);
      }
    };
    return (
      <>
        <label htmlFor={`quantity-${lineId}`} className="sr-only">
          Quantity, {quantity}
        </label>
        <div className="flex items-center rounded bg-[#f5f5f5]">
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
          <input
          className="bg-[#f5f5f5] border-none outline-none px-2 text-center text-[18px] w-10 h-10"
          type="number"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          onBlur={handleBlur}
        />
  
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
