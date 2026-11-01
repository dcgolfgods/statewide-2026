import {Button} from './Button';
import {FeaturedSection} from './FeaturedSection';
import {PageHeader, Text} from './Text';
import {Link} from  '~/components';

export function NotFound({type = 'page'}) {
  const heading = `We’ve lost this ${type}`;
  const description = `We couldn’t find the ${type} you’re looking for. Try checking the URL or heading back to the home page.`;
  if(type == "collection"){
    return <NoResult />
  }
  return (
    <>
      <PageHeader heading={heading}>
        <Text width="narrow" as="p">
          {description}
        </Text>
        <Button width="auto" variant="secondary" to={'/'}>
          Take me to the home    page
        </Button>
      </PageHeader>
      <FeaturedSection />
    </>
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
    Still need help? Call us on Free call <a className="text-[#1e5097] font-bold" href="tel:+611800005220">1800 005 220</a>
    </div>
  </div>
  {/* <FeaturedSection /> */}

  </div>
  )
}
