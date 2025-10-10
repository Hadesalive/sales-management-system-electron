import React from 'react';
import { InvoiceTemplate } from '../invoice-templates';

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
  invoiceType?: 'invoice' | 'proforma' | 'quote' | 'credit_note' | 'debit_note';
  currency?: string;
  paidAmount?: number;
  balance?: number;
  status?: 'draft' | 'pending' | 'sent' | 'paid' | 'overdue' | 'cancelled';
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
    phone?: string;
    email?: string;
  };
  items: InvoiceItem[];
  notes?: string;
  terms?: string;
  taxRate: number;
  discount: number;
  bankDetails?: {
    bankName: string;
    accountName?: string;
    accountNumber: string;
    routingNumber?: string;
    swiftCode?: string;
  };
}

interface TemplateRendererProps {
  data: InvoiceData;
  template: InvoiceTemplate;
  brandLogos?: string[];
}

export function MinimalOutlineRenderer({ data, template, brandLogos = [] }: TemplateRendererProps) {
  const subtotal = data.items.reduce((sum, i) => sum + i.amount, 0);
  const tax = subtotal * (data.taxRate / 100);
  const total = subtotal + tax - data.discount;
  const currency = data.currency || 'USD';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Footer component
  const InvoiceFooter = () => (
    <footer className="pt-4 border-t" style={{ borderColor: '#d1d5db' }}>
      {data.notes && (
        <div className="mb-3">
          <div className="font-semibold mb-1 text-sm" style={{ color: template.colors.text }}>Notes</div>
          <div className="text-xs" style={{ color: template.colors.text }}>{data.notes}</div>
        </div>
      )}
      {data.terms && (
        <div className="mb-3">
          <div className="font-semibold mb-1 text-sm" style={{ color: template.colors.text }}>Terms</div>
          <div className="text-xs" style={{ color: template.colors.text }}>{data.terms}</div>
        </div>
      )}
      {brandLogos.length > 0 && (
        <div className="flex items-center gap-3 mt-2">
          {brandLogos.map((logo, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={logo} alt={`Brand ${i + 1}`} className="h-6 w-auto object-contain opacity-80" />
          ))}
        </div>
      )}
    </footer>
  );

  return (
    <div
      style={{
        width: '210mm',
        minHeight: '297mm',
        backgroundColor: template.colors.background,
        color: template.colors.text,
        fontFamily: `${template.fonts.primary}, 'Helvetica Neue', Arial, sans-serif`
      }}
    >
      {/* Page Container with Flexbox */}
      <div style={{ minHeight: '297mm', display: 'flex', flexDirection: 'column' }}>
        {/* Header and Content */}
        <div className="p-10 pb-0 flex-shrink-0">
          {/* Header Row */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              {template.layout.showLogo && data.company.logo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={data.company.logo} alt="Logo" className="h-10 w-auto object-contain border border-gray-300 p-1" />
              )}
              <div>
                <div className="text-xl font-bold" style={{ color: template.colors.text }}>{data.company.name}</div>
                <div className="text-sm" style={{ color: template.colors.secondary }}>{data.company.address}, {data.company.city}, {data.company.state} {data.company.zip}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-extrabold" style={{ color: template.colors.text }}>INVOICE</div>
              <div className="text-sm" style={{ color: template.colors.secondary }}>#{data.invoiceNumber}</div>
            </div>
          </div>

          {/* Outline Boxes */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="border p-3" style={{ borderColor: '#d1d5db' }}>
              <div className="text-xs uppercase" style={{ color: template.colors.secondary }}>Bill To</div>
              <div className="text-sm font-medium">{data.customer.name}</div>
              <div className="text-sm">{data.customer.address}</div>
              <div className="text-sm">{data.customer.city}, {data.customer.state} {data.customer.zip}</div>
              {data.customer.phone && <div className="text-sm">{data.customer.phone}</div>}
              {data.customer.email && <div className="text-sm">{data.customer.email}</div>}
            </div>
            <div className="border p-3" style={{ borderColor: '#d1d5db' }}>
              <div className="flex justify-between text-sm" style={{ color: template.colors.text }}>
                <div><span className="text-gray-500">Date:</span> {new Date(data.date).toLocaleDateString()}</div>
                <div><span className="text-gray-500">Due:</span> {new Date(data.dueDate).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area - Grows */}
        <div className="flex-grow px-10">
          {/* Items - simple outline table */}
          <div className="mb-6">
            <div className="grid grid-cols-12 text-xs uppercase py-2 border-t border-b" style={{ borderColor: '#d1d5db', color: template.colors.secondary }}>
              <div className="col-span-7">Description</div>
              <div className="col-span-2 text-right">Qty</div>
              <div className="col-span-1 text-right">Rate</div>
              <div className="col-span-2 text-right">Amount</div>
            </div>
            {data.items.map((item) => (
              <div key={item.id} className="grid grid-cols-12 py-3 text-sm border-b" style={{ borderColor: '#e5e7eb' }}>
                <div className="col-span-7 pr-4">{item.description}</div>
                <div className="col-span-2 text-right">{item.quantity}</div>
                <div className="col-span-1 text-right">${item.rate.toFixed(2)}</div>
                <div className="col-span-2 text-right font-medium">${item.amount.toFixed(2)}</div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-6">
            <div className="w-full max-w-sm text-sm">
              <div className="flex justify-between py-1"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
              {data.taxRate > 0 && (
                <div className="flex justify-between py-1"><span>Tax ({data.taxRate}%)</span><span>{formatCurrency(tax)}</span></div>
              )}
              {data.discount > 0 && (
                <div className="flex justify-between py-1"><span>Discount</span><span>- {formatCurrency(data.discount)}</span></div>
              )}
              <div className="mt-2 pt-2 flex justify-between items-center border-t" style={{ borderColor: '#d1d5db' }}>
                <div className="text-lg font-bold" style={{ color: template.colors.accent }}>Total</div>
                <div className="text-2xl font-extrabold" style={{ color: template.colors.text }}>{formatCurrency(total)}</div>
              </div>
              
              {/* Payment Information */}
              {data.paidAmount !== undefined && data.paidAmount > 0 && (
                <>
                  <div className="flex justify-between items-center mt-2 py-1" style={{ color: '#10b981' }}>
                    <span className="font-semibold">Paid:</span>
                    <span className="font-bold">-{formatCurrency(data.paidAmount)}</span>
                  </div>
                  <div 
                    className="flex justify-between items-center mt-2 pt-2 border-t-2 font-extrabold" 
                    style={{ 
                      borderColor: data.balance && data.balance > 0 ? '#f59e0b' : '#10b981',
                      color: data.balance && data.balance > 0 ? '#f59e0b' : '#10b981'
                    }}
                  >
                    <span>Balance Due:</span>
                    <span>{formatCurrency(data.balance || 0)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer - Always at Bottom */}
        <div className="mt-auto p-10 pt-0 flex-shrink-0">
          <InvoiceFooter />
        </div>
      </div>
    </div>
  );
}
