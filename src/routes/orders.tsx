import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, PackageOpen } from "lucide-react";

import { ShopLayout } from "@/components/shop/shop-layout";
import { StatusBadge } from "@/components/shop/status-badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatINR, paymentLabel } from "@/lib/shop-logic";
import { useShop } from "@/lib/shop-store";
import type { OrderStatus } from "@/lib/shop-types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "My Orders — ShopEase" },
      { name: "description", content: "Track the status of your ShopEase orders." },
      { property: "og:title", content: "My Orders — ShopEase" },
      { property: "og:description", content: "Track the status of your ShopEase orders." },
    ],
  }),
  component: OrdersPage,
});

const STEPS: OrderStatus[] = ["Placed", "Packed", "Shipped", "Out for Delivery", "Delivered"];

function Tracker({ status }: { status: OrderStatus }) {
  if (status === "Cancelled") {
    return <p className="text-sm font-semibold text-destructive">This order was cancelled.</p>;
  }
  const current = STEPS.indexOf(status);
  return (
    <ol className="grid grid-cols-5">
      {STEPS.map((s, i) => (
        <li key={s} className="relative flex flex-col items-center gap-1.5 text-center">
          {i > 0 && (
            <span
              className={cn(
                "absolute right-1/2 top-3 h-0.5 w-full -translate-y-1/2",
                i <= current ? "bg-success" : "bg-border",
              )}
            />
          )}
          <span
            className={cn(
              "relative z-10 flex size-6 items-center justify-center rounded-full border-2 text-[10px] font-bold",
              i <= current
                ? "border-success bg-success text-success-foreground"
                : "border-border bg-card text-muted-foreground",
            )}
          >
            {i <= current ? <Check className="size-3.5" /> : i + 1}
          </span>
          <span
            className={cn(
              "text-[10px] font-medium leading-tight sm:text-xs",
              i <= current ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {s}
          </span>
        </li>
      ))}
    </ol>
  );
}

function OrdersPage() {
  const { orders, currentCustomer } = useShop();

  if (!currentCustomer) {
    return (
      <ShopLayout>
        <div className="mx-auto max-w-2xl px-4 py-12">
          <div className="surface flex flex-col items-center gap-4 px-6 py-16 text-center">
            <PackageOpen className="size-12 text-primary" />
            <h1 className="text-2xl font-bold">Sign in to view your orders</h1>
            <p className="text-muted-foreground">
              Your order history is available only to the customer account that placed it.
            </p>
            <Button asChild>
              <Link to="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </ShopLayout>
    );
  }

  const mine = orders.filter((o) => o.customerId === currentCustomer.id);

  return (
    <ShopLayout>
      <div className="mx-auto max-w-4xl space-y-4 px-4 py-6">
        <div className="surface flex flex-wrap items-center justify-between gap-3 p-4">
          <div>
            <h1 className="text-xl font-bold">My Orders</h1>
            <p className="text-sm text-muted-foreground">Signed in as {currentCustomer.name}</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/login">Account</Link>
          </Button>
        </div>

        {mine.length === 0 ? (
          <div className="surface flex flex-col items-center gap-3 px-6 py-16 text-center">
            <PackageOpen className="size-12 text-muted-foreground" />
            <h2 className="text-lg font-bold">No orders yet</h2>
            <p className="text-sm text-muted-foreground">
              Once you place an order, it will appear here.
            </p>
            <Button asChild>
              <Link to="/products" search={{ q: undefined, category: undefined, sort: undefined }}>
                Start shopping
              </Link>
            </Button>
          </div>
        ) : (
          mine.map((o) => (
            <article key={o.id} className="surface overflow-hidden">
              <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted px-5 py-3">
                <div className="text-sm">
                  <span className="font-bold">Order {o.id}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    · {formatDate(o.date)} · {paymentLabel(o.payment)}
                  </span>
                </div>
                <StatusBadge status={o.status} />
              </header>
              <div className="divide-y divide-border">
                {o.items.map((i) => (
                  <div key={i.productId} className="flex items-center gap-4 px-5 py-3">
                    <img
                      src={i.image}
                      alt={i.name}
                      className="size-14 rounded-md border border-border object-contain p-1"
                    />
                    <div className="min-w-0 flex-1">
                      <Link
                        to="/product/$id"
                        params={{ id: i.productId }}
                        className="line-clamp-1 text-sm font-semibold hover:text-primary"
                      >
                        {i.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        Qty {i.qty} · {formatINR(i.price)} each
                      </p>
                    </div>
                    <p className="text-sm font-bold">{formatINR(i.price * i.qty)}</p>
                  </div>
                ))}
              </div>
              <footer className="space-y-4 border-t border-border px-5 py-4">
                <Tracker status={o.status} />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">COD payment</span>
                  <span
                    className={cn(
                      "font-bold",
                      o.paymentStatus === "Paid" ? "text-success" : "text-warning-foreground",
                    )}
                  >
                    {o.paymentStatus}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Order total</span>
                  <span className="font-bold">{formatINR(o.total)}</span>
                </div>
              </footer>
            </article>
          ))
        )}
      </div>
    </ShopLayout>
  );
}
