import {
  Await,
  Form,
  Outlet,
  useLoaderData,
  useActionData,
  useMatches,
  useOutlet,
  useOutletContext,
  useNavigation
} from 'react-router';
import { useEffect, useState, Suspense } from 'react';
import {data as json, redirect} from 'react-router';
import {flattenConnection} from '@shopify/hydrogen';
import {getInputStyleClasses, assertApiErrors} from '~/lib/utils';

import {
  Button,
  OrderCard,
  PageHeader,
  Text,
  AccountDetails,
  AccountAddressBook,
  Modal,
  ProductSwimlane,
} from '~/components';
import {FeaturedCollections} from '~/components/FeaturedCollections';
import {usePrefixPathWithLocale} from '~/lib/utils';
import {CACHE_NONE, routeHeaders} from '~/data/cache';
import {ORDER_CARD_FRAGMENT} from '~/components/OrderCard';
import {useCart} from '~/components/cartContext';

import {getFeaturedData} from './($locale).featured-products';
import {doLogout} from './($locale).account.logout';
import invariant from 'tiny-invariant';
import {assertValidLocaleParam} from '~/lib/locale';

export const headers = routeHeaders;
const badRequest = (data) => json(data, {status: 400});

const formDataHas = (formData, key) => {
  if (!formData.has(key)) return false;

  const value = formData.get(key);
  return typeof value === 'string' && value.length > 0;
};
export const action = async ({request, context, params}) => {
  const formData = await request.formData();
  console.log("formData",JSON.stringify(formData), request.method)
  if (request.method == 'PUT') {
    // const form = await request.formData();
    
  const customerAccessToken = await context.session.get('customerAccessToken');
  if (!customerAccessToken) {
    return json({error: 'Unauthorized'}, {status: 401});
  }
  

  const customer = {
    firstName:formData.get('firstName'),
    lastName:formData.get('lastName'),
    email:formData.get('email'),
    phone: formData.get('phone')?formData.get('phoneCode') + formData.get('phone'):null,
    acceptsMarketing: formData.get('acceptsMarketing') ? true : false
  };

  // Only include password if it's provided
  const currentPassword = formData.get('currentPassword');
  if (currentPassword && currentPassword.trim() !== '') {
    customer.password = currentPassword;
  }
  console.log("currentPassword",currentPassword)

  console.log("customer",customer)
  try {
 

    // update customer and possibly password
    const updated = await context.storefront.mutate(CUSTOMER_UPDATE_MUTATION, {
      variables: {
        customerAccessToken: customerAccessToken,
        customer,
      },
    });
    // check for mutation errors
    if (updated.customerUpdate?.customerUserErrors?.length) {
      return json(
        {error: updated.customerUpdate?.customerUserErrors[0]},
        {status: 400},
      );
    }
    // update session with the updated access token
    if (updated.customerUpdate?.customerAccessToken?.accessToken) {
      context.session.set(
        'customerAccessToken',
        updated.customerUpdate?.customerAccessToken.accessToken,
      );
    }

    return  json({error: null, customer: updated.customerUpdate?.customer},
      {
        headers: {
          'Set-Cookie': await context.session.commit(),
          "Content-Type": "application/json;",
        },
        status:200,
      },
    );
  } catch (error) {
    return json({error: error.message, customer: null}, {status: 400});
  }
  }
  const customerAccessToken = await context.session.get('customerAccessToken');

  invariant(
    customerAccessToken,
    'You must be logged in to update your account details.',
  );

  // Double-check current user is logged in.
  // Will throw a logout redirect if not.
  await getCustomer(context, customerAccessToken);
  try {
    const customer = {};

    formDataHas(formData, 'firstName') &&
      (customer.firstName = formData.get('firstName'));
    formDataHas(formData, 'lastName') &&
      (customer.lastName = formData.get('lastName'));
    formDataHas(formData, 'email') && (customer.email = formData.get('email'));
    formDataHas(formData, 'phone') && (customer.phone = formData.get('phone'));

    const data = await context.storefront.mutate(CUSTOMER_UPDATE_MUTATION, {
      variables: {
        customerAccessToken,
        customer,
      },
    });

    assertApiErrors(data.customerUpdate);

    return redirect(params?.locale ? `${params.locale}/account` : '/account');
  } catch (error) {
    return badRequest({formError: error.message});
  }
};
export async function loader({request, context, params}) {
  assertValidLocaleParam(params);
  const {pathname} = new URL(request.url);
  const locale = params.locale;
  const customerAccessToken = await context.session.get('customerAccessToken');
  const isAuthenticated = Boolean(customerAccessToken);
  const loginPath = locale ? `/${locale}/login` : '/login';
  const isAccountPage = /^\/account\/?$/.test(pathname);
  console.log("isAuthenticated",isAuthenticated)
  console.log("customerAccessToken",customerAccessToken)

  if (!isAuthenticated) {
    if (isAccountPage) {
      return redirect(loginPath);
    }
    // pass through to public routes
    return json({isAuthenticated: false});
  }

  const customer = await getCustomer(context, customerAccessToken);

  const heading = customer
    ? customer.firstName
      ? `Welcome, ${customer.firstName}.`
      : `Welcome to your account.`
    : 'Account Details';
  
  // Get checkout_url parameter from query string
  const url = new URL(request.url);
  const checkoutUrlParam = url.searchParams.get('checkout_url');

  return json(
    {
      isAuthenticated,
      customer,
      heading,
      featuredData: getFeaturedData(context.storefront),
      checkoutUrl: checkoutUrlParam,
    },
    {
      headers: {
        'Cache-Control': CACHE_NONE,
      },
    },
  );
}

export default function Authenticated() {
  const data = useLoaderData();
  const outlet = useOutlet();
  const matches = useMatches();

  // routes that export handle { renderInModal: true }
  const renderOutletInModal = matches.some((match) => {
    return match?.handle?.renderInModal;
  });

  // Public routes
  if (!data.isAuthenticated) {
    return <Outlet />;
  }

  // Authenticated routes
  if (outlet) {
    if (renderOutletInModal) {
      return (
        <>
          <Account {...data} />
          <div cancelLink="/account">
            <Outlet context={{customer: data.customer}} />
          </div>
        </>
      );
    } else {
      return <Outlet context={{customer: data.customer}} />;
    }
  }

  return <Account {...data} />;
}

function Account({customer, heading, featuredData, checkoutUrl}) {
  const [activeTab, setActiveTab] = useState("info");
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [editAddressFormIndex, setEditAddressFormIndex] = useState(null);
  const { getCart, cart, cartLoading } = useCart();
  const orders = flattenConnection(customer.orders);
  const addresses = flattenConnection(customer.addresses);
  const editform=(data)=>{
    setEditAddressFormIndex({...data});
    setShowNewAddress(true)
  }
  
  // console.log("account page cart",cart)
  // Check for checkout_url parameter and redirect to cart checkout URL
  useEffect(() => {
    // Only proceed if we have the checkoutUrl parameter and cart is not loading
    if (!checkoutUrl || cartLoading) {
      return;
    }

    const redirectToCheckout = async () => {
      try {
        // Always fetch fresh cart data to ensure we have the latest checkoutUrl
        const cartData = await getCart();
        console.log("cartData for checkout:", cartData);
        
        // Check if we have checkoutUrl in the fresh cart data
        if (cartData?.checkoutUrl) {
          console.log("Redirecting to checkout:", cartData.checkoutUrl);
          window.location.href = cartData.checkoutUrl;
        } else {
          console.warn("Cart data fetched but checkoutUrl is missing:", cartData);
        }
      } catch (error) {
        console.error("Error fetching cart for checkout:", error);
      }
    };
    
    redirectToCheckout();
  }, [checkoutUrl, cartLoading, getCart]);
  
  // Show loading state if checkoutUrl exists but cart is still loading
  if (checkoutUrl && cartLoading) {
    return (
      <div className='max-w-[1140px] mx-auto px-[15px] flex items-center justify-center min-h-[60vh]'>
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }
  return (
    <div className='max-w-[1140px] mx-auto px-[15px]'>
      <div className='flex flex-wrap  lg:col-2 my-[25px]'>
        <div className='px-4 w-full lg:w-[25%] mb-8 lg:mb-0'>
          <h3 className='py-[0.75rem] px-[1.25rem] bg-[#00000008] border-b-[1px] border-b-[#ccc] text-[22.4px]'>
            My account
          </h3>
          <ul>
            <li className={`border-b-[#ddd] cursor-pointer border-b-[1px] py-[0.75rem] px-[1.25rem] text-[#1e5097] ${activeTab == "info" ? ' bg-[#f5f5f5] font-bold': ''}`} onClick={()=> setActiveTab('info')}><i className="fa fa-angle-double-right" aria-hidden="true"></i> My info</li>
            <li className={`border-b-[#ddd] cursor-pointer border-b-[1px] py-[0.75rem] px-[1.25rem] text-[#1e5097] ${activeTab == "address" ? ' bg-[#f5f5f5] font-bold': ''}`} onClick={()=> setActiveTab('address')}><i className="fa fa-angle-double-right" aria-hidden="true"></i> Address</li>
            <li className={`border-b-[#ddd] cursor-pointer border-b-[1px] py-[0.75rem] px-[1.25rem] text-[#1e5097] ${activeTab == "order" ? ' bg-[#f5f5f5] font-bold': ''}`} onClick={()=> setActiveTab('order')}><i className="fa fa-angle-double-right" aria-hidden="true"></i> Order history</li>
            <li className={`hidden border-b-[#ddd] cursor-pointer border-b-[1px] py-[0.75rem] px-[1.25rem] text-[#1e5097] ${activeTab == "password" ? ' bg-[#f5f5f5] font-bold': ''}`} onClick={()=> setActiveTab('password')}><i className="fa fa-angle-double-right" aria-hidden="true"></i> Change password</li>
            <li className={`border-b-[#ddd] cursor-pointer border-b-[1px] py-[0.75rem] px-[1.25rem] text-[#1e5097] ${activeTab == "password" ? ' bg-[#f5f5f5] font-bold': ''}`} >
            <Form method="post" action={'/account/logout'}>
                <button type="submit" className="text-[#00aeef] uppercase ">
                  Log out
                </button>
              </Form>
            </li>
           
          </ul>
        </div>
        <div className='px-4 w-full lg:w-[75%]'>

          {activeTab == "info" && <AccountDetails customer={customer} />}
          {activeTab == "address" &&<>
          {showNewAddress ? <AddAddress editform={editform} setShowNewAddress={setShowNewAddress} editAddressFormIndex={editAddressFormIndex} addresses={addresses} /> :  <AccountAddressBook setShowNewAddress={setShowNewAddress} addresses={addresses} setEditAddressFormIndex={editform} customer={customer} />}
          
          </> }
          {activeTab == "order" && <AccountOrderHistory orders={orders} />}
          {activeTab == "password" && <ChangePassword customer={customer} />}

          
        </div>
      </div>
    </div>
  );
}

function AccountOrderHistory({orders}) {
  return (

    <div className="w-full ">
      <h3 className="font-bold text-[30px] text-center text-[#1e5097] pb-[14px] border-b-[1px] border-b-[#ccc] mb-[25px]">Order history</h3>
        {orders?.length ? <Orders orders={orders} /> : <EmptyOrders />}
    </div>
  );
}

function EmptyOrders() {
  return (
    <p className='mb-4 text-center text-[13px] py-[0.25rem] px-[1.25rem] bg-[#f8d7da] text-[#721c24] border-[#f5c6cb] border-[1px] rounded-[.25rem]'>
              No orders
    </p>
  );
}

function Orders({orders}) {
  return (
    <ul className="grid grid-flow-row grid-cols-1 gap-2 gap-y-6 md:gap-4 lg:gap-6 false sm:grid-cols-3">
      {orders.map((order) => (
        <OrderCard order={order} key={order.id} />
      ))}
    </ul>
  );
}

const EyeOff = ({callback}) =>{
  return <div onClick={callback} className='top-[9px] absolute right-8 w-[20px] cursor-pointer'>
    <img className=' w-[20px]' src="https://cdn.shopify.com/s/files/1/0799/5929/4245/files/hide.png?v=1739300343"/>
  </div>
}
const Eye = ({callback}) =>{
  return <div onClick={callback} className='top-[9px] absolute right-8 w-[20px] cursor-pointer'>
    <img className=' w-[20px]' src="https://cdn.shopify.com/s/files/1/0799/5929/4245/files/view.png?v=1739300342"/>
  </div>
}

function ChangePassword({customer}) {
  const actionData = useActionData();
  const {state} = useNavigation();
  // console.log("actionData",actionData)
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCPassword, setShowCPassword] = useState(false)
  useEffect(() => {
    if (actionData?.customer && !actionData?.error) {
      setPassword('');
      setConfirmPassword('');
      setShowSuccessMessage(true);
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [actionData]);
  return(
    <>
      <h3 className="font-bold text-[30px] text-center text-[#1e5097] pb-[14px] border-b-[1px] border-b-[#ccc] mb-[25px]">
      Change password
      </h3>
      <div className="">
          <Form method="PUT" action='/account'>
          {showSuccessMessage && 
          <div className="flex items-center justify-center mb-6 bg-green-100 rounded-sm">
            <p className="m-4 text-sm text-red-900">Password updated successfully</p>
          </div>
          }
          {actionData?.formError && (
            <div className="flex items-center justify-center mb-6 bg-red-100 rounded-sm p-2">
              <p className="m-4 text-sm text-red-900">{actionData.formError}</p>
            </div>
          )}
          <input
            type="hidden"
            name="firstName"
            value={customer?.firstName}
          />
           <input
            type="hidden"
            name="email"
            value={customer?.email}
          />
           <input
            type="hidden"
            name="lastName"
            value={customer?.lastName}
          />
          <div className='flex items-center'>
           <div className='w-[25%] text-right'>
              <label htmlFor='password' className='text-[16px] text-[#212529'>New password:</label>
            </div>
            <div className='w-[50%] px-[15px] relative'>
            {showPassword ? <EyeOff callback={()=> setShowPassword(false)} size={20} /> : <Eye callback={()=> setShowPassword(true)} size={20} />}
              <input
                className={`text-black focus:border-[#ced4da] mb-1 ${getInputStyleClasses()}`}
                id="password"
                name="currentPassword"
                required
                type={showPassword ? 'text' : 'password'}
                
                autoComplete="given-name"
                placeholder="New password"
                aria-label="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className='w-[25%] px-[15px] text-[20px] text-[#00aeef]'>*</div>
          </div>

          <div className='flex items-center'>
           <div className='w-[25%] text-right'>
              <label htmlFor='cpassword' className='text-[16px] text-[#212529'>Confirm password:</label>
            </div>
            <div className='w-[50%] px-[15px] relative'>
            {showCPassword ? <EyeOff callback={()=> setShowCPassword(false)} size={20} /> : <Eye callback={()=> setShowCPassword(true)} size={20} />}
              <input
                className={`text-black focus:border-[#ced4da] mb-1 ${getInputStyleClasses()}`}
                id="cpassword"
                name="newPassword"
                required
                type={showCPassword ? 'text' : 'password'}
                autoComplete="given-name"
                placeholder="Confirm password"
                aria-label="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div className='w-[25%] px-[15px] text-[20px] text-[#00aeef]'>*</div>
          </div>


          <div className="flex items-center justify-center mt-4 gap-2">
          <button
            className="bg-[#007bff] text-white rounded-[5px] uppercase min-w-[140px] py-[10px] no-underline px-[30px] border-[#007bff]"
            type='submit'
          >
            {state !== 'idle' ? 'Changing...' : 'Change Password'}

            
          </button>
          
        </div>

          </Form>
      </div>
    </>
  )
}
function AddAddress({setShowNewAddress,editAddressFormIndex,addresses}) {
  const isNewAddress = true;
  const actionData = useActionData();
  const {state} = useNavigation();
  const [load,setLoad]=useState(false)
  /**
   * When a refresh happens (or a user visits this link directly), the URL
   * is actually stale because it contains a special token. This means the data
   * loaded by the parent and passed to the outlet contains a newer, fresher token,
   * and we don't find a match. We update the `find` logic to just perform a match
   * on the first (permanent) part of the ID.
   */
  // const normalizedAddress = decodeURIComponent(addressId ?? '').split('?')[0];
  const address = editAddressFormIndex;
  console.log("editAddressFormIndex",editAddressFormIndex)
  useEffect(() => {
    if(state != 'idle'){
      setLoad(true);
    }
    if (state === 'idle' && load && !actionData?.formError) {
      // If the form submission is successful and no errors are reported, close the address form modal
      setShowNewAddress(false);
      setLoad(false)
    }
    if (state === 'idle' && load){
      setLoad(false)
    }
  }, [state]);
  return (
    <>
      <h3 className="font-bold text-[30px] text-center text-[#1e5097] pb-[14px] border-b-[1px] border-b-[#ccc] mb-[25px]">
      My account - Add new address
      </h3>
      <div className="">
        <Form method="post" action='/account/address/add'>
          <input
            type="hidden"
            name="addressId"
            value={address?.id?address?.id:"add"}
          />
          {actionData?.formError && (
            <div className="flex items-center justify-center mb-6 bg-red-100 rounded-sm">
              <p className="m-4 text-sm text-black">{actionData.formError}</p>
            </div>
          )}
          <div className='flex items-center'>
           <div className='w-[25%] text-right'>
              <label htmlFor='firstName' className='text-[16px] text-[#212529'>First name</label>
            </div>
            <div className='w-[50%] px-[15px]'>
              <input
                className={`text-black focus:border-[#ced4da] mb-1 ${getInputStyleClasses()}`}
                id="firstName"
                name="firstName"
                required
                type="text"
                autoComplete="given-name"
                placeholder="First name"
                aria-label="First name"
                defaultValue={address?.firstName ?? ''}
              />
            </div>
            <div className='w-[25%] px-[15px] text-[20px] text-[#00aeef]'>*</div>
          </div>

          <div className='flex items-center'>
           <div className='w-[25%] text-right'>
              <label htmlFor='lastName' className='text-[16px] text-[#212529'>Last name</label>
            </div>
            <div className='w-[50%] px-[15px]'>
              <input
                className={`text-black focus:border-[#ced4da] mb-1 ${getInputStyleClasses()}`}
              id="lastName"
              name="lastName"
              required
              type="text"
              autoComplete="family-name"
              placeholder="Last name"
              aria-label="Last name"
              defaultValue={address?.lastName ?? ''}
            />
          </div>
          <div className='w-[25%] px-[15px] text-[20px] text-[#00aeef]'>*</div>
          </div>

          <div className='flex items-center'>
           <div className='w-[25%] text-right'>
              <label htmlFor='company' className='text-[16px] text-[#212529'>Company</label>
            </div>
            <div className='w-[50%] px-[15px]'>
              <input
                className={`text-black focus:border-[#ced4da] mb-1 ${getInputStyleClasses()}`}
              id="company"
              name="company"
              type="text"
              autoComplete="organization"
              placeholder="Company"
              aria-label="Company"
              defaultValue={address?.company ?? ''}
            />
            </div>
            <div className='w-[25%] px-[15px] text-[20px] text-[#00aeef]'>*</div>
          </div>


  <div className='flex items-center'>
           <div className='w-[25%] text-right'>
              <label htmlFor='address1' className='text-[16px] text-[#212529'>Address line 1</label>
            </div>
            <div className='w-[50%] px-[15px]'>
              <input
                className={`text-black focus:border-[#ced4da] mb-1 ${getInputStyleClasses()}`}
              id="address1"
              name="address1"
              type="text"
              autoComplete="address-line1"
              placeholder="Address line 1*"
              required
              aria-label="Address line 1"
              defaultValue={address?.address1 ?? ''}
            />
                    </div>
            <div className='w-[25%] px-[15px] text-[20px] text-[#00aeef]'>*</div>
          </div>


          <div className='flex items-center'>
           <div className='w-[25%] text-right'>
              <label htmlFor='address2' className='text-[16px] text-[#212529'>Address line 2</label>
            </div>
            <div className='w-[50%] px-[15px]'>
              <input
                className={`text-black focus:border-[#ced4da] mb-1 ${getInputStyleClasses()}`}
              id="address2"
              name="address2"
              type="text"
              autoComplete="address-line2"
              placeholder="Address line 2"
              aria-label="Address line 2"
              defaultValue={address?.address2 ?? ''}
            />
          </div>
          </div>

           <div className='flex items-center'>
           <div className='w-[25%] text-right'>
              <label htmlFor='city' className='text-[16px] text-[#212529'>City</label>
            </div>
            <div className='w-[50%] px-[15px]'>
              <input
                className={`text-black focus:border-[#ced4da] mb-1 ${getInputStyleClasses()}`}
              id="city"
              name="city"
              type="text"
              required
              autoComplete="address-level2"
              placeholder="City"
              aria-label="City"
              defaultValue={address?.city ?? ''}
            />
                     </div>
            <div className='w-[25%] px-[15px] text-[20px] text-[#00aeef]'>*</div>
          </div>

          <div className='flex items-center'>
           <div className='w-[25%] text-right'>
              <label htmlFor='province' className='text-[16px] text-[#212529'>State / Province</label>
            </div>
            <div className='w-[50%] px-[15px]'>
              <input
                className={`text-black focus:border-[#ced4da] mb-1 ${getInputStyleClasses()}`}
              id="province"
              name="province"
              type="text"
              autoComplete="address-level1"
              placeholder="State / Province"
              required
              aria-label="province"
              defaultValue={address?.province ?? ''}
            />
                      </div>
            <div className='w-[25%] px-[15px] text-[20px] text-[#00aeef]'>*</div>
          </div>
          

          <div className='flex items-center'>
           <div className='w-[25%] text-right'>
              <label htmlFor='zip' className='text-[16px] text-[#212529'>Zip</label>
            </div>
            <div className='w-[50%] px-[15px]'>
              <input
                className={`text-black focus:border-[#ced4da] mb-1 ${getInputStyleClasses()}`}
              id="zip"
              name="zip"
              type="text"
              autoComplete="postal-code"
              placeholder="Zip / Postal Code"
              required
              aria-label="Zip"
              defaultValue={address?.zip ?? ''}
            />
                      </div>
            <div className='w-[25%] px-[15px] text-[20px] text-[#00aeef]'>*</div>
          </div>

          <div className='flex items-center'>
           <div className='w-[25%] text-right'>
              <label htmlFor='country' className='text-[16px] text-[#212529'>Country</label>
            </div>
            <div className='w-[50%] px-[15px]'>
              <input
                className={`text-black focus:border-[#ced4da] mb-1 ${getInputStyleClasses()}`}
              id="country"
              name="country"
              type="text"
              autoComplete="country-name"
              placeholder="Country"
              required
              aria-label="Country"
              defaultValue={address?.country ?? ''}
            />
                      </div>
            <div className='w-[25%] px-[15px] text-[20px] text-[#00aeef]'>*</div>
          </div>

          <div className='flex items-center'>
           <div className='w-[25%] text-right'>
              <label htmlFor='phone' className='text-[16px] text-[#212529'>Phone</label>
            </div>
            <div className='w-[50%] px-[15px]'>
              <input
                className={`text-black focus:border-[#ced4da] mb-1 ${getInputStyleClasses()}`}
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="Phone"
              aria-label="Phone"
              defaultValue={address?.phone ?? ''}
            />
      </div>
            <div className='w-[25%] px-[15px] text-[20px] text-[#00aeef]'>*</div>
          </div>

          <div className="flex items-center justify-center mt-4 gap-2">
            <input
              type="checkbox"
              name="defaultAddress"
              id="defaultAddress"
              defaultChecked={false}
              className="border-gray-500 rounded-xs cursor-pointer border-1"
            />
            <label
              className="inline-block ml-2 text-sm cursor-pointer"
              htmlFor="defaultAddress"
            >
              Set as default address
            </label>
          </div>

          <div className="flex items-center justify-center mt-4 gap-2">
          <button disabled={state !== 'idle'}
            className="bg-[#007bff] text-white rounded-[5px] uppercase min-w-[140px] py-[10px] no-underline px-[30px] border-[#007bff]"
            type="submit"
          >
            {state !== 'idle' ? 'Saving' : 'Save'}
          </button>
          <button
              onClick={()=> setShowNewAddress(false)}
              to=".."
              className="bg-[#007bff] text-white rounded-[5px] uppercase min-w-[140px] py-[10px] no-underline px-[30px] border-[#007bff]"
              variant="secondary"
            >
              Cancel
            </button>
        </div>
         
        </Form>
      </div>
    </>
  );
}

const CUSTOMER_QUERY = `#graphql
  query CustomerDetails(
    $customerAccessToken: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    customer(customerAccessToken: $customerAccessToken) {
      ...CustomerDetails
    }
  }

  fragment AddressPartial on MailingAddress {
    id
    formatted
    firstName
    lastName
    company
    address1
    address2
    country
    province
    city
    zip
    phone
  }

  fragment CustomerDetails on Customer {
    firstName
    lastName
    phone
    email
    acceptsMarketing
    defaultAddress {
      ...AddressPartial
    }
    addresses(first: 6) {
      edges {
        node {
          ...AddressPartial
        }
      }
    }
    orders(first: 250, sortKey: PROCESSED_AT, reverse: true) {
      edges {
        node {
          ...OrderCard
        }
      }
    }
  }

  ${ORDER_CARD_FRAGMENT}
`;

export async function getCustomer(context, customerAccessToken) {
  const {storefront} = context;

  const data = await storefront.query(CUSTOMER_QUERY, {
    variables: {
      customerAccessToken,
      country: context.storefront.i18n.country,
      language: context.storefront.i18n.language,
    },
    cache: storefront.CacheNone(),
  });

  /**
   * If the customer failed to load, we assume their access token is invalid.
   */
  if (!data || !data.customer) {
    throw await doLogout(context);
  }

  return data.customer;
}

  function getPassword(form) {
    let password;
    const currentPassword = form.get('currentPassword');
    const newPassword = form.get('newPassword');
    let passwordError;
    if (newPassword && !currentPassword) {
      passwordError = new Error('Current password is required.');
    }
  
    if (newPassword && currentPassword && newPassword === currentPassword) {
      passwordError = new Error(
        'New password must be different than current password.',
      );
    }
  
    if (passwordError) {
      throw passwordError;
    }
  
    if (currentPassword && newPassword) {
      password = newPassword;
    } else {
      password = currentPassword;
    }
  
    return String(password);
  }
  
  const CUSTOMER_UPDATE_MUTATION = `#graphql
    # https://shopify.dev/docs/api/storefront/latest/mutations/customerUpdate
    mutation customerUpdate(
      $customerAccessToken: String!,
      $customer: CustomerUpdateInput!
      $country: CountryCode
      $language: LanguageCode
    ) @inContext(language: $language, country: $country) {
      customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
        customer {
          acceptsMarketing
          email
          firstName
          id
          lastName
          phone
        }
        customerAccessToken {
          accessToken
          expiresAt
        }
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;