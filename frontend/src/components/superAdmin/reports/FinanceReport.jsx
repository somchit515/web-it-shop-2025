import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import Loader from '../../layout/Loader';
import MetaData from '../../layout/MetaData';
import { toast } from 'react-hot-toast';
import { useGetIncomeExpenseReportQuery } from '../../redux/api/productsApi';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const FinanceReport = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [queryArgs, setQueryArgs] = useState({});

  const { data: reportData, isLoading, error, isFetching } = useGetIncomeExpenseReportQuery(queryArgs, {
    refetchOnMountOrArgChange: true,
  });

  const data = reportData?.report || null;

  if (error) {
    toast.error(error?.data?.message || 'ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້', { id: 'finance-err' });
  }

  const submitHandler = (e) => {
    e.preventDefault();
    if (startDate && endDate) {
      setQueryArgs({ startDate, endDate });
    } else {
      setQueryArgs({});
    }
  };

  const clearFilter = () => {
    setStartDate('');
    setEndDate('');
    setQueryArgs({});
  };

  const chartData = {
    labels: ['ຍອດຂາຍສິນຄ້າ', 'ຄ່າຂົນສົ່ງ', 'ພາສີ', 'ຕົ້ນທຶນສິນຄ້າ', 'ກຳໄລສຸດທິ'],
    datasets: [
      {
        label: 'ຈຳນວນເງິນ (₭)',
        data: data
          ? [data.totalSales, data.totalShipping, data.totalTax, data.totalCOGS, data.netProfit]
          : [0, 0, 0, 0, 0],
        backgroundColor: [
          'rgba(102,126,234,.75)',
          'rgba(59,130,246,.75)',
          'rgba(245,158,11,.75)',
          'rgba(239,68,68,.75)',
          'rgba(16,185,129,.75)',
        ],
        borderColor: ['#667eea', '#3b82f6', '#f59e0b', '#ef4444', '#10b981'],
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { labels: { color: '#475569', font: { family: 'Noto Sans Lao, sans-serif' } } },
      title: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#fff',
        bodyColor: '#cbd5e1',
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (ctx) => ` ₭${Number(ctx.raw || 0).toLocaleString()}`,
        },
      },
    },
    scales: {
      x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(0,0,0,.04)' } },
      y: {
        ticks: {
          color: '#64748b',
          callback: (v) => `₭${Number(v).toLocaleString()}`,
        },
        grid: { color: 'rgba(0,0,0,.04)' },
      },
    },
  };

  const loading = isLoading || isFetching;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;600;700&display=swap');
        .fr-wrap { font-family: "Noto Sans Lao", "Phetsarath OT", sans-serif; }
        .fr-title {
          font-size: 1.4rem;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 0.25rem;
        }
        .fr-card {
          background: white;
          border-radius: 14px;
          padding: 1.25rem 1.5rem;
          box-shadow: 0 2px 12px rgba(0,0,0,.06);
          margin-bottom: 1.25rem;
        }
        .fr-stat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 1rem;
          margin-bottom: 1.25rem;
        }
        .fr-stat {
          border-radius: 12px;
          padding: 1.1rem 1.25rem;
          color: white;
        }
        .fr-stat-lbl { font-size: 0.8rem; opacity: 0.85; margin-bottom: 0.3rem; }
        .fr-stat-val { font-size: 1.4rem; font-weight: 700; line-height: 1; }
        .fr-form-row { display: flex; gap: 1rem; flex-wrap: wrap; align-items: flex-end; }
        .fr-field { display: flex; flex-direction: column; gap: 0.3rem; flex: 1; min-width: 140px; }
        .fr-label { font-size: 0.78rem; font-weight: 600; color: #64748b; }
        .fr-input {
          padding: 0.55rem 0.85rem;
          border-radius: 9px;
          font-size: 0.87rem;
          font-family: inherit;
          border: 1.5px solid #e2e8f0;
          outline: none;
          transition: border-color 0.2s;
          background: white;
          width: 100%;
        }
        .fr-input:focus { border-color: #667eea; box-shadow: 0 0 0 3px rgba(102,126,234,.1); }
        .fr-btn {
          padding: 0.55rem 1.25rem;
          border-radius: 9px;
          font-size: 0.87rem;
          font-family: inherit;
          border: none;
          cursor: pointer;
          font-weight: 600;
          white-space: nowrap;
          transition: all 0.2s;
        }
        .fr-btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .fr-btn-primary:hover { opacity: 0.88; }
        .fr-btn-outline {
          background: white;
          color: #64748b;
          border: 1.5px solid #e2e8f0;
        }
        .fr-btn-outline:hover { border-color: #667eea; color: #667eea; }
        .fr-filter-label {
          font-size: 0.8rem;
          color: #667eea;
          background: rgba(102,126,234,.08);
          padding: 0.25rem 0.6rem;
          border-radius: 6px;
          font-weight: 600;
        }
        @media (max-width: 576px) {
          .fr-stat-grid { grid-template-columns: 1fr 1fr; }
          .fr-form-row { flex-direction: column; }
        }
      `}</style>

      <MetaData title="ລາຍງານການເງິນ" />
      <div className="fr-wrap">
        {/* Title */}
        <div className="fr-card">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div>
              <h1 className="fr-title">ລາຍງານການເງິນ</h1>
              <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>Finance Report — ສຸດຍອດລາຍຮັບ-ລາຍຈ່າຍ</p>
            </div>
            {(queryArgs.startDate || queryArgs.endDate) && (
              <span className="fr-filter-label">
                {queryArgs.startDate} → {queryArgs.endDate}
              </span>
            )}
          </div>
        </div>

        {/* Date filter */}
        <div className="fr-card">
          <form onSubmit={submitHandler}>
            <div className="fr-form-row">
              <div className="fr-field">
                <label className="fr-label">ວັນທີເລີ່ມຕົ້ນ</label>
                <input
                  type="date"
                  className="fr-input"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                />
              </div>
              <div className="fr-field">
                <label className="fr-label">ວັນທີສິ້ນສຸດ</label>
                <input
                  type="date"
                  className="fr-input"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                />
              </div>
              <button type="submit" className="fr-btn fr-btn-primary" disabled={loading}>
                <i className="fas fa-search me-2"></i>ຄົ້ນຫາ
              </button>
              {(queryArgs.startDate || queryArgs.endDate) && (
                <button type="button" className="fr-btn fr-btn-outline" onClick={clearFilter}>
                  ທຸກຊ່ວງ
                </button>
              )}
            </div>
          </form>
        </div>

        {loading ? (
          <Loader />
        ) : (
          <>
            {/* Stat cards */}
            <div className="fr-stat-grid">
              <div className="fr-stat" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <div className="fr-stat-lbl">ຍອດຂາຍທັງໝົດ</div>
                <div className="fr-stat-val">₭{(data?.totalGross || 0).toLocaleString()}</div>
              </div>
              <div className="fr-stat" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
                <div className="fr-stat-lbl">ຕົ້ນທຶນທັງໝົດ</div>
                <div className="fr-stat-val">₭{(data?.totalCOGS || 0).toLocaleString()}</div>
              </div>
              <div className="fr-stat" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                <div className="fr-stat-lbl">ພາສີ (VAT)</div>
                <div className="fr-stat-val">₭{(data?.totalTax || 0).toLocaleString()}</div>
              </div>
              <div className="fr-stat" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                <div className="fr-stat-lbl">ກຳໄລສຸດທິ</div>
                <div className="fr-stat-val">₭{(data?.netProfit || 0).toLocaleString()}</div>
              </div>
            </div>

            {/* Chart */}
            <div className="fr-card">
              <h5 className="fw-bold mb-3" style={{ color: '#374151' }}>ພາບລວມລາຍຮັບ-ລາຍຈ່າຍ</h5>
              <Bar data={chartData} options={chartOptions} />
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default FinanceReport;
