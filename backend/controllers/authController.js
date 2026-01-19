import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import User from "../models/user.js";
import ErrorHandler from "../utils/errorHandler.js";
import sentToken from "../utils/sentToken.js";
import { getResetPasswordTemplate } from "../utils/emailTemplates.js";
import sendEmail from "../utils/sentEmail.js";
import crypto from "crypto";
import { upload_file, delete_file } from "../utils/cloudinary.js";

import { OAuth2Client } from "google-auth-library";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/* =========================================
   ສະຖານທີ່ລົງທະບຽນຜູ້ໃຊ້  =>  POST /api/v1/register
========================================= */
export const registerUser = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password } = req.body;

  /* ---------- 1. ຕົວຢ່າງການອັບໂຫຼດ Avatar (ຕ້ອງໃຊ້ multer middleware) ---------- */
  let avatarData;
  if (req.body.avatar) {
    // ອັບໂຫຼດຮູບຂຶ້ນ Cloudinary
    avatarData = await upload_file(req.body.avatar, "shopit/avatars");
  }

  /* ---------- 2. ສ້າງຜູ້ໃຊ້ໃໝ່ ---------- */
  const user = await User.create({
    name,
    email,
    password,
    avatar: avatarData || undefined,
  });

  /* ---------- 3. ຕອບກັບ Token ພ້ອມຂໍ້ຄວາມສຳເລັດ ---------- */
  sentToken(user, 201, res, "ລົງທະບຽນສຳເລັດ");
});

/* =========================================
   ສະຖານທີ່ເຂົ້າສູ່ລະບົບ      =>  POST /api/v1/login
========================================= */
export const loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("ກະລຸນາປ້ອນອີເມວ ແລະ ລະຫັດຜ່ານ", 400));
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("ອີເມວ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ", 401));
  }

  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("ອີເມວ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ", 401));
  }

  sentToken(user, 200, res);
});

/* =========================================
   ສະຖານທີ່ອອກຈາກລະບົບ      =>  GET /api/v1/logout
========================================= */
export const logoutUser = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
    path: "/",
  });
  res.status(200).json({ message: "ອອກຈາກລະບົບສຳເລັດ" });
});

/* =========================================
   ອັບໂຫຼດ/ປ່ຽນຮູปໂປຣໄຟລ     =>  PUT /api/v1/me/avatar
========================================= */
export const uploadAvatar = catchAsyncErrors(async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    // ລົບຮູບເກົ່າ (ຖ້າມີ)
    if (user.avatar?.public_id) {
      await delete_file(user.avatar.public_id);
    }

    // ອັບໂຫຼດຮູບໃໝ່
    const avatarResponse = await upload_file(req.body.avatar, "shopit/avatars");

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarResponse },
      { new: true, runValidators: true, useFindAndModify: false }
    );

    res.status(200).json({ success: true, user: updatedUser });
  } catch (err) {
    console.error("ຂໍ້ຜິດພາດການອັບໂຫຼດ:", err);
    return next(err);
  }
});

/* =========================================
   ລືມລະຫັດຜ່ານ           =>  POST /api/v1/password/forgot
========================================= */
export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorHandler("ບໍ່ພົບອີເມວນີ້ໃນລະບົບ", 404));
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;
  const message = getResetPasswordTemplate(user.name, resetUrl);

  try {
    await sendEmail({
      email: user.email,
      subject: "ກູ້ຄືນລະຫັດຜ່ານ - IT-Shop",
      message,
    });
    res.status(200).json({ message: `ສົ່ງອີເມວໄປຫາ ${user.email} ສຳເລັດ` });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(err.message, 500));
  }
});

/* =========================================
   ຕັ້ງຄືນລະຫັດຜ່ານ       =>  PUT /api/v1/password/reset/:token
========================================= */
export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorHandler("ລິ້ງກູ້ຄືນລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ ຫຼື ໝົດອາຍຸ", 400));
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("ລະຫັດຜ່ານບໍ່ຕົງກັນ", 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sentToken(user, 200, res);
});

/* =========================================
   ດຶງຂໍ້ມູນໂປຣໄຟລຕົນເອງ   =>  GET /api/v1/me
========================================= */
export const getUserProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({ user });
});

/* =========================================
   ປ່ຽນລະຫັດຜ່ານ         =>  PUT /api/v1/password/update
========================================= */
export const getUpdatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("+password");

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("ລະຫັດຜ່ານເກົ່າບໍ່ຖືກຕ້ອງ", 400));
  }

  user.password = req.body.password;
  await user.save();

  res.status(200).json({ success: true });
});

/* =========================================
   ອັບເດດໂປຣໄຟລຕົນເອງ   =>  PUT /api/v1/me/update
========================================= */
export const getUpdateProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = { name: req.body.name, email: req.body.email };
  const user = await User.findByIdAndUpdate(req.user._id, newUserData, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ user });
});

/* ======================================================
   ສຳລັບ Admin - ສະແດງລາຍຊື່ຜູ້ໃຊ້ທັງໝົດ
   => GET /api/v1/admin/users
====================================================== */
export const getAllUser = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({ users });
});

/* ======================================================
   ສຳລັບ Admin - ສະແດງລາຍລະອຽດຜູ້ໃຊ້ຄົນໜຶ່ງ
   => GET /api/v1/admin/users/:id
====================================================== */
export const getUserDetials = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ErrorHandler(`ບໍ່ພົບຜູ້ໃຊ້ທີ່ມີ ID: ${req.params.id}`, 404));
  }
  res.status(200).json({ user });
});

/* ======================================================
   ສຳລັບ Admin - ອັບເດດຂໍ້ມູນຜູ້ໃຊ້
   => PUT /api/v1/admin/users/:id
====================================================== */
export const getUpdateUser = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ user });
});

/* ======================================================
   ສຳລັບ Admin - ລຶບຜູ້ໃຊ້
   => DELETE /api/v1/admin/users/:id
====================================================== */
export const getDeleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ErrorHandler(`ບໍ່ພົບຜູ້ໃຊ້ທີ່ມີ ID: ${req.params.id}`, 404));
  }

  // ລຶບ Avatar ອອກຈາກ Cloudinary (ຖ້າມີ)
  if (user.avatar?.public_id) {
    await delete_file(user.avatar.public_id);
  }

  await user.deleteOne();
  res.status(200).json({ success: true });
});

/* ======================================================
   ເຂົ້າສູ່ລະບົບດ້ວຍ Google  => POST /api/v1/google/login
====================================================== */
export const googleLogin = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.body;
  if (!token) {
    return next(new ErrorHandler("ຕ້ອງສົ່ງ Google Token", 400));
  }

  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const { email, name, picture, sub: googleId } = ticket.getPayload();

  let user = await User.findOne({ email });

  if (!user) {
    // ສ້າງຜູ້ໃຊ້ໃໝ່ຈາກຂໍ້ມູນ Google
    const randomPassword = crypto.randomBytes(16).toString("hex");
    user = await User.create({
      name,
      email,
      password: randomPassword,
      avatar: {
        public_id: `google_${googleId}`,
        url: picture,
      },
      authSource: "google",
    });
  }

  sentToken(user, 200, res, "ເຂົ້າສູ່ລະບົບດ້ວຍ Google ສຳເລັດ");
});