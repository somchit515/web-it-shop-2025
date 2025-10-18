import React, { useState, useEffect } from "react";
import { useRegisterMutation } from "../redux/authApi";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import MetaData from '../layout/MetaData'



function Register() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
  });

  const { name, email, password } = user;
  const navigate = useNavigate();
  const [register, { isLoading, error, data }] = useRegisterMutation();

  // 1. จัดการ Error
  const { isAuthenticated } = useSelector((state) => state.auth);

  // จัดการ Error: แสดงข้อความผิดพลาดเมื่อมี error เกิดขึ้น
  useEffect(() => {

    if (isAuthenticated) {
      navigate("/"); // นำทางไปยังหน้าหลักทันที
    }
    if (error) {

      toast.error(error?.data?.message || "An error occurred");
    }
    // 🛑 FIX: เพิ่ม 'navigate' เข้าไปใน Dependency Array เพื่อแก้ Warning
  }, [error, isAuthenticated, navigate]); // <--- แก้ไขตรงนี้

  // 2. จัดการ Success: แสดงข้อความ > หน่วงเวลา > นำทาง
  useEffect(() => {
    if (data?.message) {
      // แสดงข้อความยืนยัน
      toast.success("ລົງທະບຽນສຳເລັດ", {
        duration: 5000,
        position: 'top-center',
      });

      // เพิ่ม setTimeout เพื่อหน่วงเวลา 1 วินาที ก่อนนำทาง
      const timer = setTimeout(() => {
        navigate("/login");
      }, 1000);

      // Cleanup function: ล้าง timer เมื่อ component ถูก unmount หรือ data เปลี่ยน
      return () => clearTimeout(timer);

    }
  }, [data, navigate]); // ตัวนี้ถูกต้องอยู่แล้ว


  const SubmitHandles = async (e) => {
    e.preventDefault();

    const registerData = { name, email, password };

    try {
      await register(registerData).unwrap();
    } catch (err) {
      console.error("Register failed:", err);
    }
  };

  const onChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  return (
     <>
    <MetaData title={'ລົງທະບຽນ'} />
    <div className="row wrapper">
      <div className="col-10 col-lg-5">
        <form
          className="shadow rounded bg-body"
          onSubmit={SubmitHandles}
        >
          <h2 className="mb-4">Register</h2>

          {/* Input Name */}
          <div className="mb-3">
            <label htmlFor="name_field" className="form-label">
              Name
            </label>
            <input
              type="text"
              id="name_field"
              className="form-control"
              name="name"
              value={name}
              onChange={onChange}
            />
          </div>

          {/* Input Email */}
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
              onChange={onChange}
            />
          </div>

          {/* Input Password */}
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
              onChange={onChange}
            />
          </div>

          <button
            id="register_button"
            type="submit"
            className="btn w-100 py-2"
            disabled={isLoading}
          >
            {isLoading ? "ກຳລັງສະໝັກສະມາຊິກ..." : "REGISTER"}
          </button>
        </form>
      </div>
    </div>
    </>
  );
}

export default Register;