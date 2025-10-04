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

export function ElegantDarkRenderer({ data, template, brandLogos = [] }: TemplateRendererProps) {
  const subtotal = data.items.reduce((sum, i) => sum + i.amount, 0);
  const tax = subtotal * (data.taxRate / 100);
  const total = subtotal + tax - data.discount;

  return (
    <div className="min-h-screen" style={{ backgroundColor: template.colors.background, color: template.colors.text, fontFamily: `${template.fonts.primary}, 'Helvetica Neue', Arial, sans-serif` }}>
      {/* Dark header */}
      <div className="px-10 py-8" style={{ backgroundColor: template.colors.primary }}>
        <div className="flex items-start justify-between text-white">
          <div className="flex items-center gap-4">
            {template.layout.showLogo && data.company.logo && (
              <img src={data.company.logo} alt="Logo" className="h-12 w-auto object-contain" />
            )}
            <div>
              <div className="text-xl font-semibold tracking-wide">{data.company.name}</div>
              <div className="text-sm opacity-80">{data.company.phone} • {data.company.email}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-extrabold" style={{ color: template.colors.accent }}>INVOICE</div>
            <div className="text-sm opacity-85">No: {data.invoiceNumber}</div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-10 py-8">
        {/* Meta */}
        <div className="flex items-start justify-between mb-6 text-sm">
          <div>
            <div className="font-semibold mb-1" style={{ color: template.colors.primary }}>Bill To</div>
            <div className="font-medium">{data.customer.name}</div>
            <div>{data.customer.address}</div>
            <div>{data.customer.city}, {data.customer.state} {data.customer.zip}</div>
          </div>
          <div className="text-right">
            <div><span className="text-gray-500">Date:</span> {new Date(data.date).toLocaleDateString()}</div>
            <div><span className="text-gray-500">Due:</span> {new Date(data.dueDate).toLocaleDateString()}</div>
          </div>
        </div>

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
                  <td className="py-3 px-4 text-right" style={{ borderBottom: `1px solid ${template.colors.secondary}40` }}>${item.rate.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right" style={{ borderBottom: `1px solid ${template.colors.secondary}40` }}>${item.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
            <div className="mt-2 pt-2 flex justify-between items-center border-t" style={{ borderColor: template.colors.secondary }}>
              <div className="text-lg font-bold" style={{ color: template.colors.accent }}>Total</div>
              <div className="text-2xl font-extrabold" style={{ color: template.colors.text }}>${total.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t" style={{ borderColor: template.colors.secondary }}>
          {data.notes && (
            <div className="mb-4">
              <div className="font-semibold mb-1" style={{ color: template.colors.primary }}>Notes</div>
              <div className="text-sm">{data.notes}</div>
            </div>
          )}
          {data.terms && (
            <div className="mb-4">
              <div className="font-semibold mb-1" style={{ color: template.colors.primary }}>Terms</div>
              <div className="text-sm">{data.terms}</div>
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
    </div>
  );
}


