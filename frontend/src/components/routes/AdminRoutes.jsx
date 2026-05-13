// src/components/routes/AdminRoutes.jsx
import React from "react";
import { Route } from "react-router-dom";
import ProtectedRoute from "../auth/ProtectedRoute";

// Admin Pages
import FinanceReport from "../superAdmin/reports/FinanceReport";
import Dashboard from "../admin/Dashboard";
import ListProducts from "../admin/ListProducts";
import NewProduct from "../admin/NewProduct";
import UpdateProduct from "../admin/UpdateProduct";
import UploadImages from "../admin/UploadImages";
import ListOrders from "../admin/ListOrder";
import ProcessOrder from "../admin/ProcessOrder";
import ListUsers from "../admin/ListUsers";
import UpdateUsers from "../admin/UpdateUsers";
import ProductReviews from "../admin/ProductReviews";
import NewUser from "../admin/NewUser";
import AdminVerifyPayment from "../admin/AdminVerifyPayment";
import BlogAdmin from "../../components/blog/BlogAdmin";

// Reports (Super Admin)
import ReportLayout from "../../components/superAdmin/reports/ReportLayout";
import DashboardReport from "../../components/superAdmin/reports/DashboardReport";
import CustomerReport from "../../components/superAdmin/reports/CustomerReport";
import SalesReport from "../../components/superAdmin/reports/SalesReport";
import ShipmentsPage from "../admin/ShipmentsPage";
import UpdateOrderPage from "../admin/OrderStatusUpdate";
import CompletedOrdersPage from "../admin/CompletedOrdersPage";
import CouponsPage from "../admin/CouponsPage";
import BlogDashboardOverview from "../blog/DashboardBlog"
/**
 * ✅ คืนค่าเป็น Array ของ <Route> elements
 * เพื่อนำไป Spread ในไฟล์ App.js หลัก
 */
export default function AdminRoutes() {
  return [
   // ===== ✍️ BLOG MANAGEMENT =====
<Route
  key="blog-dashboard"
  path="/admin/blog/dashboard"
  element={
    <ProtectedRoute admin>
      <BlogDashboardOverview />
    </ProtectedRoute>
  }
/>,

<Route
  key="blog-admin-new"
  path="/admin/blogs/new"
  element={
    <ProtectedRoute admin>
      <BlogAdmin />
    </ProtectedRoute>
  }
/>,

<Route
  key="blog-admin-edit"
  path="/admin/blogs/:id/edit"
  element={
    <ProtectedRoute admin>
      <BlogAdmin />
    </ProtectedRoute>
  }
/>,

    // ===== 📊 FINANCE REPORT & DASHBOARD =====
    <Route
      key="admin-dashboard"
      path="/admin/dashboard"
      element={
        <ProtectedRoute admin>
          <Dashboard />
        </ProtectedRoute>
      }
    />,

    <Route
      key="admin-finance-report"
      path="/admin/reports/finance"
      element={
        <ProtectedRoute superAdmin>
          {" "}
          {/* 🔑 ใช้ superAdmin เพื่อความปลอดภัยระดับการเงิน */}
          <FinanceReport />
        </ProtectedRoute>
      }
    />,

    // ===== 📦 PRODUCTS MANAGEMENT =====
    <Route
      key="admin-products"
      path="/admin/products"
      element={
        <ProtectedRoute admin>
          <ListProducts />
        </ProtectedRoute>
      }
    />,

    <Route
      key="admin-product-new"
      path="/admin/product/new"
      element={
        <ProtectedRoute admin>
          <NewProduct />
        </ProtectedRoute>
      }
    />,

    <Route
      key="admin-product-update"
      path="/admin/products/:id"
      element={
        <ProtectedRoute admin>
          <UpdateProduct />
        </ProtectedRoute>
      }
    />,

    <Route
      key="admin-product-upload"
      path="/admin/products/:id/upload_images"
      element={
        <ProtectedRoute admin>
          <UploadImages />
        </ProtectedRoute>
      }
    />,

    // ===== 🚚 ORDERS MANAGEMENT =====
    <Route
      key="admin-orders"
      path="/admin/orders"
      element={
        <ProtectedRoute admin>
          <ListOrders />
        </ProtectedRoute>
      }
    />,

    <Route
      key="admin-orders-process"
      path="/admin/orders/:id"
      element={
        <ProtectedRoute admin>
          <ProcessOrder />
        </ProtectedRoute>
      }
    />,

    // ===== 👥 USERS MANAGEMENT (SUPER ADMIN) =====
    <Route
      key="admin-users"
      path="/admin/users"
      element={
        <ProtectedRoute superAdmin>
          <ListUsers />
        </ProtectedRoute>
      }
    />,

    <Route
      key="admin-users-new"
      path="/admin/users/new"
      element={
        <ProtectedRoute superAdmin>
          <NewUser />
        </ProtectedRoute>
      }
    />,

    <Route
      key="admin-users-update"
      path="/admin/users/:id"
      element={
        <ProtectedRoute superAdmin>
          <UpdateUsers />
        </ProtectedRoute>
      }
    />,

    // ===== ⭐ REVIEWS & PAYMENTS =====
    <Route
      key="admin-reviews"
      path="/admin/reviews"
      element={
        <ProtectedRoute admin>
          <ProductReviews />
        </ProtectedRoute>
      }
    />,

    <Route
      key="admin-verify-payments"
      path="/admin/verify-payments"
      element={
        <ProtectedRoute admin>
          <AdminVerifyPayment />
        </ProtectedRoute>
      }
    />,
    <Route
      key="blog-admin-list"
      path="/admin/blog"
      element={
        <ProtectedRoute admin>
          <BlogAdmin />
        </ProtectedRoute>
      }
    />,

    // ===== 📈 NESTED REPORTS (SUPER ADMIN) =====
    <Route
      key="admin-reports-layout"
      path="/admin/reports"
      element={
        <ProtectedRoute superAdmin>
          <ReportLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<DashboardReport />} />
      <Route path="customers" element={<CustomerReport />} />
      <Route path="sales" element={<SalesReport />} />
    </Route>,

    // ===== 🚚 SHIPMENTS & COMPLETED ORDERS (admin guard) =====
    <Route
      key="admin-shipments"
      path="/admin/shipments"
      element={
        <ProtectedRoute admin>
          <ShipmentsPage />
        </ProtectedRoute>
      }
    />,
    <Route
      key="admin-order-status-update"
      path="/admin/orders/:id/status"
      element={
        <ProtectedRoute admin>
          <UpdateOrderPage />
        </ProtectedRoute>
      }
    />,
    <Route
      key="admin-completed-orders"
      path="/admin/completed-orders"
      element={
        <ProtectedRoute admin>
          <CompletedOrdersPage />
        </ProtectedRoute>
      }
    />,

    // ===== 🎟️ COUPONS (admin) =====
    <Route
      key="admin-coupons"
      path="/admin/coupons"
      element={
        <ProtectedRoute admin>
          <CouponsPage />
        </ProtectedRoute>
      }
    />,
  ];
}
