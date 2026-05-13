import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Category title is required"], trim: true, maxlength: 100 },
    slug: {
      type: String,
      required: [true, "Category slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, "Slug can contain only lowercase letters, numbers and hyphens"],
    },
    key: { type: String, trim: true, lowercase: true, default: function () { return this.slug; } },
    img: { type: String, trim: true, default: "/images/categories/electronics.avif" },
  },
  { timestamps: true }
);

export default mongoose.model("Category", categorySchema);
