// backend/utils/orderCleanup.js
// ✅ Auto-release stock จาก orders ที่ user ทิ้งไว้นานเกินไป
//    - BankTransfer + AwaitingProof + ไม่มี paymentProof + เก่ากว่า X นาที → cancel + restore stock
//    - COD ไม่ auto-cancel (รอเก็บเงินสดเมื่อส่ง)

import Order from "../models/orders.js";
import { restoreStockBatch } from "./stockManager.js";

// ✅ Timeout (นาที) — ค่า default 15 นาที, ปรับผ่าน env ได้
export const BANK_TRANSFER_EXPIRY_MINUTES = Number(
  process.env.BANK_TRANSFER_EXPIRY_MINUTES || 15
);

/**
 * ค้นหาและยกเลิก orders ที่หมดอายุ (BankTransfer + ไม่อัปโหลดสลิป)
 * @returns {Promise<{cancelled: number, items: Array}>}
 */
export async function releaseExpiredBankOrders() {
  const expiryMs = BANK_TRANSFER_EXPIRY_MINUTES * 60 * 1000;
  const cutoff = new Date(Date.now() - expiryMs);

  // หา orders ที่ตรงเงื่อนไข
  const expired = await Order.find({
    paymentMethod: "BankTransfer",
    paymentStatus: "AwaitingProof",
    fulfillmentStatus: { $in: ["Unfulfilled", "Processing"] },
    createdAt: { $lt: cutoff },
    $or: [
      { paymentProof: { $exists: false } },
      { paymentProof: { $size: 0 } },
    ],
  }).limit(50); // จำกัด batch — กัน load หนัก

  if (expired.length === 0) {
    return { cancelled: 0, items: [] };
  }

  const results = [];
  for (const order of expired) {
    try {
      // คืน stock
      await restoreStockBatch(order.orderItems);

      // ปิด order
      order.fulfillmentStatus = "Cancelled";
      order.paymentStatus = "Rejected";
      order.cancelReason = `ຍົກເລີກອັດຕະໂນມັດ — ບໍ່ໄດ້ອັບໂຫຼດສະຫຼິບພາຍໃນ ${BANK_TRANSFER_EXPIRY_MINUTES} ນາທີ`;
      order.cancelledAt = new Date();
      await order.save();

      results.push({
        orderId: order._id,
        userId: order.user,
        totalAmount: order.totalAmount,
      });

      console.log(`[orderCleanup] Auto-cancelled expired order ${order._id}`);
    } catch (err) {
      console.error(
        `[orderCleanup] Failed to cancel order ${order._id}:`,
        err.message
      );
    }
  }

  return { cancelled: results.length, items: results };
}

/**
 * คำนวณเวลาที่เหลือก่อน order หมดอายุ (สำหรับแสดงในหน้า UploadPaymentProof)
 * @param {Date|string} createdAt
 * @returns {number} milliseconds (0 ถ้าหมดแล้ว, negative ถ้าหมดไปแล้ว)
 */
export function getOrderExpiryMs(createdAt) {
  const expiryMs = BANK_TRANSFER_EXPIRY_MINUTES * 60 * 1000;
  const expiresAt = new Date(createdAt).getTime() + expiryMs;
  return Math.max(0, expiresAt - Date.now());
}
