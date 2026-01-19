// src/pages/UpdateProfile.jsx
import React, { useEffect, useState } from 'react';
import Userlayout from '../layout/Userlayout';
import MetaData from '../layout/MetaData';
import { useUpdateProfileMutation } from '../redux/api/userApi';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Loader from '../layout/Loader';

function UpdateProfile() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useSelector((s) => s.auth || {});

  // form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // avatar upload
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  // mutation
  const [updateProfile, { isLoading, isSuccess, error }] = useUpdateProfileMutation();

  // init form from user
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setAvatarPreview(user?.avatar?.url || '');
    }
  }, [user]);

  // show server errors (if any) as toast
  useEffect(() => {
    if (error) {
      // RTK Query error shape may vary — show best info available
      const message = error?.data?.message || error?.error || 'ອັບເດດບໍ່ສຳເລັດ';
      toast.error(message);
    }
  }, [error]);

  // on success redirect with toast
  useEffect(() => {
    if (isSuccess) {
      toast.success('ອັບເດດໂປຣໄຟລ໌ສຳເລັດ');
      navigate('/me/profile');
    }
  }, [isSuccess, navigate]);

  if (authLoading) return <Loader />;

  // avatar change handler: preview and store file
  const handleAvatarChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    // simple file size limit 5MB
    if (f.size > 5 * 1024 * 1024) {
      toast.error('ໄຟລໃຫຍ່ເກີນ 5MB');
      return;
    }

    setAvatarFile(f);

    // create preview for images, otherwise clear preview
    if (f.type.startsWith('image/')) {
      const url = URL.createObjectURL(f);
      setAvatarPreview(url);
    } else {
      setAvatarPreview('');
    }
  };

  // basic client validation
  const isEmailValid = (em) => {
    if (!em) return false;
    // basic email regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em);
  };

  const changedSomething = () => {
    if (!user) return true;
    if (name !== (user.name || '')) return true;
    if (email !== (user.email || '')) return true;
    if (avatarFile) return true;
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) return toast.error('กรุณากรอกชื่อ');
    if (!isEmailValid(email)) return toast.error('อีเมลไม่ถูกต้อง');

    try {
      // If avatar selected -> send FormData (multipart)
      if (avatarFile) {
        const fd = new FormData();
        fd.append('name', name.trim());
        fd.append('email', email.trim());
        fd.append('avatar', avatarFile);

        // NOTE: your backend must accept multipart/form-data for avatar upload.
        const res = await updateProfile(fd).unwrap();
        // unwrap will throw on error, so below only on success
        // success handled by isSuccess effect
      } else {
        // send JSON patch
        const payload = { name: name.trim(), email: email.trim() };
        const res = await updateProfile(payload).unwrap();
      }
    } catch (err) {
      // error handled by RTK Query but also show fallback
      const msg = err?.data?.message || err?.error || 'Update failed';
      toast.error(msg);
    }
  };

  // cancel avatar preview (revoke blob URL)
  const handleRemoveAvatar = () => {
    if (avatarPreview && avatarFile) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarFile(null);
    setAvatarPreview(user?.avatar?.url || '');
  };

  return (
    <>
      <MetaData title={'ອັບເດດໂປຣໄຟລ໌'} />
      <Userlayout>
        <div className="row justify-content-center mt-4">
          <div className="col-12 col-md-8 col-lg-6">
            <form
              onSubmit={handleSubmit}
              className="card p-4 shadow-sm"
              aria-labelledby="update-profile-heading"
            >
              <h2 id="update-profile-heading" className="mb-3">ແກ້ໄຂໂປຣໄຟລ໌</h2>

              {/* avatar preview + upload */}
              <div className="mb-3 d-flex flex-column align-items-center">
                <div style={{ width: 120, height: 120, borderRadius: 12, overflow: 'hidden', boxShadow: '0 6px 18px rgba(0,0,0,0.08)' }}>
                  <img
                    src={avatarPreview || 'https://cdn-icons-png.flaticon.com/512/3607/3607444.png'}
                    alt="avatar preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </div>

                <div className="mt-3 d-flex gap-2">
                  <label className="btn btn-outline-primary btn-sm mb-0" aria-label="Change avatar">
                    ປ່ຽນຮູບໂປຣຟາຍ
                    <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
                  </label>

                  {avatarFile && (
                    <button type="button" className="btn btn-outline-danger btn-sm" onClick={handleRemoveAvatar}>
                      ຍົກເລີກຮູບ
                    </button>
                  )}
                </div>

                <small className="text-muted mt-2">ຂະໜາດສູງສຸດ 5MB • JPG/PNG</small>
              </div>

              {/* Name */}
              <div className="mb-3">
                <label htmlFor="name_field" className="form-label">ຊື່ ແລະ ນາມສະກຸນ</label>
                <input
                  id="name_field"
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  aria-required
                />
              </div>

              {/* Email */}
              <div className="mb-3">
                <label htmlFor="email_field" className="form-label">Email</label>
                <input
                  id="email_field"
                  type="email"
                  className={`form-control ${email && !isEmailValid(email) ? 'is-invalid' : ''}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <div className="invalid-feedback">ອີເມວບໍ່ຖືກຕ້ອງ</div>
              </div>

              {/* Buttons */}
              <div className="d-flex gap-2">
                <button
                  type="submit"
                  className="btn btn-primary flex-grow-1"
                  disabled={isLoading || !changedSomething()}
                  aria-disabled={isLoading || !changedSomething()}
                >
                  {isLoading ? 'ກຳລັງອັບເດດ...' : (changedSomething() ? 'ອັບເດດໂປຣໄຟລ໌' : 'ບໍ່ມີການປ່ຽນແປງ')}
                </button>

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => navigate('/me/profile')}
                >
                  ຍ້ອນກັບ
                </button>
              </div>

              <div className="mt-3 text-muted small">
                ປ່ຽນຊື່/ອີເມວອາດຈະມີຜົນກະທົບຕໍ່ການເຂົ້າສູ້ລະບົບ
              </div>
            </form>
          </div>
        </div>
      </Userlayout>
    </>
  );
}

export default UpdateProfile;
