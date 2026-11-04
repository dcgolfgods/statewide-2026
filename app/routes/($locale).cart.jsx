import {Await, useMatches} from 'react-router';
import invariant from 'tiny-invariant';
import {data as json, redirect} from 'react-router';
import {CartForm} from '@shopify/hydrogen';

import {isLocalPath} from '~/lib/utils';
import {Cart} from '~/components';
import {assertValidLocaleParam} from '~/lib/locale';

export async function action({request, context}) {
  const {session, cart} = context;

  // return redirect(`/`, { status: 301 });
  // const [formData, customerAccessToken] = await Promise.all([
  //   request.formData(),
  //   session.get('customerAccessToken'),
  // ]);

  // const {action, inputs} = CartForm.getFormInput(formData);
  // invariant(action, 'No cartAction defined');

  // let status = 200;
  // let result;

  // switch (action) {
  //   case CartForm.ACTIONS.LinesAdd:
  //     result = await cart.addLines(inputs.lines);
  //     break;
  //   case CartForm.ACTIONS.LinesUpdate:
  //     result = await cart.updateLines(inputs.lines);
  //     break;
  //   case CartForm.ACTIONS.LinesRemove:
  //     result = await cart.removeLines(inputs.lineIds);
  //     break;
  //   case CartForm.ACTIONS.DiscountCodesUpdate:
  //     const formDiscountCode = inputs.discountCode;

  //     // User inputted discount code
  //     const discountCodes = formDiscountCode ? [formDiscountCode] : [];

  //     // Combine discount codes already applied on cart
  //     discountCodes.push(...inputs.discountCodes);

  //     result = await cart.updateDiscountCodes(discountCodes);
  //     break;
  //   case CartForm.ACTIONS.BuyerIdentityUpdate:
  //     // result = await cart.updateBuyerIdentity({
  //     //   ...inputs.buyerIdentity,
  //     //   customerAccessToken,
  //     // });
  //     break;
  //   default:
  //     invariant(false, `${action} cart action is not defined`);
  // }

  // /**
  //  * The Cart ID may change after each mutation. We need to update it each time in the session.
  //  */
  // const cartId = result.cart.id;
  // const headers = cart.setCartId(result.cart.id);

  // const redirectTo = formData.get('redirectTo') ?? null;
  // if (typeof redirectTo === 'string' && isLocalPath(redirectTo)) {
  //   status = 303;
  //   headers.set('Location', redirectTo);
  // }

  // const {cart: cartResult, errors} = result;
  return json(
    {
      cart: null,
      errors : {},
      analytics: {
        // cartId,
      },
    },
  );
}

export async function loader({params}) {
  assertValidLocaleParam(params);
  return redirect(params?.locale ? `/${params.locale}` : '/', {status: 301});
}

export default function CartRoute() {
  const [root] = useMatches();
  // @todo: finish on a separate PR
  return (
    <div className="grid w-full gap-8 p-6 py-8 md:p-8 lg:p-12 justify-items-start">
      <Await resolve={root.data?.cart}>
        {(cart) => <Cart layout="page" cart={cart} />}
      </Await>
    </div>
  );
}
