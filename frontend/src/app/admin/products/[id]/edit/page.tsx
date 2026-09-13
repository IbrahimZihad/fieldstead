"use client";

import { use, useEffect, useState } from "react";
import { api, ApiClientError } from "@/lib/api";
import { Category, Product } from "@/types";
import ProductForm from "@/components/admin/ProductForm";

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.get<{ categories: Category[] }>("/categories"),
      api.get<{ product: Product }>(`/products/${id}`),
    ])
      .then(([catRes, prodRes]) => {
        setCategories(catRes.categories);
        setProduct(prodRes.product);
      })
      .catch((err) => {
        setError(
          err instanceof ApiClientError ? err.message : "Could not load product."
        );
      });
  }, [id]);

  return (
    <div>
      <h1 className="font-serif text-3xl mb-8">Edit product</h1>
      {error && <p className="text-danger text-sm">{error}</p>}
      {!error && (!categories || !product) && (
        <p className="text-ink-muted">Loading…</p>
      )}
      {categories && product && (
        <ProductForm categories={categories} product={product} />
      )}
    </div>
  );
}
