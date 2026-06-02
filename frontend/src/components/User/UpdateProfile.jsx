import React, { useEffect, useState } from 'react';
import MetaData from '../layout/MetaData';
import { useUpdateProfileMutation } from '../redux/api/userApi';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Loader from '../layout/Loader';

const CSS = `
  .up-root{background:#f1f5f9;min-height:100vh;font-family:"Noto Sans Lao","Inter",sans-serif;}
  .up-hero{background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 60%,#6d28d9 100%);padding:48px 40px 100px;position:relative;overflow:hidden;}
  .up-hero::before{content:'';position:absolute;right:-80px;top:-80px;width:300px;height:300px;border-radius:50%;background:rgba(255,255,255,.07);pointer-events:none;}
  .up-hero-inner{max-width:760px;margin:0 auto;position:relative;z-index:1;}
  .up-back{display:inline-flex;align-items:center;gap:6px;color:rgba(255,255,255,.7);text-decoration:none;font-size:.82rem;font-weight:600;margin-bottom:16px;transition:color .15s;}
  .up-back:hover{color:#fff;}
  .up-eyebrow{font-size:.72rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.6);margin-bottom:8px;}
  .up-title{font-size:2.2rem;font-weight:900;color:#fff;margin:0 0 4px;}
  .up-sub{font-size:.9rem;color:rgba(255,255,255,.65);}

  .up-main{max-width:760px;margin:-60px auto 0;padding:0 32px 56px;position:relative;z-index:2;}
  @media(max-width:600px){.up-main{padding:0 16px 56px;}}

  .up-card{background:#fff;border-radius:24px;box-shadow:0 12px 48px rgba(0,0,0,.12);border:1px solid #e2e8f0;overflow:hidden;}
  .up-card-head{padding:28px 36px 0;border-bottom:1px solid #f1f5f9;padding-bottom:20px;}
  .up-card-title{font-size:1.2rem;font-weight:800;color:#1e293b;margin:0 0 2px;}
  .up-card-sub{font-size:.82rem;color:#64748b;}
  .up-card-body{padding:32px 36px;}
  @media(max-width:600px){.up-card-head{padding:20px 20px 16px;}.up-card-body{padding:24px 20px;}}

  /* avatar section */
  .up-avatar-section{display:flex;align-items:center;gap:24px;padding:20px 0 28px;border-bottom:1px solid #f1f5f9;margin-bottom:28px;flex-wrap:wrap;}
  .up-avatar-img{width:90px;height:90px;border-radius:18px;object-fit:cover;border:3px solid #e2e8f0;box-shadow:0 4px 16px rgba(0,0,0,.1);flex-shrink:0;}
  .up-avatar-info h4{font-size:.95rem;font-weight:700;color:#1e293b;margin:0 0 4px;}
  .up-avatar-info p{font-size:.78rem;color:#94a3b8;margin:0;}
  .up-avatar-btn{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:10px;background:#ede9fe;color:#7c3aed;border:none;font-size:.78rem;font-weight:700;cursor:pointer;text-decoration:none;margin-top:8px;transition:all .15s;}
  .up-avatar-btn:hover{background:#7c3aed;color:#fff;}

  /* form */
  .up-field{margin-bottom:22px;}
  .up-label{display:block;font-size:.82rem;font-weight:700;color:#374151;margin-bottom:6px;}
  .up-input{width:100%;padding:13px 16px;border:1.5px solid #e2e8f0;border-radius:12px;font-size:.95rem;font-family:inherit;outline:none;transition:border-color .15s,box-shadow .15s;background:#fff;color:#1e293b;}
  .up-input:focus{border-color:#4f46e5;box-shadow:0 0 0 3px rgba(79,70,229,.1);}
  .up-input.err{border-color:#ef4444;}
  .up-hint{font-size:.72rem;color:#94a3b8;margin-top:5px;}

  .up-actions{display:flex;gap:12px;margin-top:32px;}
  .up-save-btn{flex:1;padding:14px;border-radius:14px;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;border:none;font-size:1rem;font-weight:800;cursor:pointer;font-family:inherit;transition:opacity .15s,transform .15s;box-shadow:0 8px 24px rgba(79,70,229,.3);}
  .up-save-btn:hover:not(:disabled){opacity:.9;transform:translateY(-2px);}
  .up-save-btn:disabled{opacity:.5;cursor:not-allowed;transform:none;}
  .up-cancel-btn{padding:14px 22px;border-radius:14px;border:1.5px solid #e2e8f0;background:#fff;color:#64748b;font-size:.9rem;font-weight:700;cursor:pointer;font-family:inherit;transition:all .15s;text-decoration:none;display:inline-flex;align-items:center;}
  .up-cancel-btn:hover{border-color:#4f46e5;color:#4f46e5;}
`;

export default function UpdateProfile() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useSelector((s) => s.auth || {});
  const [name,  setName]  = useState('');
  const [email, setEmail] = useState('');
  const [updateProfile, { isLoading, isSuccess, error }] = useUpdateProfileMutation();

  useEffect(() => {
    if (user) { setName(user.name || ''); setEmail(user.email || ''); }
  }, [user]);

  useEffect(() => {
    if (error) toast.error(error?.data?.message || 'ອັບເດດບໍ່ສຳເລັດ');
  }, [error]);

  useEffect(() => {
    if (isSuccess) { toast.success('ອັບເດດໂປຣໄຟລ໌ສຳເລັດ'); navigate('/me/profile'); }
  }, [isSuccess, navigate]);

  if (authLoading) return <Loader />;

  const isEmailValid = (em) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em);
  const changed = () => name !== (user?.name || '') || email !== (user?.email || '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('ກະລຸນາໃສ່ຊື່');
    if (!isEmailValid(email)) return toast.error('ອີເມວບໍ່ຖືກຕ້ອງ');
    try { await updateProfile({ name: name.trim(), email: email.trim() }).unwrap(); }
    catch (err) { toast.error(err?.data?.message || 'Update failed'); }
  };

  const avatarSrc = user?.avatar?.url || 'https://cdn-icons-png.flaticon.com/512/3607/3607444.png';

  return (
    <>
      <MetaData title="ແກ້ໄຂໂປຣໄຟລ໌ — IT HUBB" />
      <style>{CSS}</style>
      <div className="up-root">
        <div className="up-hero">
          <div className="up-hero-inner">
            <Link to="/me/profile" className="up-back">← ກັບໄປໂປຣຟາຍ</Link>
            <div className="up-eyebrow">✏️ Edit Profile</div>
            <div className="up-title">ແກ້ໄຂຂໍ້ມູນ</div>
            <div className="up-sub">ອັບເດດຊື່ ແລະ ອີເມວຂອງທ່ານ</div>
          </div>
        </div>

        <div className="up-main">
          <div className="up-card">
            <div className="up-card-head">
              <div className="up-card-title">ຂໍ້ມູນໂປຣຟາຍ</div>
              <div className="up-card-sub">ປ່ຽນຊື່ ຫຼື ອີເມວທີ່ໃຊ້ສຳລັບ login</div>
            </div>
            <div className="up-card-body">

              {/* Avatar preview */}
              <div className="up-avatar-section">
                <img src={avatarSrc} alt="avatar" className="up-avatar-img"
                  onError={(e) => { e.currentTarget.src = 'https://cdn-icons-png.flaticon.com/512/3607/3607444.png'; }} />
                <div className="up-avatar-info">
                  <h4>{user?.name}</h4>
                  <p>{user?.email}</p>
                  <Link to="/me/upload_avatar" className="up-avatar-btn">
                    <i className="fas fa-camera" /> ປ່ຽນຮູບໂປຣຟາຍ
                  </Link>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="up-field">
                  <label className="up-label">ຊື່ ແລະ ນາມສະກຸນ</label>
                  <input className="up-input" value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="ຊື່ຂອງທ່ານ" required />
                </div>
                <div className="up-field">
                  <label className="up-label">ອີເມວ</label>
                  <input className={`up-input ${email && !isEmailValid(email) ? 'err' : ''}`}
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com" required />
                  {email && !isEmailValid(email) && (
                    <div style={{ fontSize: '.72rem', color: '#ef4444', marginTop: 4 }}>ອີເມວບໍ່ຖືກຕ້ອງ</div>
                  )}
                  <div className="up-hint">⚠️ ການປ່ຽນອີເມວອາດມີຜົນຕໍ່ການ login</div>
                </div>

                <div className="up-actions">
                  <button type="submit" className="up-save-btn" disabled={isLoading || !changed()}>
                    {isLoading ? 'ກຳລັງອັບເດດ...' : changed() ? '💾 ບັນທຶກການປ່ຽນແປງ' : '✓ ບໍ່ມີການປ່ຽນແປງ'}
                  </button>
                  <Link to="/me/profile" className="up-cancel-btn">ຍ້ອນກັບ</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
