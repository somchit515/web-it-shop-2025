import Order from "../models/orders.js";
import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import { uploadToCloudinary } from "../middlewares/uploadCloudinary.js";
import { tryPushNotify, buildOrderPushPayload } from "../utils/pushNotifier.js";

export const attachPaymentProof = catchAsyncErrors(async (req, res, next) => {
  if (!req.file) return next(new ErrorHandler("No file uploaded.", 400));
  if (!req.file.buffer) {
    return next(new ErrorHandler("File buffer missing – multer may not be memory storage", 400));
  }

  const order = await Order.findById(req.params.orderId);
  if (!order) return next(new ErrorHandler("Order not found.", 404));

  // ✅ เฉพาะเจ้าของ order เท่านั้น (admin ไม่ถูก allow โดยเจตนา —
  //    การอัปโหลดสลิปต้องมาจากลูกค้าที่ชำระเงินจริงๆ)
  if (order.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("You are not authorized to upload proof for this order", 403));
  }

  if (order.paymentStatus === "Paid")
    return next(new ErrorHandler("Order already paid.", 400));

  const result = await uploadToCloudinary(req.file.buffer, 'payment_proofs');

  const proof = {
    url: result.secure_url,
    public_id: result.public_id,
    uploadedAt: new Date(),
    uploadedBy: req.user._id,
  };

  order.paymentProof = order.paymentProof || [];
  order.paymentProof.push(proof);
  order.paymentMethod = "BankTransfer";
  order.paymentStatus = "AwaitingProof";
  await order.save();

  res.status(200).json({
    success: true,
    message: "Proof uploaded. Awaiting admin verification.",
    proof,
    orderId: order._id,
  });
});

export const adminVerifyPayment = catchAsyncErrors(async (req, res, next) => {
  const { orderId } = req.params;
  const { action, note } = req.body;

  if (!action || !["confirm", "reject"].includes(action)) {
    return next(new ErrorHandler("Invalid action. Use 'confirm' or 'reject'.", 400));
  }

  const order = await Order.findById(orderId);
  if (!order) return next(new ErrorHandler("Order not found.", 404));

  // COD ບໍ່ຕ້ອງການ proof — ພຽງແຕ່ BankTransfer ທີ່ຕ້ອງການ
  if (action === "confirm" && order.paymentMethod !== "COD" && (!order.paymentProof || order.paymentProof.length === 0)) {
    return next(new ErrorHandler("Cannot confirm payment without proof files.", 400));
  }

  if (action === "confirm") {
    order.paymentStatus = "Paid";
    order.verifiedBy = req.user._id;
    order.verifiedAt = new Date();
    order.verificationNote = note || "Payment confirmed by admin.";
  } else {
    // กรณี Reject
    order.paymentStatus = "Rejected";
    order.verificationNote = note || "Payment rejected by admin.";
    
    // (ทางเลือก) หากต้องการให้ลูกค้าสามารถอัปโหลดใหม่ได้ อาจจะปรับสถานะกลับไปเป็น Pending หรืออื่นๆ ตาม Logic ของคุณ
    // ในที่นี้ผมคงไว้ที่ Rejected ตามโค้ดเดิมของคุณครับ
  }
  
  await order.save();

  // Fire-and-forget push notification to order owner
  const pushAction = action === "confirm" ? "payment_confirmed" : "payment_rejected";
  tryPushNotify(order.user, buildOrderPushPayload(pushAction, order._id));

  res.status(200).json({
    success: true,
    orderId: order._id,
    paymentStatus: order.paymentStatus,
    verificationNote: order.verificationNote,
  });
});
