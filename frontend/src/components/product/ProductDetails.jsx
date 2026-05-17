// src/components/product/ProductDetails.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useGetProductDetailsQuery } from "../redux/api/productsApi";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import StarRatings from "react-star-ratings";
import { useDispatch } from "react-redux";
import {
  FaHome,
  FaChevronRight,
  FaShoppingCart,
  FaBoxOpen,
  FaCheckCircle,
  FaTimesCircle,
  FaPlus,
  FaMinus,
} from "react-icons/fa";

import { setcartItems } from "../redux/features/cartSlice";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";
import NewReviews from "../reviews/NewReviews";
import ListReviews from "../reviews/ListReviews";
import RelatedProductsSlider from "./RelatedProductsSlider";

import "../Home.css"; // ใช้ theme เดียวกัน

function ProductDetails() {
  const params = useParams();
  const dispatch = useDispatch();

  const [quantity, setQuantity] = useState(1);
  const [activeImg, setActiveImg] = useState("/images/default_product.png");

  const { data, isLoading, error, isError, refetch } = useGetProductDetailsQuery(
    params?.id
  );
  const product = useMemo(() => data?.product || null, [data]);

  const formatLAK = useCallback((val) => {
    const n = Number(val ?? 0);
    return `₭ ${n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }, []);

  const resolveImg = useCallback((imgObjOrUrl) => {
    if (!imgObjOrUrl) return "/images/default_product.png";
    const url =
      typeof imgObjOrUrl === "string"
        ? imgObjOrUrl
        : imgObjOrUrl.url || imgObjOrUrl.path || "";
    if (!url) return "/images/default_product.png";
    if (/^https?:\/\//i.test(url) || url.startsWith("/")) return url;
    return `/uploads/products/${url}`;
  }, []);

  const handleImgError = (e) => {
    e.currentTarget.src = "/images/default_product.png";
  };

  useEffect(() => {
    if (product) {
      const first =
        product.images && product.images.length > 0
          ? resolveImg(product.images[0])
          : "/images/default_product.png";
      setActiveImg(first);
      setQuantity(1);
    }
  }, [product, resolveImg]);

  useEffect(() => {
    if (isError) {
      toast.error(
        error?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການໂຫລດຂໍ້ມູນ"
      );
    }
  }, [isError, error]);

  const increaseQty = useCallback(() => {
    if (!product) return;
    const stock = Number(product.stock) || 0;
    setQuantity((q) => {
      if (q >= stock) {
        toast.error("ເພີ່ມບໍ່ໄດ້: ສິນຄ້າໝົດ");
        return q;
      }
      return q + 1;
    });
  }, [product]);

  const decreaseQty = useCallback(() => {
    setQuantity((q) => (q > 1 ? q - 1 : 1));
  }, []);

  const onQtyChange = useCallback(
    (e) => {
      const v = Number(e.target.value) || 1;
      const stock = Number(product?.stock) || 0;
      if (v < 1) return setQuantity(1);
      if (stock && v > stock) return setQuantity(stock);
      setQuantity(v);
    },
    [product]
  );

  const setItemToCart = useCallback(() => {
    if (!product) {
      toast.error("ຂໍ້ມູນສິນຄ້າບໍ່ພ້ອມ");
      return;
    }
    const cartItem = {
      product: product._id,
      name: product.name,
      price: product.price,
      image: resolveImg((product.images && product.images[0]) || null),
      stock: Number(product.stock) || 0,
      quantity,
    };
    dispatch(setcartItems(cartItem));
    toast.success("ເພີ່ມໄປກະຕ່າສຳເລັດ");
  }, [dispatch, product, quantity, resolveImg]);

  if (isLoading) return <Loader />;

  if (!product) {
    return (
      <>
        <MetaData title="Product" />
        <div className="home-wrapper pt-4 pb-5">
          <span className="home-side-accent left" aria-hidden="true" />
          <span className="home-side-accent right" aria-hidden="true" />
          <div className="empty-state">
            <div className="empty-state-icon">
              <FaBoxOpen />
            </div>
            <h4>ບໍ່ພົບສິນຄ້າ</h4>
            <p>ກະລຸນາກວດເບິ່ງລິ້ງກັບ ຫຼື ກັບໄປໜ້າຫຼັກ</p>
            <Link to="/" className="btn-warm mt-3 text-decoration-none">
              ກັບໄປໜ້າຫຼັກ
            </Link>
          </div>
        </div>
      </>
    );
  }

  const stockNumber = Number(product.stock) || 0;
  const inStock = stockNumber > 0;

  return (
    <>
      <MetaData
        title={product?.name || "Product"}
        description={String(product?.description || "").slice(0, 160)}
      />

      <div className="home-wrapper pb-5 pt-4">
        {/* Decorative side accents */}
        <span className="home-side-accent left" aria-hidden="true" />
        <span className="home-side-accent right" aria-hidden="true" />

        {/* ===== Breadcrumb ===== */}
        <nav aria-label="breadcrumb" className="cat-breadcrumb">
          <Link to="/" className="cat-breadcrumb-item">
            <FaHome /> Home
          </Link>
          <FaChevronRight className="cat-breadcrumb-sep" />
          {product?.category && (
            <>
              <Link
                to={`/category/${product.category}`}
                className="cat-breadcrumb-item"
              >
                {product.category}
              </Link>
              <FaChevronRight className="cat-breadcrumb-sep" />
            </>
          )}
          <span className="cat-breadcrumb-item active">
            {product?.name?.slice(0, 40) || "Product"}
            {product?.name?.length > 40 && "…"}
          </span>
        </nav>

        {/* ===== Main Product Card ===== */}
        <div className="pd-card">
          <div className="row g-4">
            {/* === LEFT: Image gallery === */}
            <div className="col-12 col-lg-6">
              <div className="pd-img-main">
                <img
                  src={activeImg}
                  alt={product?.name ? `${product.name}` : "Product image"}
                  loading="lazy"
                  onError={handleImgError}
                />
              </div>

              {/* Thumbnails */}
              <div className="pd-thumbs">
                {(product?.images?.length
                  ? product.images
                  : [{ url: activeImg }]
                ).map((img, idx) => {
                  const url = resolveImg(img);
                  const isActive = url === activeImg;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImg(url)}
                      className={`pd-thumb ${isActive ? "active" : ""}`}
                      aria-label={`Image ${idx + 1}`}
                      aria-pressed={isActive}
                    >
                      <img
                        src={url}
                        alt={`thumb ${idx + 1}`}
                        loading="lazy"
                        onError={handleImgError}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* === RIGHT: Product info === */}
            <div className="col-12 col-lg-6">
              <h1 className="pd-title">{product?.name}</h1>
              <p className="pd-sku">
                ລະຫັດສິນຄ້າ: <span>{product?._id}</span>
              </p>

              <div className="pd-rating">
                <StarRatings
                  rating={Number(product?.rating) || 0}
                  starRatedColor="#fbbf24"
                  numberOfStars={5}
                  name="rating"
                  starDimension="20px"
                  starSpacing="2px"
                />
                <span className="pd-rating-count">
                  ({Number(product?.numOfReviews || 0)} ຄຳຕິຊົມ)
                </span>
              </div>

              <div className="pd-price-box">
                <div className="pd-price">{formatLAK(product?.price)}</div>
                <div className={`pd-stock ${inStock ? "in" : "out"}`}>
                  {inStock ? <FaCheckCircle /> : <FaTimesCircle />}
                  {inStock
                    ? `ມີສິນຄ້າ (${stockNumber} ຊິ້ນ)`
                    : "ສິນຄ້າໝົດ"}
                </div>
              </div>

              {/* Quantity + Add to cart */}
              <div className="pd-actions">
                <div className="pd-qty">
                  <button
                    type="button"
                    onClick={decreaseQty}
                    disabled={quantity <= 1}
                    aria-label="Decrease"
                  >
                    <FaMinus />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    min="1"
                    max={stockNumber}
                    onChange={onQtyChange}
                    aria-label="Quantity"
                  />
                  <button
                    type="button"
                    onClick={increaseQty}
                    disabled={!inStock || quantity >= stockNumber}
                    aria-label="Increase"
                  >
                    <FaPlus />
                  </button>
                </div>

                <button
                  type="button"
                  className="btn-warm pd-cart-btn"
                  disabled={!inStock}
                  onClick={setItemToCart}
                >
                  <FaShoppingCart /> ເພີ່ມໄປກະຕ່າ
                </button>
              </div>

              <div className="pd-meta">
                <span>ຂາຍໂດຍ:</span>
                <strong>{product?.seller || "—"}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Description Card ===== */}
        <div className="pd-card pd-desc-card">
          <h3 className="section-title">ລາຍລະອຽດສິນຄ້າ</h3>
          <p className="pd-desc">{product?.description || "-"}</p>
        </div>

        {/* ===== Reviews Card ===== */}
        <div className="pd-card">
          <h3 className="section-title">ຄຳຕິຊົມ</h3>

          <NewReviews productId={product?._id} onSuccess={refetch} />

          {product?.reviews?.length > 0 && (
            <div className="mt-4">
              <ListReviews reviews={product.reviews} />
            </div>
          )}
        </div>

        {/* ===== Related Products ===== */}
        <RelatedProductsSlider
          category={product?.category}
          currentId={product?._id}
        />
      </div>
    </>
  );
}

export default ProductDetails;
