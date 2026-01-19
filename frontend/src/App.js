// App.js - ปรับปรุงให้รองรับ Blog Routes
import "./App.css";
import { BrowserRouter as Router, Routes, useLocation } from "react-router-dom";
import Footer from "./components/layout/Footer";
import Header from "./components/layout/Header";
import { Toaster } from "react-hot-toast";
import useUserRoutes from "./components/routes/UserRoutes";
import useAdminRoutes from "./components/routes/AdminRoutes";
import BlogRoutes from "./components/routes/BlogRoutes"; // ✅ เพิ่มตรงนี้

function AppWrapper() {
  const location = useLocation();

  // ซ่อน Header บนหน้า login/register/forgot password
  const hideHeader = location.pathname === "/login" || 
                    location.pathname === "/register" || 
                    location.pathname === "/password/forgot";

  return (
    <div className="App">
      <Toaster position="top-center" />
      {!hideHeader && <Header />}

      <div className="container">
        <Routes>
          {/* render route arrays WITHOUT commas */}
          {useUserRoutes()}
          {useAdminRoutes()}
          {BlogRoutes()} {/* ✅ เพิ่มตรงนี้ */}
        </Routes>
      </div>

      <Footer />
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