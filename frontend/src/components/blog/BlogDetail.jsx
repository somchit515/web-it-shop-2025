import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  useGetBlogDetailsQuery,
  useLikeBlogMutation,
  useAddCommentMutation,
  useGetRelatedBlogsQuery
} from '../redux/api/blogApi';
import { useSelector } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import MetaData from '../layout/MetaData';
import { toast } from 'react-hot-toast';

/* ══════════════════════════════════════════════════
   STYLES — Editorial Dark Magazine
══════════════════════════════════════════════════ */
const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@300;400;600;700;800&family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Mono:wght@400;500&display=swap');

:root {
  --ink:     #0d0d0d;
  --paper:   #fafaf7;
  --cream:   #f2efe8;
  --muted:   #8a8880;
  --accent:  #c8432a;
  --blue:    #1d4ed8;
  --gold:    #b5922a;
  --border:  #e0ddd6;
  --white:   #ffffff;
  --sans:    'Noto Sans Lao', 'Phetsarath OT', sans-serif;
  --serif:   'Playfair Display', Georgia, serif;
  --mono:    'DM Mono', monospace;
}

/* ── Reset & base ── */
.bd-root * { box-sizing: border-box; margin: 0; padding: 0; }
.bd-root {
  font-family: var(--sans);
  background: var(--paper);
  color: var(--ink);
  min-height: 100vh;
}

/* ── Progress bar ── */
.bd-progress {
  position: fixed; top: 0; left: 0; height: 3px;
  background: var(--accent); z-index: 9999;
  transition: width .1s linear;
  box-shadow: 0 0 8px rgba(200,67,42,.5);
}

/* ── Wrapper ── */
.bd-wrap {
  max-width: 760px;
  margin: 0 auto;
  padding: 0 1.5rem 6rem;
}

/* ── Top bar ── */
.bd-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 1.5rem 0;
  max-width: 760px;
  margin: 0 auto;
}
.bd-back {
  display: inline-flex; align-items: center; gap: .5rem;
  font-size: .78rem; font-weight: 700; letter-spacing: .08em;
  text-transform: uppercase; color: var(--muted);
  text-decoration: none; transition: color .2s;
}
.bd-back:hover { color: var(--accent); }
.bd-breadcrumb {
  font-size: .75rem; color: var(--muted);
  font-family: var(--mono); letter-spacing: .05em;
}

/* ── Hero section ── */
.bd-hero {
  padding: 3.5rem 1.5rem 0;
  max-width: 760px;
  margin: 0 auto;
}

/* Category + date row */
.bd-meta-row {
  display: flex; align-items: center; gap: 1rem;
  margin-bottom: 1.75rem; flex-wrap: wrap;
}
.bd-cat {
  display: inline-flex; align-items: center; gap: .4rem;
  font-size: .7rem; font-weight: 800; letter-spacing: .12em;
  text-transform: uppercase;
  padding: .35rem .9rem;
  border-radius: 3px;
  background: var(--accent); color: var(--white);
}
.bd-cat-tech   { background: #1d4ed8; }
.bd-cat-review { background: #b5922a; }
.bd-cat-guide  { background: #2d7a4e; }
.bd-cat-news   { background: #6b21a8; }

.bd-date {
  font-size: .78rem; color: var(--muted);
  font-family: var(--mono); letter-spacing: .04em;
}
.bd-readtime {
  display: inline-flex; align-items: center; gap: .3rem;
  font-size: .75rem; color: var(--muted);
  font-family: var(--mono);
  margin-left: auto;
}

/* Title */
.bd-title {
  font-family: var(--serif);
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 900;
  line-height: 1.2;
  color: var(--ink);
  margin-bottom: 1.5rem;
  letter-spacing: -.02em;
}

/* Excerpt / deck */
.bd-excerpt {
  font-size: 1.15rem;
  color: #4a4845;
  line-height: 1.7;
  border-left: 3px solid var(--accent);
  padding-left: 1.25rem;
  margin-bottom: 2rem;
  font-weight: 300;
}

/* Author row */
.bd-author-row {
  display: flex; align-items: center; gap: 1rem;
  padding: 1.25rem 0;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  margin-bottom: 2.5rem;
}
.bd-avatar {
  width: 46px; height: 46px; border-radius: 50%;
  object-fit: cover; flex-shrink: 0;
  border: 2px solid var(--border);
}
.bd-avatar-placeholder {
  width: 46px; height: 46px; border-radius: 50%;
  background: var(--cream); display: flex;
  align-items: center; justify-content: center;
  font-size: 1.2rem; flex-shrink: 0;
  border: 2px solid var(--border);
}
.bd-author-name {
  font-weight: 700; font-size: .9rem; color: var(--ink);
  display: block; margin-bottom: .15rem;
}
.bd-author-sub {
  font-size: .75rem; color: var(--muted);
  font-family: var(--mono);
}
.bd-share-btn {
  margin-left: auto; display: inline-flex; align-items: center; gap: .4rem;
  font-size: .75rem; font-weight: 700; letter-spacing: .08em;
  text-transform: uppercase; color: var(--muted);
  background: none; border: 1px solid var(--border);
  padding: .5rem 1rem; border-radius: 4px; cursor: pointer;
  transition: all .2s;
}
.bd-share-btn:hover { border-color: var(--ink); color: var(--ink); }

/* ── Cover image ── */
.bd-cover {
  width: calc(100% + 3rem);
  margin-left: -1.5rem;
  margin-bottom: 2.5rem;
  max-height: 480px;
  overflow: hidden;
  position: relative;
}
.bd-cover img {
  width: 100%; height: 100%;
  object-fit: cover; display: block;
  transition: transform .6s ease;
}
.bd-cover:hover img { transform: scale(1.02); }
.bd-cover-placeholder {
  width: 100%; height: 360px;
  background: linear-gradient(135deg, var(--cream) 0%, var(--border) 100%);
  display: flex; align-items: center; justify-content: center;
  font-size: 5rem; color: var(--border);
}

/* ── Article body ── */
.bd-body {
  font-size: 1.05rem;
  line-height: 1.9;
  color: #2c2a27;
  margin-bottom: 3rem;
  letter-spacing: .01em;
}
.bd-body h1, .bd-body h2, .bd-body h3,
.bd-body h4, .bd-body h5, .bd-body h6 {
  font-family: var(--serif);
  color: var(--ink);
  margin-top: 2.5rem;
  margin-bottom: .75rem;
  line-height: 1.3;
}
.bd-body h2 { font-size: 1.6rem; }
.bd-body h3 { font-size: 1.3rem; }
.bd-body p  { margin-bottom: 1.5rem; }
.bd-body a  { color: var(--blue); text-decoration: underline; text-underline-offset: 3px; }
.bd-body img {
  max-width: 100%; height: auto;
  border-radius: 6px; margin: 2rem 0;
  box-shadow: 0 4px 24px rgba(0,0,0,.1);
}
.bd-body blockquote {
  border-left: 3px solid var(--accent);
  margin: 2rem 0;
  padding: 1rem 1.5rem;
  background: var(--cream);
  border-radius: 0 6px 6px 0;
  font-style: italic;
  font-family: var(--serif);
  font-size: 1.1rem;
  color: #3a3835;
}
.bd-body code {
  background: #1a1a1a; color: #e8d5b7;
  padding: .2rem .5rem; border-radius: 3px;
  font-family: var(--mono); font-size: .85em;
}
.bd-body pre {
  background: #1a1a1a; color: #e8d5b7;
  padding: 1.5rem; border-radius: 8px;
  overflow-x: auto; margin: 1.5rem 0;
  font-family: var(--mono); font-size: .88rem;
  line-height: 1.6;
}
.bd-body pre code { background: none; padding: 0; color: inherit; }

/* ── Tags ── */
.bd-tags {
  display: flex; flex-wrap: wrap; gap: .5rem;
  margin-bottom: 2.5rem;
  padding-bottom: 2.5rem;
  border-bottom: 1px solid var(--border);
}
.bd-tag {
  font-size: .72rem; font-weight: 700; letter-spacing: .08em;
  text-transform: uppercase; color: var(--muted);
  background: var(--cream); padding: .3rem .85rem;
  border-radius: 3px; border: 1px solid var(--border);
  transition: all .2s; cursor: default;
}
.bd-tag:hover { background: var(--ink); color: var(--white); border-color: var(--ink); }

/* ── Engagement bar ── */
.bd-engage {
  display: flex; align-items: center; gap: 1.5rem;
  margin-bottom: 3.5rem; flex-wrap: wrap;
}
.bd-like-btn {
  display: inline-flex; align-items: center; gap: .6rem;
  padding: .75rem 1.5rem;
  border: 1.5px solid var(--border);
  border-radius: 4px; background: none;
  font-family: var(--sans);
  font-size: .85rem; font-weight: 700;
  color: var(--ink); cursor: pointer;
  transition: all .25s; letter-spacing: .02em;
}
.bd-like-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: rgba(200,67,42,.04);
}
.bd-like-btn.liked {
  background: rgba(200,67,42,.06);
  border-color: var(--accent);
  color: var(--accent);
}
.bd-like-btn.liked i { animation: heartbeat .4s ease; }
@keyframes heartbeat {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.35); }
  100% { transform: scale(1); }
}
.bd-stat {
  display: inline-flex; align-items: center; gap: .4rem;
  font-size: .8rem; color: var(--muted);
  font-family: var(--mono); letter-spacing: .04em;
}
.bd-divider { color: var(--border); }

/* ── Comments ── */
.bd-comments {
  margin-bottom: 4rem;
}
.bd-comments-hd {
  font-family: var(--serif);
  font-size: 1.6rem; font-weight: 700;
  color: var(--ink);
  margin-bottom: 2rem;
  display: flex; align-items: baseline; gap: .75rem;
}
.bd-comments-hd span {
  font-family: var(--mono);
  font-size: .85rem; color: var(--muted);
  font-weight: 400;
}

/* Comment form */
.bd-form { margin-bottom: 2.5rem; }
.bd-textarea {
  width: 100%;
  padding: 1rem 1.25rem;
  border: 1.5px solid var(--border);
  border-radius: 6px;
  background: var(--white);
  font-family: var(--sans);
  font-size: .95rem;
  color: var(--ink);
  resize: vertical;
  min-height: 110px;
  outline: none;
  transition: border-color .2s;
  margin-bottom: .75rem;
}
.bd-textarea:focus { border-color: var(--ink); }
.bd-textarea::placeholder { color: var(--muted); }
.bd-submit {
  display: inline-flex; align-items: center; gap: .5rem;
  padding: .72rem 1.5rem;
  background: var(--ink); color: var(--white);
  border: none; border-radius: 4px;
  font-family: var(--sans);
  font-size: .82rem; font-weight: 700;
  letter-spacing: .06em; text-transform: uppercase;
  cursor: pointer; transition: all .2s;
}
.bd-submit:hover { background: var(--accent); transform: translateY(-1px); }
.bd-submit:disabled { opacity: .5; cursor: not-allowed; transform: none; }

/* Login prompt */
.bd-login-prompt {
  text-align: center; padding: 1.5rem;
  border: 1.5px dashed var(--border);
  border-radius: 6px; margin-bottom: 2rem;
  background: var(--cream);
  font-size: .9rem; color: var(--muted);
}
.bd-login-link {
  color: var(--ink); font-weight: 700;
  text-decoration: underline; text-underline-offset: 3px;
}

/* Comment list */
.bd-comment-list { display: flex; flex-direction: column; gap: 0; }
.bd-comment {
  display: flex; gap: 1rem;
  padding: 1.5rem 0;
  border-bottom: 1px solid var(--border);
  animation: fadeUp .3s ease both;
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.bd-comment-avatar {
  width: 38px; height: 38px; border-radius: 50%;
  object-fit: cover; flex-shrink: 0;
  border: 1.5px solid var(--border);
}
.bd-comment-avatar-ph {
  width: 38px; height: 38px; border-radius: 50%;
  background: var(--cream); flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: .9rem; border: 1.5px solid var(--border);
}
.bd-comment-body { flex: 1; }
.bd-comment-hd {
  display: flex; align-items: baseline;
  gap: .75rem; margin-bottom: .4rem;
}
.bd-comment-name {
  font-weight: 700; font-size: .9rem; color: var(--ink);
}
.bd-comment-time {
  font-size: .72rem; color: var(--muted);
  font-family: var(--mono);
}
.bd-comment-text {
  font-size: .92rem; color: #3a3835; line-height: 1.65;
}

/* ── Related ── */
.bd-related { margin-top: 4rem; }
.bd-related-hd {
  font-family: var(--serif);
  font-size: 1.4rem; font-weight: 700;
  color: var(--ink); margin-bottom: 1.75rem;
  display: flex; align-items: center; gap: .75rem;
}
.bd-related-hd::after {
  content: ''; flex: 1;
  height: 1px; background: var(--border);
}
.bd-related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
}
.bd-rel-card {
  display: block; text-decoration: none; color: inherit;
  border: 1.5px solid var(--border); border-radius: 6px;
  padding: 1.25rem; background: var(--white);
  transition: all .25s; position: relative; overflow: hidden;
}
.bd-rel-card::before {
  content: ''; position: absolute;
  top: 0; left: 0; right: 0; height: 3px;
  background: var(--accent); transform: scaleX(0);
  transform-origin: left; transition: transform .3s;
}
.bd-rel-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,.08); }
.bd-rel-card:hover::before { transform: scaleX(1); }
.bd-rel-cat {
  font-size: .65rem; font-weight: 800; letter-spacing: .1em;
  text-transform: uppercase; color: var(--muted);
  margin-bottom: .75rem; display: block;
}
.bd-rel-title {
  font-family: var(--serif);
  font-size: 1rem; font-weight: 700;
  line-height: 1.4; color: var(--ink);
  margin-bottom: .6rem;
}
.bd-rel-more {
  font-size: .72rem; font-weight: 700; letter-spacing: .08em;
  text-transform: uppercase; color: var(--accent);
  display: flex; align-items: center; gap: .3rem;
}

/* ── Skeleton ── */
.bd-skeleton { padding: 3rem 1.5rem; max-width: 760px; margin: 0 auto; }
.bd-skel {
  background: linear-gradient(90deg, #eeece8 25%, #e4e2dd 50%, #eeece8 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: 4px;
}
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* ── Error ── */
.bd-error {
  text-align: center; padding: 5rem 2rem;
  max-width: 480px; margin: 0 auto;
}
.bd-error-icon { font-size: 3.5rem; margin-bottom: 1.25rem; opacity: .35; }
.bd-error-title { font-family: var(--serif); font-size: 1.5rem; color: var(--ink); margin-bottom: .5rem; }
.bd-error-msg { color: var(--muted); font-size: .9rem; margin-bottom: 2rem; }
.bd-error-link {
  display: inline-flex; align-items: center; gap: .5rem;
  padding: .75rem 1.5rem; border-radius: 4px;
  background: var(--ink); color: var(--white);
  font-size: .8rem; font-weight: 700;
  letter-spacing: .08em; text-transform: uppercase;
  text-decoration: none; transition: background .2s;
}
.bd-error-link:hover { background: var(--accent); }

/* ── Responsive ── */
@media (max-width: 768px) {
  .bd-title   { font-size: 1.7rem; }
  .bd-cover   { width: calc(100% + 2rem); margin-left: -1rem; }
  .bd-engage  { gap: 1rem; }
  .bd-related-grid { grid-template-columns: 1fr; }
  .bd-wrap    { padding: 0 1rem 5rem; }
  .bd-hero    { padding: 2rem 1rem 0; }
  .bd-topbar  { padding: 1.25rem 1rem 0; }
}
`;

/* ══════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════ */
const CAT_MAP = {
  tech:   { icon: '💻', label: 'ເທັກໂນໂລຢີ', cls: 'bd-cat-tech'   },
  review: { icon: '⭐', label: 'ລີວິວ',       cls: 'bd-cat-review' },
  guide:  { icon: '📖', label: 'ຄູ່ມື',       cls: 'bd-cat-guide'  },
  news:   { icon: '📰', label: 'ຂ່າວສານ',    cls: 'bd-cat-news'   },
};

const formatLao = (date) => {
  try {
    if (!date) return '';
    const diff = Date.now() - new Date(date).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return 'ຫາກໍ່ຜ່ານມາ';
    if (m < 60) return `${m} ນາທີຜ່ານມາ`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} ຊົ່ວໂມງຜ່ານມາ`;
    const d = Math.floor(h / 24);
    if (d < 7)  return `${d} ມື້ຜ່ານມາ`;
    const w = Math.floor(d / 7);
    if (w < 4)  return `${w} ອາທິດຜ່ານມາ`;
    const mo = Math.floor(d / 30);
    if (mo < 12) return `${mo} ເດືອນຜ່ານມາ`;
    return `${Math.floor(mo / 12)} ປີຜ່ານມາ`;
  } catch { return 'ບໍ່ນານມານີ້'; }
};

const formatFullDate = (date) => {
  try {
    return new Date(date).toLocaleDateString('lo-LA', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  } catch { return ''; }
};

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════ */
const BlogDetail = () => {
  const { id } = useParams();
  const { user } = useSelector((s) => s.auth);

  const [commentText, setCommentText] = useState('');
  const [scroll, setScroll] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Reading progress
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const pct = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
      setScroll(Math.min(100, pct));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const { data, isLoading, error } = useGetBlogDetailsQuery(id);
  const [likeBlog]    = useLikeBlogMutation();
  const [addComment]  = useAddCommentMutation();

  const blog = data?.blog || data;

  const handleLike = async () => {
    if (!user) { toast.error('ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນ'); return; }
    try {
      await likeBlog(id).unwrap();
    } catch {
      toast.error('ບໍ່ສາມາດຖືກໃຈໄດ້');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນ'); return; }
    const t = commentText.trim();
    if (!t || t.length < 3) { toast.error('ຄອມເມັນຕ້ອງມີ ≥ 3 ຕົວອັກສອນ'); return; }
    setSubmitting(true);
    try {
      await addComment({ id, comment: t }).unwrap();
      setCommentText('');
      toast.success('ສົ່ງຄວາມຄິດເຫັນສຳເລັດ');
    } catch {
      toast.error('ບໍ່ສາມາດສົ່ງຄວາມຄິດເຫັນໄດ້');
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: blog?.title, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('ຄັດລອກ URL ສຳເລັດ');
    }
  };

  /* ── States ── */
  if (isLoading) return <BlogSkeleton />;
  if (error)     return <BlogError error={error} />;
  if (!blog)     return <BlogNotFound />;

  const cat     = CAT_MAP[blog.category] || CAT_MAP.tech;
  const isLiked = blog.likes?.some((l) => (l?.user || l)?.toString() === user?._id);
  const authorImg = blog.authorId?.avatar?.url;
  const authorName = blog.author || blog.authorId?.name || 'Admin';

  return (
    <>
      <style>{STYLE}</style>
      <MetaData title={`${blog.title} — ບລັອກເທັກໂນໂລຢີ`} />

      <div className="bd-root">
        {/* Reading progress */}
        <div className="bd-progress" style={{ width: `${scroll}%` }} />

        {/* Top bar */}
        <div className="bd-topbar">
          <Link to="/blogs" className="bd-back">
            <i className="fas fa-arrow-left" style={{ fontSize: '.7rem' }}></i>
            ກັບໄປລາຍຊື່
          </Link>
          <span className="bd-breadcrumb">
            blogs / {blog.category} / {blog.slug || id}
          </span>
        </div>

        {/* Hero */}
        <div className="bd-hero">
          <div className="bd-meta-row">
            <span className={`bd-cat ${cat.cls}`}>
              {cat.icon} {cat.label}
            </span>
            <span className="bd-date">{formatFullDate(blog.createdAt)}</span>
            <span className="bd-readtime">
              <i className="far fa-clock" style={{ fontSize: '.7rem' }}></i>
              {blog.readTime || '5 ນາທີ'}
            </span>
          </div>

          <h1 className="bd-title">{blog.title}</h1>

          {blog.excerpt && (
            <p className="bd-excerpt">{blog.excerpt}</p>
          )}

          <div className="bd-author-row">
            {authorImg
              ? <img src={authorImg} alt={authorName} className="bd-avatar" />
              : <div className="bd-avatar-placeholder">👤</div>
            }
            <div>
              <span className="bd-author-name">{authorName}</span>
              <span className="bd-author-sub">
                {blog.authorId?.email || 'ຜູ້ຂຽນ'} · {formatLao(blog.createdAt)}
              </span>
            </div>
            <button className="bd-share-btn" onClick={handleShare}>
              <i className="fas fa-share-nodes" style={{ fontSize: '.75rem' }}></i>
              ແຊ
            </button>
          </div>
        </div>

        {/* Main wrap */}
        <div className="bd-wrap">

          {/* Cover image */}
          <div className="bd-cover">
            {blog.image?.url || blog.image
              ? <img src={blog.image?.url || blog.image} alt={blog.title} />
              : <div className="bd-cover-placeholder">{cat.icon}</div>
            }
          </div>

          {/* Body */}
          <div
            className="bd-body"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {/* Tags */}
          {blog.tags?.length > 0 && (
            <div className="bd-tags">
              {blog.tags.map((t) => (
                <span key={t} className="bd-tag">#{t}</span>
              ))}
            </div>
          )}

          {/* Engagement */}
          <div className="bd-engage">
            <button
              className={`bd-like-btn ${isLiked ? 'liked' : ''}`}
              onClick={handleLike}
            >
              <i className={`${isLiked ? 'fas' : 'far'} fa-heart`}></i>
              {blog.likes?.length || 0} ຖືກໃຈ
            </button>

            <span className="bd-divider">|</span>

            <span className="bd-stat">
              <i className="far fa-eye"></i>
              {(blog.views || 0).toLocaleString()} ວິວ
            </span>

            <span className="bd-stat">
              <i className="far fa-comment"></i>
              {blog.comments?.length || 0} ຄວາມຄິດເຫັນ
            </span>
          </div>

          {/* Comments */}
          <div className="bd-comments">
            <h3 className="bd-comments-hd">
              ຄວາມຄິດເຫັນ
              <span>( {blog.comments?.length || 0} )</span>
            </h3>

            {user ? (
              <form onSubmit={handleComment} className="bd-form">
                <textarea
                  className="bd-textarea"
                  placeholder="ແບ່ງປັນຄວາມຄິດເຫັນຂອງທ່ານ..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={4}
                />
                <button type="submit" className="bd-submit" disabled={submitting}>
                  {submitting
                    ? <><i className="fas fa-spinner fa-spin"></i> ກຳລັງສົ່ງ...</>
                    : <><i className="far fa-paper-plane"></i> ສົ່ງຄວາມຄິດເຫັນ</>
                  }
                </button>
              </form>
            ) : (
              <div className="bd-login-prompt">
                ກະລຸນາ{' '}
                <Link to="/login" className="bd-login-link">ເຂົ້າສູ່ລະບົບ</Link>
                {' '}ເພື່ອຄອມເມັນ
              </div>
            )}

            <div className="bd-comment-list">
              {blog.comments?.length > 0
                ? blog.comments.map((c, i) => (
                    <div key={c._id || i} className="bd-comment" style={{ animationDelay: `${i * 0.05}s` }}>
                      {c.user?.avatar?.url
                        ? <img src={c.user.avatar.url} alt={c.user?.name} className="bd-comment-avatar" />
                        : <div className="bd-comment-avatar-ph">👤</div>
                      }
                      <div className="bd-comment-body">
                        <div className="bd-comment-hd">
                          <span className="bd-comment-name">{c.user?.name || 'ຜູ້ໃຊ້'}</span>
                          <span className="bd-comment-time">{formatLao(c.createdAt)}</span>
                        </div>
                        <p className="bd-comment-text">{c.text || c.comment}</p>
                      </div>
                    </div>
                  ))
                : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)', fontSize: '.9rem' }}>
                    ຍັງບໍ່ມີຄວາມຄິດເຫັນ — ເປັນຄົນທຳອິດ!
                  </div>
                )
              }
            </div>
          </div>

          {/* Related */}
          <RelatedBlogs currentBlogId={id} />

        </div>
      </div>
    </>
  );
};

/* ══════════════════════════════════════════════════
   SUB-COMPONENTS
══════════════════════════════════════════════════ */
const RelatedBlogs = ({ currentBlogId }) => {
  const { data: relatedData } = useGetRelatedBlogsQuery(currentBlogId);
  const blogs = Array.isArray(relatedData) ? relatedData : relatedData?.blogs;
  if (!blogs?.length) return null;

  return (
    <div className="bd-related">
      <h3 className="bd-related-hd">ບົດຄວາມທີ່ກ່ຽວຂ້ອງ</h3>
      <div className="bd-related-grid">
        {blogs.slice(0, 3).map((b) => {
          const cat = CAT_MAP[b.category] || CAT_MAP.tech;
          return (
            <Link key={b._id} to={`/blogs/${b.slug || b._id}`} className="bd-rel-card">
              <span className="bd-rel-cat">{cat.icon} {cat.label}</span>
              <h4 className="bd-rel-title">{b.title}</h4>
              <span className="bd-rel-more">
                ອ່ານຕໍ່ <i className="fas fa-arrow-right" style={{ fontSize: '.65rem' }}></i>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

const BlogSkeleton = () => (
  <div className="bd-skeleton">
    <div className="bd-skel" style={{ height: 16, width: 120, marginBottom: 32 }} />
    <div className="bd-skel" style={{ height: 14, width: 80, marginBottom: 16 }} />
    <div className="bd-skel" style={{ height: 48, width: '90%', marginBottom: 12 }} />
    <div className="bd-skel" style={{ height: 48, width: '70%', marginBottom: 24 }} />
    <div className="bd-skel" style={{ height: 20, marginBottom: 8 }} />
    <div className="bd-skel" style={{ height: 20, width: '80%', marginBottom: 32 }} />
    <div className="bd-skel" style={{ height: 400, borderRadius: 8, marginBottom: 32 }} />
    {[1,2,3,4,5].map((i) => (
      <div key={i} className="bd-skel" style={{ height: 16, width: `${75 + Math.random()*25}%`, marginBottom: 12 }} />
    ))}
  </div>
);

const BlogError = ({ error }) => (
  <div className="bd-error">
    <div className="bd-error-icon">🔌</div>
    <h3 className="bd-error-title">ໂຫຼດບໍ່ສຳເລັດ</h3>
    <p className="bd-error-msg">{error?.data?.message || 'ບໍ່ສາມາດເຊື່ອມຕໍ່ກັບ Server ໄດ້'}</p>
    <Link to="/blogs" className="bd-error-link">
      <i className="fas fa-arrow-left"></i> ກັບໄປໜ້າບລັອກ
    </Link>
  </div>
);

const BlogNotFound = () => (
  <div className="bd-error">
    <div className="bd-error-icon">🔍</div>
    <h3 className="bd-error-title">ບໍ່ພົບບົດຄວາມ</h3>
    <p className="bd-error-msg">ບົດຄວາມທີ່ທ່ານຊອກຫາບໍ່ມີໃນລະບົບ</p>
    <Link to="/blogs" className="bd-error-link">
      <i className="fas fa-arrow-left"></i> ກັບໄປໜ້າບລັອກ
    </Link>
  </div>
);

export default BlogDetail;