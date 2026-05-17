import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useGetSalesReportQuery } from '../../redux/api/productsApi';
import Loader from '../../layout/Loader';
import MetaData from '../../layout/MetaData';

const fmt = (v) => {
    try {
        return new Intl.NumberFormat('lo-LA', { style: 'currency', currency: 'LAK', maximumFractionDigits: 0 }).format(v);
    } catch {
        return `₭ ${v}`;
    }
};

const fmtDate = (d) => d.toISOString().split('T')[0];

const STATUS_LABEL = {
    Delivered: { text: 'ສຳເລັດ', cls: 'sr-badge-ok' },
    Cancelled: { text: 'ຍົກເລີກ', cls: 'sr-badge-err' },
};

const getStatus = (o) => o.fulfillmentStatus || o.orderStatus || '';

export default function SalesReport() {
    const { data, isLoading, error, refetch } = useGetSalesReportQuery(undefined, {
        refetchOnMountOrArgChange: true,
    });

    const [quickRange, setQuickRange] = useState('today');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date_desc');
    const [page, setPage] = useState(1);
    const pageSize = 10;

    useEffect(() => {
        if (error) toast.error(error?.data?.message || 'ບໍ່ສາມາດດຶງຂໍ້ມູນການຂາຍ');
    }, [error]);

    useEffect(() => {
        const today = new Date();
        let s, e;
        switch (quickRange) {
            case 'week':
                s = new Date(today); s.setDate(today.getDate() - 6);
                e = new Date();
                break;
            case 'month':
                s = new Date(today.getFullYear(), today.getMonth(), 1);
                e = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                break;
            case 'custom':
                return;
            default: // today
                s = e = new Date();
        }
        setStartDate(fmtDate(s));
        setEndDate(fmtDate(e));
    }, [quickRange]);

    useEffect(() => { setPage(1); }, [startDate, endDate, statusFilter, sortBy]);

    const filteredOrders = useMemo(() => {
        if (!data?.orders) return [];
        let list = [...data.orders];

        if (startDate) list = list.filter(o => new Date(o.createdAt) >= new Date(startDate));
        if (endDate)   list = list.filter(o => new Date(o.createdAt) <= new Date(endDate + 'T23:59:59'));
        if (statusFilter !== 'all') list = list.filter(o => getStatus(o) === statusFilter);

        switch (sortBy) {
            case 'date_asc':   list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); break;
            case 'total_desc': list.sort((a, b) => b.totalAmount - a.totalAmount); break;
            case 'total_asc':  list.sort((a, b) => a.totalAmount - b.totalAmount); break;
            default:           list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        return list;
    }, [data, startDate, endDate, statusFilter, sortBy]);

    const summary = useMemo(() => {
        const total = filteredOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);
        const count = filteredOrders.length;
        return { total, count, avg: count ? total / count : 0 };
    }, [filteredOrders]);

    const paginated = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredOrders.slice(start, start + pageSize);
    }, [filteredOrders, page]);

    const totalPages = Math.ceil(filteredOrders.length / pageSize);

    if (isLoading) return <Loader />;

    return (
        <>
            <MetaData title="ລາຍງານການຂາຍ" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;600;700&display=swap');

                .sr-wrap {
                    font-family: "Noto Sans Lao", "Phetsarath OT", sans-serif;
                }

                .sr-card {
                    background: white;
                    border-radius: 14px;
                    padding: 1.25rem 1.5rem;
                    box-shadow: 0 2px 12px rgba(0,0,0,.06);
                    margin-bottom: 1.25rem;
                }

                .sr-title {
                    font-size: 1.4rem;
                    font-weight: 700;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .sr-summary-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1rem;
                    margin-top: 1rem;
                }

                .sr-summary-item {
                    background: #f8fafc;
                    border-radius: 10px;
                    padding: 0.9rem 1rem;
                    text-align: center;
                }

                .sr-summary-val {
                    font-size: 1.3rem;
                    font-weight: 700;
                    color: #1e293b;
                }

                .sr-summary-lbl {
                    font-size: 0.78rem;
                    color: #94a3b8;
                    margin-top: 0.15rem;
                }

                .sr-quick-btns {
                    display: flex;
                    gap: 0.4rem;
                    flex-wrap: wrap;
                }

                .sr-qbtn {
                    padding: 0.4rem 0.85rem;
                    border-radius: 8px;
                    border: 1.5px solid #e2e8f0;
                    background: white;
                    font-size: 0.82rem;
                    font-family: inherit;
                    cursor: pointer;
                    font-weight: 600;
                    color: #64748b;
                    transition: all 0.2s;
                }

                .sr-qbtn.active, .sr-qbtn:hover {
                    border-color: #667eea;
                    color: #667eea;
                    background: rgba(102,126,234,.06);
                }

                .sr-qbtn.active {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    border-color: transparent;
                }

                .sr-form-label {
                    font-size: 0.78rem;
                    font-weight: 600;
                    color: #64748b;
                    margin-bottom: 0.3rem;
                    display: block;
                }

                .sr-input, .sr-select {
                    width: 100%;
                    padding: 0.5rem 0.75rem;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 0.85rem;
                    font-family: inherit;
                    outline: none;
                    transition: border-color 0.2s;
                    background: white;
                }

                .sr-input:focus, .sr-select:focus {
                    border-color: #667eea;
                    box-shadow: 0 0 0 3px rgba(102,126,234,.1);
                }

                .sr-input:disabled {
                    background: #f8fafc;
                    color: #94a3b8;
                }

                .sr-table-card {
                    background: white;
                    border-radius: 14px;
                    box-shadow: 0 2px 12px rgba(0,0,0,.06);
                    overflow: hidden;
                }

                .sr-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 0.875rem;
                }

                .sr-table th {
                    background: #f8fafc;
                    color: #64748b;
                    font-weight: 600;
                    padding: 0.85rem 1rem;
                    text-align: left;
                    border-bottom: 1px solid #e2e8f0;
                    white-space: nowrap;
                }

                .sr-table td {
                    padding: 0.85rem 1rem;
                    border-bottom: 1px solid #f1f5f9;
                    color: #374151;
                }

                .sr-table tbody tr:hover { background: #f8fafc; }
                .sr-table tbody tr:last-child td { border-bottom: none; }

                .sr-badge-ok  { background: #d1fae5; color: #065f46; padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.78rem; font-weight: 600; }
                .sr-badge-err { background: #fee2e2; color: #991b1b; padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.78rem; font-weight: 600; }
                .sr-badge-pend { background: #fef3c7; color: #92400e; padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.78rem; font-weight: 600; }

                .sr-order-id {
                    font-family: monospace;
                    font-size: 0.82rem;
                    color: #667eea;
                    font-weight: 600;
                }

                .sr-pagination {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 0.4rem;
                    padding: 1.1rem;
                    border-top: 1px solid #f1f5f9;
                }

                .sr-page-btn {
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

                .sr-page-btn:hover:not(:disabled) { border-color: #667eea; color: #667eea; }
                .sr-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
                .sr-page-btn.active {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    border-color: transparent;
                }

                @media (max-width: 576px) {
                    .sr-summary-grid { grid-template-columns: 1fr; }
                    .sr-table th:nth-child(3), .sr-table td:nth-child(3) { display: none; }
                }
            `}</style>

            <div className="sr-wrap">
                {/* Header + Summary */}
                <div className="sr-card">
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-1">
                        <h1 className="sr-title mb-0">ລາຍງານການຂາຍ</h1>
                        <button className="btn btn-sm btn-outline-secondary" onClick={refetch} style={{ fontFamily: 'inherit' }}>
                            <i className="fas fa-sync-alt me-1"></i>Refresh
                        </button>
                    </div>

                    <div className="sr-summary-grid">
                        <div className="sr-summary-item">
                            <div className="sr-summary-val" style={{ color: '#059669' }}>{fmt(summary.total)}</div>
                            <div className="sr-summary-lbl">ຍອດຂາຍລວມ</div>
                        </div>
                        <div className="sr-summary-item">
                            <div className="sr-summary-val" style={{ color: '#2563eb' }}>{summary.count.toLocaleString()}</div>
                            <div className="sr-summary-lbl">ຈຳນວນອໍເດີ</div>
                        </div>
                        <div className="sr-summary-item">
                            <div className="sr-summary-val" style={{ color: '#764ba2' }}>{fmt(summary.avg)}</div>
                            <div className="sr-summary-lbl">ສະເລ່ຍ/ອໍເດີ</div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="sr-card">
                    <div className="row g-3 align-items-end">
                        <div className="col-12 col-md-auto">
                            <label className="sr-form-label">ຊ່ວງວັນ</label>
                            <div className="sr-quick-btns">
                                {[
                                    { k: 'today', l: 'ມື້ນີ້' },
                                    { k: 'week',  l: '7 ມື້' },
                                    { k: 'month', l: 'ເດືອນ' },
                                    { k: 'custom',l: 'ກຳນົດ' },
                                ].map(({ k, l }) => (
                                    <button key={k} className={`sr-qbtn ${quickRange === k ? 'active' : ''}`} onClick={() => setQuickRange(k)}>
                                        {l}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="col-6 col-md-2">
                            <label className="sr-form-label">ວັນເລີ່ມ</label>
                            <input type="date" className="sr-input" value={startDate} disabled={quickRange !== 'custom'} onChange={e => setStartDate(e.target.value)} />
                        </div>

                        <div className="col-6 col-md-2">
                            <label className="sr-form-label">ວັນສິ້ນສຸດ</label>
                            <input type="date" className="sr-input" value={endDate} disabled={quickRange !== 'custom'} onChange={e => setEndDate(e.target.value)} />
                        </div>

                        <div className="col-6 col-md-2">
                            <label className="sr-form-label">ສະຖານະ</label>
                            <select className="sr-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                                <option value="all">ທຸກສະຖານະ</option>
                                <option value="Delivered">ສຳເລັດ</option>
                                <option value="Processing">ກຳລັງດຳເນີນ</option>
                                <option value="Cancelled">ຍົກເລີກ</option>
                            </select>
                        </div>

                        <div className="col-6 col-md-2">
                            <label className="sr-form-label">ຈັດລຽງ</label>
                            <select className="sr-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                                <option value="date_desc">ວັນທີ ໃໝ່ສຸດ</option>
                                <option value="date_asc">ວັນທີ ເກົ່າສຸດ</option>
                                <option value="total_desc">ມູນຄ່າ ຫຼາຍສຸດ</option>
                                <option value="total_asc">ມູນຄ່າ ໜ້ອຍສຸດ</option>
                            </select>
                        </div>

                        <div className="col-12 col-md-auto">
                            <button
                                className="btn btn-sm btn-outline-secondary w-100"
                                style={{ fontFamily: 'inherit', height: '36px' }}
                                onClick={() => {
                                    setQuickRange('today');
                                    setStatusFilter('all');
                                    setSortBy('date_desc');
                                }}
                            >
                                ລ້າງ
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="sr-table-card">
                    <div className="table-responsive">
                        <table className="sr-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>ເລກທີ່ອໍເດີ</th>
                                    <th>ລູກຄ້າ</th>
                                    <th>ວັນທີ</th>
                                    <th>ມູນຄ່າ</th>
                                    <th>ສະຖານະ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.length > 0 ? (
                                    paginated.map((o, idx) => {
                                        const st = getStatus(o);
                                        const statusInfo = STATUS_LABEL[st];
                                        return (
                                            <tr key={o._id}>
                                                <td style={{ color: '#94a3b8' }}>{(page - 1) * pageSize + idx + 1}</td>
                                                <td>
                                                    <span className="sr-order-id">
                                                        #{o._id?.slice(-8).toUpperCase()}
                                                    </span>
                                                </td>
                                                <td>{o.user?.name || '—'}</td>
                                                <td style={{ color: '#64748b' }}>
                                                    {new Date(o.createdAt).toLocaleDateString('lo-LA')}
                                                </td>
                                                <td style={{ fontWeight: 600 }}>{fmt(o.totalAmount)}</td>
                                                <td>
                                                    {statusInfo ? (
                                                        <span className={statusInfo.cls}>{statusInfo.text}</span>
                                                    ) : (
                                                        <span className="sr-badge-pend">ກຳລັງດຳເນີນ</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                                            <i className="fas fa-shopping-cart" style={{ fontSize: '2rem', opacity: 0.3, display: 'block', marginBottom: '0.5rem' }}></i>
                                            ບໍ່ພົບຂໍ້ມູນໃນຊ່ວງທີ່ເລືອກ
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="sr-pagination">
                            <button className="sr-page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                                <i className="fas fa-chevron-left"></i>
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 2)
                                .map((n, i, arr) => (
                                    <React.Fragment key={n}>
                                        {i > 0 && arr[i - 1] !== n - 1 && <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>…</span>}
                                        <button className={`sr-page-btn ${page === n ? 'active' : ''}`} onClick={() => setPage(n)}>{n}</button>
                                    </React.Fragment>
                                ))}
                            <button className="sr-page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                                <i className="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
