import {data as json, redirect} from 'react-router';

import {
  AnalyticsPageType,
  getPaginationVariables,
  getSelectedProductOptions,
  
} from '@shopify/hydrogen';
import {parse as parseCookie} from 'worktop/cookie';
import {useLoaderData, useRouteLoaderData} from 'react-router';
import invariant from 'tiny-invariant';
// Import Swiper styles
// import SwiperStyle from  'swiper/css';
import {
  getRecommendedProducts,
  COLLECTION_AND_PRODUCT_QUERY,
  getCollectionFilterTitle,
  CUSTOME_COLLECTION_QUERY,
  PAGE_QUERY,
  BLOGS_QUERY,
  SEARCH_ARTICLE
} from '~/lib/utils';
import {CollectionPage, Page, Blogs, EGRC, Announcements} from '~/components';
import {ProductPage} from '~/components';
import {seoPayload} from '~/lib/seo.server';
import {metaDescription} from '../lib/meta-description.server';
import { getCollectionDataUsingMetaobject } from '~/lib/shopifyAdminMetaobjects';
import {fetchAnnouncements} from '~/lib/announcements';
import {getRouteSeoMeta} from '~/lib/meta';

export const meta = ({matches}) => getRouteSeoMeta(matches);

const pages = ["appliance-service",'conditions-of-use','ssl-secure','privacy-policy','reviews','commercial-credit-application','findyourmodel','service-repairs','contactus','deliveries-returns','aboutus',"coronavirus-update",'all-brands','trade-promotion-terms-conditions']



export const links = () => {
  return [
    // {rel: 'stylesheet', href: SwiperStyle},
    // {rel: 'stylesheet', href: paginationStyle},
  ];
};

export async function loader({params, request, context}) {
  const searchParams = new URL(request.url).searchParams;
  const model = searchParams.get('ModelNoId') || null;
  const blogQuery=searchParams.get('s');
  const announcementMonth = searchParams.get('month') || '';
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 20,
  });
  const {brand} = params;
  let seo;
  if(brand == "pcb-1"){
    return redirect("/pcb", { status: 301 });
  }
  if(brand == "google-reviews"){
        return json({
        pageType: 'google-reviews'
      });
  }
  if (brand == 'announcement') {
    const announcements = await fetchAnnouncements(context.storefront);
    return json({
      announcements,
      pageType: 'announcements',
      announcementQuery: blogQuery || '',
      announcementMonth,
    });
  }
  if(pages.includes(brand)){
    const {page} = await context.storefront.query(PAGE_QUERY, {
      variables: {
        handle: brand,
        language: context.storefront.i18n.language,
      },
    });
    seo = seoPayload.page({page, url: request.url});

    return json({
      page, seo, pageType:'page'
    });
  }
  let blogGraphQLQuery=BLOGS_QUERY
  let blogGraphQLQueryVariable={
    language: context.storefront.i18n.language,
  }
  if(blogQuery){
    blogGraphQLQuery=SEARCH_ARTICLE
    blogGraphQLQueryVariable["blogQuery"]=`title:${blogQuery}`
  }
  if(brand == 'blogs'){
    const {blogs,articles} = await context.storefront.query(blogGraphQLQuery, {
      variables: {
     ...blogGraphQLQueryVariable,
     blogQuery
      },
    });
    let blog = blogs?.nodes[0]?.blog || []
    seo = seoPayload.blog({blog, url: request.url});
    const {session} = context;
    const recentlyViewedBlogs  = await session.get('recentlyViewedBlogs') || "[]";
    return json({
      articles, seo, pageType:'blogs', blogs,blogQuery,recentlyViewedBlogs:JSON.parse(recentlyViewedBlogs)
    });
  }

  invariant(brand, 'Missing collectionHandle param');
  // check and get product page info
  let pageType = '';

  // const existItem = prefixData.find((item)=> item.url == `/${brand}`);
  const existItem = await getCollectionDataUsingMetaobject(`/${brand}`,`fields.url:"/${brand}"`,context.env);
  // console.log("existItem",existItem)
  let meta = null;
  if(existItem){
      // const data = await  context.storefront.query(CUSTOME_COLLECTION_QUERY, {
      //   variables: {
      //     handle1: existItem.vendor,
      //     handle2:existItem.appliance_type,
      //     handle3: existItem.part_type,
      //   },
      // });
      let brandCollection = existItem.brandCollection?.reference;
      let applianceCollection = existItem.applianceCollection?.reference;
      let partCollection = existItem.partCollection?.reference;
      const breadcrumbCollections = [
        brandCollection,
        applianceCollection,
        partCollection,
      ].filter(Boolean);
      let collection = null;
      if(brandCollection?.handle){
        collection = brandCollection;
        meta = metaDescription.find((item)=> item.brand == brandCollection?.title && item.appliance_type ==  null &&  item.part_type == null )
        if(meta){
          seo = seoPayload.collection({
            collection: {...brandCollection, ...meta, seo:{...meta}},
            url: meta?.url || request.url,
            breadcrumbCollections,
          });
        }else{
          seo = seoPayload.collection({
            collection: brandCollection,
            url: request.url,
            breadcrumbCollections,
          });
        }
        
      }else if(applianceCollection?.handle){
        collection = applianceCollection;
        meta = metaDescription.find((item)=> item.brand == null && item.appliance_type ==  applianceCollection?.title &&  item.part_type == null )
        if(meta){
          seo = seoPayload.collection({
            collection: {...applianceCollection, ...meta, seo:{...meta}},
            url: meta?.url || request.url,
            breadcrumbCollections,
          });
        }else{
          seo = seoPayload.collection({
            collection: applianceCollection,
            url: request.url,
            breadcrumbCollections,
          });
        }
       
      }else if(partCollection?.handle){
        collection = partCollection;
        meta = metaDescription.find((item)=> item.brand == null && item.appliance_type ==  null &&  item.part_type == partCollection?.title )
        if(meta){
          seo = seoPayload.collection({
            collection: {...partCollection, ...meta, seo:{...meta}},
            url: meta?.url || request.url,
            breadcrumbCollections,
          });
        }else{
          seo = seoPayload.collection({
            collection: partCollection,
            url: request.url,
            breadcrumbCollections,
          });
        }
      }

      return json({
        searchQuery: existItem?.searchQuery,
        noFilter: existItem?.noFilter || false,
        item:{collection:collection, brandCollection:brandCollection, partCollection:partCollection, applianceCollection:applianceCollection, title:collection?.title, custom_title:existItem.custom_title, top_description:existItem.top_description, below_description:existItem.below_description},
        pageType: 'custom-collection',
        model, 
        seo
      });
  }

  // const selectedOptions = getSelectedProductOptions(request);
  const {collection, product, shop} = await context.storefront.query(
    COLLECTION_AND_PRODUCT_QUERY,
    {
      variables: {
        ...paginationVariables,
        handle: brand,
        first: 20,
        country: context.storefront.i18n.country,
        language: context.storefront.i18n.language,
      },
    },
  );
  const brandCollection = {collection};
  let selectedVariant, productAnalytics, analytics;
  let recommended = [];
  if (product) {
    pageType = 'product';
    const firstVariant = product?.variants.nodes[0];
    selectedVariant = product.selectedVariant ?? firstVariant;
    seo = seoPayload.product({
      product,
      selectedVariant,
      url: request.url,
    });
    productAnalytics = {
      productGid: product?.id,
      variantGid: selectedVariant?.id,
      name: product?.title,
      variantName: selectedVariant?.title,
      brand: product?.vendor,
      price: selectedVariant?.price?.amount,
    };

    if (!product?.selectedVariant) {
      product['selectedVariant'] = selectedVariant;
    }
    analytics = {
      pageType: AnalyticsPageType.product,
      resourceId: product.id,
      products: [productAnalytics],
      totalValue: parseFloat(selectedVariant.price.amount),
    };

  }
  if (pageType == 'product') {  
    if (!product?.id) {
      throw new Response('product', {status: 404});
    }
    recommended = getRecommendedProducts(context.storefront, product.id) || [];
  } else {
    if (!collection) {
      throw new Response('collection', {status: 404});
    }else{
      if(collection?.type?.value == "vendor"){
        meta = metaDescription.find((item)=> item.brand == collection?.title && item.appliance_type ==  null &&  item.part_type == null )
      }else if(collection?.type?.value == "appliance_type"){
        meta = metaDescription.find((item)=> item.brand == null && item.appliance_type ==  collection?.title &&  item.part_type == null )
      }else if(collection?.type?.value == "part_type"){
        meta = metaDescription.find((item)=> item.brand == null && item.appliance_type ==  null &&  item.part_type == collection?.title )
      }
      if(meta){
        seo = seoPayload.collection({
          collection: {...collection, ...meta, seo:{...meta}},
          url: meta?.url || request.url,
          breadcrumbCollections: [collection],
        });
      }else{
        seo = seoPayload.collection({
          collection,
          url: request.url,
          breadcrumbCollections: [collection],
        });
      }
      
    }
  }
  return json({
    brandCollection,
    model,
    pageType,
    product,
    shop,
    storeDomain: shop.primaryDomain.url,
    recommended,
    analytics,
    seo,
  });
}
export default function BrandPage() {
  const {
    brandCollection,
    model,
    product,
    shop,
    recommended,
    pageType,
    page,
    item,
    blogs,
    blogQuery,
    announcementQuery,
    announcementMonth,
    announcements,
    articles,
    searchQuery,
    recentlyViewedBlogs,
    noFilter
  } = useLoaderData();
  if(pageType == 'google-reviews'){
    return <EGRC />
  }

  if(pageType == 'blogs'){
    return <Blogs blogs={blogs} blogQuery={blogQuery} recentlyViewedBlogs={recentlyViewedBlogs}  articles={articles} />
  }
  if (pageType == 'announcements') {
    return (
      <Announcements
        announcements={announcements}
        announcementQuery={announcementQuery}
        announcementMonth={announcementMonth}
      />
    );
  }
  if(pageType == 'page'){
    return <Page page={page} />
  }

  const {vendor, appliance_type, part_type} = getCollectionFilterTitle(brandCollection);

  if(pageType == 'custom-collection'){
    let collection = item?.collection ;
    return <CollectionPage
      custom={true}
      title={"yidkwdnwdnldn"}
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
  if (pageType == 'product') {
    return (
      <ProductPage
        product={product}
        recommended={recommended}
        shop={shop}
      />
    );
  }

  return (
    <CollectionPage
      custom={false}
      collection={brandCollection?.collection}
      vendor={vendor}
      applianceType={appliance_type}
      partType={part_type}
      model={model}
      noFilter={noFilter || false}
      searchQuery={searchQuery || ""}
    />
  );
}
