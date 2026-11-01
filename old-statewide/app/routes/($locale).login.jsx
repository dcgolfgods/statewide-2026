import {json} from '@shopify/remix-oxygen';
import {Form, useLoaderData, useFetcher} from '@remix-run/react';
import {useEffect, useRef, useState, useCallback} from 'react';
import React from 'react';

import {getInputStyleClasses} from '~/lib/utils';
import {Link} from '~/components';

export const handle = { isPublic: true };

export async function loader({context, params}) {
  const customerAccessToken = await context.session.get('customerAccessToken');
  // NOTE: no redirect here so the page doesn’t navigate on first load
  // If you want to hard-redirect when already logged in, you can
  // do it client-side (navigate) or keep this as-is.
  return json({shopName: 'Hydrogen', alreadyLoggedIn: !!customerAccessToken});
}

const badRequest = (data) => json(data, {status: 400});

export const action = async ({request, context, params}) => {
  const formData = await request.formData();
  const step = formData.get('action'); // 'send' | 'verify' | 'update'

  // helper: commit cookie + return JSON (no 302)
  async function commitAndJson(multipassToken, extra = {}) {
    console.log("multipassToken ",multipassToken)
    const {session} = context;
    const headers = new Headers();
    headers.append('Set-Cookie', await session.commit({domain: '.statewide.com.au'}));
    return json({loggedIn: true, redirectTo: params.locale ? `/${params.locale}/account` : '/account', multipassToken, ...extra}, {headers});
  }

  if (step === 'send') {
    const email = formData.get('email');
    if (!email || typeof email !== 'string') return badRequest({formError: 'Please provide a valid email address.'});
    
    try {
      const res = await sendOTP(email);
      
      if (res?.statusCode === 200 && res?.data?.otpId) {
        return json({
          otpSent: true, 
          otpId: res.data.otpId, 
          email, 
          message: res.message || 'OTP sent successfully',
          customerExists: res.data.customerExists,
          multipassToken: res.data.multipassToken
        });
      }
      
      // Handle 500 error or other server errors
      if (res?.statusCode === 500 || res?.statusCode >= 400) {
        console.log("Handling 500/4xx error, statusCode:", res?.statusCode)
        return badRequest({formError: 'Please check your email address and try again.'});
      }
      
      console.log("Fallback error handling")
      return badRequest({formError: res?.message || 'Failed to send OTP. Please try again.'});
    } catch (error) {
      console.error('Send OTP error:', error);
      return badRequest({formError: 'Please check your email address and try again.'});
    }
  }

  try {

    if (step === 'verify') {
      const email = formData.get('email');
      const otpId = formData.get('otpId');
      const otp = formData.get('otp');
      if (!email || !otpId || !otp) return badRequest({formError: 'Please provide email, OTP ID, and OTP.'});

      const res = await verifyOTP(otpId, otp);
      console.log("verify",JSON.stringify(res))
      if (res?.statusCode === 200 && res?.data) {
        if (res.data.newCustomer) {
          return json({
            otpVerified: true,
            newCustomer: true,
            otpId: res.data.otpId || otpId,
            email,
            message: res.data.message || 'New customer, please complete registration',
          });
        }
        if (res.data.newCustomer === false && res.data.multipassToken) {
          const token = await createCustomerAccessTokenFromMultipass(res.data.multipassToken, context.storefront);
          if (!token) return badRequest({formError: 'Failed to create customer session. Please try again.'});
          context.session.set('customerAccessToken', token);
          const multipassToken = res?.data?.multipassToken || null;
          return commitAndJson(multipassToken);
        }
        return badRequest({formError: 'Unexpected response. Please try again.'});
      }
      return badRequest({formError: res?.message || 'Invalid or expired OTP.'});
    }

    if (step === 'update') {
      const otpId = formData.get('otpId');
      const firstName = formData.get('firstName');
      const lastName = formData.get('lastName');
      const phone = formData.get('phone');
      if (!otpId || !firstName || !lastName || !phone) {
        return badRequest({formError: 'Please provide all required information.'});
      }

      const res = await updateCustomer(otpId, firstName, lastName, phone);
      console.log("verify",JSON.stringify(res))

      if (res?.statusCode === 200 && res?.data?.multipassToken) {
        const token = await createCustomerAccessTokenFromMultipass(res.data.multipassToken, context.storefront);
        if (!token) return badRequest({formError: 'Failed to create customer session. Please try again.'});
        const multipassToken = res?.data?.multipassToken || null;
        return commitAndJson(multipassToken);
      }
      return badRequest({formError: res?.message || 'Failed to update customer information.'});
    }

    return badRequest({formError: 'Invalid action.'});
  } catch (e) {
    console.error('Login action error:', e);
    return badRequest({formError: 'Something went wrong. Please try again later.'});
  }
};

// --- Remote helpers
async function sendOTP(email) {
  try {
    const r = await fetch('https://statewide-auth.digitalconverters.com.au/otp/auth', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({action: 'send', email}),
    });
    
    if (!r.ok) {
      // If the response is not ok, try to parse the error response
      try {
        const errorData = await r.json();
        return errorData;
      } catch {
        // If we can't parse the error response, return a generic error
        return {
          statusCode: r.status,
          message: 'Failed to send OTP',
          data: { success: false }
        };
      }
    }
    
    return await r.json();
  } catch (error) {
    console.error('SendOTP fetch error:', error);
    return {
      statusCode: 500,
      message: 'Failed to send OTP',
      data: { success: false }
    };
  }
}
async function verifyOTP(otpId, otp) {
  const r = await fetch('https://statewide-auth.digitalconverters.com.au/otp/auth', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({action: 'verify', otpId, otp}),
  });
  return r.json();
}
async function updateCustomer(otpId, firstName, lastName, phone) {
  const r = await fetch('https://statewide-auth.digitalconverters.com.au/otp/auth', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({action: 'update', otpId, firstName, lastName, phone}),
  });
  return r.json();
}
export async function createCustomerAccessTokenFromMultipass(multipassToken, storefront) {
  if (!storefront) {
    console.error('Storefront client not available');
    return null;
  }

  const MUTATION = `
    mutation ExchangeMultipassToken($multipassToken: String!) {
      customerAccessTokenCreateWithMultipass(multipassToken: $multipassToken) {
        customerAccessToken {
          accessToken
          expiresAt
        }
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  try {
    const { customerAccessTokenCreateWithMultipass } = await storefront.mutate(MUTATION, {
      variables: { multipassToken },
    });

    console.log(
      'customerAccessTokenCreateWithMultipass',
      JSON.stringify(customerAccessTokenCreateWithMultipass),
    );

    if (customerAccessTokenCreateWithMultipass?.customerUserErrors?.length) {
      console.error('Multipass token exchange errors:', customerAccessTokenCreateWithMultipass.customerUserErrors);
      return null;
    }

    return customerAccessTokenCreateWithMultipass?.customerAccessToken?.accessToken ?? null;
  } catch (error) {
    console.error('Error exchanging multipass token:', error);
    return null;
  }
}


export const meta = () => [{title: 'Login'}];

// Floating Label Email Input Component
function EmailInputWithPlaceholder({ 
  value, 
  onChange, 
  onFocus, 
  onBlur, 
  error, 
  disabled, 
  loading 
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!value);

  useEffect(() => {
    setHasValue(!!value);
  }, [value]);

  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const handleChange = (e) => {
    setHasValue(!!e.target.value);
    onChange?.(e);
  };

  return (
    <div className="relative">
      <input
        type="email"
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        className={`
          w-full px-4 h-11 border-2 rounded transition-all duration-200 ease-in-out
          bg-white text-gray-900 placeholder-gray-500
          ${error 
            ? 'border-red-500 focus:border-red-500' 
            : isFocused || hasValue
              ? 'focus:border-[#00aeef] border-[#00aeef]' 
              : 'focus:border-[#00aeef] border-[#dedede]'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text'}
          focus:outline-none
        `}
        placeholder="Email"
      />
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
}

// Loading Spinner Component
function LoadingSpinner() {
  return (
    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
  );
}

// Generic Input Component with Placeholder
function InputWithPlaceholder({ 
  value, 
  onChange, 
  onFocus, 
  onBlur, 
  error, 
  disabled, 
  loading,
  placeholder,
  type = "text",
  maxLength
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!value);

  useEffect(() => {
    setHasValue(!!value);
  }, [value]);

  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const handleChange = (e) => {
    setHasValue(!!e.target.value);
    onChange?.(e);
  };

  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        maxLength={maxLength}
        className={`
          w-full px-4 h-11 border-2 rounded transition-all duration-200 ease-in-out
          bg-white text-gray-900 placeholder-gray-500
          ${error 
            ? 'border-red-500 focus:border-red-500' 
            : isFocused || hasValue
              ? 'focus:border-[#00aeef] border-[#00aeef]' 
              : 'focus:border-[#00aeef] border-[#dedede]'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text'}
          focus:outline-none
        `}
        placeholder={placeholder}
      />
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
}

// OTP Input Component with Placeholder
function OTPInputWithPlaceholder({ 
  value, 
  onChange, 
  onFocus, 
  onBlur, 
  error, 
  disabled, 
  loading,
  onResendOtp
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!value);

  useEffect(() => {
    setHasValue(!!value);
  }, [value]);

  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const handleChange = (e) => {
    setHasValue(!!e.target.value);
    onChange?.(e);
  };

  return (
    <div className="relative">
      <div className="relative text-center flex justify-center">
        <div className='relative'>
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          maxLength={6}
          className={`
            w-auto max-w-[160px] px-4 h-11 border-2 rounded transition-all duration-200 ease-in-out
            bg-white placeholder-gray-500 text-left
            ${error 
              ? 'border-red-500 focus:border-red-500 text-red-500' 
              : isFocused || hasValue
                ? 'focus:border-[#00aeef] border-[#00aeef] text-black' 
                : 'focus:border-[#00aeef] border-[#dedede] text-black'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text'}
            focus:outline-none
          `}
          placeholder="Enter OTP"
        />
        </div>
      </div>
      {error && (
        <div className="text-center mt-2">
          <p className="text-red-500 text-sm mb-2">{error}</p>
          <div className="flex items-center justify-center gap-2 ">
          <svg width="14" height="17" viewBox="0 0 14 17" fill="none" xmlns="http://www.w3.org/2000/svg" _ngcontent-ng-c646032258="" aria-label="undefined">
              <path d="M6.49927 6.5L7.99927 3.5L5.49927 1" stroke="#75727F" stroke-width="2" _ngcontent-ng-c646032258=""></path>
              <path d="M7 4C3.68629 4 1 6.68629 1 10C1 13.3137 3.68629 16 7 16C10.3137 16 13 13.3137 13 10C13 8.62368 12.5366 7.35559 11.7573 6.34326" stroke="#75727F" stroke-width="2" _ngcontent-ng-c646032258=""></path>
              </svg>
             <div className="text-sm cursor-pointer">
                <span onClick={onResendOtp} className='border-b border-[#d5d5d5]'>Click here</span> to resend a new one-time code
              </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Login() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const {shopName} = useLoaderData();
  const fetcher = useFetcher();            // <— AJAX, no navigation

  const [nativeEmailError, setNativeEmailError] = useState(null);
  const [otpError, setOtpError] = useState(null);
  const [customerNotExistMessage, setCustomerNotExistMessage] = useState(null);

  const [showOtpForm, setShowOtpForm] = useState(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);

  const [otpId, setOtpId] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('AU');
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [isResendingOTP, setIsResendingOTP] = useState(false);
  
  // Registration form validation states
  const [firstNameError, setFirstNameError] = useState(null);
  const [lastNameError, setLastNameError] = useState(null);
  const [phoneError, setPhoneError] = useState(null);
  
  // Refs for timeout management
  const emailTimeoutRef = useRef(null);
  const otpTimeoutRef = useRef(null);

  // Email validation function
  const validateEmail = useCallback((email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  // OTP validation function
  const validateOTP = useCallback((otp) => {
    return /^\d{6}$/.test(otp);
  }, []);

  // Registration validation functions
  const validateFirstName = useCallback((name) => {
    return name && name.trim().length >= 2;
  }, []);

  const validateLastName = useCallback((name) => {
    return name && name.trim().length >= 2;
  }, []);

  // Country codes for phone number formatting (Australia, New Zealand, Norfolk Island)
  const countryCodes = {
    'AU': '61',   // Australia
    'NZ': '64',   // New Zealand
    'NF': '672',  // Norfolk Island
  };

  // Function to format international phone numbers to E.164 format
  const formatPhoneNumber = useCallback((phone, countryCode = 'AU') => {
    if (!phone) return phone;
    
    // Remove all spaces and non-digit characters except +
    let cleanPhone = phone.replace(/[^\d+]/g, '');
    
    // If already in E.164 format (starts with +), return as is
    if (cleanPhone.startsWith('+')) {
      return cleanPhone;
    }
    
    // Get the country code for the selected country
    const countryDialCode = countryCodes[countryCode] || '61'; // Default to Australia
    
    // Handle numbers that already include country code (without +)
    if (cleanPhone.startsWith(countryDialCode)) {
      return '+' + cleanPhone;
    }
    
    // Handle numbers starting with 0 (domestic format)
    if (cleanPhone.startsWith('0')) {
      // Remove leading 0 and add country code
      cleanPhone = cleanPhone.substring(1);
      return '+' + countryDialCode + cleanPhone;
    }
    
    // For other numbers, assume they need country code
    if (cleanPhone.length >= 7) {
      return '+' + countryDialCode + cleanPhone;
    }
    
    return phone; // Return original if too short
  }, []);

  const validatePhone = useCallback((phone) => {
    if (!phone) return false;
    
    const formattedPhone = formatPhoneNumber(phone, selectedCountry);
    
    // E.164 format validation: + followed by 1-3 digits (country code) then 7-15 digits
    const phoneRegex = /^\+[1-9]\d{7,14}$/;
    return phoneRegex.test(formattedPhone);
  }, [formatPhoneNumber, selectedCountry]);

  // Debounced email validation and auto-submit
  const debouncedEmailCheck = useCallback((emailValue) => {
    // Clear existing timeout
    if (emailTimeoutRef.current) {
      clearTimeout(emailTimeoutRef.current);
    }
    
    // Set new timeout
    emailTimeoutRef.current = setTimeout(() => {
      console.log('Debounced email check triggered:', emailValue);
      if (emailValue && validateEmail(emailValue)) {
        // Check if a request is already in progress to avoid race conditions
        if (isCheckingEmail || fetcher.state !== 'idle') {
          console.log('Request already in progress, skipping auto-submit');
          return;
        }
        console.log('Email is valid, auto-submitting...');
        setIsCheckingEmail(true);
        const fd = new FormData();
        fd.set('action', 'send');
        fd.set('email', emailValue);
        fetcher.submit(fd, {method: 'post'});
      } else {
        console.log('Email is invalid or empty');
      }
    }, 600);
  }, [fetcher, validateEmail, isCheckingEmail]);

  // Debounced OTP validation and auto-submit
  const debouncedOTPCheck = useCallback((otpValue) => {
    // Clear existing timeout
    if (otpTimeoutRef.current) {
      clearTimeout(otpTimeoutRef.current);
    }
    
    // Set new timeout
    otpTimeoutRef.current = setTimeout(() => {
      console.log('Debounced OTP check triggered:', otpValue);
      if (otpValue && validateOTP(otpValue)) {
        // Check if a request is already in progress to avoid race conditions
        if (isVerifyingOTP || fetcher.state !== 'idle') {
          console.log('OTP verification already in progress, skipping auto-submit');
          return;
        }
        console.log('OTP is valid, auto-submitting...');
        setIsVerifyingOTP(true);
        const fd = new FormData();
        fd.set('action', 'verify');
        fd.set('email', email);
        fd.set('otpId', otpId);
        fd.set('otp', otpValue);
        fetcher.submit(fd, {method: 'post'});
      } else {
        console.log('OTP is invalid or empty');
      }
    }, 600);
  }, [fetcher, email, otpId, validateOTP, isVerifyingOTP]);

  // Timer effect for resend OTP
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (emailTimeoutRef.current) {
        clearTimeout(emailTimeoutRef.current);
      }
      if (otpTimeoutRef.current) {
        clearTimeout(otpTimeoutRef.current);
      }
    };
  }, []);

  // React to server JSON (no redirects)
  useEffect(() => {
    const data = fetcher.data;
    if (!data) return;

    const action = fetcher.formData?.get('action');
    console.log('Server response received:', data, 'action:', action);

    setIsCheckingEmail(false);
    setIsVerifyingOTP(false);
    setIsResendingOTP(false);

    if (data.formError) {
      console.log('Form error received:', data.formError, 'action:', action);
      // Set OTP error if we're on the OTP screen
      if (showOtpForm && !showRegistrationForm) {
        setOtpError(data.formError);
      } else {
        // Set email error if we're on the email input screen
        setNativeEmailError(data.formError);
      }
      return;
    }

    if (data.otpSent) {
      // Always update otpId regardless of customer existence
      console.log('Updating otpId from:', otpId, 'to:', data.otpId);
      setOtpId(data.otpId || '');
      if (data.email) setEmail(data.email);
      
      // Check if customer exists
      if (data.customerExists === false) {
        setCustomerNotExistMessage('Customer does not exist. Please register first.');
        setShowOtpForm(false);
        setShowRegistrationForm(false);
      } else {
        setCustomerNotExistMessage(null);
        setShowOtpForm(true);
        // Start 60 second timer
        setResendTimer(60);
        setCanResend(false);
      }
    }

    if (data.otpVerified && data.newCustomer) {
      setShowOtpForm(true);
      setShowRegistrationForm(true);
      if (data.otpId) setOtpId(data.otpId);
      if (data.email) setEmail(data.email);
    }

    if (data.loggedIn && data.redirectTo) {
      // Cookie was set by the response Set-Cookie header
      // Force full page reload to ensure session cookie is available and cart context refreshes
      // If checkout_url exists in query params, pass it to /account page
      const urlParams = new URLSearchParams(window.location.search);
      console.log("Data loogedin:",JSON.stringify(data))
      const checkoutUrlParam = urlParams.get('checkout_url');
      let finalUrl = data.redirectTo;
      if(data?.multipassToken){
        finalUrl = `http://statewide-appliances.myshopify.com/account/login/multipass/${data?.multipassToken}`;
        console.log("finalUrl ",finalUrl)
      }
      if (checkoutUrlParam) {
        console.log("url1 ",`${finalUrl}?checkout_url=${encodeURIComponent(checkoutUrlParam)}`)
        window.location.href = `${finalUrl}?checkout_url=${encodeURIComponent(checkoutUrlParam)}`;
      } else {
        console.log("url2 ",finalUrl)
        console.log("url2 ",)
        window.location.href = finalUrl;
      }
    }
  }, [fetcher.data]);

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!email) {
      setNativeEmailError('Email is required.');
      return;
    }
    if (!validateEmail(email)) {
      setNativeEmailError('Please enter a valid email address');
      return;
    }
    
    // Clear any pending debounced email check to prevent race conditions
    if (emailTimeoutRef.current) {
      clearTimeout(emailTimeoutRef.current);
      emailTimeoutRef.current = null;
    }
    
    setNativeEmailError(null);
    setIsCheckingEmail(true);
    const fd = new FormData();
    fd.set('action', 'send');
    fd.set('email', email);
    fetcher.submit(fd, {method: 'post'});
  };

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setNativeEmailError(null);
    setCustomerNotExistMessage(null); // Hide customer not exist message when email changes
    
    // Trigger debounced validation
    debouncedEmailCheck(newEmail);
  };

  const handleOTPChange = (e) => {
    const newOTP = e.target.value;
    setOtp(newOTP);
    setOtpError(null);
    
    // Trigger debounced validation
    debouncedOTPCheck(newOTP);
  };

  // Registration field change handlers
  const handleFirstNameChange = (e) => {
    const newFirstName = e.target.value;
    setFirstName(newFirstName);
    setFirstNameError(null);
  };

  const handleLastNameChange = (e) => {
    const newLastName = e.target.value;
    setLastName(newLastName);
    setLastNameError(null);
  };

  const handlePhoneChange = (e) => {
    const newPhone = e.target.value;
    setPhone(newPhone);
    setPhoneError(null);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (!otp) {
      setOtpError('OTP is required.');
      return;
    }
    if (!validateOTP(otp)) {
      setOtpError('Please enter a valid 6-digit OTP');
      return;
    }
    
    // Clear any pending debounced OTP check to prevent race conditions
    if (otpTimeoutRef.current) {
      clearTimeout(otpTimeoutRef.current);
      otpTimeoutRef.current = null;
    }
    
    setOtpError(null);
    setIsVerifyingOTP(true);
    console.log('Verifying OTP with otpId:', otpId, 'otp:', otp);
    const fd = new FormData();
    fd.set('action', 'verify');
    fd.set('email', email);
    fd.set('otpId', otpId);
    fd.set('otp', otp);
    fetcher.submit(fd, {method: 'post'});
  };

  const handleUpdateCustomer = (e) => {
    e.preventDefault();
    
    // Check if OTP is verified first
    if (!otpId || !otp) {
      setOtpError('Please verify your OTP first');
      return;
    }
    
    // Validate all fields
    let hasError = false;
    
    if (!firstName || !validateFirstName(firstName)) {
      setFirstNameError('First name is required and must be at least 2 characters');
      hasError = true;
    }
    
    if (!lastName || !validateLastName(lastName)) {
      setLastNameError('Last name is required and must be at least 2 characters');
      hasError = true;
    }
    
    if (!phone || !validatePhone(phone)) {
      setPhoneError('Please enter a valid phone number');
      hasError = true;
    }
    
    if (hasError) return;
    
    // Format phone number to E.164 format before sending
    const formattedPhone = formatPhoneNumber(phone, selectedCountry);
    console.log('Original phone:', phone, 'Country:', selectedCountry, 'Formatted phone:', formattedPhone);
    
    const fd = new FormData();
    fd.set('action', 'update');
    fd.set('otpId', otpId);
    fd.set('firstName', firstName);
    fd.set('lastName', lastName);
    fd.set('phone', formattedPhone);
    fetcher.submit(fd, {method: 'post'});
  };

  const handleResendOtp = (e) => {
    e.preventDefault();
    console.log('Resend OTP clicked, canResend:', canResend);
    
    // Clear OTP error when resending
    setOtpError(null);
    setIsResendingOTP(true);
    
    // Allow resend when there's an error, regardless of timer
    const fd = new FormData();
    fd.set('action', 'send');
    fd.set('email', email);
    fetcher.submit(fd, {method: 'post'});
  };

  const handleGoBack = () => {
    setShowOtpForm(false);
    setShowRegistrationForm(false);
    setOtp('');
    setOtpId('');
    setResendTimer(0);
    setCanResend(false);
    setOtpError(null);
    setNativeEmailError(null);
    setCustomerNotExistMessage(null);
    setFirstNameError(null);
    setLastNameError(null);
    setPhoneError(null);
    setFirstName('');
    setLastName('');
    setPhone('');
  };

  // convenience access to last server message/error
  const serverError = fetcher.data?.formError || null;
  const serverMessage = fetcher.data?.message || null;

  if (!isClient) {
    return null;
  }

  return (
    <div className="max-w-[1140px] px-[15px] mx-auto lg:my-[50px] my-[20px]">
      <div className="w-full mt-[20px]">
        <h1 className="text-[#1e5097] mb-[25px] text-center text-[24px] font-bold py-[6px] border-b-[1px] border-b-[#ccc]">
          <span className="mb-[8px] block">Please Log In</span>
        </h1>

        <div className="flex flex-col lg:flex-row w-full justify-center">
          <div className="mb-4 lg:w-1/2 lg:px-[15px] order-2 lg:order-1">
            <h4 className="mb-[25px] text-[20px] pb-[10px] border-b-[1px] border-b-[#00000020] text-center">New Customer</h4>
            <div className="lg:min-h-[200px] rounded-[4px] border-[1px] border-[#00000020] p-[1.25rem]">
              <p className="text-[16px] lg:h-11 mb-7 text-center">Create an account on our website to<br/>shop faster and track your orders.</p>
              <div className="text-center">
                <Link className="bg-[#007bff] text-white rounded-[6px] min-w-[140px] py-[10px] inline-block no-underline px-[30px] border-[#007bff]" to="/register">
                  Register
                </Link>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 lg:px-[15px] order-1 lg:order-2 mb-4 lg:mb-0">
            <h4 className="mb-[25px] text-[20px] pb-[10px] border-b-[1px] border-b-[#00000020] text-center">Returning Customer</h4>

            {/* Single Form purely for layout; actions happen via fetcher */}
            <Form method="post" noValidate autoComplete="off" className="lg:min-h-[200px] rounded-[4px]  border-[1px] border-[#00000020] p-[1.25rem]">


              {/* Email Input with Floating Label */}
              {!showRegistrationForm && !showOtpForm && (
                <div className="mb-6">
                  <EmailInputWithPlaceholder
                    value={email}
                    onChange={handleEmailChange}
                    error={nativeEmailError}
                    disabled={isCheckingEmail || fetcher.state !== 'idle'}
                    loading={isCheckingEmail}
                  />
                </div>
              )}

              {/* Customer Not Exist Message */}
              {customerNotExistMessage && (
                <div className="mb-6">
                  <div className="text-center">
                      <p className="text-sm">
                      We couldn't find an account with that email.<br/>
                      Please <Link className="text-[#1e5097] underline" to="/register">register</Link> to create one.
                      </p>
                  </div>
                </div>
              )}


              {/* OTP Screen */}
              {showOtpForm && !showRegistrationForm && (
                <>
                  {/* Email Display with Checkmark */}
                  <div className="mb-6">
                    <div className="relative">
                      <div className="relative">
                        <input
                          type="text"
                          value={email}
                          readOnly
                          className="w-full px-4 h-11 border-2 border-[#00aeef] rounded text-black pr-12"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="text-center mb-8">
                    <h2 className="text-xl font-bold text-[#1e5097] mb-2">Almost there!</h2>
                    <p className="text-gray-600 mb-1">We've sent you a one time code to your email.</p>
                    <p className="text-gray-600">Please enter it below to log in:</p>
                  </div>

                  {/* OTP Input */}
                  <div className="mb-8 flex justify-center">
                    <OTPInputWithPlaceholder
                      value={otp}
                      onChange={handleOTPChange}
                      error={otpError}
                      disabled={isVerifyingOTP || fetcher.state !== 'idle'}
                      loading={isVerifyingOTP}
                      onResendOtp={handleResendOtp}
                    />
                  </div>

                  <div className="text-center mb-8 lg:max-w-[65%] mx-auto">
                    <p className="text-gray-600">If you don’t see the email in your inbox, check your spam or junk folder.
                    </p>
                  </div>
                  {/* Action Buttons */}
                  <div className="flex gap-4 justify-center">
                    <button
                      className={`
                        rounded-[6px] min-w-[140px] h-12 px-8 font-medium transition-all duration-200
                        ${isVerifyingOTP || isResendingOTP || fetcher.state === 'submitting'
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-[#007bff] '
                        }
                        text-white flex items-center justify-center gap-2
                      `}
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={!!otpError || !otp || isVerifyingOTP || isResendingOTP || fetcher.state !== 'idle'}
                    >
                      {isVerifyingOTP ? (
                        <>
                          <LoadingSpinner />
                          Verifying...
                        </>
                      ) : isResendingOTP ? (
                        <>
                          <LoadingSpinner />
                          Resending...
                        </>
                      ) : (
                        <>
                          Verify code
                        </>
                      )}
                    </button>
                    
                    <button
                      className="rounded-[6px] min-w-[100px] h-12 px-6 font-medium border-2 border-[#007bbd] text-[#007bbd] transition-all duration-200"
                      type="button"
                      onClick={handleGoBack}
                      disabled={isVerifyingOTP || fetcher.state !== 'idle'}
                    >
                      Back
                    </button>
                  </div>
                </>
              )}

              {/* Registration Form */}
              {showRegistrationForm && (
                <>
                 

  {/* Email Display with Checkmark */}
  <div className="mb-6">
                    <div className="relative">
                      <div className="relative">
                        <input
                          type="text"
                          value={email}
                          readOnly
                          className="w-full px-4 h-11 border-2 border-[#00aeef] rounded text-black pr-12"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>


                  {/* Instructions */}
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Almost there!</h2>
                    <p className="text-gray-600">Please complete your registration details below:</p>
                  </div>

                  {/* OTP Verification Error */}
                  {otpError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                      <div className="flex items-center justify-center">
                        <div className="text-red-600 text-sm text-center">
                          <p className="font-medium mb-2">Please verify your OTP first</p>
                          <button
                            className="bg-red-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-700 transition-colors"
                            onClick={(e) => {
                              e.preventDefault();
                              // Button click does nothing - just for show
                            }}
                          >
                            Verify OTP Now
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* First Name */}
                  <div className="mb-6">
                    <InputWithPlaceholder
                      value={firstName}
                      onChange={handleFirstNameChange}
                      error={firstNameError}
                      placeholder="First Name"
                      type="text"
                      disabled={fetcher.state !== 'idle'}
                    />
                  </div>

                  {/* Last Name */}
                  <div className="mb-6">
                    <InputWithPlaceholder
                      value={lastName}
                      onChange={handleLastNameChange}
                      error={lastNameError}
                      placeholder="Last Name"
                      type="text"
                      disabled={fetcher.state !== 'idle'}
                    />
                  </div>

                  {/* Country Selection */}
                  <div className="mb-6">
                    <div className="relative">
                      <select
                        value={selectedCountry}
                        onChange={(e) => setSelectedCountry(e.target.value)}
                        className="w-full px-4 h-11 border-2 border-[#dedede] rounded transition-all duration-200 ease-in-out bg-white text-gray-900 focus:border-[#00aeef] focus:outline-none"
                        disabled={fetcher.state !== 'idle'}
                      >
                        <option value="AU">🇦🇺 Australia (+61)</option>
                        <option value="NZ">🇳🇿 New Zealand (+64)</option>
                        <option value="NF">🇳🇫 Norfolk Island (+672)</option>
                      </select>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="mb-8">
                    <InputWithPlaceholder
                      value={phone}
                      onChange={handlePhoneChange}
                      error={phoneError}
                      placeholder="Phone (e.g., 0412 345 678)"
                      type="tel"
                      disabled={fetcher.state !== 'idle'}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 justify-center">
                    <button
                      className={`
                        rounded-[6px] min-w-[140px] h-12 px-8 font-medium transition-all duration-200
                        ${fetcher.state === 'submitting'
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-[#007bff] '
                        }
                        text-white flex items-center justify-center gap-2
                      `}
                      type="button"
                      onClick={handleUpdateCustomer}
                      disabled={fetcher.state === 'submitting'}
                    >
                      {fetcher.state === 'submitting' ? (
                        <>
                          <LoadingSpinner />
                          Saving...
                        </>
                      ) : (
                        <>
                          Complete Registration
                        </>
                      )}
                    </button>
                    
                    <button
                      className="rounded-[6px] min-w-[100px] h-12 px-6 font-medium border-2 border-[#007bbd] text-[#007bbd] transition-all duration-200"
                      type="button"
                      onClick={handleGoBack}
                      disabled={fetcher.state !== 'idle'}
                    >
                      Back
                    </button>
                  </div>
                </>
              )}

              <div className="flex items-center justify-center">
                {!showOtpForm && (
                  <button
                    className={`
                      rounded-[6px] min-w-[140px] h-12 px-8 font-medium transition-all duration-200
                      ${isCheckingEmail || fetcher.state === 'submitting'
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-[#007bff] '
                      }
                      text-white flex items-center justify-center gap-2
                    `}
                    type="button"
                    onClick={handleSendOtp}
                    disabled={!!nativeEmailError || !email || isCheckingEmail || fetcher.state !== 'idle'}
                  >
                    {isCheckingEmail || fetcher.state === 'submitting' ? (
                      <>
                        <LoadingSpinner />
                        Checking email
                      </>
                    ) : (
                      <>
                        Continue
                      </>
                    )}
                  </button>
                )}
                
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
