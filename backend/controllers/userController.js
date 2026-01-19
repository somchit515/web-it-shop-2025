// ใน D:\program\web-it-shop-2025\backend\controllers\userController.js

// 🔑 1. Import ErrorHandler Utility (สมมติ path)
import ErrorHandler from '../utils/errorHandler.js'; 

// 🔑 2. Import User Model (ใช้ Default Import เพื่อแก้ปัญหา User is not defined)
import User from '../models/userModel.js'; 
// NOTE: เราจะสมมติว่า userModel.js ใช้ export default User;

// ✅ Controller function: สร้างผู้ใช้ใหม่โดย Admin/SuperAdmin
export const newUser = async (req, res, next) => { 
    const { name, email, password, role } = req.body;
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!name || !email || !password) {
        return next(new ErrorHandler('ກະລຸນາປ້ອນຂໍ້ມູນທຸກຊ່ອງ', 400)); 
    }
    
    try {
        // สร้างผู้ใช้ใหม่
        const user = await User.create({
            name,
            email,
            password, 
            role: role || 'user', 
        });

        // ส่งคำตอบกลับ
        res.status(201).json({
            success: true,
            message: 'ສ້ງຜູ້ໃຊ້ໃໝ່ສຳເລັດ',
            user
        });
        
    } catch (error) {
        // 🔑 ดักจับ MongoDB Duplicate Key Error (E11000)
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0]; 
            return next(new ErrorHandler(`ທີ່ປ້ອນ ${field} ໄດ້ມີການລົງທະບຽນແລ້ວ.`, 400));
        }

        // ส่ง Error อื่นๆ ไปยัง Error Middleware
        next(error);
    }
};

// 💡 NOTE: คุณต้องเปลี่ยน exports.getAllUser, exports.getUpdateUser, ฯลฯ 
// ในไฟล์ Controller นี้ทั้งหมดให้เป็น export const เช่น:
// export const getAllUser = async (req, res, next) => { ... };