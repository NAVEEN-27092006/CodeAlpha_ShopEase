import { Link } from "@tanstack/react-router";
import { Banknote, RotateCcw, ShieldCheck, Truck } from "lucide-react";

import { CATEGORIES } from "@/lib/shop-data";
import { Logo } from "./site-header";

const PERKS = [
  { icon: Truck, title: "Free delivery", text: "On orders above ₹499" },
  { icon: Banknote, title: "Cash on Delivery", text: "Pay when it arrives" },
  { icon: RotateCcw, title: "7-day returns", text: "Easy, no questions" },
  { icon: ShieldCheck, title: "Genuine products", text: "From trusted brands" },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-primary-deep text-primary-foreground">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 border-b border-primary-foreground/10 px-4 py-8 md:grid-cols-4">
        {PERKS.map((p) => (
          <div key={p.title} className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-foreground/10">
              <p.icon className="size-5 text-accent" />
            </span>
            <div>
              <p className="text-sm font-bold">{p.title}</p>
              <p className="text-xs text-primary-foreground/70">{p.text}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-4">
        <div className="space-y-3">
          <Logo />
          <p className="text-sm text-primary-foreground/70">
            Everything you love, delivered to your door. A ShopEase demo storefront.
          </p>
        </div>
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-primary-foreground/60">
            Shop
          </p>
          <ul className="space-y-2 text-sm">
            {CATEGORIES.slice(0, 5).map((c) => (
              <li key={c.slug}>
                <Link
                  to="/products"
                  search={{ category: c.slug, q: undefined, sort: undefined }}
                  className="hover:text-accent"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-primary-foreground/60">
            Account
          </p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/cart" className="hover:text-accent">
                My Cart
              </Link>
            </li>
            <li>
              <Link to="/orders" className="hover:text-accent">
                My Orders
              </Link>
            </li>
            <li>
              <Link to="/login" className="hover:text-accent">
                Sign in or create account
              </Link>
            </li>
            <li>
              <Link to="/admin" className="hover:text-accent">
                Admin Dashboard
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-primary-foreground/60">
            Help
          </p>
          <p className="text-sm text-primary-foreground/70">
            support@shopease.demo
            <br />
            1800-123-4567 (Mon–Sat, 9am–7pm)
          </p>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 py-4 text-center text-xs text-primary-foreground/60">
        © 2026 ShopEase · Frontend prototype with sample data
      </div>
    </footer>
  );
}
