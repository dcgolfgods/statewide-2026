import { useEffect, useState } from 'react';
import { Link } from '~/components';
import { Form, useActionData, useNavigation } from 'react-router';
import { getInputStyleClasses } from '~/lib/utils';

export function AccountDetails({ customer }) {
  const actionData = useActionData();
  const { firstName, lastName, email, phone, acceptsMarketing } = customer;
  const [nativeFirstNameError, setNativeFirstNameError] = useState(null);
  const [nativeLastNameError, setNativeLastNameError] = useState(null);
  const [nativeEmailError, setNativeEmailError] = useState(null);
  const [nativePasswordError, setNativePasswordError] = useState(null);
  const [nativePhoneError, setNativePhoneError] = useState(null);
  const {state} = useNavigation();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [phoneCode, setPhoneCode] = useState("");
  useEffect(()=>{
    setPhoneCode(phone?.substring(0, 3) || "")
  },[])
  useEffect(() => {
    if (actionData?.customer && !actionData?.error) {
      setShowSuccessMessage(true);
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [actionData]);
  return (
    <div className="w-full ">
      <h3 className="font-bold text-[30px] text-center text-[#1e5097] pb-[14px] border-b-[1px] border-b-[#ccc] mb-[25px]">Account info</h3>
      {/* TODO: Add onSubmit to validate _before_ submission with native? */}
      <Form
        method="put"
        noValidate
        className="max-w-[600px] mx-auto pt-6 pb-8 mt-4 mb-4 space-y-3"
      >
        {showSuccessMessage && 
          <div className="flex items-center justify-center mb-6 bg-[#e8f0fe] text-black rounded-sm">
            <p className="m-4 text-sm text-black">Account details updated successfully!</p>
          </div>
          }
        {actionData?.error?.message && (
          <div className="flex items-center justify-center mb-6 bg-red-100 rounded-sm p-2">
            <p className="text-s">{actionData?.error?.message}</p>
          </div>
        )}

        <div className='flex'>
          <div className='w-[25%] text-right'>
            <label htmlFor='first_name' className='text-[16px] text-[#1e5097]'>First name</label>
          </div>
          <div className='w-[50%] px-[15px]'>
            <input
              className={`text-black focus:border-[#ced4da] mb-1 ${getInputStyleClasses(nativeFirstNameError)}`}
              id="first_name"
              name="firstName"
              type="text"
              autoComplete="false"
              defaultValue={firstName}
              required
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              onBlur={(event) => {
                if (
                  event.currentTarget.validity.valid ||
                  !event.currentTarget.value.length
                ) {
                  setNativeFirstNameError(null);
                } else {
                  setNativeFirstNameError(
                    event.currentTarget.validity.valueMissing
                    && 'Please enter a first name'
                  );
                }
              }}
            />
            {nativeFirstNameError && (
              <p className="text-red-500 text-xs">{nativeFirstNameError} &nbsp;</p>
            )}
          </div>
          <div className='w-[25%] px-[15px] text-[20px] text-[#00aeef]'>*</div>
        </div>

        <div className='flex'>
          <div className='w-[25%] text-right'>
            <label htmlFor='last_name' className='text-[16px] text-[#1e5097]'>Last name</label>
          </div>
          <div className='w-[50%] px-[15px]'>
            <input
              className={`text-black focus:border-[#ced4da] mb-1 ${getInputStyleClasses(nativeLastNameError)}`}
              id="last_name"
              name="lastName"
              type="text"
              defaultValue={lastName}
              autoComplete="false"
              required
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              onBlur={(event) => {
                if (
                  event.currentTarget.validity.valid ||
                  !event.currentTarget.value.length
                ) {
                  setNativeLastNameError(null);
                } else {
                  setNativeLastNameError(
                    event.currentTarget.validity.valueMissing
                    && 'Please enter a last name'
                  );
                }
              }}
            />
            {nativeLastNameError && (
              <p className="text-red-500 text-xs">{nativeLastNameError} &nbsp;</p>
            )}
          </div>
          <div className='w-[25%] px-[15px] text-[20px] text-[#00aeef]'>*</div>
        </div>

        <div className='flex'>
          <div className='w-[25%] text-right'>
            <label htmlFor='email' className='text-[16px] text-[#1e5097]'>Email</label>
          </div>
          <div className='w-[50%] px-[15px]'>
            <input
              className={`text-black focus:border-[#ced4da] mb-1 ${getInputStyleClasses(nativeEmailError)}`}
              id="email"
              name="email"
              type="email"
              defaultValue={email}
              autoComplete="email"
              required
              placeholder="Email address"
              aria-label="Email address"
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              onBlur={(event) => {
                setNativeEmailError(
                  event.currentTarget.value.length &&
                    !event.currentTarget.validity.valid
                    ? 'Invalid email address'
                    : null,
                );
              }}
            />
            {nativeEmailError && (
              <p className="text-red-500 text-xs">{nativeEmailError} &nbsp;</p>
            )}
          </div>
          <div className='w-[25%] px-[15px] text-[20px] text-[#00aeef]'>*</div>
        </div>

        <div className='hidden'>
          <div className='w-[25%] text-right'>
            <label htmlFor='company' className='text-[16px] text-[#1e5097]'>Company name</label>
          </div>
          <div className='w-[50%] px-[15px]'>
            <input
              className={`text-black focus:border-[#ced4da] mb-1 ${getInputStyleClasses()}`}
              id="company"
              name="company"
              type="text"
              required
            // eslint-disable-next-line jsx-a11y/no-autofocus
            />
          </div>
        </div>


        <div className='flex'>
          <div className='w-[25%] text-right'>
            <label htmlFor='phone' className='text-[16px] text-[#1e5097]'>Mobile</label>
          </div>
          <div className='w-[50%] px-[15px]'>
            <div className='flex'>
            <select name="phoneCode" onChange={(e)=> setPhoneCode(e.target.value)} value={phoneCode} className='focus:border-[#ced4da] text-black focus:border-[#ced4da] mb-1 appearance-none rounded-sm dark:bg-transparent border focus:ring-0 w-full py-2 px-3 placeholder:text-primary/50 leading-tight focus:shadow-outline border-[#ced4da] max-w-[70px] py-0 px-[4px] w-full select-phone-code'>
              <option>+61</option>
              <option>+64</option>
            </select>
            <input
              className={`text-black focus:border-[#ced4da] mb-1 ${getInputStyleClasses(nativePhoneError)}`}
              id="phone"
              name="phone"
              defaultValue={phone?.startsWith('+') ? phone?.substring(3) : phone}
              type="text"
              autoComplete="phone"
              required
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              onBlur={(event) => {
                setNativePhoneError(
                  event.currentTarget.value.length &&
                    !event.currentTarget.validity.valid
                    ? 'Invalid phone number'
                    : null,
                );
              }}
            />
            </div>
            {nativePhoneError && (
              <p className="text-red-500 text-xs">{nativePhoneError} &nbsp;</p>
            )}
          </div>
          <div className='w-[25%] px-[15px] text-[20px] text-[#00aeef]'>*</div>
        </div>


        <div className='justify-center hidden my-[32px]'>
          <div className='flex gap-4 items-center'>
            <input defaultChecked={acceptsMarketing} className='rounded-[4px] bg-[#dee2e6] border-[#dee2e6]' type='checkbox' name="acceptsMarketing" />
            <label>Send me updates and information from time to time Subscription</label>
          </div>

        </div>

        <div className="flex items-center justify-center">
          <button
            className="bg-[#007bff] text-white rounded-[5px] uppercase min-w-[140px] py-[10px] no-underline px-[30px] border-[#007bff]"
            type="submit"
            disabled={!!(nativePasswordError || nativeEmailError)}
          >
            {state !== 'idle' ? 'Saving' : 'Save'}
          </button>
        </div>
        
      </Form>
    </div>
  );
}
