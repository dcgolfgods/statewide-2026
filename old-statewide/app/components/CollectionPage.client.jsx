import React, {useEffect, useState} from 'react';
import {useMatches} from '@remix-run/react';
import {createFetchRequester} from '@algolia/requester-fetch';
import algoliasearch from 'algoliasearch';
import {CollectionTemplate} from './CollectionTemplate';

const CollectionPage = ({
  collection,
  vendor,
  applianceType,
  partType,
  model,
  custom,
  title,
  item,
  searchQuery,
  noFilter,
}) => {
  const [searchClient, setSearchClient] = useState(null);
  const [root] = useMatches();

  useEffect(() => {
    const search = algoliasearch('CW8UTBJWAG', '9238d494978f4cb3614880a79561abfa', {
      requester: createFetchRequester(),
    });
    setSearchClient(search);
  }, []);

  return (
    <CollectionTemplate
      customer={root.data.customer}
      searchQuery={searchQuery}
      noFilter={noFilter}
      item={item}
      custom={custom}
      title={title}
      collection={collection}
      vendor={vendor}
      searchClient={searchClient}
      applianceType={applianceType}
      partType={partType}
      model={model}
    />
  );
};

export {CollectionPage};
