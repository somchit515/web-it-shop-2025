import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import MetaData from "../layout/MetaData";
import { useGetBlogsQuery } from "../redux/api/blogApi";

/* ─── Config ──────────────────────────────────────── */
const CATS = [
  { id: "all",    name: "ທັງໝົດ",       icon: "📚", color: "#667eea", bg: "#f0f4ff" },
  { id: "tech",   name: "ເທັກໂນໂລຢີ", icon: "💻", color: "#2563eb", bg: "#eff6ff" },
  { id: "review", name: "ລີວິວ",        icon: "⭐", color: "#d97706", bg: "#fffbeb" },
  { id: "guide",  name: "ຄູ່ມື",        icon: "📖", color: "#059669", bg: "#f0fdf4" },
  { id: "news",   name: "ຂ່າວສານ",     icon: "📰", color: "#7c3aed", bg: "#faf5ff" },
];
const CAT = Object.fromEntries(CATS.map((c) => [c.id, c]));

/* ─── Helpers ─────────────────────────────────────── */
const fmtNum = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n || 0));

const timeAgo = (d) => {
  if (!d) return "";
  const s = (Date.now() - new Date(d)) / 1000;
  if (s < 3600)   return `${Math.floor(s / 60)} ນາທີກ່ອນ`;
  if (s < 86400)  return `${Math.floor(s / 3600)} ຊຊ.ກ່ອນ`;
  if (s < 604800) return `${Math.floor(s / 86400)} ວັນກ່ອນ`;
  return new Date(d).toLocaleDateString("lo-LA", { year: "numeric", month: "short", day: "2-digit" });
};

const blogImg = (b) =>
  b?.image || (Array.isArray(b?.images) && b.images[0]) || null;

const blogLink = (b) => `/blog/${b?.slug || b?._id}`;

/* ─── Debounce hook ───────────────────────────────── */
function useDebounce(val, delay) {
  const [dv, setDv] = useState(val);
  useEffect(() => {
    const t = setTimeout(() => setDv(val), delay);
    return () => clearTimeout(t);
  }, [val, delay]);
  return dv;
}

/* ─── Skeleton ────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="bl-card">
      <div className="bl-card-img bl-sk-img" />
      <div className="bl-card-body">
        <div className="bl-sk bl-sk-badge" />
        <div className="bl-sk bl-sk-title" />
        <div className="bl-sk bl-sk-line" />
        <div className="bl-sk bl-sk-line bl-sk-short" />
        <div className="bl-sk bl-sk-foot" />
      </div>
    </div>
  );
}

/* ─── Featured Card ───────────────────────────────── */
function Featured({ blog }) {
  const cat = CAT[blog.category] || CAT.tech;
  const img = blogImg(blog);
  return (
    <Link to={blogLink(blog)} className="bl-feat">
      <div className="bl-feat-img">
        {img
          ? <img src={img} alt={blog.title} onError={(e) => { e.currentTarget.style.display = "none"; }} />
          : <div className="bl-feat-placeholder" style={{ "--c": cat.color }}>{cat.icon}</div>
        }
        <div className="bl-feat-overlay" />
        <span className="bl-feat-badge">⭐ ແນະນຳ</span>
        <div className="bl-feat-meta-bottom">
          <span className="bl-cat-pill" style={{ "--cc": cat.color, "--cb": "rgba(255,255,255,.15)" }}>
            {cat.icon} {cat.name}
          </span>
          <span className="bl-feat-date">{timeAgo(blog.publishedAt || blog.createdAt)}</span>
        </div>
      </div>
      <div className="bl-feat-body">
        <h2 className="bl-feat-title">{blog.title}</h2>
        <p className="bl-feat-excerpt">{blog.excerpt}</p>
        <div className="bl-feat-info">
          <div className="bl-info-row">
            <span>👤 {blog.author || blog.authorId?.name || "IT HUBB"}</span>
            <span>⏱ {blog.readTime || "5 ນາທີ"}</span>
          </div>
          <div className="bl-info-row">
            <span>👁 {fmtNum(blog.views)} ຄັ້ງ</span>
            <span>💬 {blog.comments?.length || 0} ຄຳເຫັນ</span>
          </div>
        </div>
        <span className="bl-feat-cta">ອ່ານຕໍ່ →</span>
      </div>
    </Link>
  );
}

/* ─── Blog Card ───────────────────────────────────── */
function BlogCard({ blog }) {
  const cat = CAT[blog.category] || CAT.tech;
  const img = blogImg(blog);
  return (
    <Link to={blogLink(blog)} className="bl-card">
      <div className="bl-card-img">
        {img
          ? <img src={img} alt={blog.title} onError={(e) => { e.currentTarget.style.display = "none"; }} />
          : <div className="bl-card-placeholder" style={{ "--c": cat.color }}>{cat.icon}</div>
        }
        <span className="bl-cat-pill bl-card-cat" style={{ "--cc": cat.color, "--cb": cat.bg }}>
          {cat.icon} {cat.name}
        </span>
      </div>
      <div className="bl-card-body">
        <h3 className="bl-card-title">{blog.title}</h3>
        <p className="bl-card-excerpt">{blog.excerpt}</p>
        <div className="bl-card-foot">
          <span className="bl-card-author">👤 {blog.author || blog.authorId?.name || "IT HUBB"}</span>
          <div className="bl-card-stats">
            <span>👁 {fmtNum(blog.views)}</span>
            <span>⏱ {blog.readTime || "5 ນ"}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ─── Main ────────────────────────────────────────── */
export default function Blog() {
  const [cat,    setCat]    = useState("all");
  const [search, setSearch] = useState("");
  const [page,   setPage]   = useState(1);
  const [top,    setTop]    = useState(false);
  const searchRef = useRef();
  const dSearch   = useDebounce(search, 420);

  const { data, isLoading, isFetching } = useGetBlogsQuery({
    category: cat === "all" ? undefined : cat,
    search:   dSearch || undefined,
    page,
    limit: 9,
  });

  const blogs = data?.blogs      || [];
  const pg    = data?.pagination || {};
  const busy  = isLoading || isFetching;

  useEffect(() => { setPage(1); }, [cat, dSearch]);

  useEffect(() => {
    const fn = () => setTop(window.scrollY > 400);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const goTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const featured = blogs[0];
  const rest     = blogs.slice(1);

  return (
    <>
      <MetaData title="ບລັອກ — IT HUBB" />
      <style>{css}</style>

      {/* ══ HERO ══ */}
      <section className="bl-hero">
        <div className="bl-orb bl-o1" />
        <div className="bl-orb bl-o2" />
        <div className="bl-orb bl-o3" />

        <div className="bl-hero-inner">
          <span className="bl-eyebrow">✦ IT HUBB Blog</span>
          <h1 className="bl-hero-h1">ບລັອກເທັກໂນໂລຢີ</h1>
          <p className="bl-hero-sub">ບົດຄວາມ · ລີວິວ · ຄູ່ມື ຈາກທີມງານ IT HUBB</p>

          <div className="bl-search-wrap">
            <span className="bl-s-icon">🔍</span>
            <input
              ref={searchRef}
              className="bl-search"
              placeholder="ຄົ້ນຫາບົດຄວາມ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="bl-s-clear" onClick={() => setSearch("")}>✕</button>
            )}
          </div>

          {!isLoading && (
            <div className="bl-hero-chips">
              <span>📚 {pg.totalBlogs || blogs.length} ບົດຄວາມ</span>
              <span>💻 ເທັກໂນໂລຢີ</span>
              <span>⭐ ລີວິວ</span>
              <span>📖 ຄູ່ມື</span>
              <span>📰 ຂ່າວ</span>
            </div>
          )}
        </div>
      </section>

      {/* ══ CATEGORY BAR (sticky) ══ */}
      <div className="bl-catbar">
        <div className="bl-catbar-scroll">
          {CATS.map((c) => (
            <button
              key={c.id}
              className={`bl-catbtn${cat === c.id ? " active" : ""}`}
              style={{ "--cc": c.color }}
              onClick={() => setCat(c.id)}
            >
              {c.icon} {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* ══ CONTENT ══ */}
      <div className="bl-page">

        {/* Loading */}
        {busy && (
          <div>
            <div className="bl-feat-sk" />
            <div className="bl-grid">
              {[...Array(6)].map((_, i) => <Skeleton key={i} />)}
            </div>
          </div>
        )}

        {/* Empty */}
        {!busy && blogs.length === 0 && (
          <div className="bl-empty">
            <div className="bl-empty-icon">🔍</div>
            <h3 className="bl-empty-title">ບໍ່ພົບບົດຄວາມ</h3>
            <p className="bl-empty-sub">ລອງປ່ຽນຄຳຄົ້ນຫາ ຫຼື ໝວດໝູ່ອື່ນ</p>
            <button
              className="bl-reset"
              onClick={() => { setCat("all"); setSearch(""); }}
            >
              ລ້າງຕົວກອງ
            </button>
          </div>
        )}

        {/* Featured */}
        {!busy && featured && (
          <section className="bl-section">
            <div className="bl-sec-head">
              <span className="bl-sec-title">⭐ ບົດຄວາມແນະນຳ</span>
              {(dSearch || cat !== "all") && pg.totalBlogs && (
                <span className="bl-sec-count">ພົບ {pg.totalBlogs} ບົດ</span>
              )}
            </div>
            <Featured blog={featured} />
          </section>
        )}

        {/* Grid */}
        {!busy && rest.length > 0 && (
          <section className="bl-section">
            <div className="bl-sec-head">
              <span className="bl-sec-title">
                {dSearch
                  ? `📋 ຜົນການຄົ້ນຫາ "${dSearch}"`
                  : cat === "all"
                    ? "📚 ບົດຄວາມທັງໝົດ"
                    : `${CAT[cat]?.icon} ${CAT[cat]?.name}`}
              </span>
              {pg.totalBlogs && (
                <span className="bl-sec-count">ທັງໝົດ {pg.totalBlogs} ບົດ</span>
              )}
            </div>
            <div className="bl-grid">
              {rest.map((b) => <BlogCard key={b._id} blog={b} />)}
            </div>
          </section>
        )}

        {/* Pagination */}
        {!busy && pg.totalPages > 1 && (
          <div className="bl-pager">
            <button
              className="bl-pager-btn"
              disabled={!pg.hasPrev}
              onClick={() => { setPage((p) => p - 1); goTop(); }}
            >
              ← ກ່ອນໜ້າ
            </button>
            <div className="bl-pager-nums">
              {[...Array(pg.totalPages)].map((_, i) => (
                <button
                  key={i}
                  className={`bl-pager-num${page === i + 1 ? " active" : ""}`}
                  onClick={() => { setPage(i + 1); goTop(); }}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              className="bl-pager-btn"
              disabled={!pg.hasNext}
              onClick={() => { setPage((p) => p + 1); goTop(); }}
            >
              ໜ້າຕໍ່ໄປ →
            </button>
          </div>
        )}
      </div>

      {/* Back to top */}
      <button
        className={`bl-top${top ? " show" : ""}`}
        onClick={goTop}
        aria-label="ກັບດ້ານເທິງ"
      >
        ↑
      </button>
    </>
  );
}

/* ─── CSS ─────────────────────────────────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;600;700;800&display=swap');

*, *::before, *::after { box-sizing: border-box; }

.bl-hero, .bl-catbar, .bl-page, .bl-card, .bl-feat,
.bl-empty, .bl-pager {
  font-family: 'Noto Sans Lao', 'Phetsarath OT', sans-serif;
}

/* ── Hero ── */
.bl-hero {
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
  padding: 5rem 1.5rem 4.5rem;
  position: relative;
  overflow: hidden;
  text-align: center;
}
.bl-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.32;
  pointer-events: none;
}
.bl-o1 { width: 550px; height: 550px; background: #667eea; top: -180px; left: -80px; }
.bl-o2 { width: 380px; height: 380px; background: #764ba2; bottom: -120px; right: -60px; }
.bl-o3 { width: 280px; height: 280px; background: #06b6d4; top: 10px; right: 22%; }

.bl-hero-inner {
  position: relative;
  z-index: 1;
  max-width: 680px;
  margin: 0 auto;
}
.bl-eyebrow {
  display: inline-block;
  font-size: .7rem;
  font-weight: 700;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: #a5b4fc;
  margin-bottom: 1rem;
}
.bl-hero-h1 {
  font-size: clamp(2rem, 5vw, 3.6rem);
  font-weight: 800;
  color: #fff;
  margin-bottom: .75rem;
  line-height: 1.1;
}
.bl-hero-sub { color: #c4b5fd; font-size: 1.05rem; margin-bottom: 2rem; }

/* Search */
.bl-search-wrap {
  position: relative;
  max-width: 540px;
  margin: 0 auto 1.75rem;
}
.bl-s-icon {
  position: absolute;
  left: 1.1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: .9rem;
  pointer-events: none;
}
.bl-search {
  width: 100%;
  padding: .9rem 3rem .9rem 2.8rem;
  border-radius: 50px;
  border: 1.5px solid rgba(255,255,255,.22);
  background: rgba(255,255,255,.1);
  color: #fff;
  font-size: .95rem;
  font-family: 'Noto Sans Lao', sans-serif;
  backdrop-filter: blur(12px);
  outline: none;
  transition: all .2s;
}
.bl-search::placeholder { color: rgba(255,255,255,.5); }
.bl-search:focus {
  background: rgba(255,255,255,.16);
  border-color: rgba(255,255,255,.45);
  box-shadow: 0 0 0 3px rgba(102,126,234,.3);
}
.bl-s-clear {
  position: absolute;
  right: .9rem;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255,255,255,.18);
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: .7rem;
  transition: background .15s;
}
.bl-s-clear:hover { background: rgba(255,255,255,.3); }

/* Hero chips */
.bl-hero-chips {
  display: flex;
  justify-content: center;
  gap: .6rem;
  flex-wrap: wrap;
}
.bl-hero-chips span {
  padding: .3rem .9rem;
  background: rgba(255,255,255,.1);
  border: 1px solid rgba(255,255,255,.16);
  border-radius: 50px;
  color: #e0e7ff;
  font-size: .75rem;
  font-weight: 600;
  backdrop-filter: blur(6px);
}

/* ── Category bar ── */
.bl-catbar {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 8px rgba(0,0,0,.06);
  position: sticky;
  top: 64px;
  z-index: 40;
}
.bl-catbar-scroll {
  display: flex;
  gap: .5rem;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
  padding: .6rem 1.5rem;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}
.bl-catbar-scroll::-webkit-scrollbar { display: none; }
.bl-catbtn {
  display: inline-flex;
  align-items: center;
  gap: .4rem;
  padding: .42rem 1.1rem;
  border-radius: 50px;
  border: 1.5px solid #e5e7eb;
  background: white;
  color: #64748b;
  font-size: .82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all .18s;
  white-space: nowrap;
  font-family: 'Noto Sans Lao', sans-serif;
}
.bl-catbtn:hover { border-color: var(--cc); color: var(--cc); background: rgba(0,0,0,.02); }
.bl-catbtn.active {
  background: var(--cc);
  color: white;
  border-color: var(--cc);
  box-shadow: 0 3px 10px rgba(0,0,0,.15);
}

/* ── Page ── */
.bl-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 5rem;
}

/* ── Section ── */
.bl-section { margin-bottom: 3rem; }
.bl-sec-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
  gap: 1rem;
  flex-wrap: wrap;
}
.bl-sec-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: #0f172a;
}
.bl-sec-count { font-size: .82rem; color: #94a3b8; }

/* ── Category pill ── */
.bl-cat-pill {
  display: inline-flex;
  align-items: center;
  gap: .3rem;
  padding: .22rem .75rem;
  border-radius: 50px;
  background: var(--cb);
  color: var(--cc);
  font-size: .7rem;
  font-weight: 700;
  width: fit-content;
}

/* ── Featured card ── */
.bl-feat {
  display: grid;
  grid-template-columns: 48% 1fr;
  background: white;
  border-radius: 22px;
  box-shadow: 0 4px 28px rgba(0,0,0,.08);
  border: 1px solid #f1f5f9;
  overflow: hidden;
  text-decoration: none;
  transition: all .28s;
}
.bl-feat:hover {
  transform: translateY(-5px);
  box-shadow: 0 16px 48px rgba(0,0,0,.13);
}
.bl-feat-img {
  position: relative;
  overflow: hidden;
  min-height: 340px;
  background: linear-gradient(135deg, #667eea, #764ba2);
}
.bl-feat-img img {
  width: 100%; height: 100%;
  object-fit: cover;
  display: block;
  transition: transform .4s ease;
}
.bl-feat:hover .bl-feat-img img { transform: scale(1.05); }
.bl-feat-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,.55) 0%, transparent 50%);
}
.bl-feat-placeholder {
  width: 100%; height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 5rem;
  opacity: .3;
  background: var(--c, #667eea);
}
.bl-feat-badge {
  position: absolute;
  top: 1.1rem;
  left: 1.1rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  font-size: .7rem;
  font-weight: 700;
  padding: .3rem .85rem;
  border-radius: 50px;
  z-index: 2;
}
.bl-feat-meta-bottom {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  right: 1rem;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .5rem;
  flex-wrap: wrap;
}
.bl-feat-date { font-size: .72rem; color: rgba(255,255,255,.75); }

.bl-feat-body {
  padding: 2.25rem 2rem;
  display: flex;
  flex-direction: column;
  gap: .85rem;
  justify-content: center;
}
.bl-feat-title {
  font-size: 1.65rem;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.bl-feat-excerpt {
  font-size: .95rem;
  color: #64748b;
  line-height: 1.65;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.bl-feat-info { display: flex; flex-direction: column; gap: .4rem; }
.bl-info-row {
  display: flex;
  gap: 1.25rem;
  font-size: .78rem;
  color: #94a3b8;
  flex-wrap: wrap;
}
.bl-feat-cta {
  display: inline-flex;
  align-items: center;
  gap: .4rem;
  padding: .65rem 1.5rem;
  border-radius: 50px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  font-size: .85rem;
  font-weight: 700;
  width: fit-content;
  transition: box-shadow .2s, transform .2s;
}
.bl-feat:hover .bl-feat-cta {
  box-shadow: 0 6px 20px rgba(102,126,234,.4);
  transform: translateX(3px);
}

/* ── Blog grid ── */
.bl-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

/* ── Blog card ── */
.bl-card {
  background: white;
  border-radius: 18px;
  box-shadow: 0 2px 14px rgba(0,0,0,.06);
  border: 1px solid #f1f5f9;
  overflow: hidden;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  transition: all .22s;
}
.bl-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 36px rgba(0,0,0,.12);
}
.bl-card-img {
  position: relative;
  height: 210px;
  background: #f1f5f9;
  overflow: hidden;
  flex-shrink: 0;
}
.bl-card-img img {
  width: 100%; height: 100%;
  object-fit: cover;
  display: block;
  transition: transform .32s;
}
.bl-card:hover .bl-card-img img { transform: scale(1.07); }
.bl-card-placeholder {
  width: 100%; height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3.5rem;
  opacity: .25;
}
.bl-card-cat {
  position: absolute;
  bottom: .75rem;
  left: .75rem;
}
.bl-card-body {
  padding: 1.25rem 1.35rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}
.bl-card-title {
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.4;
  margin-bottom: .5rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.bl-card-excerpt {
  font-size: .855rem;
  color: #64748b;
  line-height: 1.55;
  flex: 1;
  margin-bottom: .9rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.bl-card-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f1f5f9;
  padding-top: .75rem;
  font-size: .73rem;
  color: #94a3b8;
  gap: .5rem;
}
.bl-card-author {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 55%;
}
.bl-card-stats { display: flex; gap: .6rem; flex-shrink: 0; }

/* ── Skeleton ── */
.bl-feat-sk {
  height: 340px;
  border-radius: 22px;
  margin-bottom: 3rem;
  background: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%);
  background-size: 200% 100%;
  animation: bl-shim 1.4s infinite linear;
}
.bl-sk-img { height: 210px; background: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%); background-size: 200% 100%; animation: bl-shim 1.4s infinite linear; }
.bl-sk {
  border-radius: 6px;
  background: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%);
  background-size: 200% 100%;
  animation: bl-shim 1.4s infinite linear;
  margin-bottom: .5rem;
}
.bl-sk-badge { height: 20px; width: 64px; border-radius: 50px; }
.bl-sk-title { height: 16px; }
.bl-sk-line  { height: 12px; }
.bl-sk-short { width: 65%; }
.bl-sk-foot  { height: 12px; width: 80%; margin-top: .5rem; }
@keyframes bl-shim { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

/* ── Empty ── */
.bl-empty {
  text-align: center;
  padding: 5rem 2rem;
}
.bl-empty-icon { font-size: 4rem; opacity: .35; margin-bottom: 1rem; }
.bl-empty-title { font-size: 1.25rem; font-weight: 700; color: #1e293b; margin-bottom: .5rem; }
.bl-empty-sub   { color: #94a3b8; font-size: .9rem; margin-bottom: 1.5rem; }
.bl-reset {
  padding: .65rem 1.5rem;
  border-radius: 50px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  font-size: .875rem;
  font-weight: 700;
  cursor: pointer;
  font-family: 'Noto Sans Lao', sans-serif;
  transition: box-shadow .2s;
}
.bl-reset:hover { box-shadow: 0 4px 14px rgba(102,126,234,.4); }

/* ── Pagination ── */
.bl-pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .75rem;
  margin-top: 3rem;
  flex-wrap: wrap;
}
.bl-pager-btn {
  padding: .6rem 1.4rem;
  border-radius: 50px;
  border: 1.5px solid #e5e7eb;
  background: white;
  color: #374151;
  font-size: .85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all .18s;
  font-family: 'Noto Sans Lao', sans-serif;
}
.bl-pager-btn:hover:not(:disabled) { border-color: #667eea; color: #667eea; }
.bl-pager-btn:disabled { opacity: .4; cursor: not-allowed; }
.bl-pager-nums { display: flex; gap: .4rem; }
.bl-pager-num {
  width: 36px; height: 36px;
  border-radius: 50%;
  border: 1.5px solid #e5e7eb;
  background: white;
  color: #374151;
  font-size: .85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all .18s;
  font-family: 'Noto Sans Lao', sans-serif;
}
.bl-pager-num.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-color: transparent;
  box-shadow: 0 3px 10px rgba(102,126,234,.35);
}
.bl-pager-num:hover:not(.active) { border-color: #667eea; color: #667eea; }

/* ── Back to top ── */
.bl-top {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 46px; height: 46px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 1.1rem;
  cursor: pointer;
  box-shadow: 0 4px 18px rgba(102,126,234,.4);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all .25s;
  z-index: 100;
  opacity: 0;
  pointer-events: none;
  transform: translateY(8px);
}
.bl-top.show {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}
.bl-top:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(102,126,234,.5); }

/* ── Responsive ── */
@media (max-width: 1100px) {
  .bl-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 900px) {
  .bl-feat { grid-template-columns: 1fr; }
  .bl-feat-img { min-height: 260px; }
  .bl-feat-body { padding: 1.75rem 1.5rem; }
  .bl-feat-title { font-size: 1.4rem; }
}
@media (max-width: 640px) {
  .bl-hero { padding: 3.5rem 1rem 3rem; }
  .bl-page { padding: 1.5rem 1rem 3rem; }
  .bl-grid { grid-template-columns: 1fr; }
  .bl-catbar { top: 56px; }
  .bl-hero-h1 { font-size: 1.8rem; }
  .bl-feat-title { font-size: 1.2rem; }
  .bl-pager-nums { display: none; }
  .bl-top { bottom: 1.25rem; right: 1.25rem; }
}
@media (max-width: 400px) {
  .bl-hero-chips { display: none; }
  .bl-feat-body { padding: 1.25rem; }
}
`;
