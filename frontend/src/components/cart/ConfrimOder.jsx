import React from 'react';
import { useSelector } from 'react-redux';
import MetaData from '../layout/MetaData';   
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import CheckoutStep from './CheckoutStep';

function ConfirmOrder() {

    const navigate = useNavigate();

    // 🛑 FIX 1 & 2: Get user from 'auth' and shippingInfo from 'shipping' slice
    const { user } = useSelector((state) => state.auth);
    const { shippingInfo } = useSelector((state) => state.shipping);
    const { cartItems } = useSelector((state) => state.cart);

    // ------------------- CALCULATIONS -------------------
    
    // 1. Calculate items price (Subtotal)
    const itemsPrice = cartItems.reduce(
        (acc, item) => acc + item.price * item.quantity, 
        0
    );

    // 2. Calculate shipping price (Example: ₭10 for items under ₭1000, free otherwise)
    const shippingPrice = itemsPrice > 1000 ? 0 : 10; 

    // 3. Calculate tax (Example: 10% VAT)
    const taxPrice = 0.10 * itemsPrice;

    // 4. Calculate total price
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    // Utility function for formatting to Laotian Kip (₭)
    const formatKip = (amount) => `₭${amount.toFixed(2)}`;




    const proceedTopaymentHandler = () => {
        navigate('/payment');
        };

    // ------------------- RENDER -------------------

    return (

        <>
            <MetaData title={'ຢືນຢັນການສັ່ງຊື້'} />

            <CheckoutStep shipping  ConfirmOrder/>
            
            <div className="row d-flex justify-content-between">
                <div className="col-12 col-lg-8 mt-5 order-confirm">
                    
                    {/* Shipping Info Section */}
                    <h4 className="mb-3">ຂໍ້ມູນຂົນສົ່ງ</h4>
                    <p><b>Name:</b> {user?.name || "Guest"}</p>
                    {/* 🛑 FIX 3: Use phoneNo instead of phone */}
                    <p><b>Phone:</b> {shippingInfo.phoneNo}</p>
                    <p className="mb-4">
                        <b>Address:</b> {shippingInfo.address}, {shippingInfo.city},{" "}
                        {shippingInfo.province} {shippingInfo.zipCode} {shippingInfo.country}
                    </p> 

                    <hr />

                    {/* Cart Items Section */}
                    {/* 🛑 FIX 4: Move header outside the map */}
                    <h4 className="mt-4">ກະຕ່າສິນຄ້າຂອງທ່ານ:</h4>
                    <hr />

                    {cartItems.map((item) => (
                        <div key={item.product} className="cart-item my-1">
                            <div className="row">
                                <div className="col-4 col-lg-2">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        height="45"
                                        width="65"
                                    />
                                </div>

                                <div className="col-5 col-lg-6">
                                    <Link to={`/product/${item.product}`}>{item.name}</Link>
                                </div>

                                <div className="col-4 col-lg-4 mt-4 mt-lg-0">
                                    <p>
                                        {item.quantity} x {formatKip(item.price)} = 
                                        <b>{formatKip(item.quantity * item.price)}</b>
                                    </p>
                                </div>
                            </div>
                            <hr /> {/* HR is placed inside the map, after each item */}
                        </div>
                    ))}
                    
                </div>

                {/* Order Summary Section */}
                <div className="col-12 col-lg-3 my-4">
                    <div id="order_summary">
                        <h4>ລວມອໍເດີທັງໝົດ</h4>
                        <hr />
                        {/* 🛑 FIX 5: Use calculated dynamic values */}
                        <p>ຜົນລວມຍ່ອຍ: <span className="order-summary-values">{formatKip(itemsPrice)}</span></p>
                        <p>ຄ່າຂົນສົ່ງ: <span className="order-summary-values">{formatKip(shippingPrice)}</span></p>
                        <p>ອມພ (VAT/Tax): <span className="order-summary-values">{formatKip(taxPrice)}</span></p>

                        <hr />

                        <p><b>ລວມລາຄາທັງໝົດ:</b> <span className="order-summary-values"><b>{formatKip(totalPrice)}</b></span></p>

                        <hr />
                        <Link to="/payment_method" id="checkout_btn" className="btn btn-primary w-100"
                        onClick={proceedTopaymentHandler}>
                            ດຳເນີນການຊຳລະ
                        </Link>
                    </div>
                </div>
            </div>

        </>
    );
}

export default ConfirmOrder;