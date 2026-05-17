import React, { useEffect, useMemo, useRef, useState } from 'react';
import MetaData from '../layout/MetaData';
import CheckoutStep from './CheckoutStep';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { clearCart } from '../redux/features/cartSlice';
import { clearShippingInfo } from '../redux/features/shippingSlice';
import { useCheckStockMutation } from '../redux/api/productsApi';
import { useValidateCouponMutation } from '../redux/api/couponApi';
import { calculateShippingFee } from '../../constans/shipping';
import './PaymentMethod.css';

export default function PaymentMethod() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [method, setMethod] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);

  const { cartItems = [] } = useSelector(state => state.cart || {});
  const { shippingInfo = {} } = useSelector(state => state.shipping || {});

  const isPickup = shippingInfo.shippingCarrierCode === 'PICKUP';
  const [checkStock] = useCheckStockMutation();
  const [validateCouponApi, { isLoading: validatingCoupon }] = useValidateCouponMutation();

  // ✅ Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null); // {code, type, value, discountAmount}

  // ✅ Idempotency key — UUID ที่คงที่ตลอด session ของ component นี้
  //    ถ้า double-click หรือ network retry → ส่ง key เดิม → backend คืน order เดิม
  //    ถ้า user navigate ออกแล้วกลับมา → mount ใหม่ → key ใหม่
  const idempotencyKeyRef = useRef(null);
  if (!idempotencyKeyRef.current) {
    idempotencyKeyRef.current =
      (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }

  // --- totals calculation (memoized) ---
  const totals = useMemo(() => {
    const TAX_RATE = 0.10;

    const itemsPrice = cartItems.reduce(
      (s, i) => s + Number(i.price || 0) * Number(i.quantity || 0),
      0
    );

    const itemsPriceExVat = itemsPrice / (1 + TAX_RATE);
    const taxAmount = Math.round(itemsPrice - itemsPriceExVat);

    const carrierCode = shippingInfo.shippingCarrierCode;
    const { fee: shippingAmount, isFree, carrier } = calculateShippingFee(
      carrierCode,
      itemsPrice
    );

    // ✅ Apply coupon discount
    const discountAmount = appliedCoupon?.discountAmount || 0;
    const totalAmount = Math.max(0, itemsPrice + shippingAmount - discountAmount);

    return {
      itemsPrice,
      shippingAmount,
      taxAmount,
      discountAmount,
      totalAmount,
      isFreeShipping: isFree,
      carrierName: carrier?.name,
    };
  }, [cartItems, shippingInfo.shippingCarrierCode, appliedCoupon]);

  // ✅ Apply coupon handler
  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return toast.error('ກະລຸນາໃສ່ລະຫັດ');
    try {
      const res = await validateCouponApi({
        code: couponInput.trim(),
        itemsPrice: totals.itemsPrice,
      }).unwrap();
      if (res.valid) {
        setAppliedCoupon({
          code: res.coupon.code,
          type: res.coupon.type,
          value: res.coupon.value,
          discountAmount: res.discountAmount,
        });
        toast.success(`ໃຊ້ລະຫັດ ${res.coupon.code} ສຳເລັດ! ປະຫຍັດ ${res.discountAmount.toLocaleString()} ກີບ`);
      }
    } catch (err) {
      toast.error(err?.data?.message || 'ລະຫັດສ່ວນຫຼຸດໃຊ້ບໍ່ໄດ້');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
  };

  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      navigate('/cart', { replace: true });
    }
    // deps [] = ກວດສະເພາະຕອນ mount, ບໍ່ trigger ຫຼັງ clearCart
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset method ທີ່ incompatible ຖ້າ carrier ປ່ຽນ
  useEffect(() => {
    if (isPickup && method === 'COD') setMethod('');
    if (!isPickup && method === 'PayAtStore') setMethod('');
  }, [isPickup]); // eslint-disable-line react-hooks/exhaustive-deps

  const formatKip = (v) => {
    try {
      return `₭ ${Number(v || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    } catch {
      return `₭ ${v}`;
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!method) return toast.error('ກະລຸນາເລືອກວິທີການຊໍາລະ');
    if (!shippingInfo || Object.keys(shippingInfo).length === 0) return toast.error('ຂໍ້ມູນການຂົນສົ່ງຂາດຫາຍ');
    if (!cartItems || cartItems.length === 0) return toast.error('ກະຕ່າຫວ່າງເປົ່າ');

    setIsSubmitting(true);

    // ✅ Defense in depth: ກວດ stock ຄັ້ງສຸດທ້າຍກ່ອນສ້າງ order
    //    (Cart ໄດ້ກວດແລ້ວແຕ່ stock ອາດປ່ຽນລະຫວ່າງທີ່ user ຢູ່ /shipping → /payment)
    try {
      const items = cartItems.map((i) => ({
        product: i.product,
        quantity: Number(i.quantity || 0),
      }));
      const stockRes = await checkStock(items).unwrap();
      if (!stockRes.ok) {
        const issues = (stockRes.items || []).filter((r) => !r.ok);
        const lines = issues.map((e) => {
          if (e.reason === 'insufficient_stock')
            return `• "${e.name}" ເຫຼືອ ${e.available} (ສັ່ງ ${e.requested})`;
          if (e.reason === 'out_of_stock') return `• "${e.name}" ໝົດແລ້ວ`;
          return `• "${e.name}" ບໍ່ມີໃນລະບົບ`;
        });
        toast.error(
          `ສິນຄ້າບໍ່ພຽງພໍ:\n${lines.join('\n')}\nກະລຸນາກັບໄປ /cart ເພື່ອປັບປະລິມານ`,
          { duration: 7000 }
        );
        setIsSubmitting(false);
        // ส่ง user กลับไปแก้ไข cart
        setTimeout(() => navigate('/cart'), 2000);
        return;
      }
    } catch (err) {
      console.warn('Pre-submit stock check failed', err);
      // ถ้า check ล้มเหลว → ปล่อยให้ผ่านไป backend จะ validate อีกที
    }

    const body = {
      shippingInfo,
      orderItems: cartItems.map(i => ({
        name: i.name,
        quantity: i.quantity,
        price: i.price,
        product: i.product,
        image: i.image,
      })),
      itemsPrice: totals.itemsPrice,
      shippingAmount: totals.shippingAmount,
      taxAmount: totals.taxAmount,
      totalAmount: totals.totalAmount,
      paymentMethod: method,
      // ✅ Send coupon code — backend will re-validate + compute final discount
      ...(appliedCoupon && { couponCode: appliedCoupon.code }),
    };

    try {
      const res = await fetch('/api/v1/payment/checkout_session', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          // ✅ ส่ง Idempotency-Key — ป้องกัน double-click + network retry
          'Idempotency-Key': idempotencyKeyRef.current,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // ✅ จัดการ error stock (409) แบบเจาะจง — แสดงรายการที่มีปัญหา
        if (res.status === 409 && Array.isArray(data.errors)) {
          const messages = data.errors.map((e) => {
            if (e.reason === 'insufficient_stock') {
              return `• "${e.name}" ເຫຼືອ ${e.available} (ສັ່ງ ${e.requested})`;
            }
            if (e.reason === 'product_not_found') {
              return `• "${e.name}" ບໍ່ມີໃນລະບົບແລ້ວ`;
            }
            return `• "${e.name}": ${e.reason}`;
          });
          toast.error(
            `ສິນຄ້າບໍ່ພຽງພໍ:\n${messages.join('\n')}`,
            { duration: 6000 }
          );
        } else if (res.status === 409) {
          // single-item race condition
          toast.error(data.message || 'ສິນຄ້າບໍ່ພຽງພໍ ກະລຸນາລອງໃໝ່');
        } else {
          toast.error(data.message || 'Create order failed');
        }
        setIsSubmitting(false);
        return;
      }

      const orderId = data.orderId || data.order?._id;
      const paymentInstructions = data.paymentInstructions || data.order?.paymentInstructions || null;

      // ✅ ล้าง cart + shippingInfo (แต่ละ slice รับผิดชอบของตัวเอง)
      dispatch(clearCart());          // cartSlice → cartItems
      dispatch(clearShippingInfo()); // shippingSlice → shippingInfo

      // ✅ ถ้า backend ตอบว่า idempotent — แสดง message ต่างไป (debug-friendly)
      if (data.idempotent) {
        toast.success('ນຳທ່ານໄປສູ່ອໍເດີທີ່ສ້າງໄວ້ແລ້ວ', { icon: '🔄' });
      } else {
        toast.success('ສ້າງຄໍາສັ່ງແລ້ວ');
      }

      if (method === 'COD' || method === 'PayAtStore') {
        navigate('/me/orders?order_success=true', { replace: true });
        return;
      }

      if (method === 'BankTransfer') {
        if (orderId) {
          navigate(`/orders/${orderId}/upload-proof`, { state: { paymentInstructions } });
          return;
        } else {
          navigate('/me/orders', { replace: true });
          return;
        }
      }

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }

      navigate('/me/orders', { replace: true });
    } catch (err) {
      console.error(err);
      toast.error('Network error creating order');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <MetaData title="Payment Method" />
      <CheckoutStep shipping={true} confirmOrder={true} payment={true} currentStep="payment" />

      <div className="payment-container">
        

        <div className="payment-content">
          {/* Page Header */}
          <div className="page-header">
            <h1>ເລືອກວິທີການຊໍາລະ</h1>
            <p className="subtitle">ເລືອກວິທີການຊໍາລະທີ່ທ່ານຕ້ອງການ</p>
          </div>

          <div className="payment-grid">
            {/* Main Payment Methods */}
            <div className="payment-main">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <h3 style={{ marginTop: 0, marginBottom: '24px', color: '#374151' }}>
                  ວິທີການຊໍາລະທີ່ມີ
                </h3>

                {/* ── Pay At Store — ສະແດງສະເພາະເມື່ອ PICKUP ── */}
                <AnimatePresence>
                  {isPickup && (
                    <motion.div
                      key="payatstore"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className={`method-card ${method === 'PayAtStore' ? 'selected' : ''}`}
                      onClick={() => setMethod('PayAtStore')}
                      style={{ borderColor: method === 'PayAtStore' ? '#059669' : undefined }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="method-header">
                        <div className="method-icon">🏪</div>
                        <div className="method-info">
                          <div className="method-title">ຈ່າຍທີ່ໜ້າຮ້ານ</div>
                          <div className="method-description">
                            ມາຮັບສິນຄ້າ ແລະ ຈ່າຍເງິນສົດທີ່ໜ້າຮ້ານໂດຍກົງ — ບໍ່ຕ້ອງໂອນລ່ວງໜ້າ
                          </div>
                        </div>
                        <div className="method-radio"></div>
                      </div>

                      <AnimatePresence>
                        {method === 'PayAtStore' && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="method-details"
                          >
                            <div className="payment-note" style={{ background: '#f0fdf4', borderColor: '#bbf7d0', color: '#166534' }}>
                              <strong>📍 ທີ່ຢູ່ຮ້ານ:</strong> ຮ້ານ IT HUBB — ນະຄອນຫຼວງວຽງຈັນ<br />
                              <strong>⏰ ເວລາທຳການ:</strong> ຈັນ–ສຸກ 8:00–18:00 | ເສົາ 9:00–17:00<br />
                              <strong>📞 ໂທ:</strong> 021-911-821<br />
                              <span style={{ marginTop: 6, display: 'block', fontSize: '0.82rem', color: '#15803d' }}>
                                ⚠️ ກະລຸນາມາຮັບສິນຄ້າພາຍໃນ 3 ວັນ ຫຼັງຈາກສ້າງຄໍາສັ່ງ
                              </span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* COD Method — ຊ່ອນເມື່ອ PICKUP */}
                {!isPickup && (
                  <motion.div
                    className={`method-card ${method === 'COD' ? 'selected' : ''}`}
                    onClick={() => setMethod('COD')}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="method-header">
                      <div className="method-icon">💰</div>
                      <div className="method-info">
                        <div className="method-title">Cash On Delivery (COD)</div>
                        <div className="method-description">
                          ຈ່າຍເງິນສົດເມື່ອຮັບສິນຄ້າ. ບໍ່ຕ້ອງໂອນເງິນລ່ວງໜ້າ.
                        </div>
                      </div>
                      <div className="method-radio"></div>
                    </div>

                    <AnimatePresence>
                      {method === 'COD' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="method-details"
                        >
                          <div className="payment-note">
                            <strong>ໝາຍເຫດ:</strong> ກະລຸນາເຕົມມະຕິເງິນໃຫ້ພ້ອມເມື່ອຜູ້ຂົນສົ່ງນຳສິນຄ້າມາໃຫ້. ຂອບໃຈທີ່ໃຊ້ບໍລິການ.
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

                {/* Bank Transfer Method */}
                <motion.div
                  className={`method-card ${method === 'BankTransfer' ? 'selected' : ''}`}
                  onClick={() => setMethod('BankTransfer')}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="method-header">
                    <div className="method-icon">🏦</div>
                    <div className="method-info">
                      <div className="method-title">Bank Transfer / QR</div>
                      <div className="method-description">
                        ໂອນເງິນຜ່ານທະນາຄານ ແລະອັບໂຫຼດສະຫຼິບການໂອນ
                      </div>
                    </div>
                    <div className="method-radio"></div>
                  </div>

                  <AnimatePresence>
                    {method === 'BankTransfer' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="method-details"
                      >

                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>

              {/* Action Buttons */}
              <div className="button-group">
                <motion.button
                  type="submit"
                  className="btn-primary"
                  onClick={submitHandler}
                  disabled={isSubmitting || !method || cartItems.length === 0 || !shippingInfo || Object.keys(shippingInfo || {}).length === 0}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="loading-spinner"></div>
                      ກຳລັງສ້າງຄໍາສັ່ງ...
                    </>
                  ) : (
                    <>
                      <span>ດໍາເນີນການຊໍາລະ</span>
                      <span>💳</span>
                    </>
                  )}
                </motion.button>

                <motion.button
                  type="button"
                  className="btn-secondary"
                  onClick={() => navigate(-1)}
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  ກັບຄືນ
                </motion.button>
              </div>

              <div className="security-badge">
                <span>🔒</span>
                <span>ການຊໍາລະປອດໄພ 100% | ຂໍ້ມູນຂອງທ່ານຈະຖືກເຂົ້າລະຫັດ</span>
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="payment-sidebar">
              <motion.div
                className="order-summary"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <div className="summary-header">
                  <h3>ສະຫຼຸບການສັ່ງຊື້</h3>
                </div>

                <div className="summary-content">
                  <div className="summary-row">
                    <span className="summary-label">ລາຄາສິນຄ້າ</span>
                    <span className="summary-value">{formatKip(totals.itemsPrice)}</span>
                  </div>

                  <div className="summary-row">
                    <span className="summary-label">ຄ່າຂົນສົ່ງ</span>
                    <span className="summary-value">
                      {totals.shippingAmount === 0 ? (
                        <span className="free-shipping">ຟຣີ</span>
                      ) : (
                        formatKip(totals.shippingAmount)
                      )}
                    </span>
                  </div>

                  {/* ✅ Discount row — สีเขียวเด่น */}
                  {appliedCoupon && totals.discountAmount > 0 && (
                    <div className="summary-row" style={{ color: '#10b981' }}>
                      <span className="summary-label">
                        🎁 ສ່ວນຫຼຸດ ({appliedCoupon.code})
                      </span>
                      <span className="summary-value" style={{ fontWeight: 700 }}>
                        -{formatKip(totals.discountAmount)}
                      </span>
                    </div>
                  )}

                  {/* ✅ Coupon Input Section */}
                  <div
                    style={{
                      marginTop: 12,
                      padding: 12,
                      background: appliedCoupon ? '#f0fdf4' : '#f8fafc',
                      borderRadius: 10,
                      border: `1px solid ${appliedCoupon ? '#bbf7d0' : '#e2e8f0'}`,
                    }}
                  >
                    {appliedCoupon ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, color: '#065f46', display: 'flex', alignItems: 'center', gap: 6 }}>
                            🎟️ {appliedCoupon.code}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#16a34a' }}>
                            {appliedCoupon.type === 'percentage'
                              ? `ສ່ວນຫຼຸດ ${appliedCoupon.value}%`
                              : `ສ່ວນຫຼຸດ ${appliedCoupon.value.toLocaleString()} ກີບ`}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          style={{
                            padding: '4px 10px',
                            background: 'white',
                            border: '1px solid #ef4444',
                            color: '#ef4444',
                            borderRadius: 6,
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          ລຶບ
                        </button>
                      </div>
                    ) : (
                      <>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: '#475569',
                            marginBottom: 6,
                          }}
                        >
                          🎟️ ມີລະຫັດສ່ວນຫຼຸດ?
                        </label>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <input
                            type="text"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                            placeholder="ໃສ່ລະຫັດ (ເຊັ່ນ WELCOME10)"
                            style={{
                              flex: 1,
                              padding: '8px 12px',
                              border: '1.5px solid #cbd5e1',
                              borderRadius: 8,
                              fontSize: '0.9rem',
                              fontFamily: 'monospace',
                              outline: 'none',
                              textTransform: 'uppercase',
                            }}
                            disabled={validatingCoupon}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleApplyCoupon();
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={handleApplyCoupon}
                            disabled={!couponInput.trim() || validatingCoupon}
                            style={{
                              padding: '8px 16px',
                              background: 'linear-gradient(135deg, #667eea, #764ba2)',
                              color: 'white',
                              border: 'none',
                              borderRadius: 8,
                              fontWeight: 600,
                              fontSize: '0.85rem',
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              opacity: !couponInput.trim() || validatingCoupon ? 0.6 : 1,
                            }}
                          >
                            {validatingCoupon ? '...' : 'ໃຊ້'}
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  <hr style={{ margin: '16px 0', border: 'none', height: '1px', background: '#e5e7eb' }} />

                  <div className="summary-row summary-total">
                    <span>ລວມທັງໝົດ</span>
                    <span>{formatKip(totals.totalAmount)}</span>
                  </div>

                  {/* ✅ ลาคาลวมภาษีแล้ว — แสดงเป็นข้อมูลเชิงข้อมูลเล็กๆ */}
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: '0.78rem',
                      color: '#94a3b8',
                      textAlign: 'right',
                    }}
                  >
                    ★ ລາຄາລວມພາສີ 10% ແລ້ວ (VAT {formatKip(totals.taxAmount)})
                  </div>

                  {/* Shipping Info */}
                  <div className="shipping-info">
                    <div className="shipping-title">ຂໍ້ມູນການຂົນສົ່ງ</div>
                    <div className="shipping-detail">
                      <strong>ຜູ້ຮັບ:</strong> {shippingInfo.fullName || shippingInfo.name || '-'}
                    </div>
                    <div className="shipping-detail">
                      <strong>ທີ່ຢູ່:</strong> {shippingInfo.address || '-'}
                    </div>
                    <div className="shipping-detail">
                      <strong>ເບີໂທ:</strong> {shippingInfo.phoneNo || '-'}
                    </div>
                    <div className="shipping-detail">
                      <strong>ຜູ້ຂົນສົ່ງ:</strong> {shippingInfo.shippingCarrier || '-'}
                    </div>
                    <div className="shipping-detail">
                      <strong>ສາຂາ:</strong> {shippingInfo.branch || '-'}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Support Info */}
              <motion.div
                className="support-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <h4>ຕ້ອງການຄວາມຊ່ວຍເຫຼືອ?</h4>
                <p>ຕິດຕໍ່ພວກເຮົາ:</p>
                <div className="contact-info">
                  <span>📞 021-911-821</span>
                  <span>📧 support@ithubb.com</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

     
    </>
  );
}