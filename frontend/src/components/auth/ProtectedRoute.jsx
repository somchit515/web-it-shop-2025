// auth/ProtectedRoute.jsx (โค้ดที่ถูกต้อง)

import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import Loader from '../layout/Loader';
import { useGetMeQuery } from '../redux/api/userApi';


function ProtectedRoute({ admin, children }) {

    const { isLoading } = useGetMeQuery();

    const { isAuthenticate ,user} = useSelector((state) => state.auth);

    if (isLoading) {
        return <Loader />;
    }

    if (!isAuthenticate) {
        return <Navigate to="/login" replace />;
    }
    
    // *** แก้ไขตรงนี้: เปลี่ยน (user?.role !== 'admin', user?.role !== 'superAdmin') 
    // เป็น (user?.role !== 'admin' && user?.role !== 'superAdmin') ***
    if (admin && user?.role !== 'admin' && user?.role !== 'superAdmin') { 
        return <Navigate to="/" replace />;
    }

    return children;
}

export default ProtectedRoute;