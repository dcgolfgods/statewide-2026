import { useEffect } from 'react';


export const CustomPagination = ({ totalPages, onPageChange, currentPage = 0 }) => {
    const safeCurrentPage = Math.min(Math.max(currentPage, 0), Math.max(totalPages - 1, 0));
  
    const handleFirst = () => onPageChange(0);
    const handlePrevious = () => onPageChange(Math.max(safeCurrentPage - 1, 0));
    const handleNext = () => onPageChange(Math.min(safeCurrentPage + 1, totalPages - 1));
    const handleLast = () => onPageChange(totalPages - 1);
    const handlePageClick = (page) => onPageChange(page);
  
    useEffect(()=>{
        if(document.querySelector(".filter-box")){
            let target = document.querySelector(".filter-box");
            if (safeCurrentPage !== 0) {
              window.scrollTo({ top: target.offsetTop, behavior: 'smooth' })
            }
        }
    },[safeCurrentPage])
    const renderPageNumbers = () => {
      const pages = [];
      let startPage, endPage;
  
      if (totalPages <= 7) {
        // Less than or equal to 7 pages, show all
        startPage = 0;
        endPage = totalPages - 1;
      } else {
        // More than 7 pages, calculate range
        if (safeCurrentPage <= 3) {
          startPage = 0;
          endPage = 5;
        } else if (safeCurrentPage >= totalPages - 4) {
          startPage = totalPages - 6;
          endPage = totalPages - 1;
        } else {
          startPage = safeCurrentPage - 2;
          endPage = safeCurrentPage + 3;
        }
      }
  
      for (let i = startPage; i <= endPage -1; i++) {
        if (i >= 0 && i < totalPages) {
          pages.push(
            <button
              key={i}
              onClick={() => handlePageClick(i)}
              className={i === safeCurrentPage ? 'active' : ''}
            >
              {i + 1}
            </button>
          );
        }
      }
  
      return pages;
    };
    return (
        <div className='flex justify-center'>
        <div className="pagination">
            {safeCurrentPage > 2 && <button onClick={handleFirst}>First</button>}
            {safeCurrentPage != 0 && <button onClick={handlePrevious} disabled={safeCurrentPage === 0}>Previous</button>}
            {renderPageNumbers()}
            {totalPages <= 5 && safeCurrentPage != totalPages && <button className={`${safeCurrentPage == (totalPages-1) && "active"}`} onClick={handleLast} >{totalPages}</button>}
            {safeCurrentPage != (totalPages-1) && <button onClick={handleNext} disabled={safeCurrentPage === totalPages - 1}>Next</button>}
            {totalPages > 5 && safeCurrentPage != totalPages && <button className={`${safeCurrentPage == (totalPages-1) && "active"}`} onClick={handleLast} >{totalPages}</button>}
        </div>
    </div>
    );
  };
  
