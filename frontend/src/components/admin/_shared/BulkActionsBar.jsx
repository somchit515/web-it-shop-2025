// BulkActionsBar.jsx — sticky toolbar ที่โผล่เมื่อ select รายการ
// ใช้:
//   <BulkActionsBar
//     count={bulk.selectedCount}
//     onClear={bulk.clear}
//     actions={[
//       { label: 'ລົບທີ່ເລືອກ', icon: 'fa-trash', variant: 'danger', onClick: handleBulkDelete },
//       { label: 'Export CSV', icon: 'fa-download', onClick: handleBulkExport },
//     ]}
//   />
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faCheckSquare } from '@fortawesome/free-solid-svg-icons';

const VARIANT_CLS = {
  primary: 'bab-btn-primary',
  danger: 'bab-btn-danger',
  success: 'bab-btn-success',
  warning: 'bab-btn-warning',
};

export default function BulkActionsBar({ count = 0, onClear, actions = [] }) {
  if (count === 0) return null;

  return (
    <>
      <style>{`
        .bab-bar {
          position: sticky;
          top: 0;
          z-index: 50;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 14px;
          padding: 12px 18px;
          margin-bottom: 16px;
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.35);
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          animation: babSlide 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes babSlide {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .bab-info {
          display: flex; align-items: center; gap: 10px;
          font-weight: 600;
        }
        .bab-count-badge {
          background: rgba(255,255,255,0.22);
          padding: 4px 12px;
          border-radius: 999px;
          font-weight: 700;
        }
        .bab-actions {
          display: flex; gap: 8px; flex-wrap: wrap;
          margin-left: auto;
        }
        .bab-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 14px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.875rem;
          border: none;
          cursor: pointer;
          transition: all 0.18s ease;
          font-family: inherit;
          background: rgba(255,255,255,0.18);
          color: white;
        }
        .bab-btn:hover { background: rgba(255,255,255,0.28); transform: translateY(-1px); }
        .bab-btn-danger { background: #ef4444; }
        .bab-btn-danger:hover { background: #dc2626; }
        .bab-btn-success { background: #10b981; }
        .bab-btn-success:hover { background: #059669; }
        .bab-btn-warning { background: #f59e0b; color: #422006; }
        .bab-btn-warning:hover { background: #d97706; }
        .bab-clear {
          width: 32px; height: 32px;
          display: grid; place-items: center;
          background: rgba(255,255,255,0.18);
          border: none;
          border-radius: 8px;
          color: white;
          cursor: pointer;
          transition: all 0.18s ease;
        }
        .bab-clear:hover { background: rgba(255,255,255,0.28); }
      `}</style>
      <div className="bab-bar">
        <div className="bab-info">
          <FontAwesomeIcon icon={faCheckSquare} />
          <span>ເລືອກແລ້ວ</span>
          <span className="bab-count-badge">{count}</span>
          <span>ລາຍການ</span>
        </div>
        <div className="bab-actions">
          {actions.map((a, i) => (
            <button
              key={i}
              type="button"
              className={`bab-btn ${VARIANT_CLS[a.variant] || ''}`}
              onClick={a.onClick}
              disabled={a.disabled}
            >
              {a.icon && <i className={`fas ${a.icon}`}></i>}
              {a.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="bab-clear"
          onClick={onClear}
          title="ຍົກເລີກການເລືອກ"
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>
      </div>
    </>
  );
}
