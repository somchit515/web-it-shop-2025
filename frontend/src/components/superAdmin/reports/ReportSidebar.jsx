import { NavLink } from "react-router-dom";

const ReportSidebar = () => {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;600;700&display=swap');

        .report-sidebar {
          width: 280px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 1.5rem;
          min-height: calc(100vh - 80px);
          font-family: "Noto Sans Lao", "Phetsarath OT", sans-serif;
          box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
          position: sticky;
          top: 80px;
        }

        .sidebar-header {
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid rgba(255, 255, 255, 0.2);
        }

        .sidebar-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: white;
        }

        .sidebar-title-icon {
          font-size: 1.5rem;
        }

        .sidebar-subtitle {
          font-size: 0.85rem;
          opacity: 0.8;
          margin-top: 0.5rem;
          margin-bottom: 0;
        }

        .sidebar-nav {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .sidebar-nav-item {
          margin: 0;
        }

        .sidebar-nav-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem 1rem;
          color: rgba(255, 255, 255, 0.85);
          text-decoration: none;
          border-radius: 12px;
          transition: all 0.3s ease;
          font-weight: 500;
          font-size: 0.95rem;
          position: relative;
          overflow: hidden;
        }

        .sidebar-nav-link::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: white;
          transform: scaleY(0);
          transition: transform 0.3s ease;
        }

        .sidebar-nav-link:hover {
          background: rgba(255, 255, 255, 0.15);
          color: white;
          transform: translateX(4px);
        }

        .sidebar-nav-link:hover::before {
          transform: scaleY(1);
        }

        .sidebar-nav-link.active {
          background: rgba(255, 255, 255, 0.25);
          color: white;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .sidebar-nav-link.active::before {
          transform: scaleY(1);
        }

        .nav-icon {
          font-size: 1.25rem;
          width: 28px;
          text-align: center;
          flex-shrink: 0;
        }

        .nav-text {
          flex: 1;
        }

        .sidebar-divider {
          border: none;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          margin: 1.5rem 0;
        }

        .sidebar-section-title {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          opacity: 0.7;
          margin: 1rem 0 0.75rem 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .section-badge {
          background: rgba(255, 255, 255, 0.2);
          padding: 0.25rem 0.6rem;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 600;
        }

        .sidebar-footer {
          margin-top: auto;
          padding-top: 1.5rem;
          border-top: 2px solid rgba(255, 255, 255, 0.2);
        }

        .footer-info {
          background: rgba(255, 255, 255, 0.1);
          padding: 1rem;
          border-radius: 12px;
          font-size: 0.85rem;
        }

        .footer-label {
          opacity: 0.7;
          font-size: 0.75rem;
          margin-bottom: 0.25rem;
        }

        .footer-value {
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        /* Badge on nav items */
        .nav-badge {
          background: rgba(239, 68, 68, 0.9);
          color: white;
          font-size: 0.7rem;
          padding: 0.2rem 0.5rem;
          border-radius: 10px;
          font-weight: 700;
          margin-left: auto;
        }

        .nav-badge.success {
          background: rgba(16, 185, 129, 0.9);
        }

        .nav-badge.warning {
          background: rgba(245, 158, 11, 0.9);
        }

        /* Responsive */
        @media (max-width: 992px) {
          .report-sidebar {
            width: 100%;
            min-height: auto;
            position: relative;
            top: 0;
          }

          .sidebar-nav {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 0.75rem;
          }
        }

        @media (max-width: 768px) {
          .report-sidebar {
            padding: 1rem;
          }

          .sidebar-nav {
            grid-template-columns: 1fr;
          }

          .sidebar-nav-link {
            padding: 0.75rem;
            font-size: 0.9rem;
          }

          .nav-icon {
            font-size: 1.1rem;
          }
        }

        /* Tooltip for truncated text */
        .nav-text[title] {
          cursor: help;
        }

        /* Smooth entrance animation */
        .report-sidebar {
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* Active indicator pulse */
        .sidebar-nav-link.active {
          animation: activeGlow 2s ease-in-out infinite;
        }

        @keyframes activeGlow {
          0%, 100% {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }
          50% {
            box-shadow: 0 4px 20px rgba(255, 255, 255, 0.2);
          }
        }
      `}</style>

      <div className="report-sidebar">
        {/* Header */}
        <div className="sidebar-header">
          <h5 className="sidebar-title">
            <span className="sidebar-title-icon">📊</span>
            <span>ລາຍງານລະບົບ</span>
          </h5>
          <p className="sidebar-subtitle">ພາບລວມ ແລະ ວິເຄາະຂໍ້ມູນ</p>
        </div>

        {/* Main Navigation */}
        <ul className="sidebar-nav">
          <li className="sidebar-nav-item">
            <NavLink 
              to="/admin/reports"
              end
              className={({ isActive }) => 
                `sidebar-nav-link ${isActive ? 'active' : ''}`
              }
            >
              <span className="nav-icon">🏠</span>
              <span className="nav-text">Dashboard</span>
            </NavLink>
          </li>

          <li className="sidebar-nav-item">
            <NavLink 
              to="/admin/reports/customers"
              className={({ isActive }) => 
                `sidebar-nav-link ${isActive ? 'active' : ''}`
              }
            >
              <span className="nav-icon">👥</span>
              <span className="nav-text">ລາຍງານລູກຄ້າ</span>
              <span className="nav-badge success">ໃໝ່</span>
            </NavLink>
          </li>

          <li className="sidebar-nav-item">
            <NavLink 
              to="/admin/reports/sales"
              className={({ isActive }) => 
                `sidebar-nav-link ${isActive ? 'active' : ''}`
              }
            >
              <span className="nav-icon">💰</span>
              <span className="nav-text">ລາຍງານການຂາຍ</span>
            </NavLink>
          </li>

          <li className="sidebar-nav-item">
            <NavLink 
              to="/admin/reports/orders"
              className={({ isActive }) => 
                `sidebar-nav-link ${isActive ? 'active' : ''}`
              }
            >
              <span className="nav-icon">📦</span>
              <span className="nav-text">ລາຍງານອໍເດີ</span>
              <span className="nav-badge warning">12</span>
            </NavLink>
          </li>
        </ul>

        {/* Divider */}
        <hr className="sidebar-divider" />

        {/* Super Admin Section */}
        <div className="sidebar-section-title">
          <i className="fas fa-crown"></i>
          <span>Super Admin</span>
          <span className="section-badge">SA</span>
        </div>

        <ul className="sidebar-nav">
          <li className="sidebar-nav-item">
            <NavLink 
              to="/admin/reports/finance"
              className={({ isActive }) => 
                `sidebar-nav-link ${isActive ? 'active' : ''}`
              }
            >
              <span className="nav-icon">📈</span>
              <span className="nav-text">ລາຍງານການເງິນ</span>
            </NavLink>
          </li>

          <li className="sidebar-nav-item">
            <NavLink 
              to="/admin/reports/analytics"
              className={({ isActive }) => 
                `sidebar-nav-link ${isActive ? 'active' : ''}`
              }
            >
              <span className="nav-icon">📊</span>
              <span className="nav-text">ການວິເຄາະຂັ້ນສູງ</span>
            </NavLink>
          </li>

          <li className="sidebar-nav-item">
            <NavLink 
              to="/admin/reports/audit"
              className={({ isActive }) => 
                `sidebar-nav-link ${isActive ? 'active' : ''}`
              }
            >
              <span className="nav-icon">🔍</span>
              <span className="nav-text">Audit Logs</span>
            </NavLink>
          </li>
        </ul>

        {/* Footer Info */}
        <div className="sidebar-footer">
          <div className="footer-info">
            <div className="footer-label">ອັບເດດລ່າສຸດ</div>
            <div className="footer-value">
              <i className="fas fa-clock"></i>
              <span>{new Date().toLocaleDateString('lo-LA')}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReportSidebar;