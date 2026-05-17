import Blog from "../models/blog.js";
import asyncHandler from "express-async-handler";
import { body, validationResult } from "express-validator";

/* ═══════════════════════════════════════════════
   HELPER
═══════════════════════════════════════════════ */
const isObjectId = (str) => /^[a-f\d]{24}$/i.test(str);

/* ═══════════════════════════════════════════════
   @desc    Get all blogs
   @route   GET /api/v1/blogs
   @access  Public
═══════════════════════════════════════════════ */
export const getBlogs = asyncHandler(async (req, res) => {
  const page     = parseInt(req.query.page)  || 1;
  const limit    = parseInt(req.query.limit) || 10;
  const category = req.query.category;
  const search   = req.query.search;
  const sortBy   = req.query.sortBy || "-createdAt";

  let query = {};

  if (category && category !== "all") {
    query.category = category;
  }

  if (search) {
    query.$or = [
      { title:   { $regex: search, $options: "i" } },
      { excerpt: { $regex: search, $options: "i" } },
      { content: { $regex: search, $options: "i" } },
    ];
  }

  // Admin ເຫັນທຸກ blog, public ເຫັນສະເພາະທີ່ publish
  if (!req.user || !["admin", "superAdmin"].includes(req.user.role)) {
    query.isPublished = true;
  }

  const total      = await Blog.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  const blogs = await Blog.find(query)
    .populate("authorId", "name email avatar")
    .select("-content")
    .sort(sortBy)
    .limit(limit)
    .skip((page - 1) * limit);

  res.status(200).json({
    success: true,
    data: {
      blogs,
      pagination: {
        currentPage: page,
        totalPages,
        totalBlogs: total,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    },
  });
});

/* ═══════════════════════════════════════════════
   @desc    Get single blog by ObjectId OR slug
   @route   GET /api/v1/blogs/:id
   @access  Public
   ✅ FIX: ຊອກຫາໄດ້ທັງ ObjectId ແລະ slug
═══════════════════════════════════════════════ */
export const getBlog = asyncHandler(async (req, res) => {
  const param = req.params.id;

  // ✅ ກວດວ່າເປັນ ObjectId ຫຼື slug
  const filter = isObjectId(param)
    ? { _id: param }
    : { slug: param };

  const blog = await Blog.findOne(filter)
    .populate("authorId", "name email avatar bio")
    .populate("comments.user", "name avatar");

  if (!blog) {
    return res.status(404).json({ success: false, message: "ບົດຄວາມບໍ່ພົບ" });
  }

  if (
    !blog.isPublished &&
    (!req.user || !["admin", "superAdmin"].includes(req.user.role))
  ) {
    return res.status(404).json({ success: false, message: "ບົດຄວາມຍັງບໍ່ໄດ້ເຜີຍແຜ່" });
  }

  // Increment view
  await Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } });

  res.status(200).json({ success: true, data: blog });
});

/* ═══════════════════════════════════════════════
   @desc    Create blog
   @route   POST /api/v1/blogs
   @access  Private (Admin/SuperAdmin)
═══════════════════════════════════════════════ */
export const createBlog = [
  body("title")
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("ຫົວຂໍ້ຕ້ອງມີ 5-200 ຕົວອັກສອນ"),

  body("excerpt")
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage("ຄຳອະທິບາຍຕ້ອງມີ 10-500 ຕົວອັກສອນ"),

  // ✅ FIX: strip HTML tags ກ່ອນນັບ ເພາະ ReactQuill ສົ່ງ HTML
  body("content").custom((val) => {
    if (!val) throw new Error("ກະລຸນາປ້ອນເນື້ອຫາ");
    const plain = val.replace(/<[^>]*>/g, "").trim();
    if (plain.length < 50) throw new Error("ເນື້ອຫາຕ້ອງ ≥ 50 ຕົວອັກສອນ");
    return true;
  }),

  body("category")
    .isIn(["tech", "review", "guide", "news"])
    .withMessage("ໝວດໝູ່ບໍ່ຖືກຕ້ອງ"),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Generate slug ຈາກ title
    let slug = req.body.slug ||
      req.body.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim()
        .substring(0, 60);

    // ✅ ຖ້າ slug ຊ້ຳ ໃຫ້ຕໍ່ທ້າຍດ້ວຍ timestamp
    const existing = await Blog.findOne({ slug });
    if (existing) slug = `${slug}-${Date.now()}`;

    // ຄຳນວນ read time ຈາກ plain text
    const plainText = req.body.content.replace(/<[^>]*>/g, "");
    const wordCount = plainText.split(/\s+/).filter(Boolean).length;
    const readTime  = `${Math.max(1, Math.ceil(wordCount / 200))} ນາທີ`;

    const blog = await Blog.create({
      title:          req.body.title,
      excerpt:        req.body.excerpt,
      content:        req.body.content,
      category:       req.body.category,
      tags:           req.body.tags           || [],
      isPublished:    req.body.isPublished     || false,
      seoTitle:       req.body.seoTitle        || "",
      seoDescription: req.body.seoDescription  || "",
      author:         req.body.author          || req.user.name,
      image:          req.body.image           || "",
      images:         Array.isArray(req.body.images) ? req.body.images : [],
      slug,
      authorId:    req.user._id,
      readTime,
      publishedAt: req.body.isPublished ? new Date() : null,
    });

    res.status(201).json({ success: true, data: blog });
  }),
];

/* ═══════════════════════════════════════════════
   @desc    Update blog
   @route   PUT /api/v1/blogs/:id
   @access  Private (Admin/Owner)
═══════════════════════════════════════════════ */
export const updateBlog = [
  body("title").optional().trim().isLength({ min: 5, max: 200 }),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: "ບໍ່ພົບຂໍ້ມູນ" });
    }

    // Auth check (middleware isBlogOwnerOrAdmin ຈັດການຢູ່ແລ້ວ)
    if (
      blog.authorId.toString() !== req.user._id.toString() &&
      !["admin", "superAdmin"].includes(req.user.role)
    ) {
      return res.status(403).json({ success: false, message: "ບໍ່ມີສິດແກ້ໄຂ" });
    }

    // ✅ ຄຳນວນ readTime ໃໝ່ຖ້າ content ປ່ຽນ
    if (req.body.content) {
      const plain     = req.body.content.replace(/<[^>]*>/g, "");
      const wordCount = plain.split(/\s+/).filter(Boolean).length;
      req.body.readTime = `${Math.max(1, Math.ceil(wordCount / 200))} ນາທີ`;
    }

    // ✅ ອັບເດດ publishedAt ຖ້າ isPublished ປ່ຽນ
    if (req.body.isPublished && !blog.publishedAt) {
      req.body.publishedAt = new Date();
    }

    const updated = await Blog.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: updated });
  }),
];

/* ═══════════════════════════════════════════════
   @desc    Delete blog
   @route   DELETE /api/v1/blogs/:id
   @access  Private (Admin/Owner)
═══════════════════════════════════════════════ */
export const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return res.status(404).json({ success: false, message: "ບົດຄວາມບໍ່ພົບ" });
  }

  if (
    blog.authorId.toString() !== req.user._id.toString() &&
    !["admin", "superAdmin"].includes(req.user.role)
  ) {
    return res.status(403).json({ success: false, message: "ບໍ່ມີສິດໃນການລຶບ" });
  }

  await blog.deleteOne();

  res.status(200).json({ success: true, message: "ລຶບບົດຄວາມສຳເລັດ" });
});

/* ═══════════════════════════════════════════════
   @desc    Get trending blogs
   @route   GET /api/v1/blogs/trending
   @access  Public
═══════════════════════════════════════════════ */
export const getTrendingBlogs = asyncHandler(async (req, res) => {
  const blogs = await Blog.find({ isPublished: true })
    .populate("authorId", "name email avatar")
    .select("-content")
    .sort({ views: -1, "likes.length": -1 })
    .limit(10);

  res.status(200).json({ success: true, data: blogs });
});

/* ═══════════════════════════════════════════════
   @desc    Get related blogs
   @route   GET /api/v1/blogs/:id/related
   @access  Public
═══════════════════════════════════════════════ */
export const getRelatedBlogs = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    return res.status(404).json({ success: false, message: "ບໍ່ພົບຂໍ້ມູນ" });
  }

  const related = await Blog.find({
    _id:         { $ne: blog._id },
    category:    blog.category,
    isPublished: true,
  })
    .populate("authorId", "name email avatar")
    .select("-content")
    .limit(4);

  res.status(200).json({ success: true, data: related });
});

/* ═══════════════════════════════════════════════
   @desc    Add comment
   @route   POST /api/v1/blogs/:id/comments
   @access  Private
   ✅ FIX: ຮັບທັງ "text" ແລະ "comment" field
           ແລະ save ເປັນ "text" ຕາມ Model
═══════════════════════════════════════════════ */
export const addComment = asyncHandler(async (req, res) => {
  // ✅ ຮັບໄດ້ທັງ 2 field ເພື່ອ compatibility
  const text = (req.body.text || req.body.comment || "").trim();

  if (!text || text.length < 3) {
    return res.status(400).json({
      success: false,
      message: "ຄອມເມັນຕ້ອງມີຢ່າງໜ້ອຍ 3 ຕົວອັກສອນ",
    });
  }

  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return res.status(404).json({ success: false, message: "ບົດຄວາມບໍ່ພົບ" });
  }

  if (!blog.isPublished) {
    return res.status(403).json({ success: false, message: "ບົດຄວາມຍັງບໍ່ເຜີຍແຜ່" });
  }

  const newComment = {
    user:      req.user._id,
    text,               // ✅ ໃຊ້ "text" ຕາມ Blog Model schema
    createdAt: new Date(),
  };

  blog.comments.push(newComment);
  await blog.save();

  // Populate user info ກ່ອນ return
  await blog.populate("comments.user", "name avatar");
  const saved = blog.comments[blog.comments.length - 1];

  res.status(201).json({
    success: true,
    message: "ເພີ່ມຄອມເມັນສຳເລັດ",
    data: saved,
  });
});

/* ═══════════════════════════════════════════════
   @desc    Get blogs by category
   @route   GET /api/v1/blogs/category/:category
   @access  Public
═══════════════════════════════════════════════ */
export const getBlogsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 10;

  const query = { category, isPublished: true };

  const total      = await Blog.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  const blogs = await Blog.find(query)
    .populate("authorId", "name email avatar")
    .select("-content")
    .sort("-createdAt")
    .limit(limit)
    .skip((page - 1) * limit);

  res.status(200).json({
    success: true,
    data: {
      blogs,
      pagination: {
        currentPage: page,
        totalPages,
        totalBlogs: total,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    },
  });
});

/* ═══════════════════════════════════════════════
   @desc    Increment view
   @route   POST /api/v1/blogs/:id/view
   @access  Public
═══════════════════════════════════════════════ */
export const incrementView = asyncHandler(async (req, res) => {
  const blog = await Blog.findOneAndUpdate(
    { _id: req.params.id, isPublished: true },
    { $inc: { views: 1 } },
    { new: true }
  );

  if (!blog) {
    return res.status(404).json({ success: false, message: "ບົດຄວາມບໍ່ພົບ" });
  }

  res.status(200).json({ success: true, views: blog.views });
});

/* ═══════════════════════════════════════════════
   @desc    Like / Unlike blog
   @route   POST /api/v1/blogs/:id/like
   @access  Private
═══════════════════════════════════════════════ */
export const likeBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return res.status(404).json({ success: false, message: "ບົດຄວາມບໍ່ພົບ" });
  }

  const userId  = req.user._id.toString();
  const isLiked = blog.likes.some((item) => {
    // likes array ອາດຈະເປັນ [ObjectId] ຫຼື [{user: ObjectId}]
    const id = item?.user ? item.user.toString() : item.toString();
    return id === userId;
  });

  if (isLiked) {
    blog.likes = blog.likes.filter((item) => {
      const id = item?.user ? item.user.toString() : item.toString();
      return id !== userId;
    });
  } else {
    blog.likes.push(req.user._id);
  }

  await blog.save();

  res.status(200).json({
    success:    true,
    liked:      !isLiked,
    totalLikes: blog.likes.length,
  });
});