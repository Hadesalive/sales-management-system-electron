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

export function ProCorporateRenderer({ data, template, brandLogos = [] }: TemplateRendererProps) {
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
      {/* Header */}
      <header className="mb-8 flex items-start justify-between">
        <div className="flex items-center gap-4">
          {template.layout.showLogo && data.company.logo && (
            <img src={data.company.logo} alt="Logo" className="h-12 w-auto object-contain" />
          )}
          <div>
            <h1 className="text-2xl font-bold" style={{ color: template.colors.primary }}>{data.company.name}</h1>
            <div className="text-sm" style={{ color: template.colors.secondary }}>
              <div>{data.company.address}</div>
              <div>{data.company.city}, {data.company.state} {data.company.zip}</div>
              <div>{data.company.phone} • {data.company.email}</div>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-extrabold" style={{ color: template.colors.accent }}>INVOICE</div>
          <div className="mt-2 text-sm">
            <div><span className="font-semibold">No:</span> {data.invoiceNumber}</div>
            <div><span className="font-semibold">Date:</span> {new Date(data.date).toLocaleDateString()}</div>
            <div><span className="font-semibold">Due:</span> {new Date(data.dueDate).toLocaleDateString()}</div>
          </div>
        </div>
      </header>

      {/* Bill To */}
      <section className="mb-6">
        <div className="text-sm font-semibold mb-1" style={{ color: template.colors.primary }}>Bill To</div>
        <div className="text-sm">
          <div className="font-medium">{data.customer.name}</div>
          <div>{data.customer.address}</div>
          <div>{data.customer.city}, {data.customer.state} {data.customer.zip}</div>
          {data.customer.phone && <div>{data.customer.phone}</div>}
          {data.customer.email && <div>{data.customer.email}</div>}
        </div>
      </section>

      {/* Items Table */}
      <section className="mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ backgroundColor: template.colors.primary, color: '#fff' }}>
              <th className="text-left py-3 px-4 font-semibold">Description</th>
              <th className="text-right py-3 px-4 font-semibold">Qty</th>
              <th className="text-right py-3 px-4 font-semibold">Rate</th>
              <th className="text-right py-3 px-4 font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, idx) => (
              <tr key={item.id} style={{ backgroundColor: idx % 2 ? '#00000005' : 'transparent' }}>
                <td className="py-3 px-4" style={{ borderBottom: `1px solid ${template.colors.secondary}30` }}>{item.description}</td>
                <td className="py-3 px-4 text-right" style={{ borderBottom: `1px solid ${template.colors.secondary}30` }}>{item.quantity}</td>
                <td className="py-3 px-4 text-right" style={{ borderBottom: `1px solid ${template.colors.secondary}30` }}>${item.rate.toFixed(2)}</td>
                <td className="py-3 px-4 text-right" style={{ borderBottom: `1px solid ${template.colors.secondary}30` }}>${item.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Totals */}
      <section className="mb-8 flex justify-end">
        <div className="w-full max-w-sm">
          <div className="flex justify-between py-1 text-sm"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
          {data.taxRate > 0 && (
            <div className="flex justify-between py-1 text-sm"><span>Tax ({data.taxRate}%)</span><span>${tax.toFixed(2)}</span></div>
          )}
          {data.discount > 0 && (
            <div className="flex justify-between py-1 text-sm"><span>Discount</span><span>- ${data.discount.toFixed(2)}</span></div>
          )}
          <div className="flex justify-between items-center mt-2 pt-2 border-t-2" style={{ borderColor: template.colors.primary }}>
            <div className="text-lg font-bold" style={{ color: template.colors.accent }}>Total</div>
            <div className="text-2xl font-extrabold" style={{ color: template.colors.text }}>${total.toFixed(2)}</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-8 pt-4 border-t" style={{ borderColor: template.colors.secondary }}>
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
          <div className="flex items-center gap-3 mt-4">
            {brandLogos.map((logo, i) => (
              <img key={i} src={logo} alt={`Brand ${i + 1}`} className="h-6 w-auto object-contain opacity-80" />
            ))}
          </div>
        )}
      </footer>
    </div>
  );
}


