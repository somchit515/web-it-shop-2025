import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Title, Tooltip, Legend, Filler
);

const MONTH_LAO = {
  '01': 'ມ.ກ', '02': 'ກ.ພ', '03': 'ມີ.ນາ',
  '04': 'ເມ.ສາ', '05': 'ພ.ພ', '06': 'ມິ.ຖ',
  '07': 'ກ.ລ', '08': 'ສ.ຫາ', '09': 'ກ.ຍ',
  '10': 'ຕ.ລ', '11': 'ພ.ຈ', '12': 'ທ.ວ',
};

function groupByMonth(data) {
  const map = new Map();
  for (const d of data) {
    const [year, month] = d.date.split('-');
    const key = `${year}-${month}`;
    const prev = map.get(key) || { date: key, sales: 0, numOrders: 0 };
    prev.sales += d.sales || 0;
    prev.numOrders += d.numOrders || 0;
    map.set(key, prev);
  }
  return [...map.values()];
}

function fmtLabel(dateStr, mode) {
  if (mode === 'monthly') {
    const [year, month] = dateStr.split('-');
    return `${MONTH_LAO[month] || month} ${year}`;
  }
  return dateStr;
}

function buildOptions(mode) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { usePointStyle: true, padding: 20, font: { size: 13 } },
      },
      tooltip: {
        backgroundColor: 'rgba(15,23,42,0.88)',
        padding: 14,
        bodyFont: { size: 13 },
        titleFont: { size: 14, weight: 'bold' },
        cornerRadius: 10,
        callbacks: {
          label: (ctx) =>
            ctx.datasetIndex === 0
              ? ` ₭${Number(ctx.raw).toLocaleString()}`
              : ` ${ctx.raw} ອໍເດີ`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#374151', font: { size: 12 } },
      },
      y: {
        grid: { color: 'rgba(0,0,0,0.05)' },
        position: 'left',
        ticks: {
          color: '#0f766e',
          font: { size: 11 },
          callback: (v) => `₭${Number(v).toLocaleString()}`,
        },
        title: { display: true, text: 'ຍອດຂາຍ (₭)', color: '#0f766e', font: { size: 12 } },
      },
      y1: {
        grid: { drawOnChartArea: false },
        position: 'right',
        ticks: { color: '#b91c1c', font: { size: 11 } },
        title: { display: true, text: 'ອໍເດີ', color: '#b91c1c', font: { size: 12 } },
      },
    },
  };
}

export default function SaleChart({ salesData, mode = 'daily' }) {
  const raw = Array.isArray(salesData) ? salesData : [];
  const display = mode === 'monthly' ? groupByMonth(raw) : raw;
  const labels = display.map((x) => fmtLabel(x.date, mode));

  const salesDS = {
    label: 'ຍອດຂາຍ (₭)',
    data: display.map((x) => x.sales),
    borderColor: '#0f766e',
    backgroundColor: mode === 'monthly' ? 'rgba(15,118,110,0.7)' : 'rgba(15,118,110,0.15)',
    yAxisID: 'y',
  };
  const ordersDS = {
    label: 'ຈຳນວນອໍເດີ',
    data: display.map((x) => x.numOrders),
    borderColor: '#b91c1c',
    backgroundColor: mode === 'monthly' ? 'rgba(185,28,28,0.7)' : 'rgba(185,28,28,0.12)',
    yAxisID: 'y1',
  };

  const opts = buildOptions(mode);

  if (mode === 'daily') {
    return (
      <div style={{ height: 420 }}>
        <Line
          options={opts}
          data={{
            labels,
            datasets: [
              { ...salesDS, fill: true, tension: 0.4, pointRadius: 3, pointHoverRadius: 6 },
              { ...ordersDS, fill: true, tension: 0.4, pointRadius: 3, pointHoverRadius: 6 },
            ],
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ height: 420 }}>
      <Bar
        options={{ ...opts, barPercentage: 0.65, categoryPercentage: 0.8 }}
        data={{ labels, datasets: [salesDS, ordersDS] }}
      />
    </div>
  );
}
