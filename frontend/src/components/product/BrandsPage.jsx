import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useGetProductBrandsQuery, useGetProductsQuery } from "../redux/api/productsApi";
import { useGetFlashDealQuery } from "../redux/api/flashDealApi";
import ProductItem from "./ProductItem";
import MetaData from "../layout/MetaData";
import Loader from "../layout/Loader";
import { useMemo } from "react";

const CSS = `
  .br-root{background:#f1f5f9;min-height:100vh;font-family:"Noto Sans Lao","Inter",sans-serif;padding-bottom:56px;}
  .br-hero{background:linear-gradient(135deg,#7c3aed 0%,#6d28d9 50%,#5b21b6 100%);padding:36px 24px 28px;color:#fff;position:relative;overflow:hidden;}
  .br-hero::after{content:'';position:absolute;right:-60px;top:-60px;width:220px;height:220px;border-radius:50%;background:rgba(255,255,255,.07);pointer-events:none;}
  .br-hero-inner{max-width:1400px;margin:0 auto;position:relative;z-index:1;}
  .br-eyebrow{font-size:.72rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;opacity:.75;margin-bottom:6px;}
  .br-title{font-size:1.9rem;font-weight:800;margin:0 0 4px;}
  .br-sub{font-size:.88rem;opacity:.75;}
  .br-grid-wrap{max-width:1400px;margin:24px auto 0;padding:0 20px;}
  .br-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:16px;}
  .br-card{background:#fff;border-radius:16px;border:1px solid #e2e8f0;box-shadow:0 2px 8px rgba(0,0,0,.05);padding:20px 16px;text-align:center;text-decoration:none;transition:all .2s;display:flex;flex-direction:column;align-items:center;gap:8px;}
  .br-card:hover{transform:translateY(-4px);box-shadow:0 8px 24px rgba(109,40,217,.15);border-color:#c4b5fd;}
  .br-card-icon{width:56px;height:56px;background:linear-gradient(135deg,#ede9fe,#ddd6fe);border-radius:14px;display:grid;place-items:center;font-size:1.5rem;}
  .br-card-name{font-size:.88rem;font-weight:700;color:#1e293b;}
  .br-card-count{font-size:.72rem;color:#94a3b8;}
  .br-card-rating{font-size:.72rem;color:#f59e0b;font-weight:600;}
  .br-prod-wrap{max-width:1400px;margin:0 auto;padding:0 20px;}
  .br-prod-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:20px;}
  .br-back{display:inline-flex;align-items:center;gap:6px;margin-bottom:16px;color:#7c3aed;text-decoration:none;font-weight:600;font-size:.85rem;}
  .br-back:hover{opacity:.8;}
  .br-brand-title{font-size:1.2rem;font-weight:800;color:#1e293b;margin-bottom:4px;}
  .br-brand-sub{font-size:.82rem;color:#64748b;margin-bottom:20px;}
  @media(max-width:600px){.br-title{font-size:1.4rem;}.br-grid{grid-template-columns:repeat(2,1fr);}.br-prod-grid{grid-template-columns:repeat(2,1fr);gap:12px;}.br-grid-wrap,.br-prod-wrap{padding:0 12px;}}
`;

function BrandList() {
  const { data, isLoading } = useGetProductBrandsQuery();
  const brands = data?.brands || [];

  if (isLoading) return <Loader />;

  return (
    <>
      <MetaData title="ທຸກ Brand — IT HUBB" />
      <div className="br-hero">
        <div className="br-hero-inner">
          <div className="br-eyebrow">🏷️ Brands</div>
          <div className="br-title">ຜູ້ຈຳໜ່າຍ / Brand ທັງໝົດ</div>
          <div className="br-sub">{brands.length} Brand ໃນລະບົບ</div>
        </div>
      </div>
      <div className="br-grid-wrap">
        <div className="br-grid">
          {brands.map((b) => (
            <Link key={b.seller} to={`/brand/${encodeURIComponent(b.seller)}`} className="br-card">
              <div className="br-card-icon">🏪</div>
              <div className="br-card-name">{b.seller}</div>
              <div className="br-card-count">{b.count} ສິນຄ້າ</div>
              {b.avgRating > 0 && (
                <div className="br-card-rating">⭐ {b.avgRating.toFixed(1)}</div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

function BrandProducts({ brandName }) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetProductsQuery({ brand: brandName, page });
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

  if (isLoading) return <Loader />;

  return (
    <>
      <MetaData title={`${brandName} — IT HUBB`} />
      <div className="br-hero">
        <div className="br-hero-inner">
          <div className="br-eyebrow">🏪 Brand</div>
          <div className="br-title">{brandName}</div>
          <div className="br-sub">{total} ສິນຄ້າ</div>
        </div>
      </div>
      <div className="br-prod-wrap" style={{ marginTop: 24 }}>
        <Link to="/brands" className="br-back">← ທຸກ Brand</Link>
        {products.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 24px", color: "#94a3b8" }}>
            <div style={{ fontSize: "3rem", marginBottom: 12 }}>📦</div>
            <p>ບໍ່ມີສິນຄ້າຈາກ {brandName}</p>
          </div>
        ) : (
          <>
            <div className="br-prod-grid">
              {products.map((p) => (
                <ProductItem key={p._id} product={p} columnSize="auto" flashDiscount={flashDealMap[p._id] || 0} />
              ))}
            </div>
            {totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24, flexWrap: "wrap" }}>
                <button style={{ padding: "7px 18px", borderRadius: 999, border: "1.5px solid #e2e8f0", background: "#fff", cursor: "pointer", fontFamily: "inherit" }}
                  disabled={page <= 1} onClick={() => setPage((v) => v - 1)}>← ກ່ອນ</button>
                {[...Array(Math.min(totalPages, 7))].map((_, i) => (
                  <button key={i + 1}
                    style={{ width: 36, height: 36, borderRadius: "50%", border: "1.5px solid #e2e8f0", background: page === i + 1 ? "#7c3aed" : "#fff", color: page === i + 1 ? "#fff" : "#374151", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}
                    onClick={() => setPage(i + 1)}>{i + 1}</button>
                ))}
                <button style={{ padding: "7px 18px", borderRadius: 999, border: "1.5px solid #e2e8f0", background: "#fff", cursor: "pointer", fontFamily: "inherit" }}
                  disabled={page >= totalPages} onClick={() => setPage((v) => v + 1)}>ຕໍ່ →</button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default function BrandsPage() {
  const { brandName } = useParams();
  return (
    <>
      <style>{CSS}</style>
      <div className="br-root">
        {brandName ? <BrandProducts brandName={decodeURIComponent(brandName)} /> : <BrandList />}
      </div>
    </>
  );
}
