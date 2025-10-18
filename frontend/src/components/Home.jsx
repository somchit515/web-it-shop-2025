import React, { useEffect } from "react";
import MetaData from "./layout/MetaData";
import { useGetProductsQuery } from "./redux/api/productsApi";
import ProductItem from "./product/ProductItem";
import Loader from "./layout/Loader";
import toast from "react-hot-toast";
import CustomPagination from "./layout/CustomPagination";
import { useSearchParams } from "react-router-dom";
import Filters from "./layout/Filters";

const Home = () => {
  let [searchParams] = useSearchParams();

  // 1. ดึงค่าทั้งหมดจาก URL
  const page = searchParams.get("page") || 1;
  const keyword = searchParams.get("keyword") || "";
  const min = searchParams.get("min");
  const max = searchParams.get("max");
  const category = searchParams.get("category"); // <--- เพิ่ม Category
  const rating = searchParams.get("rating");     // <--- เพิ่ม Rating

  const params = { page, keyword };

  // 2. กำหนดค่าลงใน params (หากมีค่าอยู่)
  min !== null && (params.min = min);
  max !== null && (params.max = max); // <--- แก้ไขการสะกดจาก maX เป็น max
  category !== null && (params.category = category); // <--- เพิ่ม Category
  rating !== null && (params.rating = rating);     // <--- เพิ่ม Rating

  const { data, isLoading, error, isError } = useGetProductsQuery(params);

  useEffect(() => {
    if (isError) {
      toast.error(error?.data?.message);
    }
  }, [isError, error?.data?.message]);

  // กำหนดเงื่อนไขการแสดง Filters
  const showFilters = keyword || category || rating || (min !== null || max !== null);
  
  // กำหนดขนาดคอลัมน์ของ ProductItem
  const columnSize = showFilters ? 4 : 3;

  if (isLoading) return <Loader />;

  // กำหนดคลาสสำหรับคอลัมน์แสดงสินค้า: 
  // หากมีการกรอง (แสดง Filters) ใช้ col-md-9 (เพื่อเว้น 3 คอลัมน์สำหรับ Filters)
  // หากไม่มีการกรอง ใช้ col-md-12 เต็ม
  const productColumnClass = showFilters ? "col-12 col-md-9" : "col-12";


  return (
    <>
      <MetaData title="Buy Best Product Online" />

      <div className="container">
        <div className="row">
          
          {/* 3. เงื่อนไขการแสดง Filters: จะแสดงเมื่อมีการค้นหาหรือกรอง */}
          {showFilters && (
            <div className="col-12 col-md-3 mt-5">
              <Filters/>
            </div>
          )}
          
          <div className={productColumnClass}>
            <h1 id="products_heading" className="text-secondary">
              {showFilters
                ? `${data?.products?.length} Product Found`
                : "ສິນຄ້າທັງໝົດ"}
            </h1>

            <section id="products" className="mt-5">
              <div className="row">
                {/* ไม่ต้องตรวจสอบ isLoading ซ้ำ เพราะมี return <Loader /> ด้านบน */}
                {data?.products?.map((product) => (
                  <ProductItem key={product._id} product={product} columnSize={columnSize}/>
                ))}
              </div>
            </section>

            <CustomPagination
              resPerPage={data?.resPerPage}
              filteredProductsCount={data?.filteredProductsCount}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;