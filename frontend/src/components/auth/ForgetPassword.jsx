import React, { useEffect } from 'react'
import { useForgotPasswordMutation } from '../redux/api/userApi';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import MetaData from '../layout/MetaData'



function ForgetPassword() {
    const [email, setEmail] = React.useState("");

    const navigate = useNavigate(); // 💡 ใช้ navigate แทน navigator เพื่อความชัดเจน
    const [forgotPassword, { isLoading, error, isSuccess }] = useForgotPasswordMutation();

    const { isAuthenticate } = useSelector((state) => state.auth)

    useEffect(() => {
        // 1. ถ้า Login แล้ว ให้ redirect ไปหน้า Home
        if (isAuthenticate) {
            navigate("/")
        }

        // 2. จัดการ Error (เฉพาะเมื่อมี error และไม่ได้ authenticate)
        // 🛑 FIX: ลบเงื่อนไข isAuthenticate ออกจาก if (error)
        if (error) {
            toast.error(error?.data?.message);
        }

        // 3. จัดการ Success
        if (isSuccess) {
            toast.success("ສົ່ງອີເມວສຳເລັດກະລຸນາກວດສອບກ່ອງຂໍ້ຄວາມຂອງທ່ານ");
            navigate("/login");
        }
    }, [error, isAuthenticate, isSuccess, navigate]); // 💡 เพิ่ม navigate ใน Dependency Array


    const submitHandler = (e) => {
        e.preventDefault();
        // 💡 ใช้ shorthand syntax { email }
        forgotPassword({ email });
    }

    return (
         <>
    <MetaData title={'ລືມລະຫັດຜ່ານ'} />
        <div className="row wrapper">
            <div className="col-10 col-lg-5">
                <form
                    className="shadow rounded bg-body"
                    onSubmit={submitHandler}
                >
                    <h2 className="mb-4">ລືມລະຫັດຜ່ານ</h2>
                    <div className="mt-3">
                        <label htmlFor="email_field" className="form-label">ປ້ອນອີເມວ</label>
                        <input
                            type="email"
                            id="email_field"
                            className="form-control"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <button
                        id="forgot_password_button"
                        type="submit"
                        className="btn w-100 py-2"
                        disabled={isLoading}
                    >
                        {isLoading ? "ກຳລັງສົ່ງອີເມວ..." : "ສົ່ງອີເມວ"}
                    </button>
                </form>
            </div>
        </div>
        </>

    )
}

export default ForgetPassword