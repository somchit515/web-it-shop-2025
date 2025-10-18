import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import { connectDatabase } from "./config/dbConnect.js";
import errorsMiddleware from "./middlewares/errors.js";
// 🛑 FIX: Remove unused import 'verify' from 'jsonwebtoken'
// import { verify } from "jsonwebtoken"; 

// Load environment variables
dotenv.config({ path: "backend/config/config.env" });

// Create Express app
const app = express();

// Handle Uncaught Exception (sync error)
process.on("uncaughtException", (err) => {
  console.log(`ERROR: ${err.message}`); // Log error message
  console.log("Shutting down server due to uncaught exception");
  process.exit(1);
});

// Connect to database
connectDatabase();

// --- Core Middleware Setup ---

// 🛑 FIX 1: Correct the syntax for express.json() with the 'verify' option.
// This middleware is now correctly structured to accept large JSON (50mb)
// and to capture the raw body (needed for Stripe webhooks later).
app.use(express.json({
  limit: '50mb',
  // The verify function is called to get the raw body buffer
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));

app.use(express.urlencoded({ limit: '50mb', extended: true })); // Accepts large URL-encoded data
app.use(cookieParser());


// ✅ Enable CORS before defining routes
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // example: http://localhost:3000
    credentials: true,
  })
);

// Import all routes
import productRoutes from "./routes/products.js";
import authRoutes from "./routes/auth.js";
import orderRoutes from "./routes/order.js";
import paymentRoutes from "./routes/payment.js";


// Mount routes
app.use("/api/v1", productRoutes);
app.use("/api/v1", authRoutes);
app.use("/api/v1", orderRoutes);
app.use("/api/v1", paymentRoutes);

// Error handling middleware
app.use(errorsMiddleware);

// Start server
const server = app.listen(process.env.PORT, () => {
  console.log(
    `Server started on PORT: ${process.env.PORT} in ${process.env.NODE_ENV} mode.`
  );
});

// Handle unhandled promise rejections (async error)
process.on("unhandledRejection", (err) => {
  // 🛑 FIX: การจัดการ Error ที่ละเอียดขึ้น
  console.error("FATAL UNHANDLED REJECTION!");
  console.error(`ERROR MESSAGE: ${err.message}`);
  console.error(`ERROR STACK: ${err.stack}`);
  console.log("Shutting down server due to unhandled promise rejection");
  server.close(() => {
    process.exit(1);
  });
});