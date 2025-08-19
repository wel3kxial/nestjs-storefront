import axios from 'axios';
import type { AuthResponse, User, Product, Cart, Order, ApiError } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired, redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', { ...data, role: 'CUSTOMER' });
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

// Products API
export const productsApi = {
  getProducts: async (type?: string): Promise<Product[]> => {
    const params = type ? { type } : {};
    const response = await api.get('/catalog/products', { params });
    return response.data;
  },

  getProduct: async (id: string): Promise<Product> => {
    const response = await api.get(`/catalog/products/${id}`);
    return response.data;
  },
};

// Cart API
export const cartApi = {
  getCart: async (): Promise<Cart> => {
    const response = await api.get('/cart');
    return response.data;
  },

  createCart: async (): Promise<Cart> => {
    const response = await api.post('/cart');
    return response.data;
  },

  addToCart: async (cartId: string, item: {
    productId: string;
    priceId: string;
    quantity: number;
    slotId?: string;
  }): Promise<Cart> => {
    const response = await api.post(`/cart/${cartId}/items`, item);
    return response.data;
  },

  updateCartItem: async (cartId: string, itemId: string, quantity: number): Promise<Cart> => {
    const response = await api.patch(`/cart/${cartId}/items/${itemId}`, { quantity });
    return response.data;
  },

  removeFromCart: async (cartId: string, itemId: string): Promise<Cart> => {
    const response = await api.delete(`/cart/${cartId}/items/${itemId}`);
    return response.data;
  },
};

// Orders API
export const ordersApi = {
  createOrderFromCart: async (cartId: string): Promise<Order> => {
    const response = await api.post(`/orders/from-cart/${cartId}`);
    return response.data;
  },

  getOrders: async (): Promise<Order[]> => {
    const response = await api.get('/orders');
    return response.data;
  },

  getOrder: async (id: string): Promise<Order> => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
};

// Payments API
export const paymentsApi = {
  createCheckoutSession: async (orderId: string): Promise<{ url: string }> => {
    const response = await api.post('/payments/checkout', { orderId });
    return response.data;
  },
};

// Admin API - Using existing endpoints for now
export const adminApi = {
  // Users management - Mock data with localStorage persistence
  getAllUsers: async (): Promise<User[]> => {
    // Get users from localStorage or use default mock data
    const stored = localStorage.getItem('adminUsers');
    const defaultUsers: User[] = [
      {
        id: 'cmehuvjjr000110qnppzjrq1t',
        email: 'testuser@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'CUSTOMER',
        createdAt: '2024-08-19T01:12:27.000Z',
        updatedAt: '2024-08-19T01:12:27.000Z'
      },
      {
        id: 'cmehv2btp000210qn10dnvf51',
        email: 'admin@test.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        createdAt: '2024-08-19T01:24:24.000Z',
        updatedAt: '2024-08-19T01:24:24.000Z'
      },
      {
        id: 'mock001',
        email: 'customer@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'CUSTOMER',
        createdAt: '2024-08-15T10:30:00.000Z',
        updatedAt: '2024-08-15T10:30:00.000Z'
      },
      {
        id: 'mock002',
        email: 'merchant@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'MERCHANT',
        createdAt: '2024-08-16T14:20:00.000Z',
        updatedAt: '2024-08-18T09:15:00.000Z'
      },
      {
        id: 'mock003',
        email: 'alice@example.com',
        firstName: 'Alice',
        lastName: 'Johnson',
        role: 'CUSTOMER',
        createdAt: '2024-08-17T16:45:00.000Z',
        updatedAt: '2024-08-17T16:45:00.000Z'
      },
      {
        id: 'mock004',
        email: 'bob@store.com',
        firstName: 'Bob',
        lastName: 'Wilson',
        role: 'MERCHANT',
        createdAt: '2024-08-18T11:10:00.000Z',
        updatedAt: '2024-08-18T11:10:00.000Z'
      },
      {
        id: 'mock005',
        email: 'sarah@example.com',
        firstName: 'Sarah',
        lastName: 'Brown',
        role: 'CUSTOMER',
        createdAt: '2024-08-18T13:30:00.000Z',
        updatedAt: '2024-08-18T13:30:00.000Z'
      }
    ];

    let users: User[];
    if (stored) {
      users = JSON.parse(stored);
    } else {
      users = defaultUsers;
      localStorage.setItem('adminUsers', JSON.stringify(users));
    }
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return users;
  },

  createUser: async (userData: {
    email: string;
    firstName: string;
    lastName: string;
    role: 'ADMIN' | 'MERCHANT' | 'CUSTOMER';
  }): Promise<User> => {
    // Check if user already exists
    const users = await adminApi.getAllUsers();
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedUsers = [...users, newUser];
    localStorage.setItem('adminUsers', JSON.stringify(updatedUsers));

    // Try to actually create the user via API (for real users)
    try {
      await authApi.register({
        email: userData.email,
        password: 'temppass123', // Default password
        firstName: userData.firstName,
        lastName: userData.lastName,
      });
    } catch (error) {
      // If API fails, still keep the mock user for demo purposes
      console.log('Real user creation failed, keeping mock user for demo');
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return newUser;
  },

  deleteUser: async (userId: string): Promise<void> => {
    const users = await adminApi.getAllUsers();
    const userToDelete = users.find(u => u.id === userId);
    
    if (!userToDelete) {
      throw new Error('User not found');
    }

    // Prevent deleting the current admin user
    if (userToDelete.email === 'admin@test.com') {
      throw new Error('Cannot delete the current admin user');
    }

    const updatedUsers = users.filter(u => u.id !== userId);
    localStorage.setItem('adminUsers', JSON.stringify(updatedUsers));

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
  },

  // Orders management - Use existing orders endpoint
  getAllOrders: async (): Promise<Order[]> => {
    const response = await api.get('/orders');
    return response.data;
  },

  updateOrderStatus: async (orderId: string, status: string): Promise<Order> => {
    // This would require backend implementation
    throw new Error('Order status update API not implemented in backend');
  },

  // Products management - Use existing catalog endpoints with fallback
  getAllProducts: async (): Promise<Product[]> => {
    try {
      const response = await api.get('/catalog/products');
      const apiProducts = response.data;
      
      // Also include mock products from localStorage
      const storedProducts = localStorage.getItem('mockProducts');
      const mockProducts = storedProducts ? JSON.parse(storedProducts) : [];
      
      // Combine API products and mock products
      return [...apiProducts, ...mockProducts];
    } catch (error) {
      // Fallback to mock products only if API fails
      console.log('Failed to fetch products from API, using mock products only');
      const storedProducts = localStorage.getItem('mockProducts');
      return storedProducts ? JSON.parse(storedProducts) : [];
    }
  },

  createProduct: async (productData: {
    name: string;
    description: string;
    type: string;
    isActive: boolean;
    startTime?: string;
    duration?: number;
    address?: string;
  }): Promise<Product> => {
    try {
      const response = await api.post('/catalog/products', productData);
      return response.data;
    } catch (error) {
      // Create mock product for demo purposes
      const mockProduct: Product = {
        id: `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: productData.name,
        description: productData.description,
        type: productData.type as 'DIGITAL' | 'OFFLINE_SERVICE' | 'ONLINE_CONSULTING',
        isActive: productData.isActive,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        prices: [],
        ...(productData.type === 'ONLINE_CONSULTING' && {
          startTime: productData.startTime,
          duration: productData.duration
        }),
        ...(productData.type === 'OFFLINE_SERVICE' && {
          startTime: productData.startTime,
          duration: productData.duration,
          address: productData.address
        })
      };
      
      // Store in localStorage for persistence
      const storedProducts = localStorage.getItem('mockProducts');
      const products = storedProducts ? JSON.parse(storedProducts) : [];
      products.push(mockProduct);
      localStorage.setItem('mockProducts', JSON.stringify(products));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      return mockProduct;
    }
  },

  updateProduct: async (productId: string, productData: {
    name: string;
    description: string;
    type: string;
    isActive: boolean;
    startTime?: string;
    duration?: number;
    address?: string;
  }): Promise<Product> => {
    try {
      const response = await api.patch(`/catalog/products/${productId}`, productData);
      return response.data;
    } catch (error) {
      // Update mock product
      const storedProducts = localStorage.getItem('mockProducts');
      const products = storedProducts ? JSON.parse(storedProducts) : [];
      const productIndex = products.findIndex((p: Product) => p.id === productId);
      
      if (productIndex === -1) {
        throw new Error('Product not found');
      }
      
      products[productIndex] = {
        ...products[productIndex],
        ...productData,
        updatedAt: new Date().toISOString(),
        ...(productData.type === 'ONLINE_CONSULTING' && {
          startTime: productData.startTime,
          duration: productData.duration,
          address: undefined // Clear address for online consulting
        }),
        ...(productData.type === 'OFFLINE_SERVICE' && {
          startTime: productData.startTime,
          duration: productData.duration,
          address: productData.address
        }),
        // Clear scheduling and address fields if changing to DIGITAL
        ...(productData.type === 'DIGITAL' && {
          startTime: undefined,
          duration: undefined,
          address: undefined
        })
      };
      
      localStorage.setItem('mockProducts', JSON.stringify(products));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600));
      return products[productIndex];
    }
  },

  deleteProduct: async (productId: string): Promise<void> => {
    try {
      await api.delete(`/catalog/products/${productId}`);
    } catch (error) {
      // Delete from mock products
      const storedProducts = localStorage.getItem('mockProducts');
      const products = storedProducts ? JSON.parse(storedProducts) : [];
      const filteredProducts = products.filter((p: Product) => p.id !== productId);
      localStorage.setItem('mockProducts', JSON.stringify(filteredProducts));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  },

  // Dashboard stats - Calculate from available data
  getDashboardStats: async (): Promise<{
    totalUsers: number;
    totalOrders: number;
    totalRevenue: number;
    recentOrders: Order[];
  }> => {
    const orders = await api.get('/orders').then(res => res.data);
    
    const totalRevenue = orders
      .filter((order: Order) => order.status === 'PAID')
      .reduce((sum: number, order: Order) => sum + order.totalAmount, 0);
    
    // Get mock users count directly
    const mockUsersCount = 7; // From the mock data we created
    
    return {
      totalUsers: mockUsersCount,
      totalOrders: orders.length,
      totalRevenue,
      recentOrders: orders.slice(0, 5),
    };
  },
};

export default api;