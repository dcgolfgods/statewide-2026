import {Button} from './Button';
import {FeaturedSection} from './FeaturedSection';
import {PageHeader, Text} from './Text';
import {Link} from  '~/components';

export function GenericError({error}) {
  const heading = `Something’s wrong here.`;
  let description = `We found an error while loading this page.`;

  console.log("error",error)

  // TODO hide error in prod?
  if (error) {
    description += `\n${error.message}`;
    // eslint-disable-next-line no-console
    console.error(error);
  }
  return <NoResult />
  return (
    <>
      <PageHeader heading={heading}>
        <Text width="narrow" as="p">
          {description}
        </Text>
        {error?.stack && (
          <pre
            style={{
              padding: '2rem',
              background: 'hsla(10, 50%, 50%, 0.1)',
              color: 'red',
              overflow: 'auto',
              maxWidth: '100%',
            }}
            dangerouslySetInnerHTML={{
              __html: addLinksToStackTrace(error.stack),
            }}
          />
        )}
        <Button width="auto" variant="secondary" to={'/'}>
          Take me to the home page
        </Button>
      </PageHeader>
      <FeaturedSection />
    </>
  );
}

function addLinksToStackTrace(stackTrace) {
  return stackTrace?.replace(
    /^\s*at\s?.*?[(\s]((\/|\w\:).+)\)\n/gim,
    (all, m1) =>
      all.replace(
        m1,
        `<a href="vscode://file${m1}" class="hover:underline">${m1}</a>`,
      ),
  );
}

const NoResult = () =>{
  return(
    <div className='max-w-[1140px] mx-auto px-4 my-12'>
    <div className="text-[#1e5097] text-[16px] zero-results-message offset-lg-3 col-sm-12 col-md-12 col-lg-8 mb-4">
    <b>We're sorry, but the page you're looking for can't be found. It might have been moved or no longer exists. </b>
    <br /><br />
    <div className='text-black'>
    <b className='mb-2 block'>Try these steps:</b>
    <div className="zero-results-bold">
    ✔ Use our search bar to find what you're looking for
      <br />
      ✔ Head back to our <Link to="/contactus">contact us</Link> page
    <br/>
    </div>
    <br />
    </div>
    <div className='text-black'>
    Still need help? Call us on Free call <a className="text-[#0eb2f1] font-bold" href="tel:+611800005220">1800 005 220</a>
    </div>
  </div>
  <Button width="auto" variant="secondary" to={'/contactus'}>
          Take me to the contact us page
    </Button>
  {/* <FeaturedSection /> */}

  </div>
  )
}