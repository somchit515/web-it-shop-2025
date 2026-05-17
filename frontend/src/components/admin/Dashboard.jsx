import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import AdminLayout from '../layout/AdminLayout';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import SaleChart from '../charts/SaleChart';
import { useLazyGetDashboardSalesQuery } from '../redux/api/OrderApi';
import { clearUser } from '../redux/features/userSlice';
import Loader from '../layout/Loader';
import toast from 'react-hot-toast';
import { DateTime } from 'luxon';

const TZ = 'Asia/Vientiane';

function startOfDayInZone(date) {
  return DateTime.fromJSDate(new Date(date))
    .setZone(TZ, { keepLocalTime: true })
    .startOf('day')
    .toUTC()
    .toISO();
}
function endOfDayInZone(date) {
  return DateTime.fromJSDate(new Date(date))
    .setZone(TZ, { keepLocalTime: true })
    .endOf('day')
    .toUTC()
    .toISO();
}

function fmtLAK(value) {
  const n = Number(value || 0);
  return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

const PRESETS = [
  { id: 'today',  label: 'ມື້ນີ້' },
  { id: '7d',    label: '7 ວັນ' },
  { id: '30d',   label: '30 ວັນ' },
  { id: 'mtd',   label: 'ເດືອນນີ້' },
  { id: 'ytd',   label: 'ປີນີ້' },
];

function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [startDate, setStartdate] = useState(new Date());
  const [endDate, setEnddate] = useState(new Date());
  const [activePreset, setActivePreset] = useState('today');
  const [chartMode, setChartMode] = useState('daily');

  const [getDashboardSales, { data: salesData, error, isLoading }] =
    useLazyGetDashboardSalesQuery();

  const errorShownRef = useRef(false);
  const initialFetchRef = useRef(false);

  useEffect(() => {
    if (initialFetchRef.current) return;
    initialFetchRef.current = true;
    // Default: today
    const now = new Date();
    const s = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const e = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    setStartdate(s);
    setEnddate(e);
    getDashboardSales({ startDate: startOfDayInZone(s), endDate: endOfDayInZone(e) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!error) { errorShownRef.current = false; return; }
    if (errorShownRef.current) return;
    errorShownRef.current = true;
    const status = error?.status;
    const msg = error?.data?.message || 'ໂຫລດ dashboard ບໍ່ໄດ້';
    if (status === 401) {
      toast.error('ເຊດຊັນໝົດອາຍຸ ກະລຸນາເຂົ້າສູ່ລະບົບໃໝ່');
      dispatch(clearUser());
      setTimeout(() => navigate('/login', { replace: true }), 800);
      return;
    }
    if (status === 403) {
      toast.error('ທ່ານບໍ່ມີສິດເຂົ້າເຖິງໜ້ານີ້');
      setTimeout(() => navigate('/', { replace: true }), 800);
      return;
    }
    toast.error(msg);
  }, [error, dispatch, navigate]);

  // ── Quick preset ──────────────────────────────────────────────
  const applyPreset = (preset) => {
    const now = new Date();
    let s, e;
    switch (preset) {
      case 'today':
        s = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        e = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case '7d':
        s = new Date(now.getTime() - 6 * 86400000);
        e = new Date();
        break;
      case '30d':
        s = new Date(now.getTime() - 29 * 86400000);
        e = new Date();
        break;
      case 'mtd':
        s = new Date(now.getFullYear(), now.getMonth(), 1);
        e = new Date();
        break;
      case 'ytd':
        s = new Date(now.getFullYear(), 0, 1);
        e = new Date();
        break;
      default: return;
    }
    setStartdate(s);
    setEnddate(e);
    setActivePreset(preset);
    errorShownRef.current = false;
    getDashboardSales({ startDate: startOfDayInZone(s), endDate: endOfDayInZone(e) });
  };

  const submitHandler = () => {
    if (!startDate || !endDate || startDate > endDate)
      return toast.error('ກະລຸນາເລືອກຊ່ວງວັນທີ່ຖືກຕ້ອງ');
    setActivePreset(null);
    errorShownRef.current = false;
    getDashboardSales({ startDate: startOfDayInZone(startDate), endDate: endOfDayInZone(endDate) });
  };

  // ── Derived stats ─────────────────────────────────────────────
  const chartSales = salesData?.sales || salesData?.saleData || [];
  const totalSales = Number(salesData?.totalSales ?? 0);
  const totalOrders = Number(salesData?.totalNumOrders ?? salesData?.totalOrders ?? 0);
  const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
  const bestDay = chartSales.length > 0
    ? chartSales.reduce((best, d) => (d.sales > (best?.sales || 0) ? d : best), chartSales[0])
    : null;

  return (
    <>
      <style>{`
        .db-container { padding: 0; }
        .db-title {
          font-size: 1.75rem; font-weight: 700; color: #1e293b; margin-bottom: 0.25rem;
          display: flex; align-items: center; gap: 10px;
        }
        .db-subtitle { font-size: 0.95rem; color: #64748b; margin-bottom: 1.5rem; }

        /* Preset buttons */
        .preset-bar {
          display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 1rem;
          background: white; padding: 1rem 1.25rem;
          border-radius: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          border: 1px solid rgba(0,0,0,0.05); align-items: center;
        }
        .preset-label { font-size: 0.8rem; font-weight: 600; color: #94a3b8; margin-right: 4px; }
        .preset-btn {
          padding: 6px 16px; border-radius: 999px; border: 1.5px solid #e2e8f0;
          background: white; color: #475569; font-size: 0.85rem; font-weight: 600;
          cursor: pointer; transition: all 0.18s ease; white-space: nowrap;
        }
        .preset-btn:hover { border-color: #667eea; color: #667eea; }
        .preset-btn.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white; border-color: transparent;
          box-shadow: 0 4px 12px rgba(102,126,234,0.35);
        }
        .preset-divider { width: 1px; height: 24px; background: #e2e8f0; margin: 0 6px; }

        /* Date filter row */
        .filter-row {
          display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-end;
          background: white; padding: 1.25rem;
          border-radius: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          border: 1px solid rgba(0,0,0,0.05); margin-bottom: 1.5rem;
        }
        .date-field { display: flex; flex-direction: column; gap: 5px; flex: 1; min-width: 160px; }
        .date-label { font-size: 0.8rem; font-weight: 600; color: #475569; }
        .react-datepicker-wrapper { width: 100%; }
        .react-datepicker__input-container input {
          width: 100%; padding: 10px 14px; border: 2px solid #e2e8f0;
          border-radius: 10px; font-size: 0.9rem; transition: all 0.2s ease;
          background: white; color: #1e293b;
        }
        .react-datepicker__input-container input:focus {
          outline: none; border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102,126,234,0.12);
        }
        .btn-fetch {
          padding: 10px 28px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white; border: none; border-radius: 10px; font-size: 0.9rem;
          font-weight: 600; cursor: pointer; transition: all 0.25s ease;
          box-shadow: 0 4px 12px rgba(102,126,234,0.28);
          display: flex; align-items: center; gap: 8px; white-space: nowrap;
        }
        .btn-fetch:hover:not(:disabled) {
          transform: translateY(-2px); box-shadow: 0 6px 20px rgba(102,126,234,0.4);
        }
        .btn-fetch:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        /* Stats grid */
        .stats-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.25rem; margin-bottom: 1.5rem;
        }
        .stat-card {
          background: white; border-radius: 16px; padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          border: 1px solid rgba(0,0,0,0.05); position: relative; overflow: hidden;
          transition: all 0.25s ease;
        }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
        .stat-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        }
        .stat-card.green::before  { background: linear-gradient(90deg, #10b981, #059669); }
        .stat-card.red::before    { background: linear-gradient(90deg, #ef4444, #dc2626); }
        .stat-card.amber::before  { background: linear-gradient(90deg, #f59e0b, #d97706); }
        .stat-card.blue::before   { background: linear-gradient(90deg, #3b82f6, #1d4ed8); }
        .stat-icon-wrap {
          width: 44px; height: 44px; border-radius: 12px; display: flex;
          align-items: center; justify-content: center; font-size: 1.25rem;
          margin-bottom: 0.75rem;
        }
        .stat-icon-wrap.green  { background: rgba(16,185,129,0.1); color: #10b981; }
        .stat-icon-wrap.red    { background: rgba(239,68,68,0.1); color: #ef4444; }
        .stat-icon-wrap.amber  { background: rgba(245,158,11,0.1); color: #f59e0b; }
        .stat-icon-wrap.blue   { background: rgba(59,130,246,0.1); color: #3b82f6; }
        .stat-lbl { font-size: 0.8rem; font-weight: 600; color: #64748b; margin-bottom: 4px; }
        .stat-val {
          font-size: 1.6rem; font-weight: 700; color: #1e293b; line-height: 1.2;
          word-break: break-all;
        }
        .stat-sub { font-size: 0.75rem; color: #94a3b8; margin-top: 4px; }

        /* Chart section */
        .chart-section {
          background: white; border-radius: 16px; padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          border: 1px solid rgba(0,0,0,0.05);
        }
        .chart-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 1.25rem; padding-bottom: 1rem; border-bottom: 1px solid #e2e8f0;
          flex-wrap: wrap; gap: 12px;
        }
        .chart-title {
          font-size: 1.1rem; font-weight: 700; color: #1e293b;
          display: flex; align-items: center; gap: 8px;
        }
        .chart-mode-tabs {
          display: flex; gap: 4px; background: #f1f5f9;
          border-radius: 10px; padding: 4px;
        }
        .chart-mode-tab {
          padding: 6px 18px; border-radius: 8px; border: none; background: transparent;
          font-size: 0.85rem; font-weight: 600; color: #64748b;
          cursor: pointer; transition: all 0.18s ease;
        }
        .chart-mode-tab.active {
          background: white; color: #667eea;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: 1fr 1fr; }
          .preset-bar { gap: 6px; }
          .filter-row { flex-direction: column; }
          .btn-fetch { width: 100%; justify-content: center; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <AdminLayout>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
            <Loader />
          </div>
        ) : null}

        <div className="db-container" style={isLoading ? { display: 'none' } : undefined}>

          {/* Header */}
          <h1 className="db-title">
            <i className="fas fa-chart-line" style={{ color: '#667eea' }} />
            Dashboard
          </h1>
          <p className="db-subtitle">ພາບລວມຍອດຂາຍ ແລະ ສະຖິຕິລະບົບ</p>

          {/* Quick Presets */}
          <div className="preset-bar">
            <span className="preset-label">ດ່ວນ:</span>
            {PRESETS.map((p) => (
              <button
                key={p.id}
                className={`preset-btn${activePreset === p.id ? ' active' : ''}`}
                onClick={() => applyPreset(p.id)}
                disabled={isLoading}
              >
                {p.label}
              </button>
            ))}
            <div className="preset-divider" />
            <span className="preset-label" style={{ marginLeft: 4 }}>ກຳໜົດເອງ:</span>
          </div>

          {/* Custom date range */}
          <div className="filter-row">
            <div className="date-field">
              <label className="date-label">ວັນທີ່ເລີ່ມຕົ້ນ</label>
              <DatePicker
                selected={startDate}
                onChange={(d) => { setStartdate(d); setActivePreset(null); }}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                dateFormat="dd/MM/yyyy"
              />
            </div>
            <div className="date-field">
              <label className="date-label">ວັນທີ່ສິ້ນສຸດ</label>
              <DatePicker
                selected={endDate}
                onChange={(d) => { setEnddate(d); setActivePreset(null); }}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                dateFormat="dd/MM/yyyy"
              />
            </div>
            <button
              className="btn-fetch"
              onClick={submitHandler}
              disabled={isLoading || !startDate || !endDate || startDate > endDate}
            >
              <i className="fas fa-search" />
              {isLoading ? 'ກຳລັງໂຫລດ...' : 'ຄົ້ນຫາ'}
            </button>
          </div>

          {/* Stats cards (4) */}
          <div className="stats-grid">
            <div className="stat-card green">
              <div className="stat-icon-wrap green">
                <i className="fas fa-coins" />
              </div>
              <div className="stat-lbl">ຍອດຂາຍທັງໝົດ</div>
              <div className="stat-val">₭{fmtLAK(totalSales)}</div>
              <div className="stat-sub">ໃນຊ່ວງເວລາທີ່ເລືອກ</div>
            </div>

            <div className="stat-card red">
              <div className="stat-icon-wrap red">
                <i className="fas fa-shopping-cart" />
              </div>
              <div className="stat-lbl">ຈຳນວນອໍເດີ</div>
              <div className="stat-val">{totalOrders.toLocaleString()}</div>
              <div className="stat-sub">ອໍເດີທັງໝົດ</div>
            </div>

            <div className="stat-card amber">
              <div className="stat-icon-wrap amber">
                <i className="fas fa-calculator" />
              </div>
              <div className="stat-lbl">ຍອດຂາຍສະເລ່ຍ / ອໍເດີ</div>
              <div className="stat-val">₭{fmtLAK(avgOrderValue)}</div>
              <div className="stat-sub">Average order value</div>
            </div>

            <div className="stat-card blue">
              <div className="stat-icon-wrap blue">
                <i className="fas fa-star" />
              </div>
              <div className="stat-lbl">ວັນທີ່ຂາຍດີສຸດ</div>
              <div className="stat-val" style={{ fontSize: bestDay ? '1.2rem' : '1.6rem' }}>
                {bestDay ? `₭${fmtLAK(bestDay.sales)}` : '—'}
              </div>
              <div className="stat-sub">
                {bestDay ? bestDay.date : 'ບໍ່ມີຂໍ້ມູນ'}
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="chart-section">
            <div className="chart-header">
              <div className="chart-title">
                <i className="fas fa-chart-area" style={{ color: '#667eea' }} />
                ກຣາບຍອດຂາຍ ແລະ ອໍເດີ
              </div>
              <div className="chart-mode-tabs">
                {[{ id: 'daily', label: 'ລາຍວັນ' }, { id: 'monthly', label: 'ລາຍເດືອນ' }].map((m) => (
                  <button
                    key={m.id}
                    className={`chart-mode-tab${chartMode === m.id ? ' active' : ''}`}
                    onClick={() => setChartMode(m.id)}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
            <SaleChart salesData={chartSales} mode={chartMode} />
          </div>

        </div>
      </AdminLayout>
    </>
  );
}

export default Dashboard;
