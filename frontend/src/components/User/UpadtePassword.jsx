import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUpdatePasswordMutation } from '../redux/api/userApi';
import toast from 'react-hot-toast';
import MetaData from '../layout/MetaData';

const STRENGTH = [
  { label: 'ຕ່ຳຫຼາຍ', color: '#ef4444', bg: '#fee2e2' },
  { label: 'ງ່າຍ',     color: '#f59e0b', bg: '#fef3c7' },
  { label: 'ທຳມະດາ',  color: '#f59e0b', bg: '#fef3c7' },
  { label: 'ດີ',        color: '#10b981', bg: '#d1fae5' },
  { label: 'ແຂງແກ່ນ',  color: '#10b981', bg: '#d1fae5' },
];

function getStrength(pwd) {
  if (!pwd) return 0;
  let s = 0;
  if (pwd.length >= 8) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/[0-9]/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  return s;
}

const CSS = `
  .pw-root{background:#f1f5f9;min-height:100vh;font-family:"Noto Sans Lao","Inter",sans-serif;}
  .pw-hero{background:linear-gradient(135deg,#1e293b 0%,#334155 60%,#1e293b 100%);padding:48px 40px 100px;position:relative;overflow:hidden;}
  .pw-hero::before{content:'';position:absolute;right:-80px;top:-80px;width:300px;height:300px;border-radius:50%;background:rgba(255,255,255,.04);pointer-events:none;}
  .pw-hero-inner{max-width:640px;margin:0 auto;position:relative;z-index:1;}
  .pw-back{display:inline-flex;align-items:center;gap:6px;color:rgba(255,255,255,.6);text-decoration:none;font-size:.82rem;font-weight:600;margin-bottom:16px;transition:color .15s;}
  .pw-back:hover{color:#fff;}
  .pw-eyebrow{font-size:.72rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.5);margin-bottom:8px;}
  .pw-title{font-size:2.2rem;font-weight:900;color:#fff;margin:0 0 4px;}
  .pw-sub{font-size:.9rem;color:rgba(255,255,255,.55);}

  .pw-main{max-width:640px;margin:-60px auto 0;padding:0 24px 56px;position:relative;z-index:2;}
  @media(max-width:600px){.pw-main{padding:0 14px 56px;}}

  .pw-card{background:#fff;border-radius:24px;box-shadow:0 12px 48px rgba(0,0,0,.12);border:1px solid #e2e8f0;overflow:hidden;}
  .pw-card-head{padding:28px 36px 20px;border-bottom:1px solid #f1f5f9;}
  .pw-card-title{font-size:1.2rem;font-weight:800;color:#1e293b;margin:0 0 2px;}
  .pw-card-sub{font-size:.82rem;color:#64748b;}
  .pw-card-body{padding:32px 36px;}
  @media(max-width:600px){.pw-card-head{padding:20px 20px 16px;}.pw-card-body{padding:24px 20px;}}

  .pw-field{margin-bottom:24px;}
  .pw-label{display:block;font-size:.82rem;font-weight:700;color:#374151;margin-bottom:6px;}
  .pw-input-wrap{position:relative;}
  .pw-input{width:100%;padding:13px 48px 13px 16px;border:1.5px solid #e2e8f0;border-radius:12px;font-size:.95rem;font-family:inherit;outline:none;transition:border-color .15s,box-shadow .15s;background:#fff;color:#1e293b;}
  .pw-input:focus{border-color:#1e293b;box-shadow:0 0 0 3px rgba(30,41,59,.08);}
  .pw-eye{position:absolute;right:14px;top:50%;transform:translateY(-50%);background:none;border:none;color:#94a3b8;cursor:pointer;padding:4px;font-size:.9rem;transition:color .15s;}
  .pw-eye:hover{color:#1e293b;}
  .pw-hint{font-size:.72rem;color:#94a3b8;margin-top:5px;}

  /* Strength bar */
  .pw-strength{margin-top:10px;}
  .pw-str-bar{height:6px;border-radius:999px;background:#f1f5f9;overflow:hidden;margin-bottom:5px;}
  .pw-str-fill{height:100%;border-radius:999px;transition:width .3s,background .3s;}
  .pw-str-row{display:flex;justify-content:space-between;align-items:center;}
  .pw-str-label{font-size:.72rem;font-weight:700;}
  .pw-str-len{font-size:.72rem;color:#94a3b8;}

  /* Tips */
  .pw-tips{background:#f8fafc;border-radius:12px;padding:14px 16px;margin-bottom:24px;}
  .pw-tips-title{font-size:.75rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;}
  .pw-tip{display:flex;align-items:center;gap:7px;font-size:.78rem;color:#64748b;margin-bottom:5px;}
  .pw-tip:last-child{margin-bottom:0;}
  .pw-tip-icon{font-size:.8rem;}

  .pw-actions{display:flex;gap:12px;margin-top:8px;}
  .pw-save-btn{flex:1;padding:14px;border-radius:14px;background:linear-gradient(135deg,#1e293b,#0f172a);color:#fff;border:none;font-size:1rem;font-weight:800;cursor:pointer;font-family:inherit;transition:opacity .15s,transform .15s;box-shadow:0 8px 24px rgba(15,23,42,.25);}
  .pw-save-btn:hover:not(:disabled){opacity:.88;transform:translateY(-2px);}
  .pw-save-btn:disabled{opacity:.5;cursor:not-allowed;transform:none;}
  .pw-cancel-btn{padding:14px 20px;border-radius:14px;border:1.5px solid #e2e8f0;background:#fff;color:#64748b;font-size:.9rem;font-weight:700;cursor:pointer;font-family:inherit;text-decoration:none;display:inline-flex;align-items:center;transition:all .15s;}
  .pw-cancel-btn:hover{border-color:#1e293b;color:#1e293b;}
`;

export default function UpdatePassword() {
  const navigate = useNavigate();
  const [oldPwd,   setOldPwd]   = useState('');
  const [newPwd,   setNewPwd]   = useState('');
  const [showOld,  setShowOld]  = useState(false);
  const [showNew,  setShowNew]  = useState(false);

  const [updatePassword, { isLoading, error, isSuccess }] = useUpdatePasswordMutation();

  useEffect(() => {
    if (error)     toast.error(error?.data?.message || 'ມີບາງຢ່າງຜິດພາດ');
    if (isSuccess) { toast.success('✅ ປ່ຽນລະຫັດຜ່ານສຳເລັດ'); navigate('/me/profile'); }
  }, [error, isSuccess, navigate]);

  const strength = getStrength(newPwd);
  const strCfg   = STRENGTH[strength] || STRENGTH[0];

  const TIPS = [
    { ok: newPwd.length >= 8,          text: 'ຢ່າງນ້ອຍ 8 ຕົວ' },
    { ok: /[A-Z]/.test(newPwd),        text: 'ມີຕົວໃຫຍ່ (A-Z)' },
    { ok: /[0-9]/.test(newPwd),        text: 'ມີຕົວເລກ (0-9)' },
    { ok: /[^A-Za-z0-9]/.test(newPwd), text: 'ມີສັນຍາລັກ (!@#...)' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!oldPwd || !newPwd)    return toast.error('ກະລຸນາໃສ່ລະຫັດທັງ 2 ຊ່ອງ');
    if (newPwd.length < 8)     return toast.error('ລະຫັດໃໝ່ຕ້ອງຢ່າງນ້ອຍ 8 ຕົວ');
    if (oldPwd === newPwd)     return toast.error('ລະຫັດໃໝ່ຕ້ອງຕ່າງຈາກລະຫັດເກົ່າ');
    updatePassword({ oldPassword: oldPwd, password: newPwd });
  };

  return (
    <>
      <MetaData title="ປ່ຽນລະຫັດຜ່ານ — IT HUBB" />
      <style>{CSS}</style>
      <div className="pw-root">
        <div className="pw-hero">
          <div className="pw-hero-inner">
            <Link to="/me/profile" className="pw-back">← ກັບໄປໂປຣຟາຍ</Link>
            <div className="pw-eyebrow">🔑 Security</div>
            <div className="pw-title">ປ່ຽນລະຫັດຜ່ານ</div>
            <div className="pw-sub">ຮັກສາຄວາມປອດໄພດ້ວຍລະຫັດທີ່ເຂັ້ມແຂງ</div>
          </div>
        </div>

        <div className="pw-main">
          <div className="pw-card">
            <div className="pw-card-head">
              <div className="pw-card-title">🔐 ຕັ້ງລະຫັດໃໝ່</div>
              <div className="pw-card-sub">ລະຫັດຕ້ອງຢ່າງນ້ອຍ 8 ຕົວ ແລະ ບໍ່ຄືກັບລະຫັດເກົ່າ</div>
            </div>
            <div className="pw-card-body">
              <form onSubmit={handleSubmit}>

                {/* Old password */}
                <div className="pw-field">
                  <label className="pw-label">ລະຫັດຜ່ານເກົ່າ</label>
                  <div className="pw-input-wrap">
                    <input className="pw-input" type={showOld ? 'text' : 'password'}
                      value={oldPwd} onChange={(e) => setOldPwd(e.target.value)}
                      placeholder="ລະຫັດທີ່ໃຊ້ຢູ່ຕອນນີ້" autoComplete="current-password" />
                    <button type="button" className="pw-eye" onClick={() => setShowOld(v => !v)}>
                      <i className={`fas fa-eye${showOld ? '-slash' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* New password */}
                <div className="pw-field">
                  <label className="pw-label">ລະຫັດຜ່ານໃໝ່</label>
                  <div className="pw-input-wrap">
                    <input className="pw-input" type={showNew ? 'text' : 'password'}
                      value={newPwd} onChange={(e) => setNewPwd(e.target.value)}
                      placeholder="ຢ່າງນ້ອຍ 8 ຕົວ" autoComplete="new-password" />
                    <button type="button" className="pw-eye" onClick={() => setShowNew(v => !v)}>
                      <i className={`fas fa-eye${showNew ? '-slash' : ''}`} />
                    </button>
                  </div>

                  {/* Strength */}
                  {newPwd && (
                    <div className="pw-strength">
                      <div className="pw-str-bar">
                        <div className="pw-str-fill" style={{ width: `${(strength / 4) * 100}%`, background: strCfg.color }} />
                      </div>
                      <div className="pw-str-row">
                        <span className="pw-str-label" style={{ color: strCfg.color }}>{strCfg.label}</span>
                        <span className="pw-str-len">{newPwd.length} ຕົວ</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tips */}
                <div className="pw-tips">
                  <div className="pw-tips-title">ຄໍາແນະນໍາ</div>
                  {TIPS.map((t, i) => (
                    <div key={i} className="pw-tip">
                      <span className="pw-tip-icon">{t.ok ? '✅' : '⬜'}</span>
                      <span style={{ color: t.ok ? '#10b981' : undefined }}>{t.text}</span>
                    </div>
                  ))}
                </div>

                <div className="pw-actions">
                  <button type="submit" className="pw-save-btn" disabled={isLoading}>
                    {isLoading ? '⏳ ກຳລັງປ່ຽນ...' : '🔑 ປ່ຽນລະຫັດຜ່ານ'}
                  </button>
                  <Link to="/me/profile" className="pw-cancel-btn">ຍ້ອນກັບ</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
