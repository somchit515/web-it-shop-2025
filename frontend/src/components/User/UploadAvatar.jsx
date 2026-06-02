import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUploadAvatarMutation } from '../redux/api/userApi';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import MetaData from '../layout/MetaData';

const humanSize = (s) => {
  if (!s) return '';
  const i = Math.floor(Math.log(s) / Math.log(1024));
  return (s / Math.pow(1024, i)).toFixed(1) + ' ' + ['B','KB','MB','GB'][i];
};

const CSS = `
  .av-root{background:#f1f5f9;min-height:100vh;font-family:"Noto Sans Lao","Inter",sans-serif;}
  .av-hero{background:linear-gradient(135deg,#0ea5e9 0%,#0284c7 60%,#0369a1 100%);padding:48px 40px 100px;position:relative;overflow:hidden;}
  .av-hero::before{content:'';position:absolute;right:-80px;top:-80px;width:300px;height:300px;border-radius:50%;background:rgba(255,255,255,.07);pointer-events:none;}
  .av-hero-inner{max-width:640px;margin:0 auto;position:relative;z-index:1;}
  .av-back{display:inline-flex;align-items:center;gap:6px;color:rgba(255,255,255,.7);text-decoration:none;font-size:.82rem;font-weight:600;margin-bottom:16px;transition:color .15s;}
  .av-back:hover{color:#fff;}
  .av-eyebrow{font-size:.72rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.6);margin-bottom:8px;}
  .av-title{font-size:2.2rem;font-weight:900;color:#fff;margin:0 0 4px;}
  .av-sub{font-size:.9rem;color:rgba(255,255,255,.65);}

  .av-main{max-width:640px;margin:-60px auto 0;padding:0 24px 56px;position:relative;z-index:2;}
  @media(max-width:600px){.av-main{padding:0 14px 56px;}}

  .av-card{background:#fff;border-radius:24px;box-shadow:0 12px 48px rgba(0,0,0,.12);border:1px solid #e2e8f0;overflow:hidden;}

  /* Preview */
  .av-preview-section{display:flex;flex-direction:column;align-items:center;padding:36px 36px 24px;}
  .av-preview-wrap{position:relative;}
  .av-preview-img{width:140px;height:140px;border-radius:24px;object-fit:cover;border:4px solid #fff;box-shadow:0 8px 28px rgba(0,0,0,.15);display:block;}
  .av-preview-badge{position:absolute;bottom:-8px;right:-8px;background:#0ea5e9;color:#fff;width:32px;height:32px;border-radius:50%;display:grid;place-items:center;border:3px solid #fff;font-size:.75rem;box-shadow:0 2px 8px rgba(14,165,233,.4);}
  .av-preview-lbl{font-size:.82rem;color:#94a3b8;margin-top:14px;text-align:center;}

  /* Dropzone */
  .av-drop-section{padding:0 36px 32px;}
  .av-dropzone{border:2px dashed #bae6fd;border-radius:16px;padding:32px 20px;text-align:center;cursor:pointer;background:linear-gradient(180deg,#f0f9ff,#fff);transition:all .2s;}
  .av-dropzone:hover,.av-dropzone.active{border-color:#0ea5e9;background:#e0f2fe;}
  .av-dz-icon{font-size:2.4rem;display:block;margin-bottom:10px;}
  .av-dz-title{font-size:.95rem;font-weight:700;color:#1e293b;margin-bottom:4px;}
  .av-dz-sub{font-size:.75rem;color:#94a3b8;}
  .av-file-info{display:flex;align-items:center;gap:12px;padding:14px 16px;background:#f0f9ff;border-radius:12px;margin-top:14px;border:1px solid #bae6fd;}
  .av-file-icon{font-size:1.8rem;}
  .av-file-name{font-size:.88rem;font-weight:700;color:#1e293b;word-break:break-all;}
  .av-file-size{font-size:.72rem;color:#94a3b8;margin-top:2px;}
  .av-file-remove{margin-left:auto;background:none;border:none;color:#94a3b8;cursor:pointer;font-size:.8rem;padding:4px 8px;border-radius:8px;transition:all .15s;}
  .av-file-remove:hover{background:#fee2e2;color:#ef4444;}

  .av-actions{display:flex;gap:12px;padding:0 36px 32px;}
  .av-upload-btn{flex:1;padding:14px;border-radius:14px;background:linear-gradient(135deg,#0ea5e9,#0284c7);color:#fff;border:none;font-size:1rem;font-weight:800;cursor:pointer;font-family:inherit;transition:opacity .15s,transform .15s;box-shadow:0 8px 24px rgba(14,165,233,.3);}
  .av-upload-btn:hover:not(:disabled){opacity:.9;transform:translateY(-2px);}
  .av-upload-btn:disabled{opacity:.5;cursor:not-allowed;transform:none;}
  .av-cancel-btn{padding:14px 20px;border-radius:14px;border:1.5px solid #e2e8f0;background:#fff;color:#64748b;font-size:.9rem;font-weight:700;cursor:pointer;font-family:inherit;text-decoration:none;display:inline-flex;align-items:center;transition:all .15s;}
  .av-cancel-btn:hover{border-color:#0ea5e9;color:#0ea5e9;}

  @media(max-width:600px){
    .av-preview-section,.av-drop-section,.av-actions{padding-left:20px;padding-right:20px;}
    .av-title{font-size:1.7rem;}
  }
`;

export default function UploadAvatar() {
  const navigate = useNavigate();
  const { user }  = useSelector((s) => s.auth || {});
  const [uploadAvatar, { isLoading, error, isSuccess }] = useUploadAvatarMutation();

  const [avatar,        setAvatar]        = useState('');
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar?.url || 'https://cdn-icons-png.flaticon.com/512/3607/3607444.png');
  const [fileInfo,      setFileInfo]      = useState(null);
  const [dragging,      setDragging]      = useState(false);

  useEffect(() => {
    if (error)     toast.error(error?.data?.message || 'ອັບໂຫຼດບໍ່ສຳເລັດ');
    if (isSuccess) { toast.success('✅ ອັບໂຫຼດຮູບໂປຣໄຟລ໌ສຳເລັດ'); navigate('/me/profile'); }
  }, [error, isSuccess, navigate]);

  const processFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('ກາລຸນາເລືອກຮູບ'); return; }
    if (file.size > 5 * 1024 * 1024)    { toast.error('ໄຟລ໌ໃຫຍ່ເກີນ 5MB'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result);
      setAvatar(reader.result);
      setFileInfo({ name: file.name, size: file.size, type: file.type });
    };
    reader.readAsDataURL(file);
  };

  const clearFile = () => {
    setAvatar(''); setFileInfo(null);
    setAvatarPreview(user?.avatar?.url || 'https://cdn-icons-png.flaticon.com/512/3607/3607444.png');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!avatar) return toast.error('ກາລຸນາເລືອກຮູບກ່ອນ');
    try { await uploadAvatar({ avatar }).unwrap(); }
    catch (err) { toast.error(err?.data?.message || 'Upload failed'); }
  };

  return (
    <>
      <MetaData title="ອັບໂຫຼດຮູບໂປຣໄຟລ໌ — IT HUBB" />
      <style>{CSS}</style>
      <div className="av-root">
        <div className="av-hero">
          <div className="av-hero-inner">
            <Link to="/me/profile" className="av-back">← ກັບໄປໂປຣຟາຍ</Link>
            <div className="av-eyebrow">📷 Upload Avatar</div>
            <div className="av-title">ອັບໂຫຼດຮູບ</div>
            <div className="av-sub">ປ່ຽນຮູບໂປຣຟາຍຂອງທ່ານ · JPG/PNG · ≤5MB</div>
          </div>
        </div>

        <div className="av-main">
          <div className="av-card">
            {/* Preview */}
            <div className="av-preview-section">
              <div className="av-preview-wrap">
                <img src={avatarPreview} alt="preview" className="av-preview-img"
                  onError={(e) => { e.currentTarget.src = 'https://cdn-icons-png.flaticon.com/512/3607/3607444.png'; }} />
                <div className="av-preview-badge"><i className="fas fa-camera" /></div>
              </div>
              <div className="av-preview-lbl">
                {fileInfo ? `✅ ຮູບໃໝ່: ${fileInfo.name}` : '📷 ຮູບໂປຣຟາຍປັດຈຸບັນ'}
              </div>
            </div>

            {/* Dropzone */}
            <div className="av-drop-section">
              <form onSubmit={handleSubmit}>
                <label
                  className={`av-dropzone ${dragging ? 'active' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setDragging(false); processFile(e.dataTransfer.files[0]); }}
                >
                  <span className="av-dz-icon">🖼️</span>
                  <div className="av-dz-title">ລາກຮູບມາວາງ ຫຼື ກົດເພື່ອເລືອກ</div>
                  <div className="av-dz-sub">ຮອງຮັບ JPG · PNG · GIF · ສູງສຸດ 5MB</div>
                  <input type="file" accept="image/*" hidden onChange={(e) => processFile(e.target.files?.[0])} />
                </label>

                {fileInfo && (
                  <div className="av-file-info">
                    <span className="av-file-icon">🖼️</span>
                    <div>
                      <div className="av-file-name">{fileInfo.name}</div>
                      <div className="av-file-size">{humanSize(fileInfo.size)}</div>
                    </div>
                    <button type="button" className="av-file-remove" onClick={clearFile}>✕</button>
                  </div>
                )}
              </form>
            </div>

            {/* Actions */}
            <div className="av-actions">
              <button className="av-upload-btn" disabled={isLoading || !avatar} onClick={handleSubmit}>
                {isLoading ? '⏳ ກຳລັງອັບໂຫຼດ...' : '📤 ອັບໂຫຼດຮູບ'}
              </button>
              <Link to="/me/profile" className="av-cancel-btn">ຍ້ອນກັບ</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
