'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layouts/app-layout';
import { Button, Toast } from '@/components/ui/core';
import { InvoiceTemplates } from '@/components/ui/invoice/invoice-templates';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function InvoiceTemplatesPage() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    setToast({ message: `Template "${templateId}" selected`, type: 'success' });
  };

  const handleCustomize = (template: any) => {
    console.log('Customizing template:', template);
    setToast({ message: 'Template customized successfully!', type: 'success' });
  };

  const handleSaveTemplate = () => {
    // In a real app, this would save the template to the backend
    setToast({ message: 'Template saved successfully!', type: 'success' });
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
              Invoice Templates
            </h1>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Choose and customize your invoice templates
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleSaveTemplate}
              className="flex items-center gap-2"
            >
              Save Template
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/invoices')}
              className="flex items-center gap-2"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Invoices
            </Button>
          </div>
        </div>

        {/* Template Selection and Customization */}
        <div 
          className="p-6 rounded-lg border"
          style={{ 
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)'
          }}
        >
          <InvoiceTemplates
            selectedTemplate={selectedTemplate}
            onTemplateSelect={handleTemplateSelect}
            onCustomize={handleCustomize}
          />
        </div>

        {/* Template Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            className="p-6 rounded-lg border"
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
            className="p-6 rounded-lg border"
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
            className="p-6 rounded-lg border"
            style={{ 
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)'
            }}
          >
            <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
              ⚡ Easy Management
            </h3>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
              <li>• Save custom templates</li>
              <li>• Quick template switching</li>
              <li>• Live preview updates</li>
              <li>• Template sharing</li>
            </ul>
          </div>
        </div>

        {/* Usage Instructions */}
        <div 
          className="p-6 rounded-lg border"
          style={{ 
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)'
          }}
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
            How to Use Templates
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                1. Choose a Template
              </h4>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Select from our pre-designed templates: Classic, Modern, or Minimal. Each template is optimized for different business needs and branding styles.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                2. Customize Design
              </h4>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Use the customization panel to adjust colors, fonts, layout options, and branding elements to match your company's visual identity.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                3. Preview Changes
              </h4>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                See your changes in real-time with the live preview. Make adjustments until you're satisfied with the design.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                4. Save & Apply
              </h4>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Save your custom template and apply it to new invoices. Your template will be available for all future invoice creation.
              </p>
            </div>
          </div>
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
