import { Coupon } from '@/data/mockData';

/**
 * Pricing rules shared by the cart (browser) and the order API (server).
 * The server is always the authority — the browser copy only exists so the
 * basket can preview the same numbers the server will later calculate.
 */

export const FREE_SHIPPING_THRESHOLD = 500;
export const STANDARD_SHIPPING_FEE = 40;

export function calculateShipping(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return subtotal > FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
}

export function calculateCouponDiscount(coupon: Coupon | undefined, subtotal: number): number {
  if (!coupon || !coupon.active) return 0;
  if (coupon.minSubtotal && subtotal < coupon.minSubtotal) return 0;

  if (coupon.type === 'percentage') {
    return Math.round(subtotal * (coupon.value / 100));
  }
  return Math.min(coupon.value, subtotal);
}

export function calculateTotal(subtotal: number, shipping: number, discount: number): number {
  return Math.max(0, subtotal + shipping - discount);
}
