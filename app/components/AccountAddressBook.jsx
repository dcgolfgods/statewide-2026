import {Form} from 'react-router';
import {Button, Link, Text} from '~/components';
export function AccountAddressBook({customer, addresses, setShowNewAddress,setEditAddressFormIndex}) {
 
  return (
    <>
     <div className="w-full ">
      <h3 className="font-bold text-[30px] text-center text-[#1e5097] pb-[14px] border-b-[1px] border-b-[#ccc] mb-[25px]">Address</h3>
        <div>
          {!addresses?.length && (
            <p className='mb-4 text-center text-[13px] py-[0.25rem] px-[1.25rem] bg-[#f8d7da] text-[#721c24] border-[#f5c6cb] border-[1px] rounded-[.25rem]'>
              No addresses
            </p>
          )}
          <div className="mb-4 text-center">
            <button
              onClick={()=> setShowNewAddress(true)}
              to="address/new"
              className="bg-[#007bff] text-white rounded-[5px] uppercase min-w-[140px] py-[10px] no-underline px-[30px] border-[#007bff]"
              variant="secondary"
            >
              Add New
            </button>
          </div>
       
          {Boolean(addresses?.length) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {customer.defaultAddress && (
                <Address address={customer.defaultAddress} defaultAddress setEditAddressFormIndex={setEditAddressFormIndex} />
              )}
              {addresses
                .filter((address) => address.id !== customer.defaultAddress?.id)
                .map((address,i) => (
                  <Address key={address.id} address={address}  setEditAddressFormIndex={setEditAddressFormIndex} />
                ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}



function Address({address, defaultAddress,setEditAddressFormIndex}) {
  return (
    <div className="lg:p-8 p-6 border border-gray-200 rounded-sm flex flex-col">
      {defaultAddress && (
        <div className="mb-3 flex flex-row">
          <span className="font-bold text-xs rounded-full text-black">
            Default
          </span>
        </div>
      )}
      <ul className="flex-1 flex-row">
        {(address.firstName || address.lastName) && (
          <li>
            {'' +
              (address.firstName && address.firstName + ' ') +
              address?.lastName}
          </li>
        )}
        {address.formatted &&
          address.formatted.map((line) => <li key={line}>{line}</li>)}
      </ul>

      <div className="flex flex-row font-medium mt-6 items-baseline">
        <div
          onClick={()=>setEditAddressFormIndex(address)}
          className="text-left underline text-sm cursor-pointer"
          prefetch="intent"
        >
          Edit
        </div>
        <Form action="address/delete" method="delete">
          <input type="hidden" name="addressId" value={address.id} />
          <button className="text-left text-primary/50 ml-6 text-sm">
            Remove
          </button>
        </Form>
      </div>
    </div>
  );
}
