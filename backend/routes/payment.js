import express from "express";
import { isAuthenticatedUser, isAdmin } from "../middlewares/auth.js";
import { StripecheckoutSession } from "../controllers/paymentController.js";
import { attachPaymentProof, adminVerifyPayment } from "../controllers/paymentProofController.js";
import { uploadMemory } from "../middlewares/uploadCloudinary.js";

const router = express.Router();

router.post("/payment/checkout_session", isAuthenticatedUser, StripecheckoutSession);

router.post(
  "/orders/:orderId/upload-proof",
  isAuthenticatedUser,
  uploadMemory.single("proof"),   // ใช้ memory + Cloudinary
  attachPaymentProof
);

router.post(
  "/orders/:orderId/verify",
  isAuthenticatedUser,
  isAdmin,
  adminVerifyPayment
);

export default router;