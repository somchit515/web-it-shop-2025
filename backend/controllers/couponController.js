// backend/controllers/couponController.js
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import Coupon from "../models/coupon.js";

// ════════════════════════════════════════════════════
// 🟢 USER ENDPOINTS
// ════════════════════════════════════════════════════

/**
 * Validate coupon code → returns discount preview
 * POST /api/v1/coupons/validate
 * body: { code, itemsPrice }
 */
export const validateCoupon = catchAsyncErrors(async (req, res, next) => {
  const { code, itemsPrice } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, message: "Coupon code required" });
  }

  const result = await Coupon.validateForOrder({
    code,
    userId: req.user?._id,
    itemsPrice: Number(itemsPrice) || 0,
  });

  if (!result.valid) {
    const messages = {
      not_found: "ບໍ່ພົບລະຫັດສ່ວນຫຼຸດ",
      inactive: "ລະຫັດສ່ວນຫຼຸດຖືກປິດໃຊ້ງານ",
      not_started: "ລະຫັດສ່ວນຫຼຸດຍັງບໍ່ເລີ່ມໃຊ້",
      expired: "ລະຫັດສ່ວນຫຼຸດໝົດອາຍຸແລ້ວ",
      limit_reached: "ລະຫັດສ່ວນຫຼຸດຖືກໃຊ້ໝົດແລ້ວ",
      user_limit_reached: "ທ່ານໃຊ້ລະຫັດນີ້ຄົບຈຳນວນແລ້ວ",
      min_amount_not_met: `ຍອດສິນຄ້າຕ້ອງຢ່າງໜ້ອຍ ${result.minOrderAmount?.toLocaleString()} ກີບ`,
      missing_code: "ບໍ່ມີລະຫັດສ່ວນຫຼຸດ",
    };
    return res.status(400).json({
      success: false,
      valid: false,
      reason: result.reason,
      message: messages[result.reason] || "ລະຫັດສ່ວນຫຼຸດໃຊ້ບໍ່ໄດ້",
    });
  }

  return res.status(200).json({
    success: true,
    valid: true,
    coupon: {
      code: result.coupon.code,
      type: result.coupon.type,
      value: result.coupon.value,
      description: result.coupon.description,
    },
    discountAmount: result.discountAmount,
  });
});

// ════════════════════════════════════════════════════
// 🔴 ADMIN ENDPOINTS
// ════════════════════════════════════════════════════

/**
 * Create coupon — admin only
 * POST /api/v1/admin/coupons
 */
export const createCoupon = catchAsyncErrors(async (req, res, next) => {
  const {
    code,
    description,
    type,
    value,
    minOrderAmount,
    maxDiscount,
    usageLimit,
    perUserLimit,
    validFrom,
    validUntil,
    active,
  } = req.body;

  if (!code || !type || value === undefined) {
    return next(new ErrorHandler("code, type, value are required", 400));
  }

  if (!["percentage", "fixed"].includes(type)) {
    return next(new ErrorHandler("type must be 'percentage' or 'fixed'", 400));
  }

  if (type === "percentage" && (value <= 0 || value > 100)) {
    return next(new ErrorHandler("Percentage value must be 1-100", 400));
  }

  try {
    const coupon = await Coupon.create({
      code: String(code).trim().toUpperCase(),
      description: description || "",
      type,
      value: Number(value),
      minOrderAmount: Number(minOrderAmount) || 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      usageLimit: usageLimit ? Number(usageLimit) : null,
      perUserLimit: Number(perUserLimit) || 1,
      validFrom: validFrom ? new Date(validFrom) : new Date(),
      validUntil: validUntil ? new Date(validUntil) : null,
      active: active !== false,
      createdBy: req.user?._id,
    });

    res.status(201).json({ success: true, coupon });
  } catch (err) {
    if (err.code === 11000) {
      return next(new ErrorHandler(`Coupon code "${code}" already exists`, 409));
    }
    throw err;
  }
});

/**
 * List all coupons — admin
 * GET /api/v1/admin/coupons
 */
export const listCoupons = catchAsyncErrors(async (req, res, next) => {
  const { active, q } = req.query;
  const filter = {};

  if (active === "true") filter.active = true;
  if (active === "false") filter.active = false;
  if (q) {
    const safe = String(q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.code = new RegExp(safe, "i");
  }

  const coupons = await Coupon.find(filter)
    .sort({ createdAt: -1 })
    .select("-usedBy"); // ลด payload — รายละเอียดดูใน detail endpoint

  res.status(200).json({ success: true, coupons });
});

/**
 * Get single coupon — admin
 * GET /api/v1/admin/coupons/:id
 */
export const getCouponDetails = catchAsyncErrors(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id).populate("usedBy.user", "name email");
  if (!coupon) return next(new ErrorHandler("Coupon not found", 404));
  res.status(200).json({ success: true, coupon });
});

/**
 * Update coupon — admin
 * PUT /api/v1/admin/coupons/:id
 */
export const updateCoupon = catchAsyncErrors(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) return next(new ErrorHandler("Coupon not found", 404));

  const allowed = [
    "description", "type", "value", "minOrderAmount", "maxDiscount",
    "usageLimit", "perUserLimit", "validFrom", "validUntil", "active",
  ];
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) {
      coupon[key] = req.body[key];
    }
  });

  await coupon.save();
  res.status(200).json({ success: true, coupon });
});

/**
 * Delete coupon — admin
 * DELETE /api/v1/admin/coupons/:id
 */
export const deleteCoupon = catchAsyncErrors(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) return next(new ErrorHandler("Coupon not found", 404));
  await coupon.deleteOne();
  res.status(200).json({ success: true, message: "Coupon deleted" });
});
