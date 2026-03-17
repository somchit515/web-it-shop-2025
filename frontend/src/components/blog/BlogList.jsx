import React, { useState } from 'react';
import { useGetBlogsQuery } from '../redux/api/blogApi';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

/* ============================================================
   BlogList – Bootstrap 5 + Lao Language
   Inject this <style> tag once globally or import as a CSS file
   ============================================================ */
const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@300;400;600;700;800&display=swap');

:root {
  --primary:       #1e3a5f;
  --primary-light: #2563eb;
  --accent:        #f59e0b;
  --accent-soft:   #fef3c7;
  --surface:       #f8fafc;
  --card-bg:       #ffffff;
  --text-main:     #0f172a;
  --text-muted:    #64748b;
  --border:        #e2e8f0;
  --radius:        16px;
  --radius-sm:     10px;
  --shadow-sm:     0 2px 8px rgba(0,0,0,.06);
  --shadow-md:     0 8px 28px rgba(0,0,0,.10);
  --shadow-hover:  0 20px 48px rgba(30,58,95,.18);
  --gradient:      linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%);
}

body { font-family: 'Noto Sans Lao', sans-serif; background: var(--surface); }

/* ── Hero ── */
.bl-hero {
  background: var(--gradient);
  position: relative;
  overflow: hidden;
  padding: 80px 0 60px;
}
.bl-hero::before {
  content: '';
  position: absolute; inset: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Ccircle cx='30' cy='30' r='20'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
.bl-hero .badge-live {
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(255,255,255,.15); backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,.25);
  color: #fff; border-radius: 50px; padding: 6px 18px;
  font-size: .8rem; font-weight: 600; letter-spacing: .04em;
  margin-bottom: 1.25rem;
}
.bl-hero .badge-live span.dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: #4ade80;
  box-shadow: 0 0 0 3px rgba(74,222,128,.3);
  animation: blink 1.6s ease-in-out infinite;
}
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }

.bl-hero h1 {
  color: #fff; font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800; line-height: 1.15; margin-bottom: .75rem;
}
.bl-hero h1 em { color: var(--accent); font-style: normal; }
.bl-hero p { color: rgba(255,255,255,.75); font-size: 1.05rem; max-width: 520px; margin: 0 auto; }

/* ── Search ── */
.bl-search-wrap { margin-top: -30px; margin-bottom: 2rem; }
.bl-search-card {
  background: #fff;
  border-radius: var(--radius);
  box-shadow: var(--shadow-md);
  padding: 1.5rem 2rem;
}
.bl-search-input-wrap { position: relative; }
.bl-search-input-wrap .icon-left {
  position: absolute; left: 1.1rem; top: 50%; transform: translateY(-50%);
  color: var(--text-muted); font-size: 1rem; pointer-events: none;
}
.bl-search-input {
  width: 100%;
  padding: .85rem 3rem .85rem 3rem;
  border: 2px solid var(--border);
  border-radius: var(--radius-sm);
  font-family: inherit; font-size: 1rem;
  transition: border-color .25s, box-shadow .25s;
  outline: none; background: var(--surface);
}
.bl-search-input:focus {
  border-color: var(--primary-light);
  box-shadow: 0 0 0 4px rgba(37,99,235,.12);
  background: #fff;
}
.bl-search-clear {
  position: absolute; right: .85rem; top: 50%; transform: translateY(-50%);
  border: none; background: var(--border); color: var(--text-muted);
  width: 26px; height: 26px; border-radius: 50%; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background .2s;
}
.bl-search-clear:hover { background: #cbd5e1; }

/* ── Category Tabs ── */
.bl-cats {
  display: flex; flex-wrap: wrap; gap: .6rem;
  justify-content: center; margin-top: 1rem;
}
.bl-cat-btn {
  display: inline-flex; align-items: center; gap: .4rem;
  padding: .55rem 1.25rem; border-radius: 50px;
  border: 2px solid var(--border); background: #fff;
  color: var(--text-muted); font-family: inherit;
  font-weight: 600; font-size: .875rem; cursor: pointer;
  transition: all .25s; user-select: none;
}
.bl-cat-btn:hover { border-color: var(--primary-light); color: var(--primary-light); background: #eff6ff; }
.bl-cat-btn.active {
  border-color: var(--primary); background: var(--primary); color: #fff;
  box-shadow: 0 4px 14px rgba(30,58,95,.35);
}

/* ── Result bar ── */
.bl-result-bar {
  display: flex; align-items: center; gap: .75rem;
  font-size: .9rem; color: var(--text-muted); margin-bottom: 1.5rem;
}
.bl-result-bar strong { color: var(--primary-light); }
.bl-tag {
  display: inline-flex; align-items: center; gap: .35rem;
  padding: .3rem .85rem; background: var(--accent-soft);
  color: #92400e; border-radius: 50px; font-size: .8rem; font-weight: 600;
}
.bl-tag button { border: none; background: none; cursor: pointer; color: #92400e; padding: 0; margin-left: 2px; font-size: 1rem; line-height: 1; }

/* ── Cards ── */
.bl-card {
  background: var(--card-bg);
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border);
  transition: transform .35s cubic-bezier(.4,0,.2,1), box-shadow .35s;
  height: 100%;
  display: flex; flex-direction: column;
}
.bl-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-hover);
}
.bl-card a { text-decoration: none; color: inherit; display: flex; flex-direction: column; height: 100%; }

/* Image */
.bl-img-wrap { position: relative; overflow: hidden; height: 220px; flex-shrink: 0; }
.bl-img-wrap img {
  width: 100%; height: 100%; object-fit: cover;
  transition: transform .5s cubic-bezier(.4,0,.2,1);
}
.bl-card:hover .bl-img-wrap img { transform: scale(1.08); }
.bl-img-placeholder {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  font-size: 4rem;
  background: linear-gradient(135deg, #e0e7ff 0%, #fce7f3 100%);
}
.bl-img-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(180deg, transparent 50%, rgba(0,0,0,.45) 100%);
  opacity: 0; transition: opacity .3s;
}
.bl-card:hover .bl-img-overlay { opacity: 1; }

/* Cat badge on image */
.bl-cat-badge {
  position: absolute; top: 12px; left: 12px;
  padding: .3rem .85rem; border-radius: 50px;
  font-size: .75rem; font-weight: 700;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,.3);
  display: flex; align-items: center; gap: .35rem;
  box-shadow: 0 2px 8px rgba(0,0,0,.15); z-index: 1;
}
.bl-cat-badge .bdot {
  width: 5px; height: 5px; border-radius: 50%;
  animation: blink 2s ease-in-out infinite;
}

/* Card body */
.bl-card-body { padding: 1.4rem 1.5rem 1.5rem; flex: 1; display: flex; flex-direction: column; }
.bl-meta {
  display: flex; flex-wrap: wrap; gap: .5rem .9rem;
  color: var(--text-muted); font-size: .8rem; margin-bottom: .85rem;
}
.bl-meta span { display: flex; align-items: center; gap: .3rem; }
.bl-meta span:hover { color: var(--primary-light); }
.bl-card-title {
  font-size: 1.15rem; font-weight: 700; color: var(--text-main);
  line-height: 1.4; margin-bottom: .65rem;
  transition: color .2s;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.bl-card:hover .bl-card-title { color: var(--primary-light); }
.bl-excerpt {
  font-size: .9rem; color: var(--text-muted); line-height: 1.7;
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
  flex: 1; margin-bottom: 1rem;
}
.bl-read-more {
  display: inline-flex; align-items: center; gap: .4rem;
  font-weight: 700; font-size: .85rem; color: var(--primary-light);
  margin-top: auto;
  transition: gap .2s;
}
.bl-card:hover .bl-read-more { gap: .65rem; }

/* ── Empty State ── */
.bl-empty {
  text-align: center; padding: 5rem 1rem;
  grid-column: 1 / -1;
}
.bl-empty .icon { font-size: 4rem; margin-bottom: 1rem; }
.bl-empty h4 { color: var(--text-main); font-weight: 700; }
.bl-empty p { color: var(--text-muted); }

/* ── Pagination ── */
.bl-pag { display: flex; justify-content: center; align-items: center; gap: .5rem; padding: 2.5rem 0; }
.bl-pag-btn {
  border: 2px solid var(--border); background: #fff;
  color: var(--text-muted); border-radius: var(--radius-sm);
  padding: .5rem 1.1rem; font-family: inherit; font-weight: 600;
  cursor: pointer; transition: all .2s; display: flex; align-items: center; gap: .4rem;
  font-size: .875rem;
}
.bl-pag-btn:hover:not(.disabled) { border-color: var(--primary-light); color: var(--primary-light); background: #eff6ff; }
.bl-pag-btn.active { background: var(--primary); border-color: var(--primary); color: #fff; }
.bl-pag-btn.disabled { opacity: .4; cursor: not-allowed; }
.bl-pag-dots { color: var(--text-muted); padding: 0 .25rem; }

/* ── Skeleton ── */
@keyframes shimmer {
  0%  { background-position: -800px 0 }
  100%{ background-position:  800px 0 }
}
.skel {
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 800px 100%;
  animation: shimmer 1.4s infinite linear;
  border-radius: 8px;
}

/* ── Fade-in ── */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
.fade-up { animation: fadeUp .55s ease both; }
`;

/* ── Inject Styles ── */
if (!document.getElementById('bl-styles')) {
  const s = document.createElement('style');
  s.id = 'bl-styles';
  s.textContent = STYLE;
  document.head.appendChild(s);
}

/* ── Data Helpers ── */
const CATEGORIES = [
  { id: 'all',    name: 'ທັງໝົດ',       icon: '📚' },
  { id: 'tech',   name: 'ເທັກໂນໂລຢີ',  icon: '💻' },
  { id: 'review', name: 'ລີວິວ',        icon: '⭐' },
  { id: 'guide',  name: 'ຄູ່ມື',        icon: '📖' },
  { id: 'news',   name: 'ຂ່າວສານ',      icon: '📰' },
];

const CAT_INFO = {
  tech:   { bg: 'rgba(59,130,246,.12)',   color: '#2563eb', label: 'ເທັກໂນໂລຢີ' },
  review: { bg: 'rgba(245,158,11,.12)',   color: '#d97706', label: 'ລີວິວ' },
  guide:  { bg: 'rgba(16,185,129,.12)',   color: '#059669', label: 'ຄູ່ມື' },
  news:   { bg: 'rgba(139,92,246,.12)',   color: '#7c3aed', label: 'ຂ່າວສານ' },
};

const getCat = (c) => CAT_INFO[c] || CAT_INFO.tech;

const formatLaoDate = (date) => {
  try {
    let r = formatDistanceToNow(new Date(date), { addSuffix: true });
    const map = {
      'less than a minute ago': 'ໜຶ່ງນາທີ',
      'about': 'ປະມານ', 'over': 'ກວ່າ', 'almost': 'ເກືອບ',
      'minute ago': 'ນາທີຜ່ານມາ', 'minutes ago': 'ນາທີຜ່ານມາ',
      'hour ago': 'ຊົ່ວໂມງຜ່ານມາ', 'hours ago': 'ຊົ່ວໂມງຜ່ານມາ',
      'day ago': 'ວັນຜ່ານມາ', 'days ago': 'ວັນຜ່ານມາ',
      'week ago': 'ອາທິດຜ່ານມາ', 'weeks ago': 'ອາທິດຜ່ານມາ',
      'month ago': 'ເດືອນຜ່ານມາ', 'months ago': 'ເດືອນຜ່ານມາ',
      'year ago': 'ປີຜ່ານມາ', 'years ago': 'ປີຜ່ານມາ',
      'ago': 'ຜ່ານມາ',
    };
    for (const [en, lo] of Object.entries(map)) r = r.replace(new RegExp(en, 'gi'), lo);
    return r;
  } catch { return 'ບໍ່ນານມານີ້'; }
};

/* ════════════════════════════════════════════
   BlogList
════════════════════════════════════════════ */
const BlogList = () => {
  const [page, setPage]         = useState(1);
  const [category, setCategory] = useState('all');
  const [searchTerm, setSearch] = useState('');

  const { data, isLoading, error } = useGetBlogsQuery({
    page,
    category: category === 'all' ? '' : category,
    search: searchTerm,
    limit: 9,
  });

  if (isLoading) return <BlogSkeleton />;
  if (error)     return <BlogError error={error} />;

  const blogs = data?.blogs || [];

  return (
    <>
      {/* ── Hero ── */}
      <section className="bl-hero text-center">
        <div className="container">
          <div className="badge-live mb-3">
            <span className="dot"></span>
            ອັບເດດໃໝ່ທຸກວັນ
          </div>
          <h1><em>ບລັອກ</em>ເທັກໂນໂລຢີ</h1>
          <p className="mb-0">ຄົ້ນພົບບົດຄວາມ, ລີວິວ ແລະ ຄູ່ມືການໃຊ້ງານທີ່ມີປະໂຫຍດ</p>
        </div>
      </section>

      {/* ── Search + Filters ── */}
      <div className="container bl-search-wrap">
        <div className="bl-search-card">
          {/* Search input */}
          <div className="bl-search-input-wrap mb-3">
            <i className="fas fa-search icon-left"></i>
            <input
              type="text"
              className="bl-search-input"
              placeholder="ຄົ້ນຫາບົດຄວາມທີ່ທ່ານສົນໃຈ..."
              value={searchTerm}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
            {searchTerm && (
              <button className="bl-search-clear" onClick={() => setSearch('')}>
                <i className="fas fa-times" style={{ fontSize: '.7rem' }}></i>
              </button>
            )}
          </div>

          {/* Category tabs */}
          <div className="bl-cats">
            {CATEGORIES.map(c => (
              <button
                key={c.id}
                className={`bl-cat-btn${category === c.id ? ' active' : ''}`}
                onClick={() => { setCategory(c.id); setPage(1); }}
              >
                <span>{c.icon}</span> {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="container pb-5">
        {/* Result bar */}
        {blogs.length > 0 && (
          <div className="bl-result-bar">
            <i className="fas fa-file-alt" style={{ color: 'var(--primary-light)' }}></i>
            ພົບ <strong>{data?.pagination?.totalBlogs || blogs.length}</strong> ບົດຄວາມ
            {searchTerm && (
              <span className="bl-tag">
                <i className="fas fa-search" style={{ fontSize: '.7rem' }}></i>
                "{searchTerm}"
                <button onClick={() => setSearch('')}>×</button>
              </span>
            )}
          </div>
        )}

        {/* Grid */}
        <div className="row g-4">
          {blogs.length > 0 ? (
            blogs.map((blog, i) => (
              <div key={blog._id} className="col-12 col-md-6 col-lg-4 fade-up" style={{ animationDelay: `${i * 0.07}s` }}>
                <BlogCard blog={blog} />
              </div>
            ))
          ) : (
            <div className="bl-empty">
              <div className="icon">🔍</div>
              <h4>ບໍ່ພົບບົດຄວາມ</h4>
              <p>ລອງປ່ຽນຄຳຄົ້ນຫາ ຫຼື ເລືອກໝວດໝູ່ອື່ນ</p>
              {(searchTerm || category !== 'all') && (
                <button
                  className="btn btn-outline-primary mt-2"
                  style={{ borderRadius: 50, fontFamily: 'inherit', fontWeight: 600 }}
                  onClick={() => { setSearch(''); setCategory('all'); }}
                >
                  <i className="fas fa-redo me-2"></i>ລ້າງການຄົ້ນຫາ
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {data?.pagination?.totalPages > 1 && (
          <BlogPagination pagination={data.pagination} onPageChange={setPage} />
        )}
      </div>
    </>
  );
};

/* ════════════════════════════════════════════
   BlogCard
════════════════════════════════════════════ */
const BlogCard = ({ blog }) => {
  const cat = getCat(blog.category);
  const imgSrc = blog.image?.url || blog.image;
  const emoji = blog.category === 'review' ? '⭐' : blog.category === 'guide' ? '📖' : blog.category === 'news' ? '📰' : '💻';

  return (
    <div className="bl-card">
      <Link to={`/blogs/${blog.slug || blog._id}`}>
        {/* Image */}
        <div className="bl-img-wrap">
          {imgSrc
            ? <img src={imgSrc} alt={blog.title} loading="lazy" />
            : <div className="bl-img-placeholder">{emoji}</div>
          }
          <div className="bl-img-overlay"></div>
          <div className="bl-cat-badge" style={{ background: cat.bg, color: cat.color }}>
            <span className="bdot" style={{ background: cat.color }}></span>
            {cat.label}
          </div>
        </div>

        {/* Body */}
        <div className="bl-card-body">
          <div className="bl-meta">
            <span><i className="far fa-clock"></i> {formatLaoDate(blog.createdAt)}</span>
            <span><i className="far fa-eye"></i> {(blog.views || 0).toLocaleString()}</span>
            <span><i className="far fa-comment"></i> {blog.comments?.length || 0}</span>
          </div>

          <h3 className="bl-card-title">{blog.title}</h3>
          <p className="bl-excerpt">{blog.excerpt}</p>

          <div className="bl-read-more">
            <span>ອ່ານຕໍ່</span>
            <i className="fas fa-arrow-right" style={{ fontSize: '.75rem' }}></i>
          </div>
        </div>
      </Link>
    </div>
  );
};

/* ════════════════════════════════════════════
   Pagination
════════════════════════════════════════════ */
const BlogPagination = ({ pagination, onPageChange }) => {
  const { currentPage, totalPages, hasNext, hasPrev } = pagination;

  const pages = (() => {
    const show = 5;
    let s = Math.max(1, currentPage - Math.floor(show / 2));
    let e = Math.min(totalPages, s + show - 1);
    if (e - s < show - 1) s = Math.max(1, e - show + 1);
    return Array.from({ length: e - s + 1 }, (_, i) => s + i);
  })();

  return (
    <div className="bl-pag">
      <button className={`bl-pag-btn${!hasPrev ? ' disabled' : ''}`}
        onClick={() => hasPrev && onPageChange(currentPage - 1)} disabled={!hasPrev}>
        <i className="fas fa-chevron-left" style={{ fontSize: '.75rem' }}></i> ກ່ອນໜ້າ
      </button>

      {pages[0] > 1 && (
        <>
          <button className="bl-pag-btn" onClick={() => onPageChange(1)}>1</button>
          {pages[0] > 2 && <span className="bl-pag-dots">…</span>}
        </>
      )}

      {pages.map(p => (
        <button key={p} className={`bl-pag-btn${p === currentPage ? ' active' : ''}`}
          onClick={() => onPageChange(p)}>{p}</button>
      ))}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && <span className="bl-pag-dots">…</span>}
          <button className="bl-pag-btn" onClick={() => onPageChange(totalPages)}>{totalPages}</button>
        </>
      )}

      <button className={`bl-pag-btn${!hasNext ? ' disabled' : ''}`}
        onClick={() => hasNext && onPageChange(currentPage + 1)} disabled={!hasNext}>
        ຖັດໄປ <i className="fas fa-chevron-right" style={{ fontSize: '.75rem' }}></i>
      </button>
    </div>
  );
};

/* ════════════════════════════════════════════
   Skeleton / Error
════════════════════════════════════════════ */
const BlogSkeleton = () => (
  <>
    <section className="bl-hero">
      <div className="container text-center">
        <div className="skel mx-auto mb-3" style={{ width: 160, height: 32, borderRadius: 50 }}></div>
        <div className="skel mx-auto mb-2" style={{ width: 340, height: 52 }}></div>
        <div className="skel mx-auto" style={{ width: 480, height: 20 }}></div>
      </div>
    </section>
    <div className="container py-5">
      <div className="row g-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="col-12 col-md-6 col-lg-4">
            <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
              <div className="skel" style={{ height: 220 }}></div>
              <div className="p-4">
                <div className="skel mb-3" style={{ height: 14, width: '60%' }}></div>
                <div className="skel mb-2" style={{ height: 22 }}></div>
                <div className="skel mb-1" style={{ height: 14 }}></div>
                <div className="skel" style={{ height: 14, width: '80%' }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </>
);

const BlogError = ({ error }) => (
  <div className="container py-5 text-center">
    <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>⚠️</div>
    <h4 style={{ fontWeight: 700, color: '#0f172a', fontFamily: 'Noto Sans Lao, sans-serif' }}>ເກີດຂໍ້ຜິດພາດ</h4>
    <p style={{ color: '#64748b' }}>{error?.data?.message || 'ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້'}</p>
    <button className="btn btn-primary" style={{ borderRadius: 50, fontFamily: 'inherit', fontWeight: 600 }}
      onClick={() => window.location.reload()}>
      <i className="fas fa-redo me-2"></i>ລອງໃໝ່
    </button>
  </div>
);

export default BlogList;