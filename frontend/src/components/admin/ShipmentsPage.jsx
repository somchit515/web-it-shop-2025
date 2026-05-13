import React, { useEffect, useState } from "react";
import { useGetAdminOrdersQuery, useUpdateOrderStatusMutation } from "../redux/api/OrderApi";
import { toast, Toaster } from "react-hot-toast";
import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";

const PAGE_SIZE = 10;

// ✅ ใช้ fulfillmentStatus เป็นแหล่งความจริงเดียว
const FULFILLMENT_LIST = [
  { value: "Unfulfilled", label: "ລໍຖ້າຈັດການ", icon: "⏳", color: "#94a3b8" },
  { value: "Processing", label: "ກຳລັງເຕີມ", icon: "📦", color: "#3b82f6" },
  { value: "Shipped", label: "ກຳລັງຈັດສົ່ງ", icon: "🚚", color: "#f59e0b" },
  { value: "Delivered", label: "ສົ່ງສຳເລັດ", icon: "✅", color: "#10b981" },
  { value: "Cancelled", label: "ຍົກເລີກ", icon: "❌", color: "#ef4444" },
  { value: "Returned", label: "ສົ່ງຄືນ", icon: "↩️", color: "#a855f7" },
];

// Backward-compat สำหรับโค้ดเก่าที่อ้างถึงตัวแปรเดิม
const STATUS_LIST = FULFILLMENT_LIST.filter((s) =>
  ["Processing", "Shipped", "Delivered", "Cancelled"].includes(s.value)
);
const SHIPMENT_LIST = FULFILLMENT_LIST;

export default function ShipmentsPage() {
  const [tab, setTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetAdminOrdersQuery(undefined, { pollingInterval: 30_000 });
  const [updateStatus, { isLoading: updating }] = useUpdateOrderStatusMutation();

  const orders = data?.orders || [];

  // Filter by tab and search
  const filtered = orders.filter((o) => {
    // Tab filter
    let tabMatch = true;
    if (tab === "COD") tabMatch = o.paymentMethod === "COD";
    else if (tab === "BankTransfer") {
      tabMatch = o.paymentMethod === "BankTransfer" && ["Paid", "AwaitingProof"].includes(o.paymentStatus);
    }

    // Search filter
    const searchLower = searchTerm.toLowerCase();
    const searchMatch = !searchTerm ||
      o._id.toLowerCase().includes(searchLower) ||
      o.user?.name?.toLowerCase().includes(searchLower) ||
      o.shippingInfo?.fullName?.toLowerCase().includes(searchLower) ||
      o.trackingCode?.toLowerCase().includes(searchLower);

    return tabMatch && searchMatch;
  });

  // ✅ Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedOrders = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Reset page เมื่อเปลี่ยน tab/search
  useEffect(() => {
    setPage(1);
  }, [tab, searchTerm]);

  const handleUpdate = async (order) => {
    try {
      await updateStatus({
        id: order._id,
        // ✅ ส่ง fulfillmentStatus — backend pre-save hook จะ sync legacy fields เอง
        fulfillmentStatus: order.fulfillmentStatus || order.orderStatus,
        trackingCode: order.trackingCode,
      }).unwrap();
      toast.success("ອັບເດດສຳເລັດ!");
    } catch (error) {
      toast.error("ອັບເດດລົ້ມເຫລວ");
    }
  };

  // ✅ ใช้ fulfillmentStatus + virtual `status` (รองรับ orders เก่า)
  const getStatus = (o) => o.fulfillmentStatus || o.status || o.orderStatus;
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => ["Unfulfilled", "Processing"].includes(getStatus(o))).length,
    shipped: orders.filter((o) => getStatus(o) === "Shipped").length,
    delivered: orders.filter((o) => getStatus(o) === "Delivered").length,
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="loading-container">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;600;700&display=swap');

        .shipments-page {
          font-family: "Noto Sans Lao", "Phetsarath OT", sans-serif;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }

        .page-header {
          margin-bottom: 2rem;
        }

        .page-title {
          font-size: 1.75rem;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }

        .page-subtitle {
          color: #718096;
          font-size: 0.95rem;
        }

        /* Stats Cards */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 1.25rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          border-left: 4px solid var(--card-color);
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
        }

        .stat-label {
          font-size: 0.85rem;
          color: #64748b;
          margin-bottom: 0.5rem;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: #1e293b;
        }

        /* Filters */
        .filters-section {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .filter-tabs {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }

        .tab-btn {
          padding: 0.75rem 1.5rem;
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          border-radius: 50px;
          color: #64748b;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
        }

        .tab-btn:hover {
          border-color: #667eea;
          color: #667eea;
        }

        .tab-btn.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-color: transparent;
        }

        .search-box {
          position: relative;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 3rem;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 0.95rem;
          transition: all 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }

        /* Table */
        .table-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          overflow: hidden;
        }

        .table-responsive {
          overflow-x: auto;
        }

        .modern-table {
          width: 100%;
          font-size: 0.9rem;
        }

        .modern-table thead {
          background: #f8fafc;
        }

        .modern-table th {
          padding: 1rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #e2e8f0;
        }

        .modern-table td {
          padding: 1rem;
          border-bottom: 1px solid #f1f5f9;
          color: #475569;
          vertical-align: middle;
        }

        .modern-table tbody tr {
          transition: background 0.2s ease;
        }

        .modern-table tbody tr:hover {
          background: #f8fafc;
        }

        /* Order ID */
        .order-id {
          font-family: monospace;
          font-weight: 600;
          color: #667eea;
          font-size: 0.85rem;
        }

        /* Customer Info */
        .customer-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .customer-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 0.85rem;
        }

        .customer-name {
          font-weight: 600;
          color: #1e293b;
        }

        /* Select Inputs */
        .status-select,
        .shipment-select {
          padding: 0.5rem 0.75rem;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          transition: all 0.2s ease;
          min-width: 140px;
        }

        .status-select:focus,
        .shipment-select:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        /* Tracking Input */
        .tracking-input {
          padding: 0.5rem 0.75rem;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.85rem;
          min-width: 150px;
          font-family: monospace;
        }

        .tracking-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        /* Action Button */
        .save-btn {
          padding: 0.5rem 1.25rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
        }

        .save-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .save-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          opacity: 0.3;
        }

        .empty-text {
          color: #94a3b8;
          font-size: 1.1rem;
        }

        /* ✅ Pagination */
        .sp-pagination {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 20px 0 8px;
          margin-top: 8px;
        }
        .sp-pagination-info {
          color: #64748b;
          font-size: 0.875rem;
        }
        .sp-pagination-list {
          display: flex;
          gap: 6px;
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .sp-page-btn {
          min-width: 40px;
          height: 40px;
          padding: 0 14px;
          border: 2px solid #e2e8f0;
          background: white;
          color: #64748b;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.95rem;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .sp-page-btn:hover:not(:disabled) {
          border-color: #667eea;
          color: #667eea;
          transform: translateY(-1px);
        }
        .sp-page-btn.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-color: #667eea;
          color: white;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }
        .sp-page-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* Payment Method Badge */
        .payment-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.35rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .payment-cod {
          background: rgba(245, 158, 11, 0.1);
          color: #d97706;
        }

        .payment-bank {
          background: rgba(59, 130, 246, 0.1);
          color: #2563eb;
        }

        /* Shipment Status Badge */
        .shipment-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.35rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .shipment-pending {
          background: rgba(148, 163, 184, 0.1);
          color: #64748b;
        }

        .shipment-processing {
          background: rgba(59, 130, 246, 0.1);
          color: #2563eb;
        }

        .shipment-shipped {
          background: rgba(245, 158, 11, 0.1);
          color: #d97706;
        }

        .shipment-delivered {
          background: rgba(16, 185, 129, 0.1);
          color: #059669;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .page-title {
            font-size: 1.5rem;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .filter-tabs {
            flex-direction: column;
          }

          .tab-btn {
            width: 100%;
          }

          .modern-table {
            font-size: 0.8rem;
          }

          .modern-table th,
          .modern-table td {
            padding: 0.75rem 0.5rem;
          }
        }
      `}</style>

      <AdminLayout>
        <MetaData title="ຈັດການການຈັດສົ່ງ - Admin" />
        <Toaster position="top-right" />

        <div className="shipments-page">
          {/* Header */}
          <div className="page-header">
            <h1 className="page-title">📦 ຈັດການການຈັດສົ່ງ</h1>
            <p className="page-subtitle">
              ຕິດຕາມ ແລະ ອັບເດດສະຖານະການຈັດສົ່ງອໍເດີທັງໝົດ
            </p>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card" style={{'--card-color': '#667eea'}}>
              <div className="stat-label">ທັງໝົດ</div>
              <div className="stat-value">{stats.total}</div>
            </div>
            <div className="stat-card" style={{'--card-color': '#f59e0b'}}>
              <div className="stat-label">ລໍຖ້າຈັດສົ່ງ</div>
              <div className="stat-value">{stats.pending}</div>
            </div>
            <div className="stat-card" style={{'--card-color': '#3b82f6'}}>
              <div className="stat-label">ກຳລັງຈັດສົ່ງ</div>
              <div className="stat-value">{stats.shipped}</div>
            </div>
            <div className="stat-card" style={{'--card-color': '#10b981'}}>
              <div className="stat-label">ສົ່ງສຳເລັດ</div>
              <div className="stat-value">{stats.delivered}</div>
            </div>
          </div>

          {/* Filters */}
          <div className="filters-section">
            <div className="filter-tabs">
              <button 
                className={`tab-btn ${tab === "all" ? "active" : ""}`}
                onClick={() => setTab("all")}
              >
                ທັງໝົດ
              </button>
              <button 
                className={`tab-btn ${tab === "COD" ? "active" : ""}`}
                onClick={() => setTab("COD")}
              >
                💵 COD
              </button>
              <button 
                className={`tab-btn ${tab === "BankTransfer" ? "active" : ""}`}
                onClick={() => setTab("BankTransfer")}
              >
                🏦 ໂອນເງິນ
              </button>
            </div>

            <div className="search-box">
              <i className="fas fa-search search-icon"></i>
              <input
                type="text"
                className="search-input"
                placeholder="ຄົ້ນຫາດ້ວຍເລກອໍເດີ, ຊື່ລູກຄ້າ, ເລກພັດດຸ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <div className="table-card">
            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📦</div>
                <div className="empty-text">ບໍ່ພົບອໍເດີທີ່ຄົ້ນຫາ</div>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>ເລກອໍເດີ</th>
                      <th>ລູກຄ້າ</th>
                      <th>ວິທີຊຳລະ</th>
                      <th colSpan={2}>ສະຖານະການຈັດການ</th>
                      <th>ເລກພັດດຸ</th>
                      <th>ດຳເນີນການ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedOrders.map((order) => (
                      <Row
                        key={order._id}
                        order={order}
                        onSave={handleUpdate}
                        updating={updating}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ✅ Pagination */}
          {filtered.length > 0 && totalPages > 1 && (
            <div className="sp-pagination">
              <div className="sp-pagination-info">
                ສະແດງ {(safePage - 1) * PAGE_SIZE + 1}–
                {Math.min(safePage * PAGE_SIZE, filtered.length)} ຈາກ{' '}
                {filtered.length} ລາຍການ
              </div>
              <ul className="sp-pagination-list">
                <li>
                  <button
                    className="sp-page-btn"
                    onClick={() => setPage(safePage - 1)}
                    disabled={safePage === 1}
                  >‹</button>
                </li>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let n;
                  if (totalPages <= 7) n = i + 1;
                  else if (safePage <= 4) n = i + 1;
                  else if (safePage >= totalPages - 3) n = totalPages - 6 + i;
                  else n = safePage - 3 + i;
                  return (
                    <li key={n}>
                      <button
                        className={`sp-page-btn ${n === safePage ? 'active' : ''}`}
                        onClick={() => setPage(n)}
                      >{n}</button>
                    </li>
                  );
                })}
                <li>
                  <button
                    className="sp-page-btn"
                    onClick={() => setPage(safePage + 1)}
                    disabled={safePage === totalPages}
                  >›</button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </AdminLayout>
    </>
  );
}

function Row({ order, onSave, updating }) {
  // ✅ ใช้ fulfillmentStatus เป็นหลัก (fallback orderStatus สำหรับ orders เก่า)
  const initialStatus = order.fulfillmentStatus || order.status || order.orderStatus || "Unfulfilled";
  const [fulfillmentStatus, setFulfillmentStatus] = useState(initialStatus);
  const [tracking, setTracking] = useState(order.trackingCode || "");

  const canSave =
    fulfillmentStatus !== initialStatus ||
    tracking !== order.trackingCode;

  const customerName = order.user?.name || order.shippingInfo?.fullName || "ບໍ່ມີຊື່";

  return (
    <tr>
      <td>
        <span className="order-id">#{order._id.slice(-8)}</span>
      </td>
      <td>
        <div className="customer-info">
          <div className="customer-avatar">
            {customerName.charAt(0).toUpperCase()}
          </div>
          <span className="customer-name">{customerName}</span>
        </div>
      </td>
      <td>
        <span className={`payment-badge ${order.paymentMethod === 'COD' ? 'payment-cod' : 'payment-bank'}`}>
          {order.paymentMethod === 'COD' ? '💵 COD' : '🏦 ໂອນເງິນ'}
        </span>
      </td>
      <td colSpan={2}>
        <select
          className="status-select"
          value={fulfillmentStatus}
          onChange={(e) => setFulfillmentStatus(e.target.value)}
          style={{
            color: FULFILLMENT_LIST.find((s) => s.value === fulfillmentStatus)?.color,
            fontWeight: 600,
          }}
        >
          {FULFILLMENT_LIST.map((s) => (
            <option key={s.value} value={s.value}>
              {s.icon} {s.label}
            </option>
          ))}
        </select>
      </td>
      <td>
        <input
          type="text"
          className="tracking-input"
          value={tracking}
          onChange={(e) => setTracking(e.target.value)}
          placeholder="EX1234567890"
        />
      </td>
      <td>
        <button 
          className="save-btn" 
          onClick={() => onSave({
            ...order,
            fulfillmentStatus,
            trackingCode: tracking,
          })}
          disabled={!canSave || updating}
        >
          {updating ? (
            <i className="fas fa-spinner spinner"></i>
          ) : (
            <i className="fas fa-save"></i>
          )}
          <span>ບັນທຶກ</span>
        </button>
      </td>
    </tr>
  );
}