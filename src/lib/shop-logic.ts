import type { CartLine, OrderStatus, PaymentMethodId, Product } from "./shop-types";

export const FREE_DELIVERY_THRESHOLD = 499;
export const DELIVERY_FEE = 40;

export const ORDER_STATUSES: OrderStatus[] = [
  "Placed",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

/** Only permitted status changes may be made from the admin order queue. */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  Placed: ["Packed", "Cancelled"],
  Packed: ["Shipped", "Cancelled"],
  Shipped: ["Out for Delivery"],
  "Out for Delivery": ["Delivered"],
  Delivered: [],
  Cancelled: [],
};

export function nextOrderStatuses(status: OrderStatus): OrderStatus[] {
  return ORDER_STATUS_TRANSITIONS[status];
}

export function isValidOrderTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_STATUS_TRANSITIONS[from].includes(to);
}

export type PaymentMethod = {
  id: PaymentMethodId;
  label: string;
  description: string;
  available: boolean;
};

/** Only Cash on Delivery can be used; UPI and Net Banking are shown as unavailable. */
export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "cod",
    label: "Cash on Delivery",
    description: "Pay in cash when your order arrives.",
    available: true,
  },
  {
    id: "upi",
    label: "UPI",
    description: "Google Pay, PhonePe, Paytm & more",
    available: false,
  },
  {
    id: "netbanking",
    label: "Net Banking",
    description: "All major Indian banks",
    available: false,
  },
];

export const PAYMENT_UNAVAILABLE_MESSAGE =
  "UPI and Net Banking are temporarily unavailable due to technical issues. Please select Cash on Delivery (COD) to place your order.";

export function isPaymentAvailable(id: PaymentMethodId): boolean {
  return PAYMENT_METHODS.some((m) => m.id === id && m.available);
}

export function paymentLabel(id: PaymentMethodId): string {
  return PAYMENT_METHODS.find((m) => m.id === id)?.label ?? id;
}

export function discountPercent(price: number, mrp: number): number {
  if (mrp <= 0 || price >= mrp) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

export function cartTotals(lines: CartLine[], products: Product[]) {
  let subtotal = 0;
  let mrpTotal = 0;
  let count = 0;
  for (const line of lines) {
    const p = products.find((x) => x.id === line.productId);
    if (!p) continue;
    subtotal += p.price * line.qty;
    mrpTotal += p.mrp * line.qty;
    count += line.qty;
  }
  const delivery = subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  return {
    count,
    subtotal,
    mrpTotal,
    savings: mrpTotal - subtotal,
    delivery,
    total: subtotal + delivery,
  };
}

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatINR(n: number): string {
  return inr.format(n);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function filterProducts(
  products: Product[],
  opts: { q?: string | undefined; category?: string | undefined; sort?: string | undefined },
): Product[] {
  const q = opts.q?.trim().toLowerCase() ?? "";
  let list = products.filter((p) => {
    if (opts.category && p.category !== opts.category) return false;
    if (!q) return true;
    return [p.name, p.brand, p.category, p.description].some((v) => v.toLowerCase().includes(q));
  });
  if (opts.sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
  if (opts.sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
  if (opts.sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
  if (opts.sort === "discount")
    list = [...list].sort(
      (a, b) => discountPercent(b.price, b.mrp) - discountPercent(a.price, a.mrp),
    );
  return list;
}
