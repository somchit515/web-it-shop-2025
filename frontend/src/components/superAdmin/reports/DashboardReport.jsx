import React, { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useGetCustomerReportQuery, useGetSalesReportQuery } from '../../redux/api/productsApi';
import Loader from '../../layout/Loader';
import MetaData from '../../layout/MetaData';

export default function DashboardReport() {
    const { data: customersData, isLoading: isLoadingCustomers, error: errorCustomers } = useGetCustomerReportQuery();
    const { data: salesData, isLoading: isLoadingSales, error: errorSales } = useGetSalesReportQuery();

    useEffect(() => {
        if (errorCustomers) toast.error(errorCustomers?.data?.message || 'ບໍ່ສາມາດດຶງຂໍ້ມູນລູກຄ້າ');
        if (errorSales) toast.error(errorSales?.data?.message || 'ບໍ່ສາມາດດຶງຂໍ້ມູນການຂາຍ');
    }, [errorCustomers, errorSales]);

    const formatLAK = (v) => {
        try {
            return new Intl.NumberFormat('lo-LA', { style: 'currency', currency: 'LAK', maximumFractionDigits: 0 }).format(Number(v || 0));
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
            icon: 'fas fa-money-bill-wave',
            gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        },
        {
            title: 'ຈຳນວນລູກຄ້າ',
            subtitle: 'Total Customers',
            value: totalCustomers.toLocaleString(),
            icon: 'fas fa-users',
            gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        },
        {
            title: 'ຈຳນວນອໍເດີ',
            subtitle: 'Total Orders',
            value: totalOrders.toLocaleString(),
            icon: 'fas fa-box',
            gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        },
        {
            title: 'ມູນຄ່າສະເລ່ຍ/ອໍເດີ',
            subtitle: 'Avg Order Value',
            value: formatLAK(avgOrderValue),
            icon: 'fas fa-chart-line',
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        },
    ];

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;600;700&display=swap');

                .dr-container {
                    font-family: "Noto Sans Lao", "Phetsarath OT", sans-serif;
                }

                .dr-header {
                    margin-bottom: 1.75rem;
                }

                .dr-title {
                    font-size: 1.6rem;
                    font-weight: 700;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    margin-bottom: 0.35rem;
                }

                .dr-subtitle {
                    color: #718096;
                    font-size: 0.9rem;
                    margin: 0;
                }

                .dr-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                    gap: 1.25rem;
                    margin-bottom: 2rem;
                }

                .dr-stat-card {
                    background: white;
                    border-radius: 16px;
                    padding: 1.5rem;
                    box-shadow: 0 2px 16px rgba(0, 0, 0, 0.07);
                    border: 1px solid rgba(0, 0, 0, 0.04);
                    transition: transform 0.25s ease, box-shadow 0.25s ease;
                    position: relative;
                    overflow: hidden;
                }

                .dr-stat-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: var(--card-gradient);
                }

                .dr-stat-card:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.1);
                }

                .dr-stat-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1rem;
                }

                .dr-stat-label {
                    font-size: 0.82rem;
                    font-weight: 600;
                    color: #64748b;
                }

                .dr-stat-sublabel {
                    font-size: 0.72rem;
                    color: #94a3b8;
                    text-transform: uppercase;
                    letter-spacing: 0.4px;
                }

                .dr-stat-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    background: var(--card-gradient);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.2rem;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
                }

                .dr-stat-value {
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: #1e293b;
                    line-height: 1;
                }

                .dr-actions-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 1rem;
                    margin-top: 1.5rem;
                }

                .dr-action-link {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.65rem;
                    padding: 0.9rem 1rem;
                    background: white;
                    border: 2px solid #e2e8f0;
                    border-radius: 12px;
                    color: #475569;
                    text-decoration: none;
                    font-weight: 600;
                    font-size: 0.88rem;
                    transition: all 0.25s ease;
                }

                .dr-action-link:hover {
                    border-color: #667eea;
                    color: #667eea;
                    background: rgba(102, 126, 234, 0.04);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
                }

                .dr-info-box {
                    background: linear-gradient(135deg, rgba(102,126,234,.06) 0%, rgba(118,75,162,.06) 100%);
                    border-left: 4px solid #667eea;
                    border-radius: 12px;
                    padding: 1.1rem 1.4rem;
                    margin-top: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .dr-info-box i {
                    color: #667eea;
                    font-size: 1.3rem;
                    flex-shrink: 0;
                }

                .dr-info-title {
                    font-size: 0.88rem;
                    font-weight: 600;
                    color: #2d3748;
                    margin-bottom: 0.15rem;
                }

                .dr-info-desc {
                    font-size: 0.82rem;
                    color: #64748b;
                    margin: 0;
                }

                @media (max-width: 576px) {
                    .dr-stats-grid {
                        grid-template-columns: 1fr 1fr;
                        gap: 0.875rem;
                    }

                    .dr-stat-card {
                        padding: 1.1rem;
                    }

                    .dr-stat-value {
                        font-size: 1.35rem;
                    }

                    .dr-actions-grid {
                        grid-template-columns: 1fr 1fr;
                    }
                }
            `}</style>

            <MetaData title="Dashboard — Reports" />

            <div className="dr-container">
                <div className="dr-header">
                    <h1 className="dr-title">ພາບລວມລາຍງານ</h1>
                    <p className="dr-subtitle">ຕິດຕາມ ແລະ ວິເຄາະຂໍ້ມູນທາງທຸລະກິດ</p>
                </div>

                <div className="dr-stats-grid">
                    {stats.map((s, i) => (
                        <div key={i} className="dr-stat-card" style={{ '--card-gradient': s.gradient }}>
                            <div className="dr-stat-row">
                                <div>
                                    <div className="dr-stat-label">{s.title}</div>
                                    <div className="dr-stat-sublabel">{s.subtitle}</div>
                                </div>
                                <div className="dr-stat-icon">
                                    <i className={s.icon}></i>
                                </div>
                            </div>
                            <div className="dr-stat-value">{s.value}</div>
                        </div>
                    ))}
                </div>

                <div className="dr-info-box">
                    <i className="fas fa-info-circle"></i>
                    <div>
                        <div className="dr-info-title">ລາຍງານໂດຍລະອຽດ</div>
                        <p className="dr-info-desc">ເລືອກລາຍງານທີ່ຕ້ອງການຈາກເມນູດ້ານຊ້າຍ</p>
                    </div>
                </div>

                <div className="dr-actions-grid">
                    <a href="/admin/reports/customers" className="dr-action-link">
                        <i className="fas fa-users"></i>
                        <span>ລາຍງານລູກຄ້າ</span>
                    </a>
                    <a href="/admin/reports/sales" className="dr-action-link">
                        <i className="fas fa-shopping-cart"></i>
                        <span>ລາຍງານການຂາຍ</span>
                    </a>
                    <a href="/admin/reports/finance" className="dr-action-link">
                        <i className="fas fa-chart-line"></i>
                        <span>ລາຍງານການເງິນ</span>
                    </a>
                </div>
            </div>
        </>
    );
}
