import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path"; // 🚀 ເພີ່ມເພື່ອຈັດການ Static Files (ຮູບພາບ)

import { connectDatabase } from "./config/dbConnect.js";
import errorsMiddleware from "./middlewares/errors.js";

// 1. Load environment variables
dotenv.config({ path: "backend/config/config.env" });

// 2. Handle Uncaught Exception
process.on("uncaughtException", (err) => {
  console.log(`ERROR: ${err.message}`);
  process.exit(1);
});

const app = express();

// 3. Connect Database
connectDatabase();

// --- 4. Core Middleware Setup ---

// ✅ CORS: ຕ້ອງຢູ່ເທິງສຸດ
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true, 
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// ✅ Cookie Parser: ຕ້ອງຢູ່ກ່ອນ Routes
app.use(cookieParser());

// ✅ Body Parsers
app.use(express.json({
  limit: '50mb',
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- 5. Import Routes ---
import productRoutes from "./routes/products.js";
import authRoutes from "./routes/auth.js";
import orderRoutes from "./routes/order.js";
import paymentRoutes from "./routes/payment.js";
import reportRoutes from "./routes/reportRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import couponRoutes from "./routes/coupons.js";
import categoryRoutes from "./routes/categories.js";

// --- 6. Mount Routes (ກວດສອບ Path ໃຫ້ດີ) ---
app.use("/api/v1", productRoutes);
app.use("/api/v1", authRoutes);
app.use("/api/v1", orderRoutes);
app.use("/api/v1", paymentRoutes);
app.use("/api/v1", reportRoutes);
app.use("/api/v1", blogRoutes);
app.use("/api/v1", couponRoutes);
app.use("/api/v1", categoryRoutes);

// --- 7. Error Middleware ---
app.use(errorsMiddleware);

const server = app.listen(process.env.PORT, () => {
  console.log(`Server started on PORT: ${process.env.PORT} in ${process.env.NODE_ENV} mode.`);
});

// ✅ Periodic cleanup: คืน stock จาก orders ที่ user ทิ้งไว้
//    รัน 1 ครั้ง/นาที — production ควรใช้ cron job แท้แทน
import { releaseExpiredBankOrders, BANK_TRANSFER_EXPIRY_MINUTES } from "./utils/orderCleanup.js";
const CLEANUP_INTERVAL_MS = 60_000; // 1 min
const cleanupTimer = setInterval(async () => {
  try {
    const result = await releaseExpiredBankOrders();
    if (result.cancelled > 0) {
      console.log(
        `[scheduled cleanup] cancelled ${result.cancelled} expired BankTransfer order(s)`
      );
    }
  } catch (err) {
    console.error("[scheduled cleanup] error:", err.message);
  }
}, CLEANUP_INTERVAL_MS);
console.log(
  `[cleanup] scheduled — orders expire after ${BANK_TRANSFER_EXPIRY_MINUTES} mins, check every ${CLEANUP_INTERVAL_MS / 1000}s`
);

process.on("unhandledRejection", (err) => {
  console.error(`ERROR: ${err.message}`);
  clearInterval(cleanupTimer);
  server.close(() => process.exit(1));
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received — graceful shutdown");
  clearInterval(cleanupTimer);
  server.close(() => process.exit(0));
});