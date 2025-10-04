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

export function MinimalOutlineRenderer({ data, template, brandLogos = [] }: TemplateRendererProps) {
  const subtotal = data.items.reduce((sum, i) => sum + i.amount, 0);
  const tax = subtotal * (data.taxRate / 100);
  const total = subtotal + tax - data.discount;

  return (
    <div
      className="min-h-screen p-10"
      style={{
        backgroundColor: template.colors.background,
        color: template.colors.text,
        fontFamily: `${template.fonts.primary}, 'Helvetica Neue', Arial, sans-serif`
      }}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          {template.layout.showLogo && data.company.logo && (
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
        </div>
        <div className="border p-3" style={{ borderColor: '#d1d5db' }}>
          <div className="flex justify-between text-sm" style={{ color: template.colors.text }}>
            <div><span className="text-gray-500">Date:</span> {new Date(data.date).toLocaleDateString()}</div>
            <div><span className="text-gray-500">Due:</span> {new Date(data.dueDate).toLocaleDateString()}</div>
          </div>
        </div>
      </div>

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
      <div className="flex justify-end mb-8">
        <div className="w-full max-w-sm text-sm">
          <div className="flex justify-between py-1"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
          {data.taxRate > 0 && (
            <div className="flex justify-between py-1"><span>Tax ({data.taxRate}%)</span><span>${tax.toFixed(2)}</span></div>
          )}
          {data.discount > 0 && (
            <div className="flex justify-between py-1"><span>Discount</span><span>- ${data.discount.toFixed(2)}</span></div>
          )}
          <div className="mt-2 pt-2 flex justify-between items-center border-t" style={{ borderColor: '#d1d5db' }}>
            <div className="text-lg font-bold" style={{ color: template.colors.accent }}>Total</div>
            <div className="text-2xl font-extrabold" style={{ color: template.colors.text }}>${total.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t" style={{ borderColor: '#d1d5db' }}>
        {data.notes && (
          <div className="mb-4">
            <div className="font-semibold mb-1" style={{ color: template.colors.text }}>Notes</div>
            <div className="text-sm" style={{ color: template.colors.text }}>{data.notes}</div>
          </div>
        )}
        {data.terms && (
          <div className="mb-4">
            <div className="font-semibold mb-1" style={{ color: template.colors.text }}>Terms</div>
            <div className="text-sm" style={{ color: template.colors.text }}>{data.terms}</div>
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


