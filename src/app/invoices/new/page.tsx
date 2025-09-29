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
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const handleSave = async (invoiceData: any) => {
    try {
      // In a real app, this would call an API to save the invoice
      console.log('Saving invoice:', invoiceData);
      
      setToast({ message: 'Invoice saved successfully!', type: 'success' });
      
      // Redirect to invoices list after a short delay
      setTimeout(() => {
        router.push('/invoices');
      }, 1000);
    } catch (error) {
      console.error('Failed to save invoice:', error);
      setToast({ message: 'Failed to save invoice', type: 'error' });
    }
  };

  const handlePreview = (invoiceData: any) => {
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
