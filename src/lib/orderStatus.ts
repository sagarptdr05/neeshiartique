import { Order, OrderStatus, PaymentStatus } from '@/data/mockData';

/**
 * Single source of truth for the manual-payment order lifecycle, shared by the
 * storefront, the customer timeline and the admin dashboard.
 */

/** Fulfilment stages in the order they happen. `cancelled` sits outside the flow. */
export const ORDER_STAGES: OrderStatus[] = [
  'pending_payment',
  'payment_received',
  'confirmed',
  'being_crafted',
  'quality_check',
  'packed',
  'shipped',
  'delivered',
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: 'Pending Payment',
  payment_received: 'Payment Received',
  confirmed: 'Confirmed',
  being_crafted: 'Being Crafted',
  quality_check: 'Quality Check',
  packed: 'Packed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  awaiting_payment: 'Awaiting Payment',
  payment_received: 'Payment Received',
  payment_verified: 'Payment Verified',
  payment_issue: 'Payment Issue',
  refunded: 'Refunded',
};

export function orderStatusLabel(status: OrderStatus): string {
  return ORDER_STATUS_LABELS[status] ?? status;
}

export function paymentStatusLabel(status: PaymentStatus): string {
  return PAYMENT_STATUS_LABELS[status] ?? status;
}

/** Index of a stage in the lifecycle; -1 for cancelled orders. */
export function orderStageIndex(status: OrderStatus): number {
  return ORDER_STAGES.indexOf(status);
}

/** An order counts as revenue only once the admin has verified the payment. */
export function isRevenueCounted(order: Order): boolean {
  return order.payment_status === 'payment_verified' && order.order_status !== 'cancelled';
}

export interface TimelineStep {
  status: OrderStatus;
  label: string;
  description: string;
  /** ISO timestamp of when this stage was reached, when it has been. */
  at?: string;
  complete: boolean;
  current: boolean;
}

/**
 * Builds the customer-facing timeline. A step is complete when its timestamp
 * exists, which keeps the timeline honest even if the admin skips ahead.
 */
export function buildOrderTimeline(order: Order): TimelineStep[] {
  const timestamps: Record<OrderStatus, string | undefined> = {
    pending_payment: order.created_at,
    payment_received: order.payment_received_at,
    confirmed: order.confirmed_at,
    being_crafted: order.crafted_at,
    quality_check: order.quality_checked_at,
    packed: order.packed_at,
    shipped: order.shipped_at,
    delivered: order.delivered_at,
    cancelled: order.cancelled_at,
  };

  const descriptions: Record<OrderStatus, string> = {
    pending_payment: 'Your order was created and is waiting for payment.',
    payment_received: 'Neeshiartique has received your payment.',
    confirmed: 'Your payment was verified and your order is confirmed.',
    being_crafted: 'Your handmade crochet creation is being stitched.',
    quality_check: 'Your piece is finished and being checked over.',
    packed: 'Your parcel has been wrapped and packed.',
    shipped: 'Your parcel has been handed to the delivery service.',
    delivered: 'Your little parcel has arrived. ♡',
    cancelled: 'This order was cancelled.',
  };

  const currentIndex = orderStageIndex(order.order_status);

  return ORDER_STAGES.map((status, index) => ({
    status,
    label: ORDER_STATUS_LABELS[status],
    description: descriptions[status],
    at: timestamps[status],
    complete: currentIndex >= 0 && index < currentIndex,
    current: index === currentIndex,
  }));
}

/**
 * Admin actions available for an order, derived from its current state so the
 * dashboard can only ever offer a legal next step.
 */
export type AdminOrderAction =
  | 'mark_payment_received'
  | 'confirm_order'
  | 'start_crafting'
  | 'mark_quality_checked'
  | 'mark_packed'
  | 'mark_shipped'
  | 'mark_delivered'
  | 'cancel_order'
  | 'flag_payment_issue'
  | 'mark_refunded'
  | 'save_tracking'
  | 'remove_tracking';

export const ADMIN_ACTION_LABELS: Record<AdminOrderAction, string> = {
  mark_payment_received: 'Mark Payment Received',
  confirm_order: 'Confirm Order',
  start_crafting: 'Start Crafting',
  mark_quality_checked: 'Mark Quality Checked',
  mark_packed: 'Mark Packed',
  mark_shipped: 'Mark Shipped',
  mark_delivered: 'Mark Delivered',
  cancel_order: 'Cancel Order',
  flag_payment_issue: 'Flag Payment Issue',
  mark_refunded: 'Mark Refunded',
  save_tracking: 'Add Tracking Information',
  remove_tracking: 'Remove Tracking Information',
};

/** The single workflow action the admin should be offered next, if any. */
export function nextWorkflowAction(order: Order): AdminOrderAction | null {
  if (order.order_status === 'cancelled') return null;

  switch (order.order_status) {
    case 'pending_payment':
      return 'mark_payment_received';
    case 'payment_received':
      return 'confirm_order';
    case 'confirmed':
      return 'start_crafting';
    case 'being_crafted':
      return 'mark_quality_checked';
    case 'quality_check':
      return 'mark_packed';
    case 'packed':
      return 'mark_shipped';
    case 'shipped':
      return 'mark_delivered';
    default:
      return null;
  }
}

/** Carrier presets. `Other` lets the admin type a carrier of their own. */
export const CARRIER_OPTIONS = ['India Post', 'Blue Dart', 'Delhivery', 'DTDC', 'Other'];
export const DEFAULT_CARRIER = 'India Post';

export function hasTrackingInfo(order: Order): boolean {
  return Boolean(order.tracking_number && order.tracking_number.trim());
}
