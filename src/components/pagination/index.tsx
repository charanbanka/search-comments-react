import React, { useState } from "react";

interface PaginationProps {
  totalCount: number;
  itemsPerPage: number;
  currentPage: number;
  onNextPage: (newPage: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  totalCount,
  itemsPerPage,
  currentPage,
  onNextPage,
}) => {
  //   const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      onNextPage(nextPage);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      onNextPage(prevPage);
    }
  };

  const handlePageClick = (page: number) => {
    onNextPage(page);
  };

  // Function to generate page numbers with ellipses
  const getPageNumbers = () => {
    const pages = [];
    const range = 1; // Number of pages to show on each side of current page

    if (totalPages <= 5) {
      // Show all pages if total is 5 or fewer
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Always include the first page
    pages.push(1);

    // Calculate the start and end of the middle range
    const start = Math.max(2, currentPage - range);
    const end = Math.min(totalPages - 1, currentPage + range);

    // Add ellipsis before middle range if needed
    if (start > 2) {
      pages.push("...");
    }

    // Add middle range pages
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Add ellipsis after middle range if needed
    if (end < totalPages - 1) {
      pages.push("...");
    }

    // Always include the last page
    if (totalPages > 1 && pages[pages.length - 1] !== totalPages) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="pagination">
      <button disabled={currentPage === 1} onClick={handlePrevPage}>
        Prev
      </button>
      <div className="page-numbers">
        {pageNumbers.map((page, index) =>
          typeof page === "number" ? (
            <button
              key={index}
              className={currentPage === page ? "active" : ""}
              onClick={() => handlePageClick(page)}
            >
              {page}
            </button>
          ) : (
            <span key={index} className="ellipsis">
              ...
            </span>
          )
        )}
      </div>
      <button disabled={currentPage === totalPages} onClick={handleNextPage}>
        Next
      </button>
    </div>
  );
};

export default Pagination;
