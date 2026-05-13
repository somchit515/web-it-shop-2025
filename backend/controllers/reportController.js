import User from '../models/user.js';
import Order from '../models/orders.js';
import catchAsyncErrors from '../middlewares/catchAsyncErrors.js';

const PAID_STATUSES = ['Paid', 'succeeded'];

export const getAllCustomersReport = catchAsyncErrors(async (req, res) => {
  const customers = await User.find({ role: 'user' }).select('name email createdAt');
  res.status(200).json({ success: true, count: customers.length, customers });
});

export const getOrdersAndSalesReport = catchAsyncErrors(async (req, res) => {
  const { startDate, endDate } = req.query;
  const match = { paymentStatus: { $in: PAID_STATUSES } };

  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
  }

  const orders = await Order.find(match)
    .select('createdAt totalAmount paymentStatus fulfillmentStatus paymentMethod orderItems')
    .populate('user', 'name email')
    .sort({ createdAt: -1 });

  const sales = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
  const ordersCount = orders.length;

  res.status(200).json({
    success: true,
    sales,
    ordersCount,
    orders,
  });
});

export const getIncomeAndExpenseReport = catchAsyncErrors(async (req, res) => {
  const { startDate, endDate } = req.query;

  const matchCriteria = { paymentStatus: { $in: PAID_STATUSES } };
  if (startDate || endDate) {
    matchCriteria.createdAt = {};
    if (startDate) matchCriteria.createdAt.$gte = new Date(startDate);
    if (endDate) matchCriteria.createdAt.$lte = new Date(endDate);
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
              input: '$orderItems',
              initialValue: 0,
              in: { $add: ['$$value', { $multiply: [{ $ifNull: ['$$this.costPrice', 0] }, '$$this.quantity'] }] },
            },
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalSales: 1,
        totalShipping: 1,
        totalTax: 1,
        totalGross: 1,
        totalCOGS: 1,
        totalOrders: 1,
        netProfit: { $subtract: ['$totalGross', { $add: ['$totalCOGS', '$totalTax'] }] },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    report: report[0] || { totalSales: 0, totalShipping: 0, totalTax: 0, totalGross: 0, totalCOGS: 0, totalOrders: 0, netProfit: 0 },
  });
});

export const getCancellationsAndReturnsReport = catchAsyncErrors(async (req, res) => {
  const report = await Order.find({ fulfillmentStatus: { $in: ['Cancelled', 'Returned'] } });
  res.status(200).json({ success: true, count: report.length, report });
});
