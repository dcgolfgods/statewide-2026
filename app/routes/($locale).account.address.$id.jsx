import {data as json, redirect} from 'react-router';
import {
  Form,
  useActionData,
  useOutletContext,
  useParams,
  useNavigation,
} from 'react-router';
import {flattenConnection} from '@shopify/hydrogen';
import invariant from 'tiny-invariant';

import {Button, Text} from '~/components';
import {assertApiErrors, getInputStyleClasses} from '~/lib/utils';

const badRequest = (data) => json(data, {status: 400});

export const handle = {
  renderInModal: true,
};

export const action = async ({request, context, params}) => {
  const {storefront, session} = context;
  const formData = await request.formData();

  const customerAccessToken = await session.get('customerAccessToken');
  invariant(customerAccessToken, 'You must be logged in to edit your account.');

  const addressId = formData.get('addressId');
  invariant(typeof addressId === 'string', 'You must provide an address id.');

  if (request.method === 'DELETE') {
    try {
      const data = await storefront.mutate(DELETE_ADDRESS_MUTATION, {
        variables: {customerAccessToken, id: addressId},
      });

      assertApiErrors(data.customerAddressDelete);

      return redirect(params.locale ? `${params.locale}/account` : '/account');
    } catch (error) {
      return badRequest({formError: error.message});
    }
  }

  const address = {};

  const keys = [
    'lastName',
    'firstName',
    'address1',
    'address2',
    'city',
    'province',
    'country',
    'zip',
    'phone',
    'company',
  ];

  for (const key of keys) {
    const value = formData.get(key);
    if (typeof value === 'string') {
      address[key] = value;
    }
  }

  const defaultAddress = formData.get('defaultAddress');
  console.log("defaultAddress",defaultAddress, addressId)
  if (addressId === 'add') {
    try {
      const data = await storefront.mutate(CREATE_ADDRESS_MUTATION, {
        variables: {customerAccessToken, address},
      });

      assertApiErrors(data.customerAddressCreate);

      const newId = data.customerAddressCreate?.customerAddress?.id;
      invariant(newId, 'Expected customer address to be created');

      if (defaultAddress) {

        const data = await storefront.mutate(UPDATE_DEFAULT_ADDRESS_MUTATION, {
          variables: {customerAccessToken, addressId: newId},
        });
        assertApiErrors(data.customerDefaultAddressUpdate);
      }

      return redirect(params.locale ? `${params.locale}/account` : '/account');
    } catch (error) {
      return badRequest({formError: error.message});
    }
  } else {
    try {
      const data = await storefront.mutate(UPDATE_ADDRESS_MUTATION, {
        variables: {
          address,
          customerAccessToken,
          id: decodeURIComponent(addressId),
        },
      });

      assertApiErrors(data.customerAddressUpdate);

      if (defaultAddress) {
        const data = await storefront.mutate(UPDATE_DEFAULT_ADDRESS_MUTATION, {
          variables: {
            customerAccessToken,
            addressId: decodeURIComponent(addressId),
          },
        });
        console.log("data data data", data)

        assertApiErrors(data.customerDefaultAddressUpdate);
      }

      return redirect(params.locale ? `${params.locale}/account` : '/account');
    } catch (error) {
      return badRequest({formError: error.message});
    }
  }
};

export default function EditAddress() {
  return null
}

const UPDATE_ADDRESS_MUTATION = `#graphql
  mutation customerAddressUpdate(
    $address: MailingAddressInput!
    $customerAccessToken: String!
    $id: ID!
  ) {
    customerAddressUpdate(
      address: $address
      customerAccessToken: $customerAccessToken
      id: $id
    ) {
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

const DELETE_ADDRESS_MUTATION = `#graphql
  mutation customerAddressDelete($customerAccessToken: String!, $id: ID!) {
    customerAddressDelete(customerAccessToken: $customerAccessToken, id: $id) {
      customerUserErrors {
        code
        field
        message
      }
      deletedCustomerAddressId
    }
  }
`;

const UPDATE_DEFAULT_ADDRESS_MUTATION = `#graphql
  mutation customerDefaultAddressUpdate(
    $addressId: ID!
    $customerAccessToken: String!
  ) {
    customerDefaultAddressUpdate(
      addressId: $addressId
      customerAccessToken: $customerAccessToken
    ) {
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

const CREATE_ADDRESS_MUTATION = `#graphql
  mutation customerAddressCreate(
    $address: MailingAddressInput!
    $customerAccessToken: String!
  ) {
    customerAddressCreate(
      address: $address
      customerAccessToken: $customerAccessToken
    ) {
      customerAddress {
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
