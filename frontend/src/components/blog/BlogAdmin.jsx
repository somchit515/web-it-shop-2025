import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
  useGetBlogDetailsQuery,
} from "../redux/api/blogApi";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import AdminLayout from "../layout/AdminLayout";
import { toast } from "react-hot-toast";
import Loader from "../layout/Loader";

/* ═══════════════════════════════════════════
   STYLES
═══════════════════════════════════════════ */
const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;600;700;800&display=swap');

.ba-wrap {
  max-width: 1100px;
  margin: 0 auto;
  padding: 1.5rem 1rem 5rem;
  font-family: 'Noto Sans Lao', 'Phetsarath OT', sans-serif;
}
.ba-page-title {
  font-size: 1.55rem; font-weight: 800;
  background: linear-gradient(135deg, #0f2342, #1d4ed8);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text; margin: 0;
}
.ba-card {
  background: #fff; border-radius: 18px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 12px rgba(0,0,0,.05);
  padding: 1.75rem; margin-bottom: 1.5rem;
}
.ba-card-title {
  font-size: .95rem; font-weight: 700; color: #0f2342;
  margin: 0 0 1.25rem; padding-bottom: .75rem;
  border-bottom: 2px solid #f1f5f9;
  display: flex; align-items: center; gap: .5rem;
}
.ba-label { font-size: .8rem; font-weight: 700; color: #374151; margin-bottom: .35rem; display: block; }
.ba-label.req::after { content: " *"; color: #ef4444; }
.ba-input, .ba-textarea {
  width: 100%; padding: .7rem 1rem;
  border: 2px solid #e5e7eb; border-radius: 10px;
  font-family: inherit; font-size: .875rem; color: #111827;
  background: #f9fafb; transition: border-color .2s, box-shadow .2s, background .2s;
  outline: none; resize: vertical;
}
.ba-input:focus, .ba-textarea:focus {
  border-color: #1d4ed8; box-shadow: 0 0 0 3px rgba(29,78,216,.1); background: #fff;
}
.ba-input.err, .ba-textarea.err { border-color: #ef4444; box-shadow: 0 0 0 3px rgba(239,68,68,.08); }
.ba-hint { font-size: .73rem; color: #9ca3af; margin-top: .3rem; }
.ba-err  { font-size: .73rem; color: #ef4444; margin-top: .25rem; font-weight: 600; }
.cnt-warn { color: #f59e0b !important; } .cnt-err { color: #ef4444 !important; }

/* Category pills */
.ba-cats { display: flex; flex-wrap: wrap; gap: .55rem; margin-top: .4rem; }
.ba-cat {
  display: inline-flex; align-items: center; gap: .4rem;
  padding: .5rem 1.1rem; border-radius: 50px;
  border: 2px solid #e5e7eb; background: #f9fafb;
  color: #374151; font-family: inherit; font-size: .82rem;
  font-weight: 600; cursor: pointer; transition: all .2s; user-select: none;
}
.ba-cat:hover { border-color: #1d4ed8; color: #1d4ed8; background: #eff6ff; }
.ba-cat.sel   { border-color: #1d4ed8; background: #eff6ff; color: #1d4ed8; }
.ba-cat-dot   { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

/* Quill */
.ba-quill { border: 2px solid #e5e7eb; border-radius: 10px; overflow: hidden; background: #fff; transition: border-color .2s; }
.ba-quill:focus-within { border-color: #1d4ed8; }
.ba-quill.err { border-color: #ef4444; }
.ba-quill .ql-toolbar  { border: none; border-bottom: 1px solid #e5e7eb; background: #f9fafb; }
.ba-quill .ql-container { border: none; font-size: .9rem; }
.ba-quill .ql-editor    { min-height: 300px; font-family: 'Noto Sans Lao', sans-serif; }

/* Cover zone */
.ba-cover-zone {
  border: 2.5px dashed #cbd5e1; border-radius: 12px;
  padding: 2rem 1rem; text-align: center; cursor: pointer;
  transition: all .25s; background: #f8fafc; position: relative;
}
.ba-cover-zone:hover { border-color: #1d4ed8; background: #eff6ff; }
.ba-cover-zone input[type=file] { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
.ba-cover-preview {
  position: relative; margin-top: 1rem;
  border-radius: 12px; overflow: hidden; max-height: 240px;
  border: 2px solid #e5e7eb;
}
.ba-cover-preview img { width: 100%; max-height: 240px; object-fit: cover; display: block; }
.ba-cover-remove {
  position: absolute; top: 10px; right: 10px;
  background: rgba(239,68,68,.92); color: #fff;
  border: none; border-radius: 50%; width: 30px; height: 30px;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  font-size: .8rem; box-shadow: 0 2px 8px rgba(0,0,0,.2);
  transition: background .2s, transform .2s;
}
.ba-cover-remove:hover { background: #dc2626; transform: scale(1.1); }

/* Gallery drop */
.ba-gallery-drop {
  border: 2.5px dashed #cbd5e1; border-radius: 12px;
  padding: 1.4rem 1rem; text-align: center; cursor: pointer;
  transition: all .25s; background: #f8fafc; position: relative;
}
.ba-gallery-drop:hover { border-color: #1d4ed8; background: #eff6ff; }
.ba-gallery-drop input[type=file] { position: absolute; inset: 0; opacity: 0; cursor: pointer; }

/* Grid thumbnails */
.ba-gallery-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: .75rem; margin-top: 1rem;
}
.ba-thumb {
  position: relative; border-radius: 10px; overflow: hidden;
  aspect-ratio: 1; border: 2px solid #e5e7eb;
  box-shadow: 0 2px 6px rgba(0,0,0,.06); background: #f1f5f9; cursor: pointer;
  transition: border-color .2s, box-shadow .2s;
}
.ba-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .3s; }
.ba-thumb:hover img { transform: scale(1.07); }
.ba-thumb-overlay {
  position: absolute; inset: 0; background: rgba(0,0,0,0);
  transition: background .2s; display: flex;
  align-items: flex-start; justify-content: flex-end; padding: 4px;
}
.ba-thumb:hover .ba-thumb-overlay { background: rgba(0,0,0,.35); }
.ba-thumb-rm {
  background: rgba(239,68,68,.9); color: #fff;
  border: none; border-radius: 50%; width: 22px; height: 22px;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  font-size: .6rem; opacity: 0; transition: opacity .2s; flex-shrink: 0;
}
.ba-thumb:hover .ba-thumb-rm { opacity: 1; }
.ba-thumb-star {
  position: absolute; bottom: 4px; left: 50%; transform: translateX(-50%);
  background: rgba(245,158,11,.92); color: #fff;
  border: none; border-radius: 6px; padding: 2px 7px;
  cursor: pointer; font-size: .6rem; font-family: inherit; font-weight: 700;
  display: flex; align-items: center; gap: 2px;
  opacity: 0; transition: opacity .2s; white-space: nowrap;
}
.ba-thumb:hover .ba-thumb-star { opacity: 1; }
.ba-thumb.is-cover { border-color: #f59e0b; box-shadow: 0 0 0 3px rgba(245,158,11,.2); }
.ba-thumb.is-cover::after {
  content: 'ໜ້າປົກ'; position: absolute; bottom: 0; left: 0; right: 0;
  background: rgba(245,158,11,.88); color: #fff;
  font-size: .6rem; text-align: center; padding: 3px 0;
  font-weight: 700; font-family: 'Noto Sans Lao', sans-serif;
}
.ba-img-badge {
  display: inline-flex; align-items: center; gap: .35rem;
  background: #eff6ff; color: #1d4ed8;
  border-radius: 50px; padding: .2rem .7rem;
  font-size: .75rem; font-weight: 700;
}

/* Tags */
.ba-tag-row { display: flex; gap: .5rem; margin-bottom: .75rem; }
.ba-tags { display: flex; flex-wrap: wrap; gap: .4rem; min-height: 32px; }
.ba-tag {
  display: inline-flex; align-items: center; gap: .3rem;
  padding: .28rem .8rem; border-radius: 50px;
  background: #eff6ff; color: #1d4ed8;
  font-size: .78rem; font-weight: 600; border: 1px solid #bfdbfe;
}
.ba-tag button {
  border: none; background: none; color: #93c5fd;
  cursor: pointer; font-size: 1rem; padding: 0; line-height: 1; transition: color .15s;
}
.ba-tag button:hover { color: #1d4ed8; }

/* Publish toggle */
.ba-pub-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1rem 1.25rem; background: #f8fafc;
  border-radius: 10px; border: 2px solid #e5e7eb; transition: border-color .2s;
}
.ba-pub-row.on { border-color: #bfdbfe; background: #eff6ff; }
.ba-toggle { position: relative; display: inline-block; width: 46px; height: 24px; flex-shrink: 0; }
.ba-toggle input { opacity: 0; width: 0; height: 0; }
.ba-slider {
  position: absolute; cursor: pointer; inset: 0;
  background: #cbd5e1; border-radius: 24px; transition: .3s;
}
.ba-slider::before {
  content: ''; position: absolute; width: 18px; height: 18px;
  border-radius: 50%; left: 3px; bottom: 3px; background: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,.25); transition: .3s;
}
.ba-toggle input:checked + .ba-slider { background: #1d4ed8; }
.ba-toggle input:checked + .ba-slider::before { transform: translateX(22px); }

/* Slug / Read time */
.ba-slug-preview { font-size: .73rem; color: #6b7280; margin-top: .3rem; word-break: break-all; }
.ba-slug-preview span { color: #1d4ed8; font-weight: 600; }
.ba-rt {
  display: inline-flex; align-items: center; gap: .35rem;
  background: #ecfdf5; color: #059669; border-radius: 50px;
  padding: .35rem 1rem; font-size: .78rem; font-weight: 700; border: 1px solid #a7f3d0;
}

/* Buttons */
.ba-btn {
  display: inline-flex; align-items: center; gap: .5rem;
  padding: .72rem 1.5rem; border-radius: 10px;
  border: none; font-family: inherit; font-weight: 700;
  font-size: .875rem; cursor: pointer; transition: all .2s; white-space: nowrap;
}
.ba-btn-primary {
  background: linear-gradient(135deg, #1d4ed8, #0f2342);
  color: #fff; flex: 1; justify-content: center;
}
.ba-btn-primary:hover:not(:disabled) { box-shadow: 0 8px 24px rgba(29,78,216,.4); transform: translateY(-1px); }
.ba-btn-primary:disabled { opacity: .55; cursor: not-allowed; }
.ba-btn-secondary { background: #f1f5f9; color: #374151; border: 2px solid #e5e7eb; }
.ba-btn-secondary:hover { background: #e2e8f0; }
.ba-btn-danger { background: #ef4444; color: #fff; }
.ba-btn-danger:hover:not(:disabled) { background: #dc2626; box-shadow: 0 6px 20px rgba(239,68,68,.35); }
.ba-btn-danger:disabled { opacity: .55; cursor: not-allowed; }
.ba-actions { display: flex; gap: 1rem; margin-top: .5rem; }
.ba-danger {
  background: linear-gradient(135deg, #fff5f5, #fee2e2);
  border: 2px solid #fca5a5; border-radius: 14px;
  padding: 1.5rem; margin-top: 2rem;
}
@media (max-width: 767px) {
  .ba-actions { flex-direction: column; }
  .ba-gallery-grid { grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); }
}
`;

if (!document.getElementById("ba-style")) {
  const s = document.createElement("style");
  s.id = "ba-style";
  s.textContent = STYLE;
  document.head.appendChild(s);
}

/* ═══════════════════════════════════════════
   CONSTANTS & HELPERS
═══════════════════════════════════════════ */
const CATS = [
  { id: "tech",   name: "ເທັກໂນໂລຢີ", icon: "fa-microchip", color: "#2563eb" },
  { id: "review", name: "ລີວິວ",       icon: "fa-star",      color: "#d97706" },
  { id: "guide",  name: "ຄູ່ມື",       icon: "fa-book-open", color: "#059669" },
  { id: "news",   name: "ຂ່າວສານ",    icon: "fa-newspaper", color: "#7c3aed" },
];

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
    ["link", "image", "video"],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    ["code-block"],
    ["clean"],
  ],
};

const genSlug = (t) =>
  t.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();

const calcReadTime = (html) => {
  const words = html.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 200))} ນາທີ`;
};

const toBase64 = (file) =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = (e) => res(e.target.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

const cntClass = (len, warn, max) => {
  if (len >= max) return "cnt-err";
  if (len >= warn) return "cnt-warn";
  return "";
};

/* ═══════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════ */
const BlogAdmin = () => {
  const navigate  = useNavigate();
  const { id }    = useParams();
  const isEditing = !!id;

  // ✅ ດຶງ user ຈາກ Redux — ບໍ່ loop
  const { user } = useSelector((s) => s.auth);

  /* ── State ── */
  const [form, setForm] = useState({
    title: "", excerpt: "", content: "", category: "tech",
    tags: [], isPublished: false,
    seoTitle: "", seoDescription: "",
    author: user?.name || "", slug: "", readTime: "1 ນາທີ",
  });
  const [images,   setImages]   = useState([]); // [{src, name}] idx-0=cover
  const [tagInput, setTagInput] = useState("");
  const [errors,   setErrors]   = useState({});

  // refs ສຳລັບ block useEffect loops
  const prevTitleRef   = useRef("");
  const prevContentRef = useRef("");

  /* ── RTK Query ── */
  const { data: blog, isLoading, isError, error } =
    useGetBlogDetailsQuery(id, { skip: !isEditing });

  const [createBlog, { isLoading: isCreating }] = useCreateBlogMutation();
  const [updateBlog, { isLoading: isUpdating }] = useUpdateBlogMutation();
  const [deleteBlog, { isLoading: isDeleting }] = useDeleteBlogMutation();

  /* ── Load blog data when editing ── */
  // ✅ FIX: ລຶບ user/currentUser ອອກຈາກ deps — ບໍ່ loop ອີກ
  useEffect(() => {
    if (!isEditing || !blog) return;
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
    if (!imgs.length && blog.image) {
      imgs.push({ src: blog.image?.url || blog.image, name: "cover" });
    }
    setImages(imgs);
  }, [blog, isEditing]); // ✅ ບໍ່ມີ user ໃນ deps

  /* ── Auto slug (create only) ── */
  // ✅ FIX: ໃຊ້ ref block loop
  useEffect(() => {
    if (isEditing) return;
    if (form.title === prevTitleRef.current) return;
    prevTitleRef.current = form.title;
    setForm((p) => ({ ...p, slug: genSlug(form.title) }));
  }, [form.title, isEditing]);

  /* ── Auto read time ── */
  // ✅ FIX: ໃຊ້ ref block loop
  useEffect(() => {
    if (!form.content || form.content === prevContentRef.current) return;
    prevContentRef.current = form.content;
    const rt = calcReadTime(form.content);
    setForm((p) => (p.readTime === rt ? p : { ...p, readTime: rt }));
  }, [form.content]);

  /* ── Image handlers ── */
  const handleCoverUpload = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("ຮູບໃຫຍ່ເກີນ 5MB"); return; }
    const src = await toBase64(file);
    setImages((p) => { const n = [...p]; n[0] = { src, name: file.name }; return n; });
    e.target.value = "";
  }, []);

  const handleGalleryUpload = useCallback(async (e) => {
    const files = Array.from(e.target.files);
    const big = files.filter((f) => f.size > 5 * 1024 * 1024);
    if (big.length) { toast.error(`${big.length} ຮູບໃຫຍ່ເກີນ 5MB`); return; }
    const converted = await Promise.all(
      files.map(async (f) => ({ src: await toBase64(f), name: f.name }))
    );
    setImages((p) => {
      const cover   = p[0] ? [p[0]] : [];
      const gallery = p.slice(1);
      return [...cover, ...gallery, ...converted];
    });
    e.target.value = "";
  }, []);

  const removeImage = useCallback((idx) => setImages((p) => p.filter((_, i) => i !== idx)), []);

  const setAsCover = useCallback((idx) => {
    setImages((p) => {
      const n = [...p];
      const [picked] = n.splice(idx, 1);
      return [picked, ...n];
    });
  }, []);

  /* ── Tags ── */
  const addTag = useCallback(() => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) setForm((p) => ({ ...p, tags: [...p.tags, t] }));
    setTagInput("");
  }, [tagInput, form.tags]);

  const removeTag = useCallback((t) =>
    setForm((p) => ({ ...p, tags: p.tags.filter((x) => x !== t) })), []);

  /* ── Field setter ── */
  const set = (field) => (e) =>
    setForm((p) => ({ ...p, [field]: e?.target ? e.target.value : e }));

  /* ── Validate ── */
  const validate = () => {
    const e = {};
    if (!form.title.trim())              e.title   = "ກະລຸນາປ້ອນຫົວຂໍ້";
    else if (form.title.length > 200)    e.title   = "ຕ້ອງບໍ່ເກີນ 200 ຕົວອັກສອນ";
    if (!form.excerpt.trim())            e.excerpt = "ກະລຸນາປ້ອນຄຳອະທິບາຍ";
    else if (form.excerpt.length > 500)  e.excerpt = "ຕ້ອງບໍ່ເກີນ 500 ຕົວອັກສອນ";
    const plain = form.content.replace(/<[^>]*>/g, "").trim();
    if (!plain || plain.length < 50)     e.content = "ເນື້ອຫາຕ້ອງ ≥ 50 ຕົວອັກສອນ";
    if (!form.author.trim())             e.author  = "ກະລຸນາປ້ອນຊື່ຜູ້ຂຽນ";
    if (form.seoTitle.length > 60)       e.seoTitle = "ເກີນ 60 ຕົວອັກສອນ";
    if (form.seoDescription.length > 160) e.seoDesc = "ເກີນ 160 ຕົວອັກສອນ";
    setErrors(e);
    return !Object.keys(e).length;
  };

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) { toast.error("ກະລຸນາກວດສອບຂໍ້ມູນ"); return; }
    const payload = {
      ...form,
      slug:   form.slug || genSlug(form.title),
      image:  images[0]?.src || "",
      images: images.map((i) => i.src),
    };
    try {
      if (isEditing) {
        await updateBlog({ id, ...payload }).unwrap();
        toast.success("✅ ອັບເດດສຳເລັດ");
      } else {
        await createBlog(payload).unwrap();
        toast.success("✅ ສ້າງບົດຄວາມສຳເລັດ");
      }
      navigate("/admin/blog");
    } catch (err) {
      toast.error(`❌ ${err?.data?.message || "ບັນທຶກບໍ່ສຳເລັດ"}`);
    }
  };

  /* ── Delete ── */
  const handleDelete = async () => {
    if (!window.confirm("⚠️ ແນ່ໃຈບໍ? ຈະລຶບຖາວອນ ກູ້ຄືນບໍ່ໄດ້.")) return;
    try {
      await deleteBlog(id).unwrap();
      toast.success("🗑️ ລຶບສຳເລັດ");
      navigate("/admin/blog");
    } catch { toast.error("❌ ລຶບບໍ່ສຳເລັດ"); }
  };

  /* ── Loading / Error ── */
  if (isEditing && isLoading) return (
    <AdminLayout>
      <div className="text-center py-5" style={{ fontFamily: "'Noto Sans Lao', sans-serif" }}>
        <Loader />
        <p className="mt-3 text-muted">ກຳລັງໂຫຼດ...</p>
      </div>
    </AdminLayout>
  );

  if (isEditing && isError) return (
    <AdminLayout>
      <div className="text-center py-5" style={{ fontFamily: "'Noto Sans Lao', sans-serif" }}>
        <i className="fas fa-circle-exclamation text-danger" style={{ fontSize: "3rem" }}></i>
        <h5 className="mt-3 fw-bold">{error?.data?.message || "ໂຫຼດຂໍ້ມູນບໍ່ໄດ້"}</h5>
        <button className="ba-btn ba-btn-secondary mt-3" onClick={() => navigate(-1)}>
          <i className="fas fa-arrow-left"></i> ກັບຄືນ
        </button>
      </div>
    </AdminLayout>
  );

  /* ── Derived ── */
  const coverImg    = images[0];
  const plainLen    = form.content.replace(/<[^>]*>/g, "").length;

  /* ════════════════════════════════════════
     RENDER
  ════════════════════════════════════════ */
  return (
    <AdminLayout>
      <div className="ba-wrap">

        {/* Breadcrumb */}
        <nav className="mb-2" style={{ fontSize: ".8rem", color: "#9ca3af" }}>
          <a href="/admin/dashboard" style={{ color: "#1d4ed8", textDecoration: "none" }}>Dashboard</a>
          {" / "}
          <a href="/admin/blog" style={{ color: "#1d4ed8", textDecoration: "none" }}>ຈັດການບົດຄວາມ</a>
          {" / "}
          <span style={{ color: "#374151", fontWeight: 600 }}>{isEditing ? "ແກ້ໄຂ" : "ສ້າງໃໝ່"}</span>
        </nav>

        {/* Header */}
        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
          <h1 className="ba-page-title">
            <i className={`fas ${isEditing ? "fa-pen-to-square" : "fa-circle-plus"} me-2`}></i>
            {isEditing ? "ແກ້ໄຂບົດຄວາມ" : "ສ້າງບົດຄວາມໃໝ່"}
          </h1>
          <button className="ba-btn ba-btn-secondary" onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left"></i> ກັບຄືນ
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>

          {/* ══ 1. ຂໍ້ມູນພື້ນຖານ ══ */}
          <div className="ba-card">
            <h2 className="ba-card-title">
              <i className="fas fa-file-lines" style={{ color: "#1d4ed8" }}></i>
              ຂໍ້ມູນພື້ນຖານ
            </h2>

            <div className="mb-3">
              <label className="ba-label req">ຫົວຂໍ້ບົດຄວາມ</label>
              <input
                className={`ba-input${errors.title ? " err" : ""}`}
                placeholder="ໃສ່ຫົວຂໍ້ບົດຄວາມ..."
                value={form.title} onChange={set("title")}
              />
              {errors.title && <div className="ba-err">{errors.title}</div>}
              <div className={`ba-hint ${cntClass(form.title.length, 160, 200)}`}>
                {form.title.length}/200 ຕົວອັກສອນ
              </div>
            </div>

            <div className="mb-3">
              <label className="ba-label req">ຄຳອະທິບາຍສັ້ນ</label>
              <textarea
                className={`ba-textarea${errors.excerpt ? " err" : ""}`}
                placeholder="ສະຫຼຸບຫຍໍ້ຂອງບົດຄວາມ..."
                rows={3} value={form.excerpt} onChange={set("excerpt")}
              />
              {errors.excerpt && <div className="ba-err">{errors.excerpt}</div>}
              <div className={`ba-hint ${cntClass(form.excerpt.length, 400, 500)}`}>
                {form.excerpt.length}/500 ຕົວອັກສອນ
              </div>
            </div>

            <div className="mb-3">
              <label className="ba-label req">ຜູ້ຂຽນ</label>
              <input
                className={`ba-input${errors.author ? " err" : ""}`}
                placeholder="ຊື່ຜູ້ຂຽນ..." value={form.author} onChange={set("author")}
              />
              {errors.author && <div className="ba-err">{errors.author}</div>}
            </div>

            <div className="mb-3">
              <label className="ba-label">ໝວດໝູ່</label>
              <div className="ba-cats">
                {CATS.map((c) => (
                  <button key={c.id} type="button"
                    className={`ba-cat${form.category === c.id ? " sel" : ""}`}
                    onClick={() => setForm((p) => ({ ...p, category: c.id }))}
                  >
                    <span className="ba-cat-dot" style={{ background: c.color }}></span>
                    <i className={`fas ${c.icon}`} style={{ color: c.color, fontSize: ".78rem" }}></i>
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="row g-3">
              <div className="col-md-8">
                <label className="ba-label">Slug (URL)</label>
                <input className="ba-input" placeholder="blog-post-slug"
                  value={form.slug} onChange={set("slug")} />
                <div className="ba-slug-preview">
                  /blogs/<span>{form.slug || genSlug(form.title) || "slug"}</span>
                </div>
              </div>
              <div className="col-md-4">
                <label className="ba-label">ເວລາການອ່ານ</label>
                <div className="mt-1">
                  <span className="ba-rt"><i className="fas fa-clock"></i> {form.readTime}</span>
                </div>
                <div className="ba-hint">ຄຳນວນອັດຕະໂນມັດ</div>
              </div>
            </div>
          </div>

          {/* ══ 2. ເນື້ອຫາ ══ */}
          <div className="ba-card">
            <h2 className="ba-card-title">
              <i className="fas fa-pen-nib" style={{ color: "#059669" }}></i>
              ເນື້ອຫາບົດຄວາມ
            </h2>
            <div className={`ba-quill${errors.content ? " err" : ""}`}>
              <ReactQuill
                theme="snow" value={form.content}
                onChange={(v) => setForm((p) => ({ ...p, content: v }))}
                modules={QUILL_MODULES}
                placeholder="ເລີ່ມຂຽນເນື້ອຫາ..."
              />
            </div>
            {errors.content && <div className="ba-err mt-1">{errors.content}</div>}
            <div className={`ba-hint mt-1 ${plainLen < 50 && plainLen > 0 ? "cnt-err" : ""}`}>
              {plainLen} ຕົວອັກສອນ (ຕ້ອງ ≥ 50)
            </div>
          </div>

          {/* ══ 3. ຮູບພາບ ══ */}
          <div className="ba-card">
            <h2 className="ba-card-title">
              <i className="fas fa-images" style={{ color: "#d97706" }}></i>
              ຮູບພາບ
              {images.length > 0 && (
                <span className="ba-img-badge ms-1">
                  <i className="fas fa-layer-group" style={{ fontSize: ".65rem" }}></i>
                  {images.length} ຮູບ
                </span>
              )}
            </h2>

            {/* Cover */}
            <label className="ba-label mb-2">ຮູບໜ້າປົກ</label>
            {!coverImg ? (
              <div className="ba-cover-zone mb-3">
                <input type="file" accept="image/*" onChange={handleCoverUpload} />
                <i className="fas fa-image mb-2" style={{ fontSize: "2.2rem", color: "#94a3b8", display: "block" }}></i>
                <p className="mb-1 fw-bold" style={{ color: "#64748b", fontSize: ".875rem" }}>
                  ຄິກຫຼືລາກຮູບໜ້າປົກທີ່ນີ້
                </p>
                <small style={{ color: "#9ca3af" }}>PNG, JPG — ສູງສຸດ 5MB</small>
              </div>
            ) : (
              <div className="ba-cover-preview mb-3">
                <img src={coverImg.src} alt="cover" />
                <button type="button" className="ba-cover-remove" onClick={() => removeImage(0)}>
                  <i className="fas fa-xmark"></i>
                </button>
              </div>
            )}

            {/* Gallery upload */}
            <label className="ba-label mb-2">
              ຮູບ Gallery
              <span style={{ color: "#9ca3af", fontWeight: 400, fontSize: ".75rem" }}>
                {" "}— ເລືອກໄດ້ຫຼາຍຮູບ
              </span>
            </label>
            <div className="ba-gallery-drop mb-1">
              <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} />
              <i className="fas fa-cloud-arrow-up mb-1"
                style={{ fontSize: "1.6rem", color: "#94a3b8", display: "block" }}></i>
              <p className="mb-0 fw-bold" style={{ color: "#64748b", fontSize: ".85rem" }}>
                ຄິກຫຼືລາກຮູບ (ເລືອກທີລະຫຼາຍຮູບ)
              </p>
              <small style={{ color: "#9ca3af" }}>PNG, JPG — ສູງສຸດ 5MB ຕໍ່ຮູບ</small>
            </div>

            {/* Thumbnail grid — all images */}
            {images.length > 0 && (
              <div className="ba-gallery-grid">
                {images.map((img, i) => (
                  <div key={i} className={`ba-thumb${i === 0 ? " is-cover" : ""}`}>
                    <img src={img.src} alt={img.name} />
                    <div className="ba-thumb-overlay">
                      <button type="button" className="ba-thumb-rm" onClick={() => removeImage(i)}>
                        <i className="fas fa-xmark"></i>
                      </button>
                    </div>
                    {i !== 0 && (
                      <button type="button" className="ba-thumb-star" onClick={() => setAsCover(i)}>
                        <i className="fas fa-star" style={{ fontSize: ".55rem" }}></i> ໜ້າປົກ
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {images.length === 0 && (
              <div className="ba-hint text-center py-2">
                ຍັງບໍ່ມີຮູບ — ຮູບໜ້າປົກຈະສະແດງໃນລາຍຊື່ບົດຄວາມ
              </div>
            )}
          </div>

          {/* ══ 4. ແທັກ ══ */}
          <div className="ba-card">
            <h2 className="ba-card-title">
              <i className="fas fa-tags" style={{ color: "#7c3aed" }}></i>
              ແທັກ
            </h2>
            <div className="ba-tag-row">
              <input
                className="ba-input"
                placeholder="ໃສ່ແທັກ ແລ້ວກົດ Enter..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
              />
              <button type="button" className="ba-btn ba-btn-secondary" onClick={addTag}>
                <i className="fas fa-plus"></i>
              </button>
            </div>
            <div className="ba-tags">
              {form.tags.length > 0
                ? form.tags.map((t, i) => (
                    <span key={i} className="ba-tag">
                      #{t}
                      <button type="button" onClick={() => removeTag(t)}>×</button>
                    </span>
                  ))
                : <span className="ba-hint">ຍັງບໍ່ມີແທັກ</span>
              }
            </div>
          </div>

          {/* ══ 5. SEO ══ */}
          <div className="ba-card">
            <h2 className="ba-card-title">
              <i className="fas fa-magnifying-glass" style={{ color: "#7c3aed" }}></i>
              SEO Optimization
            </h2>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="ba-label">SEO Title</label>
                <input
                  className={`ba-input${errors.seoTitle ? " err" : ""}`}
                  placeholder="ຫົວຂໍ້ສຳລັບ SEO..." value={form.seoTitle} onChange={set("seoTitle")}
                />
                {errors.seoTitle && <div className="ba-err">{errors.seoTitle}</div>}
                <div className={`ba-hint ${cntClass(form.seoTitle.length, 50, 60)}`}>
                  {form.seoTitle.length}/60
                </div>
              </div>
              <div className="col-md-6">
                <label className="ba-label">SEO Description</label>
                <textarea
                  className={`ba-textarea${errors.seoDesc ? " err" : ""}`}
                  placeholder="ຄຳອະທິບາຍ SEO..." rows={3}
                  value={form.seoDescription} onChange={set("seoDescription")}
                />
                {errors.seoDesc && <div className="ba-err">{errors.seoDesc}</div>}
                <div className={`ba-hint ${cntClass(form.seoDescription.length, 130, 160)}`}>
                  {form.seoDescription.length}/160
                </div>
              </div>
            </div>
          </div>

          {/* ══ 6. ການຕັ້ງຄ່າ ══ */}
          <div className="ba-card">
            <h2 className="ba-card-title">
              <i className="fas fa-gear" style={{ color: "#6b7280" }}></i>
              ການຕັ້ງຄ່າ
            </h2>
            <div className={`ba-pub-row${form.isPublished ? " on" : ""}`}>
              <div>
                <div style={{ fontWeight: 700, color: "#111827", fontSize: ".9rem" }}>ເຜີຍແຜ່ບົດຄວາມ</div>
                <div style={{ fontSize: ".78rem", color: "#6b7280", marginTop: ".2rem" }}>
                  {form.isPublished ? "🟢 ສະແດງໃນໜ້າເວັບ" : "⚪ Draft — ຍັງບໍ່ສະແດງ"}
                </div>
              </div>
              <label className="ba-toggle">
                <input
                  type="checkbox" checked={form.isPublished}
                  onChange={(e) => setForm((p) => ({ ...p, isPublished: e.target.checked }))}
                />
                <span className="ba-slider"></span>
              </label>
            </div>
          </div>

          {/* ══ Submit ══ */}
          <div className="ba-actions">
            <button type="submit" className="ba-btn ba-btn-primary"
              disabled={isCreating || isUpdating}>
              {(isCreating || isUpdating)
                ? <><i className="fas fa-spinner fa-spin"></i> ກຳລັງບັນທຶກ...</>
                : isEditing
                  ? <><i className="fas fa-floppy-disk"></i> ບັນທຶກການແກ້ໄຂ</>
                  : <><i className="fas fa-circle-plus"></i> ສ້າງບົດຄວາມ</>
              }
            </button>
          </div>

          {/* ══ Danger Zone ══ */}
          {isEditing && (
            <div className="ba-danger">
              <div className="d-flex align-items-center gap-2 mb-2">
                <i className="fas fa-triangle-exclamation text-danger"></i>
                <span style={{ fontWeight: 800, color: "#dc2626", fontSize: ".95rem" }}>ເຂດອັນຕະລາຍ</span>
              </div>
              <p style={{ fontSize: ".83rem", color: "#7f1d1d", marginBottom: ".85rem" }}>
                ການລຶບຈະເປັນການຖາວອນ ບໍ່ສາມາດກູ້ຄືນໄດ້. ກະລຸນາຄິດໃຫ້ດີ.
              </p>
              <button type="button" className="ba-btn ba-btn-danger"
                onClick={handleDelete} disabled={isDeleting}>
                {isDeleting
                  ? <><i className="fas fa-spinner fa-spin"></i> ກຳລັງລຶບ...</>
                  : <><i className="fas fa-trash"></i> ລຶບບົດຄວາມນີ້</>
                }
              </button>
            </div>
          )}

        </form>
      </div>
    </AdminLayout>
  );
};

export default BlogAdmin;