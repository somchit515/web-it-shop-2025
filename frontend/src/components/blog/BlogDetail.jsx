import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  useGetBlogDetailsQuery,
  useLikeBlogMutation,
  useAddCommentMutation,
  useGetRelatedBlogsQuery,
} from "../redux/api/blogApi";
import MetaData from "../layout/MetaData";

/* ─── Config ──────────────────────────────────────── */
const CATS = {
  tech:   { icon: "💻", label: "ເທັກໂນໂລຢີ", color: "#2563eb", bg: "#eff6ff" },
  review: { icon: "⭐", label: "ລີວິວ",        color: "#d97706", bg: "#fffbeb" },
  guide:  { icon: "📖", label: "ຄູ່ມື",        color: "#059669", bg: "#f0fdf4" },
  news:   { icon: "📰", label: "ຂ່າວສານ",     color: "#7c3aed", bg: "#faf5ff" },
};

/* ─── Helpers ─────────────────────────────────────── */
const timeAgo = (d) => {
  if (!d) return "";
  const s = (Date.now() - new Date(d)) / 1000;
  if (s < 60)    return "ຫາກໍ່ຜ່ານມາ";
  if (s < 3600)  return `${Math.floor(s / 60)} ນາທີກ່ອນ`;
  if (s < 86400) return `${Math.floor(s / 3600)} ຊຊ.ກ່ອນ`;
  const d2 = Math.floor(s / 86400);
  if (d2 < 7)    return `${d2} ວັນກ່ອນ`;
  return new Date(d).toLocaleDateString("lo-LA", { year: "numeric", month: "long", day: "numeric" });
};

const fmtNum = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n || 0));

const blogImg = (b) => b?.image?.url || b?.image ||
  (Array.isArray(b?.images) && b.images[0]) || null;

/* ─── Skeleton ────────────────────────────────────── */
function Skeleton() {
  return (
    <>
      <style>{css}</style>
      <div className="bdt-sk-hero" />
      <div className="bdt-container">
        <div className="bdt-layout">
          <div className="bdt-main">
            {[100, 85, 95, 70, 90, 75, 60].map((w, i) => (
              <div key={i} className="bdt-sk" style={{ height: i < 2 ? 20 : 14, width: `${w}%`, marginBottom: 12 }} />
            ))}
          </div>
          <div className="bdt-sidebar" />
        </div>
      </div>
    </>
  );
}

/* ─── Error / NotFound ────────────────────────────── */
function ErrorState({ icon, title, msg }) {
  return (
    <>
      <style>{css}</style>
      <div className="bdt-errorpage">
        <div className="bdt-error-icon">{icon}</div>
        <h2 className="bdt-error-title">{title}</h2>
        <p className="bdt-error-msg">{msg}</p>
        <Link to="/blog" className="bdt-error-btn">← ກັບໄປໜ້າບລັອກ</Link>
      </div>
    </>
  );
}

/* ─── Related card ────────────────────────────────── */
function RelCard({ blog }) {
  const cat = CATS[blog.category] || CATS.tech;
  const img = blogImg(blog);
  return (
    <Link to={`/blog/${blog.slug || blog._id}`} className="bdt-rel-card">
      <div className="bdt-rel-img" style={{ background: cat.bg }}>
        {img
          ? <img src={img} alt={blog.title} onError={(e) => { e.currentTarget.style.display = "none"; }} />
          : <span className="bdt-rel-placeholder">{cat.icon}</span>
        }
      </div>
      <div className="bdt-rel-body">
        <span className="bdt-rel-cat" style={{ color: cat.color }}>{cat.icon} {cat.label}</span>
        <h4 className="bdt-rel-title">{blog.title}</h4>
        <span className="bdt-rel-time">{timeAgo(blog.publishedAt || blog.createdAt)}</span>
      </div>
    </Link>
  );
}

/* ─── Comment item ────────────────────────────────── */
function CommentItem({ c, idx }) {
  const avatar = c.user?.avatar?.url;
  const name   = c.user?.name || "ຜູ້ໃຊ້";
  const letter = name[0]?.toUpperCase() || "U";
  return (
    <div className="bdt-cmt" style={{ animationDelay: `${idx * 50}ms` }}>
      {avatar
        ? <img src={avatar} alt={name} className="bdt-cmt-av" />
        : <div className="bdt-cmt-av bdt-cmt-ph">{letter}</div>
      }
      <div className="bdt-cmt-body">
        <div className="bdt-cmt-head">
          <span className="bdt-cmt-name">{name}</span>
          <span className="bdt-cmt-time">{timeAgo(c.createdAt)}</span>
        </div>
        <p className="bdt-cmt-text">{c.text || c.comment}</p>
      </div>
    </div>
  );
}

/* ─── Main ────────────────────────────────────────── */
export default function BlogDetail() {
  const { id }   = useParams();
  const { user } = useSelector((s) => s.auth);

  const [comment,    setComment]    = useState("");
  const [progress,   setProgress]   = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [copied,     setCopied]     = useState(false);

  /* Reading progress */
  useEffect(() => {
    const fn = () => {
      const el  = document.documentElement;
      const pct = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
      setProgress(Math.min(100, Math.max(0, pct)));
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  /* API */
  const { data, isLoading, error } = useGetBlogDetailsQuery(id);
  const [likeBlog]   = useLikeBlogMutation();
  const [addComment] = useAddCommentMutation();

  const blog = data?.blog || data;

  /* Related */
  const { data: relData } = useGetRelatedBlogsQuery(id, { skip: !blog });
  const related = Array.isArray(relData) ? relData : relData?.blogs || [];

  const handleLike = async () => {
    if (!user) { toast.error("ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນ"); return; }
    try { await likeBlog(id).unwrap(); }
    catch { toast.error("ບໍ່ສາມາດຖືກໃຈໄດ້"); }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) { toast.error("ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນ"); return; }
    const t = comment.trim();
    if (t.length < 3) { toast.error("ຕ້ອງ ≥ 3 ຕົວ"); return; }
    setSubmitting(true);
    try {
      await addComment({ id, comment: t }).unwrap();
      setComment("");
      toast.success("ສົ່ງຄວາມຄິດເຫັນສຳເລັດ ✅");
    } catch { toast.error("ສົ່ງບໍ່ໄດ້"); }
    finally { setSubmitting(false); }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: blog?.title, url: window.location.href }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("ຄັດລອກ URL ແລ້ວ");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  /* ── States ── */
  if (isLoading) return <Skeleton />;
  if (error)     return <ErrorState icon="🔌" title="ໂຫຼດບໍ່ສຳເລັດ" msg={error?.data?.message || "ບໍ່ສາມາດເຊື່ອມຕໍ່ server"} />;
  if (!blog)     return <ErrorState icon="🔍" title="ບໍ່ພົບບົດຄວາມ" msg="ບົດຄວາມທີ່ທ່ານຊອກຫາບໍ່ມີໃນລະບົບ" />;

  const cat        = CATS[blog.category] || CATS.tech;
  const coverImg   = blogImg(blog);
  const isLiked    = blog.likes?.some((l) => (l?.user || l)?.toString() === user?._id);
  const authorName = blog.author || blog.authorId?.name || "IT HUBB";
  const authorAv   = blog.authorId?.avatar?.url;
  const comments   = blog.comments || [];
  const likeCount  = blog.likes?.length || 0;

  return (
    <>
      <MetaData title={`${blog.title} — IT HUBB Blog`} />
      <style>{css}</style>

      {/* Reading progress */}
      <div className="bdt-progress" style={{ width: `${progress}%` }} />

      {/* ══ HERO ══ */}
      <div className="bdt-hero" style={coverImg ? { backgroundImage: `url(${coverImg})` } : {}}>
        <div className={`bdt-hero-overlay${!coverImg ? " bdt-hero-grad" : ""}`} />

        {/* Topbar */}
        <div className="bdt-topbar">
          <Link to="/blog" className="bdt-back">← ກັບໄປ</Link>
          <span className="bdt-breadcrumb">blog / {cat.label}</span>
        </div>

        {/* Hero content */}
        <div className="bdt-hero-content">
          <div className="bdt-hero-meta">
            <span className="bdt-cat-pill" style={{ background: cat.color }}>
              {cat.icon} {cat.label}
            </span>
            <span className="bdt-hero-date">
              {timeAgo(blog.publishedAt || blog.createdAt)}
            </span>
            <span className="bdt-hero-rt">⏱ {blog.readTime || "5 ນາທີ"}</span>
          </div>

          <h1 className="bdt-hero-title">{blog.title}</h1>

          {blog.excerpt && (
            <p className="bdt-hero-excerpt">{blog.excerpt}</p>
          )}

          <div className="bdt-hero-author">
            {authorAv
              ? <img src={authorAv} alt={authorName} className="bdt-av" />
              : <div className="bdt-av bdt-av-ph">{authorName[0]?.toUpperCase()}</div>
            }
            <div>
              <span className="bdt-av-name">{authorName}</span>
              <span className="bdt-av-sub">{blog.authorId?.email || "IT HUBB"}</span>
            </div>
            <button className="bdt-share-hero" onClick={handleShare}>
              {copied ? "✅ คัดลอกแล้ว" : "↗ ແຊ"}
            </button>
          </div>
        </div>
      </div>

      {/* ══ MAIN LAYOUT ══ */}
      <div className="bdt-container">
        <div className="bdt-layout">

          {/* ── Article ── */}
          <main className="bdt-main">

            {/* Content */}
            <div
              className="bdt-content"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            {/* Tags */}
            {blog.tags?.length > 0 && (
              <div className="bdt-tags">
                {blog.tags.map((t) => (
                  <span key={t} className="bdt-tag">#{t}</span>
                ))}
              </div>
            )}

            {/* Engagement bar */}
            <div className="bdt-engage">
              <button
                className={`bdt-like${isLiked ? " liked" : ""}`}
                onClick={handleLike}
              >
                <span className="bdt-heart">{isLiked ? "❤️" : "🤍"}</span>
                <span>{likeCount} ຖືກໃຈ</span>
              </button>
              <div className="bdt-engage-stats">
                <span>👁 {fmtNum(blog.views)} ວິວ</span>
                <span>💬 {comments.length} ຄຳເຫັນ</span>
              </div>
              <button className="bdt-share-btn" onClick={handleShare}>
                {copied ? "✅" : "↗"} ແຊ
              </button>
            </div>

            {/* ── Comments ── */}
            <section className="bdt-comments">
              <h3 className="bdt-cmt-hd">
                💬 ຄຳເຫັນ
                <span className="bdt-cmt-count">{comments.length}</span>
              </h3>

              {/* Form */}
              {user ? (
                <form onSubmit={handleComment} className="bdt-cmt-form">
                  <div className="bdt-cmt-form-row">
                    <div className="bdt-av bdt-av-ph bdt-av-sm">
                      {user.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div className="bdt-cmt-input-wrap">
                      <textarea
                        className="bdt-cmt-input"
                        placeholder="ແບ່ງປັນຄວາມຄິດເຫັນ..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={3}
                      />
                      <div className="bdt-cmt-form-foot">
                        <span className={`bdt-cmt-len ${comment.length > 450 ? "warn" : ""}`}>
                          {comment.length}/500
                        </span>
                        <button type="submit" className="bdt-cmt-submit" disabled={submitting || comment.trim().length < 3}>
                          {submitting ? "ກຳລັງສົ່ງ..." : "ສົ່ງ →"}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="bdt-login-prompt">
                  <span>💬</span>
                  <span>
                    <Link to="/login" className="bdt-login-link">ເຂົ້າສູ່ລະບົບ</Link>
                    {" "}ເພື່ອຄອມເມັນ
                  </span>
                </div>
              )}

              {/* List */}
              <div className="bdt-cmt-list">
                {comments.length > 0
                  ? comments.map((c, i) => <CommentItem key={c._id || i} c={c} idx={i} />)
                  : (
                    <div className="bdt-cmt-empty">
                      <span>💬</span>
                      <p>ຍັງບໍ່ມີຄຳເຫັນ — ເປັນຄົນທຳອິດ!</p>
                    </div>
                  )
                }
              </div>
            </section>

            {/* Related (mobile) */}
            {related.length > 0 && (
              <section className="bdt-related-mobile">
                <h3 className="bdt-rel-hd">📚 ບົດຄວາມທີ່ກ່ຽວຂ້ອງ</h3>
                <div className="bdt-rel-grid-mobile">
                  {related.slice(0, 3).map((b) => <RelCard key={b._id} blog={b} />)}
                </div>
              </section>
            )}

          </main>

          {/* ── Sticky Sidebar ── */}
          <aside className="bdt-sidebar">

            {/* Author card */}
            <div className="bdt-side-card">
              <div className="bdt-side-author">
                {authorAv
                  ? <img src={authorAv} alt={authorName} className="bdt-side-av" />
                  : <div className="bdt-side-av bdt-side-av-ph">{authorName[0]?.toUpperCase()}</div>
                }
                <span className="bdt-side-name">{authorName}</span>
                <span className="bdt-side-role">ຜູ້ຂຽນ</span>
              </div>
            </div>

            {/* Stats */}
            <div className="bdt-side-card">
              <div className="bdt-side-title">📊 ສະຖິຕິ</div>
              <div className="bdt-side-stats">
                <div className="bdt-side-stat">
                  <span className="bdt-side-stat-val">{fmtNum(blog.views)}</span>
                  <span className="bdt-side-stat-label">ວິວ</span>
                </div>
                <div className="bdt-side-stat">
                  <span className="bdt-side-stat-val">{likeCount}</span>
                  <span className="bdt-side-stat-label">ຖືກໃຈ</span>
                </div>
                <div className="bdt-side-stat">
                  <span className="bdt-side-stat-val">{comments.length}</span>
                  <span className="bdt-side-stat-label">ຄຳເຫັນ</span>
                </div>
              </div>
              <div className="bdt-side-rt">⏱ ໃຊ້ເວລາອ່ານ {blog.readTime || "5 ນາທີ"}</div>
            </div>

            {/* Actions */}
            <div className="bdt-side-card">
              <div className="bdt-side-title">⚡ ການກະທຳ</div>
              <button
                className={`bdt-side-like${isLiked ? " liked" : ""}`}
                onClick={handleLike}
              >
                {isLiked ? "❤️" : "🤍"} {isLiked ? "ຖືກໃຈແລ້ວ" : "ຖືກໃຈ"}
              </button>
              <button className="bdt-side-share" onClick={handleShare}>
                {copied ? "✅ ຄັດລອກແລ້ວ" : "↗ ແຊ URL"}
              </button>
            </div>

            {/* Category */}
            <div className="bdt-side-card">
              <div className="bdt-side-title">🏷️ ໝວດໝູ່</div>
              <span className="bdt-side-catpill" style={{ background: cat.bg, color: cat.color }}>
                {cat.icon} {cat.label}
              </span>
              {blog.tags?.length > 0 && (
                <div className="bdt-side-tags">
                  {blog.tags.map((t) => (
                    <span key={t} className="bdt-side-tag">#{t}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Related (desktop) */}
            {related.length > 0 && (
              <div className="bdt-side-card">
                <div className="bdt-side-title">📚 ກ່ຽວຂ້ອງ</div>
                <div className="bdt-rel-grid">
                  {related.slice(0, 4).map((b) => <RelCard key={b._id} blog={b} />)}
                </div>
              </div>
            )}

          </aside>
        </div>
      </div>

      {/* Back to top */}
      <button className="bdt-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>↑</button>
    </>
  );
}

/* ─── CSS ─────────────────────────────────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;600;700;800&family=Lora:ital,wght@0,600;1,500&display=swap');

*, *::before, *::after { box-sizing: border-box; }
.bdt-progress, .bdt-hero, .bdt-container, .bdt-main, .bdt-sidebar,
.bdt-errorpage, .bdt-sk-hero {
  font-family: 'Noto Sans Lao', 'Phetsarath OT', sans-serif;
}

/* ── Progress bar ── */
.bdt-progress {
  position: fixed; top: 0; left: 0; height: 3px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  z-index: 9999; transition: width .1s linear;
  box-shadow: 0 0 8px rgba(102,126,234,.5);
}

/* ── Hero ── */
.bdt-hero {
  position: relative;
  min-height: 520px;
  background-color: #1e1b4b;
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
}
.bdt-hero-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to bottom,
    rgba(0,0,0,.15) 0%,
    rgba(0,0,0,.55) 60%,
    rgba(0,0,0,.85) 100%
  );
}
.bdt-hero-grad {
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
  opacity: 1;
}

/* Topbar inside hero */
.bdt-topbar {
  position: relative; z-index: 2;
  display: flex; align-items: center; justify-content: space-between;
  padding: 1.25rem 2rem;
  max-width: 1200px; margin: 0 auto; width: 100%;
}
.bdt-back {
  font-size: .82rem; font-weight: 700; color: rgba(255,255,255,.85);
  text-decoration: none; letter-spacing: .06em;
  transition: color .15s;
}
.bdt-back:hover { color: #fff; }
.bdt-breadcrumb { font-size: .72rem; color: rgba(255,255,255,.5); letter-spacing: .06em; }

/* Hero content */
.bdt-hero-content {
  position: relative; z-index: 2;
  max-width: 860px;
  margin: auto 0 0;
  padding: 2rem 2rem 2.5rem;
  width: 100%;
  align-self: center;
}
.bdt-hero-meta {
  display: flex; align-items: center; gap: .75rem;
  margin-bottom: 1.25rem; flex-wrap: wrap;
}
.bdt-cat-pill {
  display: inline-flex; align-items: center; gap: .35rem;
  padding: .3rem .9rem; border-radius: 50px;
  color: white; font-size: .72rem; font-weight: 700;
  letter-spacing: .04em;
}
.bdt-hero-date, .bdt-hero-rt {
  font-size: .75rem; color: rgba(255,255,255,.7);
}
.bdt-hero-title {
  font-family: 'Lora', Georgia, serif;
  font-size: clamp(1.6rem, 4vw, 2.6rem);
  font-weight: 600;
  color: #fff;
  line-height: 1.3;
  margin-bottom: 1rem;
  letter-spacing: -.01em;
}
.bdt-hero-excerpt {
  font-size: 1.05rem;
  color: rgba(255,255,255,.8);
  line-height: 1.65;
  margin-bottom: 1.5rem;
  max-width: 680px;
}
.bdt-hero-author {
  display: flex; align-items: center; gap: .85rem;
  flex-wrap: wrap;
}
.bdt-av {
  width: 42px; height: 42px;
  border-radius: 50%; object-fit: cover;
  border: 2px solid rgba(255,255,255,.4);
  flex-shrink: 0;
}
.bdt-av-ph {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white; font-size: 1rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.bdt-av-sm { width: 36px; height: 36px; font-size: .85rem; }
.bdt-av-name { display: block; font-size: .88rem; font-weight: 700; color: #fff; }
.bdt-av-sub  { display: block; font-size: .72rem; color: rgba(255,255,255,.6); }
.bdt-share-hero {
  margin-left: auto;
  background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.25);
  color: #fff; border-radius: 8px;
  padding: .45rem 1.1rem; font-size: .8rem; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: background .15s;
}
.bdt-share-hero:hover { background: rgba(255,255,255,.22); }

/* ── Layout ── */
.bdt-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 5rem;
}
.bdt-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 2.5rem;
  align-items: start;
}
.bdt-sidebar {
  position: sticky;
  top: 76px;
  max-height: calc(100vh - 96px);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #e2e8f0 transparent;
}
.bdt-sidebar::-webkit-scrollbar { width: 3px; }
.bdt-sidebar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }

/* ── Article content ── */
.bdt-content {
  font-size: 1.05rem;
  line-height: 1.9;
  color: #1e293b;
  margin-bottom: 2.5rem;
}
.bdt-content h1, .bdt-content h2, .bdt-content h3,
.bdt-content h4, .bdt-content h5, .bdt-content h6 {
  font-family: 'Lora', Georgia, serif;
  color: #0f172a; margin-top: 2.5rem; margin-bottom: .85rem; line-height: 1.3;
}
.bdt-content h2 { font-size: 1.6rem; border-bottom: 2px solid #f1f5f9; padding-bottom: .5rem; }
.bdt-content h3 { font-size: 1.3rem; }
.bdt-content p  { margin-bottom: 1.4rem; }
.bdt-content a  { color: #667eea; text-decoration: underline; text-underline-offset: 3px; }
.bdt-content a:hover { color: #764ba2; }
.bdt-content img {
  max-width: 100%; height: auto;
  border-radius: 12px; margin: 2rem 0;
  box-shadow: 0 4px 20px rgba(0,0,0,.1);
}
.bdt-content blockquote {
  border-left: 4px solid #667eea;
  margin: 2rem 0; padding: 1rem 1.5rem;
  background: #f8f7ff; border-radius: 0 10px 10px 0;
  font-style: italic; font-family: 'Lora', Georgia, serif;
  font-size: 1.05rem; color: #374151;
}
.bdt-content code {
  background: #1e293b; color: #7dd3fc;
  padding: .2rem .55rem; border-radius: 5px;
  font-size: .85em; font-family: 'Courier New', monospace;
}
.bdt-content pre {
  background: #0f172a; color: #e2e8f0;
  padding: 1.5rem; border-radius: 12px;
  overflow-x: auto; margin: 1.5rem 0;
  font-family: 'Courier New', monospace;
  font-size: .875rem; line-height: 1.65;
}
.bdt-content pre code { background: none; padding: 0; color: inherit; }
.bdt-content ul, .bdt-content ol { padding-left: 1.5rem; margin-bottom: 1.4rem; }
.bdt-content li { margin-bottom: .4rem; }

/* ── Tags ── */
.bdt-tags {
  display: flex; flex-wrap: wrap; gap: .45rem;
  margin-bottom: 2rem; padding-bottom: 2rem;
  border-bottom: 1px solid #f1f5f9;
}
.bdt-tag {
  padding: .3rem .85rem; border-radius: 50px;
  background: #f1f5f9; color: #64748b;
  font-size: .75rem; font-weight: 600;
  border: 1px solid #e2e8f0; transition: all .15s;
}
.bdt-tag:hover { background: #667eea; color: white; border-color: #667eea; cursor: pointer; }

/* ── Engagement ── */
.bdt-engage {
  display: flex; align-items: center; gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, #f8f7ff, #f0f4ff);
  border-radius: 14px; margin-bottom: 2.5rem;
  border: 1px solid #e0e7ff; flex-wrap: wrap;
}
.bdt-like {
  display: inline-flex; align-items: center; gap: .55rem;
  padding: .6rem 1.3rem; border-radius: 50px;
  border: 1.5px solid #e2e8f0; background: white;
  font-size: .875rem; font-weight: 700; color: #374151;
  cursor: pointer; font-family: inherit; transition: all .2s;
}
.bdt-like:hover   { border-color: #f43f5e; color: #f43f5e; }
.bdt-like.liked   { background: #fff1f2; border-color: #f43f5e; color: #f43f5e; }
.bdt-heart { font-size: 1rem; transition: transform .25s; }
.bdt-like.liked .bdt-heart { animation: bdt-pulse .35s ease; }
@keyframes bdt-pulse { 0%{transform:scale(1)} 50%{transform:scale(1.35)} 100%{transform:scale(1)} }
.bdt-engage-stats { display: flex; gap: 1rem; font-size: .82rem; color: #64748b; }
.bdt-share-btn {
  margin-left: auto; padding: .55rem 1.1rem;
  border-radius: 50px; border: 1.5px solid #e2e8f0;
  background: white; font-size: .82rem; font-weight: 600;
  color: #374151; cursor: pointer; font-family: inherit; transition: all .18s;
}
.bdt-share-btn:hover { border-color: #667eea; color: #667eea; }

/* ── Comments ── */
.bdt-comments { margin-bottom: 3rem; }
.bdt-cmt-hd {
  font-size: 1.2rem; font-weight: 800; color: #0f172a;
  margin-bottom: 1.5rem; display: flex; align-items: center; gap: .6rem;
}
.bdt-cmt-count {
  background: #667eea; color: white;
  border-radius: 50px; padding: .1rem .55rem;
  font-size: .72rem; font-weight: 700;
}
.bdt-cmt-form { margin-bottom: 2rem; }
.bdt-cmt-form-row { display: flex; gap: .85rem; align-items: flex-start; }
.bdt-cmt-input-wrap { flex: 1; }
.bdt-cmt-input {
  width: 100%; padding: .85rem 1rem;
  border: 2px solid #e5e7eb; border-radius: 12px;
  font-family: inherit; font-size: .9rem; color: #1e293b;
  background: #fafafa; resize: vertical; min-height: 90px;
  outline: none; transition: border-color .2s, background .2s;
  margin-bottom: .5rem;
}
.bdt-cmt-input:focus { border-color: #667eea; background: white; box-shadow: 0 0 0 3px rgba(102,126,234,.08); }
.bdt-cmt-form-foot {
  display: flex; align-items: center; justify-content: space-between;
}
.bdt-cmt-len { font-size: .72rem; color: #9ca3af; }
.bdt-cmt-len.warn { color: #f59e0b; }
.bdt-cmt-submit {
  padding: .5rem 1.3rem; border-radius: 50px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white; border: none; font-size: .82rem; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: all .2s;
}
.bdt-cmt-submit:hover:not(:disabled) { box-shadow: 0 4px 12px rgba(102,126,234,.4); transform: translateY(-1px); }
.bdt-cmt-submit:disabled { opacity: .45; cursor: not-allowed; transform: none; }

.bdt-login-prompt {
  display: flex; align-items: center; gap: .75rem;
  padding: 1.25rem 1.5rem; border-radius: 14px;
  background: #f8f7ff; border: 1.5px dashed #c4b5fd;
  font-size: .9rem; color: #64748b; margin-bottom: 2rem;
}
.bdt-login-link { color: #667eea; font-weight: 700; text-decoration: none; }
.bdt-login-link:hover { text-decoration: underline; }

.bdt-cmt-list { display: flex; flex-direction: column; gap: 0; }
.bdt-cmt {
  display: flex; gap: .85rem;
  padding: 1.25rem 0; border-bottom: 1px solid #f1f5f9;
  animation: bdt-fade .3s ease both;
}
@keyframes bdt-fade { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
.bdt-cmt-av {
  width: 38px; height: 38px; border-radius: 50%;
  object-fit: cover; flex-shrink: 0;
  border: 2px solid #e5e7eb;
  display: flex; align-items: center; justify-content: center;
  font-size: .85rem; font-weight: 700;
}
.bdt-cmt-ph { background: linear-gradient(135deg, #667eea, #764ba2); color: white; }
.bdt-cmt-body { flex: 1; }
.bdt-cmt-head { display: flex; align-items: baseline; gap: .65rem; margin-bottom: .35rem; }
.bdt-cmt-name { font-size: .88rem; font-weight: 700; color: #0f172a; }
.bdt-cmt-time { font-size: .72rem; color: #9ca3af; }
.bdt-cmt-text { font-size: .9rem; color: #374151; line-height: 1.6; }
.bdt-cmt-empty {
  text-align: center; padding: 2.5rem 1rem;
  display: flex; flex-direction: column; align-items: center; gap: .5rem;
  font-size: .9rem; color: #94a3b8;
}
.bdt-cmt-empty span { font-size: 2rem; opacity: .4; }

/* ── Sidebar cards ── */
.bdt-side-card {
  background: white; border-radius: 16px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 6px rgba(0,0,0,.04);
  padding: 1.1rem; margin-bottom: .75rem;
}
.bdt-side-title {
  font-size: .78rem; font-weight: 700; color: #9ca3af;
  text-transform: uppercase; letter-spacing: .06em;
  margin-bottom: .85rem;
}
.bdt-side-author {
  display: flex; flex-direction: column; align-items: center;
  text-align: center; gap: .5rem; padding: .5rem 0;
}
.bdt-side-av {
  width: 60px; height: 60px; border-radius: 50%; object-fit: cover;
  border: 3px solid #f1f5f9;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.4rem; font-weight: 700;
}
.bdt-side-av-ph { background: linear-gradient(135deg, #667eea, #764ba2); color: white; }
.bdt-side-name { font-size: .92rem; font-weight: 700; color: #0f172a; }
.bdt-side-role { font-size: .72rem; color: #9ca3af; }

.bdt-side-stats {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: .5rem; margin-bottom: .75rem;
}
.bdt-side-stat { text-align: center; }
.bdt-side-stat-val { display: block; font-size: 1.3rem; font-weight: 800; color: #0f172a; }
.bdt-side-stat-label { font-size: .68rem; color: #9ca3af; }
.bdt-side-rt { font-size: .75rem; color: #64748b; text-align: center; padding-top: .5rem; border-top: 1px solid #f1f5f9; }

.bdt-side-like, .bdt-side-share {
  display: block; width: 100%;
  padding: .6rem; border-radius: 10px; margin-bottom: .4rem;
  font-size: .82rem; font-weight: 700; text-align: center;
  cursor: pointer; font-family: inherit; transition: all .18s;
}
.bdt-side-like {
  border: 1.5px solid #e5e7eb; background: white; color: #374151;
}
.bdt-side-like:hover { border-color: #f43f5e; color: #f43f5e; }
.bdt-side-like.liked { background: #fff1f2; border-color: #f43f5e; color: #f43f5e; }
.bdt-side-share {
  border: 1.5px solid #e5e7eb; background: white; color: #374151;
}
.bdt-side-share:hover { border-color: #667eea; color: #667eea; }

.bdt-side-catpill {
  display: inline-flex; align-items: center; gap: .35rem;
  padding: .3rem .85rem; border-radius: 50px;
  font-size: .78rem; font-weight: 700; margin-bottom: .75rem;
}
.bdt-side-tags { display: flex; flex-wrap: wrap; gap: .35rem; }
.bdt-side-tag {
  font-size: .68rem; font-weight: 600; color: #64748b;
  background: #f1f5f9; border-radius: 50px;
  padding: .18rem .65rem; border: 1px solid #e2e8f0;
}

/* ── Related cards ── */
.bdt-rel-grid { display: flex; flex-direction: column; gap: .6rem; }
.bdt-rel-card {
  display: flex; gap: .65rem; text-decoration: none;
  border-radius: 10px; padding: .5rem;
  transition: background .15s;
}
.bdt-rel-card:hover { background: #f8fafc; }
.bdt-rel-img {
  width: 56px; height: 56px; border-radius: 8px;
  overflow: hidden; flex-shrink: 0; background: #f1f5f9;
  display: flex; align-items: center; justify-content: center;
}
.bdt-rel-img img { width: 100%; height: 100%; object-fit: cover; }
.bdt-rel-placeholder { font-size: 1.4rem; }
.bdt-rel-body { flex: 1; min-width: 0; }
.bdt-rel-cat { font-size: .65rem; font-weight: 700; display: block; margin-bottom: .15rem; }
.bdt-rel-title {
  font-size: .8rem; font-weight: 700; color: #0f172a; line-height: 1.35;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  margin-bottom: .2rem;
}
.bdt-rel-time { font-size: .65rem; color: #9ca3af; }

/* Related mobile (hidden on desktop) */
.bdt-related-mobile { display: none; }
.bdt-rel-grid-mobile {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(260px,1fr)); gap: 1rem;
}
.bdt-rel-grid-mobile .bdt-rel-card {
  border: 1px solid #e5e7eb; border-radius: 12px; padding: .85rem;
}
.bdt-rel-grid-mobile .bdt-rel-img { width: 64px; height: 64px; }
.bdt-rel-hd { font-size: 1.1rem; font-weight: 800; color: #0f172a; margin-bottom: 1rem; }

/* ── Skeleton ── */
.bdt-sk-hero { height: 480px; background: linear-gradient(90deg,#e2e8f0 0%,#f1f5f9 50%,#e2e8f0 100%); background-size:200% 100%; animation:bdt-shim 1.4s infinite; }
.bdt-sk { border-radius: 6px; background: linear-gradient(90deg,#f1f5f9 0%,#e2e8f0 50%,#f1f5f9 100%); background-size:200% 100%; animation:bdt-shim 1.4s infinite; }
@keyframes bdt-shim { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

/* ── Error ── */
.bdt-errorpage { text-align: center; padding: 6rem 2rem; max-width: 480px; margin: 0 auto; }
.bdt-error-icon  { font-size: 4rem; opacity: .35; margin-bottom: 1rem; }
.bdt-error-title { font-size: 1.4rem; font-weight: 800; color: #0f172a; margin-bottom: .5rem; }
.bdt-error-msg   { color: #64748b; font-size: .9rem; margin-bottom: 1.75rem; }
.bdt-error-btn {
  display: inline-flex; align-items: center; gap: .5rem;
  padding: .7rem 1.5rem; border-radius: 50px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white; text-decoration: none; font-size: .875rem; font-weight: 700;
  transition: box-shadow .2s;
}
.bdt-error-btn:hover { box-shadow: 0 4px 14px rgba(102,126,234,.4); color: white; }

/* ── Back to top ── */
.bdt-top {
  position: fixed; bottom: 2rem; right: 2rem;
  width: 44px; height: 44px; border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white; border: none; font-size: 1.1rem;
  cursor: pointer; box-shadow: 0 4px 16px rgba(102,126,234,.4);
  display: flex; align-items: center; justify-content: center;
  transition: all .2s; z-index: 100;
}
.bdt-top:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(102,126,234,.5); }

/* ── Responsive ── */
@media (max-width: 960px) {
  .bdt-layout { grid-template-columns: 1fr; }
  .bdt-sidebar { display: none; }
  .bdt-related-mobile { display: block; margin-top: 2rem; }
  .bdt-hero-content { max-width: 100%; }
}
@media (max-width: 640px) {
  .bdt-hero { min-height: 420px; }
  .bdt-hero-title { font-size: 1.5rem; }
  .bdt-hero-excerpt { font-size: .95rem; }
  .bdt-hero-content { padding: 1.25rem 1.25rem 2rem; }
  .bdt-topbar { padding: 1rem 1.25rem; }
  .bdt-container { padding: 1.5rem 1rem 3rem; }
  .bdt-content { font-size: .95rem; }
  .bdt-engage { padding: 1rem; }
  .bdt-top { bottom: 1.25rem; right: 1.25rem; }
}
`;
