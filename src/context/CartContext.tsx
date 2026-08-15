'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useStore } from './StoreContext';
import { calculateShipping, calculateCouponDiscount, calculateTotal } from '@/lib/pricing';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  customization?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeFromCart: (productId: string, customization?: string) => void;
  updateQuantity: (productId: string, quantity: number, customization?: string) => void;
  clearCart: () => void;
  
  // Coupon
  couponCode: string;
  couponDiscount: number;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;

  // Totals
  subtotal: number;
  shipping: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { coupons } = useStore();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState<string>('');
  const [couponDiscount, setCouponDiscount] = useState<number>(0);

  // Load cart from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('neeshi_cart');
      const savedCoupon = localStorage.getItem('neeshi_coupon_code');
      if (savedCart) setCartItems(JSON.parse(savedCart));
      if (savedCoupon) setCouponCode(savedCoupon);
    }
  }, []);

  // Save cart to localStorage
  const saveCart = (items: CartItem[]) => {
    setCartItems(items);
    if (typeof window !== 'undefined') {
      localStorage.setItem('neeshi_cart', JSON.stringify(items));
    }
  };

  // Cart operations
  const addToCart = (newItem: Omit<CartItem, 'quantity'>, quantity = 1) => {
    const existingIndex = cartItems.findIndex(
      (item) =>
        item.productId === newItem.productId &&
        item.customization === newItem.customization
    );

    let updatedCart = [...cartItems];
    if (existingIndex > -1) {
      updatedCart[existingIndex].quantity += quantity;
    } else {
      updatedCart.push({ ...newItem, quantity });
    }
    saveCart(updatedCart);
  };

  const removeFromCart = (productId: string, customization?: string) => {
    const updatedCart = cartItems.filter(
      (item) =>
        !(item.productId === productId && item.customization === customization)
    );
    saveCart(updatedCart);
  };

  const updateQuantity = (productId: string, quantity: number, customization?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, customization);
      return;
    }
    const updatedCart = cartItems.map((item) =>
      item.productId === productId && item.customization === customization
        ? { ...item, quantity }
        : item
    );
    saveCart(updatedCart);
  };

  const clearCart = () => {
    saveCart([]);
    removeCoupon();
  };

  // Totals calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  
  // Shipping uses the same rule the order API applies, so the basket preview
  // always matches the total the server calculates at checkout.
  const shipping = calculateShipping(subtotal);

  // Recalculate coupon discounts when subtotal changes
  useEffect(() => {
    if (!couponCode) {
      setCouponDiscount(0);
      return;
    }

    const activeCoupon = coupons.find(
      (c) => c.code.toUpperCase() === couponCode.toUpperCase() && c.active
    );

    if (!activeCoupon) {
      setCouponCode('');
      setCouponDiscount(0);
      localStorage.removeItem('neeshi_coupon_code');
      return;
    }

    setCouponDiscount(calculateCouponDiscount(activeCoupon, subtotal));
  }, [subtotal, couponCode, coupons]);

  // Apply Coupon
  const applyCoupon = (code: string) => {
    const formattedCode = code.trim().toUpperCase();
    const activeCoupon = coupons.find((c) => c.code === formattedCode && c.active);

    if (!activeCoupon) {
      return { success: false, message: 'Invalid or expired coupon code.' };
    }

    if (activeCoupon.minSubtotal && subtotal < activeCoupon.minSubtotal) {
      return {
        success: false,
        message: `This coupon requires a minimum subtotal of ₹${activeCoupon.minSubtotal}.`,
      };
    }

    setCouponCode(formattedCode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('neeshi_coupon_code', formattedCode);
    }
    return { success: true, message: 'Coupon applied successfully!' };
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponDiscount(0);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('neeshi_coupon_code');
    }
  };

  const total = calculateTotal(subtotal, shipping, couponDiscount);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        couponCode,
        couponDiscount,
        applyCoupon,
        removeCoupon,
        subtotal,
        shipping,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
