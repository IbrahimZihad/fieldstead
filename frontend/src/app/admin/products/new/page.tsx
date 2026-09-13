"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Category } from "@/types";
import ProductForm from "@/components/admin/ProductForm";

export default function NewProductPage() {
  const [categories, setCategories] = useState<Category[] | null>(null);

  useEffect(() => {
    api
      .get<{ categories: Category[] }>("/categories")
      .then((res) => setCategories(res.categories));
  }, []);

  return (
    <div>
      <h1 className="font-serif text-3xl mb-8">New product</h1>
      {!categories ? (
        <p className="text-ink-muted">Loading…</p>
      ) : categories.length === 0 ? (
        <p className="text-ink-muted">
          Create a category first before adding products.
        </p>
      ) : (
        <ProductForm categories={categories} />
      )}
    </div>
  );
}
