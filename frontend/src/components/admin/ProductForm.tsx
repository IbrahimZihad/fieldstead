"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api, ApiClientError } from "@/lib/api";
import { Category, Product } from "@/types";

interface Props {
  categories: Category[];
  product?: Product;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function ProductForm({ categories, product }: Props) {
  const { token } = useAuth();
  const router = useRouter();
  const isEdit = Boolean(product);

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(String(product?.price ?? ""));
  const [stock, setStock] = useState(String(product?.stock ?? "0"));
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? "");
  const [categoryId, setCategoryId] = useState(
    String(product?.categoryId ?? categories[0]?.id ?? "")
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !slug.trim() || !categoryId) {
      setError("Name, slug, and category are required.");
      return;
    }
    const priceNum = Number(price);
    const stockNum = Number(stock);
    if (Number.isNaN(priceNum) || priceNum < 0) {
      setError("Price must be a positive number.");
      return;
    }
    if (Number.isNaN(stockNum) || stockNum < 0) {
      setError("Stock must be zero or more.");
      return;
    }

    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim(),
      price: priceNum,
      stock: stockNum,
      imageUrl: imageUrl.trim() || `https://picsum.photos/seed/${slug.trim()}/600/600`,
      categoryId: Number(categoryId),
    };

    setSubmitting(true);
    try {
      if (isEdit && product) {
        await api.put(`/products/${product.id}`, payload, token);
      } else {
        await api.post("/products", payload, token);
      }
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiClientError ? err.message : "Could not save product."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xl">
      <div>
        <label className="block text-sm mb-1" htmlFor="name">
          Name
        </label>
        <input
          id="name"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          required
          className="w-full border border-line bg-paper-raised px-3 py-2 text-sm focus:outline-none focus:border-forest"
        />
      </div>

      <div>
        <label className="block text-sm mb-1" htmlFor="slug">
          Slug
        </label>
        <input
          id="slug"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setSlugTouched(true);
          }}
          required
          className="w-full border border-line bg-paper-raised px-3 py-2 text-sm focus:outline-none focus:border-forest"
        />
      </div>

      <div>
        <label className="block text-sm mb-1" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full border border-line bg-paper-raised px-3 py-2 text-sm focus:outline-none focus:border-forest"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1" htmlFor="price">
            Price (USD)
          </label>
          <input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="w-full border border-line bg-paper-raised px-3 py-2 text-sm focus:outline-none focus:border-forest"
          />
        </div>
        <div>
          <label className="block text-sm mb-1" htmlFor="stock">
            Stock
          </label>
          <input
            id="stock"
            type="number"
            min="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            required
            className="w-full border border-line bg-paper-raised px-3 py-2 text-sm focus:outline-none focus:border-forest"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm mb-1" htmlFor="category">
          Category
        </label>
        <select
          id="category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
          className="w-full border border-line bg-paper-raised px-3 py-2 text-sm focus:outline-none focus:border-forest"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm mb-1" htmlFor="imageUrl">
          Image URL
        </label>
        <input
          id="imageUrl"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="Leave blank to use a placeholder photo"
          className="w-full border border-line bg-paper-raised px-3 py-2 text-sm focus:outline-none focus:border-forest"
        />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 bg-forest text-paper px-5 py-3 text-sm hover:bg-forest-dark transition-colors disabled:opacity-60 w-fit"
      >
        {submitting ? "Saving…" : isEdit ? "Save changes" : "Create product"}
      </button>
    </form>
  );
}
