import Link from "next/link";
import { api } from "@/lib/api";
import { Product, Category } from "@/types";
import ProductCard from "@/components/ProductCard";

interface ProductsResponse {
  products: Product[];
}

interface CategoriesResponse {
  categories: Category[];
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  const [productsRes, categoriesRes] = await Promise.all([
    api.get<ProductsResponse>(
      `/products${category ? `?category=${encodeURIComponent(category)}` : ""}`
    ),
    api.get<CategoriesResponse>("/categories"),
  ]);

  const activeCategory = categoriesRes.categories.find(
    (c) => c.slug === category
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <section className="mb-12 max-w-2xl">
        <h1 className="font-serif text-4xl sm:text-5xl leading-tight">
          Everyday goods, made to last.
        </h1>
        <p className="mt-4 text-ink-muted leading-relaxed">
          A small, considered selection of stationery, kitchen, home, and
          travel goods — chosen for materials that age well and stay useful.
        </p>
      </section>

      <div className="flex flex-wrap items-center gap-2 border-y border-line py-4 mb-10">
        <Link
          href="/"
          className={`px-3 py-1 text-sm border ${
            !activeCategory
              ? "border-forest text-forest"
              : "border-transparent text-ink-muted hover:text-ink"
          }`}
        >
          All
        </Link>
        {categoriesRes.categories.map((c) => (
          <Link
            key={c.id}
            href={`/?category=${c.slug}`}
            className={`px-3 py-1 text-sm border ${
              activeCategory?.id === c.id
                ? "border-forest text-forest"
                : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {productsRes.products.length === 0 ? (
        <p className="text-ink-muted">No products found in this category yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {productsRes.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
