import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Pagination from "react-js-pagination";

const CustomPagination = ({ resPerPage, filteredProductsCount }) => {
  const [currentPage, setCurrentPage] = useState();

  let [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const page = Number(searchParams.get("page")) || 1;

  useEffect(() => {
    setCurrentPage(page);
  }, [page]);

  const setCurrentPageNo = (pageNumber) => {
    setCurrentPage(pageNumber);

    searchParams.set("page", pageNumber);
    const path = `${window.location.pathname}?${searchParams.toString()}`;
    navigate(path);
  };

  return (
    <>
      {/* 🎨 Custom Styling */}
      <style>{`
        .pagination {
          display: flex;
          gap: 6px;
        }

        .page-item {
          border-radius: 8px;
          overflow: hidden;
        }

        .page-link {
          color: #0f63ff;
          border: 1px solid #d1d5db;
          padding: 8px 14px;
          border-radius: 8px;
          font-weight: 500;
          transition: all .2s ease;
        }

        .page-link:hover {
          background: #0f63ff;
          color: white !important;
          border-color: #0f63ff;
        }

        .active .page-link {
          background: linear-gradient(90deg, #0f63ff, #0b53e6);
          border-color: #0f63ff;
          color: white !important;
          font-weight: 600;
        }

        .page-item:first-child .page-link,
        .page-item:last-child .page-link {
          font-size: 0.85rem;
          padding: 8px 12px;
        }

        @media (max-width: 480px) {
          .page-link {
            padding: 6px 10px;
            font-size: 0.8rem;
          }
        }
      `}</style>

      <div className="d-flex justify-content-center my-5">
        {filteredProductsCount > resPerPage && (
          <Pagination
            activePage={currentPage}
            itemsCountPerPage={resPerPage}
            totalItemsCount={filteredProductsCount}
            onChange={setCurrentPageNo}
            nextPageText={"ຖັດໄປ ›"}
            prevPageText={"‹ ກ່ອນໜ້າ"}
            firstPageText={"« ທຳອິດ"}
            lastPageText={"ສຸດທ້າຍ »"}
            itemClass="page-item"
            linkClass="page-link"
          />
        )}
      </div>
    </>
  );
};

export default CustomPagination;
