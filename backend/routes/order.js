// backend/routes/order.js
import express from "express";
import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";
import { uploadMemory } from "../middlewares/uploadCloudinary.js"; // ← memory + cloudinary
import {
  allOrder,
  deleteOrder,
  getOrderDetails,
  myOrder,
  newOrder,
  updateOrder,
  getSales,
  updateOrderStatus,
  cancelMyOrder,
} from "../controllers/orderController.js";

import {
  attachPaymentProof,
  adminVerifyPayment,
} from "../controllers/paymentProofController.js";

import { notifyCustomer } from "../controllers/notifyController.js";

const router = express.Router();

/* ===================  PUBLIC / AUTHENTICATED  =================== */

router.route("/orders/new").post(isAuthenticatedUser, newOrder);
router.route("/orders/:id").get(isAuthenticatedUser, getOrderDetails);
router.route("/me/orders").get(isAuthenticatedUser, myOrder);

// ✅ User cancel own order — ก่อน Shipped + ยังไม่จ่าย
router.route("/orders/:id/cancel").post(isAuthenticatedUser, cancelMyOrder);

// อัปโหลดสลิป → Cloudinary (ใช้ memory)
router.post(
  "/orders/:orderId/upload-proof",
  isAuthenticatedUser,
  uploadMemory.single("proof"),
  attachPaymentProof
);

/* ===================  ADMIN  =================== */

router.get("/admin/get_sales", isAuthenticatedUser, authorizeRoles("admin", "superAdmin"), getSales);
router.get("/admin/orders", isAuthenticatedUser, authorizeRoles("admin", "superAdmin"), allOrder);

router.route("/admin/orders/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin", "superAdmin"), updateOrder)
  .delete(isAuthenticatedUser, authorizeRoles("admin", "superAdmin"), deleteOrder);

router.post(
  "/orders/:orderId/verify",
  isAuthenticatedUser,
  authorizeRoles("admin", "superAdmin"),
  adminVerifyPayment
);

router.post(
  "/orders/:orderId/notify",
  isAuthenticatedUser,
  authorizeRoles("admin", "superAdmin"),
  notifyCustomer
);
// backend/routes/order.js
router.patch(
  "/admin/orders/:id/status",
  isAuthenticatedUser,
  authorizeRoles("admin", "superAdmin"),
  updateOrderStatus
);

export default router;