export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string | number;
  stock: number;
  imageUrl: string;
  categoryId: number;
  category?: Category;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "customer";
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  quantity: number;
  price: string | number;
}

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "cod" | "bkash" | "nagad";
export type PaymentStatus = "unpaid" | "pending_verification" | "paid";

export interface Order {
  id: number;
  userId: number;
  status: OrderStatus;
  totalAmount: string | number;
  shippingAddress: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionId: string | null;
  paymentPhone: string | null;
  createdAt: string;
  items: OrderItem[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface AdminStats {
  totalProducts: number;
  totalCategories: number;
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
  pendingVerificationCount: number;
  outOfStockCount: number;
}
