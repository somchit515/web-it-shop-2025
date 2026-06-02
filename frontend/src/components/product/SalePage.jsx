import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useGetProductsQuery } from "../redux/api/productsApi";
import { useGetFlashDealQuery } from "../redux/api/flashDealApi";
import ProductItem from "./ProductItem";
import MetaData from "../layout/MetaData";
import Loader from "../layout/Loader";

const CSS = `
  .sl-root{background:#f1f5f9;min-height:100vh;font-family:"Noto Sans Lao","Inter",sans-serif;padding-bottom:56px;}
  .sl-hero{background:linear-gradient(135deg,#e11d48 0%,#f43f5e 50%,#fb7185 100%);padding:36px 24px 28px;color:#fff;position:relative;overflow:hidden;}
  .sl-hero::after{content:'';position:absolute;right:-60px;top:-60px;width:220px;height:220px;border-radius:50%;background:rgba(255,255,255,.07);pointer-events:none;}
  .sl-hero-inner{max-width:1400px;margin:0 auto;position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;}
  .sl-hero-left .sl-eyebrow{font-size:.72rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;opacity:.75;margin-bottom:6px;}
  .sl-hero-left .sl-title{font-size:1.9rem;font-weight:800;margin:0 0 4px;}
  .sl-hero-left .sl-sub{font-size:.88rem;opacity:.75;}
  .sl-flash-badge{background:rgba(255,255,255,.2);border:1.5px solid rgba(255,255,255,.4);border-radius:16px;padding:12px 20px;text-align:center;backdrop-filter:blur(6px);}
  .sl-flash-pct{font-size:2rem;font-weight:900;display:block;line-height:1;}
  .sl-flash-lbl{font-size:.7rem;opacity:.8;margin-top:2px;}
  .sl-toolbar{max-width:1400px;margin:20px auto 16px;padding:0 20px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;}
  .sl-tabs{display:flex;gap:6px;}
  .sl-tab{padding:6px 14px;border-radius:999px;border:1.5px solid #e2e8f0;background:#fff;color:#64748b;font-size:.78rem;font-weight:700;cursor:pointer;transition:all .18s;font-family:inherit;}
  .sl-tab.active{background:#e11d48;color:#fff;border-color:#e11d48;}
  .sl-sort{padding:8px 12px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:.82rem;font-family:inherit;background:#fff;color:#374151;cursor:pointer;outline:none;}
  .sl-sort:focus{border-color:#e11d48;}
  .sl-grid-wrap{max-width:1400px;margin:0 auto;padding:0 20px;}
  .sl-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:20px;}
  .sl-pager{display:flex;align-items:center;justify-content:center;gap:8px;margin:28px 0 0;flex-wrap:wrap;}
  .sl-pager-btn{padding:7px 18px;border-radius:999px;border:1.5px solid #e2e8f0;background:#fff;color:#374151;font-size:.82rem;font-weight:600;cursor:pointer;transition:all .18s;font-family:inherit;}
  .sl-pager-btn:hover:not(:disabled){border-color:#e11d48;color:#e11d48;}
  .sl-pager-btn:disabled{opacity:.4;cursor:not-allowed;}
  .sl-pager-num{width:36px;height:36px;border-radius:50%;border:1.5px solid #e2e8f0;background:#fff;color:#374151;font-size:.82rem;font-weight:600;cursor:pointer;transition:all .18s;display:inline-flex;align-items:center;justify-content:center;}
  .sl-pager-num.active{background:#e11d48;color:#fff;border-color:#e11d48;}
  .sl-empty{text-align:center;padding:80px 24px;color:#94a3b8;}
  .sl-empty-icon{font-size:4rem;display:block;margin-bottom:16px;opacity:.4;}
  @media(max-width:600px){.sl-title{font-size:1.4rem;}.sl-grid{grid-template-columns:repeat(2,1fr);gap:12px;}.sl-toolbar,.sl-grid-wrap{padding:0 12px;}}
`;

export default function SalePage() {
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState("all"); // all | sale | flash

  const { data, isLoading } = useGetProductsQuery({ onSale: "true", page });
  const { data: flashData } = useGetFlashDealQuery();

  const flashDeal = flashData?.deal;
  const flashActive = flashDeal?.isActive && flashDeal?.discountPercent &&
    (!flashDeal.endsAt || new Date(flashDeal.endsAt) > new Date());

  const flashDealMap = useMemo(() => {
    if (!flashActive || !flashDeal?.products?.length) return {};
    const map = {};
    flashDeal.products.forEach((p) => { map[p._id || p] = flashDeal.discountPercent; });
    return map;
  }, [flashData, flashActive]);

  const { data: flashProductsData } = useGetProductsQuery({}, { skip: !flashActive });
  const flashProducts = useMemo(() => {
    if (!flashActive) return [];
    return (flashProductsData?.products || []).filter((p) => flashDealMap[p._id]);
  }, [flashProductsData, flashDealMap, flashActive]);

  const saleProducts = data?.products || [];
  const total = data?.filteredProductsCount || 0;
  const resPerPage = data?.resPerPage || 8;
  const totalPages = Math.ceil(total / resPerPage);

  const displayProducts = tab === "flash" ? flashProducts : tab === "sale" ? saleProducts : [...saleProducts, ...flashProducts.filter((fp) => !saleProducts.find((sp) => sp._id === fp._id))];

  return (
    <>
      <MetaData title="ສິນຄ້າລາຄາພິເສດ — IT HUBB" />
      <style>{CSS}</style>
      <div className="sl-root">
        <div className="sl-hero">
          <div className="sl-hero-inner">
            <div className="sl-hero-left">
              <div className="sl-eyebrow">🏷️ Special Deals</div>
              <div className="sl-title">ສິນຄ້າລາຄາພິເສດ</div>
              <div className="sl-sub">ສ່ວນຫຼຸດ ແລະ Flash Deal ທັງໝົດ</div>
            </div>
            {flashActive && (
              <div className="sl-flash-badge">
                <span className="sl-flash-pct">⚡ -{flashDeal.discountPercent}%</span>
                <div className="sl-flash-lbl">Flash Deal ກຳລັງດຳເນີນ</div>
              </div>
            )}
          </div>
        </div>

        {isLoading ? <Loader /> : (
          <>
            <div className="sl-toolbar">
              <div className="sl-tabs">
                <button className={`sl-tab ${tab === "all" ? "active" : ""}`} onClick={() => setTab("all")}>ທັງໝົດ</button>
                <button className={`sl-tab ${tab === "sale" ? "active" : ""}`} onClick={() => setTab("sale")}>🏷️ ສ່ວນຫຼຸດ ({total})</button>
                {flashActive && (
                  <button className={`sl-tab ${tab === "flash" ? "active" : ""}`} onClick={() => setTab("flash")}>⚡ Flash Deal ({flashProducts.length})</button>
                )}
              </div>
              <select className="sl-sort">
                <option>ສ່ວນຫຼຸດຫຼາຍ → ໜ້ອຍ</option>
              </select>
            </div>

            <div className="sl-grid-wrap">
              {displayProducts.length === 0 ? (
                <div className="sl-empty">
                  <span className="sl-empty-icon">🏷️</span>
                  <p>ບໍ່ມີສິນຄ້າລາຄາພິເສດໃນຂະນະນີ້</p>
                  <Link to="/" style={{ color: "#e11d48" }}>← ໜ້າຫຼັກ</Link>
                </div>
              ) : (
                <div className="sl-grid">
                  {displayProducts.map((p) => (
                    <ProductItem key={p._id} product={p} columnSize="auto" flashDiscount={flashDealMap[p._id] || 0} />
                  ))}
                </div>
              )}
            </div>

            {tab === "sale" && totalPages > 1 && (
              <div className="sl-pager">
                <button className="sl-pager-btn" disabled={page <= 1} onClick={() => setPage((v) => v - 1)}>← ກ່ອນ</button>
                {[...Array(Math.min(totalPages, 7))].map((_, i) => {
                  const p = i + 1;
                  return <button key={p} className={`sl-pager-num ${page === p ? "active" : ""}`} onClick={() => setPage(p)}>{p}</button>;
                })}
                <button className="sl-pager-btn" disabled={page >= totalPages} onClick={() => setPage((v) => v + 1)}>ຕໍ່ →</button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
