import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AdminAccessDenied } from "@/components/admin/admin-access-denied";
import { AdminPage } from "@/components/admin/admin-page";
import { ProductFormDialog } from "@/components/admin/product-form-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATEGORIES, categoryName } from "@/lib/shop-data";
import { discountPercent, filterProducts, formatINR } from "@/lib/shop-logic";
import { useShop } from "@/lib/shop-store";
import type { Product } from "@/lib/shop-types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/products")({
  head: () => ({
    meta: [
      { title: "Products — ShopEase Admin" },
      { name: "description", content: "Add, edit and remove products in the ShopEase catalog." },
      { property: "og:title", content: "Products — ShopEase Admin" },
      {
        property: "og:description",
        content: "Add, edit and remove products in the ShopEase catalog.",
      },
    ],
  }),
  component: AdminProducts,
});

function AdminProducts() {
  const { products, deleteProduct, loadDemoProducts, can } = useShop();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Product | null>(null);

  const list = filterProducts(products, { q, category: category || undefined });

  if (!can("catalog.manage")) return <AdminAccessDenied />;

  return (
    <AdminPage
      title="Products"
      subtitle={`${products.length} products in your catalog`}
      actions={
        <>
          <Button
            variant="outline"
            onClick={() => {
              loadDemoProducts();
              toast.success("Demo products loaded", {
                description: "All 12 sample products are back in the catalog.",
              });
            }}
          >
            <RefreshCw /> Load demo products
          </Button>
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus /> Add product
          </Button>
        </>
      }
    >
      <div className="surface flex flex-col gap-3 p-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or brand"
            className="h-10 pl-9"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Filter by category"
          className="h-10 rounded-md border border-input bg-card px-3 text-sm shadow-sm"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="surface overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b border-border bg-muted text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3 text-right">Price</th>
              <th className="px-4 py-3 text-right">MRP</th>
              <th className="px-4 py-3 text-right">Stock</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {list.map((p) => (
              <tr key={p.id} className="hover:bg-muted/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.image}
                      alt=""
                      className="size-12 rounded-md border border-border bg-card object-contain p-1"
                    />
                    <div className="min-w-0">
                      <p className="line-clamp-1 font-semibold">{p.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.brand} · ID {p.id}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
                    {categoryName(p.category)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-semibold">{formatINR(p.price)}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">
                  {formatINR(p.mrp)}
                  <span className="ml-1 text-xs font-bold text-success">
                    {discountPercent(p.price, p.mrp)}%
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={cn(
                      "font-semibold",
                      p.stock === 0
                        ? "text-destructive"
                        : p.stock < 15
                          ? "text-warning-foreground"
                          : "",
                    )}
                  >
                    {p.stock}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Edit ${p.name}`}
                      onClick={() => {
                        setEditing(p);
                        setFormOpen(true);
                      }}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete ${p.name}`}
                      className="text-destructive hover:text-destructive"
                      onClick={() => setToDelete(p)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  No products match. Try “Load demo products” to restore the sample catalog.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ProductFormDialog open={formOpen} onOpenChange={setFormOpen} product={editing} />

      <AlertDialog open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              “{toDelete?.name}” will be removed from the store. You can restore demo products
              anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (toDelete) {
                  deleteProduct(toDelete.id);
                  toast.success("Product deleted", { description: toDelete.name });
                }
                setToDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminPage>
  );
}
