import React, { useState } from 'react';
import { useGetBlogsQuery } from '../redux/api/blogApi'; 
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const BlogList = () => {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, error } = useGetBlogsQuery({
    page,
    category: category === 'all' ? '' : category,
    search: searchTerm,
    limit: 9
  });

  const categories = [
    { id: 'all', name: 'ທັງໝົດ', icon: '📚', gradient: 'from-purple-500 to-pink-500' },
    { id: 'tech', name: 'ເທັກໂນໂລຢີ', icon: '💻', gradient: 'from-blue-500 to-cyan-500' },
    { id: 'review', name: 'ລີວິວ', icon: '⭐', gradient: 'from-amber-500 to-orange-500' },
    { id: 'guide', name: 'ຄູ່ມື', icon: '📖', gradient: 'from-green-500 to-emerald-500' },
    { id: 'news', name: 'ຂ່າວສານ', icon: '📰', gradient: 'from-indigo-500 to-purple-500' }
  ];

  if (isLoading) return <BlogSkeleton />;
  if (error) return <BlogError error={error} />;

  return (
    <div className="blog-container">
      {/* Animated Header Section */}
      <div className="blog-header">
        <div className="header-content">
          <div className="header-badge">
            <span className="badge-pulse"></span>
            ✨ ອັບເດດໃໝ່ທຸກວັນ
          </div>
          <h1 className="page-title">
            <span className="title-icon">📝</span>
            <span className="title-text">ບລັອກເທັກໂນໂລຢີ</span>
          </h1>
          <p className="page-subtitle">
            ຄົ້ນພົບບົດຄວາມ, ລີວິວ ແລະ ຄູ່ມືການໃຊ້ງານເທັກໂນໂລຢີທີ່ມີປະໂຫຍດ
          </p>
        </div>
      </div>

      {/* Enhanced Filter & Search Section */}
      <div className="blog-filters">
        <div className="search-wrapper">
          <div className="search-box">
            <i className="fas fa-search search-icon-left"></i>
            <input
              type="text"
              placeholder="ຄົ້ນຫາບົດຄວາມທີ່ທ່ານສົນໃຈ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button 
                className="search-clear"
                onClick={() => setSearchTerm('')}
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>

        <div className="category-section">
          <div className="category-filter">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  setCategory(cat.id);
                  setPage(1);
                }}
                className={`category-btn ${category === cat.id ? 'active' : ''}`}
                data-gradient={cat.gradient}
              >
                <span className="category-icon">{cat.icon}</span>
                <span className="category-name">{cat.name}</span>
                {category === cat.id && <span className="active-indicator"></span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Results Summary */}
      {data?.blogs?.length > 0 && (
        <div className="results-summary">
          <div className="result-count">
            <i className="fas fa-file-alt"></i>
            <span>ພົບ <strong>{data.pagination?.totalBlogs || data.blogs.length}</strong> ບົດຄວາມ</span>
          </div>
          {searchTerm && (
            <div className="search-tag">
              <i className="fas fa-search"></i>
              <span>"{searchTerm}"</span>
              <button onClick={() => setSearchTerm('')}>×</button>
            </div>
          )}
        </div>
      )}

      {/* Enhanced Blog Grid */}
      <div className="blog-grid">
        {data?.blogs?.length > 0 ? (
          data.blogs.map((blog, index) => (
            <BlogCard key={blog._id} blog={blog} index={index} />
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-animation">
              <div className="empty-icon">🔍</div>
              <div className="empty-circle"></div>
            </div>
            <h3>ບໍ່ພົບບົດຄວາມ</h3>
            <p>ລອງປ່ຽນຄຳຄົ້ນຫາຫຼືເລືອກຫມວດໝູ່ອື່ນ</p>
            {(searchTerm || category !== 'all') && (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setCategory('all');
                }}
                className="reset-btn"
              >
                <i className="fas fa-redo"></i>
                ລ້າງການຄົ້ນຫາ
              </button>
            )}
          </div>
        )}
      </div>

      {/* Enhanced Pagination */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <BlogPagination 
          pagination={data.pagination}
          onPageChange={setPage}
        />
      )}
    </div>
  );
};

const BlogCard = ({ blog, index }) => {
  const formatDate = (date) => {
    try {
      const result = formatDistanceToNow(new Date(date), { 
        addSuffix: true 
      });
      const translations = {
        'less than a minute ago': 'ກວ່າ 1 ນາທີ',
        'minute ago': 'ນາທີ',
        'minutes ago': 'ນາທີ',
        'hour ago': 'ຊົ່ວໂມງ',
        'hours ago': 'ຊົ່ວໂມງ',
        'day ago': 'ມື້',
        'days ago': 'ມື້',
        'week ago': 'ອາທິດ',
        'weeks ago': 'ອາທິດ',
        'month ago': 'ເດືອນ',
        'months ago': 'ເດືອນ',
        'year ago': 'ປີ',
        'years ago': 'ປີ',
        'ago': 'ຜ່ານມາ'
      };
      
      let translated = result;
      for (const [en, lo] of Object.entries(translations)) {
        translated = translated.replace(new RegExp(en, 'g'), lo);
      }
      return translated;
    } catch (e) {
      return 'ບໍ່ນານມານີ້';
    }
  };

  const getCategoryInfo = (category) => {
    const info = {
      tech: { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', label: 'ເທັກໂນໂລຢີ' },
      review: { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', label: 'ລີວິວ' },
      guide: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', label: 'ຄູ່ມື' },
      news: { bg: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', label: 'ຂ່າວສານ' }
    };
    return info[category] || info.tech;
  };

  const categoryInfo = getCategoryInfo(blog.category);

  return (
    <div className="blog-card" style={{ animationDelay: `${index * 0.1}s` }}>
      <Link to={`/blogs/${blog.slug || blog._id}`} className="blog-card-link">
        <div className="blog-image-wrapper">
          <div className="blog-image">
            {blog.image?.url || blog.image ? (
              <img 
                src={blog.image?.url || blog.image} 
                alt={blog.title} 
                className="blog-image-img"
              />
            ) : (
              <div className="blog-image-placeholder">
                {blog.category === 'tech' ? '💻' : 
                 blog.category === 'review' ? '⭐' :
                 blog.category === 'guide' ? '📖' : '📰'}
              </div>
            )}
            <div className="image-overlay"></div>
          </div>
          <div 
            className="category-badge" 
            style={{ 
              background: categoryInfo.bg,
              color: categoryInfo.color 
            }}
          >
            <span className="badge-dot" style={{ background: categoryInfo.color }}></span>
            {categoryInfo.label}
          </div>
        </div>

        <div className="blog-content">
          <div className="blog-meta">
            <span className="meta-item">
              <i className="far fa-clock"></i>
              {formatDate(blog.createdAt)}
            </span>
            <span className="meta-divider">•</span>
            <span className="meta-item">
              <i className="far fa-eye"></i>
              {blog.views?.toLocaleString() || 0}
            </span>
            <span className="meta-divider">•</span>
            <span className="meta-item">
              <i className="far fa-comment"></i>
              {blog.comments?.length || 0}
            </span>
          </div>

          <h3 className="blog-title">{blog.title}</h3>
          <p className="blog-excerpt">{blog.excerpt}</p>
          
          <div className="blog-footer">
            <div className="read-more">
              <span>ອ່ານຕໍ່</span>
              <i className="fas fa-arrow-right"></i>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

// Helper Components
const BlogSkeleton = () => (
  <div className="blog-container">
    <div className="blog-skeleton-header">
      <div className="skeleton-badge"></div>
      <div className="skeleton-title"></div>
      <div className="skeleton-subtitle"></div>
    </div>
    <div className="skeleton-filters">
      <div className="skeleton-search"></div>
      <div className="skeleton-categories">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skeleton-category"></div>
        ))}
      </div>
    </div>
    <div className="blog-grid">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="blog-card-skeleton">
          <div className="skeleton-image"></div>
          <div className="skeleton-content">
            <div className="skeleton-meta"></div>
            <div className="skeleton-title"></div>
            <div className="skeleton-excerpt"></div>
            <div className="skeleton-footer"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const BlogError = ({ error }) => (
  <div className="error-container">
    <div className="error-animation">
      <div className="error-icon">⚠️</div>
      <div className="error-pulse"></div>
    </div>
    <h3 className="error-title">ເກີດຂໍ້ຜິດພາດ</h3>
    <p className="error-message">{error?.data?.message || 'ບໍ່ສາມາດໂຫຼດຂໍ້ມູນບົດຄວາມໄດ້'}</p>
    <button onClick={() => window.location.reload()} className="retry-btn">
      <i className="fas fa-redo"></i>
      <span>ລອງໃໝ່</span>
    </button>
  </div>
);

const BlogPagination = ({ pagination, onPageChange }) => {
  const { currentPage, totalPages, hasNext, hasPrev } = pagination;
  
  const getPageNumbers = () => {
    const pages = [];
    const showPages = 5;
    let start = Math.max(1, currentPage - Math.floor(showPages / 2));
    let end = Math.min(totalPages, start + showPages - 1);
    
    if (end - start < showPages - 1) {
      start = Math.max(1, end - showPages + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="pagination-container">
      <button 
        onClick={() => onPageChange(currentPage - 1)} 
        disabled={!hasPrev}
        className={`pagination-btn pagination-prev ${!hasPrev ? 'disabled' : ''}`}
      >
        <i className="fas fa-chevron-left"></i>
        <span>ກ່ອນຫນ້າ</span>
      </button>
      
      <div className="pagination-numbers">
        {currentPage > 2 && (
          <>
            <button onClick={() => onPageChange(1)} className="pagination-number">
              1
            </button>
            {currentPage > 3 && <span className="pagination-dots">...</span>}
          </>
        )}
        
        {getPageNumbers().map(pageNum => (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`pagination-number ${currentPage === pageNum ? 'active' : ''}`}
          >
            {pageNum}
          </button>
        ))}
        
        {currentPage < totalPages - 1 && (
          <>
            {currentPage < totalPages - 2 && <span className="pagination-dots">...</span>}
            <button onClick={() => onPageChange(totalPages)} className="pagination-number">
              {totalPages}
            </button>
          </>
        )}
      </div>
      
      <button 
        onClick={() => onPageChange(currentPage + 1)} 
        disabled={!hasNext}
        className={`pagination-btn pagination-next ${!hasNext ? 'disabled' : ''}`}
      >
        <span>ຖັດໄປ</span>
        <i className="fas fa-chevron-right"></i>
      </button>
    </div>
  );
};

// Enhanced CSS Styles
const styles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  .blog-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem 2rem 4rem;
    font-family: "Noto Sans Lao", "Phetsarath OT", sans-serif;
    animation: fadeInUp 0.6s ease;
  }

  /* Header Styles */
  .blog-header {
    text-align: center;
    margin-bottom: 3rem;
    position: relative;
  }

  .header-content {
    position: relative;
    z-index: 1;
  }

  .header-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1.25rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 50px;
    font-size: 0.875rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
    position: relative;
  }

  .badge-pulse {
    width: 8px;
    height: 8px;
    background: white;
    border-radius: 50%;
    animation: pulse 2s ease-in-out infinite;
  }

  .page-title {
    font-size: 3.5rem;
    font-weight: 800;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    line-height: 1.2;
  }

  .title-icon {
    font-size: 3rem;
    animation: float 3s ease-in-out infinite;
  }

  .title-text {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .page-subtitle {
    color: #64748b;
    font-size: 1.125rem;
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
  }

  /* Filter Section */
  .blog-filters {
    margin-bottom: 3rem;
  }

  .search-wrapper {
    margin-bottom: 2rem;
    display: flex;
    justify-content: center;
  }

  .search-box {
    width: 100%;
    max-width: 700px;
    position: relative;
  }

  .search-icon-left {
    position: absolute;
    left: 1.5rem;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    font-size: 1.125rem;
    z-index: 1;
  }

  .search-input {
    width: 100%;
    padding: 1.25rem 3.5rem 1.25rem 3.5rem;
    border-radius: 16px;
    border: 2px solid #e2e8f0;
    font-size: 1rem;
    outline: none;
    transition: all 0.3s ease;
    background: white;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  }

  .search-input:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1), 0 8px 16px -4px rgba(102, 126, 234, 0.2);
  }

  .search-clear {
    position: absolute;
    right: 1.25rem;
    top: 50%;
    transform: translateY(-50%);
    background: #e2e8f0;
    border: none;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    color: #64748b;
  }

  .search-clear:hover {
    background: #cbd5e0;
    color: #1e293b;
  }

  .category-section {
    display: flex;
    justify-content: center;
  }

  .category-filter {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
    padding: 0.5rem;
  }

  .category-btn {
    padding: 0.875rem 1.75rem;
    border-radius: 14px;
    border: 2px solid #e2e8f0;
    background: white;
    color: #475569;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    gap: 0.625rem;
    position: relative;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }

  .category-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, transparent, rgba(255, 255, 255, 0.2));
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .category-btn:hover::before {
    opacity: 1;
  }

  .category-icon {
    font-size: 1.25rem;
    transition: transform 0.3s ease;
  }

  .category-btn:hover .category-icon {
    transform: scale(1.2) rotate(5deg);
  }

  .category-btn:hover {
    border-color: #667eea;
    color: #667eea;
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(102, 126, 234, 0.15);
  }

  .category-btn.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-color: transparent;
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
  }

  .active-indicator {
    position: absolute;
    bottom: -2px;
    left: 50%;
    transform: translateX(-50%);
    width: 20px;
    height: 3px;
    background: white;
    border-radius: 2px 2px 0 0;
  }

  /* Results Summary */
  .results-summary {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 2.5rem;
    flex-wrap: wrap;
  }

  .result-count {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #64748b;
    font-size: 1rem;
  }

  .result-count i {
    color: #667eea;
  }

  .result-count strong {
    color: #667eea;
    font-weight: 700;
  }

  .search-tag {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: #f1f5f9;
    border-radius: 50px;
    color: #475569;
    font-size: 0.875rem;
  }

  .search-tag button {
    background: none;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    font-size: 1.25rem;
    line-height: 1;
    padding: 0;
    margin-left: 0.25rem;
    transition: color 0.2s ease;
  }

  .search-tag button:hover {
    color: #475569;
  }

  .meta-divider {
    color: #cbd5e0;
  }

  /* Blog Grid */
  .blog-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 2rem;
    margin-bottom: 4rem;
  }

  @media (min-width: 768px) {
    .blog-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .blog-card {
    background: white;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid #f1f5f9;
    animation: fadeInUp 0.6s ease both;
  }

  .blog-card:hover {
    transform: translateY(-12px) scale(1.02);
    box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.15);
    border-color: #e2e8f0;
  }

  .blog-card-link {
    text-decoration: none;
    color: inherit;
    display: block;
  }

  .blog-image-wrapper {
    position: relative;
    overflow: hidden;
  }

  .blog-image {
    height: 260px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    overflow: hidden;
    position: relative;
  }

  .blog-image-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .blog-card:hover .blog-image-img {
    transform: scale(1.1);
  }

  .image-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.3) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .blog-card:hover .image-overlay {
    opacity: 1;
  }

  .blog-image-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-size: 5rem;
    background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%);
  }

  .category-badge {
    position: absolute;
    top: 1.25rem;
    left: 1.25rem;
    padding: 0.5rem 1rem;
    border-radius: 12px;
    font-size: 0.8125rem;
    font-weight: 700;
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    z-index: 1;
  }

  .badge-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    animation: pulse 2s ease-in-out infinite;
  }

  .blog-content {
    padding: 1.75rem;
  }

  .blog-meta {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.25rem;
    color: #94a3b8;
    font-size: 0.875rem;
    flex-wrap: wrap;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    transition: color 0.2s ease;
  }

  .meta-item:hover {
    color: #667eea;
  }

  .blog-title {
    margin: 0 0 1rem 0;
    font-size: 1.375rem;
    color: #1e293b;
    line-height: 1.4;
    font-weight: 700;
    transition: color 0.2s ease;
  }

  .blog-card:hover .blog-title {
    color: #667eea;
  }

  .blog-excerpt {
    font-size: 1rem;
    color: #64748b;
    line-height: 1.7;
    height: 5.1rem;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    margin-bottom: 1.5rem;
  }

  .blog-footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    `;

// Add styles to document head
const styleElement = document.createElement('style');
styleElement.textContent = styles;
document.head.appendChild(styleElement);

export default BlogList;