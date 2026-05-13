import React, { useMemo, useState } from "react";
import AdminLayout from "../layout/AdminLayout";
import toast from "react-hot-toast";
import {
  removeCategoryBySlug,
  upsertCategory,
} from "../../utils/categories";
import useCategories from "../../utils/useCategories";

export default function CategoriesManager() {
  const categories = useCategories();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [img, setImg] = useState("");

  const preview = useMemo(() => ({ title, slug, img }), [title, slug, img]);

  const onSubmit = (e) => {
    e.preventDefault();
    const result = upsertCategory({ title, slug, img, key: slug });
    if (!result.ok) return toast.error(result.message);
    toast.success("ເພີ່ມໝວດໝູ່ສຳເລັດ");
    setTitle("");
    setSlug("");
    setImg("");
  };

  const onDelete = (targetSlug) => {
    removeCategoryBySlug(targetSlug);
    toast.success("ລົບໝວດໝູ່ແລ້ວ");
  };

  const resetDefault = () => {
    localStorage.removeItem("ithubb_dynamic_categories_v1");
    window.dispatchEvent(new Event("categories:updated"));
    toast.success("Reset ກັບຄ່າເລີ່ມຕົ້ນແລ້ວ");
  };

  return (
    <AdminLayout>
      <div className="container-fluid py-3">
        <h3 className="mb-3">ຈັດການໝວດໝູ່ສິນຄ້າ</h3>

        <div className="card p-3 mb-4">
          <h5>ເພີ່ມໝວດໝູ່ໃໝ່</h5>
          <form className="row g-3" onSubmit={onSubmit}>
            <div className="col-md-4">
              <label className="form-label">ຊື່ຫມວດໝູ່</label>
              <input className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="col-md-4">
              <label className="form-label">Slug</label>
              <input className="form-control" value={slug} onChange={(e) => setSlug(e.target.value)} required />
            </div>
            <div className="col-md-4">
              <label className="form-label">ຮູບ (URL)</label>
              <input className="form-control" value={img} onChange={(e) => setImg(e.target.value)} placeholder="/images/categories/..." />
            </div>
            <div className="col-12 d-flex gap-2">
              <button className="btn btn-primary" type="submit">ເພີ່ມໝວດໝູ່</button>
              <button className="btn btn-outline-secondary" type="button" onClick={resetDefault}>Reset Default</button>
            </div>
          </form>
          {preview.title && (
            <small className="text-muted mt-2 d-block">Preview: {preview.title} ({preview.slug})</small>
          )}
        </div>

        <div className="card p-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="mb-0">ລາຍການໝວດໝູ່ ({categories.length})</h5>
          </div>
          <div className="table-responsive">
            <table className="table align-middle">
              <thead><tr><th>Image</th><th>Title</th><th>Slug</th><th></th></tr></thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.slug}>
                    <td><img src={c.img} alt={c.title} style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8 }} /></td>
                    <td>{c.title}</td>
                    <td><code>{c.slug}</code></td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(c.slug)}>ລົບ</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
