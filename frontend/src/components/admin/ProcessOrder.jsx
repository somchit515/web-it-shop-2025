import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Loader from '../layout/Loader';
import toast from 'react-hot-toast';
import MetaData from '../layout/MetaData';
import AdminLayout from '../layout/AdminLayout';
import {
  useGetOrderDetailsQuery,
  useUpdateOrderMutation,
  useIssueRefundMutation,
  useAddOrderNoteMutation,
} from '../redux/api/OrderApi';
import { confirmDialog } from './_shared/confirmDialog';

function ProcessOrder() {
  const { id } = useParams();

  const { data, isLoading, isError, error, refetch } = useGetOrderDetailsQuery(id);
  const order = data?.order || {};

  const [updateOrder, { isLoading: isUpdating, isSuccess: isUpdateSuccess, error: updateError }] =
    useUpdateOrderMutation();
  const [issueRefund, { isLoading: isRefunding }] = useIssueRefundMutation();
  const [addOrderNote, { isLoading: isAddingNote }] = useAddOrderNoteMutation();

  const [status, setStatus] = useState('');

  // Refund form state
  const [refundAmount, setRefundAmount]   = useState('');
  const [refundBank, setRefundBank]       = useState('');
  const [refundAccount, setRefundAccount] = useState('');
  const [refundNote, setRefundNote]       = useState('');

  // Note form state
  const [noteText, setNoteText] = useState('');

  const {
    shippingInfo = {},
    orderItems   = [],
    paymentInfo  = {},
    user         = {},
    totalAmount  = 0,
    orderStatus  = 'Processing',
    paymentStatus,
  } = order;

  const isAlreadyRefunded = paymentStatus === 'Refunded';
  const canRefund         = paymentStatus === 'Paid';
  const isDelivered       = String(orderStatus || '').toLowerCase().includes('delivered');

  useEffect(() => {
    if (orderStatus) setStatus(orderStatus);
    if (order.totalAmount) setRefundAmount(String(order.totalAmount));
  }, [orderStatus, order.totalAmount]);

  useEffect(() => {
    if (isError)        toast.error(error?.data?.message        || 'ເກີດຂໍ້ຜິດພາດໃນການເອີ້ນລາຍການ');
    if (updateError)    toast.error(updateError?.data?.message  || 'ອັບເດດບໍ່ສຳເລັດ');
    if (isUpdateSuccess) toast.success('ອັບເດດສະຖານະສຳເລັດ');
  }, [isError, error, isUpdateSuccess, updateError]);

  const updateOrderHandler = () => {
    updateOrder({ id, data: { status } });
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return toast.error('ກະລຸນາໃສ່ຂໍ້ຄວາມ');
    try {
      await addOrderNote({ id, note: noteText.trim() }).unwrap();
      toast.success('ເພີ່ມບັນທຶກສຳເລັດ');
      setNoteText('');
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'ເພີ່ມບັນທຶກລົ້ມເຫຼວ');
    }
  };

  const handleRefund = async () => {
    const amt = Number(refundAmount);
    if (!amt || amt <= 0) return toast.error('ກະລຸນາໃສ່ຍອດຄືນເງິນທີ່ຖືກຕ້ອງ');

    const ok = await confirmDialog.show({
      title: 'ຢືນຢັນການຄືນເງິນ?',
      message: `ຄືນເງິນ ₭${amt.toLocaleString()} ໃຫ້ລູກຄ້າ "${user?.name || ''}"?\nອໍເດີຈະຖືກຍົກເລີກ ແລະ ສິນຄ້າຄືນສາງ.`,
      confirmText: 'ຄືນເງິນເລີຍ',
      variant: 'danger',
    });
    if (!ok) return;

    try {
      await issueRefund({
        id,
        data: {
          refundAmount: amt,
          refundBank,
          refundAccount,
          note: refundNote,
          cancelOrder: true,
        },
      }).unwrap();
      toast.success('ຄືນເງິນສຳເລັດ — ອີເມວໄດ້ສົ່ງຫາລູກຄ້າແລ້ວ');
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'ຄືນເງິນລົ້ມເຫຼວ');
    }
  };

  if (isLoading) return <Loader />;

  const safeDate      = order?.createdAt ? new Date(order.createdAt) : null;
  const createdAtText = safeDate ? safeDate.toLocaleDateString('lo-LA') : 'N/A';

  const paymentBadge = () => {
    const map = {
      Paid:          { cls: 'bg-success',   label: 'ຊຳລະແລ້ວ (Paid)' },
      Refunded:      { cls: 'bg-secondary', label: 'ຄືນເງິນແລ້ວ (Refunded)' },
      AwaitingProof: { cls: 'bg-warning text-dark', label: 'ລໍຖ້າຢືນຢັນ (AwaitingProof)' },
      Rejected:      { cls: 'bg-danger',   label: 'ປະຕິເສດ (Rejected)' },
      Pending:       { cls: 'bg-secondary', label: 'ລໍຖ້າ (Pending)' },
    };
    const { cls = 'bg-secondary', label = paymentStatus || 'N/A' } = map[paymentStatus] || {};
    return <span className={`badge ${cls}`}>{label}</span>;
  };

  return (
    <AdminLayout>
      <MetaData title="Process Order" />
      <style>{`
        .refund-panel {
          background: #fff;
          border: 2px solid #8b5cf6;
          border-radius: 14px;
          padding: 1.5rem;
          margin-top: 1.5rem;
        }
        .refund-panel h5 { color: #7c3aed; font-weight: 700; margin-bottom: 1rem; }
        .refund-done {
          background: #f5f3ff;
          border: 1.5px solid #c4b5fd;
          border-radius: 12px;
          padding: 1rem 1.25rem;
          margin-top: 1.5rem;
          color: #5b21b6;
        }
        .refund-done strong { color: #4c1d95; }
        .field-label { font-size: 0.82rem; font-weight: 600; color: #475569; margin-bottom: 4px; }
        .btn-refund {
          width: 100%;
          background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
          color: white;
          border: none;
          border-radius: 10px;
          padding: 11px;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.25s;
          margin-top: 8px;
        }
        .btn-refund:hover:not(:disabled) {
          box-shadow: 0 6px 18px rgba(124,58,237,0.4);
          transform: translateY(-1px);
        }
        .btn-refund:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

        /* Timeline */
        .order-timeline { position: relative; padding-left: 32px; padding-top: 8px; }
        .order-timeline::before {
          content: ''; position: absolute;
          left: 13px; top: 16px; bottom: 8px;
          width: 2px; background: linear-gradient(180deg, #e2e8f0, #f1f5f9);
        }
        .tl-event { position: relative; margin-bottom: 18px; }
        .tl-event:last-child { margin-bottom: 0; }
        .tl-dot {
          position: absolute; left: -32px; top: 2px;
          width: 28px; height: 28px; border-radius: 50%;
          display: grid; place-items: center;
          font-size: 13px; border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.12);
        }
        .tl-body {
          background: #f8fafc; border-left: 3px solid;
          padding: 8px 12px; border-radius: 0 8px 8px 0; margin-left: 4px;
        }
        .tl-label { font-weight: 700; color: #1e293b; font-size: 0.9rem; }
        .tl-note  { color: #64748b; font-size: 0.82rem; margin-top: 2px; }
        .tl-time  { color: #94a3b8; font-size: 0.76rem; margin-top: 3px; }
        .note-form { margin-top: 1.25rem; }
        .note-form textarea {
          width: 100%; padding: 10px 12px;
          border: 2px solid #e2e8f0; border-radius: 10px;
          font-size: 0.9rem; font-family: inherit; resize: vertical; outline: none;
          transition: border-color 0.2s;
        }
        .note-form textarea:focus { border-color: #667eea; }
        .btn-add-note {
          margin-top: 8px; padding: 8px 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white; border: none; border-radius: 8px;
          font-weight: 600; font-size: 0.88rem; cursor: pointer; transition: all 0.2s;
        }
        .btn-add-note:hover:not(:disabled) {
          box-shadow: 0 4px 14px rgba(102,126,234,0.4); transform: translateY(-1px);
        }
        .btn-add-note:disabled { opacity: 0.55; cursor: not-allowed; }
      `}</style>

      <div className="row d-flex justify-content-around">
        {/* ── Left column: order info ── */}
        <div className="col-12 col-lg-8 order-details">
          <h3 className="mt-5 mb-4">ລາຍລະອຽດອໍເດີ</h3>

          <table className="table table-striped table-bordered">
            <tbody>
              <tr><th>ID</th><td style={{ fontFamily: 'monospace' }}>{order?._id || 'N/A'}</td></tr>
              <tr>
                <th>ສະຖານະອໍເດີ</th>
                <td>
                  <span className={`badge ${isDelivered ? 'bg-success' : 'bg-primary'}`}>
                    {orderStatus}
                  </span>
                </td>
              </tr>
              <tr><th>ສະຖານະຊຳລະ</th><td>{paymentBadge()}</td></tr>
              <tr><th>ວັນທີສັ່ງຊື້</th><td>{createdAtText}</td></tr>
            </tbody>
          </table>

          <h3 className="mt-5 mb-4">ຂໍ້ມູນການຂົນສົ່ງ</h3>
          <table className="table table-striped table-bordered">
            <tbody>
              <tr><th>ຊື່ຜູ້ຮັບ</th><td>{shippingInfo?.fullName || user?.name || 'N/A'}</td></tr>
              <tr><th>ເບີໂທ</th><td>{shippingInfo?.phoneNo || 'N/A'}</td></tr>
              <tr><th>ທີ່ຢູ່</th><td>{shippingInfo?.address || 'N/A'}</td></tr>
            </tbody>
          </table>

          <h3 className="mt-5 mb-4">ຂໍ້ມູນການຊຳລະ</h3>
          <table className="table table-striped table-bordered">
            <tbody>
              <tr><th>ສະຖານະ</th><td>{paymentBadge()}</td></tr>
              <tr><th>ວິທີຊຳລະ</th><td>{order.paymentMethod || paymentInfo?.method || 'N/A'}</td></tr>
              <tr>
                <th>ຍອດລວມ</th>
                <td style={{ fontWeight: 700 }}>
                  ₭{typeof totalAmount === 'number' ? totalAmount.toLocaleString() : totalAmount}
                </td>
              </tr>
              {isAlreadyRefunded && order.refundAmount != null && (
                <tr>
                  <th>ຍອດຄືນເງິນ</th>
                  <td style={{ color: '#7c3aed', fontWeight: 700 }}>
                    ₭{Number(order.refundAmount).toLocaleString()}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <h3 className="mt-5 mb-4">ລາຍການສັ່ງຊື້</h3>
          <hr />
          {orderItems.length > 0 ? orderItems.map((item, i) => (
            <div key={i} className="cart-item my-1">
              <div className="row my-5">
                <div className="col-4 col-lg-2">
                  <img src={item?.image} alt={item?.name} height="45" width="65" />
                </div>
                <div className="col-5 col-lg-5">
                  <Link to={`/product/${item?.product}`}>{item?.name}</Link>
                </div>
                <div className="col-4 col-lg-2 mt-4 mt-lg-0">
                  <p>₭{Number(item?.price || 0).toLocaleString()}</p>
                </div>
                <div className="col-4 col-lg-3 mt-4 mt-lg-0">
                  <p>{item?.quantity ?? 0} ອັນ</p>
                </div>
              </div>
              <hr />
            </div>
          )) : <p>ບໍ່ມີລາຍການ</p>}
          {/* ── Timeline & Notes ── */}
          <h3 className="mt-5 mb-3" style={{ color: '#1e293b' }}>
            🕓 ປະຫວັດ & ບັນທຶກ
          </h3>

          {Array.isArray(order.events) && order.events.length > 0 ? (
            <AdminTimeline events={order.events} />
          ) : (
            <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>ຍັງບໍ່ມີເຫດການ</p>
          )}

          <div className="note-form">
            <textarea
              rows={3}
              placeholder="ເພີ່ມບັນທຶກ admin... (ສະແດງຢູ່ໃນ timeline)"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              disabled={isAddingNote}
            />
            <button
              className="btn-add-note"
              onClick={handleAddNote}
              disabled={isAddingNote || !noteText.trim()}
            >
              {isAddingNote
                ? <><i className="fa fa-spinner fa-spin me-1" />ກຳລັງບັນທຶກ...</>
                : <><i className="fas fa-plus me-1" />ເພີ່ມບັນທຶກ</>}
            </button>
          </div>
        </div>

        {/* ── Right column: actions ── */}
        <div className="col-12 col-lg-3 mt-5">
          {/* Status update */}
          <h4 className="my-4">ອັບເດດສະຖານະ</h4>
          <div className="mb-3">
            <select
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={isDelivered || isAlreadyRefunded}
            >
              <option value="Processing">ກຳລັງກຽມ (Processing)</option>
              <option value="Shipped">ກຳລັງຂົນສົ່ງ (Shipped)</option>
              <option value="Delivered">ຈັດສົ່ງສຳເລັດ (Delivered)</option>
            </select>
          </div>
          {!isDelivered && !isAlreadyRefunded ? (
            <button className="btn btn-primary w-100" onClick={updateOrderHandler} disabled={isUpdating}>
              {isUpdating ? <><i className="fa fa-spinner fa-spin me-1" />ກຳລັງອັບເດດ...</> : 'ອັບເດດສະຖານະ'}
            </button>
          ) : (
            <button className="btn btn-success w-100" disabled>
              {isAlreadyRefunded ? '💸 ຄືນເງິນແລ້ວ' : '✅ ຈັດສົ່ງສຳເລັດ'}
            </button>
          )}

          <h4 className="mt-4 mb-3">ໃບສັ່ງຊື້</h4>
          <a href={`/invoice/orders/${order?._id}`} className="btn btn-success w-100" target="_blank" rel="noreferrer">
            <i className="fa fa-print me-1" /> ສ້າງໃບສັ່ງຊື້
          </a>

          {/* ── Refund panel ── */}
          {isAlreadyRefunded ? (
            <div className="refund-done">
              <div style={{ fontSize: '1.3rem', marginBottom: 6 }}>💸</div>
              <strong>ຄືນເງິນດຳເນີນການແລ້ວ</strong>
              <p style={{ margin: '6px 0 0', fontSize: '0.88rem' }}>
                ຍອດ: <strong>₭{Number(order.refundAmount || 0).toLocaleString()}</strong>
              </p>
              {order.refundBank    && <p style={{ margin: '2px 0', fontSize: '0.85rem' }}>ທະນາຄານ: {order.refundBank}</p>}
              {order.refundAccount && <p style={{ margin: '2px 0', fontSize: '0.85rem' }}>ບັນຊີ: {order.refundAccount}</p>}
              {order.refundIssuedAt && (
                <p style={{ margin: '2px 0', fontSize: '0.8rem', color: '#7c3aed' }}>
                  ວັນທີ: {new Date(order.refundIssuedAt).toLocaleDateString('lo-LA')}
                </p>
              )}
            </div>
          ) : canRefund ? (
            <div className="refund-panel">
              <h5>💸 ອອກໃບຄືນເງິນ</h5>

              <div className="mb-2">
                <div className="field-label">ຍອດຄືນເງິນ (₭) *</div>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  min={1}
                  max={totalAmount}
                />
              </div>

              <div className="mb-2">
                <div className="field-label">ທະນາຄານ (ຖ້າໂອນຄືນ)</div>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="ເຊັ່ນ: BCEL, LDB..."
                  value={refundBank}
                  onChange={(e) => setRefundBank(e.target.value)}
                />
              </div>

              <div className="mb-2">
                <div className="field-label">ເລກບັນຊີ</div>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="ເລກບັນຊີທີ່ຈະໂອນຄືນ"
                  value={refundAccount}
                  onChange={(e) => setRefundAccount(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <div className="field-label">ໝາຍເຫດ</div>
                <textarea
                  className="form-control form-control-sm"
                  rows={2}
                  placeholder="ເຫດຜົນ / ໝາຍເຫດ..."
                  value={refundNote}
                  onChange={(e) => setRefundNote(e.target.value)}
                />
              </div>

              <button className="btn-refund" onClick={handleRefund} disabled={isRefunding}>
                {isRefunding
                  ? <><i className="fa fa-spinner fa-spin me-1" />ກຳລັງດຳເນີນ...</>
                  : '💸 ຢືນຢັນຄືນເງິນ'}
              </button>

              <p style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: 8, textAlign: 'center' }}>
                ອໍເດີຈະຖືກຍົກເລີກ ແລະ ສິນຄ້າຄືນສາງ
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </AdminLayout>
  );
}

export default ProcessOrder;

// ─── Admin Timeline sub-component ────────────────────────────────────────────
const EVENT_CONFIG = {
  created:           { icon: '🛒', color: '#667eea', label: 'ສ້າງອໍເດີ' },
  proof_uploaded:    { icon: '📤', color: '#0ea5e9', label: 'ອັບໂຫຼດສະຫຼິບ' },
  payment_confirmed: { icon: '💰', color: '#10b981', label: 'ຢືນຢັນການຊຳລະ' },
  payment_rejected:  { icon: '❌', color: '#ef4444', label: 'ປະຕິເສດການຊຳລະ' },
  processing:        { icon: '📦', color: '#3b82f6', label: 'ກຳລັງກຽມ' },
  shipped:           { icon: '🚚', color: '#f59e0b', label: 'ຈັດສົ່ງແລ້ວ' },
  delivered:         { icon: '✅', color: '#10b981', label: 'ສົ່ງສຳເລັດ' },
  cancelled:         { icon: '🚫', color: '#ef4444', label: 'ຍົກເລີກ' },
  returned:          { icon: '↩️', color: '#a855f7', label: 'ສົ່ງຄືນ' },
  refunded:          { icon: '💸', color: '#06b6d4', label: 'ຄືນເງິນ' },
  note:              { icon: '📝', color: '#64748b', label: 'ບັນທຶກ admin' },
};

function fmtTime(date) {
  if (!date) return '';
  try {
    return new Date(date).toLocaleString('lo-LA', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return String(date); }
}

function AdminTimeline({ events = [] }) {
  const sorted = [...events].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  return (
    <div className="order-timeline">
      {sorted.map((ev, idx) => {
        const cfg = EVENT_CONFIG[ev.type] || EVENT_CONFIG.note;
        return (
          <div className="tl-event" key={ev._id || idx}>
            <div className="tl-dot" style={{ background: cfg.color }}>
              {cfg.icon}
            </div>
            <div className="tl-body" style={{ borderLeftColor: cfg.color }}>
              <div className="tl-label">{cfg.label}</div>
              {ev.note && <div className="tl-note">{ev.note}</div>}
              <div className="tl-time">
                <i className="far fa-clock me-1" />
                {fmtTime(ev.timestamp)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
