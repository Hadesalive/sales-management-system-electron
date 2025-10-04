# 🏗️ Invoice System - Clean Architecture Implementation Plan

## 📋 Executive Summary

This document outlines a **clean, industry-standard architecture** for the invoice system with editable headers, footers, logo support, and template customization. The design follows **separation of concerns**, **dependency injection**, and **maintainable code patterns**.

---

## 🎯 Current State Analysis

### ✅ What's Working
1. **Template System**: 10 unique invoice templates with distinct headers/footers
2. **Component Architecture**: Separated renderers from template definitions
3. **UI/UX**: Editable header/footer sections in invoice details page
4. **Data Flow**: Electron IPC → Database Service → React Components
5. **Settings Context**: Company information persisted via SettingsContext

### ⚠️ Issues to Address
1. **Logo Storage**: Currently using base64 strings (not scalable/persistent)
2. **No Invoice Service Layer**: Business logic mixed in components
3. **Template Persistence**: Templates not saved to database
4. **Type Safety**: Inconsistent type definitions across invoice data
5. **No Validation Layer**: Missing data validation for invoices
6. **Mock Data**: Using hardcoded mock data instead of real database queries

---

## 🏛️ Proposed Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
├─────────────────────────────────────────────────────────────┤
│  Invoice Pages (List, Detail, Edit, Templates)              │
│  ├─ Invoice Components (Preview, Editor, Header/Footer)     │
│  └─ Template Components (Renderer, Selector, Customizer)    │
└─────────────────────────────────────────────────────────────┘
                            ↕️
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                         │
├─────────────────────────────────────────────────────────────┤
│  Services (Business Logic)                                   │
│  ├─ InvoiceService (CRUD, generate, export)                 │
│  ├─ TemplateService (manage, customize, apply)              │
│  └─ AssetService (logo upload, storage, retrieval)          │
│                                                              │
│  Hooks (State Management)                                    │
│  ├─ useInvoice (data fetching, mutations)                   │
│  ├─ useTemplate (template management)                        │
│  └─ useAssets (logo/asset handling)                         │
│                                                              │
│  Validators (Data Validation)                                │
│  └─ invoiceValidator.ts                                      │
└─────────────────────────────────────────────────────────────┘
                            ↕️
┌─────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE LAYER                      │
├─────────────────────────────────────────────────────────────┤
│  Electron IPC Handlers                                       │
│  ├─ invoice-handlers.js (invoice CRUD)                       │
│  ├─ template-handlers.js (template management)               │
│  └─ asset-handlers.js (file upload/storage)                 │
│                                                              │
│  Database Service                                            │
│  ├─ invoices table (invoice data)                           │
│  ├─ invoice_templates table (saved templates)                │
│  ├─ invoice_assets table (logos, images)                    │
│  └─ company_settings table (default company info)            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗂️ File Structure

```
src/
├── app/
│   └── invoices/
│       ├── page.tsx                         # List view
│       ├── [id]/
│       │   ├── page.tsx                     # Detail view ✨ REFACTOR
│       │   └── edit/
│       │       └── page.tsx                 # Edit view ✨ REFACTOR
│       └── templates/
│           └── page.tsx                     # Template gallery
│
├── components/
│   └── ui/
│       └── invoice/
│           ├── invoice-header-editor.tsx    # ✨ NEW: Editable header
│           ├── invoice-footer-editor.tsx    # ✨ NEW: Editable footer
│           ├── invoice-logo-uploader.tsx    # ✨ NEW: Logo management
│           ├── invoice-preview.tsx          # Refactored preview
│           ├── invoice-templates.tsx        # Template selector (exists)
│           ├── dynamic-invoice-preview.tsx  # Dynamic renderer (exists)
│           ├── template-renderers/
│           │   ├── index.tsx                # Renderer orchestrator
│           │   ├── classic-header-renderer.tsx
│           │   ├── gradient-modern-renderer.tsx
│           │   └── wave-design-renderer.tsx
│           └── templates/
│               └── index.ts                 # Template definitions
│
├── lib/
│   ├── services/
│   │   ├── invoice.service.ts              # ✨ NEW: Invoice business logic
│   │   ├── template.service.ts             # ✨ NEW: Template management
│   │   └── asset.service.ts                # ✨ NEW: File management
│   │
│   ├── hooks/
│   │   ├── use-invoice.ts                  # ✨ NEW: Invoice data hook
│   │   ├── use-template.ts                 # ✨ NEW: Template hook
│   │   └── use-assets.ts                   # ✨ NEW: Asset hook
│   │
│   ├── validators/
│   │   └── invoice.validator.ts            # ✨ NEW: Validation logic
│   │
│   └── types/
│       ├── invoice.ts                       # ✅ EXISTS (refine)
│       └── template.ts                      # ✨ NEW: Template types
│
├── contexts/
│   └── InvoiceContext.tsx                   # ✨ NEW: Invoice state context
│
electron/
├── handlers/
│   ├── invoice-handlers.js                  # ✨ NEW: Invoice IPC
│   ├── template-handlers.js                 # ✨ NEW: Template IPC
│   └── asset-handlers.js                    # ✨ NEW: Asset IPC
│
└── services/
    └── database-service.js                  # ✅ EXISTS (extend)
```

---

## 📐 Data Models

### 1. Invoice Schema (Database)

```typescript
interface Invoice {
  // Primary
  id: string;
  number: string;                    // INV-2024-001
  type: InvoiceType;
  status: InvoiceStatus;
  
  // Dates
  issueDate: string;                 // ISO 8601
  dueDate: string;
  sentDate?: string;
  paidDate?: string;
  
  // Company Info (can override defaults)
  company: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
    email: string;
    website?: string;
    logoId?: string;                 // Reference to asset
  };
  
  // Customer Info
  customer: {
    id?: string;                     // Link to customer table
    name: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    phone?: string;
  };
  
  // Line Items
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  
  // Financial
  subtotal: number;
  taxRate: number;
  tax: number;
  discount: number;
  total: number;
  paid: number;
  balance: number;
  
  // Content
  notes?: string;
  terms?: string;
  
  // Template & Customization
  templateId: string;                // Reference to template
  customization?: {
    colors?: Partial<TemplateColors>;
    fonts?: Partial<TemplateFonts>;
    layout?: Partial<TemplateLayout>;
  };
  
  // Assets
  brandLogoIds?: string[];           // References to assets
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}
```

### 2. Template Schema

```typescript
interface InvoiceTemplate {
  id: string;
  name: string;
  description: string;
  category: 'business' | 'creative' | 'minimal' | 'modern' | 'professional';
  
  // Visual Design
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  
  fonts: {
    primary: string;
    secondary: string;
    size: 'small' | 'medium' | 'large';
  };
  
  layout: {
    headerStyle: 'minimal' | 'classic' | 'modern' | 'premium';
    footerStyle: 'minimal' | 'detailed' | 'signature' | 'compact';
    showLogo: boolean;
    showBorder: boolean;
    itemTableStyle: 'simple' | 'detailed' | 'modern';
  };
  
  // System
  isDefault: boolean;
  isCustom: boolean;                 // User-created template
  createdAt: string;
  updatedAt: string;
}
```

### 3. Asset Schema

```typescript
interface InvoiceAsset {
  id: string;
  type: 'company_logo' | 'brand_logo' | 'signature' | 'watermark';
  filename: string;
  mimeType: string;
  size: number;                      // bytes
  path: string;                      // filesystem path
  url?: string;                      // public URL if needed
  thumbnail?: string;                // base64 thumbnail for quick preview
  
  // Metadata
  uploadedAt: string;
  uploadedBy?: string;
}
```

---

## 🔧 Implementation Steps

### Phase 1: Foundation (Database & Types) ⏱️ 2-3 hours

**Goal**: Set up database tables and TypeScript types

#### 1.1 Create Database Tables
```sql
-- File: electron/migrations/001_invoice_tables.sql

CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  number TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  issue_date TEXT NOT NULL,
  due_date TEXT NOT NULL,
  sent_date TEXT,
  paid_date TEXT,
  
  -- Company (JSON)
  company_data TEXT NOT NULL,
  
  -- Customer (JSON)
  customer_data TEXT NOT NULL,
  
  -- Items (JSON array)
  items TEXT NOT NULL,
  
  -- Financial
  subtotal REAL NOT NULL,
  tax_rate REAL NOT NULL DEFAULT 0,
  tax REAL NOT NULL DEFAULT 0,
  discount REAL NOT NULL DEFAULT 0,
  total REAL NOT NULL,
  paid REAL NOT NULL DEFAULT 0,
  balance REAL NOT NULL,
  
  -- Content
  notes TEXT,
  terms TEXT,
  
  -- Template
  template_id TEXT NOT NULL,
  customization TEXT,              -- JSON
  
  -- Assets
  brand_logo_ids TEXT,             -- JSON array
  
  -- Metadata
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  created_by TEXT
);

CREATE TABLE IF NOT EXISTS invoice_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  colors TEXT NOT NULL,            -- JSON
  fonts TEXT NOT NULL,             -- JSON
  layout TEXT NOT NULL,            -- JSON
  is_default INTEGER DEFAULT 0,
  is_custom INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS invoice_assets (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  path TEXT NOT NULL,
  url TEXT,
  thumbnail TEXT,
  uploaded_at TEXT NOT NULL,
  uploaded_by TEXT
);

-- Indexes
CREATE INDEX idx_invoices_number ON invoices(number);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_customer ON invoices(customer_data);
CREATE INDEX idx_assets_type ON invoice_assets(type);
```

#### 1.2 Update Type Definitions
```typescript
// File: src/lib/types/invoice.ts
// (Already mostly defined - refine based on schema above)

// File: src/lib/types/template.ts ✨ NEW
export interface TemplateColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface TemplateFonts {
  primary: string;
  secondary: string;
  size: 'small' | 'medium' | 'large';
}

export interface TemplateLayout {
  headerStyle: 'minimal' | 'classic' | 'modern' | 'premium';
  footerStyle: 'minimal' | 'detailed' | 'signature' | 'compact';
  showLogo: boolean;
  showBorder: boolean;
  itemTableStyle: 'simple' | 'detailed' | 'modern';
}

export interface InvoiceTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  colors: TemplateColors;
  fonts: TemplateFonts;
  layout: TemplateLayout;
  isDefault: boolean;
  isCustom: boolean;
  createdAt: string;
  updatedAt: string;
}

// File: src/lib/types/asset.ts ✨ NEW
export type AssetType = 'company_logo' | 'brand_logo' | 'signature' | 'watermark';

export interface InvoiceAsset {
  id: string;
  type: AssetType;
  filename: string;
  mimeType: string;
  size: number;
  path: string;
  url?: string;
  thumbnail?: string;
  uploadedAt: string;
  uploadedBy?: string;
}
```

---

### Phase 2: Service Layer ⏱️ 3-4 hours

**Goal**: Create clean business logic services

#### 2.1 Invoice Service
```typescript
// File: src/lib/services/invoice.service.ts ✨ NEW

import { BaseService } from './base.service';
import { Invoice, InvoiceStatus, InvoiceType } from '../types/invoice';
import { ApiResponse } from '../types/core';

export class InvoiceService extends BaseService {
  // CRUD Operations
  async getInvoices(): Promise<ApiResponse<Invoice[]>> {
    try {
      const response = await window.electronAPI?.getInvoices();
      return response || this.createErrorResponse('Electron API not available');
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getInvoiceById(id: string): Promise<ApiResponse<Invoice>> {
    try {
      const response = await window.electronAPI?.getInvoiceById(id);
      return response || this.createErrorResponse('Invoice not found');
    } catch (error) {
      return this.handleError(error);
    }
  }

  async createInvoice(data: Partial<Invoice>): Promise<ApiResponse<Invoice>> {
    // Validate
    const errors = this.validateInvoiceData(data);
    if (errors.length > 0) {
      return this.createErrorResponse(errors.join(', '));
    }

    try {
      const response = await window.electronAPI?.createInvoice(data);
      return response || this.createErrorResponse('Failed to create invoice');
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateInvoice(id: string, data: Partial<Invoice>): Promise<ApiResponse<Invoice>> {
    try {
      const response = await window.electronAPI?.updateInvoice(id, data);
      return response || this.createErrorResponse('Failed to update invoice');
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deleteInvoice(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await window.electronAPI?.deleteInvoice(id);
      return response || this.createErrorResponse('Failed to delete invoice');
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Business Logic
  async generateInvoiceNumber(): Promise<string> {
    // Format: INV-YYYY-MM-####
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    
    // Get last invoice number for this month
    const invoices = await this.getInvoices();
    const thisMonthInvoices = invoices.data?.filter(inv => 
      inv.number.startsWith(`INV-${year}-${month}`)
    ) || [];
    
    const nextNum = thisMonthInvoices.length + 1;
    return `INV-${year}-${month}-${String(nextNum).padStart(4, '0')}`;
  }

  calculateTotals(items: Array<{quantity: number; rate: number}>, taxRate: number, discount: number) {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax - discount;
    
    return {
      subtotal,
      tax,
      total,
    };
  }

  // Validation
  private validateInvoiceData(data: Partial<Invoice>): string[] {
    const errors: string[] = [];
    
    if (!data.customer?.name) errors.push('Customer name is required');
    if (!data.company?.name) errors.push('Company name is required');
    if (!data.items || data.items.length === 0) errors.push('At least one item is required');
    if (!data.issueDate) errors.push('Issue date is required');
    if (!data.dueDate) errors.push('Due date is required');
    
    return errors;
  }
}

export const invoiceService = new InvoiceService();
```

#### 2.2 Template Service
```typescript
// File: src/lib/services/template.service.ts ✨ NEW

import { BaseService } from './base.service';
import { InvoiceTemplate } from '../types/template';
import { ApiResponse } from '../types/core';

export class TemplateService extends BaseService {
  async getTemplates(): Promise<ApiResponse<InvoiceTemplate[]>> {
    try {
      const response = await window.electronAPI?.getTemplates();
      return response || this.createErrorResponse('Failed to load templates');
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getTemplateById(id: string): Promise<ApiResponse<InvoiceTemplate>> {
    try {
      const response = await window.electronAPI?.getTemplateById(id);
      return response || this.createErrorResponse('Template not found');
    } catch (error) {
      return this.handleError(error);
    }
  }

  async saveCustomTemplate(template: Partial<InvoiceTemplate>): Promise<ApiResponse<InvoiceTemplate>> {
    try {
      const templateData = {
        ...template,
        id: this.generateId(),
        isCustom: true,
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const response = await window.electronAPI?.saveTemplate(templateData);
      return response || this.createErrorResponse('Failed to save template');
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateTemplate(id: string, updates: Partial<InvoiceTemplate>): Promise<ApiResponse<InvoiceTemplate>> {
    try {
      const response = await window.electronAPI?.updateTemplate(id, updates);
      return response || this.createErrorResponse('Failed to update template');
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deleteTemplate(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await window.electronAPI?.deleteTemplate(id);
      return response || this.createErrorResponse('Failed to delete template');
    } catch (error) {
      return this.handleError(error);
    }
  }
}

export const templateService = new TemplateService();
```

#### 2.3 Asset Service
```typescript
// File: src/lib/services/asset.service.ts ✨ NEW

import { BaseService } from './base.service';
import { InvoiceAsset, AssetType } from '../types/asset';
import { ApiResponse } from '../types/core';

export class AssetService extends BaseService {
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];

  async uploadAsset(file: File, type: AssetType): Promise<ApiResponse<InvoiceAsset>> {
    // Validate file
    const validation = this.validateFile(file);
    if (!validation.valid) {
      return this.createErrorResponse(validation.error!);
    }

    try {
      // Convert to base64 or buffer for IPC transfer
      const buffer = await this.fileToBuffer(file);
      
      const response = await window.electronAPI?.uploadAsset({
        type,
        filename: file.name,
        mimeType: file.type,
        size: file.size,
        buffer,
      });
      
      return response || this.createErrorResponse('Failed to upload asset');
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getAssets(type?: AssetType): Promise<ApiResponse<InvoiceAsset[]>> {
    try {
      const response = await window.electronAPI?.getAssets(type);
      return response || this.createErrorResponse('Failed to load assets');
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getAssetById(id: string): Promise<ApiResponse<InvoiceAsset>> {
    try {
      const response = await window.electronAPI?.getAssetById(id);
      return response || this.createErrorResponse('Asset not found');
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deleteAsset(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await window.electronAPI?.deleteAsset(id);
      return response || this.createErrorResponse('Failed to delete asset');
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Validation
  private validateFile(file: File): { valid: boolean; error?: string } {
    if (file.size > this.MAX_FILE_SIZE) {
      return { valid: false, error: 'File size exceeds 5MB limit' };
    }
    
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return { valid: false, error: 'Only PNG, JPEG, and SVG files are allowed' };
    }
    
    return { valid: true };
  }

  private async fileToBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  // Generate thumbnail for quick preview
  async generateThumbnail(file: File, maxWidth: number = 100): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ratio = maxWidth / img.width;
          canvas.width = maxWidth;
          canvas.height = img.height * ratio;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

export const assetService = new AssetService();
```

---

### Phase 3: React Hooks ⏱️ 2-3 hours

**Goal**: Create reusable hooks for data management

#### 3.1 useInvoice Hook
```typescript
// File: src/lib/hooks/use-invoice.ts ✨ NEW

import { useState, useEffect, useCallback } from 'react';
import { invoiceService } from '../services/invoice.service';
import { Invoice } from '../types/invoice';

export function useInvoice(invoiceId?: string) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch single invoice
  const fetchInvoice = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    const response = await invoiceService.getInvoiceById(id);
    if (response.success && response.data) {
      setInvoice(response.data);
    } else {
      setError(response.error || 'Failed to load invoice');
    }
    
    setLoading(false);
  }, []);

  // Fetch all invoices
  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const response = await invoiceService.getInvoices();
    if (response.success && response.data) {
      setInvoices(response.data);
    } else {
      setError(response.error || 'Failed to load invoices');
    }
    
    setLoading(false);
  }, []);

  // Create invoice
  const createInvoice = useCallback(async (data: Partial<Invoice>) => {
    setLoading(true);
    setError(null);
    
    const response = await invoiceService.createInvoice(data);
    if (response.success && response.data) {
      setInvoice(response.data);
      return response.data;
    } else {
      setError(response.error || 'Failed to create invoice');
      return null;
    }
    
    setLoading(false);
  }, []);

  // Update invoice
  const updateInvoice = useCallback(async (id: string, data: Partial<Invoice>) => {
    setLoading(true);
    setError(null);
    
    const response = await invoiceService.updateInvoice(id, data);
    if (response.success && response.data) {
      setInvoice(response.data);
      return response.data;
    } else {
      setError(response.error || 'Failed to update invoice');
      return null;
    }
    
    setLoading(false);
  }, []);

  // Delete invoice
  const deleteInvoice = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    const response = await invoiceService.deleteInvoice(id);
    if (response.success) {
      setInvoice(null);
      return true;
    } else {
      setError(response.error || 'Failed to delete invoice');
      return false;
    }
    
    setLoading(false);
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    if (invoiceId) {
      fetchInvoice(invoiceId);
    }
  }, [invoiceId, fetchInvoice]);

  return {
    invoice,
    invoices,
    loading,
    error,
    fetchInvoice,
    fetchInvoices,
    createInvoice,
    updateInvoice,
    deleteInvoice,
  };
}
```

#### 3.2 useAssets Hook
```typescript
// File: src/lib/hooks/use-assets.ts ✨ NEW

import { useState, useCallback } from 'react';
import { assetService } from '../services/asset.service';
import { InvoiceAsset, AssetType } from '../types/asset';

export function useAssets() {
  const [assets, setAssets] = useState<InvoiceAsset[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadAsset = useCallback(async (file: File, type: AssetType) => {
    setUploading(true);
    setError(null);
    
    const response = await assetService.uploadAsset(file, type);
    if (response.success && response.data) {
      setAssets(prev => [...prev, response.data]);
      setUploading(false);
      return response.data;
    } else {
      setError(response.error || 'Failed to upload asset');
      setUploading(false);
      return null;
    }
  }, []);

  const fetchAssets = useCallback(async (type?: AssetType) => {
    const response = await assetService.getAssets(type);
    if (response.success && response.data) {
      setAssets(response.data);
    } else {
      setError(response.error || 'Failed to load assets');
    }
  }, []);

  const deleteAsset = useCallback(async (id: string) => {
    const response = await assetService.deleteAsset(id);
    if (response.success) {
      setAssets(prev => prev.filter(a => a.id !== id));
      return true;
    } else {
      setError(response.error || 'Failed to delete asset');
      return false;
    }
  }, []);

  return {
    assets,
    uploading,
    error,
    uploadAsset,
    fetchAssets,
    deleteAsset,
  };
}
```

---

### Phase 4: UI Components ⏱️ 4-5 hours

**Goal**: Create reusable, clean UI components

#### 4.1 Logo Uploader Component
```typescript
// File: src/components/ui/invoice/invoice-logo-uploader.tsx ✨ NEW

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '../core/button';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAssets } from '@/lib/hooks/use-assets';
import { AssetType } from '@/lib/types/asset';

interface LogoUploaderProps {
  type: AssetType;
  currentLogoId?: string;
  onLogoChange: (assetId: string | null) => void;
  label?: string;
  className?: string;
}

export function InvoiceLogoUploader({
  type,
  currentLogoId,
  onLogoChange,
  label = 'Upload Logo',
  className = ''
}: LogoUploaderProps) {
  const { uploadAsset, uploading, error } = useAssets();
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Upload to server
    const asset = await uploadAsset(file, type);
    if (asset) {
      onLogoChange(asset.id);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onLogoChange(null);
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
        {label}
      </label>
      
      <div className="flex items-center gap-4">
        {(preview || currentLogoId) && (
          <div className="relative">
            <Image
              src={preview || `/api/assets/${currentLogoId}`}
              alt="Logo"
              width={64}
              height={64}
              className="h-16 w-16 object-contain rounded border"
              style={{ borderColor: 'var(--border)' }}
            />
            <button
              onClick={handleRemove}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <XMarkIcon className="h-3 w-3" />
            </button>
          </div>
        )}
        
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            disabled={uploading}
          >
            <PhotoIcon className="h-4 w-4" />
            {uploading ? 'Uploading...' : (preview || currentLogoId) ? 'Change Logo' : 'Upload Logo'}
          </Button>
        </label>
      </div>
      
      {error && (
        <p className="text-sm text-red-600 mt-2">{error}</p>
      )}
      
      <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
        PNG, JPEG or SVG. Max 5MB.
      </p>
    </div>
  );
}
```

#### 4.2 Header Editor Component
```typescript
// File: src/components/ui/invoice/invoice-header-editor.tsx ✨ NEW

'use client';

import React from 'react';
import { Input } from '../forms/input';
import { InvoiceLogoUploader } from './invoice-logo-uploader';
import { Button } from '../core/button';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface CompanyInfo {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  website?: string;
  logoId?: string;
}

interface HeaderEditorProps {
  companyInfo: CompanyInfo;
  onUpdate: (info: CompanyInfo) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function InvoiceHeaderEditor({
  companyInfo,
  onUpdate,
  onSave,
  onCancel
}: HeaderEditorProps) {
  const handleChange = (field: keyof CompanyInfo, value: string) => {
    onUpdate({ ...companyInfo, [field]: value });
  };

  return (
    <div className="space-y-4">
      <InvoiceLogoUploader
        type="company_logo"
        currentLogoId={companyInfo.logoId}
        onLogoChange={(logoId) => handleChange('logoId', logoId || '')}
        label="Company Logo"
      />

      <Input
        label="Company Name"
        value={companyInfo.name}
        onChange={(e) => handleChange('name', e.target.value)}
        required
      />
      
      <Input
        label="Address"
        value={companyInfo.address}
        onChange={(e) => handleChange('address', e.target.value)}
      />
      
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="City"
          value={companyInfo.city}
          onChange={(e) => handleChange('city', e.target.value)}
        />
        <Input
          label="State"
          value={companyInfo.state}
          onChange={(e) => handleChange('state', e.target.value)}
        />
      </div>
      
      <Input
        label="ZIP Code"
        value={companyInfo.zip}
        onChange={(e) => handleChange('zip', e.target.value)}
      />
      
      <Input
        label="Phone"
        type="tel"
        value={companyInfo.phone}
        onChange={(e) => handleChange('phone', e.target.value)}
      />
      
      <Input
        label="Email"
        type="email"
        value={companyInfo.email}
        onChange={(e) => handleChange('email', e.target.value)}
      />
      
      <Input
        label="Website"
        value={companyInfo.website || ''}
        onChange={(e) => handleChange('website', e.target.value)}
      />

      <div className="flex gap-2 pt-4">
        <Button onClick={onSave} className="flex items-center gap-2">
          <CheckIcon className="h-4 w-4" />
          Save Changes
        </Button>
        <Button variant="outline" onClick={onCancel}>
          <XMarkIcon className="h-4 w-4" />
          Cancel
        </Button>
      </div>
    </div>
  );
}
```

---

### Phase 5: Electron Handlers ⏱️ 2-3 hours

**Goal**: Create IPC handlers for invoice, template, and asset operations

#### 5.1 Invoice Handlers
```javascript
// File: electron/handlers/invoice-handlers.js ✨ NEW

const { ipcMain } = require('electron');

function registerInvoiceHandlers(databaseService) {
  ipcMain.handle('get-invoices', async () => {
    try {
      const invoices = await databaseService.getInvoices();
      return { success: true, data: invoices };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('get-invoice-by-id', async (event, id) => {
    try {
      const invoice = await databaseService.getInvoiceById(id);
      return { success: true, data: invoice };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('create-invoice', async (event, invoiceData) => {
    try {
      const invoice = await databaseService.createInvoice(invoiceData);
      return { success: true, data: invoice };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('update-invoice', async (event, id, invoiceData) => {
    try {
      const invoice = await databaseService.updateInvoice(id, invoiceData);
      return { success: true, data: invoice };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('delete-invoice', async (event, id) => {
    try {
      await databaseService.deleteInvoice(id);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
}

module.exports = { registerInvoiceHandlers };
```

#### 5.2 Asset Handlers
```javascript
// File: electron/handlers/asset-handlers.js ✨ NEW

const { ipcMain, app } = require('electron');
const fs = require('fs').promises;
const path = require('path');

function registerAssetHandlers(databaseService) {
  const assetsDir = path.join(app.getPath('userData'), 'invoice-assets');
  
  // Ensure assets directory exists
  fs.mkdir(assetsDir, { recursive: true }).catch(console.error);

  ipcMain.handle('upload-asset', async (event, { type, filename, mimeType, size, buffer }) => {
    try {
      // Generate unique ID
      const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
      const ext = path.extname(filename);
      const savedFilename = `${id}${ext}`;
      const filepath = path.join(assetsDir, savedFilename);
      
      // Write file to disk
      await fs.writeFile(filepath, Buffer.from(buffer));
      
      // Save to database
      const asset = {
        id,
        type,
        filename,
        mimeType,
        size,
        path: filepath,
        uploadedAt: new Date().toISOString(),
      };
      
      await databaseService.createAsset(asset);
      return { success: true, data: asset };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('get-assets', async (event, type) => {
    try {
      const assets = await databaseService.getAssets(type);
      return { success: true, data: assets };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('get-asset-by-id', async (event, id) => {
    try {
      const asset = await databaseService.getAssetById(id);
      if (asset) {
        // Read file and return as base64
        const fileData = await fs.readFile(asset.path);
        asset.dataUrl = `data:${asset.mimeType};base64,${fileData.toString('base64')}`;
      }
      return { success: true, data: asset };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('delete-asset', async (event, id) => {
    try {
      const asset = await databaseService.getAssetById(id);
      if (asset) {
        // Delete file from disk
        await fs.unlink(asset.path).catch(() => {});
        // Delete from database
        await databaseService.deleteAsset(id);
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
}

module.exports = { registerAssetHandlers };
```

---

### Phase 6: Refactor Invoice Pages ⏱️ 3-4 hours

**Goal**: Refactor existing invoice pages to use new architecture

#### 6.1 Invoice Detail Page (Refactored)
```typescript
// File: src/app/invoices/[id]/page.tsx ✅ REFACTOR

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layouts/app-layout';
import { Button, Toast } from '@/components/ui/core';
import { InvoiceHeaderEditor } from '@/components/ui/invoice/invoice-header-editor';
import { InvoiceFooterEditor } from '@/components/ui/invoice/invoice-footer-editor';
import { DynamicInvoicePreview } from '@/components/ui/invoice/dynamic-invoice-preview';
import { useInvoice } from '@/lib/hooks/use-invoice';
import { useSettings } from '@/contexts/SettingsContext';

export default function InvoiceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;
  
  const { invoice, loading, error, fetchInvoice, updateInvoice } = useInvoice();
  const { companySettings } = useSettings();
  
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [isEditingFooter, setIsEditingFooter] = useState(false);
  const [toast, setToast] = useState<{message: string; type: 'success' | 'error'} | null>(null);

  // Load invoice on mount
  useEffect(() => {
    fetchInvoice(invoiceId);
  }, [invoiceId, fetchInvoice]);

  const handleSaveHeader = async (companyInfo: any) => {
    const updated = await updateInvoice(invoiceId, {
      company: companyInfo
    });
    
    if (updated) {
      setIsEditingHeader(false);
      setToast({ message: 'Header updated successfully!', type: 'success' });
    } else {
      setToast({ message: 'Failed to update header', type: 'error' });
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
      </AppLayout>
    );
  }

  if (error || !invoice) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-red-600">{error || 'Invoice not found'}</p>
          <Button onClick={() => router.push('/invoices')} className="mt-4">
            Back to Invoices
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with actions */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Invoice {invoice.number}</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.print()}>
              Print
            </Button>
            <Button onClick={() => router.push(`/invoices/${invoiceId}/edit`)}>
              Edit Invoice
            </Button>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Editors */}
          <div className="space-y-6">
            <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--card)' }}>
              <h3 className="text-lg font-semibold mb-4">Company Header</h3>
              {isEditingHeader ? (
                <InvoiceHeaderEditor
                  companyInfo={invoice.company}
                  onUpdate={(info) => {/* preview update */}}
                  onSave={() => handleSaveHeader(invoice.company)}
                  onCancel={() => setIsEditingHeader(false)}
                />
              ) : (
                <div>
                  <div className="space-y-2">
                    <p>{invoice.company.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {invoice.company.address}, {invoice.company.city}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingHeader(true)}
                    className="mt-4"
                  >
                    Edit Header
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Right: Preview */}
          <div className="lg:col-span-2">
            <DynamicInvoicePreview
              data={invoice}
              template={invoice.template}
              brandLogos={invoice.brandLogoIds}
            />
          </div>
        </div>

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
```

---

## 📊 Database Schema Summary

```sql
-- Invoices Table
CREATE TABLE invoices (
  id TEXT PRIMARY KEY,
  number TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  -- JSON fields for company, customer, items
  company_data TEXT NOT NULL,
  customer_data TEXT NOT NULL,
  items TEXT NOT NULL,
  -- Financial fields
  subtotal REAL, tax_rate REAL, tax REAL, discount REAL, total REAL,
  -- Template and customization
  template_id TEXT,
  customization TEXT,
  brand_logo_ids TEXT,
  -- Dates and metadata
  issue_date TEXT, due_date TEXT,
  created_at TEXT, updated_at TEXT
);

-- Templates Table
CREATE TABLE invoice_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  colors TEXT,   -- JSON
  fonts TEXT,    -- JSON
  layout TEXT,   -- JSON
  is_default INTEGER DEFAULT 0,
  is_custom INTEGER DEFAULT 0,
  created_at TEXT, updated_at TEXT
);

-- Assets Table
CREATE TABLE invoice_assets (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  filename TEXT NOT NULL,
  mime_type TEXT,
  size INTEGER,
  path TEXT NOT NULL,
  thumbnail TEXT,
  uploaded_at TEXT
);
```

---

## ✅ Testing Checklist

### Unit Tests
- [ ] InvoiceService CRUD operations
- [ ] TemplateService customization
- [ ] AssetService file upload/validation
- [ ] Invoice number generation
- [ ] Total calculations

### Integration Tests
- [ ] Electron IPC handlers
- [ ] Database operations
- [ ] File storage and retrieval

### E2E Tests
- [ ] Create invoice flow
- [ ] Edit invoice with logo upload
- [ ] Template selection and customization
- [ ] Print/export invoice

---

## 🚀 Deployment Checklist

- [ ] Run database migrations
- [ ] Seed default templates
- [ ] Test file permissions for asset storage
- [ ] Verify Electron IPC handlers registration
- [ ] Test print functionality
- [ ] Validate PDF export
- [ ] Check responsive design
- [ ] Test dark mode compatibility

---

## 📚 Developer Guide

### Adding a New Template

1. Create template definition in `src/components/ui/invoice/templates/`
2. Add renderer in `src/components/ui/invoice/template-renderers/`
3. Register in `templates/index.ts`
4. Add preview component
5. Seed to database

### Adding a New Asset Type

1. Add type to `AssetType` enum
2. Update validation in `AssetService`
3. Add uploader UI component
4. Update database handlers

### Customizing Invoice Layout

1. Modify template `layout` object
2. Update renderer logic
3. Update customizer UI in `InvoiceTemplates` component

---

## 🎯 Success Criteria

✅ **Clean Architecture**
- Service layer separates business logic from UI
- Reusable hooks for data management
- Type-safe interfaces throughout

✅ **Logo Support**
- Upload company logo
- Upload multiple brand logos
- Store in filesystem with database references
- Display in invoice headers/footers

✅ **Editable Headers/Footers**
- Inline editing UI
- Real-time preview updates
- Persist changes to database

✅ **Template System**
- 10+ unique templates
- Save custom templates
- Apply customizations per-invoice

✅ **Industry Standard**
- Professional invoice layouts
- Print-ready designs
- PDF export capability

---

## 📝 Notes

- All file uploads limited to 5MB
- Logos stored in `userData/invoice-assets/`
- Database uses SQLite with better-sqlite3
- All dates stored as ISO 8601 strings
- Currency and formatting from SettingsContext

---

**Created**: 2024-01-15  
**Last Updated**: 2024-01-15  
**Version**: 1.0  
**Author**: Architecture Planning AI

