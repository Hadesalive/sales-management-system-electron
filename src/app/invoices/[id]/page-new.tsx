'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layouts/app-layout';
import { Button, Toast } from '@/components/ui/core';
import { KPICard } from '@/components/ui/dashboard';
import { Input, Textarea } from '@/components/ui/forms';
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
  SwatchIcon,
  PhotoIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  PlusIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

// Mock invoice data - in real app, this would come from a service
const mockInvoice = {
  id: 'inv_001',
  number: 'INV-2024-001',
  customerName: 'Acme Corporation',
  customerEmail: 'billing@acme.com',
  customerAddress: '123 Business Ave, Suite 100, San Francisco, CA 94105',
  issueDate: '2024-01-15',
  dueDate: '2024-02-15',
  status: 'pending' as 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled',
  type: 'standard' as 'standard' | 'proforma' | 'credit_note' | 'debit_note' | 'recurring' | 'quote',
  subtotal: 2500,
  tax: 212.5,
  discount: 0,
  total: 2712.5,
  paid: 0,
  balance: 2712.5,
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
  terms: "Payment due within 30 days of invoice date."
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
  
  // Editable header/footer state
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [isEditingFooter, setIsEditingFooter] = useState(false);
  const [companyLogo, setCompanyLogo] = useState<string>('');
  const [brandLogos, setBrandLogos] = useState<string[]>([]);
  
  // Editable company info
  const [companyInfo, setCompanyInfo] = useState({
    name: "TopNotch Electronics",
    address: "123 Business St",
    city: "San Francisco",
    state: "CA",
    zip: "94105",
    phone: "+1 (555) 123-4567",
    email: "info@topnotch.com",
    website: "www.topnotch.com"
  });
  
  // Editable footer content
  const [footerContent, setFooterContent] = useState({
    thankYouMessage: "Thank you for your business!",
    termsAndConditions: "Payment due within 30 days of invoice date.",
    socialMedia: {
      twitter: "@topnotch",
      linkedin: "linkedin.com/company/topnotch"
    }
  });

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
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const handleDeleteInvoice = () => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      setToast({ message: 'Invoice deleted successfully', type: 'success' });
      setTimeout(() => router.push('/invoices'), 1000);
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleDownloadInvoice = () => {
    setToast({ message: 'Downloading invoice... (Feature not fully implemented)', type: 'success' });
  };

  const handleShareInvoice = () => {
    setToast({ message: 'Invoice sharing feature coming soon', type: 'success' });
  };

  // Logo handling functions
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCompanyLogo(result);
        setToast({ message: 'Company logo uploaded successfully!', type: 'success' });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBrandLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setBrandLogos(prev => [...prev, result]);
        setToast({ message: 'Brand logo added successfully!', type: 'success' });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBrandLogo = (index: number) => {
    setBrandLogos(prev => prev.filter((_, i) => i !== index));
    setToast({ message: 'Brand logo removed', type: 'success' });
  };

  const saveHeaderChanges = () => {
    setIsEditingHeader(false);
    setToast({ message: 'Header information saved successfully!', type: 'success' });
  };

  const saveFooterChanges = () => {
    setIsEditingFooter(false);
    setToast({ message: 'Footer information saved successfully!', type: 'success' });
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading invoice details...</p>
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
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/invoices')}
              className="p-2"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                Invoice Details
              </h1>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                View and manage invoice information
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/invoices/${invoice.id}/edit`)}
              className="flex items-center gap-2"
            >
              <PencilIcon className="h-4 w-4" />
              Edit Invoice
            </Button>
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
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <KPICard
            title="Invoice Total"
            value={formatCurrency(invoice.total)}
            icon={<CurrencyDollarIcon className="h-6 w-6" style={{ color: 'var(--accent)' }} />}
          />
          <KPICard
            title="Status"
            value={invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            icon={getStatusIcon(invoice.status)}
          />
          <KPICard
            title="Issue Date"
            value={formatDate(invoice.issueDate)}
            icon={<CalendarIcon className="h-6 w-6" style={{ color: 'var(--accent)' }} />}
          />
          <KPICard
            title="Due Date"
            value={formatDate(invoice.dueDate)}
            icon={<ClockIcon className="h-6 w-6" style={{ color: 'var(--accent)' }} />}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Invoice Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Invoice Header Editor */}
            <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                  Company Header
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingHeader(!isEditingHeader)}
                  className="flex items-center gap-2"
                >
                  <PencilIcon className="h-4 w-4" />
                  {isEditingHeader ? 'Cancel' : 'Edit'}
                </Button>
              </div>

              {isEditingHeader ? (
                <div className="space-y-4">
                  {/* Logo Upload */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                      Company Logo
                    </label>
                    <div className="flex items-center gap-4">
                      {companyLogo && (
                        <img src={companyLogo} alt="Company Logo" className="h-12 w-12 object-contain rounded" />
                      )}
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                          <PhotoIcon className="h-4 w-4" />
                          {companyLogo ? 'Change Logo' : 'Upload Logo'}
                        </Button>
                      </label>
                    </div>
                  </div>

                  {/* Company Information */}
                  <Input
                    label="Company Name"
                    value={companyInfo.name}
                    onChange={(e) => setCompanyInfo(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <Input
                    label="Address"
                    value={companyInfo.address}
                    onChange={(e) => setCompanyInfo(prev => ({ ...prev, address: e.target.value }))}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="City"
                      value={companyInfo.city}
                      onChange={(e) => setCompanyInfo(prev => ({ ...prev, city: e.target.value }))}
                    />
                    <Input
                      label="State"
                      value={companyInfo.state}
                      onChange={(e) => setCompanyInfo(prev => ({ ...prev, state: e.target.value }))}
                    />
                  </div>
                  <Input
                    label="ZIP Code"
                    value={companyInfo.zip}
                    onChange={(e) => setCompanyInfo(prev => ({ ...prev, zip: e.target.value }))}
                  />
                  <Input
                    label="Phone"
                    value={companyInfo.phone}
                    onChange={(e) => setCompanyInfo(prev => ({ ...prev, phone: e.target.value }))}
                  />
                  <Input
                    label="Email"
                    value={companyInfo.email}
                    onChange={(e) => setCompanyInfo(prev => ({ ...prev, email: e.target.value }))}
                  />
                  <Input
                    label="Website"
                    value={companyInfo.website}
                    onChange={(e) => setCompanyInfo(prev => ({ ...prev, website: e.target.value }))}
                  />

                  <div className="flex gap-2 pt-4">
                    <Button onClick={saveHeaderChanges} className="flex items-center gap-2">
                      <CheckIcon className="h-4 w-4" />
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditingHeader(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {companyLogo && (
                      <img src={companyLogo} alt="Company Logo" className="h-10 w-10 object-contain rounded" />
                    )}
                    <div>
                      <h4 className="font-medium" style={{ color: 'var(--foreground)' }}>
                        {companyInfo.name}
                      </h4>
                      <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        {companyInfo.address}, {companyInfo.city}, {companyInfo.state} {companyInfo.zip}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="h-4 w-4" />
                      {companyInfo.phone}
                    </div>
                    <div className="flex items-center gap-2">
                      <EnvelopeIcon className="h-4 w-4" />
                      {companyInfo.email}
                    </div>
                    <div className="flex items-center gap-2">
                      <BuildingOfficeIcon className="h-4 w-4" />
                      {companyInfo.website}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Invoice Footer Editor */}
            <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                  Footer Content
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingFooter(!isEditingFooter)}
                  className="flex items-center gap-2"
                >
                  <PencilIcon className="h-4 w-4" />
                  {isEditingFooter ? 'Cancel' : 'Edit'}
                </Button>
              </div>

              {isEditingFooter ? (
                <div className="space-y-4">
                  <Textarea
                    label="Thank You Message"
                    value={footerContent.thankYouMessage}
                    onChange={(e) => setFooterContent(prev => ({ ...prev, thankYouMessage: e.target.value }))}
                    rows={2}
                  />
                  <Textarea
                    label="Terms & Conditions"
                    value={footerContent.termsAndConditions}
                    onChange={(e) => setFooterContent(prev => ({ ...prev, termsAndConditions: e.target.value }))}
                    rows={2}
                  />
                  
                  {/* Brand Logos */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                      Brand Logos
                    </label>
                    <div className="space-y-3">
                      {brandLogos.map((logo, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 border rounded" style={{ borderColor: 'var(--border)' }}>
                          <img src={logo} alt={`Brand ${index + 1}`} className="h-8 w-8 object-contain" />
                          <span className="flex-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                            Brand Logo {index + 1}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeBrandLogo(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleBrandLogoUpload}
                          className="hidden"
                        />
                        <Button variant="outline" size="sm" className="flex items-center gap-2 w-full">
                          <PlusIcon className="h-4 w-4" />
                          Add Brand Logo
                        </Button>
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={saveFooterChanges} className="flex items-center gap-2">
                      <CheckIcon className="h-4 w-4" />
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditingFooter(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                      Thank You Message
                    </p>
                    <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                      {footerContent.thankYouMessage}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                      Terms & Conditions
                    </p>
                    <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                      {footerContent.termsAndConditions}
                    </p>
                  </div>
                  {brandLogos.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                        Partner Brands
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {brandLogos.map((logo, index) => (
                          <img key={index} src={logo} alt={`Brand ${index + 1}`} className="h-6 w-6 object-contain" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Invoice Preview */}
          <div className="lg:col-span-2">
            <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              {/* View Mode Toggle */}
              <div className="flex items-center justify-between mb-6">
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

                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value as 'classic' | 'modern' | 'minimal')}
                  className="px-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm"
                >
                  <option value="classic">Classic Template</option>
                  <option value="modern">Modern Template</option>
                  <option value="minimal">Minimal Template</option>
                </select>
              </div>

              {/* Invoice/Receipt Preview */}
              {viewMode === 'invoice' ? (
                <InvoicePreview
                  data={{
                    invoiceNumber: invoice.number,
                    date: invoice.issueDate,
                    dueDate: invoice.dueDate,
                    company: {
                      name: companyInfo.name,
                      address: `${companyInfo.address}, ${companyInfo.city}, ${companyInfo.state} ${companyInfo.zip}`,
                      city: companyInfo.city,
                      state: companyInfo.state,
                      zip: companyInfo.zip,
                      phone: companyInfo.phone,
                      email: companyInfo.email,
                      logo: companyLogo
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
                    notes: footerContent.thankYouMessage,
                    terms: footerContent.termsAndConditions,
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
                      name: companyInfo.name,
                      address: `${companyInfo.address}, ${companyInfo.city}, ${companyInfo.state} ${companyInfo.zip}`,
                      city: companyInfo.city,
                      state: companyInfo.state,
                      zip: companyInfo.zip,
                      phone: companyInfo.phone,
                      email: companyInfo.email,
                      logo: companyLogo
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
