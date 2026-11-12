import * as serverBuild from 'virtual:react-router/server-build';
import {createRequestHandler, storefrontRedirect} from '@shopify/hydrogen';
import {createHydrogenRouterContext} from '~/lib/context';
import {isSearchEngineIndexable} from '~/lib/indexing.server';
import {getLowercasePathRedirect} from '~/lib/urlRedirects';
import {handleBotChallenge} from '~/lib/botChallenge.server';

/**
 * Export a fetch handler in module format.
 */
export default {
  /**
   * @param {Request} request
   * @param {Env} env
   * @param {ExecutionContext} executionContext
   * @return {Promise<Response>}
   */
  async fetch(request, env, executionContext) {
    try {
      const lowercaseRedirect = getLowercaseRedirect(request);
      if (lowercaseRedirect) {
        return lowercaseRedirect;
      }

      const botChallenge = await handleBotChallenge(request, env);
      if (botChallenge) {
        return botChallenge;
      }

      const hydrogenContext = await createHydrogenRouterContext(
        request,
        env,
        executionContext,
      );

      /**
       * Create a Hydrogen request handler that internally
       * delegates to React Router for routing and rendering.
       */
      const handleRequest = createRequestHandler({
        build: serverBuild,
        mode: process.env.NODE_ENV,
        getLoadContext: () => hydrogenContext,
      });

      const response = await handleRequest(request);

      if (hydrogenContext.session.isPending) {
        response.headers.set(
          'Set-Cookie',
          await hydrogenContext.session.commit(),
        );
      }

      if (response.status === 404) {
        /**
         * Check for redirects only when there's a 404 from the app.
         * If the redirect doesn't exist, then `storefrontRedirect`
         * will pass through the 404 response.
         */
        const redirectResponse = await storefrontRedirect({
          request,
          response,
          storefront: hydrogenContext.storefront,
        });
        return withNoIndexHeaders(request, redirectResponse);
      }

      return withNoIndexHeaders(request, response);
    } catch (error) {
      console.error(error);
      return withNoIndexHeaders(
        request,
        new Response('An unexpected error occurred', {status: 500}),
      );
    }
  },
};

/**
 * @param {Request} request
 */
function getLowercaseRedirect(request) {
  const url = new URL(request.url);
  const redirectUrl = getLowercasePathRedirect(
    url.pathname,
    url.search,
    url.hash,
  );

  if (!redirectUrl) {
    return null;
  }

  return new Response(null, {
    status: 301,
    headers: {
      Location: new URL(redirectUrl, url.origin).toString(),
    },
  });
}

/**
 * Staging / non-production hosts must not be indexed.
 * X-Robots-Tag is stronger than meta robots alone.
 * @param {Request} request
 * @param {Response} response
 */
function withNoIndexHeaders(request, response) {
  if (isSearchEngineIndexable(request)) {
    return response;
  }

  const headers = new Headers(response.headers);
  headers.set('X-Robots-Tag', 'noindex, nofollow');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
