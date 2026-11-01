import {useEffect, useState} from 'react';
import {Form} from '@remix-run/react';
import {Input} from './Input';

/**
 * SSR shell: keeps header search usable before hydration.
 * Algolia predictive UI lives in SearchForm.client.jsx (excluded from server bundle).
 */
const SearchForm = (props) => {
  const [ClientComponent, setClientComponent] = useState(null);
  const {params} = props;
  const searchFormAction = params?.locale
    ? `/${params.locale}/api/predictivesearch`
    : '/api/predictivesearch';

  useEffect(() => {
    let isMounted = true;
    import('./SearchForm.client').then((mod) => {
      if (isMounted) {
        setClientComponent(() => mod.SearchForm);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  if (ClientComponent) {
    return <ClientComponent {...props} />;
  }

  return (
    <Form
      method="POST"
      action={searchFormAction}
      className="relative lg:w-[90%] mx-auto flex items-center w-full text-[#00aeef] search-form"
    >
      <label htmlFor="header-search-input" className="sr-only">
        Search spare parts
      </label>
      <Input
        id="header-search-input"
        className="text-[11.2px] w-full placeholder:text-black rounded-md text-black border-2 border-[#00aeef] focus:border-[#00aeef] h-[40px]"
        type="search"
        placeholder="Start typing a brand, appliance, part no. or model no."
        autoComplete="off"
        variant="minisearch"
        name="q"
        data-copy-allowed="true"
      />
      <button
        type="submit"
        className="absolute top-1/2 transform right-[4px] -translate-y-1/2 flex items-center justify-center w-8 h-8"
        aria-label="Search spare parts"
      >
        <i className="fa fa-search text-[20px]" aria-hidden="true"></i>
      </button>
    </Form>
  );
};

export {SearchForm};
