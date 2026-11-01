import { Form, useNavigate } from 'react-router'
import { useEffect, useState } from 'react';
import { Input, IconSearch } from '~/components';

export  function BlogSearchBar() {
    const navigate = useNavigate();
    
    const [search,setSearch]=useState("")
    const [first,setFirst]=useState(false)
    const searchOnchange=(e)=>{
        setSearch(e.target.value)
    }
    useEffect(()=>{
        if(search.length == 0 && first){
            navigate("/blogs");
        }else{
            setFirst(true)
        }
    },[search])
    ////dddd
  return (
   <div className='mb-3'>
    <Form 
    action={`/blogs?${search}`}
     className="relative flex items-center w-full"
    >
    <Input
                value={search}
                onChange={searchOnchange}
                className="text-[.9em] w-full rounded-[7px] border-2 border-[#00aeef] placeholder:text-[#1e5099] text-[#1e5099] h-[40px]"
                type="search"
                autoComplete="off"
                variant="minisearch"
                placeholder="Search blogs"
                name="s"
            />
               <button
                type="submit"
                className="absolute top-1/2 transform right-4 -translate-y-1/2  flex items-center justify-center w-8 h-8"
            >
                <IconSearch />
            </button>
    </Form>
   </div>
  )
}
