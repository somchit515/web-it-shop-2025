// backend/models/orders.js
import mongoose from "mongoose";

/**
 * ✅ State Model — แยก 2 มิติชัดเจน:
 *
 * 1. paymentStatus    — สถานะการเงิน (ลูกค้าจ่ายแล้วยัง?)
 * 2. fulfillmentStatus — สถานะการเตรียม/ส่งของ (อยู่ไหนใน pipeline?)
 *
 * fulfillmentStatus เป็น single source of truth ที่จะใช้ต่อไป
 * orderStatus + shipmentStatus เก็บไว้สำหรับ backward compatibility
 * และ pre-save hook จะ sync ทั้ง 3 ฟิลด์ให้สอดคล้องกันเสมอ
 */

// Mapping ระหว่าง 3 ฟิลด์ (ใช้ใน pre-save hook + helper)
const FULFILLMENT_TO_LEGACY = {
  Unfulfilled: { orderStatus: "Processing", shipmentStatus: "pending" },
  Processing:  { orderStatus: "Processing", shipmentStatus: "processing" },
  Shipped:     { orderStatus: "Shipped",    shipmentStatus: "shipped" },
  Delivered:   { orderStatus: "Delivered",  shipmentStatus: "delivered" },
  Cancelled:   { orderStatus: "Cancelled",  shipmentStatus: "pending" },
  Returned:    { orderStatus: "Returned",   shipmentStatus: "returned" },
};

/**
 * Derive fulfillmentStatus จาก orderStatus + shipmentStatus
 * ใช้สำหรับ orders เก่าที่ยังไม่มี fulfillmentStatus
 */
export function deriveFulfillmentStatus(orderStatus, shipmentStatus) {
  // Cancelled / Returned ที่ orderStatus ระบุชัด → ใช้เลย
  if (orderStatus === "Cancelled") return "Cancelled";
  if (orderStatus === "Returned") return "Returned";

  // ใช้ shipmentStatus เป็นหลักเพราะละเอียดกว่า
  if (shipmentStatus === "delivered") return "Delivered";
  if (shipmentStatus === "shipped") return "Shipped";
  if (shipmentStatus === "returned") return "Returned";
  if (shipmentStatus === "processing") return "Processing";

  // pending → ตาม orderStatus
  if (orderStatus === "Delivered") return "Delivered";
  if (orderStatus === "Shipped") return "Shipped";

  return "Unfulfilled";
}

const orderSchema = new mongoose.Schema(
  {
    shippingInfo: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      phoneNo: { type: String, required: true },
      zipCode: { type: String, required: false },
      country: { type: String, required: true },
      branch: { type: String, required: false },

      // ✅ ผู้ให้บริการขนส่งที่ลูกค้าเลือก (admin ใช้ในการจัดส่ง)
      shippingCarrier: { type: String, required: false },      // ชื่อ
      shippingCarrierCode: { type: String, required: false },  // code (ANUSIT/MAISAY/UNITED/PICKUP)
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
      index: true,
    },

    orderItems: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        product: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Product" },
      },
    ],

    paymentMethod: {
      type: String,
      required: [true, "Please select payment method"],
      enum: { values: ["COD", "BankTransfer"], message: "Please select COD or BankTransfer" },
      default: "COD",
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "AwaitingProof", "Paid", "Rejected", "Refunded"],
      default: "Pending",
    },

    paymentProof: [
      {
        url: String,
        public_id: String,
        uploadedAt: Date,
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],

    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    verifiedAt: Date,
    verificationNote: String,

    paymentInfo: {
      id: String,
      status: String,
    },

    itemsPrice: { type: Number, required: true },
    taxAmount: { type: Number, required: true },
    shippingAmount: { type: Number, required: true },
    totalAmount: { type: Number, required: true },

    // ✅ Coupon / Discount
    couponCode: { type: String, default: null },
    discountAmount: { type: Number, default: 0 },

    /* --------- ✅ NEW: Single source of truth --------- */
    fulfillmentStatus: {
      type: String,
      enum: ["Unfulfilled", "Processing", "Shipped", "Delivered", "Cancelled", "Returned"],
      default: "Unfulfilled",
      index: true,
    },

    /* --------- 🔁 LEGACY (auto-synced from fulfillmentStatus) ---------
       เก็บไว้สำหรับ backward compat กับ frontend เก่า / รายงานเก่า */
    orderStatus: {
      type: String,
      enum: { values: ["Processing", "Shipped", "Delivered", "Cancelled", "Returned"], message: "Please select a correct order status" },
      default: "Processing",
    },

    shipmentStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "returned"],
      default: "pending",
    },

    trackingCode: String,
    shippedAt: Date,
    deliveredAt: Date,

    /* --------- ยกเลิก / คืน --------- */
    cancelReason: String,
    returnReason: String,
    cancelledAt: Date,
    refundIssuedAt: Date,
    refundAmount: Number,
    refundBank: String,
    refundAccount: String,

    /* --------- ✅ Idempotency --------- */
    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    /* --------- ✅ Order Events (Timeline) ---------
       บันทึก lifecycle ของ order — auto-populate ผ่าน pre-save hook
       type: 'created' | 'payment_confirmed' | 'payment_rejected' |
             'shipped' | 'delivered' | 'cancelled' | 'returned' | 'note'
    */
    events: [
      {
        type: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        note: { type: String, default: "" },
        actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
  },
  { timestamps: true }
);

/* ------- Indexes ------- */
orderSchema.index({ user: 1, fulfillmentStatus: 1 });
orderSchema.index({ paymentStatus: 1 });

/* ------- ✅ Pre-save hook: bidirectional sync + event tracking ------- */
orderSchema.pre("save", function (next) {
  // === Status sync (ของเดิม) ===
  if (this.isModified("fulfillmentStatus")) {
    const m = FULFILLMENT_TO_LEGACY[this.fulfillmentStatus];
    if (m) {
      this.orderStatus = m.orderStatus;
      this.shipmentStatus = m.shipmentStatus;
    }
  } else if (this.isModified("orderStatus") || this.isModified("shipmentStatus")) {
    const derived = deriveFulfillmentStatus(this.orderStatus, this.shipmentStatus);
    this.fulfillmentStatus = derived;
    const m = FULFILLMENT_TO_LEGACY[derived];
    if (m) {
      this.orderStatus = m.orderStatus;
      this.shipmentStatus = m.shipmentStatus;
    }
  } else if (this.isNew) {
    const m = FULFILLMENT_TO_LEGACY[this.fulfillmentStatus || "Unfulfilled"];
    if (m) {
      this.orderStatus = m.orderStatus;
      this.shipmentStatus = m.shipmentStatus;
    }
  }

  // === ✅ Event tracking — auto-append events on status changes ===
  if (!this.events) this.events = [];
  const pushEvent = (type, note = "") => {
    this.events.push({ type, timestamp: new Date(), note });
  };

  // 1. Order created
  if (this.isNew) {
    pushEvent(
      "created",
      `ສ້າງອໍເດີ — ວິທີຊຳລະ ${this.paymentMethod === "COD" ? "ເງິນສົດ (COD)" : "ໂອນເງິນ"}`
    );
  }

  // 2. Payment status changes
  if (!this.isNew && this.isModified("paymentStatus")) {
    if (this.paymentStatus === "Paid") {
      pushEvent("payment_confirmed", "ຢືນຢັນການຊຳລະເງິນສຳເລັດ");
    } else if (this.paymentStatus === "Rejected") {
      pushEvent("payment_rejected", "ປະຕິເສດການຊຳລະເງິນ");
    } else if (this.paymentStatus === "Refunded") {
      pushEvent("refunded", "ຄືນເງິນແລ້ວ");
    }
  }

  // 3. Fulfillment status changes
  if (!this.isNew && this.isModified("fulfillmentStatus")) {
    const carrier = this.shippingInfo?.shippingCarrier || "";
    const tracking = this.trackingCode ? ` (${this.trackingCode})` : "";

    switch (this.fulfillmentStatus) {
      case "Shipped":
        pushEvent(
          "shipped",
          `ຈັດສົ່ງດ້ວຍ ${carrier || "ບໍລິສັດຂົນສົ່ງ"}${tracking}`
        );
        break;
      case "Delivered":
        pushEvent("delivered", "ສິນຄ້າສົ່ງເຖິງມືລູກຄ້າແລ້ວ");
        break;
      case "Cancelled":
        pushEvent("cancelled", this.cancelReason || "ຍົກເລີກອໍເດີ");
        break;
      case "Returned":
        pushEvent("returned", this.returnReason || "ສົ່ງສິນຄ້າຄືນ");
        break;
      case "Processing":
        // ສະເພາະຕອນ admin transition จาก Unfulfilled → Processing
        pushEvent("processing", "ກຳລັງກະກຽມຈັດສົ່ງ");
        break;
    }
  }

  // 4. Payment proof uploaded (detect via array length change)
  if (
    !this.isNew &&
    this.isModified("paymentProof") &&
    Array.isArray(this.paymentProof) &&
    this.paymentProof.length > 0
  ) {
    // ใส่ event แค่ครั้งแรกที่ upload (ไม่ใช่ทุก re-upload)
    const hasUploadEvent = this.events.some((e) => e.type === "proof_uploaded");
    if (!hasUploadEvent) {
      pushEvent("proof_uploaded", "ລູກຄ້າອັບໂຫຼດສະຫຼິບການໂອນ");
    }
  }

  next();
});

/* ------- ✅ Virtual getter: ใช้อ่านได้เสมอ แม้ไฟล์เก่าไม่มี fulfillmentStatus ------- */
orderSchema.virtual("status").get(function () {
  return this.fulfillmentStatus || deriveFulfillmentStatus(this.orderStatus, this.shipmentStatus);
});

orderSchema.set("toJSON", { virtuals: true });
orderSchema.set("toObject", { virtuals: true });

export default mongoose.model("Order", orderSchema);
