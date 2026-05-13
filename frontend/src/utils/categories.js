// src/utils/categories.js
export const CATEGORIES = [
  { key: "laptops", title: "Laptops", slug: "laptops", img: "/images/categories/labtop.avif" },
  { key: "cameras", title: "Cameras", slug: "cameras", img: "/images/categories/cameras.jpg" },
  { key: "headphones", title: "Headphones", slug: "headphones", img: "/images/categories/headphones.jpg" },
  { key: "pc", title: "PC & Computer", slug: "pc", img: "/images/categories/pc.jpg" },
  { key: "electronics", title: "Electronics", slug: "electronics", img: "/images/categories/electronics.avif" },
  { key: "gammings", title: "Gaming Products", slug: "gaming-products", img: "/images/categories/gaming.jpg" },
  { key: "smartphones", title: "Smartphones", slug: "smartphones", img: "/images/categories/smartphones.jpg" },
  { key: "books", title: "Books", slug: "books", img: "/images/categories/books.webp" },
  { key: "sports", title: "Sports Items", slug: "sports", img: "/images/categories/sports.avif" },
];

export const slugToKey = (slug) => {
  const found = CATEGORIES.find((c) => c.slug === slug);
  return found ? found.key : slug;
};

export const keyToSlug = (key) => {
  const found = CATEGORIES.find((c) => c.key === key);
  return found ? found.slug : key;
};

export const slugToTitle = (slug) => {
  const found = CATEGORIES.find((c) => c.slug === slug);
  return found ? found.title : slug;
};
