import express from "express";
import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js"; // Ensure correct imports
import {
  allOrder,
  deleteOrder,
  getOrderDetails,
  myOrder,
  newOrder,
  updateOrder,
  getSales
} from "../controllers/orderController.js"; // Ensure correct imports

const router = express.Router();

// Create a new order
router.route("/orders/new").post(isAuthenticatedUser, newOrder);

router.route("/orders/:id").get(isAuthenticatedUser, getOrderDetails);

router.route("/me/orders").get(isAuthenticatedUser, myOrder);


router
  .route("/admin/get_sales")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getSales);
router
  .route("/admin/orders")
  .get(isAuthenticatedUser, authorizeRoles("admin"), allOrder);

  
router
.route("/admin/orders/:id")
.put(isAuthenticatedUser, authorizeRoles("admin"), updateOrder)
.delete(isAuthenticatedUser, authorizeRoles("admin"), deleteOrder);

// Export the router for use in your main app file
export default router;
