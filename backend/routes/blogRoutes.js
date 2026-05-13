// routes/blogRoutes.js
import express from 'express';
import {
  isAuthenticatedUser,
  isAdmin,
  isBlogOwnerOrAdmin,
} from '../middlewares/auth.js';
import {
  getBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  likeBlog,
  addComment,
  getBlogsByCategory,
  getTrendingBlogs,
  getRelatedBlogs,
  incrementView,
} from '../controllers/blogController.js';

const router = express.Router();

// ── Public routes ──────────────────────────────
router.get('/',                    getBlogs);
router.get('/trending',            getTrendingBlogs);
router.get('/category/:category',  getBlogsByCategory);
router.get('/:id',                 getBlog);
router.get('/:id/related',         getRelatedBlogs);
router.post('/:id/view',           incrementView);

// ── Protected (login required) ─────────────────
router.post('/:id/like',     isAuthenticatedUser, likeBlog);
router.post('/:id/comments', isAuthenticatedUser, addComment);

// ── Admin routes (admin + superAdmin) ──────────
// ✅ ໃຊ້ isAdmin ດຽວ — ຕ້ອງໃຫ້ isAdmin check ທັງ 'admin' ແລະ 'superAdmin'
router.post('/',    isAuthenticatedUser, isAdmin, createBlog);
router.put('/:id',  isAuthenticatedUser, isAdmin, isBlogOwnerOrAdmin, updateBlog);
router.delete('/:id', isAuthenticatedUser, isAdmin, isBlogOwnerOrAdmin, deleteBlog);

export default router;