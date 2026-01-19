import express from "express";
import {
  forgotPassword,
  getAllUser,
  getDeleteUser,
  getUpdatePassword,
  getUpdateProfile,
  getUpdateUser,
  getUserDetials,
  getUserProfile,
  loginUser,
  logoutUser,
  registerUser,
  resetPassword,
  uploadAvatar, // 🔑 เพิ่ม Controller สำหรับสร้างผู้ใช้ใหม่
  googleLogin,
} from "../controllers/authController.js";
// ใน routes/auth.js (หรือ userRoutes.js)

import {
  // ... controllers อื่นๆ
  newUser, // ✅ ตอนนี้สามารถ Import ได้อย่างถูกต้อง
} from "../controllers/userController.js";
// ...
import { isAuthenticatedUser } from "../middlewares/auth.js";
import { authorizeRoles } from "../middlewares/auth.js";

// 🚀 FIX: เพิ่มการ Import Middleware สำหรับการจัดการไฟล์ (เช่น Multer)
import { upload } from "../middlewares/multer.js"; // ***ต้องแน่ใจว่า path และชื่อไฟล์ตรงกับของคุณ***

const router = express.Router();

// Define the /register route that handles POST requests
// 🚀 FIX: เพิ่ม upload.single('avatar') เพื่อประมวลผลไฟล์ก่อนถึง registerUser controller
router.route("/register").post(upload.single("avatar"), registerUser);

router.route("/login").post(loginUser);

// 🚀 2. ເພີ່ມ Route ສຳລັບ Google Login 
router.route("/google/login").post(googleLogin); 


router.route("/logout").get(logoutUser);

router.route("/password/forgot").post(forgotPassword);
router.route("/password/reset/:token").put(resetPassword);
router.route("/me/password/update").put(isAuthenticatedUser, getUpdatePassword);

router.route("/me").get(isAuthenticatedUser, getUserProfile);
router.route("/me/update").put(isAuthenticatedUser, getUpdateProfile);
router.route("/me/upload_avatar").put(isAuthenticatedUser, uploadAvatar);

// ===========================================
// 🔑 ADMIN / SUPER ADMIN ROUTES (แก้ไขและเพิ่ม)
// ===========================================

router
  .route("/admin/users")
  .post(isAuthenticatedUser, authorizeRoles("admin", "superAdmin"), newUser) // อนุญาต Admin ด้วย
  .get(isAuthenticatedUser, authorizeRoles("admin", "superAdmin"), getAllUser); // อนุญาต Admin ด้วย

router
  .route("/admin/users/:id")
  .get(
    isAuthenticatedUser,
    authorizeRoles("admin", "superAdmin"),
    getUserDetials
  )
  .put(
    isAuthenticatedUser,
    authorizeRoles("admin", "superAdmin"),
    getUpdateUser
  )
  .delete(
    isAuthenticatedUser,
    authorizeRoles("admin", "superAdmin"),
    getDeleteUser
  );

// Export the router for use in your main app file
export default router;
