import fs from 'fs';
import path from 'path';
import { Product, Category, Coupon } from '@/data/mockData';

/**
 * File-backed catalog store for local/fallback mode — the same pattern as
 * `orderStore.ts`. When Supabase isn't configured, these three JSON files are
 * the authoritative record of the shop's products, categories and coupons,
 * so admin edits persist for every visitor rather than living in one
 * browser's localStorage.
 */

const PRODUCTS_FILE = path.join(process.cwd(), 'src/data/products.json');
const CATEGORIES_FILE = path.join(process.cwd(), 'src/data/categories.json');
const COUPONS_FILE = path.join(process.cwd(), 'src/data/coupons.json');

function readJsonArray<T>(filePath: string): T[] {
  try {
    if (!fs.existsSync(filePath)) return [];
    const raw = fs.readFileSync(filePath, 'utf8').trim();
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch (error) {
    console.error(`Failed to read catalog store ${filePath}:`, error);
    return [];
  }
}

function writeJsonArray<T>(filePath: string, value: T[]): void {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + '\n', 'utf8');
}

export const readProducts = (): Product[] => readJsonArray<Product>(PRODUCTS_FILE);
export const writeProducts = (products: Product[]): void => writeJsonArray(PRODUCTS_FILE, products);

export const readCategories = (): Category[] => readJsonArray<Category>(CATEGORIES_FILE);
export const writeCategories = (categories: Category[]): void => writeJsonArray(CATEGORIES_FILE, categories);

export const readCoupons = (): Coupon[] => readJsonArray<Coupon>(COUPONS_FILE);
export const writeCoupons = (coupons: Coupon[]): void => writeJsonArray(COUPONS_FILE, coupons);

/** Turns a product name into a URL-safe slug; never trust a client-supplied slug. */
export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Appends -2, -3, ... until the slug is unique among the given products. */
export function uniqueSlug(
  base: string,
  products: Pick<Product, 'id' | 'slug'>[],
  excludeId?: string
): string {
  const taken = new Set(
    products.filter((p) => p.id !== excludeId).map((p) => p.slug)
  );
  if (!taken.has(base)) return base;

  let suffix = 2;
  while (taken.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}

export function generateProductId(): string {
  return `prod-${Date.now()}`;
}

/**
 * Zod's `.partial().parse()` result includes every schema key, set to
 * `undefined` for whatever the caller omitted. Spreading that directly over
 * an existing record would wipe every field the request didn't mention, so
 * PATCH handlers filter through this first to keep only the fields the
 * caller actually sent.
 */
export function pickDefined<T extends object>(value: T): Partial<T> {
  const result: Partial<T> = {};
  for (const key of Object.keys(value) as (keyof T)[]) {
    if (value[key] !== undefined) result[key] = value[key];
  }
  return result;
}

export function generateSku(name: string): string {
  const prefix = name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 20);
  return `${prefix || 'PROD'}-${Date.now().toString().slice(-6)}`;
}

/**
 * Maps a raw Supabase `products` row onto the frontend `Product` shape.
 * Centralized here so every route that touches the catalog (product CRUD,
 * order pricing) agrees on the same field mapping.
 */
export function formatDbProduct(row: Record<string, unknown>): Product {
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    description: row.description as string,
    short_description: (row.short_description as string) || '',
    price: row.price as number,
    compare_at_price: (row.compare_at_price as number | null) ?? undefined,
    category_id: row.category_id as string,
    stock: (row.stock as number) ?? 99,
    availability_status: row.availability_status as Product['availability_status'],
    made_to_order: row.made_to_order as boolean,
    sku: (row.sku as string) || '',
    images: (row.images as string[]) || [],
    materials: (row.materials as string[]) || [],
    care_instructions: (row.care_instructions as string[]) || [],
    customization_available: row.customization_available as boolean,
    personalization_options: (row.personalization_options as string[] | undefined)?.length
      ? (row.personalization_options as string[])
      : undefined,
    preparation_time: (row.preparation_time as string | null) ?? undefined,
    shipping_time: (row.shipping_time as string | null) ?? undefined,
    featured: row.featured as boolean,
    bestseller: row.bestseller as boolean,
    new_product: row.is_new as boolean,
    status: row.status as Product['status'],
    created_at: row.created_at as string,
  };
}

/** Maps a raw Supabase `coupons` row onto the frontend `Coupon` shape. */
export function formatDbCoupon(row: Record<string, unknown>): Coupon {
  return {
    code: row.code as string,
    type: row.type as Coupon['type'],
    value: row.value as number,
    minSubtotal: (row.min_subtotal as number | null) ?? undefined,
    active: row.active as boolean,
  };
}
