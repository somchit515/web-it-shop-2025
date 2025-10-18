import React from 'react' // 🛑 FIX: ไม่จำเป็นต้อง Import { Children }
import SideMenu from './SideMenu'

// 1. รับ children เป็น parameter (ตัวเล็ก)
const Userlayout = ({ children }) => {
   const menuItems = [
      {
        name: "Profile",
        "url": "/me/profile",
        icon: "fas fa-user"
      },
      {
        name: "Update Profile",
        "url": "/me/Update_Profile",
        icon: "fas fa-user"
      },
      {
        name: "Upload Avatar",
        "url": "/me/Upload_Avatar",
        icon: "fas fa-user-circle"
      },
      {
        name: "Update Password",
        "url": "/me/Update_Password",
        icon: "fas fa-lock"
      },
    ];
  return (
    <div>
      <div className="mt-2 mb-4 py-4">
        <h2 className="text-center fw-bold">ຂໍ້ມູນຜູ້ໃຊ້ງານ</h2>

      </div>
      <div className="container">
        <div className="row justify-content-around">
          <div className="col-12 col-lg-3">
            <SideMenu  menuItems= {menuItems}/>
          </div>
          <div className="col-12 col-lg-8 user-dashboard">
            {/* 🛑 FIX: เปลี่ยนจาก {Children} เป็น {children} (ตัวเล็ก) */}
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Userlayout