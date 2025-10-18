import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import User from "../models/user.js"; // Ensure this path is correct
import ErrorHandler from "../utils/errorHandler.js";
import sentToken from "../utils/sentToken.js";
import { getResetPasswordTemplate } from "../utils/emailTemplates.js";
import sendEmail from "../utils/sentEmail.js";
import Crypto from "crypto";
import { upload_file, delete_file } from '../utils/cloudinary.js';



// Register User => /api/v1/register
export const registerUser = catchAsyncErrors(async (req, res, next) => {
  // 1. Get user data (name, email, password)
  const { name, email, password } = req.body;

  // 2. Handle Avatar Upload (Assuming you are using an object called 'avatar' in req.body)
  //    NOTE: You MUST use Multer middleware on this route for req.body.avatar to exist correctly.
  const avatar = req.body.avatar; // This holds the base64 or path from the file upload

  let user = await User.create({
    name,
    email,
    password,
  });

  // 3. (MISING LOGIC - requires Cloudinary/Multer integration here to upload file and save URL)

  // 🚀 ใช้ sentToken เพื่อส่ง response กลับ
  sentToken(user, 201, res, "ລົງທະບຽນສຳເລັດ");
});

// Login User => /api/v1/LoginUser
export const loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("please enter email & password", 404));
  }

  //find user in the database
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("invalid email or password", 401));
  }

  // check if password is correct
  const isPasswordMacthed = await user.comparePassword(password);

  if (!isPasswordMacthed) {
    return next(new ErrorHandler("invalid email or password", 401));
  }

  sentToken(user, 200, res);
});

// Logout User => /api/v1/LogoutUser

export const logoutUser = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
    path: "/", // 🚀 เพิ่ม Path: ให้แน่ใจว่าลบคุกกี้จาก root path
  });
  res.status(200).json({
    message: "Logged out",
  });
});

// ในฟังก์ชัน uploadAvatar:

// ใน backend/controllers/authController.js (ฟังก์ชัน uploadAvatar)

export const uploadAvatar = catchAsyncErrors(async (req, res, next) => {
    try { // 💡 เพิ่ม try...catch ชั่วคราวเพื่อหา Error ที่ซ่อนอยู่
        const user = await User.findById(req.user._id); 

        // 1. ลบรูปเก่า
        if (user.avatar && user.avatar.public_id) { 
            await delete_file(user.avatar.public_id); 
        }
        
        // 2. อัปโหลดรูปใหม่
        const avatarResponse = await upload_file(req.body.avatar, "shopit/avatar");

        // 3. บันทึกข้อมูล
        const updatedUser = await User.findByIdAndUpdate(req.user._id, {
            avatar: avatarResponse, 
        }, {
            new: true,
            runValidators: true,
            useFindAndModify: false
        });

        res.status(200).json({
            success: true,
            user: updatedUser
        });
        
    } catch (error) {
        // 🛑 ถ้าโค้ดล่ม ให้ Log Error ที่นี่
        console.error("CRITICAL UPLOAD ERROR:", error);
        return next(error); // หรือส่ง Error ไปที่ Error Handler
    }
});
// Forgot password  => /api/v1/password/forgot
export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  //find user in the database
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("user not found with this email", 404));
  }

  // get reset password token
  const resetToken = user.getResetPasswordToken();

  await user.save();

  // create reset password url
  const resetUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

  const message = getResetPasswordTemplate(user?.name, resetUrl);

  try {
    await sendEmail({
      email: user.email,
      subject: "It shop password Recovery",
      message,
    });
    res.status(200).json({
      message: `Email sent to ${user.email}`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return next(new ErrorHandler(error?.message, 500));
  }
});

// Reset password  => /api/v1/password/reset/:Token
export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  //Hash the URL Token

  const resetPasswordToken = Crypto.createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler(
        "Password Reset Token is Invalid Or Has Been Expired",
        400
      )
    );
  }
  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password Do Not Macth", 400));
  }

  //Set The New Password

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sentToken(user, 200, res);
});

// Get Current user Profile  => /api/v1/me
export const getUserProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne(req?.user?._id); // req.user is undefined if no cookie/token

  res.status(200).json({ // <-- Still returns 200, but with no user found
    user,
  });
});

// Get update Password  => /api/v1/password/update
export const getUpdatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne(req?.user?._id).select("+password");

  //chek the previous user Password

  const isPasswordMacthed = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMacthed) {
    return next(new ErrorHandler("old Password is Incorrect", 400));
  }
  user.password = req.body.password;
  user.save();

  res.status(200).json({
    success: true,
  });
});

// Get update user profile  => /api/v1/me/update
export const getUpdateProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await User.findByIdAndUpdate(req.user._id, newUserData, {
    new: true,
  });

  res.status(200).json({
    user,
  });
});

// Get All User - Admin  => /api/v1/admin/users
export const getAllUser = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    users,
  });
});

// Get User details - Admin  => /api/v1/admin/users/:id
export const getUserDetials = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`user not found with id : ${req.params.id}`, 404)
    );
  };

  res.status(200).json({
    user,
  });
});





// Update user details - Admin => /api/v1/admin/users/:id
export const getUpdateUser = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  // Ensure validation is run when updating user
  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,  // Validate the data
  });

  res.status(200).json({
    user,
  });
});


// Get Deletes user  - Admin  => /api/v1/admin/users/:id
export const getDeleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);


  if (!user) {
    return next(
      new ErrorHandler(`user not found with id : ${req.params.id}`, 404)
    );
  };

  // TODO Remove user Avatar From Couldinary
  await user.deleteOne();


  res.status(200).json({
    success: true,
  });
});


