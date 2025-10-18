import React from 'react'
import StarRatings from "react-star-ratings";

function ListReviews({ reviews }) {
    // If there are no reviews, we might want to show a message
    if (!reviews || reviews.length === 0) {
        return (
            <div className="reviews w-75 mt-5">
                <h3 className="mb-3">ຄວາມຄິດເຫັນອື່ນໆ:</h3> {/* Other Reviews */}
                <p>No reviews yet.</p>
            </div>
        );
    }

    return (
        <>
            {/* Increased top margin (mt-5) is good for separation */}
            <div className="reviews w-75 mt-5">
                <h3 className="mb-3">ຄວາມຄິດເຫັນອື່ນໆ:</h3> {/* Other Reviews */}
                <hr />

                {reviews.map((review) => (
                    <div key={review._id} className="review-card py-3"> {/* Added py-3 for vertical padding */}
                        <div className="row">
                            {/* Avatar column: Used col-auto to keep it small, added me-3 for right margin */}
                            <div className="col-auto me-3">
                                <img
                                    // Dynamically set the avatar URL or use a default
                                    src={
                                        review?.user?.avatar?.url
                                            ? review.user.avatar.url
                                            : "../images/default_avatar.jpg"
                                    }
                                    alt={review.user?.name || "User"}
                                    width="50"
                                    height="50"
                                    className="rounded-circle"
                                />
                            </div>

                            {/* Content column: Used col to take remaining space */}
                            <div className="col">
                                <div className="star-ratings mb-1"> {/* Added mb-1 for margin below stars */}
                                    <StarRatings
                                        rating={review.rating || 0}
                                        starRatedColor="#ffb229"
                                        numberOfStars={5}
                                        name="rating"
                                        starDimension="18px"
                                        starSpacing="1px"
                                    />
                                </div>

                                {/* Displaying user name from the nested 'user' object */}
                                <p className="review_user mb-1">
                                    ໂດຍ: <strong>{review.user?.name}</strong>
                                </p>
                                {/* Displaying the review comment */}
                                <p className="review_comment mb-0">{review.comment}</p>
                            </div>
                        </div>

                        <hr className="mt-3" /> {/* Added margin to the separator */}
                    </div>
                ))}
            </div>
        </>
    );
}

export default ListReviews;