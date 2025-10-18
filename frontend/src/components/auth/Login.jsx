import React, { useEffect, useState } from "react";
import { useLoginMutation } from "../redux/authApi";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom"; // 🛑 แก้ไข: ลบ 'Navigate' ที่ไม่ได้ใช้ออก
import { useSelector } from "react-redux";
import MetaData from '../layout/MetaData'


function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // 🚀 NEW: สถานะสำหรับเช็คบ็อกซ์ "จำรหัสผ่าน"
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();
  const [login, { isLoading, error }] = useLoginMutation();
  const { isAuthenticatedUser } = useSelector((state) => state.auth);

  // ----------------------------------------------------
  // 🚀 NEW useEffect: โหลดข้อมูลจาก localStorage เมื่อ Component โหลด
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberMeEmail');
    const savedPassword = localStorage.getItem('rememberMePassword');
    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true); // ตั้งสถานะเช็คบ็อกซ์เป็น true
    }
  }, []); // Dependency Array ว่างเปล่า เพื่อให้ทำงานครั้งเดียวตอนโหลด
  // ----------------------------------------------------

  // จัดการ Error และการนำทางเมื่อเข้าสู่ระบบสำเร็จแล้ว
  useEffect(() => {
    if (isAuthenticatedUser) {
      navigate("/");
    }
    if (error) {
      toast.error(error?.data?.message || "An error occurred");
    }
    // ✅ FIX: เพิ่ม 'navigate' ใน Dependency Array เพื่อลบ Warning
  }, [error, isAuthenticatedUser, navigate]);

  const SubmitHandles = async (e) => {
    e.preventDefault();
    const loginData = { email, password };

    // 🚀 NEW LOGIC: บันทึก/ลบข้อมูลใน localStorage ตามสถานะ Remember Me
    if (rememberMe) {
      localStorage.setItem('rememberMeEmail', email);
      localStorage.setItem('rememberMePassword', password);
    } else {
      localStorage.removeItem('rememberMeEmail');
      localStorage.removeItem('rememberMePassword');
    }
    // ----------------------------------------------------

    try {
      // 🛑 FIX: ลบ 'const result =' ออก เพราะตัวแปรนี้ไม่ได้ถูกนำไปใช้
      await login(loginData).unwrap();

      toast.success("Login successful!");
      navigate("/");

    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
     <>
    <MetaData title={'ເຂົ້າສູ່ລະບົບ'} />
    <div className="row wrapper">
      <div className="col-10 col-lg-5">
        <form className="shadow rounded bg-body" onSubmit={SubmitHandles}>
          <h2 className="mb-4">Login</h2>
          <div className="mb-3">
            <label htmlFor="email_field" className="form-label">
              Email
            </label>
            <input
              type="email"
              id="email_field"
              className="form-control"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password_field" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password_field"
              className="form-control"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* 🚀 NEW: Checkbox สำหรับ Remember Me */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="rememberMeCheck"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="rememberMeCheck">
                จำรหัสผ่าน (Remember Me)
              </label>
            </div>
            <a href="/password/forgot" className="float-end">
              ເຈົ້າລືມລະຫັດຜ່ານບໍ?
            </a>
          </div>
          <div className="my-3">
            <a href="/register" className="float-end">
              ສະໝັກສະມາຊິກ
            </a>
          </div>


          <button
            id="login_button"
            type="submit"
            className="btn w-100 py-2"
            disabled={isLoading}
          >
            {isLoading ? "Authenticating..." : "LOGIN"}
          </button>

          
        </form>
      </div>

    </div>
    </>
  );
}

export default Login;