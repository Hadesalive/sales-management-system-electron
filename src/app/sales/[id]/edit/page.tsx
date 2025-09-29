'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layouts/app-layout';
import { Button, Toast } from '@/components/ui/core';
import { Input, Select, Textarea } from '@/components/ui/forms';
import { customerService, productService, salesService } from '@/lib/services';
import { Customer, Product, SaleItem, Sale } from '@/lib/types/core';
import { useSettings } from '@/contexts/SettingsContext';
import { 
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  UserIcon,
  CubeIcon,
  CurrencyDollarIcon,
  ReceiptPercentIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

export default function EditSalePage() {
  const params = useParams();
  const router = useRouter();
  const { formatCurrency } = useSettings();
  
  const saleId = params.id as string;
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [originalSale, setOriginalSale] = useState<Sale | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'bank_transfer' | 'other'>('cash');
  const [status, setStatus] = useState<'pending' | 'completed' | 'cancelled' | 'refunded'>('completed');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Product search and selection
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [customPrice, setCustomPrice] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [customersRes, productsRes, saleRes] = await Promise.all([
        customerService.getAllCustomers(),
        productService.getAllProducts(),
        salesService.getSaleById(saleId)
      ]);

      if (customersRes.success) setCustomers(customersRes.data || []);
      if (productsRes.success) setProducts(productsRes.data || []);
      
      if (saleRes.success && saleRes.data) {
        const sale = saleRes.data;
        setOriginalSale(sale);
        setSelectedCustomer(sale.customerId || '');
        setSaleItems(sale.items || []);
        setNotes(sale.notes || '');
        setPaymentMethod(sale.paymentMethod);
        setStatus(sale.status);
      } else {
        setToast({ message: 'Sale not found', type: 'error' });
        setTimeout(() => router.push('/sales'), 2000);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setToast({ message: 'Failed to load sale data', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [saleId, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter products based on search term
  const filteredProducts = useMemo(() => {
    if (!productSearchTerm) return products;
    return products.filter(product =>
      product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(productSearchTerm.toLowerCase())
    );
  }, [products, productSearchTerm]);

  // Get selected product details
  const selectedProductData = products.find(p => p.id === selectedProduct);

  const addItem = () => {
    if (!selectedProductData || quantity <= 0) {
      setToast({ message: 'Please select a product and enter a valid quantity', type: 'error' });
      return;
    }
    
    // Check if product already exists in cart
    const existingItemIndex = saleItems.findIndex(item => item.productId === selectedProduct);
    
    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...saleItems];
      updatedItems[existingItemIndex].quantity += quantity;
      updatedItems[existingItemIndex].total = updatedItems[existingItemIndex].quantity * updatedItems[existingItemIndex].unitPrice;
      setSaleItems(updatedItems);
    } else {
      // Add new item
      const unitPrice = customPrice !== null ? customPrice : selectedProductData.price;
      const newItem: SaleItem = {
        productId: selectedProductData.id,
        productName: selectedProductData.name,
        quantity: quantity,
        unitPrice: unitPrice,
        total: quantity * unitPrice,
      };
      
      setSaleItems([...saleItems, newItem]);
    }
    
    // Reset form
    setSelectedProduct('');
    setQuantity(1);
    setCustomPrice(null);
    setProductSearchTerm('');
  };

  const updateItem = (index: number, field: keyof SaleItem, value: string | number) => {
    const updatedItems = [...saleItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Recalculate total if quantity or unitPrice changed
    if (field === 'quantity' || field === 'unitPrice') {
      updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].unitPrice;
    }
    
    setSaleItems(updatedItems);
  };

  const removeItem = (index: number) => {
    setSaleItems(saleItems.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const subtotal = saleItems.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.15; // 15% tax rate
    const total = subtotal + tax;
    
    return { subtotal, tax, total };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (saleItems.length === 0) {
      setToast({ message: 'Please add at least one item to the sale', type: 'error' });
      return;
    }

    setSaving(true);
    
    try {
      const { subtotal, tax, total } = calculateTotals();
      const selectedCustomerData = customers.find(c => c.id === selectedCustomer);
      
      const saleData = {
        customerId: selectedCustomer || undefined,
        customerName: selectedCustomerData?.name || 'Walk-in Customer',
        items: saleItems,
        subtotal,
        tax,
        discount: originalSale?.discount || 0,
        total,
        status,
        paymentMethod,
        notes: notes || undefined,
      };

      const response = await salesService.updateSale(saleId, saleData);
      
      if (response.success) {
        setToast({ message: 'Sale updated successfully!', type: 'success' });
        setTimeout(() => {
          router.push(`/sales/${saleId}`);
        }, 1000);
      } else {
        setToast({ message: response.error || 'Failed to update sale', type: 'error' });
      }
    } catch (error) {
      console.error('Error updating sale:', error);
      setToast({ message: 'Failed to update sale', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const { subtotal, tax, total } = calculateTotals();

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading sale data...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!originalSale) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground">Sale not found</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
              Edit Sale #{originalSale.id.substring(0, 8)}
            </h1>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Modify sale details and items
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push(`/sales/${saleId}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Sale
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Customer & Product Selection */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Selection */}
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
                
                <Select
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  placeholder="Select customer (optional)"
                  options={[
                    { value: '', label: 'Walk-in Customer' },
                    ...customers.map(customer => ({
                      value: customer.id,
                      label: `${customer.name}${customer.email ? ` (${customer.email})` : ''}`
                    }))
                  ]}
                />
                
                {selectedCustomer && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Customer selected: {customers.find(c => c.id === selectedCustomer)?.name}
                    </p>
                  </div>
                )}
              </div>

              {/* Sale Status */}
              <div 
                className="p-6 rounded-lg border"
                style={{ 
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)'
                }}
              >
                <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
                  Sale Status
                </h2>
                
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'pending' | 'completed' | 'cancelled' | 'refunded')}
                  options={[
                    { value: 'pending', label: 'Pending' },
                    { value: 'completed', label: 'Completed' },
                    { value: 'cancelled', label: 'Cancelled' },
                    { value: 'refunded', label: 'Refunded' }
                  ]}
                />
              </div>

              {/* Product Selection */}
              <div 
                className="p-6 rounded-lg border"
                style={{ 
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)'
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <CubeIcon className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                  <h2 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                    Add Products
                  </h2>
                </div>
                
                <div className="space-y-4">
                  {/* Product Search */}
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
                    <Input
                      placeholder="Search products..."
                      value={productSearchTerm}
                      onChange={(e) => setProductSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  {/* Product Selection */}
                  <Select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    placeholder="Select a product"
                    options={filteredProducts.map(product => ({
                      value: product.id,
                      label: `${product.name} - ${formatCurrency(product.price)}${product.stock !== undefined ? ` (Stock: ${product.stock})` : ''}`
                    }))}
                  />
                  
                  {/* Quantity and Price */}
                  {selectedProductData && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                          Quantity
                        </label>
                        <Input
                          type="number"
                          value={quantity}
                          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                          min="1"
                          placeholder="1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                          Unit Price (optional)
                        </label>
                        <Input
                          type="number"
                          value={customPrice || ''}
                          onChange={(e) => setCustomPrice(e.target.value ? parseFloat(e.target.value) : null)}
                          step="0.01"
                          placeholder={`Default: ${formatCurrency(selectedProductData.price)}`}
                        />
                      </div>
                    </div>
                  )}
                  
                  <Button
                    type="button"
                    onClick={addItem}
                    disabled={!selectedProductData}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Add to Sale
                  </Button>
                </div>
              </div>

              {/* Sale Items */}
              {saleItems.length > 0 && (
                <div 
                  className="p-6 rounded-lg border"
                  style={{ 
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)'
                  }}
                >
                  <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
                    Sale Items ({saleItems.length})
                  </h2>
                  
                  <div className="space-y-3">
                    {saleItems.map((item, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg" style={{ borderColor: 'var(--border)' }}>
                        <div className="md:col-span-2">
                          <p className="font-medium" style={{ color: 'var(--foreground)' }}>
                            {item.productName}
                          </p>
                          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                            ID: {item.productId.substring(0, 8)}
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>
                            Quantity
                          </label>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                            min="1"
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>
                            Unit Price
                          </label>
                          <Input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            step="0.01"
                            className="text-sm"
                          />
                        </div>
                        <div className="flex items-end gap-2">
                          <div className="flex-1">
                            <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>
                              Total
                            </p>
                            <p className="font-semibold" style={{ color: 'var(--foreground)' }}>
                              {formatCurrency(item.total)}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Payment & Totals */}
            <div className="space-y-6">
              {/* Payment Method */}
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
                    Payment
                  </h2>
                </div>
                
                <Select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'card' | 'bank_transfer' | 'other')}
                  options={[
                    { value: 'cash', label: 'Cash' },
                    { value: 'card', label: 'Card' },
                    { value: 'bank_transfer', label: 'Bank Transfer' },
                    { value: 'other', label: 'Other' }
                  ]}
                />
              </div>

              {/* Totals */}
              <div 
                className="p-6 rounded-lg border"
                style={{ 
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)'
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <ReceiptPercentIcon className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                  <h2 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                    Totals
                  </h2>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--muted-foreground)' }}>Subtotal:</span>
                    <span className="font-semibold" style={{ color: 'var(--foreground)' }}>
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--muted-foreground)' }}>Tax (15%):</span>
                    <span className="font-semibold" style={{ color: 'var(--foreground)' }}>
                      {formatCurrency(tax)}
                    </span>
                  </div>
                  
                  <div className="border-t pt-3" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex justify-between">
                      <span className="font-semibold" style={{ color: 'var(--foreground)' }}>Total:</span>
                      <span className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
                        {formatCurrency(total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
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
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this sale..."
                  rows={4}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/sales/${saleId}`)}
                  className="w-full"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving || saleItems.length === 0}
                  className="w-full"
                >
                  {saving ? 'Updating Sale...' : 'Update Sale'}
                </Button>
              </div>
            </div>
          </div>
        </form>

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
