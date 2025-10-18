import React, { useEffect } from 'react';
import MetaData from '../layout/MetaData';
import { useGetOrderDetailsQuery } from '../redux/api/OrderApi';
import { useParams, Link } from 'react-router-dom';
import Loader from '../layout/Loader';
import toast from 'react-hot-toast';

function OrderDetail() {
    
    const params = useParams();

    const { data, isLoading, error } = useGetOrderDetailsQuery(params.id);
    const order = data?.order;

    // Destructuring order data.
    const { 
        shippingInfo, 
        paymentInfo, 
        orderItems, 
        user, 
        totalAmount, // Used for amount paid
        orderStatus, // Used for order status
        createdAt,
        paymentMethod // ✅ Added paymentMethod here
    } = order || {};

    // Determine the payment status color
    const isPaid = paymentInfo?.status === 'Paid' || paymentInfo?.status === 'succeeded';
    const paymentStatusClass = isPaid ? "greenColor" : "redColor";
    const paymentStatusText = isPaid ? "ຊຳລະແລ້ວ" : "ຍັງບໍ່ທັນຊຳລະ"; // Lao text
    
    // Determine the order status color (used in General Info table)
    const orderStatusClass = orderStatus?.includes("Delivered") ? "greenColor" : "redColor";


    useEffect(() => {
        if (error) {
            toast.error(error?.data?.message || "An error occurred while fetching order details.");
        }
    } , [error]);

    if (isLoading) return <Loader />;
    if (error) return <p className="text-center mt-5">Error: {error?.data?.message || "Could not load order details."}</p>;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <>
            <MetaData title="Order Details" />
            <div className="row d-flex justify-content-center">
                <div className="col-12 col-lg-9 mt-5 order-details">
                    <div className="d-flex justify-content-between align-items-center">
                        <h3 className="mt-5 mb-4">ລາຍລະອຽດສິນຄ້າ</h3>
                        <a className="btn btn-success" href={`/invoice/order/${order?._id}`}>
                            <i className="fa fa-print"></i> Invoice
                        </a>
                    </div>
                    
                    {/* ORDER INFO TABLE */}
                    <h5 className="mb-3">ຂໍ້ມູນທົ່ວໄປ</h5>
                    <table className="table table-striped table-bordered">
                        <tbody>
                            <tr>
                                <th scope="row">ID</th>
                                <td>{order?._id}</td>
                            </tr>
                            <tr>
                                <th scope="row">ສະຖານະ</th>
                                <td className={orderStatusClass}>
                                    <b>{orderStatus}</b>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">ວັນທີ</th>
                                <td>{formatDate(createdAt)}</td>
                            </tr>
                        </tbody>
                    </table>

                    {/* SHIPPING INFO TABLE */}
                    <h3 className="mt-5 mb-4">ຂໍ້ມູນການຂົນສົ່ງ</h3>
                    <table className="table table-striped table-bordered">
                        <tbody>
                            <tr>
                                <th scope="row">ຊື່</th>
                                <td>{user?.name || 'N/A'}</td>
                            </tr>
                            <tr>
                                <th scope="row">ເບີໂທ</th>
                                <td>{shippingInfo?.phoneNo}</td>
                            </tr>
                            <tr>
                                <th scope="row">ສະຖານທີ່</th>
                                <td>
                                    {shippingInfo?.address}, {shippingInfo?.city}, {shippingInfo?.zipCode}, {shippingInfo?.country}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* PAYMENT INFO TABLE */}
                    <h3 className="mt-5 mb-4">ຂໍ້ມູນການຊຳລະ</h3>
                    <table className="table table-striped table-bordered">
                        <tbody>
                            <tr>
                                <th scope="row">ສະຖານະ</th>
                                {/* ✅ FIX 1: Apply dynamic payment status class and text */}
                                <td className={paymentStatusClass}>
                                    <b>{paymentStatusText}</b>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">ວິທີການຊຳລະ</th>
                                {/* ✅ FIX 2: Use destructured paymentMethod */}
                                <td>{paymentMethod}</td> 
                            </tr>
                            {/* Transaction ID is paymentInfo.id, show only if available/paid */}
                            {isPaid && paymentInfo?.id && (
                                <tr>
                                    <th scope="row">Transaction ID</th>
                                    <td>{paymentInfo.id}</td>
                                </tr>
                            )}
                            <tr>
                                <th scope="row">ຈຳນວນເງິນທີ່ຊຳລະ</th>
                                <td>${totalAmount?.toFixed(2) || 'N/A'}</td> 
                            </tr>
                        </tbody>
                    </table>

                    {/* ORDER ITEMS LIST */}
                    <h3 className="mt-5 my-4">ລາຍການສິນຄ້າທີ່ສັ່ງຊື້:</h3>
                    <hr />

                    {orderItems?.map(item => (
                        <div key={item.product} className="cart-item my-1">
                            <div className="row my-5">
                                <div className="col-4 col-lg-2">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        height="45"
                                        width="65"
                                    />
                                </div>

                                <div className="col-5 col-lg-5">
                                    <Link to={`/product/${item.product}`}>{item.name}</Link>
                                </div>

                                <div className="col-4 col-lg-2 mt-4 mt-lg-0">
                                    <p>${item.price?.toFixed(2)}</p>
                                </div>

                                <div className="col-4 col-lg-3 mt-4 mt-lg-0">
                                    <p>{item.quantity} ລາຍການ</p>
                                </div>
                            </div>
                            <hr />
                        </div>
                    ))}

                </div>
            </div>
        </>
    )
}

export default OrderDetail;