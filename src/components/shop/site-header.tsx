import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import {
  ChevronDown,
  LayoutDashboard,
  LogIn,
  LogOut,
  Package,
  Search,
  ShoppingCart,
  UserPlus,
  UserRound,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CATEGORIES } from "@/lib/shop-data";
import { useShop } from "@/lib/shop-store";
import { CategoryIcon } from "./category-icon";

export function Logo({ inverted = true }: { inverted?: boolean }) {
  return (
    <Link to="/" className="flex shrink-0 flex-col leading-none">
      <span
        className={
          "font-display text-2xl font-bold italic tracking-tight " +
          (inverted ? "text-primary-foreground" : "text-primary")
        }
      >
        ShopEase
      </span>
      <span className="mt-0.5 text-[11px] font-semibold italic text-accent">
        Shop{" "}
        <span className={inverted ? "text-primary-foreground/80" : "text-muted-foreground"}>
          smarter
        </span>{" "}
        ✦
      </span>
    </Link>
  );
}

function SearchBar() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { q?: string };
  const [q, setQ] = useState(search.q ?? "");

  useEffect(() => setQ(search.q ?? ""), [search.q]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    navigate({
      to: "/products",
      search: { q: q.trim() || undefined, category: undefined, sort: undefined },
    });
  };

  return (
    <form onSubmit={onSubmit} className="relative w-full" role="search">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search for products, brands and more"
        aria-label="Search products"
        className="h-11 w-full rounded-lg border-0 bg-card pl-4 pr-12 text-sm text-foreground shadow-card outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-accent"
      />
      <button
        type="submit"
        aria-label="Search"
        className="absolute right-1 top-1 flex h-9 w-10 items-center justify-center rounded-md text-primary hover:bg-secondary"
      >
        <Search className="size-5" />
      </button>
    </form>
  );
}

export function SiteHeader() {
  const { cartCount, currentUser, currentCustomer, isAdmin, signOut } = useShop();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-hero shadow-lift">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
          <Logo />
          <div className="order-last w-full md:order-none md:flex-1">
            <SearchBar />
          </div>
          <nav className="ml-auto flex items-center gap-1 sm:gap-2">
            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-primary-foreground outline-none hover:bg-primary-foreground/10">
                  <UserRound className="size-5" />
                  <span className="hidden max-w-28 truncate sm:inline">
                    {currentUser.name.split(" ")[0]}
                  </span>
                  <ChevronDown className="size-4 opacity-80" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <p className="text-xs font-medium text-muted-foreground">
                      {isAdmin ? "Signed in as administrator" : "Signed in as"}
                    </p>
                    <p>{currentUser.name}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {currentCustomer && (
                    <DropdownMenuItem onSelect={() => navigate({ to: "/orders" })}>
                      <Package /> My Orders
                    </DropdownMenuItem>
                  )}
                  {isAdmin && (
                    <DropdownMenuItem onSelect={() => navigate({ to: "/admin" })}>
                      <LayoutDashboard /> Admin Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => {
                      signOut();
                      navigate({ to: "/" });
                    }}
                  >
                    <LogOut /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-foreground/10"
              >
                <LogIn className="size-5" />
                <span className="hidden sm:inline">Sign in</span>
                <UserPlus className="hidden size-4 sm:block" />
              </Link>
            )}

            <Link
              to="/cart"
              className="relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ShoppingCart className="size-5" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 left-6 flex min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold text-accent-foreground">
                  {cartCount}
                </span>
              )}
            </Link>
          </nav>
        </div>
      </div>
      <div className="border-b border-border bg-card">
        <div className="no-scrollbar mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-1.5">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to="/products"
              search={{ category: c.slug, q: undefined, sort: undefined }}
              className="flex shrink-0 items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary hover:text-primary"
              activeProps={{ className: "text-primary" }}
            >
              <CategoryIcon slug={c.slug} className="size-4" />
              {c.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
