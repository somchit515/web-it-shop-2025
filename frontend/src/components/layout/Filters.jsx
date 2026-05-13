import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getPriceQueryParams } from "../../helpers/helpers";
import { RATINGS } from "../../constans/constans";
import useCategories from "../../utils/useCategories";

function Filters() {
  const { categories } = useCategories();
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

    // แปลงเป็น number เฉพาะเมื่อไม่ใช่ค่าว่าง
    const minExists = min !== "";
    const maxExists = max !== "";
    const minVal = minExists ? Number(min) : null;
    const maxVal = maxExists ? Number(max) : null;

    if (minExists && maxExists && Number.isFinite(minVal) && Number.isFinite(maxVal) && minVal > maxVal) {
      alert("Minimum price cannot be greater than maximum price.");
      return;
    }

    const updatedParams = new URLSearchParams(searchParams);

    // ล้าง page เพื่อให้เริ่มจากหน้าแรกเมื่อเปลี่ยน filter
    updatedParams.delete("page");

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

    // navigate ไปที่ path ปัจจุบันพร้อม query string ที่อัปเดต
    navigate(`${window.location.pathname}?${updatedParams.toString()}`);
  };

  // Clear filters — ล้างค่า state และ query params
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
          style={{ whiteSpace: "nowrap" }}
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
              placeholder="Min (₭)"
              name="min"
              value={min}
              onChange={(e) => setMin(e.target.value)}
              min="0"
            />
          </div>
          <div className="col">
            <input
              type="number"
              className="form-control"
              placeholder="Max (₭)"
              name="max"
              value={max}
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
      {categories.map((category) => (
        <div className="form-check" key={category.key || category.slug}>
          <input
            className="form-check-input"
            type="checkbox"
            id={`cat-${category.key || category.slug}`}
            name="category"
            value={category.key || category.slug}
            checked={selectedCategory === (category.key || category.slug)}
            onChange={handleCategoryChange}
          />
          <label className="form-check-label" htmlFor={`cat-${category.key || category.slug}`}>{category.title || category.key || category.slug}</label>
        </div>
      ))}

      <hr />
      <h5 className="mb-3">Ratings</h5>
      {RATINGS.map((rating) => (
        <div className="form-check" key={rating.value}>
          <input
            className="form-check-input"
            type="checkbox"
            id={`rating-${rating.value}`}
            value={rating.value}
            checked={selectedRating === String(rating.value)}
            onChange={handleRatingChange}
          />
          <label className="form-check-label" htmlFor={`rating-${rating.value}`}>{rating.label}</label>
        </div>
      ))}
    </div>
  );
}

export default Filters;
