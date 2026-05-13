import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import MetaData from '../layout/MetaData';
import { Link, useNavigate } from 'react-router-dom';
import CheckoutStep from './CheckoutStep';
import { motion } from 'framer-motion';
import { calculateShippingFee } from '../../constans/shipping';
import '../cart/ConfirmOrder.css';

function ConfirmOrder() {
  const navigate = useNavigate();

  // Safely select state slices with sensible defaults
  const { user } = useSelector((state) => state.auth || {});
  const { shippingInfo = {} } = useSelector((state) => state.shipping || {});
  const { cartItems = [] } = useSelector((state) => state.cart || {});

  // ------------------- CALCULATIONS -------------------
  // ✅ Inclusive Tax + Carrier-based shipping (shared with PaymentMethod)
  const TAX_RATE = 0.10;

  const itemsPrice = cartItems.reduce(
    (acc, item) => acc + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  // ค่าขนส่งคำนวณจาก carrier ที่เลือก
  const { fee: shippingPrice, isFree: isFreeShipping } = calculateShippingFee(
    shippingInfo.shippingCarrierCode,
    itemsPrice
  );
  const taxPrice = Math.round(itemsPrice - itemsPrice / (1 + TAX_RATE));
  const totalPrice = itemsPrice + shippingPrice;

  // NEW: Shipping carrier info
  const shippingCarrier = shippingInfo.shippingCarrier || 'ບໍ່ໄດ້ເລືອກ';
  const branch = shippingInfo.branch || 'ບໍ່ໄດ້ເລືອກ';

  // Format as: ₭ 7,000,000.00
  const formatKip = (amount) => {
    const num = Number(amount || 0);
    return `₭ ${num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const proceedToPaymentHandler = () => {
    // navigate to your payment method page
    navigate('/payment_method');
  };

  // NEW: Edit handlers
  const handleEditShipping = () => {
    navigate('/shipping');
  };

  const handleEditCart = () => {
    navigate('/cart');
  };

  return (
    <>
      <MetaData title={'ຢືນຢັນການສັ່ງຊື້'} />

      {/* Show shipping + confirm steps as active (adjust as needed) */}
      <CheckoutStep shipping={true} confirmOrder={true} />

      <div className="confirm-order-container">
        <div className="confirm-order-content">
          {/* Page Header */}
          <div className="page-header">
            <h1>ຢືນຢັນການສັ່ງຊື້</h1>
            <p className="subtitle">ກະລຸນາກວດສອບຂໍ້ມູນການສັ່ງຊື້ຂອງທ່ານອີກຄັ້ງ</p>
          </div>

          <div className="order-content-grid">
            {/* Left Column - Shipping & Items */}
            <div className="order-main-column">
              {/* Shipping Info Section */}
              <motion.div 
                className="info-card shipping-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="card-header">
                  <div className="header-icon">📍</div>
                  <div className="header-content">
                    <h3>ຂໍ້ມູນຂົນສົ່ງ</h3>
                    <p>ຂໍ້ມູນຜູ້ຮັບແລະທີ່ຢູ່ຈັດສົ່ງ</p>
                  </div>
                  <button className="edit-btn" onClick={handleEditShipping}>
                    ແກ້ໄຂ
                  </button>
                </div>

                <div className="shipping-details">
                  <div className="detail-row">
                    <span className="detail-label">ຊື່ຜູ້ຮັບ:</span>
                    <span className="detail-value">{user?.name || "Guest"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">ເບີໂທ:</span>
                    <span className="detail-value">{shippingInfo.phoneNo || '-'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">ທີ່ຢູ່:</span>
                    <span className="detail-value">
                      {shippingInfo.address || '-'}
                      {shippingInfo.city ? `, ${shippingInfo.city}` : ''}
                      {shippingInfo.province ? `, ${shippingInfo.province}` : ''}
                      {shippingInfo.zipCode ? ` ${shippingInfo.zipCode}` : ''}
                      {shippingInfo.country ? `, ${shippingInfo.country}` : ''}
                    </span>
                  </div>
                  
                  {/* NEW: Shipping Carrier Info */}
                  <div className="shipping-carrier-info">
                    <div className="detail-row">
                      <span className="detail-label">ຜູ້ຂົນສົ່ງ:</span>
                      <span className="detail-value">{shippingCarrier}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">ສາຂາ:</span>
                      <span className="detail-value">{branch}</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Cart Items Section */}
              <motion.div 
                className="info-card items-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <div className="card-header">
                  <div className="header-icon">🛒</div>
                  <div className="header-content">
                    <h3>ລາຍການສິນຄ້າ</h3>
                    <p>{cartItems.length} ລາຍການໃນກະຕ່າ</p>
                  </div>
                  <button className="edit-btn" onClick={handleEditCart}>
                    ແກ້ໄຂ
                  </button>
                </div>

                <div className="cart-items-list">
                  {cartItems.map((item) => (
                    <motion.div 
                      key={item.product} 
                      className="cart-item"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="item-image">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="product-img"
                        />
                      </div>

                      <div className="item-details">
                        <Link to={`/product/${item.product}`} className="item-name">
                          {item.name}
                        </Link>
                        <div className="item-meta">
                          <span className="item-price">{formatKip(item.price)} ຕໍ່ຊິ້ນ</span>
                          <span className="item-quantity">ຈຳນວນ: {item.quantity}</span>
                        </div>
                      </div>

                      <div className="item-total">
                        <span className="total-label">ລວມ</span>
                        <span className="total-price">
                          {formatKip(Number(item.quantity || 0) * Number(item.price || 0))}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="order-summary-column">
              <motion.div 
                className="order-summary-card"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <div className="summary-header">
                  <h3>ສະຫຼຸບການສັ່ງຊື້</h3>
                </div>

                <div className="summary-content">
                  <div className="price-breakdown">
                    <div className="price-row">
                      <span className="price-label">ລາຄາສິນຄ້າ</span>
                      <span className="price-value">{formatKip(itemsPrice)}</span>
                    </div>
                    
                    <div className="price-row">
                      <span className="price-label">ຄ່າຂົນສົ່ງ</span>
                      <span className="price-value">
                        {shippingPrice === 0 ? (
                          <span className="free-shipping">ຟຣີ</span>
                        ) : (
                          formatKip(shippingPrice)
                        )}
                      </span>
                    </div>

                    {isFreeShipping && shippingPrice === 0 && (
                      <div className="price-row discount-row">
                        <span className="price-label">ສ່ວນລົດຄ່າຂົນສົ່ງ</span>
                        <span className="price-value">ຟຣີ ✨</span>
                      </div>
                    )}
                  </div>

                  <div className="summary-divider"></div>

                  <div className="total-row">
                    <span className="total-label">ລວມທັງໝົດ</span>
                    <span className="total-value">{formatKip(totalPrice)}</span>
                  </div>

                  {/* ✅ ภาษีรวมในราคาแล้ว — แสดงเป็น informational */}
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: '0.78rem',
                      color: '#94a3b8',
                      textAlign: 'right',
                    }}
                  >
                    ★ ລາຄາລວມພາສີ 10% ແລ້ວ (VAT {formatKip(taxPrice)})
                  </div>

                  <div className="savings-info">
                    {isFreeShipping && (
                      <div className="savings-badge">
                        <span>🎉 ທ່ານໄດ້ຮັບສ່ວນຫຼຸດຄ່າຂົນສົ່ງ</span>
                      </div>
                    )}
                  </div>

                  <button 
                    id="checkout_btn" 
                    className="checkout-button" 
                    onClick={proceedToPaymentHandler}
                  >
                    <span className="button-text">ດຳເນີນການຊຳລະ</span>
                    <span className="button-icon">💳</span>
                  </button>

                  <div className="security-info">
                    <div className="security-badge">
                      <span className="lock-icon">🔒</span>
                      <span>ການຊຳລະປອດໄພ 100%</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Support Info */}
              <div className="support-card">
                <h4>ຕ້ອງການຄວາມຊ່ວຍເຫຼືອ?</h4>
                <p>ຕິດຕໍ່ພວກເຮົາ:</p>
                <div className="contact-info">
                  <span>📞 021-xxx-xxx</span>
                  <span>📧 support@ishop.la</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      
    </>
  );
}

export default ConfirmOrder;