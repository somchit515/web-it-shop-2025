import express from "express";
import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";
import { createCategory, deleteCategory, getCategories, updateCategory } from "../controllers/categoryController.js";

const router = express.Router();

router.route('/categories').get(getCategories);
router.route('/admin/categories').post(isAuthenticatedUser, authorizeRoles('admin', 'superAdmin'), createCategory);
router.route('/admin/categories/:id')
  .put(isAuthenticatedUser, authorizeRoles('admin', 'superAdmin'), updateCategory)
  .delete(isAuthenticatedUser, authorizeRoles('admin', 'superAdmin'), deleteCategory);

export default router;
