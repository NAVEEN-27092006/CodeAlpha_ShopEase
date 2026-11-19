import { createFileRoute } from "@tanstack/react-router";
import { Minus, Plus, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AdminAccessDenied } from "@/components/admin/admin-access-denied";
import { AdminPage } from "@/components/admin/admin-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatINR } from "@/lib/shop-logic";
import { useShop } from "@/lib/shop-store";
import type { Product } from "@/lib/shop-types";

export const Route = createFileRoute("/admin/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory — ShopEase Admin" },
      { name: "description", content: "Adjust product stock in the ShopEase admin dashboard." },
      { property: "og:title", content: "Inventory — ShopEase Admin" },
    ],
  }),
  component: InventoryPage,
});

function StockAdjustment({ product }: { product: Product }) {
  const { adjustStock } = useShop();
  const [amount, setAmount] = useState("1");

  const apply = (direction: 1 | -1) => {
    try {
      adjustStock(product.id, Number(amount) * direction);
      toast.success(`${product.name} stock updated`);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <div className="flex items-center justify-end gap-1.5">
      <Button
        variant="outline"
        size="icon"
        className="size-8"
        aria-label={`Reduce ${product.name} stock`}
        onClick={() => apply(-1)}
      >
        <Minus />
      </Button>
      <Input
        aria-label={`Adjustment amount for ${product.name}`}
        value={amount}
        onChange={(event) => setAmount(event.target.value.replace(/\D/g, ""))}
        inputMode="numeric"
        className="h-8 w-14 px-2 text-center text-sm"
      />
      <Button
        variant="outline"
        size="icon"
        className="size-8"
        aria-label={`Increase ${product.name} stock`}
        onClick={() => apply(1)}
      >
        <Plus />
      </Button>
    </div>
  );
}

function InventoryPage() {
  const { can, products } = useShop();
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const filteredProducts = products.filter(
    (product) =>
      !normalizedQuery ||
      product.name.toLowerCase().includes(normalizedQuery) ||
      product.brand.toLowerCase().includes(normalizedQuery),
  );

  if (!can("inventory.manage")) return <AdminAccessDenied />;

  return (
    <AdminPage title="Inventory" subtitle="Use whole-number adjustments to keep stock accurate.">
      <section className="surface p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products"
            className="h-10 pl-9"
          />
        </div>
      </section>

      <section className="surface overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-border bg-muted text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3 text-right">Selling price</th>
              <th className="px-4 py-3 text-right">Current stock</th>
              <th className="px-4 py-3 text-right">Adjustment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-muted/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.image}
                      alt=""
                      className="size-10 rounded border border-border object-contain p-0.5"
                    />
                    <div>
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.brand}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-semibold">{formatINR(product.price)}</td>
                <td className="px-4 py-3 text-right text-base font-bold">{product.stock}</td>
                <td className="px-4 py-3">
                  <StockAdjustment product={product} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </AdminPage>
  );
}
