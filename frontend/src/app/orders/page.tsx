"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Order } from "@/types";

const statusStyles: Record<Order["status"], string> = {
  pending: "text-ochre",
  processing: "text-ochre",
  shipped: "text-forest",
  delivered: "text-forest",
  cancelled: "text-danger",
};

const paymentLabel: Record<Order["paymentStatus"], string> = {
  unpaid: "Unpaid",
  pending_verification: "Payment pending verification",
  paid: "Paid",
};

const paymentStyles: Record<Order["paymentStatus"], string> = {
  unpaid: "text-ink-muted",
  pending_verification: "text-ochre",
  paid: "text-forest",
};

const methodLabel: Record<Order["paymentMethod"], string> = {
  cod: "Cash on delivery",
  bkash: "bKash",
  nagad: "Nagad",
};

function OrdersList() {
  const { user, token, loading } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const placedId = searchParams.get("placed");

  useEffect(() => {
    if (loading) return;
    if (!token) {
      setOrders([]);
      return;
    }
    api
      .get<{ orders: Order[] }>("/orders/my", token)
      .then((res) => setOrders(res.orders))
      .catch(() => setError("Could not load your orders."));
  }, [token, loading]);

  if (loading || orders === null) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <p className="text-ink-muted">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="font-serif text-3xl mb-4">Orders</h1>
        <p className="text-ink-muted">
          <Link href="/login?next=/orders" className="text-forest underline">
            Sign in
          </Link>{" "}
          to see your order history.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-serif text-3xl mb-2">Your orders</h1>

      {placedId && (
        <p className="mb-6 border border-forest text-forest text-sm px-4 py-3 bg-paper-raised w-fit">
          Order #{placedId} placed successfully.
        </p>
      )}

      {error && <p className="text-danger text-sm mb-6">{error}</p>}

      {orders.length === 0 ? (
        <p className="text-ink-muted">
          No orders yet.{" "}
          <Link href="/" className="text-forest underline">
            Browse the shop
          </Link>
          .
        </p>
      ) : (
        <div className="border-t border-line">
          {orders.map((order) => (
            <div key={order.id} className="border-b border-line py-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                <p className="font-serif text-lg">Order #{order.id}</p>
                <p className={`text-sm capitalize ${statusStyles[order.status]}`}>
                  {order.status}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-x-2 text-xs text-ink-muted mb-4">
                <span>
                  Placed {new Date(order.createdAt).toLocaleDateString()}
                </span>
                <span>·</span>
                <span>Ships to {order.shippingAddress}</span>
                <span>·</span>
                <span>{methodLabel[order.paymentMethod]}</span>
                <span
                  className={`font-medium ${paymentStyles[order.paymentStatus]}`}
                >
                  ({paymentLabel[order.paymentStatus]})
                </span>
              </div>
              <ul className="text-sm text-ink-muted space-y-1 mb-3">
                {order.items.map((item) => (
                  <li key={item.id} className="flex justify-between">
                    <span>
                      {item.quantity} × {item.productName}
                    </span>
                    <span>
                      ${(Number(item.price) * item.quantity).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-sm font-medium">
                Total: ${Number(order.totalAmount).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense>
      <OrdersList />
    </Suspense>
  );
}
