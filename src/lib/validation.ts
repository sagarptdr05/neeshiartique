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

// 5. Checkout Schema
export const CheckoutSchema = z.object({
  customerName: z.string().min(2, 'Name must be at least 2 characters').trim(),
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').trim(),
  address: z.string().min(5, 'Address must be at least 5 characters').trim(),
  city: z.string().min(2, 'City is required').trim(),
  state: z.string().min(2, 'State is required').trim(),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be exactly 6 digits').trim(),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().min(1, 'Product ID is required'),
    name: z.string().min(1, 'Product Name is required'),
    quantity: z.number().int().positive('Quantity must be greater than 0'),
    price: z.number().int().positive('Price must be positive'),
  })).min(1, 'Cart cannot be empty'),
});
