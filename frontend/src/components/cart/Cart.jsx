// src/components/Cart.jsx
import React from 'react';
import MetaData from '../layout/MetaData';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { setcartItems, removeItemFromCart } from '../redux/features/cartSlice';
import toast from 'react-hot-toast';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';

function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // safe selector with fallback
  const { cartItems = [] } = useSelector((state) => state.cart || { cartItems: [] });

  // Helper: calculate subtotal for a single item
  const calculateItemSubtotal = (item) => {
    const price = Number(item.price || 0);
    const qty = Number(item.quantity || 0);
    return price * qty;
  };

  // Cart totals
  const subtotalPrice = cartItems.reduce((acc, item) => acc + calculateItemSubtotal(item), 0);
  const subtotalUnits = cartItems.reduce((acc, item) => acc + Number(item.quantity || 0), 0);

  // Handlers
  const increaseQty = (item) => {
    const qty = Number(item.quantity || 0) + 1;
    if (typeof item.stock !== 'undefined' && qty > Number(item.stock)) {
      return toast.error("ບໍ່ສາມາດເພີ່ມໄດ້: ສິນຄ້າໝົດ");
    }
    const newItem = { ...item, quantity: qty };
    dispatch(setcartItems(newItem));
  };

  const decreaseQty = (item) => {
    const qty = Number(item.quantity || 0) - 1;
    if (qty <= 0) {
      // confirm remove
      if (window.confirm("ຢືນຢັນຕ້ອງການລຶບລາຍການນີ້?")) {
        dispatch(removeItemFromCart(item.product));
        toast.success("ລຶບສິນຄ້າສໍາເລັດ");
      }
      return;
    }
    const newItem = { ...item, quantity: qty };
    dispatch(setcartItems(newItem));
  };

  const handleRemoveItem = (id) => {
    if (!window.confirm("ຢືນຢັນການລຶບລາຍການ?")) return;
    dispatch(removeItemFromCart(id));
    toast.success("ລຶບສິນຄ້າອອກຈາກກະຕ່າສຳເລັດ");
  };

  const checkoutHandler = () => {
    navigate("/shipping");
  };

  // Format currency (LAK)
  const formatKip = (amount) => {
    const num = Number(amount || 0);
    return `₭ ${num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  return (
    <>
      <style>{`
        :root{
          --bg: #f6f9fb;
          --card: #ffffff;
          --muted: #6b7280;
          --primary: #0f63ff;
          --accent: #10b981;
          --radius: 12px;
          --shadow: 0 10px 30px rgba(15,99,255,0.06);
          --gap: 16px;
          --maxw: 1100px;
          --font: "Noto Sans Lao", Phetsarath OT, "Segoe UI", Roboto, sans-serif;
        }
        .cart-root { background: var(--bg); min-height: 60vh; padding: 36px 12px; font-family: var(--font); }
        .cart-container { max-width: var(--maxw); margin: 0 auto; }
        .cart-hero { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:18px; }
        .cart-hero h2 { margin:0; font-weight:800; color:#0b1220; }
        .empty-card { background:var(--card); border-radius:var(--radius); padding:28px; box-shadow:var(--shadow); text-align:center; }
        .cart-grid { display:grid; grid-template-columns: 1fr 340px; gap:20px; align-items:start; }
        @media (max-width: 980px) { .cart-grid { grid-template-columns: 1fr; } }

        .cart-list { background:var(--card); padding:18px; border-radius:var(--radius); box-shadow:var(--shadow); }
        .cart-row { display:flex; gap:12px; align-items:center; padding:14px 6px; border-bottom:1px solid #f1f5f9; }
        .cart-row:last-child { border-bottom: none; }
        .cart-thumb { width:120px; height:90px; border-radius:8px; overflow:hidden; flex-shrink:0; display:flex; align-items:center; justify-content:center; background:#fafafa; border:1px solid #eef2f7; }
        .cart-thumb img { width:100%; height:100%; object-fit:cover; display:block; }

        .cart-info { flex:1; }
        .cart-title { margin:0; font-weight:700; color:#0b1220; text-decoration:none; }
        .cart-meta { color:var(--muted); font-size:0.92rem; margin-top:6px; }

        .qty-control { display:flex; align-items:center; gap:8px; }
        .qty-btn { width:34px; height:34px; border-radius:8px; display:inline-flex; align-items:center; justify-content:center; border:none; cursor:pointer; }
        .qty-btn:active { transform:translateY(1px); }
        .qty-input { width:64px; text-align:center; border-radius:8px; padding:8px; border:1px solid #e6edf3; background:#fff; }

        .item-subtotal { font-weight:800; color:#071124; }

        .order-summary { background:linear-gradient(180deg,#fff,#f8fbff); padding:18px; border-radius:var(--radius); box-shadow:var(--shadow); border:1px solid rgba(15,99,255,0.06); }
        .order-summary h4 { margin:0 0 12px 0; }
        .summary-row { display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px dashed #eef2f7; }
        .summary-row:last-child { border-bottom:none; }
        .checkout-btn { width:100%; padding:12px; border-radius:10px; background:linear-gradient(90deg,var(--primary), #1977ff); color:#fff; border:none; font-weight:800; cursor:pointer; }
        .checkout-btn:disabled { opacity:0.7; cursor:not-allowed; }

        .remove-btn { background:transparent; border:1px solid rgba(220,38,38,0.12); color:#ef4444; padding:8px 10px; border-radius:8px; cursor:pointer; }
        .remove-btn:hover { background:rgba(239,68,68,0.06); }

        /* small */
        .muted-small { color:var(--muted); font-size:0.9rem; }
      `}</style>

      <MetaData title={'ກະຕ່າສິນຄ້າຂອງທ່ານ'} />

      <div className="cart-root">
        <div className="cart-container">
          <div className="cart-hero">
            <h2>ກະຕ່າສິນຄ້າ</h2>
            <div className="muted-small">ລາຍການ: <strong>{cartItems.length}</strong> • ສິນຄ້າ: <strong>{subtotalUnits}</strong></div>
          </div>

          {(!cartItems || cartItems.length === 0) ? (
            <div className="empty-card">
              <h3 className="mb-2">ກະຕ່າສິນຄ້າວ່າງ</h3>
              <p className="muted-small">ສິນຄ້າທີ່ເພີ່ມຈະປິດໃນນີ້</p>
              <div style={{ marginTop: 16 }}>
                <Link to="/" className="checkout-btn" style={{ textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}>ໄປໜ້າສິນຄ້າ</Link>
              </div>
            </div>
          ) : (
            <div className="cart-grid">
              <div className="cart-list" aria-live="polite">
                {cartItems.map((item) => (
                  <div className="cart-row" key={item.product}>
                    <div className="cart-thumb">
                      <img src={item.image || '/images/default_product.png'} alt={item.name} />
                    </div>

                    <div className="cart-info">
                      <Link to={`/product/${item.product}`} className="cart-title">{item.name}</Link>
                      <div className="cart-meta">
                        <span className="muted-small">Seller: {item.seller || 'ITHUBB'}</span> •
                        <span className="muted-small"> Stock: {typeof item.stock !== 'undefined' ? item.stock : '—'}</span>
                      </div>

                      <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                        <div className="qty-control" role="group" aria-label={`Quantity for ${item.name}`}>
                          <button className="qty-btn btn btn-light" onClick={() => decreaseQty(item)} aria-label="Decrease quantity">
                            <FontAwesomeIcon icon={faMinus} />
                          </button>

                          <input className="qty-input" value={String(item.quantity)} readOnly aria-label="Quantity input" />

                          <button className="qty-btn btn btn-light" onClick={() => increaseQty(item)} aria-label="Increase quantity">
                            <FontAwesomeIcon icon={faPlus} />
                          </button>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div className="item-subtotal">{formatKip(calculateItemSubtotal(item))}</div>
                          <div style={{ marginTop: 8 }}>
                            <button className="remove-btn" onClick={() => handleRemoveItem(item.product)} title="Remove item">
                              <FontAwesomeIcon icon={faTrash} /> ລຶບ
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <aside className="order-summary" aria-label="Order summary">
                <h4>ລວມລາຍການ</h4>

                <div className="summary-row">
                  <div>ລາຍການ</div>
                  <div><strong>{cartItems.length}</strong></div>
                </div>

                <div className="summary-row">
                  <div>ລວມຫນ້ອຍ</div>
                  <div>{subtotalUnits} ລາຍການ</div>
                </div>

                <div className="summary-row">
                  <div>ລາຄາທັງໝົດ</div>
                  <div style={{ fontWeight: 900 }}>{formatKip(subtotalPrice)}</div>
                </div>

                <div style={{ marginTop: 16 }}>
                  <button className="checkout-btn" onClick={checkoutHandler}>Check out</button>
                </div>

                <div style={{ marginTop: 12 }} className="muted-small">
                  <div>ຈຳນວນລາຍການ: {subtotalUnits}</div>
                  <div style={{ marginTop: 8 }}>ຈ່າຍໄດ້ຫຼາຍວິທີ: ເຊັ່ນ QR ຫຼື ບັດເຄຣດິດ</div>
                </div>
              </aside>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Cart;
