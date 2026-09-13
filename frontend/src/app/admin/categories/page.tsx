"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, ApiClientError } from "@/lib/api";
import { Category } from "@/types";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function AdminCategoriesPage() {
  const { token } = useAuth();
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    api
      .get<{ categories: Category[] }>("/categories")
      .then((res) => setCategories(res.categories));
  };

  useEffect(load, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await api.post("/categories", { name: name.trim(), slug: slugify(name) }, token);
      setName("");
      load();
    } catch (err) {
      setError(
        err instanceof ApiClientError ? err.message : "Could not create category."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (category: Category) => {
    if (!confirm(`Delete "${category.name}"?`)) return;
    try {
      await api.del(`/categories/${category.id}`, token);
      load();
    } catch (err) {
      alert(
        err instanceof ApiClientError ? err.message : "Could not delete category."
      );
    }
  };

  return (
    <div>
      <h1 className="font-serif text-3xl mb-8">Categories</h1>

      <form onSubmit={handleCreate} className="flex gap-3 mb-8 max-w-md">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name"
          className="flex-1 border border-line bg-paper-raised px-3 py-2 text-sm focus:outline-none focus:border-forest"
        />
        <button
          type="submit"
          disabled={submitting}
          className="bg-forest text-paper px-4 py-2 text-sm hover:bg-forest-dark transition-colors disabled:opacity-60"
        >
          Add
        </button>
      </form>
      {error && <p className="text-danger text-sm mb-4">{error}</p>}

      {!categories ? (
        <p className="text-ink-muted">Loading…</p>
      ) : (
        <div className="border-t border-line max-w-md">
          {categories.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between py-3 border-b border-line text-sm"
            >
              <span>{c.name}</span>
              <button
                onClick={() => handleDelete(c)}
                className="text-ink-muted hover:text-danger text-xs"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
