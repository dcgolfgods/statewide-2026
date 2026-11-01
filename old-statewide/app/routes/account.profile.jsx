import {json, redirect} from '@shopify/remix-oxygen';
import {
   
    useActionData,

  } from '@remix-run/react';
export async function action({request, context}) {
  const {session, storefront} = context;

  if (request.method !== 'PUT') {
    return json({error: 'Method not allowed'}, {status: 405});
  }

  const form = await request.formData();
  const customerAccessToken = await session.get('customerAccessToken');
  if (!customerAccessToken) {
    return json({error: 'Unauthorized'}, {status: 401});
  }
  const password = getPassword(form);
  const customer = {};
  for (const [key, value] of form.entries()) {    
    if (typeof value === 'string' && value.length) {
        if(key !=="currentPassword" && key !== "newPassword"){
            customer[key] = value;
        }
  
    }
  }

  if (password) {
    customer.password = password;
  }
  try {
 

    // update customer and possibly password
    const updated = await storefront.mutate(CUSTOMER_UPDATE_MUTATION, {
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
      session.set(
        'customerAccessToken',
        updated.customerUpdate?.customerAccessToken.accessToken,
      );
    }

    return  json({error: null, customer: updated.customerUpdate?.customer},
      {
        headers: {
          'Set-Cookie': await session.commit(),
          "Content-Type": "application/json;",
        },
        status:200,
      },
    );
  } catch (error) {
    return json({error: error.message, customer: null}, {status: 400});
  }
}

export default function AccountProfile() {
    const data=useActionData()
  return null
}

function getPassword(form) {
  let password;
  const currentPassword = form.get('currentPassword');
  const newPassword = form.get('newPassword');
  let passwordError;
  if (newPassword && !currentPassword) {
    passwordError = new Error('Current password is required.');
  }

  if (newPassword && newPassword !== newPassword) {
    passwordError = new Error('New passwords must match.');
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
