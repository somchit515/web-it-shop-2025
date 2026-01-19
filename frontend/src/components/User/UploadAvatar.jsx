// src/pages/UploadAvatar.jsx
import React, { useEffect, useState } from 'react';
import Userlayout from '../layout/Userlayout';
import { useNavigate } from 'react-router-dom';
import { useUploadAvatarMutation } from '../redux/api/userApi';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import MetaData from '../layout/MetaData';

const humanFileSize = (size) => {
  if (!size) return '';
  const i = Math.floor(Math.log(size) / Math.log(1024));
  return (size / Math.pow(1024, i)).toFixed(1) + ' ' + ['B', 'KB', 'MB', 'GB'][i];
};

const UploadAvatar = () => {
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth || {});
  const [uploadAvatar, { isLoading, error, isSuccess }] = useUploadAvatarMutation();

  const [avatar, setAvatar] = useState(''); // base64 string (ตามโค้ดเดิมของคุณ)
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar?.url || 'https://cdn-icons-png.flaticon.com/512/3607/3607444.png');
  const [fileInfo, setFileInfo] = useState(null);

  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message || 'ອັບໂຫຼດບໍ່ສຳເລັດ');
    }
  }, [error]);

  useEffect(() => {
    if (isSuccess) {
      toast.success('ອັບໂຫຼດຮູບໂປຣໄຟລ໌ສຳເລັດ');
      navigate('/me/profile');
    }
  }, [isSuccess, navigate]);

  const onChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // validations
    if (!file.type.startsWith('image/')) {
      toast.error('ກາລຸນາເລືອກຮູບ (jpg, png, gif)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('ໄຟລ໌ໃຫຍ່ເກີນ 5MB');
      return;
    }

    // preview + base64
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2) {
        setAvatarPreview(reader.result);
        setAvatar(reader.result); // เก็บ base64 ตามโค้ดเดิม
        setFileInfo({ name: file.name, size: file.size, type: file.type });
      }
    };
    reader.readAsDataURL(file);
  };

  const clearFile = () => {
    setAvatar('');
    setFileInfo(null);
    setAvatarPreview(user?.avatar?.url || 'https://cdn-icons-png.flaticon.com/512/3607/3607444.png');
    // Also reset input value (if needed)
    const input = document.getElementById('customFile');
    if (input) input.value = '';
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!avatar) return toast.error('ກາລຸນາເລືອກຮູບກ່ອນອັບໂຫຼດ');

    // keep using your base64 payload (ตามโค้ดเดิม)
    try {
      await uploadAvatar({ avatar }).unwrap?.() || uploadAvatar({ avatar });
      // success handled in effect
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || 'Upload failed');
    }
  };

  return (
    <>
      <MetaData title={'อัปโหลดรูปโปรไฟล์'} />
      <Userlayout>
        <style>{`
          .upload-card {
            max-width: 720px;
            margin: 28px auto;
            background: #fff;
            border-radius: 14px;
            padding: 22px;
            box-shadow: 0 8px 30px rgba(18, 38, 63, 0.06);
          }
          .avatar-preview {
            width: 140px;
            height: 140px;
            border-radius: 14px;
            object-fit: cover;
            border: 3px solid #eef2ff;
            box-shadow: 0 6px 18px rgba(14,30,37,0.06);
          }
          .dropzone {
            border: 2px dashed #c7d2fe;
            border-radius: 12px;
            padding: 18px;
            cursor: pointer;
            text-align: center;
            transition: background .12s ease, transform .08s ease;
            background: linear-gradient(180deg, #fbfdff, #fff);
          }
          .dropzone:focus, .dropzone:hover { background: #f8faff; transform: translateY(-2px); }
          .file-meta { font-size: 0.9rem; color: #374151; }
          .btn-clear { border: 1px solid #e5e7eb; background: #fff; }
          .hint { font-size: 0.85rem; color: #6b7280; }
        `}</style>

        <div className="upload-card">
          <h3 className="mb-3">ອັບໂຫຼດຮູບໂປຣໄຟລ໌</h3>

          <div className="row align-items-center">
            <div className="col-12 col-md-4 text-center mb-3 mb-md-0">
              <img src={avatarPreview} alt="Avatar Preview" className="avatar-preview" />
              <div className="mt-3">
                <small className="hint">ขຂະໜາດທີ່ແນະນຳ: 300x300 px • JPG/PNG • ≤ 5MB</small>
              </div>
            </div>

            <div className="col-12 col-md-8">
              <form onSubmit={submitHandler}>

                <label htmlFor="customFile" className="form-label mb-2">ເລືອກຮູບພາບ</label>

                <div
                  role="button"
                  tabIndex={0}
                  className="dropzone mb-3"
                  onClick={() => document.getElementById('customFile')?.click()}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') document.getElementById('customFile')?.click(); }}
                  aria-label="Click or press Enter to select an image file"
                >
                  <p className="m-0"><strong>ລາກ ແລະ ວາງໄຟລ໌ທີ່ນີ້ ຫຼື ຄລິກເພື່ອເລືອກ</strong></p>
                  <p className="m-0 hint">ຮອງຮັບ JPG / PNG / GIF — ສູງສຸດ 5MB</p>
                </div>

                <input
                  id="customFile"
                  type="file"
                  accept="image/*"
                  className="form-control d-none"
                  onChange={onChange}
                  aria-label="Choose avatar image"
                />

                {fileInfo ? (
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div>
                      <div className="file-meta"><strong>{fileInfo.name}</strong></div>
                      <div className="hint">{humanFileSize(fileInfo.size)} • {fileInfo.type}</div>
                    </div>
                    <div>
                      <button type="button" className="btn btn-outline-secondary btn-sm me-2" onClick={clearFile} aria-label="Remove selected file">ລົບ</button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-3 text-muted">ຍັງບໍ່ໄດ້ເລືອກຮູບ</div>
                )}

                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary flex-grow-1"
                    disabled={isLoading || !avatar}
                    aria-disabled={isLoading || !avatar}
                  >
                    {isLoading ? 'กำลังอัปโหลด...' : 'อัปโหลดรูป'}
                  </button>

                  <button
                    type="button"
                    className="btn btn-clear"
                    onClick={() => navigate('/me/profile')}
                    aria-label="Cancel and go back"
                  >
                    ຍ້ອນກັບ
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      </Userlayout>
    </>
  );
};

export default UploadAvatar;
