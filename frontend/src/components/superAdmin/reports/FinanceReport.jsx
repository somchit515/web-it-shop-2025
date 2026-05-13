// src/components/superAdmin/reports/FinanceReport.jsx
import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import Loader from '../../layout/Loader';
import MetaData from '../../layout/MetaData';
import { toast } from 'react-hot-toast';
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
import AdminLayout from '../../layout/AdminLayout';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const FinanceReport = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ รับ dates เป็น argument → useCallback identity คงที่ → ไม่ trigger fetch
  //    ทุกครั้งที่ user พิมพ์วันที่
  const fetchFinanceData = useCallback(async (s = '', e = '') => {
    try {
      setLoading(true);
      const config = { withCredentials: true };
      let url = '/api/v1/admin/reports/finance';
      if (s && e) url += `?startDate=${s}&endDate=${e}`;
      const res = await axios.get(url, config);
      setData(res.data.report);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້');
    } finally {
      setLoading(false);
    }
  }, []);

  // ดึงข้อมูลครั้งแรกเมื่อ mount
  useEffect(() => {
    fetchFinanceData();
  }, [fetchFinanceData]);

  const submitHandler = (e) => {
    e.preventDefault();
    fetchFinanceData(startDate, endDate);
  };

  // ข้อมูลกราฟ (เปลี่ยนเป็นสีเทา-ดำ)
  const chartData = {
    labels: ['ຍອດຂາຍສິນຄ້າ', 'ຄ່າຂົນສົ່ງ', 'ພາສີ', 'ຕົ້ນທຶນສິນຄ້າ', 'ກຳໄລສຸດທິ'],
    datasets: [
      {
        label: 'ຈຳນວນເງິນ (₭)',
        data: data ? [
          data.totalSales,
          data.totalShipping,
          data.totalTax,
          data.totalCOGS,
          data.netProfit
        ] : [],
        backgroundColor: [
          'rgba(120,120,120,.7)',
          'rgba(160,160,160,.7)',
          'rgba(100,100,100,.7)',
          'rgba(180,180,180,.7)',
          'rgba(60,60,60,.7)',
        ],
        borderColor: [
          '#777','#999','#666','#aaa','#555'
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#444' } },
      title: { display: false },
      tooltip: { backgroundColor: '#333', titleColor: '#fff', bodyColor: '#fff' }
    },
    scales: {
      x: { ticks: { color: '#555' }, grid: { color: 'rgba(0,0,0,.05)' } },
      y: { ticks: { color: '#555' }, grid: { color: 'rgba(0,0,0,.05)' } }
    }
  };

  return (
    <AdminLayout>
      <MetaData title={'ລາຍງານການເງິນ'} />
      <div className="container mt-5">
        <h1 className="mb-4 text-center">📊 ລາຍງານການເງິນ</h1>

        {/* Filter ส่วนเลือกวันที่ */}
        <div className="card p-3 mb-4 shadow-sm">
          <form onSubmit={submitHandler} className="row align-items-end">
            <div className="col-md-4">
              <label className="form-label">ວັນທີເລີ່ມຕົ້ນ</label>
              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">ວັນທີສິ້ນສຸດ</label>
              <input
                type="date"
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <button type="submit" className="btn btn-dark w-100">
                <i className="fa fa-search"></i> ຄົ້ນຫາ
              </button>
            </div>
          </form>
        </div>

        {loading ? (
          <Loader />
        ) : (
          <div className="row">
            {/* Card สรุปตัวเลข (เปลี่ยนเป็นสีเทา-ดำ) */}
            <div className="col-md-12 mb-4">
              <div className="row text-center">
                <div className="col-md-3 mb-2">
                  <div className="card bg-light text-dark shadow p-3">
                    <h5>ຍອດຂາຍທັງໝົດ</h5>
                    <h3>₭{data?.totalGross?.toLocaleString()}</h3>
                  </div>
                </div>
                <div className="col-md-3 mb-2">
                  <div className="card bg-secondary text-white shadow p-3">
                    <h5>ຕົ້ນທຶນທັງໝົດ</h5>
                    <h3>₭{data?.totalCOGS?.toLocaleString()}</h3>
                  </div>
                </div>
                <div className="col-md-3 mb-2">
                  <div className="card bg-dark text-white shadow p-3">
                    <h5>ພາສີທັງໝົດ</h5>
                    <h3>₭{data?.totalTax?.toLocaleString()}</h3>
                  </div>
                </div>
                <div className="col-md-3 mb-2">
                  <div className="card bg-success text-white shadow p-3">
                    <h5>ກຳໄລສຸດທິ</h5>
                    <h3>₭{data?.netProfit?.toLocaleString()}</h3>
                  </div>
                </div>
              </div>
            </div>

            {/* ส่วนแสดงกราฟ (สีเทา-ดำ) */}
            <div className="col-md-8 offset-md-2 mt-4">
              <div className="card p-4 shadow-sm">
                <h4 className="text-center mb-3">ພາບລວມລາຍຮັບ-ລາຍຈ່າຍ</h4>
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default FinanceReport;