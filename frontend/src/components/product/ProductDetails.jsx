// src/components/product/ProductDetails.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useGetProductDetailsQuery } from "../redux/api/productsApi"; // <- corrected path (up two)
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Loader from "../layout/Loader";
import StarRatings from "react-star-ratings";
import { useDispatch } from "react-redux";
import { setcartItems } from "../redux/features/cartSlice"; // <- corrected path (up two)
import MetaData from '../layout/MetaData';
import NewReviews from "../reviews/NewReviews";
import ListReviews from "../reviews/ListReviews";
import RelatedProductsSlider from "./RelatedProductsSlider"; // same-folder component

function ProductDetails() {
  const params = useParams();
  const dispatch = useDispatch();

  const [quantity, setQuantity] = useState(1);
  const [activeImg, setActiveImg] = useState("/images/default_product.png");

  // RTK Query Hook
  const { data, isLoading, error, isError } = useGetProductDetailsQuery(params?.id);
  const product = useMemo(() => data?.product || null, [data]);

  // Format LAK
  const formatLAK = useCallback((val) => {
    const n = Number(val ?? 0);
    return `₭ ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, []);

  // safe image resolver
  const resolveImg = useCallback((imgObjOrUrl) => {
    if (!imgObjOrUrl) return "/images/default_product.png";
    const url = typeof imgObjOrUrl === 'string' ? imgObjOrUrl : (imgObjOrUrl.url || imgObjOrUrl.path || "");
    if (!url) return "/images/default_product.png";
    if (/^https?:\/\//i.test(url) || url.startsWith('/')) return url;
    return `/uploads/products/${url}`;
  }, []);

  // image fallback on error
  const handleImgError = (e) => {
    e.currentTarget.src = "/images/default_product.png";
  };

  useEffect(() => {
    if (product) {
      const first = (product.images && product.images.length > 0) ? resolveImg(product.images[0]) : "/images/default_product.png";
      setActiveImg(first);
      setQuantity(1);
    }
  }, [product, resolveImg]);

  useEffect(() => {
    if (isError) {
      toast.error(error?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການໂຫລດຂໍ້ມູນ");
    }
  }, [isError, error]);

  // Quantity handlers
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

  const onQtyChange = useCallback((e) => {
    const v = Number(e.target.value) || 1;
    const stock = Number(product?.stock) || 0;
    if (v < 1) return setQuantity(1);
    if (stock && v > stock) return setQuantity(stock);
    setQuantity(v);
  }, [product]);

  // Cart Handler
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
      quantity
    };
    dispatch(setcartItems(cartItem));
    toast.success("ເພີ່ມໄປກະຕ່າສຳເລັດ");
  }, [dispatch, product, quantity, resolveImg]);

  if (isLoading) return <Loader />;

  // safety: if no product after loading
  if (!product) {
    return (
      <>
        <MetaData title="Product" />
        <div className="container py-5">
          <h4>ບໍ່ພົບສິນຄ້າ</h4>
          <p>ກະລຸນາກວດເບິ່ງລິ້ງກັບຫຼືກະລຸນາກັບຫາໜ້າຫຼັກ</p>
        </div>
      </>
    );
  }

  const stockNumber = Number(product.stock) || 0;

  return (
    <>
      <MetaData title={product?.name || 'Product'} description={String(product?.description || '').slice(0, 160)} />
      <div className="row d-flex justify-content-around">
        <div className="col-12 col-lg-5 img-fluid" id="product_image">
          <div className="p-3" style={{ background: '#fff', borderRadius: 8 }}>
            <img
              className="d-block w-100"
              src={activeImg}
              alt={product?.name ? `${product.name} image` : 'Product image'}
              width="340"
              height="390"
              loading="lazy"
              onError={handleImgError}
              style={{ objectFit: 'contain', background: '#fafafa' }}
            />
          </div>

          <div className="row justify-content-start mt-4 gx-2">
            {(product?.images?.length ? product.images : [{ url: activeImg }]).map((img, idx) => {
              const url = resolveImg(img);
              const isActive = url === activeImg;
              return (
                <div className="col-auto" key={idx}>
                  <button
                    type="button"
                    onClick={() => setActiveImg(url)}
                    className="p-0 border-0 bg-transparent"
                    aria-label={`Select image ${idx + 1}`}
                    aria-pressed={isActive}
                    style={{ width: 96, height: 96 }}
                  >
                    <img
                      className={`d-block rounded p-2 ${isActive ? "border border-3 border-warning" : "border border-1 border-light"}`}
                      height="96"
                      width="96"
                      src={url}
                      alt={`${product.name || 'thumbnail'} ${idx + 1}`}
                      loading="lazy"
                      onError={handleImgError}
                      style={{ objectFit: 'cover', background: '#fff' }}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="col-12 col-lg-5 mt-3">
          <h3 style={{ fontWeight: 700 }}>{product?.name}</h3>
          <p id="product_id" style={{ color: '#6b7280' }}>ລະຫັດສິນຄ້າ: {product?._id}</p>

          <hr />

          <div className="d-flex align-items-center">
            <StarRatings
              rating={Number(product?.rating) || 0}
              starRatedColor="#ffb229"
              numberOfStars={5}
              name="rating"
              starDimension="22px"
              starSpacing="1px"
            />
            <span id="no-of-reviews" className="pt-1 ps-2" style={{ color: '#475569' }}>
              ({Number(product?.numOfReviews || 0)} ຄຳຕິຊົມ)
            </span>
          </div>

          <hr />

          <p id="product_price" style={{ fontSize: 22, fontWeight: 800, marginTop: 6 }}>{formatLAK(product?.price)}</p>

          <div className="d-flex align-items-center mt-2">
            <div className="stockCounter d-inline" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                className="btn btn-danger"
                onClick={decreaseQty}
                aria-label="Decrease quantity"
                disabled={quantity <= 1}
              >-</button>

              <input
                type="number"
                className="form-control count d-inline text-center"
                value={quantity}
                min="1"
                max={stockNumber}
                onChange={onQtyChange}
                style={{ width: 80 }}
                aria-label="Quantity"
              />

              <button
                className="btn btn-primary"
                onClick={increaseQty}
                aria-label="Increase quantity"
                disabled={stockNumber <= 0 || quantity >= stockNumber}
              >+</button>
            </div>

            <button
              type="button"
              id="cart_btn"
              className="btn btn-primary d-inline ms-3"
              disabled={stockNumber <= 0}
              onClick={setItemToCart}
            >
              ເພີ່ມໄປກະຕ່າ
            </button>
          </div>

          <hr />

          <p>
            ສະຖານະ: {' '}
            <span
              id="stock_status"
              className={stockNumber > 0 ? "text-success" : "text-danger"}
              style={{ fontWeight: 700 }}
            >
              {stockNumber > 0 ? "ມີສິນຄ້າ" : "ສິນຄ້າໝົດ"}
            </span>
          </p>

          <hr />

          <h4 className="mt-2">ລາຍລະອຽດ</h4>
          <p style={{ whiteSpace: 'pre-wrap' }}>{product?.description || '-'}</p>

          <hr />

          <p id="product_seller" className="mb-3">
            ຂາຍໂດຍ: <strong>{product?.seller || '—'}</strong>
          </p>

          {/* Reviews Section */}
          <h4 className="mt-2">ຄຳຕິຊົມ</h4>

          <NewReviews productId={product?._id} />

          {product?.reviews?.length > 0 && (
            <div className="mt-3">
              <ListReviews reviews={product.reviews} />
            </div>
          )}

         
        </div>
         {/* Related products slider (same category) */}
          <RelatedProductsSlider category={product?.category} currentId={product?._id} />
      </div>
    </>
  );
}

export default ProductDetails;
