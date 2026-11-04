import {data as json, redirect} from 'react-router';
import {useLoaderData} from 'react-router';
import invariant from 'tiny-invariant';
import {PageHeader} from '~/components';
import {routeHeaders} from '~/data/cache';
import {seoPayload} from '~/lib/seo.server';
import {getRouteSeoMeta} from '~/lib/meta';
import {assertValidLocaleParam} from '~/lib/locale';

export const meta = ({matches}) => getRouteSeoMeta(matches);

export const headers = routeHeaders;

export async function loader({request, params, context}) {
  assertValidLocaleParam(params);
  invariant(params.pageHandle, 'Missing page handle');

  const {page} = await context.storefront.query(PAGE_QUERY, {
    variables: {
      handle: params.pageHandle,
      language: context.storefront.i18n.language,
    },
  });

  console.log(page);
  if (!page) {
    throw new Response(null, {status: 404});
  }

  return redirect(`/${params.pageHandle}`, { status: 301 });

  const seo = seoPayload.page({page, url: request.url});

  return json({page, seo});
}

export default function Page() {
  const {page} = useLoaderData();

  return (
    <>
      <PageHeader heading={page.title}>
        <div
          dangerouslySetInnerHTML={{__html: page.body}}
          className="prose dark:prose-invert"
        />
      </PageHeader>
    </>
  );
}

const PAGE_QUERY = `#graphql
  query PageDetails($language: LanguageCode, $handle: String!)
  @inContext(language: $language) {
    page(handle: $handle) {
      id
      title
      body
      seo {
        description
        title
      }
    }
  }
`;
