import React from 'react'
import SideMenu from './SideMenu'

function AdminLayout({children}) {
     const menuItems = [
      {
        name: "Dashboard",
        "url": "/admin/dashboard",
        icon: "fas fa-tachometer-alt"
      },
      {
        name: "ເພີ່ມສິນຄ້າໃໝ່",
        "url": "/admin/product/new",
        icon: "fas fa-plus"
      },
      {
        name: "ລາຍການສິນຄ້າ",
        "url": "/admin/products",
        icon: "fab fa-product-hunt"
      },
      {
        name: "ອໍເດີສິ່ງຊື້",
        "url": "/admin/orders",
        icon: "fas fa-receipt"
      },
      {
        name: "ຜູ້ໃຊ້",
        "url": "/admin/users",
        icon: "fas fa-user"
      },
      {
        name: "ຄວາມຄິດເຫັນ",
        "url": "/admin/reviews",
        icon: "fas fa-star"
      },
    ];
  return (
    <div>
      <div className="mt-2 mb-4 py-4">
        <h2 className="text-center fw-bold">Admin Dashboard</h2>

      </div>
      
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
    
  )
}

export default AdminLayout
