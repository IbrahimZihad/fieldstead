"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, ApiClientError } from "@/lib/api";
import { Order, OrderStatus, PaymentStatus } from "@/types";

const orderStatuses: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const paymentStatuses: PaymentStatus[] = ["unpaid", "pending_verification", "paid"];

const methodLabel: Record<Order["paymentMethod"], string> = {
  cod: "Cash on delivery",
  bkash: "bKash",
  nagad: "Nagad",
};

export default function AdminOrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | "needs_verification">("all");

  const load = () => {
    if (!token) return;
    api
      .get<{ orders: Order[] }>("/orders", token)
      .then((res) => setOrders(res.orders))
      .catch(() => setError("Could not load orders."));
  };

  useEffect(load, [token]);

  const handleStatusChange = async (order: Order, status: OrderStatus) => {
    setSavingId(order.id);
    try {
      await api.put(`/orders/${order.id}/status`, { status }, token);
      setOrders(
        (prev) =>
          prev?.map((o) => (o.id === order.id ? { ...o, status } : o)) ?? null
      );
    } catch (err) {
      alert(err instanceof ApiClientError ? err.message : "Could not update order.");
    } finally {
      setSavingId(null);
    }
  };

  const handlePaymentChange = async (
    order: Order,
    paymentStatus: PaymentStatus
  ) => {
    setSavingId(order.id);
    try {
      await api.put(`/orders/${order.id}/payment`, { paymentStatus }, token);
      setOrders(
        (prev) =>
          prev?.map((o) => (o.id === order.id ? { ...o, paymentStatus } : o)) ??
          null
      );
    } catch (err) {
      alert(err instanceof ApiClientError ? err.message : "Could not update payment.");
    } finally {
      setSavingId(null);
    }
  };

  const visibleOrders =
    filter === "needs_verification"
      ? orders?.filter((o) => o.paymentStatus === "pending_verification")
      : orders;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="font-serif text-3xl">Orders</h1>
        <div className="flex gap-2 text-sm">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 border ${
              filter === "all" ? "border-forest text-forest" : "border-line text-ink-muted"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("needs_verification")}
            className={`px-3 py-1 border ${
              filter === "needs_verification"
                ? "border-forest text-forest"
                : "border-line text-ink-muted"
            }`}
          >
            Needs verification
          </button>
        </div>
      </div>

      {error && <p className="text-danger text-sm mb-4">{error}</p>}

      {!visibleOrders ? (
        <p className="text-ink-muted">Loading…</p>
      ) : visibleOrders.length === 0 ? (
        <p className="text-ink-muted">No orders here.</p>
      ) : (
        <div className="border-t border-line">
          {visibleOrders.map((order) => (
            <div key={order.id} className="border-b border-line py-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                <p className="font-serif text-lg">
                  Order #{order.id} · ${Number(order.totalAmount).toFixed(2)}
                </p>
                <p className="text-xs text-ink-muted">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <p className="text-xs text-ink-muted mb-3">
                Ships to {order.shippingAddress}
              </p>

              <ul className="text-sm text-ink-muted mb-4 space-y-1">
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.quantity} × {item.productName}
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap items-end gap-6">
                <div>
                  <label className="block text-xs text-ink-muted mb-1">
                    Order status
                  </label>
                  <select
                    value={order.status}
                    disabled={savingId === order.id}
                    onChange={(e) =>
                      handleStatusChange(order, e.target.value as OrderStatus)
                    }
                    className="border border-line bg-paper-raised px-2 py-1 text-sm capitalize"
                  >
                    {orderStatuses.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-ink-muted mb-1">
                    Payment ({methodLabel[order.paymentMethod]})
                  </label>
                  <select
                    value={order.paymentStatus}
                    disabled={savingId === order.id}
                    onChange={(e) =>
                      handlePaymentChange(order, e.target.value as PaymentStatus)
                    }
                    className="border border-line bg-paper-raised px-2 py-1 text-sm"
                  >
                    {paymentStatuses.map((s) => (
                      <option key={s} value={s}>
                        {s.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>

                {order.paymentMethod !== "cod" && (
                  <div className="text-xs text-ink-muted border border-line px-3 py-2 bg-paper">
                    <p>Txn ID: {order.transactionId}</p>
                    <p>Paid from: {order.paymentPhone}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
