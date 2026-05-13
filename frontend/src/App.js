// App.js - ปรับปรุงให้รองรับ Blog Routes
import "./App.css";
import { BrowserRouter as Router, Routes, useLocation } from "react-router-dom";
import Footer from "./components/layout/Footer";
import Header from "./components/layout/Header";
import { Toaster } from "react-hot-toast";
import useUserRoutes from "./components/routes/UserRoutes";
import useAdminRoutes from "./components/routes/AdminRoutes";
import BlogRoutes from "./components/routes/BlogRoutes"; // ✅ เพิ่มตรงนี้
import ConfirmDialog from "./components/admin/_shared/ConfirmDialog.jsx";

function AppWrapper() {
  const location = useLocation();

  // ซ่อน Header + Footer บนหน้า auth (login/register/forgot/reset password)
  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/password/forgot" ||
    location.pathname.startsWith("/password/reset");

  const isAdminPage = location.pathname.startsWith("/admin");

  // Header: ซ่อนเฉพาะ auth pages (admin ให้แสดงด้วย)
  const showHeader = !isAuthPage;
  // Footer: ซ่อนทั้ง auth และ admin
  const showFooter = !isAuthPage && !isAdminPage;

  return (
    <div className="App">
      <Toaster position="top-center" />
      <ConfirmDialog />
      {showHeader && <Header />}

      <div className="container">
        <Routes>
          {/* render route arrays WITHOUT commas */}
          {useUserRoutes()}
          {useAdminRoutes()}
          {BlogRoutes()}
        </Routes>
      </div>

      {showFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;