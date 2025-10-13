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

export const InvoiceTemplateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string(),
  preview: z.string(),
  colors: z.object({
    primary: z.string(),
    secondary: z.string(),
    accent: z.string(),
    background: z.string(),
    text: z.string(),
  }),
  layout: z.object({
    headerStyle: z.enum(['minimal', 'classic', 'modern', 'premium']),
    showLogo: z.boolean(),
    showBorder: z.boolean(),
    itemTableStyle: z.enum(['simple', 'detailed', 'modern']),
    footerStyle: z.enum(['minimal', 'detailed']),
  }),
  fonts: z.object({
    primary: z.string(),
    secondary: z.string(),
    size: z.enum(['small', 'medium', 'large']),
  }),
  customSchema: z.any().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const InvoiceItemSchema = z.object({
  id: z.string().uuid(),
  description: z.string().min(1),
  itemDescription: z.string().optional(),
  quantity: z.number().int().positive(),
  rate: z.number().positive(),
  amount: z.number().positive(),
});

export const InvoiceSchema = z.object({
  id: z.string().uuid(),
  number: z.string().min(1),
  customerId: z.string().uuid().optional(),
  customerName: z.string().optional(),
  customerEmail: z.string().email().optional(),
  customerAddress: z.string().optional(),
  customerPhone: z.string().optional(),
  items: z.array(InvoiceItemSchema),
  subtotal: z.number().nonnegative(),
  tax: z.number().nonnegative(),
  discount: z.number().nonnegative(),
  total: z.number().nonnegative(),
  paidAmount: z.number().nonnegative(),
  balance: z.number().nonnegative(),
  status: z.enum(['draft', 'pending', 'sent', 'paid', 'overdue', 'cancelled']),
  invoiceType: z.enum(['invoice', 'proforma', 'quote', 'credit_note', 'debit_note']),
  currency: z.string().length(3),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
  bankDetails: z.object({
    bankName: z.string(),
    accountName: z.string().optional(),
    accountNumber: z.string(),
    routingNumber: z.string().optional(),
    swiftCode: z.string().optional(),
  }).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const DealSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  customerId: z.string().uuid().optional(),
  customerName: z.string().optional(),
  value: z.number().positive(),
  probability: z.number().int().min(0).max(100),
  stage: z.enum(['lead', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost']),
  expectedCloseDate: z.string().datetime().optional(),
  actualCloseDate: z.string().datetime().optional(),
  source: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
  negotiationHistory: z.array(z.object({
    id: z.string().uuid(),
    date: z.string().datetime(),
    type: z.enum(['meeting', 'call', 'email', 'proposal', 'counter-offer', 'concession']),
    description: z.string(),
    outcome: z.string().optional(),
    nextSteps: z.string().optional(),
    attachments: z.array(z.string()).default([])
  })).default([]),
  stakeholders: z.array(z.object({
    id: z.string().uuid(),
    name: z.string(),
    role: z.string(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    influence: z.enum(['low', 'medium', 'high']),
    sentiment: z.enum(['positive', 'neutral', 'negative']),
    notes: z.string().optional()
  })).default([]),
  competitorInfo: z.object({
    competitors: z.array(z.string()).default([]),
    ourAdvantages: z.array(z.string()).default([]),
    theirAdvantages: z.array(z.string()).default([]),
    priceComparison: z.string().optional()
  }).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// TypeScript types derived from schemas
export type InvoiceTemplate = z.infer<typeof InvoiceTemplateSchema>;
export type InvoiceItem = z.infer<typeof InvoiceItemSchema>;
export type Invoice = z.infer<typeof InvoiceSchema>;
export type Deal = z.infer<typeof DealSchema>;

export interface DatabaseInvoiceTemplate extends Omit<InvoiceTemplate, 'id' | 'createdAt' | 'updatedAt' | 'colors' | 'fonts' | 'layout' | 'customSchema'> {
  id?: string;
  created_at?: string;
  updated_at?: string;
  colors_primary?: string;
  colors_secondary?: string;
  colors_accent?: string;
  colors_background?: string;
  colors_text?: string;
  fonts_primary?: string;
  fonts_secondary?: string;
  fonts_size?: string;
  layout_header_style?: string;
  layout_show_logo?: number; // SQLite boolean as integer
  layout_show_border?: number; // SQLite boolean as integer
  layout_item_table_style?: string;
  layout_footer_style?: string;
}

export interface DatabaseInvoice extends Omit<Invoice, 'id' | 'createdAt' | 'updatedAt' | 'items' | 'bankDetails' | 'customerId'> {
  id?: string;
  created_at?: string;
  updated_at?: string;
  customer_id?: string;
  customer_name?: string;
  customer_email?: string;
  customer_address?: string;
  customer_phone?: string;
  invoice_type?: string;
  due_date?: string;
  paid_amount?: number;
  items?: string; // JSON string
  bank_details?: string; // JSON string
}

export interface DatabaseInvoiceItem extends InvoiceItem {
  invoice_id?: string;
}

export interface DatabaseDeal extends Omit<Deal, 'id' | 'createdAt' | 'updatedAt' | 'customerId' | 'customerName' | 'expectedCloseDate' | 'actualCloseDate' | 'negotiationHistory' | 'stakeholders' | 'competitorInfo' | 'tags'> {
  id?: string;
  created_at?: string;
  updated_at?: string;
  customer_id?: string;
  customer_name?: string;
  expected_close_date?: string;
  actual_close_date?: string;
  negotiation_history?: string; // JSON string
  stakeholders?: string; // JSON string
  competitor_info?: string; // JSON string
  tags?: string; // JSON string
}
