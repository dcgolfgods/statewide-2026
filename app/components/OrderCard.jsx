import {flattenConnection, Image} from '@shopify/hydrogen';
import {Heading, Text, Link} from '~/components';
import {statusMessage} from '~/lib/utils';

export function OrderCard({order}) {
  if (!order?.id) return null;
  console.log(order, 'order');
  const [legacyOrderId, key] = order.id.split('/').pop().split('?');
  const lineItems = flattenConnection(order?.lineItems);
  
  // Parse the fulfillment data from metafield
  const fulfillmentDataRaw = order.fulfillmentData?.value ? JSON.parse(order.fulfillmentData.value) : null;
  let fulfillment = fulfillmentDataRaw?.[0]; // Get the first fulfillment record
  if(!fulfillment?.created_at && fulfillment?.createdAt){
    fulfillment.created_at = fulfillment.createdAt;
  }
  // Add a function to get a human-readable status
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
        // Check fulfillmentStatus for more info
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
    <li className="text-center gap-2 border rounded-sm flex justify-between flex-wrap h-full">
      <div className="block h-order-card">
        <Link
          to={`/account/orders/${legacyOrderId}?${key}`}
          prefetch="intent"
        >
          <div className="card-image bg-primary/5">
            <Image
              className="object-contain h-full w-full fadeIn"
              alt={lineItems[0].variant?.image?.altText ?? 'Order image'}
              src={lineItems[0].variant?.image?.url ?? 'https://cdn.shopify.com/s/files/1/0799/5929/4245/files/Image_coming_soon_Website.webp?v=1724582291'}
            />
          </div>
          <div className={`block`}>
            <h4 className='hover:underline mb-2 break-words px-[4px] lg:px-4 w-full  text-[11px] lg:text-[12.8px] text-left text-black'>
              {lineItems.length > 1
                ? `${lineItems[0].title} +${lineItems.length - 1} more`
                : lineItems[0].title}
            </h4>
            <div className='px-[4px] lg:px-4 w-full  text-[11px] lg:text-[12.8px] text-left text-black'>
              <dl className="text-black text-left">
                <dd className='leading-[10px]'>
                  <span className='flex'>
                    <strong className="min-w-[78px] inline-block">Order no:</strong> <span>{order.orderNumber}</span>
                  </span>
                </dd>
                <div className='flex'>
                  <dt className="min-w-[78px] inline-block"><strong>Order date:</strong></dt>
                  <dd>
                    <span className='inline-block'>
                      {new Date(order.processedAt).getDate()} {/* day */}
                      {' '}
                      {new Date(order.processedAt).toLocaleString('en-GB', { month: 'short' })} {/* month as "May" */}
                      {' '}
                      {new Date(order.processedAt).getFullYear()} {/* year */}
                    </span>
                  </dd>
                </div>
                
                {fulfillment ? (
                  <>
                    <div className='flex'>
                      <dt className="min-w-[78px] inline-block"><strong>Shipped:</strong></dt>
                      <dd>
                        <span className='inline-block'>
                          {new Date(fulfillment.created_at).getDate()}{' '}
                          {new Date(fulfillment.created_at).toLocaleString('en-GB', { month: 'short' })}{' '}
                          {new Date(fulfillment.created_at).getFullYear()}
                        </span>
                      </dd>
                    </div>
                    {fulfillment.trackingInfo?.[0] && (
                      <div className='flex flex-wrap'>
                        <dt className="min-w-[78px] inline-block"><strong>Tracking:</strong></dt>
                        <dd className="flex-1 min-w-0">
                          <a 
                            href={fulfillment.trackingInfo[0].url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline break-all"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {fulfillment.trackingInfo[0].number} ({fulfillment.trackingInfo[0].company})
                          </a>
                        </dd>
                      </div>
                    )}
                    <div className='flex'>
                      <dt className="min-w-[78px] inline-block"><strong>Status:</strong></dt>
                      <dd>
                        <span className='inline-block'>
                          {getOrderStatus(order)}
                        </span>
                      </dd>
                    </div>
                  </>
                ) : (
                  <div className='flex'>
                    <dt className="min-w-[78px] inline-block"><strong>Status:</strong></dt>
                    <dd>
                      <span className='inline-block'>
                        {getOrderStatus(order)}
                      </span>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </Link>
      </div>
      <div className="block w-full h-[40px]">
        <Link
          className="transition delay-150 duration-300 flex justify-center items-center hover:bg-[#0069d9] py-[6px] bg-[#00aeef] text-white h-[40px] text-[15px] px-[24px] font-[600] w-full"
          to={`/account/orders/${legacyOrderId}?${key}`}
          prefetch="intent"
        >
          View Details
        </Link>
      </div>
    </li>
  );
}

export const ORDER_CARD_FRAGMENT = `#graphql
  fragment OrderCard on Order {
    id
    orderNumber
    processedAt
    financialStatus
    fulfillmentStatus
    currentTotalPrice {
      amount
      currencyCode
    }
    fulfillmentData: metafield(namespace: "custom", key: "order_fulfillments") {
      value
    }
    lineItems(first: 2) {
      edges {
        node {
          variant {
            image {
              url
              altText
              height
              width
            }
          }
          title
        }
      }
    }
  }
`;
