import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function SaleChart({ salesData }) {

  const options = {
    responsive: true,
    maintainAspectRatio: false, // ✅ ปรับให้กราฟยืดตาม container
    plugins: {
      title: {
        display: true,
        text: 'ຂໍ້ມູນການຂາຍ ແລະ ອໍເດີ',
        color: "#1a1a1a",
        font: { size: 20, weight: "bold" },
        padding: 20
      },
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 14 }
        }
      },
      tooltip: {
        backgroundColor: "rgba(0,0,0,0.8)",
        padding: 12,
        bodyFont: { size: 14 },
        titleFont: { size: 16 },
        cornerRadius: 8
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#374151", font: { size: 13 } }
      },
      y: {
        grid: { color: "rgba(0,0,0,0.05)" },
        ticks: { color: "#374151", font: { size: 12 } },
        position: 'left'
      },
      y1: {
        grid: { drawOnChartArea: false },
        ticks: { color: "#9b1c1c", font: { size: 12 } },
        position: 'right'
      }
    }
  };

  const labels = salesData?.map((x) => x.date);

  const data = {
    labels,
    datasets: [
      {
        label: 'ຍອດຂາຍ (Sale)',
        data: salesData?.map((x) => x.sales),
        borderColor: "#0f766e",
        backgroundColor: "rgba(15, 118, 110, 0.2)",
        fill: true, // ✅ สวยขึ้นเหมือนกราฟสมัยใหม่
        tension: 0.4, // ทำเส้นโค้งนุ่ม
        yAxisID: "y"
      },
      {
        label: 'ຈໍານວນອໍເດີ (Orders)',
        data: salesData?.map((x) => x.numOrders),
        borderColor: "#b91c1c",
        backgroundColor: "rgba(185, 28, 28, 0.15)",
        fill: true,
        tension: 0.4,
        yAxisID: "y1"
      }
    ]
  };

  return (
    <div style={{
      height: "420px",
      background: "#fff",
      borderRadius: "12px",
      padding: "20px",
      boxShadow: "0 4px 18px rgba(0,0,0,0.06)"
    }}>
      <Line options={options} data={data} />
    </div>
  );
}
