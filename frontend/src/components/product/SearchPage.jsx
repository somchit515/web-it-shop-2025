import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useGetProductsQuery } from "../redux/api/productsApi";
import { useGetFlashDealQuery } from "../redux/api/flashDealApi";
import ProductItem from "./ProductItem";
import MetaData from "../layout/MetaData";
import Loader from "../layout/Loader";
import useCategories from "../../utils/useCategories";

const SORT_OPTS = [
  { value: "",          label: "ຄ່າເລີ່ມຕົ້ນ" },
  { value: "price_asc", label: "ລາຄາ: ຕ່ຳ → ສູງ" },
  { value: "price_desc",label: "ລາຄາ: ສູງ → ຕ່ຳ" },
  { value: "rating",    label: "ຄະແນນດີສຸດ" },
  { value: "newest",    label: "ໃໝ່ສຸດ" },
];

const CSS = `
  .sp-root{background:#f1f5f9;min-height:100vh;font-family:"Noto Sans Lao","Inter",sans-serif;padding-bottom:56px;}
  .sp-hero{background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);padding:28px 24px 22px;color:#fff;}
  .sp-hero-inner{max-width:1400px;margin:0 auto;}
  .sp-q{font-size:1.6rem;font-weight:800;margin:0 0 4px;}
  .sp-q span{opacity:.65;font-size:1.1rem;font-weight:600;}
  .sp-sub{font-size:.85rem;opacity:.7;}

  .sp-layout{max-width:1400px;margin:20px auto 0;padding:0 20px;display:grid;grid-template-columns:240px 1fr;gap:24px;align-items:start;}
  @media(max-width:900px){.sp-layout{grid-template-columns:1fr;}}

  /* Sidebar */
  .sp-sidebar{background:#fff;border-radius:16px;border:1px solid #e2e8f0;box-shadow:0 2px 8px rgba(0,0,0,.05);overflow:hidden;position:sticky;top:88px;}
  .sp-sidebar-head{padding:14px 16px;border-bottom:1px solid #f1f5f9;font-size:.88rem;font-weight:700;color:#374151;display:flex;justify-content:space-between;align-items:center;}
  .sp-clear-btn{font-size:.72rem;color:#4f46e5;background:none;border:none;cursor:pointer;font-family:inherit;font-weight:700;}
  .sp-filter-section{padding:14px 16px;border-bottom:1px solid #f1f5f9;}
  .sp-filter-title{font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8;margin-bottom:10px;}
  .sp-cat-list{display:flex;flex-direction:column;gap:4px;}
  .sp-cat-btn{text-align:left;padding:6px 10px;border-radius:8px;border:none;background:none;font-size:.82rem;color:#374151;cursor:pointer;font-family:inherit;transition:all .15s;font-weight:500;}
  .sp-cat-btn:hover{background:#f1f5f9;color:#4f46e5;}
  .sp-cat-btn.active{background:#ede9fe;color:#4f46e5;font-weight:700;}
  .sp-price-row{display:flex;gap:8px;align-items:center;}
  .sp-price-input{flex:1;padding:8px 10px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:.82rem;font-family:inherit;outline:none;transition:border-color .15s;}
  .sp-price-input:focus{border-color:#4f46e5;}
  .sp-price-sep{color:#94a3b8;font-size:.8rem;}
  .sp-rating-list{display:flex;flex-direction:column;gap:4px;}
  .sp-rating-btn{text-align:left;padding:6px 10px;border-radius:8px;border:none;background:none;font-size:.82rem;color:#374151;cursor:pointer;font-family:inherit;transition:all .15s;}
  .sp-rating-btn:hover{background:#f1f5f9;}
  .sp-rating-btn.active{background:#fef3c7;color:#d97706;font-weight:700;}
  .sp-apply-btn{width:100%;padding:10px;border-radius:10px;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;border:none;font-size:.85rem;font-weight:700;cursor:pointer;font-family:inherit;margin:14px 16px;width:calc(100% - 32px);}

  /* Main */
  .sp-toolbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;gap:12px;flex-wrap:wrap;}
  .sp-count{font-size:.85rem;color:#64748b;}.sp-count strong{color:#1e293b;}
  .sp-sort{padding:8px 12px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:.82rem;font-family:inherit;background:#fff;color:#374151;cursor:pointer;outline:none;}
  .sp-sort:focus{border-color:#4f46e5;}
  .sp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;}
  .sp-pager{display:flex;align-items:center;justify-content:center;gap:8px;margin:24px 0 0;flex-wrap:wrap;}
  .sp-pager-btn{padding:7px 18px;border-radius:999px;border:1.5px solid #e2e8f0;background:#fff;font-size:.82rem;font-weight:600;cursor:pointer;transition:all .18s;font-family:inherit;color:#374151;}
  .sp-pager-btn:hover:not(:disabled){border-color:#4f46e5;color:#4f46e5;}
  .sp-pager-btn:disabled{opacity:.4;cursor:not-allowed;}
  .sp-pager-num{width:36px;height:36px;border-radius:50%;border:1.5px solid #e2e8f0;background:#fff;font-size:.82rem;font-weight:600;cursor:pointer;transition:all .18s;display:inline-flex;align-items:center;justify-content:center;color:#374151;}
  .sp-pager-num.active{background:#4f46e5;color:#fff;border-color:#4f46e5;}
  .sp-empty{text-align:center;padding:60px 24px;background:#fff;border-radius:16px;color:#94a3b8;}
  .sp-empty-icon{font-size:3.5rem;display:block;margin-bottom:14px;opacity:.4;}
  @media(max-width:900px){.sp-layout{padding:0 12px;}.sp-sidebar{position:static;}}
`;

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get("keyword") || "";

  const [page,      setPage]      = useState(1);
  const [sort,      setSort]      = useState("");
  const [selCat,    setSelCat]    = useState("");
  const [minPrice,  setMinPrice]  = useState("");
  const [maxPrice,  setMaxPrice]  = useState("");
  const [selRating, setSelRating] = useState("");
  const [pendingMin, setPendingMin] = useState("");
  const [pendingMax, setPendingMax] = useState("");

  useEffect(() => { setPage(1); }, [keyword, selCat, sort, selRating, minPrice, maxPrice]);

  const queryParams = { keyword, page, sort };
  if (selCat)    queryParams.category = selCat;
  if (minPrice)  queryParams.min = minPrice;
  if (maxPrice)  queryParams.max = maxPrice;
  if (selRating) queryParams.rating = selRating;

  const { data, isLoading } = useGetProductsQuery(queryParams);
  const { data: flashData } = useGetFlashDealQuery();
  const categories = useCategories();

  const flashDealMap = useMemo(() => {
    const deal = flashData?.deal;
    if (!deal?.isActive || !deal?.discountPercent || !deal?.products?.length) return {};
    if (deal.endsAt && new Date(deal.endsAt) < new Date()) return {};
    const map = {};
    deal.products.forEach((p) => { map[p._id || p] = deal.discountPercent; });
    return map;
  }, [flashData]);

  const products  = data?.products || [];
  const total     = data?.filteredProductsCount || 0;
  const resPerPage = data?.resPerPage || 8;
  const totalPages = Math.ceil(total / resPerPage);

  const applyPrice = () => { setMinPrice(pendingMin); setMaxPrice(pendingMax); };

  const clearFilters = () => {
    setSelCat(""); setMinPrice(""); setMaxPrice("");
    setSelRating(""); setSort(""); setPendingMin(""); setPendingMax("");
  };

  const hasFilters = selCat || minPrice || maxPrice || selRating || sort;

  return (
    <>
      <MetaData title={`ຄົ້ນຫາ: ${keyword} — IT HUBB`} />
      <style>{CSS}</style>
      <div className="sp-root">
        <div className="sp-hero">
          <div className="sp-hero-inner">
            <div className="sp-q">
              {keyword ? <><span>ຄົ້ນຫາ: </span>"{keyword}"</> : "ທຸກສິນຄ້າ"}
            </div>
            <div className="sp-sub">
              {!isLoading && `ພົບ ${total.toLocaleString()} ລາຍການ`}
            </div>
          </div>
        </div>

        <div className="sp-layout">
          {/* Sidebar filters */}
          <aside className="sp-sidebar">
            <div className="sp-sidebar-head">
              🔧 Filter
              {hasFilters && <button className="sp-clear-btn" onClick={clearFilters}>ລ້າງ</button>}
            </div>

            {/* Category */}
            <div className="sp-filter-section">
              <div className="sp-filter-title">ໝວດ</div>
              <div className="sp-cat-list">
                <button className={`sp-cat-btn ${!selCat ? "active" : ""}`} onClick={() => setSelCat("")}>ທັງໝົດ</button>
                {categories.slice(0, 10).map((c) => (
                  <button key={c.key} className={`sp-cat-btn ${selCat === c.key ? "active" : ""}`}
                    onClick={() => setSelCat(c.key)}>
                    {c.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="sp-filter-section">
              <div className="sp-filter-title">ລາຄາ (₭)</div>
              <div className="sp-price-row">
                <input className="sp-price-input" type="number" placeholder="ຕ່ຳສຸດ" value={pendingMin}
                  onChange={(e) => setPendingMin(e.target.value)} />
                <span className="sp-price-sep">—</span>
                <input className="sp-price-input" type="number" placeholder="ສູງສຸດ" value={pendingMax}
                  onChange={(e) => setPendingMax(e.target.value)} />
              </div>
              <button className="sp-apply-btn" onClick={applyPrice} style={{ marginTop: 10, display: "block" }}>ນຳໃຊ້</button>
            </div>

            {/* Rating */}
            <div className="sp-filter-section">
              <div className="sp-filter-title">ຄະແນນ</div>
              <div className="sp-rating-list">
                {["", "4", "3", "2"].map((r) => (
                  <button key={r} className={`sp-rating-btn ${selRating === r ? "active" : ""}`}
                    onClick={() => setSelRating(r)}>
                    {r ? `⭐ ${r}+ ດາວ` : "ທຸກຄະແນນ"}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Results */}
          <div>
            <div className="sp-toolbar">
              <span className="sp-count">
                ສະແດງ <strong>{products.length}</strong> / {total} ລາຍການ
              </span>
              <select className="sp-sort" value={sort} onChange={(e) => setSort(e.target.value)}>
                {SORT_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {isLoading ? <Loader /> : products.length === 0 ? (
              <div className="sp-empty">
                <span className="sp-empty-icon">🔍</span>
                <p>ບໍ່ພົບ "{keyword}" {selCat ? `ໃນໝວດ ${selCat}` : ""}</p>
                <button onClick={clearFilters} style={{ color: "#4f46e5", background: "none", border: "none", cursor: "pointer", fontWeight: 700, fontFamily: "inherit" }}>ລ້າງ filter</button>
              </div>
            ) : (
              <div className="sp-grid">
                {products.map((p) => (
                  <ProductItem key={p._id} product={p} columnSize="auto" flashDiscount={flashDealMap[p._id] || 0} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="sp-pager">
                <button className="sp-pager-btn" disabled={page <= 1} onClick={() => setPage((v) => v - 1)}>← ກ່ອນ</button>
                {[...Array(Math.min(totalPages, 7))].map((_, i) => (
                  <button key={i + 1} className={`sp-pager-num ${page === i + 1 ? "active" : ""}`}
                    onClick={() => setPage(i + 1)}>{i + 1}</button>
                ))}
                <button className="sp-pager-btn" disabled={page >= totalPages} onClick={() => setPage((v) => v + 1)}>ຕໍ່ →</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
