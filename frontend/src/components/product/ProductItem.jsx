import React, { useMemo, useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import StarRatings from "react-star-ratings";
import PropTypes from "prop-types";
import toast from "react-hot-toast";
import { setcartItems } from "../redux/features/cartSlice";

/* ─── helpers ─────────────────────────────────────────────── */
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
    return `₭${n.toLocaleString()}`;
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

/* ─── CSS ─────────────────────────────────────────────────── */
if (typeof document !== "undefined" && !document.getElementById("pi-styles")) {
  const s = document.createElement("style");
  s.id = "pi-styles";
  s.innerHTML = `
@keyframes pi-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
@keyframes pi-pop {
  0%   { transform: scale(.85); opacity: 0; }
  100% { transform: scale(1);   opacity: 1; }
}

/* ── Card Shell ── */
.pi-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #eef0f6;
  overflow: hidden;
  transition: transform .22s cubic-bezier(.2,.9,.2,1),
              box-shadow .22s, border-color .22s;
  display: flex;
  flex-direction: column;
  height: 100%;
  cursor: pointer;
}
.pi-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 48px rgba(15,23,42,.10), 0 4px 12px rgba(15,23,42,.05);
  border-color: #ddd6fe;
}

/* ── Image Area ── */
.pi-img-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 4.2;
  background: #f6f7fb;
  overflow: hidden;
  flex-shrink: 0;
}
.pi-img {
  width: 100%; height: 100%;
  object-fit: contain;
  padding: 14px;
  transition: transform .38s cubic-bezier(.2,.9,.2,1);
}
.pi-card:hover .pi-img { transform: scale(1.08); }

/* skeleton */
.pi-skeleton {
  position: absolute; inset: 0;
  background: linear-gradient(90deg,#eef2f6 0%,#f7fafc 50%,#eef2f6 100%);
  background-size: 200% 100%;
  animation: pi-shimmer 1.3s linear infinite;
  z-index: 2;
}

/* hover overlay */
.pi-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top,
    rgba(15,23,42,.6) 0%,
    rgba(15,23,42,.1) 50%,
    transparent 100%);
  opacity: 0;
  transition: opacity .25s;
  z-index: 3;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 16px;
}
.pi-card:hover .pi-overlay { opacity: 1; }

.pi-overlay-btn {
  background: rgba(255,255,255,.95);
  color: #4f46e5;
  border: none;
  border-radius: 999px;
  padding: 7px 20px;
  font-size: .75rem;
  font-weight: 800;
  cursor: pointer;
  transform: translateY(10px);
  transition: transform .22s, background .18s, color .18s;
  letter-spacing: .02em;
}
.pi-card:hover .pi-overlay-btn { transform: translateY(0); }
.pi-overlay-btn:hover { background: #4f46e5; color: #fff; }

/* ── Badges ── */
.pi-badge {
  position: absolute;
  top: 10px; left: 10px;
  z-index: 4;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: .65rem;
  font-weight: 800;
  letter-spacing: .03em;
  animation: pi-pop .2s ease;
}
.pi-badge.sold-out {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}
.pi-badge.sale {
  background: linear-gradient(135deg,#f43f5e,#e11d48);
  color: #fff;
  box-shadow: 0 2px 8px rgba(244,63,94,.35);
}

/* ── Quick Cart ── */
.pi-quick-cart {
  position: absolute;
  top: 10px; right: 10px;
  z-index: 4;
  width: 34px; height: 34px;
  border-radius: 50%;
  background: #fff;
  border: none;
  box-shadow: 0 2px 10px rgba(0,0,0,.14);
  display: flex; align-items: center; justify-content: center;
  font-size: .88rem;
  cursor: pointer;
  opacity: 0;
  transform: scale(.6) rotate(-20deg);
  transition: opacity .2s, transform .22s cubic-bezier(.2,.9,.2,1), background .15s;
}
.pi-card:hover .pi-quick-cart {
  opacity: 1;
  transform: scale(1) rotate(0deg);
}
.pi-quick-cart:hover { background: #4f46e5; }
.pi-quick-cart:disabled { opacity: .35 !important; cursor: not-allowed; }

/* ── Body ── */
.pi-body {
  padding: 22px 18px 26px;
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 8px;
}

/* ── Name: 2-line clamp ── */
.pi-name {
  font-size: .83rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: calc(2 * 1.4 * 0.83rem);
  text-decoration: none;
  transition: color .15s;
}
.pi-name:hover { color: #4f46e5; }

/* ── Rating ── */
.pi-rating {
  display: flex;
  align-items: center;
  gap: 5px;
}
.pi-review-count {
  font-size: .67rem;
  color: #94a3b8;
}

/* ── Footer ── */
.pi-footer {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid #f1f5f9;
}

/* ── Price ── */
.pi-price { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.pi-price-main {
  font-size: .92rem;
  font-weight: 900;
  color: #e11d48;
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pi-price-main.no-sale { color: #1e293b; }
.pi-price-original {
  font-size: .68rem;
  color: #cbd5e1;
  text-decoration: line-through;
  line-height: 1;
}

/* ── View Button ── */
.pi-btn-view {
  flex-shrink: 0;
  background: #f1f0fe;
  color: #4f46e5;
  border: none;
  border-radius: 10px;
  padding: 7px 13px;
  font-size: .72rem;
  font-weight: 800;
  text-decoration: none;
  white-space: nowrap;
  transition: background .16s, color .16s, box-shadow .16s, transform .16s;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  letter-spacing: .01em;
}
.pi-btn-view:hover {
  background: #4f46e5;
  color: #fff;
  box-shadow: 0 4px 14px rgba(79,70,229,.3);
  transform: translateY(-1px);
}
`;
  document.head.appendChild(s);
}

/* ─── Component ───────────────────────────────────────────── */
const ProductItem = ({ product, columnSize }) => {
  const dispatch = useDispatch();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError]   = useState(false);

  const imgSrc = useMemo(() => {
    if (!product) return DEFAULT_IMG;
    const first = product.images?.length > 0 ? product.images[0] : null;
    return resolveImg(first) || DEFAULT_IMG;
  }, [product]);

  const handleImgError = useCallback((e) => {
    setImgError(true);
    e.currentTarget.src = DEFAULT_IMG;
  }, []);

  const productName = product?.name || "Untitled";
  const productId   = product?._id || "";
  const inStock     = Number(product?.stock) > 0;
  const salePrice   = product?.salePrice ?? null;
  const discountPct = salePrice && product?.price
    ? Math.round((1 - salePrice / product.price) * 100) : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return toast.error("ສິນຄ້າໝົດ");
    dispatch(setcartItems({
      product: productId,
      name: productName,
      price: salePrice ?? product.price,
      image: imgSrc,
      stock: product.stock ?? 0,
      quantity: 1,
    }));
    toast.success("ເພີ່ມໄປກະຕ່າ 🛒");
  };

  const colClass = columnSize === "auto"
    ? ""
    : `col-sm-6 col-md-4 col-lg-${columnSize} my-2`;

  return (
    <div className={colClass} style={columnSize === "auto" ? {} : { display: "flex" }}>
      <div className="pi-card" style={{ width: "100%" }}>

        {/* image */}
        <Link to={`/product/${productId}`} className="d-block" tabIndex={-1}>
          <div className="pi-img-wrap">
            {!imgLoaded && !imgError && <div className="pi-skeleton" aria-hidden="true" />}

            {!inStock && <span className="pi-badge sold-out">ໝົດ</span>}
            {salePrice && inStock && discountPct > 0 && (
              <span className="pi-badge sale">-{discountPct}%</span>
            )}

            <button
              type="button"
              className="pi-quick-cart"
              onClick={handleAddToCart}
              disabled={!inStock}
              title={inStock ? "ເພີ່ມໄປກະຕ່າ" : "ສິນຄ້າໝົດ"}
            >🛒</button>

            <img
              src={imgError ? DEFAULT_IMG : imgSrc}
              alt={productName}
              loading="lazy"
              className="pi-img"
              onLoad={() => setImgLoaded(true)}
              onError={handleImgError}
            />

            <div className="pi-overlay">
              <button type="button" className="pi-overlay-btn">ເບິ່ງລາຍລະອຽດ →</button>
            </div>
          </div>
        </Link>

        {/* body */}
        <div className="pi-body">
          <Link to={`/product/${productId}`} className="pi-name" title={productName}>
            {productName}
          </Link>

          <div className="pi-rating">
            <StarRatings
              rating={Number(product?.rating) || 0}
              starRatedColor="#f59e0b"
              numberOfStars={5}
              name={`rating-${productId}`}
              starDimension="13px"
              starSpacing="1px"
            />
            <span className="pi-review-count">({product?.numOfReviews || 0})</span>
          </div>

          <div className="pi-footer">
            <div className="pi-price">
              {salePrice ? (
                <>
                  <span className="pi-price-original">{formatLAK(product?.price)}</span>
                  <span className="pi-price-main">{formatLAK(salePrice)}</span>
                </>
              ) : (
                <span className="pi-price-main no-sale">{formatLAK(product?.price)}</span>
              )}
            </div>
            <Link to={`/product/${productId}`} className="pi-btn-view">ເບິ່ງ <span style={{fontSize:".8em",opacity:.7}}>→</span></Link>
          </div>
        </div>

      </div>
    </div>
  );
};

ProductItem.propTypes = {
  product: PropTypes.shape({
    _id:          PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name:         PropTypes.string,
    images:       PropTypes.array,
    price:        PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    salePrice:    PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    rating:       PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    numOfReviews: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    stock:        PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  columnSize: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

ProductItem.defaultProps = { columnSize: 4 };

export default React.memo(ProductItem);
