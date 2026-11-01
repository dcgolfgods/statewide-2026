import React, {useState} from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

const brands = [
  '',
  'Actron',
  'AEG',
  'Amway',
  'ARC',
  'Ariston',
  'ASKO',
  'Bamix',
  'Baumatic',
  'Beefeater',
  'Beko',
  'Belling',
  // 'Bellini',
  // 'Birko',
  // 'Bissell',
  'Blanco',
  'Bonn',
  'Bosch',
  'Calor',
  'Chef',
  // 'Chemicals All Brands',
  'Cleanstar',
  'Cleantech',
  'Daikin',
  'Damani',
  'Deflecto',
  'Delonghi',
  'Dirt Devil',
  'Dishlex',
  'Electrolux',
  // 'Electrolux All',
  // 'Emilia',
  'Esatto',
  'Euro',
  'Euromaid',
  'Fisher & Paykel',
  // 'Freight Item',
  'Frigidaire',
  'Fujitsu',
  'Gaggenau',
  'GE',
  'Ghibli',
  'Glem Gas',
  'Glemgas',
  'Haier',
  'Hako',
  'Hillmark',
  'Hisense',
  'Hitachi',
  'Homelite',
  'Hoover',
  'IAG',
  'Ikea',
  'Ilve',
  'IXL',
  // 'Karcher',
  'Kelvinator',
  'Kerrick',
  'Kitchenaid',
  'Kleenmaid',
  'Krups',
  'La Germania',
  'Laurastar',
  'Lemair',
  'LG Electronics',
  'Lindhaus',
  'Linea',
  'Lofra',
  'Lux',
  'Magimix',
  'Malleys',
  'Maytag',
  'Miele',
  'Milwaukee',
  'Mitsubishi Electric',
  'Moulinex',
  // 'NEC',
  'Neff',
  'Nilfisk',
  'Numatic',
  'Omega',
  'Other',
  'Pacvac',
  'Palsonic',
  'Panasonic',
  'Philips',
  'Polivac',
  'Pullman',
  // 'Retail Sundry Line',
  'Rowenta',
  'Ryobi',
  'Samsung',
  // 'Sanyo',
  'Sebo',
  // 'Service - Commercial',
  // 'Service - Domestic',
  'Sharp',
  // 'Shopvac',
  'Siemens',
  'Simpson',
  'Smeg',
  'Solt',
  'Speed',
  'Speed Queen',
  'Steamvac',
  'Taski',
  'Technics',
  'Technika',
  'Tefal',
  'Tennant',
  'Transtherm',
  // 'Unclassified',
  'Vax',
  'Venini',
  'Vintec',
  'Vitamix',
  'Volta',
  'Vulcan',
  'Wallmounts',
  'Wertheim',
  'Westinghouse',
  'Whirlpool',
  'Windsor',
  'WMF',
];

const applianceTypes = [
  '',
  'Kitchen Appliances',
  'Washers & Dryers',
  'Air Conditioning',
  'Vacuum & Floor Care',
  'TV, Audio & Video',
  'Personal Care',
  'Other Appliances',
  'Accessories',
];

const ContactForm = () => {
  const [sentForm, sentFormSet] = useState(false);
  const [errorSentForm, errorSentFormSet] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [postcode, setPostcode] = useState('');
  const [subject, setSubject] = useState('');
  const [brand, setBrand] = useState('');
  const [applianceType, setApplianceType] = useState('');
  const [modelVersionNo, setModelVersionNo] = useState('');
  const [enquiry, setEnquiry] = useState('');
  const [publishPermission, setPublishPermission] = useState(false);
  const [recaptchaValue, setRecaptchaValue] = useState(null);

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!fullName) newErrors.fullName = 'The Name field is required.';
    if (!email) {
      newErrors.email = 'The Email field is required.';
    } else if (!emailPattern.test(email)) {
      newErrors.email = 'The Email field must be a valid email address.';
    }
    if (!phone) newErrors.phone = 'The Phone field is required.';
    if (!subject) newErrors.subject = 'The Subject field is required.';
    if (!brand) newErrors.brand = 'The Brand field is required.';
    if (!applianceType) newErrors.applianceType = 'The Appliance field is required.';
    if (!enquiry) newErrors.enquiry = 'The Enquiry field is required.';
    if (!recaptchaValue) newErrors.recaptcha = 'Please complete the reCAPTCHA.';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      setErrors({});
      const formData = {
        fullName,
        email,
        phone,
        postcode,
        subject,
        brand,
        applianceType,
        modelVersionNo,
        enquiry,
        publishPermission,
        'g-recaptcha-response': recaptchaValue,
      };

      try {
        setLoading(true);
        const response = await fetch('https://submit-form.com/vzAkzMQAD', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(formData),
        });
        await response.json();
        setLoading(false);
        sentFormSet(true);
      } catch (error) {
        setLoading(false);
        errorSentFormSet(true);
      }
    }
  };

  const handleRecaptchaChange = (value) => {
    setRecaptchaValue(value);
  };

  return (
    <div className="contact-container">
      <div className="contact-form-container">
        {sentForm ? (
          <div className="text-[#1e5097] text-[1.2em] result">
            Thank you for submitting your enquiry. Our customer care team will reach out to you shortly. If your
            matter is urgent, please contact us directly during business hours. Australia Free Call 1800 005 220 | NZ
            Local Call 09 965 5155
          </div>
        ) : (
          <form onSubmit={handleSubmit} id="contactusform" method="post">
            <fieldset>
              <div className="contact-form-title">
                <div className="enquiry-form-header-container mb-4">
                  <h4 className="contact-form-heading">Enquiry Form</h4>
                  <span>Please submit your enquiry below. Our customer care team will respond within 1-2 business days.</span>
                </div>
              </div>
              {errorSentForm && (
                <div className="my-4">
                  <span className="field-validation-error ">Something went wrong! Please try again later</span>
                </div>
              )}

              <div className="forms-box">
                <div className="inputs-left">
                  <div className="inputs mb-4">
                    <h4 className="contact-form-label">
                      Full Name<span className="text-blue-500">*</span>
                    </h4>
                    <div className="input-box">
                      {errors.fullName && <span className="field-validation-error">{errors.fullName}</span>}
                      <input
                        className="form-control border rounded px-2 py-1"
                        id="FullName"
                        name="FullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="inputs mb-4">
                    <h4 className="contact-form-label">
                      Email<span className="text-blue-500">*</span>
                    </h4>
                    <div className="input-box">
                      {errors.email && <span className="field-validation-error">{errors.email}</span>}
                      <input
                        className="form-control text-box single-line border rounded px-2 py-1"
                        id="Email"
                        name="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="inputs mb-4">
                    <h4 className="contact-form-label">
                      Phone<span className="text-blue-500">*</span>
                    </h4>
                    <div className="input-box">
                      {errors.phone && <span className="field-validation-error">{errors.phone}</span>}
                      <input
                        className="form-control border rounded px-2 py-1"
                        id="Phone"
                        name="Phone"
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="inputs mb-4">
                    <h4 className="contact-form-label">Postcode</h4>
                    <div className="input-box">
                      <input
                        className="form-control border rounded px-2 py-1"
                        id="Postcode"
                        name="Postcode"
                        type="text"
                        value={postcode}
                        onChange={(e) => setPostcode(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="inputs mb-4">
                    <h4 className="contact-form-label">
                      Subject<span className="text-blue-500">*</span>
                    </h4>
                    <div className="input-box">
                      {errors.subject && <span className="field-validation-error">{errors.subject}</span>}
                      <select
                        className="form-control border rounded px-2 py-1"
                        id="Subject"
                        name="Subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                      >
                        <option value=""></option>
                        <option>Product Enquiry</option>
                        <option>Order Enquiry</option>
                        <option>Freight Quote</option>
                        <option>Feedback</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="inputs mb-4" id="divBrand">
                    <h4 className="contact-form-label">
                      Brand<span className="text-blue-500">*</span>
                    </h4>
                    <div className="input-box">
                      {errors.brand && <span className="field-validation-error">{errors.brand}</span>}
                      <select
                        className="form-control border rounded px-2 py-1"
                        id="Brand"
                        name="Brand"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                      >
                        {brands.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="inputs mb-4" id="divApplianceType">
                    <h4 className="contact-form-label">
                      Appliance Type<span className="text-blue-500">*</span>
                    </h4>
                    <div className="input-box">
                      {errors.applianceType && <span className="field-validation-error">{errors.applianceType}</span>}
                      <select
                        className="form-control border rounded px-2 py-1"
                        id="ApplianceType"
                        name="ApplianceType"
                        value={applianceType}
                        onChange={(e) => setApplianceType(e.target.value)}
                      >
                        {applianceTypes.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="inputs mb-4" id="divModel">
                    <h4 className="contact-form-label">Model No. / Version No.</h4>
                    <div className="input-box">
                      <input
                        className="form-control border rounded px-2 py-1"
                        id="ModelVersionNo"
                        name="ModelVersionNo"
                        type="text"
                        value={modelVersionNo}
                        onChange={(e) => setModelVersionNo(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <h4 className="contact-form-label">
                  How can we help you?<span className="text-blue-500">*</span>
                </h4>
                <div className="inputs-right inputs mb-4">
                  {errors.enquiry && <span className="field-validation-error">{errors.enquiry}</span>}
                  <div className="input-box">
                    <textarea
                      className="form-control border rounded px-2 py-1 min-h-[150px]"
                      id="Enquiry"
                      name="Enquiry"
                      value={enquiry}
                      onChange={(e) => setEnquiry(e.target.value)}
                      placeholder=""
                    ></textarea>
                    <span className="enquiry-note">
                      <b>Please supply as much information as possible so that we can offer you the best advice and support.</b>
                      <div className="contact-form-required">
                        (<span className="text-blue-500">*</span>Required)
                      </div>
                    </span>
                  </div>
                </div>
                <div id="divPublishPermission" className="hidden py-2 pb-5">
                  <span className="enquiry-note">
                    <label htmlFor="PublishPermission" className="enquiry-note text-lg mb-1">
                      <input
                        data-val="true"
                        data-val-required="The PublishPermission field is required."
                        id="PublishPermission"
                        name="PublishPermission"
                        type="checkbox"
                        checked={publishPermission}
                        onChange={(e) => setPublishPermission(e.target.checked)}
                        value="true"
                      />
                      <b>
                        Please tick if you are happy for us to publish your feedback on our website. We only use your first
                        name and suburb.
                      </b>
                      <br />
                    </label>
                  </span>
                </div>
              </div>
              <div id="captcha-wrapper">
                {errors.recaptcha && <span className="field-validation-error">{errors.recaptcha}</span>}
                <ReCAPTCHA
                  sitekey="6Le8jBEsAAAAAL_dS6R4ePx37ZNAKau2vKiViu9W"
                  onChange={handleRecaptchaChange}
                />
              </div>

              <div className="clear"></div>
              <div className="buttons">
                <input
                  type="submit"
                  name="send-email2"
                  className="cursor-pointer bg-blue-600 text-white btn btn-primary button-1 contact-us-button"
                  value={`${loading ? 'Submitting...' : 'Submit'}`}
                  id="send-email2"
                />
              </div>
            </fieldset>
            <div className="further-information-container">
              <span className="contact-us-heading">For further information, please visit</span>
              <ul>
                <li>
                  <a href="/deliveries-returns">Deliveries &amp; returns</a>
                </li>
                <li>
                  <a href="/aboutus">About us</a>
                </li>
              </ul>
            </div>
            <input name="__RequestVerificationToken" type="hidden" value="YOUR_TOKEN" />
            <input name="PublishPermission" type="hidden" value={publishPermission} />
          </form>
        )}
      </div>
      <div className="contact-map  lg:hidden">
        <iframe
          height="350"
          width="425"
          src="https://maps.google.com.au/maps?q=statewide+Appliance+spares&amp;ie=UTF8&amp;hq=statewide+Appliance+spares&amp;hnear=Adelaide+South+Australia&amp;ll=-34.933197,138.59202&amp;spn=0.008084,0.016512&amp;t=m&amp;z=14&amp;iwloc=A&amp;cid=14141241515046023185&amp;output=embed"
          className="h-full w-full"
        ></iframe>
        <br />
        <small>
          <a href="https://maps.google.com.au/maps?q=statewide+Appliance+spares&amp;ie=UTF8&amp;hq=statewide+Appliance+spares&amp;hnear=Adelaide+South+Australia&amp;ll=-34.933197,138.59202&amp;spn=0.008084,0.016512&amp;t=m&amp;z=14&amp;iwloc=A&amp;cid=14141241515046023185&amp;source=embed">
            View Larger Map
          </a>
        </small>
      </div>
    </div>
  );
};

export {ContactForm};
