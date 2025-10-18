import React from "react";
import { useState, useEffect } from "react";
// import NextImage from "next/image"; // Removed - using regular img tag instead
import { cn } from "@/lib/utils";
import { Button } from "../core/button";
import { Input } from "../forms/input";
import { Textarea } from "../forms/textarea";
import { FormCard } from "../forms/form-card";
import { FormActions } from "../forms/form-actions";
import { Tabs } from "../core/tabs";
import { PlusIcon, TrashIcon, CheckIcon, PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useSettings } from '@/contexts/SettingsContext';
import { ConfirmationDialog } from '../dialogs/confirmation-dialog';
import { useConfirmation } from '@/lib/hooks/useConfirmation';
import { customerService, productService } from '@/lib/services';
import { Customer, Product, InvoiceItem } from '@/lib/types/core';

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  company: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
    email: string;
    logo?: string;
  };
  customer: {
    id?: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
    email: string;
  };
  items: InvoiceItem[];
  notes: string;
  terms: string;
  taxRate: number;
  discount: number;
}

interface InvoiceBuilderProps {
  initialData?: Partial<InvoiceData>;
  onSave?: (data: InvoiceData) => void;
  onPreview?: (data: InvoiceData) => void;
  className?: string;
}

export function InvoiceBuilder({ 
  initialData, 
  onSave, 
  onPreview, 
  className = "" 
}: InvoiceBuilderProps) {
  const { companySettings, formatCurrency, generateInvoiceNumber } = useSettings();
  const { isOpen, options, confirm, handleConfirm, handleClose } = useConfirmation();
  
  // Customer and Product state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber: initialData?.invoiceNumber || generateInvoiceNumber(),
    date: initialData?.date || new Date().toISOString().split('T')[0],
    dueDate: initialData?.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    company: {
      name: initialData?.company?.name || companySettings.companyName || "TopNotch Electronics",
      address: initialData?.company?.address || companySettings.address || "123 Business St",
      city: initialData?.company?.city || "San Francisco",
      state: initialData?.company?.state || "CA",
      zip: initialData?.company?.zip || "94105",
      phone: initialData?.company?.phone || companySettings.phone || "+1 (555) 123-4567",
      email: initialData?.company?.email || companySettings.email || "info@topnotch.com",
      ...initialData?.company
    },
    customer: {
      name: initialData?.customer?.name || "",
      address: initialData?.customer?.address || "",
      city: initialData?.customer?.city || "",
      state: initialData?.customer?.state || "",
      zip: initialData?.customer?.zip || "",
      phone: initialData?.customer?.phone || "",
      email: initialData?.customer?.email || "",
      ...initialData?.customer
    },
    items: initialData?.items || [
      { id: "1", description: "Website Development", quantity: 1, rate: 5000, amount: 5000 }
    ],
    notes: initialData?.notes || "",
    terms: initialData?.terms || "Payment due within 30 days",
    taxRate: initialData?.taxRate || 8.5,
    discount: initialData?.discount || 0
  });

  // Load customers and products
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load customers
        const customersResponse = await customerService.getAllCustomers();
        if (customersResponse.success && customersResponse.data) {
          setCustomers(customersResponse.data);
        }
        setLoadingCustomers(false);

        // Load products
        const productsResponse = await productService.getAllProducts();
        if (productsResponse.success && productsResponse.data) {
          setProducts(productsResponse.data);
        }
        setLoadingProducts(false);
      } catch (error) {
        console.error('Failed to load customers/products:', error);
        setLoadingCustomers(false);
        setLoadingProducts(false);
      }
    };
    loadData();
  }, []);

  // Update state when initialData changes (e.g., when loading invoice in edit mode)
  // Use a ref to track if we've loaded initial data
  const [hasLoadedInitialData, setHasLoadedInitialData] = React.useState(false);
  
  useEffect(() => {
    if (initialData && initialData.items && initialData.items.length > 0 && !hasLoadedInitialData) {
      setInvoiceData({
        invoiceNumber: initialData?.invoiceNumber || generateInvoiceNumber(),
        date: initialData?.date || new Date().toISOString().split('T')[0],
        dueDate: initialData?.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        company: {
          name: initialData?.company?.name || companySettings.companyName || "TopNotch Electronics",
          address: initialData?.company?.address || companySettings.address || "123 Business St",
          city: initialData?.company?.city || "San Francisco",
          state: initialData?.company?.state || "CA",
          zip: initialData?.company?.zip || "94105",
          phone: initialData?.company?.phone || companySettings.phone || "+1 (555) 123-4567",
          email: initialData?.company?.email || companySettings.email || "info@topnotch.com",
          ...initialData?.company
        },
        customer: {
          id: initialData?.customer?.id,
          name: initialData?.customer?.name || "",
          address: initialData?.customer?.address || "",
          city: initialData?.customer?.city || "",
          state: initialData?.customer?.state || "",
          zip: initialData?.customer?.zip || "",
          phone: initialData?.customer?.phone || "",
          email: initialData?.customer?.email || "",
          ...initialData?.customer
        },
        items: initialData?.items || [],
        notes: initialData?.notes || "",
        terms: initialData?.terms || "Payment due within 30 days",
        taxRate: initialData?.taxRate || 8.5,
        discount: initialData?.discount || 0
      });
      // Set selected customer ID if available
      if (initialData?.customer?.id) {
        setSelectedCustomerId(initialData.customer.id);
      }
      setHasLoadedInitialData(true);
    }
  }, [initialData, hasLoadedInitialData, companySettings, generateInvoiceNumber]);

  const updateField = (field: string, value: string | number) => {
    setInvoiceData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateCompanyField = (field: string, value: string) => {
    setInvoiceData(prev => ({
      ...prev,
      company: {
        ...prev.company,
        [field]: value
      }
    }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        updateCompanyField('logo', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    updateCompanyField('logo', '');
  };

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomerId(customerId);
    
    if (customerId === '') {
      // Clear customer fields
      setInvoiceData(prev => ({
        ...prev,
        customer: {
          id: undefined,
          name: '',
          address: '',
          city: '',
          state: '',
          zip: '',
          phone: '',
          email: ''
        }
      }));
      return;
    }

    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setInvoiceData(prev => ({
        ...prev,
        customer: {
          id: customer.id,
          name: customer.name,
          address: customer.address || '',
          city: '',
          state: '',
          zip: '',
          phone: customer.phone || '',
          email: customer.email || ''
        }
      }));
    }
  };

  const updateCustomerField = (field: string, value: string) => {
    setInvoiceData(prev => ({
      ...prev,
      customer: {
        ...prev.customer,
        [field]: value
      }
    }));
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: "",
      itemDescription: "",
      quantity: 1,
      rate: 0,
      amount: 0
    };
    setInvoiceData(prev => {
      const updated = {
        ...prev,
        items: [...prev.items, newItem]
      };
      return updated;
    });
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'quantity' || field === 'rate') {
            updatedItem.amount = updatedItem.quantity * updatedItem.rate;
          }
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const removeItem = (id: string) => {
    confirm(
      {
        title: 'Delete Item',
        message: 'Are you sure you want to delete this item? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        variant: 'danger'
      },
      () => {
        setInvoiceData(prev => {
          const updated = {
            ...prev,
            items: prev.items.filter(item => item.id !== id)
          };
          return updated;
        });
      }
    );
  };

  const subtotal = invoiceData.items.reduce((sum, item) => sum + item.amount, 0);
  const discountAmount = (subtotal * invoiceData.discount) / 100;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = (taxableAmount * invoiceData.taxRate) / 100;
  const total = taxableAmount + taxAmount;

  // Check if sections are completed
  const isBasicInfoComplete = invoiceData.invoiceNumber && invoiceData.date && invoiceData.dueDate;
  const isCompanyComplete = invoiceData.company.name && invoiceData.company.address;
  const isCustomerComplete = invoiceData.customer.name;
  const isItemsComplete = invoiceData.items.length > 0 && invoiceData.items.every(item => item.description && item.quantity > 0 && item.rate > 0);


  return (
    <div className={cn("space-y-6", className)}>
      <FormCard title="Invoice Builder" description="Create and customize your invoice">
        <Tabs
          tabs={[
            {
              id: "basic",
              label: "Basic Info",
              content: (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                      Invoice Details
                    </h3>
                    {isBasicInfoComplete && (
                      <CheckIcon className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="Invoice Number"
                      value={invoiceData.invoiceNumber}
                      onChange={(e) => updateField('invoiceNumber', e.target.value)}
                      placeholder="INV-001"
                      required
                    />
                    <Input
                      label="Date"
                      type="date"
                      value={invoiceData.date}
                      onChange={(e) => updateField('date', e.target.value)}
                      required
                    />
                    <Input
                      label="Due Date"
                      type="date"
                      value={invoiceData.dueDate}
                      onChange={(e) => updateField('dueDate', e.target.value)}
                      required
                    />
                  </div>
                </div>
              )
            },
            {
              id: "company",
              label: "Company",
              content: (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                      Company Information
                    </h3>
                    {isCompanyComplete && (
                      <CheckIcon className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  
                  {/* Logo Upload Section */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-3" style={{ color: 'var(--foreground)' }}>
                      Company Logo
                    </label>
                    <div className="flex items-center gap-4">
                      {invoiceData.company.logo ? (
                        <div className="relative">
                          <img
                            src={invoiceData.company.logo}
                            alt="Company Logo"
                            width={80}
                            height={80}
                            className="object-contain rounded-lg border"
                            style={{ borderColor: 'var(--border)' }}
                          />
                          <button
                            onClick={removeLogo}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div 
                          className="w-20 h-20 border-2 border-dashed rounded-lg flex items-center justify-center"
                          style={{ borderColor: 'var(--border)' }}
                        >
                          <PhotoIcon className="h-8 w-8" style={{ color: 'var(--muted-foreground)' }} />
                        </div>
                      )}
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                          id="logo-upload"
                        />
                        <label
                          htmlFor="logo-upload"
                          className="cursor-pointer"
                        >
                          <Button variant="outline" size="sm">
                            <PhotoIcon className="h-4 w-4 mr-2" />
                            {invoiceData.company.logo ? 'Change Logo' : 'Upload Logo'}
                          </Button>
                        </label>
                        <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                          PNG, JPG up to 2MB
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Company Name"
                      value={invoiceData.company.name}
                      onChange={(e) => updateCompanyField('name', e.target.value)}
                      placeholder="TopNotch Electronics"
                      required
                    />
                    <Input
                      label="Phone"
                      value={invoiceData.company.phone}
                      onChange={(e) => updateCompanyField('phone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                    <Input
                      label="Address"
                      value={invoiceData.company.address}
                      onChange={(e) => updateCompanyField('address', e.target.value)}
                      placeholder="123 Business St"
                      required
                    />
                    <Input
                      label="Email"
                      type="email"
                      value={invoiceData.company.email}
                      onChange={(e) => updateCompanyField('email', e.target.value)}
                      placeholder="info@topnotch.com"
                    />
                    <Input
                      label="City"
                      value={invoiceData.company.city}
                      onChange={(e) => updateCompanyField('city', e.target.value)}
                      placeholder="San Francisco"
                    />
                    <Input
                      label="State"
                      value={invoiceData.company.state}
                      onChange={(e) => updateCompanyField('state', e.target.value)}
                      placeholder="CA"
                    />
                    <Input
                      label="ZIP Code"
                      value={invoiceData.company.zip}
                      onChange={(e) => updateCompanyField('zip', e.target.value)}
                      placeholder="94105"
                    />
                  </div>
                </div>
              )
            },
            {
              id: "customer",
              label: "Customer",
              content: (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                      Customer Information
                    </h3>
                    {isCustomerComplete && (
                      <CheckIcon className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  
                  {/* Customer Dropdown */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                      Select Customer (or enter manually below)
                    </label>
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => handleCustomerSelect(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                      style={{ 
                        backgroundColor: 'var(--input-background)',
                        borderColor: 'var(--border)',
                        color: 'var(--foreground)'
                      }}
                      disabled={loadingCustomers}
                    >
                      <option value="">-- New Customer (Manual Entry) --</option>
                      {customers.map(customer => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} {customer.email ? `(${customer.email})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Customer Name"
                      value={invoiceData.customer.name}
                      onChange={(e) => updateCustomerField('name', e.target.value)}
                      placeholder="John Smith"
                      required
                    />
                    <Input
                      label="Phone"
                      value={invoiceData.customer.phone}
                      onChange={(e) => updateCustomerField('phone', e.target.value)}
                      placeholder="+1 (555) 987-6543"
                    />
                    <Input
                      label="Address"
                      value={invoiceData.customer.address}
                      onChange={(e) => updateCustomerField('address', e.target.value)}
                      placeholder="456 Customer Ave"
                    />
                    <Input
                      label="Email"
                      type="email"
                      value={invoiceData.customer.email}
                      onChange={(e) => updateCustomerField('email', e.target.value)}
                      placeholder="customer@example.com"
                    />
                    <Input
                      label="City"
                      value={invoiceData.customer.city}
                      onChange={(e) => updateCustomerField('city', e.target.value)}
                      placeholder="New York"
                    />
                    <Input
                      label="State"
                      value={invoiceData.customer.state}
                      onChange={(e) => updateCustomerField('state', e.target.value)}
                      placeholder="NY"
                    />
                    <Input
                      label="ZIP Code"
                      value={invoiceData.customer.zip}
                      onChange={(e) => updateCustomerField('zip', e.target.value)}
                      placeholder="10001"
                    />
                  </div>
                </div>
              )
            },
            {
              id: "items",
              label: "Items",
              content: (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                      Invoice Items
                    </h3>
                    {isItemsComplete && (
                      <CheckIcon className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  
                  {/* Product Quick Add */}
                  <div className="p-4 rounded-lg border mb-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card-background)' }}>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                      Quick Add from Products
                    </label>
                    <select
                      onChange={(e) => {
                        const productId = e.target.value;
                        if (productId) {
                          const product = products.find(p => p.id === productId);
                          if (product) {
                            const newItem: InvoiceItem = {
                              id: Date.now().toString(),
                              description: product.name,
                              quantity: 1,
                              rate: product.price,
                              amount: product.price
                            };
                            setInvoiceData(prev => ({
                              ...prev,
                              items: [...prev.items, newItem]
                            }));
                            e.target.value = ''; // Reset dropdown
                          }
                        }
                      }}
                      className="w-full px-3 py-2 border rounded-lg"
                      style={{ 
                        backgroundColor: 'var(--input-background)',
                        borderColor: 'var(--border)',
                        color: 'var(--foreground)'
                      }}
                      disabled={loadingProducts}
                    >
                      <option value="">-- Select a product to add --</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} - {formatCurrency(product.price)} {product.stock !== undefined ? `(Stock: ${product.stock})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-4">
                    {invoiceData.items.map((item) => (
                      <div key={item.id} className="p-4 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                          <div className="md:col-span-5">
                            <Input
                              label="Description"
                              value={item.description}
                              onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                              placeholder="Item description"
                              required
                            />
                            <div className="mt-2">
                              <Input
                                label="Additional Details (Optional)"
                                value={item.itemDescription || ''}
                                onChange={(e) => updateItem(item.id, 'itemDescription', e.target.value)}
                                placeholder="Additional item details, specifications, etc."
                              />
                            </div>
                          </div>
                          <div className="md:col-span-2">
                            <Input
                              label="Quantity"
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                              min="0"
                              step="0.01"
                              required
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Input
                              label="Rate"
                              type="number"
                              value={item.rate}
                              onChange={(e) => updateItem(item.id, 'rate', Number(e.target.value))}
                              min="0"
                              step="0.01"
                              required
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Input
                              label="Amount"
                              type="number"
                              value={item.amount}
                              readOnly
                              className="bg-gray-50"
                            />
                          </div>
                          <div className="md:col-span-1">
                            {invoiceData.items.length > 1 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeItem(item.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={addItem}
                      className="w-full"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                </div>
              )
            },
            {
              id: "pricing",
              label: "Pricing & Terms",
              content: (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                    Pricing & Terms
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <Input
                        label="Discount (%)"
                        type="number"
                        value={invoiceData.discount}
                        onChange={(e) => updateField('discount', Number(e.target.value))}
                        min="0"
                        max="100"
                        step="0.01"
                        placeholder="0"
                      />
                      <Input
                        label="Tax Rate (%)"
                        type="number"
                        value={invoiceData.taxRate}
                        onChange={(e) => updateField('taxRate', Number(e.target.value))}
                        min="0"
                        step="0.01"
                        placeholder="8.5"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                        Invoice Summary
                      </h4>
                      <div 
                        className="p-4 rounded-lg"
                        style={{ backgroundColor: 'var(--muted)' }}
                      >
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span style={{ color: 'var(--muted-foreground)' }}>Subtotal:</span>
                            <span style={{ color: 'var(--foreground)' }}>{formatCurrency(subtotal)}</span>
                          </div>
                          {invoiceData.discount > 0 && (
                            <div className="flex justify-between">
                              <span style={{ color: 'var(--muted-foreground)' }}>Discount:</span>
                              <span style={{ color: 'var(--foreground)' }}>-{formatCurrency(discountAmount)}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span style={{ color: 'var(--muted-foreground)' }}>Tax:</span>
                            <span style={{ color: 'var(--foreground)' }}>{formatCurrency(taxAmount)}</span>
                          </div>
                          <div 
                            className="flex justify-between text-lg font-semibold pt-2 border-t"
                            style={{ 
                              borderColor: 'var(--border)',
                              color: 'var(--accent)'
                            }}
                          >
                            <span>Total:</span>
                            <span>{formatCurrency(total)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Textarea
                      label="Notes"
                      value={invoiceData.notes}
                      onChange={(e) => updateField('notes', e.target.value)}
                      placeholder="Additional notes or comments"
                      rows={3}
                    />
                    <Textarea
                      label="Terms & Conditions"
                      value={invoiceData.terms}
                      onChange={(e) => updateField('terms', e.target.value)}
                      placeholder="Payment terms and conditions"
                      rows={3}
                    />
                  </div>
                </div>
              )
            }
          ]}
          variant="pills"
        />

        <FormActions>
          <Button variant="outline" onClick={() => {
            onPreview?.(invoiceData);
          }}>
            Preview
          </Button>
          <Button variant="default" onClick={() => {
            onSave?.(invoiceData);
          }}>
            Save Invoice
          </Button>
        </FormActions>
      </FormCard>
      
      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title={options.title}
        message={options.message}
        confirmText={options.confirmText}
        cancelText={options.cancelText}
        variant={options.variant}
      />
    </div>
  );
}
