// backend/controllers/notifyController.js
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import Order from "../models/orders.js";
import { sendOrderEmail } from "../utils/mailer.js";

export const notifyCustomer = catchAsyncErrors(async (req, res, next) => {
  const { orderId } = req.params;
  const { action = 'confirm', lang = 'en', note = '' } = req.body;

  const order = await Order.findById(orderId).populate('user', 'name email');
  if (!order) return next(new ErrorHandler("Order not found", 404));

  const to = order.user?.email;
  if (!to) return next(new ErrorHandler("Customer email not available", 400));

  try {
    // ถ้าต้องการแนบ invoice ให้ตั้ง invoiceFromUrl เป็น URL ที่ accessible สำหรับ Puppeteer
    const invoiceFromUrl = `${process.env.FRONTEND_URL || ''}/invoice/order/${order._id}?pdf=1`;

    await sendOrderEmail({
      to,
      order,
      action,    // 'confirm' | 'reject' | 'uploaded'
      lang,      // 'en' | 'th' | 'la'
      // note: sendOrderEmail currently doesn't accept `note` to render in template,
      // template's note is handled inside getEmailTemplate. If you want to pass note,
      // you could extend sendOrderEmail to accept `note` and pass it to getEmailTemplate.
      invoiceFromUrl
    });

    return res.status(200).json({ success: true, message: 'Notification email sent' });
  } catch (err) {
    console.error('notifyCustomer sendOrderEmail err', err);
    return next(new ErrorHandler("Failed to send email", 500));
  }
}

);
4