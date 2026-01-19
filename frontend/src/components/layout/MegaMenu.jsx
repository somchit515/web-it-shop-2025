// src/components/layout/MegaMenu.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { CATEGORIES } from "../../utils/categories";

/**
 * Simple MegaMenu
 * - Shows dropdown grid on hover/focus (desktop)
 * - On mobile it becomes a simple link list (so you can navigate to /category/:slug)
 */
export default function MegaMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mega-menu-wrapper" onMouseLeave={() => setOpen(false)}>
      <button
        className="btn btn-light d-flex align-items-center"
        aria-haspopup="true"
        aria-expanded={open}
        onMouseEnter={() => setOpen(true)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        style={{ borderRadius: 8, padding: "8px 12px", fontWeight: 700 }}
      >
        หมวดสินค้า ▾
      </button>

      {/* Dropdown / mega panel */}
      <div
        className={`mega-panel shadow-sm ${open ? "show" : ""}`}
        role="menu"
        aria-hidden={!open}
        style={{
          position: "absolute",
          left: 16,
          top: "100%",
          width: 880,
          maxWidth: "calc(100% - 40px)",
          background: "#fff",
          borderRadius: 8,
          display: open ? "block" : "none",
          padding: 16,
          zIndex: 60,
        }}
        onMouseEnter={() => setOpen(true)}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to={`/category/${c.slug}`}
              className="text-decoration-none"
              role="menuitem"
              onClick={() => setOpen(false)}
              style={{ color: "#0b1220" }}
            >
              <div style={{ display: "flex", gap: 10, alignItems: "center", padding: 8, borderRadius: 8 }}>
                <img
                  src={c.img}
                  alt={c.title}
                  style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 6 }}
                  onError={(e) => (e.currentTarget.src = "/images/default_product.png")}
                />
                <div>
                  <div style={{ fontWeight: 700 }}>{c.title}</div>
                  {c.desc && <small style={{ color: "#6b7280" }}>{c.desc}</small>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile fallback: simple list (visible on small screens via CSS) */}
      <div className="d-block d-md-none mt-2">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {CATEGORIES.map((c) => (
            <Link key={c.slug} to={`/category/${c.slug}`} className="btn btn-sm btn-light">
              {c.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
