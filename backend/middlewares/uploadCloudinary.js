import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';   // เพิ่มบรรทัดนี้
import streamifier from 'streamifier';

// memory storage ไม่ต้องสร้างโฟลเดอร์
const storage = multer.memoryStorage();
export const uploadMemory = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (/image\/(png|jpe?g|webp|gif)/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only images allowed'), false);
  }
});

// helper แปลง buffer → cloudinary
export const uploadToCloudinary = (buffer, folder = 'payment_proofs') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'image', folder },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);          // result มี secure_url, public_id ฯลฯ
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};