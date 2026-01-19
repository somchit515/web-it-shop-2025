import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name "], // ແກ້ຄຳຜິດຈາກ require ເປັນ required
      maxLength: [50, "Your name can not exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Please enter your email "],
      unique: true,
    },
    password: {
      type: String,
      // 💡 ປັບອອກ: ບໍ່ໃສ່ required ເພື່ອໃຫ້ Google Login ສາມາດສ້າງ User ໄດ້ໂດຍບໍ່ຕ້ອງມີ password
      minLength: [6, "Your password must be longer than 6 characters"],
      select: false,
    },
    // 💡 ເພີ່ມ authSource ເພື່ອແຍກປະເພດການ Login
    authSource: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    avatar: {
      public_id: String,
      url: String,
    },
    role: {
      type: String,
      enum: ["user", "admin", "superAdmin"],
      default: "user",
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// Encrypting password before saving the user
userSchema.pre("save", async function (next) {
  // 💡 ຖ້າບໍ່ມີ password (ກໍລະນີ Google Login ໃໝ່ໆ) ໃຫ້ຂ້າມການ Hash ໄປເລີຍ
  if (!this.password || !this.isModified("password")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 10);
});

// return jwt token
userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME,
  });
};

// compare user password
userSchema.methods.comparePassword = async function (enteredPassword) {
  // 💡 ຖ້າ User ນັ້ນມາຈາກ Google ແລະ ຍັງບໍ່ເຄີຍຕັ້ງ password ຈະໃຫ້ return false
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// generate forget password reset token
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;

  return resetToken;
};

export default mongoose.model("User", userSchema);