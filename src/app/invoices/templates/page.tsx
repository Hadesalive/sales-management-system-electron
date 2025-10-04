'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layouts/app-layout';
import { Button, Toast } from '@/components/ui/core';
import { InvoiceTemplates, InvoiceTemplate } from '@/components/ui/invoice/invoice-templates';
import { DynamicInvoicePreview } from '@/components/ui/invoice/dynamic-invoice-preview';
import { allTemplates } from '@/components/ui/invoice/templates';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, EyeIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon } from '@heroicons/react/24/outline';

export default function InvoiceTemplatesPage() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState('pro-corporate');
  const [currentTemplate, setCurrentTemplate] = useState<InvoiceTemplate | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  // Get default template for selected template
  const getDefaultTemplate = (templateId: string): InvoiceTemplate => {
    const template = allTemplates.find(t => t.id === templateId);
    return template || allTemplates[0]; // Fallback to first template if not found
  };

  // Initialize current template when selected template changes
  useEffect(() => {
    setCurrentTemplate(getDefaultTemplate(selectedTemplate));
  }, [selectedTemplate]);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    setToast({ message: `Template "${templateId}" selected`, type: 'success' });
  };

  const handleCustomize = (template: InvoiceTemplate) => {
    setCurrentTemplate(template);
    setToast({ message: 'Template customized successfully!', type: 'success' });
  };

  const handleTemplateUpdate = (template: InvoiceTemplate) => {
    setCurrentTemplate(template);
    // No toast for live updates to avoid spam
  };

  const handleSaveTemplate = () => {
    // In a real app, this would save the template to the backend
    setToast({ message: 'Template saved successfully!', type: 'success' });
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  // Mock invoice data for preview
  const mockInvoiceData = {
    invoiceNumber: 'INV-2024-001',
    date: '2024-01-15',
    dueDate: '2024-02-15',
    company: {
      name: 'Your Company Name',
      address: '123 Business Street',
      city: 'San Francisco',
      state: 'CA',
      zip: '94105',
      phone: '+1 (555) 123-4567',
      email: 'info@yourcompany.com'
    },
    customer: {
      name: 'Customer Name',
      address: '456 Customer Avenue',
      city: 'Los Angeles',
      state: 'CA',
      zip: '90210',
      phone: '+1 (555) 987-6543',
      email: 'customer@example.com'
    },
    items: [
      {
        id: '1',
        description: 'Professional Web Design',
        quantity: 1,
        rate: 2500,
        amount: 2500
      },
      {
        id: '2',
        description: 'SEO Optimization',
        quantity: 1,
        rate: 800,
        amount: 800
      },
      {
        id: '3',
        description: 'Content Management System',
        quantity: 1,
        rate: 1200,
        amount: 1200
      }
    ],
    notes: 'Thank you for your business! We appreciate the opportunity to work with you.',
    terms: 'Payment is due within 30 days of invoice date. Late payments may incur additional fees.',
    taxRate: 8.5,
    discount: 0
  };

  return (
    <AppLayout>
      <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900' : 'max-w-7xl mx-auto'} space-y-6 p-4`}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
              Invoice Templates
            </h1>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Choose and customize your invoice templates with live preview
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={togglePreview}
              className="flex items-center gap-2"
            >
              <EyeIcon className="h-4 w-4" />
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              className="flex items-center gap-2"
            >
              {isFullscreen ? (
                <>
                  <ArrowsPointingInIcon className="h-4 w-4" />
                  Exit Fullscreen
                </>
              ) : (
                <>
                  <ArrowsPointingOutIcon className="h-4 w-4" />
                  Fullscreen
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveTemplate}
              className="flex items-center gap-2"
            >
              Save Template
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/invoices')}
              className="flex items-center gap-2"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className={`grid gap-6 ${showPreview ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'}`}>
          {/* Template Selection */}
          <div 
            className="p-4 sm:p-6 rounded-lg border"
            style={{ 
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)'
            }}
          >
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
              Template Selection & Customization
            </h2>
            <InvoiceTemplates
              selectedTemplate={selectedTemplate}
              onTemplateSelect={handleTemplateSelect}
              onCustomize={handleCustomize}
              onTemplateUpdate={handleTemplateUpdate}
              currentInvoiceData={mockInvoiceData}
            />
          </div>

          {/* Live Preview */}
          {showPreview && (
            <div 
              className="p-4 sm:p-6 rounded-lg border"
              style={{ 
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                  Live Preview
                </h2>
                <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  A4 Size Preview
                </div>
              </div>
              
              {currentTemplate ? (
                <div className="relative">
                  {/* A4 Preview Container */}
                  <div 
                    className="mx-auto bg-white shadow-lg overflow-auto border border-gray-200"
                    style={{
                      width: '100%',
                      maxWidth: '210mm', // A4 width
                      aspectRatio: '210/297', // A4 ratio
                      maxHeight: isFullscreen ? 'calc(100vh - 200px)' : '80vh'
                    }}
                  >
                    <DynamicInvoicePreview
                      data={mockInvoiceData}
                      template={currentTemplate}
                      brandLogos={[]}
                      className=""
                    />
                  </div>
                  
                  {/* Preview Controls */}
                  <div className="flex items-center justify-between mt-4 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    <span>Template: {currentTemplate.name}</span>
                    <span>Changes update live as you customize</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <p className="text-muted-foreground">Select a template to see live preview</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Template Features - Only show when not in fullscreen */}
        {!isFullscreen && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div 
              className="p-4 rounded-lg border"
              style={{ 
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)'
              }}
            >
              <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
                🎨 Design Customization
              </h3>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                <li>• Custom colors and branding</li>
                <li>• Multiple layout options</li>
                <li>• Typography settings</li>
                <li>• Logo and header styles</li>
              </ul>
            </div>

            <div 
              className="p-4 rounded-lg border"
              style={{ 
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)'
              }}
            >
              <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
                📄 Professional Output
              </h3>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                <li>• High-quality PDF generation</li>
                <li>• Print-ready formats</li>
                <li>• Email-friendly templates</li>
                <li>• Brand consistency</li>
              </ul>
            </div>

            <div 
              className="p-4 rounded-lg border"
              style={{ 
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)'
              }}
            >
              <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
                ⚡ Live Preview
              </h3>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                <li>• Real-time template updates</li>
                <li>• A4 size preview</li>
                <li>• Fullscreen mode</li>
                <li>• Responsive design</li>
              </ul>
            </div>
          </div>
        )}

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
