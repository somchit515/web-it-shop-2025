// backend/controllers/paymentController.js
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import Order from "../models/orders.js";

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

  // prepare orderItems (validate basic fields)
  const orderItems = body.orderItems.map(i => ({
    name: i.name,
    quantity: Number(i.quantity) || 1,
    image: i.image || "",
    price: Number(i.price) || 0,
    product: i.product,
  }));

  const baseData = {
    shippingInfo: body.shippingInfo || {},
    user: req.user._id,
    orderItems,
    itemsPrice: Number(body.itemsPrice) || orderItems.reduce((s, it) => s + (it.price * it.quantity), 0),
    taxAmount: Number(body.taxAmount) || 0,
    shippingAmount: Number(body.shippingAmount) || 0,
    totalAmount: Number(body.totalAmount) || 0,
    orderStatus: "Processing",
  };

  // CASE: COD
  if (paymentMethod === "COD") {
    const order = await Order.create({
      ...baseData,
      paymentMethod: "COD",
      paymentStatus: "Pending", // awaiting cash collection
    });

    return res.status(201).json({
      success: true,
      message: "COD Order created successfully.",
      orderId: order._id,
      order,
    });
  }

  // CASE: BankTransfer / QR
  if (paymentMethod === "BankTransfer") {
    const order = await Order.create({
      ...baseData,
      paymentMethod: "BankTransfer",
      paymentStatus: "AwaitingProof",
    });

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
  }

  // Fallback: unsupported method
  return next(new ErrorHandler("Invalid payment method.", 400));
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
