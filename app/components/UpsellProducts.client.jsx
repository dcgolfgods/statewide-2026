import {Image} from '@shopify/hydrogen';
import {Link, ProductSwimlane} from '~/components';

export function UpsellProducts({product, customer}) {
  let upsell = [];
  let upsellBanners = [];
  let installationLinks = [];

  if (product?.upsells?.references) {
    upsell = product?.upsells?.references;
  }

  if (product?.you_may_also_like?.reference?.products?.references?.nodes?.length > 0) {
    upsell = product?.you_may_also_like?.reference?.products?.references;
  }

  if (product?.installation_guide?.references?.nodes?.length > 0 && product?.installation_guide_links?.value) {
    upsellBanners = product.installation_guide?.references?.nodes;
    installationLinks = JSON.parse(product?.installation_guide_links?.value);
  }

  if (product?.you_may_also_like?.reference?.banners?.references?.nodes?.length > 0 && product?.you_may_also_like?.reference?.bannersLinks?.value) {
    upsellBanners = product?.you_may_also_like?.reference?.banners?.references?.nodes;
    installationLinks = JSON.parse(product?.you_may_also_like?.reference?.bannersLinks?.value);
  }

  let numRelatedProducts = 4;
  if (upsellBanners?.length > 0) {
    numRelatedProducts = 2;
  }

  return (
    <div className="my-8 flex flex-wrap px-4 lg:px-0">
      {upsell?.nodes?.length > 0 && (
        <div className={`mb-4 lg:mb-0 w-full mx-auto ${upsellBanners?.length > 0 ? ' lg:w-[44%]' : ''}`}>
          <ProductSwimlane
            customer={customer}
            title="Customers who bought this item also bought"
            className="mx-auto"
            numRelatedProducts={numRelatedProducts}
            products={upsell}
          />
        </div>
      )}
      {upsellBanners?.length > 0 && (
        <div className={`w-full gap-4 md:gap-8 block border-none my-0 ${upsell?.nodes?.length > 0 ? 'lg:w-[54%]' : ''}`}>
          <h4 className="text-[#1e5097] mb-[32px] w-full text-[18px] font-bold">DIY guide</h4>
          {upsellBanners.slice(0, 1).map((item, index) => {
            const link = installationLinks[index] ? installationLinks[index] : '/';

            return (
              <Link key={item?.id || index} to={`${link}`} className="hhh-full block">
                <Image
                  loading="lazy"
                  src={item.image.url}
                  className="block w-full lg:max-w-[780px] lg:h-full lg:object-cover"
                />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
