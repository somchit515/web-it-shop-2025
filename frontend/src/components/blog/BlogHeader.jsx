import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useGetTrendingBlogsQuery } from '../redux/api/blogApi';
import { useSelector } from 'react-redux';

const BlogHeader = () => {
  const location = useLocation();
  const { user } = useSelector(state => state.auth);
  const { data: trendingBlogs } = useGetTrendingBlogsQuery();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const categories = [
    { id: 'all', name: 'ທັງໝົດ', icon: '📚' },
    { id: 'tech', name: 'ເທັກໂນໂລຢີ', icon: '💻' },
    { id: 'review', name: 'ລີວິວ', icon: '⭐' },
    { id: 'guide', name: 'ຄູ່ມື', icon: '📖' },
    { id: 'news', name: 'ຂ່າວສານ', icon: '📰' }
  ];

  const isActive = (path) => {
    if (path === '/blogs') return location.pathname === '/blogs';
    return location.pathname.includes(path);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        :root {
          --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          --accent-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          --glass-bg: rgba(255, 255, 255, 0.85);
          --glass-border: rgba(255, 255, 255, 0.2);
          --shadow-primary: 0 8px 32px rgba(102, 126, 234, 0.15);
          --shadow-secondary: 0 4px 20px rgba(0, 0, 0, 0.08);
          --text-primary: #1a202c;
          --text-secondary: #4a5568;
          --text-muted: #718096;
        }

        .blog-header {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .blog-header.scrolled {
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--glass-border);
          box-shadow: var(--shadow-primary);
        }

        .blog-header:not(.scrolled) {
          background: transparent;
        }

        .header-top {
          padding: 1.5rem 0;
          transition: all 0.3s ease;
        }

        .blog-header.scrolled .header-top {
          padding: 1rem 0;
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
        }

        .logo {
          font-size: 2rem;
          font-weight: 800;
          text-decoration: none;
          background: var(--primary-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .logo::before {
          content: '';
          position: absolute;
          top: -10px;
          left: -10px;
          right: -10px;
          bottom: -10px;
          background: var(--primary-gradient);
          border-radius: 20px;
          opacity: 0;
          filter: blur(20px);
          transition: opacity 0.3s ease;
          z-index: -1;
        }

        .logo:hover::before {
          opacity: 0.3;
        }

        .logo:hover {
          transform: translateY(-3px) scale(1.05);
        }

        .logo-icon {
          font-size: 2.5rem;
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .main-nav {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .nav-link {
          text-decoration: none;
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 0.95rem;
          padding: 0.875rem 1.75rem;
          border-radius: 50px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .nav-link::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: var(--primary-gradient);
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: -1;
        }

        .nav-link:hover {
          color: white;
          transform: translateY(-2px);
          box-shadow: var(--shadow-primary);
        }

        .nav-link:hover::before {
          opacity: 1;
        }

        .nav-link.active {
          color: white;
          background: var(--primary-gradient);
          box-shadow: var(--shadow-primary);
        }

        .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: -5px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid #667eea;
          animation: bounce 2s infinite;
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateX(-50%) translateY(0); }
          40% { transform: translateX(-50%) translateY(-3px); }
          60% { transform: translateX(-50%) translateY(-2px); }
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .action-btn {
          padding: 0.875rem;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          color: var(--text-secondary);
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid rgba(255, 255, 255, 0.3);
          position: relative;
          overflow: hidden;
        }

        .action-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: var(--primary-gradient);
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: -1;
        }

        .action-btn:hover {
          color: white;
          transform: translateY(-3px) scale(1.1);
          box-shadow: var(--shadow-primary);
        }

        .action-btn:hover::before {
          opacity: 1;
        }

        .admin-btn {
          padding: 0.875rem 1.5rem;
          border-radius: 25px;
          font-weight: 600;
          gap: 0.75rem;
          background: var(--secondary-gradient);
          color: white;
          border: none;
          cursor: pointer;
        }

        .admin-btn:hover {
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 12px 24px rgba(240, 147, 251, 0.4);
        }

        .header-bottom {
          background: rgba(248, 250, 252, 0.8);
          backdrop-filter: blur(10px);
          padding: 1.25rem 0;
          border-top: 1px solid rgba(255, 255, 255, 0.3);
        }

        .trending-section {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .trending-label {
          background: var(--secondary-gradient);
          color: white;
          font-weight: 700;
          font-size: 0.9rem;
          padding: 0.75rem 1.5rem;
          border-radius: 25px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(240, 147, 251, 0.3);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { box-shadow: 0 4px 12px rgba(240, 147, 251, 0.3); }
          50% { box-shadow: 0 4px 20px rgba(240, 147, 251, 0.6); }
          100% { box-shadow: 0 4px 12px rgba(240, 147, 251, 0.3); }
        }

        .trending-blogs {
          display: flex;
          gap: 1rem;
          overflow-x: auto;
          flex: 1;
          padding: 0.5rem 0;
        }

        .trending-blogs::-webkit-scrollbar {
          height: 6px;
        }

        .trending-blogs::-webkit-scrollbar-track {
          background: rgba(241, 241, 241, 0.5);
          border-radius: 3px;
        }

        .trending-blogs::-webkit-scrollbar-thumb {
          background: var(--accent-gradient);
          border-radius: 3px;
        }

        .trending-item {
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
          padding: 0.75rem 1.25rem;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border-radius: 25px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          position: relative;
          overflow: hidden;
        }

        .trending-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: var(--accent-gradient);
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: -1;
        }

        .trending-item:hover {
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(79, 172, 254, 0.3);
        }

        .trending-item:hover::before {
          opacity: 1;
        }

        .mobile-menu-toggle {
          display: none;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          padding: 0.875rem;
          font-size: 1.25rem;
          cursor: pointer;
          transition: all 0.3s ease;
          color: var(--text-secondary);
        }

        .mobile-menu-toggle:hover {
          background: var(--primary-gradient);
          color: white;
          transform: scale(1.1);
        }

        .mobile-menu {
          display: none;
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          border-top: 1px solid var(--glass-border);
          padding: 1rem;
          box-shadow: var(--shadow-secondary);
        }

        .mobile-menu.open {
          display: block;
          animation: slideDown 0.3s ease;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .breadcrumb {
          padding: 1rem 0;
          margin-bottom: 1rem;
        }

        .breadcrumb-list {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          list-style: none;
          margin: 0;
          padding: 0;
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .breadcrumb-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .breadcrumb-link {
          color: #667eea;
          text-decoration: none;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .breadcrumb-link:hover {
          color: #764ba2;
          transform: translateX(2px);
        }

        .breadcrumb-current {
          color: var(--text-primary);
          font-weight: 600;
        }

        .notification-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: var(--secondary-gradient);
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 700;
          animation: bounce 1s infinite;
        }

        @media (max-width: 1024px) {
          .container {
            padding: 0 1.5rem;
          }
          
          .nav-link {
            padding: 0.75rem 1.25rem;
            font-size: 0.9rem;
          }
        }

        @media (max-width: 768px) {
          .header-content {
            flex-wrap: wrap;
            gap: 1rem;
          }

          .main-nav {
            display: none;
          }

          .mobile-menu-toggle {
            display: block;
          }

          .logo {
            font-size: 1.75rem;
          }

          .header-actions {
            margin-left: auto;
          }

          .trending-section {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .trending-blogs {
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .container {
            padding: 0 1rem;
          }

          .logo {
            font-size: 1.5rem;
          }

          .logo-icon {
            font-size: 2rem;
          }

          .header-actions {
            gap: 0.5rem;
          }

          .action-btn {
            padding: 0.75rem;
          }

          .admin-btn {
            padding: 0.75rem 1.25rem;
          }
        }
      `}</style>

      <header className={`blog-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-top">
          <div className="container">
            <div className="header-content">
              <Link to="/blogs" className="logo">
                <span className="logo-icon">📝</span>
                <span>IT HUBB Blog</span>
              </Link>
              
              <nav className="main-nav">
                <Link to="/blogs" className={`nav-link ${isActive('/blogs') ? 'active' : ''}`}>
                  <i className="fas fa-home"></i>
                  ຫນ້າຫຼັກ
                </Link>
                <Link to="/blogs/category/tech" className={`nav-link ${isActive('/tech') ? 'active' : ''}`}>
                  <i className="fas fa-microchip"></i>
                  ເທັກໂນໂລຢີ
                </Link>
                <Link to="/blogs/category/review" className={`nav-link ${isActive('/review') ? 'active' : ''}`}>
                  <i className="fas fa-star"></i>
                  ລີວິວ
                </Link>
                <Link to="/blogs/category/guide" className={`nav-link ${isActive('/guide') ? 'active' : ''}`}>
                  <i className="fas fa-book"></i>
                  ຄູ່ມື
                </Link>
                <Link to="/blogs/category/news" className={`nav-link ${isActive('/news') ? 'active' : ''}`}>
                  <i className="fas fa-newspaper"></i>
                  ຂ່າວສານ
                </Link>
              </nav>

              <div className="header-actions">
                <Link to="/blogs/search" className="action-btn" title="ຄົ້ນຫາ">
                  <i className="fas fa-search"></i>
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin/blogs" className="action-btn admin-btn" title="ຈັດການ">
                    <i className="fas fa-cog"></i>
                    <span className="admin-text">ຈັດການ</span>
                  </Link>
                )}
                <button 
                  className="mobile-menu-toggle" 
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  title="ເມນູ"
                >
                  <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <nav className="mobile-nav">
            <Link to="/blogs" className={`nav-link ${isActive('/blogs') ? 'active' : ''}`}>
              <i className="fas fa-home"></i>
              ຫນ້າຫຼັກ
            </Link>
            <Link to="/blogs/category/tech" className={`nav-link ${isActive('/tech') ? 'active' : ''}`}>
              <i className="fas fa-microchip"></i>
              ເທັກໂນໂລຢີ
            </Link>
            <Link to="/blogs/category/review" className={`nav-link ${isActive('/review') ? 'active' : ''}`}>
              <i className="fas fa-star"></i>
              ລີວິວ
            </Link>
            <Link to="/blogs/category/guide" className={`nav-link ${isActive('/guide') ? 'active' : ''}`}>
              <i className="fas fa-book"></i>
              ຄູ່ມື
            </Link>
            <Link to="/blogs/category/news" className={`nav-link ${isActive('/news') ? 'active' : ''}`}>
              <i className="fas fa-newspaper"></i>
              ຂ່າວສານ
            </Link>
          </nav>
        </div>

        <div className="header-bottom">
          <div className="container">
            <div className="trending-section">
              <span className="trending-label">
                <span>🔥</span>
                <span>ຍອດນິຍົມ:</span>
              </span>
              <div className="trending-blogs">
                {trendingBlogs?.slice(0, 8).map((blog, index) => (
                  <Link 
                    key={blog._id} 
                    to={`/blogs/${blog.slug || blog._id}`} 
                    className="trending-item"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <span>📄</span>
                    <span>{blog.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default BlogHeader;