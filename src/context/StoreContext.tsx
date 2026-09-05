'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Category,
  Order,
  CustomOrderRequest,
  Review,
  Coupon,
  INITIAL_CUSTOM_ORDERS,
  INITIAL_REVIEWS,
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

export interface ProductMutationResult {
  success: boolean;
  product?: Product;
  message?: string;
}

export interface CategoryMutationResult {
  success: boolean;
  category?: Category;
  message?: string;
}

export interface CouponMutationResult {
  success: boolean;
  coupon?: Coupon;
  message?: string;
}

export interface MutationResult {
  success: boolean;
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

  // Product handlers (server-backed via /api/products — every visitor sees
  // the same catalog, not just whichever browser last edited it)
  loadingProducts: boolean;
  refreshProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'slug' | 'sku' | 'stock' | 'created_at'>) => Promise<ProductMutationResult>;
  updateProduct: (product: Product) => Promise<ProductMutationResult>;
  deleteProduct: (id: string) => Promise<MutationResult>;

  // Category handlers (server-backed via /api/categories)
  loadingCategories: boolean;
  refreshCategories: () => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<CategoryMutationResult>;
  updateCategory: (category: Category) => Promise<CategoryMutationResult>;
  deleteCategory: (id: string) => Promise<MutationResult>;

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

  // Coupon handlers (server-backed via /api/coupons)
  loadingCoupons: boolean;
  refreshCoupons: () => Promise<void>;
  addCoupon: (coupon: Omit<Coupon, 'active'> & { active?: boolean }) => Promise<CouponMutationResult>;
  toggleCoupon: (code: string) => Promise<CouponMutationResult>;
  deleteCoupon: (code: string) => Promise<MutationResult>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [customOrders, setCustomOrders] = useState<CustomOrderRequest[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(true);

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

  // Load from localStorage on mount (custom orders are refreshed again below
  // once auth resolves; reviews have no server store yet)
  useEffect(() => {
    const getLocal = <T,>(key: string, initial: T): T => {
      if (typeof window === 'undefined') return initial;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : initial;
    };

    setCustomOrders(getLocal('neeshi_custom_orders', INITIAL_CUSTOM_ORDERS));
    setReviews(getLocal('neeshi_reviews', INITIAL_REVIEWS));
  }, []);

  // Sync state to localStorage helper (still used for reviews, which have no
  // server-side store)
  const syncLocal = (key: string, value: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  };

  // Catalog Actions — products, categories and coupons all live on the
  // server (Supabase when configured, a shared JSON file otherwise) so every
  // visitor sees the same catalog, and checkout prices can be trusted.
  const refreshProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(res.ok && data.success ? data.products : []);
    } catch (err) {
      console.error('Failed to load products:', err);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const refreshCategories = async () => {
    try {
      setLoadingCategories(true);
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(res.ok && data.success ? data.categories : []);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const refreshCoupons = async () => {
    try {
      setLoadingCoupons(true);
      const res = await fetch('/api/coupons');
      const data = await res.json();
      setCoupons(res.ok && data.success ? data.coupons : []);
    } catch (err) {
      console.error('Failed to load coupons:', err);
      setCoupons([]);
    } finally {
      setLoadingCoupons(false);
    }
  };

  // The catalog is public — fetch it once on mount rather than waiting on auth.
  useEffect(() => {
    refreshProducts();
    refreshCategories();
    refreshCoupons();
  }, []);

  // Product Actions
  const addProduct = async (newProd: Omit<Product, 'id' | 'slug' | 'sku' | 'stock' | 'created_at'>): Promise<ProductMutationResult> => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProd),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, message: data.message || 'Could not add this product.' };
      }
      setProducts((prev) => [data.product, ...prev]);
      return { success: true, product: data.product };
    } catch (err) {
      console.error('Failed to add product:', err);
      return { success: false, message: 'We could not reach the server. Please try again.' };
    }
  };

  const updateProduct = async (updatedProd: Product): Promise<ProductMutationResult> => {
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(updatedProd.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProd),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, message: data.message || 'Could not save changes.' };
      }
      setProducts((prev) => prev.map((p) => (p.id === data.product.id ? data.product : p)));
      return { success: true, product: data.product };
    } catch (err) {
      console.error('Failed to update product:', err);
      return { success: false, message: 'We could not reach the server. Please try again.' };
    }
  };

  const deleteProduct = async (id: string): Promise<MutationResult> => {
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, message: data.message || 'Could not delete this product.' };
      }
      setProducts((prev) => prev.filter((p) => p.id !== id));
      return { success: true };
    } catch (err) {
      console.error('Failed to delete product:', err);
      return { success: false, message: 'We could not reach the server. Please try again.' };
    }
  };

  // Category Actions
  const addCategory = async (cat: Omit<Category, 'id'>): Promise<CategoryMutationResult> => {
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cat),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, message: data.message || 'Could not add this category.' };
      }
      setCategories((prev) => [...prev, data.category]);
      return { success: true, category: data.category };
    } catch (err) {
      console.error('Failed to add category:', err);
      return { success: false, message: 'We could not reach the server. Please try again.' };
    }
  };

  const updateCategory = async (updatedCat: Category): Promise<CategoryMutationResult> => {
    try {
      const res = await fetch(`/api/categories/${encodeURIComponent(updatedCat.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCat),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, message: data.message || 'Could not save changes.' };
      }
      setCategories((prev) => prev.map((c) => (c.id === data.category.id ? data.category : c)));
      return { success: true, category: data.category };
    } catch (err) {
      console.error('Failed to update category:', err);
      return { success: false, message: 'We could not reach the server. Please try again.' };
    }
  };

  const deleteCategory = async (id: string): Promise<MutationResult> => {
    try {
      const res = await fetch(`/api/categories/${encodeURIComponent(id)}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, message: data.message || 'Could not delete this category.' };
      }
      setCategories((prev) => prev.filter((c) => c.id !== id));
      return { success: true };
    } catch (err) {
      console.error('Failed to delete category:', err);
      return { success: false, message: 'We could not reach the server. Please try again.' };
    }
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
  const addCoupon = async (coupon: Omit<Coupon, 'active'> & { active?: boolean }): Promise<CouponMutationResult> => {
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coupon),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, message: data.message || 'Could not create this coupon.' };
      }
      setCoupons((prev) => [...prev, data.coupon]);
      return { success: true, coupon: data.coupon };
    } catch (err) {
      console.error('Failed to add coupon:', err);
      return { success: false, message: 'We could not reach the server. Please try again.' };
    }
  };

  const toggleCoupon = async (code: string): Promise<CouponMutationResult> => {
    try {
      const res = await fetch(`/api/coupons/${encodeURIComponent(code)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, message: data.message || 'Could not update this coupon.' };
      }
      setCoupons((prev) => prev.map((c) => (c.code === data.coupon.code ? data.coupon : c)));
      return { success: true, coupon: data.coupon };
    } catch (err) {
      console.error('Failed to toggle coupon:', err);
      return { success: false, message: 'We could not reach the server. Please try again.' };
    }
  };

  const deleteCoupon = async (code: string): Promise<MutationResult> => {
    try {
      const res = await fetch(`/api/coupons/${encodeURIComponent(code)}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, message: data.message || 'Could not delete this coupon.' };
      }
      setCoupons((prev) => prev.filter((c) => c.code !== code));
      return { success: true };
    } catch (err) {
      console.error('Failed to delete coupon:', err);
      return { success: false, message: 'We could not reach the server. Please try again.' };
    }
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
        loadingProducts,
        refreshProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        loadingCategories,
        refreshCategories,
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
        loadingCoupons,
        refreshCoupons,
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
