// src/pages/Profile.jsx
import React, { useState } from 'react';
import Userlayout from '../layout/Userlayout';
import { useSelector } from 'react-redux';
import MetaData from '../layout/MetaData';
import Loader from '../layout/Loader';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function Profile() {
  const navigate = useNavigate();
  const { user, loading } = useSelector((state) => state.auth || {});
  const [copied, setCopied] = useState(false);

  if (loading) return <Loader />;

  if (!user) {
    return (
      <>
        <MetaData title={'ໂປຣຟາຍ'} />
        <Userlayout>
          <div className="container py-5 text-center">
            <div className="alert alert-warning">
              ບໍ່ພົບຂໍ້ມູນຜູ້ໃຊ້ — <Link to="/login">ເຂົ້າລະບົບ</Link>
            </div>
          </div>
        </Userlayout>
      </>
    );
  }

  const registeredDate = new Date(user.createdAt).toLocaleDateString('lo-LA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const avatarSrc =
    user?.avatar?.url ||
    'https://cdn-icons-png.flaticon.com/512/3607/3607444.png';

  const handleCopyId = async () => {
    await navigator.clipboard.writeText(user?._id || '');
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <>
      <MetaData title={'ໂປຣຟາຍ'} />

      <style>{`
        .profile-wrapper {
          background: #fff;
          padding: 30px;
          border-radius: 16px;
          box-shadow: 0 10px 24px rgba(0,0,0,0.06);
          max-width: 900px;
          margin: auto;
        }
        .profile-avatar {
          width: 150px;
          height: 150px;
          border-radius: 12px;
          object-fit: cover;
          box-shadow: 0 4px 18px rgba(0,0,0,0.12);
        }
        .profile-label {
          font-weight: 600;
          margin-bottom: 4px;
          color: #374151;
        }
        .copy-box {
          background: #fde2e4;
          padding: 5px 10px;
          border-radius: 6px;
          font-family: monospace;
          user-select: all;
        }
        @media(max-width: 768px){
          .action-buttons {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
        }
      `}</style>

      <Userlayout>
        <div className="container my-4">
          <div className="profile-wrapper">

            {/* Title */}
            <h3 className="text-center mb-4">ຂໍ້ມູນຜູ້ໃຊ້</h3>

            <div className="row align-items-start">

              {/* LEFT — Avatar + Buttons */}
              <div className="col-12 col-md-4 text-center">

                <img
                  src={avatarSrc}
                  alt="avatar"
                  className="profile-avatar mb-3"
                />

                <div className="action-buttons d-flex justify-content-center gap-2">
                  <Link to="/me/Upload_Avatar" className="btn btn-outline-primary btn-sm">
                    ປ່ຽນຮູບໂປຣຟາຍ
                  </Link>

                  <Link to="/me/Update_Profile" className="btn btn-outline-secondary btn-sm">
                    ແກ້ໄຂຂໍ້ມູນ
                  </Link>
                </div>

              </div>

              {/* RIGHT — Info */}
              <div className="col-12 col-md-8 mt-4 mt-md-0">

                <h4 className="text-capitalize">{user?.name}</h4>
                <div className="text-muted">{user?.email}</div>

                {/* Email Verify */}
                {user?.emailVerified ? (
                  <span className="badge bg-success mt-2">ອີເມວໄດ້ຮັບການຢືນຢັນ</span>
                ) : (
                  <span className="badge bg-warning text-dark mt-2">ອີເມວຍັງບໍ່ໄດ້ຮັບການຢືນຢັນ</span>
                )}

                <hr />

                <div className="mt-2">
                  <div className="profile-label">ວັນທີລົງທະບຽນ</div>
                  <div>{registeredDate}</div>
                </div>

                <div className="mt-3">
                  <div className="profile-label">User ID</div>

                  <div className="d-flex align-items-center gap-2">
                    <span className="copy-box">{user?._id}</span>

                    <button className="btn btn-outline-dark btn-sm" onClick={handleCopyId}>
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="profile-label">ລາຍລະອຽດເພີ່ມເຕີມ</div>
                  <ul>
                    <li>Role: <strong>{user?.role}</strong></li>
                  </ul>
                </div>

                <div className="mt-4">
                  <button
                    className="btn btn-outline-warning me-2"
                    onClick={() => navigate('/me/Update_Password')}
                  >
                    ປ່ຽນລະຫັດຜ່ານ
                  </button>

                  <Link to="/me/orders" className="btn btn-primary">
                    ຄຳສັ່ງຊື້ຂອງຂ້ອຍ
                  </Link>
                </div>

              </div>
            </div>

          </div>

          <div className="text-center text-muted mt-3 small">
            ຖ້າທ່ານຕ້ອງການຄວາມຊ່ວຍເຫຼືອ <a href="mailto:info@ithubb.com">info@ithubb.com</a>
          </div>
        </div>
      </Userlayout>
    </>
  );
}

export default Profile;
