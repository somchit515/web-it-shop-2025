// src/components/layout/CategoryRow.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import {
  FaHeart,
  FaRegHeart,
  FaShoppingCart,
  FaBolt,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

import { useGetProductsQuery } from "../redux/api/productsApi";
import { slugToKey, slugToTitle } from "../../utils/categories";
import { setcartItems } from "../redux/features/cartSlice";
import "../layout/CategoryRow.css";

const DEFAULT_IMG = "/images/default_product.png";
const SKEL_COUNT = 5;

/* ---------- ฟอร์แมตเงิน ---------- */
const formatLAK = (n) => Number(n || 0).toLocaleString("en-US");

/* ---------- ดึง URL รูป ---------- */
const resolveImg = (imgs) => {
  const first = Array.isArray(imgs) ? imgs[0] : null;
  if (!first) return DEFAULT_IMG;
  if (typeof first === "string") return first;
  return first.url || first.path || DEFAULT_IMG;
};

/* ---------- สร้าง specs string ---------- */
const buildSpecs = (p) => {
  if (p?.specs) return p.specs;
  if (p?.shortDescription) return p.shortDescription;
  if (p?.description) {
    return String(p.description).split(/[\n.]/)[0].slice(0, 80);
  }
  return "";
};

/* ============================================================
   CategoryRow
   ============================================================ */
export default function CategoryRow({
  category,
  title,
  showAllLink,
  currentId,
}) {
  const categoryKey = slugToKey(category || "");
  const rowTitle = title || slugToTitle(category) || categoryKey || "Category";
  const dispatch = useDispatch();

  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [wishlist, setWishlist] = useState({}); // id -> boolean

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
    const delta = dir === "right" ? w * 0.8 : -w * 0.8;
    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  /* ---------- load more ---------- */
  const loadMore = () => {
    setLoadingMore(true);
    setPage((p) => p + 1);
  };

  /* ---------- wishlist toggle ---------- */
  const toggleWishlist = useCallback((e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlist((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      toast.success(next[id] ? "ບັນທຶກໄປລາຍການໂປດ" : "ລົບອອກຈາກລາຍການໂປດ");
      return next;
    });
  }, []);

  /* ---------- add to cart ---------- */
  const addToCart = useCallback(
    (e, p) => {
      e.preventDefault();
      e.stopPropagation();
      if (!p) return;
      if (Number(p.stock) <= 0) {
        toast.error("ສິນຄ້າໝົດ");
        return;
      }
      const cartItem = {
        product: p._id,
        name: p.name,
        price: p.salePrice ?? p.price,
        image: resolveImg(p.images),
        stock: p.stock ?? 0,
        quantity: 1,
      };
      try {
        dispatch(setcartItems(cartItem));
        toast.success("ເພີ່ມໄປກະຕ່າແລ້ວ");
      } catch (err) {
        console.error(err);
        toast.error("ເກີດຂໍ້ຜິດພາດ");
      }
    },
    [dispatch]
  );

  /* ---------- skeleton ---------- */
  const SkeletonCard = () => (
    <div className="cr-card-skel">
      <div className="cr-skel-img" />
      <div className="cr-skel-body">
        <div className="cr-skel-line" style={{ width: "85%" }} />
        <div className="cr-skel-line" style={{ width: "60%" }} />
        <div className="cr-skel-line" style={{ width: "45%" }} />
      </div>
    </div>
  );

  /* ---------- product card ---------- */
  const ProductCard = ({ p }) => {
    const img = resolveImg(p.images);
    const oldPrice = Number(p.price || 0);
    const newPrice = Number(p.salePrice ?? p.price ?? 0);
    const savings = p.salePrice ? oldPrice - newPrice : 0;
    const specs = buildSpecs(p);
    const viewed = p.viewCount ?? p.views ?? p.numOfViews ?? 0;
    const isFav = !!wishlist[p._id];

    return (
      <div className="cr-card">
        {/* Wishlist (heart) */}
        <button
          type="button"
          className={`cr-wishlist ${isFav ? "active" : ""}`}
          aria-label="Wishlist"
          onClick={(e) => toggleWishlist(e, p._id)}
        >
          {isFav ? <FaHeart /> : <FaRegHeart />}
        </button>

        {/* Diagonal red ribbon (savings amount) */}
        {savings > 0 && (
          <div className="cr-ribbon">
            <div className="cr-ribbon-inner">
              {formatLAK(savings)} Kip
            </div>
          </div>
        )}

        <Link to={`/product/${p._id}`} className="cr-link">
          <div className="cr-img-box">
            <img
              src={img}
              alt={p.name}
              onError={(e) => (e.currentTarget.src = DEFAULT_IMG)}
              loading="lazy"
            />

            {/* Hover actions overlay */}
            <div className="cr-hover-actions">
              <button
                type="button"
                className="cr-hover-btn"
                onClick={(e) => addToCart(e, p)}
              >
                <FaBolt /> Buy now
              </button>
              <button
                type="button"
                className="cr-hover-btn"
                onClick={(e) => addToCart(e, p)}
              >
                <FaShoppingCart /> Add to cart
              </button>
            </div>
          </div>

          <div className="cr-body">
            <h5 className="cr-name">{p.name}</h5>
            {specs && <p className="cr-specs">{specs}</p>}

            <div className="cr-price-row">
              {savings > 0 && (
                <span className="cr-price-old">{formatLAK(oldPrice)}</span>
              )}
              <span className="cr-price">{formatLAK(newPrice)}</span>
              <span className="cr-price-unit">Kip</span>
            </div>

            <div className="cr-viewed">
              (Viewed: {Number(viewed).toLocaleString("en-US")} Times)
            </div>
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
        <h4 className="cr-title">
          {rowTitle} <span aria-hidden="true">💻</span>
        </h4>
        <div className="cr-actions">
          {showAllLink && (
            <Link to={showAllLink} className="cr-show-all">
              Show all →
            </Link>
          )}
        </div>
      </div>

      <div className="cr-scroller-wrap">
        <button
          type="button"
          className="cr-nav-btn cr-nav-left"
          onClick={() => scrollBy("left")}
          aria-label="Scroll left"
        >
          <FaChevronLeft />
        </button>

        <div className="cr-scroller" ref={scrollerRef}>
          {isFetching && items.length === 0
            ? Array.from({ length: SKEL_COUNT }).map((_, i) => (
                <SkeletonCard key={`skel-${i}`} />
              ))
            : items.map((p) => <ProductCard key={p._id} p={p} />)}
        </div>

        <button
          type="button"
          className="cr-nav-btn cr-nav-right"
          onClick={() => scrollBy("right")}
          aria-label="Scroll right"
        >
          <FaChevronRight />
        </button>
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