import React from 'react';
import { Link } from 'react-router-dom';
import { useGetBlogsQuery } from '../redux/api/blogApi';

const BlogFooter = () => {
  const { data: recentBlogs } = useGetBlogsQuery({ limit: 3, sort: '-createdAt' });

  const socialLinks = [
    { name: 'Facebook', icon: 'fab fa-facebook-f', url: '#', color: '#1877f2' },
    { name: 'YouTube', icon: 'fab fa-youtube', url: '#', color: '#ff0000' },
    { name: 'TikTok', icon: 'fab fa-tiktok', url: '#', color: '#000000' },
    { name: 'Instagram', icon: 'fab fa-instagram', url: '#', color: '#e4405f' }
  ];

  const quickLinks = [
    { name: 'ຫນ້າຫຼັກ', url: '/blogs', icon: 'fas fa-home' },
    { name: 'ບົດຄວາມຍອດນິຍົມ', url: '/blogs/popular', icon: 'fas fa-fire' },
    { name: 'ຄົ້ນຫາ', url: '/blogs/search', icon: 'fas fa-search' },
    { name: 'ກ່ຽວກັບພວກເຮົາ', url: '/about', icon: 'fas fa-info-circle' }
  ];

  const categories = [
    { id: 'tech', name: 'ເທັກໂນໂລຢີ', icon: '💻', count: 15 },
    { id: 'review', name: 'ລີວິວ', icon: '⭐', count: 8 },
    { id: 'guide', name: 'ຄູ່ມື', icon: '📖', count: 12 },
    { id: 'news', name: 'ຂ່າວສານ', icon: '📰', count: 6 }
  ];

  const contactInfo = [
    { icon: 'fas fa-envelope', text: 'info@ithubb.la', href: 'mailto:info@ithubb.la' },
    { icon: 'fas fa-phone', text: '+856 20 54 123 456', href: 'tel:+8562054123456' },
    { icon: 'fas fa-map-marker-alt', text: 'ນະຄອນຫຼວງວຽງຈັນ, ສປປ ລາວ', href: '#' }
  ];

  return (
    <>
      <style>{`
        .blog-footer {
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          color: #e2e8f0;
          padding: 4rem 0 2rem;
          margin-top: 4rem;
          position: relative;
          overflow: hidden;
        }

        .blog-footer::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 30%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(118, 75, 162, 0.1) 0%, transparent 50%);
        }

        .container {
          max-width: 100%;
          margin: 0 auto;
          padding: 0 1.5rem;
          position: relative;
          z-index: 1;
        }

        .footer-content {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 3rem;
          margin-bottom: 3rem;
        }

        .footer-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .footer-section h3 {
          color: white;
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .footer-section p {
          color: #cbd5e1;
          line-height: 1.6;
          margin: 0;
        }

        .social-links {
          display: flex;
          gap: 1rem;
        }

        .social-link {
          width: 45px;
          height: 45px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          text-decoration: none;
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .social-link:hover {
          transform: translateY(-3px) scale(1.1);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        }

        .footer-links {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .footer-links li {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .footer-links a {
          color: #cbd5e1;
          text-decoration: none;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.25rem 0;
        }

        .footer-links a:hover {
          color: white;
          transform: translateX(5px);
        }

        .recent-blogs {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .recent-blogs li {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .recent-blogs a {
          color: #cbd5e1;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.3s ease;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .recent-blogs a:hover {
          color: white;
        }

        .blog-date {
          font-size: 0.8rem;
          color: #94a3b8;
        }

        .contact-info {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #cbd5e1;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .contact-item:hover {
          color: white;
        }

        .contact-item i {
          width: 20px;
          text-align: center;
        }

        .newsletter-section {
          background: rgba(255, 255, 255, 0.05);
          padding: 1.5rem;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .newsletter-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .newsletter-input {
          padding: 0.75rem 1rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .newsletter-input::placeholder {
          color: #94a3b8;
        }

        .newsletter-input:focus {
          outline: none;
          border-color: #667eea;
          background: rgba(255, 255, 255, 0.15);
        }

        .newsletter-btn {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .newsletter-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .stat-item {
          background: rgba(255, 255, 255, 0.05);
          padding: 1rem;
          border-radius: 12px;
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .stat-number {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          display: block;
        }

        .stat-label {
          font-size: 0.8rem;
          color: #94a3b8;
          margin-top: 0.25rem;
        }

        .footer-bottom {
          text-align: center;
          padding-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          font-size: 0.9rem;
        }

        .footer-bottom p {
          margin: 0;
        }

        .footer-links-row {
          display: flex;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .footer-link-group {
          flex: 1;
          min-width: 200px;
        }

        .footer-link-group h4 {
          color: white;
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 1rem 0;
        }

        @media (max-width: 768px) {
          .blog-footer {
            padding: 3rem 0 1.5rem;
          }

          .footer-content {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .footer-links-row {
            flex-direction: column;
            gap: 1.5rem;
          }

          .social-links {
            justify-content: center;
          }

          .stats-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        @media (max-width: 480px) {
          .container {
            padding: 0 1rem;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .trending-blogs {
            flex-direction: column;
            gap: 0.75rem;
          }
        }
      `}</style>

      <footer className="blog-footer">
        <div className="container">
          <div className="footer-content">
            {/* About Section */}
            <div className="footer-section">
              <h3>
                <span>📝</span>
                <span>IT HUBB Blog</span>
              </h3>
              <p>
                ບົດຄວາມເທັກໂນໂລຢີ ແລະ ຂ່າວສານລ່າສຸດ ຈາກ IT HUBB. 
                ຮຽນຮູ້ ແລະ ອັບເດດເທັນໂນໂລຢີໃໝ່ໆ ພ້ອມທັງຄູ່ມືການໃຊ້ງານທີ່ມີປະໂຫຍດ
              </p>
              <div className="social-links">
                {socialLinks.map(social => (
                  <a 
                    key={social.name}
                    href={social.url} 
                    className="social-link" 
                    title={social.name}
                    style={{ background: social.color + '20' }}
                  >
                    <i className={social.icon}></i>
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-section">
              <h3>
                <span>🔗</span>
                <span>ລິ້ງດ່ວນ</span>
              </h3>
              <ul className="footer-links">
                {quickLinks.map(link => (
                  <li key={link.name}>
                    <Link to={link.url}>
                      <i className={link.icon}></i>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories with Stats */}
            <div className="footer-section">
              <h3>
                <span>📊</span>
                <span>ຫມວດໝູ່ຍອດນິຍົມ</span>
              </h3>
              <div className="stats-grid">
                {categories.map(cat => (
                  <Link key={cat.id} to={`/blogs/category/${cat.id}`} className="stat-item">
                    <span style={{ fontSize: '1.2rem' }}>{cat.icon}</span>
                    <span className="stat-number">{cat.count}</span>
                    <span className="stat-label">{cat.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Blogs */}
            <div className="footer-section">
              <h3>
                <span>🆕</span>
                <span>ບົດຄວາມຫຼ້າສຸດ</span>
              </h3>
              <ul className="recent-blogs">
                {recentBlogs?.blogs?.slice(0, 3).map(blog => (
                  <li key={blog._id}>
                    <Link to={`/blog/${blog.slug || blog._id}`}>
                      {blog.title}
                    </Link>
                    <span className="blog-date">
                      {new Date(blog.createdAt).toLocaleDateString('lo-LA')}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact & Newsletter */}
            <div className="footer-section">
              <h3>
                <span>📞</span>
                <span>ຕິດຕໍ່ພວກເຮົາ</span>
              </h3>
              <div className="contact-info">
                {contactInfo.map(contact => (
                  <a 
                    key={contact.href}
                    href={contact.href} 
                    className="contact-item"
                  >
                    <i className={contact.icon}></i>
                    <span>{contact.text}</span>
                  </a>
                ))}
              </div>

              <div className="newsletter-section">
                <h4>
                  <span>📧</span>
                  <span>ຕິດຕາມພວກເຮົາ</span>
                </h4>
                <form className="newsletter-form">
                  <input 
                    type="email" 
                    placeholder="ອີເມວຂອງທ່ານ..." 
                    className="newsletter-input"
                  />
                  <button type="submit" className="newsletter-btn">
                    ຕິດຕາມ
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>
              <i className="far fa-copyright"></i>
              2024 IT HUBB Blog. ສະກັດສະທິງທຸກສິດ.
            </p>
            <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
              ພັດທະນາໂດຍທີມງານ IT HUBB ສປປ ລາວ
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default BlogFooter;