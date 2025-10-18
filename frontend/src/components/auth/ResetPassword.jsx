import React, { useState, useEffect } from 'react'; // 🛑 FIX 1: Import useState และ useEffect
import { useNavigate, useParams } from 'react-router-dom'; // 🛑 FIX 2: Import useParams
import { useResetPasswordMutation } from '../redux/api/userApi'; // 🛑 FIX 3: สมมติว่า Hook ถูก Import จาก userApi
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import MetaData from '../layout/MetaData'



function ResetPassword() {
    // 1. State Management
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // 2. Hooks
    const navigate = useNavigate();
    const { token } = useParams(); // ดึง token จาก URL
    const [resetPassword, { isLoading, error, isSuccess }] = useResetPasswordMutation();
    const { isAuthenticate } = useSelector((state) => state.auth);

    // 3. Side Effects (Error/Success Handling)
    useEffect(() => {
        if (isAuthenticate) {
            navigate("/");
        }
        if (error) {
            toast.error(error?.data?.message);
        }
        if (isSuccess) {
            toast.success("ຕັ້ງລະຫັດຜ່ານໃໝ່ສຳເລັດແລ້ວ");
            navigate("/login");
        }
    }, [error, isAuthenticate, isSuccess, navigate]);

    // 4. Submit Handler
    const submitHandler = (e) => {
        e.preventDefault();

        // 💡 ตรวจสอบว่ารหัสผ่านตรงกันก่อนส่ง API
        if (password !== confirmPassword) {
            return toast.error("ລະຫັດຜ່ານບໍ່ກົງກັນ");
        }

        const data = { password, confirmPassword };

        // 💡 ส่งข้อมูลไปที่ Backend (ต้องส่ง token ไปใน URL)
        resetPassword({ token, body: data });
    };

    return (
         <>
    <MetaData title={'ຕັ້ງລະຫັດຜ່ານໃໝ່'} />
        <div>
            <div className="row wrapper">
                <div className="col-10 col-lg-5">
                    <form
                        className="shadow rounded bg-body"
                        onSubmit={submitHandler} // 🛑 FIX 4: ใช้ onSubmit handler
                    >
                        <h2 className="mb-4">ລະຫັດຜ່ານໃໝ່</h2>

                        <div className="mb-3">
                            <label htmlFor="password_field" className="form-label">ລະຫັດຜ່ານ</label>
                            <input
                                type="password"
                                id="password_field"
                                className="form-control"
                                name="password"
                                value={password} // 🛑 FIX 5: ผูกกับ State
                                onChange={(e) => setPassword(e.target.value)} // 🛑 FIX 6: ผูกกับ Setter
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="confirm_password_field" className="form-label"
                            >ຢືນຢັນລະຫັດຜ່ານ</label
                            >
                            <input
                                type="password"
                                id="confirm_password_field"
                                className="form-control"
                                name="confirm_password"
                                value={confirmPassword} // 🛑 FIX 7: ผูกกับ State
                                onChange={(e) => setConfirmPassword(e.target.value)} // 🛑 FIX 8: ผูกกับ Setter
                            />
                        </div>

                        <button
                            id="new_password_button"
                            type="submit"
                            className="btn w-100 py-2"
                            disabled={isLoading} // 🛑 FIX 9: ปิดปุ่มขณะโหลด
                        >
                            {isLoading ? "ກຳລັງຕັ້ງລະຫັດຜ່ານ..." : "ຕັ້ງລະຫັດຜ່ານ"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
        </>
    )
}

export default ResetPassword