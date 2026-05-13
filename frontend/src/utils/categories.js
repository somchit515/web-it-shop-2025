 codex/add-a-greeting-feature-hj6ijz

 codex/add-a-greeting-feature-azctjh

const STORAGE_KEY = "ithubb_dynamic_categories_v1";

 master
master
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

 codex/add-a-greeting-feature-hj6ijz

codex/add-a-greeting-feature-azctjh
 master
export const normalizeSlug = (slug = "") =>
  slug.toString().trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

export const slugToKey = (slug, categories = DEFAULT_CATEGORIES) => {
 codex/add-a-greeting-feature-hj6ijz


const normalize = (text = "") => text.toString().trim();

export const getCategories = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CATEGORIES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_CATEGORIES;
  } catch {
    return DEFAULT_CATEGORIES;
  }
};

export const saveCategories = (categories) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  window.dispatchEvent(new Event("categories:updated"));
};

export const upsertCategory = (category) => {
  const all = getCategories();
  const key = normalize(category.key || category.slug).toLowerCase().replace(/\s+/g, "-");
  const slug = normalize(category.slug || key).toLowerCase().replace(/\s+/g, "-");

  if (!key || !slug) return { ok: false, message: "Category key/slug is required" };
  if (all.some((c) => c.slug === slug || c.key === key)) {
    return { ok: false, message: "Category slug/key already exists" };
  }

  const next = [...all, {
    key,
    slug,
    title: normalize(category.title || slug),
    img: normalize(category.img || "/images/categories/electronics.avif"),
  }];

  saveCategories(next);
  return { ok: true, categories: next };
};

export const removeCategoryBySlug = (slug) => {
  const next = getCategories().filter((c) => c.slug !== slug);
  saveCategories(next);
  return next;
};

export const slugToKey = (slug, categories = getCategories()) => {
 master
 master
  const found = categories.find((c) => c.slug === slug);
  return found ? found.key : slug;
};

 codex/add-a-greeting-feature-hj6ijz
export const keyToSlug = (key, categories = DEFAULT_CATEGORIES) => {

 codex/add-a-greeting-feature-azctjh
export const keyToSlug = (key, categories = DEFAULT_CATEGORIES) => {

export const keyToSlug = (key, categories = getCategories()) => {
 master
master
  const found = categories.find((c) => c.key === key);
  return found ? found.slug : key;
};

 codex/add-a-greeting-feature-hj6ijz
export const slugToTitle = (slug, categories = DEFAULT_CATEGORIES) => {

 codex/add-a-greeting-feature-azctjh
export const slugToTitle = (slug, categories = DEFAULT_CATEGORIES) => {

export const slugToTitle = (slug, categories = getCategories()) => {
 master
 master
  const found = categories.find((c) => c.slug === slug);
  return found ? found.title : slug;
};

export const CATEGORIES = DEFAULT_CATEGORIES;
