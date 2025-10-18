import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getPriceQueryParams } from "../../helpers/helpers";
import { PRODUCT_CATEGORIES, RATINGS } from "../../constans/constans";

function Filters() {
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedRating, setSelectedRating] = useState("");

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // โหลดค่าจาก URL เมื่อ component mount หรือ searchParams เปลี่ยน
  useEffect(() => {
    const minPrice = searchParams.get("min") || "";
    const maxPrice = searchParams.get("max") || "";
    const category = searchParams.get("category") || "";
    const rating = searchParams.get("rating") || "";

    setMin(minPrice);
    setMax(maxPrice);
    setSelectedCategory(category);
    setSelectedRating(rating);
  }, [searchParams]);

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    // Toggle: ถ้าคลิกซ้ำให้ล้างค่า (single select)
    setSelectedCategory((prev) => (prev === category ? "" : category));
  };

  const handleRatingChange = (e) => {
    const rating = e.target.value;
    // Toggle: ถ้าคลิกซ้ำให้ล้างค่า (single select)
    setSelectedRating((prev) => (prev === rating ? "" : rating));
  };

  const handleButtonClick = (e) => {
    e.preventDefault();

    // ********** การปรับปรุง: ตรวจสอบและแปลงค่าราคา **********
    const minVal = min === "" ? "" : parseInt(min);
    const maxVal = max === "" ? "" : parseInt(max);

    if (minVal && maxVal && minVal > maxVal) {
      alert("Minimum price cannot be greater than maximum price.");
      return;
    }

    const updatedParams = new URLSearchParams(searchParams);

    // ใช้ min และ max ที่เป็น string (ค่าว่างหรือตัวเลข)
    getPriceQueryParams(updatedParams, "min", min);
    getPriceQueryParams(updatedParams, "max", max);

    // การจัดการ Category
    if (selectedCategory) {
      updatedParams.set("category", selectedCategory);
    } else {
      updatedParams.delete("category");
    }

    // การจัดการ Rating
    if (selectedRating) {
      updatedParams.set("rating", selectedRating);
    } else {
      updatedParams.delete("rating");
    }

    navigate(`${window.location.pathname}?${updatedParams.toString()}`);
  };

  // ********** การเพิ่มฟังก์ชัน Clear Filters **********
  const handleClearFilters = () => {
    setMin("");
    setMax("");
    setSelectedCategory("");
    setSelectedRating("");
    navigate(window.location.pathname); // ล้าง query params ทั้งหมด
  };

  return (
    <div className="border p-3 filter">
      <div className="d-flex justify-content-between align-items-center">
        <h3>Filters</h3>
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={handleClearFilters}
          style={{ whiteSpace: "nowrap" }} // ป้องกันปุ่มโดนตัดคำ
        >
          Clear Filters
        </button>
      </div>
      <hr />
      
      <h5 className="filter-heading mb-3">Price</h5>
      <form id="filter_form" className="px-2" onSubmit={handleButtonClick}>
        <div className="row">
          <div className="col">
            <input
              type="number"
              className="form-control"
              placeholder="Min ($)"
              name="min"
              value={min}
              // ********** การปรับปรุง: อัปเดต state ทันที (เป็น string) **********
              onChange={(e) => setMin(e.target.value)}
              min="0"
            />
          </div>
          <div className="col">
            <input
              type="number"
              className="form-control"
              placeholder="Max ($)"
              name="max"
              value={max}
              // ********** การปรับปรุง: อัปเดต state ทันที (เป็น string) **********
              onChange={(e) => setMax(e.target.value)}
              min="0"
            />
          </div>
          <div className="col">
            <button type="submit" className="btn btn-primary">
              GO
            </button>
          </div>
        </div>
      </form>

      <hr />
      <h5 className="mb-3">Category</h5>
      {PRODUCT_CATEGORIES.map((category) => (
        <div className="form-check" key={category}>
          <input
            className="form-check-input"
            type="checkbox"
            name="category"
            value={category}
            checked={selectedCategory === category}
            onChange={handleCategoryChange}
          />
          <label className="form-check-label">{category}</label>
        </div>
      ))}

      <hr />
      <h5 className="mb-3">Ratings</h5>
      {RATINGS.map((rating) => (
        <div className="form-check" key={rating.value}>
          <input
            className="form-check-input"
            type="checkbox"
            value={rating.value}
            checked={selectedRating === rating.value}
            onChange={handleRatingChange}
          />
          <label className="form-check-label">{rating.label}</label>
        </div>
      ))}
    </div>
  );
}

export default Filters;