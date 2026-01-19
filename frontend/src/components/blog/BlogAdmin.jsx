import React, { useState, useEffect } from "react";
import {
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
  useGetBlogDetailsQuery,
} from "../redux/api/blogApi";
import { useNavigate, useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import AdminLayout from "../layout/AdminLayout";
import { toast } from "react-hot-toast";
import Loader from '../layout/Loader';

const BlogAdmin = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  // Get current user (you'll need to adjust this based on your auth system)
  const currentUser = {
    _id: "current-user-id", // This should come from your auth context
    name: "Current User"
  };

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "tech",
    image: "",
    tags: [],
    isPublished: false,
    seoTitle: "",
    seoDescription: "",
    author: "",
    authorId: "",
    readTime: "5 นาที",
    slug: ""
  });

  const [tagInput, setTagInput] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  const { data: blog, isLoading, isError, error } = useGetBlogDetailsQuery(id, {
    skip: !isEditing,
  });

  useEffect(() => {
    if (isEditing && blog) {
      setFormData({
        title: blog.title || "",
        excerpt: blog.excerpt || "",
        content: blog.content || "",
        category: blog.category || "tech",
        image: blog.image || "",
        tags: blog.tags || [],
        isPublished: blog.isPublished || false,
        seoTitle: blog.seoTitle || "",
        seoDescription: blog.seoDescription || "",
        author: blog.author || currentUser.name,
        authorId: blog.authorId || currentUser._id,
        readTime: blog.readTime || "5 นาที",
        slug: blog.slug || ""
      });
    } else if (!isEditing) {
      // Set default author for new posts
      setFormData(prev => ({
        ...prev,
        author: currentUser.name,
        authorId: currentUser._id
      }));
    }
  }, [blog, isEditing, currentUser]);

  const [createBlog, { isLoading: isCreating }] = useCreateBlogMutation();
  const [updateBlog, { isLoading: isUpdating }] = useUpdateBlogMutation();
  const [deleteBlog, { isLoading: isDeleting }] = useDeleteBlogMutation();

  const categories = [
    { id: "tech", name: "ເທັກໂນໂລຢີ", icon: "fa-microchip", color: "#667eea" },
    { id: "review", name: "ລີວິວ", icon: "fa-star", color: "#f59e0b" },
    { id: "guide", name: "ຄູ່ມື", icon: "fa-book", color: "#10b981" },
    { id: "news", name: "ຂ່າວສານ", icon: "fa-newspaper", color: "#3b82f6" },
  ];

  // Generate slug from title
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9ก-๙\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  // Calculate read time based on content length
  const calculateReadTime = (content) => {
    const wordsPerMinute = 200;
    const words = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} นาที`;
  };

  // Validate form data
  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = "ກະລຸນາປ້ອນຫົວຂໍ້";
    } else if (formData.title.length > 200) {
      errors.title = "ຫົວຂໍ້ຕ້ອງບໍ່ເກີນ 200 ຕົວອັກສອນ";
    }

    if (!formData.excerpt.trim()) {
      errors.excerpt = "ກະລຸນາປ້ອນຄຳອະທິບາຍ";
    } else if (formData.excerpt.length > 500) {
      errors.excerpt = "ຄຳອະທິບາຍຕ້ອງບໍ່ເກີນ 500 ຕົວອັກສອນ";
    }

    if (!formData.content.trim()) {
      errors.content = "ກະລຸນາປ້ອນເນື້ອຫາ";
    } else if (formData.content.length < 50) {
      errors.content = "ເນື້ອຫາຕ້ອງມີຢ່າງນ້ອຍ 50 ຕົວອັກສອນ";
    }

    if (!formData.category) {
      errors.category = "ກະລຸນາເລືອກຫມວດໝູ່";
    }

    if (!formData.author.trim()) {
      errors.author = "ກະລຸນາປ້ອນຊື່ຜູ້ຂຽນ";
    }

    if (formData.seoTitle && formData.seoTitle.length > 60) {
      errors.seoTitle = "SEO title ຕ້ອງບໍ່ເກີນ 60 ຕົວອັກສອນ";
    }

    if (formData.seoDescription && formData.seoDescription.length > 160) {
      errors.seoDescription = "SEO description ຕ້ອງບໍ່ເກີນ 160 ຕົວອັກສອນ";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("ກະລຸນາກວດສອບຂໍ້ມູນໃຫ້ຖືກຕ້ອງ");
      return;
    }

    // Generate slug and read time
    const submitData = {
      ...formData,
      slug: formData.slug || generateSlug(formData.title),
      readTime: calculateReadTime(formData.content),
      authorId: currentUser._id,
      author: formData.author || currentUser.name
    };

    try {
      if (isEditing) {
        await updateBlog({ id, ...submitData }).unwrap();
        toast.success("✅ ອັບເດດບົດຄວາມສຳເລັດ");
      } else {
        await createBlog(submitData).unwrap();
        toast.success("✅ ສ້າງບົດຄວາມສຳເລັດ");
      }
      navigate("/admin/blog");
    } catch (err) {
      toast.error(`❌ ຜິດພາດ: ${err.data?.message || "ບັນທຶກບໍ່ສຳເລັດ"}`);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("⚠️ ທ່ານແນ່ໃຈບໍທີ່ຈະລຶບບົດຄວາມນີ້? ການລຶບຈະບໍ່ສາມາດກູ້ຄືນໄດ້.")) {
      try {
        await deleteBlog(id).unwrap();
        toast.success("🗑️ ລຶບບົດຄວາມສຳເລັດ");
        navigate("/admin/blog");
      } catch (err) {
        toast.error("❌ ລຶບບໍ່ສຳເລັດ");
      }
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({ 
      ...formData, 
      tags: formData.tags.filter(tag => tag !== tagToRemove) 
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({ ...formData, image: event.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Auto-generate slug when title changes
  useEffect(() => {
    if (formData.title && !isEditing) {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(formData.title)
      }));
    }
  }, [formData.title, isEditing]);

  // Auto-calculate read time when content changes
  useEffect(() => {
    if (formData.content) {
      const newReadTime = calculateReadTime(formData.content);
      setFormData(prev => ({
        ...prev,
        readTime: newReadTime
      }));
    }
  }, [formData.content]);

  if (isEditing && isLoading) return (
    <AdminLayout>
      <div className="blog-admin-container">
        <div className="loading-state">
          <Loader />
          <p>⏳ ກຳລັງໂຫຼດຂໍ້ມູນບົດຄວາມ...</p>
        </div>
      </div>
    </AdminLayout>
  );

  if (isEditing && isError) return (
    <AdminLayout>
      <div className="blog-admin-container">
        <div className="error-state">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>❌ ເກີດຂໍ້ຜິດພາດ</h3>
          <p>{error.data?.message || "ບໍ່ສາມາດໂຫຼດຂໍ້ມູນບົດຄວາມໄດ້"}</p>
          <button onClick={() => navigate(-1)} className="btn btn-secondary">
            ກັບຄືນ
          </button>
        </div>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <style>{`
        .blog-admin-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #f0f0f0;
        }

        .page-title {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 700;
          font-size: 1.75rem;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .breadcrumb-nav {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #718096;
          margin-bottom: 0.75rem;
        }

        .breadcrumb-nav a {
          color: #667eea;
          text-decoration: none;
          transition: color 0.2s;
        }

        .breadcrumb-nav a:hover {
          color: #764ba2;
        }

        .form-section {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #f0f0f0;
        }

        .section-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1a202c;
          margin: 0;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          display: block;
          font-weight: 600;
          color: #4a5568;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        }

        .form-label.required::after {
          content: " *";
          color: #dc3545;
        }

        .form-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.875rem;
          transition: all 0.2s ease;
          background: #fff;
        }

        .form-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-input.error {
          border-color: #dc3545;
        }

        .error-message {
          color: #dc3545;
          font-size: 0.75rem;
          margin-top: 0.25rem;
        }

        .form-textarea {
          min-height: 100px;
          resize: vertical;
        }

        .category-select {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-top: 0.5rem;
        }

        .category-option {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: #fff;
        }

        .category-option:hover {
          border-color: #667eea;
          background: rgba(102, 126, 234, 0.05);
        }

        .category-option.selected {
          border-color: #667eea;
          background: rgba(102, 126, 234, 0.1);
        }

        .category-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1rem;
        }

        .tag-input-container {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .tags-container {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .tag {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .tag-remove {
          background: none;
          border: none;
          color: #667eea;
          cursor: pointer;
          padding: 0;
          font-size: 0.875rem;
        }

        .image-upload-container {
          border: 2px dashed #e2e8f0;
          border-radius: 8px;
          padding: 2rem;
          text-align: center;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .image-upload-container:hover {
          border-color: #667eea;
          background: rgba(102, 126, 234, 0.05);
        }

        .image-preview {
          margin-top: 1rem;
          max-width: 300px;
          max-height: 200px;
          border-radius: 8px;
          object-fit: cover;
          border: 1px solid #e2e8f0;
        }

        .quill-editor {
          background: #fff;
          border-radius: 8px;
          border: 2px solid #e2e8f0;
          overflow: hidden;
        }

        .quill-editor .ql-container {
          min-height: 300px;
          font-size: 1rem;
        }

        .quill-editor .ql-editor {
          min-height: 300px;
        }

        .checkbox-container {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 8px;
          cursor: pointer;
        }

        .checkbox-container input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          flex: 1;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover {
          background: #5a6268;
        }

        .danger-zone {
          background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%);
          border: 2px solid #fc8181;
          border-radius: 16px;
          padding: 2rem;
          margin-top: 2rem;
        }

        .danger-zone-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .danger-zone-title {
          color: #dc3545;
          font-weight: 700;
          font-size: 1.125rem;
          margin: 0;
        }

        .danger-zone-text {
          color: #742a2a;
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }

        .btn-danger {
          background: #dc3545;
          color: white;
        }

        .btn-danger:hover {
          background: #c82333;
        }

        .loading-state, .error-state {
          text-align: center;
          padding: 3rem 1rem;
        }

        .loading-state p, .error-state p {
          margin-top: 1rem;
          color: #718096;
        }

        .error-state i {
          font-size: 3rem;
          color: #dc3545;
          margin-bottom: 1rem;
        }

        .read-time-display {
          background: rgba(16, 185, 129, 0.1);
          color: #059669;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          display: inline-block;
          margin-top: 0.5rem;
        }

        .slug-input-container {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .slug-preview {
          background: #f8fafc;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          color: #64748b;
          border: 2px solid #e2e8f0;
          flex: 1;
        }

        @media (max-width: 768px) {
          .blog-admin-container {
            padding: 1rem;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .category-select {
            grid-template-columns: 1fr;
          }

          .form-actions {
            flex-direction: column;
          }
        }
      `}</style>

      <div className="blog-admin-container">
        {/* Header */}
        <div className="breadcrumb-nav">
          <a href="/admin/dashboard">
            <i className="fas fa-home"></i> Dashboard
          </a>
          <span>/</span>
          <a href="/admin/blog">
            <i className="fas fa-blog"></i> ຈັດການບົດຄວາມ
          </a>
          <span>/</span>
          <span>{isEditing ? "ແກ້ໄຂບົດຄວາມ" : "ສ້າງບົດຄວາມໃໝ່"}</span>
        </div>

        <div className="admin-header">
          <h1 className="page-title">
            <i className={`fas ${isEditing ? 'fa-edit' : 'fa-plus-circle'}`}></i>
            <span>{isEditing ? "ແກ້ໄຂບົດຄວາມ" : "ສ້າງບົດຄວາມໃໝ່"}</span>
          </h1>
          <button onClick={() => navigate(-1)} className="btn btn-secondary">
            <i className="fas fa-arrow-left"></i>
            ກັບຄືນ
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Information Section */}
          <div className="form-section">
            <div className="section-header">
              <i className="fas fa-file-alt" style={{ color: '#667eea' }}></i>
              <h3 className="section-title">📝 ຂໍ້ມູນພື້ນຖານ</h3>
            </div>

            <div className="form-group">
              <label className="form-label required">ຫົວຂໍ້ບົດຄວາມ</label>
              <input
                type="text"
                placeholder="ໃສ່ຫົວຂໍ້ບົດຄວາມ..."
                value={formData.title}
                required
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`form-input ${validationErrors.title ? 'error' : ''}`}
              />
              {validationErrors.title && (
                <span className="error-message">{validationErrors.title}</span>
              )}
              <small style={{ color: '#718096', fontSize: '0.75rem' }}>
                {formData.title.length}/200 ຕົວອັກສອນ
              </small>
            </div>

            <div className="form-group">
              <label className="form-label required">ຄຳອະທິບາຍສັ້ນ</label>
              <textarea
                placeholder="ສະຫຼຸບຫຍໍ້ຂອງບົດຄວາມ..."
                value={formData.excerpt}
                required
                rows={3}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                className={`form-input form-textarea ${validationErrors.excerpt ? 'error' : ''}`}
              />
              {validationErrors.excerpt && (
                <span className="error-message">{validationErrors.excerpt}</span>
              )}
              <small style={{ color: '#718096', fontSize: '0.75rem' }}>
                {formData.excerpt.length}/500 ຕົວອັກສອນ
              </small>
            </div>

            <div className="form-group">
              <label className="form-label">ຜູ້ຂຽນ</label>
              <input
                type="text"
                placeholder="ຊື່ຜູ້ຂຽນ..."
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className={`form-input ${validationErrors.author ? 'error' : ''}`}
              />
              {validationErrors.author && (
                <span className="error-message">{validationErrors.author}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">ໝວດໝູ່</label>
              <div className="category-select">
                {categories.map((cat) => (
                  <label
                    key={cat.id}
                    className={`category-option ${formData.category === cat.id ? 'selected' : ''}`}
                    onClick={() => setFormData({ ...formData, category: cat.id })}
                  >
                    <div 
                      className="category-icon" 
                      style={{ background: cat.color }}
                    >
                      <i className={`fas ${cat.icon}`}></i>
                    </div>
                    <span>{cat.name}</span>
                  </label>
                ))}
              </div>
              {validationErrors.category && (
                <span className="error-message">{validationErrors.category}</span>
              )}
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Slug (URL)</label>
                <div className="slug-input-container">
                  <input
                    type="text"
                    placeholder="blog-post-slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="form-input"
                  />
                </div>
                <small style={{ color: '#718096', fontSize: '0.75rem' }}>
                  /blogs/{formData.slug || generateSlug(formData.title)}
                </small>
              </div>

              <div className="form-group">
                <label className="form-label">ເວລາການອ່ານ</label>
                <div className="read-time-display">
                  <i className="fas fa-clock"></i> {formData.readTime}
                </div>
                <small style={{ color: '#718096', fontSize: '0.75rem' }}>
                  ຄຳນວນໂດຍອັດຕະໂນມັດຈາກເນື້ອຫາ
                </small>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="form-section">
            <div className="section-header">
              <i className="fas fa-edit" style={{ color: '#10b981' }}></i>
              <h3 className="section-title">🖊️ ເນື້ອຫາບົດຄວາມ</h3>
            </div>

            <div className="form-group">
              <label className="form-label required">ເນື້ອຫາ</label>
              <div className="quill-editor">
                <ReactQuill
                  theme="snow"
                  value={formData.content}
                  onChange={(val) => setFormData({ ...formData, content: val })}
                  modules={quillModules}
                  placeholder="ເລີ່ມຂຽນເນື້ອຫາບົດຄວາມ..."
                />
              </div>
              {validationErrors.content && (
                <span className="error-message">{validationErrors.content}</span>
              )}
              <small style={{ color: '#718096', fontSize: '0.75rem' }}>
                {formData.content.length} ຕົວອັກສອນ (ຕ້ອງມີຢ່າງນ້ອຍ 50 ຕົວອັກສອນ)
              </small>
            </div>
          </div>

          {/* Media & Tags Section */}
          <div className="form-section">
            <div className="section-header">
              <i className="fas fa-image" style={{ color: '#f59e0b' }}></i>
              <h3 className="section-title">🖼️ ຮູບພາບ ແລະ ແທັກ</h3>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">ຮູບພາດ ໜ້າປົກ</label>
                <div className="image-upload-container">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" style={{ cursor: 'pointer' }}>
                    <i className="fas fa-cloud-upload-alt" style={{ fontSize: '2rem', color: '#667eea', marginBottom: '0.5rem' }}></i>
                    <p>ຄິກທີ່ນີ້ເພື່ອອັບໂຫຼດຮູບພາບ</p>
                    <small style={{ color: '#718096' }}>PNG, JPG, GIF ຂະຫນາດສູງສຸດ 5MB</small>
                  </label>
                </div>
                {formData.image && (
                  <img src={formData.image} alt="preview" className="image-preview" />
                )}
              </div>

              <div className="form-group">
                <label className="form-label">ແທັກ</label>
                <div className="tag-input-container">
                  <input
                    type="text"
                    placeholder="ໃສ່ແທັກ..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    className="form-input"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="btn btn-secondary"
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
                <div className="tags-container">
                  {formData.tags.map((tag, index) => (
                    <span key={index} className="tag">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="tag-remove"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SEO Section */}
          <div className="form-section">
            <div className="section-header">
              <i className="fas fa-search" style={{ color: '#8b5cf6' }}></i>
              <h3 className="section-title">🔍 SEO Optimization</h3>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">SEO Title</label>
                <input
                  type="text"
                  placeholder="ຫົວຂໍ້ສຳລັບ SEO..."
                  value={formData.seoTitle}
                  onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                  className={`form-input ${validationErrors.seoTitle ? 'error' : ''}`}
                />
                {validationErrors.seoTitle && (
                  <span className="error-message">{validationErrors.seoTitle}</span>
                )}
                <small style={{ color: '#718096', fontSize: '0.75rem' }}>
                  {formData.seoTitle.length}/60 ຕົວອັກສອນ
                </small>
              </div>

              <div className="form-group">
                <label className="form-label">SEO Description</label>
                <textarea
                  placeholder="ຄຳອະທິບາຍສຳລັບ SEO..."
                  value={formData.seoDescription}
                  onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                  className={`form-input form-textarea ${validationErrors.seoDescription ? 'error' : ''}`}
                  rows={3}
                />
                {validationErrors.seoDescription && (
                  <span className="error-message">{validationErrors.seoDescription}</span>
                )}
                <small style={{ color: '#718096', fontSize: '0.75rem' }}>
                  {formData.seoDescription.length}/160 ຕົວອັກສອນ
                </small>
              </div>
            </div>
          </div>

          {/* Publishing Section */}
          <div className="form-section">
            <div className="section-header">
              <i className="fas fa-cog" style={{ color: '#6b7280' }}></i>
              <h3 className="section-title">⚙️ ການຕັ້ງຄ່າ</h3>
            </div>

            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
              />
              <span>
                <strong>ເຜີຍແຜ່ບົດຄວາມ</strong>
                <br />
                <small style={{ color: '#718096' }}>
                  {formData.isPublished ? 'ບົດຄວາມນີ້ຈະສະແດງໃນຫນ້າເວັບໄຊທ໌' : 'ບົດຄວາມນີ້ຈະບໍ່ສະແດງຈົນກວ່າຈະເຜີຍແຜ່'}
                </small>
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button
              type="submit"
              disabled={isCreating || isUpdating}
              className="btn btn-primary"
            >
              {isCreating || isUpdating ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  ກຳລັງບັນທຶກ...
                </>
              ) : isEditing ? (
                <>
                  <i className="fas fa-save"></i>
                  ບັນທຶກການແກ້ໄຂ
                </>
              ) : (
                <>
                  <i className="fas fa-plus"></i>
                  ສ້າງບົດຄວາມ
                </>
              )}
            </button>
          </div>

          {/* Danger Zone */}
          {isEditing && (
            <div className="danger-zone">
              <div className="danger-zone-header">
                <i className="fas fa-exclamation-triangle"></i>
                <h4 className="danger-zone-title">⚠️ ເຂດອັນຕະລາຍ</h4>
              </div>
              <p className="danger-zone-text">
                ການລຶບບົດຄວາມນີ້ຈະເປັນການຖາວອນ ແລະ ບໍ່ສາມາດກູ້ຄືນໄດ້. 
                ກະລຸນາຕົກລົງຢ່າງລະມັດລະວັງ.
              </p>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="btn btn-danger"
              >
                {isDeleting ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    ກຳລັງລຶບ...
                  </>
                ) : (
                  <>
                    <i className="fas fa-trash"></i>
                    ລຶບບົດຄວາມນີ້
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </AdminLayout>
  );
};

const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
    ['link', 'image', 'video'],
    ['clean'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'align': [] }],
    ['code-block']
  ],
};

export default BlogAdmin;