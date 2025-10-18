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
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);


export default function SaleChart({ salesData }) {
  // 🚨 เพิ่ม Console Log เพื่อตรวจสอบข้อมูลที่ได้รับ
  console.log("SaleChart received data:", salesData);

  const options = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    stacked: false,
    plugins: {
      title: {
        display: true,
        text: 'ข้อมูลການຂາຍ ແລະ ອໍເດີ',
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  // ✅ FIX: Changed 'data.Date' (uppercase D) to 'data.date' (lowercase d)
  // to match the data structure returned by the backend (orderController.js)
  const labels = salesData?.map((data) => data.date);

  const data = {
    labels,
    datasets: [
      {
        label: 'ຍອດການຂາຍ',
        data: salesData?.map((data) => data.sales),
        borderColor: '#198753',
        backgroundColor: 'rgba(42, 117, 83, 0.5)',
        yAxisID: 'y',
      },
      {
        label: 'ຂໍ້ມູນອໍເດີ',
        data: salesData?.map((data) => data.numOrders),
        borderColor: 'rgb(220, 52, 69)',
        backgroundColor: 'rgba(201, 68, 82, 0.5)',
        yAxisID: 'y1',
      },
    ],
  };
  return <Line options={options} data={data} />;
}
