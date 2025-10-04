# 🚀 Invoice System - Implementation Quick Start

## Overview
This guide provides step-by-step instructions to implement the clean architecture for the invoice system with **editable headers, footers, and logo support**.

---

## 📦 Phase 1: Database Setup (30 minutes)

### Step 1.1: Create Migration File
```bash
mkdir -p electron/migrations
touch electron/migrations/001_invoice_system.sql
```

### Step 1.2: Add SQL Schema
Copy the SQL from `INVOICE_ARCHITECTURE_PLAN.md` section "Database Schema Summary" into the migration file.

### Step 1.3: Update Database Service
Add methods to `electron/services/database-service.js`:

```javascript
// Invoice CRUD
async createInvoice(invoiceData) { /* ... */ }
async getInvoices() { /* ... */ }
async getInvoiceById(id) { /* ... */ }
async updateInvoice(id, updates) { /* ... */ }
async deleteInvoice(id) { /* ... */ }

// Template CRUD
async getTemplates() { /* ... */ }
async saveTemplate(template) { /* ... */ }

// Asset CRUD
async createAsset(asset) { /* ... */ }
async getAssets(type) { /* ... */ }
async getAssetById(id) { /* ... */ }
async deleteAsset(id) { /* ... */ }
```

### Step 1.4: Run Migration
Update `electron/main.js` to run migrations on startup.

---

## 📦 Phase 2: Types & Interfaces (20 minutes)

### Step 2.1: Create Type Files
```bash
touch src/lib/types/template.ts
touch src/lib/types/asset.ts
```

### Step 2.2: Copy Type Definitions
Copy type definitions from `INVOICE_ARCHITECTURE_PLAN.md` sections:
- Template types → `template.ts`
- Asset types → `asset.ts`

### Step 2.3: Update Electron API Types
Add new IPC methods to `src/types/electron.d.ts`:

```typescript
interface ElectronAPI {
  // ... existing methods ...
  
  // Invoice
  getInvoices: () => Promise<ApiResponse<Invoice[]>>;
  getInvoiceById: (id: string) => Promise<ApiResponse<Invoice>>;
  createInvoice: (data: Partial<Invoice>) => Promise<ApiResponse<Invoice>>;
  updateInvoice: (id: string, data: Partial<Invoice>) => Promise<ApiResponse<Invoice>>;
  deleteInvoice: (id: string) => Promise<ApiResponse<void>>;
  
  // Templates
  getTemplates: () => Promise<ApiResponse<InvoiceTemplate[]>>;
  getTemplateById: (id: string) => Promise<ApiResponse<InvoiceTemplate>>;
  saveTemplate: (template: Partial<InvoiceTemplate>) => Promise<ApiResponse<InvoiceTemplate>>;
  
  // Assets
  uploadAsset: (data: any) => Promise<ApiResponse<InvoiceAsset>>;
  getAssets: (type?: AssetType) => Promise<ApiResponse<InvoiceAsset[]>>;
  getAssetById: (id: string) => Promise<ApiResponse<InvoiceAsset>>;
  deleteAsset: (id: string) => Promise<ApiResponse<void>>;
}
```

---

## 📦 Phase 3: Services Layer (1 hour)

### Step 3.1: Create Service Files
```bash
mkdir -p src/lib/services
touch src/lib/services/invoice.service.ts
touch src/lib/services/template.service.ts
touch src/lib/services/asset.service.ts
```

### Step 3.2: Implement Services
Copy service implementations from `INVOICE_ARCHITECTURE_PLAN.md` Phase 2.

### Step 3.3: Export Services
Update `src/lib/services/index.ts`:

```typescript
export * from './invoice.service';
export * from './template.service';
export * from './asset.service';
export * from './settings.service';
```

---

## 📦 Phase 4: React Hooks (45 minutes)

### Step 4.1: Create Hook Files
```bash
mkdir -p src/lib/hooks
touch src/lib/hooks/use-invoice.ts
touch src/lib/hooks/use-template.ts
touch src/lib/hooks/use-assets.ts
```

### Step 4.2: Implement Hooks
Copy hook implementations from `INVOICE_ARCHITECTURE_PLAN.md` Phase 3.

### Step 4.3: Export Hooks
Update `src/lib/hooks/index.ts`:

```typescript
export * from './use-invoice';
export * from './use-template';
export * from './use-assets';
```

---

## 📦 Phase 5: UI Components (2 hours)

### Step 5.1: Create Component Files
```bash
touch src/components/ui/invoice/invoice-logo-uploader.tsx
touch src/components/ui/invoice/invoice-header-editor.tsx
touch src/components/ui/invoice/invoice-footer-editor.tsx
```

### Step 5.2: Implement Components
Copy component implementations from `INVOICE_ARCHITECTURE_PLAN.md` Phase 4.

### Step 5.3: Update Index Exports
Update `src/components/ui/invoice/index.ts`:

```typescript
export * from './invoice-logo-uploader';
export * from './invoice-header-editor';
export * from './invoice-footer-editor';
export * from './invoice-preview';
export * from './invoice-templates';
```

---

## 📦 Phase 6: Electron Handlers (1 hour)

### Step 6.1: Create Handler Files
```bash
touch electron/handlers/invoice-handlers.js
touch electron/handlers/template-handlers.js
touch electron/handlers/asset-handlers.js
```

### Step 6.2: Implement Handlers
Copy handler implementations from `INVOICE_ARCHITECTURE_PLAN.md` Phase 5.

### Step 6.3: Register Handlers
Update `electron/handlers/index.js`:

```javascript
const { registerInvoiceHandlers } = require('./invoice-handlers');
const { registerTemplateHandlers } = require('./template-handlers');
const { registerAssetHandlers } = require('./asset-handlers');

function registerAllHandlers(databaseService) {
  // ... existing handlers ...
  registerInvoiceHandlers(databaseService);
  registerTemplateHandlers(databaseService);
  registerAssetHandlers(databaseService);
}
```

---

## 📦 Phase 7: Refactor Invoice Pages (2 hours)

### Step 7.1: Refactor Invoice Detail Page
Update `src/app/invoices/[id]/page.tsx`:

**Key Changes:**
1. Replace mock data with `useInvoice` hook
2. Replace base64 logo with `useAssets` hook
3. Use `InvoiceHeaderEditor` component
4. Use `InvoiceFooterEditor` component
5. Use `InvoiceLogoUploader` component

### Step 7.2: Refactor Invoice Edit Page
Update `src/app/invoices/[id]/edit/page.tsx`:

**Key Changes:**
1. Use `useInvoice` hook for data fetching
2. Implement save functionality with `updateInvoice`
3. Add validation before saving

### Step 7.3: Update Invoice List Page
Update `src/app/invoices/page.tsx`:

**Key Changes:**
1. Use `useInvoice` hook for fetching list
2. Add real-time updates when invoices change

---

## 📦 Phase 8: Seed Data (30 minutes)

### Step 8.1: Create Seed Script
```bash
touch electron/scripts/seed-templates.js
```

### Step 8.2: Seed Default Templates
```javascript
const defaultTemplates = [
  {
    id: 'classic-header',
    name: 'Classic Header',
    description: 'Traditional business invoice',
    category: 'business',
    colors: {
      primary: '#1e40af',
      secondary: '#64748b',
      accent: '#059669',
      background: '#ffffff',
      text: '#1f2937'
    },
    fonts: {
      primary: 'Inter',
      secondary: 'Inter',
      size: 'medium'
    },
    layout: {
      headerStyle: 'classic',
      footerStyle: 'detailed',
      showLogo: true,
      showBorder: true,
      itemTableStyle: 'detailed'
    },
    isDefault: true,
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // ... add all 10 templates
];

// Save to database
defaultTemplates.forEach(template => {
  databaseService.saveTemplate(template);
});
```

### Step 8.3: Run Seed on First Launch
Update `electron/main.js` to check if templates exist, if not, run seed.

---

## 📦 Phase 9: Testing (1-2 hours)

### Step 9.1: Manual Testing Checklist
- [ ] Create new invoice
- [ ] Edit invoice header
- [ ] Upload company logo
- [ ] Upload brand logos
- [ ] Edit footer content
- [ ] Change template
- [ ] Customize template colors
- [ ] Save invoice
- [ ] Print invoice
- [ ] Delete invoice

### Step 9.2: Test Logo Upload
1. Upload PNG logo (should work)
2. Upload JPEG logo (should work)
3. Upload SVG logo (should work)
4. Try uploading 10MB file (should fail with error)
5. Try uploading PDF (should fail with error)

### Step 9.3: Test Template Customization
1. Select template
2. Customize colors
3. Save as custom template
4. Apply to invoice
5. Verify preview updates

---

## 📦 Phase 10: Polish & Deploy (1 hour)

### Step 10.1: Add Loading States
Ensure all async operations show loading indicators.

### Step 10.2: Add Error Handling
Add user-friendly error messages for all failure scenarios.

### Step 10.3: Add Toast Notifications
Show success/error toasts for all CRUD operations.

### Step 10.4: Test Print Styles
Ensure invoices print correctly with proper page breaks.

### Step 10.5: Optimize Performance
- Lazy load template renderers
- Optimize image loading
- Add debouncing to search/filter

---

## 🎯 Quick Commands

### Development
```bash
# Start development server
npm run dev

# Start Electron app
npm run electron:dev
```

### Testing
```bash
# Check types
npm run type-check

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix
```

### Database
```bash
# View database
sqlite3 ~/.topnotch-sales-manager/topnotch-sales.db

# Check invoices
SELECT * FROM invoices;

# Check templates
SELECT * FROM invoice_templates;

# Check assets
SELECT * FROM invoice_assets;
```

---

## 🐛 Troubleshooting

### Issue: Electron IPC not working
**Solution:** Check that handlers are registered in `electron/main.js` and `window.electronAPI` is exposed in `preload.js`.

### Issue: Logo not displaying
**Solution:** Verify asset path is correct and file exists in `userData/invoice-assets/`.

### Issue: Template not applying
**Solution:** Check that template ID matches database entry and renderer is registered.

### Issue: Database locked
**Solution:** Close all Electron instances and restart.

---

## 📚 Resources

- [Architecture Plan](./INVOICE_ARCHITECTURE_PLAN.md) - Detailed architecture documentation
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - Type safety reference
- [React Hooks](https://react.dev/reference/react) - Hook patterns
- [Electron IPC](https://www.electronjs.org/docs/latest/api/ipc-main) - IPC documentation

---

## ✅ Completion Checklist

- [ ] Phase 1: Database setup complete
- [ ] Phase 2: Types defined
- [ ] Phase 3: Services implemented
- [ ] Phase 4: Hooks created
- [ ] Phase 5: UI components built
- [ ] Phase 6: Electron handlers added
- [ ] Phase 7: Pages refactored
- [ ] Phase 8: Data seeded
- [ ] Phase 9: Testing passed
- [ ] Phase 10: Polish applied

---

**Estimated Total Time:** 10-12 hours  
**Difficulty:** Intermediate to Advanced  
**Prerequisites:** TypeScript, React, Electron, SQLite knowledge

---

Good luck with the implementation! 🚀

