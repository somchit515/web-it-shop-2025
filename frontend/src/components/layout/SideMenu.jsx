import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

function SideMenu({ menuItems, isLoading }) {
  const styles = `
    :root {
      --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      --primary: #667eea;
      --primary-dark: #764ba2;
      --text-dark: #1a202c;
      --text-muted: #718096;
      --bg-hover: rgba(102, 126, 234, 0.08);
      --bg-active: rgba(102, 126, 234, 0.12);
      --radius: 12px;
      --font: "Inter", "Noto Sans Lao", sans-serif;
    }

    .side-menu {
      font-family: var(--font);
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 16px;
    }

    .side-menu-title {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 0 14px 8px;
      margin-top: 8px;
    }

    .side-item {
      border-radius: var(--radius);
      padding: 14px 16px;
      font-weight: 600;
      font-size: 0.95rem;
      color: var(--text-dark);
      display: flex;
      align-items: center;
      gap: 14px;
      text-decoration: none;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: visible;
      white-space: nowrap;
    }

    .side-item:hover {
      background: var(--bg-hover);
      transform: translateX(4px);
      color: var(--primary);
    }

    .side-item.active {
      background: var(--primary-gradient);
      color: white;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
      transform: translateX(2px);
    }

    .side-item.active::before {
      content: "";
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 24px;
      border-radius: 0 4px 4px 0;
      background: white;
      opacity: 0.9;
    }

    .side-item i {
      font-size: 1.1rem;
      width: 24px;
      text-align: center;
      flex-shrink: 0;
      transition: transform 0.25s ease;
    }

    .side-item:hover i {
      transform: scale(1.1);
    }

    .side-item.active i {
      animation: iconPulse 0.5s ease;
    }

    @keyframes iconPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.15); }
    }

    .menu-text {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .menu-badge {
      margin-left: auto;
      font-size: 0.7rem;
      padding: 0.3em 0.65em;
      border-radius: 8px;
      font-weight: 700;
      flex-shrink: 0;
      min-width: 24px;
      text-align: center;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
      animation: badgePulse 2s ease-in-out infinite;
    }

    @keyframes badgePulse {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.05);
      }
    }

    .side-item.active .menu-badge {
      background: white !important;
      color: var(--primary) !important;
      animation: none;
    }

    .menu-badge.bg-danger {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
    }

    .menu-badge.bg-secondary {
      background: #e2e8f0;
      color: #64748b;
    }

    .menu-badge.bg-warning {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
    }

    .menu-badge.bg-success {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
    }

    .menu-description {
      font-size: 0.75rem;
      color: var(--text-muted);
      display: block;
      margin-top: 2px;
      font-weight: 400;
      opacity: 0.8;
    }

    .side-item.active .menu-description {
      color: rgba(255, 255, 255, 0.85);
    }

    .menu-skeleton {
      height: 48px;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
      border-radius: var(--radius);
      margin-bottom: 8px;
    }

    @keyframes loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    .menu-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
      margin: 12px 0;
    }

    /* Responsive */
    @media (max-width: 991.98px) {
      .side-menu {
        padding: 12px;
      }
      
      .side-item {
        padding: 12px 14px;
        font-size: 0.9rem;
      }
    }

    @media (max-width: 575.98px) {
      .side-menu {
        gap: 6px;
      }
      
      .side-item {
        padding: 10px 12px;
      }

      .menu-description {
        display: none;
      }
    }
  `;

  const location = useLocation();
  const [activeMenuItem, setActiveMenuItem] = useState(location.pathname);

  const handleMenuItemsClick = (url) => {
    setActiveMenuItem(url);
  };

  // จัดกลุ่มเมนู (ถ้าต้องการ)
  const mainMenuItems = menuItems?.filter(item => !item.name.includes("(SA)")) || [];
  const adminMenuItems = menuItems?.filter(item => item.name.includes("(SA)")) || [];

  return (
    <>
      <style>{styles}</style>
      
      <div className="side-menu">
        {isLoading ? (
          // Loading skeleton
          <>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="menu-skeleton"></div>
            ))}
          </>
        ) : (
          <>
            {/* Main Menu Items */}
            {mainMenuItems.map((item, index) => (
              <Link
                key={index}
                to={item.url}
                className={`side-item ${
                  activeMenuItem.includes(item.url) ? "active" : ""
                }`}
                onClick={() => handleMenuItemsClick(item.url)}
                aria-current={activeMenuItem.includes(item.url) ? "page" : undefined}
              >
                <i className={`${item.icon} fa-fw`}></i>
                <span className="menu-text">
                  {item.name}
                  {item.description && (
                    <small className="menu-description d-block">
                      {item.description}
                    </small>
                  )}
                </span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`menu-badge bg-${item.badgeType || "secondary"}`}>
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </Link>
            ))}

            {/* Divider และ Super Admin Menu (ถ้ามี) */}
            {adminMenuItems.length > 0 && (
              <>
                <div className="menu-divider"></div>
                <div className="side-menu-title">Super Admin</div>
                {adminMenuItems.map((item, index) => (
                  <Link
                    key={`admin-${index}`}
                    to={item.url}
                    className={`side-item ${
                      activeMenuItem.includes(item.url) ? "active" : ""
                    }`}
                    onClick={() => handleMenuItemsClick(item.url)}
                    aria-current={activeMenuItem.includes(item.url) ? "page" : undefined}
                  >
                    <i className={`${item.icon} fa-fw`}></i>
                    <span className="menu-text">
                      {item.name}
                      {item.description && (
                        <small className="menu-description d-block">
                          {item.description}
                        </small>
                      )}
                    </span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={`menu-badge bg-${item.badgeType || "secondary"}`}>
                        {item.badge > 99 ? "99+" : item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default SideMenu;