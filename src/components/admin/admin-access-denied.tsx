import { Link } from "@tanstack/react-router";
import { LockKeyhole } from "lucide-react";

import { Button } from "@/components/ui/button";

export function AdminAccessDenied({
  title = "You do not have access to this area",
  description = "Ask a Super Admin to assign a role with the required permission.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <section className="surface flex max-w-md flex-col items-center gap-4 p-8 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-primary">
          <LockKeyhole className="size-7" />
        </span>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
        <Button asChild>
          <Link to="/">Back to store</Link>
        </Button>
      </section>
    </div>
  );
}
