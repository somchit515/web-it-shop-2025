// exportCSV.js — utility สำหรับ export ข้อมูลเป็น CSV
// ใช้: exportToCSV({
//   filename: 'orders',
//   columns: [
//     { key: '_id', label: 'Order ID' },
//     { key: 'totalAmount', label: 'Total', format: (v) => v.toLocaleString() },
//     { key: 'user.name', label: 'Customer' },  // รองรับ nested
//   ],
//   rows: orders,
// });

import toast from 'react-hot-toast';

/** ดึงค่าจาก nested path เช่น 'user.name' */
function getNestedValue(obj, path) {
  if (!path) return '';
  return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}

function escapeCsvCell(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  // ถ้ามี comma, quote, หรือ newline → ห่อด้วย "" และ escape "
  if (/[,"\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportToCSV({ filename = 'export', columns = [], rows = [] }) {
  if (!rows || rows.length === 0) {
    toast.error('ບໍ່ມີຂໍ້ມູນສຳລັບສົ່ງອອກ');
    return false;
  }

  try {
    // header
    const header = columns.map((c) => escapeCsvCell(c.label || c.key)).join(',');

    // rows
    const dataLines = rows.map((row) =>
      columns
        .map((c) => {
          let val = c.key ? getNestedValue(row, c.key) : '';
          if (typeof c.format === 'function') {
            val = c.format(val, row);
          }
          // ลบ newline เพื่อไม่ทำให้ row แตก
          if (typeof val === 'string') {
            val = val.replace(/\r?\n|\r/g, ' ');
          }
          return escapeCsvCell(val);
        })
        .join(',')
    );

    // เพิ่ม BOM เพื่อให้ Excel เปิดภาษาลาว/ไทยได้ถูก
    const csvContent = '﻿' + [header, ...dataLines].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const dateStr = new Date().toISOString().slice(0, 10);
    const finalName = `${filename}_${dateStr}.csv`;

    const a = document.createElement('a');
    a.href = url;
    a.download = finalName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`ສົ່ງອອກ ${rows.length} ລາຍການເປັນ CSV ສຳເລັດ`);
    return true;
  } catch (err) {
    console.error('exportToCSV error:', err);
    toast.error('ສົ່ງອອກລົ້ມເຫລວ');
    return false;
  }
}
