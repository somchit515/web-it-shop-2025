// src/components/category/CategoryOverview.jsx
import React from "react";
import { Link } from "react-router-dom";
import MetaData from "../layout/MetaData";
import useCategories from "../../utils/useCategories";
import CategoryRow from "../layout/CategoryRow";

const CategoryCard = ({ c }) => (
  <div className="col-6 col-sm-4 col-md-3 mb-4">
    <Link to={`/category/${c.slug}`} className="text-decoration-none" title={c.title}>
      <div className="card h-100 shadow-sm overflow-hidden">
        <div style={{ height: 140, display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>
          <img src={c.img} alt={c.title} loading="lazy" style={{ maxHeight: 120, objectFit: "cover", width: "100%" }} onError={(e) => (e.currentTarget.src = "/images/default_product.png")} />
        </div>
        <div className="card-body text-center">
          <h6 className="mb-0 text-dark" style={{ fontWeight: 600 }}>{c.title}</h6>
        </div>
      </div>
    </Link>
  </div>
);

export default function CategoryOverview() {
  const { categories } = useCategories();
  const rowsToShow = [
    { slug: "smartphones", title: "Mobile phone" },
    { slug: "laptops", title: "Laptops" },
    { slug: "gaming-products", title: "Gaming Products" },
    { slug: "electronics", title: "Electronics" },
    
  ];

  return (
    <>
      <MetaData title="ໝວດສິນຄ້າ — ITHUBB" description="ເບິ່ງໝວດສິນຄ້າ" />
      <div className="container py-4">
        <h2 className="mb-4">ໝວດສິນຄ້າ</h2>
        <div className="row">
          {categories.map((c) => <CategoryCard key={c.slug} c={c} />)}
        </div>

        <div style={{ marginTop: 36 }}>
          {rowsToShow.map((r) => (
            <CategoryRow key={r.slug} title={r.title} category={r.slug} showAllLink={`/category/${r.slug}`} />
          ))}
        </div>
      </div>
    </>
  );
}
