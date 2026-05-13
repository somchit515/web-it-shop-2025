// backend/routes/coupons.js
import express from "express";
import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";
import {
  validateCoupon,
  createCoupon,
  listCoupons,
  getCouponDetails,
  updateCoupon,
  deleteCoupon,
} from "../controllers/couponController.js";

const router = express.Router();

// User: validate code
router.post("/coupons/validate", isAuthenticatedUser, validateCoupon);

// Admin: CRUD
router.post(
  "/admin/coupons",
  isAuthenticatedUser,
  authorizeRoles("admin", "superAdmin"),
  createCoupon
);
router.get(
  "/admin/coupons",
  isAuthenticatedUser,
  authorizeRoles("admin", "superAdmin"),
  listCoupons
);
router.get(
  "/admin/coupons/:id",
  isAuthenticatedUser,
  authorizeRoles("admin", "superAdmin"),
  getCouponDetails
);
router.put(
  "/admin/coupons/:id",
  isAuthenticatedUser,
  authorizeRoles("admin", "superAdmin"),
  updateCoupon
);
router.delete(
  "/admin/coupons/:id",
  isAuthenticatedUser,
  authorizeRoles("admin", "superAdmin"),
  deleteCoupon
);

export default router;
