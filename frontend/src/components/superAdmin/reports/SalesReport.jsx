/* -------------------------------------------------- */
/*  SalesReport + ค้นหาเร็ว + ส่งออก PDF (เท็มเพทด)  */
/* -------------------------------------------------- */
import React, { useEffect, useMemo, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { useGetSalesReportQuery } from '../../redux/api/productsApi';
import Loader from '../../layout/Loader';
import MetaData from '../../layout/MetaData';
import AdminLayout from '../../layout/AdminLayout';
import jsPDF from 'jspdf';                       // สำหรับสร้างไฟล์ PDF
import 'jspdf-autotable';                        // สำหรับตารางใน PDF

export default function SalesReport() {
    /* ---------- โหลดข้อมูล ---------- */
    const { data, isLoading, error, refetch } = useGetSalesReportQuery(undefined, {
        refetchOnMountOrArgChange: true,
    });

    /* ---------- ตัวกรอง ---------- */
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date_desc');
    const [quickRange, setQuickRange] = useState('today'); // today | week | month | custom

    /* ---------- กำหนดช่วงวันเริ่มต้นให้เป็นวันล่าสุด ---------- */
    useEffect(() => {
        const today = new Date();
        const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        setStartDate(formatInputDate(today));
        setEndDate(formatInputDate(today));
        setQuickRange('today');
    }, []);

    /* ---------- แปลงวันให้เป็น input type=date ---------- */
    const formatInputDate = (d) => d.toISOString().split('T')[0];

    /* ---------- ปรับวันอัตโนมัติตามปุ่มลัด ---------- */
    useEffect(() => {
        const today = new Date();
        let s, e;
        switch (quickRange) {
            case 'today':
                s = e = today;
                break;
            case 'week':
                s = new Date(today.setDate(today.getDate() - 7));
                e = new Date();
                break;
            case 'month':
                s = new Date(today.getFullYear(), today.getMonth(), 1);
                e = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                break;
            default: // custom
                return;
        }
        setStartDate(formatInputDate(s));
        setEndDate(formatInputDate(e));
    }, [quickRange]);

    /* ---------- ข้อมูลที่ผ่านการกรอง ---------- */
    const filteredOrders = useMemo(() => {
        if (!data?.orders) return [];
        let list = [...data.orders];

        if (startDate)
            list = list.filter((o) => new Date(o.createdAt) >= new Date(startDate));
        if (endDate)
            list = list.filter((o) => new Date(o.createdAt) <= new Date(endDate + 'T23:59:59'));
        if (statusFilter !== 'all')
            list = list.filter((o) => (o.fulfillmentStatus || o.orderStatus) === statusFilter);

        switch (sortBy) {
            case 'date_asc':
                list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'total_desc':
                list.sort((a, b) => b.totalAmount - a.totalAmount);
                break;
            case 'total_asc':
                list.sort((a, b) => a.totalAmount - b.totalAmount);
                break;
            default:
                list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        return list;
    }, [data, startDate, endDate, statusFilter, sortBy]);

    /* ---------- สรุปยอด ---------- */
    const summary = useMemo(() => {
        const total = filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
        const count = filteredOrders.length;
        const avg = count ? total / count : 0;
        return { total, count, avg };
    }, [filteredOrders]);

    /* ---------- แบ่งหน้า ---------- */
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const paginated = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredOrders.slice(start, start + pageSize);
    }, [filteredOrders, page]);
    const totalPages = Math.ceil(filteredOrders.length / pageSize);

    /* ---------- ฟอร์แมตเงิน ---------- */
    const formatLAK = (v) => {
        try {
            return new Intl.NumberFormat('lo-LA', {
                style: 'currency',
                currency: 'LAK',
                maximumFractionDigits: 0,
            }).format(v);
        } catch {
            return `₭ ${v}`;
        }
    };

    /* ---------- ส่งออก PDF ---------- */
    const exportPDF = () => {
        const doc = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
        doc.setFont('NotoSansLao');
        doc.text('ລາຍງານການຂາຍ', 40, 30);
        doc.text(`ຊ່ວງວັນ: ${startDate} ຫາ ${endDate}`, 40, 50);
        doc.text(`ຍອດລວມ: ${formatLAK(summary.total)} | ຈຳນວນອໍເດີ: ${summary.count}`, 40, 70);

        const cols = [['#', 'ເລກທີ່ອໍເດີ', 'ລູກຄ້າ', 'ວັນທີ່ສັ່ງ', 'ມູນຄ່າ', 'ສະຖານະ']];
        const rows = filteredOrders.map((o, idx) => [
            idx + 1,
            o.orderNumber,
            o.user?.name || '-',
            new Date(o.createdAt).toLocaleDateString('lo-LA'),
            formatLAK(o.totalAmount),
            (o.fulfillmentStatus || o.orderStatus) === 'Delivered' ? 'ສຳເລັດ' :
                (o.fulfillmentStatus || o.orderStatus) === 'Cancelled' ? 'ຍົກເລີກ' : 'ກຳລັງດຳເນີນ'
        ]);

        doc.autoTable({
            head: cols,
            body: rows,
            startY: 90,
            theme: 'grid',
            styles: { font: 'NotoSansLao', fontSize: 10 },
            headStyles: { fillColor: [102, 126, 234] },
        });

        doc.save(`sales_report_${startDate}_${endDate}.pdf`);
    };

    if (isLoading) return <Loader />;

    return (
        <>
            <MetaData title="ລາຍງານການຂາຍ" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;600;700&display=swap');
                .sales-report { font-family: 'Noto Sans Lao', sans-serif; }
                .card { background: #fff; border-radius: 12px; padding: 1.25rem; box-shadow: 0 2px 8px rgba(0,0,0,.05); }
                .badge-completed { background: #d1fae5; color: #065f46; }
                .badge-pending { background: #fef3c7; color: #92400e; }
                .badge-cancelled { background: #fee2e2; color: #991b1b; }
                .table-responsive { overflow-x: auto; }
                table { width: 100%; border-collapse: collapse; }
                th, td { padding: 0.75rem 1rem; font-size: 0.875rem; }
                th { background: #f8fafc; font-weight: 600; }
                tr:hover { background: #f1f5f9; }
                .pagination { display: flex; justify-content: center; gap: 0.5rem; margin-top: 1.5rem; }
                .pagination button { padding: 0.4rem 0.9rem; border: 1px solid #e2e8f0; background: #fff; border-radius: 6px; cursor: pointer; font-weight: 600; }
                .pagination button:disabled { opacity: 0.4; cursor: not-allowed; }
                .pagination .active { background: #667eea; color: #fff; border-color: #667eea; }
            `}</style>

            
                <div className="sales-report">
                    {/* หัวข้อ + สรุป */}
                    <div className="card mb-4">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <h1 className="h5 mb-0 fw-bold">💰 ລາຍງານການຂາຍ</h1>
                            <div className="d-flex gap-2">
                                <button className="btn btn-sm btn-outline-secondary" onClick={refetch}>🔄 Refresh</button>
                                <button className="btn btn-sm btn-primary" onClick={exportPDF}>📄 Export PDF</button>
                            </div>
                        </div>

                        <div className="row text-center">
                            <div className="col-sm-4 mb-2">
                                <div className="fs-4 fw-bold text-gray-800">{formatLAK(summary.total)}</div>
                                <div className="small text-muted">ຍອດຂາຍລວມ</div>
                            </div>
                            <div className="col-sm-4 mb-2">
                                <div className="fs-4 fw-bold text-blue-600">{summary.count}</div>
                                <div className="small text-muted">ຈຳນວນອໍເດີ</div>
                            </div>
                            <div className="col-sm-4 mb-2">
                                <div className="fs-4 fw-bold text-green-600">{formatLAK(summary.avg)}</div>
                                <div className="small text-muted">ມູນຄ່າສະເລ່ຍ</div>
                            </div>
                        </div>
                    </div>

                    {/* ตัวกรอง */}
                    <div className="card mb-4">
                        <div className="row g-3 align-items-end">
                            <div className="col-md-3">
                                <label className="form-label small mb-1">ຊ່ວງວັນໄວ</label>
                                <div className="btn-group w-100">
                                    {['today', 'week', 'month', 'custom'].map((k) => (
                                        <button
                                            key={k}
                                            className={`btn btn-sm ${quickRange === k ? 'btn-primary' : 'btn-outline-primary'}`}
                                            onClick={() => setQuickRange(k)}
                                        >
                                            {k === 'today' ? 'ມື້ນີ້' : k === 'week' ? '7 ມື້' : k === 'month' ? 'ເດືອນ' : 'ກຳນົດເອງ'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="col-md-2">
                                <label className="form-label small mb-1">ວັນທີ່ເລີ່ມ</label>
                                <input
                                    type="date"
                                    className="form-control form-control-sm"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    disabled={quickRange !== 'custom'}
                                />
                            </div>

                            <div className="col-md-2">
                                <label className="form-label small mb-1">ວັນທີ່ສິ້ນສຸດ</label>
                                <input
                                    type="date"
                                    className="form-control form-control-sm"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    disabled={quickRange !== 'custom'}
                                />
                            </div>

                            <div className="col-md-2">
                                <label className="form-label small mb-1">ສະຖານະ</label>
                                <select
                                    className="form-select form-select-sm"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="all">ທຸກສະຖານະ</option>
                                    <option value="Delivered">ສຳເລັດ</option>
                                    <option value="Processing">ກຳລັງດຳເນີນ</option>
                                    <option value="Cancelled">ຍົກເລີກ</option>
                                </select>
                            </div>

                            <div className="col-md-2">
                                <label className="form-label small mb-1">ຈັດລຽງ</label>
                                <select
                                    className="form-select form-select-sm"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <option value="date_desc">ວັນທີ່ ໃໝ່ສຸດ</option>
                                    <option value="date_asc">ວັນທີ່ ເກົ່າສຸດ</option>
                                    <option value="total_desc">ມູນຄ່າ ຫຼາຍສຸດ</option>
                                    <option value="total_asc">ມູນຄ່າ ໜ້ອຍສຸດ</option>
                                </select>
                            </div>

                            <div className="col-md-1 d-grid">
                                <button
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() => {
                                        setStartDate(formatInputDate(new Date()));
                                        setEndDate(formatInputDate(new Date()));
                                        setStatusFilter('all');
                                        setSortBy('date_desc');
                                        setQuickRange('today');
                                    }}
                                >
                                    ລ້າງ
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ตาราง */}
                    <div className="card table-responsive">
                        <table className="table table-hover align-middle">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>ເລກທີ່ອໍເດີ</th>
                                    <th>ລູກຄ້າ</th>
                                    <th>ວັນທີ່ສັ່ງ</th>
                                    <th>ມູນຄ່າ</th>
                                    <th>ສະຖານະ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.length ? (
                                    paginated.map((o, idx) => (
                                        <tr key={o._id}>
                                            <td>{(page - 1) * pageSize + idx + 1}</td>
                                            <td className="fw-semibold text-gray-800">{o.orderNumber}</td>
                                            <td>{o.user?.name || '-'}</td>
                                            <td>{new Date(o.createdAt).toLocaleDateString('lo-LA')}</td>
                                            <td className="fw-semibold">{formatLAK(o.totalAmount)}</td>
                                            <td>
                                                {(o.fulfillmentStatus || o.orderStatus) === 'Delivered' && <span className="badge badge-completed">ສຳເລັດ</span>}
                                                {(o.fulfillmentStatus || o.orderStatus) === 'Cancelled' && <span className="badge badge-cancelled">ຍົກເລີກ</span>}
                                                {['Unfulfilled','Processing','Shipped'].includes(o.fulfillmentStatus || o.orderStatus) && <span className="badge badge-pending">ກຳລັງດຳເນີນ</span>}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="text-center py-6 text-muted">
                                            ບໍ່ພົບຂໍ້ມູນ
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* แบ่งหน้า */}
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button disabled={page === 1} onClick={() => setPage(page - 1)}>
                                ກ່ອນໜ້າ
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                                <button
                                    key={n}
                                    className={page === n ? 'active' : ''}
                                    onClick={() => setPage(n)}
                                >
                                    {n}
                                </button>
                            ))}
                            <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                                ຖັດໄປ
                            </button>
                        </div>
                    )}
                </div>
            
        </>
    );
}