import React from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toggleWishlist, clearWishlist } from "../redux/features/wishlistSlice";
import { setcartItems } from "../redux/features/cartSlice";
import MetaData from "../layout/MetaData";
import toast from "react-hot-toast";

const formatLAK = (v) =>
  new Intl.NumberFormat("lo-LA", { style: "currency", currency: "LAK", maximumFractionDigits: 0 }).format(Number(v || 0));

const resolveImg = (img) => {
  if (!img) return "/images/default_product.png";
  const url = typeof img === "string" ? img : img?.url || img?.path || "";
  if (!url) return "/images/default_product.png";
  if (/^https?:\/\//i.test(url) || url.startsWith("/")) return url;
  return `/uploads/products/${url}`;
};

const CSS = `
  .wl-root{background:#f1f5f9;min-height:100vh;font-family:"Noto Sans Lao","Inter",sans-serif;padding-bottom:56px;}
  .wl-hero{background:linear-gradient(135deg,#f43f5e 0%,#e11d48 50%,#be123c 100%);padding:36px 24px 28px;color:#fff;position:relative;overflow:hidden;}
  .wl-hero::after{content:'';position:absolute;right:-60px;top:-60px;width:220px;height:220px;border-radius:50%;background:rgba(255,255,255,.07);pointer-events:none;}
  .wl-hero-inner{max-width:1400px;margin:0 auto;position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;}
  .wl-hero-left .wl-eyebrow{font-size:.72rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;opacity:.75;margin-bottom:6px;}
  .wl-hero-left .wl-title{font-size:1.9rem;font-weight:800;margin:0 0 4px;}
  .wl-hero-left .wl-sub{font-size:.88rem;opacity:.75;}
  .wl-clear-btn{background:rgba(255,255,255,.15);color:#fff;border:1.5px solid rgba(255,255,255,.3);border-radius:10px;padding:8px 18px;font-size:.82rem;font-weight:700;cursor:pointer;font-family:inherit;transition:background .15s;}
  .wl-clear-btn:hover{background:rgba(255,255,255,.28);}

  .wl-grid-wrap{max-width:1400px;margin:24px auto 0;padding:0 20px;}
  .wl-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:18px;}

  .wl-card{background:#fff;border-radius:16px;border:1px solid #e2e8f0;box-shadow:0 2px 8px rgba(0,0,0,.05);overflow:hidden;transition:all .2s;display:flex;flex-direction:column;}
  .wl-card:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(244,63,94,.12);}
  .wl-card-img{position:relative;height:200px;background:#f8fafc;overflow:hidden;}
  .wl-card-img img{width:100%;height:100%;object-fit:contain;padding:12px;transition:transform .3s;}
  .wl-card:hover .wl-card-img img{transform:scale(1.06);}
  .wl-remove-btn{position:absolute;top:8px;right:8px;background:rgba(255,255,255,.9);border:none;border-radius:50%;width:30px;height:30px;display:grid;place-items:center;cursor:pointer;font-size:.85rem;transition:all .15s;box-shadow:0 2px 6px rgba(0,0,0,.1);}
  .wl-remove-btn:hover{background:#fee2e2;}
  .wl-card-body{padding:14px;display:flex;flex-direction:column;flex:1;gap:6px;}
  .wl-card-name{font-size:.88rem;font-weight:700;color:#1e293b;text-decoration:none;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;line-height:1.4;}
  .wl-card-name:hover{color:#f43f5e;}
  .wl-card-seller{font-size:.72rem;color:#94a3b8;}
  .wl-card-price{font-size:1rem;font-weight:800;color:#f43f5e;margin-top:auto;}
  .wl-card-price .original{font-size:.78rem;color:#94a3b8;text-decoration:line-through;margin-right:6px;}
  .wl-card-actions{display:flex;gap:6px;margin-top:8px;}
  .wl-cart-btn{flex:1;padding:9px;border-radius:10px;background:linear-gradient(135deg,#f43f5e,#e11d48);color:#fff;border:none;font-size:.8rem;font-weight:700;cursor:pointer;font-family:inherit;transition:opacity .15s;}
  .wl-cart-btn:hover{opacity:.88;}
  .wl-cart-btn:disabled{opacity:.45;cursor:not-allowed;}
  .wl-view-btn{padding:9px 14px;border-radius:10px;border:1.5px solid #e2e8f0;background:#fff;color:#374151;font-size:.78rem;font-weight:700;text-decoration:none;display:inline-flex;align-items:center;transition:all .15s;}
  .wl-view-btn:hover{border-color:#f43f5e;color:#f43f5e;}

  .wl-empty{text-align:center;padding:80px 24px;background:#fff;border-radius:16px;box-shadow:0 2px 12px rgba(0,0,0,.06);}
  .wl-empty-icon{font-size:5rem;display:block;margin-bottom:16px;opacity:.35;}
  .wl-empty h3{font-size:1.2rem;color:#1e293b;margin-bottom:8px;}
  .wl-empty p{font-size:.88rem;color:#64748b;margin-bottom:20px;}
  .wl-empty-btn{display:inline-flex;align-items:center;gap:6px;padding:10px 22px;background:linear-gradient(135deg,#f43f5e,#e11d48);color:#fff;border-radius:999px;text-decoration:none;font-weight:700;font-size:.85rem;}
  @media(max-width:600px){.wl-grid{grid-template-columns:repeat(2,1fr);gap:12px;}.wl-grid-wrap{padding:0 12px;}}
`;

export default function WishlistPage() {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.wishlist);

  const addToCart = (item) => {
    if (!item.stock || item.stock <= 0) return toast.error("ສິນຄ້າໝົດ");
    dispatch(setcartItems({
      product: item._id, name: item.name,
      price: item.salePrice || item.price,
      image: resolveImg(item.images?.[0]),
      stock: item.stock, quantity: 1,
    }));
    toast.success("ເພີ່ມໄປກະຕ່າ 🛒");
  };

  return (
    <>
      <MetaData title="ລາຍການໂປດ — IT HUBB" />
      <style>{CSS}</style>
      <div className="wl-root">
        <div className="wl-hero">
          <div className="wl-hero-inner">
            <div className="wl-hero-left">
              <div className="wl-eyebrow">❤️ Wishlist</div>
              <div className="wl-title">ລາຍການໂປດ</div>
              <div className="wl-sub">{items.length} ລາຍການ</div>
            </div>
            {items.length > 0 && (
              <button className="wl-clear-btn" onClick={() => dispatch(clearWishlist())}>🗑️ ລ້າງທັງໝົດ</button>
            )}
          </div>
        </div>

        <div className="wl-grid-wrap">
          {items.length === 0 ? (
            <div className="wl-empty">
              <span className="wl-empty-icon">🤍</span>
              <h3>ລາຍການໂປດຍັງຫວ່າງ</h3>
              <p>ກົດ 🤍 ໃສ່ສິນຄ້າ ເພື່ອບັນທຶກໄວ້ເບິ່ງທີຫຼັງ</p>
              <Link to="/" className="wl-empty-btn">← ເລືອກສິນຄ້າ</Link>
            </div>
          ) : (
            <div className="wl-grid">
              {items.map((item) => (
                <div key={item._id} className="wl-card">
                  <div className="wl-card-img">
                    <img src={resolveImg(item.images?.[0])} alt={item.name}
                      onError={(e) => { e.currentTarget.src = "/images/default_product.png"; }} />
                    <button className="wl-remove-btn" onClick={() => dispatch(toggleWishlist(item))} title="ລຶບ">💔</button>
                  </div>
                  <div className="wl-card-body">
                    <Link to={`/product/${item._id}`} className="wl-card-name">{item.name}</Link>
                    <div className="wl-card-seller">🏪 {item.seller || "IT HUBB"}</div>
                    <div className="wl-card-price">
                      {item.salePrice && item.salePrice < item.price && (
                        <span className="original">{formatLAK(item.price)}</span>
                      )}
                      {formatLAK(item.salePrice || item.price)}
                    </div>
                    <div className="wl-card-actions">
                      <button className="wl-cart-btn" onClick={() => addToCart(item)} disabled={!item.stock}>
                        {item.stock > 0 ? "🛒 ເພີ່ມກະຕ່າ" : "❌ ໝົດ"}
                      </button>
                      <Link to={`/product/${item._id}`} className="wl-view-btn">👁</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
