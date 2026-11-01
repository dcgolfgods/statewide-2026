import invariant from 'tiny-invariant';
import clsx from 'clsx';
import {data as json, redirect} from 'react-router';
import { useLoaderData } from 'react-router';
import { Money, Image, flattenConnection, useMoney } from '@shopify/hydrogen';

import { statusMessage } from '~/lib/utils';
import { Link, Heading, PageHeader, Text } from '~/components';
import {getRouteSeoMeta} from '~/lib/meta';

export const meta = ({ data, matches }) => {
  return getRouteSeoMeta(matches, { title: `Order ${data?.order?.name}` });
};

export async function loader({ request, context, params }) {
  if (!params.id) {
    return redirect(params?.locale ? `${params.locale}/account` : '/account');
  }

  const queryParams = new URL(request.url).searchParams;
  const orderToken = queryParams.get('key');

  invariant(orderToken, 'Order token is required');

  const customerAccessToken = await context.session.get('customerAccessToken');

  if (!customerAccessToken) {
    return redirect(
      params.locale ? `${params.locale}/login` : '/login',
    );
  }

  const orderId = `gid://shopify/Order/${params.id}?key=${orderToken}`;

  const { node: order } = await context.storefront.query(CUSTOMER_ORDER_QUERY, {
    variables: { orderId },
  });

  if (!order || !('lineItems' in order)) {
    throw new Response('Order not found', { status: 404 });
  }

  const lineItems = flattenConnection(order.lineItems);

  const discountApplications = flattenConnection(order.discountApplications);

  const firstDiscount = discountApplications[0]?.value;

  const discountValue =
    firstDiscount?.__typename === 'MoneyV2' && firstDiscount;

  const discountPercentage =
    firstDiscount?.__typename === 'PricingPercentageValue' &&
    firstDiscount?.percentage;

  return json({
    order,
    lineItems,
    discountValue,
    discountPercentage,
  });
}

export default function OrderRoute() {
  let { order, lineItems, discountValue: discountValuePrice, discountPercentage } = useLoaderData();
  if (!discountValuePrice) {
    discountValuePrice = { amount: 0, currencyCode: order?.subtotalPriceV2?.currencyCode }
  }
  // return <>{JSON.stringify(discountValuePrice)}</>
  let { currencyNarrowSymbol, amount: subtotalPriceV2, currencyCode } = useMoney(order.subtotalPriceV2);
  let { amount: discountValue } = useMoney(discountValuePrice);
  let { amount: totalTaxV2 } = useMoney(order.totalTaxV2);
  let { amount: totalPriceV2 } = useMoney(order.totalPriceV2);
  let { amount: totalShippingPriceV2 } = useMoney(order.totalShippingPriceV2);

  const fulfillmentDataRaw = order.fulfillmentData?.value ? JSON.parse(order.fulfillmentData.value) : null;
  const fulfillment = fulfillmentDataRaw?.[0]; // Get the first fulfillment record
  if(!fulfillment?.created_at && fulfillment?.createdAt){
    fulfillment.created_at = fulfillment.createdAt;
  }
  console.log('order', order, lineItems);

  // Add a function to get a human-readable status (copied from OrderCard.jsx)
  function getOrderStatus(order) {
    switch (order.financialStatus) {
      case 'CANCELLED':
        return 'Cancelled';
      case 'PAID':
      case 'AUTHORIZED':
        return 'Placed';
      case 'REFUNDED':
        return 'Refunded';
      case 'PARTIALLY_REFUNDED':
        return 'Partially Refunded';
      case 'PENDING':
        return 'Payment Pending';
      case 'PARTIALLY_PAID':
        return 'Partially Paid';
      case 'UNPAID':
        return 'Unpaid';
      case 'VOIDED':
        return 'Cancelled';
      case 'EXPIRED':
        return 'Cancelled';
      default:
        switch (order.fulfillmentStatus) {
          case 'PARTIALLY_FULFILLED':
            return 'Partially Fulfilled';
          case 'FULFILLED':
            return 'Fulfilled';
          case 'IN_PROGRESS':
            return 'In Progress';
          case 'ON_HOLD':
            return 'On Hold';
          case 'OPEN':
            return 'Open';
          case 'CLOSED':
            return 'Closed';
          default:
            return 'Placed';
        }
    }
  }

  return (
    <div className="max-w-[900px] px-[15px] mx-auto my-[50px]">
      <div className="w-full mt-[20px]">
        <h1 className="text-[#1e5097] mb-[25px] text-center text-[24px] font-bold py-[6px] border-b-[1px] border-b-[#ccc]">
          <span className='mb-[8px] block'>Order info</span>
        </h1>
        <div className="w-full p-0 sm:grid-cols-1 lg:py-6">
          <div>
            <div className='flex flex-wrap justify-between'>
              <div className='lg:w-auto   w-full lg:mb-0 mb-4'>
                <p className='text-[14px] flex'>
                  <strong className="min-w-[78px] inline-block">Order No.</strong> <span>{order.name}</span>
                </p>
                <p className='flex text-[14px]'>
                  <strong className="min-w-[78px] inline-block">Order date: </strong>
                  <span >
                    {new Date(order.processedAt).getDate()} {/* day */}
                    {' '}
                    {new Date(order.processedAt).toLocaleString('en-GB', { month: 'short' })} {/* month as "May" */}
                    {' '}
                    {new Date(order.processedAt).getFullYear()} {/* year */}
                  </span>
                </p>
                {fulfillment ? (
                  <>
                    <p className='flex text-[14px]'>
                      <strong className="min-w-[78px] inline-block">Shipped: </strong>
                      <span >
                        {new Date(fulfillment.created_at).getDate()}{' '}
                        {new Date(fulfillment.created_at).toLocaleString('en-GB', { month: 'short' })}{' '}
                        {new Date(fulfillment.created_at).getFullYear()}
                      </span>
                    </p>
                    {fulfillment.trackingInfo?.[0] && (
                      <p className='flex text-[14px]'>
                        <strong className="min-w-[78px] inline-block">Tracking: </strong>
                        <a 
                          href={fulfillment.trackingInfo[0].url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {fulfillment.trackingInfo[0].number} ({fulfillment.trackingInfo[0].company})
                        </a>
                      </p>
                    )}
                    <p className='flex text-[14px]'>
                      <strong className="min-w-[78px] inline-block">Status: </strong>
                      <span>{getOrderStatus(order)}</span>
                    </p>
                  </>
                ) : (
                  <p className='flex text-[14px]'>
                    <strong className="min-w-[78px] inline-block">Status: </strong>
                    <span>{getOrderStatus(order)}</span>
                  </p>
                )}
              </div>
              <div className="border-none lg:w-auto  w-full  mb-4 mt-4 lg:mt-0 lg:mb-0">
                <h4 size="copy" className="mb-1 text-[#1e5097] font-semibold" as="h3">
                  Shipping Address
                </h4>
                {order?.shippingAddress ? (
                  <ul className="">
                    <li>
                      <p className='text-[14px]'>
                        {order.shippingAddress.firstName &&
                          order.shippingAddress.firstName + ' '}
                        {order.shippingAddress.lastName}
                      </p>
                    </li>
                    {order?.shippingAddress?.formatted ? (
                      order.shippingAddress.formatted.map((line) => (
                        <li key={line}>
                          <p className='text-[14px]'>{line}</p>
                        </li>
                      ))
                    ) : (
                      <></>
                    )}
                  </ul>
                ) : (
                  <p className="mt-3">No shipping address defined</p>
                )}
                {/* <Heading size="copy" className="mt-8 font-semibold" as="h3">
                Status
              </Heading>
              <div
                className={clsx(
                  `mt-3 px-3 py-1 text-xs font-medium rounded-full inline-block w-auto`,
                  order.fulfillmentStatus === 'FULFILLED'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-primary/20 text-primary/50',
                )}
              >
                <Text size="fine">
                  {statusMessage(order.fulfillmentStatus)}
                </Text>
              </div> */}
              </div>
            </div>

            <div className="flex flex-wrap">

              <div className="flex w-full mb-4 lg:mb-0 mt-8">
                <div className='flex flex-wrap w-full '>
                  {lineItems.map((lineItem) => {
                    let { amount: variantPrice } = useMoney(lineItem.variant.price);
                    let { amount: discountedTotalPrice } = useMoney(lineItem.discountedTotalPrice);

                    return (
                      <div
                        key={lineItem.variant.id}
                        className="flex w-full gap-4 border-b border-gray-300 pb-6 items-center"
                      >
                        <div className="flex gap-4 items-center lg:w-[80%] w-full">
                          <Link to={`/${lineItem.variant.product.handle}`}>
                            {lineItem?.variant?.image?.src && (
                              <div className="w-24 aspect-square">
                                <Image
                                  src={lineItem?.variant?.image?.src}
                                  width={96}
                                  height={96}
                                />
                              </div>
                            )}
                          </Link>
                          <div>
                            <p className='text-[14px]' as="p">{lineItem.title}</p>
                            <p className='text-[14px] text-[#737373]' as="p">{lineItem.variant.sku} X {lineItem.quantity}</p>

                            {lineItem.variant.title != "Default Title" &&
                              <Text size="fine" className="mt-1" as="p">
                                {lineItem.variant.title}
                              </Text>}

                            <div className=" lg:hidden flex flex-col gap-1 mt-2 ">
                              <div className="md:w-1/3">
                                <p className="text-[14px] text-black-500 md:hidden">{currencyNarrowSymbol} {discountedTotalPrice}</p>
                              </div>
                            </div>

                          </div>



                        </div>

                        <div className="hidden items-center lg:flex flex-col gap-2 text-right w-[20%] md:text-right">
                          <div className="w-full">
                            <p className="text-[14px] text-black">{currencyNarrowSymbol} {discountedTotalPrice}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {/* Summary Section */}
                  <div className='flex w-full justify-end flex-col'>
                    <div className='flex w-full justify-end mt-2'>
                      <div className="w-full lg:w-[25%] justify-end flex flex-col">
                        {(((discountValue) && discountValue > 0) || discountPercentage) && (
                          <div className="flex justify-between text-green-700">
                            <p className="text-[14px] text-black">Discounts</p>
                            <div>
                              {discountPercentage ? (
                                <span className="text-[14px]">-{discountPercentage}% OFF</span>
                              ) : (
                                <>{currencyNarrowSymbol}{discountValue}</>
                              )}
                            </div>
                          </div>
                        )}
                        <div className="flex justify-between leading-[18px]">
                          <p className="text-[14px] text-black">Subtotal</p>
                          <div className="text-[14px] text-black">{currencyNarrowSymbol} {subtotalPriceV2}</div>
                        </div>
                        {totalShippingPriceV2 > 0 && <div className="flex justify-between  leading-[18px]">
                          <p className="text-[14px] text-black">Shipping</p>
                          <div className="text-[14px] text-black">{currencyNarrowSymbol} {totalShippingPriceV2}</div>
                        </div>}
                        {/* <div className="flex justify-between  leading-[18px]">
                          <p className="text-[14px] text-black">GST</p>
                          <div className="text-[14px] text-black">{currencyNarrowSymbol} {totalTaxV2}</div>
                        </div> */}
                      </div>
                    </div>
                    <div className='flex w-full justify-end mt-2 pt-4 border-t border-gray-300'>
                      <div className="w-full lg:w-[25%] justify-end flex flex-col">
                        <div className="flex justify-between font-semibold">
                          <div className='relative'>
                            <p className="text-[14px] text-black">
                              Total
                            </p>
                          <div className='text-[12px] text-[#737373] font-extralight absolute right-0 min-w-[120px] text-right'>including <strong className='font-bold'>{currencyNarrowSymbol} {totalTaxV2}</strong> GST</div>
                          </div>

                          <div className="text-[14px] text-black">{currencyNarrowSymbol} {totalPriceV2}</div>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const CUSTOMER_ORDER_QUERY = `#graphql
  fragment OrderMoney on MoneyV2 {
    amount
    currencyCode
  }
  fragment AddressFull on MailingAddress {
    address1
    address2
    city
    company
    country
    countryCodeV2
    firstName
    formatted
    id
    lastName
    name
    phone
    province
    provinceCode
    zip
  }
  fragment DiscountApplication on DiscountApplication {
    value {
      __typename
      ... on MoneyV2 {
        amount
        currencyCode
      }
      ... on PricingPercentageValue {
        percentage
      }
    }
  }
  fragment Image on Image {
    altText
    height
    src: url(transform: {crop: CENTER, maxHeight: 96, maxWidth: 96, scale: 2})
    id
    width
  }
  fragment ProductVariant on ProductVariant {
    id
    image {
      ...Image
    }
    price {
      ...OrderMoney
    }
    product {
      handle
    }
    sku
    title
  }
  fragment LineItemFull on OrderLineItem {
    title
    quantity
    discountAllocations {
      allocatedAmount {
        ...OrderMoney
      }
      discountApplication {
        ...DiscountApplication
      }
    }
    originalTotalPrice {
      ...OrderMoney
    }
    discountedTotalPrice {
      ...OrderMoney
    }
    variant {
      ...ProductVariant
    }
  }

  query CustomerOrder(
    $country: CountryCode
    $language: LanguageCode
    $orderId: ID!
  ) @inContext(country: $country, language: $language) {
    node(id: $orderId) {
      ... on Order {
        id
        name
        fulfillmentData: metafield(namespace: "custom", key: "order_fulfillments") {
          value
        }
        orderNumber
        processedAt
        financialStatus
        fulfillmentStatus
        totalTaxV2 {
          ...OrderMoney
        }
        totalPriceV2 {
          ...OrderMoney
        }
        totalShippingPrice {
          amount
          currencyCode
        }
        totalShippingPriceV2 {
          amount
          currencyCode
        }
        subtotalPriceV2 {
          ...OrderMoney
        }
        shippingAddress {
          ...AddressFull
        }
        discountApplications(first: 100) {
          nodes {
            ...DiscountApplication
          }
        }
        lineItems(first: 100) {
          nodes {
            ...LineItemFull
          }
        }
      }
    }
  }
`;
