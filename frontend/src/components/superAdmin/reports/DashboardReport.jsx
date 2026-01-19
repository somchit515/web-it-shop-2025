import React, { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useGetCustomerReportQuery, useGetSalesReportQuery } from '../../redux/api/productsApi';

import Loader from '../../layout/Loader';
import MetaData from '../../layout/MetaData';
import AdminLayout from '../../layout/AdminLayout';

export default function DashboardReport() {
    const { data: customersData, isLoading: isLoadingCustomers, error: errorCustomers } = useGetCustomerReportQuery();
    const { data: salesData, isLoading: isLoadingSales, error: errorSales } = useGetSalesReportQuery();

    useEffect(() => {
        if (errorCustomers) {
            toast.error(errorCustomers?.data?.message || 'ບໍ່ສາມາດດຶງຂໍ້ມູນລູກຄ້າ');
        }
        if (errorSales) {
            toast.error(errorSales?.data?.message || 'ບໍ່ສາມາດດຶງຂໍ້ມູນການຂາຍ');
        }
    }, [errorCustomers, errorSales]);

    const formatLAK = (v) => {
        try {
            const n = Number(v || 0);
            return new Intl.NumberFormat('lo-LA', { style: 'currency', currency: 'LAK', maximumFractionDigits: 0 }).format(n);
        } catch {
            return `₭ ${v}`;
        }
    };

    if (isLoadingCustomers || isLoadingSales) return <Loader />;

    const totalCustomers = customersData?.count || 0;
    const totalSales = salesData?.sales || 0;
    const totalOrders = salesData?.ordersCount || 0;
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    const stats = [
        {
            title: 'ຍອດຂາຍທັງໝົດ',
            subtitle: 'Total Sales',
            value: formatLAK(totalSales),
            icon: '💰',
            color: 'success',
            gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            trend: '+12.5%',
            trendUp: true
        },
        {
            title: 'ຈຳນວນລູກຄ້າ',
            subtitle: 'Total Customers',
            value: totalCustomers.toLocaleString(),
            icon: '👥',
            color: 'info',
            gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            trend: '+8.2%',
            trendUp: true
        },
        {
            title: 'ຈຳນວນອໍເດີ',
            subtitle: 'Total Orders',
            value: totalOrders.toLocaleString(),
            icon: '📦',
            color: 'warning',
            gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            trend: '+5.7%',
            trendUp: true
        },
        {
            title: 'ມູນຄ່າສະເລ່ຍຕໍ່ອໍເດີ',
            subtitle: 'Avg Order Value',
            value: formatLAK(avgOrderValue),
            icon: '📈',
            color: 'primary',
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            trend: '+3.1%',
            trendUp: true
        }
    ];

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;600;700&display=swap');

                .dashboard-report-container {
                    font-family: "Noto Sans Lao", "Phetsarath OT", sans-serif;
                }

                .dashboard-header {
                    margin-bottom: 2rem;
                }

                .dashboard-title {
                    font-size: 1.75rem;
                    font-weight: 700;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    margin-bottom: 0.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .dashboard-subtitle {
                    color: #718096;
                    font-size: 0.95rem;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }

                .stat-card {
                    background: white;
                    border-radius: 16px;
                    padding: 1.75rem;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
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
                    height: 4px;
                    background: var(--card-gradient);
                }

                .stat-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
                }

                .stat-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1rem;
                }

                .stat-info {
                    flex: 1;
                }

                .stat-title {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #64748b;
                    margin-bottom: 0.25rem;
                }

                .stat-subtitle {
                    font-size: 0.75rem;
                    color: #94a3b8;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .stat-icon {
                    width: 56px;
                    height: 56px;
                    border-radius: 12px;
                    background: var(--card-gradient);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.75rem;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }

                .stat-value {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin-bottom: 0.5rem;
                    line-height: 1;
                }

                .stat-footer {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .stat-trend {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.25rem;
                    font-size: 0.8rem;
                    font-weight: 600;
                    padding: 0.25rem 0.6rem;
                    border-radius: 20px;
                }

                .stat-trend.up {
                    background: rgba(16, 185, 129, 0.1);
                    color: #059669;
                }

                .stat-trend.down {
                    background: rgba(239, 68, 68, 0.1);
                    color: #dc2626;
                }

                .trend-icon {
                    font-size: 0.7rem;
                }

                .stat-period {
                    font-size: 0.75rem;
                    color: #94a3b8;
                }

                .info-banner {
                    background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
                    border-left: 4px solid #667eea;
                    border-radius: 12px;
                    padding: 1.25rem 1.5rem;
                    margin-top: 2rem;
                }

                .info-banner-content {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .info-icon {
                    font-size: 1.5rem;
                    color: #667eea;
                }

                .info-text {
                    flex: 1;
                }

                .info-title {
                    font-size: 0.95rem;
                    font-weight: 600;
                    color: #2d3748;
                    margin-bottom: 0.25rem;
                }

                .info-description {
                    font-size: 0.85rem;
                    color: #64748b;
                    margin: 0;
                }

                .quick-actions {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
                    margin-top: 2rem;
                }

                .action-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    padding: 1rem;
                    background: white;
                    border: 2px solid #e2e8f0;
                    border-radius: 12px;
                    color: #475569;
                    text-decoration: none;
                    font-weight: 600;
                    font-size: 0.9rem;
                    transition: all 0.3s ease;
                }

                .action-btn:hover {
                    border-color: #667eea;
                    color: #667eea;
                    background: rgba(102, 126, 234, 0.05);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
                }

                .action-icon {
                    font-size: 1.25rem;
                }

                @media (max-width: 768px) {
                    .stats-grid {
                        grid-template-columns: 1fr;
                    }

                    .stat-card {
                        padding: 1.5rem;
                    }

                    .stat-value {
                        font-size: 1.75rem;
                    }

                    .stat-icon {
                        width: 48px;
                        height: 48px;
                        font-size: 1.5rem;
                    }

                    .dashboard-title {
                        font-size: 1.5rem;
                    }

                    .quick-actions {
                        grid-template-columns: 1fr;
                    }
                }

                /* Loading skeleton */
                .stat-skeleton {
                    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                    background-size: 200% 100%;
                    animation: loading 1.5s infinite;
                    border-radius: 16px;
                    height: 180px;
                }

                @keyframes loading {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>

           
                <MetaData title={'Dashboard Overview - Reports'} />
                
                <div className="dashboard-report-container">
                    {/* Header */}
                    <div className="dashboard-header">
                        <h1 className="dashboard-title">
                            <span>📊</span>
                            <span>ພາບລວມລາຍງານ</span>
                        </h1>
                        <p className="dashboard-subtitle">
                            ຕິດຕາມ ແລະ ວິເຄາະຂໍ້ມູນທາງທຸລະກິດແບບ Real-time
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="stats-grid">
                        {stats.map((stat, index) => (
                            <div 
                                key={index} 
                                className="stat-card"
                                style={{ '--card-gradient': stat.gradient }}
                            >
                                <div className="stat-header">
                                    <div className="stat-info">
                                        <div className="stat-title">{stat.title}</div>
                                        <div className="stat-subtitle">{stat.subtitle}</div>
                                    </div>
                                    <div className="stat-icon">
                                        {stat.icon}
                                    </div>
                                </div>
                                
                                <div className="stat-value">{stat.value}</div>
                                
                                <div className="stat-footer">
                                    <span className={`stat-trend ${stat.trendUp ? 'up' : 'down'}`}>
                                        <span className="trend-icon">
                                            {stat.trendUp ? '↑' : '↓'}
                                        </span>
                                        <span>{stat.trend}</span>
                                    </span>
                                    <span className="stat-period">vs ເດືອນກ່ອນ</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Info Banner */}
                    <div className="info-banner">
                        <div className="info-banner-content">
                            <div className="info-icon">
                                <i className="fas fa-info-circle"></i>
                            </div>
                            <div className="info-text">
                                <div className="info-title">ລາຍງານໂດຍລະອຽດ</div>
                                <p className="info-description">
                                    ເພື່ອເບິ່ງລາຍງານແບບລະອຽດ ແລະ ການວິເຄາະຂັ້ນສູງ ກະລຸນາເລືອກເມນູດ້ານຊ້າຍ
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="quick-actions">
                        <a href="/admin/reports/customers" className="action-btn">
                            <span className="action-icon">👥</span>
                            <span>ລາຍງານລູກຄ້າ</span>
                        </a>
                        <a href="/admin/reports/sales" className="action-btn">
                            <span className="action-icon">💰</span>
                            <span>ລາຍງານການຂາຍ</span>
                        </a>
                        <a href="/admin/reports/orders" className="action-btn">
                            <span className="action-icon">📦</span>
                            <span>ລາຍງານອໍເດີ</span>
                        </a>
                        <a href="/admin/reports/finance" className="action-btn">
                            <span className="action-icon">📈</span>
                            <span>ລາຍງານການເງິນ</span>
                        </a>
                    </div>
                </div>
            
        </>
    );
}