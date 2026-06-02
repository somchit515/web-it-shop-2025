// src/components/routes/UserRoutes.jsx
import React from "react";
import { Route } from "react-router-dom";

// PUBLIC PAGES
import Home from "../Home";
import ProductDetails from "../product/ProductDetails";
import CategoryProducts from "../product/CategoryProducts";
import CategoryOverview from "../category/CategoryOverview";
import NewArrivals from "../product/NewArrivals";
import SalePage from "../product/SalePage";
import BrandsPage from "../product/BrandsPage";
import ComparePage from "../product/ComparePage";
import WishlistPage from "../product/WishlistPage";
import FlashDealPage from "../product/FlashDealPage";
import TrackingPage from "../order/TrackingPage";
import SearchPage from "../product/SearchPage";

// AUTH PAGES
import Login from "../auth/Login";
import Register from "../auth/Register";
import ForgetPassword from "../auth/ForgetPassword";
import ResetPassword from "../auth/ResetPassword";
import ProtectedRoute from "../auth/ProtectedRoute";

// USER PROFILE
import Profile from "../User/Profile";
import UpdateProfile from "../User/UpdateProfile";
import UploadAvatar from "../User/UploadAvatar";
import UpdatePassword from "../User/UpadtePassword";

// CART & ORDER PAGES
import Cart from "../cart/Cart";
import Shipping from "../cart/Shipping";
import ConfirmOrder from "../cart/ConfrimOder";
import PaymentMethod from "../cart/PaymentMethod";
import UploadPaymentProof from "../cart/UploadPaymentProof";

// ORDERS
import MyOrder from "../order/MyOrders";
import OrderDetail from "../order/OrderDetail";
import Invoice from "../invoice/Invoice";

import About from "../about/About";
import Contact from "../contact/Contact";
import Blog from "../blog/Blog";
import BlogDetail from "../blog/BlogDetail";
import Recommended from "../product/Recommended";

function UserRoutes() {
  return (
    <>
      {/* PUBLIC ROUTES */}
      <Route path="/" element={<Home />} />
      <Route path="/product/:id" element={<ProductDetails />} />

      {/* ✅ fixed param name for category */}
      <Route path="/category/:categorySlug" element={<CategoryProducts />} />

      <Route path="/categories" element={<CategoryOverview />} />

      {/* AUTH ROUTES */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/password/forgot" element={<ForgetPassword />} />
      <Route path="/password/reset/:token" element={<ResetPassword />} />

      {/* USER PROFILE (PROTECTED) */}
      <Route
        path="/me/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/me/update_profile"
        element={
          <ProtectedRoute>
            <UpdateProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/me/upload_avatar"
        element={
          <ProtectedRoute>
            <UploadAvatar />
          </ProtectedRoute>
        }
      />
      <Route
        path="/me/update_password"
        element={
          <ProtectedRoute>
            <UpdatePassword />
          </ProtectedRoute>
        }
      />

      {/* CART & CHECKOUT */}
      <Route path="/cart" element={<Cart />} />
      <Route
        path="/shipping"
        element={
          <ProtectedRoute>
            <Shipping />
          </ProtectedRoute>
        }
      />
      <Route
        path="/confirm_order"
        element={
          <ProtectedRoute>
            <ConfirmOrder />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment_method"
        element={
          <ProtectedRoute>
            <PaymentMethod />
          </ProtectedRoute>
        }
      />

      {/* BANK TRANSFER UPLOAD */}
      <Route
        path="/orders/:orderId/upload-proof"
        element={
          <ProtectedRoute>
            <UploadPaymentProof />
          </ProtectedRoute>
        }
      />

      {/* USER ORDERS */}
      <Route
        path="/me/orders"
        element={
          <ProtectedRoute>
            <MyOrder />
          </ProtectedRoute>
        }
      />
      <Route
        path="/me/orders/:id"
        element={
          <ProtectedRoute>
            <OrderDetail />
          </ProtectedRoute>
        }
      />

      {/* INVOICE */}
      <Route
        path="/invoice/orders/:id"
        element={
          <ProtectedRoute>
            <Invoice />
          </ProtectedRoute>
        }
      />
      <Route path="/contact" element={<Contact />} />
      <Route path="/about" element={<About />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:id" element={<BlogDetail />} />
      <Route path="/recommended" element={<Recommended />} />
      <Route path="/new-arrivals" element={<NewArrivals />} />
      <Route path="/sale" element={<SalePage />} />
      <Route path="/brands" element={<BrandsPage />} />
      <Route path="/brand/:brandName" element={<BrandsPage />} />
      <Route path="/compare" element={<ComparePage />} />
      <Route path="/wishlist" element={<WishlistPage />} />
      <Route path="/flash-deal" element={<FlashDealPage />} />
      <Route path="/track" element={<TrackingPage />} />
      <Route path="/search" element={<SearchPage />} />

    </>
  );
}

export default UserRoutes;
