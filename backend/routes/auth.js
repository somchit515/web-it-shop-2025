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
    uploadAvatar,
} from "../controllers/authController.js";
import { isAuthenticatedUser } from "../middlewares/auth.js";
import { authorizeRoles } from "../middlewares/auth.js";

// 🚀 FIX: เพิ่มการ Import Middleware สำหรับการจัดการไฟล์ (เช่น Multer)
import { upload } from "../middlewares/multer.js"; // ***ต้องแน่ใจว่า path และชื่อไฟล์ตรงกับของคุณ***

const router = express.Router();

// Define the /register route that handles POST requests
// 🚀 FIX: เพิ่ม upload.single('avatar') เพื่อประมวลผลไฟล์ก่อนถึง registerUser controller
router.route("/register").post(upload.single('avatar'), registerUser);

router.route("/login").post(loginUser);

router.route("/logout").get(logoutUser);

router.route("/password/forgot").post(forgotPassword);
router.route("/password/reset/:token").put(resetPassword);
router.route("/me/password/update").put(isAuthenticatedUser, getUpdatePassword);

router.route("/me").get(isAuthenticatedUser, getUserProfile);
router.route("/me/update").put(isAuthenticatedUser, getUpdateProfile);
router.route("/me/upload_avatar").put(isAuthenticatedUser, uploadAvatar);
router
    .route("/admin/users")
    .get(isAuthenticatedUser, authorizeRoles("admin"), getAllUser);

router
    .route("/admin/users/:id")
    .get(isAuthenticatedUser, authorizeRoles("admin"), getUserDetials)
    .put(isAuthenticatedUser, authorizeRoles("admin"), getUpdateUser)
    .delete(isAuthenticatedUser, authorizeRoles("admin"), getDeleteUser);

// Export the router for use in your main app file
export default router;