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
          overflow-x: clip;
        }

        body {
          font-family: 'Inter', 'Noto Sans Lao', -apple-system, BlinkMacSystemFont, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* ================ SPLIT SCREEN LAYOUT ================ */
        .register-container {
          min-height: 100vh;
          width: 100vw;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          overflow: hidden;
          background: #0f172a;
        }

        /* ============ LEFT BRANDING PANEL ============ */
        .register-brand-panel {
          flex: 1.1;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 56px 64px;
          overflow: hidden;
          background:
            radial-gradient(circle at 15% 20%, rgba(99, 102, 241, 0.55) 0%, transparent 50%),
            radial-gradient(circle at 85% 80%, rgba(236, 72, 153, 0.45) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.30) 0%, transparent 60%),
            linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%);
        }

        .register-brand-panel::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(rgba(255, 255, 255, 0.08) 1.5px, transparent 1.5px);
          background-size: 28px 28px;
          mask-image: radial-gradient(ellipse at center, black 30%, transparent 75%);
          -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 75%);
          pointer-events: none;
        }

        .brand-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          pointer-events: none;
          animation: floatOrb 12s ease-in-out infinite;
        }
        .brand-orb-1 {
          width: 320px;
          height: 320px;
          background: radial-gradient(circle, rgba(168, 85, 247, 0.6), transparent 70%);
          top: -80px;
          left: -80px;
        }
        .brand-orb-2 {
          width: 280px;
          height: 280px;
          background: radial-gradient(circle, rgba(56, 189, 248, 0.5), transparent 70%);
          bottom: -60px;
          right: -60px;
          animation-delay: -6s;
        }
        .brand-orb-3 {
          width: 220px;
          height: 220px;
          background: radial-gradient(circle, rgba(236, 72, 153, 0.4), transparent 70%);
          top: 40%;
          right: 20%;
          animation-delay: -3s;
        }

        @keyframes floatOrb {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -40px) scale(1.08); }
          66% { transform: translate(-20px, 30px) scale(0.95); }
        }

        .brand-top {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .brand-top-logo {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: linear-gradient(135deg, #818cf8, #c084fc);
          display: grid;
          place-items: center;
          padding: 10px;
          box-shadow: 0 12px 32px rgba(129, 140, 248, 0.5);
        }
        .brand-top-logo img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .brand-top-name {
          color: white;
          font-size: 22px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .brand-hero {
          position: relative;
          z-index: 2;
          color: white;
        }

        .brand-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 24px;
          backdrop-filter: blur(10px);
        }
        .brand-hero-badge::before {
          content: '🎁';
          font-size: 12px;
        }

        .brand-hero h2 {
          font-size: clamp(32px, 3.5vw, 48px);
          font-weight: 800;
          line-height: 1.15;
          margin-bottom: 18px;
          letter-spacing: -1px;
        }
        .brand-hero h2 span {
          background: linear-gradient(135deg, #c084fc 0%, #f0abfc 50%, #fbcfe8 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .brand-hero p {
          font-size: 16px;
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.75);
          max-width: 480px;
          margin-bottom: 32px;
        }

        .brand-perks {
          display: flex;
          flex-direction: column;
          gap: 14px;
          max-width: 520px;
        }
        .brand-perk {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 14px;
          backdrop-filter: blur(10px);
          color: white;
          transition: all 0.3s ease;
        }
        .brand-perk:hover {
          background: rgba(255, 255, 255, 0.09);
          transform: translateX(4px);
          border-color: rgba(192, 132, 252, 0.4);
        }
        .brand-perk-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(129, 140, 248, 0.3), rgba(192, 132, 252, 0.3));
          border: 1px solid rgba(192, 132, 252, 0.35);
          display: grid;
          place-items: center;
          color: #e9d5ff;
          font-size: 16px;
          flex-shrink: 0;
        }
        .brand-perk-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .brand-perk-text strong {
          font-size: 14px;
          font-weight: 700;
        }
        .brand-perk-text small {
          font-size: 12px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.6);
        }

        .brand-bottom {
          position: relative;
          z-index: 2;
          color: rgba(255, 255, 255, 0.55);
          font-size: 13px;
          display: flex;
          gap: 22px;
        }
        .brand-bottom span:hover { color: white; cursor: pointer; }

        /* ============ RIGHT FORM PANEL ============ */
        .register-form-panel {
          flex: 0.9;
          background: linear-gradient(180deg, #fafbff 0%, #f1f5f9 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          overflow-y: auto;
          position: relative;
        }

        .register-form-panel::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(102, 126, 234, 0.08), transparent 70%);
          pointer-events: none;
        }

        .register-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 520px;
          background: white;
          border-radius: 20px;
          padding: 48px 44px;
          box-shadow:
            0 1px 3px rgba(0, 0, 0, 0.05),
            0 20px 50px rgba(15, 23, 42, 0.08);
          border: 1px solid rgba(226, 232, 240, 0.8);
          animation: slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
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

        .welcome-text {
          text-align: left;
          margin-bottom: 28px;
        }

        .welcome-text h1 {
          font-size: 32px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }

        .welcome-text p {
          font-size: 15px;
          color: #64748b;
          line-height: 1.5;
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
          margin-top: 10px;
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .strength-bars {
          flex: 1;
          display: flex;
          gap: 4px;
        }

        .strength-bar {
          height: 5px;
          flex: 1;
          background: #e2e8f0;
          border-radius: 3px;
          transition: all 0.3s ease;
        }

        .strength-bar.active {
          background: currentColor;
        }

        .strength-text {
          font-size: 12px;
          font-weight: 700;
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
          font-weight: 700;
          transition: color 0.2s ease;
          cursor: pointer;
        }

        .login-link a:hover {
          color: #764ba2;
        }

        .terms-note {
          text-align: center;
          margin-top: 18px;
          font-size: 12px;
          color: #94a3b8;
          line-height: 1.6;
          padding: 12px 14px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
        }

        /* ================ RESPONSIVE ================ */
        @media (max-width: 1024px) {
          .register-brand-panel {
            display: none;
          }
          .register-form-panel {
            flex: 1;
          }
        }

        @media (max-width: 640px) {
          .register-form-panel {
            padding: 16px;
          }

          .register-card {
            padding: 32px 24px;
            max-width: 100%;
            border-radius: 16px;
          }

          .welcome-text h1 {
            font-size: 24px;
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

          .welcome-text h1 {
            font-size: 22px;
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
          .register-form-panel {
            padding: 12px;
          }

          .register-card {
            padding: 24px 32px;
            max-height: 100vh;
            overflow-y: auto;
          }

          .welcome-text {
            margin-bottom: 18px;
          }

          .form-group {
            margin-bottom: 14px;
          }

          .btn-primary {
            margin-top: 14px;
          }
        }

        @media (max-width: 360px) {
          .register-card {
            padding: 24px 16px;
          }

          .welcome-text h1 {
            font-size: 20px;
          }
        }
      `}</style>

      <div className="register-container">
        {/* ============ LEFT BRANDING PANEL ============ */}
        <div className="register-brand-panel">
          <span className="brand-orb brand-orb-1" aria-hidden="true" />
          <span className="brand-orb brand-orb-2" aria-hidden="true" />
          <span className="brand-orb brand-orb-3" aria-hidden="true" />

          <div className="brand-top">
            <div className="brand-top-logo">
              <img
                src="/images/logo.png"
                alt="IT HUBB Logo"
                onError={(e) =>
                  (e.target.src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='60' x='50' text-anchor='middle' font-size='40' font-weight='bold' fill='white'%3EIT%3C/text%3E%3C/svg%3E")
                }
              />
            </div>
            <span className="brand-top-name">IT HUBB</span>
          </div>

          <div className="brand-hero">
            <div className="brand-hero-badge">ສະມາຊິກໃໝ່ຮັບສ່ວນຫຼຸດ</div>
            <h2>
              ເຂົ້າຮ່ວມຄອບຄົວ<br />
              <span>IT HUBB ມື້ນີ້</span>
            </h2>
            <p>
              ລົງທະບຽນຟຣີ ແລະ ປົດລັອກສິດທິພິເສດສຳລັບສະມາຊິກ ຮ້ອຍກວ່າຍີ່ຫໍ້ສິນຄ້າ IT ລາຄາພິເສດ ລໍຖ້າທ່ານຢູ່.
            </p>

            <div className="brand-perks">
              <div className="brand-perk">
                <div className="brand-perk-icon">
                  <i className="fas fa-gift"></i>
                </div>
                <div className="brand-perk-text">
                  <strong>ສ່ວນຫຼຸດ 10% ສຳລັບສະມາຊິກໃໝ່</strong>
                  <small>ໃຊ້ໄດ້ກັບການຊື້ຄັ້ງທຳອິດ</small>
                </div>
              </div>
              <div className="brand-perk">
                <div className="brand-perk-icon">
                  <i className="fas fa-bolt"></i>
                </div>
                <div className="brand-perk-text">
                  <strong>ຈັດສົ່ງດ່ວນຟຣີ</strong>
                  <small>ສຳລັບການສັ່ງຊື້ເກີນ 500,000 ກີບ</small>
                </div>
              </div>
              <div className="brand-perk">
                <div className="brand-perk-icon">
                  <i className="fas fa-star"></i>
                </div>
                <div className="brand-perk-text">
                  <strong>ສະສົມຄະແນນ ແລະ ແລກລາງວັນ</strong>
                  <small>ຍິ່ງຊື້ ຍິ່ງໄດ້ສິດທິພິເສດ</small>
                </div>
              </div>
            </div>
          </div>

          <div className="brand-bottom">
            <span>© 2026 IT HUBB</span>
            <span>ນະໂຍບາຍຄວາມເປັນສ່ວນຕົວ</span>
            <span>ຂໍ້ກຳນົດການໃຊ້ງານ</span>
          </div>
        </div>

        {/* ============ RIGHT FORM PANEL ============ */}
        <div className="register-form-panel">
          <div className="register-card">
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
                <strong style={{ color: '#667eea' }}> ຂໍ້ກຳນົດ </strong> ແລະ
                <strong style={{ color: '#667eea' }}> ເງື່ອນໄຂ </strong> ຂອງ IT HUBB
              </div>

              {/* Login Link */}
              <div className="login-link">
                ມີບັນຊີແລ້ວ?{" "}
                <a onClick={() => navigate("/login")}>ເຂົ້າສູ່ລະບົບ</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Register;
