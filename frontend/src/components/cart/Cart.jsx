import React from 'react';
import MetaData from '../layout/MetaData';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
// The Redux action creator is imported here:
import { setcartItems, removeItemFromCart } from '../redux/features/cartSlice';
import toast from 'react-hot-toast';

// 🛑 FIX 1: Add Font Awesome Imports
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons'; 

function Cart() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { cartItems } = useSelector((state) => state.cart);

    // Function to calculate total item price
    const calculateItemSubtotal = (item) => item.price * item.quantity;
    
    // Function to calculate cart subtotal (total price)
    const subtotalPrice = cartItems.reduce(
        (acc, item) => acc + calculateItemSubtotal(item),
        0
    );

    // Function to calculate total number of units
    const subtotalUnits = cartItems.reduce(
        (acc, item) => acc + item.quantity,
        0
    );

    // ----------------- Handlers -----------------

    const increaseQty = (item, newQuantity) => {
        const qty = item.quantity + 1;
        // Check if the new quantity exceeds the stock limit
        if (qty > item.stock) return toast.error("ບໍ່ສາມາດເພີ່ມໄດ້: ສິນຄ້າໝົດ");
        
        // Dispatch the updated item object to setcartItems (which handles update/add logic)
        const newItem = { ...item, quantity: qty };
        dispatch(setcartItems(newItem));
    };

    const decreaseQty = (item, newQuantity) => {
        const qty = item.quantity - 1;
        // Do nothing if quantity is already 1 or less
        if (qty <= 0) return; 
        
        const newItem = { ...item, quantity: qty };
        dispatch(setcartItems(newItem));
    };

    // Fix for infinite recursion error
    const handleRemoveItem = (id) => {
        dispatch(removeItemFromCart(id)); 
        toast.success("ລຶບສິນຄ້າອອກຈາກກະຕ່າສຳເລັດ");
    };

    const checkoutHandler = () => {
        navigate("/shipping");
    };

    // ----------------- Component Render -----------------

    return (
        <>
            <MetaData title={'ກະຕ່າສິນຄ້າຂອງທ່ານ'} />
            
            {/* Conditional rendering based on cart size */}
            {cartItems.length === 0 ? (
                <h2 className="mt-5">ກະຕ່າສິນຄ້າຂອງທ່ານວ່າງເປົ່າ</h2>
            ) : (
                <>
                    <h2 className="mt-5">ກະຕ່າສິນຄ້າຂອງທ່ານ: <b>{cartItems.length} ລາຍການ</b></h2>

                    <div className="row d-flex justify-content-between">
                        <div className="col-12 col-lg-8">
                            {/* Loop through cartItems */}
                            {cartItems.map((item) => (
                                <div key={item.product}> {/* Use item.product as the unique key */}
                                    <hr />
                                    <div className="cart-item" data-key={item.product}>
                                        <div className="row">
                                            <div className="col-4 col-lg-3">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    height="90"
                                                    width="115"
                                                />
                                            </div>
                                            <div className="col-5 col-lg-3">
                                                {/* Link to product details */}
                                                <Link to={`/products/${item.product}`}> {item.name} </Link>
                                            </div>
                                            <div className="col-4 col-lg-2 mt-4 mt-lg-0">
                                                <p id="card_item_price">₭ {item.price.toFixed(2)}</p>
                                            </div>
                                            <div className="col-4 col-lg-3 mt-4 mt-lg-0">
                                                <div className="stockCounter d-inline">
                                                    <span 
                                                        className="btn btn-danger minus" 
                                                        onClick={() => decreaseQty(item)}
                                                    > - </span>
                                                    <input
                                                        type="number"
                                                        className="form-control count d-inline"
                                                        value={item.quantity}
                                                        readOnly
                                                    />
                                                    <span 
                                                        className="btn btn-primary plus" 
                                                        onClick={() => increaseQty(item)}
                                                    > + </span>
                                                </div>
                                            </div>
                                            <div className="col-4 col-lg-1 mt-4 mt-lg-0">
                                                {/* Button to remove item */}
                                                {/* 🛑 FIX 2: Corrected JSX structure to use FontAwesomeIcon */}
                                                <button 
                                                    id="delete_cart_item" 
                                                    className="btn btn-danger"
                                                    onClick={() => handleRemoveItem(item.product)}
                                                > 
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <hr />
                        </div>

                        <div className="col-12 col-lg-3 my-4">
                            <div id="order_summary">
                                <h4>ລວມລາຍການສິນຄ້າທັງໝົດ</h4>
                                <hr />
                                {/* Display calculated values */}
                                <p>ລາຍການຍ່ອຍທັງໝົດ: <span className="order-summary-values">{subtotalUnits} (ລາຍການ)</span></p>
                                <p>ລວມລາຄາທັງໝົດ: <span className="order-summary-values">₭ {subtotalPrice.toFixed(2)}</span></p>
                                <hr />
                                <button 
                                    id="checkout_btn" 
                                    className="btn btn-primary w-100"
                                    onClick={checkoutHandler}
                                >
                                    Check out
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    )
}

export default Cart;