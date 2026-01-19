import React from 'react';
import StarRatings from "react-star-ratings";

function ListReviews({ reviews }) {
    if (!reviews || reviews.length === 0) {
        return (
            <div className="reviews w-75 mt-5">
                <h3 className="mb-3">ຄວາມຄິດເຫັນອື່ນໆ:</h3>
                <p className="text-muted">ຍັງບໍ່ມີຄວາມຄິດເຫັນ</p>
            </div>
        );
    }

    return (
        <>
            <style>{`
                .review-card {
                  background: rgba(255,255,255,0.06);
                  border-radius: 12px;
                  padding: 16px 18px;
                  margin-bottom: 18px;
                  backdrop-filter: blur(6px);
                  border: 1px solid rgba(255,255,255,0.08);
                  transition: all .15s ease;
                }
                .review-card:hover {
                  transform: translateY(-2px);
                  box-shadow: 0 10px 20px rgba(0,0,0,0.15);
                }
                .review_user {
                  font-size: 0.95rem;
                  color: #c69a3d;
                }
                .review_comment {
                  font-size: 0.95rem;
                  color: #e6eef7;
                }
                .review-date {
                  font-size: 0.8rem;
                  color: #9aa6b2;
                }
            `}</style>

            <div className="reviews w-75 mt-5">
                <h3 className="mb-3">ຄວາມຄິດເຫັນອື່ນໆ:</h3>
                <hr />

                {reviews.map((review) => (
                    <div key={review._id} className="review-card">
                        <div className="row align-items-center">
                            
                            {/* Avatar */}
                            <div className="col-auto">
                                <img
                                    src={
                                        review?.user?.avatar?.url
                                            ? review.user.avatar.url
                                            : "/images/default_avatar.png"
                                    }
                                    alt={review.user?.name || "User"}
                                    width="55"
                                    height="55"
                                    className="rounded-circle shadow-sm"
                                    style={{ objectFit: "cover" }}
                                />
                            </div>

                            {/* Content */}
                            <div className="col">
                                <StarRatings
                                    rating={review.rating || 0}
                                    starRatedColor="#ffb229"
                                    numberOfStars={5}
                                    name="rating"
                                    starDimension="18px"
                                    starSpacing="1px"
                                />

                                <p className="review_user mt-1 mb-1">
                                    ໂດຍ: <strong>{review.user?.name}</strong>
                                </p>

                                <p className="review_comment mb-1">{review.comment}</p>

                                {/* DATE if exists */}
                                {review.createdAt && (
                                    <p className="review-date">
                                        {new Date(review.createdAt).toLocaleDateString("lo-LA", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric"
                                        })}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}

export default ListReviews;
