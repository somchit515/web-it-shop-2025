import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import AdminLayout from '../layout/AdminLayout';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import SaleChart from '../charts/SaleChart';
import { useLazyGetDashboardSalesQuery } from '../redux/api/OrderApi';
import { clearUser } from '../redux/features/userSlice';
import Loader from "../layout/Loader";
import toast from "react-hot-toast";
import { DateTime } from 'luxon';

// ตั้งค่า timezone และรูปแบบตัวเลข
const TZ = 'Asia/Vientiane';
const USE_EU_FORMAT = false;

// เวอร์ชัน timezone-aware
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

// ฟังก์ชันฟอร์แมตราคา
function formatCurrencyLAK(value) {
  const num = Number(value || 0);
  if (!USE_EU_FORMAT) {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } else {
    const en = num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return en.replace(/,/g, '#').replace(/\./, ',').replace(/#/g, '.');
  }
}

function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [startDate, setStartdate] = useState(new Date());
  const [endDate, setEnddate] = useState(new Date());

  const [getDashboardSales, { data: salesData, error, isLoading }] = useLazyGetDashboardSalesQuery();

  // ✅ ป้องกัน Toast Spam: ใช้ ref เก็บสถานะว่าเคยแสดง toast ไปแล้ว
  const errorShownRef = useRef(false);
  const initialFetchRef = useRef(false);

  // Initial fetch ครั้งเดียวเมื่อ mount
  useEffect(() => {
    if (initialFetchRef.current) return;
    initialFetchRef.current = true;
    const s = startOfDayInZone(startDate);
    const e = endOfDayInZone(endDate);
    getDashboardSales({ startDate: s, endDate: e });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // จัดการ error แบบไม่ spam toast + redirect ถ้า 401
  useEffect(() => {
    if (!error) {
      errorShownRef.current = false;
      return;
    }
    if (errorShownRef.current) return;
    errorShownRef.current = true;

    const status = error?.status;
    const msg = error?.data?.message || 'Failed to fetch dashboard sales.';

    // ถ้า session หมดอายุ → clear state แล้ว redirect ไปหน้า login
    if (status === 401 || /login|ເຂົ້າສູ່ລະບົບ/i.test(msg)) {
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

  const submitHandler = () => {
    if (!startDate || !endDate || startDate > endDate) {
      return toast.error("Please select a valid date range.");
    }
    errorShownRef.current = false; // reset เพื่อให้ toast ใหม่ได้ถ้ามี error
    const s = startOfDayInZone(startDate);
    const e = endOfDayInZone(endDate);
    getDashboardSales({ startDate: s, endDate: e });
  };

  const chartSales = salesData?.sales || salesData?.saleData || [];
  const totalSales = Number(salesData?.totalSales ?? 0);
  const totalOrders = Number(salesData?.totalNumOrders ?? salesData?.totalOrders ?? 0);

  return (
    <>
      <style>{`
        /* Dashboard Specific Styles */
        .dashboard-container {
          padding: 0;
          height: 100%;
        }

        .dashboard-header {
          margin-bottom: 2rem;
        }

        .dashboard-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 0.5rem;
        }

        .dashboard-subtitle {
          font-size: 0.95rem;
          color: #64748b;
        }

        /* Date Filter Section */
        .filter-section {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          margin-bottom: 1.5rem;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        .filter-title {
          font-size: 1rem;
          font-weight: 600;
          color: #334155;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .filter-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          align-items: end;
        }

        .date-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .date-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #475569;
        }

        .react-datepicker-wrapper {
          width: 100%;
        }

        .react-datepicker__input-container input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 0.95rem;
          transition: all 0.2s ease;
          background: white;
          color: #1e293b;
        }

        .react-datepicker__input-container input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
        }

        .btn-fetch {
          padding: 12px 32px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          height: fit-content;
        }

        .btn-fetch:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .btn-fetch:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        /* Stats Cards */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
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
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        }

        .stat-card.success::before {
          background: linear-gradient(90deg, #10b981 0%, #059669 100%);
        }

        .stat-card.danger::before {
          background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%);
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }

        .stat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .stat-icon.success {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%);
          color: #10b981;
        }

        .stat-icon.danger {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%);
          color: #ef4444;
        }

        .stat-trend {
          font-size: 0.75rem;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 6px;
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
        }

        .stat-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #64748b;
          margin-bottom: 0.5rem;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: #1e293b;
          line-height: 1.2;
        }

        .stat-value.success {
          color: #10b981;
        }

        .stat-value.danger {
          color: #ef4444;
        }

        .stat-description {
          font-size: 0.8rem;
          color: #94a3b8;
          margin-top: 0.5rem;
        }

        /* Chart Section */
        .chart-section {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(0, 0, 0, 0.05);
          margin-bottom: 2rem;
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .chart-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .chart-subtitle {
          font-size: 0.875rem;
          color: #64748b;
        }

        /* Responsive */
        @media (max-width: 991.98px) {
          .filter-grid {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .dashboard-title {
            font-size: 1.5rem;
          }
        }

        @media (max-width: 767.98px) {
          .filter-section {
            padding: 1rem;
          }

          .chart-section {
            padding: 1rem;
          }

          .stat-card {
            padding: 1rem;
          }

          .stat-value {
            font-size: 1.5rem;
          }

          .dashboard-header {
            margin-bottom: 1rem;
          }
        }

        @media (max-width: 575.98px) {
          .dashboard-title {
            font-size: 1.25rem;
          }

          .btn-fetch {
            width: 100%;
          }
        }
      `}</style>

      <AdminLayout>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
            <Loader />
          </div>
        ) : null}
        <div className="dashboard-container" style={isLoading ? { display: 'none' } : undefined}>
          {/* Dashboard Header */}
          <div className="dashboard-header">
            <h1 className="dashboard-title">
              <i className="fas fa-chart-line" style={{ color: '#667eea' }}></i> Dashboard
            </h1>
            <p className="dashboard-subtitle">
              ພາບລວມຍອດຂາຍ ແລະ ສະຖິຕິລະບົບ
            </p>
          </div>

          {/* Filter Section */}
          <div className="filter-section">
            <div className="filter-title">
              <i className="fas fa-calendar-alt" style={{ color: '#667eea' }}></i>
              ເລືອກຊ່ວງເວລາ
            </div>
            <div className="filter-grid">
              <div className="date-field">
                <label className="date-label">ວັນທີ່ເລີ່ມຕົ້ນ</label>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartdate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  className='form-control'
                  dateFormat="dd/MM/yyyy"
                />
              </div>
              
              <div className="date-field">
                <label className="date-label">ວັນທີ່ສິ້ນສຸດ</label>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEnddate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  className='form-control'
                  dateFormat="dd/MM/yyyy"
                />
              </div>

              <button
                className="btn-fetch"
                onClick={submitHandler}
                disabled={isLoading || !startDate || !endDate || startDate > endDate}
              >
                <i className="fas fa-search"></i>
                {isLoading ? 'ກຳລັງໂຫລດ...' : 'ຄົ້ນຫາ'}
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            {/* Total Sales Card */}
            <div className="stat-card success">
              <div className="stat-header">
                <div className="stat-icon success">
                  <i className="fas fa-dollar-sign"></i>
                </div>
                <div className="stat-trend">
                  <i className="fas fa-arrow-up"></i> ລວມ
                </div>
              </div>
              <div className="stat-label">ຍອດຂາຍທັງໝົດ</div>
              <div className="stat-value success">
                ₭{formatCurrencyLAK(totalSales)}
              </div>
              <div className="stat-description">
                ຍອດຂາຍໃນຊ່ວງເວລາທີ່ເລືອກ
              </div>
            </div>

            {/* Total Orders Card */}
            <div className="stat-card danger">
              <div className="stat-header">
                <div className="stat-icon danger">
                  <i className="fas fa-shopping-cart"></i>
                </div>
                <div className="stat-trend">
                  <i className="fas fa-chart-bar"></i> ຈຳນວນ
                </div>
              </div>
              <div className="stat-label">ຈຳນວນອໍເດີທັງໝົດ</div>
              <div className="stat-value danger">
                {totalOrders.toLocaleString()}
              </div>
              <div className="stat-description">
                ອໍເດີທີ່ສຳເລັດໃນຊ່ວງເວລານີ້
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="chart-section">
            <div className="chart-header">
              <div>
                <div className="chart-title">
                  <i className="fas fa-chart-area" style={{ color: '#667eea' }}></i>
                  ກຣາບຍອດຂາຍ ແລະ ອໍເດີ
                </div>
                <div className="chart-subtitle">
                  ສະແດງຂໍ້ມູນໃນແຕ່ລະວັນ
                </div>
              </div>
            </div>
            <SaleChart salesData={Array.isArray(chartSales) ? chartSales : []} />
          </div>
        </div>
      </AdminLayout>
    </>
  );
}

export default Dashboard;