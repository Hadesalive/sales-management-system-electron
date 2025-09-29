'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layouts/app-layout';
import { Button, Alert, Toast } from '@/components/ui/core';
import { ProductForm } from '@/components/ui/forms/product-form';
import { ConfirmationDialog } from '@/components/ui/dialogs/confirmation-dialog';
import { useConfirmation } from '@/lib/hooks/useConfirmation';
import { productService } from '@/lib/services';
import { Product } from '@/lib/types/core';
import { useSettings } from '@/contexts/SettingsContext';
import { 
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  TagIcon,
  CurrencyDollarIcon,
  CubeIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface ProductDetails {
  product: Product;
}

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { formatCurrency, formatDate } = useSettings();
  const { isOpen, options, confirm, handleConfirm, handleClose } = useConfirmation();
  
  const productId = params.id as string;
  
  const [productDetails, setProductDetails] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (productId) {
      loadProductDetails();
    }
  }, [productId]);

  const loadProductDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await productService.getProductById(productId);
      
      if (response.success && response.data) {
        const details: ProductDetails = {
          product: response.data
        };
        
        setProductDetails(details);
      } else {
        setError('Product not found');
      }
    } catch (error) {
      console.error('Failed to load product details:', error);
      setError('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await productService.updateProduct(productId, productData);

      if (response.success) {
        setToast({ message: 'Product updated successfully!', type: 'success' });
        setShowEditForm(false);
        loadProductDetails();
      } else {
        setToast({ message: response.error || 'Failed to update product', type: 'error' });
      }
    } catch (error) {
      console.error('Failed to update product:', error);
      setToast({ message: 'Failed to update product', type: 'error' });
    }
  };

  const handleDeleteProduct = () => {
    if (!productDetails?.product) return;

    confirm({
      title: 'Delete Product',
      message: `Are you sure you want to delete "${productDetails.product.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      variant: 'danger'
    }, async () => {
      try {
        const response = await productService.deleteProduct(productId);
        if (response.success) {
          setToast({ message: 'Product deleted successfully', type: 'success' });
          setTimeout(() => {
            router.push('/products');
          }, 1000);
        }
      } catch (error) {
        console.error('Failed to delete product:', error);
        setToast({ message: 'Failed to delete product', type: 'error' });
      }
    });
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading product details...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !productDetails) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Alert variant="error" title="Error">
              {error || 'Product not found'}
            </Alert>
          </div>
        </div>
      </AppLayout>
    );
  }

  const { product } = productDetails;
  const isLowStock = product.minStock && product.stock <= product.minStock;
  const profitMargin = product.cost ? product.price - product.cost : 0;
  const profitMarginPercent = product.cost ? ((profitMargin / product.price) * 100).toFixed(1) : 0;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Simple Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/products')}
          className="flex items-center gap-2 text-sm"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back
        </Button>

        {/* Product Header */}
        <div 
          className="p-8 rounded-lg border"
          style={{ 
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)'
          }}
        >
          <div className="flex items-start gap-6">
            {/* Large Product Image */}
            <div className="flex-shrink-0">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-24 w-24 rounded-lg object-cover border-4 shadow-lg"
                  style={{ borderColor: 'var(--border)' }}
                />
              ) : (
                <div className="h-24 w-24 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {product.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
                    {product.name}
                  </h1>
                  {product.description && (
                    <p className="text-lg mb-4" style={{ color: 'var(--muted-foreground)' }}>
                      {product.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4" />
                      <span>Added {formatDate(product.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ClockIcon className="h-4 w-4" />
                      <span>Updated {formatDate(product.updatedAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
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
                    onClick={handleDeleteProduct}
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

        {/* Product Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pricing Information */}
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
                Pricing Information
              </h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span style={{ color: 'var(--muted-foreground)' }}>Selling Price:</span>
                <span className="font-semibold" style={{ color: 'var(--foreground)' }}>
                  {formatCurrency(product.price)}
                </span>
              </div>
              
              {product.cost && (
                <>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--muted-foreground)' }}>Cost Price:</span>
                    <span className="font-semibold" style={{ color: 'var(--foreground)' }}>
                      {formatCurrency(product.cost)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--muted-foreground)' }}>Profit Margin:</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(profitMargin)} ({profitMarginPercent}%)
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Inventory Information */}
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
                Inventory Information
              </h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span style={{ color: 'var(--muted-foreground)' }}>Current Stock:</span>
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${isLowStock ? 'text-red-600' : ''}`}>
                    {product.stock}
                  </span>
                  {isLowStock && (
                    <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
              
              {product.minStock && (
                <div className="flex justify-between">
                  <span style={{ color: 'var(--muted-foreground)' }}>Minimum Stock:</span>
                  <span className="font-semibold" style={{ color: 'var(--foreground)' }}>
                    {product.minStock}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span style={{ color: 'var(--muted-foreground)' }}>Total Value:</span>
                <span className="font-semibold" style={{ color: 'var(--foreground)' }}>
                  {formatCurrency(product.price * product.stock)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
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
              Additional Information
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                SKU:
              </span>
              <p style={{ color: 'var(--muted-foreground)' }}>
                {product.sku || 'Not specified'}
              </p>
            </div>
            
            <div>
              <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                Category:
              </span>
              <p style={{ color: 'var(--muted-foreground)' }}>
                {product.category || 'Uncategorized'}
              </p>
            </div>
            
            <div>
              <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                Status:
              </span>
              <p style={{ color: 'var(--muted-foreground)' }}>
                {product.isActive !== false ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        {isLowStock && (
          <Alert variant="warning" title="Low Stock Alert">
            <p>
              This product is running low on stock ({product.stock} remaining). 
              Consider restocking to avoid stockouts.
            </p>
          </Alert>
        )}

        {/* Edit Product Form Modal */}
        <ProductForm
          product={product}
          isOpen={showEditForm}
          onClose={() => setShowEditForm(false)}
          onSave={handleSaveProduct}
          title="Edit Product"
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
