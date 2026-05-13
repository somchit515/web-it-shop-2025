codex/add-a-greeting-feature-azctjh
import { useCallback, useEffect, useState } from "react";

export default function useCategories() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/v1/categories");
      const data = await res.json();
      setCategories(Array.isArray(data?.categories) ? data.categories : []);
    } catch {
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { categories, isLoading, refresh };

import { useEffect, useState } from "react";
import { getCategories } from "./categories";

export default function useCategories() {
  const [categories, setCategories] = useState(getCategories());

  useEffect(() => {
    const refresh = () => setCategories(getCategories());
    window.addEventListener("storage", refresh);
    window.addEventListener("categories:updated", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("categories:updated", refresh);
    };
  }, []);

  return categories;
master
}
