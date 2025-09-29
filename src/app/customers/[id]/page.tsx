'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layouts/app-layout';
import { Button, Toast, Alert } from '@/components/ui/core';
import { CustomerForm } from '@/components/ui/forms/customer-form';
import { useSettings } from '@/contexts/SettingsContext';
import { useConfirmation } from '@/lib/hooks/useConfirmation';
import { ConfirmationDialog } from '@/components/ui/dialogs/confirmation-dialog';
import { customerService } from '@/lib/services';
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
  
  const { formatCurrency, formatDate } = useSettings();
  const { isOpen, options, confirm, handleConfirm, handleClose } = useConfirmation();

  useEffect(() => {
    if (customerId) {
      loadCustomerDetails();
    }
  }, [customerId]);

  const loadCustomerDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await customerService.getCustomerById(customerId);
      
      if (response.success && response.data) {
        // For now, we'll use mock data for orders/sales
        // In a real app, this would come from sales data
        const customer = response.data;
        const details: CustomerDetails = {
          customer,
          totalOrders: 0, // Would come from sales data
          totalSpent: 0, // Would come from sales data
          lastOrderDate: null, // Would come from sales data
          averageOrderValue: 0 // Would be calculated from sales data
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
  };

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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Simple Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/customers')}
          className="flex items-center gap-2 text-sm"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back
        </Button>

        {/* Profile Header */}
        <div 
          className="p-8 rounded-lg border"
          style={{ 
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)'
          }}
        >
          <div className="flex items-start gap-6">
            {/* Large Profile Avatar */}
            <div className="flex-shrink-0">
              {customer.avatar ? (
                <img
                  src={customer.avatar}
                  alt={customer.name}
                  className="h-24 w-24 rounded-full object-cover border-4 shadow-lg"
                  style={{ borderColor: 'var(--border)' }}
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {customer.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Customer Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
                    {customer.name}
                  </h1>
                  
                  <div className="flex flex-wrap gap-4 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      Customer since {formatDate(customer.createdAt)}
                    </div>
                    {customer.company && (
                      <div className="flex items-center gap-2">
                        <BuildingOfficeIcon className="h-4 w-4" />
                        {customer.company}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowEditForm(true)}
                    className="flex items-center gap-2"
                  >
                    <PencilIcon className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteCustomer}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customer.email && (
                <div className="flex items-center gap-3">
                  <EnvelopeIcon className="h-5 w-5" style={{ color: 'var(--muted-foreground)' }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                      {customer.email}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      Email Address
                    </p>
                  </div>
                </div>
              )}

              {customer.phone && (
                <div className="flex items-center gap-3">
                  <PhoneIcon className="h-5 w-5" style={{ color: 'var(--muted-foreground)' }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                      {customer.phone}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      Phone Number
                    </p>
                  </div>
                </div>
              )}

              {customer.address && (
                <div className="flex items-start gap-3 md:col-span-2">
                  <MapPinIcon className="h-5 w-5 mt-0.5" style={{ color: 'var(--muted-foreground)' }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                      {customer.address}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      Address
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

        {/* Recent Orders */}
        <div 
          className="p-6 rounded-lg border"
          style={{ 
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)'
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
              Recent Orders
            </h2>
            <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              {customerDetails.totalOrders} total orders
            </div>
          </div>
          
          {customerDetails.totalOrders === 0 ? (
            <div className="text-center py-12">
              <ShoppingBagIcon className="mx-auto h-12 w-12" style={{ color: 'var(--muted-foreground)' }} />
              <h3 className="mt-2 text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                No orders yet
              </h3>
              <p className="mt-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                This customer hasn&apos;t placed any orders yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Mock recent orders - in real app, these would come from sales data */}
              <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
                <div className="flex items-center gap-3">
                  <ReceiptPercentIcon className="h-5 w-5" style={{ color: 'var(--muted-foreground)' }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                      Order #INV-2024-001
                    </p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      {formatDate(new Date().toISOString())}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                    {formatCurrency(150.00)}
                  </p>
                  <p className="text-xs text-green-600">Completed</p>
                </div>
              </div>
            </div>
          )}
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
