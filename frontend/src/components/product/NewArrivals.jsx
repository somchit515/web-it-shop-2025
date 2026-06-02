import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useGetProductsQuery } from "../redux/api/productsApi";
import { useGetFlashDealQuery } from "../redux/api/flashDealApi";
import ProductItem from "./ProductItem";
import MetaData from "../layout/MetaData";
import Loader from "../layout/Loader";

const CSS = `
  .na-root { background:#f1f5f9;min-height:100vh;font-family:"Noto Sans Lao","Inter",sans-serif;padding-bottom:56px; }
  .na-hero {
    background:linear-gradient(135deg,#0ea5e9 0%,#0284c7 50%,#0369a1 100%);
    padding:36px 24px 28px;color:#fff;position:relative;overflow:hidden;
  }
  .na-hero::after{content:'';position:absolute;right:-60px;top:-60px;width:220px;height:220px;border-radius:50%;background:rgba(255,255,255,.07);pointer-events:none;}
  .na-hero-inner{max-width:1400px;margin:0 auto;position:relative;z-index:1;}
  .na-eyebrow{font-size:.72rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;opacity:.75;margin-bottom:6px;}
  .na-title{font-size:1.9rem;font-weight:800;margin:0 0 4px;}
  .na-sub{font-size:.88rem;opacity:.75;}
  .na-toolbar{max-width:1400px;margin:20px auto 16px;padding:0 20px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;}
  .na-count{font-size:.85rem;color:#64748b;}.na-count strong{color:#1e293b;}
  .na-sort{padding:8px 12px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:.82rem;font-family:inherit;background:#fff;color:#374151;cursor:pointer;outline:none;}
  .na-sort:focus{border-color:#0ea5e9;}
  .na-grid-wrap{max-width:1400px;margin:0 auto;padding:0 20px;}
  .na-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:20px;}
  .na-pager{display:flex;align-items:center;justify-content:center;gap:8px;margin:28px 0 0;flex-wrap:wrap;}
  .na-pager-btn{padding:7px 18px;border-radius:999px;border:1.5px solid #e2e8f0;background:#fff;color:#374151;font-size:.82rem;font-weight:600;cursor:pointer;transition:all .18s;font-family:inherit;}
  .na-pager-btn:hover:not(:disabled){border-color:#0ea5e9;color:#0ea5e9;}
  .na-pager-btn:disabled{opacity:.4;cursor:not-allowed;}
  .na-pager-num{width:36px;height:36px;border-radius:50%;border:1.5px solid #e2e8f0;background:#fff;color:#374151;font-size:.82rem;font-weight:600;cursor:pointer;transition:all .18s;display:inline-flex;align-items:center;justify-content:center;}
  .na-pager-num.active{background:#0ea5e9;color:#fff;border-color:#0ea5e9;}
  .na-empty{text-align:center;padding:80px 24px;color:#94a3b8;}
  .na-empty-icon{font-size:4rem;display:block;margin-bottom:16px;opacity:.4;}
  @media(max-width:600px){.na-title{font-size:1.4rem;}.na-grid{grid-template-columns:repeat(2,1fr);gap:12px;}.na-toolbar,.na-grid-wrap{padding:0 12px;}}
`;

export default function NewArrivals() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetProductsQuery({ sort: "newest", page });
  const { data: flashData } = useGetFlashDealQuery();

  const flashDealMap = useMemo(() => {
    const deal = flashData?.deal;
    if (!deal?.isActive || !deal?.discountPercent || !deal?.products?.length) return {};
    if (deal.endsAt && new Date(deal.endsAt) < new Date()) return {};
    const map = {};
    deal.products.forEach((p) => { map[p._id || p] = deal.discountPercent; });
    return map;
  }, [flashData]);

  const products = data?.products || [];
  const total = data?.filteredProductsCount || 0;
  const resPerPage = data?.resPerPage || 8;
  const totalPages = Math.ceil(total / resPerPage);

  const sevenDaysAgo = Date.now() - 7 * 86400000;
  const newProducts = products.filter((p) => new Date(p.createdAt).getTime() > sevenDaysAgo);

  return (
    <>
      <MetaData title="ສິນຄ້າໃໝ່ — IT HUBB" />
      <style>{CSS}</style>
      <div className="na-root">
        <div className="na-hero">
          <div className="na-hero-inner">
            <div className="na-eyebrow">🆕 New Arrivals</div>
            <div className="na-title">ສິນຄ້າໃໝ່ລ່າສຸດ</div>
            <div className="na-sub">
              {!isLoading && `ພົບ ${total.toLocaleString()} ລາຍການ · ໃໝ່ 7 ວັນ: ${newProducts.length} ລາຍການ`}
            </div>
          </div>
        </div>

        {isLoading ? <Loader /> : (
          <>
            <div className="na-toolbar">
              <span className="na-count">ໜ້າ <strong>{page}</strong> / {totalPages} · <strong>{total}</strong> ລາຍການ</span>
            </div>

            <div className="na-grid-wrap">
              {products.length === 0 ? (
                <div className="na-empty">
                  <span className="na-empty-icon">📦</span>
                  <p>ບໍ່ມີສິນຄ້າ</p>
                  <Link to="/" style={{ color: "#0ea5e9" }}>← ໜ້າຫຼັກ</Link>
                </div>
              ) : (
                <div className="na-grid">
                  {products.map((p) => (
                    <ProductItem key={p._id} product={p} columnSize="auto" flashDiscount={flashDealMap[p._id] || 0} />
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="na-pager">
                <button className="na-pager-btn" disabled={page <= 1} onClick={() => setPage((v) => v - 1)}>← ກ່ອນ</button>
                {[...Array(Math.min(totalPages, 7))].map((_, i) => {
                  const p = i + 1;
                  return <button key={p} className={`na-pager-num ${page === p ? "active" : ""}`} onClick={() => setPage(p)}>{p}</button>;
                })}
                <button className="na-pager-btn" disabled={page >= totalPages} onClick={() => setPage((v) => v + 1)}>ຕໍ່ →</button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
