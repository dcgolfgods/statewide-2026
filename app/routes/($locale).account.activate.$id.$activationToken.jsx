import {data as json, redirect} from 'react-router';
import {Form, useActionData} from 'react-router';
import {useRef, useState} from 'react';

import {getInputStyleClasses} from '~/lib/utils';
import {getRouteSeoMeta} from '~/lib/meta';

const badRequest = (data) => json(data, {status: 400});

export const handle = {
  isPublic: true,
};

export const action = async ({
  request,
  context,
  params: {locale, id, activationToken},
}) => {
  if (
    !id ||
    !activationToken ||
    typeof id !== 'string' ||
    typeof activationToken !== 'string'
  ) {
    return badRequest({
      formError: 'Wrong token. The link you followed might be wrong.',
    });
  }

  const formData = await request.formData();

  const password = formData.get('password');
  const passwordConfirm = formData.get('passwordConfirm');

  if (
    !password ||
    !passwordConfirm ||
    typeof password !== 'string' ||
    typeof passwordConfirm !== 'string' ||
    password !== passwordConfirm
  ) {
    return badRequest({
      formError: 'Please provide matching passwords',
    });
  }

  const {session, storefront} = context;

  try {
    const data = await storefront.mutate(CUSTOMER_ACTIVATE_MUTATION, {
      variables: {
        id: `gid://shopify/Customer/${id}`,
        input: {
          password,
          activationToken,
        },
      },
    });

    const {accessToken} = data?.customerActivate?.customerAccessToken ?? {};

    if (!accessToken) {
      /**
       * Something is wrong with the user's input.
       */
      throw new Error(data?.customerActivate?.customerUserErrors.join(', '));
    }

    session.set('customerAccessToken', accessToken);

    return redirect(locale ? `${locale}/account` : '/account', {
      headers: {
        'Set-Cookie': await session.commit(),
      },
    });
  } catch (error) {
    if (storefront.isApiError(error)) {
      return badRequest({
        formError: 'Something went wrong. Please try again later.',
      });
    }

    /**
     * The user did something wrong, but the raw error from the API is not super friendly.
     * Let's make one up.
     */
    return badRequest({
      formError: 'Sorry. We could not activate your account.',
    });
  }
};

export const meta = ({matches}) => {
  return getRouteSeoMeta(matches, {title: 'Activate Account'});
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

export default function Activate() {
  const actionData = useActionData();
  const [nativePasswordError, setNativePasswordError] = useState(null);
  const [nativePasswordConfirmError, setNativePasswordConfirmError] =
    useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showCPassword, setShowCPassword] = useState(false)

  const passwordInput = useRef(null);
  const passwordConfirmInput = useRef(null);

  const validatePasswordConfirm = () => {
    if (!passwordConfirmInput.current) return;

    if (
      passwordConfirmInput.current.value.length &&
      passwordConfirmInput.current.value !== passwordInput.current?.value
    ) {
      setNativePasswordConfirmError('The two passwords entered did not match.');
    } else if (
      passwordConfirmInput.current.validity.valid ||
      !passwordConfirmInput.current.value.length
    ) {
      setNativePasswordConfirmError(null);
    } else {
      setNativePasswordConfirmError(
        passwordConfirmInput.current.validity.valueMissing
          ? 'Please re-enter the password'
          : 'Passwords must be at least 8 characters',
      );
    }
  };

  return (
    <div className="flex justify-center my-24 px-4">
      <div className="max-w-md w-full">
        <h1 className="text-[#1e5097] mb-[25px] text-center text-[24px] font-bold py-[6px] border-b-[1px] border-b-[#ccc]"><span className="mb-[8px] block">Activate account</span></h1>
        <p className="text-[#1e5097] mt-4">Create your password to activate your account.</p>
        {/* TODO: Add onSubmit to validate _before_ submission with native? */}
        <Form
          method="post"
          noValidate
          className="pt-6 pb-8 mt-4 mb-4 space-y-3"
        >
          {actionData?.formError && (
            <div className="flex items-center justify-center mb-6 bg-zinc-500">
              <p className="m-4 text-s text-contrast">{actionData.formError}</p>
            </div>
          )}
          <div className="mb-[16px]">
            <div className="text-left mb-2"><label for="password" className="text-[16px] text-[#1e5097] font-bold ">Password</label></div>
            <div className='w-full relative'>
            {showPassword ? <EyeOff callback={()=> setShowPassword(false)} size={20} /> : <Eye callback={()=> setShowPassword(true)} size={20} />}
            <input
              ref={passwordInput}
              className={`text-black focus:border-[#ced4da] mb-1 ${getInputStyleClasses(nativePasswordError)}`}
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Password"
              aria-label="Password"
              minLength={8}
              required
              // eslint-disable-next-line jsx-a11y/no-autofocus
              onBlur={(event) => {
                if (
                  event.currentTarget.validity.valid ||
                  !event.currentTarget.value.length
                ) {
                  setNativePasswordError(null);
                  validatePasswordConfirm();
                } else {
                  setNativePasswordError(
                    event.currentTarget.validity.valueMissing
                      ? 'Please enter a password'
                      : 'Passwords must be at least 8 characters',
                  );
                }
              }}
            />
            {nativePasswordError && (
              <p className="text-red-500 text-xs">
                {' '}
                {nativePasswordError} &nbsp;
              </p>
            )}
            </div>
            
          </div>
          <div className="mb-[16px] ">
            <div className="text-left mb-2"><label for="password" className="text-[16px] text-[#1e5097] font-bold">Confirm password</label></div>
            <div className='w-full relative'>
            {showCPassword ? <EyeOff callback={()=> setShowCPassword(false)} size={20} /> : <Eye callback={()=> setShowCPassword(true)} size={20} />}
            <input
              ref={passwordConfirmInput}
              className={`mb-1 ${getInputStyleClasses(
                nativePasswordConfirmError,
              )}`}
              id="passwordConfirm"
              name="passwordConfirm"
              type={showCPassword ? 'text' : 'password'}
              placeholder="Re-enter password"
              aria-label="Re-enter password"
              minLength={8}
              required
              // eslint-disable-next-line jsx-a11y/no-autofocus
              onBlur={validatePasswordConfirm}
            />
            {nativePasswordConfirmError && (
              <p className="text-red-500 text-xs">
                {' '}
                {nativePasswordConfirmError} &nbsp;
              </p>
            )}
          </div>
          </div>
          <div className="flex items-center justify-center">
            <button
              className="bg-[#007bff] text-white rounded-[5px] uppercase min-w-[140px] py-[10px] no-underline px-[30px] border-[#007bff]"
              type="submit"
            >
              Save
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}

const CUSTOMER_ACTIVATE_MUTATION = `#graphql
  mutation customerActivate($id: ID!, $input: CustomerActivateInput!) {
    customerActivate(id: $id, input: $input) {
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
