'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layouts/app-layout';
import { Button, Alert, Toast } from '@/components/ui/core';
import { ConfirmationDialog } from '@/components/ui/dialogs/confirmation-dialog';
import { useConfirmation } from '@/lib/hooks/useConfirmation';
import { salesService } from '@/lib/services';
import { Sale } from '@/lib/types/core';
import { useSettings } from '@/contexts/SettingsContext';
import { 
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  CurrencyDollarIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  TagIcon,
  DocumentTextIcon} from '@heroicons/react/24/outline';

interface SaleDetails {
  sale: Sale;
}

export default function SaleDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { formatCurrency, formatDate } = useSettings();
  const { isOpen, options, confirm, handleConfirm, handleClose } = useConfirmation();
  
  const saleId = params.id as string;
  
  const [saleDetails, setSaleDetails] = useState<SaleDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const loadSaleDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await salesService.getSaleById(saleId);
      
      if (response.success && response.data) {
        const details: SaleDetails = {
          sale: response.data
        };
        
        setSaleDetails(details);
      } else {
        setError('Sale not found');
      }
    } catch (error) {
      console.error('Failed to load sale details:', error);
      setError('Failed to load sale details');
    } finally {
      setLoading(false);
    }
  }, [saleId]);

  useEffect(() => {
    if (saleId) {
      loadSaleDetails();
    }
  }, [saleId, loadSaleDetails]);

  const handleDeleteSale = () => {
    if (!saleDetails?.sale) return;

    confirm({
      title: 'Delete Sale',
      message: `Are you sure you want to delete this sale? This action cannot be undone.`,
      confirmText: 'Delete',
      variant: 'danger'
    }, async () => {
      try {
        const response = await salesService.deleteSale(saleId);
        if (response.success) {
          setToast({ message: 'Sale deleted successfully', type: 'success' });
          setTimeout(() => {
            router.push('/sales');
          }, 1000);
        } else {
          setToast({ message: response.error || 'Failed to delete sale', type: 'error' });
        }
      } catch (error) {
        console.error('Failed to delete sale:', error);
        setToast({ message: 'Failed to delete sale', type: 'error' });
      }
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'cancelled':
      case 'refunded':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'refunded':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading sale details...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !saleDetails) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Alert variant="error" title="Error">
              {error || 'Sale not found'}
            </Alert>
          </div>
        </div>
      </AppLayout>
    );
  }

  const { sale } = saleDetails;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Simple Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/sales')}
          className="flex items-center gap-2 text-sm"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Sales
        </Button>

        {/* Sale Header */}
        <div 
          className="p-8 rounded-lg border"
          style={{ 
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)'
          }}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold">
                  <CurrencyDollarIcon className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
                    Sale #{sale.id.substring(0, 8)}
                  </h1>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(sale.status)}
                      <span 
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(sale.status)}`}
                      >
                        {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                      <CurrencyDollarIcon className="h-4 w-4" />
                      <span className="capitalize">{sale.paymentMethod.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                <div className="flex items-center gap-1">
                  <ClockIcon className="h-4 w-4" />
                  <span>Created {formatDate(sale.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ClockIcon className="h-4 w-4" />
                  <span>Updated {formatDate(sale.updatedAt)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/sales/${sale.id}/edit`)}
                className="flex items-center gap-2"
              >
                <PencilIcon className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={handleDeleteSale}
                className="flex items-center gap-2 text-red-600 hover:text-red-700"
              >
                <TrashIcon className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        {/* Sale Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Information */}
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
                Customer Information
              </h2>
            </div>
            
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                  Customer:
                </span>
                <p style={{ color: 'var(--muted-foreground)' }}>
                  {sale.customerName || 'Walk-in Customer'}
                </p>
              </div>
              
              {sale.customerId && (
                <div>
                  <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                    Customer ID:
                  </span>
                  <p style={{ color: 'var(--muted-foreground)' }}>
                    {sale.customerId}
                  </p>
                </div>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => sale.customerId && router.push(`/customers/${sale.customerId}`)}
                disabled={!sale.customerId}
                className="mt-3"
              >
                View Customer Profile
              </Button>
            </div>
          </div>

          {/* Financial Summary */}
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
                Financial Summary
              </h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span style={{ color: 'var(--muted-foreground)' }}>Subtotal:</span>
                <span className="font-semibold" style={{ color: 'var(--foreground)' }}>
                  {formatCurrency(sale.subtotal)}
                </span>
              </div>
              
              {sale.discount > 0 && (
                <div className="flex justify-between">
                  <span style={{ color: 'var(--muted-foreground)' }}>Discount:</span>
                  <span className="font-semibold text-green-600">
                    -{formatCurrency(sale.discount)}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span style={{ color: 'var(--muted-foreground)' }}>Tax:</span>
                <span className="font-semibold" style={{ color: 'var(--foreground)' }}>
                  {formatCurrency(sale.tax)}
                </span>
              </div>
              
              <div className="border-t pt-3" style={{ borderColor: 'var(--border)' }}>
                <div className="flex justify-between">
                  <span className="font-semibold" style={{ color: 'var(--foreground)' }}>Total:</span>
                  <span className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
                    {formatCurrency(sale.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sale Items */}
        <div 
          className="p-6 rounded-lg border"
          style={{ 
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)'
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <TagIcon className="h-5 w-5" style={{ color: 'var(--accent)' }} />
            <h2 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
              Sale Items ({sale.items.length})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--foreground)' }}>
                    Product
                  </th>
                  <th className="text-right py-3 px-4 font-medium" style={{ color: 'var(--foreground)' }}>
                    Quantity
                  </th>
                  <th className="text-right py-3 px-4 font-medium" style={{ color: 'var(--foreground)' }}>
                    Unit Price
                  </th>
                  <th className="text-right py-3 px-4 font-medium" style={{ color: 'var(--foreground)' }}>
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {sale.items.map((item, index) => (
                  <tr key={index} className="border-b" style={{ borderColor: 'var(--border)' }}>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium" style={{ color: 'var(--foreground)' }}>
                          {item.productName}
                        </div>
                        <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                          ID: {item.productId.substring(0, 8)}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span style={{ color: 'var(--foreground)' }}>{item.quantity}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span style={{ color: 'var(--foreground)' }}>{formatCurrency(item.unitPrice)}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-medium" style={{ color: 'var(--foreground)' }}>
                        {formatCurrency(item.total)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes */}
        {sale.notes && (
          <div 
            className="p-6 rounded-lg border"
            style={{ 
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)'
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <DocumentTextIcon className="h-5 w-5" style={{ color: 'var(--accent)' }} />
              <h2 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                Notes
              </h2>
            </div>
            <p style={{ color: 'var(--muted-foreground)' }}>
              {sale.notes}
            </p>
          </div>
        )}

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
