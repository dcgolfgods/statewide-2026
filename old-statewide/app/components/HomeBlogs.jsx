import { Image } from '@shopify/hydrogen';
import { useState } from 'react';
import {Link} from  '~/components';

export function HomeBlogs(){
    const [showVideo1, setShowVideo1] = useState(false);
    const [showVideo2, setShowVideo2] = useState(false);
    return(
            <div id="blog-posts" className="lg:max-w-[80%] mx-auto mt-[45px] lg:mt-[55px]">
                <h5 className="hidden lg:block text-center font-bold text-[25px] text-[#1e5097] mb-[70px]">DIY Guide | Expert tips to make appliance repairs easier!</h5>
                <div className="inner-section flex flex-wrap">
                    <div className="blog-section home-blog-video home-blog-video-1 mx-auto lg:mb-[0] mb-[40px]">
                        <h6 className="mb-[30px] text-center font-bold text-[20px] text-[#1e5097]">All the latest on the Statewide blog</h6>
                        <div className="items-wrapper flex flex-wrap">
                            <div className="item w-[50%] px-[15px] lg:px-[24px] lg:min-h-[352px] text-center lg:text-left">
                                <div className='img mb-[16px]'>
                                    <Link to="/blogs/warning-signs-your-dryer-is-failing-and-what-to-do">
                                        <Image alt="Warning signs your dryer is failing (and what to do)" className='w-full lg:w-[470px] max-w-full lg:h-[165px] h-[93px] object-cover' src="https://cdn.shopify.com/s/files/1/0799/5929/4245/files/Mobile_Signs_your_dryer_is_failing.webp" width={470} height={270} loading="lazy" />
                                    </Link>
                                </div>
                                <h5 className='mb-[8px] text-[#00aeef] text-[13px] lg:text-[16px] font-bold lg:min-h-[48px] min-h-[57px]'> <Link className="text-[#00aeef]" to="/blogs/warning-signs-your-dryer-is-failing-and-what-to-do">Warning signs your dryer is failing (and what to do)</Link></h5>
                                <div className="blg-desc hidden lg:block"><p className='text-[#1e5097] text-[14px] mb-[10px] '><Link to="/blogs/warning-signs-your-dryer-is-failing-and-what-to-do">Is your dryer taking longer to dry clothes, making strange noises or not heating properly? Learn the warning signs, simple DIY fixes and when it's time to replace a part.</Link></p></div>
                                <Link to="/blogs/warning-signs-your-dryer-is-failing-and-what-to-do" className="font-bold text-[#1e5097] text-[14px] border-b-[1px] border-[#1e5097]">Read more</Link>
                            </div>
                            <div className="item px-[10px] lg:px-[24px] w-[50%] lg:min-h-[352px] text-center lg:text-left">
                                <div className='img mb-[16px]'>
                                    <Link to="/blogs/guide-to-common-oven-symbols-settings-and-functions">
                                        <Image alt='Guide to common oven symbols, settings and functions' className='w-full lg:w-[470px] max-w-full lg:h-[165px] h-[93px] object-cover' src="https://cdn.shopify.com/s/files/1/0799/5929/4245/files/OVEN_SYMBOLS_AND_SETTINGS_cc254be6-3a65-4ba8-88bc-a075ae51f7d6.webp"  />
                                    </Link>
                                </div>
                                <h5 className='mb-[8px] text-[#00aeef] text-[13px] lg:text-[16px] font-bold lg:min-h-[48px] min-h-[57px]'><Link className="text-[#00aeef]" to="/blogs/guide-to-common-oven-symbols-settings-and-functions">Guide to common oven symbols, settings and functions</Link></h5>
                                <div className="blg-desc hidden lg:block"><p className='text-[#1e5097] text-[14px] mb-[10px] '><Link to="/blogs/guide-to-common-oven-symbols-settings-and-functions">Unsure which oven setting to use? Our easy guide explains the most common oven symbols and when to use each one for the best cooking results.</Link></p></div>
                                <Link to="/blogs/guide-to-common-oven-symbols-settings-and-functions" className="font-bold text-[#1e5097] text-[14px] border-b-[1px] border-[#1e5097]">Read more</Link>
                            </div>
                            <div className='flex justify-center mt-[20px] lg:mt-6 text-center w-full'>
                                    <Link to="/blogs" className="flex items-center justify-center font-bold h-[35px] w-[102px] bg-[#1e5097] text-white text-[14px] border-b-[1px]">VIEW ALL</Link>
                            </div>
                        </div>
                    </div>
                    <div className="youtube-section home-blog-video mx-auto">
                        <h6 className="mb-[30px] text-center font-bold text-[20px] text-[#1e5097]">Check out our DIY videos</h6>
                        <div className="items-wrapper flex flex-wrap">
                            <div className="item px-[10px] lg:px-[24px] w-[50%] lg:min-h-[352px] text-center lg:text-left">
                                <div className='img mb-[16px] relative'>
                                    <div>
                                        {showVideo1 ? 
                                        <iframe className='h-[86px] lg:h-[165px] w-full' src="https://www.youtube.com/embed/BnMAyKLwtSY?autoplay=1" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen=""></iframe>
                                        :
                                        <div className='cursor-pointer' onClick={()=> setShowVideo1(true)}>
                                        <Image className='object-cover w-full h-[86px] lg:h-[165px] max-w-full' src="https://cdn.shopify.com/s/files/1/0799/5929/4245/files/youtube1_1_1.webp?v=1742126764" alt="Statewide Appliance Spares YouTube video thumbnail" width={400} height={165} loading="lazy" />
                                        <img src="https://cdn.shopify.com/s/files/1/0799/5929/4245/files/youtube-icon.webp?v=1698086589" alt="YouTube play button icon" className='w-[40px] lg:w-[70px] youtube-icon absolute top-1/2 left-1/2 transform  -translate-y-1/2 -translate-x-1/2' width={70} height={70} loading="lazy" />
                                        </div>
                                        }
                                    </div>
                                </div>
                                <h5 className='mb-[8px] text-[#00aeef] text-[13px] lg:text-[16px] font-bold lg:min-h-[48px]'>
                                <Link className="text-[#00aeef]" to="https://www.youtube.com/watch?v=LCGA84xtnNo&ab_channel=StatewideApplianceSpares">Welcome to Statewide Appliance Spares</Link>
                                </h5>
                                <div className="blg-desc hidden lg:block"><p className='text-[#1e5097] text-[14px] mb-[10px] '>
                                <Link to="https://www.youtube.com/watch?v=LCGA84xtnNo&ab_channel=StatewideApplianceSpares">Welcome to Statewide Appliance Spares - Australia's biggest and most trusted spare parts distributor.</Link>
                                </p></div>
                            </div>
                            <div className="item w-[50%] px-[15px] lg:px-[24px] lg:min-h-[352px] text-center lg:text-left">
                                <div className='img mb-[16px] relative'>
                                    <div>
                                        {showVideo2 ? 
                                        <iframe className='h-[86px] lg:h-[165px] w-full' src='https://www.youtube.com/embed/BnMAyKLwtSY?autoplay=1' title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen=""></iframe>
                                        :
                                        <div className='cursor-pointer' onClick={()=> setShowVideo2(true)}>
                                        <Image className='object-cover h-[86px] w-full max-w-full lg:h-[165px]' src="https://cdn.shopify.com/s/files/1/0799/5929/4245/files/youtube2.webp?v=1698086590" alt="Statewide Appliance Spares YouTube video thumbnail" width={400} height={165} loading="lazy" />
                                        <img src="https://cdn.shopify.com/s/files/1/0799/5929/4245/files/youtube-icon.webp?v=1698086589" alt="YouTube play button icon" className='w-[40px] lg:w-[70px] youtube-icon  absolute top-1/2 left-1/2 transform  -translate-y-1/2 -translate-x-1/2' width={70} height={70} loading="lazy" />
                                        </div>}
                                    </div>
                                </div>
                                <h5 className='mb-[8px] text-[#00aeef] text-[13px] lg:text-[16px] font-bold lg:min-h-[48px]'>
                                <Link className="text-[#00aeef]" to="https://www.youtube.com/watch?v=BnMAyKLwtSY&ab_channel=StatewideApplianceSpares">Home Appliance Repairs Made Easy</Link></h5>
                                <div className="blg-desc hidden lg:block"><p className='text-[#1e5097] text-[14px] mb-[10px] '>
                                    <Link to="https://www.youtube.com/watch?v=BnMAyKLwtSY&ab_channel=StatewideApplianceSpares">
                                    Need help with your home appliance repairs and maintenance? Check out our DIY videos! All the expert hints and tips to make appliance repairs a breeze.
                                    </Link>
                                    </p></div>
                            </div>
                            <div className='flex justify-center mt-[20px] lg:mt-6 text-center w-full'>
                                <Link to="https://www.youtube.com/channel/UCG7Wp7MygDui7EDEB9URjBQ" className="flex items-center justify-center font-bold h-[35px] w-[102px] bg-[#1e5097] text-white text-[14px] border-b-[1px]">VIEW ALL</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    )
}