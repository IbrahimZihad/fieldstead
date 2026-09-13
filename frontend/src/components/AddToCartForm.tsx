"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { Product } from "@/types";

export default function AddToCartForm({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const router = useRouter();
  const outOfStock = product.stock <= 0;

  const handleAdd = () => {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    router.push("/cart");
  };

  if (outOfStock) {
    return (
      <p className="text-danger text-sm border border-line px-4 py-3 bg-paper-raised w-fit">
        Currently out of stock.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-w-xs">
      <div className="flex items-center border border-line w-fit">
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="px-3 py-2 text-ink-muted hover:text-ink"
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span className="px-4 py-2 text-sm min-w-[2.5rem] text-center">
          {quantity}
        </span>
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
          className="px-3 py-2 text-ink-muted hover:text-ink"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleAdd}
          className="flex-1 border border-forest text-forest px-5 py-3 text-sm hover:bg-forest hover:text-paper transition-colors"
        >
          {added ? "Added" : "Add to cart"}
        </button>
        <button
          onClick={handleBuyNow}
          className="flex-1 bg-forest text-paper px-5 py-3 text-sm hover:bg-forest-dark transition-colors"
        >
          Buy now
        </button>
      </div>
    </div>
  );
}
