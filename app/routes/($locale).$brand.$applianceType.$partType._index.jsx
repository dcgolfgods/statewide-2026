import {data as json} from 'react-router';
import { getPaginationVariables } from '@shopify/hydrogen';
import invariant from 'tiny-invariant';
import { COLLECTION_QUERY, getCollectionFilterTitle, BLOGS_QUERY, CUSTOME_COLLECTION_QUERY } from '~/lib/utils'
import { CollectionPage, BlogsPage } from '~/components';
import { useLoaderData } from 'react-router';
import {seoPayload} from '~/lib/seo.server';
import {metaDescription} from '../lib/meta-description.server'
import { getCollectionDataUsingMetaobject } from '~/lib/shopifyAdminMetaobjects';

export async function loader({ params, request, context }) {
  const searchParams = new URL(request.url).searchParams;
  let seo;
  const model = searchParams.get("ModelNoId")
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 20,
  });
  let { brand, applianceType, partType } = params;
  if(brand=="blogs" && applianceType == "category"){
    const {blogs,articles} = await context.storefront.query(BLOGS_QUERY, {
      variables: {
        language: context.storefront.i18n.language,
      },
    });
    if(articles?.nodes.length <= 0){
      throw new Response('Not found', {status: 404});
    }
    let blog = blogs.nodes.find((item)=> item.handle == partType)
    seo = seoPayload.blog({blog, url: request.url});
    const {session} = context;
    const recentlyViewedBlogs  = await session.get('recentlyViewedBlogs') || "[]";
    return json({
      articles, blog, seo, pageType:'blogs', blogs,recentlyViewedBlogs:JSON.parse(recentlyViewedBlogs)
    });
  }
  
  invariant(applianceType, 'Missing collectionHandle param');

  // const existItem = prefixData.find((item)=> item.url == `/${brand}/${applianceType}/${partType}`);
  const existItem = await getCollectionDataUsingMetaobject(`/${brand}/${applianceType}/${partType}`,`fields.url:"/${brand}/${applianceType}/${partType}"`,context.env);
  // console.log("existItem part type",existItem)
//  
console.log("existItem",existItem)
  if(existItem){
    // console.log("existItem",existItem)

    brand = existItem.brandCollection?.reference?.handle || brand;
    applianceType = existItem.applianceCollection?.reference?.handle || applianceType;
    partType = existItem.partCollection?.reference?.handle || partType;
   

    // console.log("brand",brand)
    // console.log("applianceType",applianceType)
    // console.log("partType",partType)
    // brand = existItem.vendor;
    // applianceType = existItem.appliance_type;
    // partType = existItem.part_type
  }

  const brandCollection = await context.storefront.query(
    COLLECTION_QUERY,
    {
      variables: {
        ...paginationVariables,
        handle: brand,
        country: context.storefront.i18n.country,
        language: context.storefront.i18n.language,
      },
    },
  );
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

  const partTypeCollection = await context.storefront.query(
    COLLECTION_QUERY,
    {
      variables: {
        ...paginationVariables,
        handle: partType,
        country: context.storefront.i18n.country,
        language: context.storefront.i18n.language,
      },
    },
  );

  // console.log("applianceTypeCollection",applianceTypeCollection)
  console.log("applianceTypeCollection",applianceTypeCollection)
  console.log("brandCollection",brandCollection)
  console.log("partTypeCollection",partTypeCollection)
  if (!applianceTypeCollection?.collection && !brandCollection?.collection && !partTypeCollection?.collection) {
    console.log("Notfound part type")
    throw new Response('collection', { status: 404 });
  }else{
    const breadcrumbCollections = [
      brandCollection?.collection,
      applianceTypeCollection?.collection,
      partTypeCollection?.collection,
    ].filter(Boolean);
    if(partTypeCollection?.collection){
      seo = seoPayload.collection({
        collection: partTypeCollection?.collection,
        url: request.url,
        breadcrumbCollections,
      });
    }else if(applianceTypeCollection?.collection){
      seo = seoPayload.collection({
        collection: applianceTypeCollection?.collection,
        url: request.url,
        breadcrumbCollections,
      });
    }else if(brandCollection?.collection){
      seo = seoPayload.collection({
        collection: brandCollection?.collection,
        url: request.url,
        breadcrumbCollections,
      });
    }
    if(applianceTypeCollection?.collection && brandCollection?.collection){
      let meta = metaDescription.find((item)=> item.brand == brandCollection?.collection?.title && applianceTypeCollection?.collection?.title ==  item.appliance_type && partTypeCollection?.collection?.title ==  item.part_type );
      if(meta){
          seo = seoPayload.collection({
            collection: {...brandCollection?.collection, ...meta, seo:{...meta}},
            url: meta?.url || request.url,
            breadcrumbCollections,
          });
      }
    }
  }
  return json({
    brandCollection,
    applianceTypeCollection,
    partTypeCollection,
    model,
    seo
  });
}
export default function BrandPage() {
  let { applianceTypeCollection, brandCollection, partTypeCollection, model, blogs, blog, articles, pageType,recentlyViewedBlogs, item } = useLoaderData();
  if(pageType == 'blogs'){
    return <BlogsPage recentlyViewedBlogs={recentlyViewedBlogs} blogs={blogs} blog={blog} articles={articles} />
  }
  if(pageType == 'custom-collection'){
    let collection = item?.vendor ;
    if(!collection && item?.appliance_type){
      collection= item?.appliance_type;
    }
    if(!collection && item?.part_type){
      collection= item?.part_type;
    }
    console.log("vendor",item)

    return <CollectionPage
      custom={true}
      title={"yidkwdnwdnldn"}
      collection={collection}
      vendor={item?.vendor?.title?.replace(/ spare parts/g, '')}
      applianceType={item?.appliance_type?.title?.replace(/ spare parts/g, '')}
      partType={item?.part_type?.title?.replace(/ spare parts/g, '')}
      model={null}
      item={item}
    />
  }
  let { vendor, appliance_type, part_type } = getCollectionFilterTitle(brandCollection, applianceTypeCollection, partTypeCollection)
  
  if(brandCollection?.collection?.image){
    if(partTypeCollection['collection']){
      partTypeCollection['collection']['image'] = brandCollection.collection.image
    }
  }else if(applianceTypeCollection?.collection?.image){
    if(partTypeCollection['collection']){
      partTypeCollection['collection']['image'] = applianceTypeCollection.collection.image
    }
  }
  // console.log("brandCollection?.collection?.top_description", brand)
  // console.log("brandCollection?.collection?.top_description", brand?.collection?.top_description)
  // console.log("applianceTypeCollection?.collection?.top_description", applianceTypeCollection?.collection?.top_description)
  if(applianceTypeCollection?.collection?.top_description){
    if(partTypeCollection['collection']){
      partTypeCollection['collection']['top_description'] = applianceTypeCollection.collection.top_description
      partTypeCollection['collection']['below_description'] = applianceTypeCollection.collection.below_description
    }
  }else if(brandCollection?.collection?.top_description){
    if(partTypeCollection['collection']){
      partTypeCollection['collection']['top_description'] = brandCollection.collection.top_description
      partTypeCollection['collection']['below_description'] = brandCollection.collection.below_description
    }
  } 
  if(brandCollection?.collection?.custom_images && brandCollection?.collection?.custom_images_for_mobile && brandCollection?.collection?.custom_images_nz && brandCollection?.collection?.custom_images_for_mobile_nz){
    if(partTypeCollection['collection']){
      partTypeCollection['collection']['custom_images'] = brandCollection?.collection?.custom_images;
    }
    if(partTypeCollection['collection']){
      partTypeCollection['collection']['custom_images_for_mobile'] = brandCollection?.collection?.custom_images_for_mobile;
    }
    if(partTypeCollection['collection']){
      partTypeCollection['collection']['custom_images_nz'] = brandCollection?.collection?.custom_images_nz;
    }
    if(partTypeCollection['collection']){
      partTypeCollection['collection']['custom_images_for_mobile_nz'] = brandCollection?.collection?.custom_images_for_mobile_nz;
    }
  }

  // if(brandCollection?.collection?.top_description){
  // }
  return <CollectionPage  collection={partTypeCollection.collection} vendor={vendor} applianceType={appliance_type} partType={part_type} model={model} />;
}
