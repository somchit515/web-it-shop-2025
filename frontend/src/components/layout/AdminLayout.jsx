import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import SideMenu from "./SideMenu"; // Assuming SideMenu is a separate component

const superAdminMenuItems = [
  {
    name: "ເພີ່ມຜູ້ໃຊ້ (SA)",
    url: "/admin/users/new",
    icon: "fas fa-user-plus",
    description: "ສ້າງບັນຊີຜູ້ໃຊ້ໃໝ່",
  },
  {
    name: "ລາຍງານ (SA)",
    url: "/admin/reports",
    icon: "fas fa-chart-line",
    description: "ລາຍງານການເງິນ/ສິນຄ້າ",
  },
  {
    name: "ຜູ້ໃຊ້",
    url: "/admin/users",
    icon: "fas fa-users",
    description: "ຈັດການຜູ້ໃຊ້",
  },
];

/**
 * AdminLayout Component - Full Screen Version
 *
 * Design Philosophy: Modern, Minimalist, and Adaptive Dashboard (2025 Trends)
 * - Light Neutral Base with Accent Colors
 * - Soft Shadows and Rounded Corners
 * - Smooth Mobile Off-Canvas Sidebar Transition
 */

function AdminLayout({ children }) {
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingBlogCount, setPendingBlogCount] = useState(0);  
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Changed from isSidebarCollapsed
  const token = localStorage.getItem("token");

  const { user } = useSelector((state) => state.auth);
  const userRole = user?.role;

  // Existing useEffect for fetching pending orders
  useEffect(() => {
    let mounted = true;
    async function fetchPending() {
      try {
        const res = await fetch("/api/v1/admin/orders", {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok) return;
        const data = await res.json();
        const orders = data.orders || data;
        const pending = (orders || []).filter(
          (o) => o.paymentStatus === "AwaitingProof"
        ).length;
        if (mounted) setPendingCount(pending);
      } catch (err) {
        console.error("fetch pending orders failed", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    fetchPending();

    const interval = setInterval(fetchPending, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [token]);

  const menuItems = [
    {
      name: "Dashboard",
      url: "/admin/dashboard",
      icon: "fas fa-tachometer-alt",
      description: "ພາບລວມລະບົບ",
    },
    {
      name: "ເພີ່ມສິນຄ້າໃໝ່",
      url: "/admin/product/new",
      icon: "fas fa-plus-circle",
      description: "ເພີ່ມສິນຄ້າໃໝ່",
    },
    {
      name: "ລາຍການສິນຄ້າ",
      url: "/admin/products",
      icon: "fas fa-boxes",
      description: "ຈັດການສິນຄ້າ",
    },
    {
      name: "ອໍເດີສັ່ງຊື້",
      url: "/admin/orders",
      icon: "fas fa-shopping-cart",
      description: "ຈັດການອໍເດີ",
    },
    {
      name: "ຈັດການ Blog",
      url: "/admin/blog/dashboard", // ✅ ຕົງກັບ Route ທີ່ພວກເຮົາຕັ້ງໄວ້
      icon: "fas fa-blog",
      description: "ຈັດການບົດຄວາມ ແລະ ຂ່າວສານ",
       children: [
      {
        name: "ລາຍການບົດຄວາມ",
        url: "/admin/blog",
        icon: "fas fa-list",
      },
      {
        name: "ເພີ່ມບົດຄວາມ",
        url: "/admin/blog/new",
        icon: "fas fa-plus",
      },
      {
        name: "ໝວດໝູ່ Blog",
        url: "/admin/blog/categories",
        icon: "fas fa-folder",
      },
    ],


   
    },
    {
      name: "ຢືນຢັນການຊຳລະເງິນ",
      url: "/admin/verify-payments",
      icon: "fas fa-credit-card",
      description: "ຢືນຢັນການຊຳລະ",
      badge: pendingCount,
      badgeType: pendingCount > 0 ? "danger" : "secondary",
    },
    {
      name: "ສະຖານະການຈັດສົ່ງ",
      url: "/admin/shipments",
      icon: "fas fa-truck",
      description: "ອັບເດດສະຖານະການຈັດສົ່ງ",
    },
    {
      name: "ອໍເດີທີ່ສົ່ງສຳເລັດ",
      url: "/admin/completed-orders",
      icon: "fas fa-check-circle",
      description: "ລາຍການທີ່ຈັດສົ່ງເຖິງມືລູກຄ້າແລ້ວ",
    },

    {
      name: "ຄວາມຄິດເຫັນ",
      url: "/admin/reviews",
      icon: "fas fa-star",
      description: "ຈັດການຄຳຄິດເຫັນ",
    },
  ];

  const filteredMenuItems = React.useMemo(() => {
    if (!userRole) return [];
    let finalMenu = [...menuItems];
    if (userRole === "superAdmin") {
      finalMenu = [...finalMenu, ...superAdminMenuItems];
    }
    return finalMenu;
  }, [userRole, pendingCount, menuItems]);

  return (
    <>
      <style>{`
                /* Global Reset and Layout */
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                html, body, #root {
                    height: 100%;
                    width: 100%;
                    overflow: hidden;
                }

                /* 1. Main Layout - Light Theme (Minimalist) */
                .admin-layout {
                    /* Changed from dark gradient to light neutral base */
                    background-color:  #764ba2 ; 
                    height: 100vh;
                    width: 100vw;
                    position: fixed;
                    top: 0;
                    left: 0;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    transition: all 0.3s ease;
                }
                
               
                .admin-header {
                    background: rgba(255, 255, 255, 0.95) !important;
                    backdrop-filter: blur(10px);
                    border-bottom: 1px solid rgba(0, 0, 0, 0.05) !important;
                    /* Soft Shadow */
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05) !important; 
                    position: relative;
                    z-index: 100;
                    flex-shrink: 0;
                    padding: 1rem 2rem !important;
                }

                .admin-header h4 {
                    /* Keep the accent gradient for the title */
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    font-weight: 700;
                    font-size: 1.5rem;
                    margin: 0;
                }

                /* Menu Toggle Button - Rounded & Accent Color */
                .menu-toggle-btn {
                    width: 40px;
                    height: 40px;
                    border-radius: 12px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border: none;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
                }

                .menu-toggle-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
                }

                /* User Profile - Cleaned up hover effect */
                .user-profile {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 8px 16px;
                    background: transparent; /* Changed to transparent for cleaner look */
                    border-radius: 50px;
                    transition: all 0.3s ease;
                    cursor: pointer;
                }

                .user-profile:hover {
                    background: rgba(102, 126, 234, 0.05); /* Subtle hover effect */
                }

                .user-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 600;
                    font-size: 16px;
                    flex-shrink: 0;
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
                    transition: all 0.3s ease;
                }

                .user-avatar:hover {
                    transform: scale(1.05);
                    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
                }

                .user-info {
                    /* Display user info on desktop by default */
                    display: block; 
                }

                .user-name {
                    font-size: 14px;
                    font-weight: 600;
                    color: #2d3748;
                    margin: 0;
                    line-height: 1.2;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .user-role {
                    font-size: 11px;
                    color: #718096;
                    margin: 0;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    white-space: nowrap;
                }

                /* Main Content Container */
                .admin-main-container {
                    display: flex;
                    flex: 1;
                    overflow: hidden;
                    position: relative;
                    z-index: 1;
                }

                /* 3. Sidebar - Clean Look and Smooth Transition */
                .admin-sidebar-wrapper {
                    width: 400px;
                    height: 100%;
                    background: #ffffff; /* Solid white background */
                    box-shadow: 2px 0 20px rgba(0, 0, 0, 0.05); /* Softer shadow */
                    overflow-y: auto;
                    overflow-x: hidden;
                    flex-shrink: 0;
                    transition: all 0.3s ease;
                }

                .admin-sidebar-wrapper::-webkit-scrollbar {
                    width: 6px;
                }

                .admin-sidebar-wrapper::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.02);
                }

                .admin-sidebar-wrapper::-webkit-scrollbar-thumb {
                    background: rgba(102, 126, 234, 0.2); /* Lighter scrollbar */
                    border-radius: 3px;
                }
                
                /* Sidebar Card/Body cleanup */
                .sidebar-card {
                    border: none !important;
                    border-radius: 0 !important;
                    background: transparent !important;
                    box-shadow: none !important;
                    transition: all 0.3s ease;
                    overflow: visible !important;
                    height: 100%;
                }

                .sidebar-card .card-body {
                    overflow: visible !important;
                    padding: 1rem 0 !important; /* Adjusted padding for cleaner look */
                }

                /* Sidebar Menu Items - Modern Active State */
                .modern-sidebar {
                    overflow: visible !important;
                    padding: 0;
                    margin: 0;
                }

                .modern-sidebar .nav-link,
                .modern-sidebar a {
                    white-space: normal !important;
                    word-wrap: break-word !important;
                    overflow: visible !important;
                    text-overflow: clip !important;
                    line-height: 1.4 !important;
                    padding: 12px 20px !important; /* Increased horizontal padding */
                    display: flex !important;
                    align-items: center !important;
                    gap: 12px !important;
                    color: #4a5568; /* Darker text for better contrast */
                    text-decoration: none;
                    transition: all 0.2s ease;
                    border-left: none; /* Removed border-left for cleaner look */
                    border-radius: 0 25px 25px 0; /* Pill shape on the right side */
                    margin-right: 1rem;
                }

                .modern-sidebar .nav-link:hover,
                .modern-sidebar a:hover {
                    background: rgba(102, 126, 234, 0.08); /* Subtle hover background */
                }

                .modern-sidebar .nav-link.active,
                .modern-sidebar a.active {
                    /* More prominent active state (Pill Shape) */
                    background: linear-gradient(90deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.05) 100%);
                    font-weight: 600;
                    color: #667eea; /* Accent color for active text */
                    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1); /* Slight shadow for lift */
                }

                .modern-sidebar .nav-link i,
                .modern-sidebar a i {
                    flex-shrink: 0;
                    width: 20px;
                    text-align: center;
                    color: inherit;
                }

                .modern-sidebar .nav-link span,
                .modern-sidebar a span {
                    flex: 1;
                    min-width: 0;
                }

                /* 4. Content Area - Rounded Card */
                .admin-content-wrapper {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    background: transparent; /* Background is handled by admin-layout */
                    padding: 1.5rem; /* Added padding around the content card */
                }

                .content-card {
                    border: none !important;
                    /* Added Border Radius for modern look */
                    border-radius: 16px !important; 
                    background: transparent !important;
                    /* Soft Shadow for the main content card */
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05) !important; 
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }

                .content-card .card-body {
                    flex: 1;
                    overflow: auto;
                    padding: 2rem !important;
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(10px);
                }

                /* Scrollbar styles remain the same */
                .content-card .card-body::-webkit-scrollbar {
                    width: 8px;
                }

                .content-card .card-body::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.05);
                }

                .content-card .card-body::-webkit-scrollbar-thumb {
                    background: rgba(102, 126, 234, 0.3);
                    border-radius: 4px;
                }

                .content-card .card-body::-webkit-scrollbar-thumb:hover {
                    background: rgba(102, 126, 234, 0.5);
                }

                /* Loading Overlay - Keep the accent gradient */
                .loading-overlay {
                    background: linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%) !important;
                    backdrop-filter: blur(8px);
                }

                .spinner-border {
                    width: 3rem;
                    height: 3rem;
                    border-width: 0.3em;
                }

                /* 5. Mobile Responsiveness - Off-Canvas Drawer */
                @media (max-width: 991.98px) {
                    .admin-sidebar-wrapper {
                        position: fixed; /* Changed from absolute to fixed for better mobile experience */
                        left: 0;
                        top: 0;
                        height: 100%; /* Full height */
                        z-index: 1000; /* Higher z-index to cover content */
                        transform: translateX(-100%); /* Start off-screen */
                        box-shadow: 4px 0 20px rgba(0, 0, 0, 0.2); /* Stronger shadow when open */
                    }
                    
                    .admin-layout.sidebar-open .admin-sidebar-wrapper {
                        transform: translateX(0); /* Slide in */
                    }

                    /* Overlay to close sidebar when clicking outside */
                    .admin-layout.sidebar-open::after {
                        content: '';
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0, 0, 0, 0.5);
                        z-index: 999;
                        transition: opacity 0.3s ease;
                    }

                    .admin-content-wrapper {
                        width: 100%;
                        padding: 0; /* Remove padding on mobile to maximize space */
                    }
                    
                    .content-card {
                        border-radius: 0 !important; /* Full screen card on mobile */
                        box-shadow: none !important;
                    }
                    
                    .user-info {
                        display: none; /* Hide user info on small screens */
                    }
                }

                @media (max-width: 575.98px) {
                    .admin-header h4 {
                        font-size: 1.1rem;
                    }

                    .admin-header h4 i {
                        display: none;
                    }
                    
                    .user-avatar {
                        width: 36px;
                        height: 36px;
                        font-size: 14px;
                    }
                }

                /* Animations */
                .fade-in {
                    animation: fadeIn 0.5s ease-in;
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .notification-badge {
                    position: relative;
                    display: inline-block;
                }

                .notification-badge::after {
                    content: '';
                    position: absolute;
                    top: -2px;
                    right: -2px;
                    width: 8px;
                    height: 8px;
                    background: #ef4444;
                    border-radius: 50%;
                    border: 2px solid white;
                    animation: pulse 2s infinite;
                }

                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 0.5;
                        transform: scale(1.1);
                    }
                }
            `}</style>

      <div className={`admin-layout ${isSidebarOpen ? "sidebar-open" : ""}`}>
        {/* Enhanced Header */}
        <div className="admin-header">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <button
                className="menu-toggle-btn d-lg-none"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                {/* Changed icon logic for better UX on mobile */}
                <i className={`fas fa-${isSidebarOpen ? "times" : "bars"}`}></i>
              </button>

              <h4 className="mb-0">
                <i className="fas fa-shield-alt me-2"></i>
                Admin Dashboard
              </h4>
            </div>

            <div className="user-profile">
              <div className="user-avatar">
                {user?.name?.charAt(0)?.toUpperCase() || "A"}
              </div>
              <div className="user-info d-none d-sm-block">
                {" "}
                {/* Ensure user info is hidden on smallest screens */}
                <p className="user-name">{user?.name || "Admin User"}</p>
                <p className="user-role">{userRole || "User"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Container */}
        <div className="admin-main-container">
          {/* Sidebar */}
          <div
            className={`admin-sidebar-wrapper fade-in`}
            onClick={() => {
              // Close sidebar when clicking on a menu item on mobile
              if (window.innerWidth < 992) {
                setIsSidebarOpen(false);
              }
            }}
          >
            <div className="sidebar-card card">
              <div className="card-body">
                <SideMenu
                  menuItems={filteredMenuItems}
                  isLoading={isLoading}
                  className="modern-sidebar"
                />
              </div>
            </div>
          </div>

          {/* Mobile Overlay to close sidebar */}
          {isSidebarOpen && (
            <div
              className="d-lg-none"
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 999,
                cursor: "pointer",
              }}
              onClick={() => setIsSidebarOpen(false)}
            ></div>
          )}

          {/* Main Content Area */}
          <div className="admin-content-wrapper fade-in">
            <div className="main-content" style={{ height: "100%" }}>
              <div className="content-card card">
                {/* Note: The children component should implement a Modular/Widget-Based Layout inside here */}
                <div className="card-body">{children}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Loading Overlay */}
        {isLoading && (
          <div
            className="loading-overlay position-fixed top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center"
            style={{ zIndex: 9999 }}
          >
            <div className="spinner-border text-white mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-white fw-semibold">ກຳລັງໂຫລດຂໍ້ມູນ...</p>
          </div>
        )}
      </div>
    </>
  );
}

export default AdminLayout;
