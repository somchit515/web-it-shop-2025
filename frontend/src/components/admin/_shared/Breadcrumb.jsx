// Breadcrumb.jsx — reusable breadcrumb สำหรับหน้า admin
// ใช้: <Breadcrumb items={[{label: 'ສິນຄ້າ', to: '/admin/products'}, {label: 'ແກ້ໄຂ'}]} />
// หรือ Auto-generate จาก URL: <Breadcrumb auto />
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faChevronRight } from '@fortawesome/free-solid-svg-icons';

// แมป path → ป้ายภาษาลาว
const PATH_LABELS = {
  admin: 'Admin',
  dashboard: 'Dashboard',
  products: 'ສິນຄ້າ',
  product: 'ສິນຄ້າ',
  new: 'ເພີ່ມໃໝ່',
  orders: 'ອໍເດີ',
  users: 'ຜູ້ໃຊ້',
  reviews: 'ຄຳຄິດເຫັນ',
  blog: 'Blog',
  blogs: 'Blog',
  shipments: 'ການຈັດສົ່ງ',
  'completed-orders': 'ອໍເດີສຳເລັດ',
  'verify-payments': 'ຢືນຢັນການຊຳລະ',
  reports: 'ລາຍງານ',
  finance: 'ການເງິນ',
  customers: 'ລູກຄ້າ',
  sales: 'ຍອດຂາຍ',
  shipping: 'ການຂົນສົ່ງ',
  status: 'ສະຖານະ',
  upload_images: 'ອັບໂຫຼດຮູບ',
  edit: 'ແກ້ໄຂ',
};

function autoItemsFromPath(pathname) {
  const segments = pathname.split('/').filter(Boolean);
  const items = [];
  let currentPath = '';
  segments.forEach((seg, idx) => {
    currentPath += '/' + seg;
    // ข้าม segment ที่เป็น id (24-char hex หรือ uuid)
    if (/^[0-9a-fA-F]{20,}$/.test(seg) || /^[0-9a-fA-F-]{30,}$/.test(seg)) return;

    const label = PATH_LABELS[seg] || seg;
    const isLast = idx === segments.length - 1;
    items.push({ label, to: isLast ? undefined : currentPath });
  });
  return items;
}

export default function Breadcrumb({ items, auto = false, className = '' }) {
  const location = useLocation();
  const list = auto ? autoItemsFromPath(location.pathname) : (items || []);

  return (
    <>
      <style>{`
        .bc-nav {
          display: flex; align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          font-size: 0.875rem;
          color: #64748b;
          margin-bottom: 0.75rem;
        }
        .bc-link {
          color: #667eea;
          text-decoration: none;
          display: inline-flex; align-items: center;
          gap: 6px;
          padding: 4px 8px;
          border-radius: 6px;
          transition: all 0.15s ease;
        }
        .bc-link:hover {
          background: rgba(102, 126, 234, 0.08);
          color: #764ba2;
        }
        .bc-current {
          color: #1e293b;
          font-weight: 600;
          padding: 4px 8px;
        }
        .bc-sep {
          color: #cbd5e1;
          font-size: 0.65rem;
        }
      `}</style>
      <nav className={`bc-nav ${className}`} aria-label="breadcrumb">
        <Link to="/admin/dashboard" className="bc-link">
          <FontAwesomeIcon icon={faHome} />
          <span>ໜ້າຫຼັກ</span>
        </Link>
        {list.map((item, i) => (
          <React.Fragment key={`${item.label}-${i}`}>
            <FontAwesomeIcon icon={faChevronRight} className="bc-sep" />
            {item.to ? (
              <Link to={item.to} className="bc-link">{item.label}</Link>
            ) : (
              <span className="bc-current" aria-current="page">{item.label}</span>
            )}
          </React.Fragment>
        ))}
      </nav>
    </>
  );
}
