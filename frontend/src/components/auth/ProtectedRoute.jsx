// auth/ProtectedRoute.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import Loader from '../layout/Loader';
import { useGetMeQuery } from '../redux/api/userApi';

function ProtectedRoute({ admin, superAdmin, children }) {
    const location = useLocation();
    const { isLoading, isError, error } = useGetMeQuery();
    const { isAuthenticate, user } = useSelector((state) => state.auth);

    if (isLoading) {
        return <Loader />;
    }

    // ถ้า session หมดอายุจริงๆ (401 จาก getMe) → redirect ไป login
    const sessionExpired = isError && error?.status === 401;
    if (sessionExpired || !isAuthenticate) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    // SuperAdmin guard
    if (superAdmin && user?.role !== 'superAdmin') {
        return <Navigate to="/" replace />;
    }

    // Admin guard (อนุญาตทั้ง admin และ superAdmin)
    if (admin && user?.role !== 'admin' && user?.role !== 'superAdmin') {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default ProtectedRoute;
