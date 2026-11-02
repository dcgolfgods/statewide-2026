import {useState} from 'react';
import {Image} from '@shopify/hydrogen';
import {makeLastWordSingular, viewAllMenus} from '~/lib/utils';
import {Text} from './Text';
import {Link} from './Link';

const VIEW_ALL_STATIC_LABELS = {
    'Fridges & Freezers': <>All Fridge & Freezer parts</>,
    'Dishwashers': <>All Dishwasher parts</>,
    'Ovens & Cooktops': <>All Oven & Cooktop parts</>,
    'Rangehoods': <>All Rangehood parts</>,
    'Other Kitchen Appliances': null,
    'Washing Machines': <>All Washing Machine parts</>,
    'Dryers': <>All Dryer parts</>,
    'Air Conditioners': <>All Air Conditioner parts</>,
    'Heaters': <>All Heater parts</>,
    'Ventilation': <>All Ventilation parts</>,
    'Air Treatment': <>All Air Treatment parts</>,
    'Vacuum Cleaners': <>All Vacuum Cleaner parts</>,
    'Polishers': <>All Polisher parts</>,
    'Carpet Extractors': <>All Carpet Extractor parts</>,
    'Scrubbers': <>All Scrubber parts</>,
    'Carpet Cleaners': <>All Carpet Cleaner parts</>,
    'Sanders': <>All Sander parts</>,
    'Other Floor Care': null,
    'Televisions': <>All Television parts</>,
    'Home Theatres': <>All Home Theatre parts</>,
    "Blu Ray & DVD's": <>All Blu Ray & DVD parts</>,
    'Hi Fi & Stereos': <>All Hi Fi & Stereo parts</>,
    'Media Players': <>All Media Player parts</>,
    'Other TV, Audio & Video': <>All Other parts</>,
    'Mother & Child Care': <>All Mother & Child Care parts</>,
    'Shavers & Trimmers': <>All Shaver & Trimmer parts</>,
    'Oral Healthcare': <>All Oral Healthcare parts</>,
    'Other Personal Care': <>All Personal Care parts</>,
    'Garden & Power Tools': <>All Garden & Power Tool parts</>,
    'BBQs': <>All BBQ parts</>,
    'Computers': <>All Computer parts</>,
    'Mobile Phones': <>All Mobile Phone parts</>,
    'Cameras': <>All Camera parts</>,
    'Other Electronic Appliances': <>All Electronic Appliance parts</>,
    'Cleaning Products': <>All Cleaning products</>,
    'Floor Care New Equipment': <>All Floor Care Equipment</>,
    'Laundry New Equipment': <>All Laundry Equipment</>,
};

function normalizeTitle(value = '') {
    return value.replaceAll('##', ' ').replace(/\s+/g, ' ').trim();
}



function getViewAllCategoryLabel(title = '') {
    const trimmed = title.trim();

    if (Object.prototype.hasOwnProperty.call(VIEW_ALL_STATIC_LABELS, trimmed)) {
        return VIEW_ALL_STATIC_LABELS[trimmed];
    }

    if (viewAllMenus[trimmed]) {
        return `${viewAllMenus[trimmed].toLowerCase()} spare parts`;
    }

    return `${makeLastWordSingular(trimmed)} spare parts`;
}

function getMenuUrl(url = '') {
    if (!url) return '';
    return url
        .replace('https://statewide-appliances.myshopify.com', '')
        .replace('https://www.statewideapp.com.au', '')
        .replace('https://statewideapp.com.au', '')
        .replace('https://checkout.statewideapp.com.au', '');
}

export function MenuDrawer({ isOpen, onClose, menu, selectedLocale }) {
    const [active, setActive] = useState('');
    const [thirdActive, setThirdActive] = useState('');
    const handleCloseMenu = () =>{
        setActive('');
        setThirdActive('');
        document.body.classList.remove('overflow-hidden');
        onClose();
    }


  let data = [
    {
        "text": "Biggest Range in Australia",
        "img":"https://cdn.shopify.com/s/files/1/0799/5929/4245/files/Range-icon-blue.svg?v=1703420544",
        "link":"/lg"
    },
    {
        "text": "Fast Australia Wide Delivery",
        "img":"https://cdn.shopify.com/s/files/1/0799/5929/4245/files/Delivery-icon-blue.svg?v=1703420946",
        "link":"/lg"
    },
    {
        "text": "Lowest Price Guarantee",
        "img":"https://cdn.shopify.com/s/files/1/0799/5929/4245/files/Price-icon-blue.svg?v=1703421437",
        "link":"/lg"
    },
    {
        "text": "Expert Guidance",
        "img":"https://cdn.shopify.com/s/files/1/0799/5929/4245/files/Expert-icon-blue.svg?v=1703421483",
        "link":"/lg"
    }
]
    if(selectedLocale.country == 'NZ'){
      data = [
          {
              "text": "Biggest Range",
              "img":"https://cdn.shopify.com/s/files/1/0799/5929/4245/files/Range-icon-blue.svg?v=1703420544",
              "link":"/lg"
          },
          {
              "text": "Fast Delivery to NZ",
              "img":"https://cdn.shopify.com/s/files/1/0799/5929/4245/files/Delivery-icon-blue.svg?v=1703420946",
              "link":"/lg"
          },
          {
              "text": "Lowest Price Guarantee",
              "img":"https://cdn.shopify.com/s/files/1/0799/5929/4245/files/Price-icon-blue.svg?v=1703421437",
              "link":"/lg"
          },
          {
              "text": "Expert Guidance",
              "img":"https://cdn.shopify.com/s/files/1/0799/5929/4245/files/Expert-icon-blue.svg?v=1703421483",
              "link":"/lg"
          }
      ]
  }
    return (
        <>
            {isOpen && <div onClick={handleCloseMenu} className={`fixed bg-[#000000a8] top-0 bottom-0 left-0 right-0 z-[100] cursor-pointer `}>
            <div className="flex justify-center items-center mobile-overlay-cross absolute right-0 h-[50px] w-[50px] text-[#e0e7f1] text-[2.5em]"><i className="fa fa-times-circle"></i></div>
                </div>}
            <div className={`mobile-menu-drawer fixed top-0 left-0 bottom-0 h-full z-[110] bg-white w-[85%] transform transition-transform duration-300 ${!active && 'overflow-y-auto '} ${isOpen ? 'active translate-x-0' : '-translate-x-full'}`}>
                <h4 className='m-0 bg-[#e0e7f1] text-[#1e5097] py-[5px] px-[10px] font-bold'>Shop by Appliance Type</h4>
                <MenuMobileNav data={data} active={active} thirdActive={thirdActive} setActive={setActive} setThirdActive={setThirdActive} menu={menu} onClose={handleCloseMenu} />
                <OtherMenuItems onNavigate={handleCloseMenu} />
            </div>
        </>
    );
}

function USPSMenu({ data, onNavigate }){
    return(
        <div className="flex flex-col mt-[10px] px-[10px] ">
        {data.map((item,index)=>{
          return <div className="item my-[5px] flex items-center" key={index}>
        <Image className="max-w-[25px] h-[25px] lg:max-w-[30px] lg:h-[30px]" src={item.img} />
         
          <span className="text-[13px] font-semibold tracking-[1px] inline-block ml-[10px] text-[#00aeef]">
            {item.text}
          </span>
        </div>
        })}
        
      </div>
    )
}

function OtherMenuItems({onNavigate}){
    return(
        <>
        <Account onNavigate={onNavigate} />
                <Contact onNavigate={onNavigate} />
                <CustomerService onNavigate={onNavigate} />
                <Blog onNavigate={onNavigate} />
        </>
    ) 
} 

function MenuMobileNav({ menu, onClose, active, thirdActive, setThirdActive, setActive, data}) {

    return (
        <nav className="">
            {/* Top level menu items */}
            {(menu?.items || []).map((item) => (
                <span key={item.id} className="flex justify-between border-b-[2px] border-[#e0e7f1]">
                    <Link
                        key={item.id}
                        to={getMenuUrl(item.url || item.to)}
                        // target={item.target}
                        onClick={onClose}
                        className={"pl-[35px] pr-[10px] py-[10px] block"}
                    >
                        <Text as="span" size="copy">
                            {normalizeTitle(item.title)}
                        </Text>
                    </Link>
                    {item.items.length > 0 && 
                    <div onClick={()=> { setActive(item.id); setThirdActive(''); }} className="flex justify-center items-center sublist-toggle-box w-[50px] h-[50px] border-l-[2px] border-[#e0e7f1]"><div className="mobile-arrow-right"></div></div>}
                    {item.items.length > 0 && active == item.id && <SecondLevel data={data} setActive={setActive} thirdActive={thirdActive} setThirdActive={setThirdActive}  onClose={onClose} item={item} />}
                </span>
            ))}
        </nav>
    );
}

function SecondLevel({ item, setActive, onClose, thirdActive, setThirdActive, data }) {
    const isBrandsMenu = normalizeTitle(item.title).toLowerCase() === 'brands';

    if (isBrandsMenu) {
        const mobilePopularBrands = new Set([
            'Bosch',
            'Electrolux',
            'Fisher & Paykel',
            'Fujitsu',
            'Kelvinator',
            'LG',
            'Miele',
            'Mitsubishi Electric',
            'Panasonic',
            'Philips',
            'Samsung',
            'Simpson',
            'Westinghouse',
        ]);
        const visibleBrands = (item.items || []).filter((brandItem) =>
            mobilePopularBrands.has(normalizeTitle(brandItem.title)),
        );

        return (
            <div className={`second-level-items fixed w-full top-0 left-0 bottom-0 h-full z-[112] bg-white overflow-y-auto`}>
                <div className="nav-item-mobile back-first-level bg-[#8eb3e8]" onClick={() => { setThirdActive(''); setActive(''); }}>
                    <div className="mobile-menu-toggle">
                        <div className="mobile-arrow-left"></div>
                    </div>
                    {/* <div className="mobile-menu-back-new">{normalizeTitle(item.title)}</div> */}
                    <div className="mobile-menu-back-new">Popular Brands</div>

                </div>
                {/* <div className="py-[5px] px-[10px] text-[15.4px] font-bold text-[#1e5097] uppercase bg-[#e0e7f1]">
                    Popular Brands
                </div> */}
                <div className='pt-4 pb-2'>
                {visibleBrands.map((brandItem) => (
                    <span key={brandItem.id} className="flex justify-between ">
                        <Link
                            key={brandItem.id}
                            to={getMenuUrl(brandItem.url || brandItem.to)}
                            target={brandItem.target}
                            onClick={onClose}
                            className={"px-4 py-2 block"}
                        >
                            <Text as="span" size="copy">
                                {normalizeTitle(brandItem.title)}
                            </Text>
                        </Link>
                    </span>
                ))}
                </div>
                <span className="flex justify-between font-bold">
                    <Link
                        to={getMenuUrl(item.url || item.to)}
                        target={item.target}
                        onClick={onClose}
                        className={"px-4 py-2 text-[#00aeef] OpenSansBold block"}
                    >
                        All Brands
                    </Link>
                </span>
            </div>
        );
    }

    return(
    <div className={`second-level-items fixed w-full top-0 left-0 bottom-0 h-full z-[112] bg-white overflow-y-auto ${!setThirdActive && 'overflow-y-auto'}`}>
    <div className='flex flex-col h-full justify-between pb-4'>
       <div>
        <div className="nav-item-mobile back-first-level bg-[#8eb3e8]" onClick={()=> { setThirdActive(''); setActive(''); }}>
            <div className="mobile-menu-toggle">
                <div className="mobile-arrow-left"></div>
            </div>
            <div className="mobile-menu-back-new">{normalizeTitle(item.title)}</div>
        </div>
        {item.items.map((item)=>{
             return <span key={item.id} className="flex justify-between border-b-[2px] border-[#e0e7f1]">
             <Link
                 key={item.id}
                 to={getMenuUrl(item.url || item.to)}
                 // target={item.target}
                 onClick={onClose}
                 className={"px-[10px] py-[10px] block"}
             >
                 <Text as="span" size="copy">
                     {normalizeTitle(item.title)}
                 </Text>
             </Link>
             {item.items.length > 0 && 
             <div onClick={()=> setThirdActive(item.id)} className="flex justify-center items-center sublist-toggle-box w-[50px] h-[50px] border-l-[2px] border-[#e0e7f1]"><div className="mobile-arrow-right"></div></div>}
             {item.items.length > 0 && thirdActive == item.id && <ThirdLevel data={data} onClose={onClose} item={item} setThirdActive={setThirdActive} />}
         </span>
        })}
        </div>
        <USPSMenu data={data} onNavigate={onClose} />
        </div>
        {/* {getViewAllCategoryLabel(item.title) && <span key={item.id} className="flex justify-between font-bold border-b-[2px] ">
             <Link
                 key={item.id}
                 to={getMenuUrl(item.to)}
                 target={item.target}
                 onClick={onClose}
                 className={"px-[10px] py-[10px] block text-[#1e5097] max-w-[250px]"}
             >
                 {getViewAllCategoryLabel(item.title)}
             </Link>
         </span>} */}
    </div>
    )
}

function ThirdLevel({ item, onClose, setThirdActive, data }) {
    return (
    <div className={`third-level-items fixed w-full top-0 left-0 bottom-0 h-full z-[120] bg-white overflow-y-auto`}>
        <div className='flex flex-col h-full justify-between pb-4'>

<div>
         <div className="nav-item-mobile back-first-level bg-[#8eb3e8]" onClick={()=> setThirdActive('')}>
            <div className="mobile-menu-toggle">
                <div className="mobile-arrow-left"></div>
            </div>
            <div className="mobile-menu-back-new">{normalizeTitle(item.title)}</div>
        </div>
        {item.items.map((item)=>{
            return <span key={item.id} className="flex justify-between border-b-[2px] border-[#e0e7f1]">
            <Link
                key={item.id}
                to={getMenuUrl(item.url || item.to)}
                // target={item.target}
                onClick={onClose}
                className={"px-[10px] py-[10px] block"}
            >
                <Text as="span" size="copy">
                    {normalizeTitle(item.title)}
                </Text>
            </Link>
        </span>
        })}
        {getViewAllCategoryLabel(item.title) && <span key={item.id} className="flex justify-between font-bold border-b-[2px] ">
                <Link
                    key={item.id}
                    to={getMenuUrl(item.url || item.to)}
                    // target={item.target}
                    onClick={onClose}
                    className={"px-[10px] py-[10px] text-[#00aeef] OpenSansBold block text-[#00aeef]"}
                >
                    {getViewAllCategoryLabel(item.title)}
                </Link>
            </span>}
            </div>
        <USPSMenu data={data} onNavigate={onClose} />
        </div>

    </div>
    )
}
function Account({ onNavigate }) {
    return (
        <>
            <h4 className='m-0 bg-[#e0e7f1] text-[#1e5097] py-[5px] px-[10px] font-bold'>My Account</h4>
            <div className='py-[10px]'>
                <Link to="/account" className="relative block py-[5px] pl-[35px]" onClick={onNavigate}>
                    <i className="fa fa-user text-[19.2px] absolute left-[10px] top-1/2 -translate-y-1/2"></i>
                    <span className='inline-block font-bold text-[14.4px]'>My details</span>
                </Link>
                <Link to="/account" className="relative block py-[5px] pl-[35px]" onClick={onNavigate}>
                    <i className="fa fa-history text-[19.2px] absolute left-[10px] top-1/2 -translate-y-1/2"></i>
                    <span className='inline-block font-bold text-[14.4px]'>Order history</span>
                </Link>
            </div>
        </>
    )
}

function Contact({ onNavigate }) {
    return (
        <>
            <h4 className='m-0 bg-[#e0e7f1] text-[#1e5097] py-[5px] px-[10px] font-bold'>Contact us</h4>

            <div className="mobile-menu-footer-links py-[10px]">
                <div className="mobile-menu-footer-contact-box py-[5px]">
                    <a href="tel:+611800005220" onClick={onNavigate}>
                        <div className="mobile-link">
                            <div className="mobile-footer-contact-heading relative pl-[35px]">
                                <div className="mobile-footer-icon absolute left-[10px] top-[2px]"><i className="text-[19.2px] fa fa-phone"></i></div>
                                <div className="mobile-footer-link-text text-[14.4px] font-bold">Aus Free call | 1800 005 220</div>
                            </div>
                            <div className="mobile-footer-contact-heading">
                                <div className="mobile-footer-link-text pl-[35px] text-[14.4px] font-bold">NZ Local call | 09 965 5155</div>
                            </div>
                            <div className="mobile-footer-link-text pl-[35px] text-[14.4px]">
                                <div>Mon-Fri: 8:30am - 5:00pm (CST)</div>
                                <div>Sat: 8:30am - 12:30pm (CST)</div>
                            </div>
                        </div>
                    </a></div>
                <div className="mobile-menu-footer-contact-box py-[5px]"><a href="/contactus" onClick={onNavigate}>
                    <div className="mobile-link">
                        <div className="mobile-footer-contact-heading relative pl-[35px]">
                            <div className="mobile-footer-icon absolute left-[10px] top-[2px]"><i className="text-[16.2px] fa fa-envelope"></i></div>
                            <div className="mobile-footer-link-text text-[14.4px] font-bold">Email us</div>
                        </div>
                        <div className="mobile-footer-link-text pl-[35px] text-[14.4px]">
                            <div>spares@statewideapp.com.au</div>
                        </div>
                    </div>
                </a></div>
                <div className="mobile-menu-footer-contact-box py-[5px]"><a href="/contactus" onClick={onNavigate}>
                    <div className="mobile-link">
                        <div className="mobile-footer-contact-heading relative pl-[35px]">
                            <div className="mobile-footer-icon absolute left-[10px] top-[2px]"><i className="text-[19.2px] fa fa-map-marker"></i></div>
                            <div className="mobile-footer-link-text text-[14.4px] font-bold">Visit us</div>
                        </div>
                        <div className="mobile-footer-link-text pl-[35px] text-[14.4px]">
                            <div>105 Sir Donald Bradman Dr, Hilton, SA 5033</div>
                        </div>
                    </div>
                </a></div>
                <div className="mobile-menu-footer-contact-box py-[5px]"><a href="https://www.facebook.com/statewideapp?fref=ts" onClick={onNavigate}>
                    <div className="mobile-link">
                        <div className="mobile-footer-contact-heading relative pl-[35px]">
                            <div className="mobile-footer-icon absolute left-[10px] top-[2px]"><i className="text-[19.2px] fa fa-facebook"></i></div>
                            <div className="mobile-footer-link-text text-[14.4px] font-bold">Like us on Facebook</div>
                        </div>
                    </div>
                </a></div>
                <div className="mobile-menu-footer-contact-box py-[5px]"><a href="https://www.youtube.com/channel/UCG7Wp7MygDui7EDEB9URjBQ" onClick={onNavigate}>
                    <div className="mobile-link">
                        <div className="mobile-footer-contact-heading relative pl-[35px]">
                            <div className="mobile-footer-icon absolute left-[10px] top-[2px]"><i className="text-[19.2px] fa fa-youtube-play"></i></div>
                            <div className="mobile-footer-link-text text-[14.4px] font-bold">Subscribe to our YouTube channel</div>
                        </div>
                    </div>
                </a>
                </div>
            </div>
        </>
    )
}

function CustomerService({ onNavigate }) {
    return (
        <>
            <h4 className='m-0 bg-[#e0e7f1] text-[#1e5097] py-[5px] px-[10px] font-bold'>Customer Service</h4>
            <div className="mobile-menu-footer-links py-[10px]">
                <a href="/contactus" onClick={onNavigate}>
                    <li className="mobile-link relative font-bold py-[5px] pl-[35px]">
                        <div className="mobile-footer-icon absolute left-[10px] top-1/2 -translate-y-1/2"><i className="text-[14.4px] fa fa-envelope"></i></div>
                        <div className="mobile-footer-link-text text-[14.4px]">Enquiries</div>
                    </li>
                </a> <a href="/contactus" onClick={onNavigate}>
                    <li className="mobile-link relative font-bold py-[5px] pl-[35px]">
                        <div className="mobile-footer-icon absolute left-[10px] top-1/2 -translate-y-1/2"><i className="text-[14.4px] fa fa-envelope"></i></div>
                        <div className="mobile-footer-link-text text-[14.4px]">Leave Feedback</div>
                    </li>
                </a> <a href="/deliveries-returns" onClick={onNavigate}>
                    <li className="mobile-link relative font-bold py-[5px] pl-[35px]">
                        <div className="mobile-footer-icon absolute left-[10px] top-1/2 -translate-y-1/2"><i className="text-[19.2px] fa fa-truck"></i></div>
                        <div className="mobile-footer-link-text text-[14.4px]">Deliveries &amp; Returns</div>
                    </li>
                </a> <a href="/aboutus" onClick={onNavigate}>
                    <li className="mobile-link relative font-bold py-[5px] pl-[35px]">
                        <div className="mobile-footer-icon absolute left-[10px] top-1/2 -translate-y-1/2"><i className="text-[14.2px] fa fa-address-card"></i></div>
                        <div className="mobile-footer-link-text text-[14.4px]">About Us</div>
                    </li>
                </a>
            </div>
        </>
    )
}

function Blog({ onNavigate }) {
    return (
        <>
            <h4 className='m-0 bg-[#e0e7f1] text-[#1e5097] py-[5px] px-[10px] font-bold'>Statewide Blog</h4>
            <div className="mobile-menu-footer-links py-[10px]">
               <a href="/blogs" onClick={onNavigate}>
                    <li className="mobile-link relative font-bold py-[5px] pl-[35px]">
                        <div className="mobile-footer-icon absolute left-[10px] top-1/2 -translate-y-1/2"><i className="text-[14.2px] fa fa-newspaper-o"></i></div>
                        <div className="mobile-footer-link-text text-[14.4px]">Latest on the Statewide blog</div>
                    </li>
                </a>
            </div>
        </>
    )
}