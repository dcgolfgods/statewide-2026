/**
 * Model number guide sections for /findyourmodel and the "find your model"
 * popup. The page loads these from `model_number_guide` metaobjects
 * (see app/lib/modelGuide.server.js); this copy is the fallback used when no
 * metaobjects are published, and the seed the metaobjects were created from.
 *
 * Shape: {appliance, slug, summary, bodyHtml, images: [{url, alt, width, height}], link: {url, label}}
 */
const CDN = 'https://cdn.shopify.com/s/files/1/0799/5929/4245/files';

export const modelData = [
  {
    appliance: 'Air conditioners',
    slug: 'airconditioners',
    summary:
      'The location of model number information for airconditioners can vary greatly upon manufacturer, model and type of system. There are three main types of airconditioner systems:',
    bodyHtml:
      "<h3>Ducted Systems</h3><p>This will consist usually of two separate units. One located outside of the house/building, the other inside the roof cavity. The outside or 'outdoor unit' will normally have a sticker with the model information located on the side. Sometimes though it may be on the back, which could be difficult to read without a mirror if it is closely located to a wall. The inside or 'indoor unit' being in the roof cavity may be difficult for most people to get to. It will also have a sticker with model information on it. Depending on the manufacturer/model it may be possible to cross reference the indoor unit information from the outdoor model number.</p><h3>Split/Cassette Systems</h3><p>These are very similar to ducted systems, but the indoor unit should be visible either on a wall (known as split system) or in the ceiling (known as cassette system). Outdoor unit information should again be on a sticker located on the side or back of the unit. For split system types, the model number is most commonly located on the bottom edge or side of the unit. Cassette units will most likely be located on the panel behind the filter cover/holder. Make sure the unit is not operating while you remove the cover, and check your owners manual if you are unsure of how to remove it.</p><h3>Window/Wall Systems</h3><p>Most of the time model number information will be located on the side of the unit. Unfortunately some installers aren't aware of this, and quite often is the case that it gets covered by the wall.</p>",
    images: [
      {url: `${CDN}/AirconModel.webp?v=1715448530`, alt: 'Model number label on the side of a split system indoor unit', width: 960, height: 582},
      {url: `${CDN}/AirconUnitModel.webp?v=1715448530`, alt: 'Model number label on the side of a split system outdoor unit', width: 600, height: 314},
    ],
    link: {url: '/air-conditioners', label: 'Shop air conditioner parts'},
  },
  {
    appliance: 'CD / HI-FI / Home Theatre',
    slug: 'cd-hifi-home-theatre',
    summary:
      'In most instances you will find the model number on the back of the unit. Some manufacturers may place it on the bottom or side of the product.',
    images: [
      {url: `${CDN}/HomeTheaterModel.webp?v=1715448613`, alt: 'Model number label on the back panel of a home theatre system', width: 431, height: 264},
    ],
    link: {url: '/home-theatres', label: 'Shop home theatre parts'},
  },
  {
    appliance: 'Cook Tops',
    slug: 'cooktops',
    summary:
      'Most manufacturers place the model number on the underside of the cooktop, which will be visible by either removing the cooktop or by getting underneath the unit.',
    images: [
      {url: `${CDN}/CooktopModel.webp?v=1715448700`, alt: 'Model number label from the underside of a gas cooktop', width: 635, height: 257},
    ],
    link: {url: '/gas', label: 'Shop cooktop parts'},
  },
  {
    appliance: 'Dishwashers',
    slug: 'dishwashers',
    summary:
      'Most manufacturers will place the model number either on the inner side of the dishwasher door, along the inner base of the dishwashing unit or along the side sill depending on the manufacturer.',
    images: [
      {url: `${CDN}/Dishwasher.webp?v=1715448829`, alt: 'Model number label on the inside edge of an open dishwasher door', width: 1000, height: 500},
    ],
    link: {url: '/dishwashers', label: 'Shop dishwasher parts'},
  },
  {
    appliance: 'DVD / Bluray / HDD / VCR',
    slug: 'dvd-bluray-hdd-vcr',
    summary: 'Most likely location of the model number information is on the back or bottom of the unit.',
    images: [
      {url: `${CDN}/DVDModel.webp?v=1715448909`, alt: 'Model number label on the back panel of an audio visual unit', width: 717, height: 257},
    ],
    link: {url: '/blu-ray-dvd', label: 'Shop DVD and Blu-ray parts'},
  },
  {
    appliance: 'Microwaves',
    slug: 'microwaves',
    summary:
      "Most manufacturers will locate the model number information on the side of the keypad, which will become visible once you open the door. If you can't see it when you open the door (it may be on the door itself, or somewhere where the door shuts against) you will most likely have to look on the back of the microwave.",
    images: [
      {url: `${CDN}/MicrowaveModel.webp?v=1715448976`, alt: 'Model number label on the front edge of a microwave cavity, visible with the door open', width: 655, height: 400},
    ],
    link: {url: '/microwaves', label: 'Shop microwave parts'},
  },
  {
    appliance: 'Mobile Phones',
    slug: 'mobile-phones',
    summary:
      "For most mobile phone brands, you will need to remove the battery to find the model number. If you have a phone where the battery is non-removable then it is probably written on the front of the phone around the edge of the screen or found in your phones settings menu.",
    images: [
      {url: `${CDN}/MobileModel.webp?v=1715449040`, alt: 'Model number label under the battery of a mobile phone', width: 626, height: 331},
    ],
    link: {url: '/mobile-phones', label: 'Shop mobile phone parts'},
  },
  {
    appliance: 'Ovens',
    slug: 'ovens',
    summary:
      'Most manufacturers will place the model number on the inside of the door along the bottom sill of the inside of the oven.',
    images: [
      {url: `${CDN}/OvenModel.webp?v=1715449084`, alt: 'Model number label on the bottom sill inside an oven door opening', width: 758, height: 392},
    ],
    link: {url: '/ovens-and-cooktops', label: 'Shop oven parts'},
  },
  {
    appliance: 'Range Hoods',
    slug: 'range-hoods',
    summary:
      'Most manufacturers will place the model number on the inner rim of the Rangehood. You will most likely have to remove the filters to find your model number.',
    images: [
      {url: `${CDN}/RangeHood.webp?v=1715449182`, alt: 'Model number label on the inner rim of a canopy rangehood', width: 1500, height: 600},
    ],
    link: {url: '/rangehoods', label: 'Shop rangehood parts'},
  },
  {
    appliance: 'Refrigerators / Freezers',
    slug: 'refrigerators-freezers',
    summary:
      'Most manufacturers will not make you have to pull your fridge out to obtain model information on the back of it. Although it may be on the back, there is most likely a second copy (simpler version) on the inside of the fridge. If it is not located on the side of the door once you open it, look for it on the front edge of the fridge/freezer cabinet somewhere.',
    images: [
      {url: `${CDN}/FridgeModel.webp?v=1715449248`, alt: 'Model number label on the inside wall of a side-by-side fridge', width: 657, height: 495},
    ],
    link: {url: '/fridge-parts', label: 'Shop fridge and freezer parts'},
  },
  {
    appliance: 'TVs',
    slug: 'tvs',
    summary: "Model number information for TV's in most cases is on the back of the unit. It may be in the centre or on one side.",
    images: [
      {url: `${CDN}/TVModel.webp?v=1715449317`, alt: 'Model number label on the back panel of a flat screen TV', width: 791, height: 554},
    ],
    link: {url: '/televisions', label: 'Shop TV parts'},
  },
  {
    appliance: 'Washing Machines',
    slug: 'washing-machines',
    summary:
      "Most manufacturers place the model number on the control panel near the buttons & lights. Some front load washing machines may have it on the door or where the door closes if it's not visible on the control panel.",
    images: [
      {url: `${CDN}/WasherModel.webp?v=1715449402`, alt: 'Model number label inside the door rim of a front load washing machine', width: 419, height: 531},
    ],
    link: {url: '/washing-machine', label: 'Shop washing machine parts'},
  },
];
