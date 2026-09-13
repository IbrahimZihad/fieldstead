"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/orders", label: "Orders" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16">
        <p className="text-ink-muted">Loading…</p>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="font-serif text-3xl mb-4">Admin</h1>
        <p className="text-ink-muted">
          {user
            ? "This area is only available to admin accounts."
            : "Please sign in with an admin account to continue."}{" "}
          {!user && (
            <Link href="/login?next=/admin" className="text-forest underline">
              Sign in
            </Link>
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="grid md:grid-cols-[180px_1fr] gap-10">
        <nav className="flex md:flex-col gap-1 flex-wrap border-b md:border-b-0 md:border-r border-line pb-4 md:pb-0 md:pr-6">
          {navItems.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 text-sm ${
                  active
                    ? "text-forest border-l-2 border-forest md:pl-[10px]"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div>{children}</div>
      </div>
    </div>
  );
}
