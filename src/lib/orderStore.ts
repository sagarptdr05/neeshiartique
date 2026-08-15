import fs from 'fs';
import path from 'path';
import { Order } from '@/data/mockData';

/**
 * File-backed order store, following the same pattern as the contact messages
 * store. This is the authoritative record of every order — the browser only
 * ever holds a copy fetched from here.
 */

const ORDERS_FILE = path.join(process.cwd(), 'src/data/orders.json');

export function readOrders(): Order[] {
  try {
    if (!fs.existsSync(ORDERS_FILE)) return [];
    const raw = fs.readFileSync(ORDERS_FILE, 'utf8').trim();
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Order[]) : [];
  } catch (error) {
    console.error('Failed to read orders store:', error);
    return [];
  }
}

export function writeOrders(orders: Order[]): void {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf8');
}

export function findOrder(orders: Order[], id: string): Order | undefined {
  return orders.find((o) => o.id.toUpperCase() === id.trim().toUpperCase());
}

/**
 * Order references look like `NA-2026-00124`: a Neeshiartique prefix, the year
 * the order was placed, and a zero-padded sequence that restarts each year.
 */
export function generateOrderId(orders: Order[], now = new Date()): string {
  const year = now.getFullYear();
  const prefix = `NA-${year}-`;

  const highest = orders.reduce((max, order) => {
    if (!order.id.startsWith(prefix)) return max;
    const sequence = Number.parseInt(order.id.slice(prefix.length), 10);
    return Number.isFinite(sequence) && sequence > max ? sequence : max;
  }, 0);

  return `${prefix}${String(highest + 1).padStart(5, '0')}`;
}

/** Returns the order already created for this checkout attempt, if any. */
export function findByIdempotencyKey(orders: Order[], key: string | undefined): Order | undefined {
  if (!key) return undefined;
  return orders.find((o) => o.idempotency_key === key);
}
