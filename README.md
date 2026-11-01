# Statewide Appliance Spares storefront

The www.statewideapp.com.au storefront, built on Shopify Hydrogen 2026.4 and React Router 7. It was migrated from the Remix 1 / Hydrogen 2023.7 app kept in `old-statewide/` for reference.

**Requirements:** Node.js 22.x or 24.x

## Local development

Link the project to the **Statewide** storefront (the one serving www.statewideapp.com.au) and pull its environment variables:

```bash
npx shopify hydrogen link --storefront "Statewide"
```

```bash
npx shopify hydrogen env pull
```

```bash
npm run dev
```

The store also has a **Statewide 2026** storefront. Products aren't published to its sales channel, so if you link to it, product pages return "not found" locally. Restart `npm run dev` after any change to `.env`, `vite.config.js` or `react-router.config.js`.

`.env` needs these on top of Hydrogen's defaults:

- `ADMIN_API_ACCESS_TOKEN` for collection data, search redirects and the quote cart
- `QUOTE_CART_API_KEY` and `QUOTE_CART_SECRET` for `/api/quote-cart`

## Building for production

```bash
npm run build
```

The build runs GraphQL codegen, which validates every `#graphql` query against the Storefront API schema.
