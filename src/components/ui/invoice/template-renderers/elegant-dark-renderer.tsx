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

export function ElegantDarkRenderer({ data, template, brandLogos = [] }: TemplateRendererProps) {
  const subtotal = data.items.reduce((sum, i) => sum + i.amount, 0);
  const tax = subtotal * (data.taxRate / 100);
  const currency = data.currency || 'USD';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };
  const total = subtotal + tax - data.discount;

  // Footer component
  const InvoiceFooter = () => (
    <footer className="pt-4 border-t" style={{ borderColor: template.colors.secondary }}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
        {data.notes && (
          <div>
            <div className="font-semibold mb-1 text-sm" style={{ color: template.colors.primary }}>Notes</div>
            <div className="text-xs">{data.notes}</div>
          </div>
        )}
        {data.terms && (
          <div>
            <div className="font-semibold mb-1 text-sm" style={{ color: template.colors.primary }}>Terms & Conditions</div>
            <div className="text-xs">{data.terms}</div>
          </div>
        )}
      </div>
      
      {data.bankDetails && (
        <div className="mb-3">
          <div className="font-semibold mb-1 text-sm" style={{ color: template.colors.primary }}>Bank Details</div>
          <div className="text-xs grid grid-cols-2 gap-x-4 gap-y-1">
            <div><span className="font-medium">Bank:</span> {data.bankDetails.bankName}</div>
            {data.bankDetails.accountName && (
              <div><span className="font-medium">Account Name:</span> {data.bankDetails.accountName}</div>
            )}
            <div><span className="font-medium">Account Number:</span> {data.bankDetails.accountNumber}</div>
            {data.bankDetails.routingNumber && (
              <div><span className="font-medium">Routing:</span> {data.bankDetails.routingNumber}</div>
            )}
            {data.bankDetails.swiftCode && (
              <div><span className="font-medium">SWIFT:</span> {data.bankDetails.swiftCode}</div>
            )}
          </div>
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
    <div style={{ width: '210mm', minHeight: '297mm', backgroundColor: template.colors.background, color: template.colors.text, fontFamily: `${template.fonts.primary}, 'Helvetica Neue', Arial, sans-serif` }}>
      {/* Page Container with Flexbox */}
      <div style={{ minHeight: '297mm', display: 'flex', flexDirection: 'column' }}>
        {/* Dark header */}
        <div className="px-10 py-8 flex-shrink-0" style={{ backgroundColor: template.colors.primary }}>
          <div className="flex items-start justify-between text-white">
            <div className="flex items-center gap-4">
              {template.layout.showLogo && data.company.logo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={data.company.logo} alt="Logo" className="h-12 w-auto object-contain" />
              )}
              <div>
                <div className="text-xl font-semibold tracking-wide">{data.company.name}</div>
                <div className="text-sm opacity-80">{data.company.phone} • {data.company.email}</div>
                <div className="text-xs opacity-70 mt-1">
                  {data.company.address}, {data.company.city}, {data.company.state} {data.company.zip}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-extrabold uppercase" style={{ color: template.colors.accent }}>
                {data.invoiceType?.replace('_', ' ') || 'INVOICE'}
              </div>
              <div className="text-sm opacity-85">No: {data.invoiceNumber}</div>
            </div>
          </div>
        </div>

        {/* Body - Header section */}
        <div className="px-10 py-6 flex-shrink-0">
          {/* Meta */}
          <div className="flex items-start justify-between mb-6 text-sm">
            <div>
              <div className="font-semibold mb-1" style={{ color: template.colors.primary }}>Bill To</div>
              <div className="font-medium">{data.customer.name}</div>
              <div>{data.customer.address}</div>
              <div>{data.customer.city}, {data.customer.state} {data.customer.zip}</div>
              {data.customer.phone && <div>{data.customer.phone}</div>}
              {data.customer.email && <div>{data.customer.email}</div>}
            </div>
            <div className="text-right">
              <div><span className="text-gray-500">Date:</span> {new Date(data.date).toLocaleDateString()}</div>
              <div><span className="text-gray-500">Due:</span> {new Date(data.dueDate).toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        {/* Content Area - Grows */}
        <div className="flex-grow px-10">
          {/* Items */}
          <div className="mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ backgroundColor: template.colors.primary, color: '#fff' }}>
                  <th className="text-left py-3 px-4">Description</th>
                  <th className="text-right py-3 px-4">Qty</th>
                  <th className="text-right py-3 px-4">Rate</th>
                  <th className="text-right py-3 px-4">Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item, i) => (
                  <tr key={item.id} style={{ backgroundColor: i % 2 ? '#11182708' : 'transparent' }}>
                    <td className="py-3 px-4" style={{ borderBottom: `1px solid ${template.colors.secondary}40` }}>{item.description}</td>
                    <td className="py-3 px-4 text-right" style={{ borderBottom: `1px solid ${template.colors.secondary}40` }}>{item.quantity}</td>
                    <td className="py-3 px-4 text-right" style={{ borderBottom: `1px solid ${template.colors.secondary}40` }}>{formatCurrency(item.rate)}</td>
                    <td className="py-3 px-4 text-right" style={{ borderBottom: `1px solid ${template.colors.secondary}40` }}>{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
              <div className="mt-2 pt-2 flex justify-between items-center border-t" style={{ borderColor: template.colors.secondary }}>
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
        <div className="mt-auto px-10 pb-10 flex-shrink-0">
          <InvoiceFooter />
        </div>
      </div>
    </div>
  );
}
