'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layouts/app-layout';
import { Button, Toast } from '@/components/ui/core';
import { InvoicePreview } from '@/components/ui/invoice';
import { ReceiptPreview } from '@/components/ui/invoice/receipt-preview';
import { useSettings } from '@/contexts/SettingsContext';
import { 
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  PrinterIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  CalendarIcon,
  SwatchIcon
} from '@heroicons/react/24/outline';

// Mock invoice data - in real app, this would come from a service
const mockInvoice = {
  id: 'inv_001',
  number: 'INV-2024-001',
  type: 'standard' as const,
  status: 'paid' as const,
  customerName: 'Acme Corporation',
  customerEmail: 'billing@acme.com',
  customerAddress: '123 Business Ave, Suite 100, San Francisco, CA 94105',
  issueDate: '2024-01-15',
  dueDate: '2024-02-15',
  paidDate: '2024-02-10',
  subtotal: 2500.00,
  tax: 212.50,
  total: 2712.50,
  paidAmount: 2712.50,
  balance: 0.00,
  notes: 'Thank you for your business!',
  terms: 'Payment due within 30 days of invoice date.',
  items: [
    {
      id: '1',
      description: 'Website Development',
      quantity: 1,
      rate: 2000.00,
      amount: 2000.00
    },
    {
      id: '2',
      description: 'SEO Optimization',
      quantity: 1,
      rate: 500.00,
      amount: 500.00
    }
  ],
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-02-10T14:30:00Z'
};

export default function InvoiceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { formatCurrency, formatDate } = useSettings();
  
  const invoiceId = params.id as string;
  
  const [invoice, setInvoice] = useState(mockInvoice);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [viewMode, setViewMode] = useState<'invoice' | 'receipt'>('invoice');
  const [selectedTemplate, setSelectedTemplate] = useState<'classic' | 'modern' | 'minimal'>('classic');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'overdue':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'draft':
        return <DocumentTextIcon className="h-5 w-5 text-gray-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteInvoice = () => {
    setToast({ message: 'Invoice deleted successfully', type: 'success' });
    setTimeout(() => {
      router.push('/invoices');
    }, 1000);
  };

  const handleDownloadInvoice = () => {
    setToast({ message: 'Invoice download started', type: 'success' });
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleShareInvoice = () => {
    setToast({ message: 'Invoice sharing feature coming soon', type: 'success' });
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading invoice...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Simple Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/invoices')}
          className="flex items-center gap-2 text-sm"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Invoices
        </Button>

        {/* Invoice Header */}
        <div 
          className="p-8 rounded-lg border"
          style={{ 
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)'
          }}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                  <DocumentTextIcon className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
                    {invoice.number}
                  </h1>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(invoice.status)}
                      <span 
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}
                      >
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                      <CurrencyDollarIcon className="h-4 w-4" />
                      <span className="capitalize">{invoice.type.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                <div className="flex items-center gap-1">
                  <CalendarIcon className="h-4 w-4" />
                  <span>Issued {formatDate(invoice.issueDate)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ClockIcon className="h-4 w-4" />
                  <span>Due {formatDate(invoice.dueDate)}</span>
                </div>
                {invoice.paidDate && (
                  <div className="flex items-center gap-1">
                    <CheckCircleIcon className="h-4 w-4" />
                    <span>Paid {formatDate(invoice.paidDate)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <Button
                  variant={viewMode === 'invoice' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('invoice')}
                  className="px-3"
                >
                  Invoice
                </Button>
                <Button
                  variant={viewMode === 'receipt' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('receipt')}
                  className="px-3"
                >
                  Receipt
                </Button>
              </div>

              {/* Template Selection */}
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value as 'classic' | 'modern' | 'minimal')}
                className="px-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm"
              >
                <option value="classic">Classic Template</option>
                <option value="modern">Modern Template</option>
                <option value="minimal">Minimal Template</option>
              </select>

              <Button
                variant="outline"
                onClick={() => router.push('/invoices/templates')}
                className="flex items-center gap-2"
              >
                <SwatchIcon className="h-4 w-4" />
                Templates
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push(`/invoices/${invoice.id}/edit`)}
                className="flex items-center gap-2"
              >
                <PencilIcon className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={handlePrintInvoice}
                className="flex items-center gap-2"
              >
                <PrinterIcon className="h-4 w-4" />
                Print
              </Button>
              <Button
                variant="outline"
                onClick={handleDownloadInvoice}
                className="flex items-center gap-2"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                Download
              </Button>
              <Button
                variant="outline"
                onClick={handleShareInvoice}
                className="flex items-center gap-2"
              >
                <ShareIcon className="h-4 w-4" />
                Share
              </Button>
              <Button
                variant="outline"
                onClick={handleDeleteInvoice}
                className="flex items-center gap-2 text-red-600 hover:text-red-700"
              >
                <TrashIcon className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        {/* Invoice Information Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Information */}
          <div 
            className="p-6 rounded-lg border"
            style={{ 
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)'
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <UserIcon className="h-5 w-5" style={{ color: 'var(--accent)' }} />
              <h2 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                Customer
              </h2>
            </div>
            
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                  Name:
                </span>
                <p style={{ color: 'var(--muted-foreground)' }}>
                  {invoice.customerName}
                </p>
              </div>
              
              <div>
                <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                  Email:
                </span>
                <p style={{ color: 'var(--muted-foreground)' }}>
                  {invoice.customerEmail}
                </p>
              </div>
              
              <div>
                <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                  Address:
                </span>
                <p style={{ color: 'var(--muted-foreground)' }}>
                  {invoice.customerAddress}
                </p>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div 
            className="p-6 rounded-lg border"
            style={{ 
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)'
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <CurrencyDollarIcon className="h-5 w-5" style={{ color: 'var(--accent)' }} />
              <h2 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                Financial Summary
              </h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span style={{ color: 'var(--muted-foreground)' }}>Subtotal:</span>
                <span className="font-semibold" style={{ color: 'var(--foreground)' }}>
                  {formatCurrency(invoice.subtotal)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span style={{ color: 'var(--muted-foreground)' }}>Tax:</span>
                <span className="font-semibold" style={{ color: 'var(--foreground)' }}>
                  {formatCurrency(invoice.tax)}
                </span>
              </div>
              
              <div className="border-t pt-3" style={{ borderColor: 'var(--border)' }}>
                <div className="flex justify-between">
                  <span className="font-semibold" style={{ color: 'var(--foreground)' }}>Total:</span>
                  <span className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
                    {formatCurrency(invoice.total)}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between">
                <span style={{ color: 'var(--muted-foreground)' }}>Paid:</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(invoice.paidAmount)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span style={{ color: 'var(--muted-foreground)' }}>Balance:</span>
                <span className={`font-semibold ${invoice.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(invoice.balance)}
                </span>
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div 
            className="p-6 rounded-lg border"
            style={{ 
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)'
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <DocumentTextIcon className="h-5 w-5" style={{ color: 'var(--accent)' }} />
              <h2 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                Invoice Details
              </h2>
            </div>
            
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                  Invoice ID:
                </span>
                <p style={{ color: 'var(--muted-foreground)' }}>
                  {invoice.id}
                </p>
              </div>
              
              <div>
                <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                  Created:
                </span>
                <p style={{ color: 'var(--muted-foreground)' }}>
                  {formatDate(invoice.createdAt)}
                </p>
              </div>
              
              <div>
                <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                  Last Updated:
                </span>
                <p style={{ color: 'var(--muted-foreground)' }}>
                  {formatDate(invoice.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Items */}
        <div 
          className="p-6 rounded-lg border"
          style={{ 
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)'
          }}
        >
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
            Invoice Items ({invoice.items.length})
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--foreground)' }}>
                    Description
                  </th>
                  <th className="text-right py-3 px-4 font-medium" style={{ color: 'var(--foreground)' }}>
                    Quantity
                  </th>
                  <th className="text-right py-3 px-4 font-medium" style={{ color: 'var(--foreground)' }}>
                    Rate
                  </th>
                  <th className="text-right py-3 px-4 font-medium" style={{ color: 'var(--foreground)' }}>
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={index} className="border-b" style={{ borderColor: 'var(--border)' }}>
                    <td className="py-3 px-4">
                      <div className="font-medium" style={{ color: 'var(--foreground)' }}>
                        {item.description}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span style={{ color: 'var(--foreground)' }}>{item.quantity}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span style={{ color: 'var(--foreground)' }}>{formatCurrency(item.rate)}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-medium" style={{ color: 'var(--foreground)' }}>
                        {formatCurrency(item.amount)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes and Terms */}
        {(invoice.notes || invoice.terms) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {invoice.notes && (
              <div 
                className="p-6 rounded-lg border"
                style={{ 
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)'
                }}
              >
                <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
                  Notes
                </h2>
                <p style={{ color: 'var(--muted-foreground)' }}>
                  {invoice.notes}
                </p>
              </div>
            )}
            
            {invoice.terms && (
              <div 
                className="p-6 rounded-lg border"
                style={{ 
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)'
                }}
              >
                <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
                  Terms & Conditions
                </h2>
                <p style={{ color: 'var(--muted-foreground)' }}>
                  {invoice.terms}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Invoice/Receipt Preview */}
        <div 
          className="p-6 rounded-lg border"
          style={{ 
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
              {viewMode === 'invoice' ? 'Invoice Preview' : 'Receipt Preview'} - {selectedTemplate.charAt(0).toUpperCase() + selectedTemplate.slice(1)} Template
            </h2>
            <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Template: {selectedTemplate} | View: {viewMode}
            </div>
          </div>
          
          {viewMode === 'invoice' ? (
            <InvoicePreview
              data={{
                invoiceNumber: invoice.number,
                date: invoice.issueDate,
                dueDate: invoice.dueDate,
                company: {
                  name: "TopNotch Electronics",
                  address: "123 Business St, San Francisco, CA 94105",
                  city: "San Francisco",
                  state: "CA",
                  zip: "94105",
                  phone: "+1 (555) 123-4567",
                  email: "info@topnotch.com"
                },
                customer: {
                  name: invoice.customerName,
                  address: invoice.customerAddress,
                  city: "",
                  state: "",
                  zip: "",
                  phone: "",
                  email: invoice.customerEmail
                },
                items: invoice.items,
                notes: invoice.notes,
                terms: invoice.terms,
                taxRate: 8.5,
                discount: 0
              }}
              onEdit={() => router.push(`/invoices/${invoice.id}/edit`)}
              onPrint={handlePrintInvoice}
              onDownload={handleDownloadInvoice}
              onShare={handleShareInvoice}
            />
          ) : (
            <ReceiptPreview
              data={{
                receiptNumber: invoice.number,
                date: invoice.issueDate,
                time: new Date().toLocaleTimeString(),
                company: {
                  name: "TopNotch Electronics",
                  address: "123 Business St, San Francisco, CA 94105",
                  city: "San Francisco",
                  state: "CA",
                  zip: "94105",
                  phone: "+1 (555) 123-4567",
                  email: "info@topnotch.com"
                },
                customer: {
                  name: invoice.customerName,
                  email: invoice.customerEmail,
                  phone: "+1 (555) 987-6543"
                },
                items: invoice.items,
                paymentMethod: "Credit Card",
                taxRate: 8.5,
                discount: 0
              }}
              onPrint={handlePrintInvoice}
              onDownload={handleDownloadInvoice}
              onShare={handleShareInvoice}
            />
          )}
        </div>

        {/* Toast Notifications */}
        {toast && (
          <Toast
            title={toast.message}
            variant={toast.type}
            onClose={() => setToast(null)}
          >
            {toast.message}
          </Toast>
        )}
      </div>
    </AppLayout>
  );
}
