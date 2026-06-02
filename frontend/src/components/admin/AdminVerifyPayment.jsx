import React, { useEffect, useMemo, useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import AdminLayout from '../layout/AdminLayout';
import {
  useGetAdminOrdersQuery,
  useVerifyPaymentMutation,
  useNotifyOrderCustomerMutation,
} from '../redux/api/OrderApi';
import { confirmDialog } from './_shared/confirmDialog';

export default function AdminVerifyPayment() {
  const [verifyingId, setVerifyingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');

  // ✅ Pagination
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);

  // ✅ Server-side filter: ดึงเฉพาะ orders ที่ paymentStatus = AwaitingProof หรือ Pending
  //    (ลดจาก 1000+ orders เหลือแค่ที่ต้องตรวจสอบจริงๆ)
  const queryParams = useMemo(() => {
    const params = {
      paymentStatus: 'AwaitingProof,Pending', // backend รับ comma-separated
    };
    if (searchTerm.trim()) params.q = searchTerm.trim();
    return params;
  }, [searchTerm]);

  const {
    data: ordersData,
    isLoading: loading,
    error: fetchError,
    refetch,
  } = useGetAdminOrdersQuery(queryParams);

  const [verifyPayment] = useVerifyPaymentMutation();
  const [notifyCustomer] = useNotifyOrderCustomerMutation();

  // Reset page เมื่อเปลี่ยน filter/search/sort
  useEffect(() => {
    setPage(1);
  }, [filterStatus, searchTerm, sortBy]);

  // Proof modal state
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [proofItems, setProofItems] = useState([]);
  const [proofIndex, setProofIndex] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // ✅ Server-side filter ทำให้แล้ว — แค่อ่าน list มาใช้
  const orders = useMemo(() => {
    return Array.isArray(ordersData)
      ? ordersData
      : (ordersData?.orders || []);
  }, [ordersData]);

  // แสดง error ครั้งเดียวเมื่อโหลดล้มเหลว
  useEffect(() => {
    if (fetchError) {
      toast.error(fetchError?.data?.message || 'ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້');
    }
  }, [fetchError]);

  const formatLAK = (v) => {
    try {
      const n = Number(v || 0);
      return new Intl.NumberFormat('lo-LA', {
        style: 'currency',
        currency: 'LAK',
        maximumFractionDigits: 0,
      }).format(n);
    } catch {
      return `₭ ${v}`;
    }
  };

  const tryNotifyCustomer = async (orderId, action) => {
    try {
      await notifyCustomer({ id: orderId, action }).unwrap();
      toast.success('ແຈ້ງເຕືອນລູກຄ້າສຳເລັດ');
      return true;
    } catch (err) {
      console.error('notify error', err);
      toast.error(err?.data?.message || 'ການແຈ້ງເຕືອນລົ້ມເຫລວ');
      return false;
    }
  };

  const handleVerify = async (orderId, action, note = '') => {
    const isConfirm = action === 'confirm';
    const ok = await confirmDialog.show({
      title: isConfirm ? 'ຢືນຢັນການຊຳລະເງິນ?' : 'ປະຕິເສດການຊຳລະເງິນ?',
      message: isConfirm
        ? 'ການຊຳລະນີ້ຈະຖືກບັນທຶກວ່າສຳເລັດ ແລະ ອໍເດີຈະເຂົ້າສູ່ຂັ້ນຕອນຈັດສົ່ງ'
        : 'ການຊຳລະນີ້ຈະຖືກປະຕິເສດ ແລະ ລູກຄ້າຈະໄດ້ຮັບການແຈ້ງເຕືອນ',
      confirmText: isConfirm ? 'ຢືນຢັນ' : 'ປະຕິເສດ',
      variant: isConfirm ? 'primary' : 'warning',
      icon: isConfirm ? 'fa-check-double' : 'fa-ban',
    });
    if (!ok) return;

    setVerifyingId(orderId);
    try {
      await verifyPayment({
        id: orderId,
        action: action === 'confirm' ? 'confirm' : 'reject',
        note,
      }).unwrap();
      toast.success(action === 'confirm' ? 'ຢືນຢັນສຳເລັດ' : 'ປະຕິເສດສຳເລັດ');
      tryNotifyCustomer(orderId, action);
      // ไม่ต้องเรียก refetch — invalidatesTags จะ trigger ให้เอง
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || 'ການຢືນຢັນລົ້ມເຫລວ');
    } finally {
      setVerifyingId(null);
    }
  };

  const handleDownloadAllProofs = async (order) => {
    if (!order || !order.paymentProof || order.paymentProof.length === 0) {
      toast.error('ບໍ່ມີໄຟລ່ຫຼັກຖານ');
      return;
    }

    setDownloadingId(order._id);
    let JSZip, saveAs;
    try {
      const jszipMod = await import('jszip');
      JSZip = jszipMod.default || jszipMod;
      const fsMod = await import('file-saver');
      saveAs = fsMod.saveAs || fsMod.default || fsMod;
    } catch (err) {
      console.error('Missing JSZip/FileSaver', err);
      toast.error('ກະລຸນາຕິດຕັ້ງ: npm install jszip file-saver');
      setDownloadingId(null);
      return;
    }

    const zip = new JSZip();
    const folder = zip.folder(`order-${order._id}-proofs`) || zip;

    try {
      for (let i = 0; i < order.paymentProof.length; i++) {
        const p = order.paymentProof[i];
        if (!p?.url) continue;
        try {
          const fetchRes = await fetch(p.url, {
            credentials: 'include',
          });
          if (!fetchRes.ok) continue;
          const blob = await fetchRes.blob();
          const parsed = (() => {
            try {
              return (new URL(p.url, window.location.href)).pathname.split('/').pop();
            } catch {
              return null;
            }
          })();
          const safeName = p.filename || parsed || `file-${i + 1}`;
          folder.file(safeName, blob);
        } catch (innerErr) {
          console.warn('single fetch failed', p.url, innerErr);
          continue;
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `order-${order._id}-proofs.zip`);
      toast.success('ດາວໂຫຼດສຳເລັດ');
    } catch (err) {
      console.error('zip error', err);
      toast.error('ການສ້າງ ZIP ລົ້ມເຫລວ');
    } finally {
      setDownloadingId(null);
    }
  };

  const openProofsModal = (order) => {
    const proofs = Array.isArray(order.paymentProof) ? order.paymentProof : [];
    if (proofs.length === 0) {
      toast.error('ບໍ່ມີຮູບພາບຫຼັກຖານການຊຳລະເງິນ');
      return;
    }
    setProofItems(proofs);
    setProofIndex(0);
    setSelectedOrder(order);
    setProofModalOpen(true);
  };

  const closeProofsModal = () => {
    setProofModalOpen(false);
    setProofItems([]);
    setProofIndex(0);
    setSelectedOrder(null);
  };

  const showPrev = () => {
    setProofIndex((i) => (i <= 0 ? proofItems.length - 1 : i - 1));
  };
  
  const showNext = () => {
    setProofIndex((i) => (i >= proofItems.length - 1 ? 0 : i + 1));
  };

  // ✅ Server-side ทำ filter หลักแล้ว (paymentStatus + search q)
  //    Client-side ทำเพียง: sub-filter status (pending/awaiting), sort, refine search
  const filteredOrders = orders
    .filter((order) => {
      // Sub-filter: dropdown filterStatus
      if (filterStatus !== 'all') {
        const status = (order.paymentStatus || '').toLowerCase();
        const method = (order.paymentMethod || '').toLowerCase();
        if (filterStatus === 'cod' && method !== 'cod') return false;
        if (filterStatus === 'pending' && (status !== 'pending' || method === 'cod')) return false;
        if (filterStatus === 'awaiting' && status !== 'awaitingproof') return false;
      }
      // ค้นหา customer name (server-side ค้น orderId/address แล้ว — ตรงนี้ refine name)
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const customerName = (order.user?.name || order.shippingInfo?.name || '').toLowerCase();
        const orderId = (order._id || '').toLowerCase();
        if (!customerName.includes(term) && !orderId.includes(term)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date-desc': return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'date-asc':  return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        case 'amount-desc': return (b.totalAmount || 0) - (a.totalAmount || 0);
        case 'amount-asc':  return (a.totalAmount || 0) - (b.totalAmount || 0);
        default: return 0;
      }
    });

  // ✅ Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedOrders = filteredOrders.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  return (
    <AdminLayout>
      <style>{`
        .verify-payment-container {
          padding: 0;
        }

        .header-section {
          margin-bottom: 2rem;
        }

        .header-section h2 {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 700;
          font-size: 1.75rem;
          margin-bottom: 0.5rem;
        }

        .stats-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 1.25rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(102, 126, 234, 0.15);
        }

        .stat-card-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          margin-bottom: 0.75rem;
        }

        .stat-card-icon.pending {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          color: white;
        }

        .stat-card-icon.total {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .stat-card-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 0.25rem;
        }

        .stat-card-label {
          font-size: 0.875rem;
          color: #718096;
          margin: 0;
        }

        .controls-section {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .controls-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr auto;
          gap: 1rem;
          align-items: end;
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

        .orders-grid {
          display: grid;
          gap: 1rem;
        }

        .order-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }

        .order-card:hover {
          box-shadow: 0 4px 16px rgba(102, 126, 234, 0.15);
        }

        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #f0f0f0;
        }

        .order-id {
          font-family: monospace;
          font-weight: 600;
          color: #667eea;
          font-size: 0.875rem;
        }

        .order-status-badge {
          padding: 0.375rem 0.875rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .order-status-badge.pending {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          color: #92400e;
        }

        .order-status-badge.awaiting {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          color: #1e3a8a;
        }

        .order-body {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .order-info-group {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .order-info-label {
          font-size: 0.75rem;
          color: #718096;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .order-info-value {
          font-size: 0.875rem;
          color: #2d3748;
          font-weight: 600;
        }

        .order-amount {
          font-size: 1.25rem;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .proof-preview {
          display: flex;
          gap: 0.5rem;
          margin: 1rem 0;
          overflow-x: auto;
          padding: 0.5rem 0;
        }

        .proof-thumbnail {
          width: 80px;
          height: 80px;
          border-radius: 8px;
          object-fit: cover;
          cursor: pointer;
          border: 2px solid #e2e8f0;
          transition: all 0.2s ease;
        }

        .proof-thumbnail:hover {
          border-color: #667eea;
          transform: scale(1.05);
        }

        .order-actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .action-btn {
          padding: 0.625rem 1.25rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .action-btn.primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .action-btn.primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .action-btn.success {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }

        .action-btn.success:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .action-btn.danger {
          background: white;
          color: #ef4444;
          border: 2px solid #ef4444;
        }

        .action-btn.danger:hover:not(:disabled) {
          background: #ef4444;
          color: white;
        }

        .action-btn.secondary {
          background: white;
          color: #667eea;
          border: 2px solid #667eea;
        }

        .action-btn.secondary:hover:not(:disabled) {
          background: #667eea;
          color: white;
        }

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

        /* ✅ Pagination */
        .vp-pagination {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 24px 0 8px;
        }
        .vp-pagination-info {
          color: #64748b;
          font-size: 0.875rem;
        }
        .vp-pagination-list {
          display: flex;
          gap: 6px;
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .vp-page-btn {
          min-width: 40px;
          height: 40px;
          padding: 0 12px;
          border: 2px solid #e2e8f0;
          background: white;
          color: #64748b;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .vp-page-btn:hover:not(:disabled) {
          border-color: #667eea;
          color: #667eea;
          transform: translateY(-1px);
        }
        .vp-page-btn.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-color: #667eea;
          color: white;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }
        .vp-page-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          gap: 1rem;
        }

        .spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #e2e8f0;
          border-top-color: #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }

        .modal-content-wrapper {
          background: white;
          border-radius: 16px;
          max-width: 900px;
          width: 100%;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .modal-header-custom {
          padding: 1.5rem;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #2d3748;
          margin: 0;
        }

        .modal-close {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: #f7fafc;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .modal-close:hover {
          background: #edf2f7;
        }

        .modal-body-custom {
          flex: 1;
          overflow: auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .proof-viewer {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          background: #f7fafc;
          border-radius: 12px;
          overflow: hidden;
        }

        .proof-image {
          max-width: 100%;
          max-height: 60vh;
          object-fit: contain;
        }

        .proof-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.95);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: #2d3748;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .proof-nav-btn:hover {
          background: white;
          transform: translateY(-50%) scale(1.1);
        }

        .proof-nav-btn.prev {
          left: 1rem;
        }

        .proof-nav-btn.next {
          right: 1rem;
        }

        .order-details-section {
          background: #f7fafc;
          border-radius: 12px;
          padding: 1.5rem;
        }

        .order-details-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .modal-footer-custom {
          padding: 1.5rem;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }

        .proof-filename {
          font-size: 0.875rem;
          color: #718096;
          font-family: monospace;
        }

        @media (max-width: 768px) {
          .controls-row {
            grid-template-columns: 1fr;
          }

          .order-body {
            grid-template-columns: 1fr;
          }

          .order-details-grid {
            grid-template-columns: 1fr;
          }

          .action-btn {
            flex: 1;
          }
        }
      `}</style>

      <div className="verify-payment-container">
        {/* Header Section */}
        <div className="header-section">
          <h2>ການຢືນຢັນການຊຳລະເງິນ</h2>
          <p style={{ color: '#718096', fontSize: '0.875rem', margin: 0 }}>
            ກວດສອບ ແລະ ຢືນຢັນການຊຳລະເງິນຈາກລູກຄ້າ
          </p>
        </div>

        {/* Stats Cards */}
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-card-icon pending">
              <i className="fas fa-clock"></i>
            </div>
            <div className="stat-card-value">{filteredOrders.length}</div>
            <p className="stat-card-label">ລໍຖ້າການຢືນຢັນ</p>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon total">
              <i className="fas fa-shopping-cart"></i>
            </div>
            <div className="stat-card-value">{orders.length}</div>
            <p className="stat-card-label">ທັງໝົດ</p>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white' }}>
              <i className="fas fa-money-bill-wave"></i>
            </div>
            <div className="stat-card-value">
              {formatLAK(orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0))}
            </div>
            <p className="stat-card-label">ມູນຄ່າລວມ</p>
          </div>
        </div>

        {/* Controls Section */}
        <div className="controls-section">
          <div className="controls-row">
            <div className="control-group">
              <label>ຄົ້ນຫາ</label>
              <input
                type="text"
                className="control-input"
                placeholder="ຄົ້ນຫາດ້ວຍ ID ຫຼື ຊື່ລູກຄ້າ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="control-group">
              <label>ສະຖານະ</label>
              <select
                className="control-input"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">ທັງໝົດ</option>
                <option value="cod">💵 COD</option>
                <option value="pending">Pending (BankTransfer)</option>
                <option value="awaiting">Awaiting Proof</option>
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
              </select>
            </div>

            <button className="refresh-btn" onClick={refetch} disabled={loading}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>ກຳລັງໂຫຼດ...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-sync-alt"></i>
                  <span>ໂຫຼດໃໝ່</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Orders Grid */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p style={{ color: '#718096', fontWeight: 600 }}>ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <i className="fas fa-inbox"></i>
            </div>
            <h3 className="empty-state-title">ບໍ່ມີລາຍການລໍຖ້າການຢືນຢັນ</h3>
            <p className="empty-state-text">
              {searchTerm || filterStatus !== 'all'
                ? 'ບໍ່ພົບຜົນການຄົ້ນຫາ ກະລຸນາລອງໃໝ່'
                : 'ທຸກໆອໍເດີໄດ້ຮັບການຢືນຢັນແລ້ວ'}
            </p>
          </div>
        ) : (
          <div className="orders-grid">
            {pagedOrders.map((order) => {
              const hasProof = Array.isArray(order.paymentProof) && order.paymentProof.length > 0;
              const isCOD = order.paymentMethod === 'COD';
              const paymentStatus = order.paymentStatus || order.paymentInfo?.status || 'Unknown';
              const customerName = order.user?.name || order.shippingInfo?.name || 'N/A';
              const orderDate = order.createdAt 
                ? new Date(order.createdAt).toLocaleDateString('lo-LA', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'N/A';

              return (
                <div key={order._id} className="order-card">
                  {/* Order Header */}
                  <div className="order-header">
                    <div>
                      <div className="order-id">#{order._id?.substring(0, 12)}...</div>
                      <div style={{ fontSize: '0.75rem', color: '#718096', marginTop: '0.25rem' }}>
                        <i className="far fa-calendar-alt" style={{ marginRight: '0.25rem' }}></i>
                        {orderDate}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <span style={{
                        padding: '0.25rem 0.625rem',
                        borderRadius: '20px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        background: isCOD ? 'linear-gradient(135deg, #d1fae5, #a7f3d0)' : 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
                        color: isCOD ? '#065f46' : '#1e3a8a',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}>
                        {isCOD ? '💵 COD' : '🏦 BankTransfer'}
                      </span>
                      <span className={`order-status-badge ${paymentStatus.toLowerCase()}`}>
                        {paymentStatus}
                      </span>
                    </div>
                  </div>

                  {/* Order Body */}
                  <div className="order-body">
                    <div className="order-info-group">
                      <span className="order-info-label">ລູກຄ້າ</span>
                      <span className="order-info-value">
                        <i className="fas fa-user" style={{ marginRight: '0.5rem', color: '#667eea' }}></i>
                        {customerName}
                      </span>
                    </div>

                    <div className="order-info-group">
                      <span className="order-info-label">ຈຳນວນເງິນ</span>
                      <span className="order-amount">
                        {formatLAK(order.totalAmount || order.amount || 0)}
                      </span>
                    </div>

                    <div className="order-info-group">
                      <span className="order-info-label">ສະຖານະອໍເດີ</span>
                      <span className="order-info-value">
                        <i className="fas fa-box" style={{ marginRight: '0.5rem', color: '#667eea' }}></i>
                        {order.orderStatus || 'Processing'}
                      </span>
                    </div>

                    <div className="order-info-group">
                      <span className="order-info-label">ຈຳນວນສິນຄ້າ</span>
                      <span className="order-info-value">
                        <i className="fas fa-shopping-bag" style={{ marginRight: '0.5rem', color: '#667eea' }}></i>
                        {order.orderItems?.length || 0} ລາຍການ
                      </span>
                    </div>
                  </div>

                  {/* Proof Preview */}
                  {hasProof && (
                    <div className="proof-preview">
                      {order.paymentProof.slice(0, 4).map((proof, idx) => (
                        <img
                          key={idx}
                          src={proof.url}
                          alt={`Proof ${idx + 1}`}
                          className="proof-thumbnail"
                          onClick={() => openProofsModal(order)}
                        />
                      ))}
                      {order.paymentProof.length > 4 && (
                        <div
                          style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                          onClick={() => openProofsModal(order)}
                        >
                          +{order.paymentProof.length - 4}
                        </div>
                      )}
                    </div>
                  )}

                  {/* COD info banner */}
                  {isCOD && (
                    <div style={{
                      background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
                      border: '1px solid #6ee7b7',
                      borderRadius: '8px',
                      padding: '0.625rem 1rem',
                      margin: '0.75rem 0',
                      fontSize: '0.8rem',
                      color: '#065f46',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}>
                      <i className="fas fa-info-circle"></i>
                      <span>ຊຳລະສົດ (COD) — ບໍ່ຕ້ອງການຫຼັກຖານໂອນເງິນ, ກົດ "ຢືນຢັນ" ໄດ້ທັນທີ</span>
                    </div>
                  )}

                  {/* Order Actions */}
                  <div className="order-actions">
                    {!isCOD && (
                      <button
                        className="action-btn primary"
                        onClick={() => openProofsModal(order)}
                        disabled={!hasProof}
                        title={hasProof ? "ເບິ່ງຫຼັກຖານ" : "ບໍ່ມີຫຼັກຖານ"}
                      >
                        <i className="fas fa-eye"></i>
                        <span>ເບິ່ງຫຼັກຖານ</span>
                      </button>
                    )}

                    <button
                      className="action-btn success"
                      onClick={() => handleVerify(order._id, 'confirm')}
                      disabled={verifyingId === order._id}
                    >
                      {verifyingId === order._id ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        <i className="fas fa-check"></i>
                      )}
                      <span>ຢືນຢັນ</span>
                    </button>

                    <button
                      className="action-btn danger"
                      onClick={() => {
                        const note = window.prompt('ລະບຸເຫດຜົນທີ່ປະຕິເສດ (ບໍ່ບັງຄັບ):') || '';
                        handleVerify(order._id, 'reject', note);
                      }}
                      disabled={verifyingId === order._id}
                    >
                      <i className="fas fa-times"></i>
                      <span>ປະຕິເສດ</span>
                    </button>

                    {!isCOD && (
                      <button
                        className="action-btn secondary"
                        onClick={() => handleDownloadAllProofs(order)}
                        disabled={downloadingId === order._id || !hasProof}
                        title={hasProof ? "ດາວໂຫຼດທັງໝົດ" : "ບໍ່ມີຫຼັກຖານ"}
                      >
                        {downloadingId === order._id ? (
                          <i className="fas fa-spinner fa-spin"></i>
                        ) : (
                          <i className="fas fa-download"></i>
                        )}
                        <span>ZIP</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ✅ Pagination */}
        {filteredOrders.length > 0 && totalPages > 1 && (
          <div className="vp-pagination">
            <div className="vp-pagination-info">
              ສະແດງ {(safePage - 1) * PAGE_SIZE + 1}–
              {Math.min(safePage * PAGE_SIZE, filteredOrders.length)} ຈາກ{' '}
              {filteredOrders.length} ລາຍການ
            </div>
            <ul className="vp-pagination-list">
              <li>
                <button
                  className="vp-page-btn"
                  onClick={() => setPage(safePage - 1)}
                  disabled={safePage === 1}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
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
                      className={`vp-page-btn ${n === safePage ? 'active' : ''}`}
                      onClick={() => setPage(n)}
                    >
                      {n}
                    </button>
                  </li>
                );
              })}
              <li>
                <button
                  className="vp-page-btn"
                  onClick={() => setPage(safePage + 1)}
                  disabled={safePage === totalPages}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </li>
            </ul>
          </div>
        )}

        {/* Proof Modal */}
        {proofModalOpen && (
          <div className="modal-overlay" onClick={closeProofsModal}>
            <div className="modal-content-wrapper" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="modal-header-custom">
                <h5 className="modal-title">
                  ຫຼັກຖານການຊຳລະເງິນ ({proofIndex + 1} / {proofItems.length})
                </h5>
                <button className="modal-close" onClick={closeProofsModal}>
                  <i className="fas fa-times"></i>
                </button>
              </div>

              {/* Modal Body */}
              <div className="modal-body-custom">
                {/* Proof Viewer */}
                <div className="proof-viewer">
                  {proofItems[proofIndex] && (
                    <img
                      src={proofItems[proofIndex].url}
                      alt="Payment Proof"
                      className="proof-image"
                    />
                  )}

                  {proofItems.length > 1 && (
                    <>
                      <button className="proof-nav-btn prev" onClick={showPrev}>
                        <i className="fas fa-chevron-left"></i>
                      </button>
                      <button className="proof-nav-btn next" onClick={showNext}>
                        <i className="fas fa-chevron-right"></i>
                      </button>
                    </>
                  )}
                </div>

                {/* Order Details Section */}
                {selectedOrder && (
                  <div className="order-details-section">
                    <h6 style={{ marginBottom: '1rem', fontWeight: 700, color: '#2d3748' }}>
                      ລາຍລະອຽດອໍເດີ
                    </h6>
                    <div className="order-details-grid">
                      <div className="order-info-group">
                        <span className="order-info-label">Order ID</span>
                        <span className="order-info-value" style={{ fontFamily: 'monospace' }}>
                          #{selectedOrder._id?.substring(0, 16)}...
                        </span>
                      </div>

                      <div className="order-info-group">
                        <span className="order-info-label">ລູກຄ້າ</span>
                        <span className="order-info-value">
                          {selectedOrder.user?.name || selectedOrder.shippingInfo?.name || 'N/A'}
                        </span>
                      </div>

                      <div className="order-info-group">
                        <span className="order-info-label">ຈຳນວນເງິນ</span>
                        <span className="order-info-value" style={{ fontSize: '1.125rem', color: '#667eea' }}>
                          {formatLAK(selectedOrder.totalAmount || 0)}
                        </span>
                      </div>

                      <div className="order-info-group">
                        <span className="order-info-label">ວັນທີສັ່ງຊື້</span>
                        <span className="order-info-value">
                          {selectedOrder.createdAt 
                            ? new Date(selectedOrder.createdAt).toLocaleString('lo-LA')
                            : 'N/A'}
                        </span>
                      </div>

                      <div className="order-info-group">
                        <span className="order-info-label">ສະຖານະການຊຳລະ</span>
                        <span className="order-info-value">
                          {selectedOrder.paymentStatus || 'Unknown'}
                        </span>
                      </div>

                      <div className="order-info-group">
                        <span className="order-info-label">ສະຖານະອໍເດີ</span>
                        <span className="order-info-value">
                          {selectedOrder.orderStatus || 'Processing'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="modal-footer-custom">
                <div className="proof-filename">
                  {proofItems[proofIndex]?.filename || 'ບໍ່ມີຊື່ໄຟລ້'}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="action-btn success"
                    onClick={() => {
                      closeProofsModal();
                      handleVerify(selectedOrder._id, 'confirm');
                    }}
                  >
                    <i className="fas fa-check"></i>
                    <span>ຢືນຢັນ</span>
                  </button>
                  <button
                    className="action-btn danger"
                    onClick={() => {
                      closeProofsModal();
                      const note = window.prompt('ລະບຸເຫດຜົນທີ່ປະຕິເສດ:') || '';
                      handleVerify(selectedOrder._id, 'reject', note);
                    }}
                  >
                    <i className="fas fa-times"></i>
                    <span>ປະຕິເສດ</span>
                  </button>
                  <button className="action-btn secondary" onClick={closeProofsModal}>
                    <span>ປິດ</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}