import express from "express";
import {
  canUserReview,
  createProductReview,
  deleteProduct,
  deleteReview,
  getAdminProducts,
  getProductReview,
  getProducts,
  getProductsDetails,
  newProduct,
  updateProduct,
  uploadProductImages,
  deleteProductImage,
  getBestSellingProducts,
  getProductsByCategory,
  getAllCategories
} from "../controllers/productControllers.js";
import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";
const router = express.Router();

router
  .route("/products")
  .get(getProducts);
router
  .route("/admin/products")
  .post(isAuthenticatedUser, authorizeRoles("admin", "superAdmin"), newProduct);

router
  .route("/admin/products")
  .get(isAuthenticatedUser, authorizeRoles("admin", "superAdmin"), getAdminProducts);
router.route("/products/:id").get(getProductsDetails);

router
  .route('/admin/products/:id/upload_images') // หรืออาจจะเป็นชื่ออื่น แต่ต้องตรงกับ Frontend
  .put(isAuthenticatedUser, authorizeRoles("admin", "superAdmin"), uploadProductImages);
router
  .route('/admin/products/:id/delete_image')
  .put(isAuthenticatedUser, authorizeRoles("admin", "superAdmin"), deleteProductImage);
router
  .route("/admin/products/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin", "superAdmin"), updateProduct);
router
  .route("/admin/products/:id")
  .delete(isAuthenticatedUser, authorizeRoles("admin", "superAdmin"), deleteProduct);

router
  .route("/reviews")
  .get(isAuthenticatedUser, getProductReview)
  .put(isAuthenticatedUser, createProductReview);



router
  .route("/admin/reviews")
  .delete(isAuthenticatedUser, authorizeRoles( "superAdmin"), deleteReview);

router
  .route("/can_review")
  .get(isAuthenticatedUser, canUserReview);


  // เส้นทาง API สำหรับสินค้าขายดี
router
.route("/best-selling")
.get(getBestSellingProducts);

// เส้นทาง API สำหรับสินค้าตามหมวดหมู่
router
.route("/category/:category")
.get(getProductsByCategory);

// เส้นทาง API สำหรับรายการหมวดหมู่ทั้งหมด
router
.route("/categories")
.get(getAllCategories);




export default router;
