import React, { useMemo, useState } from "react";
import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import { useGetProductsQuery } from "../redux/api/productsApi";
import { useGetFlashDealQuery } from "../redux/api/flashDealApi";
import Loader from "../layout/Loader";
import ProductItem from "./ProductItem";
import MetaData from "../layout/MetaData";
import { slugToKey, slugToTitle } from "../../utils/categories";
import toast from "react-hot-toast";
import { useEffect } from "react";

const SORT_OPTIONS = [
  { value: "",        label: "ຄ່າເລີ່ມຕົ້ນ" },
  { value: "price_asc",  label: "ລາຄາ: ຕ່ຳ → ສູງ" },
  { value: "price_desc", label: "ລາຄາ: ສູງ → ຕ່ຳ" },
  { value: "rating",     label: "ຄະແນນສູງສຸດ" },
  { value: "newest",     label: "ໃໝ່ສຸດ" },
];

const CSS = `
  .cat-root {
    background: #f1f5f9;
    min-height: 100vh;
    font-family: "Noto Sans Lao","Inter",sans-serif;
    padding-bottom: 56px;
  }

  /* ── Hero banner ── */
  .cat-hero {
    background: linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);
    padding: 36px 24px 28px;
    color: #fff;
    position: relative;
    overflow: hidden;
  }
  .cat-hero::after {
    content:'';position:absolute;right:-60px;top:-60px;
    width:220px;height:220px;border-radius:50%;
    background:rgba(255,255,255,.06);pointer-events:none;
  }
  .cat-hero-inner {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    position: relative;
    z-index: 1;
  }
  .cat-hero-breadcrumb {
    display: flex; align-items: center; gap: 6px;
    font-size: .78rem; opacity: .75; margin-bottom: 6px;
  }
  .cat-hero-breadcrumb a { color: #fff; text-decoration: none; }
  .cat-hero-breadcrumb a:hover { opacity: .85; }
  .cat-hero-breadcrumb span { opacity: .5; }
  .cat-hero-title { font-size: 1.8rem; font-weight: 800; margin: 0 0 4px; line-height: 1.2; }
  .cat-hero-count { font-size: .88rem; opacity: .75; }
  .cat-hero-back {
    background: rgba(255,255,255,.15);
    color: #fff;
    border: 1.5px solid rgba(255,255,255,.3);
    border-radius: 10px;
    padding: 8px 18px;
    font-size: .82rem;
    font-weight: 700;
    text-decoration: none;
    white-space: nowrap;
    backdrop-filter: blur(6px);
    transition: background .15s;
  }
  .cat-hero-back:hover { background: rgba(255,255,255,.28); color: #fff; }

  /* ── Flash Deal banner ── */
  .cat-flash-bar {
    background: linear-gradient(90deg,#f43f5e,#e11d48);
    color: #fff;
    padding: 10px 24px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: .85rem;
    font-weight: 700;
  }
  .cat-flash-bar-inner {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
  }
  .cat-flash-pill {
    background: rgba(255,255,255,.2);
    border-radius: 999px;
    padding: 2px 10px;
    font-size: .72rem;
  }

  /* ── Toolbar ── */
  .cat-toolbar {
    max-width: 1400px;
    margin: 20px auto 16px;
    padding: 0 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }
  .cat-toolbar-left { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .cat-result-count { font-size: .85rem; color: #64748b; }
  .cat-result-count strong { color: #1e293b; }
  .cat-sort {
    padding: 8px 12px;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    font-size: .82rem;
    font-family: inherit;
    background: #fff;
    color: #374151;
    cursor: pointer;
    outline: none;
    transition: border-color .15s;
  }
  .cat-sort:focus { border-color: #4f46e5; }

  /* ── Flash filter chip ── */
  .cat-chip {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 6px 12px;
    border-radius: 999px;
    font-size: .78rem; font-weight: 700;
    border: 1.5px solid;
    cursor: pointer;
    transition: all .15s;
    background: #fff;
  }
  .cat-chip.flash { border-color: #fca5a5; color: #ef4444; }
  .cat-chip.flash.active { background: #ef4444; color: #fff; border-color: #ef4444; }

  /* ── Products grid ── */
  .cat-grid-wrap {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 20px;
  }
  .cat-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 20px;
  }

  /* ── Empty ── */
  .cat-empty {
    text-align: center;
    padding: 80px 24px;
    color: #94a3b8;
    max-width: 400px;
    margin: 0 auto;
  }
  .cat-empty-icon { font-size: 4rem; display: block; margin-bottom: 16px; opacity: .4; }
  .cat-empty h3 { color: #1e293b; font-size: 1.2rem; margin-bottom: 8px; }
  .cat-empty p { font-size: .88rem; margin-bottom: 20px; }
  .cat-empty-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 10px 22px;
    background: linear-gradient(135deg,#4f46e5,#7c3aed);
    color: #fff; border-radius: 999px; text-decoration: none;
    font-weight: 700; font-size: .85rem;
    transition: all .2s;
  }
  .cat-empty-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(79,70,229,.4); color: #fff; }

  @media(max-width:600px){
    .cat-hero { padding: 24px 16px; }
    .cat-hero-title { font-size: 1.4rem; }
    .cat-toolbar { padding: 0 12px; }
    .cat-grid-wrap { padding: 0 12px; }
    .cat-grid { grid-template-columns: repeat(2,1fr); gap: 12px; }
  }
`;

const CATEGORY_ICONS = {
  notebook: "💻", phone: "📱", tablet: "📟", desktop: "🖥️",
  printer: "🖨️", monitor: "🖥️", keyboard: "⌨️", mouse: "🖱️",
  headphone: "🎧", speaker: "🔊", camera: "📷", gaming: "🎮",
  storage: "💾", network: "📡", accessories: "🔌", other: "📦",
};

export default function CategoryProducts() {
  const { categorySlug } = useParams();
  const [searchParams] = useSearchParams();
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();

  const [sort, setSort]             = useState("");
  const [flashOnly, setFlashOnly]   = useState(false);

  const categoryKey = slugToKey(categorySlug || "");
  const title = slugToTitle(categorySlug) || "Category";
  const icon = CATEGORY_ICONS[categoryKey?.toLowerCase()] || "📦";

  const page    = searchParams.get("page") || 1;
  const keyword = searchParams.get("keyword") || "";
  const min     = searchParams.get("min");
  const max     = searchParams.get("max");
  const rating  = searchParams.get("rating");

  const queryParams = {};
  if (categoryKey) queryParams.category = categoryKey;
  if (page)        queryParams.page     = page;
  if (keyword)     queryParams.keyword  = keyword;
  if (min !== null && min !== undefined) queryParams.min = min;
  if (max !== null && max !== undefined) queryParams.max = max;
  if (rating !== null && rating !== undefined) queryParams.rating = rating;

  const { data, isLoading, isError, error } = useGetProductsQuery(queryParams, { skip: !categoryKey });

  useEffect(() => {
    if (isError) toast.error(error?.data?.message || "ໂຫຼດສິນຄ້າບໍ່ສຳເລັດ");
  }, [isError, error]);

  // Flash Deal
  const { data: flashData } = useGetFlashDealQuery();
  const flashDealMap = useMemo(() => {
    const deal = flashData?.deal;
    if (!deal?.isActive || !deal?.discountPercent || !deal?.products?.length) return {};
    if (deal.endsAt && new Date(deal.endsAt) < new Date()) return {};
    const map = {};
    deal.products.forEach((p) => { map[p._id || p] = deal.discountPercent; });
    return map;
  }, [flashData]);

  const hasFlashInCategory = useMemo(
    () => (data?.products || []).some((p) => flashDealMap[p._id]),
    [data, flashDealMap]
  );

  // Sort + filter client-side
  const products = useMemo(() => {
    let list = [...(data?.products || [])];
    if (flashOnly) list = list.filter((p) => flashDealMap[p._id]);
    switch (sort) {
      case "price_asc":  list.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price)); break;
      case "price_desc": list.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price)); break;
      case "rating":     list.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      case "newest":     list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
      default: break;
    }
    return list;
  }, [data, sort, flashOnly, flashDealMap]);

  const total = data?.filteredProductsCount ?? (data?.products?.length || 0);
  const flashCount = Object.keys(flashDealMap).length;

  return (
    <>
      <MetaData title={`ໝວດ: ${title}`} description={`Browse all products in ${title}`} />
      <style>{CSS}</style>

      <div className="cat-root">
        {/* Hero */}
        <div className="cat-hero">
          <div className="cat-hero-inner">
            <div>
              <div className="cat-hero-breadcrumb">
                <Link to="/">🏠 Home</Link>
                <span>›</span>
                <span>{title}</span>
              </div>
              <div className="cat-hero-title">{icon} {title}</div>
              {!isLoading && categoryKey && (
                <div className="cat-hero-count">
                  ພົບ <strong>{Number(total).toLocaleString()}</strong> ລາຍການ
                </div>
              )}
            </div>
            <Link to="/" className="cat-hero-back">← ໜ້າຫຼັກ</Link>
          </div>
        </div>

        {/* Flash Deal bar */}
        {hasFlashInCategory && (
          <div className="cat-flash-bar">
            <div className="cat-flash-bar-inner">
              <span>⚡</span>
              <span>ມີສິນຄ້າ Flash Deal ໃນໝວດນີ້!</span>
              <span className="cat-flash-pill">-{Object.values(flashDealMap)[0]}% OFF</span>
            </div>
          </div>
        )}

        {/* Not found */}
        {!categoryKey && (
          <div className="cat-empty">
            <span className="cat-empty-icon">📦</span>
            <h3>ບໍ່ພົບໝວດສິນຄ້າ</h3>
            <p>slug "{categorySlug}" ບໍ່ມີໃນລະບົບ</p>
            <Link to="/" className="cat-empty-btn">← ໜ້າຫຼັກ</Link>
          </div>
        )}

        {isLoading && <Loader />}

        {!isLoading && categoryKey && (
          <>
            {/* Toolbar */}
            <div className="cat-toolbar">
              <div className="cat-toolbar-left">
                <span className="cat-result-count">
                  ສະແດງ <strong>{products.length}</strong> / {total} ລາຍການ
                </span>
                {hasFlashInCategory && (
                  <button
                    className={`cat-chip flash ${flashOnly ? "active" : ""}`}
                    onClick={() => setFlashOnly((v) => !v)}
                  >
                    ⚡ Flash Deal ({flashCount})
                  </button>
                )}
              </div>
              <select className="cat-sort" value={sort} onChange={(e) => setSort(e.target.value)}>
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Grid */}
            <div className="cat-grid-wrap">
              {products.length === 0 ? (
                <div className="cat-empty">
                  <span className="cat-empty-icon">🔍</span>
                  <h3>ບໍ່ມີສິນຄ້າ</h3>
                  <p>ລອງ reset filter ຫຼື ເລືອກໝວດອື່ນ</p>
                  <Link to="/" className="cat-empty-btn">ເບິ່ງທັງໝົດ</Link>
                </div>
              ) : (
                <div className="cat-grid">
                  {products.map((item) => (
                    <ProductItem
                      key={item._id}
                      product={item}
                      columnSize="auto"
                      flashDiscount={flashDealMap[item._id] || 0}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
