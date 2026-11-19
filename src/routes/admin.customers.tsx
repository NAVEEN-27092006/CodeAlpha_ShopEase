import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone, Search } from "lucide-react";
import { useState } from "react";

import { AdminAccessDenied } from "@/components/admin/admin-access-denied";
import { AdminPage } from "@/components/admin/admin-page";
import { Input } from "@/components/ui/input";
import { formatDate, formatINR } from "@/lib/shop-logic";
import { useShop } from "@/lib/shop-store";

export const Route = createFileRoute("/admin/customers")({
  head: () => ({
    meta: [
      { title: "Customers — ShopEase Admin" },
      {
        name: "description",
        content: "See every ShopEase customer, their orders and total spend.",
      },
      { property: "og:title", content: "Customers — ShopEase Admin" },
      {
        property: "og:description",
        content: "See every ShopEase customer, their orders and total spend.",
      },
    ],
  }),
  component: AdminCustomers,
});

function AdminCustomers() {
  const { customers, orders, can } = useShop();
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();

  const rows = customers
    .map((c) => {
      const mine = orders.filter((o) => o.customerId === c.id);
      const spent = mine.filter((o) => o.status !== "Cancelled").reduce((s, o) => s + o.total, 0);
      const last = mine
        .map((o) => o.date)
        .sort()
        .at(-1);
      return { ...c, orderCount: mine.length, spent, last };
    })
    .filter(
      (c) =>
        !query || [c.name, c.email, c.city, c.phone].some((v) => v.toLowerCase().includes(query)),
    );

  if (!can("customers.view")) return <AdminAccessDenied />;

  return (
    <AdminPage title="Customers" subtitle={`${customers.length} registered customers`}>
      <div className="surface p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, email, phone or city"
            className="h-10 pl-9"
          />
        </div>
      </div>

      <div className="surface overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="border-b border-border bg-muted text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3 text-right">Orders</th>
              <th className="px-4 py-3 text-right">Total spent</th>
              <th className="px-4 py-3">Last order</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((c) => (
              <tr key={c.id} className="hover:bg-muted/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {c.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                    <div>
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-xs text-muted-foreground">Joined {formatDate(c.joined)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs">
                  <p className="flex items-center gap-1.5">
                    <Mail className="size-3.5 text-muted-foreground" /> {c.email}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5">
                    <Phone className="size-3.5 text-muted-foreground" /> {c.phone}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-primary" /> {c.city}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-semibold">{c.orderCount}</td>
                <td className="px-4 py-3 text-right font-bold">{formatINR(c.spent)}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {c.last ? formatDate(c.last) : "—"}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminPage>
  );
}
