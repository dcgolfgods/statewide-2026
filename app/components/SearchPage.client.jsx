import React, {useEffect, useState} from 'react';
import {useMatches} from 'react-router';
import {createFetchRequester} from '@algolia/requester-fetch';
import algoliasearch from 'algoliasearch';
import {SearchTemplate} from './SearchTemplate';

const SearchPage = ({searchTerm}) => {
  const [searchClient, setSearchClient] = useState(null);
  const [root] = useMatches();

  useEffect(() => {
    const search = algoliasearch('CW8UTBJWAG', '9238d494978f4cb3614880a79561abfa', {
      requester: createFetchRequester(),
    });
    setSearchClient(search);
  }, []);

  return (
    <SearchTemplate
      customer={root.data.customer}
      searchTerm={searchTerm.endsWith('/') ? searchTerm.slice(0, -1) : searchTerm}
      searchClient={searchClient}
    />
  );
};

export {SearchPage};
