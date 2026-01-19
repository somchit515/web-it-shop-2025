// src/components/product/CategoryProducts.jsx
import React, { useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { useGetProductsQuery } from "../redux/api/productsApi";
import Loader from "../layout/Loader";
import ProductItem from "./ProductItem";
import MetaData from "../layout/MetaData";
import { slugToKey, slugToTitle } from "../../utils/categories";
import toast from "react-hot-toast";

function CategoryProducts() {
  const { categorySlug } = useParams();
  const [searchParams] = useSearchParams();

  const categoryKey = slugToKey(categorySlug || "");
  const title = slugToTitle(categorySlug) || "Category";

  const page = searchParams.get("page") || 1;
  const keyword = searchParams.get("keyword") || "";
  const min = searchParams.get("min");
  const max = searchParams.get("max");
  const rating = searchParams.get("rating");

  // always define queryParams BEFORE hooks
  const queryParams = {};

  if (categoryKey) queryParams.category = categoryKey;
  if (page) queryParams.page = page;
  if (keyword) queryParams.keyword = keyword;
  if (min !== null) queryParams.min = min;
  if (max !== null) queryParams.max = max;
  if (rating !== null) queryParams.rating = rating;

  // ❗ Hooks MUST be called unconditionally
  const { data, isLoading, isError, error } = useGetProductsQuery(queryParams, {
    skip: !categoryKey, // <-- safe, not conditional hook
  });

  useEffect(() => {
    if (isError)
      toast.error(error?.data?.message || "Failed to load category products");
  }, [isError, error]);

  const products = data?.products || [];

  return (
    <>
      <MetaData
        title={`ໝວດ: ${title}`}
        description={`Browse all products in ${title}`}
      />

      <div className="container mt-4">

        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-3">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/">Home</Link></li>
            <li className="breadcrumb-item active">{title}</li>
          </ol>
        </nav>

        <h3 className="mb-4" style={{ fontWeight: 700 }}>
          ສິນຄ້າໝວດ: {title}
        </h3>

        {/* === Case 1: slug ไม่ถูกต้อง === */}
        {!categoryKey && (
          <p className="text-danger">ບໍ່ພົບໝວດສິນຄ້າ: {categorySlug}</p>
        )}

        {/* === Case 2: กำลังโหลด === */}
        {isLoading && <Loader />}

        {/* === Case 3: category ถูกต้อง + โหลดเสร็จ === */}
        {!isLoading && categoryKey && (
          <>
            {products.length === 0 ? (
              <p>ບໍ່ມີສິນຄ້າໃນໝວດນີ້</p>
            ) : (
              <div className="row">
                {products.map((item) => (
                  <ProductItem key={item._id} product={item} columnSize={3} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default CategoryProducts;
