import {Link} from '~/components';
import {allBrandsData} from './allBrandsData';

export const AllBrands = () => {
  return (
    <div className="page-body all-brands">
      <div className="all-brands-heading-text">
        <h4>We supply appliance spare parts for leading brands, including:</h4>
      </div>
      <div className="py-[40px]">
        <div className="flex flex-wrap">
          {allBrandsData.map((item) => {
            return (
              <div className="relative lg:w-[16.666667%] w-[33.3333%] p-[10px] h-[100px]" key={item.link}>
                <Link to={item.link}>
                  <img
                    src={item.img}
                    className="w-[95%] p-[20px] lg:p-[0] lg:w-[60%] absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2"
                  />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
