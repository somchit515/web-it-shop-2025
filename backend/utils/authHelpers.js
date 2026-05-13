// backend/utils/authHelpers.js
// Reusable authorization helpers
import ErrorHandler from "./errorHandler.js";

const ADMIN_ROLES = ["admin", "superAdmin"];

/**
 * ตรวจว่า user เป็นเจ้าของ resource หรือเป็น admin
 * - คืน null ถ้าผ่าน
 * - คืน ErrorHandler ถ้าไม่ผ่าน (ใช้ใน next(err))
 *
 * @param {Object} resource - mongoose document ที่มี field user (ObjectId หรือ populated)
 * @param {Object} reqUser  - req.user (ผู้ใช้ปัจจุบัน)
 * @param {string} resourceName - ชื่อ resource สำหรับ error message
 */
export function checkOwnershipOrAdmin(resource, reqUser, resourceName = "resource") {
  if (!reqUser) {
    return new ErrorHandler("Not authenticated", 401);
  }

  // Admin/superAdmin → ผ่านได้เสมอ
  if (ADMIN_ROLES.includes(reqUser.role)) {
    return null;
  }

  // ดึง user id จาก resource ทั้งกรณี ObjectId และ populated object
  const ownerId =
    resource?.user?._id?.toString?.() ||
    resource?.user?.toString?.() ||
    null;

  const myId = reqUser._id?.toString?.();

  if (!ownerId || !myId || ownerId !== myId) {
    return new ErrorHandler(
      `You are not authorized to access this ${resourceName}`,
      403
    );
  }

  return null;
}

/**
 * Shortcut: throw error ทันที (ใช้กับ catchAsyncErrors)
 *
 * Usage in controller:
 *   assertOwnershipOrAdmin(order, req.user, "order");
 */
export function assertOwnershipOrAdmin(resource, reqUser, resourceName = "resource") {
  const err = checkOwnershipOrAdmin(resource, reqUser, resourceName);
  if (err) throw err;
}
