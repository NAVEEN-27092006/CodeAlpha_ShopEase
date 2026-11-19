import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Banknote, Zap } from "lucide-react";

import heroBanner from "@/assets/hero-banner.jpg";
import { CategoryIcon } from "@/components/shop/category-icon";
import { ProductCard } from "@/components/shop/product-card";
import { ShopLayout } from "@/components/shop/shop-layout";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/lib/shop-data";
import { discountPercent } from "@/lib/shop-logic";
import { useShop } from "@/lib/shop-store";
import type { Product } from "@/lib/shop-types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ShopEase — Big savings on mobiles, fashion & more" },
      {
        name: "description",
        content:
          "Shop mobiles, electronics, fashion, home and beauty at great prices on ShopEase. Cash on Delivery available.",
      },
      { property: "og:title", content: "ShopEase — Big savings on mobiles, fashion & more" },
      {
        property: "og:description",
        content: "Shop mobiles, electronics, fashion, home and beauty at great prices on ShopEase.",
      },
    ],
  }),
  component: HomePage,
});

function Section({
  title,
  subtitle,
  category,
  products,
}: {
  title: string;
  subtitle?: string;
  category?: string;
  products: Product[];
}) {
  if (products.length === 0) return null;
  return (
    <section className="surface p-4 sm:p-6">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold sm:text-2xl">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <Button asChild size="sm">
          <Link to="/products" search={{ category, q: undefined, sort: undefined }}>
            View all <ArrowRight />
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

function HomePage() {
  const { products } = useShop();
  const topDeals = [...products]
    .sort((a, b) => discountPercent(b.price, b.mrp) - discountPercent(a.price, a.mrp))
    .slice(0, 4);
  const electronics = products
    .filter((p) => p.category === "electronics" || p.category === "mobiles")
    .slice(0, 4);
  const fashion = products.filter((p) => ["fashion", "beauty"].includes(p.category)).slice(0, 4);
  const home = products
    .filter((p) => ["home", "appliances", "books"].includes(p.category))
    .slice(0, 4);

  return (
    <ShopLayout>
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        {/* Category tiles */}
        <div className="surface grid grid-cols-4 gap-2 p-4 sm:grid-cols-7">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to="/products"
              search={{ category: c.slug, q: undefined, sort: undefined }}
              className="group flex flex-col items-center gap-2 rounded-lg p-2 text-center"
            >
              <span className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary transition-all group-hover:-translate-y-0.5 group-hover:bg-primary group-hover:text-primary-foreground sm:size-16">
                <CategoryIcon slug={c.slug} className="size-6 sm:size-7" />
              </span>
              <span className="text-xs font-semibold text-foreground sm:text-sm">{c.name}</span>
            </Link>
          ))}
        </div>

        {/* Hero */}
        <section className="relative overflow-hidden rounded-2xl bg-primary shadow-lift">
          <img
            src={heroBanner}
            alt="Smartphone, headphones, sneakers and gifts"
            className="absolute inset-0 h-full w-full object-cover object-right opacity-35 grayscale mix-blend-screen"
          />
          <div className="relative max-w-xl px-6 py-12 sm:px-10 sm:py-16 md:py-20">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">
              <Zap className="size-3.5 fill-current" /> The Big Ease Sale is live
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight text-primary-foreground sm:text-5xl">
              Up to 60% off on top brands
            </h1>
            <p className="mt-3 max-w-md text-base text-primary-foreground/85">
              Mobiles, gadgets, fashion and home essentials — delivered fast, pay with cash on
              delivery.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild variant="hero" size="lg">
                <Link
                  to="/products"
                  search={{ q: undefined, category: undefined, sort: "discount" }}
                >
                  Shop the sale <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="accent" size="lg">
                <Link
                  to="/products"
                  search={{ category: "mobiles", q: undefined, sort: undefined }}
                >
                  Explore mobiles
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* COD strip */}
        <div className="flex flex-col items-start gap-3 rounded-xl border border-primary/20 bg-secondary px-5 py-4 sm:flex-row sm:items-center">
          <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Banknote className="size-5" />
          </span>
          <div className="flex-1">
            <p className="font-bold text-secondary-foreground">Cash on Delivery on every order</p>
            <p className="text-sm text-muted-foreground">
              Free delivery on orders above ₹499. Pay only when your package arrives.
            </p>
          </div>
        </div>

        <Section title="Top Deals" subtitle="Biggest discounts right now" products={topDeals} />
        <Section
          title="Best of Electronics"
          subtitle="Phones, laptops & smart gadgets"
          category="electronics"
          products={electronics}
        />
        <Section
          title="Fashion & Beauty Picks"
          subtitle="Trending styles for every day"
          category="fashion"
          products={fashion}
        />
        <Section
          title="Home, Kitchen & Books"
          subtitle="Make every day a little easier"
          category="appliances"
          products={home}
        />
      </div>
    </ShopLayout>
  );
}
