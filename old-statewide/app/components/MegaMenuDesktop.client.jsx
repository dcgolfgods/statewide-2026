import {Image} from '@shopify/hydrogen';
import {makeLastWordSingular, viewAllMenus} from '~/lib/utils';
import {Link} from './Link';

/** Pin mega menu open for DevTools — set false before production */
export const MEGA_MENU_DEBUG_PIN_OPEN = false;
/** Top nav index when pinned (0 = first item, e.g. Kitchen Appliances) */
export const MEGA_MENU_DEBUG_PIN_INDEX = 0;


const ExtraGapMenus = [
  "Washers & Dryers",
  // "Other Appliances",
  "Commercial Equipment",
  // "Air Conditioning",
]

const MenuImages = {
  "Kitchen Appliances": [
    {
      image: 'https://cdn.shopify.com/s/files/1/0799/5929/4245/files/Kitchen_Appliances_FINAL_6127d781-6292-45e1-b21a-ac3d3e9f5ce8.webp?v=1781523958',
      url: '/lg/fridges-and-freezers/filters',
      alt: 'Shop genuine LG fridge filters',
    }
  ],
  "Washers & Dryers": [
    {
      image: 'https://cdn.shopify.com/s/files/1/0799/5929/4245/files/Washers___Dryers_f147ad54-f37d-4625-b474-0a7993f32dc3.webp?v=1781249652',
      url: '/power-of-4-laundry-essentials-bundle-pack',
      landscape: true,
      alt: 'Shop laundry spare parts and accessories',
    }
  ],
  "Air Conditioning": [
    {
      image: 'https://cdn.shopify.com/s/files/1/0799/5929/4245/files/Air_Conditioning_1a5c682d-ac6f-404a-8c6f-261af0e6154a.webp?v=1781523958',
      url: '/air-conditioners',
      landscape: true,
      alt: 'Shop air conditioning spare parts',
    }

  ],
  "Vacuum & Floor Care": [
    {
      image: 'https://cdn.shopify.com/s/files/1/0799/5929/4245/files/Vacuums___Floor_Care_ed1966b0-1297-47c4-a401-80c58ef35ba6.webp?v=1781523958',
      url: '/miele-vacuum-bags-filters',
      landscape: true,
      alt: 'Shop genuine vacuum cleaner dust bags and spare parts',
    }
  ],
  "TV, Audio & Video": [
    {
      image: 'https://cdn.shopify.com/s/files/1/0799/5929/4245/files/TV__Audio___Video_0c94d347-35ff-4619-8cd7-b696bd9ff89f.webp?v=1781523958',
      url: '/televisions/remote-control',
      landscape: true,
      alt: 'Shop TV, audio and video spare parts',
    }
  ],
  "Personal Care": [
    {
      image: 'https://cdn.shopify.com/s/files/1/0799/5929/4245/files/Statewide_Blog_1.webp?v=1781639729',
      url: '/blogs',
      landscape: true,
      alt: 'Shop personal care appliance spare parts',
    }
  ],
  "Garden & Power Tools": [
    {
      image: 'https://cdn.shopify.com/s/files/1/0799/5929/4245/files/Brands__Cyan_1.webp?v=1781639728',
      url: '/contactus',
      landscape: true,
      alt: 'Contact us',
    },
    {
      image: 'https://cdn.shopify.com/s/files/1/0799/5929/4245/files/Garden_Power_TOols_1.webp?v=1781639729',
      url: '/power-tools',
      landscape: true,
      alt: 'Shop garden and power tool spare parts',
    }
    
  ],
  "Other Appliances": [
    {
      image: 'https://cdn.shopify.com/s/files/1/0799/5929/4245/files/Statewide_Blog_54a36e6d-d2bb-4d33-a9fb-8b4e5e05f79f.webp?v=1781523958',
      url: '/blogs',
      landscape: true,
      alt: 'Shop other appliance spare parts',
    }
  ],
  "Cleaning Products": [  
    {
      image: 'https://cdn.shopify.com/s/files/1/0799/5929/4245/files/Cleaning_products_0f74c577-ac62-44a8-9491-ae0164dd1c48.webp?v=1781523958',
      url: '/enzyme-wizard/cleaning-products',
      landscape: true,
      alt: 'Shop appliance cleaning products',
    },
    {
      image: 'https://cdn.shopify.com/s/files/1/0799/5929/4245/files/Statewide_Blog_1.webp?v=1781639729',
      url: '/blogs',
      landscape: true,
      alt: 'Read appliance repair tips on the Statewide blog',
    }
  ],
  "Commercial Equipment": [
    {
      image: 'https://cdn.shopify.com/s/files/1/0799/5929/4245/files/Commercial_Equipment_a0efc414-0942-48f8-90c7-3be0ff9c192c.webp?v=1781523958',
      url: '/new-commercial-equipment',
      landscape: true,
      alt: 'Shop commercial laundry and floor care equipment',
    }
  ],
  "Brands": [
    {
      image: 'https://cdn.shopify.com/s/files/1/0799/5929/4245/files/Brands__Dark_Blue_1.webp?v=1781639729',
      url: '/contactus',
      landscape: true,
      alt: 'Contact us',
    },
    {
      image: 'https://cdn.shopify.com/s/files/1/0799/5929/4245/files/Brands_2.webp?v=1781523958',
      url: '/aboutus',
      landscape: true,
      alt: 'Shop appliance spare parts by brand',
    }
  ]
};

const getMenuPromoImages = (menuTitle = '') => MenuImages[menuTitle.trim()] || null;

const VIEW_ALL_PARTS_LINE_BREAK_TITLES = [
  'dryers',
  'heaters',
  'polishers',
  'bbqs',
  'sanders',
  'cameras',
  'blu ray / dvds',
  'hi fi / stereos',
  'other personal care',
];



const VIEW_ALL_STATIC_LABELS = {
  'Fridges & Freezers': <>All Fridge & Freezer parts</>,
  'Dishwashers': <>All Dishwasher parts</>,
  'Ovens & Cooktops': <>All Oven & Cooktop parts</>,
  'Rangehoods': <>All Rangehood parts</>,
  'Other Kitchen Appliances': <></>,
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
  // 'Other Floor Care': <>All Other Floor Care parts</>,

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

const VIEW_ALL_EQUIPMENT_LINE_BREAK_TITLES = [
  'floor care new equipment',
  'laundry new equipment',
];

/** Commercial Equipment column headings shown on two lines */
const TWO_LINE_COLUMN_HEADINGS = {
  'Floor Care New Equipment': ['Floor Care', 'New Equipment'],
  'Laundry New Equipment': ['Laundry', 'New Equipment'],
};

function renderColumnHeading(title = '', normalizeTitle) {
  const lines = TWO_LINE_COLUMN_HEADINGS[title.trim()];
  if (lines) {
    return (
      <span className="flex flex-col leading-tight">
        <span>{lines[0]}</span>
        <span>{lines[1]}</span>
      </span>
    );
  }
  return normalizeTitle(title);
}

function getViewAllCategoryLabel(title = '') {
  const trimmed = title.trim();

  if (Object.prototype.hasOwnProperty.call(VIEW_ALL_STATIC_LABELS, trimmed)) {
    return VIEW_ALL_STATIC_LABELS[trimmed];
  }

  if (viewAllMenus[trimmed]) {
    return viewAllMenus[trimmed].toLowerCase();
  }

  return makeLastWordSingular(trimmed);
}

function shouldBreakViewAllParts(title = '') {
  return VIEW_ALL_PARTS_LINE_BREAK_TITLES.includes(title.trim().toLowerCase());
}

function renderViewAllPartsLabel(title = '') {
  const titleLower = title.trim().toLowerCase();

  if (titleLower === 'cleaning products') {
    return ' ';
  }

  if (VIEW_ALL_EQUIPMENT_LINE_BREAK_TITLES.includes(titleLower)) {
    return (
      <>
        <br />
        equipment
      </>
    );
  }

  if (shouldBreakViewAllParts(title)) {
    return (
      <>
        <br />
        parts
      </>
    );
  }

  return ' parts';
}

const noWidthMenus = ['Washers & Dryers', 'Air Conditioning', 'Brands', 'Garden & Power Tools', 'Personal Care', 'Cleaning Products', 'Commercial Equipment', 'Other Appliances'];

function MegaMenuPromo({menuTitle}) {
  const promoImages = getMenuPromoImages(menuTitle);
  if (!promoImages?.length) return null;

  return (
    <div className="flex items-center gap-4 h-full">
      {promoImages.map(({image, url, landscape, alt}, idx) => (
        <Link
          key={`${menuTitle}-promo-${idx}`}
          className="flex justify-center items-center h-full"
          to={url}
        >
          <Image
            src={image}
            alt={alt || `${menuTitle} promo`}
            // className="w-full min-w-[220px] h-[220px] object-cover"
            // className="w-full min-w-[220px] h-[190px] object-contain"
            className={`w-full min-w-[220px]   ${landscape ? 'h-[220px] object-contain ' : 'h-[220px] object-cover'}`}


          />
        </Link>
      ))}
    </div>
  );
}

const MegaMenuDesktop = ({item}) => {
  const INTERNAL_HOSTS = [
    'statewide-appliances.myshopify.com',
    'www.statewideapp.com.au',
    'statewideapp.com.au',
    'checkout.statewideapp.com.au',
  ];

  const getUrl = (url = '') => {
    url = url.replace('https://statewide-appliances.myshopify.com', '');
    url = url.replace('https://www.statewideapp.com.au', '');
    url = url.replace('https://statewideapp.com.au', '');
    url = url.replace('https://checkout.statewideapp.com.au', '');

    return url;
  };

  const getLinkTarget = (url = '', target) => {
    if (!target) return undefined;
    if (!url.startsWith('http://') && !url.startsWith('https://')) return undefined;

    try {
      const host = new URL(url).hostname;
      return INTERNAL_HOSTS.includes(host) ? undefined : target;
    } catch {
      return undefined;
    }
  };

  const normalizeTitle = (value = '') =>
    value.replaceAll('##', ' ').replace(/\s+/g, ' ').trim();
  const splitColumnItems = (items = []) => {
    if (items.length <= 8) {
      return [items];
    }
    return [items.slice(0, 8), items.slice(8)];
  };
  const splitBrandsItems = (items = [], totalColumns = 3) => {
    if (!items.length) return [];
    const chunkSize = Math.ceil(items.length / totalColumns);
    return Array.from({length: totalColumns}, (_, index) =>
      items.slice(index * chunkSize, (index + 1) * chunkSize),
    ).filter((columnItems) => columnItems.length > 0);
  };
  const hasShortSubItemsColumn = (item?.items || []).some(
    (menuColumn) => (menuColumn?.items?.length || 0) < 5,
  );

  const renderMenuColumn = (secondItem, i, useMtAuto = true, extra= false) => (
    <>

     <div> 
      <Link
        className="flex w-fit text-[#00aeef] OpenSansBold text-[14px] font-semibold mb-2 hover:underline whitespace-nowrap"
        to={getUrl(secondItem.url)}
        target={getLinkTarget(secondItem.url, secondItem.target)}
      >
        {renderColumnHeading(secondItem?.title, normalizeTitle)}
      </Link>

      <div className="flex w-fit gap-x-6">
        {splitColumnItems(secondItem?.items).map((columnItems, columnIdx) => (
          <div
            key={`${secondItem.id}-${columnIdx}-col`}
            className="flex w-fit flex-col gap-[6px] min-w-0"
          >
            {columnItems.map((thirdItem, idx) => (
              <Link
                key={`${thirdItem.id}-${idx}-third-menu`}
                className="text-[#1e5097] text-[13px] leading-[1.4] hover:underline"
                to={getUrl(thirdItem.url)}
                target={getLinkTarget(thirdItem.url, thirdItem.target)}
              >
                {normalizeTitle(thirdItem?.title)}
              </Link>
            ))}
          </div>
        ))}
      </div>
      </div>
      {getViewAllCategoryLabel(secondItem.title) && <span
        className={`inline-flex ${extra ? 'pt-4' : 'pt-4'} ${secondItem.title == 'Other Electronic Appliances' ? '' :''} ${useMtAuto ? '' : ''}`}
      >
        <Link
          className="text-xs text-[#00aeef] text-[13px]"
          to={getUrl(secondItem.url)}
          target={getLinkTarget(secondItem.url, secondItem.target)}
        >
          <span className="hover:underline text-[13px] leading-[1.4] OpenSansBold">
            <span className="">
              {getViewAllCategoryLabel(secondItem.title)}
            </span>
          </span>
        </Link>
      </span>}
    </>
  );

  return (
    <>
      <div
        className="bg-white min-h-[355px] w-full second-level-main-menu h-auto pb-[24px] absolute mx-auto justify-center z-[20] left-0 right-0 top-full"
        style={{boxShadow: '0px 27px 27px 3px rgba(0,0,0,0.1)'}}
      >
        <div className="container">
          <div className="bg-white w-full h-auto flex justify-between gap-6 pt-[22px] pb-[12px] mx-auto overflow-hidden">
            <div
              className={`min-w-0  ${noWidthMenus.includes(item.title?.trim()) ? '' : 'w-[80%]'}`}
            >
              {item.title?.trim() === 'Brands' ? (
                <div className="flex flex-col gap-[6px]  text-[14px]">
                  <p className="flex w-fit text-[#00aeef] OpenSansBold text-[14px] font-semibold mb-2 hover:underline">
                    Most Popular Brands
                  </p>
                  <div className="flex w-fit gap-x-16 h-full">
                    {splitBrandsItems(item.items || [], 3).map(
                      (columnItems, columnIdx) => (
                        <div
                          key={`brands-${columnIdx}-col`}
                          className="flex flex-col gap-[6px]"
                        >
                          {columnItems.map((secondItem, i) => (
                            <Link
                              key={`${secondItem.id}-${i}-brand-menu`}
                              className="text-[#1e5097] text-[13px] leading-[1.4] hover:underline"
                              to={getUrl(secondItem.url)}
                              target={getLinkTarget(
                                secondItem.url,
                                secondItem.target,
                              )}
                            >
                              {normalizeTitle(secondItem?.title)}
                            </Link>
                          ))}

{columnIdx == splitBrandsItems(item.items || [], 3).length - 1 && <p className="mt-2">
                    <Link
                      className="text-[#00aeef] OpenSansBold text-[13px]"
                      to="/all-brands"
                    >
                      <span className="hover:underline">All Brands</span>
                    </Link>
                  </p>
                  }
                        </div>
                      ),
                    )}
                  </div>
                  
                </div>
              ) : (
                <div
                  className={`flex w-fit h-full ${
                    item.title === 'Other Appliances'
                      ? 'gap-x-8'
                      : ExtraGapMenus.includes(item.title)
                        ? 'gap-x-16'
                        : 'gap-x-4'
                  }`}
                >
                  {item.items.map((secondItem, i) => {
                    const isVacuumFloorCareMenu =
                      item.title === 'Vacuum & Floor Care' ||
                      item.title === 'Vacuums & Floor Care';
                    const hasFewSubItems = (secondItem?.items?.length || 0) < 5;
                    const extraColumnGapClass =
                      hasFewSubItems && i !== item.items.length - 1 ? '' : '';
                    const currentTitle = normalizeTitle(
                      secondItem?.title,
                    ).toLowerCase();
                    const prevTitle = normalizeTitle(
                      item.items[i - 1]?.title,
                    ).toLowerCase();
                    const nextItem = item.items[i + 1];
                    const nextTitle = normalizeTitle(nextItem?.title).toLowerCase();

                    if (
                      isVacuumFloorCareMenu &&
                      currentTitle === 'sanders' &&
                      prevTitle === 'other floor care'
                    ) {
                      return null;
                    }

                    if (
                      isVacuumFloorCareMenu &&
                      currentTitle === 'other floor care' &&
                      nextTitle === 'sanders'
                    ) {
                      return (
                        <div
                          key={`${secondItem.id}-${i}-second-menu`}
                          className={`flex flex-col min-h-[220px] w-fit justify-between ${extraColumnGapClass}`}
                        >
                          {renderMenuColumn(secondItem, i, false, true)}
                          <div className="pt-2 flex flex-col justify-between">
                            {renderMenuColumn(nextItem, i + 1, false)}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={`${secondItem.id}-${i}-second-menu`}
                        className={`flex flex-col min-h-[220px] w-fit justify-between ${extraColumnGapClass}`}
                      >
                        {renderMenuColumn(secondItem, i)}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div
              className=""
            >
              <MegaMenuPromo menuTitle={item.title} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MegaMenuDesktop;