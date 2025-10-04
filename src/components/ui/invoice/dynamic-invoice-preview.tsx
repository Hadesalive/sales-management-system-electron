'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { InvoiceTemplate } from './invoice-templates';
import { TemplateRenderer } from './template-renderers';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  company: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
    email: string;
    logo?: string;
  };
  customer: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
    email: string;
  };
  items: InvoiceItem[];
  notes?: string;
  terms?: string;
  taxRate: number;
  discount: number;
}

interface DynamicInvoicePreviewProps {
  data: InvoiceData;
  template: InvoiceTemplate;
  brandLogos?: string[];
  className?: string;
}

export function DynamicInvoicePreview({ 
  data, 
  template, 
  brandLogos = [],
  className = "" 
}: DynamicInvoicePreviewProps) {
  return (
    <TemplateRenderer 
      data={data} 
      template={template} 
      brandLogos={brandLogos} 
      className={className}
    />
  );
}
