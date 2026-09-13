"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api, ApiClientError } from "@/lib/api";
import { Product } from "@/types";

export default function AdminProductsPage() {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    api
      .get<{ products: Product[] }>("/products?limit=100")
      .then((res) => setProducts(res.products))
      .catch(() => setError("Could not load products."));
  };

  useEffect(load, []);

  const handleDelete = async (product: Product) => {
    if (!token) return;
    if (!confirm(`Delete "${product.name}"? This can't be undone.`)) return;
    try {
      await api.del(`/products/${product.id}`, token);
      setProducts((prev) => prev?.filter((p) => p.id !== product.id) ?? null);
    } catch (err) {
      alert(err instanceof ApiClientError ? err.message : "Could not delete product.");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-3xl">Products</h1>
        <Link
          href="/admin/products/new"
          className="bg-forest text-paper px-4 py-2 text-sm hover:bg-forest-dark transition-colors"
        >
          + New product
        </Link>
      </div>

      {error && <p className="text-danger text-sm mb-4">{error}</p>}

      {!products ? (
        <p className="text-ink-muted">Loading…</p>
      ) : products.length === 0 ? (
        <p className="text-ink-muted">No products yet.</p>
      ) : (
        <div className="border-t border-line">
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 py-2 border-b border-line text-xs text-ink-muted uppercase tracking-wide">
            <span>Product</span>
            <span>Price</span>
            <span>Stock</span>
            <span></span>
          </div>
          {products.map((product) => (
            <div
              key={product.id}
              className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center py-3 border-b border-line text-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 border border-line bg-paper shrink-0 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate">{product.name}</p>
                  <p className="text-xs text-ink-muted truncate">
                    {product.category?.name}
                  </p>
                </div>
              </div>
              <span>${Number(product.price).toFixed(2)}</span>
              <span className={product.stock === 0 ? "text-danger" : ""}>
                {product.stock}
              </span>
              <div className="flex gap-3 whitespace-nowrap">
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className="text-forest underline"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(product)}
                  className="text-ink-muted hover:text-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
