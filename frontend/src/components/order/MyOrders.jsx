import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useGetMyOrdersQuery } from "../redux/api/OrderApi";
import toast from "react-hot-toast";
import MetaData from "../layout/MetaData";
import { useDispatch } from "react-redux";
import { clearCart } from "../redux/features/cartSlice";

function MyOrders() {
  const { data, isLoading, error, isError, refetch } = useGetMyOrdersQuery();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const [copiedId, setCopiedId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const orders = Array.isArray(data?.orders) ? data.orders : [];
  const orderSuccess = searchParams.get("order_success");

  useEffect(() => {
    if (isError) {
      toast.error(error?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ");
    }

    if (orderSuccess) {
      dispatch(clearCart());
      (async () => {
        try {
          await refetch();
          toast.success("ຄຳສັ່ງຊື້ສຳເລັດ!");
        } catch (err) {
          console.warn("Refetch failed", err);
        } finally {
          navigate("/me/orders", { replace: true });
        }
      })();
    }
  }, [isError, error, orderSuccess, dispatch, navigate, refetch]);

  const formatPrice = (val) => {
    const n = Number(val ?? 0);
    return `₭ ${n.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const copyToClipboard = async (text, orderId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(orderId);
      toast.success("ຄັດລອກສຳເລັດ!");
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      toast.error("ຄັດລອກລົ້ມເຫລວ");
    }
  };

  const getStatusInfo = (status) => {
    const statusLower = status?.toLowerCase() || "";
    const statusMap = {
      delivered: { color: "#10b981", bg: "rgba(16, 185, 129, 0.1)", label: "ສົ່ງສຳເລັດ", icon: "✅" },
      processing: { color: "#3b82f6", bg: "rgba(59, 130, 246, 0.1)", label: "ກຳລັງດຳເນີນ", icon: "⏳" },
      shipped: { color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)", label: "ກຳລັງຈັດສົ່ງ", icon: "🚚" },
      cancelled: { color: "#ef4444", bg: "rgba(239, 68, 68, 0.1)", label: "ຍົກເລີກ", icon: "❌" }
    };
    return statusMap[statusLower] || { color: "#64748b", bg: "rgba(100, 116, 139, 0.1)", label: "ລໍຖ້າ", icon: "⏳" };
  };

  const getPaymentStatusInfo = (method, status) => {
    if (method === "COD") {
      return { color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)", label: "ຊຳລະປາຍທາງ", icon: "💵" };
    }
    if (status === "Paid") {
      return { color: "#10b981", bg: "rgba(16, 185, 129, 0.1)", label: "ຊຳລະແລ້ວ", icon: "✅" };
    }
    if (status === "Pending" || status === "AwaitingProof") {
      return { color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)", label: "ລໍຖ້າຊຳລະ", icon: "⏳" };
    }
    return { color: "#64748b", bg: "rgba(100, 116, 139, 0.1)", label: status, icon: "💳" };
  };

  // Filter and search
  const filteredOrders = orders.filter((order) => {
    const statusMatch = statusFilter === "all" || order?.orderStatus?.toLowerCase() === statusFilter;
    const searchLower = searchTerm.toLowerCase();
    const searchMatch = !searchTerm ||
      order._id?.toLowerCase().includes(searchLower) ||
      order.user?.name?.toLowerCase().includes(searchLower);
    return statusMatch && searchMatch;
  });

  // Stats
  const stats = {
    total: orders.length,
    processing: orders.filter(o => o.orderStatus?.toLowerCase() === "processing").length,
    shipped: orders.filter(o => o.orderStatus?.toLowerCase() === "shipped").length,
    delivered: orders.filter(o => o.orderStatus?.toLowerCase() === "delivered").length
  };

  if (isLoading) {
    return (
      <>
        <style>{styles}</style>
        <div className="my-orders-page">
          <MetaData title="ຄຳສັ່ງຊື້ຂອງຂ້ອຍ" />
          <div className="loading-container">
            <div className="spinner-border text-primary"></div>
            <p className="mt-3">ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
          </div>
        </div>
      </>
    );
  }

  if (orders.length === 0) {
    return (
      <>
        <style>{styles}</style>
        <div className="my-orders-page">
          <MetaData title="ຄຳສັ່ງຊື້ຂອງຂ້ອຍ" />
          <div className="empty-container">
            <div className="empty-card">
              <div className="empty-icon">📦</div>
              <h3>ຍັງບໍ່ມີຄຳສັ່ງຊື້</h3>
              <p>ເມື່ອທ່ານສັ່ງຊື້ສິນຄ້າ, ລາຍການຈະປະກົດທີ່ນີ້</p>
              <Link to="/" className="btn-primary">
                <i className="fas fa-shopping-bag"></i>
                <span>ເລີ່ມຊັອບປິ້ງ</span>
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="my-orders-page">
        <MetaData title="ຄຳສັ່ງຊື້ຂອງຂ້ອຍ" />

        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">📦 ຄຳສັ່ງຊື້ຂອງຂ້ອຍ</h1>
            <p className="page-subtitle">ຈັດການ ແລະ ຕິດຕາມຄຳສັ່ງຊື້ທັງໝົດຂອງທ່ານ</p>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card" style={{'--card-color': '#667eea'}}>
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">ທັງໝົດ</div>
            </div>
          </div>
          <div className="stat-card" style={{'--card-color': '#3b82f6'}}>
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <div className="stat-value">{stats.processing}</div>
              <div className="stat-label">ກຳລັງດຳເນີນ</div>
            </div>
          </div>
          <div className="stat-card" style={{'--card-color': '#f59e0b'}}>
            <div className="stat-icon">🚚</div>
            <div className="stat-info">
              <div className="stat-value">{stats.shipped}</div>
              <div className="stat-label">ກຳລັງຈັດສົ່ງ</div>
            </div>
          </div>
          <div className="stat-card" style={{'--card-color': '#10b981'}}>
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <div className="stat-value">{stats.delivered}</div>
              <div className="stat-label">ສົ່ງສຳເລັດ</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="search-box">
            <i className="fas fa-search search-icon"></i>
            <input
              type="text"
              className="search-input"
              placeholder="ຄົ້ນຫາດ້ວຍເລກອໍເດີ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="status-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">ທັງໝົດ ({orders.length})</option>
            <option value="processing">⏳ ກຳລັງດຳເນີນ</option>
            <option value="shipped">🚚 ກຳລັງຈັດສົ່ງ</option>
            <option value="delivered">✅ ສົ່ງສຳເລັດ</option>
            <option value="cancelled">❌ ຍົກເລີກ</option>
          </select>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <p>ບໍ່ພົບຄຳສັ່ງຊື້ທີ່ຄົ້ນຫາ</p>
          </div>
        ) : (
          <div className="orders-grid">
            {filteredOrders.map((order) => {
              const orderId = order._id || "";
              const displayId = orderId.substring(0, 12);
              const statusInfo = getStatusInfo(order.orderStatus);
              const paymentInfo = getPaymentStatusInfo(order.paymentMethod, order.paymentStatus);
              const createdAt = order.createdAt ? new Date(order.createdAt) : null;
              const dateText = createdAt
                ? createdAt.toLocaleDateString("lo-LA", {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                  })
                : "—";

              return (
                <div key={orderId} className="order-card">
                  <div className="order-header">
                    <div className="order-id-section">
                      <span className="order-id-label">ເລກອໍເດີ:</span>
                      <span className="order-id">{displayId}...</span>
                      <button
                        className="copy-btn"
                        onClick={() => copyToClipboard(orderId, orderId)}
                        title="ຄັດລອກ"
                      >
                        <i className={`fas fa-${copiedId === orderId ? "check" : "copy"}`}></i>
                      </button>
                    </div>
                    <div className="order-date">
                      <i className="fas fa-calendar"></i>
                      <span>{dateText}</span>
                    </div>
                  </div>

                  <div className="order-body">
                    <div className="order-amount">
                      <span className="amount-label">ຍອດລວມ:</span>
                      <span className="amount-value">{formatPrice(order.totalAmount)}</span>
                    </div>

                    <div className="order-badges">
                      <span 
                        className="status-badge"
                        style={{
                          color: statusInfo.color,
                          background: statusInfo.bg
                        }}
                      >
                        <span>{statusInfo.icon}</span>
                        <span>{statusInfo.label}</span>
                      </span>
                      <span 
                        className="payment-badge"
                        style={{
                          color: paymentInfo.color,
                          background: paymentInfo.bg
                        }}
                      >
                        <span>{paymentInfo.icon}</span>
                        <span>{paymentInfo.label}</span>
                      </span>
                    </div>

                    {order.trackingCode && (
                      <div className="tracking-info">
                        <i className="fas fa-truck"></i>
                        <span>ເລກພັດດຸ: {order.trackingCode}</span>
                      </div>
                    )}
                  </div>

                  <div className="order-footer">
                    <Link to={`/me/orders/${orderId}`} className="btn-view">
                      <i className="fas fa-eye"></i>
                      <span>ລາຍລະອຽດ</span>
                    </Link>

                    <Link to={`/invoice/orders/${orderId}`} className="btn-invoice">
                      <i className="fas fa-file-invoice"></i>
                      <span>ໃບບິນ</span>
                    </Link>

                    {order.paymentMethod === "BankTransfer" && order.paymentStatus === "Pending" && (
                      <Link to={`/orders/${orderId}/upload-proof`} className="btn-upload">
                        <i className="fas fa-upload"></i>
                        <span>ອັບໂຫຼດໃບຊຳລະ</span>
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

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;600;700&display=swap');

  .my-orders-page {
    font-family: "Noto Sans Lao", "Phetsarath OT", sans-serif;
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
  }

  .loading-container,
  .empty-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
  }

  .empty-card {
    text-align: center;
    background: white;
    padding: 3rem 2rem;
    border-radius: 20px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    max-width: 500px;
  }

  .empty-icon {
    font-size: 5rem;
    margin-bottom: 1.5rem;
    opacity: 0.5;
  }

  .empty-card h3 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 0.75rem;
  }

  .empty-card p {
    color: #64748b;
    margin-bottom: 2rem;
  }

  .page-header {
    margin-bottom: 2rem;
  }

  .page-title {
    font-size: 2rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 0.5rem;
  }

  .page-subtitle {
    color: #64748b;
    font-size: 1rem;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .stat-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    display: flex;
    align-items: center;
    gap: 1rem;
    border-left: 4px solid var(--card-color);
    transition: all 0.3s ease;
  }

  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }

  .stat-icon {
    font-size: 2.5rem;
  }

  .stat-value {
    font-size: 2rem;
    font-weight: 700;
    color: #1e293b;
    line-height: 1;
  }

  .stat-label {
    font-size: 0.85rem;
    color: #64748b;
    margin-top: 0.25rem;
  }

  .filters-section {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .search-box {
    flex: 1;
    min-width: 250px;
    position: relative;
  }

  .search-input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 3rem;
    border: 2px solid #e2e8f0;
    border-radius: 50px;
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

  .status-select {
    padding: 0.75rem 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 50px;
    font-size: 0.95rem;
    font-weight: 600;
    color: #64748b;
    background: white;
    cursor: pointer;
    min-width: 200px;
  }

  .status-select:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  }

  .orders-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;
  }

  .order-card {
    background: white;
    border-radius: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    transition: all 0.3s ease;
  }

  .order-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  .order-header {
    padding: 1.25rem;
    background: #f8fafc;
    border-bottom: 2px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .order-id-section {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .order-id-label {
    font-size: 0.8rem;
    color: #64748b;
  }

  .order-id {
    font-family: monospace;
    font-weight: 600;
    color: #667eea;
    font-size: 0.9rem;
  }

  .copy-btn {
    background: transparent;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    transition: all 0.2s ease;
  }

  .copy-btn:hover {
    background: #e2e8f0;
    color: #667eea;
  }

  .order-date {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #64748b;
    font-size: 0.85rem;
  }

  .order-body {
    padding: 1.25rem;
  }

  .order-amount {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .amount-label {
    font-size: 0.9rem;
    color: #64748b;
  }

  .amount-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #667eea;
  }

  .order-badges {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }

  .status-badge,
  .payment-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 700;
  }

  .tracking-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: #f8fafc;
    border-radius: 8px;
    font-size: 0.85rem;
    color: #64748b;
    font-family: monospace;
  }

  .order-footer {
    padding: 1rem 1.25rem;
    background: #f8fafc;
    border-top: 2px solid #e2e8f0;
    display: flex;
    gap: 0.75rem;
  }

  .btn-view,
  .btn-invoice,
  .btn-upload {
    flex: 1;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.85rem;
    text-decoration: none;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
  }

  .btn-view {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .btn-view:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    color: white;
  }

  .btn-invoice {
    background: white;
    border: 2px solid #10b981;
    color: #10b981;
  }

  .btn-invoice:hover {
    background: #10b981;
    color: white;
  }

  .btn-upload {
    background: white;
    border: 2px solid #f59e0b;
    color: #f59e0b;
  }

  .btn-upload:hover {
    background: #f59e0b;
    color: white;
  }

  .btn-primary {
    padding: 0.875rem 2rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 50px;
    font-weight: 600;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    transition: all 0.3s ease;
  }

  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
    color: white;
  }

  .no-results {
    text-align: center;
    padding: 4rem 2rem;
    background: white;
    border-radius: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  .no-results-icon {
    font-size: 4rem;
    opacity: 0.3;
    margin-bottom: 1rem;
  }

  @media (max-width: 768px) {
    .my-orders-page {
      padding: 1rem;
    }

    .page-title {
      font-size: 1.5rem;
    }

    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .orders-grid {
      grid-template-columns: 1fr;
    }

    .filters-section {
      flex-direction: column;
    }

    .search-box,
    .status-select {
      width: 100%;
    }

    .order-footer {
      flex-direction: column;
    }
  }
`;

export default MyOrders;