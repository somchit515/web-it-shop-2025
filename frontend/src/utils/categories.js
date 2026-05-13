export const DEFAULT_CATEGORIES = [
  { key: "laptops", title: "Laptops", slug: "laptops", img: "/images/categories/labtop.avif" },
  { key: "cameras", title: "Cameras", slug: "cameras", img: "/images/categories/cameras.jpg" },
  { key: "headphones", title: "Headphones", slug: "headphones", img: "/images/categories/headphones.jpg" },
  { key: "pc", title: "PC & Computer", slug: "pc", img: "/images/categories/pc.jpg" },
  { key: "electronics", title: "Electronics", slug: "electronics", img: "/images/categories/electronics.avif" },
  { key: "gaming", title: "Gaming Products", slug: "gaming-products", img: "/images/categories/gaming.jpg" },
  { key: "smartphones", title: "Smartphones", slug: "smartphones", img: "/images/categories/smartphones.jpg" },
  { key: "books", title: "Books", slug: "books", img: "/images/categories/books.webp" },
  { key: "sports", title: "Sports Items", slug: "sports", img: "/images/categories/sports.avif" },
];

export const normalizeSlug = (slug = "") =>
  slug.toString().trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

export const slugToKey = (slug, categories = DEFAULT_CATEGORIES) => {
  const found = categories.find((c) => c.slug === slug);
  return found ? found.key : slug;
};

export const keyToSlug = (key, categories = DEFAULT_CATEGORIES) => {
  const found = categories.find((c) => c.key === key);
  return found ? found.slug : key;
};

export const slugToTitle = (slug, categories = DEFAULT_CATEGORIES) => {
  const found = categories.find((c) => c.slug === slug);
  return found ? found.title : slug;
};
