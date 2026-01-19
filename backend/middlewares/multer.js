import multer from "multer";
import path from "path";
import fs from "fs";

// โฟลเดอร์เก็บไฟล์
const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.random().toString(36).slice(2,9)}${ext}`;
    cb(null, name);
  },
});

// optional: filter เพื่อรับเฉพาะ image
const fileFilter = (req, file, cb) => {
  if (/image\/(png|jpe?g|webp|gif)/.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
});
