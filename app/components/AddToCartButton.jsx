import {
  AnalyticsEventName,
  CartForm,
  getClientBrowserParameters,
  sendShopifyAnalytics,
} from '@shopify/hydrogen';
import {useEffect} from 'react';

import {Button} from '~/components';
import {usePageAnalytics} from '~/hooks/usePageAnalytics';
import {getShopifyTrackingParameters} from '~/lib/shopifyAnalytics';

export function AddToCartButton({
  children,
  lines,
  className = '',
  parentClass = "",
  variant = 'primary',
  width = 'full',
  disabled,
  analytics,
  ...props
}) {
  return (
    <CartForm
      className={parentClass}
      route="/cart"
      inputs={{
        lines,
      }}
      action={CartForm.ACTIONS.LinesAdd}
    >
      {(fetcher) => {
        return (
          <AddToCartAnalytics  className={parentClass} fetcher={fetcher}>
            <input
              type="hidden"
              name="analytics"
              value={JSON.stringify(analytics)}
            />
            <button
              as="button"
              type="submit"
              width={width}
              variant={variant}
              className={`bg-[#00aeef] text-white h-[40px] text-[15px] px-[24px] font-[600] w-full ${className}`}
              disabled={disabled ?? fetcher.state !== 'idle'}
              {...props}
            >
              {fetcher.state == "loading" || fetcher.state == "submitting" ? "ADDING ITEM..." : children}
            </button>
          </AddToCartAnalytics>
        );
      }}
    </CartForm>
  );
}

function AddToCartAnalytics({fetcher, children}) {
  const fetcherData = fetcher.data;
  const formData = fetcher.formData;
  const pageAnalytics = usePageAnalytics({hasUserConsent: true});

  useEffect(() => {
    if (formData) {
      const cartData = {};
      const cartInputs = CartForm.getFormInput(formData);

      try {
        if (cartInputs.inputs.analytics) {
          const dataInForm = JSON.parse(String(cartInputs.inputs.analytics));
          Object.assign(cartData, dataInForm);
        }
      } catch {
        // do nothing
      }

      if (Object.keys(cartData).length && fetcherData) {
        const addToCartPayload = {
          ...getClientBrowserParameters(),
          ...getShopifyTrackingParameters(),
          ...pageAnalytics,
          ...cartData,
          cartId: fetcherData.cart.id,
        };

        sendShopifyAnalytics({
          eventName: AnalyticsEventName.ADD_TO_CART,
          payload: addToCartPayload,
        });
      }
    }
  }, [fetcherData, formData, pageAnalytics]);
  return <>{children}</>;
}
