// models/Blog.js
import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'ກະລຸນາປ້ອນຫົວຂໍ້'],
    trim: true,
    maxLength: [200, 'ຫົວຂໍ້ຕ້ອງບໍ່ເກີນ 200 ຕົວອັກສອນ']
  },
  excerpt: {
    type: String,
    required: [true, 'ກະລຸນາປ້ອນຄຳອະທິບາຍ'],
    maxLength: [500, 'ຄຳອະທິບາຍຕ້ອງບໍ່ເກີນ 500 ຕົວອັກສອນ']
  },
  content: {
    type: String,
    required: [true, 'ກະລຸນາປ້ອນເນື້ອຫາ']
  },
  category: {
    type: String,
    required: [true, 'ກະລຸນາເລືອກຫມວດໝູ່'],
    enum: {
      values: ['tech', 'review', 'guide', 'news'],
      message: 'ຫມວດໝູ່ຕ້ອງເປັນ tech, review, guide ຫຼື news'
    }
  },
  author: {
    type: String,
    required: [true, 'ກະລຸນາປ້ອນຊື່ຜູ້ຂຽນ']
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'ຕ້ອງມີຜູ້ຂຽນ']
  },
  image: {
    type: String,
    default: ''
  },
  images: [{
    type: String,
    default: ''
  }],
  tags: [{
    type: String,
    trim: true
  }],
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: [true, 'ກະລຸນາປ້ອນຄວາມຄິດເຫັນ'],
      maxLength: [500, 'ຄວາມຄິດເຫັນຕ້ອງບໍ່ເກີນ 500 ຕົວອັກສອນ']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  },
  readTime: {
    type: String,
    default: '5 นาที'
  },
  seoTitle: {
    type: String,
    maxLength: [60, 'SEO title ຕ້ອງບໍ່ເກີນ 60 ຕົວອັກສອน']
  },
  seoDescription: {
    type: String,
    maxLength: [160, 'SEO description ຕ້ອງບໍ່ເກີນ 160 ຕົວອັກສອน']
  },
  slug: {
    type: String,
    unique: true,
    index: true
  }
}, {
  timestamps: true
});

const Blog = mongoose.model('Blog', blogSchema);
export default Blog;