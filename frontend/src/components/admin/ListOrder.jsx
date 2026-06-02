import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";

import MetaData from "../layout/MetaData";
import Loader from "../layout/Loader";
import AdminLayout from "../layout/AdminLayout";

import {
  useGetAdminOrdersQuery,
  useDeleteOrderMutation,
  useUpdateOrderStatusMutation,
} from "../redux/api/OrderApi";
import { confirmDialog } from "./_shared/confirmDialog";
import Breadcrumb from "./_shared/Breadcrumb";
import { exportToCSV } from "./_shared/exportCSV";
import useBulkSelect from "./_shared/useBulkSelect";
import BulkActionsBar from "./_shared/BulkActionsBar";

/* ─── helpers ─────────────────────────────────────────────── */
const fmtLAK = (v) =>
  `₭${Number(v || 0).toLocaleString("lo-LA")}`;

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("lo-LA", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

const PAYMENT_STATUS_CFG = {
  Paid:          { label: "ຊຳລະແລ້ວ",     cls: "badge-green" },
  AwaitingProof: { label: "ລໍຖ້າສລິບ",   cls: "badge-yellow" },
  Rejected:      { label: "ຖືກປະຕິເສດ",   cls: "badge-red" },
  Pending:       { label: "ລໍຖ້າ",        cls: "badge-gray" },
  Refunded:      { label: "ຄືນເງິນ",      cls: "badge-purple" },
};

const ORDER_STATUS_CFG = {
  Processing:  { label: "ກຳລັງດຳເນີນ", cls: "badge-blue" },
  Shipped:     { label: "ຈັດສົ່ງແລ້ວ",  cls: "badge-cyan" },
  Delivered:   { label: "ສຳເລັດ",       cls: "badge-green" },
  Cancelled:   { label: "ຍົກເລີກ",      cls: "badge-red" },
  Unfulfilled: { label: "ຍັງບໍ່ດຳເນີນ", cls: "badge-gray" },
};

const PAYMENT_METHOD_CFG = {
  COD:         { label: "💵 ເງິນສົດ (COD)",    cls: "method-cod" },
  BankTransfer:{ label: "🏦 Bank Transfer",    cls: "method-bank" },
  PayAtStore:  { label: "🏪 ຈ່າຍທີ່ຮ້ານ",    cls: "method-store" },
};

const BadgePill = ({ cfg, fallback }) => {
  const c = cfg || { label: fallback || "—", cls: "badge-gray" };
  return <span className={`lo-badge ${c.cls}`}>{c.label}</span>;
};

/* ─── CSS ─────────────────────────────────────────────────── */
const CSS = `
/* ── layout ── */
.lo-wrap { padding: 0 2px; }

/* ── stat cards ── */
.lo-stats {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
  margin-bottom: 22px;
}
@media(max-width:900px){ .lo-stats{ grid-template-columns: repeat(2,1fr); } }
@media(max-width:480px){ .lo-stats{ grid-template-columns: 1fr; } }

.lo-stat {
  background: #fff;
  border-radius: 14px;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 2px 10px rgba(0,0,0,.06);
  border: 1px solid #f0f0f5;
  transition: transform .18s, box-shadow .18s;
}
.lo-stat:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(102,126,234,.14); }

.lo-stat-icon {
  width: 44px; height: 44px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.2rem; flex-shrink: 0;
}
.lo-stat-icon.c-purple { background: linear-gradient(135deg,#667eea,#764ba2); color:#fff; }
.lo-stat-icon.c-orange { background: linear-gradient(135deg,#fbbf24,#f59e0b); color:#fff; }
.lo-stat-icon.c-cyan   { background: linear-gradient(135deg,#06b6d4,#0284c7); color:#fff; }
.lo-stat-icon.c-green  { background: linear-gradient(135deg,#10b981,#059669); color:#fff; }
.lo-stat-icon.c-indigo { background: linear-gradient(135deg,#6366f1,#4338ca); color:#fff; }
.lo-stat-icon.c-red    { background: linear-gradient(135deg,#f43f5e,#e11d48); color:#fff; }

.lo-stat.cancelled-stat { border-color: #fecaca; background: #fff8f8; cursor: pointer; }
.lo-stat.cancelled-stat:hover { box-shadow: 0 6px 18px rgba(244,63,94,.18); border-color: #f43f5e; }
.lo-stat.cancelled-stat .lo-stat-val { color: #dc2626; }

/* ── cancelled row highlight ── */
.lo-table tbody tr.row-cancelled {
  background: #fff8f8;
  border-left: 3px solid #f43f5e;
}
.lo-table tbody tr.row-cancelled:hover { background: #fee2e2; }
.lo-table tbody tr.row-cancelled td { color: #7f1d1d; }
.lo-table tbody tr.row-cancelled .lo-order-id { background: #fee2e2; color: #b91c1c; }
.lo-table tbody tr.row-cancelled .lo-amount { color: #b91c1c; }
.lo-table tbody tr.row-cancelled .lo-customer-name { color: #b91c1c; }

.lo-cancel-reason {
  font-size: .68rem; color: #ef4444; margin-top: 3px;
  display: flex; align-items: flex-start; gap: 3px;
}
.lo-cancel-reason::before { content: "⚠"; font-size: .65rem; flex-shrink: 0; margin-top: 1px; }

/* ── quick filter btn ── */
.lo-action-link.cancelled-filter {
  background: #fee2e2; color: #b91c1c; border: 1.5px solid #fca5a5;
}
.lo-action-link.cancelled-filter:hover {
  background: #f43f5e; color: #fff;
  box-shadow: 0 4px 14px rgba(244,63,94,.35);
  transform: translateY(-1px);
}
.lo-action-link.cancelled-filter.active {
  background: #e11d48; color: #fff; border-color: #e11d48;
}

.lo-stat-val { font-size: 1.35rem; font-weight: 800; color: #1e293b; line-height: 1.1; }
.lo-stat-lbl { font-size: .75rem; color: #94a3b8; margin-top: 2px; }

/* ── filter bar ── */
.lo-filter-bar {
  background: #fff;
  border-radius: 14px;
  padding: 18px 20px;
  margin-bottom: 18px;
  box-shadow: 0 2px 10px rgba(0,0,0,.06);
  border: 1px solid #f0f0f5;
}
.lo-filter-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: flex-end;
}
.lo-filter-group { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 160px; }
.lo-filter-group label { font-size: .75rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: .04em; }
.lo-filter-group input,
.lo-filter-group select {
  border: 1.5px solid #e2e8f0;
  border-radius: 9px;
  padding: .45rem .85rem;
  font-size: .875rem;
  color: #334155;
  background: #f8fafc;
  outline: none;
  transition: border-color .2s, box-shadow .2s;
}
.lo-filter-group input:focus,
.lo-filter-group select:focus {
  border-color: #667eea;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(102,126,234,.12);
}
.lo-filter-actions { display: flex; gap: 8px; }
.lo-btn {
  padding: .48rem 1.1rem; border-radius: 9px; border: none;
  font-size: .85rem; font-weight: 700; cursor: pointer;
  display: inline-flex; align-items: center; gap: 6px;
  transition: all .2s;
}
.lo-btn-primary { background: linear-gradient(135deg,#667eea,#764ba2); color:#fff; }
.lo-btn-primary:hover { box-shadow: 0 4px 14px rgba(102,126,234,.4); transform: translateY(-1px); }
.lo-btn-ghost { background: #f1f5f9; color: #475569; }
.lo-btn-ghost:hover { background: #e2e8f0; }
.lo-btn-green { background: linear-gradient(135deg,#10b981,#059669); color:#fff; }
.lo-btn-green:hover { box-shadow: 0 4px 14px rgba(16,185,129,.35); transform: translateY(-1px); }

.lo-result-info { font-size: .8rem; color: #94a3b8; margin-top: 10px; }

/* ── quick action links ── */
.lo-actions-row {
  display: flex; gap: 10px; flex-wrap: wrap;
  margin-bottom: 18px;
}
.lo-action-link {
  padding: .5rem 1.1rem; border-radius: 10px; border: none;
  font-size: .85rem; font-weight: 700; cursor: pointer;
  display: inline-flex; align-items: center; gap: 7px;
  text-decoration: none; transition: all .2s;
}
.lo-action-link.verify { background: linear-gradient(135deg,#667eea,#764ba2); color:#fff; }
.lo-action-link.verify:hover { box-shadow: 0 4px 14px rgba(102,126,234,.4); transform:translateY(-1px); color:#fff; }

/* ── table card ── */
.lo-table-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(0,0,0,.06);
  border: 1px solid #f0f0f5;
  overflow: hidden;
}
.lo-table-head {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px 22px;
  border-bottom: 1px solid #f1f5f9;
}
.lo-table-head-title { font-size: .95rem; font-weight: 800; color: #1e293b; }

.lo-table { width: 100%; border-collapse: collapse; font-size: .85rem; }
.lo-table thead th {
  background: #f8fafc;
  color: #64748b;
  font-weight: 700;
  font-size: .75rem;
  text-transform: uppercase;
  letter-spacing: .05em;
  padding: 11px 14px;
  border-bottom: 2px solid #e9edf5;
  white-space: nowrap;
  user-select: none;
}
.lo-table thead th.sortable { cursor: pointer; }
.lo-table thead th.sortable:hover { color: #667eea; }

.lo-table tbody tr { border-bottom: 1px solid #f1f5f9; transition: background .12s; }
.lo-table tbody tr:last-child { border-bottom: none; }
.lo-table tbody tr:hover { background: #f8f9ff; }
.lo-table tbody td { padding: 11px 14px; vertical-align: middle; color: #334155; }

.lo-order-id {
  font-family: monospace; font-size: .8rem;
  color: #667eea; font-weight: 700;
  background: #f0f4ff; padding: 2px 6px;
  border-radius: 5px; white-space: nowrap;
}
.lo-customer-name { font-weight: 700; color: #1e293b; font-size: .85rem; }
.lo-customer-email { font-size: .73rem; color: #94a3b8; margin-top: 1px; }

.lo-amount { font-weight: 800; color: #667eea; font-size: .9rem; white-space: nowrap; }
.lo-date { font-size: .78rem; color: #64748b; white-space: nowrap; }

/* ── badges ── */
.lo-badge {
  display: inline-block; padding: 3px 9px; border-radius: 999px;
  font-size: .72rem; font-weight: 700; white-space: nowrap;
}
.badge-green  { background: #dcfce7; color: #15803d; }
.badge-yellow { background: #fef9c3; color: #92400e; }
.badge-red    { background: #fee2e2; color: #b91c1c; }
.badge-blue   { background: #dbeafe; color: #1d4ed8; }
.badge-cyan   { background: #cffafe; color: #0e7490; }
.badge-gray   { background: #f1f5f9; color: #475569; }
.badge-purple { background: #ede9fe; color: #6d28d9; }

.method-cod   { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
.method-bank  { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
.method-store { background: #fdf4ff; color: #7e22ce; border: 1px solid #e9d5ff; }

/* ── action btns in table ── */
.lo-tbl-btn {
  width: 32px; height: 32px; border-radius: 8px;
  border: none; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: .8rem; transition: all .18s;
}
.lo-tbl-btn.view { background: #eff6ff; color: #1d4ed8; }
.lo-tbl-btn.view:hover { background: #1d4ed8; color: #fff; }
.lo-tbl-btn.del  { background: #fee2e2; color: #b91c1c; }
.lo-tbl-btn.del:hover  { background: #b91c1c; color: #fff; }

/* ── pagination ── */
.lo-pagination {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 22px; border-top: 1px solid #f1f5f9;
  flex-wrap: wrap; gap: 10px;
}
.lo-page-info { font-size: .8rem; color: #94a3b8; }
.lo-page-btns { display: flex; gap: 4px; }
.lo-page-btn {
  min-width: 32px; height: 32px; padding: 0 6px;
  border-radius: 8px; border: 1.5px solid #e2e8f0;
  background: #fff; color: #475569; font-size: .8rem; font-weight: 600;
  cursor: pointer; transition: all .15s; display: inline-flex;
  align-items: center; justify-content: center;
}
.lo-page-btn:hover:not(:disabled) { border-color: #667eea; color: #667eea; }
.lo-page-btn.active { background: #667eea; border-color: #667eea; color: #fff; }
.lo-page-btn:disabled { opacity: .4; cursor: not-allowed; }

/* ── empty state ── */
.lo-empty {
  text-align: center; padding: 60px 24px;
}
.lo-empty-icon { font-size: 3rem; margin-bottom: 14px; }
.lo-empty-title { font-size: 1rem; font-weight: 700; color: #1e293b; }
.lo-empty-sub { font-size: .85rem; color: #94a3b8; margin-top: 6px; }

/* ── checkbox ── */
.lo-cb { width: 16px; height: 16px; cursor: pointer; accent-color: #667eea; }
`;

/* ─── Component ───────────────────────────────────────────── */
const PER_PAGE = 15;

export default function ListOrder() {
  const { data, isLoading, error: fetchError, isError, refetch } =
    useGetAdminOrdersQuery();
  const [deleteOrder, { isLoading: isDeleting, isSuccess: isDeleteSuccess, error: deleteError }] =
    useDeleteOrderMutation();
  const [updateOrderStatus, { isLoading: isUpdating }] =
    useUpdateOrderStatusMutation();

  const [search,        setSearch]        = useState("");
  const [filterStatus,  setFilterStatus]  = useState("all");
  const [filterPayment, setFilterPayment] = useState("all");
  const [sortBy,        setSortBy]        = useState("date-desc");
  const [page,          setPage]          = useState(1);

  useEffect(() => {
    if (isError) toast.error(fetchError?.data?.message || "ໂຫຼດຂໍ້ມູນຜິດພາດ");
    if (isDeleteSuccess) toast.success("ລຶບອໍເດີສຳເລັດ");
    if (deleteError) toast.error(deleteError?.data?.message || "ລຶບຜິດພາດ");
  }, [isError, fetchError, isDeleteSuccess, deleteError]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const orders = data?.orders || [];

  const filtered = useMemo(() => {
    let arr = [...orders];
    if (search) {
      const q = search.toLowerCase();
      arr = arr.filter((o) =>
        (o._id || "").toLowerCase().includes(q) ||
        (o.user?.name || o.shippingInfo?.name || "").toLowerCase().includes(q) ||
        (o.user?.email || "").toLowerCase().includes(q)
      );
    }
    if (filterStatus !== "all")
      arr = arr.filter((o) =>
        (o.fulfillmentStatus || o.orderStatus || "").toLowerCase() ===
        filterStatus.toLowerCase()
      );
    if (filterPayment !== "all") {
      arr = arr.filter((o) => {
        const m = (o.paymentMethod || "").toLowerCase();
        if (filterPayment === "cod") return m === "cod";
        if (filterPayment === "bank") return m === "banktransfer" || m === "bank transfer";
        if (filterPayment === "store") return m === "payatstore";
        return true;
      });
    }
    arr.sort((a, b) => {
      if (sortBy === "date-asc")   return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "amount-desc") return (b.totalAmount || 0) - (a.totalAmount || 0);
      if (sortBy === "amount-asc")  return (a.totalAmount || 0) - (b.totalAmount || 0);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    return arr;
  }, [orders, search, filterStatus, filterPayment, sortBy]);

  useEffect(() => { setPage(1); }, [search, filterStatus, filterPayment, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageData   = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const bulk = useBulkSelect(filtered.map((o) => o._id));

  const stats = useMemo(() => ({
    total:       orders.length,
    processing:  orders.filter((o) => (o.fulfillmentStatus || o.orderStatus) === "Processing").length,
    shipped:     orders.filter((o) => (o.fulfillmentStatus || o.orderStatus) === "Shipped").length,
    delivered:   orders.filter((o) => (o.fulfillmentStatus || o.orderStatus) === "Delivered").length,
    cancelled:   orders.filter((o) => (o.fulfillmentStatus || o.orderStatus) === "Cancelled").length,
    totalAmount: orders.reduce((s, o) => s + (o.totalAmount || 0), 0),
  }), [orders]);

  const handleDelete = async (id) => {
    const ok = await confirmDialog.show({
      title: "ລຶບອໍເດີ?",
      message: `ທ່ານແນ່ໃຈບໍ່ວ່າຈະລຶບ #${id.slice(-8)}`,
      confirmText: "ລຶບເລີຍ",
      variant: "danger",
    });
    if (ok) deleteOrder(id);
  };

  const handleBulkStatus = async (status) => {
    const ok = await confirmDialog.show({
      title: `ອັບເດດ ${bulk.selectedCount} ອໍເດີ?`,
      message: `ປ່ຽນສະຖານະທັງໝົດເປັນ "${status}"`,
      confirmText: "ຢືນຢັນ",
      variant: "warning",
    });
    if (!ok) return;
    let ok2 = 0, fail = 0;
    for (const id of [...bulk.selectedIds]) {
      try { await updateOrderStatus({ id, orderStatus: status }).unwrap(); ok2++; }
      catch { fail++; }
    }
    if (ok2)  toast.success(`ອັບເດດ ${ok2} ອໍເດີສຳເລັດ`);
    if (fail) toast.error(`ລົ້ມເຫຼວ ${fail} ອໍເດີ`);
    bulk.clear();
  };

  const handleExport = (rows) =>
    exportToCSV({
      filename: "orders",
      columns: [
        { key: "_id",                 label: "Order ID" },
        { key: "user.name",           label: "ລູກຄ້າ" },
        { key: "paymentMethod",       label: "ວິທີຊຳລະ" },
        { key: "paymentStatus",       label: "ສະຖານະຊຳລະ" },
        { key: "orderStatus",         label: "ສະຖານະອໍເດີ" },
        { key: "totalAmount",         label: "ຍອດລວມ", format: (v) => Number(v || 0).toLocaleString() },
        { key: "createdAt",           label: "ວັນທີ", format: (v) => v ? new Date(v).toLocaleDateString("lo-LA") : "" },
      ],
      rows,
    });

  if (isLoading) return <Loader />;

  /* ── pagination buttons ── */
  const pageButtons = () => {
    const btns = [];
    const maxShow = 7;
    let start = Math.max(1, page - Math.floor(maxShow / 2));
    let end   = Math.min(totalPages, start + maxShow - 1);
    if (end - start + 1 < maxShow) start = Math.max(1, end - maxShow + 1);
    for (let i = start; i <= end; i++) btns.push(i);
    return btns;
  };

  return (
    <>
      <MetaData title="Admin — ລາຍການອໍເດີ" />
      <style>{CSS}</style>

      <AdminLayout>
        <div className="lo-wrap">
          {/* Header */}
          <Breadcrumb items={[{ label: "ລາຍການອໍເດີ" }]} />
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <div>
              <h4 className="fw-bold mb-0" style={{ color: "#1e293b" }}>
                📋 ລາຍການອໍເດີທັງໝົດ
              </h4>
              <p style={{ fontSize: ".82rem", color: "#94a3b8", margin: 0 }}>
                ຈັດການ ແລະ ຕິດຕາມອໍເດີຂອງລູກຄ້າ
              </p>
            </div>
            <div className="d-flex gap-2">
              <button
                className="lo-btn lo-btn-ghost"
                onClick={refetch}
                disabled={isLoading}
              >
                🔄 ໂຫຼດໃໝ່
              </button>
              <button
                className="lo-btn lo-btn-green"
                onClick={() => handleExport(filtered)}
              >
                📥 Export CSV
              </button>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="lo-stats" style={{ gridTemplateColumns: "repeat(6,1fr)" }}>
            <div className="lo-stat">
              <div className="lo-stat-icon c-purple">📦</div>
              <div>
                <div className="lo-stat-val">{stats.total}</div>
                <div className="lo-stat-lbl">ທັງໝົດ</div>
              </div>
            </div>
            <div className="lo-stat">
              <div className="lo-stat-icon c-orange">⏳</div>
              <div>
                <div className="lo-stat-val">{stats.processing}</div>
                <div className="lo-stat-lbl">ກຳລັງດຳເນີນ</div>
              </div>
            </div>
            <div className="lo-stat">
              <div className="lo-stat-icon c-cyan">🚚</div>
              <div>
                <div className="lo-stat-val">{stats.shipped}</div>
                <div className="lo-stat-lbl">ຈັດສົ່ງ</div>
              </div>
            </div>
            <div className="lo-stat">
              <div className="lo-stat-icon c-green">✅</div>
              <div>
                <div className="lo-stat-val">{stats.delivered}</div>
                <div className="lo-stat-lbl">ສຳເລັດ</div>
              </div>
            </div>
            <div
              className={`lo-stat cancelled-stat${filterStatus === "Cancelled" ? " active" : ""}`}
              onClick={() => setFilterStatus(filterStatus === "Cancelled" ? "all" : "Cancelled")}
              title="ກົດເພື່ອ filter ຍົກເລີກ"
            >
              <div className="lo-stat-icon c-red">❌</div>
              <div>
                <div className="lo-stat-val">{stats.cancelled}</div>
                <div className="lo-stat-lbl">ຍົກເລີກ</div>
              </div>
            </div>
            <div className="lo-stat">
              <div className="lo-stat-icon c-indigo">💰</div>
              <div>
                <div className="lo-stat-val" style={{ fontSize: ".95rem" }}>
                  {fmtLAK(stats.totalAmount)}
                </div>
                <div className="lo-stat-lbl">ຍອດລວມ</div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lo-actions-row">
            <Link to="/admin/verify-payments" className="lo-action-link verify">
              🔍 ກວດສອບ Bank Transfer
            </Link>
            <button
              className={`lo-action-link cancelled-filter${filterStatus === "Cancelled" ? " active" : ""}`}
              onClick={() => setFilterStatus(filterStatus === "Cancelled" ? "all" : "Cancelled")}
            >
              ❌ ອໍເດີທີ່ຍົກເລີກ
              {stats.cancelled > 0 && (
                <span style={{
                  background: "#e11d48", color: "#fff",
                  borderRadius: "999px", fontSize: ".65rem",
                  fontWeight: 900, padding: "1px 7px", marginLeft: 2,
                }}>
                  {stats.cancelled}
                </span>
              )}
            </button>
          </div>

          {/* Filter Bar */}
          <div className="lo-filter-bar">
            <div className="lo-filter-row">
              <div className="lo-filter-group" style={{ flex: 2, minWidth: 200 }}>
                <label>ຄົ້ນຫາ</label>
                <input
                  type="text"
                  placeholder="Order ID, ຊື່ ຫຼື ອີເມວ..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="lo-filter-group">
                <label>ສະຖານະອໍເດີ</label>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="all">ທັງໝົດ</option>
                  <option value="Processing">ກຳລັງດຳເນີນ</option>
                  <option value="Shipped">ຈັດສົ່ງ</option>
                  <option value="Delivered">ສຳເລັດ</option>
                  <option value="Cancelled">ຍົກເລີກ</option>
                </select>
              </div>
              <div className="lo-filter-group">
                <label>ວິທີຊຳລະ</label>
                <select value={filterPayment} onChange={(e) => setFilterPayment(e.target.value)}>
                  <option value="all">ທັງໝົດ</option>
                  <option value="cod">COD</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="store">ຈ່າຍທີ່ຮ້ານ</option>
                </select>
              </div>
              <div className="lo-filter-group">
                <label>ຈັດລຽງ</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="date-desc">ໃໝ່ສຸດ</option>
                  <option value="date-asc">ເກົ່າສຸດ</option>
                  <option value="amount-desc">ລາຄາ ↓</option>
                  <option value="amount-asc">ລາຄາ ↑</option>
                </select>
              </div>
            </div>
            <div className="lo-result-info">
              ສະແດງ <strong>{filtered.length}</strong> ຈາກ <strong>{orders.length}</strong> ອໍເດີ
            </div>
          </div>

          {/* Bulk Actions */}
          <BulkActionsBar
            count={bulk.selectedCount}
            onClear={bulk.clear}
            actions={[
              { label: "Processing", icon: "fa-spinner",      onClick: () => handleBulkStatus("Processing"), disabled: isUpdating },
              { label: "Shipped",    icon: "fa-truck",         onClick: () => handleBulkStatus("Shipped"),    disabled: isUpdating, variant: "warning" },
              { label: "Delivered",  icon: "fa-check-circle",  onClick: () => handleBulkStatus("Delivered"),  disabled: isUpdating, variant: "success" },
              { label: "Export CSV", icon: "fa-download",      onClick: () => { handleExport(filtered.filter((o) => bulk.selectedSet.has(o._id))); bulk.clear(); } },
            ]}
          />

          {/* Table */}
          <div className="lo-table-card">
            <div className="lo-table-head">
              <span className="lo-table-head-title">
                ລາຍການອໍເດີ ({filtered.length})
              </span>
            </div>

            {filtered.length === 0 ? (
              <div className="lo-empty">
                <div className="lo-empty-icon">📭</div>
                <div className="lo-empty-title">
                  {search || filterStatus !== "all" || filterPayment !== "all"
                    ? "ບໍ່ພົບຜົນທີ່ຄົ້ນຫາ"
                    : "ຍັງບໍ່ມີອໍເດີ"}
                </div>
                <div className="lo-empty-sub">
                  {search || filterStatus !== "all" || filterPayment !== "all"
                    ? "ລອງປ່ຽນ filter ໃໝ່"
                    : "ລໍຖ້າລູກຄ້າສ້າງ order"}
                </div>
              </div>
            ) : (
              <>
                <div style={{ overflowX: "auto" }}>
                  <table className="lo-table">
                    <thead>
                      <tr>
                        <th style={{ width: 38 }}>
                          <input
                            type="checkbox"
                            className="lo-cb"
                            checked={bulk.isAllSelected}
                            ref={(el) => { if (el) el.indeterminate = bulk.isPartial; }}
                            onChange={bulk.toggleAll}
                          />
                        </th>
                        <th>ເລກທີ</th>
                        <th>ລູກຄ້າ</th>
                        <th>ວັນທີ</th>
                        <th>ວິທີຊຳລະ</th>
                        <th>ຊຳລະ</th>
                        <th>ສະຖານະ</th>
                        <th>ຍອດ</th>
                        <th style={{ width: 80 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageData.map((order) => {
                        const pmCfg      = PAYMENT_METHOD_CFG[order.paymentMethod];
                        const psCfg      = PAYMENT_STATUS_CFG[order.paymentStatus];
                        const osCfg      = ORDER_STATUS_CFG[order.fulfillmentStatus || order.orderStatus];
                        const name       = order.user?.name || order.shippingInfo?.fullName || "—";
                        const email      = order.user?.email || "";
                        const isCancelled = (order.fulfillmentStatus || order.orderStatus) === "Cancelled";

                        return (
                          <tr key={order._id} className={isCancelled ? "row-cancelled" : ""}>
                            <td>
                              <input
                                type="checkbox"
                                className="lo-cb"
                                checked={bulk.selectedSet.has(order._id)}
                                onChange={() => bulk.toggle(order._id)}
                              />
                            </td>
                            <td>
                              <span className="lo-order-id">
                                #{order._id?.slice(-10)}
                              </span>
                            </td>
                            <td>
                              <div className="lo-customer-name">{name}</div>
                              {email && <div className="lo-customer-email">{email}</div>}
                            </td>
                            <td>
                              <div className="lo-date">{fmtDate(order.createdAt)}</div>
                            </td>
                            <td>
                              <BadgePill
                                cfg={pmCfg ? { label: pmCfg.label, cls: pmCfg.cls } : undefined}
                                fallback={order.paymentMethod || "—"}
                              />
                            </td>
                            <td>
                              <BadgePill
                                cfg={psCfg}
                                fallback={order.paymentStatus || "Pending"}
                              />
                            </td>
                            <td>
                              <BadgePill
                                cfg={osCfg}
                                fallback={order.fulfillmentStatus || order.orderStatus || "—"}
                              />
                              {isCancelled && order.cancelReason && (
                                <div className="lo-cancel-reason">
                                  {order.cancelReason.length > 30
                                    ? order.cancelReason.slice(0, 30) + "…"
                                    : order.cancelReason}
                                </div>
                              )}
                            </td>
                            <td>
                              <span className="lo-amount">{fmtLAK(order.totalAmount)}</span>
                            </td>
                            <td>
                              <div className="d-flex gap-1">
                                <Link
                                  to={`/admin/orders/${order._id}`}
                                  className="lo-tbl-btn view"
                                  title="ເບິ່ງລາຍລະອຽດ"
                                >
                                  👁
                                </Link>
                                <button
                                  className="lo-tbl-btn del"
                                  onClick={() => handleDelete(order._id)}
                                  disabled={isDeleting}
                                  title="ລຶບ"
                                >
                                  🗑
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="lo-pagination">
                  <div className="lo-page-info">
                    ໜ້າ {page} / {totalPages} &nbsp;·&nbsp; {filtered.length} ລາຍການ
                  </div>
                  <div className="lo-page-btns">
                    <button
                      className="lo-page-btn"
                      onClick={() => setPage(1)}
                      disabled={page === 1}
                    >«</button>
                    <button
                      className="lo-page-btn"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >‹</button>
                    {pageButtons().map((p) => (
                      <button
                        key={p}
                        className={`lo-page-btn${page === p ? " active" : ""}`}
                        onClick={() => setPage(p)}
                      >{p}</button>
                    ))}
                    <button
                      className="lo-page-btn"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >›</button>
                    <button
                      className="lo-page-btn"
                      onClick={() => setPage(totalPages)}
                      disabled={page === totalPages}
                    >»</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </AdminLayout>
    </>
  );
}
