// controllers/orderController.js
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Order from "../models/orders.js";
import ErrorHandler from "../utils/errorHandler.js";
import { sendOrderEmail } from "../utils/mailer.js"; // ปรับ path ถ้าจำเป็น
import { restoreStockBatch } from "../utils/stockManager.js";
import { assertOwnershipOrAdmin } from "../utils/authHelpers.js";
import { tryNotifyOrder } from "../utils/mailer.js";
import { tryPushNotify, buildOrderPushPayload } from "../utils/pushNotifier.js";

// ✅ Helper: ส่ง email ตาม status (รวม logic เพื่อใช้ได้หลายที่)
function notifyStatusChange(order, newFulfillmentStatus, note = "") {
  const userEmail = order.user?.email;
  if (!userEmail) return;

  let action = null;
  if (newFulfillmentStatus === "Shipped") action = "shipped";
  else if (newFulfillmentStatus === "Delivered") action = "delivered";
  else if (newFulfillmentStatus === "Cancelled") action = "cancelled";

  if (!action) return;

  tryNotifyOrder({
    to: userEmail,
    order: order.toObject ? order.toObject() : order,
    action,
    lang: order.user?.lang || "la",
    note,
  });
}
// ⚠️ Product import ถูกย้ายไปใช้ผ่าน stockManager utility แล้ว

// Create new Order => /api/v1/orders/new
export const newOrder = catchAsyncErrors(async (req, res, next) => {
  const {
    orderItems,
    shippingInfo,
    itemsPrice,
    taxAmount,
    totalAmount,
    shippingAmount,
    paymentMethod,
    paymentInfo,
  } = req.body;

  // Basic validation (แนะนำ)
  if (!Array.isArray(orderItems) || orderItems.length === 0) {
    return next(new ErrorHandler("orderItems is required and should be a non-empty array", 400));
  }

  // ✅ ตรวจ + หัก stock ก่อนสร้าง order (เหมือนใน paymentController)
  const { validateStock, decrementStockBatch } = await import("../utils/stockManager.js");

  const validation = await validateStock(orderItems);
  if (!validation.ok) {
    return res.status(409).json({
      success: false,
      message: "ສິນຄ້າບໍ່ພຽງພໍ",
      errors: validation.errors,
    });
  }

  const decrementResult = await decrementStockBatch(orderItems);
  if (!decrementResult.ok) {
    return res.status(409).json({
      success: false,
      message: `ສິນຄ້າ "${decrementResult.error.name}" ບໍ່ພຽງພໍ`,
      error: decrementResult.error,
    });
  }

  try {
    const order = await Order.create({
      orderItems,
      shippingInfo,
      itemsPrice,
      taxAmount,
      totalAmount,
      shippingAmount,
      paymentMethod,
      paymentInfo,
      user: req.user._id,
    });

    res.status(201).json({
      success: true,
      order,
    });
  } catch (err) {
    // Rollback stock ถ้า Order.create() ล้มเหลว
    await restoreStockBatch(orderItems);
    return next(new ErrorHandler(`Failed to create order: ${err.message}`, 500));
  }
});

// Get current user orders => /api/v1/me/orders?status=&q=
export const myOrder = catchAsyncErrors(async (req, res, next) => {
  const filter = { user: req.user._id };

  const { status } = req.query;
  if (status && status !== "all") {
    // Capitalize first letter: "processing" → "Processing" ໃຫ້ match DB
    const normalized = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    filter.fulfillmentStatus = normalized;
  }

  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .populate("user", "name email");

  res.status(200).json({
    success: true,
    orders,
  });
});

// Get Order Details => /api/v1/orders/:id
export const getOrderDetails = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate("user", "name email lang");

  if (!order) {
    return next(new ErrorHandler("No Order Found With This ID", 404));
  }

  // ✅ เจ้าของเท่านั้น (หรือ admin) — กันผู้ใช้คนอื่นเปิดดู order
  assertOwnershipOrAdmin(order, req.user, "order");

  res.status(200).json({
    success: true,
    order,
  });
});

// Get All orders => /api/v1/admin/orders
// ✅ รองรับ filter + pagination ทั้งหมดผ่าน query params (ทุกอย่าง optional)
//    ?paymentStatus=AwaitingProof
//    ?fulfillmentStatus=Shipped
//    ?paymentMethod=COD
//    ?q=กฤษ                     (search ในชื่อลูกค้า/orderId)
//    ?page=1&perPage=20         (pagination)
export const allOrder = catchAsyncErrors(async (req, res, next) => {
  const {
    paymentStatus,
    fulfillmentStatus,
    paymentMethod,
    q,
    page,
    perPage,
  } = req.query;

  // ────── Build filter ──────
  const filter = {};

  if (paymentStatus) {
    // รองรับหลายค่าคั่นด้วย comma เช่น ?paymentStatus=Pending,AwaitingProof
    const list = String(paymentStatus).split(",").map((s) => s.trim()).filter(Boolean);
    filter.paymentStatus = list.length > 1 ? { $in: list } : list[0];
  }

  if (fulfillmentStatus) {
    const list = String(fulfillmentStatus).split(",").map((s) => s.trim()).filter(Boolean);
    filter.fulfillmentStatus = list.length > 1 ? { $in: list } : list[0];
  }

  if (paymentMethod) {
    filter.paymentMethod = paymentMethod;
  }

  // Search — match ໃນ orderId / address / phone / trackingCode / name
  if (q && String(q).trim()) {
    const term = String(q).trim();
    const safe = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(safe, "i");
    filter.$or = [
      { "shippingInfo.address": re },
      { "shippingInfo.phoneNo": re },
      { "shippingInfo.name": re },
      { "shippingInfo.fullName": re },
      { trackingCode: re },
    ];
    if (/^[0-9a-fA-F]{24}$/.test(term)) {
      filter.$or.push({ _id: term });
    }
  }

  // ────── Pagination (optional, backward compat) ──────
  const hasPagination = page !== undefined || perPage !== undefined;
  const pageNum = Math.max(1, Number(page) || 1);
  const perPageNum = Math.min(200, Math.max(1, Number(perPage) || 50));

  // ────── Query DB ──────
  let query = Order.find(filter).sort({ createdAt: -1 });
  let total = null;

  if (hasPagination) {
    total = await Order.countDocuments(filter);
    query = query.skip((pageNum - 1) * perPageNum).limit(perPageNum);
  }

  const orders = await query.populate("user", "name email").exec();

  // ────── Response (เพิ่ม metadata เฉพาะตอนใช้ pagination) ──────
  const response = {
    success: true,
    orders: orders || [],
  };
  if (hasPagination) {
    response.total = total;
    response.page = pageNum;
    response.perPage = perPageNum;
    response.totalPages = Math.ceil(total / perPageNum);
  }

  res.status(200).json(response);
});

// ⚠️ updateStockAtomic ถูกย้ายไป utils/stockManager.js แล้ว
//    (ใช้ decrementStockBatch / restoreStockBatch แทน)

// Get Update orders - Admin => /api/v1/admin/orders/:id
export const updateOrder = catchAsyncErrors(async (req, res, next) => {
  // populate user เพื่อส่ง email
  const order = await Order.findById(req.params.id).populate("user", "name email lang");

  if (!order) {
    return next(new ErrorHandler("No Order Found With This ID", 404));
  }

  // ✅ รับได้ทั้ง fulfillmentStatus (ใหม่) และ status (เก่า — backward compat)
  const newStatus = req.body.fulfillmentStatus || req.body.status;
  if (!newStatus) {
    return next(new ErrorHandler("No fulfillmentStatus provided", 400));
  }

  const VALID_STATUSES = ["Unfulfilled", "Processing", "Shipped", "Delivered", "Cancelled", "Returned"];
  if (!VALID_STATUSES.includes(newStatus)) {
    return next(new ErrorHandler(`Invalid status: ${newStatus}`, 400));
  }

  // ✅ ใช้ fulfillmentStatus เป็นหลักในการเช็ค (virtual ครอบคลุมทั้ง legacy)
  const currentStatus = order.fulfillmentStatus || order.status;

  if (currentStatus === "Delivered") {
    return next(new ErrorHandler("You have already Delivered this order", 400));
  }

  // ✅ Stock ถูกหักไปแล้วตั้งแต่ตอนสร้าง order — ตอน Delivered แค่บันทึกเวลา
  if (newStatus === "Delivered" && currentStatus !== "Delivered") {
    order.deliveredAt = Date.now();
  }

  if (newStatus === "Shipped" && currentStatus !== "Shipped") {
    order.shippedAt = Date.now();
  }

  // ✅ ถ้าเปลี่ยนเป็น Cancelled → คืน stock กลับ (ยังไม่เคย cancel มาก่อน)
  if (newStatus === "Cancelled" && currentStatus !== "Cancelled") {
    await restoreStockBatch(order.orderItems);
    order.cancelledAt = Date.now();
  }

  // ✅ ใช้ fulfillmentStatus — pre-save hook จะ sync orderStatus + shipmentStatus เอง
  order.fulfillmentStatus = newStatus;

  await order.save();

  // ✅ Send email + push notification (fire-and-forget)
  notifyStatusChange(order, newStatus);
  const pushAction = { Shipped: "shipped", Delivered: "delivered", Cancelled: "cancelled" }[newStatus];
  if (pushAction) tryPushNotify(order.user?._id || order.user, buildOrderPushPayload(pushAction, order._id));

  res.status(200).json({
    success: true,
    fulfillmentStatus: order.fulfillmentStatus,
  });
});

// Confirm Payment / Approve Order (Admin)
// PUT /api/v1/admin/orders/:id/confirm
export const confirmOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate("user", "name email lang");

  if (!order) {
    return next(new ErrorHandler("No Order Found With This ID", 404));
  }

  const currentStatus = order.fulfillmentStatus || order.status;
  if (currentStatus === "Delivered") {
    return next(new ErrorHandler("This order has already been delivered", 400));
  }

  // Mark paid
  order.isPaid = true;
  order.paidAt = Date.now();
  order.paymentStatus = "Paid";

  // Merge/override paymentInfo if provided
  order.paymentInfo = Object.assign({}, order.paymentInfo || {}, {
    status: req.body.paymentStatus || "succeeded",
    method: req.body.paymentMethod || order.paymentMethod || "manual",
    transactionId: req.body.transactionId || (order.paymentInfo && order.paymentInfo.transactionId) || null,
  });

  // Optionally record who confirmed
  if (req.user && req.user._id) {
    order.confirmedBy = req.user._id;
  }

  // ✅ ใช้ fulfillmentStatus — pre-save hook จะ sync orderStatus + shipmentStatus เอง
  order.fulfillmentStatus = req.body.fulfillmentStatus || req.body.orderStatus || "Processing";

  await order.save();

  // Try to send email with invoice (do not fail the request if mailer fails)
  try {
    const invoiceUrl = `${process.env.FRONTEND_URL || ""}/invoice/order/${order._id}`;
    await sendOrderEmail({
      to: order.user?.email,
      order,
      action: "confirm",
      lang: order.user?.lang || "la",
      invoiceFromUrl: invoiceUrl,
    });
  } catch (mailErr) {
    console.error("Warning: failed to send order confirmation email:", mailErr);
  }

  res.status(200).json({
    success: true,
    message: "Order payment confirmed and customer notified.",
    order,
  });
});

// Delete Order => /api/v1/admin/orders/:id
export const deleteOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("No Order Found With This ID", 404));
  }

  // ✅ คืน stock กลับเฉพาะ order ที่ยังไม่ Delivered/Cancelled (ป้องกันการคืนซ้ำ)
  //    ใช้ fulfillmentStatus + virtual `status` (รองรับ orders เก่าที่ยังไม่มี fulfillmentStatus)
  const currentStatus = order.fulfillmentStatus || order.status;
  const alreadyReleased = currentStatus === "Cancelled" || currentStatus === "Delivered";
  if (!alreadyReleased) {
    await restoreStockBatch(order.orderItems);
  }

  await order.deleteOne();

  res.status(200).json({
    success: true,
    message: alreadyReleased
      ? "Order deleted (no stock change)."
      : "Order deleted and stock restored.",
  });
});

/**
 * Core logic to fetch and process sales data for a given date range.
 */
async function getSalesData(startDate, endDate) {
  const pipeline = [
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: {
          // Produce YYYY-MM-DD in UTC to match getDateBetween
          date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "+00:00" } },
        },
        totalSales: { $sum: { $ifNull: ["$totalAmount", 0] } },
        totalNumOrders: { $sum: 1 },
        totalShipping: { $sum: { $ifNull: ["$shippingAmount", 0] } },
        totalTax: { $sum: { $ifNull: ["$taxAmount", 0] } },
      },
    },
    {
      $sort: { "_id.date": 1 },
    },
  ];

  let saleData;
  try {
    saleData = await Order.aggregate(pipeline);
  } catch (error) {
    console.error("Error aggregating sales data:", error);
    throw new Error("Could not retrieve sales data.");
  }

  const salesMap = new Map();
  let totalSales = 0;
  let totalNumOrders = 0;

  saleData.forEach((entry) => {
    const date = entry?._id?.date;
    const sales = entry?.totalSales || 0;
    const numOrders = entry?.totalNumOrders || 0;
    const shipping = entry?.totalShipping || 0;
    const tax = entry?.totalTax || 0;

    salesMap.set(date, { sales, numOrders, shipping, tax });
    totalSales += sales;
    totalNumOrders += numOrders;
  });

  const datesBetween = getDateBetween(startDate, endDate);

  const finalSaleData = datesBetween.map((date) => {
    const entry = salesMap.get(date) || null;
    return {
      date,
      sales: entry ? entry.sales : 0,
      numOrders: entry ? entry.numOrders : 0,
      shipping: entry ? entry.shipping : 0,
      tax: entry ? entry.tax : 0,
    };
  });

  return { saleData: finalSaleData, totalSales, totalNumOrders };
}

/**
 * Helper to generate YYYY-MM-DD date strings for every day in the range using UTC logic.
 */
function getDateBetween(startDate, endDate) {
  const dates = [];
  const oneDayInMs = 24 * 60 * 60 * 1000;

  let currentDate = new Date(Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()));
  const finalDateOnlyUTC = new Date(Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()));

  while (currentDate.getTime() <= finalDateOnlyUTC.getTime()) {
    const year = currentDate.getUTCFullYear();
    const month = String(currentDate.getUTCMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getUTCDate()).padStart(2, "0");

    const formattedDate = `${year}-${month}-${day}`;
    dates.push(formattedDate);

    currentDate.setTime(currentDate.getTime() + oneDayInMs);
  }

  return dates;
}

// Get Sale Data => /api/v1/admin/get_sales
export const getSales = catchAsyncErrors(async (req, res, next) => {
  if (!req.query.startDate || !req.query.endDate) {
    return next(new ErrorHandler("startDate and endDate query parameters are required", 400));
  }

  const startDate = new Date(req.query.startDate);
  const endDate = new Date(req.query.endDate);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return next(new ErrorHandler("Invalid date format for startDate or endDate", 400));
  }

  startDate.setUTCHours(0, 0, 0, 0);
  endDate.setUTCHours(23, 59, 59, 999);

  const { saleData, totalSales, totalNumOrders } = await getSalesData(startDate, endDate);

  res.status(200).json({
    totalSales,
    totalNumOrders,
    sales: saleData,
  });
});
// ⚠️ DEPRECATED — endpoint นี้ไม่ถูกใช้แล้ว (เก็บไว้ backward-compat)
//    ใช้ attachPaymentProof จาก paymentProofController.js แทน
export const uploadOrderProof = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // เก็บเข้าโฟลเดอร์ shopit/payment_proofs
    const proof = await upload_file(req.file.path, "shopit/payment_proofs");

    // หาคำสั่งซื้อ
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // ✅ ตรวจสิทธิ์: เฉพาะเจ้าของ order เท่านั้น
    if (!req.user || order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to upload proof for this order" });
    }

    // push หลักฐานใหม่เข้า array
    order.paymentProof.push({
      public_id: proof.public_id,
      url: proof.url,
      uploadedAt: new Date(),
    });

    // เปลี่ยนสถานะเป็น AwaitingProof
    order.paymentStatus = "AwaitingProof";

    await order.save();

    res.status(200).json({
      success: true,
      message: "Uploaded",
      proof,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Upload failed" });
  }
};

/**
 * ✅ Cancel order by USER (เจ้าของเท่านั้น) → POST /api/v1/orders/:id/cancel
 *    - อนุญาตให้ยกเลิกได้เฉพาะตอนที่ยังไม่ Shipped
 *    - คืน stock อัตโนมัติ
 *    - บันทึก cancelReason + cancelledAt
 */
export const cancelMyOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate("user", "name email lang");
  if (!order) return next(new ErrorHandler("Order not found", 404));

  // ✅ ตรวจสิทธิ์: เจ้าของเท่านั้น (admin ใช้ updateOrder/updateOrderStatus)
  //    user เป็น populated object หลัง populate — เปรียบเทียบ _id
  const ownerId = order.user?._id?.toString?.() || order.user?.toString?.();
  if (ownerId !== req.user._id.toString()) {
    return next(new ErrorHandler("You are not authorized to cancel this order", 403));
  }

  // ตรวจสถานะ: ยกเลิกได้เฉพาะก่อน Shipped
  const currentStatus = order.fulfillmentStatus || order.status;
  const cancellable = ["Unfulfilled", "Processing"];

  if (!cancellable.includes(currentStatus)) {
    return next(
      new ErrorHandler(
        `ບໍ່ສາມາດຍົກເລີກໄດ້ — ສະຖານະປະຈຸບັນ "${currentStatus}". ກະລຸນາຕິດຕໍ່ຝ່າຍຊ່ວຍເຫຼືອ.`,
        400
      )
    );
  }

  // ห้ามยกเลิกถ้าเงินจ่ายแล้ว (Paid) — ต้อง refund flow ของ admin
  if (order.paymentStatus === "Paid") {
    return next(
      new ErrorHandler(
        "ບໍ່ສາມາດຍົກເລີກອໍເດີທີ່ຈ່າຍເງິນແລ້ວ ກະລຸນາຕິດຕໍ່ຝ່າຍຊ່ວຍເຫຼືອເພື່ອຂໍຄືນເງິນ",
        400
      )
    );
  }

  // ✅ คืน stock + เปลี่ยนสถานะ
  await restoreStockBatch(order.orderItems);

  order.fulfillmentStatus = "Cancelled";
  order.cancelReason = req.body.reason || "ຍົກເລີກໂດຍລູກຄ້າ";
  order.cancelledAt = new Date();

  // ถ้า Pending → mark Rejected เพื่อความชัดเจน (ไม่ใช่ Refunded เพราะยังไม่จ่าย)
  if (order.paymentStatus === "Pending" || order.paymentStatus === "AwaitingProof") {
    order.paymentStatus = "Rejected";
  }

  await order.save();

  // ✅ Send cancellation email + push (fire-and-forget)
  notifyStatusChange(order, "Cancelled", order.cancelReason);
  tryPushNotify(req.user._id, buildOrderPushPayload("cancelled", order._id));

  res.status(200).json({
    success: true,
    message: "ຍົກເລີກອໍເດີສຳເລັດ ສິນຄ້າຄືນສາງແລ້ວ",
    order,
  });
});

/**
 * ✅ Add a custom admin note to the order timeline
 *    POST /api/v1/admin/orders/:id/note
 *    body: { note: string }
 */
export const addOrderNote = catchAsyncErrors(async (req, res, next) => {
  const { note } = req.body;
  if (!note?.trim()) return next(new ErrorHandler("Note text is required", 400));

  const order = await Order.findById(req.params.id);
  if (!order) return next(new ErrorHandler("Order not found", 404));

  // Use $push so the pre-save hook never fires (no status changes)
  const newEvent = {
    type: "note",
    timestamp: new Date(),
    note: note.trim(),
    actor: req.user._id,
  };

  await Order.updateOne({ _id: order._id }, { $push: { events: newEvent } });

  res.status(200).json({ success: true, message: "Note added", event: newEvent });
});

/**
 * ✅ Issue refund for a Paid order — Admin only
 *    POST /api/v1/admin/orders/:id/refund
 *    body: { refundAmount?, refundBank?, refundAccount?, note?, cancelOrder? }
 */
export const issueRefund = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate("user", "name email lang");
  if (!order) return next(new ErrorHandler("Order not found", 404));

  if (order.paymentStatus !== "Paid") {
    return next(
      new ErrorHandler("ສາມາດຄືນເງິນໄດ້ສະເພາະອໍເດີທີ່ຊຳລະແລ້ວ (Paid) ເທົ່ານັ້ນ", 400)
    );
  }

  const {
    refundAmount,
    refundBank = "",
    refundAccount = "",
    note = "",
    cancelOrder = true,
  } = req.body;

  const amount = refundAmount !== undefined ? Number(refundAmount) : order.totalAmount;

  // Mark payment as Refunded
  order.paymentStatus = "Refunded";
  order.refundIssuedAt = new Date();
  order.refundAmount = amount;
  if (refundBank)    order.refundBank    = refundBank;
  if (refundAccount) order.refundAccount = refundAccount;

  // Cancel order + restore stock unless already Delivered/Cancelled
  if (cancelOrder) {
    const currentStatus = order.fulfillmentStatus;
    if (currentStatus !== "Delivered" && currentStatus !== "Cancelled") {
      await restoreStockBatch(order.orderItems);
    }
    if (currentStatus !== "Cancelled") {
      order.fulfillmentStatus = "Cancelled";
      order.cancelReason      = note || "ຄືນເງິນໂດຍ admin";
      order.cancelledAt       = new Date();
    }
  }

  await order.save(); // pre-save hook auto-appends 'refunded' + 'cancelled' events

  // Fire-and-forget refund email + push
  tryNotifyOrder({
    to:     order.user?.email,
    order:  order.toObject ? order.toObject() : order,
    action: "refunded",
    lang:   order.user?.lang || "la",
    note,
  });
  tryPushNotify(order.user?._id || order.user, buildOrderPushPayload("refunded", order._id));

  res.status(200).json({
    success:       true,
    message:       "ຄືນເງິນສຳເລັດ",
    refundAmount:  amount,
    refundIssuedAt: order.refundIssuedAt,
  });
});

// backend/controllers/orderController.js
// ✅ Endpoint นี้รองรับทั้ง fulfillmentStatus (ใหม่) และ orderStatus + shipmentStatus (เก่า)
//    — pre-save hook จะ sync ทั้ง 3 ฟิลด์ให้สอดคล้องกัน
export const updateOrderStatus = catchAsyncErrors(async (req, res, next) => {
  const { orderStatus, shipmentStatus, fulfillmentStatus, trackingCode } = req.body;
  const order = await Order.findById(req.params.id).populate("user", "name email lang");
  if (!order) return next(new ErrorHandler("Order not found", 404));

  const currentStatus = order.fulfillmentStatus || order.status;

  // 🔒 Lock: Delivered ແລະ Cancelled ແກ້ໄຂສະຖານະຕໍ່ບໍ່ໄດ້
  if (currentStatus === "Delivered") {
    return next(new ErrorHandler("ອໍເດີນີ້ຈັດສົ່ງສຳເລັດແລ້ວ — ບໍ່ສາມາດແກ້ໄຂສະຖານະໄດ້", 400));
  }
  if (currentStatus === "Cancelled") {
    return next(new ErrorHandler("ອໍເດີນີ້ຖືກຍົກເລີກແລ້ວ — ບໍ່ສາມາດແກ້ໄຂສະຖານະໄດ້", 400));
  }

  // ตัดสินใจ status ใหม่ที่จะใช้ (priority: fulfillmentStatus > orderStatus > derive)
  let newStatus = fulfillmentStatus || null;
  if (!newStatus && orderStatus) {
    newStatus = orderStatus; // legacy
  }

  const isBecomingCancelled =
    newStatus === "Cancelled" && currentStatus !== "Cancelled";

  // ✅ ใช้ fulfillmentStatus เป็นหลัก — pre-save hook sync ฟิลด์อื่นเอง
  if (newStatus) {
    order.fulfillmentStatus = newStatus;
    if (newStatus === "Shipped") order.shippedAt = order.shippedAt || new Date();
    if (newStatus === "Delivered") order.deliveredAt = order.deliveredAt || new Date();
  }
  // กรณีส่งแค่ shipmentStatus (legacy) — pre-save hook จะ derive fulfillmentStatus
  else if (shipmentStatus) {
    order.shipmentStatus = shipmentStatus;
    if (shipmentStatus === "shipped") order.shippedAt = order.shippedAt || new Date();
    if (shipmentStatus === "delivered") order.deliveredAt = order.deliveredAt || new Date();
  }

  if (trackingCode) order.trackingCode = trackingCode;

  if (isBecomingCancelled) {
    await restoreStockBatch(order.orderItems);
    order.cancelledAt = new Date();
  }

  await order.save();

  // ✅ Send email + push notification (fire-and-forget)
  if (newStatus) {
    notifyStatusChange(order, newStatus);
    const pushAction = { Shipped: "shipped", Delivered: "delivered", Cancelled: "cancelled" }[newStatus];
    if (pushAction) tryPushNotify(order.user?._id || order.user, buildOrderPushPayload(pushAction, order._id));
  }

  res.status(200).json({ success: true, order });
});

// Public: Track order by tracking code => GET /api/v1/track/:code
export const trackOrderByCode = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findOne({ trackingCode: req.params.code });
  if (!order) return next(new ErrorHandler("ບໍ່ພົບລະຫັດພັດດຸນີ້", 404));

  res.status(200).json({
    success: true,
    tracking: {
      trackingCode: order.trackingCode,
      status: order.fulfillmentStatus || order.orderStatus,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      events: (order.events || []).map((e) => ({
        type: e.type, timestamp: e.timestamp, note: e.note,
      })),
    },
  });
});
