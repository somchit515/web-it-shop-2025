import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import AdminLayout from "../../layout/AdminLayout";

const ReportLayout = () => {
  return (
    <AdminLayout>
    <div className="d-flex" style={{ minHeight: "100vh" }}>

      {/* ===== Sidebar ===== */}
      <aside 
        className="p-3 border-end bg-white shadow-sm" 
        style={{ width: 260, fontFamily: "Noto Sans Lao, sans-serif" }}
      >
        <h5 className="mb-4 fw-bold text-primary">
          <span className="me-2">📊</span>Reports
        </h5>

        <ul className="nav flex-column gap-2">
          <li className="nav-item">
            <NavLink 
              to="/admin/reports" 
              end 
              className={({ isActive }) => 
                `nav-link d-flex align-items-center gap-2 px-3 py-2 rounded transition-colors ${ 
                  isActive 
                    ? 'bg-primary text-white shadow-sm' 
                    : 'text-dark hover:bg-gray-100'
                }`
              }
            >
              <span>🏠</span>
              <span>ພາບລວມລາຍງານ</span>
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink 
              to="/admin/reports/customers" 
              className={({ isActive }) => 
                `nav-link d-flex align-items-center gap-2 px-3 py-2 rounded transition-colors ${ 
                  isActive 
                    ? 'bg-primary text-white shadow-sm' 
                    : 'text-dark hover:bg-gray-100'
                }`
              }
            >
              <span>👥</span>
              <span>ລາຍງານລູກຄ້າ</span>
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink 
              to="/admin/reports/customers" 
              className={({ isActive }) => 
                `nav-link d-flex align-items-center gap-2 px-3 py-2 rounded transition-colors ${ 
                  isActive 
                    ? 'bg-primary text-white shadow-sm' 
                    : 'text-dark hover:bg-gray-100'
                }`
              }
            >
              <span>👥</span>
              <span>ລາຍງານການເງິນ</span>
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink 
              to="/admin/reports/sales" 
              className={({ isActive }) => 
                `nav-link d-flex align-items-center gap-2 px-3 py-2 rounded transition-colors ${ 
                  isActive 
                    ? 'bg-primary text-white shadow-sm' 
                    : 'text-dark hover:bg-gray-100'
                }`
              }
            >
              <span>💰</span>
              <span>ລາຍງານການຂາຍ</span>
            </NavLink>
          </li>
        </ul>
      </aside>

      {/* ===== Content ===== */}
      <main className="flex-grow-1 p-4 bg-light">
        <Outlet />
      </main>

    </div>
    </AdminLayout>
  );
};

export default ReportLayout;