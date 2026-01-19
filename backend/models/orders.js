// backend/models/orders.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    shippingInfo: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      phoneNo: { type: String, required: true },
      
      /* แก้ไข: ปลดล็อก zipCode ไม่ให้บังคับกรอก (required: false) */
      zipCode: { type: String, required: false }, 
      
      country: { type: String, required: true },
      
      /* เพิ่มเติม: ฟิลด์ branch สำหรับเก็บข้อมูลสาขาหรือหมายเหตุการจัดส่ง */
      branch: { type: String, required: false },
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
      enum: ["Pending", "AwaitingProof", "Paid", "Rejected"],
      default: "Pending",
    },

    paymentProof: [
      {
        url: String,
        public_id: String,        // เก็บไว้ลบภาพใน Cloudinary
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

    /* --------- สถานะออร์เดอร์ --------- */
    orderStatus: {
      type: String,
      enum: { values: ["Processing", "Shipped", "Delivered", "Cancelled", "Returned"], message: "Please select a correct order status" },
      default: "Processing",
    },

    /* --------- สถานะขนส่ง (แยกชัด) --------- */
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
    refundBank: String,         // ธนาคารที่คืนเงิน
    refundAccount: String,      // เลขบัญชีคืนเงิน
  },
  { timestamps: true }
);

/* ------- Index ที่ใช้บ่อย ------- */
orderSchema.index({ user: 1, orderStatus: 1 });
orderSchema.index({ shipmentStatus: 1 });

export default mongoose.model("Order", orderSchema);
