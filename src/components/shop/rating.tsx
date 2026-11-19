import { Star } from "lucide-react";

export function Rating({ value, reviews }: { value: number; reviews?: number }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="inline-flex items-center gap-0.5 rounded bg-success px-1.5 py-0.5 font-bold text-success-foreground">
        {value.toFixed(1)} <Star className="size-3 fill-current" />
      </span>
      {reviews !== undefined && (
        <span className="font-medium text-muted-foreground">({reviews.toLocaleString("en-IN")})</span>
      )}
    </div>
  );
}
