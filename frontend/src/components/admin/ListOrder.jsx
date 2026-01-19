import React, { useEffect, useState } from "react";
import { MDBDataTable } from "mdbreact";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faTrashAlt,
  faClipboardList,
  faHome,
  faSearchDollar,
  faMoneyBillWave,
  faUniversity,
  faCheckCircle,
  faSpinner,
  faSyncAlt,
  faSearch,
  faFilter,
  faSort,
  faBox,
  faUser,
  faCalendarAlt,
  faDollarSign,
  faChartBar,
  faPlus,
  faTruck,
} from "@fortawesome/free-solid-svg-icons";

import MetaData from "../layout/MetaData";
import Loader from "../layout/Loader";
import AdminLayout from "../layout/AdminLayout";

// 🟢 IMPORT RTK Query Hooks
import {
  useGetAdminOrdersQuery,
  useDeleteOrderMutation,
} from "../redux/api/OrderApi";

export default function ListOrder() {
  // 1. ดึงข้อมูลออเดอร์ทั้งหมดสำหรับ Admin
  const {
    data,
    isLoading,
    error: fetchError,
    isError: isFetchError,
    refetch,
  } = useGetAdminOrdersQuery();

  // 2. Mutation สำหรับการลบออเดอร์
  const [
    deleteOrder,
    { isLoading: isDeleting, error: deleteError, isSuccess: isDeleteSuccess },
  ] = useDeleteOrderMutation();

  // 3. State สำหรับการค้นหาและกรอง
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPayment, setFilterPayment] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [showFilters, setShowFilters] = useState(false);

  // 4. จัดการ Error และ Success
  useEffect(() => {
    if (isFetchError) {
      toast.error(fetchError?.data?.message || "ບໍ່ສາມາດໂຫລດລາຍການອໍເດີ");
    }
    if (isDeleteSuccess) {
      toast.success("ລຶບອໍເດີສຳເລັດ");
    }
    if (deleteError) {
      toast.error(deleteError?.data?.message || "ລຶບອໍເດີລົ້ມເຫຼວ");
    }
  }, [isFetchError, fetchError, isDeleteSuccess, deleteError]);

  // Helper: format currency (LAK)
  const formatLAK = (v) => {
    try {
      const n = Number(v || 0);
      return new Intl.NumberFormat("lo-LA", {
        style: "currency",
        currency: "LAK",
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      }).format(n);
    } catch {
      return `₭ ${Number(v || 0).toLocaleString("lo-LA")}`;
    }
  };

  // Helper: แสดงประเภทการชำระเงิน - Updated to detect Bank Transfer from status
  const getPaymentMethodDisplay = (order) => {
    const paymentStatus =
      order?.paymentStatus || order?.paymentInfo?.status || "";
    const paymentMethod = order?.paymentMethod || "";

    // ตรวจจับ Bank Transfer จากสถานะการชำระเงินก่อน
    if (
      paymentStatus === "AwaitingProof" ||
      paymentStatus === "Paid" ||
      paymentStatus === "Confirmed"
    ) {
      if (paymentStatus === "Paid" || paymentStatus === "Confirmed") {
        return (
          <span className="badge bg-success fw-bold">
            <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
            Bank Transfer (ອນຸມັດແລ້ວ)
          </span>
        );
      } else if (paymentStatus === "AwaitingProof") {
        return (
          <span className="badge bg-warning text-dark fw-bold">
            <FontAwesomeIcon icon={faUniversity} className="me-1" />
            Bank Transfer (ລໍຖ້າຕວຈສອບ)
          </span>
        );
      }
    }

    // ตรวจสอบจาก paymentMethod โดยตรง
    if (paymentMethod === "Bank Transfer" || paymentMethod === "Bank") {
      return (
        <span className="badge bg-primary fw-bold">
          <FontAwesomeIcon icon={faUniversity} className="me-1" />
          Bank Transfer
        </span>
      );
    }

    // COD orders
    if (paymentMethod === "COD") {
      return (
        <span className="badge bg-info text-dark fw-bold">
          <FontAwesomeIcon icon={faMoneyBillWave} className="me-1" />
          COD (ເງິນສົດ)
        </span>
      );
    }

    // Default: ถ้าไม่มี paymentMethod แต่มีสถานะพิเศษ ให้แสดงเป็น Bank Transfer
    if (paymentStatus && paymentStatus !== "Rejected") {
      return (
        <span className="badge bg-primary fw-bold">
          <FontAwesomeIcon icon={faUniversity} className="me-1" />
          Bank Transfer
        </span>
      );
    }

    // ถ้าไม่มีข้อมูลเลย
    return <span className="badge bg-secondary fw-bold">ບໍ່ລະບຸ</span>;
  };

  // 5. Handler สำหรับการลบออเดอร์
  const deleteOrderHandler = (id) => {
    if (window.confirm(`ທ່ານແນ່ໃຈບໍທີ່ຈະລຶບອໍເດີ ${id} ນີ້?`)) {
      deleteOrder(id);
    }
  };

  // 6. ฟังก์ชันกรองและเรียงข้อมูล
  const filterAndSortOrders = (orders) => {
    let filtered = orders.filter((order) => {
      // ค้นหา
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const orderId = (order._id || "").toLowerCase();
        const customerName = (
          order.user?.name ||
          order.shippingInfo?.name ||
          ""
        ).toLowerCase();
        const customerEmail = (order.user?.email || "").toLowerCase();
        return (
          orderId.includes(term) ||
          customerName.includes(term) ||
          customerEmail.includes(term)
        );
      }
      return true;
    });

    // กรองตามสถานะ
    if (filterStatus !== "all") {
      filtered = filtered.filter((order) => {
        const status = (order.orderStatus || "").toLowerCase();
        return status === filterStatus.toLowerCase();
      });
    }

    // กรองตามวิธีการชำระเงิน
    if (filterPayment !== "all") {
      filtered = filtered.filter((order) => {
        const paymentMethod = (order.paymentMethod || "").toLowerCase();
        const paymentStatus = (
          order.paymentStatus ||
          order.paymentInfo?.status ||
          ""
        ).toLowerCase();

        if (filterPayment === "bank-transfer") {
          return (
            paymentMethod === "bank transfer" ||
            paymentMethod === "bank" ||
            paymentStatus === "awaitingproof" ||
            paymentStatus === "paid" ||
            paymentStatus === "confirmed"
          );
        }
        if (filterPayment === "cod") {
          return paymentMethod === "cod";
        }
        return true;
      });
    }

    // เรียงลำดับ
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case "date-asc":
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        case "amount-desc":
          return (b.totalAmount || 0) - (a.totalAmount || 0);
        case "amount-asc":
          return (a.totalAmount || 0) - (b.totalAmount || 0);
        case "status":
          return (a.orderStatus || "").localeCompare(b.orderStatus || "");
        default:
          return 0;
      }
    });

    return filtered;
  };

  // 7. เตรียมข้อมูลสำหรับ MDBDataTable
  const setOrders = () => {
    const orders = data?.orders || [];
    const filteredOrders = filterAndSortOrders(orders);

    const dataTable = {
      columns: [
        { label: "ເລກທີອໍເດີ", field: "id", sort: "asc" },
        { label: "ລູກຄ້າ", field: "customer", sort: "asc" },
        { label: "ວັນທີສັ່ງຊື້", field: "date", sort: "asc" },
        { label: "ປະເພດການຊຳລະ", field: "paymentMethod", sort: "asc" },
        { label: "ສະຖານະການຊໍາລະ", field: "paymentStatus", sort: "asc" },
        { label: "ສະຖານະອໍເດີ", field: "orderStatus", sort: "asc" },
        { label: "ຈຳນວນລວມ", field: "amount", sort: "asc" },
        { label: "Actions", field: "actions", sort: "disabled" },
      ],
      rows: [],
    };

    filteredOrders.forEach((order) => {
      const isDeletingCurrent =
        isDeleting && deleteError?.originalArgs === order._id;
      const customerName =
        order.user?.name || order.shippingInfo?.name || "N/A";
      const customerEmail = order.user?.email || "";
      const orderDate = order.createdAt
        ? new Date(order.createdAt).toLocaleDateString("lo-LA", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "N/A";

      dataTable.rows.push({
        id: (
          <div
            style={{
              fontFamily: "monospace",
              fontSize: "0.85rem",
              color: "#667eea",
              fontWeight: "600",
            }}
          >
            #{order._id?.substring(0, 12)}...
          </div>
        ),
        customer: (
          <div>
            <div style={{ fontWeight: "600", color: "#2d3748" }}>
              {customerName}
            </div>
            {customerEmail && (
              <div style={{ fontSize: "0.75rem", color: "#718096" }}>
                {customerEmail}
              </div>
            )}
          </div>
        ),
        date: (
          <div style={{ fontSize: "0.85rem", color: "#4a5568" }}>
            <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
            {orderDate}
          </div>
        ),
        paymentMethod: getPaymentMethodDisplay(order),
        paymentStatus: (
          <span
            className={`badge ${
              order.paymentStatus === "Paid" ||
              order.paymentStatus === "Confirmed"
                ? "bg-success"
                : "bg-warning text-dark"
            }`}
          >
            {order.paymentStatus || order.paymentInfo?.status || "Pending"}
          </span>
        ),
        orderStatus: (
          <span
            className={`badge ${
              order.orderStatus?.includes("Delivered")
                ? "bg-success"
                : order.orderStatus?.includes("Processing")
                ? "bg-primary"
                : order.orderStatus?.includes("Shipped")
                ? "bg-info text-dark"
                : "bg-secondary"
            }`}
          >
            {order.orderStatus || "Processing"}
          </span>
        ),
        amount: (
          <div
            style={{ fontSize: "1.1rem", fontWeight: "700", color: "#667eea" }}
          >
            {formatLAK(order.totalAmount)}
          </div>
        ),
        actions: (
          <div className="d-flex gap-1">
            <Link
              to={`/admin/orders/${order._id}`}
              className="btn btn-outline-primary btn-sm"
              title="ເບິ່ງລາຍລະອຽດ"
            >
              <FontAwesomeIcon icon={faEye} />
            </Link>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => deleteOrderHandler(order._id)}
              disabled={isDeleting}
              title="ລຶບອໍເດີ"
            >
              {isDeletingCurrent ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : (
                <FontAwesomeIcon icon={faTrashAlt} />
              )}
            </button>
          </div>
        ),
      });
    });

    return dataTable;
  };

  // 8. Loader
  if (isLoading) return <Loader />;

  // 9. คำนวณสถิติ
  const orders = data?.orders || [];
  const filteredOrders = filterAndSortOrders(orders);

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.orderStatus === "Processing").length,
    shipped: orders.filter((o) => o.orderStatus === "Shipped").length,
    delivered: orders.filter((o) => o.orderStatus === "Delivered").length,
    totalAmount: orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
    bankTransfer: orders.filter((o) => {
      const paymentMethod = (o.paymentMethod || "").toLowerCase();
      const paymentStatus = (
        o.paymentStatus ||
        o.paymentInfo?.status ||
        ""
      ).toLowerCase();
      return (
        paymentMethod === "bank transfer" ||
        paymentMethod === "bank" ||
        paymentStatus === "awaitingproof" ||
        paymentStatus === "paid" ||
        paymentStatus === "confirmed"
      );
    }).length,
    cod: orders.filter((o) => (o.paymentMethod || "").toLowerCase() === "cod")
      .length,
  };

  return (
    <>
      <MetaData title="Admin - ລາຍການອໍເດີ" />
      <style>{`
                .orders-container {
    padding: 0;
    max-width: 1400px; /* เพิ่มจากค่า default */
    margin: 0 auto;
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
                    color: '#718096';
                    font-size: '0.95rem';
                    margin: 0;
                }

                .breadcrumb-nav {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.875rem;
                    color: #718096;
                    margin-bottom: 0.5rem;
                }

                .breadcrumb-nav a {
                    color: #667eea;
                    text-decoration: none;
                    transition: color 0.2s;
                }

                .breadcrumb-nav a:hover {
                    color: #764ba2;
                }

                /* Stats Cards */
                .stats-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); /* เพิ่ม min-width */
    gap: 2rem;
    margin-bottom: 2rem;
}

/* ปรับสัดส่วนภายใน card */
.stat-card {
    background: white;
    border-radius: 20px; /* เพิ่มความโค้ง */
    padding: 2.5rem; /* เพิ่ม padding เยอะๆ */
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 2rem;
    min-height: 140px; /* เพิ่มความสูงขั้นต่ำ */
    width: 100%; /* ให้เต็มความกว้าง */
}



                .lao-text {
    font-family: 'Noto Sans Lao', 'Saysettha OT', 'Phetsarath OT', 
                 'Lao Unicode', 'Lao Sans Pro', sans-serif;
    line-height: 1.6;
}

                .stat-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.15);
                }

                .stat-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.25rem;
                    color: white;
                }

                .stat-icon.primary {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }

                .stat-icon.success {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                }

                .stat-icon.warning {
                    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
                }

                .stat-icon.info {
                    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                }

                .stat-content h3 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #2d3748;
                    margin: 0;
                }

                .stat-content p {
                    font-size: 0.875rem;
                    color: #718096;
                    margin: 0;
                }

                /* Controls Section */
                .controls-section {
                    background: white;
                    border-radius: 12px;
                    padding: 1.5rem;
                    margin-bottom: 1.5rem;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                }

                .controls-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }

                .controls-toggle {
                    background: #f7fafc;
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    color: #667eea;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .controls-toggle:hover {
                    background: #edf2f7;
                }

                .controls-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
                    margin-bottom: 1rem;
                }

                .control-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .control-group label {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #4a5568;
                    margin: 0;
                }

                .control-input {
                    padding: 0.625rem 1rem;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 0.875rem;
                    transition: all 0.2s ease;
                }

                .control-input:focus {
                    outline: none;
                    border-color: #667eea;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                }

                .refresh-btn {
                    padding: 0.625rem 1.5rem;
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
                }

                .refresh-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
                }

                /* Table Section */
                .table-section {
                    background: white;
                    border-radius: 12px;
                    padding: 1.5rem;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                    border: 1px solid rgba(0, 0, 0, 0.05);
                }

                /* Custom styles for MDBDataTable */
                .dataTables_wrapper .row:first-child {
                    margin-bottom: 1.5rem;
                }
                .dataTables_wrapper .row:last-child {
                    margin-top: 1.5rem;
                }
                .dataTables_length label, .dataTables_filter label, .dataTables_info {
                    color: #4a5568;
                }
                .dataTables_filter input {
                    border: 2px solid #e2e8f0;
                    border-radius: 10px;
                    padding: 0.5rem 1rem;
                    font-size: 0.95rem;
                    transition: all 0.2s ease;
                    background: #f8fafc;
                }
                .dataTables_filter input:focus {
                    border-color: #667eea;
                    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
                    background: white;
                    outline: none;
                }
                .dataTables_paginate .pagination .page-item .page-link {
                    border-radius: 8px;
                    margin: 0 4px;
                    color: #667eea;
                    border: 1px solid #e2e8f0;
                }
                .dataTables_paginate .pagination .page-item.active .page-link {
                    background: #667eea;
                    border-color: #667eea;
                    color: white;
                }
                table.dataTable thead th {
                    border-bottom: 2px solid #667eea;
                    color: #2d3748;
                    font-weight: 600;
                }
                table.dataTable tbody td {
                    color: #4a5568;
                }

                /* Empty State */
                .empty-state {
                    text-align: center;
                    padding: 4rem 2rem;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                }

                .empty-state-icon {
                    font-size: 4rem;
                    color: #cbd5e0;
                    margin-bottom: 1rem;
                }

                .empty-state-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #2d3748;
                    margin-bottom: 0.5rem;
                }

                .empty-state-text {
                    color: #718096;
                    font-size: 0.875rem;
                }

                /* Action Buttons */
                .btn-verify-payments {
                    padding: 0.6rem 1.5rem;
                    font-weight: 600;
                    font-size: 0.9rem;
                    border-radius: 10px;
                    border: none;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    text-decoration: none;
                }
                .btn-verify-payments:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
                    color: white;
                }

                @media (max-width: 768px) {
                    .controls-grid {
                        grid-template-columns: 1fr;
                    }
                    .stats-section {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
      <AdminLayout>
        <div className="orders-container">
          {/* Page Header */}
          <div className="page-header">
            <div className="breadcrumb-nav">
              <Link to="/admin/dashboard">
                <FontAwesomeIcon icon={faHome} /> Dashboard
              </Link>
              <span>/</span>
              <span>ລາຍການອໍເດີ</span>
            </div>
            <h1 className="page-title">
              <FontAwesomeIcon icon={faClipboardList} /> ລາຍການອໍເດີທັງໝົດ (
              {stats.total})
            </h1>
            <p className="page-subtitle">
              ຈັດການ, ເບິ່ງລາຍລະອຽດ, ແລະ ລຶບອໍເດີຂອງລູກຄ້າ
            </p>
          </div>

          {/* Stats Cards */}
          <div className="stats-section">
            <div className="stat-card">
              <div className="stat-icon primary">
                <FontAwesomeIcon icon={faBox} />
              </div>
              <div className="stat-content">
                <h3>{stats.total}</h3>
                <p>ອໍເດີທັງໝົດ</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon warning">
                <FontAwesomeIcon icon={faSpinner} />
              </div>
              <div className="stat-content">
                <h3>{stats.pending}</h3>
                <p>ກຳລັງດຳເນີນ</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon info">
                <FontAwesomeIcon icon={faTruck} />
              </div>
              <div className="stat-content">
                <h3>{stats.shipped}</h3>
                <p>ຈັດສົ່ງແລ້ວ</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon success">
                <FontAwesomeIcon icon={faCheckCircle} />
              </div>
              <div className="stat-content">
                <h3>{stats.delivered}</h3>
                <p>ສຳເລັດ</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon primary">
                <FontAwesomeIcon icon={faDollarSign} />
              </div>
              <div className="stat-content">
                <h3>{formatLAK(stats.totalAmount)}</h3>
                <p>ມູນຄ່າລວມ</p>
              </div>
            </div>
          </div>

          {/* Controls Section */}
          <div className="controls-section">
            <div className="controls-header">
              <h5 style={{ margin: 0, color: "#2d3748", fontWeight: "600" }}>
                <FontAwesomeIcon icon={faFilter} /> ຕົວກອງ ແລະ ການຄົ້ນຫາ
              </h5>
              <button
                className="controls-toggle"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FontAwesomeIcon icon={showFilters ? faEye : faSearch} />
                {showFilters ? "ຊອກຫາ" : "ສະແດງຕົວກອງ"}
              </button>
            </div>

            {showFilters && (
              <>
                <div className="controls-grid">
                  <div className="control-group">
                    <label>ຄົ້ນຫາ</label>
                    <input
                      type="text"
                      className="control-input"
                      placeholder="ຄົ້ນຫາດ້ວຍ ID, ຊື່ ຫຼື ອີເມວ..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="control-group">
                    <label>ສະຖານະອໍເດີ</label>
                    <select
                      className="control-input"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="all">ທັງໝົດ</option>
                      <option value="processing">ກຳລັງດຳເນີນ</option>
                      <option value="shipped">ຈັດສົ່ງແລ້ວ</option>
                      <option value="delivered">ສຳເລັດ</option>
                    </select>
                  </div>

                  <div className="control-group">
                    <label>ວິທີການຊຳລະ</label>
                    <select
                      className="control-input"
                      value={filterPayment}
                      onChange={(e) => setFilterPayment(e.target.value)}
                    >
                      <option value="all">ທັງໝົດ</option>
                      <option value="bank-transfer">Bank Transfer</option>
                      <option value="cod">COD</option>
                    </select>
                  </div>

                  <div className="control-group">
                    <label>ຈັດລຽງຕາມ</label>
                    <select
                      className="control-input"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="date-desc">ວັນທີ (ໃໝ່ສຸດ)</option>
                      <option value="date-asc">ວັນທີ (ເກົ່າສຸດ)</option>
                      <option value="amount-desc">ລາຄາ (ສູງສຸດ)</option>
                      <option value="amount-asc">ລາຄາ (ຕ່ຳສຸດ)</option>
                      <option value="status">ສະຖານະ</option>
                    </select>
                  </div>
                </div>

                <div
                  style={{ display: "flex", gap: "1rem", alignItems: "center" }}
                >
                  <button
                    className="refresh-btn"
                    onClick={refetch}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} spin />
                        <span>ກຳລັງໂຫຼດ...</span>
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faSyncAlt} />
                        <span>ໂຫຼດໃໝ່</span>
                      </>
                    )}
                  </button>

                  <div style={{ color: "#718096", fontSize: "0.875rem" }}>
                    ສະແດງ {filteredOrders.length} ຈາກ {stats.total} ອໍເດີ
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              marginBottom: "1.5rem",
              flexWrap: "wrap",
            }}
          >
            <Link to="/admin/verify-payments" className="btn-verify-payments">
              <FontAwesomeIcon icon={faSearchDollar} />
              ກວດສອບການຊຳລະ Bank Transfer
            </Link>

            <Link
              to="/admin/orders/create"
              className="btn-verify-payments"
              style={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              }}
            >
              <FontAwesomeIcon icon={faPlus} />
              ເພີ່ມອໍເດີໃໝ່
            </Link>
          </div>

          {/* Table Section */}
          <div className="table-section">
            {filteredOrders.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <FontAwesomeIcon icon={faBox} />
                </div>
                <h3 className="empty-state-title">
                  {searchTerm ||
                  filterStatus !== "all" ||
                  filterPayment !== "all"
                    ? "ບໍ່ພົບອໍເດີຕາມທີ່ຄົ້ນຫາ"
                    : "ຍັງບໍ່ມີອໍເດີ"}
                </h3>
                <p className="empty-state-text">
                  {searchTerm ||
                  filterStatus !== "all" ||
                  filterPayment !== "all"
                    ? "ລອງປ່ຽນຄຳຄົ້ນຫາ ຫຼື ຕົວກອງຂອງທ່ານ"
                    : "ລູກຄ້າຈະສາມາດສ້າງອໍເດີຜ່ານໜ້າຮ້ານຄ້າ"}
                </p>
              </div>
            ) : (
              <MDBDataTable
                data={setOrders()}
                className="px-3"
                bordered
                striped
                hover
                entries={10}
                entriesOptions={[5, 10, 20, 50, 100]}
                noBottomColumns
                searching={false} // ปิดการค้นหาของ MDB เพราะเรามีของเราแล้ว
              />
            )}
          </div>
        </div>
      </AdminLayout>
    </>
  );
}
