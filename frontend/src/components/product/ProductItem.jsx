// src/components/product/ProductItem.jsx
import React, { useMemo, useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import StarRatings from "react-star-ratings";
import PropTypes from "prop-types";
import toast from "react-hot-toast";
import { setcartItems } from "../redux/features/cartSlice"; // <-- ปรับ path ถ้าจำเป็น

const DEFAULT_IMG = "/images/default_product.png";

const formatLAK = (val) => {
  const n = Number(val ?? 0);
  try {
    return new Intl.NumberFormat("lo-LA", {
      style: "currency",
      currency: "LAK",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `₭ ${n.toLocaleString()}`;
  }
};

const resolveImg = (imgObjOrUrl) => {
  if (!imgObjOrUrl) return DEFAULT_IMG;
  if (typeof imgObjOrUrl === "string") {
    if (/^https?:\/\//i.test(imgObjOrUrl) || imgObjOrUrl.startsWith("/")) return imgObjOrUrl;
    return `/uploads/products/${imgObjOrUrl}`;
  }
  const url = imgObjOrUrl.url || imgObjOrUrl.path || "";
  if (!url) return DEFAULT_IMG;
  if (/^https?:\/\//i.test(url) || url.startsWith("/")) return url;
  return `/uploads/products/${url}`;
};

const ProductItem = ({ product, columnSize }) => {
  const dispatch = useDispatch();

  const [hover, setHover] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const imgSrc = useMemo(() => {
    if (!product) return DEFAULT_IMG;
    const first = product.images && product.images.length > 0 ? product.images[0] : null;
    return resolveImg(first) || DEFAULT_IMG;
  }, [product]);

  const handleImgError = useCallback((e) => {
    setImgError(true);
    e.currentTarget.src = DEFAULT_IMG;
  }, []);

  const handleImgLoad = useCallback(() => {
    setImgLoaded(true);
  }, []);

  const productName = product?.name || "Untitled product";
  const productId = product?._id || "";
  const inStock = Number(product?.stock) > 0;
  const salePrice = product?.salePrice ?? null;

  // inject skeleton keyframes and simple slide-in for add button once
  if (typeof document !== "undefined" && !document.getElementById("productitem-keyframes")) {
    const style = document.createElement("style");
    style.id = "productitem-keyframes";
    style.innerHTML = `
      @keyframes skeleton-shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      @keyframes slide-fade-in {
        from { transform: translateY(-6px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }

  // hover transform + shadow
  const wrapperStyle = {
    transition: "transform .18s cubic-bezier(.2,.9,.2,1), box-shadow .18s cubic-bezier(.2,.9,.2,1)",
    transform: hover ? "translateY(-6px)" : "translateY(0)",
    boxShadow: hover
      ? "0 14px 34px rgba(2,6,23,0.20), 0 8px 16px rgba(2,6,23,0.08)"
      : "0 2px 6px rgba(2,6,23,0.06), 0 1px 3px rgba(2,6,23,0.04)",
    border: "1px solid #e6eef8",
    background: "linear-gradient(180deg,#ffffff,#fbfdff)",
    willChange: "transform",
  };

  // image container reduced height to leave space for title
  const imageContainerStyle = {
    height: 180,
    background: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    borderBottom: "1px solid #f3f4f6",
    overflow: "hidden",
  };

  // skeleton styles (shimmer)
  const skeletonBase = {
    position: "absolute",
    inset: 0,
    display: imgLoaded ? "none" : "block",
    background: "linear-gradient(90deg, #eef2f6 0%, #f7fafc 50%, #eef2f6 100%)",
    backgroundSize: "200% 100%",
    animation: "skeleton-shimmer 1.2s linear infinite",
    zIndex: 2,
  };

  // Title clamp: 2 lines with ellipsis
  const titleStyle = {
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    textOverflow: "ellipsis",
    lineHeight: "1.15",
    minHeight: 42,
    color: "#0f172a",
    fontSize: 15,
    fontWeight: 700,
    marginBottom: 6,
  };

  // Add-to-cart button style (absolute top-right inside image area)
  const addBtnStyle = {
    position: "absolute",
    right: 10,
    top: 10,
    zIndex: 5,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    borderRadius: 10,
    border: "none",
    background: hover ? "#0f63ff" : "rgba(15,99,255,0.9)",
    color: "#fff",
    cursor: inStock ? "pointer" : "not-allowed",
    boxShadow: hover ? "0 6px 18px rgba(2,6,23,0.18)" : "0 4px 12px rgba(2,6,23,0.08)",
    transform: hover ? "translateY(0)" : "translateY(-6px)",
    opacity: hover ? 1 : 0,
    transition: "all .18s ease",
    animation: hover ? "slide-fade-in .18s ease" : "none",
  };

  // handler to add to cart
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation(); // prevent Link navigation

    if (!product) return;
    if (!inStock) {
      toast.error("ສິນຄ້າໝົດ");
      return;
    }

    const cartItem = {
      product: productId,
      name: productName,
      price: salePrice ?? product.price,
      image: imgSrc,
      stock: product.stock ?? 0,
      quantity: 1,
    };

    try {
      dispatch(setcartItems(cartItem));
      toast.success("ເພີ່ມໄປກະຕ່າ");
    } catch (err) {
      console.error(err);
      toast.error("ເກີດຂໍ້ຜິດພາດ");
    }
  };

  return (
    <div
      className={`col-sm-12 col-md-6 col-lg-${columnSize} my-3`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
    >
      <div
        className="card h-100 rounded overflow-hidden"
        style={wrapperStyle}
        role="group"
        aria-label={productName}
      >
        <Link
          to={`/product/${productId}`}
          className="d-block"
          aria-label={`View ${productName}`}
          title={productName}
        >
          <div style={imageContainerStyle}>
            {/* skeleton shown until image loads */}
            <div style={skeletonBase} aria-hidden="true" />

            {/* Quick add-to-cart button (top-right) */}
            <button
              type="button"
              onClick={handleAddToCart}
              aria-label={inStock ? `Add ${productName} to cart` : `${productName} out of stock`}
              title={inStock ? "ເພີ່ມໄປກະຕ່າ" : "ສິນຄ້າໝົດ"}
              style={addBtnStyle}
              disabled={!inStock}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {/* simple cart icon (SVG) */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 6h15l-1.5 9h-11L6 6z" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="10" cy="20" r="1" fill="white" />
                <circle cx="18" cy="20" r="1" fill="white" />
              </svg>
            </button>

            {/* stock/sale badge */}
            {!inStock && (
              <div
                style={{
                  position: "absolute",
                  left: 10,
                  top: 10,
                  background: "rgba(220,38,38,0.95)",
                  color: "#fff",
                  padding: "4px 8px",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 700,
                  zIndex: 4,
                }}
                aria-hidden="true"
              >
                ສິນຄ້າໝົດ
              </div>
            )}

            {salePrice && inStock && (
              <div
                style={{
                  position: "absolute",
                  left: 10,
                  top: 10,
                  background: "#0f63ff",
                  color: "#fff",
                  padding: "4px 8px",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 700,
                  zIndex: 4,
                }}
                aria-hidden="true"
              >
                ຂາຍລູກຄ້າ
              </div>
            )}

            <img
              src={imgError ? DEFAULT_IMG : imgSrc}
              alt={productName}
              loading="lazy"
              onLoad={handleImgLoad}
              onError={handleImgError}
              style={{
                width: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                zIndex: 3,
                display: "block",
              }}
            />
          </div>
        </Link>

        <div className="card-body d-flex flex-column" style={{ padding: "16px 18px" }}>
          <h6 className="card-title" style={titleStyle}>
            <Link to={`/product/${productId}`} className="text-dark text-decoration-none" title={productName}>
              {productName}
            </Link>
          </h6>

          <div className="d-flex align-items-center mb-2">
            <StarRatings
              rating={Number(product?.rating) || 0}
              starRatedColor="#ffb229"
              numberOfStars={5}
              name={`rating-${productId}`}
              starDimension="18px"
              starSpacing="1px"
            />
            <small className="text-muted ms-2">({product?.numOfReviews || 0})</small>
          </div>

          <div className="mt-auto d-flex justify-content-between align-items-center" style={{ gap: 12 }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: salePrice ? "#dc2626" : "#0b1220" }}>
              {salePrice ? (
                <span>
                  <span style={{ textDecoration: "line-through", color: "#6b7280", fontWeight: 600, marginRight: 8 }}>
                    {formatLAK(product?.price)}
                  </span>
                  <span>{formatLAK(salePrice)}</span>
                </span>
              ) : (
                formatLAK(product?.price)
              )}
            </div>

            <Link
              to={`/product/${productId}`}
              className="btn btn-sm btn-primary"
              aria-label={`Open ${productName} details`}
              style={{ fontWeight: 700, padding: "6px 12px" }}
            >
              ເບີ່ງ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

ProductItem.propTypes = {
  product: PropTypes.shape({
    _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    images: PropTypes.array,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    salePrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    rating: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    numOfReviews: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    stock: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  columnSize: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

ProductItem.defaultProps = {
  columnSize: 4,
};

export default React.memo(ProductItem);
