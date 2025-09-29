import { z } from 'zod';

// Zod schemas for runtime validation
export const CustomerSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const ProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  cost: z.number().positive().optional(),
  sku: z.string().optional(),
  category: z.string().optional(),
  stock: z.number().int().min(0),
  minStock: z.number().int().min(0).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const SaleItemSchema = z.object({
  productId: z.string().uuid(),
  productName: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
  total: z.number().positive(),
});

export const SaleSchema = z.object({
  id: z.string().uuid(),
  customerId: z.string().uuid().optional(),
  customerName: z.string().optional(),
  items: z.array(SaleItemSchema),
  subtotal: z.number().nonnegative(),
  tax: z.number().nonnegative(),
  discount: z.number().nonnegative(),
  total: z.number().nonnegative(),
  status: z.enum(['pending', 'completed', 'cancelled', 'refunded']),
  paymentMethod: z.enum(['cash', 'card', 'bank_transfer', 'other']),
  notes: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CompanySettingsSchema = z.object({
  companyName: z.string().min(1),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  taxRate: z.number().min(0).max(1),
  currency: z.string().length(3),
});

// TypeScript types derived from schemas
export type Customer = z.infer<typeof CustomerSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type SaleItem = z.infer<typeof SaleItemSchema>;
export type Sale = z.infer<typeof SaleSchema>;
export type CompanySettings = z.infer<typeof CompanySettingsSchema>;

// Database table interfaces
export interface DatabaseCustomer extends Omit<Customer, 'id' | 'createdAt' | 'updatedAt'> {
  id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DatabaseProduct extends Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'minStock'> {
  id?: string;
  created_at?: string;
  updated_at?: string;
  min_stock?: number;
}

export interface DatabaseSale extends Omit<Sale, 'id' | 'createdAt' | 'updatedAt' | 'items' | 'customerId' | 'customerName' | 'paymentMethod'> {
  id?: string;
  created_at?: string;
  updated_at?: string;
  customer_id?: string;
  customer_name?: string;
  payment_method?: string;
  items?: string; // JSON string
}

export interface DatabaseSaleItem extends SaleItem {
  sale_id?: string;
}
