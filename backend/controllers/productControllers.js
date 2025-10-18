import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import product from "../models/product.js";
import Product from "../models/product.js";
import Order from "../models/orders.js";
import APIFilters from "../utils/apiFilter.js";
import ErrorHandler from "../utils/errorHandler.js";

// Get all products => /api/v1/products
export const getProducts = catchAsyncErrors(async (req, res, next) => {
  const resPerPage = 4; // Products per page for pagination

  // Initialize API filters with search and filters
  const apiFilters = new APIFilters(Product.find(), req.query)
    .search() // Handles search functionality (e.g., search by name)
    .filters(); // Apply any additional filters (e.g., category, price range)

  // Fetch products after applying search and filters
  let products = await apiFilters.query;
  let filteredProductsCount = products.length;

  
  // Apply pagination (for current page)
  apiFilters.pagination(resPerPage);

  // Clone the query to avoid any side effects during pagination
  products = await apiFilters.query.clone();

  // Send response with products and pagination info
  res.status(200).json({
    success: true, // Indicate successful request
    resPerPage, // Number of products per page
    filteredProductsCount, // Total number of products after filters (before pagination)
    products, // Array of final products (after filters and pagination)
  });
});

// Create new Product  => api/v1/admin/products
export const newProduct = catchAsyncErrors(async (req, res) => {
  req.body.user = req.user._id;

  const product = await Product.create(req.body);

  res.status(200).json({
    product,
  });
});

// Get single Product  => api/v1/products/:id
export const getProductsDetails = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate('reviews.user');

  if (!product) {
    return next(new ErrorHandler("Product not Found", 404));
  }

  res.status(200).json({
    product,
  });
});


// Get single admin  => api/v1/admin/products/
export const getAdminProducts = catchAsyncErrors(async (req, res, next) => {
  const products = await Product.find ()

  
  res.status(200).json({
    products,
  });
});


// Update Product details  => api/v1/products/:id
export const updateProduct = catchAsyncErrors(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not Found", 404));
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.status(200).json({
    product,
  });
});

// Delete Product  => api/v1/products/:id
export const deleteProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not Found", 404));
  }

  await product.deleteOne();

  res.status(200).json({
    message: "Product Deleted",
  });
});

// Create/Update Product Reviews  => api/v1/reviews
export const createProductReview = catchAsyncErrors(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req?.user?._id,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);

  if (!product) {
    return next(new ErrorHandler("Product not Found", 404));
  }

  // Check if the product is already reviewed by the same user
  const isReviewed = product.reviews.find(
    (r) => r.user.toString() === req?.user._id.toString()
  );

  if (isReviewed) {
    // Update the existing review
    product.reviews.forEach((review) => {
      if (review.user.toString() === req?.user._id.toString()) {
        review.comment = comment;
        review.rating = rating;
      }
    });
  } else {
    // Add new review
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  // Calculate the average rating
  product.ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  // Save the updated product with new/updated review
  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: "Review added/updated successfully",
  });
});

// get Product Reviews  => api/v1/reviews
export const getProductReview = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.id);

  if (!product) {
    return next(new ErrorHandler("Product not Found", 404));
  }

  res.status(200).json({
    reviews: product.reviews,
  });
});

// delete Reviews  => api/v1/admin/reviews
export const deleteReview = catchAsyncErrors(async (req, res, next) => {
  let product = await Product.findById(req.query.productId);

  if (!product) {
    return next(new ErrorHandler("Product not Found", 404));
  }

  // Ensure the reviewId is provided
  const reviewId = req.query.reviewId;
  if (!reviewId) {
    return next(new ErrorHandler("Review ID is required", 400));
  }

  // Check if the reviewId is valid
  const reviewExists = product.reviews.some(
    (review) => review._id && review._id.toString() === reviewId.toString()
  );

  if (!reviewExists) {
    return next(new ErrorHandler("Review not found", 404));
  }

  // Filter out the review to delete
  const reviews = product.reviews.filter(
    (review) => review._id && review._id.toString() !== reviewId.toString()
  );

  const numOfReviews = product.reviews.length;

  // Recalculate the average rating
  const ratings =
    numOfReviews === 0
      ? 0
      
      : product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        numOfReviews;

 product = await Product.findByIdAndUpdate(req.query.productId,{reviews, numOfReviews, ratings}, {new:true});

  res.status(200).json({
    success: true,
    product,
    message: "Review deleted successfully",
  });
});


// can user review => api/v1/can_review
export const canUserReview = catchAsyncErrors(async (req, res, next) => {
    // 1. Find orders placed by the current user (req.user._id)
    // 2. Filter these orders to ensure they contain the specific product (req.query.productId)
    const orders = await Order.find({
        user: req.user._id,
        "orderItems.product": req.query.productId
    });

    // NOTE: If you are using Mongoose's lean() or indexing, 
    // you might need to check "orderItems.product" depending on your schema.
    // I've corrected "orderItem" to "orderItems" as is common in Mongoose schemas.

    // Check if the user has any order containing the product
    if (orders.length === 0) {
        // 💡 FIX: The 'return' keyword must be immediately followed by the response
        return res.status(200).json({ canReview: false, message: "User has not purchased this product." });
    }

    // If orders are found, the user can review
    res.status(200).json({
        canReview: true,
        message: "User is eligible to review this product."
    });
});
