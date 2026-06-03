import React, { useEffect, useState } from "react";
import MetaData from "../layout/MetaData";
import {
  useGetOrderDetailsQuery,
  useCancelMyOrderMutation,
} from "../redux/api/OrderApi";
import { useParams, Link, useNavigate } from "react-router-dom";
import Loader from "../layout/Loader";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const formatLAK = (val) => {
  const n = Number(val ?? 0);
  return new Intl.NumberFormat("lo-LA", {
    style: "currency",
    currency: "LAK",
    maximumFractionDigits: 0,
  }).format(n);
};

const resolveFileUrl = (urlOrPath) => {
  if (!urlOrPath) return "";
  if (/^https?:\/\//i.test(urlOrPath)) return urlOrPath;
  if (urlOrPath.startsWith("/")) return urlOrPath;
  return `/uploads/payment_proofs/${urlOrPath}`;
};

const STATUS_MAP = {
  delivered:  { color: "#10b981", bg: "#d1fae5", border: "#6ee7b7", label: "ສຳເລັດ",         icon: "✅" },
  processing: { color: "#3b82f6", bg: "#dbeafe", border: "#93c5fd", label: "ກຳລັງດຳເນີນ",   icon: "⏳" },
  shipped:    { color: "#06b6d4", bg: "#cffafe", border: "#67e8f9", label: "ກຳລັງສົ່ງ",      icon: "🚚" },
  cancelled:  { color: "#ef4444", bg: "#fee2e2", border: "#fca5a5", label: "ຍົກເລີກ",         icon: "🚫" },
  unfulfilled:{ color: "#f59e0b", bg: "#fef3c7", border: "#fcd34d", label: "ລໍຖ້າດຳເນີນ",   icon: "⏳" },
};

const getStatus = (s) =>
  STATUS_MAP[(s || "").toLowerCase()] || { color: "#f59e0b", bg: "#fef3c7", border: "#fcd34d", label: s || "ລໍຖ້າ", icon: "⏳" };

const PAYMENT_ICONS = { COD: "💵", BankTransfer: "🏦", PayAtStore: "🏪" };
const PAYMENT_LABELS = { COD: "ເງິນສົດ (COD)", BankTransfer: "ໂອນເງິນ", PayAtStore: "ຈ່າຍໜ້າຮ້ານ" };

const EVENT_CONFIG = {
  created:           { icon: "🛒", color: "#667eea", label: "ສ້າງອໍເດີ" },
  proof_uploaded:    { icon: "📤", color: "#0ea5e9", label: "ອັບໂຫຼດສະຫຼິບ" },
  payment_confirmed: { icon: "💰", color: "#10b981", label: "ຢືນຢັນການຊຳລະ" },
  payment_rejected:  { icon: "❌", color: "#ef4444", label: "ປະຕິເສດການຊຳລະ" },
  processing:        { icon: "📦", color: "#3b82f6", label: "ກຳລັງເຕີມ" },
  shipped:           { icon: "🚚", color: "#f59e0b", label: "ຈັດສົ່ງແລ້ວ" },
  delivered:         { icon: "✅", color: "#10b981", label: "ສົ່ງສຳເລັດ" },
  cancelled:         { icon: "🚫", color: "#ef4444", label: "ຍົກເລີກ" },
  returned:          { icon: "↩️", color: "#a855f7", label: "ສົ່ງຄືນ" },
  refunded:          { icon: "💸", color: "#06b6d4", label: "ຄືນເງິນ" },
  note:              { icon: "📝", color: "#64748b", label: "ບັນທຶກ" },
};

function formatRelativeTime(date) {
  const diff = Date.now() - new Date(date).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "ໜ້ອຍກວ່າ 1 ນາທີ";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} ນາທີຜ່ານມາ`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} ຊົ່ວໂມງຜ່ານມາ`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day} ມື້ຜ່ານມາ`;
  return new Date(date).toLocaleDateString("lo-LA");
}

const formatDate = (d) => {
  if (!d) return "N/A";
  try {
    return new Date(d).toLocaleString("en-GB", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return d; }
};

/* ─── CSS ─────────────────────────────────────────────── */
const CSS = `
  :root {
    --od-primary: #4f46e5;
    --od-primary-light: #e0e7ff;
    --od-surface: #ffffff;
    --od-bg: #f1f5f9;
    --od-border: #e2e8f0;
    --od-text: #1e293b;
    --od-muted: #64748b;
    --od-radius: 16px;
    --od-shadow: 0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.06);
    --od-shadow-lg: 0 4px 6px rgba(0,0,0,.05), 0 10px 30px rgba(0,0,0,.10);
    --od-font: "Noto Sans Lao","Phetsarath OT","Inter",sans-serif;
  }

  .od-wrap {
    background: var(--od-bg);
    min-height: 100vh;
    font-family: var(--od-font);
    padding: 24px 16px 48px;
  }

  /* ── max-width container ── */
  .od-inner {
    max-width: 1360px;
    margin: 0 auto;
  }

  /* ── Hero header ── */
  .od-hero {
    background: linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);
    border-radius: var(--od-radius);
    padding: 28px 32px;
    margin-bottom: 24px;
    color: #fff;
    box-shadow: 0 8px 32px rgba(79,70,229,.35);
    position: relative;
    overflow: hidden;
  }
  .od-hero::before {
    content: '';
    position: absolute;
    top: -40px; right: -40px;
    width: 180px; height: 180px;
    border-radius: 50%;
    background: rgba(255,255,255,.06);
  }
  .od-hero::after {
    content: '';
    position: absolute;
    bottom: -60px; left: 30%;
    width: 240px; height: 240px;
    border-radius: 50%;
    background: rgba(255,255,255,.04);
  }
  .od-hero-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 16px;
    position: relative;
    z-index: 1;
  }
  .od-hero-eyebrow {
    font-size: .75rem;
    font-weight: 600;
    letter-spacing: .08em;
    text-transform: uppercase;
    opacity: .75;
    margin-bottom: 6px;
  }
  .od-hero-title {
    font-size: 1.65rem;
    font-weight: 800;
    margin: 0 0 4px;
    line-height: 1.2;
  }
  .od-hero-sub {
    font-size: .82rem;
    opacity: .72;
    font-family: monospace;
    letter-spacing: .04em;
  }
  .od-hero-date {
    font-size: .8rem;
    opacity: .65;
    margin-top: 6px;
  }
  .od-hero-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .od-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 10px;
    font-size: .8rem;
    font-weight: 700;
    cursor: pointer;
    border: none;
    transition: transform .15s, box-shadow .15s, opacity .15s;
    text-decoration: none;
    white-space: nowrap;
  }
  .od-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,0,0,.18); }
  .od-btn:active { transform: translateY(0); }
  .od-btn-ghost { background: rgba(255,255,255,.15); color: #fff; backdrop-filter: blur(6px); }
  .od-btn-ghost:hover { background: rgba(255,255,255,.25); color: #fff; }
  .od-btn-white { background: #fff; color: var(--od-primary); }
  .od-btn-white:hover { color: var(--od-primary); }
  .od-btn-green { background: #10b981; color: #fff; }
  .od-btn-red { background: #ef4444; color: #fff; }

  /* status pill in hero */
  .od-status-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 999px;
    font-size: .8rem;
    font-weight: 700;
    border: 1.5px solid;
    margin-top: 10px;
  }

  /* ── Two-column grid ── */
  .od-grid {
    display: grid;
    grid-template-columns: 1fr 360px;
    gap: 24px;
    align-items: start;
  }
  @media (max-width: 1024px) {
    .od-grid { grid-template-columns: 1fr; }
  }

  /* ── Card ── */
  .od-card {
    background: var(--od-surface);
    border-radius: var(--od-radius);
    border: 1px solid var(--od-border);
    box-shadow: var(--od-shadow);
    overflow: hidden;
  }
  .od-card + .od-card { margin-top: 20px; }
  .od-card-head {
    padding: 16px 20px;
    border-bottom: 1px solid var(--od-border);
    display: flex;
    align-items: center;
    gap: 10px;
    background: #fafbfc;
  }
  .od-card-head-icon {
    width: 34px; height: 34px;
    border-radius: 10px;
    background: var(--od-primary-light);
    display: grid;
    place-items: center;
    font-size: 1rem;
    flex-shrink: 0;
  }
  .od-card-head-title {
    font-size: .98rem;
    font-weight: 700;
    color: var(--od-text);
    margin: 0;
  }
  .od-card-body { padding: 20px; }

  /* ── Sidebar sticky ── */
  .od-sidebar { position: sticky; top: 88px; }
  @media (max-width: 1024px) { .od-sidebar { position: static; } }

  /* ── Summary rows ── */
  .od-sum-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px dashed var(--od-border);
    font-size: .88rem;
  }
  .od-sum-row:last-child { border-bottom: none; }
  .od-sum-label { color: var(--od-muted); }
  .od-sum-val { font-weight: 600; color: var(--od-text); }
  .od-sum-total {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 0 0;
    margin-top: 4px;
    font-size: 1.05rem;
  }
  .od-sum-total-label { font-weight: 700; color: var(--od-text); }
  .od-sum-total-val { font-weight: 800; font-size: 1.3rem; color: var(--od-primary); }

  /* ── Info grid ── */
  .od-info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
  }
  @media (max-width: 640px) { .od-info-grid { grid-template-columns: 1fr; } }
  .od-info-item {
    padding: 12px 16px;
    border-bottom: 1px solid var(--od-border);
    border-right: 1px solid var(--od-border);
  }
  .od-info-item:nth-child(even) { border-right: none; }
  .od-info-item:last-child,
  .od-info-item:nth-last-child(2):nth-child(odd) { border-bottom: none; }
  @media (max-width: 640px) {
    .od-info-item { border-right: none; }
    .od-info-item:last-child { border-bottom: none; }
  }
  .od-info-lbl {
    font-size: .72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .06em;
    color: var(--od-muted);
    margin-bottom: 3px;
  }
  .od-info-val {
    font-size: .9rem;
    font-weight: 600;
    color: var(--od-text);
    word-break: break-word;
  }

  /* address banner */
  .od-address-bar {
    margin: 0;
    padding: 12px 20px;
    background: linear-gradient(90deg,#f0fdf4,#ecfdf5);
    border-top: 1px solid var(--od-border);
    display: flex;
    align-items: flex-start;
    gap: 10px;
    font-size: .88rem;
    color: #065f46;
  }

  /* ── Payment status chip ── */
  .od-pay-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 12px;
    border-radius: 999px;
    font-size: .78rem;
    font-weight: 700;
  }
  .od-pay-chip.paid { background: #d1fae5; color: #065f46; }
  .od-pay-chip.pending { background: #fef3c7; color: #92400e; }

  /* ── Order item row ── */
  .od-item {
    display: grid;
    grid-template-columns: 72px 1fr auto;
    gap: 14px;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid var(--od-border);
    transition: background .15s;
  }
  .od-item:last-child { border-bottom: none; }
  .od-item:hover { background: #fafbff; }
  .od-item-img {
    width: 72px; height: 72px;
    border-radius: 10px;
    object-fit: cover;
    border: 1px solid var(--od-border);
    background: #f8fafc;
  }
  .od-item-name {
    font-size: .9rem;
    font-weight: 700;
    color: var(--od-text);
    text-decoration: none;
    display: block;
    margin-bottom: 4px;
    line-height: 1.4;
  }
  .od-item-name:hover { color: var(--od-primary); }
  .od-item-price {
    font-size: .82rem;
    color: var(--od-muted);
  }
  .od-item-qty {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: .78rem;
    background: var(--od-primary-light);
    color: var(--od-primary);
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 6px;
    margin-top: 4px;
  }
  .od-item-sub {
    text-align: right;
    white-space: nowrap;
  }
  .od-item-sub-val {
    font-size: 1rem;
    font-weight: 800;
    color: var(--od-primary);
  }
  .od-item-sub-lbl {
    font-size: .7rem;
    color: var(--od-muted);
    margin-bottom: 2px;
  }

  /* ── Timeline ── */
  .od-tl { padding: 4px 0 0 40px; position: relative; }
  .od-tl::before {
    content: ''; position: absolute;
    left: 14px; top: 18px; bottom: 0;
    width: 2px;
    background: linear-gradient(180deg,#c7d2fe,#e2e8f0 90%);
  }
  .od-tl-item {
    position: relative;
    margin-bottom: 18px;
  }
  .od-tl-item:last-child { margin-bottom: 0; }
  .od-tl-dot {
    position: absolute;
    left: -40px; top: 2px;
    width: 28px; height: 28px;
    border-radius: 50%;
    display: grid; place-items: center;
    font-size: 13px;
    border: 3px solid #fff;
    box-shadow: 0 2px 8px rgba(0,0,0,.12);
  }
  .od-tl-body {
    background: #f8fafc;
    border-left: 3px solid;
    border-radius: 0 10px 10px 0;
    padding: 8px 14px;
    margin-left: 2px;
  }
  .od-tl-label { font-weight: 700; font-size: .9rem; color: var(--od-text); }
  .od-tl-note { font-size: .8rem; color: var(--od-muted); margin-top: 2px; }
  .od-tl-time { font-size: .73rem; color: #94a3b8; margin-top: 3px; display: flex; align-items: center; gap: 4px; }

  /* ── Proof grid ── */
  .od-proofs {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
    padding: 20px;
  }
  .od-proof-card {
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid var(--od-border);
    transition: all .2s;
  }
  .od-proof-card:hover { transform: translateY(-3px); box-shadow: var(--od-shadow-lg); }
  .od-proof-img { width: 100%; height: 110px; object-fit: cover; cursor: zoom-in; display: block; }
  .od-proof-foot { padding: 8px; display: flex; gap: 6px; justify-content: center; }

  /* ── Lightbox ── */
  .od-lb {
    position: fixed; inset: 0;
    background: rgba(0,0,0,.82);
    display: grid; place-items: center;
    z-index: 9999;
    backdrop-filter: blur(6px);
    padding: 20px;
  }
  .od-lb-box {
    max-width: 90vw; max-height: 90vh;
    background: #fff;
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 32px 64px rgba(0,0,0,.4);
  }
  .od-lb-img { width: 100%; height: auto; max-height: 75vh; object-fit: contain; display: block; }
  .od-lb-bar {
    padding: 12px 16px;
    background: #f8fafc;
    display: flex; justify-content: space-between; align-items: center;
    border-top: 1px solid var(--od-border);
  }

  /* ── Cancel modal ── */
  .od-modal-overlay {
    position: fixed; inset: 0;
    background: rgba(15,23,42,.65);
    backdrop-filter: blur(4px);
    z-index: 9999;
    display: grid; place-items: center; padding: 16px;
  }
  .od-modal {
    background: #fff; border-radius: 18px;
    padding: 28px 24px 22px;
    max-width: 440px; width: 100%;
    box-shadow: 0 24px 60px rgba(0,0,0,.25);
  }
  .od-modal-icon {
    width: 60px; height: 60px;
    margin: 0 auto 14px;
    border-radius: 50%;
    display: grid; place-items: center;
    font-size: 26px;
  }

  /* small btn */
  .od-sm-btn {
    padding: 5px 10px;
    border-radius: 7px;
    font-size: .72rem;
    font-weight: 600;
    border: 1.5px solid var(--od-border);
    background: #fff;
    color: var(--od-muted);
    cursor: pointer;
    display: inline-flex; align-items: center; gap: 4px;
    transition: all .15s;
    text-decoration: none;
  }
  .od-sm-btn:hover { border-color: var(--od-primary); color: var(--od-primary); }

  @media (max-width: 600px) {
    .od-hero { padding: 20px; }
    .od-hero-title { font-size: 1.3rem; }
    .od-item { grid-template-columns: 56px 1fr; }
    .od-item-sub { display: none; }
    .od-hero-actions { gap: 6px; }
    .od-btn { padding: 7px 12px; font-size: .75rem; }
  }
`;

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useGetOrderDetailsQuery(id);
  const order = data?.order || null;

  const [cancelOrder, { isLoading: cancelling }] = useCancelMyOrderMutation();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const [copiedId, setCopiedId] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const currentStatus = order?.fulfillmentStatus || order?.status || order?.orderStatus;
  const canCancel =
    order &&
    ["Unfulfilled", "Processing"].includes(currentStatus) &&
    order.paymentStatus !== "Paid";

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) return toast.error("ກະລຸນາລະບຸເຫດຜົນ");
    try {
      await cancelOrder({ id, reason: cancelReason.trim() }).unwrap();
      toast.success("ຍົກເລີກອໍເດີສຳເລັດ");
      setCancelModalOpen(false);
      setCancelReason("");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "ການຍົກເລີກລົ້ມເຫລວ");
    }
  };

  const copyOrderId = async () => {
    try {
      await navigator.clipboard.writeText(order._id);
      setCopiedId(true);
      toast.success("ຄັດລອກ ID ແລ້ວ");
      setTimeout(() => setCopiedId(false), 2000);
    } catch { toast.error("ຄັດລອກບໍ່ສຳເລັດ"); }
  };

  useEffect(() => {
    if (!error) return;
    if (error?.status === 403) {
      toast.error("ທ່ານບໍ່ມີສິດເບິ່ງອໍເດີນີ້");
      setTimeout(() => navigate("/me/orders", { replace: true }), 1200);
    } else if (error?.status === 404) {
      toast.error("ບໍ່ພົບອໍເດີນີ້");
    } else {
      toast.error(error?.data?.message || "ເກີດຂໍ້ຜິດພາດ");
    }
  }, [error, navigate]);

  if (isLoading) return <Loader />;

  if (!order) {
    return (
      <>
        <MetaData title="ລາຍລະອຽດອໍເດີ" />
        <div className="od-wrap"><style>{CSS}</style>
          <div className="od-inner" style={{ textAlign: "center", paddingTop: 80 }}>
            <div style={{ fontSize: "4rem", marginBottom: 16 }}>📦</div>
            <h3>ບໍ່ພົບອໍເດີນີ້</h3>
            <p style={{ color: "#64748b" }}>ກະລຸນາກວດເບິ່ງ ID ຫຼື ກັບໄປໜ້າ My Orders</p>
            <button className="od-btn od-btn-white" style={{ marginTop: 20, background: "#4f46e5", color: "#fff" }} onClick={() => navigate(-1)}>
              ← ກັບຄືນ
            </button>
          </div>
        </div>
      </>
    );
  }

  const {
    shippingInfo = {}, paymentInfo = {}, orderItems = [],
    user = {}, totalAmount = 0, orderStatus = "Pending",
    createdAt, paymentMethod = order.paymentMethod || "N/A",
    paymentProof = [],
    shippingCarrier = shippingInfo.shippingCarrier || shippingInfo.carrier || "N/A",
    branch = shippingInfo.branch || "N/A",
    shippingAmount = order.shippingAmount || 0,
    discountAmount = order.discountAmount || 0,
  } = order;

  const statusInfo = getStatus(currentStatus || orderStatus);
  const isPaid =
    (paymentInfo?.status || "").toLowerCase() === "paid" ||
    (order.paymentStatus || "").toLowerCase() === "paid";

  const itemsTotal = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);

  const address = [
    shippingInfo?.address,
    shippingInfo?.city,
    shippingInfo?.province,
    shippingInfo?.zipCode,
    shippingInfo?.country,
  ].filter(Boolean).join(", ");

  return (
    <>
      <MetaData title={`Order #${order._id.substring(0, 8)}`} />
      <style>{CSS}</style>

      <div className="od-wrap">
        <div className="od-inner">

          {/* ── Hero ── */}
          <motion.div className="od-hero"
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .4 }}
          >
            <div className="od-hero-top">
              <div>
                <div className="od-hero-eyebrow">IT HUBB · Order Details</div>
                <div className="od-hero-title">ລາຍລະອຽດອໍເດີ</div>
                <div className="od-hero-sub">#{order._id}</div>
                <div className="od-hero-date">📅 {formatDate(createdAt)}</div>
                <span
                  className="od-status-pill"
                  style={{ background: statusInfo.bg, color: statusInfo.color, borderColor: statusInfo.border }}
                >
                  {statusInfo.icon} {statusInfo.label}
                </span>
              </div>

              <div className="od-hero-actions">
                {canCancel && (
                  <button className="od-btn od-btn-red" onClick={() => setCancelModalOpen(true)} disabled={cancelling}>
                    <i className="fas fa-ban" /> ຍົກເລີກ
                  </button>
                )}
                <button className="od-btn od-btn-ghost" onClick={copyOrderId}>
                  <i className={`fas fa-${copiedId ? "check" : "copy"}`} />
                  {copiedId ? "ຄັດລອກແລ້ວ" : "ຄັດລອກ ID"}
                </button>
                <a className="od-btn od-btn-green" href={`/invoice/orders/${order._id}`} target="_blank" rel="noreferrer">
                  <i className="fas fa-file-invoice" /> ໃບບິນ
                </a>
                <button className="od-btn od-btn-ghost" onClick={() => navigate(-1)}>
                  ← ກັບຄືນ
                </button>
              </div>
            </div>
          </motion.div>

          {/* ── Timeline (full width) ── */}
          {Array.isArray(order.events) && order.events.length > 0 && (
            <motion.div className="od-card" style={{ marginBottom: 24 }}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .4, delay: .05 }}
            >
              <div className="od-card-head">
                <div className="od-card-head-icon">🕓</div>
                <h3 className="od-card-head-title">ປະຫວັດອໍເດີ</h3>
              </div>
              <div className="od-card-body">
                <OrderTimeline events={order.events} />
              </div>
            </motion.div>
          )}

          {/* ── 2-column grid ── */}
          <div className="od-grid">

            {/* ── LEFT: items ── */}
            <div>
              {/* Order items */}
              <motion.div className="od-card"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .4, delay: .1 }}
              >
                <div className="od-card-head">
                  <div className="od-card-head-icon">🛒</div>
                  <h3 className="od-card-head-title">ລາຍການສິນຄ້າ ({orderItems.length} ລາຍການ)</h3>
                </div>
                {orderItems.map((item, i) => (
                  <div className="od-item" key={i}>
                    <Link to={`/product/${item.product}`}>
                      <img src={item.image} alt={item.name} className="od-item-img"
                        onError={(e) => { e.currentTarget.src = "/images/default_product.png"; }} />
                    </Link>
                    <div>
                      <Link to={`/product/${item.product}`} className="od-item-name">{item.name}</Link>
                      <div className="od-item-price">{formatLAK(item.price)} / ຊິ້ນ</div>
                      <span className="od-item-qty">× {item.quantity} ຊິ້ນ</span>
                    </div>
                    <div className="od-item-sub">
                      <div className="od-item-sub-lbl">ລວມ</div>
                      <div className="od-item-sub-val">{formatLAK(item.price * item.quantity)}</div>
                    </div>
                  </div>
                ))}
              </motion.div>

              {/* Shipping info */}
              <motion.div className="od-card" style={{ marginTop: 20 }}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .4, delay: .15 }}
              >
                <div className="od-card-head">
                  <div className="od-card-head-icon">📍</div>
                  <h3 className="od-card-head-title">ຂໍ້ມູນການຈັດສົ່ງ</h3>
                </div>
                <div className="od-info-grid">
                  <div className="od-info-item">
                    <div className="od-info-lbl">ຊື່ຜູ້ຮັບ</div>
                    <div className="od-info-val">{user?.name || shippingInfo?.fullName || "N/A"}</div>
                  </div>
                  <div className="od-info-item">
                    <div className="od-info-lbl">ເບີໂທ</div>
                    <div className="od-info-val">{shippingInfo?.phoneNo || "N/A"}</div>
                  </div>
                  <div className="od-info-item">
                    <div className="od-info-lbl">ຜູ້ຂົນສົ່ງ</div>
                    <div className="od-info-val">{shippingCarrier}</div>
                  </div>
                  <div className="od-info-item">
                    <div className="od-info-lbl">ສາຂາ / ຈຸດຮັບ</div>
                    <div className="od-info-val">{branch}</div>
                  </div>
                </div>
                {address && (
                  <div className="od-address-bar">
                    <i className="fas fa-map-marker-alt" style={{ marginTop: 2 }} />
                    <span>{address}</span>
                  </div>
                )}
              </motion.div>

              {/* Payment proofs */}
              {paymentProof && paymentProof.length > 0 && (
                <motion.div className="od-card" style={{ marginTop: 20 }}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .4, delay: .2 }}
                >
                  <div className="od-card-head">
                    <div className="od-card-head-icon">📄</div>
                    <h3 className="od-card-head-title">ຫຼັກຖານການໂອນ</h3>
                  </div>
                  <div className="od-proofs">
                    {paymentProof.map((p, idx) => {
                      const url = resolveFileUrl(p.url || p.filename || "");
                      const isImg = /\.(png|jpe?g|webp|gif)$/i.test(url);
                      return (
                        <div className="od-proof-card" key={idx}>
                          {isImg
                            ? <img src={url} alt={`proof-${idx}`} className="od-proof-img" onClick={() => { setLightboxSrc(url); setLightboxOpen(true); }} />
                            : <div style={{ height: 110, display: "grid", placeItems: "center", color: "#64748b" }}><i className="fas fa-file-pdf fa-2x" /></div>
                          }
                          <div className="od-proof-foot">
                            <button className="od-sm-btn" onClick={() => window.open(url, "_blank")}><i className="fas fa-eye" /> ເບິ່ງ</button>
                            <a href={url} download className="od-sm-btn"><i className="fas fa-download" /></a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </div>

            {/* ── RIGHT: Sidebar ── */}
            <div className="od-sidebar">
              {/* Order summary */}
              <motion.div className="od-card"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .4, delay: .12 }}
              >
                <div className="od-card-head">
                  <div className="od-card-head-icon">📊</div>
                  <h3 className="od-card-head-title">ສະຫຼຸບການສັ່ງຊື້</h3>
                </div>
                <div className="od-card-body">
                  <div className="od-sum-row">
                    <span className="od-sum-label">ລາຄາສິນຄ້າ</span>
                    <span className="od-sum-val">{formatLAK(itemsTotal)}</span>
                  </div>
                  <div className="od-sum-row">
                    <span className="od-sum-label">ຄ່າຂົນສົ່ງ</span>
                    <span className="od-sum-val" style={{ color: shippingAmount === 0 ? "#10b981" : undefined }}>
                      {shippingAmount === 0 ? "ຟຣີ" : formatLAK(shippingAmount)}
                    </span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="od-sum-row">
                      <span className="od-sum-label">ສ່ວນຫຼຸດ</span>
                      <span className="od-sum-val" style={{ color: "#ef4444" }}>-{formatLAK(discountAmount)}</span>
                    </div>
                  )}
                  <div className="od-sum-total">
                    <span className="od-sum-total-label">ຍອດທັງໝົດ</span>
                    <span className="od-sum-total-val">{formatLAK(totalAmount)}</span>
                  </div>
                </div>
              </motion.div>

              {/* Payment status */}
              <motion.div className="od-card" style={{ marginTop: 20 }}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .4, delay: .17 }}
              >
                <div className="od-card-head">
                  <div className="od-card-head-icon">💳</div>
                  <h3 className="od-card-head-title">ການຊຳລະ</h3>
                </div>
                <div className="od-card-body">
                  <div className="od-sum-row">
                    <span className="od-sum-label">ວິທີ</span>
                    <span className="od-sum-val">
                      {PAYMENT_ICONS[paymentMethod] || "💰"} {PAYMENT_LABELS[paymentMethod] || paymentMethod}
                    </span>
                  </div>
                  <div className="od-sum-row">
                    <span className="od-sum-label">ສະຖານະ</span>
                    <span className={`od-pay-chip ${isPaid ? "paid" : "pending"}`}>
                      {isPaid ? "✅ ຊຳລະແລ້ວ" : `⏳ ${order.paymentStatus || "ລໍຖ້າ"}`}
                    </span>
                  </div>
                  {paymentInfo?.id && (
                    <div className="od-sum-row">
                      <span className="od-sum-label">Ref.</span>
                      <span className="od-sum-val" style={{ fontSize: ".78rem", fontFamily: "monospace" }}>{paymentInfo.id}</span>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Order meta */}
              <motion.div className="od-card" style={{ marginTop: 20 }}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .4, delay: .22 }}
              >
                <div className="od-card-head">
                  <div className="od-card-head-icon">🔖</div>
                  <h3 className="od-card-head-title">ຂໍ້ມູນທົ່ວໄປ</h3>
                </div>
                <div className="od-card-body">
                  <div className="od-sum-row">
                    <span className="od-sum-label">ລະຫັດ</span>
                    <span className="od-sum-val" style={{ fontSize: ".78rem", fontFamily: "monospace", wordBreak: "break-all" }}>{order._id}</span>
                  </div>
                  <div className="od-sum-row">
                    <span className="od-sum-label">ວັນທີ</span>
                    <span className="od-sum-val" style={{ fontSize: ".82rem" }}>{formatDate(createdAt)}</span>
                  </div>
                  <div className="od-sum-row" style={{ borderBottom: "none" }}>
                    <span className="od-sum-label">ສະຖານະ</span>
                    <span className="od-pay-chip" style={{ background: statusInfo.bg, color: statusInfo.color }}>
                      {statusInfo.icon} {statusInfo.label}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* ── Cancel Modal ── */}
        <AnimatePresence>
          {cancelModalOpen && (
            <motion.div className="od-modal-overlay"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !cancelling && setCancelModalOpen(false)}
            >
              <motion.div className="od-modal"
                onClick={(e) => e.stopPropagation()}
                initial={{ scale: .9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: .9, opacity: 0 }}
              >
                <div className="od-modal-icon" style={{ background: "#fee2e2", color: "#dc2626" }}>
                  <i className="fas fa-ban" />
                </div>
                <h4 style={{ textAlign: "center", margin: "0 0 8px", color: "#1e293b" }}>ຢືນຢັນຍົກເລີກ?</h4>
                <p style={{ textAlign: "center", color: "#64748b", fontSize: ".88rem", marginBottom: 16 }}>
                  ສິນຄ້າຈະຄືນກັບສາງ — ການກະທຳນີ້ບໍ່ສາມາດຢ້ອນຄືນ
                </p>
                <label style={{ fontSize: ".85rem", fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>
                  ເຫດຜົນ <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <textarea
                  value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}
                  rows={3} disabled={cancelling} autoFocus
                  placeholder="ສັ່ງຜິດ, ບໍ່ຕ້ອງການ, ໄດ້ທີ່ອື່ນແລ້ວ..."
                  style={{ width: "100%", padding: "10px 12px", border: "2px solid #e2e8f0", borderRadius: 10, fontSize: ".9rem", fontFamily: "inherit", resize: "vertical", marginBottom: 16, outline: "none" }}
                />
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => { setCancelModalOpen(false); setCancelReason(""); }} disabled={cancelling}
                    style={{ flex: 1, padding: "11px", border: "2px solid #e2e8f0", background: "#fff", color: "#64748b", borderRadius: 10, fontWeight: 700, cursor: "pointer" }}>
                    ກັບຄືນ
                  </button>
                  <button onClick={handleCancelOrder} disabled={cancelling || !cancelReason.trim()}
                    style={{ flex: 1, padding: "11px", background: "linear-gradient(135deg,#ef4444,#dc2626)", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, cursor: !cancelReason.trim() ? "not-allowed" : "pointer", opacity: !cancelReason.trim() ? .6 : 1 }}>
                    {cancelling ? "ກຳລັງຍົກເລີກ..." : "ຢືນຢັນ"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Lightbox ── */}
        <AnimatePresence>
          {lightboxOpen && (
            <motion.div className="od-lb"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setLightboxOpen(false)}
            >
              <motion.div className="od-lb-box"
                onClick={(e) => e.stopPropagation()}
                initial={{ scale: .85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: .85, opacity: 0 }}
              >
                <img src={lightboxSrc} alt="preview" className="od-lb-img" />
                <div className="od-lb-bar">
                  <span style={{ color: "#64748b", fontSize: ".82rem" }}>ກົດພາຍນອກເພື່ອປິດ</span>
                  <button className="od-sm-btn" onClick={() => setLightboxOpen(false)}><i className="fas fa-times" /> ປິດ</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

/* ── Timeline sub-component ── */
function OrderTimeline({ events = [] }) {
  const sorted = [...events].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  return (
    <div className="od-tl">
      {sorted.map((ev, idx) => {
        const cfg = EVENT_CONFIG[ev.type] || EVENT_CONFIG.note;
        return (
          <div className="od-tl-item" key={ev._id || idx}>
            <div className="od-tl-dot" style={{ background: cfg.color }}>{cfg.icon}</div>
            <div className="od-tl-body" style={{ borderLeftColor: cfg.color }}>
              <div className="od-tl-label">{cfg.label}</div>
              {ev.note && <div className="od-tl-note">{ev.note}</div>}
              <div className="od-tl-time" title={new Date(ev.timestamp).toLocaleString()}>
                <i className="far fa-clock" /> {formatRelativeTime(ev.timestamp)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
