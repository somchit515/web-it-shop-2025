/**
 * seedCategories.js
 * Run: node backend/scripts/seedCategories.js
 * ຈຸດປະສົງ: restore ໝວດໝູ່ default ຄືນ (upsert — ບໍ່ overwrite ຖ້າມີຢູ່ແລ້ວ)
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config({ path: "backend/config/config.env" });

import Category from "../models/category.js";

const CATEGORIES = [
  {
    title: "Laptops",
    slug: "laptops",
    key: "laptops",
    img: "/images/categories/laptops.jpg",
  },
  {
    title: "Cameras",
    slug: "cameras",
    key: "cameras",
    img: "/images/categories/cameras.jpg",
  },
  {
    title: "Headphones",
    slug: "headphones",
    key: "headphones",
    img: "/images/categories/headphones.jpg",
  },
  {
    title: "PC & Computer",
    slug: "pc",
    key: "pc",
    img: "/images/categories/PC.jpg",
  },
  {
    title: "Electronics",
    slug: "electronics",
    key: "electronics",
    img: "/images/categories/electronics.avif",
  },
  {
    title: "Gaming Products",
    slug: "gaming-products",
    key: "gaming-products",
    img: "/images/categories/gaming.jpg",
  },
  {
    title: "Smartphones",
    slug: "smartphones",
    key: "smartphones",
    img: "/images/categories/smartphones.jpg",
  },
  {
    title: "Books",
    slug: "books",
    key: "books",
    img: "/images/categories/books.webp",
  },
  {
    title: "Sports Items",
    slug: "sports",
    key: "sports",
    img: "/images/categories/sports.avif",
  },
];

async function seed() {
  await mongoose.connect(process.env.DB_URI);
  console.log("✅ Connected to MongoDB");

  let inserted = 0;
  let skipped  = 0;

  for (const cat of CATEGORIES) {
    const exists = await Category.findOne({ slug: cat.slug });
    if (exists) {
      console.log(`⏭  Skip (already exists): ${cat.title}`);
      skipped++;
    } else {
      await Category.create(cat);
      console.log(`✅ Created: ${cat.title}`);
      inserted++;
    }
  }

  console.log(`\n🎉 Done — inserted: ${inserted}, skipped: ${skipped}`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
