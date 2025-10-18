import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Order from "../models/orders.js";
import Product from "../models/product.js";
import ErrorHandler from "../utils/errorHandler.js";


// Create new Order =>   /api/v1/orders/new
export const newOrder = catchAsyncErrors(async (req, res, next) => {
  const {
    orderItems,
    shippingInfo,
    itemsPrice,
    taxAmount,
    totalAmount,
    shippingAmount,
    paymentMethod,
    paymentInfo,
  } = req.body;

  // Create the order
  const order = await Order.create({
    orderItems,
    shippingInfo,
    itemsPrice,
    taxAmount,
    totalAmount, // The total amount saved to the model is 'totalAmount'
    shippingAmount,
    paymentMethod,
    paymentInfo,
    user: req.user._id,
  });

  res.status(201).json({
    success: true,
    order,
  });
});

// Get current user orders =>   /api/v1/me/orders
export const myOrder = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id });

  if (!orders || orders.length === 0) {
    return next(new ErrorHandler("No orders found for this user", 404));
  }

  res.status(200).json({
    success: true,
    orders,
  });
});

// Get Order Details =>   /api/v1/orders/:id
export const getOrderDetails = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) {
    return next(new ErrorHandler("No Order Found With This ID", 404));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

// Get All  orders =>   /api/v1/admin/orders
export const allOrder = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find();

  if (!orders || orders.length === 0) {
    // NOTE: Admin can return an empty array, but keeping 404 to match user's original logic
    return next(new ErrorHandler("No orders found for this user", 404));
  }

  res.status(200).json({
    success: true,
    orders,
  });
});

/**
 * Helper function to update product stock after an order status change (e.g., to Delivered)
 * @param {string} id - Product ID
 * @param {number} quantity - Quantity to decrement from stock
 */
async function updateStock(id, quantity) {
  const product = await Product.findById(id);

  if (!product) {
    throw new ErrorHandler("No Product Found With This ID for stock update", 404);
  }

  product.stock -= quantity;
  await product.save({ validateBeforeSave: false });
}

// Get Update  orders - Admin =>   /api/v1/admin/orders/:id
export const updateOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("No Order Found With This ID", 404));
  }

  if (order?.orderStatus === "Delivered") {
    return next(new ErrorHandler("You have already Delivered this order", 400));
  };

  // Check if the order status is being changed to 'Delivered' to trigger stock update
  if (req.body.status === "Delivered" && order.orderStatus !== "Delivered") {
    // Use a for...of loop to ensure sequential asynchronous operations and proper error handling
    for (const item of order.orderItems) {
      // ✅ FIX: Correctly call updateStock with the product ID and item's quantity
      // We assume the quantity is stored on the order item object
      await updateStock(item.product.toString(), item.quantity);
    }

    order.deliveredAt = Date.now();
  }

  // Update order status
  order.orderStatus = req.body.status;

  // Save the updated order document
  await order.save();


  res.status(200).json({
    success: true,
  });
});


// Delete Order  =>   /api/v1/admin/orders/:id
export const deleteOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("No Order Found With This ID", 404));
  }


  await order.deleteOne();

  res.status(200).json({
    success: true,
  });
});

/**
 * Core logic to fetch and process sales data for a given date range.
 * This function handles MongoDB aggregation and data normalization.
 */
async function getSalesData(startDate, endDate) {
  // 1. Define pipeline for MongoDB aggregation
  const pipeline = [
    {
      // Stage 1: Filter results by createdAt date range
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      // Stage 2: Group and calculate all required totals by date
      $group: {
        _id: {
          // CRITICAL: Date format MUST be YYYY-MM-DD (UTC) to match getDateBetween
          date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        },
        totalSales: { $sum: "$totalAmount" },
        totalNumOrders: { $sum: 1 },
        totalShipping: { $sum: "$shippingAmount" }, // 💡 Added Shipping
        totalTax: { $sum: "$taxAmount" },           // 💡 Added Tax
      },
    },
    {
      // Stage 3: Sort the results by date string
      $sort: { "_id.date": 1 },
    },
  ];

  let saleData;
  try {
    // Execute the aggregation (Order model is available via import at the top)
    saleData = await Order.aggregate(pipeline);
  } catch (error) {
    console.error("Error aggregating sales data:", error);
    throw new Error("Could not retrieve sales data.");
  }

  // --- Data Processing (JavaScript) ---
  const salesMap = new Map();
  let totalSales = 0;
  let totalNumOrders = 0;

  // Correctly process aggregated data, pulling all fields
  saleData.forEach((entry) => {
    const date = entry?._id.date; // This is the UTC date string from MongoDB
    const sales = entry?.totalSales || 0;
    const numOrders = entry?.totalNumOrders || 0; // Use totalNumOrders from aggregation
    const shipping = entry?.totalShipping || 0; // 💡 Extract Shipping
    const tax = entry?.totalTax || 0; // 💡 Extract Tax

    // 💡 Store all daily metrics
    salesMap.set(date, { sales, numOrders, shipping, tax });
    totalSales += sales;
    totalNumOrders += numOrders;
  });

  // Generate array of dates between start & end date using pure UTC logic
  const datesBetween = getDateBetween(startDate, endDate);

  // Create Final sale data structure, ensuring all days in the range are present
  const finalSaleData = datesBetween.map((date) => {
    const entry = salesMap.get(date);

    return {
      date, // Use the date from datesBetween array
      sales: entry ? entry.sales : 0,
      numOrders: entry ? entry.numOrders : 0,
      shipping: entry ? entry.shipping : 0, // 💡 Include Shipping
      tax: entry ? entry.tax : 0,           // 💡 Include Tax
    };
  });

  return { saleData: finalSaleData, totalSales, totalNumOrders };
}

/**
 * Helper to generate YYYY-MM-DD date strings for every day in the range using UTC logic.
 * This guarantees the keys match MongoDB's $dateToString output.
 */
function getDateBetween(startDate, endDate) {
  const dates = [];
  const oneDayInMs = 24 * 60 * 60 * 1000;

  // 🚨 CRITICAL FIX 1: Create a new Date object representing the START of the first day (UTC)
  // This avoids potential timezone shifting from the input Date objects
  let currentDate = new Date(
    Date.UTC(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate()
    )
  );

  // 🚨 CRITICAL FIX 2: Create a new Date object representing the START of the last day (UTC)
  const finalDateOnlyUTC = new Date(
    Date.UTC(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate()
    )
  );

  // Loop until the current date passes the final date (inclusive)
  while (currentDate.getTime() <= finalDateOnlyUTC.getTime()) {
    // Use UTC methods to extract date parts (guarantees format matches MongoDB)
    const year = currentDate.getUTCFullYear();
    const month = String(currentDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getUTCDate()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;
    dates.push(formattedDate);

    // Increment day using Milliseconds to prevent local timezone calculation errors
    currentDate.setTime(currentDate.getTime() + oneDayInMs);
  }

  return dates;
}


// Get Sale Data => /api/v1/admin/get_seal
export const getSales = catchAsyncErrors(async (req, res, next) => {

  const startDate = new Date(req.query.startDate);
  // Corrected typo 'endtDate' to 'endDate' in local variable name
  const endDate = new Date(req.query.endDate);

  // Set time boundaries for accurate day filtering (start of day to end of day)
  startDate.setUTCHours(0, 0, 0, 0); // Start of day UTC
  endDate.setUTCHours(23, 59, 59, 999); // End of day UTC

  // Get the aggregated data using the final, fixed logic
  const { saleData, totalSales, totalNumOrders } = await getSalesData(startDate, endDate);

  res.status(200).json({
    totalSales,
    totalNumOrders,
    sales: saleData
  });
});
