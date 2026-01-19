import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faUsers,
  faUserEdit,
  faSave,
  faTimes,
  faSpinner,
  faInfoCircle,
  faUserCircle,
  faSignature,
  faEnvelope,
  faShieldAlt,
  faUserTag,
  faUser,
  faUserShield,
  faCrown
} from '@fortawesome/free-solid-svg-icons';

import Loader from '../layout/Loader';
import toast from 'react-hot-toast';
import MetaData from '../layout/MetaData';
import AdminLayout from '../layout/AdminLayout';

import {
  useGetUsersDetailsQuery,
  useUpdateUserMutation
} from '../redux/api/userApi';

function UpdateUsers() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");

  const navigate = useNavigate();
  const param = useParams();

  const {
    data: userData,
    isLoading: isDetailsLoading,
    error: detailsError
  } = useGetUsersDetailsQuery(param?.id);

  const [
    updateUser,
    { error: updateError, isSuccess, isLoading: isUpdateLoading }
  ] = useUpdateUserMutation();

  useEffect(() => {
    if (userData?.user) {
      setName(userData.user.name);
      setEmail(userData.user.email);
      setRole(userData.user.role);
    }

    if (detailsError) {
      toast.error(detailsError?.data?.message);
    }

    if (updateError) {
      toast.error(updateError?.data?.message);
    }

    if (isSuccess) {
      toast.success("ອັບເດດຜູ້ໃຊ້ສຳເລັດ");
      navigate("/admin/users");
    }
  }, [userData, detailsError, updateError, isSuccess, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("ກະລຸນາປ້ອນຊື່ຜູ້ໃຊ້");
      return;
    }
    
    if (!email.trim()) {
      toast.error("ກະລຸນາປ້ອນອີເມວ");
      return;
    }
    
    if (!role) {
      toast.error("ກະລຸນາເລືອກບົດບາດ");
      return;
    }

    const body = { name, email, role };
    updateUser({ id: param.id, body });
  };

  const getRoleIcon = (roleValue) => {
    switch(roleValue) {
      case 'user': return faUser;
      case 'admin': return faUserShield;
      case 'superAdmin': return faCrown;
      default: return faUser;
    }
  };

  const getRoleText = (roleValue) => {
    switch(roleValue) {
      case 'user': return 'ຜູ້ໃຊ້ທົ່ວໄປ';
      case 'admin': return 'ຜູ້ດູແລລະບົບ';
      case 'superAdmin': return 'ຜູ້ດູແລສູງສຸດ';
      default: return roleValue;
    }
  };

  if (isDetailsLoading) return <Loader />;

  return (
    <>
      <MetaData title="ອັບເດດຜູ້ໃຊ້ - Admin" />
      <style>{`
        .update-user-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 0;
        }

        .page-header {
          margin-bottom: 2rem;
        }

        .breadcrumb-nav {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.875rem;
          color: #64748b;
          margin-bottom: 0.75rem;
        }

        .breadcrumb-nav a {
          color: #667eea;
          text-decoration: none;
          transition: color 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .breadcrumb-nav a:hover {
          color: #764ba2;
        }

        .page-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .page-title svg {
          color: #667eea;
        }

        .page-subtitle {
          color: #64748b;
          font-size: 0.95rem;
          margin: 0;
        }

        .user-form {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        .info-card {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
          border-radius: 12px;
          padding: 1rem 1.25rem;
          margin-bottom: 2rem;
          border: 1px solid rgba(102, 126, 234, 0.1);
          display: flex;
          gap: 12px;
        }

        .info-card-icon {
          color: #667eea;
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .info-card-content {
          flex: 1;
        }

        .info-card-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: #667eea;
          margin-bottom: 0.25rem;
        }

        .info-card-text {
          font-size: 0.875rem;
          color: #64748b;
          margin: 0;
          line-height: 1.5;
        }

        .form-section {
          margin-bottom: 2rem;
        }

        .section-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          gap: 10px;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid #f1f5f9;
        }

        .section-title svg {
          color: #667eea;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          font-weight: 600;
          color: #334155;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .form-label svg {
          color: #667eea;
          font-size: 0.875rem;
        }

        .form-control,
        .form-select {
          width: 100%;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          padding: 12px 16px;
          font-size: 0.95rem;
          transition: all 0.2s ease;
          background: white;
          color: #1e293b;
        }

        .form-control:focus,
        .form-select:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
          background: white;
          outline: none;
        }

        .form-control:disabled {
          background: #f1f5f9;
          cursor: not-allowed;
          color: #94a3b8;
        }

        .role-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0.625rem 1rem;
          border-radius: 10px;
          font-size: 0.875rem;
          font-weight: 600;
          margin-top: 0.75rem;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .role-badge.user {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          color: #1e40af;
          border: 1px solid #93c5fd;
        }

        .role-badge.admin {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          color: #92400e;
          border: 1px solid #fcd34d;
        }

        .role-badge.superAdmin {
          background: linear-gradient(135deg, #fecaca 0%, #fca5a5 100%);
          color: #991b1b;
          border: 1px solid #f87171;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 2px solid #f1f5f9;
        }

        .btn-update {
          flex: 1;
          padding: 14px 24px;
          font-weight: 600;
          font-size: 1rem;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
          cursor: pointer;
        }

        .btn-update:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .btn-update:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .btn-cancel {
          flex: 0.5;
          padding: 14px 24px;
          font-weight: 600;
          font-size: 1rem;
          border-radius: 12px;
          border: 2px solid #e2e8f0;
          background: white;
          color: #64748b;
          transition: all 0.2s ease;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .btn-cancel:hover:not(:disabled) {
          border-color: #cbd5e1;
          background: #f8fafc;
        }

        .btn-cancel:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner-icon {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .user-avatar-preview {
          margin-top: 1rem;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .user-avatar-preview img {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          border: 2px solid #667eea;
          object-fit: cover;
        }

        .user-avatar-info h4 {
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 0.25rem 0;
        }

        .user-avatar-info p {
          font-size: 0.875rem;
          color: #64748b;
          margin: 0;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .user-form {
            padding: 1.5rem;
          }

          .form-actions {
            flex-direction: column-reverse;
          }

          .btn-update,
          .btn-cancel {
            flex: 1;
            width: 100%;
          }

          .page-title {
            font-size: 1.5rem;
          }

          .info-card {
            padding: 0.875rem 1rem;
          }
        }
      `}</style>

      <AdminLayout>
        <div className="update-user-container">
          {/* Page Header */}
          <div className="page-header">
            <div className="breadcrumb-nav">
              <Link to="/admin/dashboard">
                <FontAwesomeIcon icon={faHome} /> Dashboard
              </Link>
              <span>/</span>
              <Link to="/admin/users">
                <FontAwesomeIcon icon={faUsers} /> ຜູ້ໃຊ້
              </Link>
              <span>/</span>
              <span>ອັບເດດ</span>
            </div>
            <h1 className="page-title">
              <FontAwesomeIcon icon={faUserEdit} />
              ອັບເດດຂໍ້ມູນຜູ້ໃຊ້
            </h1>
            <p className="page-subtitle">
              ແກ້ໄຂຂໍ້ມູນຜູ້ໃຊ້ງານ ແລະ ກຳນົດສິດການເຂົ້າເຖິງ
            </p>
          </div>

          {/* User Form */}
          <form className="user-form" onSubmit={handleSubmit}>
            {/* Info Card */}
            <div className="info-card">
              <FontAwesomeIcon icon={faInfoCircle} className="info-card-icon" />
              <div className="info-card-content">
                <div className="info-card-title">ຂໍ້ມູນສຳຄັນ</div>
                <p className="info-card-text">
                  ກະລຸນາກວດສອບຂໍ້ມູນໃຫ້ຖືກຕ້ອງກ່ອນບັນທຶກ. ການປ່ຽນ Role ຈະມີຜົນກັບສິດການເຂົ້າເຖິງຂອງຜູ້ໃຊ້ທັນທີ.
                </p>
              </div>
            </div>

            {/* User Avatar Preview */}
            {userData?.user?.avatar && (
              <div className="user-avatar-preview">
                <img
                  src={userData.user.avatar.url || "https://cdn-icons-png.flaticon.com/512/3607/3607444.png"}
                  alt={name}
                />
                <div className="user-avatar-info">
                  <h4>{name || 'N/A'}</h4>
                  <p>User ID: #{param?.id?.substring(0, 8)}...</p>
                </div>
              </div>
            )}

            {/* Personal Information Section */}
            <div className="form-section">
              <div className="section-title">
                <FontAwesomeIcon icon={faUserCircle} />
                ຂໍ້ມູນສ່ວນຕົວ
              </div>

              <div className="form-group">
                <label htmlFor="name_field" className="form-label">
                  <FontAwesomeIcon icon={faSignature} />
                  ຊື່ຜູ້ໃຊ້
                </label>
                <input
                  type="text"
                  id="name_field"
                  className="form-control"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ປ້ອນຊື່ຜູ້ໃຊ້"
                  required
                  disabled={isUpdateLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email_field" className="form-label">
                  <FontAwesomeIcon icon={faEnvelope} />
                  ອີເມວ
                </label>
                <input
                  type="email"
                  id="email_field"
                  className="form-control"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  required
                  disabled={isUpdateLoading}
                />
              </div>
            </div>

            {/* Access Control Section */}
            <div className="form-section">
              <div className="section-title">
                <FontAwesomeIcon icon={faShieldAlt} />
                ການຄວບຄຸມການເຂົ້າເຖິງ
              </div>

              <div className="form-group">
                <label htmlFor="role_field" className="form-label">
                  <FontAwesomeIcon icon={faUserTag} />
                  ບົດບາດ (Role)
                </label>
                <select
                  id="role_field"
                  className="form-select"
                  name="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                  disabled={isUpdateLoading}
                >
                  <option value="">-- ເລືອກບົດບາດ --</option>
                  <option value="user">User - ຜູ້ໃຊ້ທົ່ວໄປ</option>
                  <option value="admin">Admin - ຜູ້ດູແລລະບົບ</option>
                  <option value="superAdmin">Super Admin - ຜູ້ດູແລສູງສຸດ</option>
                </select>
                
                {role && (
                  <div className={`role-badge ${role}`}>
                    <FontAwesomeIcon icon={getRoleIcon(role)} />
                    {getRoleText(role)}
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => navigate("/admin/users")}
                disabled={isUpdateLoading}
              >
                <FontAwesomeIcon icon={faTimes} />
                ຍົກເລີກ
              </button>
              <button
                type="submit"
                className="btn-update"
                disabled={isUpdateLoading}
              >
                {isUpdateLoading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="spinner-icon" />
                    ກຳລັງອັບເດດ...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSave} />
                    ບັນທຶກການປ່ຽນແປງ
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </AdminLayout>
    </>
  );
}

export default UpdateUsers;