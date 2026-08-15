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
  INITIAL_ORDERS,
  INITIAL_CUSTOM_ORDERS,
  INITIAL_REVIEWS,
  INITIAL_COUPONS,
} from '../data/mockData';

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
  
  // Order handlers
  placeOrder: (order: Omit<Order, 'id' | 'created_at'>) => Order;
  updateOrderStatus: (id: string, status: Order['order_status']) => void;
  updateOrderPaymentStatus: (id: string, status: Order['payment_status']) => void;
  
  // Custom Order handlers
  submitCustomOrder: (request: Omit<CustomOrderRequest, 'id' | 'created_at' | 'status'>) => void;
  updateCustomOrderStatus: (id: string, status: CustomOrderRequest['status']) => void;
  
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
  const [customOrders, setCustomOrders] = useState<CustomOrderRequest[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  // Auth states
  const [user, setUser] = useState<{ name: string; email: string; role: string; phone: string } | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authRedirectAction, setAuthRedirectAction] = useState<(() => void) | null>(null);

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

    setProducts(getLocal('neeshi_products', INITIAL_PRODUCTS));
    setCategories(getLocal('neeshi_categories', INITIAL_CATEGORIES));
    setOrders(getLocal('neeshi_orders', INITIAL_ORDERS));
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

  // Order Actions
  const placeOrder = (newOrder: Omit<Order, 'id' | 'created_at'>) => {
    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const o: Order = {
      ...newOrder,
      id: orderId,
      created_at: new Date().toISOString(),
    };
    
    // Deduct stock from products
    const updatedProducts = products.map((p) => {
      const orderItem = newOrder.items.find((item) => item.productId === p.id);
      if (orderItem) {
        return { ...p, stock: Math.max(0, p.stock - orderItem.quantity) };
      }
      return p;
    });
    setProducts(updatedProducts);
    syncLocal('neeshi_products', updatedProducts);

    const updatedOrders = [o, ...orders];
    setOrders(updatedOrders);
    syncLocal('neeshi_orders', updatedOrders);
    return o;
  };

  const updateOrderStatus = (id: string, status: Order['order_status']) => {
    const updated = orders.map((o) => (o.id === id ? { ...o, order_status: status } : o));
    setOrders(updated);
    syncLocal('neeshi_orders', updated);
  };

  const updateOrderPaymentStatus = (id: string, status: Order['payment_status']) => {
    const updated = orders.map((o) => (o.id === id ? { ...o, payment_status: status } : o));
    setOrders(updated);
    syncLocal('neeshi_orders', updated);
  };

  // Custom Order Actions
  const submitCustomOrder = (newReq: Omit<CustomOrderRequest, 'id' | 'created_at' | 'status'>) => {
    const req: CustomOrderRequest = {
      ...newReq,
      id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'new',
      created_at: new Date().toISOString(),
    };
    const updated = [req, ...customOrders];
    setCustomOrders(updated);
    syncLocal('neeshi_custom_orders', updated);
  };

  const updateCustomOrderStatus = (id: string, status: CustomOrderRequest['status']) => {
    const updated = customOrders.map((co) => (co.id === id ? { ...co, status } : co));
    setCustomOrders(updated);
    syncLocal('neeshi_custom_orders', updated);
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
        placeOrder,
        updateOrderStatus,
        updateOrderPaymentStatus,
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
