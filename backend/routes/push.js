import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.js";
import { getVapidPublicKey, subscribe, unsubscribe } from "../controllers/pushController.js";

const router = express.Router();

router.get("/push/vapid-public-key", getVapidPublicKey);
router.post("/push/subscribe",   isAuthenticatedUser, subscribe);
router.delete("/push/unsubscribe", isAuthenticatedUser, unsubscribe);

export default router;
