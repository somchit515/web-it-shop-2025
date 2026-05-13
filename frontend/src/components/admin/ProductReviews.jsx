import React, { useState, useEffect } from 'react';


import Loader from '../layout/Loader';
import toast from 'react-hot-toast';
import { MDBDataTable } from 'mdbreact';
import MetaData from '../layout/MetaData';
import AdminLayout from '../layout/AdminLayout';

// 💡 Import the necessary review management hooks
import {
    // ✅ FIX 1: Import the Lazy Query Hook to match the array destructuring pattern below
    useLazyGetProductReviewsQuery,
    useDeleteReviewMutation
} from '../redux/api/productsApi'; // ✅ FIX 2: Corrected import path from 'productsApi' to 'productApi'
import { confirmDialog } from './_shared/confirmDialog';

function ProductReviews() {
    // State for the Input field (used to capture user input)
    const [productId, setProductId] = useState("");
    // State to hold the fetched reviews array
    const [reviewsDataState, setReviewsDataState] = useState(null);
    const [productName, setProductName] = useState("");

    // --- RTK QUERY HOOKS ---

    // ✅ FIX 3: Use the Lazy Query Hook (useLazy...) and the correct array destructuring pattern
    const [
        getProductReviews, // Trigger function
        { data, isLoading, error, isError } // Result object
    ] = useLazyGetProductReviewsQuery();

    // 2. Delete Review Mutation
    const [
        deleteReview,
        { isLoading: isDeleteLoading, error: deleteError, isSuccess: isDeleteSuccess }
    ] = useDeleteReviewMutation();

    // --- EFFECT HOOKS ---

    // 1. Handle Fetching Reviews Data and Error
    useEffect(() => {
        if (data) {
            // Note: Assuming API returns { reviews: Array, productName: String }
            setReviewsDataState(data.reviews);
            setProductName(data.productName || 'N/A');
        }

        if (isError) {
            toast.error(error?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນรีวิว.");
            // Reset reviews state on fetch error
            setReviewsDataState(null);
            setProductName("");
        }
    }, [isError, error, data]);

    // 2. Handle Deletion Success/Error
    useEffect(() => {
        if (deleteError) {
            toast.error(deleteError?.data?.message || "ການລຶບລົ້ມເຫຼວ.");
        }

        if (isDeleteSuccess) {
            toast.success("ລຶບรีวิวສຳເລັດແລ້ວ.");
            // Refetch reviews for the current product ID to update the list
            if (productId) {
                // This call will trigger a refetch due to the 'Reviews' tag invalidation
                getProductReviews(productId);
            }
        }
    }, [isDeleteSuccess, deleteError, productId, getProductReviews]);

    // --- HANDLER FUNCTIONS ---

    const submitHandler = (e) => {
        e.preventDefault();
        if (productId) {
            // Trigger the lazy query fetch
            getProductReviews(productId);
        } else {
            setReviewsDataState(null);
            setProductName("");
            toast.error("ກະລຸນາປ້ອນລະຫັດສິນຄ້າ");
        }
    };

    const deleteReviewHandler = async (id) => {
        const ok = await confirmDialog.show({
            title: 'ລຶບຄຳຄິດເຫັນ?',
            message: 'ການກະທຳນີ້ບໍ່ສາມາດຢ້ອນກັບໄດ້',
            confirmText: 'ລຶບເລີຍ',
            variant: 'danger',
            icon: 'fa-comment-slash',
        });
        if (!ok) return;
        deleteReview({ id, productId });
    }

    // --- DATA FORMATTER ---

    const setReviewsData = () => {
        const reviews = {
            columns: [
                { label: 'Review ID', field: 'id', sort: 'asc' },
                { label: 'Rating', field: 'rating', sort: 'asc' },
                { label: 'Comment', field: 'comment', sort: 'asc' },
                { label: 'User', field: 'user', sort: 'asc' },
                { label: 'Actions', field: 'actions', sort: 'disabled' },
            ],
            rows: [],
        };

        // Ensure reviewsDataState is an array before attempting iteration
        if (Array.isArray(reviewsDataState)) {
            reviewsDataState.forEach((review) => {
                reviews.rows.push({
                    id: review?._id.substring(0, 8) + '...',
                    rating: review?.rating,
                    comment: review?.comment,
                    user: review?.user?.name,

                    actions: (
                        <div className="d-flex">
                            {/* Delete Button */}
                            <button
                                onClick={() => deleteReviewHandler(review._id)}
                                className="btn btn-outline-danger py-1 px-2"
                                disabled={isDeleteLoading}
                            >
                                {isDeleteLoading ? (
                                    <i className="fa fa-spinner fa-spin"></i>
                                ) : (
                                    <i className="fa fa-trash"></i>
                                )}
                            </button>
                        </div>
                    ),
                });
            });
        }


        return reviews;
    }

    if (isLoading) return <Loader />;

    return (
        <AdminLayout>
            <MetaData title={"Product Reviews"} />
            <div className="row justify-content-center my-5">
                <div className="col-6">
                    <form onSubmit={submitHandler}>
                        <div className="mb-3">
                            <label htmlFor="productId_field" className="form-label">
                                ກະລຸນາປ້ອນລະຫັດສິນຄ້າ
                            </label>
                            <input
                                type="text"
                                id="productId_field"
                                className="form-control"
                                value={productId}
                                // ✅ FIXED: Correct attribute name and state setter
                                onChange={(e) => setProductId(e.target.value)}
                            />
                        </div>

                        <button
                            id="search_button"
                            type="submit"
                            className="btn btn-primary w-100 py-2"
                            disabled={isLoading}
                        >
                            {isLoading ? <i className="fa fa-spinner fa-spin"></i> : 'ຄົ້ນຫາ'}
                        </button>
                    </form>
                </div>
            </div>

            <h5 className="mt-3 text-center">
                ລາຍການສຳລັບສິນຄ້າ: <b>{productName || productId}</b>
            </h5>


            {/* Conditional display for the Reviews Table */}
            {reviewsDataState && reviewsDataState.length > 0 ? (
                <>

                    <h5 class="mt-3 text-center">Product name: <b></b></h5>
                    <table class="table table-bordered table-striped mt-5">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Rating</th>
                                <th>Comment</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>

                    <MDBDataTable
                        data={setReviewsData()}
                        className="px-3"
                        bordered
                        striped
                        hover
                        noBottomColumns
                    />
                </>
            ) : reviewsDataState !== null && productId ? (
                <h5 className="mt-5 text-center text-danger">
                    ບໍ່ພົບรีวิวສຳລັບລະຫັດສິນຄ້າ: <b>{productId}</b>
                </h5>
            ) : null}


        </AdminLayout>
    )
}

export default ProductReviews;
