import express from "express";
import { getFlashDeal, updateFlashDeal } from "../controllers/flashDealController.js";
import { isAuthenticatedUser, authorizeRoles } from "../middlewares/auth.js";

const router = express.Router();

router.get("/flash-deal", getFlashDeal);
router.put("/admin/flash-deal", isAuthenticatedUser, authorizeRoles("admin", "superAdmin"), updateFlashDeal);

export default router;
