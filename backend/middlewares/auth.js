import jwt from "jsonwebtoken";
import catchAsyncErrors from "./catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import User from "../models/user.js";
import Blog from "../models/blog.js";

/* =======================
   ROLE CONSTANTS
======================= */
const ADMIN_ROLES = ["admin", "superAdmin"];
const STAFF_ROLES = ["admin", "superAdmin", "moderator"];

/* =======================
   AUTHENTICATION
======================= */
// ກວດສອບວ່າ Login ແລ້ວຫຼືບໍ່
export const isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(
      new ErrorHandler("ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນ", 401)
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(
        new ErrorHandler("ຜູ້ໃຊ້ສຳລັບ token ນີ້ບໍ່ມີອີກຕໍ່ໄປ", 401)
      );
    }

    req.user = user;
    next();
  } catch (err) {
    return next(
      new ErrorHandler(
        "Token ບໍ່ຖືກຕ້ອງ ຫຼື ໝົດອາຍຸ. ກະລຸນາ Login ໃໝ່",
        401
      )
    );
  }
});

/* =======================
   ROLE AUTHORIZATION
======================= */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `ສິດ (${req.user?.role || "N/A"}) ບໍ່ອະນຸຍາດໃຫ້ເຂົ້າເຖິງ`,
          403
        )
      );
    }
    next();
  };
};

// Shortcuts
export const isAdmin = authorizeRoles("admin");
export const isSuperAdmin = authorizeRoles("superAdmin");
export const isAdminOrSuperAdmin = authorizeRoles(...ADMIN_ROLES);
export const isModeratorOrAdmin = authorizeRoles("moderator", "admin");
export const isStaff = authorizeRoles(...STAFF_ROLES);

/* =======================
   USER OWNERSHIP
======================= */
// ເຈົ້າຂອງຂໍ້ມູນ ຫຼື Admin
export const isOwnerOrAdmin = catchAsyncErrors(async (req, res, next) => {
  if (!req.user) {
    return next(new ErrorHandler("ກະລຸນາ Login ກ່ອນ", 401));
  }

  if (ADMIN_ROLES.includes(req.user.role)) {
    return next();
  }

  const targetId = req.params.id || req.params.userId;

  if (targetId && targetId === req.user.id) {
    return next();
  }

  return next(
    new ErrorHandler("ບໍ່ມີສິດແກ້ໄຂຂໍ້ມູນຂອງຜູ້ອື່ນ", 403)
  );
});

/* =======================
   BLOG OWNERSHIP
======================= */
// ເຈົ້າຂອງ Blog ຫຼື Admin
export const isBlogOwnerOrAdmin = catchAsyncErrors(async (req, res, next) => {
  if (!req.user) {
    return next(new ErrorHandler("ກະລຸນາ Login ກ່ອນ", 401));
  }

  if (ADMIN_ROLES.includes(req.user.role)) {
    return next();
  }

  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    return next(new ErrorHandler("ບົດຄວາມບໍ່ພົບ", 404));
  }

  if (blog.authorId.toString() !== req.user.id) {
    return next(
      new ErrorHandler("ບໍ່ມີສິດແກ້ໄຂບົດຄວາມນີ້", 403)
    );
  }

  next();
});

/* =======================
   COMMENT OWNERSHIP
======================= */
// ເຈົ້າຂອງ Comment ຫຼື Admin
export const isCommentOwnerOrAdmin = catchAsyncErrors(async (req, res, next) => {
  if (!req.user) {
    return next(new ErrorHandler("ກະລຸນາ Login ກ່ອນ", 401));
  }

  if (ADMIN_ROLES.includes(req.user.role)) {
    return next();
  }

  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    return next(new ErrorHandler("ບົດຄວາມບໍ່ພົບ", 404));
  }

  const comment = blog.comments.id(req.params.commentId);
  if (!comment) {
    return next(new ErrorHandler("ຄວາມຄິດເຫັນບໍ່ພົບ", 404));
  }

  if (comment.user.toString() !== req.user.id) {
    return next(
      new ErrorHandler("ບໍ່ມີສິດແກ້ໄຂ Comment ນີ້", 403)
    );
  }

  next();
});

/* =======================
   USER STATUS CHECK
======================= */
// ກວດສະຖານະບັນຊີ
export const isActiveUser = catchAsyncErrors(async (req, res, next) => {
  if (!req.user) {
    return next(new ErrorHandler("ກະລຸນາ Login ກ່ອນ", 401));
  }

  if (req.user.status === "inactive") {
    return next(
      new ErrorHandler(
        "ບັນຊີຖືກປິດໃຊ້ງານ. ກະລຸນາຕິດຕໍ່ Admin",
        403
      )
    );
  }

  if (req.user.status === "suspended") {
    return next(
      new ErrorHandler(
        "ບັນຊີຖືກລັອກ. ກະລຸນາຕິດຕໍ່ Admin",
        403
      )
    );
  }

  next();
});
