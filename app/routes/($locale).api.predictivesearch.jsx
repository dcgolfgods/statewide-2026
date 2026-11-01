import {redirect} from 'react-router';
import { getSearchDataRedirectByTag } from '~/lib/shopifyAdminMetaobjects';

export async function action({request, context: {storefront, env}}, params) {
  const form = await request.formData();
  let query = form.get('q');
  console.log('[predictivesearch] action hit, incoming q=', query);
  if(query){
    query = query.trim()
  }
  if (query && query.endsWith('/')) {
    query = query.slice(0, -1);
  }
  if(!query){
    return redirect(`/search`);
  }
  

  const keywords = ["spare", "spares", "spare parts", "spare part", "parts", "part"];
  query = query.toLowerCase();
  keywords.forEach(word => {
    query = query.replace(new RegExp(`\\b${word}\\b`, "g"), "").trim();
  });
  console.log('[predictivesearch] normalized q=', query);
  if(query == "ulx"){
    return redirect(`/search?q=ulx20`);
  }
  // if(query == "miele gn"){
  //   return redirect(`/miele-vacuum-bags-filters`);
  // }
  // console.log("query22222",query)
  const metaobjectMatch = env ? await getSearchDataRedirectByTag(env, query) : null;
  console.log("metaobjectMatch11111", metaobjectMatch, "query=", query);
  if (metaobjectMatch?.url) {
    return redirect(`${metaobjectMatch.url}`);
  } else {
    if(query){
      const data = await storefront.query(PREDICTIVE_SEARCH, {
        variables: {
          query: query,
          unavailableProducts: 'SHOW',
          searchableFields: 'TITLE',
          types: 'COLLECTION',
        },
      });
      const checkCollectionExist =
        data?.predictiveSearch?.collections?.length > 0
          ? data?.predictiveSearch?.collections[0]
          : '';
      
      
      let redirectTo = `search?q=${encodeURIComponent(query)}`;
      if (checkCollectionExist && checkCollectionExist?.title?.toLowerCase() == query?.toLowerCase()) {
        redirectTo = `${checkCollectionExist?.handle}`;
      }
      return redirect(`/${redirectTo}`);
    }else{
      return redirect(`/`);
    }
   
  }
}
// no-op
export default function Predictivesearch() {
  return null;
}
const PREDICTIVE_SEARCH = `#graphql
query PredictiveSearch($query: String!, $unavailableProducts: SearchUnavailableProductsType, $searchableFields: [SearchableField!], $types: [PredictiveSearchType!]) {
  predictiveSearch(query: $query, unavailableProducts: $unavailableProducts, searchableFields: $searchableFields, types: $types) {
    collections {
      handle
      title
    }
    queries {
      text
    }
  }
}
`;




// import {redirect} from 'react-router';

// import { prefixData } from '~/components';

// // Function to map abbreviations to full terms
// function expandAbbreviations(query) {
//   // Define full terms once
//   const fullTerms = {
//     'air conditioners': ['ac', 'air conditioner', 'a/c', 'a.c', "Air Con", "Airs Cons", "Airs Con", "Air Cons"],
//     'televisions': ['tv', 'television', 't/v', 't.v'],
//     "Washing machines":['Washing machine',"washer",'washers'],
//     "Vacuum cleaners":["Vacuum cleaner","Vac"],
//     "Airfryers":["Airfryer","Air Fryer","Air Fryers"],
//     "Power Tools":["Power tool","Power tools","Powers tool","Powers tools","Garden tools","Garden tool"],


//     // Add more full terms and their abbreviations here
//     // 'refrigerators': ['fridge', 'ref', 'refrigerator'],
//   };
  
//   const lowerQuery = query.toLowerCase();
  
//   // Check each full term's abbreviations
//   for (const [fullTerm, abbreviations] of Object.entries(fullTerms)) {
//     for (const abbreviation of abbreviations) {
//       // Use word boundaries to match whole words only
//       const wordBoundaryRegex = new RegExp(`\\b${abbreviation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
//       if (wordBoundaryRegex.test(lowerQuery)) {
//         return query.replace(wordBoundaryRegex, fullTerm);
//       }
//     }
//   }
//   return query;
// }

// export async function action({request, context: {storefront}}, params) {
//   const form = await request.formData();
//   let query = form.get('q');
//   if(query){
//     query = query.trim()
//   }
//   if (query.endsWith('/')) {
//     query = query.slice(0, -1);
//   }
//   if(!query){
//     return redirect(`/search`);
//   }
  

//   const keywords = ["spare", "spares", "spare parts", "spare part", "parts", "part"];
//   query = query.toLowerCase();
//   keywords.forEach(word => {
//     query = query.replace(new RegExp(`\\b${word}\\b`, "g"), "").trim();
//   });
//   const existItem = prefixData.find((item)=> item?.tags?.some(item => item.toLowerCase() === query.toLowerCase()));
//   console.log("existItem222",existItem)
//   if (existItem) {
//     // const encodedData = encodeURIComponent(JSON.stringify(data));
//   console.log("existItem.url",existItem.url)
//     return redirect(`${existItem.url}`);
//   } else {
//     if(query){

      
//       console.log("search query 1",query)

      
//       console.log("search query 2",query)

//       query = expandAbbreviations(query);
//       console.log("search query 3",query)

//       console.log("Final query", query)
//       const data = await storefront.query(PREDICTIVE_SEARCH, {
//         variables: {
//           query: query,
//           unavailableProducts: 'SHOW',
//           searchableFields: 'TITLE',
//           types: 'COLLECTION',
//         },
//       });
//       const checkCollectionExist =
//         data?.predictiveSearch?.collections?.length > 0
//           ? data?.predictiveSearch?.collections[0]
//           : '';
      
      
//       let redirectTo = `search?q=${encodeURIComponent(query)}`;
//       console.log("checkCollectionExist",checkCollectionExist, checkCollectionExist?.title?.toLowerCase() == query?.toLowerCase())
//       if (checkCollectionExist && checkCollectionExist?.title?.toLowerCase() == query?.toLowerCase()) {
//         redirectTo = `${checkCollectionExist?.handle}`;
//       }
//       return redirect(`/${redirectTo}`);
//     }else{
//       return redirect(`/`);
//     }
   
//   }
// }
// // no-op
// export default function Predictivesearch() {
//   return null;
// }
// const PREDICTIVE_SEARCH = `#graphql
// query PredictiveSearch($query: String!, $unavailableProducts: SearchUnavailableProductsType, $searchableFields: [SearchableField!], $types: [PredictiveSearchType!]) {
//   predictiveSearch(query: $query, unavailableProducts: $unavailableProducts, searchableFields: $searchableFields, types: $types) {
//     collections {
//       handle
//       title
//     }
//     queries {
//       text
//     }
//   }
// }
// `;


