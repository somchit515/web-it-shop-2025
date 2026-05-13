// backend/models/coupon.js
import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      index: true,
    },
    description: { type: String, default: "" },

    // ✅ ประเภทส่วนลด
    type: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    // ค่าส่วนลด: ถ้า percentage = % (1-100), ถ้า fixed = จำนวนกีบ
    value: {
      type: Number,
      required: true,
      min: 0,
    },

    // ✅ Limits
    minOrderAmount: { type: Number, default: 0 },   // ยอดสินค้าขั้นต่ำ
    maxDiscount: { type: Number, default: null },   // เพดานส่วนลด (เฉพาะ %)

    usageLimit: { type: Number, default: null },    // จำกัดการใช้รวม (null = unlimited)
    usageCount: { type: Number, default: 0 },
    perUserLimit: { type: Number, default: 1 },     // ต่อ user ใช้ได้กี่ครั้ง

    // ✅ Validity
    validFrom: { type: Date, default: Date.now },
    validUntil: { type: Date, default: null },      // null = ไม่หมดอายุ
    active: { type: Boolean, default: true, index: true },

    // ✅ Tracking
    usedBy: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
        usedAt: { type: Date, default: Date.now },
        discountAmount: Number,
      },
    ],

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

/**
 * ✅ Validate coupon for a given user + order subtotal
 * Returns: { valid: bool, reason?: string, discountAmount?: number, coupon?: doc }
 */
couponSchema.statics.validateForOrder = async function ({
  code,
  userId,
  itemsPrice,
}) {
  if (!code) return { valid: false, reason: "missing_code" };

  const coupon = await this.findOne({ code: String(code).trim().toUpperCase() });
  if (!coupon) return { valid: false, reason: "not_found" };

  // Active?
  if (!coupon.active) return { valid: false, reason: "inactive" };

  // Validity dates
  const now = new Date();
  if (coupon.validFrom && coupon.validFrom > now) {
    return { valid: false, reason: "not_started" };
  }
  if (coupon.validUntil && coupon.validUntil < now) {
    return { valid: false, reason: "expired" };
  }

  // Global usage limit
  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
    return { valid: false, reason: "limit_reached" };
  }

  // Per-user limit
  if (userId && coupon.perUserLimit) {
    const userUses = coupon.usedBy.filter(
      (u) => u.user?.toString() === String(userId)
    ).length;
    if (userUses >= coupon.perUserLimit) {
      return { valid: false, reason: "user_limit_reached" };
    }
  }

  // Minimum order amount
  if (coupon.minOrderAmount > 0 && Number(itemsPrice) < coupon.minOrderAmount) {
    return {
      valid: false,
      reason: "min_amount_not_met",
      minOrderAmount: coupon.minOrderAmount,
    };
  }

  // ✅ Calculate discount
  let discountAmount = 0;
  if (coupon.type === "percentage") {
    discountAmount = Math.round((Number(itemsPrice) * coupon.value) / 100);
    if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }
  } else {
    // fixed
    discountAmount = Math.min(coupon.value, Number(itemsPrice));
  }

  return {
    valid: true,
    discountAmount,
    coupon,
  };
};

export default mongoose.model("Coupon", couponSchema);
