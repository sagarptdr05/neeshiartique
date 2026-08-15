'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Category,
  Order,
  CustomOrderRequest,
  Review,
  Coupon,
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_CUSTOM_ORDERS,
  INITIAL_REVIEWS,
  INITIAL_COUPONS,
} from '../data/mockData';
import { AdminOrderAction } from '@/lib/orderStatus';

/** Payload the checkout sends to `/api/orders`; prices are set by the server. */
export interface PlaceOrderInput {
  items: { productId: string; quantity: number; customization?: string }[];
  shipping_address: Order['shipping_address'];
  customer_notes?: string;
  coupon_code?: string;
  idempotency_key: string;
}

export interface OrderMutationResult {
  success: boolean;
  order?: Order;
  message?: string;
}

interface StoreContextType {
  products: Product[];
  categories: Category[];
  orders: Order[];
  customOrders: CustomOrderRequest[];
  reviews: Review[];
  coupons: Coupon[];

  // Auth states & handlers
  user: { name: string; email: string; role: string; phone: string } | null;
  loadingAuth: boolean;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  authRedirectAction: (() => void) | null;
  setAuthRedirectAction: (action: (() => void) | null) => void;
  checkSession: () => Promise<void>;
  logout: () => Promise<void>;
  
  // Product handlers
  addProduct: (product: Omit<Product, 'id' | 'created_at'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  
  // Category handlers
  addCategory: (category: Category) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  
  // Order handlers (server-backed via /api/orders)
  loadingOrders: boolean;
  refreshOrders: () => Promise<void>;
  placeOrder: (input: PlaceOrderInput) => Promise<OrderMutationResult>;
  runOrderAction: (
    id: string,
    action: AdminOrderAction,
    payload?: Record<string, unknown>
  ) => Promise<OrderMutationResult>;

  // Custom Order handlers
  submitCustomOrder: (request: Omit<CustomOrderRequest, 'id' | 'created_at' | 'status'>) => Promise<{ success: boolean; message?: string }>;
  updateCustomOrderStatus: (id: string, status: CustomOrderRequest['status']) => Promise<{ success: boolean; message?: string }>;
  
  // Review handlers
  submitReview: (review: Omit<Review, 'id' | 'date' | 'approved'>) => void;
  approveReview: (id: string) => void;
  deleteReview: (id: string) => void;

  // Coupon handlers
  addCoupon: (coupon: Coupon) => void;
  toggleCoupon: (code: string) => void;
  deleteCoupon: (code: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [customOrders, setCustomOrders] = useState<CustomOrderRequest[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  // Auth states
  const [user, setUser] = useState<{ name: string; email: string; role: string; phone: string } | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authRedirectActionState, setAuthRedirectActionState] = useState<(() => void) | null>(null);
  const setAuthRedirectAction = (action: (() => void) | null) => {
    setAuthRedirectActionState(action ? () => action : null);
  };
  const authRedirectAction = authRedirectActionState;

  const checkSession = async () => {
    try {
      const res = await fetch('/api/auth/session');
      const data = await res.json();
      if (res.ok && data.authenticated) {
        setUser(data.user);
        localStorage.setItem('neeshi_user_role', data.user.role);
        localStorage.setItem('neeshi_user_email', data.user.email);
      } else {
        setUser(null);
        localStorage.removeItem('neeshi_user_role');
        localStorage.removeItem('neeshi_user_email');
      }
    } catch (err) {
      console.error('Failed to check session:', err);
      setUser(null);
    } finally {
      setLoadingAuth(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      localStorage.removeItem('neeshi_user_role');
      localStorage.removeItem('neeshi_user_email');
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  // Load from localStorage on mount
  useEffect(() => {
    const getLocal = <T,>(key: string, initial: T): T => {
      if (typeof window === 'undefined') return initial;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : initial;
    };

    const savedProducts = getLocal<Product[]>('neeshi_products', []);
    if (savedProducts.length === 0) {
      setProducts(INITIAL_PRODUCTS);
      if (typeof window !== 'undefined') {
        localStorage.setItem('neeshi_products', JSON.stringify(INITIAL_PRODUCTS));
      }
    } else {
      // Merge initial products that aren't in local storage (checking by ID)
      const merged = [...savedProducts];
      let updated = false;
      INITIAL_PRODUCTS.forEach((initial) => {
        if (!merged.some((p) => p.id === initial.id)) {
          merged.push(initial);
          updated = true;
        }
      });
      setProducts(merged);
      if (updated && typeof window !== 'undefined') {
        localStorage.setItem('neeshi_products', JSON.stringify(merged));
      }
    }

    setCategories(getLocal('neeshi_categories', INITIAL_CATEGORIES));
    setCustomOrders(getLocal('neeshi_custom_orders', INITIAL_CUSTOM_ORDERS));
    setReviews(getLocal('neeshi_reviews', INITIAL_REVIEWS));
    setCoupons(getLocal('neeshi_coupons', INITIAL_COUPONS));
  }, []);

  // Sync state to localStorage helper
  const syncLocal = (key: string, value: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  };

  // Product Actions
  const addProduct = (newProd: Omit<Product, 'id' | 'created_at'>) => {
    const p: Product = {
      ...newProd,
      id: `prod-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    const updated = [p, ...products];
    setProducts(updated);
    syncLocal('neeshi_products', updated);
  };

  const updateProduct = (updatedProd: Product) => {
    const updated = products.map((p) => (p.id === updatedProd.id ? updatedProd : p));
    setProducts(updated);
    syncLocal('neeshi_products', updated);
  };

  const deleteProduct = (id: string) => {
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    syncLocal('neeshi_products', updated);
  };

  // Category Actions
  const addCategory = (cat: Category) => {
    const updated = [...categories, cat];
    setCategories(updated);
    syncLocal('neeshi_categories', updated);
  };

  const updateCategory = (updatedCat: Category) => {
    const updated = categories.map((c) => (c.id === updatedCat.id ? updatedCat : c));
    setCategories(updated);
    syncLocal('neeshi_categories', updated);
  };

  const deleteCategory = (id: string) => {
    const updated = categories.filter((c) => c.id !== id);
    setCategories(updated);
    syncLocal('neeshi_categories', updated);
  };

  // Order Actions — orders live on the server so prices and status transitions
  // can never be edited from the browser.
  const refreshOrders = async () => {
    try {
      setLoadingOrders(true);
      const res = await fetch('/api/orders');
      const data = await res.json();
      setOrders(res.ok && data.success ? data.orders : []);
    } catch (err) {
      console.error('Failed to load orders:', err);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const refreshCustomOrders = async () => {
    try {
      const res = await fetch('/api/custom-orders');
      const data = await res.json();
      setCustomOrders(res.ok && data.success ? data.customOrders : []);
    } catch (err) {
      console.error('Failed to load custom orders:', err);
      setCustomOrders([]);
    }
  };

  // Reload whenever the signed-in account changes, so a customer never sees
  // orders left over from a previous session.
  useEffect(() => {
    if (loadingAuth) return;
    if (!user) {
      setOrders([]);
      setCustomOrders([]);
      setLoadingOrders(false);
      return;
    }
    refreshOrders();
    refreshCustomOrders();
  }, [user?.email, loadingAuth]);

  const placeOrder = async (input: PlaceOrderInput): Promise<OrderMutationResult> => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        return { success: false, message: data.message || 'We could not create your order.' };
      }

      setOrders((prev) =>
        prev.some((o) => o.id === data.order.id) ? prev : [data.order, ...prev]
      );
      return { success: true, order: data.order };
    } catch (err) {
      console.error('Failed to place order:', err);
      return { success: false, message: 'We could not reach the server. Please try again.' };
    }
  };

  const runOrderAction = async (
    id: string,
    action: AdminOrderAction,
    payload: Record<string, unknown> = {}
  ): Promise<OrderMutationResult> => {
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...payload }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        return { success: false, message: data.message || 'That update could not be saved.' };
      }

      setOrders((prev) => prev.map((o) => (o.id === data.order.id ? data.order : o)));
      return { success: true, order: data.order };
    } catch (err) {
      console.error('Failed to update order:', err);
      return { success: false, message: 'We could not reach the server. Please try again.' };
    }
  };

  // Custom Order Actions
  const submitCustomOrder = async (newReq: Omit<CustomOrderRequest, 'id' | 'created_at' | 'status'>) => {
    try {
      const res = await fetch('/api/custom-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReq),
      });
      const data = await res.json();
      if (data.success && data.customOrder) {
        setCustomOrders((prev) => [data.customOrder, ...prev]);
        return { success: true };
      }
      return { success: false, message: data.message || 'Failed to submit request.' };
    } catch (err) {
      console.error('Failed to submit custom order:', err);
      return { success: false, message: 'Connection error. Please try again.' };
    }
  };

  const updateCustomOrderStatus = async (id: string, status: CustomOrderRequest['status']) => {
    try {
      const res = await fetch(`/api/custom-orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success && data.customOrder) {
        setCustomOrders((prev) => prev.map((co) => (co.id === id ? data.customOrder : co)));
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (err) {
      console.error('Failed to update custom order status:', err);
      return { success: false };
    }
  };

  // Review Actions
  const submitReview = (newRev: Omit<Review, 'id' | 'date' | 'approved'>) => {
    const r: Review = {
      ...newRev,
      id: `rev-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      approved: false, // requires admin approval
    };
    const updated = [r, ...reviews];
    setReviews(updated);
    syncLocal('neeshi_reviews', updated);
  };

  const approveReview = (id: string) => {
    const updated = reviews.map((r) => (r.id === id ? { ...r, approved: true } : r));
    setReviews(updated);
    syncLocal('neeshi_reviews', updated);
  };

  const deleteReview = (id: string) => {
    const updated = reviews.filter((r) => r.id !== id);
    setReviews(updated);
    syncLocal('neeshi_reviews', updated);
  };

  // Coupon Actions
  const addCoupon = (coupon: Coupon) => {
    const updated = [...coupons, coupon];
    setCoupons(updated);
    syncLocal('neeshi_coupons', updated);
  };

  const toggleCoupon = (code: string) => {
    const updated = coupons.map((c) => (c.code === code ? { ...c, active: !c.active } : c));
    setCoupons(updated);
    syncLocal('neeshi_coupons', updated);
  };

  const deleteCoupon = (code: string) => {
    const updated = coupons.filter((c) => c.code !== code);
    setCoupons(updated);
    syncLocal('neeshi_coupons', updated);
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        orders,
        customOrders,
        reviews,
        coupons,
        user,
        loadingAuth,
        showAuthModal,
        setShowAuthModal,
        authRedirectAction,
        setAuthRedirectAction,
        checkSession,
        logout,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        loadingOrders,
        refreshOrders,
        placeOrder,
        runOrderAction,
        submitCustomOrder,
        updateCustomOrderStatus,
        submitReview,
        approveReview,
        deleteReview,
        addCoupon,
        toggleCoupon,
        deleteCoupon,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
