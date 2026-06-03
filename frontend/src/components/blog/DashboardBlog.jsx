import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useGetBlogsQuery } from "../redux/api/blogApi";
import MetaData from "../layout/MetaData";
import AdminLayout from "../layout/AdminLayout";

/* ─── helpers ─────────────────────────────────────── */
// eslint-disable-next-line no-unused-vars
const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("lo-LA", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      })
    : "—";

const timeAgo = (d) => {
  if (!d) return "";
  const diff = (Date.now() - new Date(d)) / 1000;
  if (diff < 60)    return "ຫາກໍ່ນີ້";
  if (diff < 3600)  return `${Math.floor(diff / 60)} ນາທີກ່ອນ`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ຊົ່ວໂມງກ່ອນ`;
  return `${Math.floor(diff / 86400)} ວັນກ່ອນ`;
};

const imgOf = (blog) =>
  blog?.image ||
  (Array.isArray(blog?.images) && blog.images[0]?.url) ||
  null;

/* ─── component ────────────────────────────────────── */
export default function BlogDashboardOverview() {
  const { data: blogData, isLoading } = useGetBlogsQuery({ limit: 1000 });

  const blogs     = useMemo(() => blogData?.blogs ?? [], [blogData]);
  const published = useMemo(() => blogs.filter((b) => b.isPublished), [blogs]);
  const drafts    = useMemo(() => blogs.filter((b) => !b.isPublished), [blogs]);
  const totalViews    = useMemo(() => blogs.reduce((s, b) => s + (b.views || 0), 0), [blogs]);
  const totalComments = useMemo(() => blogs.reduce((s, b) => s + (b.comments?.length || 0), 0), [blogs]);
  const avgViews  = blogs.length > 0 ? Math.round(totalViews / blogs.length) : 0;
  const engRate   = totalViews > 0 ? ((totalComments / totalViews) * 100).toFixed(1) : "0.0";
  const pubPct    = blogs.length > 0 ? Math.round((published.length / blogs.length) * 100) : 0;

  const recentBlogs = useMemo(
    () => [...blogs].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 6),
    [blogs]
  );
  const topBlogs = useMemo(
    () => [...blogs].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 6),
    [blogs]
  );

  /* ── stats config ── */
  const stats = [
    {
      label: "ທັງໝົດ",
      value: blogs.length,
      icon: "📝",
      grad: "linear-gradient(135deg,#667eea,#764ba2)",
      sub: `${published.length} ເຜີຍແຜ່ · ${drafts.length} ຮ່າງ`,
    },
    {
      label: "ເຜີຍແຜ່ແລ້ວ",
      value: published.length,
      icon: "✅",
      grad: "linear-gradient(135deg,#10b981,#059669)",
      sub: `${pubPct}% ຂອງທັງໝົດ`,
      bar: pubPct,
    },
    {
      label: "ຍອດເຂົ້າຊົມ",
      value: totalViews.toLocaleString(),
      icon: "👁️",
      grad: "linear-gradient(135deg,#3b82f6,#2563eb)",
      sub: `ສະເລ່ຍ ${avgViews.toLocaleString()} / ບົດ`,
    },
    {
      label: "ຄຳເຫັນ",
      value: totalComments.toLocaleString(),
      icon: "💬",
      grad: "linear-gradient(135deg,#f59e0b,#d97706)",
      sub: `Engagement ${engRate}%`,
    },
  ];

  const quickActions = [
    { icon: "✏️", label: "ຂຽນໃໝ່",      sub: "ສ້າງບົດຄວາມ",     to: "/admin/blogs/new",  grad: "linear-gradient(135deg,#667eea,#764ba2)" },
    { icon: "📋", label: "ລາຍການທັງໝົດ", sub: `${blogs.length} ບົດ`, to: "/admin/blog",       grad: "linear-gradient(135deg,#10b981,#059669)" },
    { icon: "🌐", label: "ໜ້າສາທາລະນະ",  sub: "ເບິ່ງ Blog",       to: "/blog",            grad: "linear-gradient(135deg,#3b82f6,#2563eb)" },
    { icon: "📊", label: "ສະຖິຕິ",        sub: "Views & Reach",   to: "/admin/dashboard", grad: "linear-gradient(135deg,#f59e0b,#d97706)" },
  ];

  return (
    <AdminLayout>
      <style>{css}</style>
      <MetaData title="ຈັດການບລັອກ — Admin" />

      {/* ── Header ── */}
      <div className="bd-header">
        <div className="bd-header-left">
          <nav className="bd-breadcrumb">
            <Link to="/admin/dashboard">Dashboard</Link>
            <span>/</span>
            <span>Blog</span>
          </nav>
          <h1 className="bd-title">
            <span className="bd-title-icon">📰</span>
            ຈັດການລະບົບບລັອກ
          </h1>
          <p className="bd-sub">ພາບລວມ ແລະ ການເຄື່ອນໄຫວຂອງບົດຄວາມທັງໝົດ</p>
        </div>
        <Link to="/admin/blogs/new" className="bd-new-btn">
          <span>+</span> ຂຽນບົດຄວາມໃໝ່
        </Link>
      </div>

      {/* ── Stats ── */}
      {isLoading ? (
        <div className="bd-sk-grid">
          {[...Array(4)].map((_, i) => <div key={i} className="bd-skeleton" />)}
        </div>
      ) : (
        <div className="bd-stats-grid">
          {stats.map((s) => (
            <div key={s.label} className="bd-stat" style={{ "--g": s.grad }}>
              <div className="bd-stat-top">
                <div>
                  <div className="bd-stat-label">{s.label}</div>
                  <div className="bd-stat-val">{s.value}</div>
                </div>
                <div className="bd-stat-icon">{s.icon}</div>
              </div>
              <div className="bd-stat-sub">{s.sub}</div>
              {s.bar !== undefined && (
                <div className="bd-bar-wrap">
                  <div className="bd-bar" style={{ width: `${s.bar}%` }} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Quick Actions ── */}
      <div className="bd-actions-row">
        {quickActions.map((a) => (
          <Link key={a.to} to={a.to} className="bd-action" style={{ "--g": a.grad }}>
            <div className="bd-action-icon">{a.icon}</div>
            <div>
              <div className="bd-action-label">{a.label}</div>
              <div className="bd-action-sub">{a.sub}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Two Columns ── */}
      <div className="bd-cols">

        {/* Recent */}
        <div className="bd-card">
          <div className="bd-card-head">
            <span className="bd-card-title">🕐 ບົດຄວາມລ່າສຸດ</span>
            <Link to="/admin/blog" className="bd-link">ທັງໝົດ →</Link>
          </div>
          {isLoading ? (
            <div className="bd-list-sk">{[...Array(4)].map((_, i) => <div key={i} className="bd-list-sk-item" />)}</div>
          ) : recentBlogs.length === 0 ? (
            <EmptyState icon="📭" text="ຍັງບໍ່ມີບົດຄວາມ" />
          ) : (
            <div className="bd-blog-list">
              {recentBlogs.map((b, idx) => (
                <BlogRow key={b._id} blog={b} rank={null} showViews={false} idx={idx} />
              ))}
            </div>
          )}
        </div>

        {/* Top */}
        <div className="bd-card">
          <div className="bd-card-head">
            <span className="bd-card-title">🔥 ຍອດນິຍົມ</span>
            <Link to="/admin/blog" className="bd-link">ທັງໝົດ →</Link>
          </div>
          {isLoading ? (
            <div className="bd-list-sk">{[...Array(4)].map((_, i) => <div key={i} className="bd-list-sk-item" />)}</div>
          ) : topBlogs.length === 0 ? (
            <EmptyState icon="📊" text="ຍັງບໍ່ມີຂໍ້ມູນ" />
          ) : (
            <div className="bd-blog-list">
              {topBlogs.map((b, idx) => (
                <BlogRow key={b._id} blog={b} rank={idx + 1} showViews idx={idx} />
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ── Draft Alert ── */}
      {!isLoading && drafts.length > 0 && (
        <div className="bd-draft-alert">
          <span className="bd-draft-icon">✏️</span>
          <div>
            <strong>ທ່ານມີ {drafts.length} ຮ່າງທີ່ຍັງບໍ່ໄດ້ເຜີຍແຜ່</strong>
            <p>{drafts.slice(0, 3).map((d) => d.title).join(" · ")}{drafts.length > 3 ? ` ···` : ""}</p>
          </div>
          <Link to="/admin/blog" className="bd-draft-btn">ຈັດການ →</Link>
        </div>
      )}
    </AdminLayout>
  );
}

/* ─── BlogRow ─────────────────────────────────────── */
function BlogRow({ blog, rank, showViews, idx }) {
  const thumb = imgOf(blog);
  return (
    <Link
      to={`/admin/blogs/${blog._id}/edit`}
      className="bd-row"
      style={{ animationDelay: `${idx * 60}ms` }}
    >
      {rank && <div className="bd-rank">{rank}</div>}
      {thumb ? (
        <img src={thumb} alt="" className="bd-thumb" onError={(e) => e.currentTarget.style.display = "none"} />
      ) : (
        <div className="bd-thumb-placeholder">{blog.title?.[0] || "B"}</div>
      )}
      <div className="bd-row-info">
        <div className="bd-row-title">{blog.title || "ບໍ່ມີຫົວຂໍ້"}</div>
        <div className="bd-row-meta">
          {showViews && <span>👁 {(blog.views || 0).toLocaleString()}</span>}
          <span>💬 {blog.comments?.length || 0}</span>
          <span>🕐 {timeAgo(blog.createdAt)}</span>
        </div>
      </div>
      <span className={`bd-status ${blog.isPublished ? "pub" : "draft"}`}>
        {blog.isPublished ? "ເຜີຍແຜ່" : "ຮ່າງ"}
      </span>
    </Link>
  );
}

function EmptyState({ icon, text }) {
  return (
    <div className="bd-empty">
      <span>{icon}</span>
      <p>{text}</p>
    </div>
  );
}

/* ─── CSS ─────────────────────────────────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;600;700;800&display=swap');

.bd-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}
.bd-breadcrumb {
  display: flex;
  align-items: center;
  gap: .4rem;
  font-size: .8rem;
  color: #94a3b8;
  margin-bottom: .5rem;
}
.bd-breadcrumb a { color: #667eea; text-decoration: none; }
.bd-breadcrumb a:hover { text-decoration: underline; }
.bd-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: .6rem;
  margin: 0 0 .35rem;
  font-family: "Noto Sans Lao", sans-serif;
}
.bd-title-icon { font-size: 1.5rem; }
.bd-sub { color: #64748b; font-size: .9rem; margin: 0; }

.bd-new-btn {
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  padding: .75rem 1.5rem;
  background: linear-gradient(135deg,#667eea,#764ba2);
  color: white;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 700;
  font-size: .9rem;
  transition: all .25s;
  box-shadow: 0 4px 14px rgba(102,126,234,.35);
  white-space: nowrap;
  align-self: center;
}
.bd-new-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 22px rgba(102,126,234,.45);
  color: white;
}

/* ── Stats ── */
.bd-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}
.bd-sk-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}
.bd-skeleton {
  height: 130px;
  border-radius: 16px;
  background: linear-gradient(90deg,#f1f5f9 0%,#e2e8f0 50%,#f1f5f9 100%);
  background-size: 200% 100%;
  animation: bd-shim 1.4s infinite;
}
@keyframes bd-shim { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

.bd-stat {
  background: white;
  border-radius: 16px;
  padding: 1.4rem;
  box-shadow: 0 2px 10px rgba(0,0,0,.06);
  border: 1px solid #f1f5f9;
  position: relative;
  overflow: hidden;
  transition: transform .25s, box-shadow .25s;
}
.bd-stat::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: var(--g);
}
.bd-stat:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,.1); }
.bd-stat-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: .75rem; }
.bd-stat-label { font-size: .8rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: .5px; margin-bottom: .4rem; }
.bd-stat-val { font-size: 2.1rem; font-weight: 800; color: #0f172a; line-height: 1; }
.bd-stat-icon {
  width: 48px; height: 48px;
  border-radius: 12px;
  background: var(--g);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.4rem;
  box-shadow: 0 4px 12px rgba(0,0,0,.12);
}
.bd-stat-sub { font-size: .78rem; color: #94a3b8; margin-bottom: .6rem; }
.bd-bar-wrap { height: 6px; background: #e2e8f0; border-radius: 99px; overflow: hidden; }
.bd-bar { height: 100%; background: var(--g); border-radius: 99px; transition: width 1s ease; }

/* ── Quick Actions ── */
.bd-actions-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
  margin-bottom: 1.75rem;
}
.bd-action {
  display: flex;
  align-items: center;
  gap: .85rem;
  padding: 1rem 1.25rem;
  background: white;
  border-radius: 14px;
  border: 2px solid #e2e8f0;
  text-decoration: none;
  transition: all .22s;
}
.bd-action:hover {
  border-color: transparent;
  background: var(--g);
  box-shadow: 0 6px 18px rgba(0,0,0,.12);
  transform: translateY(-2px);
}
.bd-action:hover .bd-action-label,
.bd-action:hover .bd-action-sub { color: white; }
.bd-action:hover .bd-action-icon { background: rgba(255,255,255,.25); }
.bd-action-icon {
  width: 44px; height: 44px; border-radius: 10px;
  background: #f1f5f9;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.3rem; flex-shrink: 0;
  transition: background .22s;
}
.bd-action-label { font-size: .9rem; font-weight: 700; color: #1e293b; transition: color .22s; }
.bd-action-sub   { font-size: .75rem; color: #64748b; transition: color .22s; margin-top: .1rem; }

/* ── Two columns ── */
.bd-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}
@media (max-width: 900px) { .bd-cols { grid-template-columns: 1fr; } }

.bd-card {
  background: white;
  border-radius: 16px;
  padding: 1.4rem;
  box-shadow: 0 2px 10px rgba(0,0,0,.06);
  border: 1px solid #f1f5f9;
}
.bd-card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  padding-bottom: .9rem;
  border-bottom: 1px solid #f1f5f9;
}
.bd-card-title { font-size: 1rem; font-weight: 700; color: #1e293b; }
.bd-link { font-size: .82rem; color: #667eea; text-decoration: none; font-weight: 600; }
.bd-link:hover { color: #764ba2; }

/* Blog row */
.bd-blog-list { display: flex; flex-direction: column; gap: .5rem; }
.bd-row {
  display: flex;
  align-items: center;
  gap: .85rem;
  padding: .7rem .85rem;
  border-radius: 10px;
  text-decoration: none;
  transition: background .18s, transform .18s;
  animation: bd-fade-in .3s ease both;
}
@keyframes bd-fade-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
.bd-row:hover { background: #f8fafc; transform: translateX(3px); }

.bd-rank {
  width: 26px; height: 26px;
  border-radius: 8px;
  background: linear-gradient(135deg,#667eea,#764ba2);
  color: white; font-size: .75rem; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.bd-thumb {
  width: 44px; height: 44px;
  border-radius: 8px; object-fit: cover; flex-shrink: 0;
  border: 1px solid #e2e8f0;
}
.bd-thumb-placeholder {
  width: 44px; height: 44px; border-radius: 8px; flex-shrink: 0;
  background: linear-gradient(135deg,#667eea,#764ba2);
  color: white; font-size: 1.1rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.bd-row-info { flex: 1; min-width: 0; }
.bd-row-title {
  font-size: .875rem; font-weight: 600; color: #1e293b;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  margin-bottom: .2rem;
}
.bd-row-meta {
  display: flex; gap: .75rem; font-size: .72rem; color: #94a3b8;
  flex-wrap: wrap;
}
.bd-status {
  padding: .25rem .65rem; border-radius: 20px;
  font-size: .68rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: .4px;
  white-space: nowrap; flex-shrink: 0;
}
.bd-status.pub   { background: #d1fae5; color: #065f46; }
.bd-status.draft { background: #f1f5f9; color: #64748b; }

/* List skeleton */
.bd-list-sk { display: flex; flex-direction: column; gap: .5rem; }
.bd-list-sk-item {
  height: 56px; border-radius: 10px;
  background: linear-gradient(90deg,#f1f5f9 0%,#e2e8f0 50%,#f1f5f9 100%);
  background-size: 200% 100%;
  animation: bd-shim 1.4s infinite;
}

/* Empty */
.bd-empty { text-align: center; padding: 3rem 1rem; color: #94a3b8; }
.bd-empty span { font-size: 3rem; display: block; margin-bottom: .75rem; opacity: .4; }
.bd-empty p { margin: 0; font-size: .9rem; }

/* Draft alert */
.bd-draft-alert {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg,#fffbeb,#fef3c7);
  border: 1px solid #fde68a;
  border-radius: 14px;
  flex-wrap: wrap;
}
.bd-draft-icon { font-size: 1.75rem; flex-shrink: 0; }
.bd-draft-alert > div { flex: 1; min-width: 0; }
.bd-draft-alert strong { font-size: .95rem; color: #92400e; display: block; margin-bottom: .2rem; }
.bd-draft-alert p { font-size: .8rem; color: #b45309; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.bd-draft-btn {
  padding: .6rem 1.2rem;
  background: #f59e0b;
  color: white;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 700;
  font-size: .85rem;
  white-space: nowrap;
  transition: background .2s;
  flex-shrink: 0;
}
.bd-draft-btn:hover { background: #d97706; color: white; }

@media (max-width: 600px) {
  .bd-stats-grid { grid-template-columns: 1fr 1fr; }
  .bd-actions-row { grid-template-columns: 1fr 1fr; }
  .bd-header { flex-direction: column; }
  .bd-new-btn { align-self: flex-start; }
}
`;
