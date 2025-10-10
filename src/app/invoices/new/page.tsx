'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layouts/app-layout';
import { Button, Toast } from '@/components/ui/core';
import { InvoiceBuilder } from '@/components/ui/invoice';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function NewInvoicePage() {
  const router = useRouter();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [, setIsPreviewMode] = useState(false);

  const handleSave = async (invoiceData: {
    invoiceNumber?: string;
    date?: string;
    dueDate?: string;
    company?: {
      name: string;
      address: string;
      city: string;
      state: string;
      zip: string;
      phone: string;
      email: string;
      logo?: string;
    };
    customer?: {
      id?: string;
      name: string;
      address: string;
      city: string;
      state: string;
      zip: string;
      phone: string;
      email: string;
    };
    items?: Array<{
      id?: string;
      description?: string;
      quantity?: number;
      rate?: number;
      amount?: number;
    }>;
    taxRate?: number;
    discount?: number;
    notes?: string;
    terms?: string;
  }) => {
    try {
      // Generate invoice number if not provided
      const invoiceNumber = invoiceData.invoiceNumber || `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

      // Calculate totals
      const items = invoiceData.items || [];
      const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
      const discountAmount = (subtotal * (invoiceData.discount || 0)) / 100;
      const taxableAmount = subtotal - discountAmount;
      const taxAmount = (taxableAmount * (invoiceData.taxRate || 0)) / 100;
      const total = taxableAmount + taxAmount;

      // Prepare customer address
      const customer = invoiceData.customer;
      const customerAddress = customer ? 
        `${customer.address}${customer.city ? ', ' + customer.city : ''}${customer.state ? ', ' + customer.state : ''}${customer.zip ? ' ' + customer.zip : ''}`.trim() 
        : '';

      // Prepare the request body
      const requestBody = {
        number: invoiceNumber,
        customerId: customer?.id || undefined,
        customerName: customer?.name || '',
        customerEmail: customer?.email || '',
        customerAddress: customerAddress,
        customerPhone: customer?.phone || '',
        items: items,
        subtotal: subtotal,
        tax: taxAmount,
        discount: discountAmount,
        total: total,
        status: 'draft',
        invoiceType: 'invoice',
        currency: 'USD',
        dueDate: invoiceData.dueDate || '',
        notes: invoiceData.notes || '',
        terms: invoiceData.terms || '',
        bankDetails: undefined,
      };

      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to create invoice');
      }

      const invoice = await response.json();
      setToast({ message: `Invoice ${invoice.number} created successfully!`, type: 'success' });

      // Redirect to the new invoice after a short delay
      setTimeout(() => {
        router.push(`/invoices/${invoice.id}`);
      }, 1000);
    } catch (error) {
      console.error('Failed to save invoice:', error);
      setToast({ message: 'Failed to save invoice', type: 'error' });
    }
  };

  const handlePreview = (invoiceData: {
    invoiceNumber?: string;
    date?: string;
    dueDate?: string;
    company?: {
      name: string;
      address: string;
      city: string;
      state: string;
      zip: string;
      phone: string;
      email: string;
      logo?: string;
    };
    customer?: {
      name: string;
      address: string;
      city: string;
      state: string;
      zip: string;
      phone: string;
      email: string;
    };
    items?: Array<{
      id?: string;
      description?: string;
      quantity?: number;
      rate?: number;
      amount?: number;
    }>;
    taxRate?: number;
    discount?: number;
    notes?: string;
    terms?: string;
  }) => {
    console.log('Preview invoice:', invoiceData);
    setIsPreviewMode(true);
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
              Create New Invoice
            </h1>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Build and customize your invoice
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push('/invoices')}
            className="flex items-center gap-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Invoices
          </Button>
        </div>

        {/* Invoice Builder */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
          <InvoiceBuilder
            onSave={handleSave}
            onPreview={handlePreview}
            className="p-6"
          />
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
