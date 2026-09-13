import Link from "next/link";
import { Product } from "@/types";

export default function ProductCard({ product }: { product: Product }) {
  const price = Number(product.price).toFixed(2);
  const outOfStock = product.stock <= 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block border border-line bg-paper-raised"
    >
      <div className="aspect-square overflow-hidden border-b border-line bg-paper">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>
      <div className="p-4">
        {product.category && (
          <p className="text-xs text-ink-muted mb-1">{product.category.name}</p>
        )}
        <h3 className="font-serif text-lg leading-snug">{product.name}</h3>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm">${price}</span>
          {outOfStock && (
            <span className="text-xs text-danger">Out of stock</span>
          )}
        </div>
      </div>
    </Link>
  );
}
