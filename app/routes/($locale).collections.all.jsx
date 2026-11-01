import {redirect} from 'react-router';

export async function loader({params}) {
  return redirect(params?.locale ? `${params.locale}/products` : '/products');
}
