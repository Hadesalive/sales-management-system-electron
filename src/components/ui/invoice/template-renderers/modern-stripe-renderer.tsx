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
}

interface TemplateRendererProps {
  data: InvoiceData;
  template: InvoiceTemplate;
  brandLogos?: string[];
}

export function ModernStripeRenderer({ data, template, brandLogos = [] }: TemplateRendererProps) {
  const subtotal = data.items.reduce((sum, i) => sum + i.amount, 0);
  const tax = subtotal * (data.taxRate / 100);
  const total = subtotal + tax - data.discount;

  return (
    <div
      className="min-h-screen p-10 relative overflow-hidden"
      style={{
        backgroundColor: template.colors.background,
        color: template.colors.text,
        fontFamily: `${template.fonts.primary}, 'Helvetica Neue', Arial, sans-serif`
      }}
    >
      {/* Right Accent Stripe */}
      <div
        className="absolute top-0 right-0 h-full"
        style={{ width: 96, background: `linear-gradient(180deg, ${template.colors.primary}, ${template.colors.secondary})` }}
      />

      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div className="flex items-center gap-4">
          {template.layout.showLogo && data.company.logo && (
            <img src={data.company.logo} alt="Logo" className="h-12 w-auto object-contain" />
          )}
          <div>
            <div className="text-xl font-bold" style={{ color: template.colors.text }}>{data.company.name}</div>
            <div className="text-sm" style={{ color: template.colors.secondary }}>{data.company.phone} • {data.company.email}</div>
            <div className="text-sm" style={{ color: template.colors.secondary }}>{data.company.address}, {data.company.city}, {data.company.state} {data.company.zip}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="inline-block px-3 py-1 rounded text-white font-semibold" style={{ backgroundColor: template.colors.primary }}>INVOICE</div>
          <div className="mt-2 text-sm" style={{ color: template.colors.text }}>
            <div><span className="font-medium">No:</span> {data.invoiceNumber}</div>
            <div><span className="font-medium">Date:</span> {new Date(data.date).toLocaleDateString()}</div>
            <div><span className="font-medium">Due:</span> {new Date(data.dueDate).toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      {/* Bill To + Summary */}
      <div className="mb-6 grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <div className="text-sm font-semibold mb-1" style={{ color: template.colors.primary }}>Bill To</div>
          <div className="text-sm">
            <div className="font-medium">{data.customer.name}</div>
            <div>{data.customer.address}</div>
            <div>{data.customer.city}, {data.customer.state} {data.customer.zip}</div>
          </div>
        </div>
        <div>
          <div className="rounded p-3 border" style={{ borderColor: `${template.colors.secondary}55`, backgroundColor: `${template.colors.primary}08` }}>
            <div className="text-xs" style={{ color: template.colors.secondary }}>Amount Due</div>
            <div className="text-2xl font-extrabold" style={{ color: template.colors.text }}>${total.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-6">
        <div className="grid grid-cols-12 text-sm font-semibold py-2" style={{ color: template.colors.primary, borderBottom: `2px solid ${template.colors.secondary}` }}>
          <div className="col-span-7">Description</div>
          <div className="col-span-2 text-right">Qty</div>
          <div className="col-span-1 text-right">Rate</div>
          <div className="col-span-2 text-right">Amount</div>
        </div>
        {data.items.map((item, idx) => (
          <div key={item.id} className="grid grid-cols-12 py-3 text-sm" style={{ borderBottom: `1px solid ${template.colors.secondary}33`, backgroundColor: idx % 2 ? `${template.colors.primary}05` : 'transparent' }}>
            <div className="col-span-7 pr-4">{item.description}</div>
            <div className="col-span-2 text-right">{item.quantity}</div>
            <div className="col-span-1 text-right">${item.rate.toFixed(2)}</div>
            <div className="col-span-2 text-right font-medium">${item.amount.toFixed(2)}</div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="mb-8 flex justify-end">
        <div className="w-full max-w-sm text-sm">
          <div className="flex justify-between py-1"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
          {data.taxRate > 0 && (
            <div className="flex justify-between py-1"><span>Tax ({data.taxRate}%)</span><span>${tax.toFixed(2)}</span></div>
          )}
          {data.discount > 0 && (
            <div className="flex justify-between py-1"><span>Discount</span><span>- ${data.discount.toFixed(2)}</span></div>
          )}
          <div className="mt-2 pt-2 flex justify-between items-center border-t" style={{ borderColor: template.colors.secondary }}>
            <div className="text-lg font-bold" style={{ color: template.colors.primary }}>Total</div>
            <div className="text-2xl font-extrabold" style={{ color: template.colors.text }}>${total.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t" style={{ borderColor: template.colors.secondary }}>
        {data.terms && (
          <div className="text-sm mb-3">
            <div className="font-semibold mb-1" style={{ color: template.colors.primary }}>Terms</div>
            <div>{data.terms}</div>
          </div>
        )}
        {brandLogos.length > 0 && (
          <div className="flex items-center gap-3 mt-2">
            {brandLogos.map((logo, i) => (
              <img key={i} src={logo} alt={`Brand ${i + 1}`} className="h-6 w-auto object-contain opacity-80" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


