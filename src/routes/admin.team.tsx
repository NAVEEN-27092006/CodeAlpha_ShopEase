import { createFileRoute } from "@tanstack/react-router";
import { ShieldPlus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { AdminAccessDenied } from "@/components/admin/admin-access-denied";
import { AdminPage } from "@/components/admin/admin-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ADMIN_ROLE_DETAILS, useShop } from "@/lib/shop-store";
import type { AdminRole } from "@/lib/shop-types";

export const Route = createFileRoute("/admin/team")({
  head: () => ({
    meta: [
      { title: "Admin Team — ShopEase" },
      { name: "description", content: "Create ShopEase staff accounts with role-specific access." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminTeam,
});

const ASSIGNABLE_ROLES: AdminRole[] = [
  "catalog_manager",
  "order_manager",
  "inventory_manager",
  "support_manager",
];

function AdminTeam() {
  const { accounts, can, createAdmin } = useShop();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "catalog_manager" as AdminRole,
  });
  const admins = accounts.filter((account) => account.role !== "customer");

  if (!can("admin.manage")) return <AdminAccessDenied />;

  const set = (key: keyof typeof form) => (event: { target: { value: string } }) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      if (!form.name.trim()) throw new Error("Enter the administrator's name.");
      await createAdmin(form);
      toast.success("Administrator created", { description: `${form.name} can now sign in.` });
      setForm({ name: "", email: "", password: "", role: "catalog_manager" });
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminPage
      title="Admin team"
      subtitle="Only the Super Admin can create staff accounts and choose their role."
    >
      <section className="surface p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-secondary text-primary">
            <ShieldPlus className="size-5" />
          </span>
          <div>
            <h2 className="font-bold">Create administrator</h2>
            <p className="text-sm text-muted-foreground">
              Assign the smallest role needed for the job.
            </p>
          </div>
        </div>
        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="admin-name">Full name</Label>
            <Input id="admin-name" value={form.name} onChange={set("name")} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="admin-email">Email address</Label>
            <Input
              id="admin-email"
              type="email"
              value={form.email}
              onChange={set("email")}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="admin-role">Role</Label>
            <select
              id="admin-role"
              value={form.role}
              onChange={set("role")}
              className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm shadow-sm"
            >
              {ASSIGNABLE_ROLES.map((role) => (
                <option key={role} value={role}>
                  {ADMIN_ROLE_DETAILS[role].label}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              {ADMIN_ROLE_DETAILS[form.role].description}
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="admin-password">Temporary password</Label>
            <Input
              id="admin-password"
              type="password"
              minLength={12}
              autoComplete="new-password"
              value={form.password}
              onChange={set("password")}
              required
            />
            <p className="text-xs text-muted-foreground">
              At least 12 characters. Share it privately with the new administrator.
            </p>
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={busy}>
              {busy ? "Creating..." : "Create administrator"}
            </Button>
          </div>
        </form>
      </section>

      <section className="surface overflow-x-auto">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="border-b border-border bg-muted text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Administrator</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Access</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {admins.map((admin) => {
              const role = admin.role as AdminRole;
              return (
                <tr key={admin.id} className="hover:bg-muted/50">
                  <td className="px-4 py-3 font-semibold">{admin.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{admin.email}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-bold text-secondary-foreground">
                      {ADMIN_ROLE_DETAILS[role].label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {ADMIN_ROLE_DETAILS[role].description}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </AdminPage>
  );
}
