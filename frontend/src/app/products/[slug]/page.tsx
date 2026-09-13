import { notFound } from "next/navigation";
import { api, ApiClientError } from "@/lib/api";
import { Product } from "@/types";
import AddToCartForm from "@/components/AddToCartForm";

async function getProduct(slug: string) {
  try {
    const res = await api.get<{ product: Product }>(`/products/${slug}`);
    return res.product;
  } catch (err) {
    if (err instanceof ApiClientError && err.status === 404) {
      return null;
    }
    throw err;
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  const price = Number(product.price).toFixed(2);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="grid md:grid-cols-2 gap-12">
        <div className="aspect-square border border-line bg-paper-raised overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>

        <div>
          {product.category && (
            <p className="text-xs text-ink-muted uppercase tracking-wide mb-2">
              {product.category.name}
            </p>
          )}
          <h1 className="font-serif text-3xl sm:text-4xl leading-tight">
            {product.name}
          </h1>
          <p className="mt-4 text-xl">${price}</p>
          <p className="mt-6 text-ink-muted leading-relaxed max-w-md">
            {product.description}
          </p>
          <p className="mt-3 text-xs text-ink-muted">
            {product.stock > 0
              ? `${product.stock} in stock`
              : "Out of stock"}
          </p>

          <div className="mt-8">
            <AddToCartForm product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
