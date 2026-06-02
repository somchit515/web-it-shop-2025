import React from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { removeFromCompare, clearCompare } from "../redux/features/compareSlice";
import { setcartItems } from "../redux/features/cartSlice";
import MetaData from "../layout/MetaData";
import toast from "react-hot-toast";

const formatLAK = (v) =>
  new Intl.NumberFormat("lo-LA", { style: "currency", currency: "LAK", maximumFractionDigits: 0 }).format(Number(v || 0));

const resolveImg = (img) => {
  if (!img) return "/images/default_product.png";
  const url = typeof img === "string" ? img : img.url || img.path || "";
  if (!url) return "/images/default_product.png";
  if (/^https?:\/\//i.test(url) || url.startsWith("/")) return url;
  return `/uploads/products/${url}`;
};

const SPECS = [
  { key: "price",        label: "ລາຄາ",          render: (p) => <span style={{ fontWeight: 800, color: "#4f46e5" }}>{formatLAK(p.salePrice || p.price)}</span> },
  { key: "category",    label: "ໝວດ",            render: (p) => p.category || "—" },
  { key: "seller",      label: "ຜູ້ຈຳໜ່າຍ",     render: (p) => p.seller || "—" },
  { key: "brand",       label: "Brand",           render: (p) => p.brand || p.seller || "—" },
  { key: "stock",       label: "ສາງ",            render: (p) => p.stock > 0 ? <span style={{ color: "#10b981" }}>✅ {p.stock} ຊິ້ນ</span> : <span style={{ color: "#ef4444" }}>❌ ໝົດ</span> },
  { key: "rating",      label: "ຄະແນນ",         render: (p) => p.ratings > 0 ? `⭐ ${Number(p.ratings).toFixed(1)} (${p.numOfReviews || 0})` : "ຍັງບໍ່ມີ" },
  { key: "description", label: "ລາຍລະອຽດ",      render: (p) => <span style={{ fontSize: ".78rem", color: "#64748b", lineHeight: 1.5 }}>{(p.description || "—").slice(0, 120)}{(p.description || "").length > 120 ? "…" : ""}</span> },
];

const CSS = `
  .cp-root{background:#f1f5f9;min-height:100vh;font-family:"Noto Sans Lao","Inter",sans-serif;padding-bottom:56px;}
  .cp-hero{background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);padding:36px 24px 28px;color:#fff;position:relative;overflow:hidden;}
  .cp-hero::after{content:'';position:absolute;right:-60px;top:-60px;width:220px;height:220px;border-radius:50%;background:rgba(255,255,255,.04);pointer-events:none;}
  .cp-hero-inner{max-width:1400px;margin:0 auto;position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;}
  .cp-hero-left .cp-eyebrow{font-size:.72rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;opacity:.6;margin-bottom:6px;}
  .cp-hero-left .cp-title{font-size:1.9rem;font-weight:800;margin:0 0 4px;}
  .cp-clear-btn{background:rgba(255,255,255,.1);color:#fff;border:1.5px solid rgba(255,255,255,.3);border-radius:10px;padding:8px 18px;font-size:.82rem;font-weight:700;cursor:pointer;transition:background .15s;font-family:inherit;backdrop-filter:blur(6px);}
  .cp-clear-btn:hover{background:rgba(255,255,255,.22);}

  .cp-wrap{max-width:1400px;margin:24px auto 0;padding:0 20px;}

  /* Table */
  .cp-table{width:100%;border-collapse:collapse;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.07);border:1px solid #e2e8f0;}
  .cp-th-label{width:140px;background:#fafbfd;border-right:1px solid #e2e8f0;padding:0;}
  .cp-th-product{text-align:center;border-right:1px solid #f1f5f9;padding:0;vertical-align:top;}
  .cp-th-product:last-child{border-right:none;}

  /* Product header */
  .cp-prod-head{padding:20px 16px;display:flex;flex-direction:column;align-items:center;gap:10px;position:relative;}
  .cp-prod-img{width:100px;height:100px;border-radius:12px;object-fit:cover;border:1px solid #e2e8f0;background:#f8fafc;}
  .cp-prod-name{font-size:.85rem;font-weight:700;color:#1e293b;text-align:center;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
  .cp-prod-view{display:inline-flex;align-items:center;gap:4px;padding:6px 12px;background:#ede9fe;color:#7c3aed;border-radius:8px;font-size:.72rem;font-weight:700;text-decoration:none;transition:all .15s;}
  .cp-prod-view:hover{background:#7c3aed;color:#fff;}
  .cp-prod-cart{width:100%;padding:7px;border-radius:8px;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;border:none;font-size:.75rem;font-weight:700;cursor:pointer;font-family:inherit;transition:opacity .15s;}
  .cp-prod-cart:hover{opacity:.88;}
  .cp-prod-remove{position:absolute;top:10px;right:10px;background:none;border:none;color:#94a3b8;cursor:pointer;font-size:.8rem;padding:4px;border-radius:6px;transition:all .15s;}
  .cp-prod-remove:hover{background:#fee2e2;color:#ef4444;}

  /* Row */
  .cp-row{border-top:1px solid #f1f5f9;}
  .cp-row:hover{background:#fafbff;}
  .cp-row-label{padding:14px 16px;font-size:.78rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.04em;background:#fafbfd;border-right:1px solid #e2e8f0;vertical-align:middle;white-space:nowrap;}
  .cp-row-val{padding:14px 16px;font-size:.85rem;color:#1e293b;text-align:center;border-right:1px solid #f1f5f9;vertical-align:middle;}
  .cp-row-val:last-child{border-right:none;}

  /* Empty */
  .cp-empty{text-align:center;padding:80px 24px;background:#fff;border-radius:16px;box-shadow:0 2px 12px rgba(0,0,0,.06);}
  .cp-empty-icon{font-size:4rem;display:block;margin-bottom:16px;opacity:.4;}
  .cp-empty h3{font-size:1.2rem;color:#1e293b;margin-bottom:8px;}
  .cp-empty p{font-size:.88rem;color:#64748b;margin-bottom:20px;}
  .cp-empty-btn{display:inline-flex;align-items:center;gap:6px;padding:10px 22px;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;border-radius:999px;text-decoration:none;font-weight:700;font-size:.85rem;}

  /* Add slot */
  .cp-add-slot{padding:20px 16px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;border:2px dashed #e2e8f0;border-radius:12px;margin:16px;color:#94a3b8;text-align:center;min-height:180px;}
  .cp-add-icon{font-size:2rem;opacity:.5;}
  .cp-add-lbl{font-size:.8rem;}

  @media(max-width:700px){.cp-th-label,.cp-row-label{width:90px;font-size:.7rem;padding:10px 8px;}.cp-row-val{padding:10px 8px;font-size:.78rem;}.cp-prod-head{padding:14px 10px;}.cp-prod-img{width:72px;height:72px;}.cp-wrap{padding:0 10px;}}
`;

export default function ComparePage() {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.compare);

  const addToCart = (product) => {
    if (!product.stock || product.stock <= 0) return toast.error("ສິນຄ້າໝົດ");
    dispatch(setcartItems({ product: product._id, name: product.name, price: product.salePrice || product.price, image: resolveImg(product.images?.[0]), stock: product.stock, quantity: 1 }));
    toast.success("ເພີ່ມໄປກະຕ່າ 🛒");
  };

  const MAX = 3;
  const slots = [...items, ...Array(MAX - items.length).fill(null)];

  return (
    <>
      <MetaData title="ປຽບທຽບສິນຄ້າ — IT HUBB" />
      <style>{CSS}</style>
      <div className="cp-root">
        <div className="cp-hero">
          <div className="cp-hero-inner">
            <div className="cp-hero-left">
              <div className="cp-eyebrow">⚖️ Compare</div>
              <div className="cp-title">ປຽບທຽບສິນຄ້າ</div>
            </div>
            {items.length > 0 && (
              <button className="cp-clear-btn" onClick={() => dispatch(clearCompare())}>🗑️ ລ້າງທັງໝົດ</button>
            )}
          </div>
        </div>

        <div className="cp-wrap">
          {items.length === 0 ? (
            <div className="cp-empty">
              <span className="cp-empty-icon">⚖️</span>
              <h3>ຍັງບໍ່ໄດ້ເລືອກສິນຄ້າ</h3>
              <p>ໄປທີ່ໜ້າສິນຄ້າ ແລ້ວກົດ "ປຽບທຽບ" ເພື່ອເພີ່ມ</p>
              <Link to="/" className="cp-empty-btn">← ໜ້າສິນຄ້າ</Link>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="cp-table">
                <colgroup>
                  <col style={{ width: 140 }} />
                  {slots.map((_, i) => <col key={i} />)}
                </colgroup>
                <thead>
                  <tr>
                    <th className="cp-th-label" />
                    {slots.map((product, i) => (
                      <th key={i} className="cp-th-product">
                        {product ? (
                          <div className="cp-prod-head">
                            <button className="cp-prod-remove" onClick={() => dispatch(removeFromCompare(product._id))} title="ລຶບ">✕</button>
                            <img src={resolveImg(product.images?.[0])} alt={product.name} className="cp-prod-img"
                              onError={(e) => { e.currentTarget.src = "/images/default_product.png"; }} />
                            <div className="cp-prod-name">{product.name}</div>
                            <Link to={`/product/${product._id}`} className="cp-prod-view">👁 ເບິ່ງ</Link>
                            <button className="cp-prod-cart" onClick={() => addToCart(product)}>🛒 ເພີ່ມກະຕ່າ</button>
                          </div>
                        ) : (
                          <div className="cp-add-slot">
                            <span className="cp-add-icon">+</span>
                            <span className="cp-add-lbl">ເພີ່ມສິນຄ້າ</span>
                            <Link to="/" style={{ color: "#4f46e5", fontSize: ".72rem", fontWeight: 700 }}>ເລືອກ</Link>
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SPECS.map((spec) => (
                    <tr key={spec.key} className="cp-row">
                      <td className="cp-row-label">{spec.label}</td>
                      {slots.map((product, i) => (
                        <td key={i} className="cp-row-val">
                          {product ? spec.render(product) : "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
