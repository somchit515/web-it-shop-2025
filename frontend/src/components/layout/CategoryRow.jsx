// src/components/layout/CategoryRow.jsx
import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useGetProductsQuery } from "../redux/api/productsApi";
import { slugToKey, slugToTitle } from "../../utils/categories";
import toast from "react-hot-toast";
import "../layout/CategoryRow.css";

const DEFAULT_IMG = "/images/default_product.png";
const SKEL_COUNT = 5; // จำนวน skeleton ที่แสดงขณะโหลด

/* ---------- ฟอร์แมตเงิน ---------- */
const formatLAK = (n) =>
  new Intl.NumberFormat("lo-LA", {
    style: "currency",
    currency: "LAK",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));

/* ---------- แถวสินค้าตามหมวดหมู่ ---------- */
export default function CategoryRow({ category, title, showAllLink, currentId }) {
  const categoryKey = slugToKey(category || "");
  const rowTitle = title || slugToTitle(category) || categoryKey || "Category";

  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);

  const { data, isFetching, error } = useGetProductsQuery(
    { category: categoryKey, page },
    { skip: !categoryKey }
  );

  /* ---------- error ---------- */
  useEffect(() => {
    if (error)
      toast.error(
        error?.data?.message || error?.message || "Failed to load category"
      );
  }, [error]);

  /* ---------- เติมสินค้า ---------- */
  useEffect(() => {
    if (!data?.products) return;
    const filtered = data.products.filter((p) => p._id !== currentId);
    setItems((prev) => (page === 1 ? filtered : [...prev, ...filtered]));
    setLoadingMore(false);
  }, [data, currentId, page]);

  /* ---------- รีเซ็ตเมื่อเปลี่ยนหมวด ---------- */
  useEffect(() => {
    setPage(1);
    setItems([]);
    setLoadingMore(false);
  }, [categoryKey]);

  /* ---------- scroll ---------- */
  const scrollerRef = useRef(null);
  const scrollBy = (dir = "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    const w = el.clientWidth;
    const delta = dir === "right" ? w * 0.7 : -w * 0.7;
    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  /* ---------- load more ---------- */
  const loadMore = () => {
    setLoadingMore(true);
    setPage((p) => p + 1);
  };

  /* ---------- skeleton card ---------- */
  const SkeletonCard = () => (
    <div className="cr-card-skel">
      <div className="cr-skel-img" />
      <div className="cr-skel-body">
        <div className="cr-skel-line" style={{ width: "70%" }} />
        <div className="cr-skel-line" style={{ width: "40%" }} />
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
      <div className="cr-card">
        <Link to={`/product/${p._id}`} className="cr-link">
          <div className="cr-img-box">
            <img
              src={img}
              alt={p.name}
              onError={(e) => (e.currentTarget.src = DEFAULT_IMG)}
              loading="lazy"
            />
          </div>
          <div className="cr-body">
            <h5 className="cr-name">{p.name}</h5>
            <div className="cr-price">{formatLAK(p.price)}</div>
          </div>
        </Link>
      </div>
    );
  };

  /* ---------- render ---------- */
  if (!categoryKey) return null;
  if (!isFetching && items.length === 0) return null;

  return (
    <section className="cat-row">
      <div className="cr-head">
        <h4 className="cr-title">{rowTitle}</h4>
        <div className="cr-actions">
          {showAllLink && (
            <Link to={showAllLink} className="cr-show-all">
              Show all →
            </Link>
          )}
          <button onClick={() => scrollBy("left")} aria-label="Scroll left">
            ‹
          </button>
          <button onClick={() => scrollBy("right")} aria-label="Scroll right">
            ›
          </button>
        </div>
      </div>

      <div className="cr-scroller" ref={scrollerRef}>
        {isFetching && items.length === 0
          ? Array.from({ length: SKEL_COUNT }).map((_, i) => (
              <SkeletonCard key={`skel-${i}`} />
            ))
          : items.map((p) => <ProductCard key={p._id} p={p} />)}
      </div>

      {data?.products?.length > 0 && (
        <div className="cr-more">
          <button onClick={loadMore} disabled={loadingMore || isFetching}>
            {loadingMore ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </section>
  );
}