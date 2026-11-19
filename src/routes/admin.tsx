import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  LogOut,
  Package,
  PackageSearch,
  ShieldCheck,
  ShoppingBag,
  Store,
  Users,
} from "lucide-react";

import { AdminAccessDenied } from "@/components/admin/admin-access-denied";
import { Logo } from "@/components/shop/site-header";
import { Button } from "@/components/ui/button";
import { useShop } from "@/lib/shop-store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — ShopEase" },
      { name: "description", content: "Manage ShopEase products, orders and customers." },
      { property: "og:title", content: "Admin Dashboard — ShopEase" },
      { property: "og:description", content: "Manage ShopEase products, orders and customers." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

const NAV = [
  {
    to: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
    permission: "orders.view" as const,
  },
  {
    to: "/admin/products",
    label: "Products",
    icon: Package,
    exact: false,
    permission: "catalog.manage" as const,
  },
  {
    to: "/admin/inventory",
    label: "Inventory",
    icon: PackageSearch,
    exact: false,
    permission: "inventory.manage" as const,
  },
  {
    to: "/admin/orders",
    label: "Orders",
    icon: ShoppingBag,
    exact: false,
    permission: "orders.view" as const,
  },
  {
    to: "/admin/customers",
    label: "Customers",
    icon: Users,
    exact: false,
    permission: "customers.view" as const,
  },
  {
    to: "/admin/team",
    label: "Admin team",
    icon: ShieldCheck,
    exact: false,
    permission: "admin.manage" as const,
  },
] as const;

function AdminLayout() {
  const { can, isAdmin, orders, signOut } = useShop();
  const navigate = useNavigate();
  const pending = orders.filter((o) => o.status === "Placed").length;

  if (!isAdmin)
    return (
      <AdminAccessDenied
        title="Admin access only"
        description="Sign in with an assigned staff or administrator account to open the dashboard."
      />
    );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="sticky top-0 z-30 bg-primary-deep text-primary-foreground lg:h-screen">
        <div className="flex items-center justify-between gap-3 px-5 py-4 lg:block">
          <Logo />
          <p className="hidden text-xs font-semibold uppercase tracking-widest text-primary-foreground/60 lg:mt-1 lg:block">
            Admin panel
          </p>
          <Button
            variant="hero"
            size="sm"
            className="lg:hidden"
            onClick={() => navigate({ to: "/" })}
          >
            <Store /> Store
          </Button>
        </div>
        <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:px-3 lg:pt-4">
          {NAV.filter((item) => can(item.permission)).map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.exact }}
              className="flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-primary-foreground/75 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
              activeProps={{ className: "bg-primary text-primary-foreground shadow-lift" }}
            >
              <n.icon className="size-4" />
              {n.label}
              {n.label === "Orders" && pending > 0 && (
                <span className="ml-auto rounded-full bg-accent px-1.5 text-[11px] font-bold text-accent-foreground">
                  {pending}
                </span>
              )}
            </Link>
          ))}
        </nav>
        <div className="absolute inset-x-0 bottom-0 hidden space-y-2 p-4 lg:block">
          <Button asChild variant="hero" className="w-full">
            <Link to="/">
              <Store /> View store as customer
            </Link>
          </Button>
          <Button
            variant="ghost"
            className="w-full text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
            onClick={() => {
              signOut();
              navigate({ to: "/login" });
            }}
          >
            <LogOut /> Sign out
          </Button>
        </div>
      </aside>
      <main className="min-w-0 bg-background">
        <Outlet />
      </main>
    </div>
  );
}
