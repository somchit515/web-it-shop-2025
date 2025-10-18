import React from 'react'

import {  Route } from "react-router-dom";
import ProductDetails from "../product/ProductDetails";
import Login from "../auth/Login";
import Register from "../auth/Register";
import Profile from "../User/Profile";
import UpdateProfile from "../User/UpdateProfile";
import ProtectedRoute from "../auth/ProtectedRoute";
import UploadAvatar from "../User/UploadAvatar";
import UpdatePassword from "../User/UpadtePassword"; // 💡 นำเข้า Component
import ForgetPassword from "../auth/ForgetPassword";
import ResetPassword from "../auth/ResetPassword";
import Cart from "../cart/Cart";
import Shipping from "../cart/Shipping";
import ConfirmOrder from "../cart/ConfrimOder";
import PaymentMethod from "../cart/PaymentMethod";
import MyOrder from "../order/MyOrders";
import OrderDetail from "../order/OrderDetail";
import Invoice from "../invoice/Invoice";
import Home from "../Home";

function UserRoutes() {
  return (
     <>

    <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/password/forgot" element={<ForgetPassword />} />
            <Route path="/password/reset/:token" element={<ResetPassword />} />

            {/* Protected Routes */}
            <Route path="/me/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>} />
            <Route path="/me/Update_Profile" element={<ProtectedRoute>
              <UpdateProfile />
            </ProtectedRoute>} />

            <Route path="/me/Upload_Avatar" element={<ProtectedRoute>
              <UploadAvatar />
            </ProtectedRoute>} />

            {/* ✅ FIX: ย้าย Route update_password เข้ามาใน Routes หลัก */}
            <Route path="/me/update_password" element={<ProtectedRoute>
              <UpdatePassword />
            </ProtectedRoute>} />
            <Route path="/cart" element={
              <Cart />
              
            } />
           
            <Route path="//shipping" element={<ProtectedRoute>
              <Shipping />
            </ProtectedRoute>} />

            <Route path="/confirm_order" element={<ProtectedRoute>
              <ConfirmOrder />
            </ProtectedRoute>} />

             <Route path="/payment_method" element={<ProtectedRoute>
              <PaymentMethod />
            </ProtectedRoute>} />

            <Route path="/me/orders" element={<ProtectedRoute>
              <MyOrder />
            </ProtectedRoute>} />

            <Route path="/me/orders/:id" element={<ProtectedRoute>
              <OrderDetail />
            </ProtectedRoute>} />

             <Route path="/invoice/orders/:id" element={<ProtectedRoute>
              <Invoice />
            </ProtectedRoute>} />
      
    </>
  )
}

export default UserRoutes