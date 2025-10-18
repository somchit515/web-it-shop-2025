import React, { useEffect } from 'react' // 🛑 FIX 1: Import useEffect
// 🛑 FIX 2: ลบการ Import 'use' ที่ไม่จำเป็นออก
import Userlayout from '../layout/Userlayout';
import { useNavigate } from 'react-router-dom';
// 🛑 FIX 3: เปลี่ยนชื่อ Hook ให้ตรงกับที่ Export ใน userApi.js
import { useUpdatePasswordMutation } from '../redux/api/userApi';
import toast from 'react-hot-toast';

import MetaData from '../layout/MetaData'


function UpdatePassword() {

    const [oldPassword, setOldPassword] = React.useState("");
    // 💡 แนะนำ: ใช้ชื่อที่สื่อความหมาย เช่น newPassword (แต่ถ้า Backend คาดหวัง 'Password' ตัวใหญ่ต้องใช้ตามนั้น)
    const [Password, setPassword] = React.useState("");


    const navigate = useNavigate();
    // 🛑 FIX 4: ใช้ Hook ชื่อที่ถูกต้อง
    const [updatePassword, { isLoading, error, isSuccess }] = useUpdatePasswordMutation();

    useEffect(() => { // 🛑 FIX 5: แก้การสะกดจาก useffect เป็น useEffect
        // Handle API errors
        if (error) {
            // ดึงข้อความ error จาก RTK Query
            toast.error(error?.data?.message);
        }
        if (isSuccess) {
            toast.success("ອັບເດດລະຫັດຜ່ານສຳເລັດ");
            navigate("/me/profile");
        }
    }, [error, isSuccess, navigate]);

    const submitHandler = (e) => {
        e.preventDefault();
        // 💡 สมมติว่า Backend คาดหวัง Field 'oldPassword' และ 'password' ตัวเล็ก
        // ถ้าคาดหวัง 'Password' ตัวใหญ่ ให้ใช้ { oldPassword, Password } เหมือนเดิม
        const userData = { oldPassword, password: Password };
        updatePassword(userData);
    }

    return (
         <>
    <MetaData title={'ອັບເດດລະຫັດຜ່ານ'} />
        <Userlayout>
            <div className="row wrapper">
                <div className="col-10 col-lg-8">
                    <form className="shadow rounded bg-body" onSubmit={submitHandler}>
                        <h2 className="mb-4">ອັບເດດລະຫັດຜ່ານ</h2>
                        <div className="mb-3">
                            <label htmlFor="old_password_field" className="form-label">
                                ລະຫັດຜ່ານເກົ່າ
                            </label>
                            <input
                                type="password"
                                id="old_password_field"
                                className="form-control"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="new_password_field" className="form-label">
                                ລະຫັດຜ່ານໃໝ່
                            </label>
                            <input
                                type="password"
                                id="new_password_field"
                                className="form-control"
                                value={Password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button type="submit" className="btn update-btn w-100" disabled={isLoading ? true : false}>
                            {isLoading ? "ອັບເດດລະຫັດຜ່ານ..." : "ອັບເດດລະຫັດຜ່ານ"}
                        </button>
                    </form>
                </div>
            </div>
        </Userlayout>
        </>

    )
}

export default UpdatePassword