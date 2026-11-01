export const viewKlaviyoProduct = (payload,selectedVariant) =>{
    let cleanProductId = payload.id.replace(/^gid:\/\/shopify\/Product\//, "");
    
    let _learnq = window?._learnq || [];
    let url = `https://statewideapp.com.au/products/${payload.handle}`;
    let product = {
        Name: payload.title,
        ProductID: payload.id.substring(payload.id.lastIndexOf('/') + 1),
        ImageURL: selectedVariant?.image?.url ,
        URL: url,
        Brand: payload.vendor,
        Price: selectedVariant.price.amount,
        CompareAtPrice: selectedVariant.compareAtPrice?.amount,
    };
    _learnq.push(['track', 'Viewed Product', product]);

}

export function gtag_report_conversion(product, variant) {
    var cleanProductId = product.id.replace(/^gid:\/\/shopify\/Product\//, "");
    var cleanvariantId = variant.id.replace(/^gid:\/\/shopify\/ProductVariant\//, "");
    let url = `https://statewideapp.com.au/products/${product.handle}`;
    
    if (window._learnq) {
        window._learnq.push(["track", "Added to Cart", {
          ProductID: cleanProductId,
          id: cleanvariantId,
          Name: product?.title,
          category: product?.productType,
          sku: variant?.sku,
          Value: Number(variant?.price?.amount) * 1, // Explicitly set value
          Price: Number(variant?.price?.amount) || 0,
          Quantity: 1,
          brand: product?.vendor,
          ImageURL: variant?.image?.url ,
          URL: url,
          currency: variant?.price?.currencyCode
        }]);
    }

    console.log(product, variant)
    if(window?.gtag){
        const e = {
            event :  "Added Product",
            eventId: "sh-4aee2b31-0F32-40E6-0917-A17826787F62",
            properties: {
                brand: product?.vendor,
                // cartToken: "6048ab3a38e3d346c9a12f0675cd1e2b",
                category: product?.productType,
                currency: variant?.price?.currencyCode,
                name: product?.title,
                pageType: "product",
                price: parseInt(variant?.price?.amount),
                productId: cleanProductId,
                quantity: 1,
                resourceId: cleanProductId,
                resourceType: "product",
                sku: variant?.sku,
                variant: variant?.title,
                variantId : cleanvariantId
            }
        }
        var t = "add_to_cart"
        , n = e.properties
        , o = {
          send_to: 'G-L8ZRY2ZJ5B',
          ecomm_prodid: ["shopify_" + 'US' + "_" + cleanProductId + "_" + cleanvariantId],
          ecomm_totalvalue: n.price * n.quantity,
          ecomm_pagetype: "cart",
          value: n.price * n.quantity,
          currency: n.currency || "USD",
          items: [{
              id: "shopify_" + 'US' + "_" + cleanProductId + "_" + cleanvariantId,
              name: variant?.title,
              brand: product?.vendor,
              category: product?.productType,
            //   coupon: n.coupon,
              price: variant?.price?.amount,
              quantity: 1,
              variant: variant.title
          }]
        }
    };
    window?.gtag("event", t, o);
    window?.gtag("event", "conversion_event_add_to_cart", o);
    window?.ga("require", "ec");
    window?.ga("ec:setAction", "add");
    window?.ga("set", "&cu", variant?.price?.currencyCode)
    var t = {
        id: variant?.sku || cleanvariantId,
        name: product?.title,
        category: product?.productType,
        quantity: 1,
        price: variant?.price?.amount,
        brand: product?.vendor,
        variant: variant?.title,
        currency: variant?.price?.currencyCode
    };
    window?.ga("ec:addProduct", t)

}
const computeEcommProductId = (e) => {
    return "shopify_" + this.targetCountry() + "_" + e.productId + "_" + e.variantId
}