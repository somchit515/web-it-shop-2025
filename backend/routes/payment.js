import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.js";
// ✅ FIX: Import BOTH functions from the single paymentController.js file
import { StripecheckoutSession, stripeWebhook } from "../controllers/paymentController.js"; 


const router = express.Router();

// Route to initiate the Stripe Checkout Session
router.route("/payment/checkout_session").post(isAuthenticatedUser, StripecheckoutSession);

// Route for the Stripe Webhook to receive payment events
// NOTE: This route MUST be called with the raw body, as configured in index.js
router.route("/payment/webhook").post(stripeWebhook);

export default router;