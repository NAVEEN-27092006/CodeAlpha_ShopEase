import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/lib/shop-types";

const STYLES: Record<OrderStatus, string> = {
  Placed: "bg-secondary text-secondary-foreground",
  Packed: "bg-warning/20 text-warning-foreground",
  Shipped: "bg-primary/12 text-primary",
  "Out for Delivery": "bg-cta/15 text-cta",
  Delivered: "bg-success/15 text-success",
  Cancelled: "bg-destructive/12 text-destructive",
};

export function StatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold",
        STYLES[status],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
