import { useCallback, useEffect, useState } from "react";
import { DEFAULT_CATEGORIES } from "./categories";

export default function useCategories() {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/categories");
      const data = await res.json();
      if (data.success && Array.isArray(data.categories) && data.categories.length > 0) {
        setCategories(data.categories);
      } else {
        setCategories(DEFAULT_CATEGORIES);
      }
    } catch {
      setCategories(DEFAULT_CATEGORIES);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    window.addEventListener("categories:updated", load);
    return () => window.removeEventListener("categories:updated", load);
  }, [load]);

  return { categories, isLoading, refresh: load };
}
