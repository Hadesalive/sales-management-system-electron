'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '../core/button';
import { Input } from '../forms/input';
import { Select } from '../forms/select';
import { Switch } from '../forms/switch';
import { 
  SwatchIcon, 
  EyeIcon, 
  DocumentIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export interface InvoiceTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  layout: {
    headerStyle: 'minimal' | 'classic' | 'modern';
    showLogo: boolean;
    showBorder: boolean;
    itemTableStyle: 'simple' | 'detailed' | 'modern';
    footerStyle: 'minimal' | 'detailed';
  };
  fonts: {
    primary: string;
    secondary: string;
    size: 'small' | 'medium' | 'large';
  };
}

const defaultTemplates: InvoiceTemplate[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional business invoice design',
    preview: 'classic-preview',
    colors: {
      primary: '#2563eb',
      secondary: '#64748b',
      accent: '#059669',
      background: '#ffffff',
      text: '#1f2937'
    },
    layout: {
      headerStyle: 'classic',
      showLogo: true,
      showBorder: true,
      itemTableStyle: 'detailed',
      footerStyle: 'detailed'
    },
    fonts: {
      primary: 'Inter',
      secondary: 'Inter',
      size: 'medium'
    }
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean and contemporary design',
    preview: 'modern-preview',
    colors: {
      primary: '#7c3aed',
      secondary: '#6b7280',
      accent: '#dc2626',
      background: '#ffffff',
      text: '#111827'
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
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Simple and clean design',
    preview: 'minimal-preview',
    colors: {
      primary: '#374151',
      secondary: '#9ca3af',
      accent: '#059669',
      background: '#ffffff',
      text: '#111827'
    },
    layout: {
      headerStyle: 'minimal',
      showLogo: false,
      showBorder: false,
      itemTableStyle: 'simple',
      footerStyle: 'minimal'
    },
    fonts: {
      primary: 'Inter',
      secondary: 'Inter',
      size: 'small'
    }
  }
];

interface InvoiceTemplatesProps {
  selectedTemplate: string;
  onTemplateSelect: (templateId: string) => void;
  onCustomize: (template: InvoiceTemplate) => void;
  className?: string;
}

export function InvoiceTemplates({ 
  selectedTemplate, 
  onTemplateSelect, 
  onCustomize,
  className = "" 
}: InvoiceTemplatesProps) {
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [customTemplate, setCustomTemplate] = useState<InvoiceTemplate>(defaultTemplates[0]);

  const handleTemplateSelect = (templateId: string) => {
    onTemplateSelect(templateId);
    setCustomTemplate(defaultTemplates.find(t => t.id === templateId) || defaultTemplates[0]);
  };

  const handleCustomize = () => {
    setShowCustomizer(true);
  };

  const handleSaveCustomization = () => {
    onCustomize(customTemplate);
    setShowCustomizer(false);
  };

  const handleCancelCustomization = () => {
    setShowCustomizer(false);
  };

  const updateTemplateField = (field: string, value: any) => {
    setCustomTemplate(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateColors = (colorField: string, value: string) => {
    setCustomTemplate(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorField]: value
      }
    }));
  };

  const updateLayout = (field: string, value: any) => {
    setCustomTemplate(prev => ({
      ...prev,
      layout: {
        ...prev.layout,
        [field]: value
      }
    }));
  };

  const updateFonts = (field: string, value: any) => {
    setCustomTemplate(prev => ({
      ...prev,
      fonts: {
        ...prev.fonts,
        [field]: value
      }
    }));
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Template Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
          Choose Template
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {defaultTemplates.map((template) => (
            <div
              key={template.id}
              className={cn(
                "relative p-4 border-2 rounded-lg cursor-pointer transition-all",
                selectedTemplate === template.id
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              )}
              onClick={() => handleTemplateSelect(template.id)}
            >
              {selectedTemplate === template.id && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <CheckIcon className="h-4 w-4 text-white" />
                </div>
              )}
              
              <div className="space-y-2">
                <h4 className="font-medium" style={{ color: 'var(--foreground)' }}>
                  {template.name}
                </h4>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  {template.description}
                </p>
                
                {/* Template Preview */}
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded border">
                  <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Preview
                  </div>
                  <div 
                    className="h-16 rounded border"
                    style={{ 
                      backgroundColor: template.colors.background,
                      borderColor: template.colors.primary 
                    }}
                  >
                    <div className="p-2 space-y-1">
                      <div 
                        className="h-2 rounded"
                        style={{ backgroundColor: template.colors.primary, width: '60%' }}
                      />
                      <div 
                        className="h-1 rounded"
                        style={{ backgroundColor: template.colors.secondary, width: '40%' }}
                      />
                      <div 
                        className="h-1 rounded"
                        style={{ backgroundColor: template.colors.accent, width: '30%' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Customize Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleCustomize}
          variant="outline"
          className="flex items-center gap-2"
        >
          <SwatchIcon className="h-4 w-4" />
          Customize Template
        </Button>
      </div>

      {/* Template Customizer Modal */}
      {showCustomizer && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/20 dark:bg-black/20 flex items-center justify-center p-4 z-50">
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: 'var(--card)' }}
          >
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
                Customize Template
              </h2>
              <Button
                variant="ghost"
                onClick={handleCancelCustomization}
                className="p-2"
              >
                <XMarkIcon className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6 space-y-8">
              {/* Colors Section */}
              <div>
                <h3 className="text-lg font-medium mb-4" style={{ color: 'var(--foreground)' }}>
                  Colors
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                      Primary Color
                    </label>
                    <input
                      type="color"
                      value={customTemplate.colors.primary}
                      onChange={(e) => updateColors('primary', e.target.value)}
                      className="w-full h-10 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                      Secondary Color
                    </label>
                    <input
                      type="color"
                      value={customTemplate.colors.secondary}
                      onChange={(e) => updateColors('secondary', e.target.value)}
                      className="w-full h-10 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                      Accent Color
                    </label>
                    <input
                      type="color"
                      value={customTemplate.colors.accent}
                      onChange={(e) => updateColors('accent', e.target.value)}
                      className="w-full h-10 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                      Background
                    </label>
                    <input
                      type="color"
                      value={customTemplate.colors.background}
                      onChange={(e) => updateColors('background', e.target.value)}
                      className="w-full h-10 border rounded"
                    />
                  </div>
                </div>
              </div>

              {/* Layout Section */}
              <div>
                <h3 className="text-lg font-medium mb-4" style={{ color: 'var(--foreground)' }}>
                  Layout Options
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                      Header Style
                    </label>
                    <Select
                      value={customTemplate.layout.headerStyle}
                      onChange={(e) => updateLayout('headerStyle', e.target.value)}
                      options={[
                        { value: 'minimal', label: 'Minimal' },
                        { value: 'classic', label: 'Classic' },
                        { value: 'modern', label: 'Modern' }
                      ]}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                      Item Table Style
                    </label>
                    <Select
                      value={customTemplate.layout.itemTableStyle}
                      onChange={(e) => updateLayout('itemTableStyle', e.target.value)}
                      options={[
                        { value: 'simple', label: 'Simple' },
                        { value: 'detailed', label: 'Detailed' },
                        { value: 'modern', label: 'Modern' }
                      ]}
                    />
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={customTemplate.layout.showLogo}
                      onChange={(e) => updateLayout('showLogo', e.target.checked)}
                    />
                    <span className="text-sm" style={{ color: 'var(--foreground)' }}>
                      Show Company Logo
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={customTemplate.layout.showBorder}
                      onChange={(e) => updateLayout('showBorder', e.target.checked)}
                    />
                    <span className="text-sm" style={{ color: 'var(--foreground)' }}>
                      Show Border
                    </span>
                  </div>
                </div>
              </div>

              {/* Fonts Section */}
              <div>
                <h3 className="text-lg font-medium mb-4" style={{ color: 'var(--foreground)' }}>
                  Typography
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                      Font Size
                    </label>
                    <Select
                      value={customTemplate.fonts.size}
                      onChange={(e) => updateFonts('size', e.target.value)}
                      options={[
                        { value: 'small', label: 'Small' },
                        { value: 'medium', label: 'Medium' },
                        { value: 'large', label: 'Large' }
                      ]}
                    />
                  </div>
                </div>
              </div>

              {/* Preview Section */}
              <div>
                <h3 className="text-lg font-medium mb-4" style={{ color: 'var(--foreground)' }}>
                  Preview
                </h3>
                <div 
                  className="p-6 border rounded-lg"
                  style={{ 
                    backgroundColor: customTemplate.colors.background,
                    borderColor: customTemplate.colors.primary 
                  }}
                >
                  <div className="space-y-4">
                    {/* Header Preview */}
                    <div className="text-center">
                      <h1 
                        className="text-2xl font-bold"
                        style={{ color: customTemplate.colors.primary }}
                      >
                        INVOICE
                      </h1>
                      <p 
                        className="text-sm"
                        style={{ color: customTemplate.colors.secondary }}
                      >
                        #INV-2024-001
                      </p>
                    </div>

                    {/* Sample Content */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p style={{ color: customTemplate.colors.text }}>
                          <strong>From:</strong> Your Company
                        </p>
                      </div>
                      <div>
                        <p style={{ color: customTemplate.colors.text }}>
                          <strong>To:</strong> Customer Name
                        </p>
                      </div>
                    </div>

                    {/* Table Preview */}
                    <div className="border rounded" style={{ borderColor: customTemplate.colors.primary }}>
                      <table className="w-full text-sm">
                        <thead>
                          <tr 
                            className="text-left"
                            style={{ backgroundColor: customTemplate.colors.primary, color: 'white' }}
                          >
                            <th className="p-2">Item</th>
                            <th className="p-2">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="p-2" style={{ color: customTemplate.colors.text }}>
                              Sample Item
                            </td>
                            <td className="p-2" style={{ color: customTemplate.colors.accent }}>
                              $100.00
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t" style={{ borderColor: 'var(--border)' }}>
              <Button
                variant="outline"
                onClick={handleCancelCustomization}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveCustomization}
                className="flex items-center gap-2"
              >
                <CheckIcon className="h-4 w-4" />
                Apply Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
