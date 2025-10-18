// In src/components/layout/Header.jsx

import React from "react";
import Search from "./Search";

// 🚀 FIX: Go up one level (..), then into redux/api/userApi
// This is the correct path if 'redux' and 'layout' are siblings under 'components'
import { useGetMeQuery } from "../redux/api/userApi";

import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

// 🚀 FIX: Go up one level (..), then into redux/api/authApi
import { useLogoutMutation } from "../redux/authApi";



const Header = () => {
    const navigate = useNavigate();
    const { isLoading } = useGetMeQuery();
    // 🚀 FIX: ลบ 'data' ออกเพื่อแก้ WARNING: 'data' is assigned a value but never used
    // ตัวแปร 'logout' คือฟังก์ชัน Trigger
    const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
    const { user } = useSelector((state) => state.auth);
    const cartItems = useSelector((state) => state.cart.cartItems);
    const logoutHandle = async (e) => {
        e.preventDefault(); try {
            await logout().unwrap();
            // ✅ เปลี่ยนเป็นนำทางปกติ เพราะ Redux state จะถูกรีเซ็ตแล้ว
            navigate("/login");
        } catch (error) {
            console.error("Logout failed", error);

            navigate(0);
        }
    };



    return (
        <nav className="navbar row" style={{ backgroundColor: '#3a3939' }}>
            <div className="col-12 col-md-3 ps-5">
                <div className="navbar-brand">
                    <a href="/">
                        <img src="/images/logo.png" alt="ShopIT Logo" style={{ height: '80px' }} />
                    </a>
                </div>
            </div>

            <div className="col-12 col-md-6 mt-2 mt-md-0" >
                <Search />
            </div>
            <div className="col-12 col-md-3 mt-4 mt-md-0 text-center">
                <a href="/cart" style={{ textDecoration: " none" }}>
                    <span id="cart" className="ms-3">
                        {" "}
                        ກະຕ່າສິນຄ້າ{" "}
                    </span>
                    <span className="ms-1" id="cart_count">
                        {cartItems.length}
                    </span>
                </a>

                {user ? (
                    <div className="ms-4 dropdown">
                        <button
                            className="btn dropdown-toggle text-white"
                            type="button"
                            id="dropDownMenuButton"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                        // 💡 Optional: ใช้ isLoggingOut เพื่อปิดปุ่มหลัก
                        // disabled={isLoggingOut}
                        >
                            <figure className="avatar avatar-nav">
                                <img
                                    src={user?.avatar ? user?.avatar.url : "https://cdn-icons-png.flaticon.com/512/3607/3607444.png"}
                                    alt="User Avatar"
                                    className="rounded-circle"
                                />
                            </figure>
                            <span>{user.name}</span>
                        </button>
                        <div
                            className="dropdown-menu w-100"
                            aria-labelledby="dropDownMenuButton"
                        >
                            {user?.role === 'admin' && (

                                <Link className="dropdown-item" to="/admin/dashboard">
                                    {" "}
                                    Dashboard{" "}
                                </Link>

                            )}


                            <Link className="dropdown-item" to="/me/orders">
                                {" "}
                                Orders{" "}
                            </Link>

                            <Link className="dropdown-item" to="/me/profile">
                                {" "}
                                Profile{" "}
                            </Link>

                            <Link
                                className="dropdown-item text-danger"
                                to="/"
                                onClick={logoutHandle}
                                // 🚀 แก้ไข: ปิดปุ่มระหว่างรอ API response
                                disabled={isLoggingOut}
                            >
                                {isLoggingOut ? "ກຳລັງອອກ..." : "Logout"}{" "}
                            </Link>
                        </div>
                    </div>
                ) : (
                    !isLoading && (
                        <Link to="/login" className="btn ms-4" id="login_btn">
                            {" "}
                            Login{" "}
                        </Link>
                    )
                )}
            </div>
        </nav>
    );
};

export default Header;