// backend/controllers/reportController.js

import User from '../models/userModel.js'; 
import Order from '../models/orders.js'; // ตรวจสอบว่ามี s หรือไม่ตามที่คุยกัน
import ErrorHandler from '../utils/errorHandler.js'; 
import catchAsyncErrors from '../middlewares/catchAsyncErrors.js';

// --- 1.1 รายงานข้อมูลลูกค้า ---
export const getAllCustomersReport = catchAsyncErrors(async (req, res, next) => {
    const customers = await User.find({ role: 'user' }).select('name email createdAt');
    res.status(200).json({ success: true, count: customers.length, report: customers });
});

// --- 1.2 รายงานยอดขายสรุป ---
export const getOrdersAndSalesReport = catchAsyncErrors(async (req, res, next) => {
    const totalSalesResult = await Order.aggregate([
        { $match: { 'paymentInfo.status': { $in: ['paid', 'Paid', 'succeeded'] } } },
        { $group: { _id: null, totalSales: { $sum: '$totalAmount' }, totalOrders: { $sum: 1 } } }
    ]);
    const salesData = totalSalesResult[0] || { totalSales: 0, totalOrders: 0 };
    res.status(200).json({ success: true, sales: salesData.totalSales, ordersCount: salesData.totalOrders });
});

// --- 1.3 รายงานการเงิน / รายรับ-รายจ่าย (Finance Report) ---
// แก้ชื่อให้ตรงกับที่ Routes เรียกใช้
export const getIncomeAndExpenseReport = catchAsyncErrors(async (req, res, next) => {
    const { startDate, endDate } = req.query; 

    const matchCriteria = { paymentStatus: { $in: ['Paid', 'succeeded', 'delivered'] } };
    if (startDate && endDate) {
        matchCriteria.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const report = await Order.aggregate([
        { $match: matchCriteria },
        {
            $group: {
                _id: null,
                totalSales: { $sum: '$itemsPrice' },
                totalShipping: { $sum: '$shippingAmount' },
                totalTax: { $sum: '$taxAmount' },
                totalGross: { $sum: '$totalAmount' },
                totalOrders: { $sum: 1 },
                totalCOGS: { 
                    $sum: { 
                        $reduce: {
                            input: "$orderItems",
                            initialValue: 0,
                            in: { $add: ["$$value", { $multiply: [{ $ifNull: ["$$this.costPrice", 0] }, "$$this.quantity"] }] }
                        }
                    } 
                }
            }
        },
        {
            $project: {
                _id: 0,
                totalSales: 1, totalShipping: 1, totalTax: 1, totalGross: 1, totalCOGS: 1, totalOrders: 1,
                netProfit: { $subtract: ["$totalGross", { $add: ["$totalCOGS", "$totalTax"] }] }
            }
        }
    ]);

    res.status(200).json({
        success: true,
        report: report[0] || { totalSales: 0, totalShipping: 0, totalTax: 0, totalGross: 0, totalCOGS: 0, totalOrders: 0, netProfit: 0 }
    });
});

// --- 1.4 รายงานข้อมูลการยกเลิก/ส่งคืน ---
export const getCancellationsAndReturnsReport = catchAsyncErrors(async (req, res, next) => {
    const report = await Order.find({ orderStatus: { $in: ['Cancelled', 'Returned'] } });
    res.status(200).json({ success: true, count: report.length, report });
});