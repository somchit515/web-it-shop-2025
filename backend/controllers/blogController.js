import Blog from '../models/blog.js';
import asyncHandler from 'express-async-handler';
import { body, validationResult } from 'express-validator';

// @desc    Get all blogs with pagination, filtering, and search
// @route   GET /api/v1/blogs
// @access  Public
export const getBlogs = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    const search = req.query.search;
    const sortBy = req.query.sortBy || '-createdAt';

    let query = {};
    if (category && category !== 'all') {
        query.category = category;
    }
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { excerpt: { $regex: search, $options: 'i' } },
            { content: { $regex: search, $options: 'i' } }
        ];
    }

    // Only show published blogs to public, Admin sees everything
    if (!req.user || req.user.role !== 'admin') {
        query.isPublished = true;
    }

    const total = await Blog.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    const blogs = await Blog.find(query)
        .populate('authorId', 'name email avatar')
        .select('-content') // Optimization: Don't send full content in lists
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
                hasPrev: page > 1
            }
        }
    });
});

// @desc    Get single blog by ID
// @route   GET /api/v1/blogs/:id
// @access  Public
export const getBlog = asyncHandler(async (req, res) => {
    const blog = await Blog.findById(req.params.id)
        .populate('authorId', 'name email avatar bio')
        .populate('comments.user', 'name avatar');

    if (!blog) {
        return res.status(404).json({ success: false, message: 'ບົດຄວາມບໍ່ພົບ' });
    }

    if (!blog.isPublished && (!req.user || req.user.role !== 'admin')) {
        return res.status(404).json({ success: false, message: 'ບົດຄວາມຍັງບໍ່ໄດ້ເຜີຍແຜ່' });
    }

    // Atomic View Increment
    blog.views += 1;
    await blog.save();

    res.status(200).json({
        success: true,
        data: blog
    });
});

// @desc    Create new blog
// @route   POST /api/v1/blogs
// @access  Private (Admin only)
export const createBlog = [
    body('title').trim().isLength({ min: 5, max: 200 }).withMessage('ຫົວຂໍ້ຕ້ອງມີ 5-200 ຕົວອັກສອນ'),
    body('excerpt').trim().isLength({ min: 10, max: 500 }).withMessage('ຄຳອະທິບາຍຕ້ອງມີ 10-500 ຕົວອັກສອນ'),
    body('content').trim().isLength({ min: 50 }).withMessage('ເນື້ອຫາຕ້ອງມີຢ່າງນ້ອຍ 50 ຕົວອັກສອນ'),
    body('category').isIn(['tech', 'review', 'guide', 'news']).withMessage('ຫມວດໝູ່ບໍ່ຖືກຕ້ອງ'),

    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const slug = req.body.title
            .toLowerCase()
            .replace(/[^a-zA-Z0-9ຂ-ຮໜ-ໝ ]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 60);

        const existingBlog = await Blog.findOne({ slug });
        const wordCount = req.body.content.split(' ').length;
        const readTime = Math.ceil(wordCount / 200);

        const blog = await Blog.create({
            ...req.body,
            slug: existingBlog ? `${slug}-${Date.now()}` : slug,
            authorId: req.user._id,
            readTime: `${readTime} ນາທີ`,
            publishedAt: req.body.isPublished ? new Date() : null
        });

        res.status(201).json({ success: true, data: blog });
    })
];

// @desc    Update blog
// @route   PUT /api/v1/blogs/:id
// @access  Private (Admin/Owner)
export const updateBlog = [
    body('title').optional().trim().isLength({ min: 5 }),
    asyncHandler(async (req, res) => {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ success: false, message: 'ບໍ່ພົບຂໍ້ມູນ' });

        // Authorization check
        if (blog.authorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'ບໍ່ມີສິດແກ້ໄຂ' });
        }

        if (req.body.content) {
            const wordCount = req.body.content.split(' ').length;
            req.body.readTime = `${Math.ceil(wordCount / 200)} ນາທີ`;
        }

        const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, req.body, { 
            new: true, 
            runValidators: true 
        });

        res.status(200).json({ success: true, data: updatedBlog });
    })
];

// @desc    Delete blog
// @route   DELETE /api/v1/blogs/:id
// @access  Private (Admin/Owner)
export const deleteBlog = asyncHandler(async (req, res) => {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
        return res.status(404).json({ success: false, message: 'ບົດຄວາມບໍ່ພົບ' });
    }

    if (blog.authorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'ບໍ່ມີສິດໃນການລຶບ' });
    }

    // FIXED: Use deleteOne() instead of deprecated remove()
    await blog.deleteOne();

    res.status(200).json({ success: true, message: 'ລຶບບົດຄວາມສຳເລັດ' });
});

// @desc    Get trending blogs
// @route   GET /api/v1/blogs/trending
// @access  Public
export const getTrendingBlogs = asyncHandler(async (req, res) => {
    const blogs = await Blog.find({ isPublished: true })
        .populate('authorId', 'name email avatar')
        .select('-content')
        .sort('-views -likes')
        .limit(10);

    res.status(200).json({ success: true, data: blogs });
});

// @desc    Get related blogs
// @route   GET /api/v1/blogs/:id/related
// @access  Public
export const getRelatedBlogs = asyncHandler(async (req, res) => {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: 'ບໍ່ພົບຂໍ້ມູນ' });

    const relatedBlogs = await Blog.find({
        _id: { $ne: blog._id },
        category: blog.category,
        isPublished: true
    })
    .populate('authorId', 'name email avatar')
    .select('-content')
    .limit(4);

    res.status(200).json({ success: true, data: relatedBlogs });
});

// @desc    Add comment to blog
// @route   POST /api/v1/blogs/:id/comments
// @access  Private
export const addComment = asyncHandler(async (req, res) => {
    const { comment } = req.body;

    if (!comment || comment.trim().length < 3) {
        return res.status(400).json({
            success: false,
            message: 'ຄອມເມັນຕ້ອງມີຢ່າງນ້ອຍ 3 ຕົວອັກສອນ'
        });
    }

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
        return res.status(404).json({
            success: false,
            message: 'ບົດຄວາມບໍ່ພົບ'
        });
    }

    if (!blog.isPublished) {
        return res.status(403).json({
            success: false,
            message: 'ບົດຄວາມຍັງບໍ່ເຜີຍແຜ່'
        });
    }

    const newComment = {
        user: req.user._id,
        comment: comment.trim(),
        createdAt: new Date()
    };

    blog.comments.push(newComment);
    await blog.save();

    res.status(201).json({
        success: true,
        message: 'ເພີ່ມຄອມເມັນສຳເລັດ',
        data: newComment
    });
});


// @desc    Get blogs by category
// @route   GET /api/v1/blogs/category/:category
// @access  Public
export const getBlogsByCategory = asyncHandler(async (req, res) => {
    const { category } = req.params;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const query = {
        category,
        isPublished: true
    };

    const total = await Blog.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    const blogs = await Blog.find(query)
        .populate('authorId', 'name email avatar')
        .select('-content')
        .sort('-createdAt')
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
                hasPrev: page > 1
            }
        }
    });
});

// @desc    Increment blog view count
// @route   PUT /api/v1/blogs/:id/view
// @access  Public
export const incrementView = asyncHandler(async (req, res) => {
    const blog = await Blog.findOneAndUpdate(
        { _id: req.params.id, isPublished: true },
        { $inc: { views: 1 } },
        { new: true }
    );

    if (!blog) {
        return res.status(404).json({
            success: false,
            message: 'ບົດຄວາມບໍ່ພົບ'
        });
    }

    res.status(200).json({
        success: true,
        views: blog.views
    });
});

// @desc    Like / Unlike blog
// @route   PUT /api/v1/blogs/:id/like
// @access  Private
export const likeBlog = asyncHandler(async (req, res) => {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
        return res.status(404).json({
            success: false,
            message: 'ບົດຄວາມບໍ່ພົບ'
        });
    }

    const userId = req.user._id.toString();

    const isLiked = blog.likes.some(
        (id) => id.toString() === userId
    );

    if (isLiked) {
        // Unlike
        blog.likes = blog.likes.filter(
            (id) => id.toString() !== userId
        );
    } else {
        // Like
        blog.likes.push(req.user._id);
    }

    await blog.save();

    res.status(200).json({
        success: true,
        liked: !isLiked,
        totalLikes: blog.likes.length
    });
});
