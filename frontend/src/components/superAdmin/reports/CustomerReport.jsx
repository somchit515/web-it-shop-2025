import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useGetCustomerReportQuery } from '../../redux/api/productsApi';
import Loader from '../../layout/Loader';
import MetaData from '../../layout/MetaData';
import AdminLayout from '../../layout/AdminLayout';

export default function CustomersReport() {
    const { data, isLoading, error, refetch } = useGetCustomerReportQuery(undefined, {
        refetchOnMountOrArgChange: true,
    });

    /* ---------- ตัวกรอง & ค้นหา ---------- */
    const [search, setSearch] = useState('');
    const [genderFilter, setGenderFilter] = useState('all'); // all
    const [sortBy, setSortBy] = useState('newest'); // newest | oldest | name_asc | name_desc

    useEffect(() => {
        if (error) {
            toast.error(error?.data?.message || 'ບໍ່ສາມາດດຶງຂໍ້ມູນລູກຄ້າ');
        }
    }, [error]);

    /* ---------- ข้อมูลที่ผ่านการกรอง ---------- */
    const filteredCustomers = useMemo(() => {
        if (!data?.customers) return [];

        let list = [...data.customers];

        // ค้นหา
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(
                (c) =>
                    c.name?.toLowerCase().includes(q) ||
                    c.email?.toLowerCase().includes(q)
            );
        }

        // เพศ
        if (genderFilter !== 'all') {
            list = list;
        }

        // เรียง
        switch (sortBy) {
            case 'name_asc':
                list.sort((a, b) => a.name?.localeCompare(b.name));
                break;
            case 'name_desc':
                list.sort((a, b) => b.name?.localeCompare(a.name));
                break;
            case 'oldest':
                list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            default: // newest
                list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        return list;
    }, [data, search, genderFilter, sortBy]);

    /* ---------- สรุปสถิติ ---------- */
    const stats = useMemo(() => {
        const total = data?.count || 0;
        return { total };
    }, [data]);

    /* ---------- แบ่งหน้า ---------- */
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const paginated = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredCustomers.slice(start, start + pageSize);
    }, [filteredCustomers, page]);

    const totalPages = Math.ceil(filteredCustomers.length / pageSize);

    if (isLoading) return <Loader />;

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;600;700&display=swap');
                .customers-report {
                    font-family: 'Noto Sans Lao', 'Phetsarath OT', sans-serif;
                }
                .card {
                    background: #fff;
                    border-radius: 12px;
                    padding: 1.25rem;
                    box-shadow: 0 2px 8px rgba(0,0,0,.05);
                }
                .badge {
                    padding: 0.25rem 0.6rem;
                    border-radius: 999px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }
                .badge-male {
                    background: #dbeafe;
                    color: #1d4ed8;
                }
                .badge-female {
                    background: #fce7f3;
                    color: #be185d;
                }
                .table-responsive {
                    overflow-x: auto;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                }
                th,
                td {
                    padding: 0.75rem 1rem;
                    text-align: left;
                    font-size: 0.875rem;
                }
                th {
                    background: #f8fafc;
                    color: #475569;
                    font-weight: 600;
                }
                tr:hover {
                    background: #f1f5f9;
                }
                .pagination {
                    display: flex;
                    justify-content: center;
                    gap: 0.5rem;
                    margin-top: 1.5rem;
                }
                .pagination button {
                    padding: 0.4rem 0.9rem;
                    border: 1px solid #e2e8f0;
                    background: #fff;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: 0.2s;
                }
                .pagination button:hover:not(:disabled) {
                    border-color: #667eea;
                    color: #667eea;
                }
                .pagination button:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }
                .pagination .active {
                    background: #667eea;
                    color: #fff;
                    border-color: #667eea;
                }
            `}</style>

           
                <MetaData title="ລາຍງານລູກຄ້າ" />
                <div className="customers-report">
                    {/* หัวข้อ + สรุป */}
                    <div className="card mb-4">
                        <div className="flex items-center justify-between mb-3">
                            <h1 className="text-xl font-bold text-gray-800">👥 ລາຍງານລູກຄ້າ</h1>
                            <button
                                onClick={refetch}
                                className="text-sm px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                            >
                                🔄 Refresh
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                            <div>
                                <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
                                <div className="text-sm text-gray-500">ລວມລູກຄ້າ</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-blue-600">-</div>
                                <div className="text-sm text-gray-500">ຊາຍ</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-pink-600">-</div>
                                <div className="text-sm text-gray-500">ຍິງ</div>
                            </div>
                        </div>
                    </div>

                    {/* ตัวกรอง */}
                    <div className="card mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="ຄົ້ນຫາ (ຊື່, ອີເມວ, ເບີໂທ)..."
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />

                        <select
                            value={genderFilter}
                            onChange={(e) => setGenderFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="all">ທຸກເພດ</option>
                        </select>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="newest">ໃໝ່ສຸດ</option>
                            <option value="oldest">ເກົ່າສຸດ</option>
                            <option value="name_asc">ຊື່ ก-ຮ</option>
                            <option value="name_desc">ຊື່ ฮ-ก</option>
                        </select>

                        <button
                            onClick={() => {
                                setSearch('');
                                setGenderFilter('all');
                                setSortBy('newest');
                            }}
                            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
                        >
                            ລ້າງຕົວກອງ
                        </button>
                    </div>

                    {/* ตาราง */}
                    <div className="card table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>ຊື່-ນາມສະກຸນ</th>
                                    <th>ອີເມວ</th>
                                                                        <th>ວັນທີສະໝັກ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.length ? (
                                    paginated.map((c, idx) => (
                                        <tr key={c._id}>
                                            <td>{(page - 1) * pageSize + idx + 1}</td>
                                            <td className="font-semibold text-gray-800">{c.name || '-'}</td>
                                            <td>{c.email || '-'}</td>
                                                                                        <td>{new Date(c.createdAt).toLocaleDateString('lo-LA')}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="text-center py-6 text-gray-500">
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