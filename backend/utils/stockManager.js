// backend/utils/stockManager.js
// จัดการ stock ของสินค้าแบบ atomic + รองรับ rollback
// - validateStock: ตรวจก่อนว่าสินค้ามีพอหรือไม่
// - decrementStockBatch: ลด stock ทีละชิ้น พร้อม rollback ถ้ามีปัญหา
// - restoreStockBatch: คืน stock (เช่น เมื่อ cancel order)

import Product from "../models/product.js";

/**
 * ตรวจสอบว่าสินค้ามีพอสำหรับทุกชิ้นหรือไม่
 * @param {Array} orderItems - [{ product, quantity, name }]
 * @returns {Promise<{ ok: boolean, errors: Array<{name, requested, available, reason}> }>}
 */
export async function validateStock(orderItems = []) {
  const errors = [];

  for (const item of orderItems) {
    if (!item.product) {
      errors.push({
        name: item.name || "Unknown",
        reason: "missing_product_id",
      });
      continue;
    }

    const qty = Number(item.quantity || 0);
    if (qty <= 0) {
      errors.push({
        name: item.name || "Unknown",
        reason: "invalid_quantity",
        requested: qty,
      });
      continue;
    }

    const product = await Product.findById(item.product).select("name stock");

    if (!product) {
      errors.push({
        name: item.name || "Unknown",
        reason: "product_not_found",
      });
      continue;
    }

    if (product.stock < qty) {
      errors.push({
        name: product.name || item.name,
        reason: "insufficient_stock",
        requested: qty,
        available: product.stock,
      });
    }
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}

/**
 * ลด stock ของแต่ละ item แบบ atomic
 * ถ้าชิ้นไหนล้มเหลว → คืน stock ของชิ้นที่หักไปแล้วทั้งหมด (rollback)
 * @param {Array} orderItems - [{ product, quantity }]
 * @returns {Promise<{ ok: boolean, error?: object, decrementedCount?: number }>}
 */
export async function decrementStockBatch(orderItems = []) {
  const decremented = [];

  for (const item of orderItems) {
    const qty = Number(item.quantity || 0);
    if (!item.product || qty <= 0) continue;

    // หัก stock ก็ต่อเมื่อมีพอ (race-safe)
    const updated = await Product.findOneAndUpdate(
      { _id: item.product, stock: { $gte: qty } },
      { $inc: { stock: -qty } },
      { new: true }
    );

    if (!updated) {
      // มีคนซื้อตัดหน้า → rollback ที่หักไปแล้ว
      await restoreStockBatch(decremented);

      // ดึงข้อมูลปัจจุบันเพื่อแจ้ง user
      const current = await Product.findById(item.product).select("name stock");
      return {
        ok: false,
        error: {
          name: current?.name || item.name || "Unknown",
          reason: current ? "insufficient_stock" : "product_not_found",
          requested: qty,
          available: current?.stock ?? 0,
        },
      };
    }

    decremented.push({ product: item.product, quantity: qty });
  }

  return { ok: true, decrementedCount: decremented.length };
}

/**
 * คืน stock (เช่น order ถูกยกเลิก/refund)
 * @param {Array} orderItems - [{ product, quantity }]
 */
export async function restoreStockBatch(orderItems = []) {
  for (const item of orderItems) {
    const qty = Number(item.quantity || 0);
    if (!item.product || qty <= 0) continue;

    await Product.findByIdAndUpdate(
      item.product,
      { $inc: { stock: qty } },
      { new: false }
    ).catch((err) => {
      console.error(
        `restoreStockBatch: failed to restore ${qty} stock for ${item.product}:`,
        err.message
      );
    });
  }
}
