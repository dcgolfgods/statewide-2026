import { Image } from '@shopify/hydrogen';
import {Link} from  '~/components';
import {useMatches} from 'react-router';


/**
 * The shop metafield custom.about_statewide may hold HTML tags or plain text.
 * Plain text keeps its line breaks.
 */
function toHtml(value = '') {
    const text = value.trim();
    if (!text) return '';
    if (/<[a-z][\s\S]*>/i.test(text)) return text;
    return text
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .split(/\n\s*\n/)
        .map((para) => `<p>${para.trim().replace(/\n/g, '<br/>')}</p>`)
        .join('');
}

/** Mobile shows only the first paragraph. */
function firstParagraph(html) {
    return html.match(/<p[^>]*>[\s\S]*?<\/p>/i)?.[0] ?? html;
}

export function AboutUs({skipResources, aboutHtml}){
    const [root] = useMatches();
    const selectedLocale = root.data?.selectedLocale ?? DEFAULT_LOCALE;
    const isNZ = selectedLocale.country == 'NZ';
    const html = isNZ ? '' : toHtml(aboutHtml);
    let years = 40;
    if(selectedLocale.country == 'NZ'){
        years = 40;
    }
    return(
        <div className="about-us mt-8">
            <div className="flex flex-wrap border-[#1e5097] border-solid border-t-[0.5px]">
                <div className="image w-full lg:w-[45%]">
                    {!skipResources && 
                    <Image 
                    className='lg:min-h-[300px] h-full lg:block hidden w-full object-cover' 
                    src="https://cdn.shopify.com/s/files/1/0799/5929/4245/files/About_Statewide_Desktop_Image_1.webp?v=1754374784"  
                    alt="About Statewide Appliance Spares"
                    loading="lazy" />}
                    {!skipResources && <Image 
                    className='lg:hidden block w-full object-cover' 
                    src="https://cdn.shopify.com/s/files/1/0799/5929/4245/files/About_Statewide_Mobile_Banner_2.webp?v=1754372615"  
                    alt="About Statewide Appliance Spares"
                    loading="lazy" />}
                </div>
                <div className="flex items-center flex-wrap  lg:text-left text-center lg:pt-5 lg:pb-5 pt-[30px]  pb-[50px] text w-full lg:w-[55%]">
                    <div className='px-[15px] lg:px-[0px] lg:mx-[4%]'>
                        <h5 className='w-full mb-2 text-[#1e5097] font-bold lg:text-left text-center text-[25px]'>About Statewide</h5>
                        

                        {html ? (
                        <>
                        <div className='about-statewide-text lg:block hidden text-[14px] w-full lg:text-left mb-[22px]' dangerouslySetInnerHTML={{__html: html}} />
                        <div className='about-statewide-text text-[14px] lg:hidden w-full lg:text-left text-justify mb-[22px]' dangerouslySetInnerHTML={{__html: firstParagraph(html)}} />
                        </>
                        ) : (
                        <>
                        {selectedLocale.country == 'NZ' ? 
                        <p className='lg:block hidden text-[14px] w-full lg:text-left  mb-[22px]'>For 40 years, Statewide Appliance Spares have been Australia’s most trusted name in appliance spare parts. Since 1985, we’ve grown from a small Adelaide business to the leading distributor of spare parts, shipping across Australia and New Zealand daily.<br/><br/>With the biggest range of spare parts from all the leading brands, we make buying spares easy!  Whether you're a homeowner tackling a DIY repair or a technician servicing appliances, we make sure you get the part you need – fast. Join thousands of satisfied customers who trust Statewide for reliable service and easy ordering. Shop online or reach out to our experienced, local team—we’re here to help!<br/><br/>24/7 online shopping or give us a call on NZ Local call 09 965 5155.</p>
                        :
                        <p className='lg:block hidden text-[14px] w-full lg:text-left  mb-[22px]'>For 40 years, Statewide Appliance Spares have been Australia’s most trusted name in appliance spare parts. Since 1985, we’ve grown from a small Adelaide business to the leading distributor of spare parts, shipping across Australia and New Zealand daily.<br/><br/>With the biggest range of spare parts from all the leading brands, we make buying spares easy!  Whether you're a homeowner tackling a DIY repair or a technician servicing appliances, we make sure you get the part you need – fast. Join thousands of satisfied customers who trust Statewide for reliable service and easy ordering. Shop online or reach out to our experienced, local team—we’re here to help! 24/7 online shopping or Free Call 1800 005 220.</p>
                        }

                        {selectedLocale.country == 'NZ' ? 
                        <p className='text-[14px] lg:hidden w-full lg:text-left text-justify  mb-[22px]'>For 40 years, Statewide Appliance Spares have been Australia’s most trusted name in appliance spare parts. Since 1985, we’ve grown from a small Adelaide business to the leading distributor of spare parts, shipping across Australia and New Zealand daily.</p>
                        :
                        <p className='text-[14px] lg:hidden w-full lg:text-left text-justify mb-[22px]'>For 40 years, Statewide Appliance Spares have been Australia’s most trusted name in appliance spare parts. Since 1985, we’ve grown from a small Adelaide business to the leading distributor of spare parts, shipping across Australia and New Zealand daily.</p>
                        }
                        </>
                        )}
                        <div className='w-full flex justify-center lg:justify-start'>
                            <Link className="uppercase flex items-center justify-center font-bold h-[35px] w-[102px] bg-[#1e5097] text-white text-[14px] border-b-[1px] cursor-pointer homepage-learn-more_btn" to="/aboutus">Learn More</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}