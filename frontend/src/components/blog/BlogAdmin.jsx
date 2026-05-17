import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { toast } from "react-hot-toast";
import {
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
  useGetBlogDetailsQuery,
} from "../redux/api/blogApi";
import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import Loader from "../layout/Loader";

/* ─── Constants ─────────────────────────────────────── */
const CATS = [
  { id: "tech",   name: "ເທັກໂນໂລຢີ", icon: "💻", color: "#2563eb", bg: "#eff6ff" },
  { id: "review", name: "ລີວິວ",        icon: "⭐", color: "#d97706", bg: "#fffbeb" },
  { id: "guide",  name: "ຄູ່ມື",        icon: "📖", color: "#059669", bg: "#f0fdf4" },
  { id: "news",   name: "ຂ່າວສານ",     icon: "📰", color: "#7c3aed", bg: "#faf5ff" },
];

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, 4, false] }],
    ["bold", "italic", "underline", "strike"],
    ["blockquote", "code-block"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],
    ["link", "image"],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    ["clean"],
  ],
};

/* ─── Helpers ───────────────────────────────────────── */
const genSlug = (t) =>
  t.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim().substring(0, 60);

const calcReadTime = (html) => {
  const words = html.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 200))} ນາທີ`;
};

const toBase64 = (file) =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload  = (e) => res(e.target.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

const autoHeight = (el) => {
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
};

/* ─── SideCard ──────────────────────────────────────── */
function SideCard({ title, icon, children, defaultOpen = true, danger = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`sc-card${danger ? " sc-danger" : ""}`}>
      <button type="button" className="sc-head" onClick={() => setOpen((o) => !o)}>
        <span className="sc-title">
          <span className="sc-icon">{icon}</span>
          {title}
        </span>
        <span className={`sc-chevron${open ? " open" : ""}`}>›</span>
      </button>
      {open && <div className="sc-body">{children}</div>}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────── */
export default function BlogAdmin() {
  const navigate = useNavigate();
  const { id }   = useParams();
  const isEdit   = !!id;
  const { user } = useSelector((s) => s.auth);

  /* ── Form state ── */
  const [form, setForm] = useState({
    title: "", excerpt: "", content: "", category: "tech",
    tags: [], isPublished: false,
    seoTitle: "", seoDescription: "",
    author: user?.name || "", slug: "", readTime: "1 ນາທີ",
  });
  const [images,     setImages]     = useState([]); // [{src,name}] idx-0 = cover
  const [tagInput,   setTagInput]   = useState("");
  const [errors,     setErrors]     = useState({});
  const [deleteStep, setDeleteStep] = useState(0);  // 0=idle, 1=confirm

  const prevTitleRef   = useRef("");
  const prevContentRef = useRef("");
  const titleRef       = useRef();
  const coverInputRef  = useRef();
  const galleryInputRef = useRef();

  /* ── RTK Query ── */
  const { data: blog, isLoading: blogLoading, isError, error } =
    useGetBlogDetailsQuery(id, { skip: !isEdit });

  const [createBlog, { isLoading: isCreating }] = useCreateBlogMutation();
  const [updateBlog, { isLoading: isUpdating }] = useUpdateBlogMutation();
  const [deleteBlog, { isLoading: isDeleting }] = useDeleteBlogMutation();

  const isSaving = isCreating || isUpdating;

  /* ── Load existing blog ── */
  useEffect(() => {
    if (!isEdit || !blog) return;
    setForm({
      title:          blog.title          || "",
      excerpt:        blog.excerpt        || "",
      content:        blog.content        || "",
      category:       blog.category       || "tech",
      tags:           Array.isArray(blog.tags) ? blog.tags : [],
      isPublished:    blog.isPublished    || false,
      seoTitle:       blog.seoTitle       || "",
      seoDescription: blog.seoDescription || "",
      author:         blog.author         || user?.name || "",
      slug:           blog.slug           || "",
      readTime:       blog.readTime       || "1 ນາທີ",
    });
    const imgs = (blog.images || []).map((i) => ({ src: i?.url || i, name: "existing" }));
    if (!imgs.length && blog.image) imgs.push({ src: blog.image?.url || blog.image, name: "cover" });
    setImages(imgs);
  }, [blog, isEdit]); // eslint-disable-line

  /* ── Auto-resize title on load ── */
  useEffect(() => {
    if (titleRef.current) autoHeight(titleRef.current);
  }, [form.title]);

  /* ── Auto slug (create only) ── */
  useEffect(() => {
    if (isEdit || form.title === prevTitleRef.current) return;
    prevTitleRef.current = form.title;
    setForm((p) => ({ ...p, slug: genSlug(form.title) }));
  }, [form.title, isEdit]);

  /* ── Auto read time ── */
  useEffect(() => {
    if (!form.content || form.content === prevContentRef.current) return;
    prevContentRef.current = form.content;
    const rt = calcReadTime(form.content);
    setForm((p) => (p.readTime === rt ? p : { ...p, readTime: rt }));
  }, [form.content]);

  /* ── Image handlers ── */
  const handleCoverFile = useCallback(async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("ຮັບສະເພາະຮູບ"); return; }
    if (file.size > 5 * 1024 * 1024)    { toast.error("ຮູບໃຫຍ່ເກີນ 5MB"); return; }
    const src = await toBase64(file);
    setImages((p) => { const n = [...p]; n[0] = { src, name: file.name }; return n; });
  }, []);

  const handleGalleryFiles = useCallback(async (files) => {
    const arr = Array.from(files);
    const ok  = arr.filter((f) => {
      if (f.size > 5 * 1024 * 1024) { toast.error(`"${f.name}" ໃຫຍ່ເກີນ 5MB`); return false; }
      return true;
    });
    if (!ok.length) return;
    const converted = await Promise.all(ok.map(async (f) => ({ src: await toBase64(f), name: f.name })));
    setImages((p) => {
      const cover   = p[0] ? [p[0]] : [];
      const gallery = p.slice(1);
      return [...cover, ...gallery, ...converted];
    });
  }, []);

  const removeImage = useCallback((idx) => setImages((p) => p.filter((_, i) => i !== idx)), []);
  const setAsCover  = useCallback((idx) => {
    setImages((p) => { const n = [...p]; const [pic] = n.splice(idx, 1); return [pic, ...n]; });
  }, []);

  /* ── Tags ── */
  const addTag = useCallback(() => {
    const t = tagInput.trim().toLowerCase();
    if (t && !form.tags.includes(t)) setForm((p) => ({ ...p, tags: [...p.tags, t] }));
    setTagInput("");
  }, [tagInput, form.tags]);

  const removeTag = useCallback(
    (t) => setForm((p) => ({ ...p, tags: p.tags.filter((x) => x !== t) })),
    []
  );

  /* ── Submit ── */
  const handleSubmit = async (publishOverride = null) => {
    const finalPublish = publishOverride !== null ? publishOverride : form.isPublished;
    const finalForm    = { ...form, isPublished: finalPublish };

    const e = {};
    if (!finalForm.title.trim())          e.title   = "ກະລຸນາປ້ອນຫົວຂໍ້";
    if (finalForm.title.length > 200)     e.title   = "ຕ້ອງບໍ່ເກີນ 200 ຕົວ";
    if (!finalForm.excerpt.trim())        e.excerpt = "ກະລຸນາປ້ອນຄຳອະທິບາຍ";
    if (finalForm.excerpt.length > 500)   e.excerpt = "ຕ້ອງບໍ່ເກີນ 500 ຕົວ";
    const plain = finalForm.content.replace(/<[^>]*>/g, "").trim();
    if (!plain || plain.length < 50)      e.content = "ເນື້ອຫາຕ້ອງ ≥ 50 ຕົວ";
    if (!finalForm.author.trim())         e.author  = "ກະລຸນາປ້ອນຊື່ຜູ້ຂຽນ";
    if (finalForm.seoTitle.length > 60)   e.seoTitle = "ເກີນ 60 ຕົວ";
    if (finalForm.seoDescription.length > 160) e.seoDesc = "ເກີນ 160 ຕົວ";

    setErrors(e);
    if (Object.keys(e).length) {
      toast.error("ກະລຸນາກວດສອບຂໍ້ມູນ");
      return;
    }

    const payload = {
      ...finalForm,
      slug:   finalForm.slug || genSlug(finalForm.title),
      image:  images[0]?.src || "",
      images: images.map((i) => i.src),
    };

    try {
      if (isEdit) {
        await updateBlog({ id, ...payload }).unwrap();
        toast.success("✅ ອັບເດດສຳເລັດ");
        navigate("/admin/blog/dashboard");
      } else {
        await createBlog(payload).unwrap();
        toast.success("✅ ສ້າງບົດຄວາມສຳເລັດ!");
        navigate("/admin/blog/dashboard");
      }
    } catch (err) {
      toast.error(`❌ ${err?.data?.message || "ບັນທຶກບໍ່ສຳເລັດ"}`);
    }
  };

  /* ── Delete ── */
  const handleDelete = async () => {
    try {
      await deleteBlog(id).unwrap();
      toast.success("🗑️ ລຶບສຳເລັດ");
      navigate("/admin/blog/dashboard");
    } catch {
      toast.error("❌ ລຶບບໍ່ສຳເລັດ");
    }
  };

  /* ── Loading / Error ── */
  if (isEdit && blogLoading) return (
    <AdminLayout>
      <div className="text-center py-5"><Loader /></div>
    </AdminLayout>
  );

  if (isEdit && isError) return (
    <AdminLayout>
      <div className="text-center py-5">
        <p className="text-danger fw-bold">{error?.data?.message || "ໂຫຼດຂໍ້ມູນບໍ່ໄດ້"}</p>
        <button className="be-btn be-btn-ghost" onClick={() => navigate(-1)}>← ກັບຄືນ</button>
      </div>
    </AdminLayout>
  );

  /* ── Derived values ── */
  const plainLen  = form.content.replace(/<[^>]*>/g, "").length;
  const wordCount = form.content.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length;
  const coverImg  = images[0];
  const hasGallery = images.length > 1;

  /* ═══════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════ */
  return (
    <AdminLayout>
      <MetaData title={isEdit ? "ແກ້ໄຂບົດຄວາມ" : "ສ້າງບົດຄວາມໃໝ່"} />
      <style>{css}</style>

      {/* ── Topbar ── */}
      <div className="be-topbar">
        <nav className="be-breadcrumb">
          <Link to="/admin/dashboard">Dashboard</Link>
          <span className="be-sep">/</span>
          <Link to="/admin/blog">ບົດຄວາມ</Link>
          <span className="be-sep">/</span>
          <span>{isEdit ? "ແກ້ໄຂ" : "ສ້າງໃໝ່"}</span>
        </nav>
        <div className="be-topbar-right">
          <span className={`be-status-badge ${form.isPublished ? "pub" : "draft"}`}>
            {form.isPublished ? "● ເຜີຍແຜ່" : "○ ຮ່າງ"}
          </span>
          {isEdit && form.slug && (
            <a
              href={`/blog/${form.slug}`}
              target="_blank"
              rel="noreferrer"
              className="be-btn be-btn-ghost be-btn-sm"
            >
              ↗ Preview
            </a>
          )}
          <button className="be-btn be-btn-ghost be-btn-sm" onClick={() => navigate(-1)}>
            ← ກັບຄືນ
          </button>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="be-layout">

        {/* ════════════════════════
            LEFT: Main content
        ════════════════════════ */}
        <div className="be-main">

          {/* Title */}
          <div className="be-title-card">
            <textarea
              ref={titleRef}
              className={`be-title-input${errors.title ? " err" : ""}`}
              placeholder="ຫົວຂໍ້ບົດຄວາມ..."
              value={form.title}
              rows={1}
              onChange={(e) => {
                autoHeight(e.target);
                setForm((p) => ({ ...p, title: e.target.value }));
              }}
            />
            {errors.title && <div className="be-err">{errors.title}</div>}
            <div className="be-title-meta">
              <span className={form.title.length > 160 ? "cnt-warn" : "be-muted"}>
                {form.title.length}/200
              </span>
              {form.slug && (
                <span className="be-slug-pill">
                  /blog/<strong>{form.slug}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Excerpt */}
          <div className="be-section-card">
            <div className="be-section-label">
              <span>📝</span> ຄຳອະທິບາຍສັ້ນ
              <span className="be-req">*</span>
              <span className="be-label-hint">— ສະແດງໃນລາຍຊື່ ແລະ ການຄົ້ນຫາ</span>
            </div>
            <textarea
              className={`be-input${errors.excerpt ? " err" : ""}`}
              placeholder="ສະຫຼຸບຫຍໍ້ຂອງບົດຄວາມ..."
              rows={3}
              value={form.excerpt}
              onChange={(e) => setForm((p) => ({ ...p, excerpt: e.target.value }))}
            />
            {errors.excerpt && <div className="be-err">{errors.excerpt}</div>}
            <div className={`be-hint ${form.excerpt.length > 400 ? "cnt-warn" : ""}`}>
              {form.excerpt.length}/500
            </div>
          </div>

          {/* Content editor */}
          <div className="be-section-card">
            <div className="be-section-label">
              <span>✍️</span> ເນື້ອຫາ <span className="be-req">*</span>
            </div>
            <div className={`be-quill${errors.content ? " err" : ""}`}>
              <ReactQuill
                theme="snow"
                value={form.content}
                onChange={(v) => setForm((p) => ({ ...p, content: v }))}
                modules={QUILL_MODULES}
                placeholder="ເລີ່ມຂຽນເນື້ອຫາ..."
              />
            </div>
            {errors.content && <div className="be-err mt-1">{errors.content}</div>}
            <div className="be-content-stats">
              <span className={plainLen < 50 && plainLen > 0 ? "cnt-err" : "be-muted"}>
                {plainLen.toLocaleString()} ຕົວ
              </span>
              <span className="be-muted">·</span>
              <span className="be-muted">{wordCount.toLocaleString()} ຄຳ</span>
              <span className="be-muted">·</span>
              <span className="be-muted">⏱ {form.readTime}</span>
            </div>
          </div>

          {/* Author */}
          <div className="be-section-card">
            <div className="be-section-label">
              <span>👤</span> ຜູ້ຂຽນ <span className="be-req">*</span>
            </div>
            <input
              className={`be-input${errors.author ? " err" : ""}`}
              placeholder="ຊື່ຜູ້ຂຽນ..."
              value={form.author}
              onChange={(e) => setForm((p) => ({ ...p, author: e.target.value }))}
            />
            {errors.author && <div className="be-err">{errors.author}</div>}
          </div>

        </div>

        {/* ════════════════════════
            RIGHT: Sidebar
        ════════════════════════ */}
        <div className="be-sidebar">

          {/* Publish */}
          <SideCard title="ການຕີພິມ" icon="🚀" defaultOpen>
            <div className={`be-pub-toggle${form.isPublished ? " on" : ""}`}>
              <div>
                <div className="be-pub-label">
                  {form.isPublished ? "🟢 ເຜີຍແຜ່" : "⚪ ຮ່າງ"}
                </div>
                <div className="be-pub-sub">
                  {form.isPublished ? "ສະແດງໃນໜ້າເວັບ" : "ຍັງບໍ່ສາທາລະນະ"}
                </div>
              </div>
              <label className="be-toggle">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => setForm((p) => ({ ...p, isPublished: e.target.checked }))}
                />
                <span className="be-slider" />
              </label>
            </div>
            <div className="be-pub-actions">
              <button
                type="button"
                className="be-btn be-btn-ghost be-btn-sm"
                onClick={() => handleSubmit(false)}
                disabled={isSaving}
              >
                {isSaving ? "..." : "💾 ຮ່າງ"}
              </button>
              <button
                type="button"
                className={`be-btn be-btn-sm ${form.isPublished ? "be-btn-primary" : "be-btn-publish"}`}
                onClick={() => handleSubmit(form.isPublished ? null : true)}
                disabled={isSaving}
              >
                {isSaving
                  ? <span className="be-spin">⟳</span>
                  : form.isPublished
                    ? "✅ ບັນທຶກ"
                    : "🚀 ເຜີຍແຜ່"
                }
              </button>
            </div>
          </SideCard>

          {/* Cover image */}
          <SideCard title="ຮູບໜ້າປົກ" icon="🖼️" defaultOpen>
            {coverImg ? (
              <div className="be-cover-preview">
                <img src={coverImg.src} alt="cover" />
                <div className="be-cover-overlay">
                  <button
                    type="button"
                    className="be-cover-btn be-cover-rm"
                    onClick={() => removeImage(0)}
                  >
                    ✕ ລຶບ
                  </button>
                  <button
                    type="button"
                    className="be-cover-btn be-cover-change"
                    onClick={() => coverInputRef.current?.click()}
                  >
                    ↑ ປ່ຽນ
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="be-upload-zone"
                onClick={() => coverInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleCoverFile(e.dataTransfer.files[0]);
                }}
              >
                <span className="be-upload-icon">🖼️</span>
                <p>ຄິກ ຫຼື ລາກຮູບ</p>
                <small>PNG, JPG · ສູງສຸດ 5MB</small>
              </div>
            )}
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="be-hidden"
              onChange={(e) => { handleCoverFile(e.target.files[0]); e.target.value = ""; }}
            />
          </SideCard>

          {/* Gallery */}
          <SideCard
            title={`ຮູບ Gallery${images.length > 1 ? ` (${images.length - 1})` : ""}`}
            icon="📸"
            defaultOpen={hasGallery}
          >
            {images.length > 0 && (
              <div className="be-gallery-grid">
                {images.map((img, i) => (
                  <div key={i} className={`be-gthumb${i === 0 ? " is-cover" : ""}`}>
                    <img src={img.src} alt={img.name} />
                    <div className="be-gthumb-overlay">
                      <button type="button" className="be-gthumb-rm" onClick={() => removeImage(i)}>
                        ✕
                      </button>
                      {i !== 0 && (
                        <button type="button" className="be-gthumb-star" onClick={() => setAsCover(i)}>
                          ⭐
                        </button>
                      )}
                    </div>
                    {i === 0 && <span className="be-gthumb-cover">ໜ້າປົກ</span>}
                  </div>
                ))}
              </div>
            )}
            <button
              type="button"
              className="be-add-photos"
              onClick={() => galleryInputRef.current?.click()}
            >
              + ເພີ່ມຮູບ
            </button>
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              multiple
              className="be-hidden"
              onChange={(e) => { handleGalleryFiles(e.target.files); e.target.value = ""; }}
            />
            {images.length > 1 && (
              <p className="be-gallery-hint">ກົດ ⭐ ເພື່ອຕັ້ງເປັນໜ້າປົກ</p>
            )}
          </SideCard>

          {/* Category */}
          <SideCard title="ໝວດໝູ່" icon="🏷️" defaultOpen>
            <div className="be-cats">
              {CATS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`be-cat${form.category === c.id ? " sel" : ""}`}
                  style={{ "--cat-color": c.color, "--cat-bg": c.bg }}
                  onClick={() => setForm((p) => ({ ...p, category: c.id }))}
                >
                  <span>{c.icon}</span>
                  <span>{c.name}</span>
                  {form.category === c.id && <span className="be-cat-check">✓</span>}
                </button>
              ))}
            </div>
          </SideCard>

          {/* Tags */}
          <SideCard title={`ແທັກ${form.tags.length ? ` (${form.tags.length})` : ""}`} icon="🔖" defaultOpen={false}>
            <div className="be-tag-row">
              <input
                className="be-input be-input-sm"
                placeholder="ໃສ່ແທັກ..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); addTag(); }
                }}
              />
              <button type="button" className="be-btn be-btn-ghost be-btn-sm" onClick={addTag}>
                +
              </button>
            </div>
            <div className="be-tags">
              {form.tags.length > 0
                ? form.tags.map((t, i) => (
                    <span key={i} className="be-tag">
                      #{t}
                      <button type="button" onClick={() => removeTag(t)}>×</button>
                    </span>
                  ))
                : <span className="be-muted" style={{ fontSize: ".78rem" }}>ຍັງບໍ່ມີແທັກ</span>
              }
            </div>
          </SideCard>

          {/* URL / Slug */}
          <SideCard title="URL" icon="🔗" defaultOpen={false}>
            <label className="be-label">Slug</label>
            <input
              className="be-input be-input-sm"
              placeholder="blog-post-slug"
              value={form.slug}
              onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
            />
            <div className="be-hint">
              /blog/<strong>{form.slug || genSlug(form.title) || "slug"}</strong>
            </div>
          </SideCard>

          {/* SEO */}
          <SideCard title="SEO" icon="🔍" defaultOpen={false}>
            <div className="be-seo-preview">
              <div className="be-seo-url">
                ithubb.com › blog › {form.slug || "slug"}
              </div>
              <div className="be-seo-title">
                {form.seoTitle || form.title || "SEO Title"}
              </div>
              <div className="be-seo-desc">
                {form.seoDescription || form.excerpt || "SEO Description..."}
              </div>
            </div>
            <div className="be-field">
              <label className="be-label">SEO Title</label>
              <input
                className={`be-input be-input-sm${errors.seoTitle ? " err" : ""}`}
                placeholder="ຫົວຂໍ້ SEO..."
                value={form.seoTitle}
                onChange={(e) => setForm((p) => ({ ...p, seoTitle: e.target.value }))}
              />
              {errors.seoTitle && <div className="be-err">{errors.seoTitle}</div>}
              <div className={`be-hint ${form.seoTitle.length > 50 ? "cnt-warn" : ""}`}>
                {form.seoTitle.length}/60
              </div>
            </div>
            <div className="be-field">
              <label className="be-label">SEO Description</label>
              <textarea
                className={`be-input be-input-sm${errors.seoDesc ? " err" : ""}`}
                placeholder="ຄຳອະທິບາຍ SEO..."
                rows={3}
                value={form.seoDescription}
                onChange={(e) => setForm((p) => ({ ...p, seoDescription: e.target.value }))}
              />
              {errors.seoDesc && <div className="be-err">{errors.seoDesc}</div>}
              <div className={`be-hint ${form.seoDescription.length > 130 ? "cnt-warn" : ""}`}>
                {form.seoDescription.length}/160
              </div>
            </div>
          </SideCard>

          {/* Danger zone (edit only) */}
          {isEdit && (
            <SideCard title="ເຂດອັນຕະລາຍ" icon="⚠️" defaultOpen={false} danger>
              {deleteStep === 0 ? (
                <>
                  <p className="be-danger-desc">ການລຶບຈະເປັນຖາວອນ ບໍ່ສາມາດກູ້ຄືນໄດ້</p>
                  <button
                    type="button"
                    className="be-btn be-btn-danger be-btn-sm be-btn-full"
                    onClick={() => setDeleteStep(1)}
                  >
                    🗑️ ລຶບບົດຄວາມ
                  </button>
                </>
              ) : (
                <div className="be-delete-confirm">
                  <p className="be-danger-desc">⚠️ ແນ່ໃຈບໍ? ຈະລຶບຖາວອນ</p>
                  <div className="be-pub-actions">
                    <button
                      type="button"
                      className="be-btn be-btn-ghost be-btn-sm"
                      onClick={() => setDeleteStep(0)}
                    >
                      ຍົກເລີກ
                    </button>
                    <button
                      type="button"
                      className="be-btn be-btn-danger be-btn-sm"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? "ກຳລັງລຶບ..." : "ຢືນຢັນລຶບ"}
                    </button>
                  </div>
                </div>
              )}
            </SideCard>
          )}

        </div>
      </div>
    </AdminLayout>
  );
}

/* ─── CSS ─────────────────────────────────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;600;700;800&display=swap');

/* ── Global ── */
.be-layout, .be-main *, .be-sidebar *, .be-topbar * {
  font-family: 'Noto Sans Lao', 'Phetsarath OT', sans-serif;
  box-sizing: border-box;
}

/* ── Topbar ── */
.be-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: .75rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f1f5f9;
}
.be-topbar-right { display: flex; align-items: center; gap: .5rem; flex-wrap: wrap; }

.be-breadcrumb {
  display: flex; align-items: center; gap: .35rem;
  font-size: .8rem; color: #9ca3af;
}
.be-breadcrumb a { color: #1d4ed8; text-decoration: none; font-weight: 600; }
.be-breadcrumb a:hover { text-decoration: underline; }
.be-sep { color: #d1d5db; }

.be-status-badge {
  font-size: .72rem; font-weight: 700;
  padding: .28rem .75rem; border-radius: 50px;
}
.be-status-badge.pub   { background: #d1fae5; color: #065f46; }
.be-status-badge.draft { background: #f1f5f9; color: #64748b; }

/* ── Layout ── */
.be-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 1.25rem;
  align-items: start;
}
.be-sidebar {
  position: sticky;
  top: 72px;
  max-height: calc(100vh - 90px);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #e2e8f0 transparent;
}
.be-sidebar::-webkit-scrollbar       { width: 3px; }
.be-sidebar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }

/* ── Buttons ── */
.be-btn {
  display: inline-flex; align-items: center; gap: .35rem;
  border: none; font-family: inherit; font-weight: 600;
  cursor: pointer; transition: all .18s; white-space: nowrap;
  border-radius: 9px; line-height: 1.2;
}
.be-btn-sm { padding: .5rem 1rem; font-size: .82rem; }
.be-btn-full { width: 100%; justify-content: center; }

.be-btn-ghost {
  background: white; color: #374151;
  border: 1.5px solid #e5e7eb;
  padding: .48rem .9rem; font-size: .82rem;
}
.be-btn-ghost:hover:not(:disabled) { background: #f9fafb; border-color: #cbd5e1; }

.be-btn-primary {
  background: linear-gradient(135deg, #1d4ed8, #1e3a8a);
  color: white;
}
.be-btn-primary:hover:not(:disabled) { box-shadow: 0 4px 14px rgba(29,78,216,.4); transform: translateY(-1px); }

.be-btn-publish {
  background: linear-gradient(135deg, #059669, #047857);
  color: white;
}
.be-btn-publish:hover:not(:disabled) { box-shadow: 0 4px 14px rgba(5,150,105,.4); transform: translateY(-1px); }

.be-btn-danger { background: #ef4444; color: white; }
.be-btn-danger:hover:not(:disabled) { background: #dc2626; }
.be-btn:disabled { opacity: .5; cursor: not-allowed; transform: none !important; }

/* ── Title card ── */
.be-title-card {
  background: white; border-radius: 16px;
  padding: 1.5rem 1.75rem;
  box-shadow: 0 2px 10px rgba(0,0,0,.05);
  border: 1px solid #e5e7eb; margin-bottom: 1rem;
}
.be-title-input {
  width: 100%;
  font-size: 1.7rem; font-weight: 800; color: #0f172a;
  border: none; background: none; resize: none; outline: none;
  line-height: 1.3; font-family: 'Noto Sans Lao', inherit;
  overflow: hidden; display: block;
}
.be-title-input::placeholder { color: #cbd5e1; }
.be-title-input.err          { color: #ef4444; }
.be-title-meta {
  display: flex; align-items: center; gap: .75rem;
  margin-top: .85rem; padding-top: .75rem;
  border-top: 1px dashed #e2e8f0;
  font-size: .75rem;
}
.be-slug-pill {
  background: #f1f5f9; color: #64748b;
  border-radius: 50px; padding: .2rem .8rem;
  font-size: .72rem; max-width: 200px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.be-slug-pill strong { color: #1d4ed8; }

/* ── Section cards ── */
.be-section-card {
  background: white; border-radius: 16px;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 2px 10px rgba(0,0,0,.05);
  border: 1px solid #e5e7eb; margin-bottom: 1rem;
}
.be-section-label {
  font-size: .85rem; font-weight: 700; color: #374151;
  margin-bottom: .65rem; display: flex; align-items: center; gap: .4rem;
  flex-wrap: wrap;
}
.be-req { color: #ef4444; }
.be-label-hint { color: #9ca3af; font-weight: 400; font-size: .77rem; }

/* ── Inputs ── */
.be-input {
  width: 100%; padding: .65rem .9rem;
  border: 2px solid #e5e7eb; border-radius: 10px;
  font-family: inherit; font-size: .875rem; color: #111827;
  background: #f9fafb;
  transition: border-color .2s, box-shadow .2s, background .2s;
  outline: none; resize: vertical;
}
.be-input:focus { border-color: #1d4ed8; box-shadow: 0 0 0 3px rgba(29,78,216,.08); background: white; }
.be-input.err   { border-color: #ef4444; background: #fff5f5; }
.be-input-sm    { font-size: .82rem; padding: .55rem .8rem; }

/* ── Quill editor ── */
.be-quill {
  border: 2px solid #e5e7eb; border-radius: 12px;
  overflow: hidden; transition: border-color .2s;
}
.be-quill:focus-within { border-color: #1d4ed8; box-shadow: 0 0 0 3px rgba(29,78,216,.06); }
.be-quill.err           { border-color: #ef4444; }
.be-quill .ql-toolbar   { border: none; border-bottom: 1px solid #e5e7eb; background: #f9fafb; border-radius: 12px 12px 0 0; }
.be-quill .ql-container { border: none; font-size: .9rem; }
.be-quill .ql-editor    { min-height: 380px; font-family: 'Noto Sans Lao', sans-serif; line-height: 1.75; }
.be-quill .ql-editor.ql-blank::before { color: #9ca3af; font-style: normal; }

.be-content-stats {
  display: flex; align-items: center; gap: .65rem;
  margin-top: .6rem; font-size: .75rem;
}

/* ── Sidebar cards ── */
.sc-card {
  background: white; border-radius: 14px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 4px rgba(0,0,0,.04);
  margin-bottom: .65rem; overflow: hidden;
}
.sc-card.sc-danger {
  background: #fff5f5; border-color: #fca5a5;
}
.sc-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: .8rem 1rem; background: none; border: none;
  width: 100%; cursor: pointer; font-family: inherit;
  transition: background .15s;
}
.sc-head:hover { background: rgba(0,0,0,.02); }
.sc-title {
  display: flex; align-items: center; gap: .45rem;
  font-size: .83rem; font-weight: 700; color: #374151;
}
.sc-icon     { font-size: .9rem; }
.sc-chevron  { color: #9ca3af; font-size: 1.2rem; transition: transform .2s; line-height: 1; }
.sc-chevron.open { transform: rotate(90deg); }
.sc-body     { padding: 0 1rem 1rem; }

/* ── Publish section ── */
.be-pub-toggle {
  display: flex; align-items: center; justify-content: space-between;
  padding: .7rem .85rem; border-radius: 10px;
  background: #f9fafb; border: 1.5px solid #e5e7eb;
  margin-bottom: .75rem; transition: all .2s;
}
.be-pub-toggle.on { background: #eff6ff; border-color: #bfdbfe; }
.be-pub-label { font-size: .83rem; font-weight: 700; color: #1e293b; }
.be-pub-sub   { font-size: .72rem; color: #64748b; margin-top: .1rem; }
.be-toggle {
  position: relative; display: inline-block;
  width: 42px; height: 22px; flex-shrink: 0;
}
.be-toggle input { opacity: 0; width: 0; height: 0; }
.be-slider {
  position: absolute; cursor: pointer; inset: 0;
  background: #cbd5e1; border-radius: 22px; transition: .3s;
}
.be-slider::before {
  content: ''; position: absolute;
  width: 16px; height: 16px; border-radius: 50%;
  left: 3px; bottom: 3px; background: white;
  box-shadow: 0 1px 4px rgba(0,0,0,.2); transition: .3s;
}
.be-toggle input:checked + .be-slider { background: #1d4ed8; }
.be-toggle input:checked + .be-slider::before { transform: translateX(20px); }
.be-pub-actions { display: flex; gap: .4rem; }
.be-pub-actions .be-btn { flex: 1; justify-content: center; }

/* ── Cover image ── */
.be-cover-preview {
  position: relative; border-radius: 10px; overflow: hidden;
  aspect-ratio: 16/9; background: #f1f5f9; cursor: pointer;
  margin-bottom: .5rem;
}
.be-cover-preview img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .3s; }
.be-cover-preview:hover img { transform: scale(1.03); }
.be-cover-overlay {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0); transition: background .2s;
  display: flex; align-items: center; justify-content: center; gap: .5rem;
  opacity: 0; transition: opacity .2s;
}
.be-cover-preview:hover .be-cover-overlay { background: rgba(0,0,0,.45); opacity: 1; }
.be-cover-btn {
  border: none; border-radius: 8px;
  padding: .4rem .85rem; font-size: .75rem; font-weight: 700;
  cursor: pointer; font-family: inherit;
}
.be-cover-rm     { background: #ef4444; color: white; }
.be-cover-change { background: white; color: #374151; }

/* ── Upload zone ── */
.be-upload-zone {
  border: 2px dashed #cbd5e1; border-radius: 10px;
  padding: 1.5rem 1rem; text-align: center; cursor: pointer;
  transition: all .2s; background: #fafafa;
  margin-bottom: .5rem;
}
.be-upload-zone:hover { border-color: #1d4ed8; background: #eff6ff; }
.be-upload-icon { font-size: 2rem; display: block; margin-bottom: .4rem; }
.be-upload-zone p    { font-size: .83rem; font-weight: 600; color: #64748b; margin: 0 0 .2rem; }
.be-upload-zone small { color: #9ca3af; font-size: .72rem; }

/* ── Gallery grid ── */
.be-gallery-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: .45rem; margin-bottom: .65rem;
}
.be-gthumb {
  position: relative; aspect-ratio: 1;
  border-radius: 8px; overflow: hidden;
  border: 2px solid #e5e7eb; background: #f1f5f9;
  cursor: pointer;
}
.be-gthumb img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .25s; }
.be-gthumb:hover img { transform: scale(1.06); }
.be-gthumb.is-cover { border-color: #f59e0b; }
.be-gthumb-overlay {
  position: absolute; top: 0; left: 0; right: 0;
  display: flex; gap: 3px; padding: 4px;
  opacity: 0; transition: opacity .15s;
}
.be-gthumb:hover .be-gthumb-overlay { opacity: 1; }
.be-gthumb-rm, .be-gthumb-star {
  border: none; border-radius: 50%;
  width: 20px; height: 20px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; font-size: .55rem;
}
.be-gthumb-rm   { background: rgba(239,68,68,.9);   color: white; }
.be-gthumb-star { background: rgba(245,158,11,.9);  color: white; }
.be-gthumb-cover {
  position: absolute; bottom: 0; left: 0; right: 0;
  background: rgba(245,158,11,.88); color: white;
  font-size: .58rem; text-align: center; padding: 3px;
  font-weight: 700; font-family: 'Noto Sans Lao', sans-serif;
}
.be-add-photos {
  display: block; width: 100%;
  padding: .5rem; border: 1.5px dashed #cbd5e1;
  border-radius: 8px; background: none;
  color: #64748b; font-size: .8rem; font-weight: 600;
  cursor: pointer; text-align: center;
  transition: all .18s; font-family: inherit;
}
.be-add-photos:hover { border-color: #1d4ed8; color: #1d4ed8; background: #eff6ff; }
.be-gallery-hint { font-size: .72rem; color: #9ca3af; margin: .4rem 0 0; text-align: center; }

/* ── Category pills ── */
.be-cats { display: flex; flex-direction: column; gap: .35rem; }
.be-cat {
  display: flex; align-items: center; gap: .5rem;
  padding: .55rem .8rem; border-radius: 9px;
  border: 1.5px solid #e5e7eb; background: #f9fafb;
  font-family: inherit; font-size: .83rem; font-weight: 600;
  color: #374151; cursor: pointer; transition: all .15s; text-align: left;
}
.be-cat:hover { border-color: var(--cat-color); color: var(--cat-color); background: var(--cat-bg); }
.be-cat.sel   { border-color: var(--cat-color); color: var(--cat-color); background: var(--cat-bg); }
.be-cat-check { margin-left: auto; }

/* ── Tags ── */
.be-tag-row { display: flex; gap: .4rem; margin-bottom: .6rem; }
.be-tags { display: flex; flex-wrap: wrap; gap: .35rem; min-height: 28px; }
.be-tag {
  display: inline-flex; align-items: center; gap: .25rem;
  padding: .22rem .65rem; border-radius: 50px;
  background: #eff6ff; color: #1d4ed8;
  font-size: .75rem; font-weight: 600;
  border: 1px solid #bfdbfe;
}
.be-tag button {
  border: none; background: none; color: #93c5fd;
  cursor: pointer; font-size: .9rem; padding: 0; line-height: 1;
  transition: color .15s;
}
.be-tag button:hover { color: #1d4ed8; }

/* ── SEO preview ── */
.be-seo-preview {
  background: white; border: 1px solid #e5e7eb;
  border-radius: 8px; padding: .75rem 1rem;
  margin-bottom: .85rem; font-size: .75rem;
}
.be-seo-url   { color: #16a34a; font-size: .68rem; margin-bottom: .2rem; }
.be-seo-title { color: #1a0dab; font-size: .85rem; font-weight: 700; margin-bottom: .2rem;
  max-height: 2.4em; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.be-seo-desc  { color: #4d5156; font-size: .72rem; line-height: 1.4;
  max-height: 3em; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }

/* ── Labels / hints / errors ── */
.be-label  { display: block; font-size: .78rem; font-weight: 600; color: #374151; margin-bottom: .3rem; }
.be-hint   { font-size: .72rem; color: #9ca3af; margin-top: .25rem; }
.be-err    { font-size: .73rem; color: #ef4444; margin-top: .25rem; font-weight: 600; }
.be-muted  { color: #9ca3af; }
.be-field  { margin-bottom: .65rem; }
.be-field:last-child { margin-bottom: 0; }
.cnt-warn  { color: #f59e0b !important; }
.cnt-err   { color: #ef4444 !important; }
.mt-1 { margin-top: .25rem; }

/* ── Danger section ── */
.be-danger-desc {
  font-size: .78rem; color: #7f1d1d;
  margin-bottom: .6rem; line-height: 1.4;
}
.be-delete-confirm .be-pub-actions { margin-top: .5rem; }

/* ── Misc ── */
.be-hidden { display: none !important; }
.be-spin   { display: inline-block; animation: be-spin 1s linear infinite; }
@keyframes be-spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }

/* ── Responsive ── */
@media (max-width: 960px) {
  .be-layout {
    grid-template-columns: 1fr;
  }
  .be-sidebar {
    position: static;
    max-height: none;
    overflow: visible;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: .65rem;
  }
  .be-sidebar > .sc-card:first-child { grid-column: 1 / -1; }
}
@media (max-width: 600px) {
  .be-sidebar { grid-template-columns: 1fr; }
  .be-title-input { font-size: 1.3rem; }
  .be-topbar { flex-direction: column; align-items: flex-start; }
}
`;
