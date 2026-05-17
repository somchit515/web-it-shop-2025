// src/components/Home.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FaSearch, FaBoxOpen, FaArrowUp } from "react-icons/fa";

import MetaData from "./layout/MetaData";
import Loader from "./layout/Loader";
import CustomPagination from "./layout/CustomPagination";
import Filters from "./layout/Filters";
import CategoryRow from "./layout/CategoryRow";
import PromoBanner from "./layout/PromoBanner";
import ProductItem from "./product/ProductItem";

import { useGetProductsQuery } from "../components/redux/api/productsApi";
import { useGetFlashDealQuery } from "../components/redux/api/flashDealApi";
import useCategories from "../utils/useCategories";

import "./Home.css";

/* ─── Right Sidebar: Flash Deal (from API) ───────────────── */
const MINI_PROMOS = [
  { emoji: "🚚", title: "ສົ່ງຟຣີ", sub: "ເມື່ອຊື້ ₭1M+", color: "#667eea", bg: "#f0f4ff" },
  { emoji: "🎁", title: "ຂອງຂວັນ", sub: "ທຸກການສັ່ງຊື້", color: "#059669", bg: "#f0fdf4" },
  { emoji: "↩️", title: "ຄືນສິນຄ້າ", sub: "ພາຍໃນ 7 ວັນ", color: "#dc2626", bg: "#fef2f2" },
];

function useCountdown(endsAt) {
  const getRemaining = () => {
    const target = endsAt ? new Date(endsAt) : (() => { const d = new Date(); d.setHours(24,0,0,0); return d; })();
    const diff = Math.max(0, target - new Date());
    return {
      h: Math.floor(diff / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
    };
  };
  const [time, setTime] = useState(getRemaining);
  useEffect(() => {
    const t = setInterval(() => setTime(getRemaining()), 1000);
    return () => clearInterval(t);
  }, [endsAt]);
  return time;
}

function RightSidebar() {
  const { data, isLoading } = useGetFlashDealQuery(undefined, { pollingInterval: 60000 });
  const deal = data?.deal;
  const { h, m, s } = useCountdown(deal?.endsAt);
  const pad = (n) => String(n).padStart(2, "0");
  const dealProducts = deal?.products || [];
  const discount = deal?.discountPercent || 0;
  const dealPrice = (p) => discount > 0
    ? Math.round((p.salePrice || p.price) * (1 - discount / 100))
    : (p.salePrice || p.price);
  const origPrice = (p) => p.salePrice || p.price;

  const isActive = deal?.isActive !== false && dealProducts.length > 0;

  return (
    <aside className="hs-right">
      {/* ══ Flash Deal Block ══ */}
      <div className="hs-flash">
        {/* Header */}
        <div className="hs-flash-header-row">
          <div className="hs-flash-head">
            <span className="hs-flash-bolt">⚡</span>
            <span>{deal?.label || "Flash Deal"}</span>
            {discount > 0 && (
              <span className="hs-flash-pct-badge">-{discount}%</span>
            )}
          </div>
          {isActive && (
            <div className="hs-flash-ends-label">ສິ້ນສຸດໃນ</div>
          )}
        </div>

        {/* Countdown */}
        {isActive && (
          <div className="hs-flash-timer">
            <div className="hs-tick">
              <span className="hs-tick-num">{pad(h)}</span>
              <small>ຊຊ.</small>
            </div>
            <span className="hs-tick-sep">:</span>
            <div className="hs-tick">
              <span className="hs-tick-num">{pad(m)}</span>
              <small>ນທ.</small>
            </div>
            <span className="hs-tick-sep">:</span>
            <div className="hs-tick">
              <span className="hs-tick-num">{pad(s)}</span>
              <small>ວິ.</small>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="hs-flash-divider" />

        {/* Products */}
        <div className="hs-flash-products">
          {isLoading && (
            <div className="hs-flash-empty">ກຳລັງໂຫຼດ...</div>
          )}
          {!isLoading && dealProducts.length === 0 && (
            <div className="hs-flash-empty">ຍັງບໍ່ໄດ້ຕັ້ງ Flash Deal</div>
          )}
          {dealProducts.map((p, idx) => (
            <Link key={p._id} to={`/product/${p._id}`} className="hs-deal-card">
              {/* Discount badge */}
              {discount > 0 && (
                <span className="hs-deal-badge">-{discount}%</span>
              )}

              {/* Image */}
              <div className="hs-deal-img-wrap">
                <img
                  src={p.images?.[0]?.url || "/images/default_product.png"}
                  alt={p.name}
                  className="hs-deal-img"
                  onError={(e) => (e.currentTarget.src = "/images/default_product.png")}
                />
              </div>

              {/* Info */}
              <div className="hs-deal-info">
                <p className="hs-deal-name">{p.name}</p>
                <div className="hs-deal-prices">
                  {discount > 0 && (
                    <span className="hs-deal-orig">₭{Number(origPrice(p)).toLocaleString()}</span>
                  )}
                  <span className="hs-deal-price">₭{Number(dealPrice(p)).toLocaleString()}</span>
                </div>
                {p.stock <= 5 && p.stock > 0 && (
                  <>
                    <div className="hs-deal-stock-bar-wrap">
                      <div className="hs-deal-stock-bar" style={{ width: `${Math.min((p.stock / 10) * 100, 100)}%` }} />
                    </div>
                    <span className="hs-deal-stock-label">ເຫຼືອ {p.stock} ຊິ້ນ</span>
                  </>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Footer link */}
        <Link to="/products" className="hs-flash-more">
          ເບິ່ງສິນຄ້າທັງໝົດ →
        </Link>
      </div>

      {/* ══ Mini Promos ══ */}
      <div className="hs-promos">
        {MINI_PROMOS.map((p) => (
          <div key={p.title} className="hs-promo-card" style={{ background: p.bg, borderColor: p.color + "33" }}>
            <span className="hs-promo-emoji">{p.emoji}</span>
            <div>
              <div className="hs-promo-title" style={{ color: p.color }}>{p.title}</div>
              <div className="hs-promo-sub">{p.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

/* ─── Main ───────────────────────────────────────────────── */
const Home = () => {
  const { categories } = useCategories();
  const [searchParams] = useSearchParams();
  const { category: categoryFromPath } = useParams();

  const page    = searchParams.get("page") || 1;
  const keyword = searchParams.get("keyword") || "";
  const min     = searchParams.get("min");
  const max     = searchParams.get("max");
  const category = searchParams.get("category") || categoryFromPath;
  const rating   = searchParams.get("rating");

  const params = { page, keyword };
  if (min !== null) params.min = min;
  if (max !== null) params.max = max;
  if (category !== null) params.category = category;
  if (rating !== null) params.rating = rating;

  const { data, isLoading, error, isError } = useGetProductsQuery(params);

  useEffect(() => {
    if (isError) toast.error(error?.data?.message || error?.message || "Failed to fetch products");
  }, [isError, error]);

  const hasFilters       = Boolean(keyword) || Boolean(category) || Boolean(rating) || min !== null || max !== null;
  const showFilters      = hasFilters;
  const showHomeSections = !hasFilters;
  const products   = data?.products || [];
  const foundCount = (products?.length || 0).toLocaleString("en-US");

  const rowsToShow = useMemo(() => {
    const preferSlugs = ["smartphones", "laptops", "gaming-products", "electronics", "pc", "cameras", "headphones", "books", "sports"];
    return preferSlugs
      .map((s) => categories.find((c) => c.slug === s))
      .filter(Boolean)
      .map((c) => ({ key: c.key || c.slug, title: c.title, slug: c.slug }));
  }, [categories]);

  const [showScrollTop, setShowScrollTop] = useState(false);
  useEffect(() => {
    const fn = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  if (isLoading) return <Loader />;

  return (
    <>
      <MetaData title="IT HUBB — ຮ້ານ IT ອອນລາຍ" />
      <style>{homeSidebarCss}</style>

      <div className="home-wrapper pb-5">
        <span className="home-side-accent left" aria-hidden="true" />
        <span className="home-side-accent right" aria-hidden="true" />

        {/* ══ HERO: 2-column layout (main | right sidebar) ══ */}
        {showHomeSections && (
          <div className="hs-hero-wrap">
            <div className="hs-center">
              <PromoBanner />

              {/* Categories Grid */}
              <div className="mb-4 px-2 pt-4">
                <h4 className="section-title">ໝວດໝູ່ສິນຄ້າ</h4>
                <p className="section-subtitle">ເລືອກຊື້ສິນຄ້າຕາມໝວດໝູ່ທີ່ທ່ານສົນໃຈ</p>
                <div className="custom-grid-5">
                  {categories.map((c) => (
                    <Link key={c.slug} to={`/category/${c.slug}`} className="text-decoration-none text-dark">
                      <div className="category-card p-3 h-100 d-flex flex-column align-items-center justify-content-center" tabIndex={0}>
                        <div className="category-img-wrapper mb-2 d-flex align-items-center justify-content-center" style={{ height: "70px", width: "100%" }}>
                          <img
                            src={c.img} alt={c.title}
                            style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
                            onError={(e) => (e.currentTarget.src = "/images/default_product.png")}
                          />
                        </div>
                        <span className="fw-semibold small text-center">{c.title}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* ── ສິນຄ້າແນະນຳ ── */}
              {products.length > 0 && (
                <div className="px-2 mb-5">
                  <div className="hs-sec-header">
                    <div>
                      <h4 className="hs-sec-title">⭐ ສິນຄ້າແນະນຳ</h4>
                      <p className="hs-sec-sub">ສິນຄ້າຍອດນິຍົມທີ່ລູກຄ້າເລືອກຫຼາຍທີ່ສຸດ</p>
                    </div>
                  </div>
                  <div className="hs-product-grid">
                    {products.slice(0, 10).map((p) => (
                      <ProductItem key={p._id} product={p} columnSize="auto" />
                    ))}
                  </div>
                </div>
              )}

              {/* Products per category rows */}
              <div className="px-2">
                {rowsToShow.map((r) => (
                  <CategoryRow key={r.key} title={r.title} category={r.key} showAllLink={`/category/${r.slug}`} />
                ))}
              </div>
            </div>

            <RightSidebar />
          </div>
        )}

        {/* ══ SEARCH RESULT HEADER ══ */}
        {showFilters && (
          <div className="search-result-header px-3 px-md-4 mb-4">
            <div className="search-result-header-inner">
              <div className="search-result-meta">
                <div className="search-result-icon-box"><FaSearch /></div>
                <div>
                  <h4 className="search-result-title">
                    {keyword ? <>ຜົນການຄົ້ນຫາ <span className="search-keyword">"{keyword}"</span></> :
                     category ? <>ໝວດໝູ່ <span className="search-keyword">{category}</span></> :
                     <>ຜົນລັບການກອງສິນຄ້າ</>}
                  </h4>
                  <p className="search-result-sub">ພົບ <strong>{foundCount}</strong> ລາຍການ</p>
                </div>
              </div>
              <Link to="/" className="btn-warm-outline">ລ້າງການກອງ</Link>
            </div>
          </div>
        )}

        {/* ══ SEARCH / FILTER RESULTS ══ */}
        {showFilters && (
          <div className="row px-3 px-md-4">
            <div className="col-12 col-lg-3 mb-4">
              <div className="sticky-top" style={{ top: "20px", zIndex: 1 }}>
                <div className="filters-glass-wrapper"><Filters /></div>
              </div>
            </div>

            <div className="col-12 col-lg-9">
              <section id="products">
                <div className="row g-4">
                  {products.length === 0 ? (
                    <div className="col-12">
                      <div className="empty-state">
                        <div className="empty-state-icon"><FaBoxOpen /></div>
                        <h4>ບໍ່ພົບສິນຄ້າທີ່ທ່ານຄົ້ນຫາ</h4>
                        <Link to="/" className="btn-warm mt-3 text-decoration-none">ເບີ່ງສິນຄ້າທັງໝົດ</Link>
                      </div>
                    </div>
                  ) : (
                    products.map((p) => (
                      <ProductItem key={p._id} product={p} columnSize={4} />
                    ))
                  )}
                </div>
              </section>

              {data?.filteredProductsCount > data?.resPerPage && (
                <div className="d-flex justify-content-center mt-5">
                  <CustomPagination resPerPage={data?.resPerPage || 0} filteredProductsCount={data?.filteredProductsCount || 0} />
                </div>
              )}
            </div>
          </div>
        )}

        {showFilters && products.length > 0 && (
          <div className="mt-5 px-3 px-md-4">
            <div className="recommended-divider"><span>ສິນຄ້າອາດຖືກໃຈ</span></div>
            {rowsToShow.slice(0, 3).map((r) => (
              <CategoryRow key={r.key} title={r.title} category={r.key} showAllLink={`/category/${r.slug}`} />
            ))}
          </div>
        )}

        <button type="button" className={`scroll-top ${showScrollTop ? "show" : ""}`} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <FaArrowUp />
        </button>
      </div>
    </>
  );
};

export default Home;

/* ─── Sidebar CSS ─────────────────────────────────────────── */
const homeSidebarCss = `
/* ── 5-column product grid ── */
.hs-product-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  align-items: stretch;
}
.hs-product-grid > div {
  margin: 0 !important;
  width: 100% !important;
  display: flex;
}

@media (max-width: 1200px) { .hs-product-grid { grid-template-columns: repeat(4, 1fr); } }
@media (max-width: 900px)  { .hs-product-grid { grid-template-columns: repeat(2, 1fr); } }

/* ── section header ── */
.hs-sec-header {
  display: flex; align-items: flex-end; justify-content: space-between;
  margin-bottom: 16px;
}
.hs-sec-title {
  font-size: 1.1rem; font-weight: 800; color: #1e293b; margin: 0;
}
.hs-sec-sub {
  font-size: .78rem; color: #94a3b8; margin: 3px 0 0;
}

/* ── 2-column layout (main | sidebar) ── */
.hs-hero-wrap {
  display: grid;
  grid-template-columns: 1fr 520px;
  align-items: start;
  gap: 0;
  max-width: 100% !important;
  width: 100%;
}

/* ══ CENTER ══ */
.hs-center { min-width: 0; }

/* ══ RIGHT SIDEBAR ══ */
.hs-right {
  position: sticky;
  top: 80px;
  padding: .75rem .65rem;
  border-left: 1px solid #e8edf5;
  background: #f8fafc;
  display: flex; flex-direction: column; gap: .75rem;
  max-height: calc(100vh - 80px);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(99,102,241,.25) transparent;
  box-shadow: -2px 0 16px rgba(0,0,0,.05);
}
.hs-right::-webkit-scrollbar { width: 3px; }
.hs-right::-webkit-scrollbar-thumb { background: rgba(99,102,241,.3); border-radius: 4px; }

/* ══ Flash Deal Block ══ */
.hs-flash {
  background: linear-gradient(160deg, #0f0c29, #302b63, #24243e);
  border-radius: 14px;
  padding: 1rem 1rem 1.1rem;
  color: #fff;
  box-shadow: 0 8px 24px rgba(15,12,41,.35);
}

/* Header row */
.hs-flash-header-row {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: .5rem;
}
.hs-flash-head {
  display: flex; align-items: center; gap: .3rem;
  font-weight: 900; font-size: .88rem;
  color: #fbbf24; letter-spacing: .03em;
}
.hs-flash-bolt { font-size: 1rem; animation: hs-bolt-pulse 1.4s ease-in-out infinite; }
@keyframes hs-bolt-pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
.hs-flash-pct-badge {
  background: #f43f5e; color: #fff;
  font-size: .6rem; font-weight: 800;
  border-radius: 20px; padding: 1px 7px;
  letter-spacing: .02em;
}
.hs-flash-ends-label {
  font-size: .62rem; color: rgba(255,255,255,.5);
  text-transform: uppercase; letter-spacing: .06em;
}

/* Countdown */
.hs-flash-timer {
  display: flex; align-items: center; gap: .3rem;
  margin-bottom: .75rem;
}
.hs-tick {
  display: flex; flex-direction: column; align-items: center;
  background: rgba(255,255,255,.12);
  border: 1px solid rgba(255,255,255,.15);
  border-radius: 8px;
  padding: .35rem .5rem;
  flex: 1; text-align: center;
  backdrop-filter: blur(4px);
}
.hs-tick-num {
  font-size: 1.05rem; font-weight: 900; line-height: 1; color: #fff;
  font-variant-numeric: tabular-nums;
}
.hs-tick small { font-size: .48rem; font-weight: 500; opacity: .55; margin-top: 2px; display: block; }
.hs-tick-sep { font-weight: 900; color: #fbbf24; font-size: 1.1rem; line-height: 1; padding-bottom: 6px; }

/* Divider */
.hs-flash-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.15), transparent);
  margin: 0 0 .7rem;
}

/* Products list — 2-column grid */
.hs-flash-products {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: .55rem;
}

.hs-flash-empty {
  grid-column: 1 / -1;
  text-align: center; color: rgba(255,255,255,.35);
  font-size: .75rem; padding: 1.5rem .5rem;
}

/* Single deal card — vertical */
.hs-deal-card {
  display: flex; flex-direction: column;
  text-decoration: none; color: inherit;
  background: rgba(255,255,255,.07);
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 10px;
  padding: .55rem;
  transition: background .15s, transform .12s, border-color .15s;
  position: relative;
  overflow: hidden;
}
.hs-deal-card:hover {
  background: rgba(255,255,255,.14);
  border-color: rgba(251,191,36,.4);
  transform: translateY(-2px);
}

/* Discount badge */
.hs-deal-badge {
  position: absolute; top: 6px; left: 6px;
  background: #f43f5e; color: #fff;
  font-size: .58rem; font-weight: 900;
  border-radius: 5px; padding: 2px 6px;
  z-index: 1; line-height: 1.3;
}

/* Image */
.hs-deal-img-wrap {
  width: 100%; aspect-ratio: 1;
  background: rgba(255,255,255,.1);
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: .45rem;
  overflow: hidden;
}
.hs-deal-img {
  width: 90%; height: 90%; object-fit: contain;
}

/* Info */
.hs-deal-info { min-width: 0; }
.hs-deal-name {
  font-size: .68rem; font-weight: 600;
  color: rgba(255,255,255,.88);
  margin: 0 0 .3rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.35;
}
.hs-deal-prices {
  display: flex; flex-direction: column; gap: 1px;
}
.hs-deal-orig {
  font-size: .6rem; color: rgba(255,255,255,.32);
  text-decoration: line-through; line-height: 1;
}
.hs-deal-price {
  font-size: .82rem; font-weight: 900;
  color: #fbbf24; line-height: 1.2;
}

/* Stock bar */
.hs-deal-stock-bar-wrap {
  height: 3px; background: rgba(255,255,255,.12);
  border-radius: 2px; margin-top: .4rem; overflow: hidden;
}
.hs-deal-stock-bar {
  height: 100%;
  background: linear-gradient(90deg, #f43f5e, #fb923c);
  border-radius: 2px;
}
.hs-deal-stock-label {
  font-size: .56rem; color: #fb923c; font-weight: 700;
  margin-top: 3px; display: block;
}

/* Footer */
.hs-flash-more {
  display: block; text-align: center; margin-top: .8rem;
  font-size: .7rem; color: rgba(255,255,255,.5);
  text-decoration: none; padding: .4rem;
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 8px;
  transition: all .15s;
}
.hs-flash-more:hover {
  color: #fbbf24; border-color: rgba(251,191,36,.4);
  background: rgba(251,191,36,.08);
}

/* Mini Promo Cards */
.hs-promos { display: flex; flex-direction: column; gap: .45rem; }
.hs-promo-card {
  display: flex; align-items: center; gap: .6rem;
  padding: .5rem .65rem;
  border-radius: 10px;
  border: 1px solid;
  background: #fff;
}
.hs-promo-emoji { font-size: 1.15rem; flex-shrink: 0; }
.hs-promo-title { font-size: .75rem; font-weight: 800; }
.hs-promo-sub { font-size: .65rem; color: #6b7280; margin: 0; }

/* ── Responsive ── */
@media (max-width: 1200px) {
  .hs-hero-wrap { grid-template-columns: 1fr 360px; }
}
@media (max-width: 900px) {
  .hs-hero-wrap { grid-template-columns: 1fr; }
  .hs-right { display: none; }
}
`;
