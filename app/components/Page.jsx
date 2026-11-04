
// import {FindModel, ContactForm} from '~/components';
import { TradePromotionTerms } from './TradePromotionTerms';
import { ContactForm } from './ContactForm';
import { FindModel } from './FindModel';
import {AllReviews} from '~/components/AllReviews';
import {useMatches} from 'react-router';
import {DEFAULT_LOCALE} from '~/lib/utils';
import { AllBrands } from './AllBrands';
export function Page({page, modelGuides}) {
  const [root] = useMatches();
  const selectedLocale = root.data?.selectedLocale ?? DEFAULT_LOCALE;
    const renderPage = () =>{
      if(page.handle == "reviews"){
        return <div
          id="ph-topic"
          className="page-html page topic-page"
        >
          <AllReviews />
        </div>
      }else if(page.handle == "findyourmodel"){
        return <FindModel guides={modelGuides} />
      }else if(page.handle == "all-brands"){
        return <AllBrands />
      }else{
        return <div
        dangerouslySetInnerHTML={{__html: page.body}}
        id="ph-topic"
        className="page-html page topic-page"
      />
      }
    }
    return (
      <>
        <div className={`max-w-[1140px] mx-auto w-full mt-[20px] mb-[50px] px-4 ${page.handle} country-${selectedLocale.country}`} heading={page.title}>
          <h1 className="page-title text-[#1e5097] lg:text-[30px] text-[24px] border-b-[1px] border-[#ccc] mb-[25px] py-[6px] text-center">{page.title}</h1>
          {renderPage()}
          {page.handle == 'contactus' && <ContactForm />}
          {page.handle == 'trade-promotion-terms-conditions' && <TradePromotionTerms />}

        </div>
      </>
    );
  }
