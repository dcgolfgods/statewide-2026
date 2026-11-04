import {data as json, redirect} from 'react-router';
import { Form, useActionData, useNavigation, useLocation } from 'react-router';
import { useState } from 'react';

import { getInputStyleClasses } from '~/lib/utils';
import { Link } from '~/components';

import {getRouteSeoMeta} from '~/lib/meta';
import {assertValidLocaleParam} from '~/lib/locale';

export async function loader({ context, params }) {
  assertValidLocaleParam(params);
  const customerAccessToken = await context.session.get('customerAccessToken');

  if (customerAccessToken) {
    return redirect(params.locale ? `${params.locale}/account` : '/account');
  }

  return new Response(null);
}

const badRequest = (data) => json(data, { status: 400 });

function generatePassword(length = 16) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+<>?";
  let password = "";
  for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      password += chars[randomIndex];
  }
  return password;
}

export const action = async ({ request, context, params }) => {
  const { session, storefront } = context;
  const formData = await request.formData();
  const email=formData.get('email');
  const customer={
     email,
     password: generatePassword()
  }

  if (
    !email ||
    typeof email !== 'string'
  ) {
    return badRequest({
      formError: 'Please provide an email.',
    });
  }

  try {
      const data = await storefront.mutate(CUSTOMER_CREATE_MUTATION, {
        variables: {
          input: { ...customer },
        },
      });
      console.log("data",JSON.stringify(data), data?.customerCreate?.customer?.id)
      if (!data?.customerCreate?.customer?.id) {
        /**
         * Something is wrong with the user's input.
         */
        let actualMsg = data?.customerCreate?.customerUserErrors[0].message;
        let msg = `We have sent an email to ${email}, please click the link included to verify your email address.`;
        if(actualMsg == msg){
          // data.customerCreate?.customerUserErrors[0].message
          actualMsg = `An email has been sent to ${email}. Please click the activation link included in your email to verify your email address.`
        }
        return badRequest({
          formError: actualMsg
        });
      }
      if(data?.customerCreate?.customer?.id){
        
             return redirect(`/account/recover?email=${email}`);

        // return badRequest({
        //   formError:
        //     "We've sent a verification email to your inbox. Please verify your email first, then proceed with the password reset by following the instructions in the reset email.",
        // });
      }
  }catch (error) {
    console.log("customer error", error);
    if (storefront.isApiError(error)) {
      return badRequest({
        formError: 'Something went wrong. Please try again later.',
      });
    }

    /**
     * The user did something wrong, but the raw error from the API is not super friendly.
     * Let's make one up
     */
    return badRequest({
      formError:
        'Sorry. We could not create an account with this email. User might already exist, try to login instead.',
    });
  }
};

export const meta = ({ matches }) => {
  return getRouteSeoMeta(matches, { title: 'Register' });
};
const EyeOff = ({callback}) =>{
  return <div onClick={callback} className='top-[9px] absolute right-4 w-[20px] cursor-pointer'>
    <img className=' w-[20px]' src="https://cdn.shopify.com/s/files/1/0799/5929/4245/files/hide.png?v=1739300343"/>
  </div>
}
const Eye = ({callback}) =>{
  return <div onClick={callback} className='top-[9px] absolute right-4 w-[20px] cursor-pointer'>
    <img className=' w-[20px]' src="https://cdn.shopify.com/s/files/1/0799/5929/4245/files/view.png?v=1739300342"/>
  </div>
}
export default function Register() {
  const actionData = useActionData();
  const location = useLocation(); // Get the current location
  const transition = useNavigation();
  const [nativeEmailError, setNativeEmailError] = useState(null);
  return (
    <div className="max-w-[1140px] px-[15px] mx-auto my-[50px]">
      <div className="w-full mt-[20px]">
        <h1 className="text-[#1e5097] mb-[25px] text-center text-[24px] font-bold py-[6px] border-b-[1px] border-b-[#ccc]">
        <span className="mb-[8px] block">Activate your account</span>
        </h1>
        {/* TODO: Add onSubmit to validate _before_ submission with native? */}
        <Form
          method="post"
          noValidate
          autoComplete="off"
          className="max-w-[600px] mx-auto pt-6 pb-8 mt-4 mb-4 space-y-3"
        >
          
          <div>
          <div className='mb-[8px] flex justify-between items-center'>
            <label htmlFor='email' className='text-[16px] text-[#1e5097] font-bold'>Email *</label>
          </div>
          <div className=''>
            <input
              className={`text-black focus:border-[#ced4da] mb-1 ${getInputStyleClasses(nativeEmailError)}`}
              id="email"
              name="email"
              type="email"
              required
              placeholder="Email address"
              aria-label="Email address"
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              onBlur={(event) => {
                setNativeEmailError(
                  event.currentTarget.value.length &&
                    !event.currentTarget.validity.valid
                    ? 'Invalid email address'
                    : null,
                );
              }}
            />
            {nativeEmailError && (
              <p className="text-red-500 text-xs">{nativeEmailError} &nbsp;</p>
            )}
          </div>
          </div>


          <div className="flex items-center justify-center">
             <button
                      className={`bg-[#007bff] text-white rounded-[5px] uppercase min-w-[140px] py-[10px] no-underline px-[30px] border-[#007bff] 
                      ${transition.state === "submitting"?"btn--loading":""}
                      `}
                      type="submit"
                      disabled={!!(nativeEmailError)}
                    >
                     Activate account
                    </button>
          </div>
          {actionData?.formError && (
            <div className="flex p-4 flex-wrap items-center justify-center mb-6 border-[1px] border-red-500">
              <p className="text-sm text-red-500">{actionData.formError}</p>
            </div>
          )}
        
        </Form>
      </div>
    </div>
  );
}

const CUSTOMER_CREATE_MUTATION = `#graphql
  mutation customerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

// Admin API document (not validated by Storefront codegen)
const customerGenerateAccountActivationUrl = `
  mutation customerGenerateAccountActivationUrl($input: ID!) {
    customerGenerateAccountActivationUrl(input: $input) {
     accountActivationUrl
      userErrors {
        field
        message
      }
    }
  }
`;
