import {json, redirect} from '@shopify/remix-oxygen';
import {Form, useActionData, useSearchParams} from '@remix-run/react';
import {useState, useEffect, useRef} from 'react';

import {Link} from '~/components';
import {getInputStyleClasses} from '~/lib/utils';

export async function loader({context, params}) {
  const customerAccessToken = await context.session.get('customerAccessToken');

  if (customerAccessToken) {
    return redirect(params.locale ? `${params.locale}/account` : '/account');
  }

  return new Response(null);
}

const badRequest = (data) => json(data, {status: 400});

export const action = async ({request, context}) => {
  const formData = await request.formData();
  let email = formData.get('email');
  const url = new URL(request.url);
  console.log("email",url.searchParams.get("email"))
  if(!email && url.searchParams.get("email")){
    email = url.searchParams.get("email");
  }
  if (!email || typeof email !== 'string') {
    return badRequest({
      formError: 'Please provide an email.',
    });
  }

  try {
    await context.storefront.mutate(CUSTOMER_RECOVER_MUTATION, {
      variables: {email},
    });

    return json({resetRequested: true});
  } catch (error) {
    return badRequest({
      formError: 'Something went wrong. Please try again later.',
    });
  }
};

export const meta = () => {
  return [{title: 'Recover Password'}];
};

export default function Recover() {
  const actionData = useActionData();
  const [nativeEmailError, setNativeEmailError] = useState(null);
  const isSubmitted = actionData?.resetRequested;
  const [searchParams] = useSearchParams();
  const emailFromParams = searchParams.get('email');
  const formRef = useRef(null);
  const [email, setEmail] = useState("")
  useEffect(() => {
    if (emailFromParams && formRef.current) {
      // setEmail(emailFromParams)
      // setTimeout(()=>{
        formRef.current.submit();
      // }, 3000)
    }
  }, [emailFromParams]);
  return (
    <div className="max-w-[1140px] px-[15px] mx-auto my-[50px]">
      <div className="w-full mt-[20px]">
        {isSubmitted ? (
          <>
            <h1 className="text-[#1e5097] mb-[25px] text-center text-[24px] font-bold py-[6px] border-b-[1px] border-b-[#ccc]">
          <span className='mb-[8px] block'>Request Sent.</span>
        </h1>
        <div className='max-w-[450px] mx-auto'>
            <p className="mt-4">
              If that email address is in our system, you will receive an email
              with instructions about how to reset your password in a few
              minutes.
            </p>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-[#1e5097] mb-[25px] text-center text-[24px] font-bold py-[6px] border-b-[1px] border-b-[#ccc]">
          <span className='mb-[8px] block'>Password reset</span>
        </h1>

            {/* TODO: Add onSubmit to validate _before_ submission with native? */}
            <div className='max-w-[450px] mx-auto'>
            <p className="mt-4">
            Please verify your email address and reset your password
            </p>
            <Form
              method="post"
              noValidate
              className="pt-6 pb-8 mt-4 mb-4 space-y-3"
              ref={formRef}
            >
              {actionData?.formError && (
                <div className="flex items-center justify-center mb-6 bg-zinc-500">
                  <p className="m-4 text-s text-contrast">
                    {actionData.formError}
                  </p>
                </div>
              )}
              <div>
                <input
                  className={`mb-1 ${getInputStyleClasses(nativeEmailError)}`}
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="Email address"
                  aria-label="Email address"
                  value={email}
                  // eslint-disable-next-line jsx-a11y/no-autofocus
                  onChange={(e)=> setEmail(e.target.value)}
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
                  <p className="text-red-500 text-xs">
                    {nativeEmailError} &nbsp;
                  </p>
                )}
              </div>
              <div className="flex items-center justify-center">
                <button
                  className="bg-[#007bff] text-white rounded-[5px] uppercase min-w-[140px] py-[10px] no-underline px-[30px] border-[#007bff]"
                  type="submit"
                >
                  Reset
                </button>
              </div>
              <div className="flex items-center mt-8 border-t border-gray-300">
                <p className="align-cenetr text-sm mt-6 justify-center">
                  Return to &nbsp;
                  <Link className="inline underline" to="/login">
                    Login
                  </Link>
                </p>
              </div>
            </Form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const CUSTOMER_RECOVER_MUTATION = `#graphql
  mutation customerRecover($email: String!) {
    customerRecover(email: $email) {
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;
