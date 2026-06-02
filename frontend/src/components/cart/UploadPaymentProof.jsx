import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MetaData from "../layout/MetaData";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { clearCart } from "../redux/features/cartSlice";
import { clearShippingInfo } from "../redux/features/shippingSlice";
import { useGetOrderDetailsQuery } from "../redux/api/OrderApi";

// ✅ ต้องตรงกับ backend (BANK_TRANSFER_EXPIRY_MINUTES)
const ORDER_EXPIRY_MINUTES = 15;

export default function UploadPaymentProof() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ดึง order เพื่อรู้ createdAt + เช็คว่ายังไม่หมดอายุ
  const { data: orderData } = useGetOrderDetailsQuery(orderId, {
    skip: !orderId,
  });
  const order = orderData?.order;

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [selectedBank, setSelectedBank] = useState(0);

  // ✅ Countdown timer — แสดงเวลาที่เหลือก่อน order หมดอายุ
  const [remainingMs, setRemainingMs] = useState(null);

  useEffect(() => {
    if (!order?.createdAt) return;
    const expiresAt =
      new Date(order.createdAt).getTime() + ORDER_EXPIRY_MINUTES * 60 * 1000;

    const tick = () => {
      const ms = expiresAt - Date.now();
      setRemainingMs(Math.max(0, ms));

      // ถ้าหมดอายุ + ยังไม่ upload → แจ้งและกลับหน้า orders
      if (ms <= 0 && order.fulfillmentStatus !== "Cancelled" && (!order.paymentProof || order.paymentProof.length === 0)) {
        toast.error("ອໍເດີນີ້ໝົດອາຍຸແລ້ວ ກະລຸນາສ້າງອໍເດີໃໝ່", { duration: 4000 });
        setTimeout(() => navigate("/me/orders"), 1500);
      }
    };

    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [order?.createdAt, order?.fulfillmentStatus, order?.paymentProof, navigate]);

  const formatTime = (ms) => {
    if (ms == null) return "--:--";
    const totalSec = Math.floor(ms / 1000);
    const mm = Math.floor(totalSec / 60);
    const ss = totalSec % 60;
    return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  };

  const isExpired = remainingMs === 0;
  const isUrgent = remainingMs !== null && remainingMs < 3 * 60 * 1000; // < 3 mins

  // ✅ ใช้ cookie auth ผ่าน xhr.withCredentials (ลบ localStorage token)
  const dropRef = useRef(null);
  const fileInputRef = useRef(null);

  const bankAccounts = [
    {
      bank: "ທະນາຄານພັດທະນາລາວ",
      bankEn: "Lao Development Bank",
      accountName: "IT HUBB CO., LTD",
      accountNumber: "203-01-01-00001",
      qrCode: "/images/qrcode.jpg",
      color: "#1e40af",
      icon: "🏦",
    },
    {
      bank: "ທະນາຄານການຄ້າຕ່າງປະເທດລາວ",
      bankEn: "BCEL",
      accountName: "IT HUBB CO., LTD",
      accountNumber: "010-01-00001",
      qrCode: "/images/qrcode.jpg",
      color: "#dc2626",
      icon: "🏦",
    },
    {
      bank: "ທະນາຄານພົງສະຫວັນ",
      bankEn: "PSVB Bank",
      accountName: "IT HUBB CO., LTD",
      accountNumber: "301-01-00001",
      qrCode: "/images/qrcode.jpg",
      color: "#059669",
      icon: "🏦",
    },
  ];

  useEffect(() => {
    if (!orderId) {
      toast.error("ບໍ່ພົບເລກອໍເດີ");
      navigate("/me/orders");
    }
  }, [orderId, navigate]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;

    const handleDragOver = (e) => {
      e.preventDefault();
      setDragActive(true);
    };

    const handleDragLeave = () => setDragActive(false);

    const handleDrop = (e) => {
      e.preventDefault();
      setDragActive(false);
      const f = e.dataTransfer.files?.[0];
      if (f) onFileSelected(f);
    };

    el.addEventListener("dragover", handleDragOver);
    el.addEventListener("dragleave", handleDragLeave);
    el.addEventListener("drop", handleDrop);

    return () => {
      el.removeEventListener("dragover", handleDragOver);
      el.removeEventListener("dragleave", handleDragLeave);
      el.removeEventListener("drop", handleDrop);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFileSelected = (f) => {
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      toast.error("ໄຟລ໌ໃຫຍ່ເກີນ 5MB");
      return;
    }
    if (!f.type.startsWith("image/")) {
      toast.error("ກະລຸນາເລືອກໄຟລ໌ຮູບພາບ");
      return;
    }
    setFile(f);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(f));
    setProgress(0);
  };

  const onFileChange = (e) => {
    onFileSelected(e.target.files[0]);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const doUpload = (fd) =>
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `/api/v1/orders/${orderId}/upload-proof`, true);
      xhr.withCredentials = true; // ✅ ส่ง cookie auth

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        try {
          const json = JSON.parse(xhr.responseText || "{}");
          xhr.status >= 200 && xhr.status < 300 ? resolve(json) : reject(json);
        } catch (err) {
          reject({ message: "ຕອບສະໜອງຜິດພາດ" });
        }
      };

      xhr.onerror = () => reject({ message: "ເກີດຂໍ້ຜິດພາດເຄືອຂ່າຍ" });
      xhr.send(fd);
    });

  const submit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("ກະລຸນາເລືອກໄຟລ໌");

    const fd = new FormData();
    fd.append("proof", file);

    setLoading(true);
    setProgress(0);

    try {
      const res = await doUpload(fd);
      setLoading(false);

      if (!res || (res.success === false && !res.proof)) {
        toast.error(res.message || "ອັບໂຫຼດລົ້ມເຫລວ");
        return;
      }

      // ✅ เคลียร์ทั้ง cart + shipping
      dispatch(clearCart());
      dispatch(clearShippingInfo());
      toast.success("ອັບໂຫຼດສຳເລັດ! ກຳລັງລໍຖ້າການຢືນຢັນ");

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setFile(null);
      setProgress(100);

      setTimeout(() => navigate("/me/orders"), 1500);
    } catch (err) {
      setLoading(false);
      toast.error(err?.message || "ເກີດຂໍ້ຜິດພາດ");
    }
  };

  const removeFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setProgress(0);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("ຄັດລອກເລກບັນຊີສຳເລັດ!");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;600;700&display=swap');

        .upload-page {
          font-family: "Noto Sans Lao", "Phetsarath OT", sans-serif;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          min-height: 100vh;
          padding: 2rem 1rem;
        }

        .upload-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .page-title {
          font-size: 2.25rem;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.75rem;
        }

        .page-subtitle {
          color: #64748b;
          font-size: 1.1rem;
        }

        .order-info-banner {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
          border: 2px solid rgba(102, 126, 234, 0.2);
          border-radius: 12px;
          padding: 1.25rem 1.75rem;
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .order-info-icon {
          font-size: 2.25rem;
        }

        .order-info-text {
          flex: 1;
          font-size: 1.1rem;
        }

        .order-id {
          font-family: monospace;
          font-weight: 600;
          color: #667eea;
        }

        .upload-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 2.5rem;
        }

        .info-card {
          background: white;
          border-radius: 20px;
          padding: 2.5rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          height: fit-content;
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          margin-bottom: 2.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 2px solid #f1f5f9;
        }

        .header-icon {
          font-size: 3rem;
        }

        .card-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 0.25rem;
        }

        .card-subtitle {
          color: #64748b;
          font-size: 1rem;
        }

        .bank-tabs {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 2rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
        }

        .bank-tab {
          padding: 0.85rem 1.5rem;
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          border-radius: 50px;
          color: #64748b;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
          font-size: 0.95rem;
        }

        .bank-tab.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-color: transparent;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .bank-account-card {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border: 2px solid var(--bank-color);
          border-radius: 20px;
          padding: 2rem;
        }

        .bank-header {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          margin-bottom: 2rem;
        }

        .bank-logo {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.75rem;
          font-weight: 700;
          background: var(--bank-color);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
        }

        .bank-name {
          font-size: 1.35rem;
          font-weight: 700;
          color: #1e293b;
        }

        .bank-name-en {
          font-size: 0.95rem;
          color: #64748b;
          margin-top: 0.25rem;
        }

        .account-info {
          background: white;
          border-radius: 16px;
          padding: 1.75rem;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
        }

        .account-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 0;
          border-bottom: 1px solid #f1f5f9;
        }

        .account-row:last-child {
          border-bottom: none;
        }

        .account-label {
          color: #64748b;
          font-size: 1.05rem;
        }

        .account-value {
          font-weight: 700;
          color: #1e293b;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.15rem;
        }

        .copy-btn {
          background: #f1f5f9;
          border: none;
          color: #667eea;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .copy-btn:hover {
          background: #e2e8f0;
          transform: scale(1.1);
        }

        .qr-section {
          text-align: center;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 2px dashed #e2e8f0;
        }

        .qr-instruction {
          font-size: 1rem;
          font-weight: 600;
          color: #475569;
          margin-bottom: 1.25rem;
        }

        .qr-wrapper {
          position: relative;
          display: inline-block;
          padding: 12px;
          background: white;
          border-radius: 24px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          transition: transform 0.3s ease;
        }

        .qr-wrapper:hover {
          transform: scale(1.02);
        }

        .qr-image {
          width: 400px; /* ขยายขนาดจาก 180px เป็น 280px */
          height: 800px;
          border-radius: 16px;
          display: block;
          object-fit: contain;
        }

        .upload-area {
          border: 3px dashed #e2e8f0;
          border-radius: 20px;
          padding: 4rem 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: #f8fafc;
          position: relative;
        }

        .upload-area:hover, .upload-area.drag-active {
          border-color: #667eea;
          background: rgba(102, 126, 234, 0.05);
          transform: translateY(-2px);
        }

        .upload-icon {
          font-size: 4rem;
          margin-bottom: 1.5rem;
          color: #667eea;
        }

        .upload-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 0.75rem;
        }

        .upload-subtitle {
          color: #64748b;
          font-size: 1rem;
        }

        .preview-container {
          position: relative;
          margin-top: 2rem;
        }

        .preview-image {
          width: 100%;
          max-height: 500px;
          object-fit: contain;
          border-radius: 16px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }

        .remove-preview {
          position: absolute;
          top: -12px;
          right: -12px;
          background: #ef4444;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          z-index: 10;
          font-weight: bold;
        }

        .file-info {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding: 1.25rem;
          background: #f1f5f9;
          border-radius: 16px;
          margin-top: 1.5rem;
        }

        .file-icon {
          font-size: 2.5rem;
        }

        .file-details {
          flex: 1;
        }

        .file-name {
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 0.25rem;
          font-size: 1.05rem;
        }

        .file-size {
          font-size: 0.9rem;
          color: #64748b;
        }

        .progress-section {
          margin-top: 2rem;
        }

        .progress-bar {
          height: 12px;
          background: #e2e8f0;
          border-radius: 6px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          transition: width 0.3s ease;
        }

        .progress-text {
          text-align: center;
          margin-top: 0.75rem;
          font-weight: 700;
          color: #667eea;
          font-size: 1.1rem;
        }

        .action-buttons {
          margin-top: 2.5rem;
          display: flex;
          gap: 1.25rem;
        }

        .submit-btn {
          flex: 1.5;
          padding: 1.15rem 2rem;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          border-radius: 16px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          font-size: 1.15rem;
          transition: all 0.3s ease;
          box-shadow: 0 6px 16px rgba(16, 185, 129, 0.25);
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(16, 185, 129, 0.4);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          box-shadow: none;
        }

        .cancel-btn {
          flex: 0.75;
          padding: 1.15rem 2rem;
          background: white;
          color: #64748b;
          border: 2px solid #e2e8f0;
          border-radius: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 1.1rem;
        }

        .cancel-btn:hover {
          border-color: #cbd5e1;
          background: #f8fafc;
          color: #1e293b;
        }

        .instructions {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(217, 119, 6, 0.08) 100%);
          border-left: 5px solid #f59e0b;
          border-radius: 16px;
          padding: 1.75rem;
          margin-top: 2.5rem;
        }

        .instructions-title {
          font-weight: 700;
          color: #92400e;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.15rem;
        }

        .instructions-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .instructions-list li {
          color: #78350f;
          font-size: 1rem;
          padding: 0.65rem 0;
          padding-left: 1.75rem;
          position: relative;
          font-weight: 500;
        }

        .instructions-list li::before {
          content: '✓';
          position: absolute;
          left: 0;
          color: #f59e0b;
          font-weight: 800;
        }

        @media (max-width: 1024px) {
          .upload-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .page-title {
            font-size: 1.75rem;
          }

          .info-card {
            padding: 1.75rem;
          }

          .qr-image {
            width: 220px;
            height: 220px;
          }

          .action-buttons {
            flex-direction: column;
          }

          .cancel-btn {
            order: 2;
          }
          
          .submit-btn {
            order: 1;
          }
        }

        .d-none {
          display: none;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <MetaData title="ອັບໂຫຼດຫຼັກຖານການຊຳລະ" />

      <div className="upload-page">
        <div className="upload-container">
          {/* Header */}
          <div className="page-header">
            <h1 className="page-title">💳 ອັບໂຫຼດຫຼັກຖານການຊຳລະ</h1>
            <p className="page-subtitle">
              ໂອນເງິນແລ້ວອັບໂຫຼດສະລິບການໂອນເພື່ອຢືນຢັນການຊຳລະ
            </p>
          </div>

          {/* Order Info */}
          <div className="order-info-banner">
            <div className="order-info-icon">📦</div>
            <div className="order-info-text">
              <div>
                ເລກອໍເດີ:{" "}
                <span className="order-id">
                  #{orderId?.substring(0, 12)}...
                </span>
              </div>
            </div>
          </div>

          {/* ✅ Countdown timer — เตือนว่า order หมดอายุภายในกี่นาที */}
          {remainingMs !== null && (
            <div
              style={{
                background: isExpired
                  ? 'linear-gradient(135deg, #fef2f2, #fee2e2)'
                  : isUrgent
                  ? 'linear-gradient(135deg, #fef3c7, #fde68a)'
                  : 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                border: `2px solid ${isExpired ? '#ef4444' : isUrgent ? '#f59e0b' : '#3b82f6'}`,
                borderRadius: 14,
                padding: '14px 18px',
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ fontSize: 28 }}>
                {isExpired ? '⏰' : isUrgent ? '⚠️' : '⏱️'}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontWeight: 700,
                    color: isExpired ? '#991b1b' : isUrgent ? '#92400e' : '#1e40af',
                    fontSize: '0.95rem',
                  }}
                >
                  {isExpired
                    ? 'ອໍເດີຫມົດອາຍຸແລ້ວ'
                    : isUrgent
                    ? 'ໃກ້ຫມົດເວລາ! ກະລຸນາອັບໂຫຼດສະຫຼິບໄວ'
                    : 'ກະລຸນາອັບໂຫຼດສະຫຼິບພາຍໃນ'}
                </div>
                <div
                  style={{
                    fontSize: '1.6rem',
                    fontWeight: 800,
                    color: isExpired ? '#dc2626' : isUrgent ? '#d97706' : '#2563eb',
                    fontFamily: 'monospace',
                    letterSpacing: 1,
                  }}
                >
                  {formatTime(remainingMs)}
                </div>
                {!isExpired && (
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2 }}>
                    ຖ້າເກີນເວລາ ອໍເດີຈະຖືກຍົກເລີກ + ສິນຄ້າຄືນສາງອັດຕະໂນມັດ
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="upload-grid">
            {/* Bank Info */}
            <div className="info-card">
              <div className="card-header">
                <div className="header-icon">🏦</div>
                <div>
                  <div className="card-title">ຂໍ້ມູນບັນຊີທະນາຄານ</div>
                  <div className="card-subtitle">ເລືອກທະນາຄານ ແລະ ໂອນເງິນ</div>
                </div>
              </div>

              <div className="bank-tabs">
                {bankAccounts.map((bank, index) => (
                  <button
                    key={index}
                    className={`bank-tab ${
                      selectedBank === index ? "active" : ""
                    }`}
                    onClick={() => setSelectedBank(index)}
                  >
                    {bank.icon} {bank.bankEn}
                  </button>
                ))}
              </div>

              <div
                className="bank-account-card"
                style={{ "--bank-color": bankAccounts[selectedBank].color }}
              >
                <div className="bank-header">
                  <div
                    className="bank-logo"
                    style={{ background: bankAccounts[selectedBank].color }}
                  >
                    {bankAccounts[selectedBank].icon}
                  </div>
                  <div>
                    <div className="bank-name">
                      {bankAccounts[selectedBank].bank}
                    </div>
                    <div className="bank-name-en">
                      {bankAccounts[selectedBank].bankEn}
                    </div>
                  </div>
                </div>
                
                <div className="account-info">
                  <div className="account-row">
                    <span className="account-label">ຊື່ບັນຊີ:</span>
                    <span className="account-value">
                      {bankAccounts[selectedBank].accountName}
                    </span>
                  </div>
                  <div className="account-row">
                    <span className="account-label">ເລກບັນຊີ:</span>
                    <span className="account-value">
                      {bankAccounts[selectedBank].accountNumber}
                      <button
                        className="copy-btn"
                        onClick={() =>
                          copyToClipboard(
                            bankAccounts[selectedBank].accountNumber
                          )
                        }
                        title="ຄັດລອກ"
                      >
                        <i className="fas fa-copy"></i>
                      </button>
                    </span>
                  </div>

                  {/* --- ส่วนแสดง QR Code ที่ขยายใหญ่ขึ้น --- */}
                  <div className="qr-section">
                    <div className="qr-instruction">
                      ສະແກນ QR ເພື່ອໂອນ
                    </div>
                    <div className="qr-wrapper">
                      <img
                        src={bankAccounts[selectedBank].qrCode}
                        alt="QR Code"
                        className="qr-image"
                        onError={(e) => {
                          const currentSrc = e.target.getAttribute('src');
                          if (currentSrc && currentSrc.startsWith('/')) {
                            e.target.src = currentSrc.substring(1);
                          } else {
                            e.target.src = "https://via.placeholder.com/280?text=QR+Not+Found";
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="instructions">
                <div className="instructions-title">
                  <i className="fas fa-info-circle"></i>
                  <span>ຂັ້ນຕອນການຊຳລະ</span>
                </div>
                <ul className="instructions-list">
                  <li>ໂອນເງິນໄປຍັງບັນຊີທີ່ເລືອກ</li>
                  <li>ຖ່າຍຮູບສະລິບການໂອນ</li>
                  <li>ອັບໂຫຼດຮູບພາບດ້ວຍປຸ່ມດ້ານຂ້າງ</li>
                  <li>ລໍຖ້າການຢືນຢັນຈາກພວກເຮົາ</li>
                </ul>
              </div>
            </div>

            {/* Upload Form */}
            <div className="info-card">
              <div className="card-header">
                <div className="header-icon">📤</div>
                <div>
                  <div className="card-title">ອັບໂຫຼດສະລິບ</div>
                  <div className="card-subtitle">ຮູບພາບຂະໜาดສູງສຸດ 5MB</div>
                </div>
              </div>

              <form onSubmit={submit}>
                <div
                  ref={dropRef}
                  className={`upload-area ${dragActive ? "drag-active" : ""}`}
                  onClick={triggerFileSelect}
                >
                  <div className="upload-icon">📎</div>
                  <div className="upload-title">ລາກ ຫຼື ຄລິກເພື່ອເລືອກໄຟລ໌</div>
                  <div className="upload-subtitle">
                    ຮອງຮັບ: JPG, PNG, WEBP (ສູงສຸດ 5MB)
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    className="d-none"
                    accept="image/*"
                    onChange={onFileChange}
                  />

                  {previewUrl && (
                    <div className="preview-container" onClick={(e) => e.stopPropagation()}>
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="preview-image"
                      />
                      <div className="remove-preview" onClick={removeFile}>
                        ✕
                      </div>
                    </div>
                  )}
                </div>

                {file && !loading && (
                  <div className="file-info">
                    <div className="file-icon">📄</div>
                    <div className="file-details">
                      <div className="file-name">{file.name}</div>
                      <div className="file-size">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  </div>
                )}

                {loading && (
                  <div className="progress-section">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <div className="progress-text">ກຳລັງອັບໂຫຼດ... {progress}%</div>
                  </div>
                )}

                <div className="action-buttons">
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={!file || loading || isExpired}
                  >
                    {loading ? (
                      <i className="fas fa-spinner spinner"></i>
                    ) : (
                      <i className="fas fa-check-circle"></i>
                    )}
                    <span>ຢືນຢັນການຊຳລະ</span>
                  </button>
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => navigate("/me/orders")}
                    disabled={loading}
                  >
                    ຍົກເລີກ
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
