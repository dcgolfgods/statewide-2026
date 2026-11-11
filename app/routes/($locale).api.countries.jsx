import {data as json} from 'react-router';

import {CACHE_LONG} from '~/data/cache';
import {countries} from '~/data/countries';
import {assertValidLocaleParam} from '~/lib/locale';

export async function loader({params}) {
  assertValidLocaleParam(params);
  return json(
    {
      ...countries,
    },
    {
      headers: {
        'cache-control': CACHE_LONG,
      },
    },
  );
}

// no-op
export default function CountriesApiRoute() {
  return null;
}
