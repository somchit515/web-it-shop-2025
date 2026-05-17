import React, { useMemo, useRef, useState } from "react";
import AdminLayout from "../layout/AdminLayout";
import toast from "react-hot-toast";
import useCategories from "../../utils/useCategories";
import { normalizeSlug } from "../../utils/categories";
import { confirmDialog } from "./_shared/confirmDialogStore";

/* ─── Image Upload Zone ───────────────────────────────────── */
function ImgUploadZone({ value, onChange }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const processFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("ກະລຸນາເລືອກໄຟລ໌ຮູບເທົ່ານັ້ນ");
    if (file.size > 5 * 1024 * 1024) return toast.error("ຮູບໃຫຍ່ເກີນ 5MB");
    const reader = new FileReader();
    reader.onload = (e) => onChange(e.target.result);
    reader.readAsDataURL(file);
  };

  const onFileChange = (e) => processFile(e.target.files[0]);

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    processFile(e.dataTransfer.files[0]);
  };

  const isBase64 = value?.startsWith("data:");
  const hasImg = Boolean(value);

  return (
    <div>
      <style>{zoneCSS}</style>

      <div
        className={`img-zone ${dragging ? "dragging" : ""} ${hasImg ? "has-img" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        {hasImg ? (
          <>
            <img
              src={value}
              alt="preview"
              className="img-zone-preview"
              onError={(e) => (e.currentTarget.src = "/images/default_product.png")}
            />
            <div className="img-zone-overlay">
              <span>🔄 ຄລິກ / ລາກເພື່ອປ່ຽນ</span>
            </div>
          </>
        ) : (
          <div className="img-zone-placeholder">
            <div className="img-zone-icon">📁</div>
            <p className="img-zone-text">ລາກຮູບມາວາງ ຫຼື ຄລິກເພື່ອເລືອກ</p>
            <p className="img-zone-hint">PNG, JPG, WEBP — ສູງສຸດ 5MB</p>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={onFileChange}
      />

      {/* Option: paste URL */}
      <div className="img-zone-url-row">
        <span className="img-zone-or">ຫຼື ວາງ URL ຮູບ</span>
        <input
          type="text"
          className="form-control form-control-sm"
          placeholder="https://... ຫຼື /images/categories/..."
          value={isBase64 ? "" : (value || "")}
          onChange={(e) => onChange(e.target.value)}
        />
        {hasImg && (
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={(e) => { e.stopPropagation(); onChange(""); }}
            title="ລຶບຮູບ"
          >✕</button>
        )}
      </div>
    </div>
  );
}

const zoneCSS = `
.img-zone {
  position: relative;
  width: 100%;
  height: 140px;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  background: #f8fafc;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  overflow: hidden;
  transition: border-color .2s, background .2s;
}
.img-zone:hover, .img-zone.dragging {
  border-color: #667eea;
  background: #f0f4ff;
}
.img-zone.has-img { border-style: solid; border-color: #e2e8f0; }

.img-zone-preview {
  width: 100%; height: 100%;
  object-fit: contain;
  padding: 8px;
}
.img-zone-overlay {
  position: absolute; inset: 0;
  background: rgba(0,0,0,.45);
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity .2s;
  color: #fff; font-weight: 700; font-size: .85rem;
  border-radius: 10px;
}
.img-zone:hover .img-zone-overlay { opacity: 1; }

.img-zone-placeholder { text-align: center; padding: 1rem; }
.img-zone-icon { font-size: 2rem; margin-bottom: .4rem; }
.img-zone-text { margin: 0; font-size: .9rem; font-weight: 600; color: #475569; }
.img-zone-hint { margin: .25rem 0 0; font-size: .75rem; color: #94a3b8; }

.img-zone-url-row {
  display: flex; align-items: center; gap: .5rem;
  margin-top: .5rem;
}
.img-zone-or {
  white-space: nowrap; font-size: .75rem; color: #94a3b8; font-weight: 600;
}
`;

/* ─── Main Component ──────────────────────────────────────── */
export default function CategoriesManager() {
  const { categories } = useCategories();
  const [editingId, setEditingId] = useState("");
  const [title, setTitle]         = useState("");
  const [slug, setSlug]           = useState("");
  const [img, setImg]             = useState("");
  const [saving, setSaving]       = useState(false);

  const preview = useMemo(() => ({
    title,
    slug: normalizeSlug(slug || title),
    img,
  }), [title, slug, img]);

  const resetForm = () => {
    setEditingId(""); setTitle(""); setSlug(""); setImg("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title: title.trim(),
      slug: normalizeSlug(slug || title),
      img: img || "",
    };
    if (!payload.title || !payload.slug) return toast.error("ກະລຸນາໃສ່ຊື່ ແລະ Slug");

    setSaving(true);
    const url    = editingId ? `/api/v1/admin/categories/${editingId}` : "/api/v1/admin/categories";
    const method = editingId ? "PUT" : "POST";

    try {
      const res  = await fetch(url, {
        method, credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data?.message || "ການບັນທຶກຜິດພາດ");
      toast.success(editingId ? "ອັບເດດໝວດໝູ່ສຳເລັດ ✅" : "ສ້າງໝວດໝູ່ສຳເລັດ ✅");
      resetForm();
      window.dispatchEvent(new Event("categories:updated"));
    } catch {
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການເຊື່ອມຕໍ່");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (c) => {
    setEditingId(c._id || c.slug);
    setTitle(c.title);
    setSlug(c.slug);
    setImg(c.img || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onDelete = async (c) => {
    const ok = await confirmDialog.show({
      title: "ລົບໝວດໝູ່",
      message: `ທ່ານຕ້ອງການລົບໝວດໝູ່ '${c.title}' ແທ້ຫຼືບໍ່?`,
      confirmText: "ລົບ",
      variant: "danger",
    });
    if (!ok) return;
    try {
      const res  = await fetch(`/api/v1/admin/categories/${c._id || c.slug}`, { method: "DELETE", credentials: "include" });
      const data = await res.json();
      if (!res.ok) return toast.error(data?.message || "ລົບບໍ່ສຳເລັດ");
      toast.success("ລົບໝວດໝູ່ສຳເລັດ");
      window.dispatchEvent(new Event("categories:updated"));
    } catch {
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການລົບ");
    }
  };

  return (
    <AdminLayout>
      <div className="container-fluid py-3">
        <h3 className="mb-4">ຈັດການໝວດໝູ່ສິນຄ້າ</h3>

        {/* ── Form ── */}
        <div className="card shadow-sm mb-4" style={{ borderRadius: 14 }}>
          <div className="card-body p-4">
            <h5 className="mb-3 fw-bold">
              {editingId ? "✏️ ແກ້ໄຂໝວດໝູ່" : "➕ ເພີ່ມໝວດໝູ່ໃໝ່"}
            </h5>

            <form onSubmit={onSubmit}>
              <div className="row g-3">
                {/* Title */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">ຊື່ໝວດໝູ່ (Title) <span className="text-danger">*</span></label>
                  <input
                    className="form-control"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="ເຊັ່ນ: Laptops, ໂທລະສັບ..."
                    required
                  />
                </div>

                {/* Slug */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Slug <span className="text-danger">*</span></label>
                  <input
                    className="form-control"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="ອັດຕະໂນມັດຈາກຊື່ ຫຼື ຕື່ມເອງ"
                  />
                  {preview.slug && (
                    <div className="form-text">
                      Slug: <code>{preview.slug}</code>
                    </div>
                  )}
                </div>

                {/* Image Upload */}
                <div className="col-12">
                  <label className="form-label fw-semibold">ຮູບໝວດໝູ່</label>
                  <ImgUploadZone value={img} onChange={setImg} />
                </div>

                {/* Buttons */}
                <div className="col-12 d-flex gap-2 pt-1">
                  <button className="btn btn-primary px-4" type="submit" disabled={saving}>
                    {saving ? (
                      <><span className="spinner-border spinner-border-sm me-2" />ກຳລັງບັນທຶກ...</>
                    ) : editingId ? "💾 ອັບເດດຂໍ້ມູນ" : "✅ ສ້າງໝວດໝູ່"}
                  </button>
                  {editingId && (
                    <button className="btn btn-outline-secondary" type="button" onClick={resetForm}>
                      ຍົກເລີກ
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="card shadow-sm" style={{ borderRadius: 14 }}>
          <div className="card-body p-4">
            <h5 className="mb-3 fw-bold">ລາຍການທັງໝົດ ({categories.length})</h5>
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: 80 }}>ຮູບ</th>
                    <th>ຊື່ໝວດໝູ່</th>
                    <th>Slug</th>
                    <th className="text-end">ຈັດການ</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((c) => (
                    <tr key={c._id || c.slug} style={editingId === (c._id || c.slug) ? { background: "#f0f4ff" } : {}}>
                      <td>
                        <img
                          src={c.img}
                          alt={c.title}
                          style={{ width: 52, height: 52, objectFit: "contain", borderRadius: 8, background: "#f8fafc", border: "1px solid #e2e8f0", padding: 4 }}
                          onError={(e) => (e.currentTarget.src = "/images/default_product.png")}
                        />
                      </td>
                      <td><span className="fw-bold">{c.title}</span></td>
                      <td><code className="text-primary">{c.slug}</code></td>
                      <td className="text-end">
                        <div className="d-flex gap-2 justify-content-end">
                          <button className="btn btn-sm btn-outline-primary" onClick={() => startEdit(c)}>ແກ້ໄຂ</button>
                          <button className="btn btn-sm btn-outline-danger"  onClick={() => onDelete(c)}>ລົບ</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
