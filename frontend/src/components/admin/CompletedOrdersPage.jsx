import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faCheckCircle,
  faSearch,
  faCalendar,
  faSort,
  faCopy,
  faFileInvoice,
  faBox,
  faDollarSign,
  faTruck,
  faFilter,
  faDownload, // eslint-disable-line no-unused-vars
  faEye // eslint-disable-line no-unused-vars
} from "@fortawesome/free-solid-svg-icons";
import { useGetAdminOrdersQuery } from "../redux/api/OrderApi";
import AdminLayout from "../layout/AdminLayout";
import toast from "react-hot-toast";

const PAGE_SIZE = 15;

export default function CompletedOrdersPage() {
  const { data, isLoading } = useGetAdminOrdersQuery(undefined, {
    pollingInterval: 60_000,
  });

  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortKey, setSortKey] = useState("deliveredAt");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);

  // กรองเฉพาะออร์เดอร์ที่ส่งถึงแล้ว
  const completed = useMemo(() => {
    if (!data?.orders) return [];
    return data.orders.filter(
      (o) => o.shipmentStatus === "delivered" || o.orderStatus === "Delivered"
    );
  }, [data]);

  // คำนวณสถิติ
  const stats = useMemo(() => {
    const totalOrders = completed.length;
    const totalRevenue = completed.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      totalOrders,
      totalRevenue,
      avgOrderValue
    };
  }, [completed]);

  // ฟังก์ชันกรอง + เรียง
  const filtered = useMemo(() => {
    let list = completed;

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          o._id.toLowerCase().includes(q) ||
          o.user?.name?.toLowerCase().includes(q) ||
          o.shippingInfo?.fullName?.toLowerCase().includes(q) ||
          o.trackingCode?.toLowerCase().includes(q)
      );
    }

    if (dateFrom) list = list.filter((o) => o.deliveredAt >= dateFrom);
    if (dateTo) list = list.filter((o) => o.deliveredAt <= dateTo);

    list.sort((a, b) => {
      const A = a[sortKey];
      const B = b[sortKey];
      if (sortDir === "asc") return A > B ? 1 : -1;
      return A < B ? 1 : -1;
    });

    return list;
  }, [completed, search, dateFrom, dateTo, sortKey, sortDir]);

  // Pagination
  const totalPage = Math.ceil(filtered.length / PAGE_SIZE);
  const pagedList = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const copyTracking = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    toast.success("ຄັດລອກເລກຕິດຕາມແລ້ວ");
  };

  const clearFilters = () => {
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setSortKey("deliveredAt");
    setSortDir("desc");
    setPage(1);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("lo-LA", {
      style: "currency",
      currency: "LAK",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("lo-LA", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="completed-orders-container">
          <div className="loading-state">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted">ກຳລັງໂຫລດຂໍ້ມູນ...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <style>{`
        .completed-orders-container {
          padding: 0;
        }

        .page-header {
          margin-bottom: 2rem;
        }

        .breadcrumb-nav {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.875rem;
          color: #64748b;
          margin-bottom: 0.75rem;
        }

        .breadcrumb-nav a {
          color: #667eea;
          text-decoration: none;
          transition: color 0.2s;
        }

        .breadcrumb-nav a:hover {
          color: #764ba2;
        }

        .page-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .page-title svg {
          color: #10b981;
        }

        .page-subtitle {
          color: #64748b;
          font-size: 0.95rem;
          margin: 0;
        }

        /* Stats Cards */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #10b981 0%, #059669 100%);
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }

        .stat-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stat-info h6 {
          font-size: 0.875rem;
          font-weight: 600;
          color: #64748b;
          margin-bottom: 0.5rem;
        }

        .stat-info h4 {
          font-size: 2rem;
          font-weight: 700;
          color: #10b981;
          margin: 0;
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          opacity: 0.5;
        }

        /* Filter Section */
        .filter-section {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(0, 0, 0, 0.05);
          margin-bottom: 1.5rem;
        }

        .filter-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1.5fr auto;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .filter-field label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: #475569;
          margin-bottom: 0.5rem;
        }

        .form-control, .form-select {
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 0.95rem;
          transition: all 0.2s ease;
          background: white;
        }

        .form-control:focus, .form-select:focus {
          border-color: #10b981;
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
          outline: none;
        }

        .btn-clear-filters {
          padding: 10px 20px;
          border: 2px solid #e2e8f0;
          background: white;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 6px;
          align-self: end;
        }

        .btn-clear-filters:hover {
          border-color: #ef4444;
          color: #ef4444;
        }

        .filter-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid #e2e8f0;
          font-size: 0.875rem;
          color: #64748b;
        }

        /* Table Section */
        .table-section {
          background: white;
          border-radius: 16px;
          padding: 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(0, 0, 0, 0.05);
          overflow: hidden;
          margin-bottom: 1.5rem;
        }

        .table-responsive {
          border-radius: 16px;
        }

        table {
          margin: 0;
        }

        table thead th {
          background-color: #f8fafc;
          color: #1e293b;
          font-weight: 700;
          border-bottom: 2px solid #e2e8f0;
          padding: 1rem;
          white-space: nowrap;
        }

        table tbody td {
          vertical-align: middle;
          padding: 1rem;
        }

        .order-id {
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
          color: #64748b;
        }

        .tracking-code {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-copy {
          padding: 4px 8px;
          border: 1px solid #e2e8f0;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #64748b;
        }

        .btn-copy:hover {
          border-color: #10b981;
          color: #10b981;
          background: rgba(16, 185, 129, 0.05);
        }

        .btn-invoice {
          padding: 8px 16px;
          border: 2px solid #667eea;
          background: white;
          color: #667eea;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .btn-invoice:hover {
          background: #667eea;
          color: white;
        }

        /* Pagination */
        .pagination-wrapper {
          display: flex;
          justify-content: center;
          padding: 1.5rem;
        }

        .pagination {
          display: flex;
          gap: 4px;
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .page-item {
          display: inline-block;
        }

        .page-link {
          padding: 8px 14px;
          border: 2px solid #e2e8f0;
          background: white;
          color: #64748b;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.875rem;
          transition: all 0.2s ease;
        }

        .page-link:hover:not(:disabled) {
          border-color: #10b981;
          color: #10b981;
        }

        .page-item.active .page-link {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border-color: #10b981;
          color: white;
        }

        .page-item.disabled .page-link {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
        }

        .empty-state svg {
          color: #cbd5e1;
          margin-bottom: 1rem;
        }

        .empty-state h5 {
          color: #64748b;
          margin-bottom: 0.5rem;
        }

        .empty-state p {
          color: #94a3b8;
        }

        /* Loading State */
        .loading-state {
          text-align: center;
          padding: 4rem 2rem;
        }

        /* Responsive */
        @media (max-width: 1199.98px) {
          .filter-grid {
            grid-template-columns: 1fr 1fr;
          }

          .btn-clear-filters {
            grid-column: 1 / -1;
            justify-content: center;
          }
        }

        @media (max-width: 767.98px) {
          .page-title {
            font-size: 1.5rem;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .filter-grid {
            grid-template-columns: 1fr;
          }

          table {
            font-size: 0.875rem;
          }

          table thead th,
          table tbody td {
            padding: 0.75rem 0.5rem;
          }
        }
      `}</style>

      <AdminLayout>
        <div className="completed-orders-container">
          {/* Page Header */}
          <div className="page-header">
            <div className="breadcrumb-nav">
              <Link to="/admin/dashboard">
                <FontAwesomeIcon icon={faHome} /> Dashboard
              </Link>
              <span>/</span>
              <span>ອໍເດີທີ່ສົ່ງຮອດແລ້ວ</span>
            </div>
            <h1 className="page-title">
              <FontAwesomeIcon icon={faCheckCircle} />
              ອໍເດີທີ່ສົ່ງຮອດແລ້ວ
            </h1>
            <p className="page-subtitle">
              ລາຍການອໍເດີທີ່ຈັດສົ່ງສຳເລັດ ແລະ ຮອດມືລູກຄ້າແລ້ວ
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-info">
                  <h6>ທັງໝົດ</h6>
                  <h4>{stats.totalOrders}</h4>
                </div>
                <div className="stat-icon">
                  <FontAwesomeIcon icon={faBox} />
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-info">
                  <h6>ຍອດຮັບທັງໝົດ</h6>
                  <h4 style={{ fontSize: '1.5rem' }}>{formatCurrency(stats.totalRevenue)}</h4>
                </div>
                <div className="stat-icon">
                  <FontAwesomeIcon icon={faDollarSign} />
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-info">
                  <h6>ຄ່າສະເລ່ຍຕໍ່ອໍເດີ</h6>
                  <h4 style={{ fontSize: '1.5rem' }}>{formatCurrency(stats.avgOrderValue)}</h4>
                </div>
                <div className="stat-icon">
                  <FontAwesomeIcon icon={faTruck} />
                </div>
              </div>
            </div>
          </div>

          {/* Filter Section */}
          <div className="filter-section">
            <div className="filter-grid">
              <div className="filter-field">
                <label>
                  <FontAwesomeIcon icon={faSearch} /> ຄົ້ນຫາ
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="ເລກທີ່ອໍເດີ, ຊື່ລູກຄ້າ, ເລກຕິດຕາມ..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>

              <div className="filter-field">
                <label>
                  <FontAwesomeIcon icon={faCalendar} /> ວັນທີ່ເລີ່ມ
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setPage(1);
                  }}
                />
              </div>

              <div className="filter-field">
                <label>
                  <FontAwesomeIcon icon={faCalendar} /> ວັນທີ່ສິ້ນສຸດ
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setPage(1);
                  }}
                />
              </div>

              <div className="filter-field">
                <label>
                  <FontAwesomeIcon icon={faSort} /> ຈັດລຽງ
                </label>
                <select
                  className="form-select"
                  value={`${sortKey}-${sortDir}`}
                  onChange={(e) => {
                    const [key, dir] = e.target.value.split("-");
                    setSortKey(key);
                    setSortDir(dir);
                  }}
                >
                  <option value="deliveredAt-desc">ວັນທີ່ (ໃໝ່→ເກົ່າ)</option>
                  <option value="deliveredAt-asc">ວັນທີ່ (ເກົ່າ→ໃໝ່)</option>
                  <option value="totalAmount-desc">ຍອດເງິນ (ຫຼາຍ→ນ້ອຍ)</option>
                  <option value="totalAmount-asc">ຍອດເງິນ (ນ້ອຍ→ຫຼາຍ)</option>
                </select>
              </div>

              <button className="btn-clear-filters" onClick={clearFilters}>
                <FontAwesomeIcon icon={faFilter} />
                ລ້າງຕົວກອງ
              </button>
            </div>

            <div className="filter-info">
              <span>ສະແດງ {filtered.length} ຈາກ {completed.length} ລາຍການ</span>
              <span>ໜ້າ {page} / {totalPage || 1}</span>
            </div>
          </div>

          {/* Table or Empty State */}
          {filtered.length === 0 ? (
            <div className="table-section">
              <div className="empty-state">
                <FontAwesomeIcon icon={faBox} size="3x" />
                <h5>ບໍ່ພົບລາຍການ</h5>
                <p>ລອງປ່ຽນເງື່ອນໄຂການຄົ້ນຫາ</p>
              </div>
            </div>
          ) : (
            <>
              <div className="table-section">
                <div className="table-responsive">
                  <table className="table align-middle mb-0">
                    <thead>
                      <tr>
                        <th style={{ width: '200px' }}>ເລກທີອໍເດີ</th>
                        <th>ລູກຄ້າ</th>
                        <th style={{ width: '180px' }}>ວັນທີ່ສົ່ງຮອດ</th>
                        <th style={{ width: '150px' }}>ຍອດລວມ</th>
                        <th style={{ width: '180px' }}>ເລກຕິດຕາມ</th>
                        <th style={{ width: '140px' }}>ໃບເກັບເງິນ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedList.map((order) => (
                        <tr key={order._id}>
                          <td>
                            <span className="order-id">{order._id}</span>
                          </td>
                          <td>
                            <div className="fw-semibold">
                              {order.user?.name || order.shippingInfo?.fullName || 'N/A'}
                            </div>
                          </td>
                          <td>
                            <span className="text-muted">{formatDate(order.deliveredAt)}</span>
                          </td>
                          <td>
                            <span className="fw-bold text-success">
                              {formatCurrency(order.totalAmount)}
                            </span>
                          </td>
                          <td>
                            <div className="tracking-code">
                              <span>
                                {order.trackingCode || <span className="text-muted">-</span>}
                              </span>
                              {order.trackingCode && (
                                <button
                                  className="btn-copy"
                                  onClick={() => copyTracking(order.trackingCode)}
                                  title="ຄັດລອກ"
                                >
                                  <FontAwesomeIcon icon={faCopy} />
                                </button>
                              )}
                            </div>
                          </td>
                          <td>
                            <a
                              className="btn-invoice"
                              href={`/invoice/orders/${order._id}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <FontAwesomeIcon icon={faFileInvoice} />
                              ພິມ
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {totalPage > 1 && (
                <div className="pagination-wrapper">
                  <ul className="pagination">
                    <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                      >
                        ກ່ອນຫນ້າ
                      </button>
                    </li>
                    {Array.from({ length: Math.min(totalPage, 7) }, (_, i) => {
                      let pageNum;
                      if (totalPage <= 7) {
                        pageNum = i + 1;
                      } else if (page <= 4) {
                        pageNum = i + 1;
                      } else if (page >= totalPage - 3) {
                        pageNum = totalPage - 6 + i;
                      } else {
                        pageNum = page - 3 + i;
                      }
                      return (
                        <li
                          key={pageNum}
                          className={`page-item ${pageNum === page ? "active" : ""}`}
                        >
                          <button className="page-link" onClick={() => setPage(pageNum)}>
                            {pageNum}
                          </button>
                        </li>
                      );
                    })}
                    <li className={`page-item ${page === totalPage ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => setPage(page + 1)}
                        disabled={page === totalPage}
                      >
                        ຖັດໄປ
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </AdminLayout>
    </>
  );
}