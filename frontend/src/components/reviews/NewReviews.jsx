import React, { useEffect, useRef, useState } from 'react';
import MetaData from '../layout/MetaData';
import StarRatings from 'react-star-ratings';
import toast from 'react-hot-toast';
import PropTypes from 'prop-types';

// RTK Query hooks (ปรับ path ให้ตรงกับโปรเจคของคุณ)
import { useSubmitReviewMutation, useCanUserReviewQuery } from '../redux/api/productsApi';

function NewReviews({ productId, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const [
    submitReview,
    { isLoading: isSubmitting, error: submitError, isSuccess: submitSuccess }
  ] = useSubmitReviewMutation();

  const { data: canReviewData, isLoading: checking } = useCanUserReviewQuery(productId, {
    skip: !productId
  });
  const canReview = !!canReviewData?.canReview;

  // ref ไปที่ modal element เพื่อจัดการ hide ด้วย bootstrap instance (ถ้ามี)
  const modalRef = useRef(null);

  // ปิด modal โดยใช้ Bootstrap modal instance หากมี
  const closeModal = () => {
    const el = modalRef.current;
    if (!el) return;
    // ถ้ามี Bootstrap v5 loaded ใน window
    if (window.bootstrap && window.bootstrap.Modal) {
      const modalInstance =
        window.bootstrap.Modal.getInstance(el) || new window.bootstrap.Modal(el);
      modalInstance.hide();
    } else {
      // fallback: manual hide
      el.classList.remove('show');
      el.style.display = 'none';
      document.body.classList.remove('modal-open');
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) backdrop.remove();
    }
  };

  // เมื่อเกิด error จากการ submit ให้แสดง toast
  useEffect(() => {
    if (submitError) {
      toast.error(submitError?.data?.message || 'ການສົ່ງຄຳຄິດເຫັນຜິດພາດ');
    }
  }, [submitError]);

  // เมื่อ submit สำเร็จ ให้รีเซ็ต state, ปิด modal, แจ้ง parent ถ้ามี
  useEffect(() => {
    if (submitSuccess) {
      toast.success('ສົ່ງຄຳຄິດເຫັນສຳເລັດ');
      setRating(0);
      setComment('');
      closeModal();
      if (typeof onSuccess === 'function') onSuccess();
    }
  }, [submitSuccess, onSuccess]);

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!productId) {
      toast.error('ຜິດພາດ: productId ຍັງບໍ່ມີ');
      return;
    }
    if (!rating || rating <= 0) {
      toast.error('ກະລຸນາເລືອກຄະແນນ');
      return;
    }
    if (!comment || comment.trim().length < 3) {
      toast.error('ຄຳຄິດເຫັນຕ້ອງຢาวພໍ');
      return;
    }

    // เรียก RTK mutation
    try {
      await submitReview({ productId, rating, comment }).unwrap();
      // success handled by isSuccess effect
    } catch (err) {
      // error already surfaced by submitError effect, แต่จับเพิ่มเผื่อไม่ถูกแสดง
      console.error('submitReview err', err);
    }
  };

  return (
    <>
      <MetaData title={'ສົ່ງຄຳຄິດເຫັນ'} />

      {/* ถ้า backend กำลังเช็คว่า user review ได้ไหม ให้แสดง placeholder */}
      {checking ? (
        <div className="mt-3"><button className="btn btn-outline-secondary" disabled>ກຳລັງກວດສອບ...</button></div>
      ) : (
        <>
          {canReview ? (
            <button
              id="review_btn"
              type="button"
              className="btn btn-primary mt-3"
              data-bs-toggle="modal"
              data-bs-target="#ratingModal"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'ກຳລັງສົ່ງ...' : 'ສົ່ງຄຳຄິດເຫັນ'}
            </button>
          ) : (
            <div className="mt-3">
              <button className="btn btn-outline-secondary" disabled>ທ່ານບໍ່ສາມາດສົ່ງຄຳຄິດເຫັນໄດ້</button>
              <div className="text-muted small mt-1">(ສັ່ງຊື້ແລ້ວເທົ່ານັ້ນຈະສົ່ງຄຳຄິດເຫັນໄດ້)</div>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      <div
        className="modal fade"
        id="ratingModal"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="ratingModalLabel"
        aria-hidden="true"
        ref={modalRef}
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <form className="modal-content" onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title" id="ratingModalLabel">ສົ່ງຄຳຄິດເຫັນ</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
            </div>

            <div className="modal-body">
              <div className="d-flex justify-content-center mb-3">
                <StarRatings
                  rating={rating}
                  starRatedColor="#ffb229"
                  numberOfStars={5}
                  name="rating"
                  changeRating={(val) => setRating(val)}
                  starDimension="30px"
                  starSpacing="4px"
                />
              </div>

              <div className="mb-3">
                <label htmlFor="review_comment" className="form-label">ຄຳຄິດເຫັນ</label>
                <textarea
                  id="review_comment"
                  className="form-control"
                  placeholder="ໃສ່ຂໍ້ຄວາມຂອງທ່ານ"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  required
                />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">ປິດ</button>
              <button
                id="new_review_btn"
                type="submit"
                className="btn btn-warning"
                disabled={isSubmitting || rating === 0 || comment.trim().length === 0}
              >
                {isSubmitting ? 'ກຳລັງສົ່ງ...' : 'ສົ່ງ'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

NewReviews.propTypes = {
  productId: PropTypes.string.isRequired,
  onSuccess: PropTypes.func
};

export default NewReviews;
