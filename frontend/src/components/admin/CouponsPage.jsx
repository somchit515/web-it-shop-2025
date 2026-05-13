// frontend/src/components/admin/CouponsPage.jsx
import React, { useState } from "react";
import AdminLayout from "../layout/AdminLayout";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTicket, faTrash, faPencilAlt } from "@fortawesome/free-solid-svg-icons";
import {
  useGetAdminCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
} from "../redux/api/couponApi";
import Breadcrumb from "./_shared/Breadcrumb";
import { confirmDialog } from "./_shared/confirmDialog";

const DEFAULT_FORM = {
  code: "",
  description: "",
  type: "percentage",
  value: 10,
  minOrderAmount: 0,
  maxDiscount: "",
  usageLimit: "",
  perUserLimit: 1,
  validUntil: "",
  active: true,
};

export default function CouponsPage() {
  const { data, isLoading, refetch } = useGetAdminCouponsQuery();
  const [createCoupon, { isLoading: creating }] = useCreateCouponMutation();
  const [updateCoupon] = useUpdateCouponMutation();
  const [deleteCoupon] = useDeleteCouponMutation();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);

  const coupons = data?.coupons || [];

  const resetForm = () => {
    setForm(DEFAULT_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const body = {
        ...form,
        value: Number(form.value),
        minOrderAmount: Number(form.minOrderAmount) || 0,
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        perUserLimit: Number(form.perUserLimit) || 1,
        validUntil: form.validUntil || null,
      };

      if (editingId) {
        await updateCoupon({ id: editingId, body }).unwrap();
        toast.success("ອັບເດດສ່ວນຫຼຸດສຳເລັດ");
      } else {
        await createCoupon(body).unwrap();
        toast.success("ສ້າງສ່ວນຫຼຸດສຳເລັດ");
      }
      resetForm();
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "ການບັນທຶກລົ້ມເຫລວ");
    }
  };

  const handleEdit = (c) => {
    setEditingId(c._id);
    setForm({
      code: c.code,
      description: c.description || "",
      type: c.type,
      value: c.value,
      minOrderAmount: c.minOrderAmount || 0,
      maxDiscount: c.maxDiscount || "",
      usageLimit: c.usageLimit || "",
      perUserLimit: c.perUserLimit || 1,
      validUntil: c.validUntil ? c.validUntil.slice(0, 10) : "",
      active: c.active !== false,
    });
    setShowForm(true);
  };

  const handleDelete = async (c) => {
    const ok = await confirmDialog.show({
      title: "ລຶບລະຫັດສ່ວນຫຼຸດ?",
      message: `ລະຫັດ "${c.code}" ຈະຫາຍຖາວອນ`,
      confirmText: "ລຶບເລີຍ",
      variant: "danger",
      icon: "fa-trash",
    });
    if (!ok) return;
    try {
      await deleteCoupon(c._id).unwrap();
      toast.success(`ລຶບ ${c.code} ສຳເລັດ`);
    } catch (err) {
      toast.error(err?.data?.message || "ການລຶບລົ້ມເຫລວ");
    }
  };

  const toggleActive = async (c) => {
    try {
      await updateCoupon({ id: c._id, body: { active: !c.active } }).unwrap();
      toast.success(c.active ? "ປິດໃຊ້ງານແລ້ວ" : "ເປີດໃຊ້ງານແລ້ວ");
    } catch (err) {
      toast.error("ການອັບເດດລົ້ມເຫລວ");
    }
  };

  return (
    <AdminLayout>
      <style>{`
        .coupons-page { padding: 0; }
        .page-title {
          font-size: 1.75rem; font-weight: 700; color: #1e293b;
          margin: 0 0 0.5rem; display: flex; align-items: center; gap: 12px;
        }
        .page-title svg { color: #667eea; }
        .page-subtitle { color: #64748b; font-size: 0.95rem; margin-bottom: 1.5rem; }

        .top-actions {
          display: flex; justify-content: flex-end; margin-bottom: 1.5rem;
        }
        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none; color: white; border-radius: 12px;
          padding: 12px 24px; font-weight: 600; cursor: pointer;
          display: inline-flex; align-items: center; gap: 8px;
          transition: all 0.3s;
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4); }

        .coupon-form-card {
          background: white; border-radius: 16px; padding: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          border: 1px solid rgba(0,0,0,0.05); margin-bottom: 24px;
        }
        .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
        .form-field label {
          display: block; font-size: 0.875rem; font-weight: 600;
          color: #475569; margin-bottom: 6px;
        }
        .form-control {
          width: 100%; padding: 10px 14px; border: 2px solid #e2e8f0;
          border-radius: 10px; font-size: 0.95rem; transition: all 0.2s;
        }
        .form-control:focus { border-color: #667eea; outline: none; box-shadow: 0 0 0 4px rgba(102,126,234,0.1); }
        .form-actions { display: flex; gap: 12px; margin-top: 20px; }
        .btn-secondary {
          padding: 10px 20px; border: 2px solid #e2e8f0; background: white;
          border-radius: 10px; cursor: pointer; font-weight: 600;
        }

        .coupons-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
        .coupon-card {
          background: white; border-radius: 16px; padding: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          border: 2px solid #e2e8f0; position: relative; overflow: hidden;
          transition: all 0.3s;
        }
        .coupon-card.inactive { opacity: 0.55; border-style: dashed; }
        .coupon-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
        .coupon-card::before {
          content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 6px;
          background: linear-gradient(180deg, #667eea, #764ba2);
        }
        .coupon-code {
          font-family: monospace; font-size: 1.4rem; font-weight: 800;
          color: #1e293b; letter-spacing: 1px;
        }
        .coupon-discount {
          display: inline-block; padding: 6px 14px; background: linear-gradient(135deg, #fef3c7, #fde68a);
          color: #92400e; border-radius: 999px; font-weight: 700; font-size: 0.95rem; margin-top: 6px;
        }
        .coupon-meta { color: #64748b; font-size: 0.85rem; margin-top: 10px; line-height: 1.7; }
        .coupon-actions { display: flex; gap: 8px; margin-top: 14px; }
        .action-btn {
          flex: 1; padding: 8px 12px; border-radius: 8px; border: 1.5px solid;
          background: white; cursor: pointer; font-weight: 600; font-size: 0.85rem;
          transition: all 0.2s;
        }
        .btn-edit { border-color: #3b82f6; color: #3b82f6; }
        .btn-edit:hover { background: #3b82f6; color: white; }
        .btn-delete { border-color: #ef4444; color: #ef4444; }
        .btn-delete:hover { background: #ef4444; color: white; }
        .btn-toggle { border-color: #64748b; color: #64748b; }
        .btn-toggle:hover { background: #64748b; color: white; }

        .empty-state {
          text-align: center; padding: 4rem 1rem; background: white;
          border-radius: 16px; border: 2px dashed #cbd5e1;
        }
      `}</style>

      <div className="coupons-page">
        <Breadcrumb items={[{ label: "ສ່ວນຫຼຸດ" }]} />
        <h1 className="page-title">
          <FontAwesomeIcon icon={faTicket} /> ຈັດການລະຫັດສ່ວນຫຼຸດ
        </h1>
        <p className="page-subtitle">ສ້າງ, ແກ້ໄຂ, ປິດ-ເປີດ ລະຫັດສ່ວນຫຼຸດສຳລັບລູກຄ້າ</p>

        {!showForm && (
          <div className="top-actions">
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <FontAwesomeIcon icon={faPlus} /> ສ້າງລະຫັດໃໝ່
            </button>
          </div>
        )}

        {showForm && (
          <form className="coupon-form-card" onSubmit={handleSubmit}>
            <h3 style={{ margin: "0 0 16px" }}>
              {editingId ? "ແກ້ໄຂລະຫັດສ່ວນຫຼຸດ" : "ສ້າງລະຫັດສ່ວນຫຼຸດໃໝ່"}
            </h3>
            <div className="form-grid">
              <div className="form-field">
                <label>ລະຫັດ *</label>
                <input
                  className="form-control"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="WELCOME10"
                  required
                  disabled={!!editingId}
                  style={{ fontFamily: "monospace", textTransform: "uppercase" }}
                />
              </div>
              <div className="form-field">
                <label>ປະເພດ *</label>
                <select
                  className="form-control"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option value="percentage">ເປີເຊັນ (%)</option>
                  <option value="fixed">ຈຳນວນເງິນ (ກີບ)</option>
                </select>
              </div>
              <div className="form-field">
                <label>ມູນຄ່າ *</label>
                <input
                  type="number"
                  className="form-control"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  required
                  min="0"
                  max={form.type === "percentage" ? 100 : undefined}
                />
              </div>
              <div className="form-field">
                <label>ຍອດສິນຄ້າຂັ້ນຕ່ຳ</label>
                <input
                  type="number"
                  className="form-control"
                  value={form.minOrderAmount}
                  onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                  min="0"
                  placeholder="0"
                />
              </div>
              {form.type === "percentage" && (
                <div className="form-field">
                  <label>ເພດານສ່ວນຫຼຸດ (ກີບ)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={form.maxDiscount}
                    onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                    placeholder="ບໍ່ຈຳກັດ"
                  />
                </div>
              )}
              <div className="form-field">
                <label>ໃຊ້ໄດ້ສູງສຸດ (ທັງໝົດ)</label>
                <input
                  type="number"
                  className="form-control"
                  value={form.usageLimit}
                  onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                  placeholder="ບໍ່ຈຳກັດ"
                  min="1"
                />
              </div>
              <div className="form-field">
                <label>ຕໍ່ user ໃຊ້ໄດ້ກີ່ຄັ້ງ</label>
                <input
                  type="number"
                  className="form-control"
                  value={form.perUserLimit}
                  onChange={(e) => setForm({ ...form, perUserLimit: e.target.value })}
                  min="1"
                />
              </div>
              <div className="form-field">
                <label>ໝົດອາຍຸ</label>
                <input
                  type="date"
                  className="form-control"
                  value={form.validUntil}
                  onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                />
              </div>
              <div className="form-field" style={{ gridColumn: "1 / -1" }}>
                <label>ຄຳອະທິບາຍ</label>
                <input
                  className="form-control"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="ສ່ວນຫຼຸດສຳລັບລູກຄ້າໃໝ່"
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={resetForm}>
                ຍົກເລີກ
              </button>
              <button type="submit" className="btn-primary" disabled={creating}>
                {creating ? "ກຳລັງບັນທຶກ..." : editingId ? "ບັນທຶກ" : "ສ້າງ"}
              </button>
            </div>
          </form>
        )}

        {isLoading ? (
          <div style={{ textAlign: "center", padding: 40 }}>ກຳລັງໂຫຼດ...</div>
        ) : coupons.length === 0 ? (
          <div className="empty-state">
            <FontAwesomeIcon icon={faTicket} size="3x" style={{ color: "#cbd5e1", marginBottom: 16 }} />
            <h4>ຍັງບໍ່ມີລະຫັດສ່ວນຫຼຸດ</h4>
            <p style={{ color: "#94a3b8" }}>ກົດ "ສ້າງລະຫັດໃໝ່" ເພື່ອເລີ່ມ</p>
          </div>
        ) : (
          <div className="coupons-grid">
            {coupons.map((c) => (
              <div key={c._id} className={`coupon-card ${!c.active ? "inactive" : ""}`}>
                <div className="coupon-code">{c.code}</div>
                <div className="coupon-discount">
                  {c.type === "percentage"
                    ? `ສ່ວນຫຼຸດ ${c.value}%`
                    : `ສ່ວນຫຼຸດ ${c.value.toLocaleString()} ກີບ`}
                  {c.maxDiscount && c.type === "percentage" && ` (ສູງສຸດ ${c.maxDiscount.toLocaleString()})`}
                </div>
                <div className="coupon-meta">
                  {c.description && <div>📝 {c.description}</div>}
                  {c.minOrderAmount > 0 && (
                    <div>💰 ຂັ້ນຕ່ຳ {c.minOrderAmount.toLocaleString()} ກີບ</div>
                  )}
                  <div>📊 ໃຊ້ໄປ {c.usageCount} / {c.usageLimit ?? "∞"}</div>
                  {c.validUntil && (
                    <div>📅 ໝົດອາຍຸ: {new Date(c.validUntil).toLocaleDateString("lo-LA")}</div>
                  )}
                  <div style={{ color: c.active ? "#10b981" : "#ef4444", fontWeight: 600 }}>
                    {c.active ? "● ເປີດໃຊ້ງານ" : "● ປິດໃຊ້ງານ"}
                  </div>
                </div>
                <div className="coupon-actions">
                  <button className="action-btn btn-toggle" onClick={() => toggleActive(c)}>
                    {c.active ? "ປິດ" : "ເປີດ"}
                  </button>
                  <button className="action-btn btn-edit" onClick={() => handleEdit(c)}>
                    <FontAwesomeIcon icon={faPencilAlt} /> ແກ້ໄຂ
                  </button>
                  <button className="action-btn btn-delete" onClick={() => handleDelete(c)}>
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
