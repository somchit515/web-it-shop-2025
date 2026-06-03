import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useGetMyOrdersQuery } from "../redux/api/OrderApi";
import toast from "react-hot-toast";
import MetaData from "../layout/MetaData";
import { useDispatch } from "react-redux";
import { clearCart } from "../redux/features/cartSlice";
import { clearShippingInfo } from "../redux/features/shippingSlice";

/* ─── constants ───────────────────────────────────────── */
const STATUS_TABS = [
  { value: "all",         label: "ທັງໝົດ",    icon: "📋" },
  { value: "processing",  label: "ດຳເນີນ",    icon: "⏳" },
  { value: "shipped",     label: "ຈັດສົ່ງ",    icon: "🚚" },
  { value: "delivered",   label: "ສຳເລັດ",     icon: "✅" },
  { value: "cancelled",   label: "ຍົກເລີກ",    icon: "🚫" },
];

const STEPS = [
  { key: "unfulfilled", label: "ລໍຖ້າ",  icon: "📋" },
  { key: "processing",  label: "ດຳເນີນ", icon: "⚙️" },
  { key: "shipped",     label: "ຈັດສົ່ງ", icon: "🚚" },
  { key: "delivered",   label: "ສຳເລັດ",  icon: "✅" },
];

const STEP_IDX = { delivered: 3, shipped: 2, processing: 1 };

const PAYMENT_BADGE = {
  PayAtStore:    { color: "#065f46", bg: "#dcfce7", border: "#86efac", label: "🏪 ຈ່າຍທີ່ຮ້ານ" },
  COD:           { color: "#b45309", bg: "#fef3c7", border: "#fbbf24", label: "💵 COD" },
  Paid:          { color: "#065f46", bg: "#d1fae5", border: "#6ee7b7", label: "✅ ຊຳລະແລ້ວ" },
  AwaitingProof: { color: "#1e40af", bg: "#dbeafe", border: "#93c5fd", label: "🏦 ລໍຖ້າຢືນຢັນ" },
  Rejected:      { color: "#991b1b", bg: "#fee2e2", border: "#fca5a5", label: "❌ ຖືກປະຕິເສດ" },
  default:       { color: "#92400e", bg: "#fef3c7", border: "#fbbf24", label: "⏳ ລໍຖ້າຊຳລະ" },
};

const formatPrice = (val) =>
  new Intl.NumberFormat("lo-LA", { style: "currency", currency: "LAK", maximumFractionDigits: 0 }).format(Number(val ?? 0));

const formatDate = (d) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch { return d; }
};

/* ─── CSS ─────────────────────────────────────────────── */
const CSS = `
  .mo-root {
    background: #f1f5f9;
    min-height: 100vh;
    font-family: "Noto Sans Lao","Phetsarath OT","Inter",sans-serif;
    padding: 24px 16px 56px;
  }
  .mo-inner {
    max-width: 1400px;
    margin: 0 auto;
  }

  /* ── Hero ── */
  .mo-hero {
    background: linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);
    border-radius: 20px;
    padding: 28px 32px;
    color: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
    margin-bottom: 24px;
    box-shadow: 0 8px 32px rgba(79,70,229,.35);
    position: relative;
    overflow: hidden;
  }
  .mo-hero::after {
    content:'';position:absolute;right:-60px;top:-60px;
    width:200px;height:200px;border-radius:50%;
    background:rgba(255,255,255,.06);pointer-events:none;
  }
  .mo-hero-left h1 { font-size:1.8rem;font-weight:800;margin:0 0 4px; }
  .mo-hero-left p  { margin:0;opacity:.75;font-size:.9rem; }
  .mo-hero-stats   { display:flex;align-items:center;gap:20px;flex-wrap:wrap; }
  .mo-hstat        { text-align:center;min-width:44px; }
  .mo-hstat-n      { display:block;font-size:1.9rem;font-weight:800;line-height:1; }
  .mo-hstat-l      { display:block;font-size:.65rem;opacity:.65;margin-top:3px;text-transform:uppercase;letter-spacing:.5px; }
  .mo-hdiv         { width:1px;height:40px;background:rgba(255,255,255,.22); }

  /* ── Toolbar row ── */
  .mo-toolbar {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }
  /* tabs */
  .mo-tabs {
    display: flex;
    gap: 6px;
    overflow-x: auto;
    scrollbar-width: none;
    flex-shrink: 0;
  }
  .mo-tabs::-webkit-scrollbar { display:none; }
  .mo-tab {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 7px 14px;
    border-radius: 999px;
    border: 1.5px solid #e2e8f0;
    background: #fff;
    color: #64748b;
    font-size: .82rem;
    font-weight: 700;
    cursor: pointer;
    transition: all .18s;
    white-space: nowrap;
    font-family: inherit;
  }
  .mo-tab:hover { border-color:#4f46e5;color:#4f46e5; }
  .mo-tab.active {
    background: linear-gradient(135deg,#4f46e5,#7c3aed);
    border-color: transparent;
    color: #fff;
    box-shadow: 0 4px 12px rgba(79,70,229,.32);
  }
  .mo-tab-n {
    font-size:.7rem;
    padding:1px 6px;
    border-radius:999px;
    background:rgba(255,255,255,.25);
  }
  .mo-tab:not(.active) .mo-tab-n { background:#e2e8f0;color:#475569; }

  /* search */
  .mo-search {
    flex: 1;
    min-width: 200px;
    position: relative;
  }
  .mo-search i {
    position: absolute;
    left: 13px;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    font-size:.85rem;
  }
  .mo-search input {
    width: 100%;
    padding: 9px 36px 9px 34px;
    border: 1.5px solid #e2e8f0;
    border-radius: 999px;
    font-size: .88rem;
    font-family: inherit;
    background: #fff;
    transition: border-color .18s,box-shadow .18s;
  }
  .mo-search input:focus { outline:none;border-color:#4f46e5;box-shadow:0 0 0 3px rgba(79,70,229,.12); }
  .mo-search-x {
    position:absolute;right:12px;top:50%;transform:translateY(-50%);
    background:none;border:none;color:#94a3b8;cursor:pointer;padding:2px 4px;
  }
  .mo-count { font-size:.82rem;color:#64748b;white-space:nowrap; }
  .mo-count strong { color:#1e293b; }

  /* ── Grid ── */
  .mo-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 18px;
  }
  @media (max-width: 900px) { .mo-grid { grid-template-columns: 1fr; } }

  /* ── Card ── */
  .mo-card {
    background: #fff;
    border-radius: 16px;
    border: 1px solid #e8eaf0;
    box-shadow: 0 2px 8px rgba(0,0,0,.05);
    overflow: hidden;
    transition: box-shadow .22s,transform .22s;
    display: flex;
    flex-direction: column;
  }
  .mo-card:hover {
    box-shadow: 0 8px 28px rgba(79,70,229,.13);
    transform: translateY(-3px);
  }
  .mo-card.cancelled { opacity:.72;border-color:#fecaca; }

  /* card header */
  .mo-c-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #fafbfd;
    border-bottom: 1px solid #eef0f6;
    gap: 8px;
    flex-wrap: wrap;
  }
  .mo-c-id { display:flex;align-items:center;gap:6px; }
  .mo-c-id-lbl { font-size:.68rem;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px; }
  .mo-c-id-val { font-family:monospace;font-weight:700;color:#4f46e5;font-size:.85rem; }
  .mo-c-copy {
    background:none;border:none;color:#94a3b8;cursor:pointer;
    padding:3px 6px;border-radius:6px;transition:all .15s;
  }
  .mo-c-copy:hover { background:#ede9fe;color:#4f46e5; }
  .mo-c-meta { display:flex;align-items:center;gap:8px;flex-wrap:wrap; }
  .mo-c-date { font-size:.75rem;color:#94a3b8;display:flex;align-items:center;gap:4px; }
  .mo-c-pay {
    font-size:.7rem;font-weight:700;
    padding:3px 10px;border-radius:999px;letter-spacing:.2px;
  }

  /* products row */
  .mo-c-items {
    padding: 14px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    border-bottom: 1px solid #f1f5f9;
  }
  .mo-thumbs { display:flex;gap:6px;flex-shrink:0; }
  .mo-thumb-w { position:relative; }
  .mo-thumb {
    width: 52px;height: 52px;
    border-radius: 10px;
    object-fit: cover;
    border: 1.5px solid #e2e8f0;
    background: #f8fafc;
    display: block;
  }
  .mo-tqty {
    position:absolute;bottom:-4px;right:-4px;
    background:#4f46e5;color:#fff;
    font-size:.58rem;font-weight:800;
    padding:1px 4px;border-radius:5px;line-height:1.5;
  }
  .mo-thumb-more {
    width:52px;height:52px;border-radius:10px;
    background:#f1f5f9;border:1.5px solid #e2e8f0;
    display:flex;align-items:center;justify-content:center;
    font-size:.75rem;font-weight:700;color:#64748b;
  }
  .mo-c-sum { flex:1;min-width:0; }
  .mo-c-name {
    display: block;
    font-size: .85rem;
    font-weight: 600;
    color: #374151;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 2px;
  }
  .mo-c-price { font-size:1.1rem;font-weight:800;color:#4f46e5; }

  /* progress */
  .mo-steps {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid #f1f5f9;
  }
  .mo-step { display:flex;flex-direction:column;align-items:center;gap:3px;flex-shrink:0;opacity:.3; }
  .mo-step.done,.mo-step.cur { opacity:1; }
  .mo-step-dot {
    width:32px;height:32px;border-radius:50%;
    background:#e2e8f0;
    display:flex;align-items:center;justify-content:center;
    font-size:.9rem;transition:all .25s;
  }
  .mo-step.done .mo-step-dot,.mo-step.cur .mo-step-dot {
    background:linear-gradient(135deg,#4f46e5,#7c3aed);
    box-shadow:0 3px 10px rgba(79,70,229,.35);
  }
  .mo-step.cur .mo-step-dot { animation:moPulse 1.8s ease-in-out infinite; }
  @keyframes moPulse {
    0%,100%{box-shadow:0 0 0 4px rgba(79,70,229,.2);}
    50%{box-shadow:0 0 0 8px rgba(79,70,229,.1);}
  }
  .mo-step-lbl { font-size:.6rem;color:#64748b;font-weight:600;white-space:nowrap; }
  .mo-step.done .mo-step-lbl,.mo-step.cur .mo-step-lbl { color:#4f46e5; }
  .mo-step-line {
    flex:1;height:3px;background:#e2e8f0;border-radius:2px;
    margin:0 4px;margin-bottom:15px;transition:background .3s;
  }
  .mo-step-line.done { background:linear-gradient(90deg,#4f46e5,#7c3aed); }

  /* cancelled bar */
  .mo-cancel-bar {
    display:flex;align-items:center;gap:8px;
    padding:10px 16px;
    background:#fff1f2;color:#be123c;
    font-size:.82rem;font-weight:600;
    border-bottom:1px solid #fecdd3;
  }

  /* upload alert */
  .mo-upload {
    display:flex;align-items:center;gap:8px;
    padding:10px 16px;
    background:#fffbeb;border-bottom:1px solid #fde68a;
    color:#92400e;font-size:.82rem;font-weight:600;flex-wrap:wrap;
  }
  .mo-upload-btn {
    margin-left:auto;padding:4px 14px;
    background:#f59e0b;color:#fff;
    border-radius:999px;text-decoration:none;
    font-size:.75rem;font-weight:700;transition:background .18s;
  }
  .mo-upload-btn:hover{background:#d97706;color:#fff;}

  /* tracking */
  .mo-tracking {
    display:flex;align-items:center;gap:6px;
    padding:8px 16px;
    background:#f0fdf4;border-bottom:1px solid #bbf7d0;
    font-size:.8rem;color:#166534;
  }

  /* actions */
  .mo-actions {
    display:flex;gap:8px;padding:12px 16px;
    margin-top:auto;
  }
  .mo-act {
    display:inline-flex;align-items:center;gap:5px;
    padding:8px 14px;border-radius:10px;
    font-size:.8rem;font-weight:700;
    text-decoration:none;cursor:pointer;border:none;
    transition:all .18s;font-family:inherit;
  }
  .mo-act.primary {
    background:linear-gradient(135deg,#4f46e5,#7c3aed);
    color:#fff;flex:1;justify-content:center;
  }
  .mo-act.primary:hover{box-shadow:0 6px 16px rgba(79,70,229,.4);transform:translateY(-1px);color:#fff;}
  .mo-act.ghost {
    background:#fff;border:1.5px solid #e2e8f0;color:#475569;
  }
  .mo-act.ghost:hover{border-color:#4f46e5;color:#4f46e5;background:#f5f3ff;}
  .mo-act.red {
    background:#fff;border:1.5px solid #fecaca;color:#ef4444;
  }
  .mo-act.red:hover{background:#fee2e2;}

  /* empty / no-result */
  .mo-empty {
    grid-column:1/-1;
    text-align:center;
    padding:64px 24px;
    background:#fff;border-radius:18px;
    box-shadow:0 2px 12px rgba(0,0,0,.06);
    color:#94a3b8;
  }
  .mo-empty .mo-e-icon{font-size:4rem;display:block;margin-bottom:16px;}
  .mo-empty h3{color:#1e293b;font-size:1.3rem;margin-bottom:6px;}
  .mo-empty p{font-size:.9rem;margin-bottom:20px;}
  .mo-shop-btn {
    display:inline-flex;align-items:center;gap:8px;
    padding:10px 24px;
    background:linear-gradient(135deg,#4f46e5,#7c3aed);
    color:#fff;border-radius:999px;text-decoration:none;
    font-weight:700;transition:all .2s;
  }
  .mo-shop-btn:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(79,70,229,.4);color:#fff;}

  /* loading */
  .mo-loader {
    display:flex;flex-direction:column;align-items:center;
    justify-content:center;min-height:60vh;gap:14px;color:#64748b;
  }
  .mo-spin {
    width:44px;height:44px;
    border:4px solid #e2e8f0;border-top-color:#4f46e5;
    border-radius:50%;animation:moSpin .85s linear infinite;
  }
  @keyframes moSpin{to{transform:rotate(360deg);}}

  @media(max-width:600px){
    .mo-root{padding:16px 10px 48px;}
    .mo-hero{padding:20px;}
    .mo-hero-left h1{font-size:1.4rem;}
    .mo-hero-stats{gap:12px;}
    .mo-hstat-n{font-size:1.4rem;}
    .mo-actions{flex-direction:column;}
    .mo-toolbar{flex-direction:column;align-items:stretch;}
    .mo-search{min-width:unset;}
  }
`;

/* ─── Component ───────────────────────────────────────── */
export default function MyOrders() {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const [searchParams] = useSearchParams();

  const [copiedId,     setCopiedId]     = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm,   setSearchTerm]   = useState("");
  const [debouncedQ,   setDebouncedQ]   = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(searchTerm), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const { data: allData, isLoading, error, isError, refetch } = useGetMyOrdersQuery({});
  const { data: filteredData, isFetching } = useGetMyOrdersQuery(
    { status: statusFilter, q: debouncedQ || undefined }
  );

  const allOrders      = Array.isArray(allData?.orders)      ? allData.orders      : [];
  const filteredOrders = Array.isArray(filteredData?.orders) ? filteredData.orders : [];
  const orderSuccess   = searchParams.get("order_success");

  useEffect(() => {
    if (isError) toast.error(error?.data?.message || "ເກີດຂໍ້ຜິດພາດ");
    if (orderSuccess) {
      dispatch(clearCart());
      dispatch(clearShippingInfo());
      (async () => {
        try { await refetch(); toast.success("ຄຳສັ່ງຊື້ສຳເລັດ!"); }
        catch { /* ignore */ }
        finally { navigate("/me/orders", { replace: true }); }
      })();
    }
  }, [isError, error, orderSuccess, dispatch, navigate, refetch]);

  const copyId = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success("ຄັດລອກ ID ແລ້ວ");
      setTimeout(() => setCopiedId(null), 2000);
    } catch { toast.error("ຄັດລອກລົ້ມເຫລວ"); }
  };

  const payBadge = (method, status) => {
    if (method === "PayAtStore") return PAYMENT_BADGE.PayAtStore;
    if (method === "COD")        return PAYMENT_BADGE.COD;
    return PAYMENT_BADGE[status] || PAYMENT_BADGE.default;
  };

  const countBy = (s) => allOrders.filter((o) =>
    (o.fulfillmentStatus || o.orderStatus)?.toLowerCase() === s).length;

  const stats = {
    total:      allOrders.length,
    processing: countBy("processing"),
    shipped:    countBy("shipped"),
    delivered:  countBy("delivered"),
    cancelled:  countBy("cancelled"),
  };

  /* ── Loading ── */
  if (isLoading) return (
    <>
      <MetaData title="ຄຳສັ່ງຊື້ຂອງຂ້ອຍ" />
      <style>{CSS}</style>
      <div className="mo-root"><div className="mo-loader">
        <div className="mo-spin" /><p>ກຳລັງໂຫຼດ...</p>
      </div></div>
    </>
  );

  /* ── Empty ── */
  if (!isLoading && allOrders.length === 0) return (
    <>
      <MetaData title="ຄຳສັ່ງຊື້ຂອງຂ້ອຍ" />
      <style>{CSS}</style>
      <div className="mo-root"><div className="mo-inner">
        <div className="mo-empty">
          <span className="mo-e-icon">📦</span>
          <h3>ຍັງບໍ່ມີຄຳສັ່ງຊື້</h3>
          <p>ເມື່ອທ່ານສັ່ງຊື້ສິນຄ້າ, ລາຍການຈະປະກົດທີ່ນີ້</p>
          <Link to="/" className="mo-shop-btn"><i className="fas fa-shopping-bag" /> ເລີ່ມຊັອບ</Link>
        </div>
      </div></div>
    </>
  );

  return (
    <>
      <MetaData title="ຄຳສັ່ງຊື້ຂອງຂ້ອຍ" />
      <style>{CSS}</style>
      <div className="mo-root">
        <div className="mo-inner">

          {/* ── Hero ── */}
          <div className="mo-hero">
            <div className="mo-hero-left">
              <h1>ຄຳສັ່ງຊື້ຂອງຂ້ອຍ</h1>
              <p>ຕິດຕາມ ແລະ ຈັດການຄຳສັ່ງຊື້ທັງໝົດ</p>
            </div>
            <div className="mo-hero-stats">
              <div className="mo-hstat">
                <span className="mo-hstat-n">{stats.total}</span>
                <span className="mo-hstat-l">ທັງໝົດ</span>
              </div>
              <div className="mo-hdiv" />
              <div className="mo-hstat">
                <span className="mo-hstat-n" style={{ color: "#fbbf24" }}>{stats.processing}</span>
                <span className="mo-hstat-l">ດຳເນີນ</span>
              </div>
              <div className="mo-hdiv" />
              <div className="mo-hstat">
                <span className="mo-hstat-n" style={{ color: "#60a5fa" }}>{stats.shipped}</span>
                <span className="mo-hstat-l">ຈັດສົ່ງ</span>
              </div>
              <div className="mo-hdiv" />
              <div className="mo-hstat">
                <span className="mo-hstat-n" style={{ color: "#34d399" }}>{stats.delivered}</span>
                <span className="mo-hstat-l">ສຳເລັດ</span>
              </div>
              <div className="mo-hdiv" />
              <div className="mo-hstat">
                <span className="mo-hstat-n" style={{ color: "#fb7185" }}>{stats.cancelled}</span>
                <span className="mo-hstat-l">ຍົກເລີກ</span>
              </div>
            </div>
          </div>

          {/* ── Toolbar ── */}
          <div className="mo-toolbar">
            <div className="mo-tabs">
              {STATUS_TABS.map((t) => (
                <button key={t.value}
                  className={`mo-tab ${statusFilter === t.value ? "active" : ""}`}
                  onClick={() => setStatusFilter(t.value)}
                >
                  {t.icon} {t.label}
                  {t.value === "all" && <span className="mo-tab-n">{allOrders.length}</span>}
                </button>
              ))}
            </div>
            <div className="mo-search">
              <i className="fas fa-search" />
              <input
                placeholder="ຄົ້ນຫາ Order ID ຫຼື ຊື່ສິນຄ້າ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {isFetching && searchTerm ? (
                <span style={{ fontSize: 12, color: "#94a3b8" }}>⏳</span>
              ) : searchTerm ? (
                <button className="mo-search-x" onClick={() => setSearchTerm("")}>
                  <i className="fas fa-times" />
                </button>
              ) : null}
            </div>
            <p className="mo-count">ສະແດງ <strong>{filteredOrders.length}</strong> ລາຍການ</p>
          </div>

          {/* ── Grid ── */}
          <div className="mo-grid">
            {filteredOrders.length === 0 ? (
              <div className="mo-empty">
                <span className="mo-e-icon">🔍</span>
                <h3>ບໍ່ພົບລາຍການ</h3>
                <p>ລອງປ່ຽນ filter ຫຼື ຄຳຄົ້ນຫາ</p>
              </div>
            ) : filteredOrders.map((order) => {
              const oid     = order._id || "";
              const status  = (order.fulfillmentStatus || order.orderStatus || "").toLowerCase();
              const isCancelled = status === "cancelled";
              const stepIdx = isCancelled ? -1 : (STEP_IDX[status] ?? 0);
              const badge   = payBadge(order.paymentMethod, order.paymentStatus);
              const items   = Array.isArray(order.orderItems) ? order.orderItems : [];
              const needsUpload =
                order.paymentMethod === "BankTransfer" &&
                ["Pending", "AwaitingProof"].includes(order.paymentStatus) &&
                (!order.paymentProof || order.paymentProof.length === 0);
              const canCancel =
                ["unfulfilled", "processing"].includes(status) &&
                order.paymentStatus !== "Paid";

              return (
                <div key={oid} className={`mo-card ${isCancelled ? "cancelled" : ""}`}>

                  {/* Header */}
                  <div className="mo-c-head">
                    <div className="mo-c-id">
                      <span className="mo-c-id-lbl">ORDER ID</span>
                      <span className="mo-c-id-val">#{oid.substring(0, 14)}…</span>
                      <button className="mo-c-copy" onClick={() => copyId(oid, oid)} title="ຄັດລອກ">
                        <i className={`fas fa-${copiedId === oid ? "check" : "copy"}`} />
                      </button>
                    </div>
                    <div className="mo-c-meta">
                      <span className="mo-c-date"><i className="far fa-clock" /> {formatDate(order.createdAt)}</span>
                      <span className="mo-c-pay"
                        style={{ color: badge.color, background: badge.bg, border: `1px solid ${badge.border}` }}
                      >{badge.label}</span>
                    </div>
                  </div>

                  {/* Products */}
                  {items.length > 0 && (
                    <div className="mo-c-items">
                      <div className="mo-thumbs">
                        {items.slice(0, 3).map((item, i) => (
                          <div className="mo-thumb-w" key={i}>
                            <img
                              src={item.image || "/images/default_product.png"}
                              alt={item.name}
                              className="mo-thumb"
                              onError={(e) => { e.currentTarget.src = "/images/default_product.png"; }}
                            />
                            <span className="mo-tqty">×{item.quantity}</span>
                          </div>
                        ))}
                        {items.length > 3 && <div className="mo-thumb-more">+{items.length - 3}</div>}
                      </div>
                      <div className="mo-c-sum">
                        <span className="mo-c-name">
                          {items[0].name}{items.length > 1 && ` + ${items.length - 1} ລາຍການ`}
                        </span>
                        <span className="mo-c-price">{formatPrice(order.totalAmount)}</span>
                      </div>
                    </div>
                  )}

                  {/* Progress */}
                  {!isCancelled ? (
                    <div className="mo-steps">
                      {STEPS.map((s, i) => (
                        <React.Fragment key={s.key}>
                          <div className={`mo-step ${i <= stepIdx ? "done" : ""} ${i === stepIdx ? "cur" : ""}`}>
                            <div className="mo-step-dot">{i <= stepIdx ? s.icon : ""}</div>
                            <span className="mo-step-lbl">{s.label}</span>
                          </div>
                          {i < STEPS.length - 1 && (
                            <div className={`mo-step-line ${i < stepIdx ? "done" : ""}`} />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  ) : (
                    <div className="mo-cancel-bar">
                      <i className="fas fa-ban" /> ອໍເດີນີ້ຖືກຍົກເລີກ
                      {order.cancelReason && <span style={{ fontWeight: 400, opacity: .8 }}>— {order.cancelReason}</span>}
                    </div>
                  )}

                  {/* Upload slip alert */}
                  {needsUpload && (
                    <div className="mo-upload">
                      <i className="fas fa-exclamation-circle" style={{ color: "#f59e0b" }} />
                      <span>ກະລຸນາອັບໂຫຼດໃບໂອນ</span>
                      <Link to={`/orders/${oid}/upload-proof`} className="mo-upload-btn">ອັບໂຫຼດ</Link>
                    </div>
                  )}

                  {/* Tracking */}
                  {order.trackingCode && (
                    <div className="mo-tracking">
                      <i className="fas fa-truck" /> ເລກພັດດຸ: <strong>{order.trackingCode}</strong>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mo-actions">
                    <Link to={`/me/orders/${oid}`} className="mo-act primary">
                      <i className="fas fa-eye" /> ລາຍລະອຽດ
                    </Link>
                    <Link to={`/invoice/orders/${oid}`} className="mo-act ghost">
                      <i className="fas fa-file-invoice" /> ໃບບິນ
                    </Link>
                    {canCancel && (
                      <Link to={`/me/orders/${oid}`} className="mo-act red">
                        <i className="fas fa-ban" /> ຍົກເລີກ
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
