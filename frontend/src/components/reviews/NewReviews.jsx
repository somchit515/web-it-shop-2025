import React, { useEffect, useState } from 'react';
import MetaData from '../layout/MetaData';
import StarRatings from 'react-star-ratings'; // 💡 Import StarRatings component
import toast from 'react-hot-toast';
// 💡 Replace with your actual RTK Query path
import { useSubmitReviewMutation } from '../redux/api/productsApi';
import { useCanUserReviewQuery } from '../redux/api/productsApi'; 

// 💡 Component now receives productId as a prop
function NewReviews({ productId }) {
    
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");

    // 💡 RTK Query hook for submitting the review
    const [
        submitReview, 
        { isLoading, error, isSuccess }
    ] = useSubmitReviewMutation();

    const {data} = useCanUserReviewQuery(productId);
    const canReview = data?.canReview

    // --- Utility Function to Close Modal ---
    const closeModal = () => {
        const modalElement = document.getElementById('ratingModal');
        if (modalElement && window.bootstrap) {
            // Use Bootstrap's native method to hide the modal
            const modal = window.bootstrap.Modal.getInstance(modalElement) || new window.bootstrap.Modal(modalElement);
            modal.hide();
        }
    };

    // --- Effects for Handling Submission Feedback ---

    useEffect(() => {
        if (error) {
            // Display error message from the backend
            toast.error(error?.data?.message || "Review submission failed.");
        }
    }, [error]);

    useEffect(() => {
        if (isSuccess) {
            // Display success message
            toast.success("Review Submitted Successfully!");
            
            // Clear the form and reset state
            setRating(0);
            setComment("");

            // Close the modal upon success
            closeModal();
        }
    }, [isSuccess]);


    // --- Handlers ---

    const handleSubmit = () => {
        if (!rating || !comment || !productId) {
            toast.error("Please provide a rating and a comment.");
            return;
        }

        const reviewData = {
            rating: rating,
            comment: comment,
            productId: productId // Pass the product ID
        };

        submitReview(reviewData);
    };

    return (
        <>
            <MetaData title={'Submit Review'}/> 
            
            <div>
                {canReview &&
                <button
                    id="review_btn"
                    type="button"
                    className="btn btn-primary mt-4"
                    data-bs-toggle="modal"
                    data-bs-target="#ratingModal"
                    disabled={isLoading}
                >
                    {/* Display loading state */}
                    {isLoading ? "Submitting..." : "Submit Your Review"}
                </button>

}

                <div className="row mt-2 mb-5">
                    <div className="rating w-100"> 
                        <div
                            className="modal fade"
                            id="ratingModal"
                            tabIndex="-1" // Corrected attribute case: tabindex -> tabIndex
                            role="dialog"
                            aria-labelledby="ratingModalLabel"
                            aria-hidden="true"
                        >
                            <div className="modal-dialog" role="document">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title" id="ratingModalLabel">
                                            Submit Review
                                        </h5>
                                        <button
                                            type="button"
                                            className="btn-close"
                                            data-bs-dismiss="modal"
                                            aria-label="Close"
                                        ></button>
                                    </div>
                                    <div className="modal-body">
                                        
                                        {/* 💡 Integrated react-star-ratings for interactive rating */}
                                        <div className="d-flex justify-content-center">
                                            <StarRatings
                                                rating={rating}
                                                starRatedColor="#ffb229"
                                                numberOfStars={5}
                                                name="rating"
                                                changeRating={setRating} // Function to handle star click
                                                starDimension="30px"
                                                starSpacing="2px"
                                            />
                                        </div>
                                        {/* End Dynamic Star Rating */}

                                        <textarea
                                            name="comment"
                                            id="review"
                                            className="form-control mt-4"
                                            placeholder="Enter your comment"
                                            value={comment} // 💡 Bind state value
                                            onChange={(e) => setComment(e.target.value)} // 💡 Bind state handler
                                        ></textarea>

                                        <button
                                            id="new_review_btn"
                                            className="btn w-100 my-4 px-4 btn-warning"
                                            onClick={handleSubmit} // 💡 Handle form submission
                                            // Disable if submitting, no rating, or empty comment
                                            disabled={isLoading || rating === 0 || comment.trim().length === 0} 
                                        >
                                            {isLoading ? "Submitting..." : "Submit"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default NewReviews;