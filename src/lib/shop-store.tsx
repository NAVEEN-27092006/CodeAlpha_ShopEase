import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { createPasswordSalt, hashPassword, verifyPassword } from "./password";
import { SEED_PRODUCTS } from "./shop-data";
import {
  cartTotals,
  isPaymentAvailable,
  isValidOrderTransition,
  PAYMENT_UNAVAILABLE_MESSAGE,
} from "./shop-logic";
import type {
  Account,
  AccountRole,
  AdminRole,
  CartLine,
  Customer,
  Order,
  OrderStatus,
  PaymentMethodId,
  Permission,
  Product,
} from "./shop-types";

const STORAGE_KEY = "shopease-store-v3";

const ADMIN_ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  super_admin: [
    "admin.manage",
    "catalog.manage",
    "inventory.manage",
    "orders.view",
    "orders.manage",
    "payments.collect",
    "customers.view",
  ],
  catalog_manager: ["catalog.manage"],
  order_manager: ["orders.view", "orders.manage", "payments.collect"],
  inventory_manager: ["inventory.manage"],
  support_manager: ["orders.view", "customers.view"],
};

export const ADMIN_ROLE_DETAILS: Record<AdminRole, { label: string; description: string }> = {
  super_admin: {
    label: "Super Admin",
    description: "Full access, including creating and managing other administrators.",
  },
  catalog_manager: {
    label: "Catalogue Admin",
    description: "Manages products and catalogue details.",
  },
  order_manager: {
    label: "Order Admin",
    description: "Processes orders, delivery updates and COD collection.",
  },
  inventory_manager: {
    label: "Inventory Admin",
    description: "Adjusts and audits product stock.",
  },
  support_manager: {
    label: "Support Admin",
    description: "Views customer and order information without changing fulfilment.",
  },
};

const INITIAL_ADMINS: Account[] = [
  {
    id: "a-super",
    name: "ShopEase Super Admin",
    email: "super.admin@shopease.local",
    role: "super_admin",
    passwordSalt: "rFojxn15yLc5wSAK6/DmWw==",
    passwordHash: "SifEvts/xyuvQjRxbmD5gFw6u2DY/wnyoOdDJlDctTQ=",
    createdAt: "2026-11-19T00:00:00.000Z",
    active: true,
  },
  {
    id: "a-catalog",
    name: "ShopEase Catalogue Admin",
    email: "catalog.admin@shopease.local",
    role: "catalog_manager",
    passwordSalt: "KVMt3x9QseqTygbIuyMc/Q==",
    passwordHash: "Bw/sBZuPa+PCQehflN2XD1tABdqqoY0L2S32aMNe1mg=",
    createdAt: "2026-11-19T00:00:00.000Z",
    active: true,
  },
  {
    id: "a-orders",
    name: "ShopEase Order Admin",
    email: "orders.admin@shopease.local",
    role: "order_manager",
    passwordSalt: "lCPBARzJgSP0FTxVFhIQ/w==",
    passwordHash: "02FqLjuxhDCJSIoY6HQSS18CbeWiD3ecRuvPvDLCtDg=",
    createdAt: "2026-11-19T00:00:00.000Z",
    active: true,
  },
  {
    id: "a-inventory",
    name: "ShopEase Inventory Admin",
    email: "inventory.admin@shopease.local",
    role: "inventory_manager",
    passwordSalt: "/m3qg9pNvZB1WINaDGH01A==",
    passwordHash: "jQkSX13d5AqK1etg/JBwG+Qz+7gJJ4RDi8kUB3kA1lQ=",
    createdAt: "2026-11-19T00:00:00.000Z",
    active: true,
  },
  {
    id: "a-support",
    name: "ShopEase Support Admin",
    email: "support.admin@shopease.local",
    role: "support_manager",
    passwordSalt: "kxJ5m8PsqVcV5BD/Al/baw==",
    passwordHash: "8P2OWKIXJm2d3IwW2imxiZTeV83siLm+HCAJIZs2Gnk=",
    createdAt: "2026-11-19T00:00:00.000Z",
    active: true,
  },
];

type ShopState = {
  sessionUserId: string | null;
  accounts: Account[];
  customers: Customer[];
  products: Product[];
  orders: Order[];
  cart: CartLine[];
};

const initialState: ShopState = {
  sessionUserId: null,
  accounts: INITIAL_ADMINS,
  customers: [],
  products: SEED_PRODUCTS,
  orders: [],
  cart: [],
};

export type CheckoutDetails = {
  name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  payment: PaymentMethodId;
};

export type CustomerRegistration = {
  name: string;
  email: string;
  password: string;
  phone: string;
  city: string;
  address: string;
};

export type AdminCreation = {
  name: string;
  email: string;
  password: string;
  role: AdminRole;
};

type ShopContextValue = ShopState & {
  currentUser: Account | null;
  currentCustomer: Customer | null;
  currentAdminRole: AdminRole | null;
  isAdmin: boolean;
  cartCount: number;
  can: (permission: Permission) => boolean;
  signIn: (email: string, password: string) => Promise<Account>;
  registerCustomer: (details: CustomerRegistration) => Promise<Account>;
  signOut: () => void;
  createAdmin: (details: AdminCreation) => Promise<Account>;
  addToCart: (productId: string, qty?: number) => boolean;
  setQty: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  placeOrder: (details: CheckoutDetails) => Order;
  saveProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  loadDemoProducts: () => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  markOrderPaid: (id: string) => void;
  adjustStock: (id: string, quantity: number) => void;
};

const ShopContext = createContext<ShopContextValue | null>(null);

function hydrateState(saved: Partial<ShopState>): ShopState {
  return {
    ...initialState,
    ...saved,
    accounts: saved.accounts ?? initialState.accounts,
    customers: saved.customers ?? [],
    products: saved.products ?? initialState.products,
    orders: (saved.orders ?? []).map((order) => ({
      ...order,
      paymentStatus:
        order.paymentStatus ?? (order.status === "Delivered" ? "Paid" : "Payable on delivery"),
      statusHistory: order.statusHistory ?? [
        {
          oldStatus: null,
          newStatus: order.status,
          actor: "System",
          timestamp: order.date,
        },
      ],
    })),
    cart: saved.cart ?? [],
    sessionUserId: saved.sessionUserId ?? null,
  };
}

function getAdminRole(role: AccountRole): AdminRole | null {
  return role === "customer" ? null : role;
}

function hasPermission(account: Account | null, permission: Permission): boolean {
  const role = account ? getAdminRole(account.role) : null;
  return role ? ADMIN_ROLE_PERMISSIONS[role].includes(permission) : false;
}

function requirePermission(account: Account | null, permission: Permission): void {
  if (!hasPermission(account, permission)) {
    throw new Error("Your account does not have permission for this action.");
  }
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ShopState>(initialState);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setState(hydrateState(JSON.parse(raw) as Partial<ShopState>));
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, loaded]);

  const currentUser = state.accounts.find((account) => account.id === state.sessionUserId) ?? null;
  const currentCustomer =
    currentUser?.role === "customer"
      ? (state.customers.find((customer) => customer.id === currentUser.id) ?? null)
      : null;
  const currentAdminRole = currentUser ? getAdminRole(currentUser.role) : null;

  const can = useCallback(
    (permission: Permission) => hasPermission(currentUser, permission),
    [currentUser],
  );

  const signIn = useCallback(
    async (email: string, password: string): Promise<Account> => {
      const normalizedEmail = email.trim().toLowerCase();
      const account = state.accounts.find(
        (candidate) => candidate.email.toLowerCase() === normalizedEmail,
      );
      if (!account || !account.active) throw new Error("Email or password is incorrect.");
      if (!(await verifyPassword(password, account.passwordSalt, account.passwordHash))) {
        throw new Error("Email or password is incorrect.");
      }
      setState((current) => ({ ...current, sessionUserId: account.id, cart: [] }));
      return account;
    },
    [state.accounts],
  );

  const registerCustomer = useCallback(
    async (details: CustomerRegistration): Promise<Account> => {
      const email = details.email.trim().toLowerCase();
      if (state.accounts.some((account) => account.email.toLowerCase() === email)) {
        throw new Error("An account with this email already exists. Please sign in instead.");
      }
      if (details.password.length < 10) {
        throw new Error("Use a password with at least 10 characters.");
      }
      const id = `c-${crypto.randomUUID()}`;
      const passwordSalt = createPasswordSalt();
      const account: Account = {
        id,
        name: details.name.trim(),
        email,
        role: "customer",
        passwordSalt,
        passwordHash: await hashPassword(details.password, passwordSalt),
        createdAt: new Date().toISOString(),
        active: true,
      };
      const customer: Customer = {
        id,
        name: account.name,
        email,
        phone: details.phone.trim(),
        city: details.city.trim(),
        address: details.address.trim(),
        joined: account.createdAt,
      };
      setState((current) => ({
        ...current,
        accounts: [...current.accounts, account],
        customers: [...current.customers, customer],
        sessionUserId: id,
      }));
      return account;
    },
    [state.accounts],
  );

  const signOut = useCallback(() => {
    setState((current) => ({ ...current, sessionUserId: null, cart: [] }));
  }, []);

  const createAdmin = useCallback(
    async (details: AdminCreation): Promise<Account> => {
      requirePermission(currentUser, "admin.manage");
      const email = details.email.trim().toLowerCase();
      if (state.accounts.some((account) => account.email.toLowerCase() === email)) {
        throw new Error("An account with this email already exists.");
      }
      if (details.password.length < 12) {
        throw new Error("Admin passwords must be at least 12 characters.");
      }
      const passwordSalt = createPasswordSalt();
      const account: Account = {
        id: `a-${crypto.randomUUID()}`,
        name: details.name.trim(),
        email,
        role: details.role,
        passwordSalt,
        passwordHash: await hashPassword(details.password, passwordSalt),
        createdAt: new Date().toISOString(),
        active: true,
      };
      setState((current) => ({ ...current, accounts: [...current.accounts, account] }));
      return account;
    },
    [currentUser, state.accounts],
  );

  const addToCart = useCallback(
    (productId: string, qty = 1) => {
      const product = state.products.find((candidate) => candidate.id === productId);
      const existing = state.cart.find((line) => line.productId === productId)?.qty ?? 0;
      if (!product || product.stock <= existing) return false;

      setState((current) => {
        const currentQuantity = current.cart.find((line) => line.productId === productId)?.qty ?? 0;
        const nextQuantity = Math.min(currentQuantity + qty, product.stock, 10);
        return {
          ...current,
          cart: current.cart.some((line) => line.productId === productId)
            ? current.cart.map((line) =>
                line.productId === productId ? { ...line, qty: nextQuantity } : line,
              )
            : [...current.cart, { productId, qty: nextQuantity }],
        };
      });
      return true;
    },
    [state.cart, state.products],
  );

  const setQty = useCallback((productId: string, qty: number) => {
    setState((current) => {
      const product = current.products.find((candidate) => candidate.id === productId);
      const allowed = Math.min(qty, product?.stock ?? 0, 10);
      return {
        ...current,
        cart:
          allowed <= 0
            ? current.cart.filter((line) => line.productId !== productId)
            : current.cart.map((line) =>
                line.productId === productId ? { ...line, qty: allowed } : line,
              ),
      };
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setState((current) => ({
      ...current,
      cart: current.cart.filter((line) => line.productId !== productId),
    }));
  }, []);

  const clearCart = useCallback(() => setState((current) => ({ ...current, cart: [] })), []);

  const placeOrder = useCallback(
    (details: CheckoutDetails): Order => {
      if (!currentCustomer || !currentUser)
        throw new Error("Please sign in before placing an order.");
      if (!isPaymentAvailable(details.payment)) throw new Error(PAYMENT_UNAVAILABLE_MESSAGE);
      if (state.cart.length === 0) throw new Error("Your cart is empty.");
      const unavailable = state.cart.find((line) => {
        const product = state.products.find((candidate) => candidate.id === line.productId);
        return !product || line.qty < 1 || line.qty > product.stock;
      });
      if (unavailable) {
        throw new Error(
          "One or more items changed stock. Please review your cart before checkout.",
        );
      }
      const totals = cartTotals(state.cart, state.products);
      const nextNumber =
        Math.max(10240, ...state.orders.map((order) => Number(order.id.slice(2)) || 0)) + 1;
      const now = new Date().toISOString();
      const order: Order = {
        id: `SE${nextNumber}`,
        customerId: currentCustomer.id,
        customerName: details.name,
        phone: details.phone,
        address: `${details.address}, ${details.city} ${details.pincode}`,
        items: state.cart.flatMap((line) => {
          const product = state.products.find((candidate) => candidate.id === line.productId);
          return product
            ? [
                {
                  productId: product.id,
                  name: product.name,
                  image: product.image,
                  price: product.price,
                  qty: line.qty,
                },
              ]
            : [];
        }),
        subtotal: totals.subtotal,
        delivery: totals.delivery,
        total: totals.total,
        payment: details.payment,
        paymentStatus: "Payable on delivery",
        status: "Placed",
        date: now,
        statusHistory: [
          {
            oldStatus: null,
            newStatus: "Placed",
            actor: currentUser.name,
            timestamp: now,
            note: "COD order placed",
          },
        ],
      };
      setState((current) => ({
        ...current,
        orders: [order, ...current.orders],
        cart: [],
        products: current.products.map((product) => {
          const line = current.cart.find((item) => item.productId === product.id);
          return line ? { ...product, stock: product.stock - line.qty } : product;
        }),
      }));
      return order;
    },
    [currentCustomer, currentUser, state.cart, state.orders, state.products],
  );

  const saveProduct = useCallback(
    (product: Product) => {
      requirePermission(currentUser, "catalog.manage");
      setState((current) => {
        const exists = current.products.some((candidate) => candidate.id === product.id);
        return {
          ...current,
          products: exists
            ? current.products.map((candidate) =>
                candidate.id === product.id ? product : candidate,
              )
            : [product, ...current.products],
        };
      });
    },
    [currentUser],
  );

  const deleteProduct = useCallback(
    (id: string) => {
      requirePermission(currentUser, "catalog.manage");
      setState((current) => ({
        ...current,
        products: current.products.filter((product) => product.id !== id),
        cart: current.cart.filter((line) => line.productId !== id),
      }));
    },
    [currentUser],
  );

  const loadDemoProducts = useCallback(() => {
    requirePermission(currentUser, "catalog.manage");
    setState((current) => {
      const custom = current.products.filter(
        (product) => !SEED_PRODUCTS.some((demoProduct) => demoProduct.id === product.id),
      );
      return { ...current, products: [...SEED_PRODUCTS, ...custom] };
    });
  }, [currentUser]);

  const adjustStock = useCallback(
    (id: string, quantity: number) => {
      requirePermission(currentUser, "inventory.manage");
      if (!Number.isInteger(quantity) || quantity === 0) {
        throw new Error("Enter a whole-number stock adjustment.");
      }
      setState((current) => {
        const product = current.products.find((candidate) => candidate.id === id);
        if (!product) throw new Error("Product not found.");
        if (product.stock + quantity < 0) throw new Error("Stock cannot go below zero.");
        return {
          ...current,
          products: current.products.map((candidate) =>
            candidate.id === id ? { ...candidate, stock: candidate.stock + quantity } : candidate,
          ),
        };
      });
    },
    [currentUser],
  );

  const updateOrderStatus = useCallback(
    (id: string, status: OrderStatus) => {
      requirePermission(currentUser, "orders.manage");
      const currentOrder = state.orders.find((order) => order.id === id);
      if (!currentOrder) throw new Error("Order not found.");
      if (!isValidOrderTransition(currentOrder.status, status)) {
        throw new Error(`Cannot move an order from ${currentOrder.status} to ${status}.`);
      }
      const timestamp = new Date().toISOString();
      setState((current) => {
        const changedOrder = current.orders.find((order) => order.id === id);
        if (!changedOrder) return current;
        return {
          ...current,
          orders: current.orders.map((order) =>
            order.id === id
              ? {
                  ...order,
                  status,
                  statusHistory: [
                    ...order.statusHistory,
                    {
                      oldStatus: order.status,
                      newStatus: status,
                      actor: currentUser?.name ?? "Store admin",
                      timestamp,
                    },
                  ],
                }
              : order,
          ),
          products:
            status === "Cancelled"
              ? current.products.map((product) => {
                  const item = changedOrder.items.find((line) => line.productId === product.id);
                  return item ? { ...product, stock: product.stock + item.qty } : product;
                })
              : current.products,
        };
      });
    },
    [currentUser, state.orders],
  );

  const markOrderPaid = useCallback(
    (id: string) => {
      requirePermission(currentUser, "payments.collect");
      const currentOrder = state.orders.find((order) => order.id === id);
      if (!currentOrder) throw new Error("Order not found.");
      if (
        currentOrder.payment !== "cod" ||
        currentOrder.status !== "Delivered" ||
        currentOrder.paymentStatus === "Paid"
      ) {
        throw new Error("COD can be marked paid only after delivery is confirmed.");
      }
      setState((current) => ({
        ...current,
        orders: current.orders.map((order) =>
          order.id === id ? { ...order, paymentStatus: "Paid" } : order,
        ),
      }));
    },
    [currentUser, state.orders],
  );

  const value = useMemo<ShopContextValue>(
    () => ({
      ...state,
      currentUser,
      currentCustomer,
      currentAdminRole,
      isAdmin: currentAdminRole !== null,
      cartCount: state.cart.reduce((count, line) => count + line.qty, 0),
      can,
      signIn,
      registerCustomer,
      signOut,
      createAdmin,
      addToCart,
      setQty,
      removeFromCart,
      clearCart,
      placeOrder,
      saveProduct,
      deleteProduct,
      loadDemoProducts,
      updateOrderStatus,
      markOrderPaid,
      adjustStock,
    }),
    [
      state,
      currentUser,
      currentCustomer,
      currentAdminRole,
      can,
      signIn,
      registerCustomer,
      signOut,
      createAdmin,
      addToCart,
      setQty,
      removeFromCart,
      clearCart,
      placeOrder,
      saveProduct,
      deleteProduct,
      loadDemoProducts,
      updateOrderStatus,
      markOrderPaid,
      adjustStock,
    ],
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) throw new Error("useShop must be used inside ShopProvider");
  return context;
}
