import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, IndianRupee, Package, ShoppingBag, Users } from "lucide-react";

import { AdminAccessDenied } from "@/components/admin/admin-access-denied";
import { AdminPage } from "@/components/admin/admin-page";
import { StatusBadge } from "@/components/shop/status-badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatINR, ORDER_STATUSES } from "@/lib/shop-logic";
import { useShop } from "@/lib/shop-store";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Dashboard — ShopEase Admin" },
      {
        name: "description",
        content: "Sales, orders and inventory overview for the ShopEase store.",
      },
      { property: "og:title", content: "Dashboard — ShopEase Admin" },
      {
        property: "og:description",
        content: "Sales, orders and inventory overview for the ShopEase store.",
      },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { orders, products, customers, can } = useShop();
  if (!can("orders.view")) return <AdminAccessDenied />;
  const active = orders.filter((o) => o.status !== "Cancelled");
  const revenue = active.reduce((s, o) => s + o.total, 0);
  const lowStock = products.filter((p) => p.stock < 15);

  const stats = [
    {
      label: "Total revenue",
      value: formatINR(revenue),
      icon: IndianRupee,
      hint: `${active.length} active orders`,
    },
    {
      label: "Orders",
      value: orders.length,
      icon: ShoppingBag,
      hint: `${orders.filter((o) => o.status === "Placed").length} new to process`,
    },
    {
      label: "Products",
      value: products.length,
      icon: Package,
      hint: `${lowStock.length} low on stock`,
    },
    { label: "Customers", value: customers.length, icon: Users, hint: "Registered shoppers" },
  ];

  const sold = new Map<string, { name: string; image: string; qty: number }>();
  for (const o of active)
    for (const i of o.items) {
      const cur = sold.get(i.productId) ?? { name: i.name, image: i.image, qty: 0 };
      cur.qty += i.qty;
      sold.set(i.productId, cur);
    }
  const top = [...sold.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);
  const maxStatus = Math.max(
    1,
    ...ORDER_STATUSES.map((s) => orders.filter((o) => o.status === s).length),
  );

  return (
    <AdminPage title="Welcome back, Admin" subtitle="Here's what's happening in your store today.">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="surface p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
              <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-primary">
                <s.icon className="size-4" />
              </span>
            </div>
            <p className="mt-3 font-display text-2xl font-bold sm:text-3xl">{s.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s.hint}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section className="surface overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-bold">Recent orders</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin/orders">
                View all <ArrowRight />
              </Link>
            </Button>
          </div>
          <div className="divide-y divide-border">
            {orders.slice(0, 6).map((o) => (
              <div
                key={o.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 text-sm"
              >
                <span className="w-20 font-bold">{o.id}</span>
                <span className="min-w-0 flex-1 truncate">{o.customerName}</span>
                <span className="text-muted-foreground">{formatDate(o.date)}</span>
                <span className="w-24 text-right font-semibold">{formatINR(o.total)}</span>
                <StatusBadge status={o.status} />
              </div>
            ))}
          </div>
        </section>

        <div className="space-y-6">
          <section className="surface p-5">
            <h2 className="mb-4 font-bold">Orders by status</h2>
            <div className="space-y-3">
              {ORDER_STATUSES.map((s) => {
                const n = orders.filter((o) => o.status === s).length;
                return (
                  <div key={s} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span>{s}</span>
                      <span className="text-muted-foreground">{n}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className={
                          s === "Cancelled"
                            ? "h-full rounded-full bg-destructive"
                            : s === "Delivered"
                              ? "h-full rounded-full bg-success"
                              : "h-full rounded-full bg-primary"
                        }
                        style={{ width: `${(n / maxStatus) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="surface p-5">
            <h2 className="mb-4 font-bold">Top selling</h2>
            <ul className="space-y-3">
              {top.map((t) => (
                <li key={t.name} className="flex items-center gap-3">
                  <img
                    src={t.image}
                    alt=""
                    className="size-10 rounded-md border border-border object-contain p-0.5"
                  />
                  <span className="line-clamp-1 flex-1 text-sm font-medium">{t.name}</span>
                  <span className="text-sm font-bold text-primary">{t.qty} sold</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      {lowStock.length > 0 && (
        <section className="rounded-xl border border-warning/50 bg-warning/10 p-5">
          <h2 className="font-bold text-warning-foreground">Low stock alert</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {lowStock.map((p) => (
              <span
                key={p.id}
                className="rounded-full bg-card px-3 py-1 text-xs font-semibold shadow-card"
              >
                {p.name} · {p.stock} left
              </span>
            ))}
          </div>
        </section>
      )}
    </AdminPage>
  );
}
