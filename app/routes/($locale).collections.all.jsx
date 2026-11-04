import {redirect} from 'react-router';
import {assertValidLocaleParam} from '~/lib/locale';

export async function loader({params}) {
  assertValidLocaleParam(params);
  return redirect(params?.locale ? `${params.locale}/products` : '/products');
}
