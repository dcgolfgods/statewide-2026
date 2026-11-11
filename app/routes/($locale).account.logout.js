import {redirect} from 'react-router';
import {assertValidLocaleParam} from '~/lib/locale';

export async function doLogout(context) {
  const {session} = context;
  session.unset('customerAccessToken');

  // Create headers with session cookie
  const headers = new Headers();
  headers.append('Set-Cookie', await session.commit());


  // Redirect to home page to avoid redirect loops
  return redirect('/', {
    headers,
  });
}

export async function loader({context, params}) {
  assertValidLocaleParam(params);
  // Handle GET requests by performing logout directly
  return doLogout(context);
}

export const action = async ({context, params}) => {
  assertValidLocaleParam(params);
  return doLogout(context);
};
