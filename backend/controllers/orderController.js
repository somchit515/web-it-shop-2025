// controllers/orderController.js
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Order from "../models/orders.js";
import Product from "../models/product.js";
import ErrorHandler from "../utils/errorHandler.js";
import { sendOrderEmail } from "../utils/mailer.js"; // ปรับ path ถ้าจำเป็น

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
});

// Get current user orders => /api/v1/me/orders
export const myOrder = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id });

  if (!orders || orders.length === 0) {
    return next(new ErrorHandler("No orders found for this user", 404));
  }

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

  res.status(200).json({
    success: true,
    order,
  });
});

// Get All orders => /api/v1/admin/orders
export const allOrder = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find();

  // เปลี่ยนให้คืน empty array แทน 404 — ปลอดภัยกว่าสำหรับ admin endpoint
  res.status(200).json({
    success: true,
    orders: orders || [],
  });
});

/**
 * Atomic stock update using $inc to avoid race conditions.
 * Ensures stock does not go negative by checking condition in query.
 * If product missing or not enough stock, logs a warning.
 */
async function updateStockAtomic(productId, quantity) {
  if (!productId) return;

  const qty = Number(quantity || 0);
  if (qty <= 0) return;

  // Try to decrement stock only if enough stock exists
  const updated = await Product.findOneAndUpdate(
    { _id: productId, stock: { $gte: qty } },
    { $inc: { stock: -qty } },
    { new: true }
  );

  if (!updated) {
    // Could be missing product or insufficient stock
    const exists = await Product.exists({ _id: productId });
    if (!exists) {
      console.warn(`updateStockAtomic: product not found ${productId}`);
    } else {
      console.warn(`updateStockAtomic: insufficient stock for product ${productId} (decrement ${qty})`);
    }
  }
}

// Get Update orders - Admin => /api/v1/admin/orders/:id
export const updateOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("No Order Found With This ID", 404));
  }

  // Validate requested status
  const newStatus = req.body.status;
  if (!newStatus) {
    return next(new ErrorHandler("No status provided", 400));
  }

  if (order.orderStatus === "Delivered") {
    return next(new ErrorHandler("You have already Delivered this order", 400));
  }

  // If changing to Delivered, update stock (atomic)
  if (newStatus === "Delivered" && order.orderStatus !== "Delivered") {
    for (const item of order.orderItems) {
      // item.product may be ObjectId, ensure string id
      await updateStockAtomic(String(item.product), item.quantity);
    }
    order.deliveredAt = Date.now();
  }

  // Update order status
  order.orderStatus = newStatus;

  await order.save();

  res.status(200).json({
    success: true,
  });
});

// Confirm Payment / Approve Order (Admin)
// PUT /api/v1/admin/orders/:id/confirm
export const confirmOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate("user", "name email lang");

  if (!order) {
    return next(new ErrorHandler("No Order Found With This ID", 404));
  }

  if (order.orderStatus === "Delivered") {
    return next(new ErrorHandler("This order has already been delivered", 400));
  }

  // Mark paid
  order.isPaid = true;
  order.paidAt = Date.now();

  // Merge/override paymentInfo if provided
  order.paymentInfo = Object.assign({}, order.paymentInfo || {}, {
    status: req.body.paymentStatus || "succeeded",
    method: req.body.paymentMethod || order.paymentMethod || "manual",
    transactionId: req.body.transactionId || (order.paymentInfo && order.paymentInfo.transactionId) || null,
  });

  // Optionally record who confirmed (if you have schema field confirmedBy)
  if (req.user && req.user._id) {
    order.confirmedBy = req.user._id;
  }

  // Set orderStatus (default Processing)
  order.orderStatus = req.body.orderStatus || "Processing";

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

  await order.deleteOne();

  res.status(200).json({
    success: true,
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

// backend/controllers/orderController.js
export const updateOrderStatus = catchAsyncErrors(async (req, res, next) => {
  const { orderStatus, shipmentStatus, trackingCode } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return next(new ErrorHandler("Order not found", 404));

  if (orderStatus) order.orderStatus = orderStatus;
  if (shipmentStatus) {
    order.shipmentStatus = shipmentStatus;
    if (shipmentStatus === "shipped") order.shippedAt = new Date();
    if (shipmentStatus === "delivered") order.deliveredAt = new Date();
  }
  if (trackingCode) order.trackingCode = trackingCode;

  await order.save();
  res.status(200).json({ success: true, order });
});
