import PushSubscription from "../models/pushSubscription.js";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";

// GET /api/v1/push/vapid-public-key  (public)
export const getVapidPublicKey = catchAsyncErrors(async (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY || "" });
});

// POST /api/v1/push/subscribe  (authenticated)
export const subscribe = catchAsyncErrors(async (req, res, next) => {
  const { endpoint, keys } = req.body;
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return next(new ErrorHandler("Invalid subscription object — endpoint and keys required", 400));
  }

  await PushSubscription.findOneAndUpdate(
    { user: req.user._id, endpoint },
    {
      user:      req.user._id,
      endpoint,
      keys,
      userAgent: req.headers["user-agent"],
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.status(201).json({ success: true, message: "Subscribed to push notifications" });
});

// DELETE /api/v1/push/unsubscribe  (authenticated)
export const unsubscribe = catchAsyncErrors(async (req, res, next) => {
  const { endpoint } = req.body;
  if (!endpoint) return next(new ErrorHandler("endpoint required", 400));

  await PushSubscription.deleteOne({ user: req.user._id, endpoint });
  res.json({ success: true, message: "Unsubscribed from push notifications" });
});
