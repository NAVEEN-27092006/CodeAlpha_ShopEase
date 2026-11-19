import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Banknote,
  Check,
  ChevronRight,
  PackageX,
  RotateCcw,
  ShieldCheck,
  ShoppingCart,
  Truck,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { Price } from "@/components/shop/price";
import { ProductCard } from "@/components/shop/product-card";
import { Rating } from "@/components/shop/rating";
import { ShopLayout } from "@/components/shop/shop-layout";
import { Button } from "@/components/ui/button";
import { categoryName, SEED_PRODUCTS } from "@/lib/shop-data";
import { useShop } from "@/lib/shop-store";

export const Route = createFileRoute("/product/$id")({
  head: ({ params }) => {
    const p = SEED_PRODUCTS.find((x) => x.id === params.id);
    const title = p ? `${p.name} — ShopEase` : "Product details — ShopEase";
    const description = p
      ? p.description
      : "View product details, price and delivery options on ShopEase.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const { products, addToCart } = useShop();
  const navigate = useNavigate();
  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <ShopLayout>
        <div className="mx-auto flex max-w-lg flex-col items-center gap-3 px-4 py-24 text-center">
          <PackageX className="size-14 text-muted-foreground" />
          <h1 className="text-2xl font-bold">Product not found</h1>
          <p className="text-muted-foreground">This product may have been removed by the store.</p>
          <Button asChild>
            <Link to="/products" search={{ q: undefined, category: undefined, sort: undefined }}>
              Continue shopping
            </Link>
          </Button>
        </div>
      </ShopLayout>
    );
  }

  const similar = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);
  const fallback = similar.length
    ? similar
    : products.filter((p) => p.id !== product.id).slice(0, 4);
  const outOfStock = product.stock <= 0;

  return (
    <ShopLayout>
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        <nav className="flex items-center gap-1 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary">
            Home
          </Link>
          <ChevronRight className="size-3" />
          <Link
            to="/products"
            search={{ category: product.category, q: undefined, sort: undefined }}
            className="hover:text-primary"
          >
            {categoryName(product.category)}
          </Link>
          <ChevronRight className="size-3" />
          <span className="line-clamp-1 text-foreground">{product.name}</span>
        </nav>

        <div className="surface grid gap-8 p-4 sm:p-8 md:grid-cols-2">
          <div className="space-y-4 md:sticky md:top-36 md:self-start">
            <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-border bg-card p-6">
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="accent"
                size="lg"
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
                <ShoppingCart /> Add to cart
              </Button>
              <Button
                variant="cta"
                size="lg"
                disabled={outOfStock}
                onClick={() => {
                  if (addToCart(product.id)) {
                    navigate({ to: "/checkout" });
                  } else {
                    toast.error("No more stock available", {
                      description: "Review the quantity already in your cart.",
                    });
                  }
                }}
              >
                <Zap /> Buy now
              </Button>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {product.brand}
              </p>
              <h1 className="mt-1 text-2xl font-bold leading-snug sm:text-3xl">{product.name}</h1>
              <div className="mt-3">
                <Rating value={product.rating} reviews={product.reviews} />
              </div>
            </div>

            <div>
              <p className="text-sm font-bold text-success">Special price</p>
              <Price price={product.price} mrp={product.mrp} size="lg" />
              <p className="mt-1 text-xs text-muted-foreground">Inclusive of all taxes</p>
            </div>

            <p
              className={
                outOfStock ? "font-semibold text-destructive" : "text-sm font-semibold text-success"
              }
            >
              {outOfStock
                ? "Currently out of stock"
                : product.stock < 10
                  ? `Hurry, only ${product.stock} left!`
                  : "In stock"}
            </p>

            <div className="rounded-xl border border-border p-4">
              <p className="mb-3 text-sm font-bold">Highlights</p>
              <ul className="grid gap-2 sm:grid-cols-2">
                {product.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" /> {h}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-2 text-sm font-bold">Description</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>
            </div>

            <div className="grid gap-3 rounded-xl bg-secondary p-4 sm:grid-cols-2">
              {[
                {
                  icon: Truck,
                  text:
                    product.price >= 499
                      ? "Free delivery in 3–5 days"
                      : "Delivery ₹40 · Free above ₹499",
                },
                { icon: Banknote, text: "Cash on Delivery available" },
                { icon: RotateCcw, text: "7-day easy returns" },
                { icon: ShieldCheck, text: "1 year brand warranty" },
              ].map((f) => (
                <div
                  key={f.text}
                  className="flex items-center gap-2 text-sm font-medium text-secondary-foreground"
                >
                  <f.icon className="size-4 text-primary" /> {f.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {fallback.length > 0 && (
          <section className="surface p-4 sm:p-6">
            <h2 className="mb-5 text-xl font-bold">Similar products</h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
              {fallback.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </ShopLayout>
  );
}
