import { cn } from "@/lib/utils";
import { discountPercent, formatINR } from "@/lib/shop-logic";

export function Price({
  price,
  mrp,
  size = "md",
}: {
  price: number;
  mrp: number;
  size?: "md" | "lg";
}) {
  const off = discountPercent(price, mrp);
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <span className={cn("font-display font-bold text-foreground", size === "lg" ? "text-3xl" : "text-lg")}>
        {formatINR(price)}
      </span>
      {off > 0 && (
        <>
          <span className={cn("text-muted-foreground line-through", size === "lg" ? "text-base" : "text-xs")}>
            {formatINR(mrp)}
          </span>
          <span className={cn("font-bold text-success", size === "lg" ? "text-base" : "text-xs")}>{off}% off</span>
        </>
      )}
    </div>
  );
}
