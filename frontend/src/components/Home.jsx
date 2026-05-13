// src/components/Home.jsx
import React, { useEffect, useMemo, useState } from "react";
// *** FIX: เพิ่ม useParams จาก react-router-dom ***
import { useSearchParams, Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FaSearch, FaBoxOpen, FaArrowUp } from "react-icons/fa";

import MetaData from "./layout/MetaData";
import Loader from "./layout/Loader";
import CustomPagination from "./layout/CustomPagination";
import Filters from "./layout/Filters";
import CategoryRow from "./layout/CategoryRow";
import CategorySlider from "./category/CategorySlider";
import ProductItem from "./product/ProductItem";

// สมมติฐาน: ต้องแก้ไข path ให้ถูกต้องตามโครงสร้าง
import { useGetProductsQuery } from "../components/redux/api/productsApi";
import useCategories from "../utils/useCategories";

import "./Home.css";

const Home = () => {
codex/add-a-greeting-feature-azctjh
  const { categories } = useCategories();
=======
  const categories = useCategories();
 master
  const [searchParams] = useSearchParams();
  // *** FIX 1: ดึง category จาก URL Path (ถ้ามี) ***
  const { category: categoryFromPath } = useParams();

  // --- 1. Query Params Logic ---
  const page = searchParams.get("page") || 1;
  const keyword = searchParams.get("keyword") || "";
  const min = searchParams.get("min");
  const max = searchParams.get("max");

  // *** FIX 2: ใช้ category จาก Path เป็นค่า fallback ถ้าไม่มีใน Query Params ***
  const category = searchParams.get("category") || categoryFromPath;

  const rating = searchParams.get("rating");

  const params = { page, keyword };
  if (min !== null) params.min = min;
  if (max !== null) params.max = max;
  if (category !== null) params.category = category;
  if (rating !== null) params.rating = rating;

  // --- 2. Fetch Data ---
  const { data, isLoading, error, isError } = useGetProductsQuery(params);

  useEffect(() => {
    if (isError) {
      const msg =
        error?.data?.message || error?.message || "Failed to fetch products";
      toast.error(msg);
    }
  }, [isError, error]);

  // --- 3. UI State Logic ---
  // hasFilters เป็นจริง ถ้ามีการค้นหาด้วย keyword, category หรือ filter อื่นๆ
  const hasFilters =
    Boolean(keyword) ||
    Boolean(category) ||
    Boolean(rating) ||
    min !== null ||
    max !== null;
  const showFilters = hasFilters;
  const showHomeSections = !hasFilters;

  const productColumnClass = showFilters ? "col-12 col-lg-9" : "col-12";

  const products = data?.products || [];
  const foundCount = (products?.length || 0).toLocaleString("en-US");

  // Memoize Categories
  const rowsToShow = useMemo(() => {
    const preferSlugs = [
      "smartphones",
      "laptops",
      "gaming",
      "electronics",
      "pc",
      "cameras",
      "headphones",
      "books",
      "sports",
      "outdoors",
    ];
    return preferSlugs
      .map((s) => categories.find((c) => c.slug === s))
      .filter(Boolean)
      .map((c) => ({ key: c.key || c.slug, title: c.title, slug: c.slug }));
  }, [categories]);

  // --- Scroll to top button state ---
  const [showScrollTop, setShowScrollTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () =>
    window.scrollTo({ top: 0, behavior: "smooth" });

  if (isLoading) return <Loader />;

  return (
    <>
      <MetaData title="Buy Products" />

      <div className="home-wrapper pb-5">
        {/* Decorative side accents (เส้นบางๆ ตกแต่งสองข้าง) */}
        <span className="home-side-accent left" aria-hidden="true" />
        <span className="home-side-accent right" aria-hidden="true" />

        {/* ================= HERO SECTION (SLIDER) ================= */}
        {showHomeSections && (
          <div className="my-4">
            <CategorySlider />
          </div>
        )}

        {/* ================= CATEGORIES GRID (UX IMPROVED) ================= */}
        {showHomeSections && (
          <div className="mb-5 px-3 px-md-4">
            <h4 className="section-title">ໝວດໝູ່ສິນຄ້າ</h4>
            <p className="section-subtitle">
              ເລືອກຊື້ສິນຄ້າຕາມໝວດໝູ່ທີ່ທ່ານສົນໃຈ
            </p>
            <div className="custom-grid-5">
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  // *** FIX 3: ลิงก์ไปยัง /category/slug แทนที่จะเป็น ?category=slug ***
                  to={`/category/${c.slug}`}
                  className="text-decoration-none text-dark"
                >
                  <div className="category-card p-3 h-100 d-flex flex-column align-items-center justify-content-center" tabIndex={0}>
                    <div
                      className="category-img-wrapper mb-2 d-flex align-items-center justify-content-center"
                      style={{ height: "70px", width: "100%" }}
                    >
                      <img
                        src={c.img}
                        alt={c.title}
                        style={{
                          maxHeight: "100%",
                          maxWidth: "100%",
                          objectFit: "contain",
                        }}
                        onError={(e) =>
                          (e.currentTarget.src = "/images/default_product.png")
                        }
                      />
                    </div>
                    <span className="fw-semibold small text-center">
                      {c.title}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ================= SEARCH RESULT HEADER (glass card) ================= */}
        {showFilters && (
          <div className="search-result-header px-3 px-md-4 mb-4">
            <div className="search-result-header-inner">
              <div className="search-result-meta">
                <div className="search-result-icon-box">
                  <FaSearch />
                </div>
                <div>
                  <h4 className="search-result-title">
                    {keyword ? (
                      <>ຜົນການຄົ້ນຫາສຳລັບ <span className="search-keyword">"{keyword}"</span></>
                    ) : category ? (
                      <>ໝວດໝູ່ <span className="search-keyword">{category}</span></>
                    ) : (
                      <>ຜົນລັບການກອງສິນຄ້າ</>
                    )}
                  </h4>
                  <p className="search-result-sub">
                    ພົບ <strong>{foundCount}</strong> ລາຍການທີ່ກົງກັບເງື່ອນໄຂຂອງທ່ານ
                  </p>
                </div>
              </div>
              <Link to="/" className="btn-warm-outline">
                <i className="fas fa-rotate-left me-1"></i>
                ລ້າງການກອງ
              </Link>
            </div>
          </div>
        )}

        {/* ================= MAIN CONTENT AREA ================= */}
        <div className="row px-3 px-md-4">
          {/* --- Sidebar Filters --- */}
          {showFilters && (
            <div className="col-12 col-lg-3 mb-4">
              <div className="sticky-top" style={{ top: "20px", zIndex: 1 }}>
                <div className="filters-glass-wrapper">
                  <Filters />
                </div>
              </div>
            </div>
          )}

          {/* --- Product Grid --- */}
          <div className={productColumnClass}>
            {/* Header Result Bar (only shown on home, hidden on search) */}
            {!hasFilters && (
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
                <h5 className="section-title mb-0">ສິນຄ້າແນະນຳ</h5>
              </div>
            )}

            {/* Products List */}
            <section id="products">
              <div className="row g-4">
                {products.length === 0 && hasFilters ? (
                  <div className="col-12">
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <FaBoxOpen />
                      </div>
                      <h4>ບໍ່ພົບສິນຄ້າທີ່ທ່ານຄົ້ນຫາ</h4>
                      <p>ລອງປັບການກອງ ຫຼື ປ່ຽນຄຳຄົ້ນຫາໃໝ່</p>
                      <Link
                        to="/"
                        className="btn-warm mt-3 text-decoration-none"
                      >
                        ເບີ່ງສິນຄ້າທັງໝົດ
                      </Link>
                    </div>
                  </div>
                ) : (
                  products.map((product) => (
                    <ProductItem
                      key={product._id}
                      product={product}
                      // ปรับ columnSize ตามการแสดง Filter
                      columnSize={showFilters ? 4 : 3}
                    />
                  ))
                )}
              </div>
            </section>

            {/* Pagination */}
            {data?.filteredProductsCount > data?.resPerPage && (
              <div className="d-flex justify-content-center mt-5">
                <CustomPagination
                  resPerPage={data?.resPerPage || 0}
                  filteredProductsCount={data?.filteredProductsCount || 0}
                />
              </div>
            )}

            {/* Category Rows (Slider ด้านล่าง) */}
            {showHomeSections && (
              <div className="mt-5">
                {rowsToShow.map((r) => (
                  <CategoryRow
                    key={r.key}
                    title={r.title}
                    category={r.key}
                    showAllLink={`/category/${r.slug}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ================= RECOMMENDED ROWS (when on search) ================= */}
        {showFilters && products.length > 0 && (
          <div className="mt-5 px-3 px-md-4">
            <div className="recommended-divider">
              <span>ສິນຄ້າອາດຖືກໃຈ</span>
            </div>
            {rowsToShow.slice(0, 3).map((r) => (
              <CategoryRow
                key={r.key}
                title={r.title}
                category={r.key}
                showAllLink={`/category/${r.slug}`}
              />
            ))}
          </div>
        )}

        {/* ================= SCROLL TO TOP BUTTON ================= */}
        <button
          type="button"
          aria-label="ກັບຂຶ້ນເທິງສຸດ"
          className={`scroll-top ${showScrollTop ? "show" : ""}`}
          onClick={scrollToTop}
        >
          <FaArrowUp />
        </button>
      </div>
    </>
  );
};

export default Home;