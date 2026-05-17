import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useGetCustomerReportQuery } from '../../redux/api/productsApi';
import Loader from '../../layout/Loader';
import MetaData from '../../layout/MetaData';

export default function CustomersReport() {
    const { data, isLoading, error, refetch } = useGetCustomerReportQuery(undefined, {
        refetchOnMountOrArgChange: true,
    });

    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [page, setPage] = useState(1);
    const pageSize = 10;

    useEffect(() => {
        if (error) toast.error(error?.data?.message || 'ບໍ່ສາມາດດຶງຂໍ້ມູນລູກຄ້າ');
    }, [error]);

    useEffect(() => { setPage(1); }, [search, sortBy]);

    const filteredCustomers = useMemo(() => {
        if (!data?.customers) return [];
        let list = [...data.customers];

        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(c =>
                c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q)
            );
        }

        switch (sortBy) {
            case 'name_asc':  list.sort((a, b) => (a.name || '').localeCompare(b.name || '')); break;
            case 'name_desc': list.sort((a, b) => (b.name || '').localeCompare(a.name || '')); break;
            case 'oldest':    list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); break;
            default:          list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        return list;
    }, [data, search, sortBy]);

    const paginated = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredCustomers.slice(start, start + pageSize);
    }, [filteredCustomers, page]);

    const totalPages = Math.ceil(filteredCustomers.length / pageSize);
    const totalCustomers = data?.count || 0;

    if (isLoading) return <Loader />;

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;600;700&display=swap');

                .cr-wrap {
                    font-family: "Noto Sans Lao", "Phetsarath OT", sans-serif;
                }

                .cr-header-card {
                    background: white;
                    border-radius: 16px;
                    padding: 1.5rem;
                    box-shadow: 0 2px 14px rgba(0,0,0,.06);
                    margin-bottom: 1.25rem;
                }

                .cr-title {
                    font-size: 1.4rem;
                    font-weight: 700;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    margin: 0;
                }

                .cr-stat-box {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border-radius: 12px;
                    padding: 1rem 1.5rem;
                    text-align: center;
                    min-width: 140px;
                }

                .cr-stat-num {
                    font-size: 2rem;
                    font-weight: 700;
                    line-height: 1;
                }

                .cr-stat-label {
                    font-size: 0.8rem;
                    opacity: 0.85;
                    margin-top: 0.2rem;
                }

                .cr-filter-card {
                    background: white;
                    border-radius: 14px;
                    padding: 1.1rem 1.25rem;
                    box-shadow: 0 2px 10px rgba(0,0,0,.05);
                    margin-bottom: 1.25rem;
                }

                .cr-search-wrap {
                    position: relative;
                    flex: 1;
                }

                .cr-search-wrap i {
                    position: absolute;
                    left: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #94a3b8;
                    pointer-events: none;
                }

                .cr-search-input {
                    width: 100%;
                    padding: 0.55rem 0.75rem 0.55rem 2.25rem;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 9px;
                    font-size: 0.88rem;
                    font-family: inherit;
                    outline: none;
                    transition: border-color 0.2s;
                }

                .cr-search-input:focus {
                    border-color: #667eea;
                    box-shadow: 0 0 0 3px rgba(102,126,234,.12);
                }

                .cr-select {
                    padding: 0.55rem 2rem 0.55rem 0.75rem;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 9px;
                    font-size: 0.88rem;
                    font-family: inherit;
                    outline: none;
                    cursor: pointer;
                    background: white;
                    appearance: none;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2394a3b8'/%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 10px center;
                    transition: border-color 0.2s;
                }

                .cr-select:focus {
                    border-color: #667eea;
                }

                .cr-btn-clear {
                    padding: 0.55rem 1rem;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 9px;
                    background: white;
                    font-size: 0.85rem;
                    color: #64748b;
                    cursor: pointer;
                    font-family: inherit;
                    transition: all 0.2s;
                    white-space: nowrap;
                }

                .cr-btn-clear:hover {
                    border-color: #ef4444;
                    color: #ef4444;
                }

                .cr-btn-refresh {
                    padding: 0.55rem 1rem;
                    border: 1.5px solid #667eea;
                    border-radius: 9px;
                    background: white;
                    font-size: 0.85rem;
                    color: #667eea;
                    cursor: pointer;
                    font-family: inherit;
                    transition: all 0.2s;
                    white-space: nowrap;
                }

                .cr-btn-refresh:hover {
                    background: rgba(102,126,234,.07);
                }

                .cr-table-card {
                    background: white;
                    border-radius: 14px;
                    box-shadow: 0 2px 10px rgba(0,0,0,.05);
                    overflow: hidden;
                }

                .cr-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 0.875rem;
                }

                .cr-table th {
                    background: #f8fafc;
                    color: #64748b;
                    font-weight: 600;
                    padding: 0.85rem 1rem;
                    text-align: left;
                    border-bottom: 1px solid #e2e8f0;
                    white-space: nowrap;
                }

                .cr-table td {
                    padding: 0.85rem 1rem;
                    border-bottom: 1px solid #f1f5f9;
                    color: #374151;
                }

                .cr-table tbody tr:hover {
                    background: #f8fafc;
                }

                .cr-table tbody tr:last-child td {
                    border-bottom: none;
                }

                .cr-avatar {
                    width: 34px;
                    height: 34px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.85rem;
                    font-weight: 700;
                    flex-shrink: 0;
                }

                .cr-empty {
                    padding: 3rem 1rem;
                    text-align: center;
                    color: #94a3b8;
                }

                .cr-pagination {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 0.4rem;
                    padding: 1.25rem;
                    border-top: 1px solid #f1f5f9;
                }

                .cr-page-btn {
                    min-width: 34px;
                    height: 34px;
                    padding: 0 0.5rem;
                    border: 1.5px solid #e2e8f0;
                    background: white;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 0.82rem;
                    font-family: inherit;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .cr-page-btn:hover:not(:disabled) {
                    border-color: #667eea;
                    color: #667eea;
                }

                .cr-page-btn:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }

                .cr-page-btn.active {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    border-color: transparent;
                }

                .cr-count-text {
                    font-size: 0.82rem;
                    color: #94a3b8;
                }
            `}</style>

            <MetaData title="ລາຍງານລູກຄ້າ" />
            <div className="cr-wrap">
                {/* Header */}
                <div className="cr-header-card">
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                        <div>
                            <h1 className="cr-title">ລາຍງານລູກຄ້າ</h1>
                            <div className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}>
                                Customer Report
                            </div>
                        </div>
                        <div className="cr-stat-box">
                            <div className="cr-stat-num">{totalCustomers.toLocaleString()}</div>
                            <div className="cr-stat-label">ລວມລູກຄ້າທັງໝົດ</div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="cr-filter-card">
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                        <div className="cr-search-wrap">
                            <i className="fas fa-search"></i>
                            <input
                                className="cr-search-input"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="ຄົ້ນຫາ ຊື່ ຫຼື ອີເມວ..."
                            />
                        </div>
                        <select
                            className="cr-select"
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                        >
                            <option value="newest">ໃໝ່ສຸດ</option>
                            <option value="oldest">ເກົ່າສຸດ</option>
                            <option value="name_asc">ຊື່ ກ-ຮ</option>
                            <option value="name_desc">ຊື່ ຮ-ກ</option>
                        </select>
                        <button className="cr-btn-clear" onClick={() => { setSearch(''); setSortBy('newest'); }}>
                            ລ້າງ
                        </button>
                        <button className="cr-btn-refresh" onClick={refetch}>
                            <i className="fas fa-sync-alt me-1"></i>Refresh
                        </button>
                    </div>
                    {filteredCustomers.length !== totalCustomers && (
                        <div className="cr-count-text mt-2">
                            ພົບ {filteredCustomers.length} ຈາກ {totalCustomers} ຄົນ
                        </div>
                    )}
                </div>

                {/* Table */}
                <div className="cr-table-card">
                    <div className="table-responsive">
                        <table className="cr-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>ລູກຄ້າ</th>
                                    <th>ອີເມວ</th>
                                    <th>ວັນທີສະໝັກ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.length > 0 ? (
                                    paginated.map((c, idx) => (
                                        <tr key={c._id}>
                                            <td style={{ color: '#94a3b8' }}>
                                                {(page - 1) * pageSize + idx + 1}
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    <div className="cr-avatar">
                                                        {(c.name || '?').charAt(0).toUpperCase()}
                                                    </div>
                                                    <span style={{ fontWeight: 600 }}>
                                                        {c.name || '—'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ color: '#64748b' }}>{c.email || '—'}</td>
                                            <td style={{ color: '#64748b' }}>
                                                {new Date(c.createdAt).toLocaleDateString('lo-LA')}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="cr-empty">
                                            <i className="fas fa-users" style={{ fontSize: '2rem', opacity: 0.3, display: 'block', marginBottom: '0.5rem' }}></i>
                                            ບໍ່ພົບຂໍ້ມູນ
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="cr-pagination">
                            <button className="cr-page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                                <i className="fas fa-chevron-left"></i>
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 2)
                                .map((n, i, arr) => (
                                    <React.Fragment key={n}>
                                        {i > 0 && arr[i - 1] !== n - 1 && (
                                            <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>…</span>
                                        )}
                                        <button
                                            className={`cr-page-btn ${page === n ? 'active' : ''}`}
                                            onClick={() => setPage(n)}
                                        >
                                            {n}
                                        </button>
                                    </React.Fragment>
                                ))}
                            <button className="cr-page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                                <i className="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
