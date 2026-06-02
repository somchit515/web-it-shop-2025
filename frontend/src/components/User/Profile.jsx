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
  }

  /* ── Hero ── */
  .pf-hero {
    background: linear-gradient(135deg,#4f46e5 0%,#7c3aed 60%,#6d28d9 100%);
    padding: 56px 40px 120px;
    position: relative;
    overflow: hidden;
  }
  .pf-hero::before {
    content:'';position:absolute;right:-100px;top:-100px;
    width:380px;height:380px;border-radius:50%;
    background:rgba(255,255,255,.07);pointer-events:none;
  }
  .pf-hero::after {
    content:'';position:absolute;left:5%;bottom:-120px;
    width:300px;height:300px;border-radius:50%;
    background:rgba(255,255,255,.05);pointer-events:none;
  }
  .pf-hero-inner {
    max-width:1400px;margin:0 auto;
    position:relative;z-index:1;
  }
  .pf-hero-eyebrow {
    font-size:.75rem;font-weight:700;letter-spacing:.12em;
    text-transform:uppercase;color:rgba(255,255,255,.6);margin-bottom:12px;
  }
  .pf-hero-title {
    font-size:2.8rem;font-weight:900;color:#fff;margin:0 0 6px;line-height:1.1;
  }
  .pf-hero-sub { font-size:1rem;color:rgba(255,255,255,.65); }

  /* ── Main card (overlaps hero) ── */
  .pf-main {
    max-width:1400px;
    margin:-80px auto 0;
    padding:0 32px 48px;
    position:relative;
    z-index:2;
  }

  /* ── Profile Card ── */
  .pf-card {
    background:#fff;
    border-radius:24px;
    box-shadow:0 12px 48px rgba(0,0,0,.12);
    border:1px solid #e2e8f0;
    overflow:hidden;
  }

  /* Top strip */
  .pf-card-top {
    display:grid;
    grid-template-columns:auto 1fr auto;
    align-items:center;
    gap:28px;
    padding:32px 36px 0;
  }
  @media(max-width:768px){.pf-card-top{grid-template-columns:auto 1fr;gap:16px;padding:24px 20px 0;}}

  .pf-avatar-wrap { position:relative;flex-shrink:0; }
  .pf-avatar {
    width:120px;height:120px;
    border-radius:20px;
    object-fit:cover;
    border:4px solid #fff;
    box-shadow:0 8px 24px rgba(0,0,0,.15);
    display:block;
  }
  @media(max-width:768px){.pf-avatar{width:80px;height:80px;border-radius:14px;}}
  .pf-avatar-edit {
    position:absolute;bottom:-6px;right:-6px;
    width:32px;height:32px;
    background:#4f46e5;border:3px solid #fff;
    border-radius:50%;display:grid;place-items:center;
    color:#fff;font-size:.75rem;text-decoration:none;
    box-shadow:0 2px 8px rgba(79,70,229,.4);
    transition:background .15s;
  }
  .pf-avatar-edit:hover{background:#4338ca;color:#fff;}

  .pf-name-block { min-width:0; }
  .pf-name {
    font-size:2rem;font-weight:900;color:#1e293b;
    margin:0 0 4px;word-break:break-word;
  }
  @media(max-width:768px){.pf-name{font-size:1.4rem;}}
  .pf-email { font-size:.95rem;color:#64748b;margin-bottom:10px; }
  .pf-badges { display:flex;gap:8px;flex-wrap:wrap; }
  .pf-badge {
    display:inline-flex;align-items:center;gap:5px;
    padding:5px 14px;border-radius:999px;
    font-size:.78rem;font-weight:700;
  }
  .pf-badge.role   { background:#ede9fe;color:#7c3aed; }
  .pf-badge.ok     { background:#d1fae5;color:#065f46; }
  .pf-badge.warn   { background:#fef3c7;color:#92400e; }

  .pf-card-stats {
    display:flex;gap:24px;align-items:center;
    padding:0 36px 0 0;
  }
  @media(max-width:768px){display:none;}
  .pf-stat { text-align:center; }
  .pf-stat-n { font-size:1.6rem;font-weight:900;color:#1e293b;display:block;line-height:1; }
  .pf-stat-l { font-size:.7rem;color:#94a3b8;margin-top:3px;text-transform:uppercase;letter-spacing:.05em; }

  /* Info grid */
  .pf-info-grid {
    display:grid;
    grid-template-columns:repeat(4,1fr);
    border-top:1px solid #f1f5f9;
    margin-top:28px;
  }
  @media(max-width:1024px){.pf-info-grid{grid-template-columns:repeat(2,1fr);}}
  @media(max-width:500px){.pf-info-grid{grid-template-columns:1fr;}}
  .pf-info-item {
    padding:20px 28px;
    border-right:1px solid #f1f5f9;
    border-bottom:1px solid #f1f5f9;
  }
  .pf-info-item:last-child{border-right:none;}
  @media(max-width:1024px){.pf-info-item:nth-child(2n){border-right:none;}}
  .pf-info-lbl {
    font-size:.72rem;font-weight:700;text-transform:uppercase;
    letter-spacing:.07em;color:#94a3b8;margin-bottom:6px;
  }
  .pf-info-val {
    font-size:1rem;font-weight:700;color:#1e293b;word-break:break-all;
  }
  .pf-id-row { display:flex;align-items:center;gap:8px; }
  .pf-id-val  { font-size:.78rem;font-family:monospace;color:#4f46e5; }
  .pf-copy-btn {
    background:none;border:none;color:#94a3b8;cursor:pointer;
    padding:4px 6px;border-radius:6px;font-size:.82rem;transition:all .15s;
  }
  .pf-copy-btn:hover{background:#ede9fe;color:#4f46e5;}

  /* ── Actions Grid ── */
  .pf-actions {
    display:grid;
    grid-template-columns:repeat(4,1fr);
    gap:20px;
    margin-top:24px;
  }
  @media(max-width:768px){.pf-actions{grid-template-columns:repeat(2,1fr);gap:12px;}}
  .pf-action {
    background:#fff;border-radius:20px;
    border:1.5px solid #e8eaf0;
    box-shadow:0 2px 10px rgba(0,0,0,.05);
    padding:28px 20px;text-align:center;
    text-decoration:none;transition:all .22s;
    display:flex;flex-direction:column;align-items:center;gap:12px;
    cursor:pointer;
  }
  .pf-action:hover {
    transform:translateY(-5px);
    box-shadow:0 12px 32px rgba(79,70,229,.18);
    border-color:#c7d2fe;
  }
  .pf-action-icon {
    width:64px;height:64px;
    border-radius:18px;
    display:grid;place-items:center;
    font-size:1.6rem;
  }
  .pf-action-lbl { font-size:.95rem;font-weight:800;color:#1e293b; }
  .pf-action-sub { font-size:.75rem;color:#94a3b8;margin-top:-4px; }

  /* ── Orders Banner ── */
  .pf-orders {
    margin-top:24px;
    background:linear-gradient(135deg,#4f46e5,#7c3aed);
    border-radius:20px;
    padding:28px 32px;
    display:flex;align-items:center;
    justify-content:space-between;
    gap:16px;flex-wrap:wrap;
    box-shadow:0 8px 28px rgba(79,70,229,.35);
  }
  .pf-orders-text h4{color:#fff;font-size:1.2rem;font-weight:800;margin:0 0 4px;}
  .pf-orders-text p{color:rgba(255,255,255,.7);font-size:.88rem;margin:0;}
  .pf-orders-right{display:flex;gap:12px;align-items:center;flex-wrap:wrap;}
  .pf-orders-btn {
    background:rgba(255,255,255,.18);color:#fff;
    border:1.5px solid rgba(255,255,255,.35);
    border-radius:12px;padding:10px 22px;
    font-size:.88rem;font-weight:700;text-decoration:none;
    transition:background .15s;white-space:nowrap;
  }
  .pf-orders-btn:hover{background:rgba(255,255,255,.3);color:#fff;}
  .pf-orders-btn.primary{background:#fff;color:#4f46e5;}
  .pf-orders-btn.primary:hover{background:#f5f3ff;color:#4f46e5;}

  @media(max-width:600px){
    .pf-hero{padding:36px 20px 100px;}
    .pf-hero-title{font-size:2rem;}
    .pf-main{padding:0 16px 48px;}
    .pf-card-top{padding:20px 16px 0;}
    .pf-info-item{padding:16px 16px;}
    .pf-action{padding:20px 12px;}
    .pf-orders{padding:20px;}
  }
`;

const ACTIONS = [
  { icon: '✏️', bg: '#ede9fe', label: 'ແກ້ໄຂໂປຣຟາຍ',   sub: 'ຊື່ · ທີ່ຢູ່',       to: '/me/update_profile' },
  { icon: '📷', bg: '#dbeafe', label: 'ປ່ຽນຮູບໂປຣຟາຍ', sub: 'Avatar',             to: '/me/upload_avatar' },
  { icon: '🔑', bg: '#fef3c7', label: 'ລະຫັດຜ່ານ',      sub: 'ຕັ້ງ password ໃໝ່',  action: 'password' },
  { icon: '🤍', bg: '#fce7f3', label: 'ລາຍການໂປດ',      sub: 'Wishlist',            to: '/wishlist' },
];

export default function Profile() {
  const navigate = useNavigate();
  const { user, loading } = useSelector((state) => state.auth || {});
  const wishlist = useSelector((state) => state.wishlist?.items || []);
  const compare  = useSelector((state) => state.compare?.items  || []);
  const [copied, setCopied] = useState(false);

  if (loading) return <Loader />;
  if (!user) return (
    <>
      <MetaData title="ໂປຣຟາຍ" />
      <div style={{ textAlign:'center', padding:'80px 20px', color:'#64748b' }}>
        <div style={{ fontSize:'3rem', marginBottom:16 }}>🔒</div>
        <p>ກະລຸນາ <Link to="/login">ເຂົ້າລະບົບ</Link> ກ່ອນ</p>
      </div>
    </>
  );

  const avatarSrc = user?.avatar?.url || 'https://cdn-icons-png.flaticon.com/512/3607/3607444.png';
  const registeredDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('lo-LA', { year:'numeric', month:'long', day:'numeric' })
    : '—';

  const copyId = async () => {
    await navigator.clipboard.writeText(user._id || '');
    setCopied(true); toast.success('ຄັດລອກ ID ແລ້ວ');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <MetaData title="ໂປຣຟາຍ — IT HUBB" />
      <style>{CSS}</style>
      <div className="pf-root">

        {/* Hero */}
        <div className="pf-hero">
          <div className="pf-hero-inner">
            <div className="pf-hero-eyebrow">👤 My Account</div>
            <div className="pf-hero-title">ໂປຣຟາຍຂອງຂ້ອຍ</div>
            <div className="pf-hero-sub">ຈັດການຂໍ້ມູນ ແລະ ຕັ້ງຄ່າບັນຊີ</div>
          </div>
        </div>

        {/* Main */}
        <div className="pf-main">

          {/* Profile Card */}
          <div className="pf-card">
            <div className="pf-card-top">
              {/* Avatar */}
              <div className="pf-avatar-wrap">
                <img src={avatarSrc} alt={user.name} className="pf-avatar"
                  onError={(e) => { e.currentTarget.src = 'https://cdn-icons-png.flaticon.com/512/3607/3607444.png'; }} />
                <Link to="/me/upload_avatar" className="pf-avatar-edit" title="ປ່ຽນຮູບ">
                  <i className="fas fa-camera" />
                </Link>
              </div>

              {/* Name + badges */}
              <div className="pf-name-block">
                <div className="pf-name">{user.name}</div>
                <div className="pf-email">{user.email}</div>
                <div className="pf-badges">
                  <span className="pf-badge role">
                    {user.role === 'superAdmin' ? '👑 Super Admin'
                      : user.role === 'admin' ? '🛡️ Admin'
                      : '👤 User'}
                  </span>
                  {user.emailVerified
                    ? <span className="pf-badge ok">✅ ອີເມວຢືນຢັນ</span>
                    : <span className="pf-badge warn">⚠️ ຍັງບໍ່ຢືນຢັນ</span>
                  }
                </div>
              </div>

              {/* Stats */}
              <div className="pf-card-stats">
                <div className="pf-stat">
                  <span className="pf-stat-n" style={{ color:'#e11d48' }}>{wishlist.length}</span>
                  <span className="pf-stat-l">Wishlist</span>
                </div>
                <div style={{ width:1, height:40, background:'#f1f5f9' }} />
                <div className="pf-stat">
                  <span className="pf-stat-n" style={{ color:'#7c3aed' }}>{compare.length}</span>
                  <span className="pf-stat-l">Compare</span>
                </div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="pf-info-grid">
              <div className="pf-info-item">
                <div className="pf-info-lbl">ວັນລົງທະບຽນ</div>
                <div className="pf-info-val">{registeredDate}</div>
              </div>
              <div className="pf-info-item">
                <div className="pf-info-lbl">ສິດທິ</div>
                <div className="pf-info-val" style={{ textTransform:'capitalize' }}>{user.role}</div>
              </div>
              <div className="pf-info-item">
                <div className="pf-info-lbl">ອີເມວ</div>
                <div className="pf-info-val" style={{ fontSize:'.9rem' }}>{user.email}</div>
              </div>
              <div className="pf-info-item">
                <div className="pf-info-lbl">User ID</div>
                <div className="pf-id-row">
                  <span className="pf-id-val">{user._id?.substring(0,18)}…</span>
                  <button className="pf-copy-btn" onClick={copyId} title="ຄັດລອກ">
                    <i className={`fas fa-${copied ? 'check' : 'copy'}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Cards */}
          <div className="pf-actions">
            {ACTIONS.map((a, i) =>
              a.to ? (
                <Link key={i} to={a.to} className="pf-action">
                  <div className="pf-action-icon" style={{ background:a.bg }}>{a.icon}</div>
                  <div className="pf-action-lbl">{a.label}</div>
                  <div className="pf-action-sub">{a.sub}</div>
                </Link>
              ) : (
                <div key={i} className="pf-action" onClick={() => navigate('/me/update_password')}>
                  <div className="pf-action-icon" style={{ background:a.bg }}>{a.icon}</div>
                  <div className="pf-action-lbl">{a.label}</div>
                  <div className="pf-action-sub">{a.sub}</div>
                </div>
              )
            )}
          </div>

          {/* Orders Banner */}
          <div className="pf-orders">
            <div className="pf-orders-text">
              <h4>📦 ຄຳສັ່ງຊື້ຂອງຂ້ອຍ</h4>
              <p>ຕິດຕາມ ແລະ ຈັດການ order ທຸກລາຍການ</p>
            </div>
            <div className="pf-orders-right">
              <Link to="/track" className="pf-orders-btn">🚚 ຕິດຕາມພັດດຸ</Link>
              <Link to="/me/orders" className="pf-orders-btn primary">ເບິ່ງ Orders ທັງໝົດ →</Link>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
