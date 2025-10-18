import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import Loader from '../layout/Loader';
import { useGetMeQuery } from '../redux/api/userApi';


function ProtectedRoute({ admin, children }) {

    // 🛑 FIX 2: ดึงสถานะ isLoading จาก useGetMeQuery()
    const { isLoading } = useGetMeQuery();

    // 3. ดึงสถานะ isAuthenticated จาก Redux Store
    const { isAuthenticate ,user} = useSelector((state) => state.auth);

    // ----------------------------------------------------
    // 🛑 FIX 3: ใช้ isLoading จาก RTK Query เพื่อการรอที่ถูกต้อง
    if (isLoading) {
        return <Loader />;
    }

    // 4. เมื่อโหลดเสร็จแล้ว (isLoading = false) ค่อยตรวจสอบสถานะการเข้าสู่ระบบ
    if (!isAuthenticate) {
        return <Navigate to="/login" replace />;
    }
    if (admin && user?.role!== 'admin') {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default ProtectedRoute;