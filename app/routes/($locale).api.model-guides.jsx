import {data as json} from 'react-router';

import {CACHE_SHORT} from '~/data/cache';
import {getModelGuides} from '~/lib/modelGuide.server';

/**
 * Model number guide sections for the "find your model" popup. Resource route
 * (no default export), so a plain fetch() gets JSON rather than a page.
 */
export async function loader({context}) {
  const guides = await getModelGuides(context.storefront);
  return json(
    {guides},
    {
      headers: {
        'cache-control': CACHE_SHORT,
      },
    },
  );
}
