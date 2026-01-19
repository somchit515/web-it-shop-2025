import React, { useEffect } from "react";
import toast from "react-hot-toast";
import { useGetBlogsQuery } from "../redux/api/blogApi";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";
import AdminLayout from "../layout/AdminLayout";

export default function BlogDashboardOverview() {
  // ດຶງຂໍ້ມູນບົດຄວາມທັງໝົດມາເພື່ອຄຳນວນສະຖິຕິ
  const {
    data: blogData,
    isLoading,
    error,
  } = useGetBlogsQuery({ limit: 1000 });

  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message || "ບໍ່ສາມາດດຶງຂໍ້ມູນບລັອກ");
    }
  }, [error]);

  if (isLoading)
    return (
      <AdminLayout>
        <Loader />
      </AdminLayout>
    );

  // --- ຄຳນວນສະຖິຕິບລັອກ ---
  const totalBlogs = blogData?.blogs?.length || 0;
  const publishedBlogs =
    blogData?.blogs?.filter((b) => b.isPublished).length || 0;
  const draftBlogs = totalBlogs - publishedBlogs;
  const totalViews =
    blogData?.blogs?.reduce((acc, curr) => acc + (curr.views || 0), 0) || 0;
  const totalComments =
    blogData?.blogs?.reduce(
      (acc, curr) => acc + (curr.comments?.length || 0),
      0
    ) || 0;

  // คำนวณค่าเฉลี่ย
  const avgViews = totalBlogs > 0 ? Math.round(totalViews / totalBlogs) : 0;
  const engagementRate =
    totalViews > 0 ? ((totalComments / totalViews) * 100).toFixed(1) : 0;

  // ดึงบทความล่าสุด
  const recentBlogs = blogData?.blogs
    ? [...blogData.blogs]
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 5)
    : [];

  // ดึงบทความยอดนิยม
  const topBlogs = blogData?.blogs
    ? [...blogData.blogs]
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 5)
    : [];

  const stats = [
    {
      title: "ບົດຄວາມທັງໝົດ",
      subtitle: "Total Blog Posts",
      value: totalBlogs.toLocaleString(),
      icon: "fa-file-alt",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      change: "+4",
      changeText: "ເດືອນນີ້",
      trendUp: true,
    },
    {
      title: "ບົດຄວາມທີ່ເຜີຍແຜ່",
      subtitle: "Published Posts",
      value: publishedBlogs.toLocaleString(),
      icon: "fa-check-circle",
      gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      change:
        totalBlogs > 0
          ? `${Math.round((publishedBlogs / totalBlogs) * 100)}%`
          : "0%",
      changeText: "ຂອງທັງໝົດ",
      trendUp: true,
    },
    {
      title: "ຍອດການເຂົ້າຊົມ",
      subtitle: "Total Page Views",
      value: totalViews.toLocaleString(),
      icon: "fa-eye",
      gradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
      change: avgViews.toString(),
      changeText: "ສະເລ່ຍ/ບົດຄວາມ",
      trendUp: true,
    },
    {
      title: "ຄວາມຄິດເຫັນ",
      subtitle: "Total Comments",
      value: totalComments.toLocaleString(),
      icon: "fa-comments",
      gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      change: "+12",
      changeText: "ວັນນີ້",
      trendUp: true,
    },
    {
      title: "ຮ່າງ (Draft)",
      subtitle: "Unpublished Posts",
      value: draftBlogs.toLocaleString(),
      icon: "fa-edit",
      gradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
      change: draftBlogs > 0 ? "ລໍຖ້າເຜີຍແຜ່" : "ບໍ່ມີຮ່າງ",
      changeText: "",
      trendUp: false,
    },
    {
      title: "ອັດຕາການມີສ່ວນຮ່ວມ",
      subtitle: "Engagement Rate",
      value: `${engagementRate}%`,
      icon: "fa-chart-line",
      gradient: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
      change: "+2.5%",
      changeText: "ເດືອນນີ້",
      trendUp: true,
    },
  ];

  const quickActions = [
    {
      title: "ຂຽນບົດຄວາມໃໝ່",
      subtitle: "ສ້າງບົດຄວາມໃໝ່",
      icon: "fa-plus-circle",
      link: "/admin/blogs/new",
      color: "#667eea",
    },
    {
      title: "ຈັດການບົດຄວາມ",
      subtitle: `${totalBlogs} ບົດຄວາມ`,
      icon: "fa-list",
      link: "/admin/blog",
      color: "#10b981",
    },
    {
      title: "ເບິ່ງເວັບໄຊທ໌",
      subtitle: "ເບິ່ງໜ້າສາທາລະນະ",
      icon: "fa-globe",
      link: "/blogs",
      color: "#3b82f6",
    },
    {
      title: "ຈັດການໝວດໝູ່",
      subtitle: "Categories & Tags",
      icon: "fa-folder",
      link: "/admin/blog/categories",
      color: "#f59e0b",
    },
  ];

  return (
    <AdminLayout>
      <style>{`
                .blog-dashboard-container {
                    padding: 0;
                }

                .dashboard-header {
                    margin-bottom: 2rem;
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

                .dashboard-title {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    font-weight: 700;
                    font-size: 1.75rem;
                    margin-bottom: 0.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .dashboard-subtitle {
                    color: #718096;
                    font-size: 0.875rem;
                    margin: 0;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    gap: 1.25rem;
                    margin-bottom: 2rem;
                }

                .stat-card {
                    background: white;
                    border-radius: 16px;
                    padding: 1.5rem;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                    border: 1px solid rgba(0, 0, 0, 0.05);
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }

                .stat-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: var(--card-gradient);
                }

                .stat-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
                }

                .stat-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1rem;
                }

                .stat-info h3 {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #4a5568;
                    margin: 0 0 0.25rem 0;
                }

                .stat-info p {
                    font-size: 0.75rem;
                    color: #a0aec0;
                    margin: 0;
                }

                .stat-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    background: var(--card-gradient);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.25rem;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }

                .stat-body {
                    margin-bottom: 0.75rem;
                }

                .stat-value {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #1a202c;
                    line-height: 1;
                }

                .stat-footer {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.75rem;
                }

                .stat-change {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    padding: 0.25rem 0.5rem;
                    border-radius: 6px;
                    font-weight: 600;
                }

                .stat-change.up {
                    background: rgba(16, 185, 129, 0.1);
                    color: #059669;
                }

                .stat-change.down {
                    background: rgba(161, 161, 170, 0.1);
                    color: #71717a;
                }

                .stat-change-text {
                    color: #a0aec0;
                }

                .content-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }

                .content-card {
                    background: white;
                    border-radius: 16px;
                    padding: 1.5rem;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                }

                .content-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    padding-bottom: 1rem;
                    border-bottom: 2px solid #f0f0f0;
                }

                .content-card-title {
                    font-size: 1.125rem;
                    font-weight: 700;
                    color: #1a202c;
                    margin: 0;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .view-all-link {
                    font-size: 0.875rem;
                    color: #667eea;
                    text-decoration: none;
                    font-weight: 600;
                    transition: color 0.2s;
                }

                .view-all-link:hover {
                    color: #764ba2;
                }

                .blog-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .blog-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem;
                    background: #f8fafc;
                    border-radius: 10px;
                    transition: all 0.2s ease;
                    text-decoration: none;
                    color: inherit;
                }

                .blog-item:hover {
                    background: rgba(102, 126, 234, 0.05);
                    transform: translateX(4px);
                }

                .blog-item-info {
                    flex: 1;
                    min-width: 0;
                }

                .blog-item-title {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #2d3748;
                    margin: 0 0 0.25rem 0;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .blog-item-meta {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    font-size: 0.75rem;
                    color: #a0aec0;
                }

                .blog-item-meta span {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                }

                .blog-item-status {
                    padding: 0.25rem 0.75rem;
                    border-radius: 12px;
                    font-size: 0.7rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    white-space: nowrap;
                }

                .blog-item-status.published {
                    background: rgba(16, 185, 129, 0.1);
                    color: #059669;
                }

                .blog-item-status.draft {
                    background: rgba(161, 161, 170, 0.1);
                    color: #71717a;
                }

                .quick-actions-section {
                    background: white;
                    border-radius: 16px;
                    padding: 1.5rem;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                }

                .section-header {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 1.5rem;
                    padding-bottom: 1rem;
                    border-bottom: 2px solid #f0f0f0;
                }

                .section-title {
                    font-size: 1.125rem;
                    font-weight: 700;
                    color: #1a202c;
                    margin: 0;
                }

                .quick-actions-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    gap: 1rem;
                }

                .action-card {
                    background: white;
                    border-radius: 12px;
                    padding: 1.5rem;
                    border: 2px solid #f0f0f0;
                    transition: all 0.3s ease;
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .action-card:hover {
                    border-color: var(--action-color);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
                }

                .action-icon {
                    width: 56px;
                    height: 56px;
                    border-radius: 12px;
                    background: var(--action-color);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    flex-shrink: 0;
                }

                .action-info h4 {
                    font-size: 1rem;
                    font-weight: 700;
                    color: #1a202c;
                    margin: 0 0 0.25rem 0;
                }

                .action-info p {
                    font-size: 0.75rem;
                    color: #a0aec0;
                    margin: 0;
                }

                .empty-state {
                    text-align: center;
                    padding: 3rem 1rem;
                    color: #a0aec0;
                }

                .empty-state i {
                    font-size: 3rem;
                    margin-bottom: 1rem;
                    opacity: 0.3;
                }

                .empty-state p {
                    margin: 0;
                    font-size: 0.875rem;
                }

                @media (max-width: 1024px) {
                    .content-grid {
                        grid-template-columns: 1fr;
                    }

                    .stats-grid {
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    }
                }

                @media (max-width: 768px) {
                    .stats-grid {
                        grid-template-columns: 1fr 1fr;
                    }

                    .quick-actions-grid {
                        grid-template-columns: 1fr;
                    }

                    .dashboard-title {
                        font-size: 1.5rem;
                    }
                }
            `}</style>

      <MetaData title={"Blog Dashboard Overview"} />

      <div className="blog-dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="breadcrumb-nav">
            <a href="/admin/dashboard">
              <i className="fas fa-home"></i> Dashboard
            </a>
            <span>/</span>
            <span>Blog Dashboard</span>
          </div>
          <h1 className="dashboard-title">
            <i className="fas fa-blog"></i>
            <span>ຈັດການລະບົບບົດຄວາມ</span>
          </h1>
          <p className="dashboard-subtitle">
            ພາບລວມສະຖິຕິ ແລະ ການເຄື່ອນໄຫວຂອງບົດຄວາມທັງໝົດ
          </p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="stat-card"
              style={{ "--card-gradient": stat.gradient }}
            >
              <div className="stat-header">
                <div className="stat-info">
                  <h3>{stat.title}</h3>
                  <p>{stat.subtitle}</p>
                </div>
                <div className="stat-icon">
                  <i className={`fas ${stat.icon}`}></i>
                </div>
              </div>
              <div className="stat-body">
                <div className="stat-value">{stat.value}</div>
              </div>
              <div className="stat-footer">
                <span className={`stat-change ${stat.trendUp ? "up" : "down"}`}>
                  <i
                    className={`fas fa-arrow-${stat.trendUp ? "up" : "down"}`}
                  ></i>
                  {stat.change}
                </span>
                {stat.changeText && (
                  <span className="stat-change-text">{stat.changeText}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="content-grid">
          {/* Recent Blogs */}
          <div className="content-card">
            <div className="content-card-header">
              <h2 className="content-card-title">
                <i className="far fa-clock" style={{ color: "#667eea" }}></i>
                ບົດຄວາມລ່າສຸດ
              </h2>
              <a href="/blogs" className="view-all-link">
                ເບິ່ງທັງໝົດ <i className="fas fa-arrow-right"></i>
              </a>
            </div>
            <div className="blog-list">
              {recentBlogs.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-inbox"></i>
                  <p>ຍັງບໍ່ມີບົດຄວາມ</p>
                </div>
              ) : (
                recentBlogs.map((blog) => (
                  <a
                    key={blog._id}
                    href={`/admin/blogs/${blog._id}/edit`}
                    className="blog-item"
                  >
                    <div className="blog-item-info">
                      <h4 className="blog-item-title">{blog.title}</h4>
                      <div className="blog-item-meta">
                        <span>
                          <i className="far fa-eye"></i>
                          {blog.views || 0}
                        </span>
                        <span>
                          <i className="far fa-calendar"></i>
                          {new Date(
                            blog.createdAt || Date.now()
                          ).toLocaleDateString("lo-LA")}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`blog-item-status ${
                        blog.isPublished ? "published" : "draft"
                      }`}
                    >
                      {blog.isPublished ? "ເຜີຍແຜ່" : "ຮ່າງ"}
                    </span>
                  </a>
                ))
              )}
            </div>
          </div>

          {/* Top Performing Blogs */}
          <div className="content-card">
            <div className="content-card-header">
              <h2 className="content-card-title">
                <i className="fas fa-fire" style={{ color: "#f59e0b" }}></i>
                ບົດຄວາມຍອດນິຍົມ
              </h2>
              <a href="/admin/blog" className="view-all-link">
                ເບິ່ງທັງໝົດ <i className="fas fa-arrow-right"></i>
              </a>
            </div>
            <div className="blog-list">
              {topBlogs.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-chart-line"></i>
                  <p>ຍັງບໍ່ມີຂໍ້ມູນ</p>
                </div>
              ) : (
                topBlogs.map((blog) => (
                  <a
                    key={blog._id}
                    href={`/admin/blogs/${blog._id}/edit`}
                    className="blog-item"
                  >
                    <div className="blog-item-info">
                      <h4 className="blog-item-title">{blog.title}</h4>
                      <div className="blog-item-meta">
                        <span>
                          <i className="far fa-eye"></i>
                          {blog.views || 0} ຄົນເບິ່ງ
                        </span>
                        <span>
                          <i className="far fa-comments"></i>
                          {blog.comments?.length || 0} ຄຳເຫັນ
                        </span>
                      </div>
                    </div>
                    <span
                      className={`blog-item-status ${
                        blog.isPublished ? "published" : "draft"
                      }`}
                    >
                      {blog.isPublished ? "ເຜີຍແຜ່" : "ຮ່າງ"}
                    </span>
                  </a>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions-section">
          <div className="section-header">
            <i
              className="fas fa-bolt"
              style={{ color: "#667eea", fontSize: "1.25rem" }}
            ></i>
            <h2 className="section-title">ເມນູດ່ວນ (Quick Actions)</h2>
          </div>
          <div className="quick-actions-grid">
            {quickActions.map((action, index) => (
              <a
                key={index}
                href={action.link}
                className="action-card"
                style={{ "--action-color": action.color }}
                target={action.link.startsWith("http") ? "_blank" : undefined}
                rel={
                  action.link.startsWith("http")
                    ? "noopener noreferrer"
                    : undefined
                }
              >
                <div className="action-icon">
                  <i className={`fas ${action.icon}`}></i>
                </div>
                <div className="action-info">
                  <h4>{action.title}</h4>
                  <p>{action.subtitle}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
