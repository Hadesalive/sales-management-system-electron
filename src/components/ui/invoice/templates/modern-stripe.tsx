import React from 'react';
import { InvoiceTemplate } from '../invoice-templates';

export const modernStripeTemplate: InvoiceTemplate = {
  id: 'modern-stripe',
  name: 'Modern Stripe',
  description: 'Accent stripe with structured content and modern typography',
  preview: 'modern-stripe-preview',
  colors: {
    primary: '#2563eb',
    secondary: '#1d4ed8',
    accent: '#22c55e',
    background: '#ffffff',
    text: '#0f172a'
  },
  layout: {
    headerStyle: 'modern',
    showLogo: true,
    showBorder: false,
    itemTableStyle: 'modern',
    footerStyle: 'minimal'
  },
  fonts: {
    primary: 'Inter',
    secondary: 'Inter',
    size: 'medium'
  }
};

export const ModernStripePreview = () => (
  <div className="w-full h-32 bg-white rounded-lg relative overflow-hidden border border-gray-200">
    <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-b from-blue-500 to-blue-700" />
    <div className="absolute top-3 left-3 flex items-center gap-2">
      <div className="w-7 h-7 rounded bg-blue-600/10" />
      <div>
        <div className="text-xs font-semibold text-slate-900">MODERN INC</div>
        <div className="text-[7px] text-slate-500">innovate • deliver</div>
      </div>
    </div>
    <div className="absolute top-3 right-24 text-right">
      <div className="text-[10px] font-bold text-blue-700">INVOICE</div>
      <div className="text-[7px] text-slate-600">#2024-001</div>
    </div>
    <div className="absolute bottom-3 left-3 right-3 flex justify-between text-[7px] text-slate-700">
      <div>
        <div className="uppercase text-[6px] text-slate-500">Bill To</div>
        <div>Client Name</div>
      </div>
      <div className="text-right bg-blue-50 border border-blue-200 rounded px-2 py-1">
        <div className="text-[6px] text-blue-700 uppercase">Total</div>
        <div className="text-sm font-semibold text-blue-800">$4,500.00</div>
      </div>
    </div>
  </div>
);


