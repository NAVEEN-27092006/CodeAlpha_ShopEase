import { Link } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useShop } from "@/lib/shop-store";
import type { Product } from "@/lib/shop-types";
import { discountPercent } from "@/lib/shop-logic";
import { Price } from "./price";
import { Rating } from "./rating";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useShop();
  const off = discountPercent(product.price, product.mrp);
  const outOfStock = product.stock <= 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lift">
      <Link
        to="/product/$id"
        params={{ id: product.id }}
        className="relative block aspect-square overflow-hidden bg-card p-4"
      >
        {off >= 40 && (
          <span className="absolute left-3 top-3 z-10 rounded-md bg-accent px-2 py-0.5 text-[11px] font-bold text-accent-foreground">
            {off}% OFF
          </span>
        )}
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-2 border-t border-border p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {product.brand}
        </p>
        <Link
          to="/product/$id"
          params={{ id: product.id }}
          className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-foreground hover:text-primary"
        >
          {product.name}
        </Link>
        <Rating value={product.rating} reviews={product.reviews} />
        <Price price={product.price} mrp={product.mrp} />
        <div className="mt-auto pt-2">
          <Button
            variant="soft"
            size="sm"
            className="w-full"
            disabled={outOfStock}
            onClick={() => {
              if (addToCart(product.id)) {
                toast.success("Added to cart", { description: product.name });
              } else {
                toast.error("No more stock available", {
                  description: "Review the quantity already in your cart.",
                });
              }
            }}
          >
            <ShoppingCart /> {outOfStock ? "Out of stock" : "Add to cart"}
          </Button>
        </div>
      </div>
    </div>
  );
}
