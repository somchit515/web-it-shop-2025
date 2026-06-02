import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MetaData from "../layout/MetaData";

const STATUS_CFG = {
  Unfulfilled: { icon: "📋", color: "#f59e0b", bg: "#fef3c7", label: "ລໍຖ້າດຳເນີນ" },
  Processing:  { icon: "📦", color: "#3b82f6", bg: "#dbeafe", label: "ກຳລັງດຳເນີນ" },
  Shipped:     { icon: "🚚", color: "#06b6d4", bg: "#cffafe", label: "ກຳລັງຈັດສົ່ງ" },
  Delivered:   { icon: "✅", color: "#10b981", bg: "#d1fae5", label: "ສົ່ງສຳເລັດ" },
  Cancelled:   { icon: "🚫", color: "#ef4444", bg: "#fee2e2", label: "ຍົກເລີກ" },
};

const EVENT_LABELS = {
  created: { icon: "🛒", label: "ສ້າງອໍເດີ" },
  processing: { icon: "📦", label: "ກຳລັງດຳເນີນ" },
  shipped: { icon: "🚚", label: "ຈັດສົ່ງແລ້ວ" },
  delivered: { icon: "✅", label: "ສົ່ງສຳເລັດ" },
  cancelled: { icon: "🚫", label: "ຍົກເລີກ" },
  payment_confirmed: { icon: "💰", label: "ຢືນຢັນການຊຳລະ" },
  proof_uploaded: { icon: "📤", label: "ອັບໂຫຼດສະຫຼິບ" },
};

const CSS = `
  .tr-root{background:#f1f5f9;min-height:100vh;font-family:"Noto Sans Lao","Inter",sans-serif;padding-bottom:56px;}
  .tr-hero{background:linear-gradient(135deg,#1e293b 0%,#0f172a 100%);padding:48px 24px 36px;color:#fff;text-align:center;position:relative;overflow:hidden;}
  .tr-hero::after{content:'';position:absolute;right:-80px;top:-80px;width:280px;height:280px;border-radius:50%;background:rgba(255,255,255,.04);}
  .tr-hero-inner{max-width:560px;margin:0 auto;position:relative;z-index:1;}
  .tr-eyebrow{font-size:.72rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#94a3b8;margin-bottom:10px;}
  .tr-title{font-size:2rem;font-weight:800;margin:0 0 6px;}
  .tr-sub{font-size:.88rem;color:rgba(255,255,255,.6);}

  .tr-form-wrap{max-width:560px;margin:-24px auto 0;padding:0 20px;position:relative;z-index:2;}
  .tr-form{background:#fff;border-radius:18px;box-shadow:0 8px 32px rgba(0,0,0,.12);padding:24px;}
  .tr-label{font-size:.82rem;font-weight:700;color:#374151;margin-bottom:6px;display:block;}
  .tr-input{width:100%;padding:12px 16px;border:1.5px solid #e2e8f0;border-radius:12px;font-size:.95rem;font-family:inherit;outline:none;transition:border-color .15s;}
  .tr-input:focus{border-color:#1e293b;box-shadow:0 0 0 3px rgba(30,41,59,.1);}
  .tr-btn{width:100%;padding:13px;border-radius:12px;background:linear-gradient(135deg,#1e293b,#0f172a);color:#fff;border:none;font-size:.95rem;font-weight:700;cursor:pointer;margin-top:12px;font-family:inherit;transition:opacity .15s;}
  .tr-btn:hover{opacity:.88;}
  .tr-btn:disabled{opacity:.5;cursor:not-allowed;}

  .tr-result-wrap{max-width:700px;margin:24px auto 0;padding:0 20px;}
  .tr-result{background:#fff;border-radius:18px;box-shadow:0 4px 24px rgba(0,0,0,.08);overflow:hidden;}

  .tr-status-bar{padding:20px 24px;display:flex;align-items:center;gap:14px;}
  .tr-status-icon{width:52px;height:52px;border-radius:14px;display:grid;place-items:center;font-size:1.4rem;flex-shrink:0;}
  .tr-status-label{font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;opacity:.6;margin-bottom:3px;}
  .tr-status-val{font-size:1.1rem;font-weight:800;}

  .tr-meta{display:grid;grid-template-columns:1fr 1fr;gap:0;border-top:1px solid #f1f5f9;}
  .tr-meta-item{padding:14px 20px;border-right:1px solid #f1f5f9;border-bottom:1px solid #f1f5f9;}
  .tr-meta-item:nth-child(even){border-right:none;}
  .tr-meta-lbl{font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8;margin-bottom:3px;}
  .tr-meta-val{font-size:.88rem;font-weight:600;color:#1e293b;}

  .tr-tl{padding:20px 24px;border-top:1px solid #f1f5f9;}
  .tr-tl-title{font-size:.85rem;font-weight:700;color:#374151;margin-bottom:14px;}
  .tr-tl-item{display:flex;gap:12px;margin-bottom:14px;position:relative;}
  .tr-tl-item:not(:last-child)::after{content:'';position:absolute;left:14px;top:30px;bottom:-6px;width:2px;background:#e2e8f0;}
  .tr-tl-dot{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;font-size:.85rem;flex-shrink:0;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.1);z-index:1;}
  .tr-tl-body{flex:1;}
  .tr-tl-lbl{font-size:.88rem;font-weight:700;color:#1e293b;}
  .tr-tl-note{font-size:.78rem;color:#64748b;margin-top:2px;}
  .tr-tl-time{font-size:.72rem;color:#94a3b8;margin-top:3px;}

  .tr-err{background:#fee2e2;border:1px solid #fca5a5;border-radius:12px;padding:14px 16px;color:#dc2626;font-size:.88rem;font-weight:600;margin-top:16px;text-align:center;}

  @media(max-width:600px){.tr-meta{grid-template-columns:1fr;}.tr-meta-item{border-right:none;}}
`;

const PAYMENT_LABELS = { COD: "ເງິນສົດ (COD)", BankTransfer: "ໂອນເງິນ", PayAtStore: "ຈ່າຍໜ້າຮ້ານ" };

export default function TrackingPage() {
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();
  const [code, setCode]     = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError]   = useState("");

  const handleTrack = async (e) => {
    e.preventDefault();
    const c = code.trim();
    if (!c) return setError("ກະລຸນາໃສ່ລະຫັດພັດດຸ");
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch(`/api/v1/track/${encodeURIComponent(c)}`, { credentials: "include" });
      const json = await res.json();
      if (!res.ok) { setError(json.message || "ບໍ່ພົບລະຫັດນີ້"); return; }
      setResult(json.tracking);
    } catch { setError("ເກີດຂໍ້ຜິດພາດ ກະລຸນາລອງໃໝ່"); }
    finally { setLoading(false); }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleString("lo-LA", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

  const sCfg = result ? (STATUS_CFG[result.status] || { icon: "⏳", color: "#f59e0b", bg: "#fef3c7", label: result.status }) : null;

  return (
    <>
      <MetaData title="ຕິດຕາມພັດດຸ — IT HUBB" />
      <style>{CSS}</style>
      <div className="tr-root">
        <div className="tr-hero">
          <div className="tr-hero-inner">
            <div className="tr-eyebrow">🚚 Order Tracking</div>
            <div className="tr-title">ຕິດຕາມພັດດຸ</div>
            <div className="tr-sub">ໃສ່ລະຫັດພັດດຸ ເພື່ອກວດສະຖານະການຈັດສົ່ງ</div>
          </div>
        </div>

        <div className="tr-form-wrap">
          <div className="tr-form">
            <form onSubmit={handleTrack}>
              <label className="tr-label">ລະຫັດພັດດຸ (Tracking Code)</label>
              <input className="tr-input" value={code} onChange={(e) => setCode(e.target.value)}
                placeholder="ເຊັ່ນ: TH123456789LA" autoFocus />
              {error && <div className="tr-err">⚠️ {error}</div>}
              <button className="tr-btn" type="submit" disabled={loading}>
                {loading ? "🔍 ກຳລັງຄົ້ນຫາ..." : "🔍 ຄົ້ນຫາ"}
              </button>
            </form>
          </div>
        </div>

        {result && sCfg && (
          <div className="tr-result-wrap">
            <div className="tr-result">
              {/* Status */}
              <div className="tr-status-bar" style={{ background: sCfg.bg }}>
                <div className="tr-status-icon" style={{ background: "rgba(255,255,255,.7)" }}>{sCfg.icon}</div>
                <div>
                  <div className="tr-status-label">ສະຖານະ</div>
                  <div className="tr-status-val" style={{ color: sCfg.color }}>{sCfg.label}</div>
                </div>
              </div>

              {/* Meta */}
              <div className="tr-meta">
                <div className="tr-meta-item">
                  <div className="tr-meta-lbl">ລະຫັດພັດດຸ</div>
                  <div className="tr-meta-val" style={{ fontFamily: "monospace" }}>{result.trackingCode}</div>
                </div>
                <div className="tr-meta-item">
                  <div className="tr-meta-lbl">ວິທີຊຳລະ</div>
                  <div className="tr-meta-val">{PAYMENT_LABELS[result.paymentMethod] || result.paymentMethod}</div>
                </div>
                <div className="tr-meta-item">
                  <div className="tr-meta-lbl">ວັນສັ່ງ</div>
                  <div className="tr-meta-val">{formatDate(result.createdAt)}</div>
                </div>
                <div className="tr-meta-item">
                  <div className="tr-meta-lbl">ອັບເດດລ່າສຸດ</div>
                  <div className="tr-meta-val">{formatDate(result.updatedAt)}</div>
                </div>
              </div>

              {/* Timeline */}
              {result.events?.length > 0 && (
                <div className="tr-tl">
                  <div className="tr-tl-title">ປະຫວັດການດຳເນີນ</div>
                  {[...result.events].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)).map((ev, i) => {
                    const cfg = EVENT_LABELS[ev.type] || { icon: "📝", label: ev.type };
                    return (
                      <div key={i} className="tr-tl-item">
                        <div className="tr-tl-dot" style={{ background: "#4f46e5", color: "#fff" }}>{cfg.icon}</div>
                        <div className="tr-tl-body">
                          <div className="tr-tl-lbl">{cfg.label}</div>
                          {ev.note && <div className="tr-tl-note">{ev.note}</div>}
                          <div className="tr-tl-time">{formatDate(ev.timestamp)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
