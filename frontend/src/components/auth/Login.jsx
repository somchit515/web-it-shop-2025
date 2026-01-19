import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useLoginMutation, useGoogleLoginMutation } from "../redux/authApi";
import { setIsAuthenticate, setUser } from "../redux/features/userSlice";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";
import MetaData from "../layout/MetaData";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [login, { isLoading }] = useLoginMutation();
  const [googleLogin, { isLoading: googleLoading }] = useGoogleLoginMutation();

  const { isAuthenticate } = useSelector((state) => state.auth);

  // โหลด remember me จาก localStorage
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberMeEmail");
    const savedPassword = localStorage.getItem("rememberMePassword");
    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  // ถ้าล็อกอินอยู่แล้ว → ไปหน้าแรก
  useEffect(() => {
    if (isAuthenticate) navigate("/", { replace: true });
  }, [isAuthenticate, navigate]);

  // ล็อกอินด้วยอีเมล/รหัสผ่าน
  const handleEmailLogin = async (e) => {
    e?.preventDefault();

    // Validation
    if (!email || !password) {
      toast.error("ກະລຸນາປ້ອນອີເມວ ແລະ ລະຫັດຜ່ານ");
      return;
    }

    // จัดการ Remember Me
    if (rememberMe) {
      localStorage.setItem("rememberMeEmail", email);
      localStorage.setItem("rememberMePassword", password);
    } else {
      localStorage.removeItem("rememberMeEmail");
      localStorage.removeItem("rememberMePassword");
    }

    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setUser(res.user));
      dispatch(setIsAuthenticate(true));
      toast.success("ເຂົ້າສູ່ລະບົບສຳເລັດ");
      navigate("/", { replace: true });
    } catch (err) {
      toast.error(err?.data?.message || "ອີເມວ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ");
    }
  };

  // ล็อกอินด้วย Google
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await googleLogin({
        token: credentialResponse.credential,
      }).unwrap();
      dispatch(setUser(res.user));
      dispatch(setIsAuthenticate(true));
      toast.success("ເຂົ້າສູ່ລະບົບດ້ວຍ Google ສຳເລັດ");
      navigate("/", { replace: true });
    } catch (err) {
      toast.error(err?.data?.message || "Google login failed");
    }
  };

  // ไอคอนตา
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
    <GoogleOAuthProvider clientId="380365298782-rcvtvom4t2r8irtn3mpggeocco018t9m.apps.googleusercontent.com">
      <MetaData title="ເຂົ້າສູ່ລະບົບ" />
      
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

        .login-container {
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

        .login-container::before {
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

        .login-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 460px;
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

        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          font-size: 14px;
        }

        .checkbox-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .checkbox-wrapper input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: #667eea;
        }

        .checkbox-wrapper label {
          cursor: pointer;
          color: #475569;
          user-select: none;
        }

        .forgot-link {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s ease;
          cursor: pointer;
        }

        .forgot-link:hover {
          color: #764ba2;
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

        .divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 28px 0;
          color: #94a3b8;
          font-size: 14px;
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid #e2e8f0;
        }

        .divider span {
          padding: 0 16px;
        }

        .google-login-wrapper {
          margin-top: 20px;
        }

        .google-login-wrapper > div {
          width: 100% !important;
        }

        .google-login-wrapper > div > div {
          width: 100% !important;
          justify-content: center !important;
        }

        .register-link {
          text-align: center;
          margin-top: 24px;
          font-size: 14px;
          color: #64748b;
        }

        .register-link a {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s ease;
          cursor: pointer;
        }

        .register-link a:hover {
          color: #764ba2;
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

        /* Responsive Styles */
        @media (max-width: 640px) {
          .login-container {
            padding: 16px;
          }

          .login-card {
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

          .form-options {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }

          .form-input {
            font-size: 16px;
          }
        }

        @media (max-width: 400px) {
          .login-card {
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

        @media (max-height: 600px) and (orientation: landscape) {
          .login-container {
            padding: 12px;
          }

          .login-card {
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

          .form-options {
            margin-bottom: 16px;
          }

          .divider {
            margin: 16px 0;
          }
        }

        @media (max-width: 360px) {
          .login-card {
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

      <div className="login-container">
        <div className="login-card">
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
            <h1>ຍິນດີຕ້ອນຮັບກັບຄືນ</h1>
            <p>ເຂົ້າສູ່ລະບົບເພື່ອຈັດການລະບົບ ແລະ ອໍເດີ</p>
          </div>

          {/* Login Form */}
          <div>
            {/* Email Field */}
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
                onKeyPress={(e) => e.key === "Enter" && handleEmailLogin()}
                disabled={isLoading || googleLoading}
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
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="ປ້ອນລະຫັດຂອງທ່ານ"
                  onKeyPress={(e) => e.key === "Enter" && handleEmailLogin()}
                  disabled={isLoading || googleLoading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                  disabled={isLoading || googleLoading}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="form-options">
              <div className="checkbox-wrapper">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading || googleLoading}
                />
                <label htmlFor="remember">ຈື່ລະຫັດຜ່ານ</label>
              </div>
              <a
                className="forgot-link"
                onClick={() => navigate("/password/forgot")}
              >
                ລືມລະຫັດ?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              className="btn-primary"
              disabled={isLoading || googleLoading}
              onClick={handleEmailLogin}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  <span>ກຳລັງກວດສອບ...</span>
                </>
              ) : (
                <span>ເຂົ້າສູ່ລະບົບ</span>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="divider">
            <span>ຫຼື ດຳເນີນການຕໍ່ດ້ວຍ</span>
          </div>

          {/* Google Login */}
          <div className="google-login-wrapper">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("ການເຂົ້າສູ່ລະບົບ Google ລົ້ມເຫຼວ")}
              theme="outline"
              size="large"
              shape="rectangular"
              text="continue_with"
              width="380"
              disabled={isLoading || googleLoading}
            />
          </div>

          {/* Register Link */}
          <div className="register-link">
            ຍັງບໍ່ມີບັນຊີ?{" "}
            <a onClick={() => navigate("/register")}>ສະໝັກສະມາຊິກ</a>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}