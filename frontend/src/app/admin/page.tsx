"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { AdminStats, Order } from "@/types";

interface StatsResponse {
  stats: AdminStats;
  recentOrders: Order[];
}

const paymentLabel: Record<Order["paymentStatus"], string> = {
  unpaid: "Unpaid",
  pending_verification: "Pending verification",
  paid: "Paid",
};

export default function AdminOverviewPage() {
  const { token } = useAuth();
  const [data, setData] = useState<StatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    api
      .get<StatsResponse>("/admin/stats", token)
      .then(setData)
      .catch(() => setError("Could not load dashboard stats."));
  }, [token]);

  if (error) return <p className="text-danger text-sm">{error}</p>;
  if (!data) return <p className="text-ink-muted">Loading…</p>;

  const { stats, recentOrders } = data;

  const cards = [
    { label: "Revenue (paid orders)", value: `$${stats.totalRevenue.toFixed(2)}` },
    { label: "Total orders", value: stats.totalOrders },
    { label: "Payments to verify", value: stats.pendingVerificationCount },
    { label: "Products", value: stats.totalProducts },
    { label: "Out of stock", value: stats.outOfStockCount },
    { label: "Customers", value: stats.totalCustomers },
  ];

  return (
    <div>
      <h1 className="font-serif text-3xl mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-12">
        {cards.map((card) => (
          <div key={card.label} className="border border-line bg-paper-raised p-5">
            <p className="text-2xl font-serif">{card.value}</p>
            <p className="text-xs text-ink-muted mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {stats.pendingVerificationCount > 0 && (
        <div className="border border-ochre bg-paper-raised p-4 mb-10 text-sm">
          <span className="text-ochre font-medium">
            {stats.pendingVerificationCount} payment
            {stats.pendingVerificationCount > 1 ? "s" : ""}
          </span>{" "}
          waiting on manual verification.{" "}
          <Link href="/admin/orders" className="text-forest underline">
            Review orders
          </Link>
        </div>
      )}

      <h2 className="font-serif text-xl mb-4">Recent orders</h2>
      <div className="border-t border-line">
        {recentOrders.map((order) => (
          <div
            key={order.id}
            className="flex flex-wrap items-center justify-between gap-2 py-3 border-b border-line text-sm"
          >
            <span>Order #{order.id}</span>
            <span className="text-ink-muted capitalize">{order.status}</span>
            <span className="text-ink-muted">
              {paymentLabel[order.paymentStatus]}
            </span>
            <span>${Number(order.totalAmount).toFixed(2)}</span>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <Link href="/admin/orders" className="text-sm text-forest underline">
          View all orders →
        </Link>
      </div>
    </div>
  );
}
