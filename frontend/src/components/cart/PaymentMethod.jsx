import React, { useEffect } from 'react';
import MetaData from '../layout/MetaData';
import CheckoutStep from './CheckoutStep';
import { useSelector } from 'react-redux';
import { caluclateOrderCosts } from '../../helpers/helpers';
import { useNavigate } from 'react-router-dom';

import {
    useCreateNewOrderMutation,
    useCreateCheckoutSessionMutation
} from '../redux/api/OrderApi';
import toast from 'react-hot-toast';


function PaymentMethod() {

    const navigate = useNavigate();
    const [method, setMethod] = React.useState("");

    // Selectors
    const { cartItems } = useSelector((state) => state.cart);

    // 👇 CRITICAL FIX: Change state.cart to state.shipping (or the actual slice name)
    //    The previous selector was likely returning an empty or incomplete object.
    const { shippingInfo } = useSelector((state) => state.shipping);
    // If your shipping info is stored directly in the root of the cart slice, use:
    // const { shippingInfo } = useSelector((state) => state.cart); 

    // RTK Query Hooks
    const [createNewOrder, { isLoading, error, isSuccess }] = useCreateNewOrderMutation();
    const [
        createCheckoutSession,
        { data: checkoutData, error: checkoutError, isLoading: isCheckoutLoading }
    ] = useCreateCheckoutSessionMutation();


    // ------------------- Stripe Checkout Effect -------------------
    useEffect(() => {
        if (checkoutData) {
            console.log("Stripe Checkout Response Data:", checkoutData);
        }

        // Redirect to Stripe's payment page if the URL is successfully returned
        if (checkoutData?.url && typeof checkoutData.url === 'string' && checkoutData.url.length > 0) {
            window.location.href = checkoutData.url;
        }

        if (checkoutError) {
            toast.error(checkoutError?.data?.message || "An error occurred during Stripe checkout");
        }
    }, [checkoutData, checkoutError]);

    // ------------------- COD Success/Error Effect -------------------
    useEffect(() => {
        if (error) {
            toast.error(error?.data?.message || "An error occurred during COD order creation");
        }

        if (isSuccess) {
            navigate("/me/orders?order_success=true");
        }
    }, [error, isSuccess, navigate]);

    // ------------------- Submit Handler -------------------
    const submitHandler = (e) => {
        e.preventDefault();

        if (method === "") {
            return toast.error("Please select a payment method.");
        }

        // Sanity check: Ensure shippingInfo is present before proceeding
        if (!shippingInfo || Object.keys(shippingInfo).length === 0) {
            return toast.error("Shipping information is missing. Please go back to the shipping page.");
        }

        const { itemsPrice, shippingAmount, taxAmount, totalAmount } = caluclateOrderCosts(cartItems);

        const baseOrderData = {
            shippingInfo, // This object is now correctly populated
            itemsPrice: itemsPrice,
            shippingAmount: shippingAmount,
            taxAmount: taxAmount,
            totalAmount: totalAmount,
            orderItems: cartItems.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                product: item.product,
                image: item.image || 'default_url_needed_by_schema',
            })),
        }


        if (method === "COD") {
            const codOrderData = {
                ...baseOrderData,
                paymentMethod: method,
                paymentInfo: { status: "ຍັງບໍ່ທັນຊຳລະ" },
            };

            createNewOrder(codOrderData);

        } else if (method === "Card") {
            createCheckoutSession(baseOrderData);
        }
    }

    // ------------------- Component Render -------------------
    return (
        <>
            <MetaData title={'Payment Method'} />
            <CheckoutStep shipping confirmOrder payment />

            <div className="row wrapper">
                <div className="col-10 col-lg-5">
                    <form
                        className="shadow rounded bg-body"
                        onSubmit={submitHandler}
                    >
                        <h2 className="mb-4">ເລືອກວິທີການຊໍາລະເງິນ</h2>
                        <div className="form-check">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="payment_mode"
                                id="codradio"
                                value="COD"
                                onChange={() => setMethod("COD")}
                            />
                            <label className="form-check-label" htmlFor="codradio">
                                ຈ່າຍເງິນເມື່ອຮັບສິນຄ້າ (Cash On Delivery)
                            </label>
                        </div>
                        <div className="form-check">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="payment_mode"
                                id="cardradio"
                                value="Card"
                                onChange={() => setMethod("Card")}
                            />
                            <label className="form-check-label" htmlFor="cardradio">
                                Card - VISA, MasterCard
                            </label>
                        </div>

                        <button
                            id="shipping_btn"
                            type="submit"
                            className="btn py-2 w-100"
                            disabled={isLoading || isCheckoutLoading || !method}
                        >
                            {isLoading || isCheckoutLoading ? "Processing..." : "ດໍາເນີນການຊໍາລະເງິນ"}
                        </button>
                    </form>
                </div>
            </div>
        </>
    )
}

export default PaymentMethod;