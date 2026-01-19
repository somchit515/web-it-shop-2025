import React, { useState, useEffect } from "react";
import { useRegisterMutation } from "../redux/authApi";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import MetaData from "../layout/MetaData";

function Register() {
  const navigate = useNavigate();
  const [register, { isLoading, error, data }] = useRegisterMutation();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const { name, email, password } = user;

  // ตรวจสอบความแข็งแรงของรหัสผ่าน
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    setPasswordStrength(Math.min(strength, 4));
  }, [password]);

  // Redirect ถ้า login อยู่แล้ว
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // แสดง error
  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message || "ມີຂໍ້ຜິດພາດ");
    }
  }, [error]);

  // ลงทะเบียนสำเร็จ
  useEffect(() => {
    if (data?.message) {
      toast.success("ລົງທະບຽນສຳເລັດ! ກຳລັງນຳທ່ານໄປຫນ້າເຂົ້າສູ່ລະບົບ...");
      setTimeout(() => navigate("/login", { replace: true }), 1500);
    }
  }, [data, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!name.trim()) {
      toast.error("ກະລຸນາປ້ອນຊື່");
      return;
    }
    if (!email.trim()) {
      toast.error("ກະລຸນາປ້ອນອີເມວ");
      return;
    }
    if (password.length < 6) {
      toast.error("ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ");
      return;
    }

    try {
      await register({ name, email, password }).unwrap();
    } catch (err) {
      console.error("Register failed:", err);
    }
  };

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const getStrengthColor = () => {
    if (passwordStrength === 0) return "#e2e8f0";
    if (passwordStrength <= 2) return "#ef4444";
    if (passwordStrength === 3) return "#f59e0b";
    return "#10b981";
  };

  const getStrengthText = () => {
    if (passwordStrength === 0) return "";
    if (passwordStrength <= 2) return "ອ່ອນແອ";
    if (passwordStrength === 3) return "ປານກາງ";
    return "ແຂງແຮງ";
  };

  const EyeIcon = ({ open }) => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      {open ? (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </>
      ) : (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </>
      )}
    </svg>
  );

  return (
    <>
      <MetaData title="ລົງທະບຽນ" />

      <style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html, body, #root {
          height: 100%;
          width: 100%;
          overflow-x: hidden;
        }

        body {
          font-family: 'Inter', 'Noto Sans Lao', -apple-system, BlinkMacSystemFont, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .register-container {
          min-height: 100vh;
          width: 100vw;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          overflow-y: auto;
        }

        .register-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%);
          pointer-events: none;
        }

        .register-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 500px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 48px 40px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.3);
          animation: slideUp 0.5s ease-out;
          margin: auto;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .logo-section {
          text-align: center;
          margin-bottom: 32px;
        }

        .logo-wrapper {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-bottom: 8px;
        }

        .brand-logo {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
          padding: 12px;
          flex-shrink: 0;
        }

        .brand-logo img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .brand-text {
          text-align: left;
        }

        .brand-name {
          font-size: 28px;
          font-weight: 800;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.2;
        }

        .brand-tagline {
          font-size: 13px;
          color: #64748b;
          margin-top: 2px;
        }

        .welcome-text {
          text-align: center;
          margin-bottom: 32px;
        }

        .welcome-text h1 {
          font-size: 28px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 8px;
        }

        .welcome-text p {
          font-size: 14px;
          color: #64748b;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #334155;
          margin-bottom: 8px;
        }

        .input-wrapper {
          position: relative;
        }

        .form-input {
          width: 100%;
          padding: 14px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 15px;
          transition: all 0.2s ease;
          background: white;
          color: #1e293b;
        }

        .form-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
        }

        .form-input::placeholder {
          color: #94a3b8;
        }

        .form-input:disabled {
          background: #f1f5f9;
          cursor: not-allowed;
        }

        .password-toggle {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          cursor: pointer;
          color: #64748b;
          padding: 6px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .password-toggle:hover {
          background: #f1f5f9;
          color: #667eea;
        }

        .password-toggle:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        .password-strength {
          margin-top: 8px;
          display: flex;
          gap: 6px;
          align-items: center;
        }

        .strength-bars {
          flex: 1;
          display: flex;
          gap: 4px;
        }

        .strength-bar {
          height: 4px;
          flex: 1;
          background: #e2e8f0;
          border-radius: 2px;
          transition: all 0.3s ease;
        }

        .strength-bar.active {
          background: currentColor;
        }

        .strength-text {
          font-size: 12px;
          font-weight: 600;
          min-width: 60px;
          text-align: right;
        }

        .btn-primary {
          width: 100%;
          padding: 14px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 24px;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(102, 126, 234, 0.4);
        }

        .btn-primary:active:not(:disabled) {
          transform: translateY(0);
        }

        .btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .login-link {
          text-align: center;
          margin-top: 24px;
          font-size: 14px;
          color: #64748b;
        }

        .login-link a {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s ease;
          cursor: pointer;
        }

        .login-link a:hover {
          color: #764ba2;
        }

        .terms-note {
          text-align: center;
          margin-top: 16px;
          font-size: 12px;
          color: #94a3b8;
          line-height: 1.6;
        }

        /* Responsive Styles */
        @media (max-width: 640px) {
          .register-container {
            padding: 16px;
          }

          .register-card {
            padding: 32px 24px;
            max-width: 100%;
          }

          .logo-wrapper {
            flex-direction: column;
            gap: 12px;
          }

          .brand-text {
            text-align: center;
          }

          .brand-name {
            font-size: 24px;
          }

          .brand-tagline {
            font-size: 12px;
          }

          .welcome-text h1 {
            font-size: 22px;
          }

          .welcome-text p {
            font-size: 13px;
          }

          .form-input {
            font-size: 16px;
          }
        }

        @media (max-width: 400px) {
          .register-card {
            padding: 28px 20px;
          }

          .brand-logo {
            width: 56px;
            height: 56px;
          }

          .brand-name {
            font-size: 22px;
          }

          .welcome-text h1 {
            font-size: 20px;
          }

          .form-label {
            font-size: 13px;
          }

          .btn-primary {
            font-size: 15px;
            padding: 12px 20px;
          }
        }

        @media (max-height: 650px) and (orientation: landscape) {
          .register-container {
            padding: 12px;
          }

          .register-card {
            padding: 24px 32px;
            max-height: 100vh;
            overflow-y: auto;
          }

          .logo-section {
            margin-bottom: 20px;
          }

          .welcome-text {
            margin-bottom: 20px;
          }

          .form-group {
            margin-bottom: 16px;
          }

          .btn-primary {
            margin-top: 16px;
          }
        }

        @media (max-width: 360px) {
          .register-card {
            padding: 24px 16px;
          }

          .welcome-text h1 {
            font-size: 18px;
          }

          .brand-name {
            font-size: 20px;
          }
        }
      `}</style>

      <div className="register-container">
        <div className="register-card">
          {/* Logo Section */}
          <div className="logo-section">
            <div className="logo-wrapper">
              <div className="brand-logo">
                <img
                  src="/images/logo.png"
                  alt="IT HUBB Logo"
                  onError={(e) =>
                    (e.target.src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='60' x='50' text-anchor='middle' font-size='40' font-weight='bold' fill='white'%3EIT%3C/text%3E%3C/svg%3E")
                  }
                />
              </div>
              <div className="brand-text">
                <div className="brand-name">IT HUBB</div>
                <div className="brand-tagline">
                  ຮ້ານເຄື່ອງຖື ແລະ ອຸປະກອນ IT
                </div>
              </div>
            </div>
          </div>

          {/* Welcome Text */}
          <div className="welcome-text">
            <h1>ສ້າງບັນຊີໃໝ່</h1>
            <p>ລົງທະບຽນເພື່ອເລີ່ມໃຊ້ງານ IT HUBB</p>
          </div>

          {/* Register Form */}
          <div>
            {/* Name Field */}
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                ຊື່
              </label>
              <input
                id="name"
                type="text"
                name="name"
                className="form-input"
                value={name}
                onChange={handleChange}
                placeholder="ປ້ອນຊື່ຂອງທ່ານ"
                disabled={isLoading}
                required
              />
            </div>

            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                ອີເມວ
              </label>
              <input
                id="email"
                type="email"
                name="email"
                className="form-input"
                value={email}
                onChange={handleChange}
                placeholder="you@example.com"
                disabled={isLoading}
                required
              />
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                ລະຫັດຜ່ານ
              </label>
              <div className="input-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="form-input"
                  value={password}
                  onChange={handleChange}
                  placeholder="ປ້ອນລະຫັດຂອງທ່ານ (ຢ່າງໜ້ອຍ 6 ຕົວ)"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                  disabled={isLoading}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="password-strength" style={{ color: getStrengthColor() }}>
                  <div className="strength-bars">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`strength-bar ${
                          level <= passwordStrength ? "active" : ""
                        }`}
                      />
                    ))}
                  </div>
                  <span className="strength-text">{getStrengthText()}</span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="button"
              className="btn-primary"
              disabled={isLoading}
              onClick={handleSubmit}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  <span>ກຳລັງລົງທະບຽນ...</span>
                </>
              ) : (
                <span>ລົງທະບຽນ</span>
              )}
            </button>

            {/* Terms Note */}
            <div className="terms-note">
              ການລົງທະບຽນແມ່ນເທົ່າກັບການຍອມຮັບ
              <br />
              ຂໍ້ກຳນົດ ແລະ ເງື່ອນໄຂຂອງ IT HUBB
            </div>

            {/* Login Link */}
            <div className="login-link">
              ມີບັນຊີແລ້ວ?{" "}
              <a onClick={() => navigate("/login")}>ເຂົ້າສູ່ລະບົບ</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Register;