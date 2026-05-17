import { NavLink } from "react-router-dom";

const ReportSidebar = () => {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;600;700&display=swap');

        .report-sidebar {
          width: 260px;
          flex-shrink: 0;
          background: linear-gradient(160deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 1.5rem 1rem;
          font-family: "Noto Sans Lao", "Phetsarath OT", sans-serif;
          box-shadow: 4px 0 24px rgba(102, 126, 234, 0.25);
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .sidebar-header {
          margin-bottom: 1.75rem;
          padding-bottom: 1.25rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }

        .sidebar-title {
          font-size: 1.15rem;
          font-weight: 700;
          margin: 0 0 0.25rem;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          color: white;
        }

        .sidebar-subtitle {
          font-size: 0.8rem;
          opacity: 0.75;
          margin: 0;
        }

        .sidebar-nav {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .sidebar-nav-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          color: rgba(255, 255, 255, 0.82);
          text-decoration: none;
          border-radius: 10px;
          transition: all 0.25s ease;
          font-weight: 500;
          font-size: 0.92rem;
          position: relative;
        }

        .sidebar-nav-link::before {
          content: '';
          position: absolute;
          left: 0;
          top: 20%;
          bottom: 20%;
          width: 3px;
          background: white;
          border-radius: 0 3px 3px 0;
          transform: scaleY(0);
          transition: transform 0.25s ease;
        }

        .sidebar-nav-link:hover {
          background: rgba(255, 255, 255, 0.15);
          color: white;
          transform: translateX(3px);
        }

        .sidebar-nav-link:hover::before {
          transform: scaleY(1);
        }

        .sidebar-nav-link.active {
          background: rgba(255, 255, 255, 0.22);
          color: white;
          font-weight: 600;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
        }

        .sidebar-nav-link.active::before {
          transform: scaleY(1);
        }

        .nav-icon {
          font-size: 1.1rem;
          width: 26px;
          text-align: center;
          flex-shrink: 0;
        }

        .nav-text {
          flex: 1;
        }

        .sidebar-divider {
          border: none;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          margin: 1.25rem 0;
        }

        .sidebar-section-label {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          opacity: 0.65;
          padding: 0 0.5rem;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .sidebar-footer {
          margin-top: auto;
          padding-top: 1.25rem;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
        }

        .footer-info {
          background: rgba(255, 255, 255, 0.1);
          padding: 0.75rem 1rem;
          border-radius: 10px;
          font-size: 0.8rem;
        }

        .footer-label {
          opacity: 0.65;
          font-size: 0.72rem;
          margin-bottom: 0.2rem;
        }

        .footer-value {
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        @media (max-width: 992px) {
          .report-sidebar {
            width: 100%;
            padding: 1rem;
          }

          .sidebar-nav {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          }

          .sidebar-footer {
            display: none;
          }
        }

        @media (max-width: 576px) {
          .sidebar-nav {
            grid-template-columns: 1fr 1fr;
          }

          .sidebar-nav-link {
            padding: 0.6rem 0.75rem;
            font-size: 0.85rem;
          }
        }
      `}</style>

      <div className="report-sidebar">
        <div className="sidebar-header">
          <h5 className="sidebar-title">
            <i className="fas fa-chart-bar"></i>
            <span>ລາຍງານລະບົບ</span>
          </h5>
          <p className="sidebar-subtitle">ພາບລວມ ແລະ ວິເຄາະຂໍ້ມູນ</p>
        </div>

        <ul className="sidebar-nav">
          <li>
            <NavLink
              to="/admin/reports"
              end
              className={({ isActive }) => `sidebar-nav-link ${isActive ? "active" : ""}`}
            >
              <i className="fas fa-home nav-icon"></i>
              <span className="nav-text">Dashboard</span>
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/admin/reports/customers"
              className={({ isActive }) => `sidebar-nav-link ${isActive ? "active" : ""}`}
            >
              <i className="fas fa-users nav-icon"></i>
              <span className="nav-text">ລາຍງານລູກຄ້າ</span>
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/admin/reports/sales"
              className={({ isActive }) => `sidebar-nav-link ${isActive ? "active" : ""}`}
            >
              <i className="fas fa-shopping-cart nav-icon"></i>
              <span className="nav-text">ລາຍງານການຂາຍ</span>
            </NavLink>
          </li>
        </ul>

        <hr className="sidebar-divider" />

        <div className="sidebar-section-label">
          <i className="fas fa-crown"></i>
          <span>Super Admin</span>
        </div>

        <ul className="sidebar-nav">
          <li>
            <NavLink
              to="/admin/reports/finance"
              className={({ isActive }) => `sidebar-nav-link ${isActive ? "active" : ""}`}
            >
              <i className="fas fa-chart-line nav-icon"></i>
              <span className="nav-text">ລາຍງານການເງິນ</span>
            </NavLink>
          </li>
        </ul>

        <div className="sidebar-footer">
          <div className="footer-info">
            <div className="footer-label">ອັບເດດ</div>
            <div className="footer-value">
              <i className="fas fa-clock"></i>
              <span>{new Date().toLocaleDateString("lo-LA")}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReportSidebar;
