import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, LockKeyhole, ShoppingBag, UserPlus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Logo } from "@/components/shop/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useShop } from "@/lib/shop-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — ShopEase" },
      {
        name: "description",
        content: "Sign in to ShopEase or create a customer account.",
      },
      { property: "og:title", content: "Sign in — ShopEase" },
      {
        property: "og:description",
        content: "Sign in to ShopEase or create a customer account.",
      },
    ],
  }),
  component: LoginPage,
});

type LoginMode = "customer" | "admin";

function LoginPage() {
  const { currentUser, registerCustomer, signIn } = useShop();
  const navigate = useNavigate();
  const [mode, setMode] = useState<LoginMode>("customer");
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    city: "",
    address: "",
  });

  const update = (key: keyof typeof form) => (event: { target: { value: string } }) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "admin" || !creatingAccount) {
        const account = await signIn(form.email, form.password);
        toast.success(`Welcome back, ${account.name.split(" ")[0]}`);
        navigate({ to: account.role === "customer" ? "/" : "/admin" });
        return;
      }

      if (!form.name.trim() || !form.city.trim() || !form.address.trim()) {
        throw new Error("Please complete your name and delivery address.");
      }
      if (!/^\d{10}$/.test(form.phone.replace(/\s/g, ""))) {
        throw new Error("Enter a valid 10-digit mobile number.");
      }
      if (form.password !== form.confirmPassword) {
        throw new Error("Passwords do not match.");
      }
      const account = await registerCustomer({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone.replace(/\s/g, ""),
        city: form.city,
        address: form.address,
      });
      toast.success(`Welcome to ShopEase, ${account.name.split(" ")[0]}!`);
      navigate({ to: "/" });
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-hero px-4">
        <section className="surface max-w-md p-8 text-center">
          <h1 className="text-2xl font-bold">You are already signed in</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Continue shopping or return to your account menu to sign out.
          </p>
          <Button asChild className="mt-6">
            <Link to="/">Continue to ShopEase</Link>
          </Button>
        </section>
      </div>
    );
  }

  const isRegistration = mode === "customer" && creatingAccount;

  return (
    <div className="min-h-screen bg-hero px-4 py-10 sm:py-16">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <Logo />
          <h1 className="mt-4 text-3xl font-extrabold text-primary-foreground sm:text-4xl">
            {isRegistration ? "Create your ShopEase account" : "Welcome back to ShopEase"}
          </h1>
          <p className="max-w-lg text-primary-foreground/80">
            {isRegistration
              ? "Create a customer account to checkout, save your delivery details and track orders."
              : "Sign in securely to continue shopping or manage your assigned store role."}
          </p>
        </div>

        <section className="surface mx-auto w-full max-w-2xl overflow-hidden">
          <div className="grid grid-cols-2 border-b border-border bg-muted p-1.5">
            <button
              type="button"
              onClick={() => setMode("customer")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-bold transition-colors",
                mode === "customer" ? "bg-card text-primary shadow-card" : "text-muted-foreground",
              )}
            >
              <ShoppingBag className="size-4" /> Customer
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("admin");
                setCreatingAccount(false);
              }}
              className={cn(
                "flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-bold transition-colors",
                mode === "admin" ? "bg-card text-primary shadow-card" : "text-muted-foreground",
              )}
            >
              <LockKeyhole className="size-4" /> Staff and admin
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-5 p-6 sm:p-8">
            {mode === "admin" && (
              <p className="rounded-lg bg-secondary px-4 py-3 text-sm text-secondary-foreground">
                Staff accounts are created only by the Super Admin. Use the credentials assigned to
                your role.
              </p>
            )}

            {isRegistration && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="register-name">Full name</Label>
                  <Input
                    id="register-name"
                    autoComplete="name"
                    value={form.name}
                    onChange={update("name")}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="register-phone">Mobile number</Label>
                  <Input
                    id="register-phone"
                    inputMode="numeric"
                    maxLength={10}
                    autoComplete="tel"
                    value={form.phone}
                    onChange={update("phone")}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="register-city">City</Label>
                  <Input
                    id="register-city"
                    autoComplete="address-level2"
                    value={form.city}
                    onChange={update("city")}
                    required
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="register-address">Delivery address</Label>
                  <Input
                    id="register-address"
                    autoComplete="street-address"
                    value={form.address}
                    onChange={update("address")}
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="auth-email">Email address</Label>
              <Input
                id="auth-email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={update("email")}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="auth-password">Password</Label>
              <Input
                id="auth-password"
                type="password"
                autoComplete={isRegistration ? "new-password" : "current-password"}
                value={form.password}
                onChange={update("password")}
                required
              />
              {isRegistration && (
                <p className="text-xs text-muted-foreground">Use at least 10 characters.</p>
              )}
            </div>
            {isRegistration && (
              <div className="space-y-1.5">
                <Label htmlFor="auth-confirm">Confirm password</Label>
                <Input
                  id="auth-confirm"
                  type="password"
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={update("confirmPassword")}
                  required
                />
              </div>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy ? "Please wait..." : isRegistration ? "Create account" : "Sign in"}
              {!busy && <ArrowRight />}
            </Button>

            {mode === "customer" && (
              <p className="text-center text-sm text-muted-foreground">
                {isRegistration ? "Already have an account?" : "New to ShopEase?"}{" "}
                <button
                  type="button"
                  className="font-bold text-primary hover:underline"
                  onClick={() => setCreatingAccount((current) => !current)}
                >
                  {isRegistration ? "Sign in" : "Create an account"}
                </button>
              </p>
            )}
          </form>
        </section>
      </div>
    </div>
  );
}
