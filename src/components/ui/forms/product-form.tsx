'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/core';
import { Input, Textarea, Switch } from '@/components/ui/forms';
import { FormSection } from '@/components/ui/forms';
import { Product } from '@/lib/types/core';
import { useSettings } from '@/contexts/SettingsContext';
import { XMarkIcon, PhotoIcon, TrashIcon } from '@heroicons/react/24/outline';

interface ProductFormProps {
  product?: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  title?: string;
}

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  cost: number;
  sku: string;
  category: string;
  stock: number;
  minStock: number;
  image: string;
  isActive: boolean;
}

export function ProductForm({ 
  product, 
  isOpen, 
  onClose, 
  onSave, 
  title = "Add Product" 
}: ProductFormProps) {
  const { formatCurrency } = useSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    cost: 0,
    sku: '',
    category: '',
    stock: 0,
    minStock: 0,
    image: '',
    isActive: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || 0,
        cost: product.cost || 0,
        sku: product.sku || '',
        category: product.category || '',
        stock: product.stock || 0,
        minStock: product.minStock || 0,
        image: product.image || '',
        isActive: product.isActive !== false
      });
      setImagePreview(product.image || '');
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        cost: 0,
        sku: '',
        category: '',
        stock: 0,
        minStock: 0,
        image: '',
        isActive: true
      });
      setImagePreview('');
    }
    setErrors({});
  }, [product, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (formData.stock < 0) {
      newErrors.stock = 'Stock cannot be negative';
    }

    if (formData.minStock < 0) {
      newErrors.minStock = 'Minimum stock cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSave({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        price: formData.price,
        cost: formData.cost || undefined,
        sku: formData.sku.trim() || undefined,
        category: formData.category.trim() || undefined,
        stock: formData.stock,
        minStock: formData.minStock || undefined,
        image: formData.image || undefined,
        isActive: formData.isActive,
      });
      onClose();
    } catch (error) {
      console.error('Failed to save product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProductFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, image: 'Please select a valid image file' }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: 'Image size must be less than 5MB' }));
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setFormData(prev => ({ ...prev, image: base64 }));
      setImagePreview(base64);
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.image;
        return newErrors;
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image: '' }));
    setImagePreview('');
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.image;
      return newErrors;
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/20 dark:bg-black/20 flex items-center justify-center p-4 z-50">
      <div 
        className="rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--card)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
            {title}
          </h2>
          <Button
            variant="ghost"
            onClick={onClose}
            className="p-2"
          >
            <XMarkIcon className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Basic Information */}
            <FormSection title="Basic Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Input
                    label="Product Name *"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    error={errors.name}
                    placeholder="Enter product name"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Textarea
                    label="Description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Product description"
                    rows={3}
                  />
                </div>

                <Input
                  label="SKU"
                  value={formData.sku}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                  placeholder="Product SKU (optional)"
                />

                <Input
                  label="Category"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  placeholder="Product category"
                />
              </div>
            </FormSection>

            {/* Product Image */}
            <FormSection title="Product Image">
              <div className="flex items-start gap-6">
                {/* Image Preview */}
                <div className="flex-shrink-0">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Product preview"
                        className="w-24 h-24 rounded-lg object-cover border-2"
                        style={{ borderColor: 'var(--border)' }}
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                      >
                        <TrashIcon className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div 
                      className="w-24 h-24 rounded-lg border-2 border-dashed flex items-center justify-center"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <PhotoIcon className="h-8 w-8" style={{ color: 'var(--muted-foreground)' }} />
                    </div>
                  )}
                </div>

                {/* Upload Controls */}
                <div className="flex-1">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                        Upload Product Image
                      </label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full"
                      >
                        <PhotoIcon className="h-4 w-4 mr-2" />
                        Choose Image
                      </Button>
                      <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </div>
                    {errors.image && (
                      <p className="text-sm text-red-600">{errors.image}</p>
                    )}
                  </div>
                </div>
              </div>
            </FormSection>

            {/* Pricing & Inventory */}
            <FormSection title="Pricing & Inventory">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Selling Price *"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  error={errors.price}
                  placeholder="0.00"
                />

                <Input
                  label="Cost Price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.cost}
                  onChange={(e) => handleInputChange('cost', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />

                <Input
                  label="Current Stock *"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                  error={errors.stock}
                  placeholder="0"
                />

                <Input
                  label="Minimum Stock"
                  type="number"
                  min="0"
                  value={formData.minStock}
                  onChange={(e) => handleInputChange('minStock', parseInt(e.target.value) || 0)}
                  error={errors.minStock}
                  placeholder="0"
                />
              </div>

              {/* Profit Margin Display */}
              {formData.price > 0 && formData.cost > 0 && (
                <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                      Profit Margin:
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(formData.price - formData.cost)} ({(((formData.price - formData.cost) / formData.price) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              )}
            </FormSection>

            {/* Status */}
            <FormSection title="Status">
              <div className="flex items-center gap-3">
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                />
                <div>
                  <label className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                    Active Product
                  </label>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Inactive products won&apos;t appear in product lists by default
                  </p>
                </div>
              </div>
            </FormSection>

            {/* Product Info (for editing) */}
            {product && (
              <FormSection title="Product Information">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium" style={{ color: 'var(--foreground)' }}>Product ID:</span>
                    <p style={{ color: 'var(--muted-foreground)' }}>{product.id}</p>
                  </div>
                  <div>
                    <span className="font-medium" style={{ color: 'var(--foreground)' }}>Created:</span>
                    <p style={{ color: 'var(--muted-foreground)' }}>{new Date(product.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="font-medium" style={{ color: 'var(--foreground)' }}>Last Updated:</span>
                    <p style={{ color: 'var(--muted-foreground)' }}>{new Date(product.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </FormSection>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  {product ? 'Update Product' : 'Add Product'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
