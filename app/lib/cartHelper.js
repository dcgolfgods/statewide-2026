// Helper to send GraphQL requests to Shopify
const fetchShopify = async (query, variables) => {
    const response = await fetch('https://statewide-appliances.myshopify.com/api/2026-04/graphql.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': '6f5fe6042334dcabb6c9b260d87c8ba9',
      },
      body: JSON.stringify({ query, variables }),
    });
  
    const data = await response.json();
    return data;
};

// Import the client-side helper
import { checkSpecialUserCookie } from './specialUserHelper';
  
  // Check if a cart exists by fetching its details
  const getCart = async (cartId) => {
    const query = `
      fragment Money on MoneyV2 {
          currencyCode
          amount
      }  
      fragment CartLine on CartLine {
          id
          quantity
          attributes {
            key
            value
          }
          cost {
            totalAmount {
              ...Money
            }
            amountPerQuantity {
              ...Money
            }
            compareAtAmountPerQuantity {
              ...Money
            }
          }
          merchandise {
            ... on ProductVariant {
              id
              availableForSale
              compareAtPrice {
                ...Money
              }
              preorder: metafield(namespace: "my_fields", key: "preorder") {
                value
              }
              preorderMsg: metafield(namespace: "my_fields", key: "preorder_date") {
                value
              }
              price {
                ...Money
              }
              requiresShipping
              title
              image {
                id
                url
                altText
                width
                height

              }
              product {
                handle
                title
                id
                tags
                show_australia_only: metafield(namespace: "product_extended_property", key: "australia_only") {
                  value
                }
                rewards: metafield(namespace: "custom", key: "customer_reward") {
                  value
                }
                upsells: metafield(namespace: "custom", key: "upsell") {
                  references(first: 5) {
                    nodes {
                      ... on Product {
                        availableForSale
                        id
                        handle
                        title
                        featuredImage {
                          id
                          url
                          altText
                          width
                          height
                        }
                        options {
                          name
                          values
                        }
                        variants(first: 99) {
                          nodes {
                            price {
                              amount
                              currencyCode
                            }
                            availableForSale
                            id
                            title
                            selectedOptions {
                              name
                              value
                            }
                            compareAtPrice {
                              amount
                              currencyCode
                            }
                          }
                        }
                        
                      }
                    }
                  }
                }
              }
              selectedOptions {
                name
                value
              }
            }
          }
        }
      query GetCart($cartId: ID!) {
        cart(id: $cartId) {
          id
          checkoutUrl
          totalQuantity
          buyerIdentity {
            countryCode
            customer {
              id
              email
              firstName
              lastName
              displayName
            }
            email
            phone
          }
          lines(first: 250) {
            nodes {
              ...CartLine
            }
          }
          cost {
            subtotalAmount {
              ...Money
            }
            totalAmount {
              ...Money
            }
            totalDutyAmount {
              ...Money
            }
            totalTaxAmount {
              ...Money
            }
          }
          note
          attributes {
            key
            value
          }
          discountCodes {
            code
            applicable
          }
        }
      }
    `;
  
    const variables = { cartId };
    return await fetchShopify(query, variables);
  };
  
  // Create a new cart
  const createCart = async () => {
    const mutation = `
      mutation CreateCart {
        cartCreate {
          cart {
            id
          }
          userErrors {
            field
            message
          }
        }
      }
    `;
  
    return await fetchShopify(mutation, {});
  };
  
  // Add a line item to the cart
export const addLineItem = async (cartId, lines) => {
    
    const mutation = `
      mutation AddLineItems($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) {
          cart {
            id
          }
          userErrors {
            field
            message
          }
        }
      }
    `;
  
    const variables = {
      cartId,
      lines: lines,
    };
  
    return await fetchShopify(mutation, variables);
};
  
  // Update a line item in the cart
  export const updateLineItem = async (cartId, lineId, quantity) => {
    const mutation = `
      mutation UpdateLineItems($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
        cartLinesUpdate(cartId: $cartId, lines: $lines) {
          cart {
            id
            lines(first: 10) {
              edges {
                node {
                  id
                  quantity
                }
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;
  
    const variables = {
      cartId,
      lines: [{ id: lineId, quantity }],
    };
  
    return await fetchShopify(mutation, variables);
  };

export const removeLineItems = async (cartId, lineIds) => {
  if (!lineIds?.length) {
    return null;
  }
  const mutation = `
    mutation RemoveLineItems($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart {
          id
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    cartId,
    lineIds,
  };

  return await fetchShopify(mutation, variables);
};
  
  // Manage cart ID in localStorage
  const getOrCreateCartId = async (userCountry) => {
    let cartId = localStorage.getItem('cartId');
    if (cartId) {
      const cart = await getCart(cartId);
      if (cart.errors || !cart.data.cart) {
        // Invalid cart ID, create a new cart
        let newCart = await createCart();
        cartId = newCart.data.cartCreate.cart.id;
        localStorage.setItem('cartId', cartId);
        await updateCartCountry(cartId,userCountry)
      }
    } else {
      // No cart ID in localStorage, create a new cart
      let newCart = await createCart();
      cartId = newCart.data.cartCreate.cart.id;
      localStorage.setItem('cartId', cartId);
      await updateCartCountry(cartId, userCountry)
    }
    
    return cartId;
  };
  
  // Fetch cart data or create a blank cart if it doesn't exist
  export const getCartDataOrCreate = async (userCountry, customerToken = null, email= null) => {
    let cartId = await getOrCreateCartId(userCountry);
    let cartResponse = await getCart(cartId);
  
    if (cartResponse.errors || !cartResponse.data.cart) {
      // If cart doesn't exist, create a new one
      const newCart = await createCart();
      cartId = newCart.data.cartCreate.cart.id;
      cartResponse = await getCart(cartId);
    //   return { id: cartId, lines: [] };
    }
    let cart = cartResponse.data.cart;
    if ((customerToken) && !cart?.buyerIdentity?.customer?.id) {
      await updateCartBuyerIdentity(cartId, customerToken);
      cart = await getCartDataOrCreate(userCountry, customerToken,customerToken,email)
    }

    if (!(customerToken) && cart?.buyerIdentity?.customer?.id) {
      await updateCart(cart);
      // await updateCartBuyerIdentity(cartId, customerToken);
      cart = await getCartDataOrCreate()
    }

    // Check for specialUser cookie and add to cart attributes if needed
    const hasSpecialUserCookie = checkSpecialUserCookie();
    const hasSpecialUserAttribute = cart?.attributes?.some(attr => attr.key === '_specialUser' && attr.value === 'true');
    
    if (hasSpecialUserCookie && !hasSpecialUserAttribute) {
      await updateCartAttributes(cartId, '_specialUser', 'true');
      // Refresh cart data after adding attribute
      cartResponse = await getCart(cartId);
      cart = cartResponse.data.cart;
    }

    return cart;
};

const updateCart = async (cart) => {

      const cartItems = cart.lines.nodes.map(line => ({
        merchandiseId: line.merchandise.id,
        quantity: line.quantity,
        attributes: line.attributes || [],
      }));

      const cartAttributes = cart.attributes || [];

      // Remove the old cart ID from localStorage
      localStorage.removeItem('cartId');

      // Create a new cart
      const newCartResponse = await createCart();
      const newCartId = newCartResponse.data.cartCreate.cart.id;
      localStorage.setItem('cartId', newCartId);

      // Add previous cart items to the new cart
      if (cartItems.length > 0) {
        await addLineItem(newCartId, cartItems);
      }

      // Restore cart attributes
      if(cartAttributes.length > 0){
        for (const attr of cartAttributes) {
          await updateCartAttributes(newCartId, attr.key, attr.value);
        }
      }
};

export const updateCartAttributes = async (cartId, key, value) => {
  const mutation = `
    mutation UpdateCartAttributes($cartId: ID!, $attributes: [AttributeInput!]!) {
      cartAttributesUpdate(cartId: $cartId, attributes: $attributes) {
        cart {
          id
          attributes {
            key
            value
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    cartId,
    attributes: [{ key, value }],
  };

  return await fetchShopify(mutation, variables);
};

const updateCartBuyerIdentity = async (cartId, customerToken) => {
  const mutation = `
    mutation UpdateCartBuyerIdentity($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
      cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
        cart {
          id
          buyerIdentity {
            customer {
              id
              email
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
      cartId,
      buyerIdentity: {
          customerAccessToken:customerToken,
      },
  };

  const response = await fetchShopify(mutation, variables);

  if (response.errors || response.data.cartBuyerIdentityUpdate.userErrors.length > 0) {
      console.error("Failed to update cart buyer identity:", response.errors || response.data.cartBuyerIdentityUpdate.userErrors);
      throw new Error("Could not update cart buyer identity");
  }

  return response.data.cartBuyerIdentityUpdate.cart;
};



export const updateCartCountry = async (cartId, countryCode) => {
    if(!countryCode){
      return;
    }
    const mutation = `
      mutation UpdateCartCountry($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
        cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
          cart {
            id
            buyerIdentity {
              countryCode
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;
  
    const variables = {
      cartId,
      buyerIdentity: {
        countryCode,
      },
    };
  
    const response = await fetchShopify(mutation, variables);
  
    if (response.errors || response.data.cartBuyerIdentityUpdate.userErrors.length > 0) {
      console.error("Failed to update cart country:", response.errors || response.data.cartBuyerIdentityUpdate.userErrors);
      throw new Error("Could not update cart country");
    }
  
    return response.data.cartBuyerIdentityUpdate.cart;
};
