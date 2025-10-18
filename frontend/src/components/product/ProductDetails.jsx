import React, { useEffect, useState } from "react";
import { useGetProductDetailsQuery } from "../redux/api/productsApi";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Loader from "../layout/Loader";
import StarRatings from "react-star-ratings";
import { useDispatch, useSelector } from "react-redux";
import { setcartItems } from "../redux/features/cartSlice";
import MetaData from '../layout/MetaData'
import NewReviews from "../reviews/NewReviews";
import ListReviews from "../reviews/ListReviews";


function ProductDetails() {
  const params = useParams();
  const dispatch = useDispatch();

  const [quantity, setQuantity] = useState(1);
  const [activeImg, setActiveImg] = useState("");

  // RTK Query Hook
  const { data, isLoading, error, isError } = useGetProductDetailsQuery(
    params?.id
  );
  const product = data?.product;

  // 💡 ADJUSTED: Using the common 'isAuthenticated' property name
  const { isAuthenticatedUser } = useSelector((state) => state.auth);


  // --- Effects ---

  // Effect to set the initial active image
  useEffect(() => {
    if (product) {
      setActiveImg(
        product.images && product.images.length > 0
          ? product.images[0].url
          : "/images/default_product.png"
      );
    }
  }, [product]);

  // Effect for error handling
  useEffect(() => {
    if (isError) {
      toast.error(error?.data?.message || "An unexpected error occurred.");
    }
  }, [isError, error]);


  // --- Quantity Handlers ---
  const increaseQty = () => {
    if (quantity >= product?.stock) return;
    setQuantity(quantity + 1);
  };

  const decreaseQty = () => {
    if (quantity <= 1) return;
    setQuantity(quantity - 1);
  };

  // --- Cart Handler ---
  const setItemToCart = () => {
    if (!product) {
      toast.error("ບໍ່ສາມາດເພີ່ມສິນຄ້າໄດ້: ຂໍ້ມູນສິນຄ້າບໍ່ພ້ອມ");
      return;
    }

    const cartItem = {
      product: product._id,
      name: product.name,
      price: product.price,
      image: product.images && product.images.length > 0 ? product.images[0].url : "/images/default_product.png",
      stock: product.stock,
      quantity
    };
    dispatch(setcartItems(cartItem));
    toast.success("ເພີ່ມລາຍການສຳເລັດ");
  };

  if (isLoading) return <Loader />;

  // --- Render ---
  return (
    <>
      <MetaData title={product?.name} />
      <div className="row d-flex justify-content-around">
        <div className="col-12 col-lg-5 img-fluid" id="product_image">
          <div className="p-3">
            <img
              className="d-block w-100"
              src={activeImg}
              alt={product?.name}
              width="340"
              height="390"
            />
          </div>
          <div className="row justify-content-start mt-5">
            {product?.images?.map((img) => (
              <div className="col-2 ms-4 mt-2" key={img.url}>
                <button
                  type="button"
                  onClick={() => setActiveImg(img.url)}
                  className="p-0 border-0 bg-transparent"
                >
                  <img
                    className={`d-block border rounded p-3 cursor-pointer ${img.url === activeImg ? "border-warning" : ""
                      }`}
                    height="100"
                    width="100"
                    src={img?.url}
                    alt={img?.url}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="col-12 col-lg-5 mt-5">
          <h3>{product?.name}</h3>
          <p id="product_id">Product ID: {product?._id}</p>

          <hr />

          <div className="d-flex">
            <StarRatings
              rating={product?.rating || 0}
              starRatedColor="#ffb229"
              numberOfStars={5}
              name="rating"
              starDimension="22px"
              starSpacing="1px"
            />
            <span id="no-of-reviews" className="pt-1 ps-2">
              {" "}
              ({product?.numOfReviews} Reviews){" "}
            </span>
          </div>
          <hr />

          <p id="product_price">$ {product?.price} </p>
          <div className="stockCounter d-inline">
            <span className="btn btn-danger minus" onClick={decreaseQty}>-</span>
            <input
              type="number"
              className="form-control count d-inline"
              value={quantity}
              min="1"
              max={product?.stock}
              readOnly
            />
            <span className="btn btn-primary plus" onClick={increaseQty}>+</span>
          </div>
          <button
            type="button"
            id="cart_btn"
            className="btn btn-primary d-inline ms-4"
            disabled={product?.stock <= 0}
            onClick={setItemToCart}
          >
            Add to Cart
          </button>

          <hr />

          <p>
            Status:{" "}
            <span
              id="stock_status"
              className={product?.stock > 0 ? "greenColor" : "redColor"}
            >
              {product?.stock > 0 ? "In Stock" : "Out of Stock"}
            </span>
          </p>

          <hr />

          <h4 className="mt-2">Description:</h4>
          <p>{product?.description}</p>
          <hr />
          <p id="product_seller" className="mb-3">
            Sold by: <strong>{product?.seller}</strong>
          </p>


          {/* Reviews Section */}
          <h4 className="mt-2">Customer Reviews</h4>
          {/* 💡 FIX: Use 'isAuthenticatedUser' to show/hide review button */}
          {isAuthenticatedUser && (<button id="review_btn" type="button" className="btn btn-primary mt-4" data-bs-toggle="modal" data-bs-target="#ratingModal"             >
            Submit Your Review             </button>)}
          <NewReviews productId={product?._id} />

          {product?.reviews?.length > 0 &&
           <ListReviews reviews = {product.reviews} />}




        </div>
      </div>
    </>
  );
}

export default ProductDetails;