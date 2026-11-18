import {data as json, redirect} from 'react-router';
import {getPaginationVariables} from '@shopify/hydrogen';
import invariant from 'tiny-invariant';
import {CollectionPage, Article, AnnouncementDetail} from '~/components';
import {useLoaderData} from 'react-router';
import {seoPayload, customCollectionHeading} from '~/lib/seo.server';
import {metaDescription} from '../lib/meta-description.server';
import {
  COLLECTION_QUERY,
  getCollectionFilterTitle,
  addObjectIfNotExist
} from '~/lib/utils';
import { getCollectionDataUsingMetaobject } from '~/lib/shopifyAdminMetaobjects';
import {fetchAnnouncements} from '~/lib/announcements';
import {getRouteSeoMeta} from '~/lib/meta';

export const meta = ({matches}) => getRouteSeoMeta(matches);

export async function loader({params, request, context}) {
  const searchParams = new URL(request.url).searchParams;
  let seo;
  const model = searchParams.get('ModelNoId') || null;
  const announcementQuery = searchParams.get('s') || '';
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 20,
  });
  const {session} = context;
  const recentlyViewedBlogs  = await session.get('recentlyViewedBlogs') || "[]";
 
  let {brand, applianceType} = params;
  invariant(applianceType, 'Missing collectionHandle param');

  if (brand === 'announcement') {
    const announcements = await fetchAnnouncements(context.storefront);
    const announcement = announcements.find((item) => item.handle === applianceType);

    if (!announcement) {
      throw new Response('Not found', {status: 404});
    }

    return json({
      pageType: 'announcement-detail',
      announcement,
      announcements,
      announcementQuery,
    });
  }

  // ARTICLE_QUERY
  const {articles: articleSearch} = await context.storefront.query(ARTICLE_LOOKUP_QUERY, {
    variables: {
      language: context.storefront.i18n.language,
      articleQuery: `handle:${applianceType}`,
    },
  });
  const article = articleSearch?.nodes?.find((item) => item.handle === applianceType);

  if (article) {
    if (brand !== 'blogs') {
      return redirect(`/blogs/${applianceType}`, {status: 301});
    }

    const {blogs, articles} = await context.storefront.query(ARTICLE_SIDEBAR_QUERY, {
      variables: {
        language: context.storefront.i18n.language,
      },
    });

    const articleObj={
      handle:article.handle,
      title:article.title
    }
    const recentlyViewedBlogsUpdated= addObjectIfNotExist(JSON.parse(recentlyViewedBlogs),articleObj)
   
    if (recentlyViewedBlogsUpdated.length > 0) {
      session.set(
        'recentlyViewedBlogs',
        JSON.stringify(recentlyViewedBlogsUpdated),
      );
    }
    seo = seoPayload.article({article, url: request.url});
    return json({
      articles, article, seo, pageType:'article', blogs,recentlyViewedBlogs:JSON.parse(recentlyViewedBlogs)
    }, {
      headers: {
        'Set-Cookie': await session.commit(),
      },
    },);
  }
  // const existItem = prefixData.find((item)=> item.url == `/${brand}/${applianceType}`);
  const existItem = await getCollectionDataUsingMetaobject(`/${brand}/${applianceType}`,`fields.url:"/${brand}/${applianceType}"`,context.env);
  // console.log("existItem appliance type111",existItem)
  let meta = null;
 
  if(existItem){
    let brandCollection = existItem.brandCollection?.reference;
    let applianceCollection = existItem.applianceCollection?.reference;
    let partCollection = existItem.partCollection?.reference;
    const breadcrumbCollections = [
      brandCollection,
      applianceCollection,
      partCollection,
    ].filter(Boolean);
    let collection = brandCollection || applianceCollection || partCollection || null;
    if(brandCollection?.handle){
      meta = metaDescription.find((item)=> item.brand == brandCollection?.title && item.appliance_type ==  null &&  item.part_type == null )
    }else if(applianceCollection?.handle){
      meta = metaDescription.find((item)=> item.brand == null && item.appliance_type ==  applianceCollection?.title &&  item.part_type == null )
    }else if(partCollection?.handle){
      meta = metaDescription.find((item)=> item.brand == null && item.appliance_type ==  null &&  item.part_type == partCollection?.title )
    }
    if(collection){
      seo = seoPayload.customCollection({
        existItem,
        collection,
        meta,
        url: request.url,
        breadcrumbCollections,
      });
    }

    return json({
      searchQuery: existItem?.searchQuery,
      noFilter: existItem?.noFilter || false,
      item:{collection:collection, brandCollection:brandCollection, partCollection:partCollection, applianceCollection:applianceCollection, title:collection?.title, custom_title:existItem.custom_title, heading:customCollectionHeading({existItem, collection}), top_description:existItem.top_description, below_description:existItem.below_description},
      pageType: 'custom-collection',
      model, 
      seo
    });

    // let brandCollection = existItem.brandCollection?.reference;
    // let applianceCollection = existItem.applianceCollection?.reference;
    // let partCollection = existItem.partCollection?.reference;

    //  if(brandCollection?.handle && applianceCollection?.handle ){
    //     brand = brandCollection?.handle;
    //     applianceType = applianceCollection?.handle;
    //   }
    //   if(applianceCollection?.handle && partCollection?.handle ){
    //     brand = applianceCollection?.handle;
    //     applianceType = partCollection?.handle;
    //   } else if(brandCollection?.handle && partCollection?.handle ){
    //     brand = brandCollection?.handle;
    //     applianceType = partCollection?.handle;
    //   }

      // if(existItem.vendor && existItem.appliance_type ){
      //   brand = existItem.vendor;
      //   applianceType = existItem.appliance_type;
      // }
      // if(existItem.appliance_type && existItem.part_type ){
      //   brand = existItem.appliance_type;
      //   applianceType = existItem.part_type;
      // }
      // if(existItem.vendor && existItem.part_type ){
      //   brand = existItem.vendor;
      //   applianceType = existItem.part_type;
      // }
  }
   

  const brandCollection = await context.storefront.query(COLLECTION_QUERY, {
    variables: {
      ...paginationVariables,
      handle: brand,
      country: context.storefront.i18n.country,
      language: context.storefront.i18n.language,
    },
  });
  const applianceTypeCollection = await context.storefront.query(
    COLLECTION_QUERY,
    {
      variables: {
        ...paginationVariables,
        handle: applianceType,
        country: context.storefront.i18n.country,
        language: context.storefront.i18n.language,
      },
    },
  );
  // console.log("brandCollection brandCollection",brandCollection)
  // console.log("applianceTypeCollection applianceTypeCollection",applianceTypeCollection, applianceType)
  if (!applianceTypeCollection?.collection || !brandCollection?.collection) {
    throw new Response('collection', {status: 404});
  }else{
    
    if(applianceTypeCollection?.collection){
      seo = seoPayload.collection({
        collection: applianceTypeCollection?.collection,
        url: request.url,
        breadcrumbCollections: [
          brandCollection?.collection,
          applianceTypeCollection?.collection,
        ].filter(Boolean),
      });
    }else if(brandCollection?.collection){
      seo = seoPayload.collection({
        collection: brandCollection?.collection,
        url: request.url,
        breadcrumbCollections: [brandCollection?.collection].filter(Boolean),
      });
    }

    if(applianceTypeCollection?.collection && brandCollection?.collection){
      let meta = null;
      if(brandCollection?.collection?.type.value == "appliance_type" && applianceTypeCollection?.collection?.type.value == "part_type"){
        meta = metaDescription.find((item)=> item.brand == null && brandCollection?.collection?.title ==  item.appliance_type && applianceTypeCollection?.collection?.title ==  item.part_type )
      }else if(brandCollection?.collection?.type.value == "vendor" && applianceTypeCollection?.collection?.type.value == "part_type"){
        meta = metaDescription.find((item)=> brandCollection?.collection?.title == item.brand && item.appliance_type == null  && applianceTypeCollection?.collection?.title ==  item.part_type )
      }else if(brandCollection?.collection?.type.value == "vendor" && applianceTypeCollection?.collection?.type.value == "appliance_type"){
        meta = metaDescription.find((item)=> brandCollection?.collection?.title == item.brand && item.part_type == null  && applianceTypeCollection?.collection?.title ==  item.appliance_type )
      }
      if(meta){
        seo = seoPayload.collection({
          collection: {...brandCollection?.collection, ...meta, seo:{...meta}},
          url: meta?.url || request.url,
          breadcrumbCollections: [
            brandCollection?.collection,
            applianceTypeCollection?.collection,
          ].filter(Boolean),
        });
      }
    }
  }
  return json({
    brandCollection,
    applianceTypeCollection,
    model,
    seo
  });
}
export default function BrandPage() {

  let {applianceTypeCollection, brandCollection, model, pageType,
    item, article, articles, blogs,recentlyViewedBlogs,  announcement, announcements, announcementQuery, searchQuery, noFilter} =
    useLoaderData();
  
    // console.log("pageTypepageType",pageType)
  if(pageType == 'article'){
    return <Article article={article} recentlyViewedBlogs={recentlyViewedBlogs} articles={articles} blogs={blogs}/>
  }

  if (pageType === 'announcement-detail') {
    return (
      <AnnouncementDetail
        announcement={announcement}
        announcements={announcements}
        announcementQuery={announcementQuery}
      />
    );
  }

  const {vendor, appliance_type, part_type} = getCollectionFilterTitle(
    brandCollection, applianceTypeCollection  
  );


  if(pageType == 'custom-collection'){
    let collection = item?.collection ;
    return <CollectionPage
      custom={true}
      title={item?.heading || item?.custom_title?.value || item?.title}
      collection={collection}
      vendor={item?.brandCollection?.title?.replace(/ spare parts/g, '')}
      applianceType={item?.applianceCollection?.title?.replace(/ spare parts/g, '')}
      partType={item?.partCollection?.title?.replace(/ spare parts/g, '')}
      searchQuery={searchQuery || ""}
      noFilter={noFilter || false}
      model={model}
      item={item}
    />
  }

  if(brandCollection?.collection?.type.value == "appliance_type" && applianceTypeCollection?.collection?.type.value == "part_type"){
    if(applianceTypeCollection['collection']){
      // applianceTypeCollection['collection'] = brandCollection?.collection;
      applianceTypeCollection['collection']['image'] = brandCollection?.collection?.image;
      applianceTypeCollection['collection']['top_description'] = brandCollection?.collection?.top_description
      applianceTypeCollection['collection']['below_description'] = brandCollection?.collection?.below_description
      applianceTypeCollection['collection']['custom_images'] = brandCollection?.collection?.custom_images
      applianceTypeCollection['collection']['custom_images_for_mobile'] = brandCollection?.collection?.custom_images_for_mobile;
      applianceTypeCollection['collection']['custom_images_for_mobile'] = brandCollection?.collection?.custom_images_for_mobile;
      applianceTypeCollection['collection']['custom_images_for_mobile_nz'] = brandCollection?.collection?.custom_images_for_mobile_nz;
      applianceTypeCollection['collection']['custom_images_for_mobile_nz'] = brandCollection?.collection?.custom_images_for_mobile_nz;
    }
  }
  if(brandCollection?.collection?.type.value == "vendor" && applianceTypeCollection?.collection?.type.value == "part_type"){
    if(applianceTypeCollection['collection']){
      applianceTypeCollection['collection']['image'] = brandCollection?.collection?.image;
      applianceTypeCollection['collection']['top_description'] = brandCollection?.collection?.top_description
      applianceTypeCollection['collection']['below_description'] = brandCollection?.collection?.below_description

    }
  }

  if(brandCollection?.collection?.type.value == "vendor" && applianceTypeCollection?.collection?.type.value == "appliance_type"){
    if(applianceTypeCollection['collection']){
      applianceTypeCollection['collection']['image'] = brandCollection.collection.image;
    }
  }
  // console.log("testtt",brandCollection?.collection?.type.value, applianceTypeCollection?.collection?.type.value)
  // if(brandCollection?.collection?.top_description){
  //   if(applianceTypeCollection['collection']){
  //     applianceTypeCollection['collection']['top_description'] = brandCollection.collection.top_description
  //   }
  // }
  return (
    <CollectionPage
      collection={applianceTypeCollection.collection}
      vendor={vendor}
      applianceType={appliance_type}
      partType={part_type}
      model={model}
    />
  );
}

const ARTICLE_LOOKUP_QUERY = `#graphql
query ArticleLookup(
  $language: LanguageCode
  $articleQuery: String!
) @inContext(language: $language) {
  articles: search(
    query: $articleQuery
    first: 1
    types: ARTICLE
    reverse: true
    sortKey: RELEVANCE
  ) {
    nodes {
      ... on Article {
        author: authorV2 {
          name
        }
        contentHtml
        handle
        id
        image {
          id
          altText
          url
          width
          height
        }
        content
        seo {
          description
          title
        }
        excerpt
        desktop_image: metafield(namespace: "custom", key: "desktop_banner") {
          value
          reference {
            ... on MediaImage {
              id
              alt
              mediaContentType
              image {
                altText
                height
                id
                url
                width
              }
            }
          }
        }
        mobile_image: metafield(namespace: "custom", key: "mobile_banner") {
          value
          reference {
            ... on MediaImage {
              id
              alt
              mediaContentType
              image {
                altText
                height
                id
                url
                width
              }
            }
          }
        }
        blog {
          seo {
            description
            title
          }
          id
          title
          handle
        }
        publishedAt
        title
      }
    }
  }
}
`;

const ARTICLE_SIDEBAR_QUERY = `#graphql
query ArticleSidebar(
  $language: LanguageCode
) @inContext(language: $language) {
  articles(first: 13, sortKey:PUBLISHED_AT, reverse: true) {
    nodes{
      author: authorV2 {
        name
      }
      handle
      id
      image {
        id
        altText
        url
        width
        height
      }
      content
      seo {
        description
        title
      }
      excerpt
      blog {
        seo {
          description
          title
        }
        id
        title
        handle
      }
      publishedAt
      title
    }
  }
  blogs(first: 250) {
    nodes{
      title
      handle
    }
  }
}
`;