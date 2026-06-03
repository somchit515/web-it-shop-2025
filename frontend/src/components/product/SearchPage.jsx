import React, { useMemo, useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { useSearchParams, Link } from "react-router-dom";
import { useGetProductsQuery } from "../redux/api/productsApi";
import { useGetFlashDealQuery } from "../redux/api/flashDealApi";
import ProductItem from "./ProductItem";
import MetaData from "../layout/MetaData";
import Loader from "../layout/Loader";
import useCategories from "../../utils/useCategories";

const SORT_OPTS = [
  { value: "",           label: "ຄ່າເລີ່ມຕົ້ນ" },
  { value: "price_asc",  label: "💰 ລາຄາ: ຕ່ຳ → ສູງ" },
  { value: "price_desc", label: "💎 ລາຄາ: ສູງ → ຕ່ຳ" },
  { value: "rating",     label: "⭐ ຄະແນນດີສຸດ" },
  { value: "newest",     label: "🆕 ໃໝ່ສຸດ" },
];

const fmtLAK = (v) =>
  v ? new Intl.NumberFormat("lo-LA").format(Number(v)) : "";

const CSS = `
  .sp-root{background:#f1f5f9;min-height:100vh;font-family:"Noto Sans Lao","Inter",sans-serif;padding-bottom:56px;}

  /* Hero */
  .sp-hero{background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 60%,#a855f7 100%);padding:32px 24px 28px;color:#fff;position:relative;overflow:hidden;}
  .sp-hero::before{content:"";position:absolute;inset:0;background:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Ccircle cx='30' cy='30' r='20'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");}
  .sp-hero-inner{max-width:1400px;margin:0 auto;position:relative;}
  .sp-hero-row{display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:12px;}
  .sp-q{font-size:1.7rem;font-weight:800;margin:0 0 6px;line-height:1.2;}
  .sp-q em{font-style:normal;color:#fde68a;}
  .sp-sub{font-size:.88rem;opacity:.75;margin:0;}
  .sp-hero-badge{background:rgba(255,255,255,.15);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.25);border-radius:50px;padding:6px 16px;font-size:.82rem;font-weight:600;white-space:nowrap;}

  /* Layout */
  .sp-layout{max-width:1400px;margin:24px auto 0;padding:0 20px;display:grid;grid-template-columns:256px 1fr;gap:24px;align-items:start;}

  /* Sidebar */
  .sp-sidebar{background:#fff;border-radius:20px;border:1px solid #e2e8f0;box-shadow:0 4px 16px rgba(0,0,0,.06);overflow:hidden;position:sticky;top:88px;}
  .sp-sidebar-head{padding:16px 18px;background:linear-gradient(135deg,#f8faff,#f0f4ff);border-bottom:1px solid #e8edf5;display:flex;justify-content:space-between;align-items:center;}
  .sp-sidebar-title{font-size:.92rem;font-weight:700;color:#1e293b;display:flex;align-items:center;gap:6px;}
  .sp-clear-btn{font-size:.72rem;color:#4f46e5;background:#ede9fe;border:none;cursor:pointer;font-family:inherit;font-weight:700;padding:4px 10px;border-radius:20px;transition:background .15s;}
  .sp-clear-btn:hover{background:#ddd6fe;}
  .sp-filter-section{padding:16px 18px;border-bottom:1px solid #f1f5f9;}
  .sp-filter-title{font-size:.7rem;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;margin-bottom:10px;}
  .sp-cat-list{display:flex;flex-direction:column;gap:2px;max-height:220px;overflow-y:auto;}
  .sp-cat-list::-webkit-scrollbar{width:4px;} .sp-cat-list::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:4px;}
  .sp-cat-btn{text-align:left;padding:7px 10px;border-radius:8px;border:none;background:none;font-size:.82rem;color:#475569;cursor:pointer;font-family:inherit;transition:all .15s;font-weight:500;display:flex;align-items:center;gap:6px;}
  .sp-cat-btn:hover{background:#f1f5f9;color:#4f46e5;}
  .sp-cat-btn.active{background:#ede9fe;color:#4f46e5;font-weight:700;}
  .sp-cat-btn.active::before{content:"✓";font-size:.75rem;}
  .sp-price-row{display:flex;gap:8px;align-items:center;}
  .sp-price-input{flex:1;padding:9px 10px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:.82rem;font-family:inherit;outline:none;transition:border-color .15s;min-width:0;}
  .sp-price-input:focus{border-color:#4f46e5;box-shadow:0 0 0 3px rgba(79,70,229,.08);}
  .sp-price-sep{color:#94a3b8;font-size:.8rem;flex-shrink:0;}
  .sp-price-hint{font-size:.7rem;color:#94a3b8;margin-top:6px;}
  .sp-apply-btn{width:calc(100% - 36px);margin:10px 18px 0;padding:10px;border-radius:10px;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;border:none;font-size:.85rem;font-weight:700;cursor:pointer;font-family:inherit;transition:opacity .15s;}
  .sp-apply-btn:hover{opacity:.9;}
  .sp-rating-list{display:flex;flex-direction:column;gap:3px;}
  .sp-rating-btn{text-align:left;padding:7px 10px;border-radius:8px;border:none;background:none;font-size:.84rem;color:#475569;cursor:pointer;font-family:inherit;transition:all .15s;}
  .sp-rating-btn:hover{background:#fefce8;}
  .sp-rating-btn.active{background:#fef3c7;color:#d97706;font-weight:700;}

  /* Active filter chips */
  .sp-chips{display:flex;flex-wrap:wrap;gap:6px;padding:0 0 16px;}
  .sp-chip{display:inline-flex;align-items:center;gap:5px;background:#ede9fe;color:#4f46e5;border-radius:50px;padding:4px 12px;font-size:.75rem;font-weight:700;}
  .sp-chip-x{background:none;border:none;cursor:pointer;color:#7c3aed;font-size:.8rem;padding:0;line-height:1;}

  /* Main */
  .sp-toolbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;gap:12px;flex-wrap:wrap;}
  .sp-count{font-size:.85rem;color:#64748b;} .sp-count strong{color:#1e293b;}
  .sp-sort-wrap{display:flex;align-items:center;gap:8px;}
  .sp-sort-label{font-size:.78rem;color:#94a3b8;white-space:nowrap;}
  .sp-sort{padding:8px 12px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:.82rem;font-family:inherit;background:#fff;color:#374151;cursor:pointer;outline:none;transition:border-color .15s;}
  .sp-sort:focus{border-color:#4f46e5;}
  .sp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;}
  .sp-pager{display:flex;align-items:center;justify-content:center;gap:6px;margin:28px 0 0;flex-wrap:wrap;}
  .sp-pager-btn{padding:8px 20px;border-radius:999px;border:1.5px solid #e2e8f0;background:#fff;font-size:.82rem;font-weight:600;cursor:pointer;transition:all .18s;font-family:inherit;color:#374151;}
  .sp-pager-btn:hover:not(:disabled){border-color:#4f46e5;color:#4f46e5;background:#f5f3ff;}
  .sp-pager-btn:disabled{opacity:.35;cursor:not-allowed;}
  .sp-pager-num{width:36px;height:36px;border-radius:50%;border:1.5px solid #e2e8f0;background:#fff;font-size:.82rem;font-weight:600;cursor:pointer;transition:all .18s;display:inline-flex;align-items:center;justify-content:center;color:#374151;}
  .sp-pager-num:hover{border-color:#4f46e5;color:#4f46e5;}
  .sp-pager-num.active{background:#4f46e5;color:#fff;border-color:#4f46e5;box-shadow:0 2px 8px rgba(79,70,229,.3);}
  .sp-pager-dots{color:#94a3b8;font-size:.9rem;}
  .sp-empty{text-align:center;padding:72px 24px;background:#fff;border-radius:20px;border:1px solid #e2e8f0;}
  .sp-empty-icon{font-size:4rem;display:block;margin-bottom:16px;}
  .sp-empty-title{font-size:1.1rem;font-weight:700;color:#1e293b;margin-bottom:8px;}
  .sp-empty-sub{font-size:.88rem;color:#64748b;margin-bottom:20px;}
  .sp-empty-btn{background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;border:none;border-radius:50px;padding:10px 24px;font-size:.85rem;font-weight:700;cursor:pointer;font-family:inherit;}

  /* Mobile toggle */
  .sp-filter-toggle{display:none;width:100%;padding:11px;border-radius:12px;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;border:none;font-size:.88rem;font-weight:700;cursor:pointer;font-family:inherit;margin-bottom:16px;}

  @media(max-width:900px){
    .sp-layout{grid-template-columns:1fr;padding:0 12px;}
    .sp-sidebar{position:static;display:none;}
    .sp-sidebar.open{display:block;}
    .sp-filter-toggle{display:block;}
  }
`;

function buildPages(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current]);
  if (current > 1) pages.add(current - 1);
  if (current < total) pages.add(current + 1);
  return [...pages].sort((a, b) => a - b);
}

export default function SearchPage() {
  // eslint-disable-next-line no-unused-vars
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get("keyword") || "";

  const [page,       setPage]       = useState(1);
  const [sort,       setSort]       = useState("");
  const [selCat,     setSelCat]     = useState("");
  const [minPrice,   setMinPrice]   = useState("");
  const [maxPrice,   setMaxPrice]   = useState("");
  const [selRating,  setSelRating]  = useState("");
  const [pendingMin, setPendingMin] = useState("");
  const [pendingMax, setPendingMax] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { setPage(1); }, [keyword, selCat, sort, selRating, minPrice, maxPrice]);

  const queryParams = { keyword, page, sort };
  if (selCat)    queryParams.category = selCat;
  if (minPrice)  queryParams.min = minPrice;
  if (maxPrice)  queryParams.max = maxPrice;
  if (selRating) queryParams.rating = selRating;

  const { data, isLoading } = useGetProductsQuery(queryParams);
  const { data: flashData }  = useGetFlashDealQuery();
  const categories = useCategories();

  const flashDealMap = useMemo(() => {
    const deal = flashData?.deal;
    if (!deal?.isActive || !deal?.discountPercent || !deal?.products?.length) return {};
    if (deal.endsAt && new Date(deal.endsAt) < new Date()) return {};
    const map = {};
    deal.products.forEach((p) => { map[p._id || p] = deal.discountPercent; });
    return map;
  }, [flashData]);

  const products       = data?.products || [];
  const total          = data?.filteredProductsCount || 0;
  const resPerPage     = data?.resPerPage || 8;
  const totalPages     = Math.ceil(total / resPerPage);
  const pageNums       = buildPages(page, totalPages);

  const applyPrice = () => { setMinPrice(pendingMin); setMaxPrice(pendingMax); };

  const clearFilters = () => {
    setSelCat(""); setMinPrice(""); setMaxPrice("");
    setSelRating(""); setSort(""); setPendingMin(""); setPendingMax("");
  };

  const hasFilters = selCat || minPrice || maxPrice || selRating || sort;

  /* active chips */
  const chips = [];
  if (selCat)   chips.push({ key: "cat",    label: `ໝວດ: ${selCat}`,                     clear: () => setSelCat("") });
  if (minPrice) chips.push({ key: "min",    label: `ຕ່ຳສຸດ: ₭${fmtLAK(minPrice)}`,       clear: () => setMinPrice("") });
  if (maxPrice) chips.push({ key: "max",    label: `ສູງສຸດ: ₭${fmtLAK(maxPrice)}`,       clear: () => setMaxPrice("") });
  if (selRating)chips.push({ key: "rating", label: `⭐ ${selRating}+ ດາວ`,               clear: () => setSelRating("") });
  if (sort)     chips.push({ key: "sort",   label: SORT_OPTS.find(o=>o.value===sort)?.label, clear: () => setSort("") });

  return (
    <>
      <MetaData title={`ຄົ້ນຫາ: ${keyword || "ທຸກສິນຄ້າ"} — IT HUBB`} />
      <style>{CSS}</style>
      <div className="sp-root">

        {/* Hero */}
        <div className="sp-hero">
          <div className="sp-hero-inner">
            <div className="sp-hero-row">
              <div>
                <div className="sp-q">
                  {keyword ? <>ຜົນຄົ້ນຫາ: <em>"{keyword}"</em></> : "🛍️ ທຸກສິນຄ້າ"}
                </div>
                <p className="sp-sub">
                  {isLoading ? "ກຳລັງຄົ້ນຫາ..." : `ພົບ ${total.toLocaleString()} ລາຍການ`}
                </p>
              </div>
              {!isLoading && total > 0 && (
                <div className="sp-hero-badge">📦 {total.toLocaleString()} ສິນຄ້າ</div>
              )}
            </div>
          </div>
        </div>

        <div className="sp-layout">
          {/* Mobile toggle */}
          <button className="sp-filter-toggle" onClick={() => setSidebarOpen(o => !o)}>
            {sidebarOpen ? "✕ ປິດ Filter" : "⚙️ ເປີດ Filter"}{hasFilters ? ` (${chips.length})` : ""}
          </button>

          {/* Sidebar */}
          <aside className={`sp-sidebar ${sidebarOpen ? "open" : ""}`}>
            <div className="sp-sidebar-head">
              <span className="sp-sidebar-title">⚙️ ກັ່ນຕອງ</span>
              {hasFilters && <button className="sp-clear-btn" onClick={clearFilters}>ລ້າງທັງໝົດ</button>}
            </div>

            {/* Category */}
            <div className="sp-filter-section">
              <div className="sp-filter-title">ໝວດສິນຄ້າ</div>
              <div className="sp-cat-list">
                <button className={`sp-cat-btn ${!selCat ? "active" : ""}`} onClick={() => setSelCat("")}>
                  🗂️ ທັງໝົດ
                </button>
                {categories.slice(0, 12).map((c) => (
                  <button key={c.key} className={`sp-cat-btn ${selCat === c.key ? "active" : ""}`}
                    onClick={() => setSelCat(c.key)}>
                    {c.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="sp-filter-section">
              <div className="sp-filter-title">ລາຄາ (₭ ກີບ)</div>
              <div className="sp-price-row">
                <input className="sp-price-input" type="number" placeholder="ຕ່ຳສຸດ"
                  value={pendingMin} onChange={(e) => setPendingMin(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applyPrice()} />
                <span className="sp-price-sep">—</span>
                <input className="sp-price-input" type="number" placeholder="ສູງສຸດ"
                  value={pendingMax} onChange={(e) => setPendingMax(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applyPrice()} />
              </div>
              {(pendingMin || pendingMax) && (
                <div className="sp-price-hint">
                  {pendingMin && `ຕ່ຳສຸດ: ₭${fmtLAK(pendingMin)}`}
                  {pendingMin && pendingMax && " — "}
                  {pendingMax && `ສູງສຸດ: ₭${fmtLAK(pendingMax)}`}
                </div>
              )}
              <button className="sp-apply-btn" onClick={applyPrice}>ນຳໃຊ້ລາຄາ</button>
            </div>

            {/* Rating */}
            <div className="sp-filter-section">
              <div className="sp-filter-title">ຄະແນນ</div>
              <div className="sp-rating-list">
                {[
                  { val: "",  label: "🌟 ທຸກຄະແນນ" },
                  { val: "4", label: "⭐⭐⭐⭐ 4+ ດາວ" },
                  { val: "3", label: "⭐⭐⭐ 3+ ດາວ" },
                  { val: "2", label: "⭐⭐ 2+ ດາວ" },
                ].map(({ val, label }) => (
                  <button key={val} className={`sp-rating-btn ${selRating === val ? "active" : ""}`}
                    onClick={() => setSelRating(val)}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Results */}
          <div>
            {/* Active filter chips */}
            {chips.length > 0 && (
              <div className="sp-chips">
                {chips.map((c) => (
                  <span key={c.key} className="sp-chip">
                    {c.label}
                    <button className="sp-chip-x" onClick={c.clear}>✕</button>
                  </span>
                ))}
              </div>
            )}

            <div className="sp-toolbar">
              <span className="sp-count">
                {isLoading ? "ກຳລັງໂຫຼດ..." : <>ສະແດງ <strong>{products.length}</strong> / <strong>{total}</strong> ລາຍການ</>}
              </span>
              <div className="sp-sort-wrap">
                <span className="sp-sort-label">ຈັດຮຽງ:</span>
                <select className="sp-sort" value={sort} onChange={(e) => setSort(e.target.value)}>
                  {SORT_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            {isLoading ? <Loader /> : products.length === 0 ? (
              <div className="sp-empty">
                <span className="sp-empty-icon">🔍</span>
                <div className="sp-empty-title">ບໍ່ພົບສິນຄ້າ</div>
                <div className="sp-empty-sub">
                  {keyword ? `ບໍ່ພົບ "${keyword}"${selCat ? ` ໃນໝວດ ${selCat}` : ""}` : "ລອງປ່ຽນ filter ໃໝ່"}
                </div>
                {hasFilters && <button className="sp-empty-btn" onClick={clearFilters}>ລ້າງ filter ທັງໝົດ</button>}
              </div>
            ) : (
              <div className="sp-grid">
                {products.map((p) => (
                  <ProductItem key={p._id} product={p} columnSize="auto"
                    flashDiscount={flashDealMap[p._id] || 0} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="sp-pager">
                <button className="sp-pager-btn" disabled={page <= 1}
                  onClick={() => setPage((v) => v - 1)}>← ກ່ອນ</button>

                {pageNums.map((num, i) => {
                  const prev = pageNums[i - 1];
                  return (
                    <React.Fragment key={num}>
                      {prev && num - prev > 1 && <span className="sp-pager-dots">…</span>}
                      <button className={`sp-pager-num ${page === num ? "active" : ""}`}
                        onClick={() => setPage(num)}>{num}</button>
                    </React.Fragment>
                  );
                })}

                <button className="sp-pager-btn" disabled={page >= totalPages}
                  onClick={() => setPage((v) => v + 1)}>ຕໍ່ →</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
