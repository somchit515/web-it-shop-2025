import React, { useEffect, useState } from 'react';
import { useForgotPasswordMutation } from '../redux/api/userApi';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import MetaData from '../layout/MetaData';

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const [forgotPassword, { isLoading, error, isSuccess }] = useForgotPasswordMutation();
  const { isAuthenticate } = useSelector((state) => state.auth);

  // Redirect ถ้า login อยู่แล้ว
  useEffect(() => {
    if (isAuthenticate) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticate, navigate]);

  // จัดการ error
  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message || "ມີຂໍ້ຜິດພາດ");
    }
  }, [error]);

  // จัดการ success
  useEffect(() => {
    if (isSuccess) {
      setEmailSent(true);
      toast.success("ສົ່ງອີເມວສຳເລັດ! ກະລຸນາກວດອີເມວຂອງທ່ານ");
    }
  }, [isSuccess]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!email.trim()) {
      toast.error("ກະລຸນາປ້ອນອີເມວ");
      return;
    }

    // ตรวจสอบรูปแบบ email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("ຮູບແບບອີເມວບໍ່ຖືກຕ້ອງ");
      return;
    }

    forgotPassword({ email });
  };

  const handleResend = () => {
    forgotPassword({ email });
    toast.success("ກຳລັງສົ່ງອີເມວໃໝ່...");
  };

  const MailIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );

  const CheckIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );

  return (
    <>
      <MetaData title="ລືມລະຫັດຜ່ານ" />

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
        .forgot-container {
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
        .forgot-brand-panel {
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

        .forgot-brand-panel::before {
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
          content: '\\f3ed';
          font-family: 'Font Awesome 6 Free';
          font-weight: 900;
          font-size: 11px;
          color: #c4b5fd;
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

        .brand-steps {
          display: flex;
          flex-direction: column;
          gap: 14px;
          max-width: 520px;
        }
        .brand-step {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 14px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 14px;
          backdrop-filter: blur(10px);
          color: white;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        .brand-step:hover {
          background: rgba(255, 255, 255, 0.09);
          transform: translateX(4px);
          border-color: rgba(192, 132, 252, 0.4);
        }
        .brand-step-num {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, rgba(129, 140, 248, 0.3), rgba(192, 132, 252, 0.3));
          border: 1px solid rgba(192, 132, 252, 0.4);
          display: grid;
          place-items: center;
          color: #e9d5ff;
          font-size: 15px;
          font-weight: 800;
          flex-shrink: 0;
        }
        .brand-step-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .brand-step-content small {
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
        .forgot-form-panel {
          flex: 0.9;
          background: linear-gradient(180deg, #fafbff 0%, #f1f5f9 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          overflow-y: auto;
          position: relative;
        }

        .forgot-form-panel::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(102, 126, 234, 0.08), transparent 70%);
          pointer-events: none;
        }

        .forgot-card {
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

        .icon-wrapper {
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
        }

        .mail-icon {
          width: 88px;
          height: 88px;
          background: linear-gradient(135deg, #eef2ff 0%, #faf5ff 100%);
          border: 1px solid rgba(102, 126, 234, 0.15);
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #667eea;
          box-shadow: 0 12px 30px rgba(102, 126, 234, 0.18);
          position: relative;
        }
        .mail-icon::after {
          content: '';
          position: absolute;
          inset: -6px;
          border-radius: 28px;
          border: 1.5px dashed rgba(102, 126, 234, 0.25);
          animation: spin 18s linear infinite;
        }

        .success-icon {
          width: 88px;
          height: 88px;
          background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #10b981;
          box-shadow: 0 12px 30px rgba(16, 185, 129, 0.2);
        }

        .welcome-text {
          text-align: center;
          margin-bottom: 32px;
        }

        .welcome-text h1 {
          font-size: 32px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 10px;
          letter-spacing: -0.5px;
        }

        .welcome-text p {
          font-size: 15px;
          color: #64748b;
          line-height: 1.6;
        }

        .form-group {
          margin-bottom: 24px;
        }

        .form-label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #334155;
          margin-bottom: 8px;
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

        .btn-secondary {
          width: 100%;
          padding: 14px 24px;
          background: white;
          color: #667eea;
          border: 2px solid #667eea;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 12px;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #f8f9fe;
          transform: translateY(-2px);
        }

        .btn-secondary:disabled {
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

        .links-section {
          display: flex;
          justify-content: center;
          gap: 24px;
          margin-top: 24px;
          font-size: 14px;
        }

        .links-section a {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s ease;
          cursor: pointer;
        }

        .links-section a:hover {
          color: #764ba2;
        }

        .help-text {
          text-align: center;
          margin-top: 24px;
          font-size: 13px;
          color: #64748b;
          line-height: 1.6;
          padding: 14px 16px;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
          border: 1px solid rgba(102, 126, 234, 0.1);
          border-radius: 12px;
        }

        .success-message {
          text-align: center;
          margin-top: 24px;
        }

        .success-message h3 {
          font-size: 22px;
          color: #10b981;
          margin-bottom: 12px;
          font-weight: 800;
        }

        .success-message p {
          color: #64748b;
          font-size: 14px;
          line-height: 1.6;
          margin-bottom: 8px;
        }

        .email-badge {
          display: inline-block;
          padding: 10px 18px;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
          border: 1px solid rgba(102, 126, 234, 0.2);
          border-radius: 50px;
          color: #667eea;
          font-weight: 700;
          font-size: 14px;
          margin-top: 16px;
        }

        /* ================ RESPONSIVE ================ */
        @media (max-width: 1024px) {
          .forgot-brand-panel {
            display: none;
          }
          .forgot-form-panel {
            flex: 1;
          }
        }

        @media (max-width: 640px) {
          .forgot-form-panel {
            padding: 16px;
          }

          .forgot-card {
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

          .links-section {
            flex-direction: column;
            gap: 12px;
          }
        }

        @media (max-width: 400px) {
          .forgot-card {
            padding: 28px 20px;
          }

          .welcome-text h1 {
            font-size: 22px;
          }

          .form-label {
            font-size: 13px;
          }

          .btn-primary, .btn-secondary {
            font-size: 15px;
            padding: 12px 20px;
          }

          .mail-icon, .success-icon {
            width: 72px;
            height: 72px;
            border-radius: 20px;
          }
        }

        @media (max-height: 700px) and (orientation: landscape) {
          .forgot-form-panel {
            padding: 12px;
          }

          .forgot-card {
            padding: 24px 32px;
            max-height: 100vh;
            overflow-y: auto;
          }

          .icon-wrapper {
            margin-bottom: 12px;
          }

          .welcome-text {
            margin-bottom: 20px;
          }

          .form-group {
            margin-bottom: 16px;
          }
        }

        @media (max-width: 360px) {
          .forgot-card {
            padding: 24px 16px;
          }

          .welcome-text h1 {
            font-size: 20px;
          }
        }
      `}</style>

      <div className="forgot-container">
        {/* ============ LEFT BRANDING PANEL ============ */}
        <div className="forgot-brand-panel">
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
            <div className="brand-hero-badge">ປອດໄພ ແລະ ເຂົ້າລະຫັດ</div>
            <h2>
              ຣີເຊັດລະຫັດຜ່ານ<br />
              <span>ຂອງທ່ານ</span>
            </h2>
            <p>
              ລືມລະຫັດຜ່ານບໍ່ແມ່ນບັນຫາ. ພວກເຮົາຈະຊ່ວຍທ່ານກັບຄືນສູ່ລະບົບໄດ້ໄວ
              ແລະ ປອດໄພ ພຽງ 3 ຂັ້ນຕອນງ່າຍໆ.
            </p>

            <div className="brand-steps">
              <div className="brand-step">
                <div className="brand-step-num">1</div>
                <div className="brand-step-content">
                  <span>ປ້ອນອີເມວຂອງທ່ານ</span>
                  <small>ໃຊ້ອີເມວທີ່ລົງທະບຽນໄວ້</small>
                </div>
              </div>
              <div className="brand-step">
                <div className="brand-step-num">2</div>
                <div className="brand-step-content">
                  <span>ກວດສອບກ່ອງຈົດໝາຍ</span>
                  <small>ພວກເຮົາຈະສົ່ງລິ້ງໃຫ້ທ່ານ</small>
                </div>
              </div>
              <div className="brand-step">
                <div className="brand-step-num">3</div>
                <div className="brand-step-content">
                  <span>ຕັ້ງລະຫັດໃໝ່</span>
                  <small>ເຂົ້າສູ່ລະບົບໄດ້ທັນທີ</small>
                </div>
              </div>
            </div>
          </div>

          <div className="brand-bottom">
            <span>© 2026 IT HUBB</span>
            <span>ນະໂຍບາຍຄວາມເປັນສ່ວນຕົວ</span>
            <span>ຊ່ວຍເຫຼືອ</span>
          </div>
        </div>

        {/* ============ RIGHT FORM PANEL ============ */}
        <div className="forgot-form-panel">
          <div className="forgot-card">
            {!emailSent ? (
              <>
                {/* Mail Icon */}
                <div className="icon-wrapper">
                  <div className="mail-icon">
                    <MailIcon />
                  </div>
                </div>

                {/* Welcome Text */}
                <div className="welcome-text">
                  <h1>ລືມລະຫັດຜ່ານ?</h1>
                  <p>
                    ບໍ່ຕ້ອງກັງວົນ! ປ້ອນອີເມວຂອງທ່ານ
                    <br />
                    ແລະ ພວກເຮົາຈະສົ່ງລິ້ງຕັ້ງລະຫັດໃໝ່ໃຫ້
                  </p>
                </div>

                {/* Form */}
                <div>
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      ອີເມວ
                    </label>
                    <input
                      id="email"
                      type="email"
                      className="form-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      disabled={isLoading}
                      autoComplete="email"
                      required
                    />
                  </div>

                  <button
                    type="button"
                    className="btn-primary"
                    disabled={isLoading}
                    onClick={handleSubmit}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner"></span>
                        <span>ກຳລັງສົ່ງ...</span>
                      </>
                    ) : (
                      <span>ສົ່ງລິ້ງຕັ້ງລະຫັດໃໝ່</span>
                    )}
                  </button>

                  {/* Links */}
                  <div className="links-section">
                    <a onClick={() => navigate('/login')}>
                      ← ກັບໄປເຂົ້າສູ່ລະບົບ
                    </a>
                    <a onClick={() => navigate('/register')}>
                      ສະໝັກສະມາຊິກ
                    </a>
                  </div>

                  {/* Help Text */}
                  <div className="help-text">
                    💡 <strong>ຄຳແນະນຳ:</strong> ຖ້າທ່ານບໍ່ເຫັນອີເມວ
                    ກະລຸນາກວດເຊັກໃນ Spam ຫຼື Junk folder
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Success State */}
                <div className="icon-wrapper">
                  <div className="success-icon">
                    <CheckIcon />
                  </div>
                </div>

                <div className="success-message">
                  <h3>ສົ່ງອີເມວສຳເລັດ! ✓</h3>
                  <p>
                    ພວກເຮົາໄດ້ສົ່ງລິ້ງຕັ້ງລະຫັດໃໝ່ໄປທີ່:
                  </p>
                  <div className="email-badge">{email}</div>
                  <p style={{ marginTop: '16px' }}>
                    ກະລຸນາກວດອີເມວຂອງທ່ານ ແລະ ຄລິກລິ້ງເພື່ອຕັ້ງລະຫັດໃໝ່
                  </p>
                </div>

                <button
                  type="button"
                  className="btn-secondary"
                  disabled={isLoading}
                  onClick={handleResend}
                  style={{ marginTop: '24px' }}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner" style={{ borderTopColor: '#667eea' }}></span>
                      <span>ກຳລັງສົ່ງ...</span>
                    </>
                  ) : (
                    <span>ສົ່ງອີເມວໃໝ່ອີກຄັ້ງ</span>
                  )}
                </button>

                <div className="links-section">
                  <a onClick={() => navigate('/login')}>
                    ← ກັບໄປເຂົ້າສູ່ລະບົບ
                  </a>
                </div>

                <div className="help-text">
                  ບໍ່ໄດ້ຮັບອີເມວ? ລອງກວດເຊັກ Spam folder
                  ຫຼື ຕິດຕໍ່ support@ithubb.com
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default ForgotPassword;
