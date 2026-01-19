// src/components/product/RelatedProductsSlider.jsx
import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useGetProductsQuery } from "../redux/api/productsApi";
import { useDispatch } from "react-redux";
import { setcartItems } from "../redux/features/cartSlice";
import StarRatings from "react-star-ratings";
import toast from "react-hot-toast";

import "./RelatedProductsSlider.css";
const DEFAULT_IMG = "/images/default_product.png";
const SKEL_COUNT = 4;           // จำนวน skeleton ที่แสดงขณะโหลด

/* ---------- ฟอร์แมตเงิน ---------- */
const formatLAK = (n) =>
  new Intl.NumberFormat("lo-LA", {
    style: "currency",
    currency: "LAK",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));

/* ---------- แถวสินค้าที่เกี่ยวข้อง ---------- */
export default function RelatedProductsSlider({ category, currentId }) {
  const dispatch = useDispatch();
  const scrollerRef = useRef(null);

  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [paused, setPaused] = useState(false);

  const { data, isFetching, error } = useGetProductsQuery(
    { category, page },
    { skip: !category }
  );

  const perPage = data?.resPerPage || 0;
  const fetchedCount = data?.products?.length || 0;
  const hasMore = fetchedCount >= perPage && perPage > 0;

  /* ---------- error ---------- */
  useEffect(() => {
    if (error)
      toast.error(
        error?.data?.message || error?.message || "Failed to load related products"
      );
  }, [error]);

  /* ---------- รีเซ็ตเมื่อเปลี่ยนหมวด ---------- */
  useEffect(() => {
    setPage(1);
    setItems([]);
    setLoadingMore(false);
  }, [category, currentId]);

  /* ---------- เติมสินค้า ---------- */
  useEffect(() => {
    if (!data?.products) return;
    const filtered = data.products.filter((p) => p._id !== currentId);
    setItems((prev) => (page === 1 ? filtered : [...prev, ...filtered]));
    setLoadingMore(false);
  }, [data, currentId, page]);

  /* ---------- scroll ---------- */
  const scrollBy = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    const delta = Math.round(el.clientWidth * 0.75);
    el.scrollBy({ left: dir === "right" ? delta : -delta, behavior: "smooth" });
  };

  /* ---------- quick add to cart ---------- */
  const quickAdd = (p) => {
    if (Number(p.stock || 0) <= 0) return toast.error("ສິນຄ້າໝົດ");
    dispatch(
      setcartItems({
        product: p._id,
        name: p.name,
        price: p.price,
        image:
          typeof p.images?.[0] === "string"
            ? p.images[0]
            : p.images?.[0]?.url || DEFAULT_IMG,
        stock: Number(p.stock),
        quantity: 1,
      })
    );
    toast.success("ເພີ່ມໄປກະຕ່າ");
  };

  /* ---------- load more ---------- */
  const loadMore = () => {
    setLoadingMore(true);
    setPage((p) => p + 1);
  };

  /* ---------- skeleton card ---------- */
  const SkeletonCard = () => (
    <div className="rps-card-skel">
      <div className="rps-skel-img" />
      <div className="rps-skel-body">
        <div className="rps-skel-line" style={{ width: "70%" }} />
        <div className="rps-skel-line" style={{ width: "40%" }} />
        <div className="rps-skel-line" style={{ width: "50%", marginTop: 8 }} />
      </div>
    </div>
  );

  /* ---------- real card ---------- */
  const ProductCard = ({ p }) => {
    const img =
      typeof p.images?.[0] === "string"
        ? p.images[0]
        : p.images?.[0]?.url || DEFAULT_IMG;

    return (
      <div className="rps-card">
        <div className="rps-img-box">
          <Link to={`/product/${p._id}`} className="rps-link">
            <img
              src={img}
              alt={p.name}
              onError={(e) => (e.currentTarget.src = DEFAULT_IMG)}
              loading="lazy"
            />
          </Link>
          <button
            className={`rps-quick ${p.stock > 0 ? "" : "disabled"}`}
            onClick={() => quickAdd(p)}
            disabled={p.stock <= 0}
            title={p.stock > 0 ? "ເພີ່ມໄປກະຕ່າ" : "ສິນຄ້າໝົດ"}
          >
            🛒
          </button>
        </div>

        <div className="rps-body">
          <Link to={`/product/${p._id}`} className="rps-name">
            {p.name}
          </Link>

          <div className="rps-rate">
            <StarRatings
              rating={Number(p.rating) || 0}
              starRatedColor="#ffb229"
              numberOfStars={5}
              starDimension="14px"
              starSpacing="1px"
            />
            <span className="rps-rev">({p.numOfReviews || 0})</span>
          </div>

          <div className="rps-foot">
            <span className="rps-price">{formatLAK(p.price)}</span>
            <Link to={`/product/${p._id}`} className="rps-btn">
              ดู
            </Link>
          </div>
        </div>
      </div>
    );
  };

  /* ---------- render ---------- */
  if (!category) return null;
  if (!isFetching && items.length === 0) return null;

  return (
    <div className="rps-wrap">
      <div className="rps-head">
        <h4 className="rps-title">ສິນຄ້າທີ່ຄ້າຍຄືກັນ</h4>

        <div className="rps-arrows">
          <button onClick={() => scrollBy("left")} aria-label="Scroll left">
            ‹
          </button>
          <button onClick={() => scrollBy("right")} aria-label="Scroll right">
            ›
          </button>
        </div>
      </div>

      <div className="rps-scroller" ref={scrollerRef}>
        {isFetching && items.length === 0
          ? Array.from({ length: SKEL_COUNT }).map((_, i) => <SkeletonCard key={`skel-${i}`} />)
          : items.map((p) => <ProductCard key={p._id} p={p} />)}
      </div>

      {hasMore && (
        <div className="rps-more">
          <button onClick={loadMore} disabled={loadingMore || isFetching}>
            {loadingMore ? "กำลังโหลด..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}