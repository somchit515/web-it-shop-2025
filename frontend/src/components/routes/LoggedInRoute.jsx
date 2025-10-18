// src/components/routes/LoggedInRoute.jsx (หรือชื่อที่เหมาะสม)

import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const LoggedInRoute = ({ children }) => {
    // 1. ดึงสถานะผู้ใช้จาก Redux Store
    const { isAuthenticated, user } = useSelector((state) => state.auth); 
    // หมายเหตุ: ต้องตรวจสอบ 'isAuthenticated' ที่ถูกต้องจาก Redux Store ของคุณ

    // 2. ถ้าผู้ใช้ล็อกอินอยู่ (isAuthenticated เป็น true)
    if (isAuthenticated) {
        // ให้ Redirect ไปที่หน้าหลัก (หรือหน้าอื่นที่คุณต้องการ เช่น /me/profile)
        return <Navigate to="/" replace />; 
    }

    // 3. ถ้าผู้ใช้ยังไม่ได้ล็อกอิน (isAuthenticated เป็น false)
    //    ให้แสดงผล Children (ซึ่งก็คือ component Login หรือ Register นั่นเอง)
    return children;
};

export default LoggedInRoute;