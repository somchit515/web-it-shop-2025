import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import MetaData from '../layout/MetaData';
import Loader from '../layout/Loader';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const CSS = `
  .pf-root {
    background: #f1f5f9;
    min-height: 100vh;
    font-family: "Noto Sans Lao","Inter",sans-serif;
    padding-bottom: 48px;
  }

  /* ── Hero banner ── */
  .pf-hero {
    background: linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);
    padding: 40px 20px 80px;
    position: relative;
    overflow: hidden;
  }
  .pf-hero::before {
    content:'';position:absolute;right:-60px;top:-60px;
    width:260px;height:260px;border-radius:50%;
    background:rgba(255,255,255,.06);pointer-events:none;
  }
  .pf-hero::after {
    content:'';position:absolute;left:-40px;bottom:-80px;
    width:200px;height:200px;border-radius:50%;
    background:rgba(255,255,255,.04);pointer-events:none;
  }

  /* ── Profile card (overlaps hero) ── */
  .pf-card-wrap {
    max-width: 1400px;
    margin: -56px auto 0;
    padding: 0 16px;
    position: relative;
    z-index: 2;
  }
  .pf-card {
    background: #fff;
    border-radius: 20px;
    box-shadow: 0 8px 32px rgba(0,0,0,.10);
    border: 1px solid #e2e8f0;
    overflow: hidden;
  }

  /* ── Top strip: avatar + name ── */
  .pf-top {
    display: flex;
    align-items: flex-end;
    gap: 20px;
    padding: 20px 24px 0;
    flex-wrap: wrap;
  }
  .pf-avatar-wrap { position: relative; flex-shrink: 0; }
  .pf-avatar {
    width: 100px; height: 100px;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid #fff;
    box-shadow: 0 4px 16px rgba(0,0,0,.15);
    display: block;
  }
  .pf-avatar-edit {
    position: absolute;
    bottom: 2px; right: 2px;
    width: 28px; height: 28px;
    background: #4f46e5;
    border: 2px solid #fff;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-size: .7rem;
    text-decoration: none;
    transition: background .15s;
  }
  .pf-avatar-edit:hover { background: #4338ca; color: #fff; }
  .pf-name-block { flex: 1; padding-bottom: 12px; }
  .pf-name { font-size: 1.4rem; font-weight: 800; color: #1e293b; margin: 0 0 2px; }
  .pf-email { font-size: .88rem; color: #64748b; margin: 0 0 6px; }
  .pf-badges { display: flex; gap: 6px; flex-wrap: wrap; }
  .pf-badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 10px; border-radius: 999px;
    font-size: .7rem; font-weight: 700;
  }
  .pf-badge.role { background: #ede9fe; color: #7c3aed; }
  .pf-badge.verified { background: #d1fae5; color: #065f46; }
  .pf-badge.unverified { background: #fef3c7; color: #92400e; }

  /* ── Divider ── */
  .pf-divider { height: 1px; background: #f1f5f9; margin: 16px 0; }

  /* ── Info grid ── */
  .pf-info-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    border-top: 1px solid #f1f5f9;
  }
  @media(max-width:900px){ .pf-info-grid { grid-template-columns: repeat(3,1fr); } }
  @media(max-width:600px){ .pf-info-grid { grid-template-columns: 1fr 1fr; } }
  .pf-info-item {
    padding: 14px 20px;
    border-right: 1px solid #f1f5f9;
    border-bottom: 1px solid #f1f5f9;
  }
  .pf-info-item:last-child { border-right: none; }
  .pf-info-lbl { font-size: .68rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: #94a3b8; margin-bottom: 3px; }
  .pf-info-val { font-size: .88rem; font-weight: 600; color: #1e293b; word-break: break-all; }
  .pf-id-row { display: flex; align-items: center; gap: 6px; }
  .pf-copy-btn {
    background: none; border: none; color: #94a3b8; cursor: pointer;
    padding: 2px 4px; border-radius: 4px; font-size: .75rem;
    transition: all .15s;
  }
  .pf-copy-btn:hover { background: #ede9fe; color: #4f46e5; }

  /* ── Action grid ── */
  .pf-actions {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    max-width: 1400px;
    margin: 20px auto 0;
    padding: 0 16px;
  }
  @media(max-width:700px){ .pf-actions { grid-template-columns: repeat(2,1fr); } }
  @media(max-width:360px){ .pf-actions { grid-template-columns: 1fr; } }

  .pf-action-icon { width: 52px; height: 52px; border-radius: 14px; font-size: 1.3rem; }
  .pf-action { padding: 24px 16px; }
  .pf-action {
    background: #fff;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 2px 8px rgba(0,0,0,.05);
    padding: 18px 14px;
    text-align: center;
    text-decoration: none;
    transition: all .2s;
    display: flex; flex-direction: column; align-items: center; gap: 8px;
    cursor: pointer;
  }
  .pf-action:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(79,70,229,.15);
    border-color: #c7d2fe;
  }
  .pf-action-icon {
    width: 44px; height: 44px;
    border-radius: 12px;
    display: grid; place-items: center;
    font-size: 1.1rem;
  }
  .pf-action-lbl { font-size: .78rem; font-weight: 700; color: #374151; }
  .pf-action-sub { font-size: .68rem; color: #94a3b8; }

  /* ── Orders quick card ── */
  .pf-orders-card {
    max-width: 1400px;
    margin: 16px auto 0;
    padding: 0 16px;
  }
  .pf-orders-inner {
    background: linear-gradient(135deg,#4f46e5,#7c3aed);
    border-radius: 16px;
    padding: 18px 22px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }
  .pf-orders-text h4 { color: #fff; font-weight: 800; margin: 0 0 2px; font-size: 1rem; }
  .pf-orders-text p { color: rgba(255,255,255,.7); font-size: .82rem; margin: 0; }
  .pf-orders-btn {
    background: rgba(255,255,255,.2);
    color: #fff;
    border: 1.5px solid rgba(255,255,255,.35);
    border-radius: 10px;
    padding: 8px 18px;
    font-size: .82rem;
    font-weight: 700;
    text-decoration: none;
    white-space: nowrap;
    transition: background .15s;
    backdrop-filter: blur(6px);
  }
  .pf-orders-btn:hover { background: rgba(255,255,255,.32); color: #fff; }
`;

export default function Profile() {
  const navigate = useNavigate();
  const { user, loading } = useSelector((state) => state.auth || {});
  const [copied, setCopied] = useState(false);

  if (loading) return <Loader />;

  if (!user) return (
    <>
      <MetaData title="ໂປຣຟາຍ" />
      <div style={{ textAlign: 'center', padding: '80px 20px', color: '#64748b' }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔒</div>
        <p>ກະລຸນາ <Link to="/login">ເຂົ້າລະບົບ</Link> ກ່ອນ</p>
      </div>
    </>
  );

  const avatarSrc = user?.avatar?.url || 'https://cdn-icons-png.flaticon.com/512/3607/3607444.png';

  const registeredDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('lo-LA', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

  const copyId = async () => {
    await navigator.clipboard.writeText(user._id || '');
    setCopied(true);
    toast.success('ຄັດລອກ ID ແລ້ວ');
    setTimeout(() => setCopied(false), 2000);
  };

  const ACTIONS = [
    { icon: '✏️', bg: '#ede9fe', label: 'ແກ້ໄຂໂປຣຟາຍ', sub: 'ຊື່, ທີ່ຢູ່', to: '/me/update_profile' },
    { icon: '📷', bg: '#dbeafe', label: 'ປ່ຽນຮູບ', sub: 'Avatar', to: '/me/upload_avatar' },
    { icon: '🔑', bg: '#fef3c7', label: 'ລະຫັດຜ່ານ', sub: 'ປ່ຽນ password', action: () => navigate('/me/update_password') },
    { icon: '📦', bg: '#dcfce7', label: 'ຄຳສັ່ງຊື້', sub: 'ປະຫວັດ order', to: '/me/orders' },
  ];

  return (
    <>
      <MetaData title="ໂປຣຟາຍ — IT HUBB" />
      <style>{CSS}</style>

      <div className="pf-root">
        {/* Hero banner */}
        <div className="pf-hero" />

        {/* Profile card */}
        <div className="pf-card-wrap">
          <div className="pf-card">
            {/* Top: avatar + name */}
            <div className="pf-top">
              <div className="pf-avatar-wrap">
                <img src={avatarSrc} alt={user.name} className="pf-avatar"
                  onError={(e) => { e.currentTarget.src = 'https://cdn-icons-png.flaticon.com/512/3607/3607444.png'; }} />
                <Link to="/me/upload_avatar" className="pf-avatar-edit" title="ປ່ຽນຮູບ">
                  <i className="fas fa-camera" />
                </Link>
              </div>
              <div className="pf-name-block">
                <div className="pf-name">{user.name}</div>
                <div className="pf-email">{user.email}</div>
                <div className="pf-badges">
                  <span className="pf-badge role">
                    {user.role === 'admin' ? '🛡️ Admin' : user.role === 'superAdmin' ? '👑 Super Admin' : '👤 User'}
                  </span>
                  {user.emailVerified
                    ? <span className="pf-badge verified">✅ ອີເມວຢືນຢັນ</span>
                    : <span className="pf-badge unverified">⚠️ ຍັງບໍ່ຢືນຢັນ</span>
                  }
                </div>
              </div>
            </div>

            {/* Info grid */}
            <div className="pf-info-grid">
              <div className="pf-info-item">
                <div className="pf-info-lbl">ວັນລົງທະບຽນ</div>
                <div className="pf-info-val">{registeredDate}</div>
              </div>
              <div className="pf-info-item">
                <div className="pf-info-lbl">ສິດທິ</div>
                <div className="pf-info-val" style={{ textTransform: 'capitalize' }}>{user.role}</div>
              </div>
              <div className="pf-info-item">
                <div className="pf-info-lbl">ອີເມວ</div>
                <div className="pf-info-val" style={{ fontSize: '.82rem' }}>{user.email}</div>
              </div>
              <div className="pf-info-item">
                <div className="pf-info-lbl">User ID</div>
                <div className="pf-id-row">
                  <div className="pf-info-val" style={{ fontSize: '.72rem', fontFamily: 'monospace' }}>
                    {user._id?.substring(0, 16)}…
                  </div>
                  <button className="pf-copy-btn" onClick={copyId} title="ຄັດລອກ">
                    <i className={`fas fa-${copied ? 'check' : 'copy'}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action cards */}
        <div className="pf-actions">
          {ACTIONS.map((a, i) =>
            a.to ? (
              <Link key={i} to={a.to} className="pf-action">
                <div className="pf-action-icon" style={{ background: a.bg }}>{a.icon}</div>
                <div className="pf-action-lbl">{a.label}</div>
                <div className="pf-action-sub">{a.sub}</div>
              </Link>
            ) : (
              <div key={i} className="pf-action" onClick={a.action}>
                <div className="pf-action-icon" style={{ background: a.bg }}>{a.icon}</div>
                <div className="pf-action-lbl">{a.label}</div>
                <div className="pf-action-sub">{a.sub}</div>
              </div>
            )
          )}
        </div>

        {/* Orders banner */}
        <div className="pf-orders-card">
          <div className="pf-orders-inner">
            <div className="pf-orders-text">
              <h4>📦 ຄຳສັ່ງຊື້ຂອງຂ້ອຍ</h4>
              <p>ຕິດຕາມ ແລະ ຈັດການ order ທັງໝົດ</p>
            </div>
            <Link to="/me/orders" className="pf-orders-btn">ເບິ່ງທັງໝົດ →</Link>
          </div>
        </div>
      </div>
    </>
  );
}
