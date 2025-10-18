import React, { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom'; // ✅ Removed redundant and conflicting 'Navigate'
import { useGetMyOrdersQuery } from '../redux/api/OrderApi'; 
import Loader from '../layout/Loader';
import toast from 'react-hot-toast';
import { MDBDataTable } from 'mdbreact';
import MetaData from '../layout/MetaData';
import { useDispatch } from 'react-redux';
import { clearCart } from '../redux/features/cartSlice';

// 🛑 Removed conflicting import: import { Navigate } from 'react-router-dom';
// The Navigates you imported (Link, useNavigate, useSearchParams) are sufficient.


function MyOrders() {
    
    // RTK Query Hook
    const { data, isLoading, error, isError } = useGetMyOrdersQuery();
    const navigate = useNavigate(); // ✅ Correct hook usage
    
    // Safely extract orders, defaulting to an empty array
    const orders = data?.orders || []; 
    const dispatch = useDispatch();

    const [searchParams] = useSearchParams();

    const orderSuccess = searchParams.get("order_success");

    // Error handling and Post-Order Success Effect
    useEffect(() => {
        if (isError) {
            toast.error(error?.data?.message || "An error occurred while fetching orders.");
        }

        if (orderSuccess) {
          
            
            // 2. Clear the cart state
            dispatch(clearCart());
            
            // 3. Navigate away to strip the query parameter from the URL
            //    This prevents the effect from running again on refresh.
            // 🛑 FIX: Use the 'navigate' function, not the component 'Navigate'
            navigate("/me/orders", { replace: true }); 
        }
    }, [isError, error, orderSuccess, dispatch, navigate]); // ✅ Added dependencies

    // Data formatter function for MDBDataTable
    const setOrders = () => {
        const data = {
            columns: [
                { label: 'ID', field: 'id', sort: 'asc' },
                { label: 'ລວມລາຄາ', field: 'amount', sort: 'asc' },
                { label: 'ສະຖານະ', field: 'status', sort: 'asc' },
                { label: 'ກິດຈະກຳ', field: 'actions', sort: 'asc' },
            ],
            rows: [],
        };

        // Populate the Rows array with data from the RTK Query result
        orders.forEach((order) => {
            // Determine status text color
            const statusClassName = order.orderStatus && order.orderStatus.includes("Delivered") 
                ? "text-success" 
                : "text-warning";
                
            data.rows.push({
                // Truncate ID for better table display
                id: order._id.substring(0, 20) + '...', 
                
                // Format amount
                amount: `$${order.totalAmount?.toFixed(2)}`, 
                
                // Style the status cell
                status: (
                    <p className={statusClassName} style={{ margin: 0 }}>
                        {order.orderStatus}
                    </p>
                ),
                // Note: orderStatus here is redundant if 'status' field is displayed
                
                // Add the View Details and Invoice buttons/links
                actions: (
                    <>
                        <Link to={`/me/orders/${order._id}`} className="btn btn-primary btn-sm">
                            <i className="fa fa-eye"></i>
                        </Link>
                        {/* 🛑 FIX: Changed '/invoice/orders/' to '/invoice/order/' 
                           to match common route structure (check your routes if this is wrong) */}
                        <Link to={`/invoice/orders/${order._id}`} className="btn btn-success btn-sm ms-2">
                            <i className="fa fa-print"></i>
                        </Link>

                    </>
                ),
            });
        });

        return data;
    };
    
    if (isLoading) return <Loader />;

    // ------------------- Component Render -------------------
    return (
        <> 
            <MetaData title="My Orders" />
            <div className="container">
                <h2 className="mt-5 mb-3">ລາຍການສິນຄ້າ ({orders.length})</h2>

                {orders.length === 0 ? (
                    <p className="text-center">ບໍ່ມີລາຍການສິນຄ້າທີ່ພົບ.</p>
                ) : (
                    <> 
                        <MDBDataTable 
                            data={setOrders()} // Pass the formatted data object
                            className="px-3"
                            bordered
                            striped
                            hover
                            noBottomColumns 
                        />
                    </>
                )}
            </div>
        </>
    );
}

export default MyOrders;