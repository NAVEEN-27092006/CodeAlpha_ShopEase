export type AdminRole =
  "super_admin" | "catalog_manager" | "order_manager" | "inventory_manager" | "support_manager";

export type AccountRole = "customer" | AdminRole;

export type Permission =
  | "admin.manage"
  | "catalog.manage"
  | "inventory.manage"
  | "orders.view"
  | "orders.manage"
  | "payments.collect"
  | "customers.view";

export type Account = {
  id: string;
  name: string;
  email: string;
  role: AccountRole;
  passwordHash: string;
  passwordSalt: string;
  createdAt: string;
  active: boolean;
};

export type Category = {
  slug: string;
  name: string;
};

export type Product = {
  id: string;
  name: string;
  brand: string;
  category: string; // category slug
  price: number;
  mrp: number;
  rating: number;
  reviews: number;
  image: string;
  description: string;
  highlights: string[];
  stock: number;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  joined: string; // ISO date
};

export type OrderStatus =
  "Placed" | "Packed" | "Shipped" | "Out for Delivery" | "Delivered" | "Cancelled";

export type PaymentStatus = "Payable on delivery" | "Paid";

export type OrderStatusHistory = {
  oldStatus: OrderStatus | null;
  newStatus: OrderStatus;
  actor: string;
  timestamp: string;
  note?: string;
};

export type OrderItem = {
  productId: string;
  name: string;
  image: string;
  price: number;
  qty: number;
};

export type PaymentMethodId = "cod" | "upi" | "netbanking";

export type Order = {
  id: string;
  customerId: string;
  customerName: string;
  phone: string;
  address: string;
  items: OrderItem[];
  subtotal: number;
  delivery: number;
  total: number;
  payment: PaymentMethodId;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  date: string; // ISO
  statusHistory: OrderStatusHistory[];
};

export type CartLine = { productId: string; qty: number };
