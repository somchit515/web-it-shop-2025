import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useGetMyOrdersQuery } from "../redux/api/OrderApi";
import toast from "react-hot-toast";
import MetaData from "../layout/MetaData";
import { useDispatch } from "react-redux";
import { clearCart } from "../redux/features/cartSlice";
import { clearShippingInfo } from "../redux/features/shippingSlice";

const STATUS_TABS = [
  { value: "all",        label: "ທັງໝົດ",        icon: "📋" },
  { value: "processing", label: "ດຳເນີນ",        icon: "⏳" },
  { value: "shipped",    label: "ຈັດສົ່ງ",        icon: "🚚" },
  { value: "delivered",  label: "ສຳເລັດ",         icon: "✅" },
  { value: "cancelled",  label: "ຍົກເລີກ",        icon: "❌" },
];

const FULFILLMENT_STEPS = [
  { key: "unfulfilled", label: "ລໍຖ້າ",    icon: "📋" },
  { key: "processing",  label: "ດຳເນີນ",   icon: "⚙️" },
  { key: "shipped",     label: "ຈັດສົ່ງ",   icon: "🚚" },
  { key: "delivered",   label: "ສຳເລັດ",    icon: "✅" },
];

function getStepIndex(status) {
  const s = (status || "").toLowerCase();
  if (s === "delivered") return 3;
  if (s === "shipped")   return 2;
  if (s === "processing") return 1;
  return 0;
}

export default function MyOrders() {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const [searchParams] = useSearchParams();
  const [copiedId,     setCopiedId]     = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm,   setSearchTerm]   = useState("");

  const { data: allData, isLoading, error, isError, refetch } = useGetMyOrdersQuery({});
  const { data: filteredData } = useGetMyOrdersQuery({ status: statusFilter });

  const allOrders     = Array.isArray(allData?.orders)      ? allData.orders      : [];
  const serverFiltered = Array.isArray(filteredData?.orders) ? filteredData.orders : [];
  const orderSuccess  = searchParams.get("order_success");

  useEffect(() => {
    if (isError) toast.error(error?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ");
    if (orderSuccess) {
      dispatch(clearCart());
      dispatch(clearShippingInfo());
      (async () => {
        try { await refetch(); toast.success("ຄຳສັ່ງຊື້ສຳເລັດ!"); }
        catch (err) { console.warn("Refetch failed", err); }
        finally { navigate("/me/orders", { replace: true }); }
      })();
    }
  }, [isError, error, orderSuccess, dispatch, navigate, refetch]);

  const formatPrice = (val) => {
    const n = Number(val ?? 0);
    return `₭ ${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success("ຄັດລອກສຳເລັດ!");
      setTimeout(() => setCopiedId(null), 2000);
    } catch { toast.error("ຄັດລອກລົ້ມເຫລວ"); }
  };

  const getPaymentBadge = (method, status) => {
    if (method === "PayAtStore")
      return { color: "#065f46", bg: "#dcfce7", border: "#86efac", label: "🏪 ຈ່າຍທີ່ຮ້ານ" };
    if (method === "COD")
      return { color: "#b45309", bg: "#fef3c7", border: "#fbbf24", label: "💵 COD" };
    if (status === "Paid")
      return { color: "#065f46", bg: "#d1fae5", border: "#6ee7b7", label: "✅ ຊຳລະແລ້ວ" };
    if (status === "AwaitingProof")
      return { color: "#1e40af", bg: "#dbeafe", border: "#93c5fd", label: "🏦 ລໍຖ້າຢືນຢັນ" };
    if (status === "Rejected")
      return { color: "#991b1b", bg: "#fee2e2", border: "#fca5a5", label: "❌ ຖືກປະຕິເສດ" };
    return { color: "#92400e", bg: "#fef3c7", border: "#fbbf24", label: "⏳ ລໍຖ້າຊຳລະ" };
  };

  const searchLower = searchTerm.toLowerCase();
  const filteredOrders = serverFiltered.filter((o) => {
    if (!searchTerm) return true;
    return (
      o._id?.toLowerCase().includes(searchLower) ||
      o.user?.name?.toLowerCase().includes(searchLower)
    );
  });

  const countBy = (s) =>
    allOrders.filter((o) => (o.fulfillmentStatus || o.orderStatus)?.toLowerCase() === s).length;

  const stats = {
    total:      allOrders.length,
    processing: countBy("processing"),
    shipped:    countBy("shipped"),
    delivered:  countBy("delivered"),
  };

  if (isLoading) return (
    <>
      <style>{css}</style>
      <div className="mo-page">
        <MetaData title="ຄຳສັ່ງຊື້ຂອງຂ້ອຍ" />
        <div className="mo-loading">
          <div className="mo-spinner" />
          <p>ກຳລັງໂຫຼດ...</p>
        </div>
      </div>
    </>
  );

  if (!isLoading && allOrders.length === 0) return (
    <>
      <style>{css}</style>
      <div className="mo-page">
        <MetaData title="ຄຳສັ່ງຊື້ຂອງຂ້ອຍ" />
        <div className="mo-empty-wrap">
          <div className="mo-empty">
            <div className="mo-empty-icon">📦</div>
            <h3>ຍັງບໍ່ມີຄຳສັ່ງຊື້</h3>
            <p>ເມື່ອທ່ານສັ່ງຊື້ສິນຄ້າ, ລາຍການຈະປະກົດທີ່ນີ້</p>
            <Link to="/" className="mo-shop-btn">
              <i className="fas fa-shopping-bag" /> ເລີ່ມຊັອບປິ້ງ
            </Link>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{css}</style>
      <div className="mo-page">
        <MetaData title="ຄຳສັ່ງຊື້ຂອງຂ້ອຍ" />

        {/* ── Hero Header ── */}
        <div className="mo-hero">
          <div className="mo-hero-text">
            <h1>ຄຳສັ່ງຊື້ຂອງຂ້ອຍ</h1>
            <p>ຕິດຕາມ ແລະ ຈັດການຄຳສັ່ງຊື້ທັງໝົດ</p>
          </div>
          <div className="mo-hero-stats">
            <div className="mo-hstat">
              <span className="mo-hstat-n">{stats.total}</span>
              <span className="mo-hstat-l">ທັງໝົດ</span>
            </div>
            <div className="mo-hstat-div" />
            <div className="mo-hstat">
              <span className="mo-hstat-n" style={{ color: "#fbbf24" }}>{stats.processing}</span>
              <span className="mo-hstat-l">ດຳເນີນ</span>
            </div>
            <div className="mo-hstat-div" />
            <div className="mo-hstat">
              <span className="mo-hstat-n" style={{ color: "#60a5fa" }}>{stats.shipped}</span>
              <span className="mo-hstat-l">ຈັດສົ່ງ</span>
            </div>
            <div className="mo-hstat-div" />
            <div className="mo-hstat">
              <span className="mo-hstat-n" style={{ color: "#34d399" }}>{stats.delivered}</span>
              <span className="mo-hstat-l">ສຳເລັດ</span>
            </div>
          </div>
        </div>

        {/* ── Status Pill Tabs ── */}
        <div className="mo-tabs-wrap">
          <div className="mo-tabs">
            {STATUS_TABS.map((t) => (
              <button
                key={t.value}
                className={`mo-tab ${statusFilter === t.value ? "active" : ""}`}
                onClick={() => setStatusFilter(t.value)}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
                {t.value === "all" && (
                  <span className="mo-tab-count">{allOrders.length}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Search ── */}
        <div className="mo-search-wrap">
          <div className="mo-search">
            <i className="fas fa-search mo-search-ico" />
            <input
              className="mo-search-input"
              placeholder="ຄົ້ນຫາດ້ວຍເລກອໍເດີ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="mo-search-clear" onClick={() => setSearchTerm("")}>
                <i className="fas fa-times" />
              </button>
            )}
          </div>
          <p className="mo-result-count">
            ສະແດງ <strong>{filteredOrders.length}</strong> ລາຍການ
          </p>
        </div>

        {/* ── Orders List ── */}
        {filteredOrders.length === 0 ? (
          <div className="mo-no-result">
            <span>🔍</span>
            <p>ບໍ່ພົບຄຳສັ່ງຊື້ທີ່ຄົ້ນຫາ</p>
          </div>
        ) : (
          <div className="mo-list">
            {filteredOrders.map((order) => {
              const orderId   = order._id || "";
              const displayId = orderId.substring(0, 16);
              const curStatus = (order.fulfillmentStatus || order.orderStatus || "").toLowerCase();
              const isCancelled = curStatus === "cancelled";
              const stepIdx   = isCancelled ? -1 : getStepIndex(curStatus);
              const payment   = getPaymentBadge(order.paymentMethod, order.paymentStatus);
              const dateText  = order.createdAt
                ? new Date(order.createdAt).toLocaleDateString("lo-LA", {
                    year: "numeric", month: "short", day: "2-digit",
                    hour: "2-digit", minute: "2-digit",
                  })
                : "—";

              const items = Array.isArray(order.orderItems) ? order.orderItems : [];
              const showCancel =
                ["unfulfilled", "processing"].includes(curStatus) &&
                order.paymentStatus !== "Paid";
              const needsUpload =
                order.paymentMethod === "BankTransfer" &&
                (order.paymentStatus === "Pending" || order.paymentStatus === "AwaitingProof") &&
                (!order.paymentProof || order.paymentProof.length === 0);

              return (
                <div key={orderId} className={`mo-card ${isCancelled ? "cancelled" : ""}`}>

                  {/* ── Card Top ── */}
                  <div className="mo-card-top">
                    <div className="mo-card-id">
                      <span className="mo-id-label">Order ID</span>
                      <span className="mo-id-val">#{displayId}…</span>
                      <button
                        className="mo-copy"
                        onClick={() => copyToClipboard(orderId, orderId)}
                        title="ຄັດລອກ"
                      >
                        <i className={`fas fa-${copiedId === orderId ? "check" : "copy"}`} />
                      </button>
                    </div>
                    <div className="mo-card-meta">
                      <span className="mo-date">
                        <i className="far fa-clock" /> {dateText}
                      </span>
                      <span
                        className="mo-pay-badge"
                        style={{ color: payment.color, background: payment.bg, border: `1px solid ${payment.border}` }}
                      >
                        {payment.label}
                      </span>
                    </div>
                  </div>

                  {/* ── Product Thumbnails ── */}
                  {items.length > 0 && (
                    <div className="mo-items">
                      <div className="mo-thumbs">
                        {items.slice(0, 4).map((item, idx) => (
                          <div key={idx} className="mo-thumb-wrap">
                            <img
                              src={item.image || "/images/default_product.png"}
                              alt={item.name}
                              className="mo-thumb"
                              onError={(e) => { e.currentTarget.src = "/images/default_product.png"; }}
                            />
                            <span className="mo-thumb-qty">×{item.quantity}</span>
                          </div>
                        ))}
                        {items.length > 4 && (
                          <div className="mo-thumb-more">+{items.length - 4}</div>
                        )}
                      </div>
                      <div className="mo-items-summary">
                        <span className="mo-items-name">
                          {items[0].name}
                          {items.length > 1 && ` ແລະ ${items.length - 1} ລາຍການ`}
                        </span>
                        <span className="mo-total">{formatPrice(order.totalAmount)}</span>
                      </div>
                    </div>
                  )}

                  {/* ── Progress Steps ── */}
                  {!isCancelled ? (
                    <div className="mo-steps">
                      {FULFILLMENT_STEPS.map((step, i) => (
                        <React.Fragment key={step.key}>
                          <div className={`mo-step ${i <= stepIdx ? "done" : ""} ${i === stepIdx ? "current" : ""}`}>
                            <div className="mo-step-dot">{i <= stepIdx ? step.icon : ""}</div>
                            <span className="mo-step-label">{step.label}</span>
                          </div>
                          {i < FULFILLMENT_STEPS.length - 1 && (
                            <div className={`mo-step-line ${i < stepIdx ? "done" : ""}`} />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  ) : (
                    <div className="mo-cancelled-bar">
                      <i className="fas fa-ban" /> ອໍເດີນີ້ຖືກຍົກເລີກ
                    </div>
                  )}

                  {/* ── Upload Slip Alert ── */}
                  {needsUpload && (
                    <div className="mo-upload-alert">
                      <i className="fas fa-exclamation-circle" />
                      <span>ກະລຸນາອັບໂຫຼດໃບຊຳລະເງິນ ເພື່ອດຳເນີນການສັ່ງຊື້</span>
                      <Link to={`/orders/${orderId}/upload-proof`} className="mo-upload-btn">
                        ອັບໂຫຼດ
                      </Link>
                    </div>
                  )}

                  {/* ── Tracking Code ── */}
                  {order.trackingCode && (
                    <div className="mo-tracking">
                      <i className="fas fa-truck" />
                      <span>ເລກພັດດຸ: <strong>{order.trackingCode}</strong></span>
                    </div>
                  )}

                  {/* ── Actions ── */}
                  <div className="mo-actions">
                    <Link to={`/me/orders/${orderId}`} className="mo-btn primary">
                      <i className="fas fa-eye" /> ລາຍລະອຽດ
                    </Link>
                    <Link to={`/invoice/orders/${orderId}`} className="mo-btn ghost">
                      <i className="fas fa-file-invoice" /> ໃບບິນ
                    </Link>
                    {showCancel && (
                      <Link to={`/me/orders/${orderId}`} className="mo-btn cancel">
                        <i className="fas fa-ban" /> ຍົກເລີກ
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;600;700&display=swap');

* { box-sizing: border-box; }

.mo-page {
  font-family: "Noto Sans Lao","Phetsarath OT",sans-serif;
  max-width: 100%;
  margin: 0 auto;
  padding: 2rem 2.5rem 4rem;
  min-height: 100vh;
}

@media (min-width: 1200px) {
  .mo-list { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem; }
  .mo-hero { padding: 2.25rem 2.5rem; }
}

/* ── Loading ── */
.mo-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  gap: 1rem;
  color: #64748b;
}
.mo-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e2e8f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: mo-spin 0.9s linear infinite;
}
@keyframes mo-spin { to { transform: rotate(360deg); } }

/* ── Empty ── */
.mo-empty-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}
.mo-empty {
  text-align: center;
  background: white;
  padding: 3.5rem 2.5rem;
  border-radius: 24px;
  box-shadow: 0 4px 24px rgba(0,0,0,.08);
  max-width: 420px;
}
.mo-empty-icon { font-size: 5rem; margin-bottom: 1.5rem; opacity: .45; }
.mo-empty h3 { font-size: 1.5rem; font-weight: 700; color: #1e293b; margin-bottom: .5rem; }
.mo-empty p { color: #64748b; margin-bottom: 2rem; }
.mo-shop-btn {
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  padding: .875rem 2rem;
  background: linear-gradient(135deg,#667eea,#764ba2);
  color: white;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 700;
  transition: all .3s;
}
.mo-shop-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(102,126,234,.4); color: white; }

/* ── Hero ── */
.mo-hero {
  background: linear-gradient(135deg,#667eea 0%,#764ba2 100%);
  border-radius: 20px;
  padding: 2rem 2rem 1.75rem;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.75rem;
  gap: 1rem;
  flex-wrap: wrap;
}
.mo-hero-text h1 { font-size: 1.75rem; font-weight: 800; margin: 0 0 .25rem; }
.mo-hero-text p  { margin: 0; opacity: .8; font-size: .95rem; }
.mo-hero-stats   { display: flex; align-items: center; gap: 1.25rem; }
.mo-hstat        { text-align: center; }
.mo-hstat-n      { display: block; font-size: 1.75rem; font-weight: 800; line-height: 1; }
.mo-hstat-l      { display: block; font-size: .7rem; opacity: .7; margin-top: .2rem; text-transform: uppercase; letter-spacing: .5px; }
.mo-hstat-div    { width: 1px; height: 36px; background: rgba(255,255,255,.25); }

/* ── Status Tabs ── */
.mo-tabs-wrap {
  overflow-x: auto;
  margin-bottom: 1.25rem;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.mo-tabs-wrap::-webkit-scrollbar { display: none; }
.mo-tabs {
  display: flex;
  gap: .5rem;
  padding-bottom: 2px;
  min-width: max-content;
}
.mo-tab {
  display: inline-flex;
  align-items: center;
  gap: .4rem;
  padding: .55rem 1.1rem;
  border-radius: 50px;
  border: 2px solid #e2e8f0;
  background: white;
  color: #64748b;
  font-size: .85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all .2s;
  white-space: nowrap;
  font-family: inherit;
}
.mo-tab:hover { border-color: #667eea; color: #667eea; }
.mo-tab.active {
  background: linear-gradient(135deg,#667eea,#764ba2);
  border-color: transparent;
  color: white;
  box-shadow: 0 4px 12px rgba(102,126,234,.35);
}
.mo-tab-count {
  background: rgba(255,255,255,.25);
  border-radius: 50px;
  padding: .1rem .5rem;
  font-size: .75rem;
}
.mo-tab:not(.active) .mo-tab-count {
  background: #e2e8f0;
  color: #475569;
}

/* ── Search ── */
.mo-search-wrap {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}
.mo-search {
  flex: 1;
  min-width: 220px;
  position: relative;
}
.mo-search-ico {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}
.mo-search-input {
  width: 100%;
  padding: .7rem 2.5rem .7rem 2.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 50px;
  font-size: .9rem;
  font-family: inherit;
  transition: border-color .2s, box-shadow .2s;
}
.mo-search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102,126,234,.1);
}
.mo-search-clear {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: .25rem;
}
.mo-result-count { color: #64748b; font-size: .85rem; margin: 0; white-space: nowrap; }
.mo-result-count strong { color: #1e293b; }

/* ── List ── */
.mo-list { display: flex; flex-direction: column; gap: 1.25rem; }

/* ── Card ── */
.mo-card {
  background: white;
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(0,0,0,.07);
  border: 1px solid #f1f5f9;
  overflow: hidden;
  transition: box-shadow .25s, transform .25s;
}
.mo-card:hover {
  box-shadow: 0 8px 28px rgba(102,126,234,.14);
  transform: translateY(-2px);
}
.mo-card.cancelled { opacity: .75; border-color: #fecaca; }

/* Card Top */
.mo-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  flex-wrap: wrap;
  gap: .75rem;
}
.mo-card-id { display: flex; align-items: center; gap: .5rem; }
.mo-id-label { font-size: .72rem; color: #94a3b8; text-transform: uppercase; letter-spacing: .5px; }
.mo-id-val   { font-family: monospace; font-weight: 700; color: #667eea; font-size: .9rem; }
.mo-copy {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: .2rem .4rem;
  border-radius: 6px;
  transition: background .15s, color .15s;
}
.mo-copy:hover { background: #e2e8f0; color: #667eea; }

.mo-card-meta { display: flex; align-items: center; gap: .75rem; flex-wrap: wrap; }
.mo-date { font-size: .8rem; color: #94a3b8; display: flex; align-items: center; gap: .35rem; }
.mo-pay-badge {
  font-size: .72rem;
  font-weight: 700;
  padding: .3rem .7rem;
  border-radius: 50px;
  letter-spacing: .3px;
}

/* Product Thumbnails */
.mo-items {
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px solid #f1f5f9;
  flex-wrap: wrap;
}
.mo-thumbs { display: flex; gap: .5rem; flex-shrink: 0; }
.mo-thumb-wrap { position: relative; }
.mo-thumb {
  width: 54px;
  height: 54px;
  border-radius: 10px;
  object-fit: cover;
  border: 2px solid #e2e8f0;
}
.mo-thumb-qty {
  position: absolute;
  bottom: -4px;
  right: -4px;
  background: #667eea;
  color: white;
  font-size: .6rem;
  font-weight: 700;
  padding: .1rem .3rem;
  border-radius: 6px;
  line-height: 1.4;
}
.mo-thumb-more {
  width: 54px;
  height: 54px;
  border-radius: 10px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: .8rem;
  font-weight: 700;
  color: #64748b;
  border: 2px solid #e2e8f0;
}
.mo-items-summary { flex: 1; min-width: 0; }
.mo-items-name {
  display: block;
  font-size: .88rem;
  color: #374151;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: .2rem;
}
.mo-total { font-size: 1.2rem; font-weight: 800; color: #667eea; }

/* Progress Steps */
.mo-steps {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  gap: 0;
  border-bottom: 1px solid #f1f5f9;
}
.mo-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .3rem;
  flex-shrink: 0;
  opacity: .35;
}
.mo-step.done  { opacity: 1; }
.mo-step.current { opacity: 1; }
.mo-step-dot {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  transition: all .25s;
}
.mo-step.done .mo-step-dot {
  background: linear-gradient(135deg,#667eea,#764ba2);
  box-shadow: 0 3px 10px rgba(102,126,234,.35);
}
.mo-step.current .mo-step-dot {
  background: linear-gradient(135deg,#667eea,#764ba2);
  box-shadow: 0 0 0 4px rgba(102,126,234,.2);
  animation: mo-pulse 1.8s ease-in-out infinite;
}
@keyframes mo-pulse {
  0%,100% { box-shadow: 0 0 0 4px rgba(102,126,234,.2); }
  50%      { box-shadow: 0 0 0 8px rgba(102,126,234,.1); }
}
.mo-step-label { font-size: .65rem; color: #64748b; font-weight: 600; white-space: nowrap; }
.mo-step.done .mo-step-label,
.mo-step.current .mo-step-label { color: #667eea; }

.mo-step-line {
  flex: 1;
  height: 3px;
  background: #e2e8f0;
  border-radius: 2px;
  margin: 0 .25rem;
  margin-bottom: 1.15rem;
  transition: background .3s;
}
.mo-step-line.done {
  background: linear-gradient(90deg,#667eea,#764ba2);
}

/* Cancelled bar */
.mo-cancelled-bar {
  padding: .75rem 1.25rem;
  background: #fee2e2;
  color: #991b1b;
  font-size: .85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: .5rem;
  border-bottom: 1px solid #fecaca;
}

/* Upload Alert */
.mo-upload-alert {
  display: flex;
  align-items: center;
  gap: .75rem;
  padding: .75rem 1.25rem;
  background: #fffbeb;
  border-bottom: 1px solid #fde68a;
  color: #92400e;
  font-size: .85rem;
  font-weight: 600;
  flex-wrap: wrap;
}
.mo-upload-alert i { color: #f59e0b; }
.mo-upload-btn {
  margin-left: auto;
  padding: .35rem 1rem;
  background: #f59e0b;
  color: white;
  border-radius: 50px;
  text-decoration: none;
  font-size: .8rem;
  font-weight: 700;
  white-space: nowrap;
  transition: background .2s;
}
.mo-upload-btn:hover { background: #d97706; color: white; }

/* Tracking */
.mo-tracking {
  display: flex;
  align-items: center;
  gap: .5rem;
  padding: .6rem 1.25rem;
  background: #f0fdf4;
  border-bottom: 1px solid #bbf7d0;
  font-size: .82rem;
  color: #166534;
}

/* Actions */
.mo-actions {
  display: flex;
  gap: .75rem;
  padding: 1rem 1.25rem;
  flex-wrap: wrap;
}
.mo-btn {
  display: inline-flex;
  align-items: center;
  gap: .45rem;
  padding: .6rem 1.2rem;
  border-radius: 10px;
  font-size: .85rem;
  font-weight: 700;
  text-decoration: none;
  transition: all .2s;
  font-family: inherit;
  cursor: pointer;
  border: none;
}
.mo-btn.primary {
  background: linear-gradient(135deg,#667eea,#764ba2);
  color: white;
  flex: 1;
  justify-content: center;
}
.mo-btn.primary:hover {
  box-shadow: 0 6px 16px rgba(102,126,234,.4);
  transform: translateY(-1px);
  color: white;
}
.mo-btn.ghost {
  background: white;
  border: 2px solid #e2e8f0;
  color: #475569;
}
.mo-btn.ghost:hover { border-color: #667eea; color: #667eea; background: #f8f5ff; }
.mo-btn.cancel {
  background: white;
  border: 2px solid #fecaca;
  color: #ef4444;
}
.mo-btn.cancel:hover { background: #fee2e2; }

/* No results */
.mo-no-result {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(0,0,0,.07);
  color: #94a3b8;
  font-size: 1rem;
}
.mo-no-result span { font-size: 3.5rem; display: block; margin-bottom: 1rem; }

/* ── Responsive ── */
@media (max-width: 600px) {
  .mo-hero { padding: 1.5rem; }
  .mo-hero-text h1 { font-size: 1.35rem; }
  .mo-hero-stats { gap: .75rem; }
  .mo-hstat-n { font-size: 1.35rem; }
  .mo-steps { padding: 1rem .75rem; }
  .mo-step-dot { width: 28px; height: 28px; font-size: .85rem; }
  .mo-step-label { font-size: .58rem; }
  .mo-actions { flex-direction: column; }
  .mo-btn.primary { flex: unset; }
}
`;
