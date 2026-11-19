import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORIES, PRODUCT_IMAGES } from "@/lib/shop-data";
import { useShop } from "@/lib/shop-store";
import type { Product } from "@/lib/shop-types";
import { cn } from "@/lib/utils";

type FormState = {
  name: string;
  brand: string;
  category: string;
  price: string;
  mrp: string;
  stock: string;
  image: string;
  description: string;
  highlights: string;
};

function toForm(p?: Product | null): FormState {
  return {
    name: p?.name ?? "",
    brand: p?.brand ?? "",
    category: p?.category ?? CATEGORIES[0]!.slug,
    price: p ? String(p.price) : "",
    mrp: p ? String(p.mrp) : "",
    stock: p ? String(p.stock) : "25",
    image: p?.image ?? PRODUCT_IMAGES[0]!.src,
    description: p?.description ?? "",
    highlights: p?.highlights.join("\n") ?? "",
  };
}

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-card px-3 text-sm shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring";

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  product: Product | null;
}) {
  const { saveProduct } = useShop();
  const [form, setForm] = useState<FormState>(toForm(product));
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm(toForm(product));
      setError("");
    }
  }, [open, product]);

  const set = (k: keyof FormState) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const price = Number(form.price);
    const mrp = Number(form.mrp || form.price);
    const stock = Number(form.stock);
    if (!form.name.trim() || !form.brand.trim()) return setError("Name and brand are required.");
    if (!(price > 0)) return setError("Enter a valid selling price.");
    if (mrp < price) return setError("MRP must be equal to or higher than the selling price.");
    if (!Number.isInteger(stock) || stock < 0) return setError("Stock must be a whole number.");
    if (!form.image.trim()) return setError("Choose or paste a product image.");

    saveProduct({
      id: product?.id ?? `p${Date.now()}`,
      name: form.name.trim(),
      brand: form.brand.trim(),
      category: form.category,
      price,
      mrp,
      stock,
      image: form.image.trim(),
      description: form.description.trim() || `${form.name.trim()} by ${form.brand.trim()}.`,
      highlights: form.highlights.split("\n").map((h) => h.trim()).filter(Boolean),
      rating: product?.rating ?? 4.0,
      reviews: product?.reviews ?? 0,
    });
    toast.success(product ? "Product updated" : "Product added", { description: form.name });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{product ? "Edit product" : "Add new product"}</DialogTitle>
          <DialogDescription>Changes appear instantly in the customer store.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="pf-name">Product name</Label>
              <Input id="pf-name" value={form.name} onChange={set("name")} placeholder="e.g. Nova X5 5G (128 GB)" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pf-brand">Brand</Label>
              <Input id="pf-brand" value={form.brand} onChange={set("brand")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pf-cat">Category</Label>
              <select id="pf-cat" value={form.category} onChange={set("category")} className={selectClass}>
                {CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pf-price">Selling price (₹)</Label>
              <Input id="pf-price" type="number" min={1} value={form.price} onChange={set("price")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pf-mrp">MRP (₹)</Label>
              <Input id="pf-mrp" type="number" min={1} value={form.mrp} onChange={set("mrp")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pf-stock">Stock</Label>
              <Input id="pf-stock" type="number" min={0} value={form.stock} onChange={set("stock")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Product image</Label>
            <div className="grid grid-cols-6 gap-2">
              {PRODUCT_IMAGES.map((img) => (
                <button
                  type="button"
                  key={img.src}
                  title={img.label}
                  onClick={() => setForm((f) => ({ ...f, image: img.src }))}
                  className={cn(
                    "aspect-square rounded-md border-2 bg-card p-1",
                    form.image === img.src ? "border-primary" : "border-border hover:border-primary/40",
                  )}
                >
                  <img src={img.src} alt={img.label} className="h-full w-full object-contain" />
                </button>
              ))}
            </div>
            <Input value={form.image} onChange={set("image")} placeholder="…or paste an image URL" className="text-xs" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pf-desc">Description</Label>
            <Textarea id="pf-desc" rows={3} value={form.description} onChange={set("description")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pf-hl">Highlights (one per line)</Label>
            <Textarea id="pf-hl" rows={3} value={form.highlights} onChange={set("highlights")} />
          </div>

          {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{product ? "Save changes" : "Add product"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
