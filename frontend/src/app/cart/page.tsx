"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { api, ApiClientError } from "@/lib/api";
import { Order, PaymentMethod } from "@/types";

const MERCHANT_NUMBERS: Record<Exclude<PaymentMethod, "cod">, string> = {
  bkash: "01812-345678",
  nagad: "01812-345678",
};

export default function CartPage() {
  const { items, updateQuantity, removeItem, clear, totalPrice } = useCart();
  const { user, token } = useAuth();
  const router = useRouter();

  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [transactionId, setTransactionId] = useState("");
  const [paymentPhone, setPaymentPhone] = useState("");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setError(null);

    if (!user || !token) {
      router.push("/login?next=/cart");
      return;
    }
    if (!address.trim()) {
      setError("Please add a shipping address.");
      return;
    }
    if (paymentMethod !== "cod" && (!transactionId.trim() || !paymentPhone.trim())) {
      setError(
        "Please enter the transaction ID and the phone number you paid from."
      );
      return;
    }

    setPlacing(true);
    try {
      const res = await api.post<{ order: Order }>(
        "/orders",
        {
          items: items.map((i) => ({
            productId: i.product.id,
            quantity: i.quantity,
          })),
          shippingAddress: address.trim(),
          paymentMethod,
          ...(paymentMethod !== "cod"
            ? {
                transactionId: transactionId.trim(),
                paymentPhone: paymentPhone.trim(),
              }
            : {}),
        },
        token
      );
      clear();
      router.push(`/orders?placed=${res.order.id}`);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Something went wrong placing your order.");
      }
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="font-serif text-3xl mb-4">Your cart</h1>
        <p className="text-ink-muted">
          Your cart is empty.{" "}
          <Link href="/" className="text-forest underline">
            Continue shopping
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-serif text-3xl mb-8">Your cart</h1>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 border-t border-line">
          {items.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="flex gap-4 py-5 border-b border-line"
            >
              <Link
                href={`/products/${product.slug}`}
                className="w-20 h-20 border border-line bg-paper-raised shrink-0 overflow-hidden"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </Link>

              <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <Link
                    href={`/products/${product.slug}`}
                    className="font-serif text-lg hover:text-forest"
                  >
                    {product.name}
                  </Link>
                  <p className="text-sm text-ink-muted">
                    ${Number(product.price).toFixed(2)} each
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-line">
                    <button
                      onClick={() =>
                        updateQuantity(product.id, quantity - 1)
                      }
                      className="px-2 py-1 text-ink-muted hover:text-ink"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="px-3 py-1 text-sm min-w-[2rem] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(product.id, quantity + 1)
                      }
                      className="px-2 py-1 text-ink-muted hover:text-ink"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm w-16 text-right">
                    ${(Number(product.price) * quantity).toFixed(2)}
                  </span>
                  <button
                    onClick={() => removeItem(product.id)}
                    className="text-xs text-ink-muted hover:text-danger"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border border-line bg-paper-raised p-6 h-fit">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-ink-muted">Subtotal</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <p className="text-xs text-ink-muted mb-6">
            Shipping calculated at fulfillment.
          </p>

          <label className="block text-sm mb-2" htmlFor="address">
            Shipping address
          </label>
          <textarea
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
            placeholder="Street, city, postcode, country"
            className="w-full border border-line bg-paper px-3 py-2 text-sm mb-5 focus:outline-none focus:border-forest"
          />

          <p className="block text-sm mb-2">Payment method</p>
          <div className="flex flex-col gap-2 mb-4">
            {(
              [
                { value: "cod", label: "Cash on delivery" },
                { value: "bkash", label: "bKash (manual transfer)" },
                { value: "nagad", label: "Nagad (manual transfer)" },
              ] as { value: PaymentMethod; label: string }[]
            ).map((option) => (
              <label
                key={option.value}
                className={`flex items-center gap-2 border px-3 py-2 text-sm cursor-pointer ${
                  paymentMethod === option.value
                    ? "border-forest text-forest"
                    : "border-line text-ink"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={option.value}
                  checked={paymentMethod === option.value}
                  onChange={() => setPaymentMethod(option.value)}
                  className="accent-current"
                />
                {option.label}
              </label>
            ))}
          </div>

          {paymentMethod !== "cod" && (
            <div className="mb-5 border border-line bg-paper p-4">
              <p className="text-xs text-ink-muted mb-3 leading-relaxed">
                Send{" "}
                <span className="text-ink font-medium">
                  ${totalPrice.toFixed(2)}
                </span>{" "}
                to{" "}
                <span className="text-ink font-medium">
                  {MERCHANT_NUMBERS[paymentMethod]}
                </span>{" "}
                ({paymentMethod === "bkash" ? "bKash" : "Nagad"} Merchant),
                then enter the transaction details below. We&apos;ll verify
                and confirm your payment.
              </p>

              <label className="block text-sm mb-1" htmlFor="txnId">
                Transaction ID
              </label>
              <input
                id="txnId"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="e.g. 8N7K2P9Q1R"
                className="w-full border border-line bg-paper-raised px-3 py-2 text-sm mb-3 focus:outline-none focus:border-forest"
              />

              <label className="block text-sm mb-1" htmlFor="payPhone">
                Phone number you paid from
              </label>
              <input
                id="payPhone"
                value={paymentPhone}
                onChange={(e) => setPaymentPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full border border-line bg-paper-raised px-3 py-2 text-sm focus:outline-none focus:border-forest"
              />
            </div>
          )}

          {error && <p className="text-sm text-danger mb-4">{error}</p>}

          {!user && (
            <p className="text-xs text-ink-muted mb-4">
              You&apos;ll be asked to sign in before placing your order.
            </p>
          )}

          <button
            onClick={handleCheckout}
            disabled={placing}
            className="w-full bg-forest text-paper px-5 py-3 text-sm hover:bg-forest-dark transition-colors disabled:opacity-60"
          >
            {placing ? "Placing order…" : "Place order"}
          </button>
        </div>
      </div>
    </div>
  );
}
