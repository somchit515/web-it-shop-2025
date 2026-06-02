import React, { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useGetFlashDealQuery } from "../redux/api/flashDealApi";
import { useGetProductsQuery } from "../redux/api/productsApi";
import ProductItem from "./ProductItem";
import MetaData from "../layout/MetaData";
import Loader from "../layout/Loader";

const fmt = (n) => String(n).padStart(2, "0");

function useCountdown(endsAt) {
  const get = () => {
    if (!endsAt) return { h: 0, m: 0, s: 0, expired: true };
    const diff = Math.max(0, Math.floor((new Date(endsAt) - Date.now()) / 1000));
    return { h: Math.floor(diff / 3600), m: Math.floor((diff % 3600) / 60), s: diff % 60, expired: diff <= 0 };
  };
  const [t, setT] = useState(get);
  useEffect(() => {
    const id = setInterval(() => setT(get()), 1000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endsAt]);
  return t;
}

const CSS = `
  .fd-root{background:#0f0c29;min-height:100vh;font-family:"Noto Sans Lao","Inter",sans-serif;padding-bottom:56px;}
  .fd-hero{background:linear-gradient(135deg,#0f0c29 0%,#302b63 50%,#24243e 100%);padding:48px 24px 36px;color:#fff;text-align:center;position:relative;overflow:hidden;}
  .fd-orb{position:absolute;border-radius:50%;filter:blur(80px);opacity:.28;pointer-events:none;}
  .fd-o1{width:400px;height:400px;background:#f43f5e;top:-120px;left:-80px;}
  .fd-o2{width:300px;height:300px;background:#fbbf24;bottom:-100px;right:-60px;}
  .fd-hero-inner{position:relative;z-index:1;max-width:700px;margin:0 auto;}
  .fd-eyebrow{font-size:.75rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#fca5a5;margin-bottom:10px;}
  .fd-title{font-size:2.4rem;font-weight:900;margin:0 0 8px;line-height:1.1;}
  .fd-sub{font-size:.95rem;color:rgba(255,255,255,.7);margin-bottom:24px;}
  .fd-discount{display:inline-block;background:linear-gradient(135deg,#f43f5e,#e11d48);color:#fff;font-size:2rem;font-weight:900;padding:8px 24px;border-radius:16px;margin-bottom:20px;box-shadow:0 8px 24px rgba(244,63,94,.4);}
  .fd-timer{display:flex;justify-content:center;gap:12px;margin-bottom:12px;}
  .fd-unit{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);border-radius:12px;padding:10px 16px;text-align:center;min-width:72px;backdrop-filter:blur(6px);}
  .fd-unit-n{font-size:1.8rem;font-weight:900;line-height:1;display:block;}
  .fd-unit-l{font-size:.65rem;opacity:.65;margin-top:3px;text-transform:uppercase;letter-spacing:.06em;}
  .fd-expired{background:#fee2e2;color:#dc2626;border-radius:12px;padding:10px 20px;font-weight:700;}
  .fd-count{font-size:.85rem;color:rgba(255,255,255,.6);margin-top:6px;}
  .fd-inactive{text-align:center;padding:80px 24px;color:rgba(255,255,255,.5);}
  .fd-inactive-icon{font-size:4rem;display:block;margin-bottom:16px;opacity:.4;}
  .fd-inactive h3{color:rgba(255,255,255,.8);margin-bottom:8px;}
  .fd-grid-wrap{max-width:1400px;margin:28px auto 0;padding:0 20px;}
  .fd-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:20px;}
  @media(max-width:600px){.fd-title{font-size:1.7rem;}.fd-grid{grid-template-columns:repeat(2,1fr);gap:12px;}.fd-grid-wrap{padding:0 12px;}}
`;

export default function FlashDealPage() {
  const { data: flashData, isLoading: loadingDeal } = useGetFlashDealQuery();
  const deal = flashData?.deal;

  const isActive = deal?.isActive && deal?.discountPercent &&
    (!deal.endsAt || new Date(deal.endsAt) > new Date());

  const { h, m, s, expired } = useCountdown(deal?.endsAt);

  const flashProductIds = useMemo(() => {
    if (!deal?.products) return new Set();
    return new Set(deal.products.map((p) => p._id || p));
  }, [deal]);

  const { data: productsData, isLoading: loadingProducts } = useGetProductsQuery({}, { skip: !isActive });

  const flashProducts = useMemo(() => {
    return (productsData?.products || []).filter((p) => flashProductIds.has(p._id));
  }, [productsData, flashProductIds]);

  const flashDealMap = useMemo(() => {
    const map = {};
    if (deal?.discountPercent) {
      flashProductIds.forEach((id) => { map[id] = deal.discountPercent; });
    }
    return map;
  }, [deal, flashProductIds]);

  if (loadingDeal) return <><style>{CSS}</style><div className="fd-root"><Loader /></div></>;

  return (
    <>
      <MetaData title="⚡ Flash Deal — IT HUBB" />
      <style>{CSS}</style>
      <div className="fd-root">
        <div className="fd-hero">
          <div className="fd-orb fd-o1" /><div className="fd-orb fd-o2" />
          <div className="fd-hero-inner">
            <div className="fd-eyebrow">⚡ Limited Time Offer</div>
            <div className="fd-title">Flash Deal</div>
            <div className="fd-sub">ຂາຍທີ່ ລາຄາສຸດພິເສດ — ໃນຊ່ວງເວລາຈຳກັດ</div>

            {isActive && deal?.discountPercent ? (
              <>
                <div className="fd-discount">-{deal.discountPercent}% OFF</div>
                {deal.endsAt && !expired ? (
                  <>
                    <div className="fd-timer">
                      <div className="fd-unit"><span className="fd-unit-n">{fmt(h)}</span><span className="fd-unit-l">ຊົ່ວໂມງ</span></div>
                      <div className="fd-unit"><span className="fd-unit-n">{fmt(m)}</span><span className="fd-unit-l">ນາທີ</span></div>
                      <div className="fd-unit"><span className="fd-unit-n">{fmt(s)}</span><span className="fd-unit-l">ວິນາທີ</span></div>
                    </div>
                    <div className="fd-count">{flashProducts.length} ສິນຄ້າ ໃນ Flash Deal ນີ້</div>
                  </>
                ) : expired ? (
                  <div className="fd-expired">⏰ Flash Deal ໝົດເວລາແລ້ວ</div>
                ) : null}
              </>
            ) : (
              <div className="fd-inactive">
                <span className="fd-inactive-icon">⚡</span>
                <h3>ບໍ່ມີ Flash Deal ໃນຂະນະນີ້</h3>
                <p>ຄອຍຕິດຕາມ Flash Deal ຄັ້ງຕໍ່ໄປ</p>
                <Link to="/" style={{ color: "#f43f5e", fontWeight: 700 }}>← ໜ້າຫຼັກ</Link>
              </div>
            )}
          </div>
        </div>

        {isActive && (
          <div className="fd-grid-wrap">
            {loadingProducts ? <Loader /> : (
              <div className="fd-grid">
                {flashProducts.map((p) => (
                  <ProductItem key={p._id} product={p} columnSize="auto" flashDiscount={flashDealMap[p._id] || 0} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
