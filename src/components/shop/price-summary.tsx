import type { ReactNode } from "react";

import { formatINR } from "@/lib/shop-logic";

export function PriceSummary({
  totals,
  children,
}: {
  totals: { count: number; mrpTotal: number; savings: number; delivery: number; total: number };
  children?: ReactNode;
}) {
  return (
    <div className="surface overflow-hidden">
      <p className="border-b border-border px-5 py-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
        Price details
      </p>
      <dl className="space-y-3 px-5 py-4 text-sm">
        <div className="flex justify-between">
          <dt>Price ({totals.count} {totals.count === 1 ? "item" : "items"})</dt>
          <dd>{formatINR(totals.mrpTotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Discount</dt>
          <dd className="font-semibold text-success">− {formatINR(totals.savings)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Delivery charges</dt>
          <dd className={totals.delivery === 0 ? "font-semibold text-success" : ""}>
            {totals.delivery === 0 ? "FREE" : formatINR(totals.delivery)}
          </dd>
        </div>
        <div className="flex justify-between border-t border-dashed border-border pt-3 text-base font-bold">
          <dt>Total amount</dt>
          <dd>{formatINR(totals.total)}</dd>
        </div>
      </dl>
      {totals.savings > 0 && (
        <p className="border-t border-border px-5 py-3 text-sm font-semibold text-success">
          You will save {formatINR(totals.savings)} on this order
        </p>
      )}
      {children && <div className="border-t border-border p-4">{children}</div>}
    </div>
  );
}
