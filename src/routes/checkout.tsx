import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  Banknote,
  Building2,
  CheckCircle2,
  MapPin,
  ShoppingBag,
  Smartphone,
} from "lucide-react";
import { useState, type ComponentProps, type FormEvent } from "react";
import { toast } from "sonner";

import { PriceSummary } from "@/components/shop/price-summary";
import { ShopLayout } from "@/components/shop/shop-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  cartTotals,
  formatINR,
  PAYMENT_METHODS,
  PAYMENT_UNAVAILABLE_MESSAGE,
  type PaymentMethod,
} from "@/lib/shop-logic";
import { useShop } from "@/lib/shop-store";
import type { Order, PaymentMethodId } from "@/lib/shop-types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — ShopEase" },
      {
        name: "description",
        content: "Enter your delivery address and place your ShopEase order with Cash on Delivery.",
      },
      { property: "og:title", content: "Checkout — ShopEase" },
      { property: "og:description", content: "Place your ShopEase order with Cash on Delivery." },
    ],
  }),
  component: CheckoutPage,
});

const PAYMENT_ICONS: Record<PaymentMethodId, typeof Banknote> = {
  cod: Banknote,
  upi: Smartphone,
  netbanking: Building2,
};

function PaymentOption({
  method,
  selected,
  onSelect,
}: {
  method: PaymentMethod;
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = PAYMENT_ICONS[method.id];
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-disabled={!method.available}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all",
        method.available
          ? selected
            ? "border-primary bg-secondary"
            : "border-border hover:border-primary/40"
          : "cursor-not-allowed border-dashed border-border bg-muted opacity-75",
      )}
    >
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full border-2",
          selected ? "border-primary" : "border-input",
        )}
      >
        {selected && <span className="size-2.5 rounded-full bg-primary" />}
      </span>
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-lg",
          method.available
            ? "bg-primary text-primary-foreground"
            : "bg-border text-muted-foreground",
        )}
      >
        <Icon className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2 font-semibold">
          {method.label}
          {method.available ? (
            <span className="rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-bold text-success">
              Available
            </span>
          ) : (
            <span className="rounded-full bg-destructive/12 px-2 py-0.5 text-[11px] font-bold text-destructive">
              Unavailable
            </span>
          )}
        </span>
        <span className="block text-xs text-muted-foreground">
          {method.available
            ? method.description
            : "Temporarily unavailable due to technical issues"}
        </span>
      </span>
    </button>
  );
}

function CheckoutPage() {
  const { cart, products, currentCustomer, placeOrder } = useShop();
  const totals = cartTotals(cart, products);
  const [payment, setPayment] = useState<PaymentMethodId>("cod");
  const [warning, setWarning] = useState(false);
  const [placed, setPlaced] = useState<Order | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState(() => {
    const [street, ...rest] = currentCustomer?.address.split(", ") ?? [""];
    const pin = currentCustomer?.address.match(/\d{6}/)?.[0] ?? "";
    return {
      name: currentCustomer?.name ?? "",
      phone: currentCustomer?.phone.replace(/\s/g, "") ?? "",
      address: [street, ...rest.slice(0, -1)].join(", "),
      city: currentCustomer?.city ?? "",
      pincode: pin,
    };
  });

  if (!currentCustomer) {
    return (
      <ShopLayout>
        <div className="mx-auto max-w-2xl px-4 py-12">
          <div className="surface flex flex-col items-center gap-4 px-6 py-16 text-center">
            <ShoppingBag className="size-12 text-primary" />
            <h1 className="text-2xl font-bold">Sign in to checkout</h1>
            <p className="max-w-md text-muted-foreground">
              Create an account or sign in to save your delivery address and place a COD order.
            </p>
            <Button asChild size="lg">
              <Link to="/login">Sign in or create an account</Link>
            </Button>
          </div>
        </div>
      </ShopLayout>
    );
  }

  if (placed) {
    return (
      <ShopLayout>
        <div className="mx-auto max-w-2xl px-4 py-12">
          <div className="surface flex flex-col items-center gap-4 px-6 py-12 text-center">
            <span className="flex size-20 items-center justify-center rounded-full bg-success/15 text-success animate-in zoom-in-50 duration-500">
              <CheckCircle2 className="size-11" />
            </span>
            <h1 className="text-3xl font-bold">Order placed successfully!</h1>
            <p className="text-muted-foreground">
              Thank you, {placed.customerName.split(" ")[0]}. Your order{" "}
              <span className="font-bold text-foreground">{placed.id}</span> will be delivered soon.
            </p>
            <div className="w-full max-w-sm rounded-xl bg-secondary p-4 text-left text-sm">
              <div className="flex justify-between">
                <span>Amount to pay</span>
                <span className="font-bold">{formatINR(placed.total)}</span>
              </div>
              <div className="mt-1 flex justify-between">
                <span>Payment</span>
                <span className="font-semibold">Cash on Delivery</span>
              </div>
              <div className="mt-1 flex justify-between">
                <span>Payment status</span>
                <span className="font-semibold">{placed.paymentStatus}</span>
              </div>
              <div className="mt-1 flex justify-between">
                <span>Items</span>
                <span>{placed.items.reduce((n, i) => n + i.qty, 0)}</span>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <Link to="/orders">Track my orders</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link
                  to="/products"
                  search={{ q: undefined, category: undefined, sort: undefined }}
                >
                  Continue shopping
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </ShopLayout>
    );
  }

  if (cart.length === 0) {
    return (
      <ShopLayout>
        <div className="mx-auto max-w-2xl px-4 py-12">
          <div className="surface flex flex-col items-center gap-4 px-6 py-16 text-center">
            <ShoppingBag className="size-12 text-muted-foreground" />
            <h1 className="text-2xl font-bold">Nothing to checkout</h1>
            <p className="text-muted-foreground">Your cart is empty. Add a few products first.</p>
            <Button asChild>
              <Link to="/products" search={{ q: undefined, category: undefined, sort: undefined }}>
                Shop now
              </Link>
            </Button>
          </div>
        </div>
      </ShopLayout>
    );
  }

  const selectPayment = (m: PaymentMethod) => {
    if (!m.available) {
      setWarning(true);
      toast.error(`${m.label} is unavailable`, {
        description: "Please select Cash on Delivery (COD).",
      });
      return;
    }
    setWarning(false);
    setPayment(m.id);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.name.trim()) next["name"] = "Enter your full name";
    if (!/^\d{10}$/.test(form.phone)) next["phone"] = "Enter a valid 10-digit mobile number";
    if (form.address.trim().length < 8) next["address"] = "Enter your full address";
    if (!form.city.trim()) next["city"] = "Enter your city";
    if (!/^\d{6}$/.test(form.pincode)) next["pincode"] = "Enter a valid 6-digit pincode";
    setErrors(next);
    if (Object.keys(next).length) return;
    try {
      const order = placeOrder({ ...form, payment });
      setPlaced(order);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const field = (
    key: keyof typeof form,
    label: string,
    props: ComponentProps<typeof Input> = {},
  ) => (
    <div className="space-y-1.5">
      <Label htmlFor={key}>{label}</Label>
      <Input
        id={key}
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        aria-invalid={!!errors[key]}
        className={cn("h-11", errors[key] && "border-destructive")}
        {...props}
      />
      {errors[key] && <p className="text-xs font-medium text-destructive">{errors[key]}</p>}
    </div>
  );

  return (
    <ShopLayout>
      <form
        onSubmit={onSubmit}
        className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[1fr_360px]"
      >
        <div className="space-y-4">
          <section className="surface overflow-hidden">
            <h2 className="flex items-center gap-3 bg-primary px-5 py-3 text-base font-bold text-primary-foreground">
              <span className="flex size-6 items-center justify-center rounded bg-primary-foreground text-xs text-primary">
                1
              </span>
              Delivery address
            </h2>
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              {field("name", "Full name", { autoComplete: "name" })}
              {field("phone", "Mobile number", {
                inputMode: "numeric",
                maxLength: 10,
                autoComplete: "tel",
              })}
              <div className="sm:col-span-2">
                {field("address", "Address (house no, street, area)", {
                  autoComplete: "street-address",
                })}
              </div>
              {field("city", "City")}
              {field("pincode", "Pincode", { inputMode: "numeric", maxLength: 6 })}
            </div>
          </section>

          <section className="surface overflow-hidden">
            <h2 className="flex items-center gap-3 bg-primary px-5 py-3 text-base font-bold text-primary-foreground">
              <span className="flex size-6 items-center justify-center rounded bg-primary-foreground text-xs text-primary">
                2
              </span>
              Order summary
            </h2>
            <div className="divide-y divide-border">
              {cart.map((l) => {
                const p = products.find((x) => x.id === l.productId);
                if (!p) return null;
                return (
                  <div key={l.productId} className="flex items-center gap-4 px-5 py-3">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="size-14 rounded-md border border-border object-contain p-1"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-semibold">{p.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {l.qty}</p>
                    </div>
                    <p className="text-sm font-bold">{formatINR(p.price * l.qty)}</p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="surface overflow-hidden">
            <h2 className="flex items-center gap-3 bg-primary px-5 py-3 text-base font-bold text-primary-foreground">
              <span className="flex size-6 items-center justify-center rounded bg-primary-foreground text-xs text-primary">
                3
              </span>
              Payment options
            </h2>
            <div className="space-y-3 p-5">
              <div
                role="alert"
                className={cn(
                  "flex gap-3 rounded-xl border p-4 text-sm transition-colors",
                  warning
                    ? "border-destructive/40 bg-destructive/8"
                    : "border-warning/50 bg-warning/12",
                )}
              >
                <AlertTriangle
                  className={cn(
                    "mt-0.5 size-5 shrink-0",
                    warning ? "text-destructive" : "text-warning-foreground",
                  )}
                />
                <div>
                  <p className="font-bold">Online payments are temporarily unavailable</p>
                  <p className="mt-0.5 text-foreground/80">{PAYMENT_UNAVAILABLE_MESSAGE}</p>
                </div>
              </div>
              {PAYMENT_METHODS.map((m) => (
                <PaymentOption
                  key={m.id}
                  method={m}
                  selected={payment === m.id}
                  onSelect={() => selectPayment(m)}
                />
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-36 lg:self-start">
          <PriceSummary totals={totals}>
            <Button type="submit" variant="cta" size="lg" className="w-full">
              Place order · {formatINR(totals.total)}
            </Button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="size-3.5" /> Pay with cash when your order is delivered
            </p>
          </PriceSummary>
        </aside>
      </form>
    </ShopLayout>
  );
}
