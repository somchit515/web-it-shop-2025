import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateUserMutation } from "../../components/redux/api/userApi";
import toast from "react-hot-toast";
import MetaData from "../../components/layout/MetaData";
import AdminLayout from "../../components/layout/AdminLayout";

const NewUser = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("user");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const [createUser, { isLoading, error, isSuccess }] = useCreateUserMutation();

  const submitHandler = (e) => {
    e.preventDefault();
    
    // Validation
    if (password !== confirmPassword) {
      toast.error("ລະຫັດຜ່ານບໍ່ກົງກັນ");
      return;
    }
    
    if (password.length < 6) {
      toast.error("ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ");
      return;
    }

    createUser({ name, email, password, role });
  };

  React.useEffect(() => {
    if (isSuccess) {
      toast.success("ສ້າງຜູ້ໃຊ້ສຳເລັດແລ້ວ!");
      setTimeout(() => {
        navigate("/admin/users");
      }, 1500);
    }
    if (error) {
      toast.error(error?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການສ້າງຜູ້ໃຊ້");
    }
  }, [isSuccess, error, navigate]);

  return (
    <>
      <style>{`
        .new-user-container {
          max-width: 900px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: 2rem;
        }

        .page-title {
          font-size: 1.75rem;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }

        .page-subtitle {
          color: #718096;
          font-size: 0.95rem;
          margin: 0;
        }

        .breadcrumb-nav {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.875rem;
          color: #718096;
          margin-top: 0.5rem;
        }

        .breadcrumb-nav a {
          color: #667eea;
          text-decoration: none;
          transition: color 0.2s;
        }

        .breadcrumb-nav a:hover {
          color: #764ba2;
        }

        .user-form {
          background: white;
          border-radius: 16px;
          padding: 2.5rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(102, 126, 234, 0.1);
        }

        .form-section {
          margin-bottom: 2rem;
        }

        .section-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          gap: 10px;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid #f1f5f9;
        }

        .section-title i {
          color: #667eea;
          font-size: 1.2rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .form-label i {
          color: #667eea;
          font-size: 0.9rem;
        }

        .required-mark {
          color: #ef4444;
          margin-left: 2px;
        }

        .form-control,
        .form-select {
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          padding: 0.75rem 1rem;
          font-size: 0.95rem;
          transition: all 0.2s ease;
          background: #f8fafc;
        }

        .form-control:focus,
        .form-select:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
          background: white;
          outline: none;
        }

        .password-input-wrapper {
          position: relative;
        }

        .password-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 4px 8px;
          transition: color 0.2s;
        }

        .password-toggle:hover {
          color: #667eea;
        }

        .password-strength {
          margin-top: 0.5rem;
          font-size: 0.8rem;
        }

        .strength-bar {
          height: 4px;
          border-radius: 2px;
          background: #e2e8f0;
          margin-top: 0.25rem;
          overflow: hidden;
        }

        .strength-fill {
          height: 100%;
          transition: all 0.3s ease;
        }

        .strength-weak .strength-fill {
          width: 33%;
          background: #ef4444;
        }

        .strength-medium .strength-fill {
          width: 66%;
          background: #f59e0b;
        }

        .strength-strong .strength-fill {
          width: 100%;
          background: #10b981;
        }

        .role-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-top: 0.75rem;
        }

        .role-card {
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          background: white;
          text-align: center;
        }

        .role-card:hover {
          border-color: #cbd5e1;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .role-card.selected {
          border-color: #667eea;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
        }

        .role-card-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .role-card.user-role .role-card-icon {
          color: #3b82f6;
        }

        .role-card.admin-role .role-card-icon {
          color: #f59e0b;
        }

        .role-card.superadmin-role .role-card-icon {
          color: #ef4444;
        }

        .role-card-title {
          font-weight: 600;
          color: #2d3748;
          font-size: 0.95rem;
          margin-bottom: 0.25rem;
        }

        .role-card-desc {
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .info-banner {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
          border-left: 4px solid #667eea;
          border-radius: 8px;
          padding: 1rem 1.25rem;
          margin-bottom: 1.5rem;
        }

        .info-banner-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: #667eea;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .info-banner-text {
          font-size: 0.875rem;
          color: #64748b;
          margin: 0;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 2px solid #f1f5f9;
        }

        .btn-create {
          flex: 1;
          padding: 0.875rem 2rem;
          font-weight: 600;
          font-size: 1rem;
          border-radius: 10px;
          border: none;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .btn-create:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }

        .btn-create:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-cancel {
          flex: 0.5;
          padding: 0.875rem 2rem;
          font-weight: 600;
          font-size: 1rem;
          border-radius: 10px;
          border: 2px solid #e2e8f0;
          background: white;
          color: #64748b;
          transition: all 0.2s ease;
        }

        .btn-cancel:hover {
          border-color: #cbd5e1;
          background: #f8fafc;
        }

        .helper-text {
          font-size: 0.8rem;
          color: #94a3b8;
          margin-top: 0.25rem;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        @media (max-width: 768px) {
          .user-form {
            padding: 1.5rem;
          }

          .form-row,
          .role-cards {
            grid-template-columns: 1fr;
          }

          .form-actions {
            flex-direction: column-reverse;
          }

          .btn-create,
          .btn-cancel {
            flex: 1;
          }

          .page-title {
            font-size: 1.5rem;
          }
        }

        .spinner-icon {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <AdminLayout>
        <MetaData title="ສ້າງຜູ້ໃຊ້ໃໝ່ — Admin" />
        
        <div className="new-user-container">
          {/* Page Header */}
          <div className="page-header">
            <div className="breadcrumb-nav">
              <a href="/admin/dashboard">
                <i className="fas fa-home"></i> Dashboard
              </a>
              <span>/</span>
              <a href="/admin/users">
                <i className="fas fa-users"></i> ຜູ້ໃຊ້
              </a>
              <span>/</span>
              <span>ສ້າງຜູ້ໃຊ້ໃໝ່</span>
            </div>
            <h1 className="page-title">
              <i className="fas fa-user-plus"></i> ສ້າງຜູ້ໃຊ້ໃໝ່
            </h1>
            <p className="page-subtitle">
              ເພີ່ມຜູ້ໃຊ້ງານໃໝ່ເຂົ້າລະບົບ ແລະ ກຳນົດສິດການເຂົ້າເຖິງ
            </p>
          </div>

          {/* User Form */}
          <form className="user-form" onSubmit={submitHandler}>
            {/* Info Banner */}
            <div className="info-banner">
              <div className="info-banner-title">
                <i className="fas fa-info-circle"></i>
                ຂໍ້ມູນສຳຄັນ
              </div>
              <p className="info-banner-text">
                ຜູ້ໃຊ້ໃໝ່ຈະໄດ້ຮັບອີເມວຢືນຢັນບັນຊີ. ກະລຸນາກວດສອບຂໍ້ມູນໃຫ້ຖືກຕ້ອງກ່ອນບັນທຶກ.
              </p>
            </div>

            {/* Personal Information Section */}
            <div className="form-section">
              <div className="section-title">
                <i className="fas fa-user-circle"></i>
                ຂໍ້ມູນສ່ວນຕົວ
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name_field" className="form-label">
                    <i className="fas fa-signature"></i>
                    ຊື່ຜູ້ໃຊ້
                    <span className="required-mark">*</span>
                  </label>
                  <input
                    type="text"
                    id="name_field"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ປ້ອນຊື່ຜູ້ໃຊ້"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email_field" className="form-label">
                    <i className="fas fa-envelope"></i>
                    ອີເມວ
                    <span className="required-mark">*</span>
                  </label>
                  <input
                    type="email"
                    id="email_field"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    required
                  />
                  <div className="helper-text">
                    <i className="fas fa-info-circle"></i>
                    ອີເມວສຳລັບເຂົ້າສູ່ລະບົບ
                  </div>
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="form-section">
              <div className="section-title">
                <i className="fas fa-lock"></i>
                ຄວາມປອດໄພ
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="password_field" className="form-label">
                    <i className="fas fa-key"></i>
                    ລະຫັດຜ່ານ
                    <span className="required-mark">*</span>
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password_field"
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i className={`fas fa-${showPassword ? 'eye-slash' : 'eye'}`}></i>
                    </button>
                  </div>
                  {password && (
                    <div className={`password-strength strength-${
                      password.length < 6 ? 'weak' : 
                      password.length < 10 ? 'medium' : 'strong'
                    }`}>
                      <div className="strength-bar">
                        <div className="strength-fill"></div>
                      </div>
                    </div>
                  )}
                  <div className="helper-text">
                    <i className="fas fa-shield-alt"></i>
                    ຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirm_password_field" className="form-label">
                    <i className="fas fa-check-circle"></i>
                    ຢືນຢັນລະຫັດຜ່ານ
                    <span className="required-mark">*</span>
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirm_password_field"
                      className="form-control"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <i className={`fas fa-${showConfirmPassword ? 'eye-slash' : 'eye'}`}></i>
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <div className="helper-text" style={{color: '#ef4444'}}>
                      <i className="fas fa-exclamation-circle"></i>
                      ລະຫັດຜ່ານບໍ່ກົງກັນ
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Role Selection Section */}
            <div className="form-section">
              <div className="section-title">
                <i className="fas fa-shield-alt"></i>
                ບົດບາດ ແລະ ສິດການເຂົ້າເຖິງ
              </div>

              <div className="role-cards">
                <div 
                  className={`role-card user-role ${role === 'user' ? 'selected' : ''}`}
                  onClick={() => setRole('user')}
                >
                  <div className="role-card-icon">
                    <i className="fas fa-user"></i>
                  </div>
                  <div className="role-card-title">User</div>
                  <div className="role-card-desc">ຜູ້ໃຊ້ທົ່ວໄປ</div>
                </div>

                <div 
                  className={`role-card admin-role ${role === 'admin' ? 'selected' : ''}`}
                  onClick={() => setRole('admin')}
                >
                  <div className="role-card-icon">
                    <i className="fas fa-user-shield"></i>
                  </div>
                  <div className="role-card-title">Admin</div>
                  <div className="role-card-desc">ຜູ້ດູແລລະບົບ</div>
                </div>

                <div 
                  className={`role-card superadmin-role ${role === 'superAdmin' ? 'selected' : ''}`}
                  onClick={() => setRole('superAdmin')}
                >
                  <div className="role-card-icon">
                    <i className="fas fa-crown"></i>
                  </div>
                  <div className="role-card-title">Super Admin</div>
                  <div className="role-card-desc">ຜູ້ດູແລສູງສຸດ</div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => navigate("/admin/users")}
                disabled={isLoading}
              >
                <i className="fas fa-times"></i> ຍົກເລີກ
              </button>
              <button
                type="submit"
                className="btn-create"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner spinner-icon"></i>
                    ກຳລັງສ້າງຜູ້ໃຊ້...
                  </>
                ) : (
                  <>
                    <i className="fas fa-user-plus"></i>
                    ສ້າງຜູ້ໃຊ້
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </AdminLayout>
    </>
  );
};

export default NewUser;