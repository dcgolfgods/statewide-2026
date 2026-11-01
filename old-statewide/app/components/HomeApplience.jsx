import { homeApplinces } from './home-data';
import { OptimizedImage } from './OptimizedImage';
import { Link } from '~/components';
import { Image } from '@shopify/hydrogen';

export function HomeApplinces() {
    return (
        <>
        <div className='home-appliences  container mx-auto lg:mb-8 mb-4 lg:px-0 px-4'>
            <div className='lg:mt-4 lg:mb-8 mb-4'>
            {/* <div className='image lg:mb-5'>
                <Link to={"miele-vacuum-bags-filters"}>
                <Image
                    className='w-ful hidden lg:block'
                    src="https://cdn.shopify.com/s/files/1/0799/5929/4245/files/Static_Banner_Desktop_Final.webp?v=1754288330"
                    loading="lazy" />

                <Image
                    className='w-ful  lg:hidden block'
                    src="https://cdn.shopify.com/s/files/1/0799/5929/4245/files/Miele_high_res.webp?v=1753981184"
                    loading="lazy" />
                </Link>

            </div> */}
            <h5 className='text-center lg:pt-0 lg:pb-0 pt-[14px] pb-[18px] font-semibold text-[#1e5097] lg:text-[25px] text-[20px] mb-[0] lg:mb-[20px]'>Shop by appliance type</h5>
            <div className='grid grid-cols-3 lg:grid-cols-6 lg:gap-x-6 gap-x-4 gap-y-3'>
                {homeApplinces.map((item, i) => {
                    return (
                        <div key={i} className='item relative'>
                            <Link to={item.url} className="cursor-pointer block w-full h-full">
                                <div className='img bg-[#f5f5f5] relative'>

                                    <Image
                                        className='relative z-10 w-full h-auto cursor-pointer object-contain'
                                        src={item.img.trim()}
                                        alt={item.alt}
                                        sizes="(min-width: 1024px) 180px, 30vw"
                                        width={500}
                                        height={500}
                                        loading="lazy" />
                                </div>
                                <h5 className='text-xs lg:text-base text-[#1e5097] font-semibold text-center mt-3'>{item.text}</h5>
                            </Link>
                        </div>
                    )
                })}
            </div>
            </div>

        </div>
        {/* <div className='w-full mt-1'>
                <Link to={"/announcement"} className="block w-full cursor-pointer">
                    <Image className='w-full lg:block hidden h-auto max-w-full' src={"https://cdn.shopify.com/s/files/1/0799/5929/4245/files/40_year_Website_Banner_webp_1.webp"} alt="Celebrating 40 years of Statewide Appliance Spares" loading="lazy" />
                    <Image className='w-full lg:hidden h-auto max-w-full' src={"https://cdn.shopify.com/s/files/1/0799/5929/4245/files/40_year_Website_Banner_1200_x_200_px.webp?v=1766475434"} alt="Celebrating 40 years of Statewide Appliance Spares" loading="lazy" />
                </Link>
            </div> */}
        </>
    )
}
