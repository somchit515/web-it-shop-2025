// backend/controllers/paymentController.js
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import Order from "../models/orders.js";
import {
  validateStock,
  decrementStockBatch,
  restoreStockBatch,
} from "../utils/stockManager.js";
import { expectedShippingFee } from "../utils/shippingRates.js";
import { tryNotifyOrder } from "../utils/mailer.js";
import { releaseExpiredBankOrders } from "../utils/orderCleanup.js";
import Coupon from "../models/coupon.js";

/**
 * StripecheckoutSession
 * - Creates an order record for COD or BankTransfer.
 * - If you later want Stripe Checkout, you can extend this or create a separate flow.
 */
export const StripecheckoutSession = catchAsyncErrors(async (req, res, next) => {
  if (!req.user) {
    return next(new ErrorHandler("User not authenticated.", 401));
  }

  const body = req.body || {};

  if (!body.orderItems || !Array.isArray(body.orderItems) || body.orderItems.length === 0) {
    return next(new ErrorHandler("Order items missing", 400));
  }

  const paymentMethod = body.paymentMethod || "COD"; // default COD

  // Validate paymentMethod ก่อนเริ่มงานหนัก
  if (!["COD", "BankTransfer", "PayAtStore"].includes(paymentMethod)) {
    return next(new ErrorHandler("Invalid payment method.", 400));
  }

  // ✅ STEP 0: Idempotency check — ป้องกัน double-click + retry
  //    รับ key จาก header (มาตรฐาน) หรือ body (fallback)
  const idempotencyKey =
    req.headers["idempotency-key"] || req.headers["Idempotency-Key"] || body.idempotencyKey || null;

  if (idempotencyKey) {
    // กรอง user ด้วยเพื่อให้แต่ละ user มี keyspace ของตัวเอง (ปลอดภัยกว่า)
    const existing = await Order.findOne({
      idempotencyKey,
      user: req.user._id,
    });
    if (existing) {
      // ⚡ Return order เดิม — ไม่สร้างซ้ำ ไม่หัก stock ซ้ำ
      console.log(`Idempotent replay: returning existing order ${existing._id} for key ${idempotencyKey}`);
      return res.status(200).json({
        success: true,
        idempotent: true, // ส่งให้ frontend รู้ว่าเป็น replay
        message: "Order already exists for this idempotency key.",
        orderId: existing._id,
        order: existing,
        paymentInstructions:
          existing.paymentMethod === "BankTransfer"
            ? {
                bankName: process.env.BANK_NAME || null,
                accountNumber: process.env.BANK_ACCOUNT_NUMBER || null,
                accountName: process.env.BANK_ACCOUNT_NAME || null,
              }
            : undefined,
      });
    }
  }

  // prepare orderItems (validate basic fields)
  const orderItems = body.orderItems.map(i => ({
    name: i.name,
    quantity: Number(i.quantity) || 1,
    image: i.image || "/images/default_product.png",
    price: Number(i.price) || 0,
    product: i.product,
  }));

  // ✅ STEP 0.5: Lazy cleanup — ໃຫ້ 2 ວິ restore stock ກ່ອນ validate, ຫຼັງຈາກນັ້ນ non-blocking
  await Promise.race([
    releaseExpiredBankOrders(),
    new Promise((r) => setTimeout(r, 2000)),
  ]).catch((err) => console.error("[checkout] lazy cleanup failed:", err.message));

  // ✅ STEP 1: ตรวจสอบว่า stock ของทุกสินค้ามีพอหรือไม่ (pre-flight check)
  const validation = await validateStock(orderItems);
  if (!validation.ok) {
    // สร้าง message ที่อ่านง่าย พร้อมรายละเอียดเพื่อให้ frontend แสดงได้
    const lines = validation.errors.map((e) => {
      if (e.reason === "insufficient_stock") {
        return `"${e.name}": ขอ ${e.requested} แต่เหลือ ${e.available}`;
      }
      if (e.reason === "product_not_found") {
        return `"${e.name}": ไม่พบสินค้า`;
      }
      return `"${e.name}": ${e.reason}`;
    });
    return res.status(409).json({
      success: false,
      message: `ສິນຄ້າບໍ່ພຽງພໍ:\n${lines.join("\n")}`,
      errors: validation.errors,
    });
  }

  // ✅ STEP 2: หัก stock แบบ atomic + rollback ถ้าล้มเหลว
  const decrementResult = await decrementStockBatch(orderItems);
  if (!decrementResult.ok) {
    // มีคนซื้อตัดหน้าระหว่าง validate กับ decrement (race condition)
    return res.status(409).json({
      success: false,
      message: `ສິນຄ້າ "${decrementResult.error.name}" ບໍ່ພຽງພໍ (ເຫຼືອ ${decrementResult.error.available}, ຕ້ອງການ ${decrementResult.error.requested})`,
      error: decrementResult.error,
    });
  }

  // ✅ STEP 3: Server-side recalculate (ป้องกัน user แก้ไข shippingAmount)
  const itemsPriceCalc = orderItems.reduce((s, it) => s + it.price * it.quantity, 0);
  const carrierCode = body.shippingInfo?.shippingCarrierCode;
  const expectedFee = expectedShippingFee(carrierCode, itemsPriceCalc);
  const sentFee = Number(body.shippingAmount) || 0;

  if (Math.abs(sentFee - expectedFee) > 1) {
    console.warn(
      `Shipping fee mismatch — carrier: ${carrierCode}, expected: ${expectedFee}, got: ${sentFee} → using expected`
    );
  }
  const finalShipping = expectedFee;

  // ✅ STEP 3.5: Validate + apply coupon (server-side — ห้ามเชื่อ frontend)
  let appliedCoupon = null;
  let discountAmount = 0;
  if (body.couponCode) {
    const result = await Coupon.validateForOrder({
      code: body.couponCode,
      userId: req.user._id,
      itemsPrice: itemsPriceCalc,
    });
    if (!result.valid) {
      return res.status(400).json({
        success: false,
        message: `ລະຫັດສ່ວນຫຼຸດໃຊ້ບໍ່ໄດ້: ${result.reason}`,
        couponError: result.reason,
      });
    }
    appliedCoupon = result.coupon;
    discountAmount = result.discountAmount;
  }

  const finalTotal = itemsPriceCalc + finalShipping - discountAmount;

  // STEP 4: สร้าง order — ถ้าสร้างไม่สำเร็จ → คืน stock
  const baseData = {
    shippingInfo: body.shippingInfo || {},
    user: req.user._id,
    orderItems,
    itemsPrice: itemsPriceCalc,
    taxAmount: Number(body.taxAmount) || 0,
    shippingAmount: finalShipping,
    totalAmount: finalTotal,
    fulfillmentStatus: "Unfulfilled",
    // ✅ Coupon info
    ...(appliedCoupon && {
      couponCode: appliedCoupon.code,
      discountAmount,
    }),
    ...(idempotencyKey && { idempotencyKey }),
  };

  let order;
  try {
    if (paymentMethod === "COD") {
      order = await Order.create({
        ...baseData,
        paymentMethod: "COD",
        paymentStatus: "Pending",
      });
    } else if (paymentMethod === "BankTransfer") {
      order = await Order.create({
        ...baseData,
        paymentMethod: "BankTransfer",
        paymentStatus: "AwaitingProof",
      });
    } else if (paymentMethod === "PayAtStore") {
      order = await Order.create({
        ...baseData,
        paymentMethod: "PayAtStore",
        paymentStatus: "Pending",
      });
    }

    // ✅ Mark coupon as used (after order create success)
    if (appliedCoupon && order) {
      try {
        appliedCoupon.usageCount += 1;
        appliedCoupon.usedBy.push({
          user: req.user._id,
          order: order._id,
          usedAt: new Date(),
          discountAmount,
        });
        await appliedCoupon.save();
      } catch (err) {
        console.error("Failed to mark coupon used:", err.message);
        // ไม่ block — order ถูกสร้างแล้ว
      }
    }

    // ✅ ส่ง receipt email — fire-and-forget (ไม่บล็อก response)
    const userEmail = req.user.email;
    if (order && userEmail) {
      // populate user info ให้ email template (ไม่ต้อง await — template ก็รับ user.name จาก req.user ได้)
      tryNotifyOrder({
        to: userEmail,
        order: {
          ...order.toObject(),
          user: { name: req.user.name, email: userEmail },
        },
        action: "created",
        lang: req.user.lang || "la",
      });
    }

    // Response
    if (paymentMethod === "COD" || paymentMethod === "PayAtStore") {
      return res.status(201).json({
        success: true,
        message: paymentMethod === "PayAtStore"
          ? "PayAtStore order created. Please pay at the store."
          : "COD Order created successfully.",
        orderId: order._id,
        order,
      });
    }
    return res.status(201).json({
      success: true,
      message: "BankTransfer order created. Please upload payment slip.",
      orderId: order._id,
      paymentInstructions: {
        bankName: process.env.BANK_NAME || null,
        accountNumber: process.env.BANK_ACCOUNT_NUMBER || null,
        accountName: process.env.BANK_ACCOUNT_NAME || null,
      },
      order,
    });
  } catch (err) {
    // ✅ Duplicate idempotencyKey (race condition) — คืน order ที่มีอยู่
    if (err.code === 11000 && err.keyPattern?.idempotencyKey) {
      console.warn(`Race condition on idempotency key ${idempotencyKey} — returning existing order`);
      // คืน stock เพราะเรา decrement ไปแล้วแต่ไม่ได้สร้าง order (อีก request สร้างไปแทน)
      await restoreStockBatch(orderItems);
      const existing = await Order.findOne({
        idempotencyKey,
        user: req.user._id,
      });
      if (existing) {
        return res.status(200).json({
          success: true,
          idempotent: true,
          message: "Order already exists for this idempotency key.",
          orderId: existing._id,
          order: existing,
        });
      }
    }

    // ✅ Rollback stock ถ้า Order.create() ล้มเหลวด้วยเหตุอื่น
    console.error("Order.create failed, restoring stock:", err.message);
    await restoreStockBatch(orderItems);
    return next(new ErrorHandler(`Failed to create order: ${err.message}`, 500));
  }
});

/**
 * stripeWebhook
 * - If STRIPE_WEBHOOK_SECRET configured and stripe package is installed, will try to validate signature.
 * - If stripe package is not installed or no secret provided, it just acknowledges.
 *
 * IMPORTANT:
 * - When using Stripe signature verification you MUST mount this route with express.raw()
 *   in index.js: app.post('/api/v1/payment/webhook', express.raw({ type: 'application/json' }), stripeWebhook)
 */
export const stripeWebhook = catchAsyncErrors(async (req, res, next) => {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    // If no webhook secret configured, acknowledge and return
    if (!webhookSecret || !stripeSecretKey) {
      // Optionally: log minimal info
      console.log("stripeWebhook: STRIPE_WEBHOOK_SECRET or STRIPE_SECRET_KEY not configured. Ack only.");
      return res.status(200).json({ received: true, message: "No Stripe webhook secret configured." });
    }

    // Try dynamic import of stripe to avoid module-not-found if not installed
    let Stripe;
    try {
      const stripeModule = await import("stripe");
      Stripe = stripeModule.default || stripeModule;
    } catch (err) {
      console.error("stripe package not installed. Install `stripe` to enable webhook signature verification.");
      return res.status(500).json({ success: false, message: "Stripe SDK missing on server." });
    }

    const stripe = new Stripe(stripeSecretKey);

    const sig = req.headers["stripe-signature"];
    if (!sig) {
      return res.status(400).send("Missing stripe-signature header");
    }

    // IMPORTANT: ensure req.rawBody exists because express.json() will break signature verification
    const payload = req.rawBody || req.body;

    let event;
    try {
      event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
    } catch (err) {
      console.error("Stripe webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle events (example: checkout.session.completed)
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      console.log("Stripe checkout.session.completed", session.id);
      // TODO: create order / mark paid / store paymentInfo if desired
    }

    // Acknowledge
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("stripeWebhook error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});
