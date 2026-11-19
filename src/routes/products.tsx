import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SearchX, SlidersHorizontal } from "lucide-react";

import { CategoryIcon } from "@/components/shop/category-icon";
import { ProductCard } from "@/components/shop/product-card";
import { ShopLayout } from "@/components/shop/shop-layout";
import { Button } from "@/components/ui/button";
import { CATEGORIES, categoryName } from "@/lib/shop-data";
import { filterProducts } from "@/lib/shop-logic";
import { useShop } from "@/lib/shop-store";
import { cn } from "@/lib/utils";

type ProductSearch = {
  q?: string | undefined;
  category?: string | undefined;
  sort?: string | undefined;
};

const SORTS = [
  { id: undefined, label: "Relevance" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "rating", label: "Top Rated" },
  { id: "discount", label: "Biggest Discount" },
] as const;

export const Route = createFileRoute("/products")({
  validateSearch: (search: Record<string, unknown>): ProductSearch => ({
    q: typeof search["q"] === "string" && search["q"] ? search["q"] : undefined,
    category:
      typeof search["category"] === "string" && search["category"] ? search["category"] : undefined,
    sort: typeof search["sort"] === "string" && search["sort"] ? search["sort"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "All Products — ShopEase" },
      {
        name: "description",
        content: "Browse and filter ShopEase products by category, price and rating.",
      },
      { property: "og:title", content: "All Products — ShopEase" },
      {
        property: "og:description",
        content: "Browse and filter ShopEase products by category, price and rating.",
      },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const { q, category, sort } = Route.useSearch();
  const navigate = useNavigate({ from: "/products" });
  const { products } = useShop();
  const list = filterProducts(products, { q, category, sort });

  const title = q ? `Results for “${q}”` : category ? categoryName(category) : "All Products";

  return (
    <ShopLayout>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[240px_1fr]">
        <aside className="surface h-fit p-4 lg:sticky lg:top-36">
          <p className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
            <SlidersHorizontal className="size-4" /> Categories
          </p>
          <div className="no-scrollbar flex gap-2 overflow-x-auto lg:flex-col lg:gap-1">
            <Link
              to="/products"
              search={{ q, sort, category: undefined }}
              className={cn(
                "shrink-0 rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary",
                !category && "bg-secondary text-primary",
              )}
            >
              All categories
            </Link>
            {CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                to="/products"
                search={{ q, sort, category: c.slug }}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary",
                  category === c.slug && "bg-secondary text-primary",
                )}
              >
                <CategoryIcon slug={c.slug} className="size-4" /> {c.name}
              </Link>
            ))}
          </div>
        </aside>

        <section className="space-y-4">
          <div className="surface flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-bold">{title}</h1>
              <p className="text-sm text-muted-foreground">
                {list.length} {list.length === 1 ? "product" : "products"}
              </p>
            </div>
            <div className="no-scrollbar flex gap-1 overflow-x-auto">
              {SORTS.map((s) => (
                <button
                  key={s.label}
                  onClick={() => navigate({ search: (prev) => ({ ...prev, sort: s.id }) })}
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                    sort === s.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary",
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {list.length === 0 ? (
            <div className="surface flex flex-col items-center gap-3 px-6 py-16 text-center">
              <SearchX className="size-12 text-muted-foreground" />
              <h2 className="text-lg font-bold">No products found</h2>
              <p className="max-w-sm text-sm text-muted-foreground">
                Try a different search term or browse all categories.
              </p>
              <Button asChild>
                <Link
                  to="/products"
                  search={{ q: undefined, category: undefined, sort: undefined }}
                >
                  Browse all products
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
              {list.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>
      </div>
    </ShopLayout>
  );
}
