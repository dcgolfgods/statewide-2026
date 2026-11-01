import { brands } from "./home-data";
import { Image } from '@shopify/hydrogen';
import {Link} from  '~/components';
export function Brands(){
    return(
        <div className="brands lg:w-[85%] px-4 lg:px-0 lg:my-8 my-4  mx-auto relative">
            <h5 className='lg:mb-5 mb-3 text-[#1e5097] font-bold text-center text-[25px]'>Popular brands</h5>
            <div className="brands-items grid lg:grid-cols-9 grid-cols-5 gap-y-1 lg:gap-y-2 lg:gap-x-10 gap-x-5">
                {brands.map(({url,img, mobImg},index)=>{
                    return <div className="brand" key={index}>
                        <Link to={url} className="flex items-center col-span-1 justify-center h-[40px] lg:h-[60px]">
                            <div className="w-full mx-auto">
                                {mobImg ? 
                                    <>
                                    <Image className="hidden lg:block" src={img}  loading="lazy" alt={url}/>
                                    <Image className="lg:hidden block" src={mobImg}  loading="lazy" alt={url}/>
                                    </>
                                :
                                <Image className="block" src={img}  loading="lazy" alt={url}/>
                                }
                            </div>
                        </Link>
                    </div>
                })}
                <div className="lg:hidden flex col-span-2 justify-end items-center">
                <Link className="decoration-solid" to="/all-brands">View All</Link>
            </div>
            </div>
            <div className="lg:flex hidden justify-end pr-[10px] lg:px-4 lg:static absolute bottom-[10px] mt-6 right-0">
                <Link className="decoration-solid" to="/all-brands">View All</Link>
            </div>
        </div>
    )
}