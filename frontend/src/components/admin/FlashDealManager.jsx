import React, { useState, useEffect, useMemo } from "react";
import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import toast from "react-hot-toast";
import { useGetFlashDealQuery, useUpdateFlashDealMutation } from "../redux/api/flashDealApi";
import { useGetProductsQuery } from "../redux/api/productsApi";
import Breadcrumb from "./_shared/Breadcrumb";

/* ─── helpers ─────────────────────────────────────────────── */
const fmtLAK = (v) => `₭${Number(v || 0).toLocaleString("lo-LA")}`;

const resolveImg = (images) => {
  const first = images?.[0];
  if (!first) return "/images/default_product.png";
  return first.url || first.path || "/images/default_product.png";
};

const toLocalDatetimeInput = (date) => {
  if (!date) return "";
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

/* ─── CSS ─────────────────────────────────────────────────── */
const CSS = `
/* ── Full-width wrap ── */
.fdm-wrap { width: 100%; }

.fdm-grid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 20px;
  align-items: start;
}
@media(max-width:1100px){ .fdm-grid{ grid-template-columns: 1fr; } }

.fdm-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #f0f0f5;
  box-shadow: 0 2px 12px rgba(0,0,0,.06);
  padding: 22px 26px;
  margin-bottom: 18px;
}
.fdm-title {
  font-size: .95rem; font-weight: 800; color: #1e293b; margin-bottom: 16px;
  display: flex; align-items: center; gap: 8px;
}

/* settings inline grid */
.fdm-settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
@media(max-width:700px){ .fdm-settings-grid{ grid-template-columns: 1fr; } }

/* search */
.fdm-search-wrap { position: relative; margin-bottom: 12px; }
.fdm-search {
  width: 100%; padding: .5rem 1rem .5rem 2.4rem;
  border: 1.5px solid #e2e8f0; border-radius: 10px;
  font-size: .85rem; outline: none; transition: border-color .2s;
}
.fdm-search:focus { border-color: #667eea; box-shadow: 0 0 0 3px rgba(102,126,234,.1); }
.fdm-search-icon { position: absolute; left: .75rem; top: 50%; transform: translateY(-50%); color: #94a3b8; font-size: .85rem; }

/* product list */
.fdm-product-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
  max-height: 480px;
  overflow-y: auto;
  padding: 4px 2px;
  scrollbar-width: thin;
}
.fdm-p-item {
  border: 2px solid #e2e8f0; border-radius: 12px;
  padding: 10px; cursor: pointer; transition: all .18s;
  background: #fff; text-align: center; position: relative;
}
.fdm-p-item:hover { border-color: #667eea; background: #f5f7ff; transform: translateY(-2px); }
.fdm-p-item.selected { border-color: #667eea; background: #eef2ff; box-shadow: 0 4px 12px rgba(102,126,234,.2); }
.fdm-p-item .check {
  position: absolute; top: 6px; right: 6px;
  width: 20px; height: 20px; border-radius: 50%;
  background: #667eea; color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: .7rem; font-weight: 800;
}
.fdm-p-img { width: 72px; height: 72px; object-fit: contain; margin: 0 auto 6px; display: block; }
.fdm-p-name {
  font-size: .7rem; font-weight: 600; color: #1e293b;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  line-height: 1.3; margin-bottom: 4px;
}
.fdm-p-price { font-size: .7rem; color: #e11d48; font-weight: 800; }

/* selected pills */
.fdm-selected-pills { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.fdm-pill {
  display: flex; align-items: center; gap: 6px;
  background: #eef2ff; border: 1px solid #c7d2fe;
  border-radius: 999px; padding: 4px 10px;
  font-size: .75rem; font-weight: 600; color: #4338ca;
}
.fdm-pill-img { width: 20px; height: 20px; object-fit: contain; border-radius: 4px; }
.fdm-pill-rm {
  background: none; border: none; cursor: pointer;
  color: #9ca3af; font-size: .8rem; padding: 0; line-height: 1; transition: color .15s;
}
.fdm-pill-rm:hover { color: #e11d48; }

/* form fields */
.fdm-field { margin-bottom: 0; }
.fdm-label { font-size: .72rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: .04em; margin-bottom: 5px; display: block; }
.fdm-input {
  width: 100%; padding: .5rem .85rem;
  border: 1.5px solid #e2e8f0; border-radius: 10px;
  font-size: .875rem; color: #1e293b; outline: none; transition: border-color .2s;
}
.fdm-input:focus { border-color: #667eea; box-shadow: 0 0 0 3px rgba(102,126,234,.1); }

/* toggle */
.fdm-toggle-row { display: flex; align-items: center; gap: 12px; height: 40px; }
.fdm-toggle { position: relative; width: 44px; height: 24px; flex-shrink: 0; }
.fdm-toggle input { opacity: 0; width: 0; height: 0; }
.fdm-toggle-slider {
  position: absolute; inset: 0; background: #cbd5e1;
  border-radius: 999px; cursor: pointer; transition: background .2s;
}
.fdm-toggle-slider:before {
  content: ''; position: absolute; width: 18px; height: 18px;
  border-radius: 50%; background: #fff; top: 3px; left: 3px;
  transition: transform .2s; box-shadow: 0 1px 3px rgba(0,0,0,.2);
}
.fdm-toggle input:checked + .fdm-toggle-slider { background: #10b981; }
.fdm-toggle input:checked + .fdm-toggle-slider:before { transform: translateX(20px); }

/* save btn */
.fdm-save-btn {
  width: 100%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff; border: none; border-radius: 12px;
  padding: .75rem 1.8rem; font-size: .95rem; font-weight: 800;
  cursor: pointer; transition: all .2s;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  margin-top: 18px;
}
.fdm-save-btn:hover { box-shadow: 0 6px 20px rgba(102,126,234,.45); transform: translateY(-1px); }
.fdm-save-btn:disabled { opacity: .6; cursor: not-allowed; transform: none; }

/* discount row */
.fdm-discount-row { display: flex; align-items: center; gap: 12px; }
.fdm-discount-input {
  width: 90px; padding: .5rem .75rem;
  border: 1.5px solid #e2e8f0; border-radius: 10px;
  font-size: 1rem; font-weight: 800; color: #e11d48;
  text-align: center; outline: none; transition: border-color .2s;
}
.fdm-discount-input:focus { border-color: #e11d48; box-shadow: 0 0 0 3px rgba(225,29,72,.1); }
.fdm-discount-badge {
  display: inline-flex; align-items: center; gap: 4px;
  background: linear-gradient(135deg,#f43f5e,#e11d48);
  color: #fff; border-radius: 8px; padding: 6px 14px;
  font-size: .88rem; font-weight: 800;
}

/* ── RIGHT: Preview ── */
.fdm-right-sticky { position: sticky; top: 70px; }

.fdm-preview-box {
  background: linear-gradient(160deg, #0f0c29, #302b63, #24243e);
  border-radius: 16px; padding: 20px; color: #fff;
}
.fdm-preview-head {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 6px;
}
.fdm-preview-title { font-size: .95rem; font-weight: 900; color: #fbbf24; }
.fdm-preview-pct {
  background: #f43f5e; color: #fff;
  font-size: .62rem; font-weight: 800;
  border-radius: 20px; padding: 2px 8px;
}
.fdm-preview-sub { font-size: .65rem; color: rgba(255,255,255,.45); margin-bottom: 14px; }
.fdm-preview-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.15), transparent);
  margin: 0 0 12px;
}

/* 2-column product grid in preview */
.fdm-preview-products {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.fdm-preview-card {
  display: flex; flex-direction: column;
  background: rgba(255,255,255,.07);
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 10px; padding: 10px;
  text-decoration: none; color: inherit;
  transition: background .15s;
  position: relative; overflow: hidden;
}
.fdm-preview-card:hover { background: rgba(255,255,255,.14); }
.fdm-preview-badge {
  position: absolute; top: 6px; left: 6px;
  background: #f43f5e; color: #fff;
  font-size: .55rem; font-weight: 900;
  border-radius: 4px; padding: 1px 5px;
}
.fdm-preview-img {
  width: 100%; aspect-ratio: 1; object-fit: contain;
  background: rgba(255,255,255,.08); border-radius: 8px;
  padding: 6px; margin-bottom: 8px;
}
.fdm-preview-name {
  font-size: .68rem; color: rgba(255,255,255,.85); margin: 0 0 4px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  line-height: 1.3;
}
.fdm-preview-price { font-size: .8rem; font-weight: 900; color: #fbbf24; margin: 0; }
.fdm-preview-price-orig { font-size: .62rem; color: rgba(255,255,255,.32); text-decoration: line-through; margin: 0; }

.fdm-preview-empty {
  grid-column: 1 / -1;
  text-align: center; color: rgba(255,255,255,.3);
  font-size: .75rem; padding: 2rem;
}
`;

/* ─── Component ───────────────────────────────────────────── */
export default function FlashDealManager() {
  const { data: flashData, isLoading: loadingDeal } = useGetFlashDealQuery();
  const { data: productsData, isLoading: loadingProducts } = useGetProductsQuery({ page: 1 });
  const [updateFlashDeal, { isLoading: saving }] = useUpdateFlashDealMutation();

  const [label,          setLabel]          = useState("Flash Deal");
  const [endsAt,         setEndsAt]         = useState("");
  const [isActive,       setIsActive]       = useState(true);
  const [discountPercent,setDiscountPercent]= useState(0);
  const [selected,       setSelected]       = useState([]);
  const [search,         setSearch]         = useState("");

  /* init from API */
  useEffect(() => {
    const deal = flashData?.deal;
    if (!deal) return;
    setLabel(deal.label || "Flash Deal");
    setEndsAt(toLocalDatetimeInput(deal.endsAt));
    setIsActive(deal.isActive ?? true);
    setDiscountPercent(deal.discountPercent ?? 0);
    setSelected(deal.products || []);
  }, [flashData]);

  const allProducts = productsData?.products || [];

  const filtered = useMemo(() => {
    if (!search) return allProducts;
    const q = search.toLowerCase();
    return allProducts.filter((p) =>
      (p.name || "").toLowerCase().includes(q)
    );
  }, [allProducts, search]);

  const selectedIds = useMemo(() => new Set(selected.map((p) => p._id)), [selected]);

  const toggleProduct = (product) => {
    if (selectedIds.has(product._id)) {
      setSelected((prev) => prev.filter((p) => p._id !== product._id));
    } else {
      if (selected.length >= 6) return toast.error("ເລືອກໄດ້ສູງສຸດ 6 ສິນຄ້າ");
      setSelected((prev) => [...prev, product]);
    }
  };

  const handleSave = async () => {
    try {
      await updateFlashDeal({
        label,
        products: selected.map((p) => p._id),
        endsAt: endsAt || null,
        isActive,
        discountPercent: Number(discountPercent) || 0,
      }).unwrap();
      toast.success("ບັນທຶກ Flash Deal ສຳເລັດ ✅");
    } catch (err) {
      toast.error(err?.data?.message || "ເກີດຂໍ້ຜິດພາດ");
    }
  };

  return (
    <>
      <MetaData title="Admin — Flash Deal Manager" />
      <style>{CSS}</style>
      <AdminLayout>
        <div className="fdm-wrap">
          <Breadcrumb items={[{ label: "Flash Deal Manager" }]} />

          {/* Page Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h4 className="fw-bold mb-0" style={{ color: "#1e293b" }}>⚡ Flash Deal Manager</h4>
              <p style={{ fontSize: ".82rem", color: "#94a3b8", margin: 0 }}>
                ເລືອກສິນຄ້າ, ຕັ້ງເວລາ, ແລ້ວ sidebar ຈະ update ທັນທີ
              </p>
            </div>
          </div>

          <div className="fdm-grid">

            {/* ══ LEFT: Settings + Product Picker ══ */}
            <div>
              {/* Settings Card */}
              <div className="fdm-card">
                <div className="fdm-title">⚙️ ຕັ້ງຄ່າ</div>
                <div className="fdm-settings-grid">

                  <div className="fdm-field">
                    <label className="fdm-label">ຊື່ Flash Deal</label>
                    <input className="fdm-input" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Flash Deal" />
                  </div>

                  <div className="fdm-field">
                    <label className="fdm-label">ສິ້ນສຸດວັນທີ</label>
                    <input type="datetime-local" className="fdm-input" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
                  </div>

                  <div className="fdm-field">
                    <label className="fdm-label">ສ່ວນຫຼຸດ (%)</label>
                    <div className="fdm-discount-row">
                      <input
                        type="number" className="fdm-discount-input"
                        min={0} max={90} step={1} value={discountPercent}
                        onChange={(e) => setDiscountPercent(Math.min(90, Math.max(0, Number(e.target.value))))}
                      />
                      <span style={{ fontSize: ".85rem", color: "#64748b" }}>%</span>
                      {discountPercent > 0 && (
                        <span className="fdm-discount-badge">🔥 -{discountPercent}% OFF</span>
                      )}
                    </div>
                  </div>

                  <div className="fdm-field">
                    <label className="fdm-label">ສະຖານະ</label>
                    <div className="fdm-toggle-row">
                      <label className="fdm-toggle">
                        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                        <span className="fdm-toggle-slider" />
                      </label>
                      <span style={{ fontSize: ".85rem", fontWeight: 700, color: isActive ? "#059669" : "#94a3b8" }}>
                        {isActive ? "🟢 ເປີດໃຊ້ງານ" : "⚫ ປິດ"}
                      </span>
                    </div>
                  </div>
                </div>

                <button className="fdm-save-btn" onClick={handleSave} disabled={saving}>
                  {saving ? "⏳ ກຳລັງບັນທຶກ..." : "💾 ບັນທຶກ Flash Deal"}
                </button>
              </div>

              {/* Product Picker */}
              <div className="fdm-card">
                <div className="fdm-title">
                  🛒 ເລືອກສິນຄ້າ
                  <span style={{ fontSize: ".75rem", fontWeight: 400, color: "#94a3b8" }}>
                    ({selected.length}/6 ລາຍການ)
                  </span>
                  {selected.length >= 6 && (
                    <span style={{ fontSize: ".7rem", color: "#e11d48", fontWeight: 700, marginLeft: 4 }}>
                      ເຕັມແລ້ວ
                    </span>
                  )}
                </div>

                <div className="fdm-search-wrap">
                  <span className="fdm-search-icon">🔍</span>
                  <input
                    type="text" className="fdm-search"
                    placeholder="ຄົ້ນຫາສິນຄ້າ..."
                    value={search} onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                {loadingProducts ? (
                  <div style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>ກຳລັງໂຫຼດ...</div>
                ) : (
                  <div className="fdm-product-list">
                    {filtered.map((p) => {
                      const isSelected = selectedIds.has(p._id);
                      return (
                        <div
                          key={p._id}
                          className={`fdm-p-item${isSelected ? " selected" : ""}`}
                          onClick={() => toggleProduct(p)}
                        >
                          {isSelected && <div className="check">✓</div>}
                          <img src={resolveImg(p.images)} alt={p.name} className="fdm-p-img"
                            onError={(e) => (e.currentTarget.src = "/images/default_product.png")} />
                          <div className="fdm-p-name">{p.name}</div>
                          <div className="fdm-p-price">{fmtLAK(p.salePrice || p.price)}</div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {selected.length > 0 && (
                  <div className="fdm-selected-pills">
                    {selected.map((p) => (
                      <div key={p._id} className="fdm-pill">
                        <img src={resolveImg(p.images)} alt="" className="fdm-pill-img"
                          onError={(e) => (e.currentTarget.src = "/images/default_product.png")} />
                        <span style={{ maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                        <button type="button" className="fdm-pill-rm" onClick={() => toggleProduct(p)}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ══ RIGHT: Live Preview ══ */}
            <div className="fdm-right-sticky">
              <div className="fdm-card">
                <div className="fdm-title">👁 ຕົວຢ່າງ Sidebar Live</div>

                <div className="fdm-preview-box">
                  {/* Header */}
                  <div className="fdm-preview-head">
                    <span className="fdm-preview-title">⚡ {label || "Flash Deal"}</span>
                    {discountPercent > 0 && (
                      <span className="fdm-preview-pct">-{discountPercent}%</span>
                    )}
                  </div>
                  <div className="fdm-preview-sub">
                    {endsAt
                      ? `ສິ້ນສຸດ: ${new Date(endsAt).toLocaleString("lo-LA")}`
                      : "ຍັງບໍ່ໄດ້ຕັ້ງວັນສິ້ນສຸດ"}
                  </div>
                  <div className="fdm-preview-divider" />

                  {/* Products 2-col grid */}
                  <div className="fdm-preview-products">
                    {selected.length === 0 ? (
                      <div className="fdm-preview-empty">
                        ເລືອກສິນຄ້າດ້ານຊ້າຍ<br/>ເພື່ອເບິ່ງ preview
                      </div>
                    ) : (
                      selected.map((p) => {
                        const origPrice = p.salePrice || p.price;
                        const dealPrice = discountPercent > 0
                          ? Math.round(origPrice * (1 - discountPercent / 100))
                          : origPrice;
                        return (
                          <div key={p._id} className="fdm-preview-card">
                            {discountPercent > 0 && (
                              <span className="fdm-preview-badge">-{discountPercent}%</span>
                            )}
                            <img src={resolveImg(p.images)} alt={p.name} className="fdm-preview-img"
                              onError={(e) => (e.currentTarget.src = "/images/default_product.png")} />
                            <p className="fdm-preview-name">{p.name}</p>
                            {discountPercent > 0 && (
                              <p className="fdm-preview-price-orig">{fmtLAK(origPrice)}</p>
                            )}
                            <p className="fdm-preview-price">{fmtLAK(dealPrice)}</p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div style={{ marginTop: 14, fontSize: ".75rem", color: "#94a3b8", lineHeight: 1.7,
                  background: "#f8fafc", borderRadius: 10, padding: "10px 14px" }}>
                  💡 <strong>ໝາຍເຫດ:</strong> ກົດ "ບັນທຶກ Flash Deal" ແລ້ວ sidebar ໜ້າ Home ຈະ update ທັນທີ.
                  ສິນຄ້າທີ່ເລືອກຈະສະແດງ 2 ຄໍລຳ ໃນ sidebar ຂະໜາດ 420px.
                </div>
              </div>
            </div>

          </div>
        </div>
      </AdminLayout>
    </>
  );
}
