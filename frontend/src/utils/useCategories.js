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
}
