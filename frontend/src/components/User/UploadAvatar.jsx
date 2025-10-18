import React, { useState, useEffect } from 'react'; // 🛑 FIX 1: ต้อง Import useEffect
import Userlayout from '../layout/Userlayout';
import { useNavigate } from 'react-router-dom';
import { useUploadAvatarMutation } from '../redux/api/userApi';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import MetaData from '../layout/MetaData'


const UploadAvatar = () => { // 🛑 FIX 4: ชื่อฟังก์ชัน Component ควรเป็นตัวใหญ่ทั้งหมด
    
    // 🛑 FIX 5: ย้าย Logic การดึง State มาไว้ใน Component
    const { user } = useSelector((state) => state.auth); 

    const [avatar, setAvatar] = useState("");
    const [avatarPreview, setAvatarPreview] = useState(
        user?.avatar?.url || "https://cdn-icons-png.flaticon.com/512/3607/3607444.png" // 💡 ใช้ || แทน ? :
    );

    const navigate = useNavigate(); 
    // 🛑 FIX 6: แก้ชื่อตัวแปรฟังก์ชันเป็น uploadAvatar
    const [uploadAvatar, { isLoading, error, isSuccess }] = useUploadAvatarMutation(); 


    useEffect(() => {
        // Handle API errors
        if (error) {
            // ดึงข้อความ error จาก RTK Query
            toast.error(error?.data?.message);
        }

        // Handle successful upload
        if (isSuccess) {
            toast.success("ຮຼບໂປຣໄຟລ໌ອັບໂຫຼດສຳເລັດ");
            navigate("/me/profile");
        }
        
        // 🛑 FIX 7: Dependency Array ที่ถูกต้อง
    }, [error, isSuccess, navigate]);


    // 🛑 FIX 8: ฟังก์ชัน Submit ต้องเป็น async และเรียกใช้ RTK Mutation Hook
    const submitHandler = (e) => { 
        e.preventDefault();
        
        // เราส่ง avatar (base64 string) ไปที่ Mutation
        const userData = { avatar }; 
        
        // เรียกใช้ RTK Mutation Hook
        uploadAvatar(userData);
    };


    const onChange = (e) => {
        // 🛑 FIX 9: การเข้าถึงไฟล์ที่ถูกต้องคือ e.target.files[0]
        const file = e.target.files[0];

        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                if(reader.readyState === 2) {
                    setAvatarPreview(reader.result); // แสดงผลรูป
                    setAvatar(reader.result); // เก็บ Base64/Data URL เพื่อส่ง
                }
            };
            reader.readAsDataURL(file);
        }
    };
    
    return (
         <>
    <MetaData title={'ອັບເດດຮູບເພິ່ມ'} />
        <Userlayout>
            <div className="row wrapper">
                <div className="col-10 col-lg-8">
                    <form
                        className="shadow rounded bg-body"
                        onSubmit={submitHandler} // 🛑 FIX 10: ใช้ชื่อฟังก์ชันที่ถูกต้อง
                    >
                        <h2 className="mb-4">Upload Avatar</h2>

                        <div className="mb-3">
                            <div className="d-flex align-items-center">
                                <div className="me-3">
                                    <figure className="avatar item-rtl">
                                        <img src={avatarPreview} className="rounded-circle" alt="Avatar Preview" />
                                    </figure>
                                </div>
                                <div className="input-foam">
                                    <label className="form-label" htmlFor="customFile">
                                        Choose Avatar
                                    </label>
                                    <input
                                        type="file"
                                        name="avatar"
                                        className="form-control"
                                        id="customFile"
                                        accept="image/*" // 🛑 FIX 11: ใช้ image/*
                                        onChange={onChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            id="upload_button"
                            type="submit"
                            className="btn w-100 py-2"
                            disabled={isLoading || !avatar} // 💡 ปิดปุ่มถ้ายังไม่ได้เลือกรูป
                        >
                            {isLoading ? "ກຳລັງອັບໂຫຼດ..." : "ອັບໂຫຼດ"} 
                        </button>
                    </form>
                </div>
            </div>
        </Userlayout>
        </>
    );
};
// 🛑 FIX 12: ลบฟังก์ชัน UploadAvatar เดิมและ export default ตัวที่ถูกต้อง
export default UploadAvatar;