/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layouts/app-layout';
import { Button, Toast, Alert } from '@/components/ui/core';
import { KPICard } from '@/components/ui/dashboard';
import { CustomerForm } from '@/components/ui/forms/customer-form';
import { useSettings } from '@/contexts/SettingsContext';
import { useConfirmation } from '@/lib/hooks/useConfirmation';
import { ConfirmationDialog } from '@/components/ui/dialogs/confirmation-dialog';
import { customerService, salesService } from '@/lib/services';
import { Customer } from '@/lib/types/core';
import { 
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  CalendarIcon,
  ShoppingBagIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ReceiptPercentIcon
} from '@heroicons/react/24/outline';

interface CustomerDetails {
  customer: Customer;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string | null;
  averageOrderValue: number;
}

export default function CustomerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;
  
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [customerInvoices, setCustomerInvoices] = useState<Array<{
    id: string;
    number: string;
    issueDate: string;
    total: number;
    status: string;
    customerId: string | null;
  }>>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [customerSales, setCustomerSales] = useState<Array<{
    id: string;
    createdAt: string;
    total: number;
    status: string;
    customerId?: string;
    customerName?: string;
    items: Array<{
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }>;
    subtotal: number;
    tax: number;
    discount: number;
    paymentMethod: string;
    notes?: string;
  }>>([]);
  const [loadingSales, setLoadingSales] = useState(true);
  
  const { formatCurrency, formatDate } = useSettings();
  const { isOpen, options, confirm, handleConfirm, handleClose } = useConfirmation();

  const loadCustomerDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await customerService.getCustomerById(customerId);
      
      if (response.success && response.data) {
        const customer = response.data;
        
        // Fetch sales data for this customer
        const salesResponse = await salesService.getAllSales();
        let totalOrders = 0;
        let totalSpent = 0;
        let lastOrderDate: string | null = null;
        
        if (salesResponse.success && salesResponse.data) {
          const customerSales = salesResponse.data.filter(sale => sale.customerId === customerId);
          totalOrders = customerSales.length;
          totalSpent = customerSales.reduce((sum, sale) => sum + sale.total, 0);
          
          if (customerSales.length > 0) {
            // Get the most recent sale date
            const sortedSales = customerSales.sort((a, b) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            lastOrderDate = sortedSales[0].createdAt;
          }
        }
        
        const details: CustomerDetails = {
          customer,
          totalOrders,
          totalSpent,
          lastOrderDate,
          averageOrderValue: totalOrders > 0 ? totalSpent / totalOrders : 0
        };
        
        setCustomerDetails(details);
      } else {
        setError('Customer not found');
      }
    } catch (error) {
      console.error('Failed to load customer details:', error);
      setError('Failed to load customer details');
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  const loadCustomerInvoices = useCallback(async () => {
    try {
      setLoadingInvoices(true);
      
      // Fetch all invoices
      const response = await fetch('/api/invoices');
      if (!response.ok) {
        throw new Error('Failed to fetch invoices');
      }
      
      const allInvoices = await response.json();
      
      console.log('Customer ID:', customerId);
      console.log('All invoices:', allInvoices);
      console.log('All invoices with customerIds:', allInvoices.map((inv: { id: string; customerId: string | null; customerName: string }) => ({ id: inv.id, customerId: inv.customerId, customerName: inv.customerName })));
      
      // Filter invoices for this customer
      const customerInvs = allInvoices.filter((inv: { customerId: string | null }) => inv.customerId === customerId);
      
      console.log('Filtered customer invoices:', customerInvs);
      setCustomerInvoices(customerInvs);
    } catch (error) {
      console.error('Failed to load customer invoices:', error);
    } finally {
      setLoadingInvoices(false);
    }
  }, [customerId]);

  const loadCustomerSales = useCallback(async () => {
    try {
      setLoadingSales(true);
      
      const salesResponse = await salesService.getAllSales();
      
      if (salesResponse.success && salesResponse.data) {
        const customerSalesData = salesResponse.data.filter(sale => sale.customerId === customerId);
        setCustomerSales(customerSalesData);
      }
    } catch (error) {
      console.error('Failed to load customer sales:', error);
    } finally {
      setLoadingSales(false);
    }
  }, [customerId]);

  useEffect(() => {
    if (customerId) {
      loadCustomerDetails();
      loadCustomerInvoices();
      loadCustomerSales();
    }
  }, [customerId, loadCustomerDetails, loadCustomerInvoices, loadCustomerSales]);

  const handleEditCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await customerService.updateCustomer(customerId, customerData);
      if (response.success) {
        await loadCustomerDetails(); // Reload customer details
        setShowEditForm(false);
        setToast({ message: 'Customer updated successfully', type: 'success' });
      }
    } catch (error) {
      console.error('Failed to update customer:', error);
      setToast({ message: 'Failed to update customer', type: 'error' });
    }
  };

  const handleDeleteCustomer = () => {
    if (!customerDetails?.customer) return;

    confirm({
      title: 'Delete Customer',
      message: `Are you sure you want to delete ${customerDetails.customer.name}? This action cannot be undone.`,
      confirmText: 'Delete',
      variant: 'danger'
    }, async () => {
      try {
        const response = await customerService.deleteCustomer(customerId);
        if (response.success) {
          setToast({ message: 'Customer deleted successfully', type: 'success' });
          setTimeout(() => {
            router.push('/customers');
          }, 1000);
        }
      } catch (error) {
        console.error('Failed to delete customer:', error);
        setToast({ message: 'Failed to delete customer', type: 'error' });
      }
    });
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
            <p style={{ color: 'var(--muted-foreground)' }}>Loading customer details...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !customerDetails) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => router.push('/customers')}
              className="flex items-center gap-2"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Customers
            </Button>
          </div>
          
          <Alert variant="error" title="Error">
            {error || 'Customer not found'}
          </Alert>
        </div>
      </AppLayout>
    );
  }

  const { customer } = customerDetails;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push('/customers')}
            className="flex items-center gap-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Customers
          </Button>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => router.push(`/sales/new?customerId=${customerId}`)}
              className="flex items-center gap-2"
            >
              <ShoppingBagIcon className="h-4 w-4" />
              New Sale
            </Button>
            <Button
              onClick={() => router.push(`/invoices/new?customerId=${customerId}`)}
              className="flex items-center gap-2"
            >
              <DocumentTextIcon className="h-4 w-4" />
              New Invoice
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowEditForm(true)}
              className="flex items-center gap-2"
            >
              <PencilIcon className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              onClick={handleDeleteCustomer}
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <TrashIcon className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        {/* Customer Info Card */}
        <div 
          className="p-6 rounded-lg border"
          style={{ 
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)'
          }}
        >
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {customer.avatar ? (
                <img
                  src={customer.avatar}
                  alt={customer.name}
                  className="h-16 w-16 rounded-full object-cover border-2"
                  style={{ borderColor: 'var(--border)' }}
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                  {customer.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>
                {customer.name}
              </h1>
              <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                <div className="flex items-center gap-1">
                  <CalendarIcon className="h-4 w-4" />
                  Customer since {formatDate(customer.createdAt)}
                </div>
                {customer.company && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <BuildingOfficeIcon className="h-4 w-4" />
                      {customer.company}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* KPI Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <KPICard 
            title="Total Orders" 
            value={customerDetails.totalOrders.toString()}
            icon={<ShoppingBagIcon className="h-6 w-6" style={{ color: 'var(--accent)' }} />}
          />
          <KPICard 
            title="Total Spent" 
            value={formatCurrency(customerDetails.totalSpent)}
            icon={<CurrencyDollarIcon className="h-6 w-6" style={{ color: 'var(--accent)' }} />}
          />
          <KPICard 
            title="Average Order" 
            value={formatCurrency(customerDetails.averageOrderValue)}
            icon={<ReceiptPercentIcon className="h-6 w-6" style={{ color: 'var(--accent)' }} />}
          />
          <KPICard 
            title="Last Order" 
            value={customerDetails.lastOrderDate ? formatDate(customerDetails.lastOrderDate) : 'No orders'}
            icon={<CalendarIcon className="h-6 w-6" style={{ color: 'var(--accent)' }} />}
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Customer Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Information */}
            {(customer.email || customer.phone || customer.address) && (
              <div 
                className="p-6 rounded-lg border"
                style={{ 
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)'
                }}
              >
                <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
                  Contact Information
                </h2>
                
                <div className="space-y-3">
                  {customer.email && (
                    <div className="flex items-center gap-3">
                      <EnvelopeIcon className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--muted-foreground)' }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                          {customer.email}
                        </p>
                      </div>
                    </div>
                  )}

                  {customer.phone && (
                    <div className="flex items-center gap-3">
                      <PhoneIcon className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--muted-foreground)' }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                          {customer.phone}
                        </p>
                      </div>
                    </div>
                  )}

                  {customer.address && (
                    <div className="flex items-start gap-3">
                      <MapPinIcon className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--muted-foreground)' }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                          {customer.address}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            {customer.notes && (
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
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                  {customer.notes}
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Activity History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Invoice History */}
        <div 
          className="p-6 rounded-lg border"
          style={{ 
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)'
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
              Invoice History
            </h2>
            <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              {customerInvoices.length} total invoices
            </div>
          </div>
          
          {loadingInvoices ? (
            <div className="text-center py-8">
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Loading invoices...</p>
            </div>
          ) : customerInvoices.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="mx-auto h-12 w-12" style={{ color: 'var(--muted-foreground)' }} />
              <h3 className="mt-2 text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                No invoices yet
              </h3>
              <p className="mt-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                This customer doesn&apos;t have any invoices yet.
              </p>
              <Button
                onClick={() => router.push('/invoices/new')}
                className="mt-4"
              >
                Create Invoice
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {customerInvoices.map((invoice) => (
                <div 
                  key={invoice.id}
                  className="flex items-center justify-between p-4 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: 'var(--muted)' }}
                  onClick={() => router.push(`/invoices/${invoice.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <DocumentTextIcon className="h-5 w-5" style={{ color: 'var(--muted-foreground)' }} />
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                        {invoice.number}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        {formatDate(invoice.issueDate)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                      {formatCurrency(invoice.total)}
                    </p>
                    <p className={`text-xs capitalize ${
                      invoice.status === 'paid' ? 'text-green-600' : 
                      invoice.status === 'overdue' ? 'text-red-600' : 
                      'text-yellow-600'
                    }`}>
                      {invoice.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sales History */}
        <div 
          className="p-6 rounded-lg border"
          style={{ 
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)'
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
              Sales History
            </h2>
            <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              {customerSales.length} total sales
            </div>
          </div>
          
          {loadingSales ? (
            <div className="text-center py-8">
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Loading sales...</p>
            </div>
          ) : customerSales.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBagIcon className="mx-auto h-12 w-12" style={{ color: 'var(--muted-foreground)' }} />
              <h3 className="mt-2 text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                No sales yet
              </h3>
              <p className="mt-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                This customer hasn&apos;t made any purchases yet.
              </p>
              <Button
                onClick={() => router.push('/sales/new')}
                className="mt-4"
              >
                Create Sale
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {customerSales.map((sale) => (
                <div 
                  key={sale.id}
                  className="flex items-center justify-between p-4 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: 'var(--muted)' }}
                  onClick={() => router.push(`/sales/${sale.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <ShoppingBagIcon className="h-5 w-5" style={{ color: 'var(--muted-foreground)' }} />
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                        Sale #{sale.id.substring(0, 8)}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        {formatDate(sale.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                      {formatCurrency(sale.total)}
                    </p>
                    <p className={`text-xs capitalize ${
                      sale.status === 'completed' ? 'text-green-600' : 
                      sale.status === 'pending' ? 'text-yellow-600' : 
                      'text-gray-600'
                    }`}>
                      {sale.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
          </div>
        </div>

        {/* Toast Notifications */}
        {toast && (
          <Toast
            title={toast.message}
            variant={toast.type === 'success' ? 'success' : 'error'}
            onClose={() => setToast(null)}
          >
            {toast.message}
          </Toast>
        )}

        {/* Edit Customer Form Modal */}
        <CustomerForm
          customer={customer}
          isOpen={showEditForm}
          onClose={() => setShowEditForm(false)}
          onSave={handleEditCustomer}
          title="Edit Customer"
        />

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={isOpen}
          title={options.title}
          message={options.message}
          confirmText={options.confirmText}
          cancelText={options.cancelText}
          variant={options.variant}
          onConfirm={handleConfirm}
          onClose={handleClose}
        />
      </div>
    </AppLayout>
  );
}
