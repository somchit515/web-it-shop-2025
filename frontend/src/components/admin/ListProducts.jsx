import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

import Loader from '../layout/Loader';
import toast from 'react-hot-toast';
import { MDBDataTable } from 'mdbreact';
import MetaData from '../layout/MetaData';
import { useGetAdminProductsQuery } from '../redux/api/productsApi';
import AdminLayout from '../layout/AdminLayout';
// Note: You would also need to import useDeleteProductMutation for the delete button to work.


function ListProducts() {
    
    // RTK Query Hook
    const { data, isLoading, error, isError } = useGetAdminProductsQuery();
    
    // 💡 FIX 1: Define 'products' by safely accessing the 'data' object.
    const products = data?.products || []; 
    // You'd also define delete mutation hooks/state here if implementing delete.
    const isDeleteLoading = false; // Placeholder for actual delete loading state
    const handleDelete = (id) => console.log('Deleting:', id); // Placeholder for actual handler

    // Error handling effect
    useEffect(() => {
        if (isError) {
            // Updated error message to mention 'products' instead of 'orders'
            toast.error(error?.data?.message || "An error occurred while fetching products.");
        }
    }, [isError, error]); 

    // Data formatter function for MDBDataTable
    const setProductsData = () => {
        const dataTable = {
            columns: [
                { label: 'ID', field: 'id', sort: 'asc' },
                { label: 'ຊື່ (Name)', field: 'name', sort: 'asc' },
                { label: 'ລາຄາ (Price)', field: 'price', sort: 'asc' },
                { label: 'Stock', field: 'stock', sort: 'asc' },
                { label: 'Actions', field: 'actions', sort: 'disabled' }, // Actions usually shouldn't be sortable
            ],
            rows: [],
        };
        
        // 💡 FIX 2: Correctly iterate over the defined 'products' array
        products.forEach((product) => {
            // 💡 FIX 3: Push to dataTable.rows, not products.rows
            dataTable.rows.push({
                id: product?._id.substring(0, 8) + '...', 
                name: `${product?.name}?.substring(0,20)...`,
                price: `$${product.price?.toFixed(2)}`, 
                // 💡 FIX 4: Removed stray parenthesis ')'
                stock: product?.stock, 
                
                actions: (
                    <>
                        {/* Edit Button */}
                        <Link 
                            to={`/admin/products/${product?._id}`} 
                            className="btn btn-outline-primary" 
                        >
                            <i className="fa fa-pencil"></i>
                        </Link>
                        
                        {/* Upload Images Button */}
                        <Link 
                            to={`/admin/products/${product?._id}/upload_images`} 
                            className="btn btn-outline-success me-2 ms-2" // Added ms-2 for spacing
                            // The disabled prop was correctly removed here in the prior fixed version.
                        >
                            <i className="fa fa-image"></i>
                        </Link>
                        
                        {/* Delete Button */}
                        <button 
                            onClick={() => handleDelete(product._id)}
                            className="btn btn-outline-danger"
                            disabled={isDeleteLoading} // Use the loading state when implemented
                        >
                            {/* 💡 FIX 5: Corrected conditional rendering for spinner */}
                            {isDeleteLoading ? (
                                <i className="fa fa-spinner fa-spin"></i>
                            ) : (
                                <i className="fa fa-trash"></i>
                            )}
                        </button>
                    </>
                ),
            });
        });

        return dataTable;
    };
    
    if (isLoading) return <Loader />;

    // ------------------- Component Render -------------------
    return (
        <AdminLayout> 
            <MetaData title="Admin Products" /> {/* Changed title */}
            <div className="container">
                {/* 💡 FIX 6: Use the defined 'products.length' */}
                <h2 className="mt-5 mb-3">ລາຍການສິນຄ້າ ({data?.products?.length})</h2>

                {/* 💡 FIX 7: Use the defined 'products.length' */}
                {data?.products?.length === 0 ? (
                    <p className="text-center">ບໍ່ມີລາຍການສິນຄ້າທີ່ພົບ.</p>
                ) : (
                    <> 
                        <MDBDataTable 
                            // 💡 FIX 8: Use the correct function name 'setProductsData()'
                            data={setProductsData()} 
                            className="px-3"
                            bordered
                            striped
                            hover
                            noBottomColumns 
                        />
                    </>
                )}
            </div>
        </AdminLayout>
    );
}

export default ListProducts;