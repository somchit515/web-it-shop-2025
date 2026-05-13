// ConfirmDialog.jsx — mount ครั้งเดียวใน AdminLayout
// แทนที่ window.confirm() ที่ดูเชยและบล็อก thread
import React, { useEffect, useState, useRef } from 'react';
// import จาก confirmDialogStore เพื่อหลีกเลี่ยง case-collision (Windows filesystem)
import { confirmDialog } from './confirmDialogStore';

const VARIANT_STYLES = {
  primary: { color: '#667eea', bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', icon: 'fa-circle-question' },
  danger: { color: '#ef4444', bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', icon: 'fa-triangle-exclamation' },
  warning: { color: '#f59e0b', bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', icon: 'fa-circle-exclamation' },
};

export default function ConfirmDialog() {
  const [state, setState] = useState({ open: false });
  const confirmBtnRef = useRef(null);

  useEffect(() => {
    return confirmDialog._subscribe(setState);
  }, []);

  // Focus confirm button + ESC = cancel
  useEffect(() => {
    if (!state.open) return;
    const t = setTimeout(() => confirmBtnRef.current?.focus(), 50);
    const onKey = (e) => {
      if (e.key === 'Escape') confirmDialog._resolve(false);
      if (e.key === 'Enter') confirmDialog._resolve(true);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', onKey);
    };
  }, [state.open]);

  if (!state.open) return null;

  const v = VARIANT_STYLES[state.variant] || VARIANT_STYLES.primary;
  const iconClass = state.icon || v.icon;

  return (
    <>
      <style>{`
        .cdlg-overlay {
          position: fixed; inset: 0;
          background: rgba(15, 23, 42, 0.55);
          backdrop-filter: blur(4px);
          z-index: 99999;
          display: grid; place-items: center;
          padding: 16px;
          animation: cdlgFade 0.18s ease-out;
        }
        .cdlg-modal {
          background: white;
          border-radius: 16px;
          padding: 28px 24px 20px;
          max-width: 440px; width: 100%;
          box-shadow: 0 24px 60px rgba(0,0,0,0.25);
          animation: cdlgPop 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .cdlg-icon {
          width: 64px; height: 64px;
          border-radius: 50%;
          display: grid; place-items: center;
          margin: 0 auto 16px;
          background: ${v.color}15;
          color: ${v.color};
          font-size: 28px;
        }
        .cdlg-title {
          text-align: center;
          font-size: 1.2rem; font-weight: 700;
          color: #1e293b; margin: 0 0 8px;
        }
        .cdlg-message {
          text-align: center; color: #64748b;
          font-size: 0.95rem; line-height: 1.55;
          margin: 0 0 22px;
        }
        .cdlg-actions {
          display: flex; gap: 10px;
        }
        .cdlg-btn {
          flex: 1; padding: 12px 18px;
          border-radius: 10px; font-weight: 600;
          font-size: 0.95rem; cursor: pointer;
          transition: all 0.18s ease;
          border: 2px solid transparent;
          font-family: inherit;
        }
        .cdlg-btn-cancel {
          background: white; color: #64748b;
          border-color: #e2e8f0;
        }
        .cdlg-btn-cancel:hover { background: #f8fafc; border-color: #cbd5e1; }
        .cdlg-btn-confirm {
          background: ${v.bg};
          color: white;
          box-shadow: 0 4px 14px ${v.color}55;
        }
        .cdlg-btn-confirm:hover { transform: translateY(-1px); filter: brightness(1.05); }
        @keyframes cdlgFade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes cdlgPop {
          from { opacity: 0; transform: scale(0.94) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
      <div className="cdlg-overlay" onClick={() => confirmDialog._resolve(false)}>
        <div className="cdlg-modal" onClick={(e) => e.stopPropagation()}>
          <div className="cdlg-icon">
            <i className={`fas ${iconClass}`}></i>
          </div>
          <h4 className="cdlg-title">{state.title}</h4>
          {state.message && <p className="cdlg-message">{state.message}</p>}
          <div className="cdlg-actions">
            <button
              type="button"
              className="cdlg-btn cdlg-btn-cancel"
              onClick={() => confirmDialog._resolve(false)}
            >
              {state.cancelText}
            </button>
            <button
              ref={confirmBtnRef}
              type="button"
              className="cdlg-btn cdlg-btn-confirm"
              onClick={() => confirmDialog._resolve(true)}
            >
              {state.confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
