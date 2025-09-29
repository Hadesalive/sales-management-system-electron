'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layouts/app-layout';
import { Button, Toast } from '@/components/ui/core';
import { InvoiceBuilder } from '@/components/ui/invoice';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

// Mock invoice data - in real app, this would come from a service
const mockInvoiceData = {
  invoiceNumber: 'INV-2024-001',
  date: '2024-01-15',
  dueDate: '2024-02-15',
  company: {
    name: "TopNotch Electronics",
    address: "123 Business St",
    city: "San Francisco",
    state: "CA",
    zip: "94105",
    phone: "+1 (555) 123-4567",
    email: "info@topnotch.com",
    logo: ""
  },
  customer: {
    name: "Acme Corporation",
    address: "123 Business Ave, Suite 100",
    city: "San Francisco",
    state: "CA",
    zip: "94105",
    phone: "+1 (555) 987-6543",
    email: "billing@acme.com"
  },
  items: [
    {
      id: "1",
      description: "Website Development",
      quantity: 1,
      rate: 2000,
      amount: 2000
    },
    {
      id: "2",
      description: "SEO Optimization",
      quantity: 1,
      rate: 500,
      amount: 500
    }
  ],
  notes: "Thank you for your business!",
  terms: "Payment due within 30 days of invoice date.",
  taxRate: 8.5,
  discount: 0
};

export default function EditInvoicePage() {
  const params = useParams();
  const router = useRouter();
  
  const invoiceId = params.id as string;
  const [invoiceData, setInvoiceData] = useState(mockInvoiceData);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const loadInvoiceData = useCallback(async () => {
    try {
      setLoading(true);
      // In a real app, this would call an API to load the invoice data
      // const response = await invoiceService.getInvoiceById(invoiceId);
      // setInvoiceData(response.data);
      
      // For now, use mock data
      setInvoiceData(mockInvoiceData);
    } catch (error) {
      console.error('Failed to load invoice:', error);
      setToast({ message: 'Failed to load invoice data', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => {
    loadInvoiceData();
  }, [loadInvoiceData]);

  const handleSave = async (updatedInvoiceData: any) => {
    try {
      setSaving(true);
      
      // In a real app, this would call an API to update the invoice
      console.log('Updating invoice:', invoiceId, updatedInvoiceData);
      
      setToast({ message: 'Invoice updated successfully!', type: 'success' });
      
      // Redirect to invoice details after a short delay
      setTimeout(() => {
        router.push(`/invoices/${invoiceId}`);
      }, 1000);
    } catch (error) {
      console.error('Failed to update invoice:', error);
      setToast({ message: 'Failed to update invoice', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = (invoiceData: any) => {
    console.log('Preview invoice:', invoiceData);
    setToast({ message: 'Invoice preview updated', type: 'success' });
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
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
              Edit Invoice {invoiceData.invoiceNumber}
            </h1>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Modify invoice details and items
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push(`/invoices/${invoiceId}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Invoice
          </Button>
        </div>

        {/* Invoice Builder */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
          <InvoiceBuilder
            initialData={invoiceData}
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
