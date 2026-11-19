import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Price } from "@/components/shop/price";
import { PriceSummary } from "@/components/shop/price-summary";
import { ShopLayout } from "@/components/shop/shop-layout";
import { Button } from "@/components/ui/button";
import { cartTotals, FREE_DELIVERY_THRESHOLD, formatINR } from "@/lib/shop-logic";
import { useShop } from "@/lib/shop-store";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "My Cart — ShopEase" },
      {
        name: "description",
        content: "Review the items in your ShopEase cart and proceed to checkout.",
      },
      { property: "og:title", content: "My Cart — ShopEase" },
      {
        property: "og:description",
        content: "Review the items in your ShopEase cart and proceed to checkout.",
      },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { cart, products, setQty, removeFromCart, currentCustomer } = useShop();
  const totals = cartTotals(cart, products);
  const lines = cart.flatMap((l) => {
    const p = products.find((x) => x.id === l.productId);
    return p ? [{ ...l, product: p }] : [];
  });

  if (lines.length === 0) {
    return (
      <ShopLayout>
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="surface flex flex-col items-center gap-4 px-6 py-20 text-center">
            <span className="flex size-20 items-center justify-center rounded-full bg-secondary text-primary">
              <ShoppingBag className="size-9" />
            </span>
            <h1 className="text-2xl font-bold">Your cart is empty</h1>
            <p className="text-muted-foreground">Add items to it now and enjoy great deals.</p>
            <Button asChild size="lg">
              <Link to="/products" search={{ q: undefined, category: undefined, sort: undefined }}>
                Shop now
              </Link>
            </Button>
          </div>
        </div>
      </ShopLayout>
    );
  }

  return (
    <ShopLayout>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[1fr_360px]">
        <section className="space-y-4">
          <div className="surface flex flex-wrap items-center justify-between gap-2 p-4">
            <h1 className="text-xl font-bold">My Cart ({totals.count})</h1>
            <p className="text-sm text-muted-foreground">
              {currentCustomer ? (
                <>
                  Deliver to{" "}
                  <span className="font-semibold text-foreground">{currentCustomer.name}</span>,{" "}
                  {currentCustomer.city}
                </>
              ) : (
                <>Sign in at checkout to add your delivery address.</>
              )}
            </p>
          </div>

          {totals.subtotal < FREE_DELIVERY_THRESHOLD && (
            <div className="rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm font-medium text-warning-foreground">
              Add {formatINR(FREE_DELIVERY_THRESHOLD - totals.subtotal)} more for FREE delivery.
            </div>
          )}

          <div className="surface divide-y divide-border">
            {lines.map(({ product, qty }) => (
              <div key={product.id} className="flex gap-4 p-4 sm:p-5">
                <Link
                  to="/product/$id"
                  params={{ id: product.id }}
                  className="size-24 shrink-0 rounded-lg border border-border bg-card p-2 sm:size-28"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-contain"
                  />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <Link
                    to="/product/$id"
                    params={{ id: product.id }}
                    className="line-clamp-2 font-semibold hover:text-primary"
                  >
                    {product.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">Seller: {product.brand} Retail</p>
                  <Price price={product.price} mrp={product.mrp} />
                  <div className="mt-1 flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-8 rounded-full"
                        aria-label="Decrease quantity"
                        onClick={() => setQty(product.id, qty - 1)}
                      >
                        <Minus />
                      </Button>
                      <span className="w-8 text-center text-sm font-bold">{qty}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-8 rounded-full"
                        aria-label="Increase quantity"
                        onClick={() => setQty(product.id, qty + 1)}
                        disabled={qty >= 10}
                      >
                        <Plus />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        removeFromCart(product.id);
                        toast("Removed from cart", { description: product.name });
                      }}
                    >
                      <Trash2 /> Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-4 lg:sticky lg:top-36 lg:self-start">
          <PriceSummary totals={totals}>
            <Button asChild variant="cta" size="lg" className="w-full">
              <Link to={currentCustomer ? "/checkout" : "/login"}>
                {currentCustomer ? "Place order" : "Sign in to place order"}
              </Link>
            </Button>
          </PriceSummary>
          <p className="px-1 text-xs text-muted-foreground">
            Payment: Cash on Delivery available on all orders.
          </p>
        </aside>
      </div>
    </ShopLayout>
  );
}
