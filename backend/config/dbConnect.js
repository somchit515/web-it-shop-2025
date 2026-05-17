import mongoose from "mongoose";

export const connectDatabase = () => {
  let DB_URI = "";

  if (process.env.NODE_ENV === "development") DB_URI = process.env.DB_LOCAL_URI;
  else DB_URI = process.env.DB_URI;

  mongoose.connect(DB_URI)
    .then((con) => {
      console.log(
        `MongoDB Database connected with HOST: ${con?.connection?.host}`
      );
    })
    // 🛑 FIX: เพิ่ม .catch() เพื่อจัดการกับ Promise Rejection หากการเชื่อมต่อล้มเหลว
    .catch((err) => {
      console.error("MongoDB Connection Error:", err.message);
      // 💡 เราควรออกจาก process ถ้า Database ไม่สามารถเชื่อมต่อได้ เพื่อป้องกันปัญหาในอนาคต
      process.exit(1);
    });
};