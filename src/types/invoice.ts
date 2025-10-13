export interface InvoiceItem {
  id: string;
  description: string;
  itemDescription?: string; // Additional item-specific description
  quantity: number;
  unitPrice: number;
  discount?: number;
  discountType?: 'percentage' | 'fixed';
  taxRate?: number;
  total: number;
}

export interface InvoiceClient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  taxId?: string;
}

export interface InvoiceCompany {
  id: string;
  name: string;
  logo?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  taxId: string;
  phone: string;
  email: string;
  website?: string;
}

export interface InvoicePayment {
  method: 'bank_transfer' | 'credit_card' | 'cash' | 'check' | 'paypal' | 'other';
  accountDetails?: string;
  dueDate: Date;
  terms: string;
}

export interface InvoiceTemplate {
  id: string;
  name: string;
  type: InvoiceType;
  layout: 'modern' | 'classic' | 'minimal' | 'corporate';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  logo?: string;
  showLogo: boolean;
  showCompanyDetails: boolean;
  showClientDetails: boolean;
  showPaymentTerms: boolean;
  showNotes: boolean;
  customFields: InvoiceCustomField[];
}

export interface InvoiceCustomField {
  id: string;
  label: string;
  value: string;
  position: 'header' | 'footer' | 'sidebar';
}

export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';
export type InvoiceType = 'standard' | 'proforma' | 'credit_note' | 'debit_note' | 'recurring' | 'quote';

export interface Invoice {
  id: string;
  number: string;
  type: InvoiceType;
  status: InvoiceStatus;
  template: InvoiceTemplate;
  
  // Dates
  issueDate: Date;
  dueDate: Date;
  sentDate?: Date;
  paidDate?: Date;
  
  // Parties
  company: InvoiceCompany;
  client: InvoiceClient;
  
  // Content
  items: InvoiceItem[];
  notes?: string;
  terms?: string;
  
  // Financial
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  total: number;
  paidAmount: number;
  balance: number;
  
  // Payment
  payment: InvoicePayment;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  
  // Recurring (if applicable)
  recurring?: {
    frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    interval: number;
    endDate?: Date;
    nextDueDate: Date;
  };

  // Sales integration
  saleId?: string; // Reference to original sale
  saleNumber?: string; // Sale number for quick reference
}
