import React, { useEffect, useMemo, useState } from 'react';
import MetaData from '../layout/MetaData';
import CheckoutStep from './CheckoutStep';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import './PaymentMethod.css';

export default function PaymentMethod() {
  const navigate = useNavigate();
  const [method, setMethod] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);

  const { cartItems = [] } = useSelector(state => state.cart || {});
  const { shippingInfo = {} } = useSelector(state => state.shipping || {});

  // --- totals calculation (memoized) ---
const totals = useMemo(() => {
  const itemsPriceGross = cartItems.reduce(
    (s, i) => s + Number(i.price || 0) * Number(i.quantity || 0),
    0
  );

  const itemsPriceNet = Math.round(itemsPriceGross / 1.1); // ราคาหักภาษีแล้ว
  const taxAmount = itemsPriceGross - itemsPriceNet;       // ภาษีที่แยกออกมา
  const shippingAmount = itemsPriceGross > 1000000 ? 0 : 20000;
  const totalAmount = itemsPriceGross + shippingAmount;

  return {
    itemsPrice: itemsPriceGross, // แสดงราคาเดิม
    shippingAmount,
    taxAmount,                   // เก็บไว้ส่ง backend หากต้องการ
    totalAmount,
  };
}, [cartItems]);

  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      // optional: redirect user if cart is empty
      // navigate('/');
    }
  }, [cartItems]);

  const token = localStorage.getItem('token');

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

    setIsSubmitting(true);

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
    };

    try {
      const res = await fetch('/api/v1/payment/checkout_session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data.message || 'Create order failed');
        setIsSubmitting(false);
        return;
      }

      const orderId = data.orderId || data.order?._id;
      const paymentInstructions = data.paymentInstructions || data.order?.paymentInstructions || null;

      toast.success('ສ້າງຄໍາສັ່ງແລ້ວ');

      if (method === 'COD') {
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

                {/* COD Method */}
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

                  <div className="summary-row">
                    <span className="summary-label">ພາສີ (10%)</span>
                    <span className="summary-value">{formatKip(totals.taxAmount)}</span>
                  </div>

                  <hr style={{ margin: '16px 0', border: 'none', height: '1px', background: '#e5e7eb' }} />

                  <div className="summary-row summary-total">
                    <span>ລວມທັງໝົດ</span>
                    <span>{formatKip(totals.totalAmount)}</span>
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