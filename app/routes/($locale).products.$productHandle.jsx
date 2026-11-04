import {redirect} from 'react-router';

import { routeHeaders } from '~/data/cache';
import {assertValidLocaleParam} from '~/lib/locale';

export const headers = routeHeaders;

export async function loader({ params, request, context }) {
  assertValidLocaleParam(params);
  const { productHandle } = params;
  // return redirect(`/${productHandle}`);
  return redirect(`https://www.statewideapp.com.au/${productHandle}`, { status: 301 }); // Ensure 301 status
  
}