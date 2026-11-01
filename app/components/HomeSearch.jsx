import { useEffect, useRef, useState } from "react"
import { Form, useNavigation } from 'react-router';
export function HomeSearch({classes}){
    const transition = useNavigation()
    const [searchTerm, setSearchTerm] = useState("");
    const searchInput = useRef(); // Ref for the input field
    const searchForm=useRef()
    const searchFormAction= '/api/predictivesearch'
    const isSearching=transition.state === "submitting" && transition.formAction == searchFormAction
    useEffect(()=>{
        if(!isSearching){
         searchForm.current.reset()
         setSearchTerm("")
         searchInput.current.blur(); // Trigger blur on input field
        }
     },[isSearching])
    return(
        <div className={`pt-[10px] pb-[10px] lg:pt-10 lg:pb-[25px] lg:px-[15px] text-[#1e5097] w-full ${classes}`}>
            <h5 className="hidden lg:block mb-[15px] text-[25px] text-center font-[600]">Search Australia's biggest range of appliance spare parts</h5>
            <Form
            ref={searchForm}
       method="POST"
       action={searchFormAction
       }
       id="small-search-box-form" className="relative lg:w-[90%] mx-auto">
        <button type="submit" className="absolute font-[600] top-1/2 -translate-y-1/2 text-[20px] lg:text-[30px] right-[15px] text-[#00aeef]">
        <i className="fa fa-search "></i> 
        </button>
                <input type="text"
                 onChange={(e) => {
                    setSearchTerm(e.target.value)
                }}
                ref={searchInput}
                value={searchTerm}
                 className="h-[40px] lg:h-[48px] w-full text-[11px] rounded-[4px]  lg:rounded-[4px] border-0 lg:border-2 lg:border-[#00aeef]" id="small-searchterms" autoComplete="off" name="q" placeholder="Search by brand, appliance type, part no. or model no." aria-label="Search store" />
            </Form>
        </div>
    )
}
