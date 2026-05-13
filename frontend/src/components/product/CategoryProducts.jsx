// src/components/product/CategoryProducts.jsx
import React, { useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { FaHome, FaChevronRight, FaBoxOpen } from "react-icons/fa";

import { useGetProductsQuery } from "../redux/api/productsApi";
import Loader from "../layout/Loader";
import ProductItem from "./ProductItem";
import MetaData from "../layout/MetaData";
import { slugToKey, slugToTitle } from "../../utils/categories";
import toast from "react-hot-toast";

import "../Home.css"; // ใช้ theme + .home-wrapper เดียวกับหน้า Home

function CategoryProducts() {
  const { categorySlug } = useParams();
  const [searchParams] = useSearchParams();

  const categoryKey = slugToKey(categorySlug || "");
  const title = slugToTitle(categorySlug) || "Category";

  const page = searchParams.get("page") || 1;
  const keyword = searchParams.get("keyword") || "";
  const min = searchParams.get("min");
  const max = searchParams.get("max");
  const rating = searchParams.get("rating");

  const queryParams = {};
  if (categoryKey) queryParams.category = categoryKey;
  if (page) queryParams.page = page;
  if (keyword) queryParams.keyword = keyword;
  if (min !== null) queryParams.min = min;
  if (max !== null) queryParams.max = max;
  if (rating !== null) queryParams.rating = rating;

  const { data, isLoading, isError, error } = useGetProductsQuery(queryParams, {
    skip: !categoryKey,
  });

  useEffect(() => {
    if (isError)
      toast.error(error?.data?.message || "Failed to load category products");
  }, [isError, error]);

  const products = data?.products || [];
  const total = data?.filteredProductsCount ?? products.length;

  return (
    <>
      <MetaData
        title={`ໝວດ: ${title}`}
        description={`Browse all products in ${title}`}
      />

      {/* ใช้ home-wrapper เพื่อ break out + theme เหมือน Home */}
      <div className="home-wrapper pb-5 pt-4">
        {/* Decorative side accents */}
        <span className="home-side-accent left" aria-hidden="true" />
        <span className="home-side-accent right" aria-hidden="true" />

        {/* ===== Custom Breadcrumb ===== */}
        <nav aria-label="breadcrumb" className="cat-breadcrumb">
          <Link to="/" className="cat-breadcrumb-item">
            <FaHome /> Home
          </Link>
          <FaChevronRight className="cat-breadcrumb-sep" />
          <span className="cat-breadcrumb-item active">{title}</span>
        </nav>

        {/* ===== Page Header ===== */}
        <div className="cat-header">
          <div>
            <h2 className="section-title cat-page-title">
              ສິນຄ້າໝວດ: {title}
            </h2>
            {!isLoading && categoryKey && (
              <p className="section-subtitle mb-0">
                ພົບສິນຄ້າ{" "}
                <span style={{ color: "var(--color-primary)", fontWeight: 700 }}>
                  {Number(total).toLocaleString("en-US")}
                </span>{" "}
                ລາຍການ
              </p>
            )}
          </div>

          <Link to="/" className="btn-warm-outline">
            ← ກັບໄປໜ້າຫຼັກ
          </Link>
        </div>

        {/* ===== Case 1: slug ไม่ถูกต้อง ===== */}
        {!categoryKey && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <FaBoxOpen />
            </div>
            <h4>ບໍ່ພົບໝວດສິນຄ້າ</h4>
            <p>
              slug "<b>{categorySlug}</b>" ບໍ່ມີໃນລະບົບ
            </p>
            <Link to="/" className="btn-warm mt-3 text-decoration-none">
              ກັບໄປໜ້າຫຼັກ
            </Link>
          </div>
        )}

        {/* ===== Case 2: กำลังโหลด ===== */}
        {isLoading && <Loader />}

        {/* ===== Case 3: category ถูกต้อง + โหลดเสร็จ ===== */}
        {!isLoading && categoryKey && (
          <>
            {products.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <FaBoxOpen />
                </div>
                <h4>ບໍ່ມີສິນຄ້າໃນໝວດນີ້</h4>
                <p>ລອງເລືອກໝວດອື່ນ ຫຼື ກັບໄປໜ້າຫຼັກ</p>
                <Link to="/" className="btn-warm mt-3 text-decoration-none">
                  ເບີ່ງສິນຄ້າທັງໝົດ
                </Link>
              </div>
            ) : (
              <section id="products">
                <div className="row g-4">
                  {products.map((item) => (
                    <ProductItem
                      key={item._id}
                      product={item}
                      columnSize={3}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default CategoryProducts;