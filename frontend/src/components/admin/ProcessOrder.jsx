import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import Loader from '../layout/Loader';
import toast from 'react-hot-toast';
import MetaData from '../layout/MetaData';
import AdminLayout from '../layout/AdminLayout';

// Import necessary RTK Query hooks
import { 
    useGetOrderDetailsQuery, 
    useUpdateOrderMutation 
} from '../redux/api/OrderApi'; 

function ProcessOrder() {
    const { id } = useParams();

    // Fetch order details
    const { data, isLoading, isError, error } = useGetOrderDetailsQuery(id);
    const order = data?.order || {};

    // Update mutation
    const [
        updateOrder, 
        { isLoading: isUpdating, isSuccess: isUpdateSuccess, error: updateError }
    ] = useUpdateOrderMutation();

    const [status, setStatus] = useState('');

    // Destructure with safe defaults
    const { 
        shippingInfo = {}, 
        orderItems = [], 
        paymentInfo = {}, 
        user = {}, 
        totalAmount = 0,
        orderStatus = 'Processing'
    } = order;

    // Normalize payment status check (case-insensitive)
    const isPaid = String(paymentInfo?.status || '').toLowerCase() === 'paid';

    useEffect(() => {
        if (orderStatus) setStatus(orderStatus);
    }, [orderStatus]);

    useEffect(() => {
        if (isError) {
            toast.error(error?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການເອີ້ນລາຍການ");
        }
    }, [isError, error]);

    useEffect(() => {
        if (updateError) {
            toast.error(updateError?.data?.message || "ອັບເດດບໍ່ສຳເລັດ");
        }
        if (isUpdateSuccess) {
            toast.success("ອັບເດດສະຖານະສຳເລັດ");
            // RTK Query should re-fetch if configured; if not, the hook will update when cache invalidated.
        }
    }, [isUpdateSuccess, updateError]);

    const updateOrderHandler = () => {
        const body = { status };
        // adjust payload per your backend expectation
        updateOrder({ id, body });
    };

    const isDelivered = String(orderStatus || '').toLowerCase().includes('delivered');
    const statusColorClass = isDelivered ? 'greenColor' : 'redColor';
    const paymentColorClass = isPaid ? 'greenColor' : 'redColor';

    if (isLoading) return <Loader />;

    const safeDate = order?.createdAt ? new Date(order.createdAt) : null;
    const createdAtText = safeDate ? safeDate.toLocaleDateString('lo-LA') : 'N/A';

    return (
        <AdminLayout>
            <MetaData title={'Process Order'} />
            <div className="row d-flex justify-content-around">
                <div className="col-12 col-lg-8 order-details">
                    <h3 className="mt-5 mb-4">ລາຍລະອຽດອໍເດີ (Order Details)</h3>

                    <table className="table table-striped table-bordered">
                        <tbody>
                            <tr>
                                <th scope="row">ID</th>
                                <td>{order?._id || 'N/A'}</td>
                            </tr>
                            <tr>
                                <th scope="row">ສະຖານະອໍເດີ</th>
                                <td className={statusColorClass}><b>{orderStatus}</b></td>
                            </tr>
                            <tr>
                                <th scope="row">ວັນທີສັ່ງຊື້</th>
                                <td>{createdAtText}</td>
                            </tr>
                        </tbody>
                    </table>

                    <h3 className="mt-5 mb-4">ຂໍ້ມູນການຂົນສົ່ງ</h3>
                    <table className="table table-striped table-bordered">
                        <tbody>
                            <tr>
                                <th scope="row">ຊື່</th>
                                <td>{shippingInfo?.fullName || user?.name || 'N/A'}</td>
                            </tr>
                            <tr>
                                <th scope="row">ເບີໂທ</th>
                                <td>{shippingInfo?.phoneNo || 'N/A'}</td>
                            </tr>
                            <tr>
                                <th scope="row">ທີ່ຢູ່</th>
                                <td>{shippingInfo?.address || 'N/A'}</td>
                            </tr>
                        </tbody>
                    </table>

                    <h3 className="mt-5 mb-4">ຂໍ້ມູນການຊຳລະເງິນ</h3>
                    <table className="table table-striped table-bordered">
                        <tbody>
                            <tr>
                                <th scope="row">ສະຖານະ</th>
                                <td className={paymentColorClass}><b>{String(paymentInfo?.status || 'N/A').toUpperCase()}</b></td>
                            </tr>
                            <tr>
                                <th scope="row">ຮູບແບບການຊຳລະ</th>
                                <td>{paymentInfo?.method || paymentInfo?.paymentMethod || 'N/A'}</td>
                            </tr>
                            <tr>
                                <th scope="row">ລະຫັດ</th>
                                <td>{paymentInfo?.id || 'N/A'}</td>
                            </tr>
                            <tr>
                                <th scope="row">ລວມເງິນ</th>
                                <td>{typeof totalAmount === 'number' ? `₭ ${totalAmount.toLocaleString()}` : totalAmount}</td>
                            </tr>
                        </tbody>
                    </table>

                    <h3 className="mt-5 my-4">ລາຍການສັ່ງຊື້:</h3>
                    <hr />
                    {orderItems && orderItems.length > 0 ? (
                        orderItems.map((item, index) => {
                            const price = Number(item?.price || 0);
                            return (
                                <div key={index} className="cart-item my-1">
                                    <div className="row my-5">
                                        <div className="col-4 col-lg-2">
                                            <img src={item?.image} alt={item?.name} height="45" width="65" />
                                        </div>
                                        <div className="col-5 col-lg-5">
                                            <Link to={`/product/${item?.product}`}>{item?.name}</Link>
                                        </div>
                                        <div className="col-4 col-lg-2 mt-4 mt-lg-0">
                                            <p>{`₭ ${price.toLocaleString()}`}</p>
                                        </div>
                                        <div className="col-4 col-lg-3 mt-4 mt-lg-0">
                                            <p>{item?.quantity ?? 0} Piece(s)</p>
                                        </div>
                                    </div>
                                    <hr />
                                </div>
                            );
                        })
                    ) : (
                        <p>No order items.</p>
                    )}
                </div>

                <div className="col-12 col-lg-3 mt-5">
                    <h4 className="my-4">ອັບເດດສະຖານະ</h4>

                    <div className="mb-3">
                        <select 
                            className="form-select" 
                            name="status" 
                            value={status} 
                            onChange={(e) => setStatus(e.target.value)} 
                            disabled={isDelivered}
                        >
                            <option value="Processing">ກຳລັງກຽມສິນຄ້າ (Processing)</option>
                            <option value="Shipped">ກຳລັງຂົນສົ່ງ (Shipped)</option>
                            <option value="Delivered">ຈັດສົ່ງແລ້ວ (Delivered)</option>
                        </select>
                    </div>
                    
                    {!isDelivered ? (
                        <button 
                            className="btn btn-primary w-100"
                            onClick={updateOrderHandler}
                            disabled={isUpdating}
                        >
                            {isUpdating ? <><i className="fa fa-spinner fa-spin me-2" />ກຳລັງອັບເດດ...</> : 'ອັບເດດສະຖານະ'}
                        </button>
                    ) : (
                        <button className="btn btn-success w-100" disabled>ຈັດສົ່ງສຳເລັດແລ້ວ</button>
                    )}

                    <h4 className="mt-5 mb-3">ໃບລາຍການສັ່ງຊື້</h4>
                    <a href={`/invoice/orders/${order?._id}`} className="btn btn-success w-100" target="_blank" rel="noreferrer">
                        <i className="fa fa-print"></i> ສ້າງໃບສັ່ງຊື້
                    </a>
                </div>
            </div>
        </AdminLayout>
    );
}

export default ProcessOrder;
