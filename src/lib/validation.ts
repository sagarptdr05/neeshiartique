import { z } from 'zod';

/**
 * Server-side input validation schemas using Zod.
 */

// 1. User Login Schema
export const LoginSchema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// 2. User Registration Schema
export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters').trim(),
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format').min(10, 'Phone number must be at least 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// 3. Contact Form Submission Schema
export const ContactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').trim(),
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(15, 'Phone number is too long').trim(),
  subject: z.string().min(3, 'Subject must be at least 3 characters').trim(),
  message: z.string().min(10, 'Message must be at least 10 characters').trim(),
});

// 4. Custom Order Schema
export const CustomOrderSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').trim(),
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').trim(),
  productType: z.string().min(1, 'Product type is required'),
  occasion: z.string().optional(),
  preferredColor: z.string().optional(),
  size: z.string().optional(),
  quantity: z.number().int().positive('Quantity must be greater than 0'),
  budgetRange: z.string().optional(),
  customizationDetails: z.string().min(10, 'Please provide more customization details').trim(),
  requiredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Required date must be in YYYY-MM-DD format'),
  referenceImage: z.string().optional(), // Base64 encoded or path
  message: z.string().optional(),
});

// 5. Product Schema (Admin catalog management)
export const ProductSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(120, 'Name is too long').trim(),
  description: z.string().min(10, 'Description must be at least 10 characters').trim(),
  short_description: z.string().min(5, 'Short description must be at least 5 characters').max(300, 'Short description is too long').trim(),
  price: z.number().int().positive('Price must be greater than 0'),
  compare_at_price: z.number().int().positive('Compare-at price must be greater than 0').optional().nullable(),
  category_id: z.string().min(1, 'Category is required'),
  availability_status: z.enum(['available', 'temporarily_unavailable', 'discontinued']),
  made_to_order: z.boolean(),
  images: z.array(z.string().min(1)).min(1, 'At least one image is required'),
  materials: z.array(z.string()).default([]),
  care_instructions: z.array(z.string()).default([]),
  customization_available: z.boolean(),
  personalization_options: z.array(z.string()).optional(),
  preparation_time: z.string().max(60, 'Preparation time is too long').optional(),
  shipping_time: z.string().max(60, 'Shipping time is too long').optional(),
  featured: z.boolean(),
  bestseller: z.boolean(),
  new_product: z.boolean(),
  status: z.enum(['active', 'archived']),
});

export const ProductUpdateSchema = ProductSchema.partial();

// 6. Category Schema
export const CategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(80, 'Name is too long').trim(),
  description: z.string().max(300, 'Description is too long').trim().optional().default(''),
  image: z.string().min(1, 'An image is required').trim(),
});

export const CategoryUpdateSchema = CategorySchema.partial();

// 7. Coupon Schema
export const CouponSchema = z.object({
  code: z.string().regex(/^[A-Za-z0-9]{3,20}$/, 'Code must be 3-20 letters/numbers').trim(),
  type: z.enum(['percentage', 'fixed']),
  value: z.number().int().positive('Value must be greater than 0'),
  minSubtotal: z.number().int().positive('Minimum subtotal must be greater than 0').optional().nullable(),
  active: z.boolean().optional().default(true),
}).refine((data) => data.type !== 'percentage' || data.value <= 100, {
  message: 'A percentage discount cannot exceed 100',
  path: ['value'],
});

// 7b. Coupon Update Schema (toggling active / editing an existing coupon)
export const CouponUpdateSchema = z.object({
  active: z.boolean().optional(),
  type: z.enum(['percentage', 'fixed']).optional(),
  value: z.number().int().positive('Value must be greater than 0').optional(),
  minSubtotal: z.number().int().positive('Minimum subtotal must be greater than 0').optional().nullable(),
});

// 8. Checkout Schema
export const CheckoutSchema = z.object({
  customerName: z.string().min(2, 'Name must be at least 2 characters').trim(),
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').trim(),
  address: z.string().min(5, 'Address must be at least 5 characters').trim(),
  city: z.string().min(2, 'City is required').trim(),
  state: z.string().min(2, 'State is required').trim(),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be exactly 6 digits').trim(),
  notes: z.string().optional(),
  // Only the id and quantity ever come from the browser — name and price are
  // always looked up server-side from the catalog, never trusted here.
  items: z.array(z.object({
    productId: z.string().min(1, 'Product ID is required'),
    quantity: z.number().int().positive('Quantity must be greater than 0'),
  })).min(1, 'Cart cannot be empty'),
});
