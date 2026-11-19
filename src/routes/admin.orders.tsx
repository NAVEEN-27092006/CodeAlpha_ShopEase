import { createFileRoute } from "@tanstack/react-router";
import { Eye, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AdminAccessDenied } from "@/components/admin/admin-access-denied";
import { AdminPage } from "@/components/admin/admin-page";
import { StatusBadge } from "@/components/shop/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  formatDate,
  formatINR,
  nextOrderStatuses,
  ORDER_STATUSES,
  paymentLabel,
} from "@/lib/shop-logic";
import { useShop } from "@/lib/shop-store";
import type { Order, OrderStatus } from "@/lib/shop-types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({
    meta: [
      { title: "Orders — ShopEase Admin" },
      {
        name: "description",
        content: "View all ShopEase orders and update their delivery status.",
      },
      { property: "og:title", content: "Orders — ShopEase Admin" },
      {
        property: "og:description",
        content: "View all ShopEase orders and update their delivery status.",
      },
    ],
  }),
  component: AdminOrders,
});

function StatusSelect({ order }: { order: Order }) {
  const { can, updateOrderStatus } = useShop();
  const next = nextOrderStatuses(order.status);

  if (!can("orders.manage") || next.length === 0) {
    return <span className="text-xs font-semibold text-muted-foreground">Final status</span>;
  }

  return (
    <select
      value={order.status}
      aria-label={`Status for order ${order.id}`}
      onChange={(e) => {
        const status = e.target.value as OrderStatus;
        try {
          updateOrderStatus(order.id, status);
          toast.success(`Order ${order.id} marked as ${status}`);
        } catch (error) {
          toast.error((error as Error).message);
        }
      }}
      className="h-9 rounded-md border border-input bg-card px-2 text-sm font-medium shadow-sm"
    >
      <option value={order.status}>{order.status}</option>
      {next.map((status) => (
        <option key={status} value={status}>
          {status}
        </option>
      ))}
    </select>
  );
}

function PaymentStatusControl({ order }: { order: Order }) {
  const { can, markOrderPaid } = useShop();

  if (order.paymentStatus === "Paid") {
    return <span className="text-xs font-bold text-success">Paid</span>;
  }
  if (!can("payments.collect") || order.status !== "Delivered") {
    return (
      <span className="text-xs font-semibold text-warning-foreground">Payable on delivery</span>
    );
  }
  return (
    <Button
      variant="soft"
      size="sm"
      onClick={() => {
        try {
          markOrderPaid(order.id);
          toast.success(`COD collection recorded for ${order.id}`);
        } catch (error) {
          toast.error((error as Error).message);
        }
      }}
    >
      Mark COD paid
    </Button>
  );
}

function AdminOrders() {
  const { orders, can } = useShop();
  const [filter, setFilter] = useState<OrderStatus | "All">("All");
  const [q, setQ] = useState("");
  const [viewing, setViewing] = useState<Order | null>(null);

  const query = q.trim().toLowerCase();
  const list = orders.filter(
    (o) =>
      (filter === "All" || o.status === filter) &&
      (!query ||
        o.id.toLowerCase().includes(query) ||
        o.customerName.toLowerCase().includes(query)),
  );
  const live = viewing ? (orders.find((o) => o.id === viewing.id) ?? viewing) : null;

  if (!can("orders.view")) return <AdminAccessDenied />;

  return (
    <AdminPage title="Orders" subtitle="Track and update the status of every order.">
      <div className="surface space-y-3 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by order ID or customer"
            className="h-10 pl-9"
          />
        </div>
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {(["All", ...ORDER_STATUSES] as const).map((s) => {
            const count = s === "All" ? orders.length : orders.filter((o) => o.status === s).length;
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                  filter === s
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:bg-secondary",
                )}
              >
                {s} <span className="opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="surface overflow-x-auto">
        <table className="w-full min-w-[980px] text-sm">
          <thead className="border-b border-border bg-muted text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Payment status</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Update status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {list.map((o) => (
              <tr key={o.id} className="hover:bg-muted/50">
                <td className="px-4 py-3">
                  <p className="font-bold">{o.id}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(o.date)}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold">{o.customerName}</p>
                  <p className="text-xs text-muted-foreground">{o.phone}</p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex -space-x-2">
                    {o.items.slice(0, 3).map((i) => (
                      <img
                        key={i.productId}
                        src={i.image}
                        alt={i.name}
                        title={i.name}
                        className="size-9 rounded-full border-2 border-card bg-card object-contain"
                      />
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-semibold">{formatINR(o.total)}</td>
                <td className="px-4 py-3 text-xs font-semibold">{paymentLabel(o.payment)}</td>
                <td className="px-4 py-3">
                  <PaymentStatusControl order={o} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={o.status} />
                </td>
                <td className="px-4 py-3">
                  <StatusSelect order={o} />
                </td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="sm" onClick={() => setViewing(o)}>
                    <Eye /> View
                  </Button>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!live} onOpenChange={(v) => !v && setViewing(null)}>
        <DialogContent className="sm:max-w-lg">
          {live && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  Order {live.id} <StatusBadge status={live.status} />
                </DialogTitle>
                <DialogDescription>
                  Placed on {formatDate(live.date)} · {paymentLabel(live.payment)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <div className="rounded-lg bg-muted p-3">
                  <p className="font-semibold">
                    {live.customerName} · {live.phone}
                  </p>
                  <p className="text-muted-foreground">{live.address}</p>
                </div>
                <div className="divide-y divide-border rounded-lg border border-border">
                  {live.items.map((i) => (
                    <div key={i.productId} className="flex items-center gap-3 p-3">
                      <img
                        src={i.image}
                        alt=""
                        className="size-10 rounded border border-border object-contain p-0.5"
                      />
                      <span className="line-clamp-1 flex-1">
                        {i.name} × {i.qty}
                      </span>
                      <span className="font-semibold">{formatINR(i.price * i.qty)}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatINR(live.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span>{live.delivery ? formatINR(live.delivery) : "FREE"}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold">
                    <span>Total (to collect)</span>
                    <span>{formatINR(live.total)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
                  <span className="font-semibold">COD payment</span>
                  <PaymentStatusControl order={live} />
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
                  <span className="font-semibold">Change status</span>
                  <StatusSelect order={live} />
                </div>
                <div className="border-t border-border pt-4">
                  <p className="mb-2 font-semibold">Status history</p>
                  <ol className="space-y-2">
                    {live.statusHistory.map((entry, index) => (
                      <li
                        key={`${entry.timestamp}-${index}`}
                        className="flex justify-between gap-3 text-xs"
                      >
                        <span className="font-medium">
                          {entry.oldStatus ? `${entry.oldStatus} → ` : ""}
                          {entry.newStatus}
                        </span>
                        <span className="text-right text-muted-foreground">
                          {entry.actor} · {formatDate(entry.timestamp)}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminPage>
  );
}
