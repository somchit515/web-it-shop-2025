import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MetaData from "../layout/MetaData";
import ProductItem from "./ProductItem";

const API = "http://localhost:8000/api/v1";

const TABS = [
  { key: "bestseller", label: "ສິນຄ້າຂາຍດີ", icon: "🔥", desc: "ສິນຄ້າທີ່ລູກຄ້ານິຍົມຊື້ຫຼາຍທີ່ສຸດ" },
  { key: "toprated",   label: "ຄະແນນສູງ",    icon: "⭐", desc: "ສິນຄ້າທີ່ໄດ້ຮັບຄະແນນ 4 ດາວຂຶ້ນໄປ" },
  { key: "sale",       label: "ລົດລາຄາ",      icon: "🏷️", desc: "ສິນຄ້າທີ່ກຳລັງລົດລາຄາພິເສດ" },
  { key: "new",        label: "ສິນຄ້າໃໝ່",    icon: "✨", desc: "ສິນຄ້ານຳເຂົ້າໃໝ່ ທັນສະໄໝທີ່ສຸດ" },
];

const WHY = [
  { icon: "🛡️", title: "ສິນຄ້າຂອງແທ້ 100%",   desc: "ທຸກສິນຄ້າຜ່ານການກວດຄຸນນະພາບ ແລະ ມາຈາກຜູ້ຈຳໜ່າຍທີ່ໄດ້ຮັບການຮັບຮອງ" },
  { icon: "🚀", title: "ຈັດສົ່ງດ່ວນທົ່ວລາວ",    desc: "ຮັບສິນຄ້າພາຍໃນ 1-3 ວັນ ທຸກຈັງຫວັດທົ່ວ ສປປ ລາວ" },
  { icon: "💰", title: "ລາຄາດີທີ່ສຸດ",          desc: "ປຽບທຽບລາຄາໄດ້ Flash Deal ທຸກໆອາທິດ ລະຫັດສ່ວນຫຼຸດພິເສດ" },
  { icon: "🔧", title: "ບໍລິການຫຼັງການຂາຍ",     desc: "ທີມ IT ພ້ອມຊ່ວຍເຫຼືອທ່ານຕະຫຼອດ 7 ວັນ 24 ຊົ່ວໂມງ" },
];

export default function Recommended() {
  const [activeTab, setActiveTab] = useState("bestseller");
  const [products, setProducts]   = useState({});
  const [loading, setLoading]     = useState({});

  const fetchTab = async (tab) => {
    if (products[tab] || loading[tab]) return;
    setLoading((p) => ({ ...p, [tab]: true }));
    try {
      let url = "";
      if (tab === "bestseller") url = `${API}/best-selling`;
      if (tab === "toprated")   url = `${API}/products?ratings=4&page=1`;
      if (tab === "sale")       url = `${API}/products?hasSale=true&page=1`;
      if (tab === "new")        url = `${API}/products?sort=newest&page=1`;

      const res  = await fetch(url, { credentials: "include" });
      const data = await res.json();
      let list = Array.isArray(data.products) ? data.products : [];

      if (tab === "toprated") list = list.filter((p) => Number(p.rating) >= 4);
      if (tab === "sale")     list = list.filter((p) => p.salePrice != null && p.salePrice < p.price);
      if (tab === "new")      list = list.slice(0, 20);

      setProducts((p) => ({ ...p, [tab]: list }));
    } catch {
      setProducts((p) => ({ ...p, [tab]: [] }));
    } finally {
      setLoading((p) => ({ ...p, [tab]: false }));
    }
  };

  useEffect(() => { fetchTab(activeTab); }, [activeTab]);

  const list      = products[activeTab] || [];
  const isLoading = loading[activeTab];
  const activeInfo = TABS.find((t) => t.key === activeTab);

  return (
    <>
      <style>{css}</style>
      <MetaData title="ສິນຄ້າແນະນຳ — IT HUBB" />

      <div className="rec-page">

        {/* ══ HERO ══ */}
        <section className="rec-hero">
          <div className="rec-orb rec-orb1" />
          <div className="rec-orb rec-orb2" />
          <div className="rec-orb rec-orb3" />
          <div className="rec-hero-inner">
            <div className="rec-hero-badge">✦ ຄັດເລືອກໂດຍທີມງານ IT HUBB</div>
            <h1 className="rec-hero-title">
              ສິນຄ້າ<span className="rec-grad"> ແນະນຳ</span>
            </h1>
            <p className="rec-hero-sub">
              ສິນຄ້າ IT ຄຸນນະພາບສູງ ຄັດສັນເປັນພິເສດ — ຂາຍດີ, ຄະແນນສູງ, ລາຄາສຸດຄຸ້ມ
            </p>
            <div className="rec-hero-chips">
              <span>🔥 ສິນຄ້າຂາຍດີ</span>
              <span>⭐ ຄະແນນ 4+ ດາວ</span>
              <span>🏷️ Flash Sale ທຸກອາທິດ</span>
              <span>✨ ສິນຄ້າໃໝ່ທຸກວັນ</span>
            </div>
          </div>
        </section>

        {/* ══ STATS STRIP ══ */}
        <div className="rec-stats">
          <div className="rec-stat"><span className="rec-stat-num">50,000+</span><span className="rec-stat-lbl">ລາຍການສິນຄ້າ</span></div>
          <div className="rec-stat"><span className="rec-stat-num">10,000+</span><span className="rec-stat-lbl">ລູກຄ້າໄວ້ວາງໃຈ</span></div>
          <div className="rec-stat"><span className="rec-stat-num">99.9%</span><span className="rec-stat-lbl">ຄວາມພໍໃຈ</span></div>
          <div className="rec-stat"><span className="rec-stat-num">5+</span><span className="rec-stat-lbl">ປີປະສົບການ</span></div>
        </div>

        {/* ══ TABS + GRID ══ */}
        <div className="rec-body">

          {/* Tabs */}
          <div className="rec-tabs-wrap">
            <div className="rec-tabs">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  className={`rec-tab${activeTab === t.key ? " rec-tab--active" : ""}`}
                  onClick={() => setActiveTab(t.key)}
                >
                  <span className="rec-tab-ic">{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Info bar */}
          <div className="rec-infobar">
            <div className="rec-infobar-left">
              <span className="rec-tab-desc">{activeInfo?.desc}</span>
              <span className="rec-count-badge">
                {isLoading ? "ກຳລັງໂຫຼດ..." : `${list.length} ລາຍການ`}
              </span>
            </div>
            <Link to="/" className="rec-browse-all">
              ເບິ່ງສິນຄ້າທັງໝົດ <span>→</span>
            </Link>
          </div>

          {/* Skeleton */}
          {isLoading && (
            <div className="rec-skeleton-grid">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="rec-sk-card">
                  <div className="rec-sk-img" />
                  <div className="rec-sk-line rec-sk-long" />
                  <div className="rec-sk-line rec-sk-short" />
                </div>
              ))}
            </div>
          )}

          {/* Empty */}
          {!isLoading && list.length === 0 && (
            <div className="rec-empty">
              <div className="rec-empty-ic">📦</div>
              <h3>ຍັງບໍ່ມີສິນຄ້າໃນໝວດນີ້</h3>
              <p>ກະລຸນາກັບມາໃໝ່ໃນພາຍຫຼັງ</p>
              <Link to="/" className="rec-empty-btn">🛒 ເບິ່ງສິນຄ້າທັງໝົດ</Link>
            </div>
          )}

          {/* Product grid */}
          {!isLoading && list.length > 0 && (
            <div className="row">
              {list.map((product) => (
                <ProductItem key={product._id} product={product} columnSize={3} />
              ))}
            </div>
          )}
        </div>

        {/* ══ WHY US ══ */}
        <section className="rec-why">
          <div className="rec-why-orb rec-why-orb1" />
          <div className="rec-why-orb rec-why-orb2" />
          <div className="rec-why-inner">
            <div className="rec-why-head">
              <div className="rec-why-tag">💡 ທຳໄມຕ້ອງ IT HUBB</div>
              <h2>ເລືອກຊື້ຢ່າງໝັ້ນໃຈ<span className="rec-grad"> ກັບພວກເຮົາ</span></h2>
              <p>ທຸກການຊື້ ໝັ້ນໃຈໃນຄຸນນະພາບ ລາຄາ ແລະ ການບໍລິການ</p>
            </div>
            <div className="rec-why-grid">
              {WHY.map((w) => (
                <div key={w.title} className="rec-why-card">
                  <div className="rec-why-ic">{w.icon}</div>
                  <h3>{w.title}</h3>
                  <p>{w.desc}</p>
                </div>
              ))}
            </div>
            <div className="rec-why-cta">
              <Link to="/" className="rec-cta-btn">🛒 ເລີ່ມຊອບປິ້ງດຽວນີ້</Link>
              <Link to="/contact" className="rec-cta-outline">📞 ຕິດຕໍ່ທີ່ປຶກສາ</Link>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}

/* ── Styles ─────────────────────────────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;600;700;800;900&display=swap');

.rec-page {
  font-family: "Noto Sans Lao","Phetsarath OT",sans-serif;
  color: #1e293b;
  overflow-x: hidden;
}

.rec-grad {
  background: linear-gradient(135deg,#6366f1,#8b5cf6 55%,#06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ── HERO ─────────────────────────────────────── */
.rec-hero {
  position: relative;
  min-height: 68vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg,#0f0c29 0%,#302b63 45%,#1e3a5f 100%);
  overflow: hidden;
  text-align: center;
  padding: 110px 24px 80px;
}

.rec-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  animation: recOrb 8s ease-in-out infinite;
}
.rec-orb1 { width:480px;height:480px;background:radial-gradient(circle,rgba(99,102,241,.42),transparent 70%);top:-130px;left:-110px; }
.rec-orb2 { width:360px;height:360px;background:radial-gradient(circle,rgba(139,92,246,.38),transparent 70%);bottom:-90px;right:-80px;animation-delay:3s; }
.rec-orb3 { width:240px;height:240px;background:radial-gradient(circle,rgba(6,182,212,.3),transparent 70%);top:40%;right:16%;animation-delay:5s; }

@keyframes recOrb {
  0%,100% { transform:translateY(0) scale(1); }
  50%      { transform:translateY(-26px) scale(1.07); }
}

.rec-hero-inner {
  position: relative;
  z-index: 2;
  max-width: 720px;
  margin: 0 auto;
  animation: recFade .9s ease both;
}
@keyframes recFade {
  from { opacity:0;transform:translateY(36px); }
  to   { opacity:1;transform:translateY(0); }
}

.rec-hero-badge {
  display: inline-block;
  padding: 8px 22px;
  background: rgba(99,102,241,.22);
  border: 1px solid rgba(99,102,241,.5);
  border-radius: 100px;
  color: #c7d2fe;
  font-size: .85rem;
  font-weight: 700;
  margin-bottom: 22px;
  letter-spacing: .06em;
  text-transform: uppercase;
  backdrop-filter: blur(8px);
}

.rec-hero-title {
  font-size: clamp(2.6rem,5.5vw,4.5rem);
  font-weight: 900;
  line-height: 1.15;
  color: #fff;
  margin: 0 0 18px;
}

.rec-hero-sub {
  font-size: 1.05rem;
  line-height: 1.8;
  color: #cbd5e1;
  margin: 0 0 30px;
}

.rec-hero-chips {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
}
.rec-hero-chips span {
  padding: 8px 18px;
  background: rgba(255,255,255,.1);
  border: 1px solid rgba(255,255,255,.2);
  border-radius: 100px;
  color: #e0e7ff;
  font-size: .82rem;
  font-weight: 700;
  backdrop-filter: blur(6px);
}

/* ── STATS ────────────────────────────────────── */
.rec-stats {
  display: grid;
  grid-template-columns: repeat(4,1fr);
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
}
.rec-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 36px 16px;
  border-right: 1px solid #e2e8f0;
  transition: background .2s;
}
.rec-stat:last-child { border-right: none; }
.rec-stat:hover { background: #f8fafc; }
.rec-stat-num {
  font-size: 2rem;
  font-weight: 900;
  color: #6366f1;
  line-height: 1;
  margin-bottom: 6px;
}
.rec-stat-lbl {
  font-size: .82rem;
  color: #64748b;
  font-weight: 600;
}

/* ── BODY (tabs + grid) ───────────────────────── */
.rec-body {
  max-width: 1400px;
  margin: 0 auto;
  padding: 52px 48px 72px;
}

/* Tabs */
.rec-tabs-wrap {
  overflow-x: auto;
  scrollbar-width: none;
  margin-bottom: 28px;
}
.rec-tabs-wrap::-webkit-scrollbar { display: none; }
.rec-tabs {
  display: inline-flex;
  gap: 6px;
  background: #f1f5f9;
  border-radius: 18px;
  padding: 5px;
  min-width: max-content;
}
.rec-tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  border-radius: 13px;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: .92rem;
  font-weight: 700;
  cursor: pointer;
  transition: all .22s;
  font-family: inherit;
  white-space: nowrap;
}
.rec-tab:hover { color: #334155; background: rgba(255,255,255,.7); }
.rec-tab--active {
  background: #fff;
  color: #4f46e5;
  box-shadow: 0 2px 16px rgba(79,70,229,.2);
}
.rec-tab-ic { font-size: 1.1rem; }

/* Info bar */
.rec-infobar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f1f5f9;
  flex-wrap: wrap;
  gap: 12px;
}
.rec-infobar-left { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.rec-tab-desc { color: #64748b; font-size: .88rem; }
.rec-count-badge {
  padding: 5px 14px;
  background: #ede9fe;
  color: #6366f1;
  border-radius: 100px;
  font-size: .8rem;
  font-weight: 800;
}
.rec-browse-all {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #4f46e5;
  font-size: .9rem;
  font-weight: 700;
  text-decoration: none;
  transition: gap .2s;
}
.rec-browse-all:hover { gap: 10px; color: #4338ca; text-decoration: none; }

/* Skeleton */
.rec-skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill,minmax(220px,1fr));
  gap: 20px;
  margin-bottom: 2rem;
}
.rec-sk-card {
  background: #fff;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid #f1f5f9;
}
.rec-sk-img {
  height: 190px;
  background: linear-gradient(90deg,#f1f5f9 0%,#e2e8f0 50%,#f1f5f9 100%);
  background-size: 200% 100%;
  animation: recShimmer 1.4s infinite linear;
}
.rec-sk-line {
  height: 13px;
  border-radius: 8px;
  margin: 14px 16px 0;
  background: linear-gradient(90deg,#f1f5f9 0%,#e2e8f0 50%,#f1f5f9 100%);
  background-size: 200% 100%;
  animation: recShimmer 1.4s infinite linear;
}
.rec-sk-long  { width: calc(100% - 32px); }
.rec-sk-short { width: 55%; margin-top: 10px; margin-bottom: 16px; }
@keyframes recShimmer {
  0%   { background-position:200% 0; }
  100% { background-position:-200% 0; }
}

/* Empty */
.rec-empty {
  text-align: center;
  padding: 80px 24px;
}
.rec-empty-ic  { font-size: 4rem; margin-bottom: 16px; opacity: .35; }
.rec-empty h3  { font-size: 1.2rem; font-weight: 700; color: #334155; margin-bottom: 8px; }
.rec-empty p   { color: #94a3b8; margin-bottom: 24px; }
.rec-empty-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  background: linear-gradient(135deg,#6366f1,#8b5cf6);
  color: #fff;
  font-weight: 700;
  border-radius: 100px;
  text-decoration: none;
  box-shadow: 0 4px 16px rgba(99,102,241,.35);
  transition: transform .2s,box-shadow .2s;
}
.rec-empty-btn:hover { transform:translateY(-2px);box-shadow:0 8px 24px rgba(99,102,241,.45);color:#fff;text-decoration:none; }

/* ── WHY US ───────────────────────────────────── */
.rec-why {
  position: relative;
  background: linear-gradient(135deg,#0f0c29 0%,#1e1b4b 50%,#0f172a 100%);
  padding: 90px 48px;
  overflow: hidden;
}
.rec-why-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  pointer-events: none;
}
.rec-why-orb1 { width:400px;height:400px;background:radial-gradient(circle,rgba(99,102,241,.3),transparent 70%);top:-80px;left:-60px; }
.rec-why-orb2 { width:340px;height:340px;background:radial-gradient(circle,rgba(6,182,212,.22),transparent 70%);bottom:-60px;right:-40px; }

.rec-why-inner {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  margin: 0 auto;
}

.rec-why-head {
  text-align: center;
  margin-bottom: 52px;
}
.rec-why-tag {
  display: inline-block;
  padding: 6px 18px;
  background: rgba(255,255,255,.12);
  border: 1px solid rgba(255,255,255,.2);
  color: #e0e7ff;
  border-radius: 100px;
  font-size: .82rem;
  font-weight: 700;
  margin-bottom: 16px;
}
.rec-why-head h2 {
  font-size: 2.2rem;
  font-weight: 900;
  color: #fff;
  line-height: 1.25;
  margin: 0 0 12px;
}
.rec-why-head p {
  color: #94a3b8;
  font-size: .95rem;
  margin: 0;
}

.rec-why-grid {
  display: grid;
  grid-template-columns: repeat(4,1fr);
  gap: 20px;
  margin-bottom: 48px;
}
.rec-why-card {
  background: rgba(255,255,255,.07);
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 20px;
  padding: 32px 24px;
  text-align: center;
  transition: background .25s,transform .25s;
}
.rec-why-card:hover { background:rgba(255,255,255,.11);transform:translateY(-6px); }
.rec-why-ic { font-size: 2.4rem; margin-bottom: 16px; filter: drop-shadow(0 2px 6px rgba(0,0,0,.2)); }
.rec-why-card h3 { font-size: 1rem; font-weight: 800; color: #e2e8f0; margin:0 0 10px; }
.rec-why-card p  { font-size: .85rem; color: #94a3b8; margin:0; line-height:1.7; }

.rec-why-cta {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}
.rec-cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 32px;
  background: linear-gradient(135deg,#6366f1,#8b5cf6);
  color: #fff;
  font-weight: 700;
  border-radius: 100px;
  text-decoration: none;
  box-shadow: 0 4px 20px rgba(99,102,241,.4);
  transition: transform .2s,box-shadow .2s;
}
.rec-cta-btn:hover { transform:translateY(-3px);box-shadow:0 8px 28px rgba(99,102,241,.55);color:#fff;text-decoration:none; }
.rec-cta-outline {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 32px;
  border: 2px solid rgba(255,255,255,.45);
  color: #fff;
  font-weight: 700;
  border-radius: 100px;
  text-decoration: none;
  transition: background .2s,transform .2s;
  backdrop-filter: blur(6px);
}
.rec-cta-outline:hover { background:rgba(255,255,255,.15);transform:translateY(-3px);color:#fff;text-decoration:none; }

/* ── Responsive ───────────────────────────────── */
@media(max-width:1024px) {
  .rec-body { padding: 48px 32px 56px; }
  .rec-why  { padding: 72px 32px; }
  .rec-why-grid { grid-template-columns: repeat(2,1fr); }
}
@media(max-width:768px) {
  .rec-hero { padding: 90px 20px 70px; min-height: auto; }
  .rec-hero-title { font-size: 2.4rem; }
  .rec-stats { grid-template-columns: repeat(2,1fr); }
  .rec-stat { border-bottom: 1px solid #e2e8f0; }
  .rec-stat:nth-child(odd)  { border-right: 1px solid #e2e8f0; }
  .rec-stat:nth-child(even) { border-right: none; }
  .rec-body { padding: 36px 20px 48px; }
  .rec-why  { padding: 56px 20px; }
  .rec-why-grid { grid-template-columns: 1fr 1fr; }
  .rec-why-head h2 { font-size: 1.8rem; }
}
@media(max-width:480px) {
  .rec-stats { grid-template-columns: 1fr; }
  .rec-stat  { border-right: none; }
  .rec-hero-title { font-size: 2rem; }
  .rec-why-grid { grid-template-columns: 1fr; }
  .rec-hero-chips { flex-direction: column; align-items: center; }
  .rec-why-cta { flex-direction: column; align-items: center; }
}
`;
