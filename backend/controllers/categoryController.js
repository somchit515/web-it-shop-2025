import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Category from "../models/category.js";
import Product from "../models/product.js";
import ErrorHandler from "../utils/errorHandler.js";

const normalizeSlug = (slug = "") => slug.toString().trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

export const getCategories = catchAsyncErrors(async (req, res) => {
  const categories = await Category.find().sort({ title: 1 });
  res.status(200).json({ success: true, categories });
});

export const createCategory = catchAsyncErrors(async (req, res, next) => {
  const title = (req.body.title || "").trim();
  const slug = normalizeSlug(req.body.slug || title);
  const key = normalizeSlug(req.body.key || slug);
  const img = (req.body.img || "").trim() || "/images/categories/electronics.avif";

  if (!title || !slug) return next(new ErrorHandler("Title and slug are required", 400));
  if (!/^[a-z0-9-]+$/.test(slug)) return next(new ErrorHandler("Invalid slug format", 400));

  const exists = await Category.findOne({ slug: new RegExp(`^${slug}$`, "i") });
  if (exists) return next(new ErrorHandler("Category slug already exists", 409));

  const category = await Category.create({ title, slug, key, img });
  res.status(201).json({ success: true, category });
});

export const updateCategory = catchAsyncErrors(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) return next(new ErrorHandler("Category not found", 404));

  const title = (req.body.title || category.title).trim();
  const slug = normalizeSlug(req.body.slug || category.slug);
  const key = normalizeSlug(req.body.key || slug);
  const img = (req.body.img || category.img || "").trim() || "/images/categories/electronics.avif";

  if (!/^[a-z0-9-]+$/.test(slug)) return next(new ErrorHandler("Invalid slug format", 400));

  const duplicated = await Category.findOne({ _id: { $ne: category._id }, slug: new RegExp(`^${slug}$`, "i") });
  if (duplicated) return next(new ErrorHandler("Category slug already exists", 409));

  const oldKey = category.key;
  category.title = title;
  category.slug = slug;
  category.key = key;
  category.img = img;
  await category.save();

  if (oldKey !== key) {
    await Product.updateMany({ category: oldKey }, { $set: { category: key } });
  }

  res.status(200).json({ success: true, category });
});

export const deleteCategory = catchAsyncErrors(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) return next(new ErrorHandler("Category not found", 404));

  const usedCount = await Product.countDocuments({ category: category.key });
  if (usedCount > 0) {
    return next(new ErrorHandler(`Cannot delete: ${usedCount} products still use this category`, 409));
  }

  await category.deleteOne();
  res.status(200).json({ success: true });
});
