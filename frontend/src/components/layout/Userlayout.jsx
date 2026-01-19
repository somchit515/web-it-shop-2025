import React from "react";
import SideMenu from "./SideMenu";

const Userlayout = ({ children }) => {
  const styles = `
    :root {
      --primary: #0f63ff;
      --primary-light: #e6efff;
      --text-dark: #0f172a;
      --muted: #64748b;
      --radius: 12px;
      --font: "Inter", "Noto Sans Lao", sans-serif;
    }

    .user-header-block {
      text-align: center;
      padding: 24px 0;
      margin-bottom: 20px;
      background: linear-gradient(90deg, rgba(15,99,255,0.10), rgba(16,185,129,0.06));
      border-radius: var(--radius);
      max-width: 900px;
      margin-left: auto;
      margin-right: auto;
      box-shadow: 0 10px 28px rgba(15,99,255,0.07);
    }

    .user-header-block h2 {
      margin: 0;
      font-size: 1.6rem;
      font-weight: 800;
      color: var(--text-dark);
      letter-spacing: -0.02em;
    }

    .user-dashboard {
      background: #ffffff;
      padding: 22px;
      border-radius: var(--radius);
      box-shadow: 0 12px 32px rgba(15,99,255,0.06);
      min-height: 300px;
      font-family: var(--font);
    }
  `;

  const menuItems = [
    { name: "Profile", url: "/me/profile", icon: "fas fa-user" },
    { name: "Update Profile", url: "/me/Update_Profile", icon: "fas fa-edit" },
    { name: "Upload Avatar", url: "/me/Upload_Avatar", icon: "fas fa-user-circle" },
    { name: "Update Password", url: "/me/Update_Password", icon: "fas fa-lock" }
  ];

  return (
    <>
      <style>{styles}</style>

      {/* Header Block */}
      <div className="user-header-block mt-3">
        <h2>ຂໍ້ມູນຜູ້ໃຊ້ງານ</h2>
      </div>

      {/* Main Layout */}
      <div className="container">
        <div className="row justify-content-around">

          {/* Left Menu */}
          <div className="col-12 col-lg-3 mb-4">
            <SideMenu menuItems={menuItems} />
          </div>

          {/* Main content */}
          <div className="col-12 col-lg-8 user-dashboard">
            {children}
          </div>

        </div>
      </div>
    </>
  );
};

export default Userlayout;
