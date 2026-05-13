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
}
