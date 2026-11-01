import { useState } from 'react';
import { modelData } from './findModelData';
export const FindModel = (popup=false) => {
    const [active, setActive] = useState('Airconditioners');
    const [showDropdwon, setShowDropdown] = useState(true);

    let activeItem = modelData.find((item)=> item.label == active);
    const handleActive = (item) =>{
        setActive(item.label)
        if(window.innerWidth <= 767){
            setShowDropdown(false);
        }
    }
    return (
        <div className="page-body find-your-model-no">
            {popup && <h4 className='text-[22px] text-[#212529] font-[400] p-[1rem] mb-[1rem] border-b-[1px] border-[#e9ecef]'>Where do I find my model number? </h4>}
            {!popup && <p>To obtain spare parts for your appliance Statewide Appliance Spares will require the model number of your product. We have compiled a list of the most common places model number information can be found for the most popular products.<br /><br /></p>}
            <div className='modelnumber-container'>
                {activeItem && <div className='modelnumber-appliance'>
                         <div >
                            <div className="modelnumber-appliance-img">
                                {activeItem.images.map((img, idx) => {
                                    return <img className="modelnumber-img" style={{ "width": "100%" }} src={img} alt="STATEWIDEAPP" loading="lazy" width={300} height={200} key={idx} />
                                })}
                            </div>
                            <div className="modelnumber-info modelnumber-washing" style={{ "display": "block" }}>
                                <div
                                    dangerouslySetInnerHTML={{__html: activeItem.bottomHtml}}
                                    id="ph-topic"
                                    className="page-html page topic-page"
                                />
                            </div>
                        </div>
                </div>}

                <div onClick={()=> setShowDropdown(!showDropdwon)} className={`modelnumber-dropdown lg:hidden`}>
                    <div className="modelnumber-heading">{activeItem?.label}</div>
                    <div className={`${!showDropdwon && 'dropdown-arrow-down'} dropdown-arrow-up`}>
                    </div>
                </div>
                <div className={`modelnumber-menu ${showDropdwon && ' active'}`}>
                    {modelData.map((item) => {
                        return <div onClick={()=> handleActive(item)} className={`modelnumber-item ${active == item.label && 'modelnumber-item-active'}`}>
                            <div className={`modelnumber-arrow ${active == item.label && 'dropdown-arrow-left'}`}>
                            </div>
                            <div className="modelnumber-heading">{item.label}</div>
                        </div>    
                    })}
                </div>
            </div>
        </div>
    )
}

export const FindModelPopup = ({showPopup}) =>{
    return(
      <>
      <div onClick={()=> showPopup(false)} className='bg-black/[.6] z-[1000]  in-stock-popup fixed top-[0] bottom-0 left-0 right-0 h-full w-full bg'>
      </div>
      <div className='in-stock-popup-box z-[1005] fixed top-1/2 left-1/2 overflow-y-auto max-h-[90%]  -translate-y-1/2 -translate-x-1/2 w-[90%] max-w-[500px] bg-white rounded-[5px]'>
          <button onClick={()=> showPopup(false)} type="button" className="absolute right-4 top-[25px] cursor-pointer" data-dismiss="modal" aria-label="Close"> <span className='font-bold' aria-hidden="true">×</span> </button>
         <FindModel popup={true} />
        </div>
      </>
    )
  }