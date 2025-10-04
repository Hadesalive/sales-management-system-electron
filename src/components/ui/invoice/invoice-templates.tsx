'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '../core/button';
import { Select } from '../forms/select';
import { Switch } from '../forms/switch';
import { 
  SwatchIcon, 
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

// Import preview components
import {
  ProCorporatePreview,
  ModernStripePreview,
  MinimalOutlinePreview,
  ElegantDarkPreview,
  ClassicColumnPreview
} from './templates';

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

import { allTemplates } from './templates';

const defaultTemplates: InvoiceTemplate[] = allTemplates;

// Preview component mapping
const previewComponents = {
  'pro-corporate': ProCorporatePreview,
  'modern-stripe': ModernStripePreview,
  'minimal-outline': MinimalOutlinePreview,
  'elegant-dark': ElegantDarkPreview,
  'classic-column': ClassicColumnPreview
};

const getPreviewComponent = (templateId: string) => {
  return previewComponents[templateId as keyof typeof previewComponents] || ProCorporatePreview;
};

interface InvoiceTemplatesProps {
  selectedTemplate?: string;
  onTemplateSelect?: (templateId: string) => void;
  onCustomize?: (template: InvoiceTemplate) => void;
  onTemplateUpdate?: (template: InvoiceTemplate) => void;
  currentInvoiceData?: unknown;
  className?: string;
}

export function InvoiceTemplates({ 
  selectedTemplate = 'corporate', 
  onTemplateSelect, 
  onCustomize,
  onTemplateUpdate,
  className = "" 
}: InvoiceTemplatesProps) {
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [customTemplate, setCustomTemplate] = useState<InvoiceTemplate>(defaultTemplates[0]);

  const handleTemplateSelect = (templateId: string) => {
    onTemplateSelect?.(templateId);
    const selectedTemplateData = defaultTemplates.find(t => t.id === templateId) || defaultTemplates[0];
    setCustomTemplate(selectedTemplateData);
    // Trigger live preview update
    if (onTemplateUpdate) {
      onTemplateUpdate(selectedTemplateData);
    }
  };

  const handleCustomize = () => {
    setShowCustomizer(true);
  };

  const handleSaveCustomization = () => {
    onCustomize?.(customTemplate);
    if (onTemplateUpdate) {
      onTemplateUpdate(customTemplate);
    }
    setShowCustomizer(false);
  };

  const handleCancelCustomization = () => {
    setShowCustomizer(false);
  };

  const updateColors = (colorField: string, value: string) => {
    setCustomTemplate(prev => {
      const updated = {
        ...prev,
        colors: {
          ...prev.colors,
          [colorField]: value
        }
      };
      // Trigger live preview update
      if (onTemplateUpdate) {
        onTemplateUpdate(updated);
      }
      return updated;
    });
  };

  const updateLayout = (field: string, value: string | boolean) => {
    setCustomTemplate(prev => {
      const updated = {
        ...prev,
        layout: {
          ...prev.layout,
          [field]: value
        }
      };
      // Trigger live preview update
      if (onTemplateUpdate) {
        onTemplateUpdate(updated);
      }
      return updated;
    });
  };

  const updateFonts = (field: string, value: string) => {
    setCustomTemplate(prev => {
      const updated = {
        ...prev,
        fonts: {
          ...prev.fonts,
          [field]: value
        }
      };
      // Trigger live preview update
      if (onTemplateUpdate) {
        onTemplateUpdate(updated);
      }
      return updated;
    });
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Template Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
          Choose Template
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {defaultTemplates.map((template) => (
            <div
              key={template.id}
              className={cn(
                "relative p-6 border-2 rounded-xl cursor-pointer transition-all hover:shadow-lg",
                selectedTemplate === template.id
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              )}
              onClick={() => handleTemplateSelect(template.id)}
            >
              {selectedTemplate === template.id && (
                <div className="absolute top-3 right-3 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <CheckIcon className="h-5 w-5 text-white" />
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                    {template.name}
                  </h4>
                  <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
                    {template.description}
                  </p>
                </div>
                
                {/* Real Template Preview */}
                <div className="mt-4">
                  <div className="w-full h-32 bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
                    {(() => {
                      const PreviewComponent = getPreviewComponent(template.id);
                      return <PreviewComponent />;
                    })()}
                  </div>
                </div>

                {/* Color Palette */}
                <div className="flex gap-2">
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: template.colors.primary }}
                    title="Primary Color"
                  />
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: template.colors.secondary }}
                    title="Secondary Color"
                  />
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: template.colors.accent }}
                    title="Accent Color"
                  />
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
                  Brand Colors
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                      Primary Color
                    </label>
                    <div className="space-y-2">
                      <input
                        type="color"
                        value={customTemplate.colors.primary}
                        onChange={(e) => updateColors('primary', e.target.value)}
                        className="w-full h-12 border rounded-lg cursor-pointer"
                      />
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        Headers, titles, main elements
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                      Secondary Color
                    </label>
                    <div className="space-y-2">
                      <input
                        type="color"
                        value={customTemplate.colors.secondary}
                        onChange={(e) => updateColors('secondary', e.target.value)}
                        className="w-full h-12 border rounded-lg cursor-pointer"
                      />
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        Subtitles, borders, supporting text
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                      Accent Color
                    </label>
                    <div className="space-y-2">
                      <input
                        type="color"
                        value={customTemplate.colors.accent}
                        onChange={(e) => updateColors('accent', e.target.value)}
                        className="w-full h-12 border rounded-lg cursor-pointer"
                      />
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        Totals, highlights, call-to-actions
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                      Background
                    </label>
                    <div className="space-y-2">
                      <input
                        type="color"
                        value={customTemplate.colors.background}
                        onChange={(e) => updateColors('background', e.target.value)}
                        className="w-full h-12 border rounded-lg cursor-pointer"
                      />
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        Document background color
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Layout Section */}
              <div>
                <h3 className="text-lg font-medium mb-4" style={{ color: 'var(--foreground)' }}>
                  Layout & Structure
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
                        { value: 'minimal', label: 'Minimal - Clean and simple' },
                        { value: 'classic', label: 'Classic - Traditional business' },
                        { value: 'modern', label: 'Modern - Contemporary design' }
                      ]}
                    />
                    <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                      Controls header layout and styling
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                      Item Table Style
                    </label>
                    <Select
                      value={customTemplate.layout.itemTableStyle}
                      onChange={(e) => updateLayout('itemTableStyle', e.target.value)}
                      options={[
                        { value: 'simple', label: 'Simple - Basic table' },
                        { value: 'detailed', label: 'Detailed - Full borders' },
                        { value: 'modern', label: 'Modern - Rounded corners' }
                      ]}
                    />
                    <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                      Controls invoice items table design
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <h4 className="text-md font-medium" style={{ color: 'var(--foreground)' }}>
                    Display Options
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 border rounded-lg" style={{ borderColor: 'var(--border)' }}>
                      <Switch
                        checked={customTemplate.layout.showLogo}
                        onChange={(e) => updateLayout('showLogo', e.target.checked)}
                      />
                      <div>
                        <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                          Show Company Logo
                        </span>
                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                          Display logo in header area
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 border rounded-lg" style={{ borderColor: 'var(--border)' }}>
                      <Switch
                        checked={customTemplate.layout.showBorder}
                        onChange={(e) => updateLayout('showBorder', e.target.checked)}
                      />
                      <div>
                        <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                          Show Borders
                        </span>
                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                          Add decorative borders
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Typography Section */}
              <div>
                <h3 className="text-lg font-medium mb-4" style={{ color: 'var(--foreground)' }}>
                  Typography
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                      Font Size
                    </label>
                    <Select
                      value={customTemplate.fonts.size}
                      onChange={(e) => updateFonts('size', e.target.value)}
                      options={[
                        { value: 'small', label: 'Small (12px) - Compact' },
                        { value: 'medium', label: 'Medium (14px) - Standard' },
                        { value: 'large', label: 'Large (16px) - Readable' }
                      ]}
                    />
                    <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                      Overall document font size
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                      Font Family
                    </label>
                    <Select
                      value={customTemplate.fonts.primary}
                      onChange={(e) => updateFonts('primary', e.target.value)}
                      options={[
                        { value: 'Inter', label: 'Inter - Modern & Clean' },
                        { value: 'Helvetica', label: 'Helvetica - Classic' },
                        { value: 'Georgia', label: 'Georgia - Serif' },
                        { value: 'Monaco', label: 'Monaco - Monospace' }
                      ]}
                    />
                    <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                      Primary font family for text
                    </p>
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
