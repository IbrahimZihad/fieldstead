"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();

  return (
    <header className="border-b border-line bg-paper/95 backdrop-blur sticky top-0 z-30">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="font-serif text-xl tracking-tight text-ink"
          >
            Fieldstead
          </Link>

          <nav className="hidden sm:flex items-center gap-7 text-sm">
            <Link href="/" className="text-ink-muted hover:text-ink transition-colors">
              Shop
            </Link>
            {user && (
              <Link
                href="/orders"
                className="text-ink-muted hover:text-ink transition-colors"
              >
                Orders
              </Link>
            )}
            {user?.role === "admin" && (
              <Link
                href="/admin"
                className="text-ink-muted hover:text-ink transition-colors"
              >
                Admin
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-5 text-sm">
            <Link
              href="/cart"
              className="text-ink hover:text-forest transition-colors"
            >
              Cart{totalItems > 0 ? ` (${totalItems})` : ""}
            </Link>
            {user ? (
              <button
                onClick={logout}
                className="text-ink-muted hover:text-ink transition-colors"
              >
                Sign out
              </button>
            ) : (
              <Link
                href="/login"
                className="text-ink-muted hover:text-ink transition-colors"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
