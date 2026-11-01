import { defer, redirect } from '@shopify/remix-oxygen';

import { routeHeaders } from '~/data/cache';

export const headers = routeHeaders;

export async function loader({ params, request, context }) {
  const { productHandle } = params;
  // return redirect(`/${productHandle}`);
  return redirect(`https://www.statewideapp.com.au/${productHandle}`, { status: 301 }); // Ensure 301 status
  
}