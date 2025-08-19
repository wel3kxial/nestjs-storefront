export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'MERCHANT' | 'CUSTOMER';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  type: 'DIGITAL' | 'OFFLINE_SERVICE' | 'ONLINE_CONSULTING';
  merchantId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  prices: Price[];
  media?: Media[];
  // Scheduling fields for ONLINE_CONSULTING and OFFLINE_SERVICE
  startTime?: string; // ISO datetime string
  duration?: number; // Duration in minutes
  // Location field for OFFLINE_SERVICE
  address?: string; // Service location address
}

export interface Price {
  id: string;
  productId: string;
  currency: string;
  unitAmount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Media {
  id: string;
  productId: string;
  url: string;
  type: 'IMAGE' | 'VIDEO';
  alt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  priceId: string;
  quantity: number;
  slotId?: string;
  product: Product;
  price: Price;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED';
  totalAmount: number;
  currency: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  priceId: string;
  quantity: number;
  unitAmount: number;
  totalAmount: number;
  product: Product;
  createdAt: string;
  updatedAt: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}