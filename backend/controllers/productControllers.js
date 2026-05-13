import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Product from "../models/product.js";
import Order from "../models/orders.js";
import APIFilters from "../utils/apiFilter.js";
import ErrorHandler from "../utils/errorHandler.js";

import { delete_file, upload_file } from "../utils/cloudinary.js" 


// Get all products => /api/v1/products
export const getProducts = catchAsyncErrors(async (req, res, next) => {
  const resPerPage = 8; // Products per page for pagination

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

// Upload Product Images  => api/v1/admin/products/:id/upload_images
export const uploadProductImages = catchAsyncErrors(async (req, res, next) => {

    // 1. ตรวจสอบ Product ID และกำหนดตัวแปร 'product'
    let product = await Product.findById(req.params.id).exec(); 

    if (!product) {
        return next(new ErrorHandler("Product not Found", 404));
    }

    // 🔴 FIX #1 (User Validation)
    if (!product.user && req.user) {
        // ASSUMPTION: req.user.id is set by Auth Middleware
        product.user = req.user.id; 
    }
    
    // 2. ดึงและตรวจสอบ Base64 Array
    const newImages = req.body.images; 

    if (!newImages || !Array.isArray(newImages) || newImages.length === 0) {
        return next(new ErrorHandler("Please select at least one image to upload.", 400));
    }

    let results = [];
    const uploader = (Image) => upload_file(Image, "shopit/products"); 

    try {
        // 3. 🟢 ใช้ Promise.allSettled เพื่อประมวลผลทั้งหมด
        const promises = newImages.map(uploader);
        results = await Promise.allSettled(promises); 

    } catch (error) {
        // Log สำหรับข้อผิดพลาดที่เกิดขึ้นก่อนการส่ง Promise (เช่น Memory/Syntax Error)
        console.error("Critical upload preparation error:", error); 
        return next(new ErrorHandler("An unexpected error occurred during image preparation.", 500));
    }

    // 4. 🟢 กรองเฉพาะรูปภาพที่อัปโหลด 'fulfilled' และมี public_id/url ครบถ้วน
    const validUrls = results
        .filter(r => r.status === 'fulfilled' && r.value && r.value.public_id && r.value.url)
        .map(r => r.value);
        
    // 4b. (สำคัญมาก) Log Failures เพื่อการแก้ไขที่ปลายเหตุ
    const failedUploads = results.filter(r => r.status === 'rejected');
    if (failedUploads.length > 0) {
        console.warn(`🚨 ${failedUploads.length} images failed to upload. Reasons:`, failedUploads.map(f => f.reason.message || f.reason));
    }
    
    // 5. ตรวจสอบว่ามีภาพที่อัปโหลดสำเร็จหรือไม่
    if (validUrls.length === 0 && product.images.length === 0) {
        // หากไม่มีรูปภาพสำเร็จเลย และสินค้าเดิมไม่มีรูปภาพ ให้โยน Error
        return next(new ErrorHandler("All image uploads failed. Product must have at least one image.", 500));
    }
    
    // 6. รวมภาพใหม่เข้ากับภาพเดิม
    if (validUrls.length > 0) {
        product.images.push(...validUrls);
    }
    
    // 7. บันทึก (ไม่จำเป็นต้องมี validationOptions อีกต่อไป)
    await product.save(); 

    res.status(200).json({
        success: true,
        product,
    });
});



// 💡 NEW CONTROLLER: Delete Product Image  => api/v1/admin/products/:id/delete_image
export const deleteProductImage = catchAsyncErrors(async (req, res, next) => {
    
    // 🛑 CRITICAL FIX: Destructure public_id from req.body
    const { public_id } = req.body; 

    // 1. Validation Check (This is the source of your persistent error message)
    if (!public_id) {
        return next(new ErrorHandler('Missing required parameter - public_id', 400));
    }
    
    // 2. ตรวจสอบ Product
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler("Product not Found", 404));
    }

    // 3. Delete file from Cloudinary 
    //    Use the correctly destructured public_id
    const isDeleted = await delete_file(public_id);
    
    // 4. Remove image reference from DB
    if(isDeleted) {
        // ✅ Use public_id for filtering
        product.images = product?.images?.filter(
            // Check if the current image public_id does NOT match the one to be deleted
            (img) => img.public_id !== public_id 
        )

        await product?.save();
    }


    res.status(200).json({
        success: true,
        product,
        message: "Image deleted successfully",
    });
});


// Delete Product  => api/v1/products/:id
export const deleteProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not Found", 404));
  }

  // Deleting img
  for( let i=0; i<product?.images?.length; i++) {
    await delete_file(product?.images[i].public_id)
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
  const product = await Product.findById(req.query.id).populate("reviews.user")

  if (!product) {
    return next(new ErrorHandler("Product not Found", 404));
  }

  res.status(200).json({
    reviews: product.reviews,
  });
});

// delete Reviews  => api/v1/admin/reviews
// delete Reviews  => api/v1/admin/reviews
export const deleteReview = catchAsyncErrors(async (req, res, next) => {
    // 💡 FIX 1: ดึง productId และ reviewId จาก req.query
    // (สมมติว่า Frontend ส่งค่ามาในรูปแบบ: /api/v1/admin/reviews?productId=...&id=...)
    const productId = req.query.productId;
    const reviewId = req.query.id; // ใช้ 'id' ตาม RTK Query convention หรือตามที่คุณต้องการ
    // 
    // หากคุณต้องการดึง reviewId จาก req.body ให้ใช้: const reviewId = req.body.id; หรือ req.body.reviewId;
    // แต่ผมแนะนำให้ใช้ req.query ทั้งคู่สำหรับการลบ

    // 1. ตรวจสอบ Product
    let product = await Product.findById(productId);

    if (!product) {
        return next(new ErrorHandler("Product not Found", 404));
    }

    // 2. ตรวจสอบว่ามี reviewId หรือไม่
    if (!reviewId) {
        return next(new ErrorHandler("Review ID is required", 400));
    }

    // 3. กรองรีวิวที่จะลบออก (นี่คือรีวิวที่เหลืออยู่)
    const reviews = product.reviews.filter(
        // 🔴 FIX 2: กรองเฉพาะรีวิวที่ _id ไม่ตรงกับ reviewId
        (review) => review._id && review._id.toString() !== reviewId.toString()
    );

    // 4. 🟢 FIX 3: คำนวณค่าใหม่โดยใช้รายการ 'reviews' ที่ถูกกรองแล้ว
    const numOfReviews = reviews.length; // ใช้รายการที่ถูกกรอง
    
    const ratings =
        numOfReviews === 0
            ? 0
            : reviews.reduce((acc, item) => item.rating + acc, 0) / numOfReviews; // ใช้รายการที่ถูกกรอง

    // 5. อัปเดต Product ในฐานข้อมูล
    // 🔴 FIX 4: ใช้ตัวแปร productId จาก Query ที่ดึงมา (และส่งค่า reviews ที่ถูกกรองแล้ว)
    product = await Product.findByIdAndUpdate(
        productId,
        { reviews, numOfReviews, ratings }, // ส่ง reviews ใหม่ที่ถูกกรอง
        { new: true, runValidators: true } // runValidators: true เป็นทางเลือกที่ดี
    );

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

// Get Best Selling Products  => api/v1/best-selling
export const getBestSellingProducts = catchAsyncErrors(async (req, res, next) => {
  const resPerPage = 8;
  const currentPage = Number(req.query.page) || 1;
  const skip = resPerPage * (currentPage - 1);

  // ดึงสินค้าที่มีจำนวน reviews มากที่สุด (สินค้าขายดี)
  const products = await Product.find()
    .sort({ numOfReviews: -1 })
    .limit(resPerPage)
    .skip(skip);

  const totalProducts = await Product.countDocuments();

  res.status(200).json({
    success: true,
    products,
    resPerPage,
    filteredProductsCount: totalProducts,
  });
});

// Get Products by Category  => api/v1/category/:category
export const getProductsByCategory = catchAsyncErrors(async (req, res, next) => {
  const resPerPage = 8;
  const currentPage = Number(req.query.page) || 1;
  const skip = resPerPage * (currentPage - 1);
  const category = req.params.category;

  // ตรวจสอบว่า category มีอยู่ในรายการที่อนุญาต
  const validCategories = [
    "laptops",
    "cameras",
    "headphones",
    "outDoors",
    "pc",
    "electronics",
    "gammings",
    "smartphones",
    "books",
    "sports"
  ];

  if (!validCategories.includes(category)) {
    return next(new ErrorHandler("Invalid category", 400));
  }

  const products = await Product.find({ category })
    .limit(resPerPage)
    .skip(skip);

  const totalProducts = await Product.countDocuments({ category });

  res.status(200).json({
    success: true,
    products,
    resPerPage,
    filteredProductsCount: totalProducts,
  });
});

// ✅ Batch check stock — รับรายการสินค้าจาก cart แล้วตอบกลับสถานะแต่ละชิ้น
//    Frontend ใช้ก่อน checkout เพื่อตรวจว่าของยังพอหรือไม่
//    POST /api/v1/products/check-stock
//    body: { items: [{ product, quantity }, ...] }
export const checkStock = catchAsyncErrors(async (req, res, next) => {
  const { items = [] } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "items array is required",
    });
  }

  const ids = items
    .map((it) => it.product)
    .filter(Boolean);

  // ดึงสินค้ามาทีเดียว (1 query) → เร็วกว่าวน findById
  const products = await (await import("../models/product.js")).default
    .find({ _id: { $in: ids } })
    .select("_id name stock images price");

  const productMap = new Map(products.map((p) => [String(p._id), p]));

  const results = items.map((it) => {
    const requested = Number(it.quantity || 0);
    const product = productMap.get(String(it.product));

    if (!product) {
      return {
        product: it.product,
        ok: false,
        reason: "product_not_found",
        requested,
        available: 0,
      };
    }

    const ok = product.stock >= requested && requested > 0;
    return {
      product: String(product._id),
      name: product.name,
      ok,
      reason: ok
        ? "ok"
        : product.stock === 0
        ? "out_of_stock"
        : "insufficient_stock",
      requested,
      available: product.stock,
      currentPrice: product.price, // เผื่อ frontend อยากเตือนว่าราคาเปลี่ยน
    };
  });

  const allOk = results.every((r) => r.ok);

  res.status(200).json({
    success: true,
    ok: allOk,
    items: results,
  });
});

// Get All Categories  => api/v1/categories
export const getAllCategories = catchAsyncErrors(async (req, res, next) => {
  const categories = [
    "laptops",
      "cameras",
      "headphones",
      "outdoors",
      "pc",
      "electronics",
      "gaming",
      "smartphones",
      "books",
      "sports"
  ];

  res.status(200).json({
    success: true,
    categories,
  });
});


