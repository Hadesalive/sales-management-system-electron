'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/core';
import { Input, Textarea, Switch } from '@/components/ui/forms';
import { FormSection } from '@/components/ui/forms';
import { Customer } from '@/lib/types/core';
import { useSettings } from '@/contexts/SettingsContext';
import { XMarkIcon, PhotoIcon, TrashIcon } from '@heroicons/react/24/outline';

interface CustomerFormProps {
  customer?: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  title?: string;
}

interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  company?: string;
  notes?: string;
  isActive: boolean;
  avatar?: string;
}

export function CustomerForm({ 
  customer, 
  isOpen, 
  onClose, 
  onSave, 
  title = "Add Customer" 
}: CustomerFormProps) {
  const { formatDate } = useSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    company: '',
    notes: '',
    isActive: true,
    avatar: ''
  });
  const [errors, setErrors] = useState<Partial<CustomerFormData>>({});
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        company: customer.company || '',
        notes: customer.notes || '',
        isActive: customer.isActive !== false,
        avatar: customer.avatar || ''
      });
      setAvatarPreview(customer.avatar || '');
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        company: '',
        notes: '',
        isActive: true,
        avatar: ''
      });
      setAvatarPreview('');
    }
    setErrors({});
  }, [customer, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Partial<CustomerFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
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
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined,
        company: formData.company?.trim() || undefined,
        notes: formData.notes?.trim() || undefined,
        isActive: formData.isActive,
        avatar: formData.avatar || undefined,
      });
      onClose();
    } catch (error) {
      console.error('Failed to save customer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CustomerFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, avatar: 'Please select a valid image file' }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, avatar: 'Image size must be less than 5MB' }));
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setFormData(prev => ({ ...prev, avatar: base64 }));
      setAvatarPreview(base64);
      setErrors(prev => ({ ...prev, avatar: undefined }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setFormData(prev => ({ ...prev, avatar: '' }));
    setAvatarPreview('');
    setErrors(prev => ({ ...prev, avatar: undefined }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/20 dark:bg-black/20 flex items-center justify-center p-4 z-50">
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--card)' }}
      >
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
                    label="Full Name *"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    error={errors.name}
                    placeholder="Enter customer's full name"
                  />
                </div>
                
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  error={errors.email}
                  placeholder="customer@example.com"
                />
                
                <Input
                  label="Phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  error={errors.phone}
                  placeholder="+1 (555) 123-4567"
                />
                
                <Input
                  label="Company"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  placeholder="Company name (optional)"
                />
              </div>
            </FormSection>

            {/* Avatar Upload */}
            <FormSection title="Profile Picture">
              <div className="flex items-start gap-6">
                {/* Avatar Preview */}
                <div className="flex-shrink-0">
                  {avatarPreview ? (
                    <div className="relative">
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="w-24 h-24 rounded-full object-cover border-2"
                        style={{ borderColor: 'var(--border)' }}
                      />
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                      >
                        <TrashIcon className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div 
                      className="w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center"
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
                        Upload Profile Picture
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
                    {errors.avatar && (
                      <p className="text-sm text-red-600">{errors.avatar}</p>
                    )}
                  </div>
                </div>
              </div>
            </FormSection>

            {/* Address Information */}
            <FormSection title="Address Information">
              <Textarea
                label="Address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter full address..."
                rows={3}
              />
            </FormSection>

            {/* Additional Information */}
            <FormSection title="Additional Information">
              <Textarea
                label="Notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any additional notes about this customer..."
                rows={3}
              />
              
              <div className="flex items-center gap-3">
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                />
                <div>
                  <label className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                    Active Customer
                  </label>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Inactive customers won&apos;t appear in customer lists by default
                  </p>
                </div>
              </div>
            </FormSection>

            {/* Customer Information Display (for edit mode) */}
            {customer && (
              <FormSection title="Customer Information">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium" style={{ color: 'var(--muted-foreground)' }}>
                      Customer ID:
                    </span>
                    <span className="ml-2" style={{ color: 'var(--foreground)' }}>
                      {customer.id}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium" style={{ color: 'var(--muted-foreground)' }}>
                      Created:
                    </span>
                    <span className="ml-2" style={{ color: 'var(--foreground)' }}>
                      {formatDate(customer.createdAt)}
                    </span>
                  </div>
                  {customer.updatedAt !== customer.createdAt && (
                    <div className="md:col-span-2">
                      <span className="font-medium" style={{ color: 'var(--muted-foreground)' }}>
                        Last Updated:
                      </span>
                      <span className="ml-2" style={{ color: 'var(--foreground)' }}>
                        {formatDate(customer.updatedAt)}
                      </span>
                    </div>
                  )}
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
                  {customer ? 'Update Customer' : 'Add Customer'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
