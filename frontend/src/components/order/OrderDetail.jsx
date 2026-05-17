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

// Currency formatter -> ₭ 7,000,000.00
const formatLAK = (val) => {
  const n = Number(val ?? 0);
  return `₭ ${n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// safe URL helper
const resolveFileUrl = (urlOrPath) => {
  if (!urlOrPath) return "";
  if (/^https?:\/\//i.test(urlOrPath)) return urlOrPath;
  if (urlOrPath.startsWith("/")) return urlOrPath;
  return `/uploads/payment_proofs/${urlOrPath}`;
};

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useGetOrderDetailsQuery(id);
  const order = data?.order || null;

  const [cancelOrder, { isLoading: cancelling }] = useCancelMyOrderMutation();

  // Local state for lightbox modal
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const [copiedId, setCopiedId] = useState(false);

  // Cancel modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  // ✅ ตรวจว่า order นี้ยกเลิกได้หรือไม่
  const currentStatus = order?.fulfillmentStatus || order?.status || order?.orderStatus;
  const canCancel =
    order &&
    ["Unfulfilled", "Processing"].includes(currentStatus) &&
    order.paymentStatus !== "Paid";

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      return toast.error("ກະລຸນາລະບຸເຫດຜົນການຍົກເລີກ");
    }
    try {
      await cancelOrder({ id, reason: cancelReason.trim() }).unwrap();
      toast.success("ຍົກເລີກອໍເດີສຳເລັດ ສິນຄ້າຄືນສາງແລ້ວ");
      setCancelModalOpen(false);
      setCancelReason("");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "ການຍົກເລີກລົ້ມເຫລວ");
    }
  };

  useEffect(() => {
    if (error) {
      // ✅ จัดการ 403 (ไม่ใช่เจ้าของ order) แบบเจาะจง
      if (error?.status === 403) {
        toast.error("ທ່ານບໍ່ມີສິດເບິ່ງອໍເດີນີ້");
        setTimeout(() => navigate('/me/orders', { replace: true }), 1200);
      } else if (error?.status === 404) {
        toast.error("ບໍ່ພົບອໍເດີນີ້");
      } else {
        toast.error(
          error?.data?.message || "เกิดข้อผิดพลาดขณะดึงข้อมูลออร์เดอร์"
        );
      }
    }
  }, [error, navigate]);

  if (isLoading) return <Loader />;

  if (!order) {
    return (
      <>
        <MetaData title="Order Details" />
        <div className="container mt-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="text-center">
              <div className="empty-icon mb-4">❌</div>
              <h3>ບໍ່ພົບອໍເດີນີ້</h3>
              <p className="text-muted mb-4">ບໍ່ພົບອໍເດີນີ້ຫຼືເກີດຂໍ້ຜິດພາດ</p>
              <button className="btn btn-primary" onClick={() => navigate(-1)}>
                <i className="fas fa-arrow-left me-2"></i>ຍົກກັບຄືນ
              </button>
            </div>
          </motion.div>
        </div>
      </>
    );
  }

  const {
    shippingInfo = {},
    paymentInfo = {},
    orderItems = [],
    user = {},
    totalAmount = 0,
    orderStatus = "Pending",
    createdAt,
    paymentMethod = order.paymentMethod || "N/A",
    paymentProof = [],
    shippingCarrier = shippingInfo.shippingCarrier || "N/A",
    branch = shippingInfo.branch || "N/A",
  } = order;

  const isPaid =
    (paymentInfo?.status || "").toString().toLowerCase() === "paid" ||
    (order.paymentStatus || "").toString().toLowerCase() === "paid";

  const openLightbox = (src) => {
    setLightboxSrc(src);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxSrc(null);
    setLightboxOpen(false);
  };

  const downloadAllProofsZip = async () => {
    try {
      const res = await fetch(`/api/v1/orders/${order._id}/download-proofs`, {
        method: "GET",
        credentials: "include", // ✅ ส่ง cookie auth
      });
      if (!res.ok) {
        const err = await res
          .json()
          .catch(() => ({ message: "Download failed" }));
        return toast.error(err.message || "ດາວໂຫຼດລົ້ມເຫຼວ");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `order-${order._id}-proofs.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("ເລີ່ມດາວໂຫຼດໄຟລ໌ ZIP");
    } catch (err) {
      console.error(err);
      toast.error("ເກີດຂໍ້ຜິດພາດລະຫວ່າງດາວໂຫຼດ");
    }
  };

  const formatDate = (d) => {
    if (!d) return "N/A";
    try {
      return new Date(d).toLocaleString("lo-LA", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return d;
    }
  };

  // copy order id
  const copyOrderId = async () => {
    try {
      await navigator.clipboard.writeText(order._id);
      setCopiedId(true);
      toast.success("ຄັດລອກ Order ID ແລ້ວ");
      setTimeout(() => setCopiedId(false), 2000);
    } catch (err) {
      console.error("copy failed", err);
      toast.error("ຄັດລອກບໍ່ສຳເລັດ");
    }
  };

  // Get status badge info
  const getStatusInfo = (status) => {
    const statusLower = status?.toLowerCase() || "";
    switch (statusLower) {
      case "delivered":
        return {
          color: "#10b981",
          label: "ສຳເລັດ",
          icon: "✅",
          bgColor: "#d1fae5",
        };
      case "processing":
        return {
          color: "#3b82f6",
          label: "ກຳລັງດຳເນີນ",
          icon: "⏳",
          bgColor: "#dbeafe",
        };
      case "shipped":
        return {
          color: "#06b6d4",
          label: "ກຳລັງສົ່ງ",
          icon: "🚚",
          bgColor: "#cffafe",
        };
      case "cancelled":
        return {
          color: "#ef4444",
          label: "ຍົກເລີກ",
          icon: "❌",
          bgColor: "#fee2e2",
        };
      default:
        return {
          color: "#f59e0b",
          label: status || "ລໍຖ້າ",
          icon: "⏳",
          bgColor: "#fef3c7",
        };
    }
  };

  const statusInfo = getStatusInfo(orderStatus);

  return (
    <>
      <MetaData title="Order Details" />
      <div className="order-detail-container">
        <style>{`
          .order-detail-container {
            background: linear-gradient(135deg, #f6f8fb 0%, #eef2f6 100%);
            min-height: 100vh;
            padding: 20px 0;
            font-family: "Noto Sans Lao", "Phetsarath OT", "Segoe UI", Roboto, sans-serif;
          }

          .order-detail-content {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
          }

          .page-header {
            background: white;
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 24px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            border: 1px solid #e5e7eb;
          }

          .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 16px;
          }

          .header-title h1 {
            margin: 0;
            color: #1f2937;
            font-size: 2rem;
            font-weight: 700;
          }

          .header-subtitle {
            color: #6b7280;
            margin: 4px 0 0 0;
          }

          .header-actions {
            display: flex;
            gap: 12px;
            align-items: center;
          }

          .btn-icon {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .info-card {
            background: white;
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 24px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            border: 1px solid #e5e7eb;
          }

          .card-header {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 20px;
            padding-bottom: 16px;
            border-bottom: 2px solid #f3f4f6;
          }

          .card-icon {
            font-size: 1.5rem;
          }

          .card-title {
            margin: 0;
            color: #374151;
            font-size: 1.25rem;
            font-weight: 600;
          }

          .info-table {
            margin: 0;
          }

          .info-table th {
            background: #f9fafb;
            color: #374151;
            font-weight: 600;
            border: none;
            padding: 12px 16px;
            width: 30%;
          }

          .info-table td {
            padding: 12px 16px;
            border-color: #f3f4f6;
            color: #6b7280;
          }

          .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 0.9rem;
          }

          .shipping-info {
            background: #f9fafb;
            padding: 16px;
            border-radius: 8px;
            margin-top: 16px;
          }

          .shipping-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
          }

          .shipping-row:last-child {
            border-bottom: none;
          }

          .shipping-label {
            font-weight: 600;
            color: #374151;
          }

          .shipping-value {
            color: #6b7280;
            text-align: right;
          }

          .payment-proofs {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: 16px;
            margin-bottom: 20px;
          }

          .proof-card {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
            transition: all 0.3s ease;
          }

          .proof-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }

          .proof-image {
            width: 100%;
            height: 120px;
            object-fit: cover;
            cursor: pointer;
            transition: transform 0.3s ease;
          }

          .proof-image:hover {
            transform: scale(1.05);
          }

          .proof-info {
            padding: 12px;
          }

          .proof-filename {
            font-size: 0.8rem;
            color: #6b7280;
            margin-bottom: 8px;
            word-break: break-word;
          }

          .proof-actions {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .lightbox-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            padding: 20px;
            backdrop-filter: blur(4px);
          }

          .lightbox-content {
            max-width: 90%;
            max-height: 90%;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
          }

          .lightbox-image {
            width: 100%;
            height: auto;
            max-height: 70vh;
            object-fit: contain;
          }

          .lightbox-footer {
            padding: 16px;
            background: #f9fafb;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .order-items {
            margin-top: 32px;
          }

          .item-card {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 16px;
            transition: all 0.3s ease;
          }

          .item-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }

          .item-image {
            width: 80px;
            height: 80px;
            object-fit: cover;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
          }

          .item-details h5 {
            margin: 0 0 8px 0;
            color: #374151;
            font-size: 1rem;
            font-weight: 600;
          }

          .item-details h5 a {
            color: inherit;
            text-decoration: none;
          }

          .item-details h5 a:hover {
            color: #0f63ff;
          }

          .item-meta {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .item-price {
            color: #0f63ff;
            font-weight: 600;
            font-size: 1.1rem;
          }

          .item-quantity {
            color: #6b7280;
            font-size: 0.9rem;
          }

          .item-total {
            text-align: right;
          }

          .total-label {
            color: #6b7280;
            font-size: 0.8rem;
            margin-bottom: 4px;
          }

          .total-amount {
            color: #0f63ff;
            font-weight: 700;
            font-size: 1.2rem;
          }

          .back-button {
            background: #f3f4f6;
            color: #374151;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 8px;
          }

          .back-button:hover {
            background: #e5e7eb;
            transform: translateY(-1px);
          }

          .copy-button {
            background: linear-gradient(135deg, #0f63ff 0%, #1977ff 100%);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 8px;
          }

          .copy-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(15,99,255,0.3);
          }

          .copy-button.copied {
            background: #10b981;
          }

          .invoice-button {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 8px;
          }

          .invoice-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(16,185,129,0.3);
          }

          .download-button {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 8px;
          }

          .download-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(245,158,11,0.3);
          }

          .empty-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
            opacity: 0.5;
          }

          @media (max-width: 768px) {
            .header-content {
              flex-direction: column;
              align-items: flex-start;
            }

            .payment-proofs {
              grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            }

            .item-card .row {
              text-align: center;
            }

            .item-total {
              text-align: center;
              margin-top: 10px;
            }

            .lightbox-footer {
              flex-direction: column;
              gap: 10px;
            }
          }
        `}</style>

        <div className="order-detail-content">
          {/* Page Header */}
          <motion.div
            className="page-header"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="header-content">
              <div className="header-title">
                <h1>ລາຍລະອຽດອໍເດີ</h1>
                <p className="header-subtitle">
                  ຂໍ້ມູນລາຍລະອຽດຂອງຄໍາສັ່ງຊື້ #{order._id.substring(0, 8)}
                </p>
              </div>

              <div className="header-actions">
                {/* ✅ ປຸ່ມຍົກເລີກ — ສະແດງສະເພາະອໍເດີທີ່ຍົກເລີກໄດ້ */}
                {canCancel && (
                  <motion.button
                    className="btn btn-icon"
                    onClick={() => setCancelModalOpen(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      color: 'white',
                      border: 'none',
                    }}
                    disabled={cancelling}
                  >
                    <i className="fas fa-ban"></i>
                    ຍົກເລີກອໍເດີ
                  </motion.button>
                )}

                <motion.button
                  className={`btn btn-icon ${copiedId ? "copied" : ""}`}
                  onClick={copyOrderId}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <i className={`fas fa-${copiedId ? "check" : "copy"}`}></i>
                  {copiedId ? "ຄັດລອກແລ້ວ" : "ຄັດລອກ ID"}
                </motion.button>
                
                <motion.a
                  className="btn btn-icon invoice-button"
                  // 💡 Note: ถ้าคุณใช้ href ใน motion.a ไม่จำเป็นต้องมี onClick
                  href={`/invoice/orders/${order._id}`}
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <i className="fas fa-file-invoice"></i>
                  ໃບບິນ
                </motion.a>
                <motion.button
                  className="btn btn-icon back-button"
                  onClick={() => navigate(-1)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <i className="fas fa-arrow-left"></i>
                  ກັບຄືນ
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* ✅ Order Timeline */}
          {Array.isArray(order.events) && order.events.length > 0 && (
            <motion.div
              className="info-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
            >
              <div className="card-header">
                <div className="card-icon">🕓</div>
                <h3 className="card-title">ປະຫວັດອໍເດີ</h3>
              </div>
              <OrderTimeline events={order.events} />
            </motion.div>
          )}

          {/* Order Info Card */}
          <motion.div
            className="info-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="card-header">
              <div className="card-icon">📋</div>
              <h3 className="card-title">ຂໍ້ມູນທົ່ວໄປ</h3>
            </div>

            <div className="row">
              <div className="col-md-6">
                <table className="table info-table">
                  <tbody>
                    <tr>
                      <th>ລະຫັດອໍເດີ</th>
                      <td className="font-monospace">{order._id}</td>
                    </tr>
                    <tr>
                      <th>ວັນທີສັ່ງຊື້</th>
                      <td>{formatDate(createdAt)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="col-md-6">
                <table className="table info-table">
                  <tbody>
                    <tr>
                      <th>ສະຖານະ</th>
                      <td>
                        <span
                          className="status-badge"
                          style={{
                            backgroundColor: statusInfo.bgColor,
                            color: statusInfo.color,
                            border: `2px solid ${statusInfo.color}`,
                          }}
                        >
                          <span className="status-icon">{statusInfo.icon}</span>
                          <span>{statusInfo.label}</span>
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <th>ວິທີການຊຳລະ</th>
                      <td>
                        {paymentMethod === "COD" ? "💵 ເງິນສົດ (COD)" :
                         paymentMethod === "BankTransfer" ? "🏦 ໂອນເງິນ" :
                         paymentMethod === "PayAtStore" ? "🏪 ຈ່າຍທີ່ໜ້າຮ້ານ" :
                         paymentMethod}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>

          {/* Shipping Info Card */}
          <motion.div
            className="info-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="card-header">
              <div className="card-icon">📍</div>
              <h3 className="card-title">ຂໍ້ມູນການຂົນສົ່ງ</h3>
            </div>

            <div className="row">
              <div className="col-md-6">
                <table className="table info-table">
                  <tbody>
                    <tr>
                      <th>ຊື່ຜູ້ຮັບ</th>
                      <td>{user?.name || shippingInfo?.fullName || "N/A"}</td>
                    </tr>
                    <tr>
                      <th>ເບີໂທ</th>
                      <td>{shippingInfo?.phoneNo || "N/A"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="col-md-6">
                <table className="table info-table">
                  <tbody>
                    <tr>
                      <th>ຜູ້ຂົນສົ່ງ</th>
                      <td>{shippingCarrier}</td>
                    </tr>
                    <tr>
                      <th>ສາຂາ</th>
                      <td>{branch}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="shipping-info">
              <div className="shipping-row">
                <span className="shipping-label">ທີ່ຢູ່:</span>
                <span className="shipping-value">
                  {shippingInfo?.address || ""}
                  {shippingInfo?.city ? `, ${shippingInfo.city}` : ""}
                  {shippingInfo?.province ? `, ${shippingInfo.province}` : ""}
                  {shippingInfo?.zipCode ? ` ${shippingInfo.zipCode}` : ""}
                  {shippingInfo?.country ? `, ${shippingInfo.country}` : ""}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Payment Info Card */}
          <motion.div
            className="info-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <div className="card-header">
              <div className="card-icon">💳</div>
              <h3 className="card-title">ຂໍ້ມູນການຊຳລະ</h3>
            </div>

            <div className="row">
              <div className="col-md-6">
                <table className="table info-table">
                  <tbody>
                    <tr>
                      <th>ສະຖານະການຊຳລະ</th>
                      <td
                        className={
                          isPaid
                            ? "text-success fw-bold"
                            : "text-danger fw-bold"
                        }
                      >
                        {isPaid
                          ? "ຊຳລະແລ້ວ"
                          : order.paymentStatus || "ຍັງບໍ່ທັນຊຳລະ"}
                      </td>
                    </tr>
                    {isPaid && paymentInfo?.id && (
                      <tr>
                        <th>Transaction ID</th>
                        <td className="font-monospace">{paymentInfo.id}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="col-md-6">
                <table className="table info-table">
                  <tbody>
                    <tr>
                      <th>ຍອດທັງໝົດ</th>
                      <td
                        className="fw-bold text-primary"
                        style={{ fontSize: "1.2rem" }}
                      >
                        {formatLAK(totalAmount)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>

          {/* Payment Proofs Section */}
          {paymentProof && paymentProof.length > 0 && (
            <motion.div
              className="info-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <div className="card-header">
                <div className="card-icon">📄</div>
                <h3 className="card-title">ຫຼັກຖານການຊຳລະ</h3>
              </div>

              <div className="payment-proofs">
                {paymentProof.map((p, idx) => {
                  const url = resolveFileUrl(p.url || p.filename || "");
                  const isImage = /\.(png|jpe?g|webp|gif)$/i.test(url);
                  return (
                    <motion.div
                      key={idx}
                      className="proof-card"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isImage ? (
                        <img
                          src={url}
                          alt={`proof-${idx}`}
                          className="proof-image"
                          onClick={() => openLightbox(url)}
                        />
                      ) : (
                        <div className="proof-file">
                          <div className="file-icon">
                            <i className="fas fa-file-pdf fa-3x"></i>
                          </div>
                        </div>
                      )}

                      <div className="proof-info">
                        <div className="proof-filename">
                          {p.filename || `file-${idx + 1}`}
                        </div>
                        <div className="proof-actions">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => window.open(url, "_blank")}
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <a
                            href={url}
                            download
                            className="btn btn-sm btn-outline-success"
                          >
                            <i className="fas fa-download"></i>
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-3">
                <motion.button
                  className="btn download-button"
                  onClick={downloadAllProofsZip}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <i className="fas fa-file-archive"></i>
                  ດາວໂຫຼດທັງໝົດ (.zip)
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Order Items Section */}
          <motion.div
            className="order-items"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <div className="card-header mb-4">
              <div className="card-icon">🛒</div>
              <h3 className="card-title">
                ລາຍການທີ່ສັ່ງ ({orderItems.length} ລາຍການ)
              </h3>
            </div>

            <AnimatePresence>
              {orderItems.map((item, i) => (
                <motion.div
                  key={i}
                  className="item-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                >
                  <div className="row align-items-center">
                    <div className="col-md-2">
                      <Link to={`/product/${item.product}`}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="item-image"
                        />
                      </Link>
                    </div>

                    <div className="col-md-5">
                      <div className="item-details">
                        <h5>
                          <Link to={`/product/${item.product}`}>
                            {item.name}
                          </Link>
                        </h5>
                        <div className="item-meta">
                          <span className="item-price">
                            {formatLAK(item.price)}
                          </span>
                          <span className="item-quantity">
                            ຈຳນວນ: {item.quantity}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-3 text-center">
                      <div className="item-subtotal">
                        <div style={{ color: "#6b7280", fontSize: "0.8rem" }}>
                          ລວມ
                        </div>
                        <div className="item-price">
                          {formatLAK(item.price * item.quantity)}
                        </div>
                      </div>
                    </div>

                    <div className="col-md-2 text-center">
                      <Link
                        to={`/product/${item.product}`}
                        className="btn btn-outline-primary btn-sm"
                      >
                        <i className="fas fa-eye"></i> ເບິ່ງ
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Summary Card */}
          <motion.div
            className="info-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            <div className="card-header">
              <div className="card-icon">📊</div>
              <h3 className="card-title">ສະຫຼຸບການສັ່ງຊື້</h3>
            </div>

            <div className="row">
              <div className="col-md-6">
                <table className="table info-table">
                  <tbody>
                    <tr>
                      <th>ລວມລາຍການ</th>
                      <td>{orderItems.length} ລາຍການ</td>
                    </tr>
                    <tr>
                      <th>ຈຳນວນສິນຄ້າ</th>
                      <td>
                        {orderItems.reduce(
                          (sum, item) => sum + item.quantity,
                          0
                        )}{" "}
                        ຊິ້ນ
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="col-md-6">
                <table className="table info-table">
                  <tbody>
                    <tr>
                      <th>ລວມລາຄາ</th>
                      <td>
                        {formatLAK(
                          orderItems.reduce(
                            (sum, item) => sum + item.price * item.quantity,
                            0
                          )
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>ລວມທັງໝົດ</th>
                      <td
                        className="fw-bold text-primary"
                        style={{ fontSize: "1.2rem" }}
                      >
                        {formatLAK(totalAmount)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ✅ Cancel Order Modal */}
        <AnimatePresence>
          {cancelModalOpen && (
            <motion.div
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(4px)',
                zIndex: 9999,
                display: 'grid',
                placeItems: 'center',
                padding: 16,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !cancelling && setCancelModalOpen(false)}
            >
              <motion.div
                onClick={(e) => e.stopPropagation()}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                style={{
                  background: 'white',
                  borderRadius: 16,
                  padding: '28px 24px 20px',
                  maxWidth: 460,
                  width: '100%',
                  boxShadow: '0 24px 60px rgba(0,0,0,0.25)',
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    margin: '0 auto 16px',
                    background: '#fee2e2',
                    color: '#dc2626',
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 28,
                  }}
                >
                  <i className="fas fa-ban"></i>
                </div>
                <h4 style={{ textAlign: 'center', margin: '0 0 8px', color: '#1e293b' }}>
                  ຍົກເລີກອໍເດີ?
                </h4>
                <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.92rem', marginBottom: 16 }}>
                  ສິນຄ້າຈະຄືນກັບສາງ ການກະທຳນີ້ບໍ່ສາມາດຢ້ອນກັບໄດ້
                </p>

                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  ເຫດຜົນ <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={3}
                  placeholder="ເຊັ່ນ: ສັ່ງຜິດ, ບໍ່ຕ້ອງການແລ້ວ, ໄດ້ສິນຄ້າທີ່ອື່ນແລ້ວ..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '2px solid #e2e8f0',
                    borderRadius: 10,
                    fontSize: '0.95rem',
                    fontFamily: 'inherit',
                    outline: 'none',
                    resize: 'vertical',
                    marginBottom: 18,
                  }}
                  disabled={cancelling}
                  autoFocus
                />

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => {
                      setCancelModalOpen(false);
                      setCancelReason('');
                    }}
                    disabled={cancelling}
                    style={{
                      flex: 1,
                      padding: '12px 18px',
                      border: '2px solid #e2e8f0',
                      background: 'white',
                      color: '#64748b',
                      borderRadius: 10,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    ກັບຄືນ
                  </button>
                  <button
                    onClick={handleCancelOrder}
                    disabled={cancelling || !cancelReason.trim()}
                    style={{
                      flex: 1,
                      padding: '12px 18px',
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 10,
                      fontWeight: 700,
                      cursor: cancelling || !cancelReason.trim() ? 'not-allowed' : 'pointer',
                      opacity: cancelling || !cancelReason.trim() ? 0.6 : 1,
                    }}
                  >
                    {cancelling ? 'ກຳລັງຍົກເລີກ...' : 'ຢືນຢັນຍົກເລີກ'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lightbox Modal */}
        <AnimatePresence>
          {lightboxOpen && (
            <motion.div
              className="lightbox-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={closeLightbox}
            >
              <motion.div
                className="lightbox-content"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={lightboxSrc}
                  alt="preview"
                  className="lightbox-image"
                />
                <div className="lightbox-footer">
                  <span style={{ color: "#6b7280" }}>ກົດພາຍນອກຮູບເພື່ອປິດ</span>
                  <button className="btn btn-light" onClick={closeLightbox}>
                    <i className="fas fa-times"></i> ປິດ
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

// ✅ Order Timeline sub-component
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
  if (sec < 60) return "ໜ້ອຍກວ່າ 1 ນາທີຜ່ານມາ";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} ນາທີຜ່ານມາ`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} ຊົ່ວໂມງຜ່ານມາ`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day} ມື້ຜ່ານມາ`;
  return new Date(date).toLocaleDateString("lo-LA");
}

function OrderTimeline({ events = [] }) {
  // เรียงจากเก่า → ใหม่ (timeline ลำดับเหตุการณ์)
  const sorted = [...events].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );

  return (
    <>
      <style>{`
        .timeline { position: relative; padding-left: 32px; padding-top: 8px; }
        .timeline::before {
          content: ''; position: absolute;
          left: 14px; top: 16px; bottom: 8px;
          width: 2px; background: linear-gradient(180deg, #e2e8f0, #f1f5f9);
        }
        .timeline-event {
          position: relative; margin-bottom: 20px;
        }
        .timeline-event:last-child { margin-bottom: 0; }
        .timeline-dot {
          position: absolute; left: -32px; top: 0;
          width: 30px; height: 30px;
          border-radius: 50%;
          display: grid; place-items: center;
          font-size: 14px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
          border: 3px solid white;
        }
        .timeline-content {
          background: #f8fafc;
          border-left: 3px solid;
          padding: 10px 14px;
          border-radius: 0 10px 10px 0;
          margin-left: 4px;
        }
        .timeline-label {
          font-weight: 700; color: #1e293b; font-size: 0.95rem;
        }
        .timeline-note {
          color: #64748b; font-size: 0.85rem; margin-top: 2px;
        }
        .timeline-time {
          color: #94a3b8; font-size: 0.78rem; margin-top: 4px;
          display: flex; align-items: center; gap: 4px;
        }
      `}</style>
      <div className="timeline">
        {sorted.map((event, idx) => {
          const cfg = EVENT_CONFIG[event.type] || EVENT_CONFIG.note;
          return (
            <div className="timeline-event" key={event._id || idx}>
              <div
                className="timeline-dot"
                style={{ background: cfg.color, color: "white" }}
              >
                {cfg.icon}
              </div>
              <div
                className="timeline-content"
                style={{ borderLeftColor: cfg.color }}
              >
                <div className="timeline-label">{cfg.label}</div>
                {event.note && (
                  <div className="timeline-note">{event.note}</div>
                )}
                <div className="timeline-time" title={new Date(event.timestamp).toLocaleString()}>
                  <i className="far fa-clock"></i>
                  {formatRelativeTime(event.timestamp)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
