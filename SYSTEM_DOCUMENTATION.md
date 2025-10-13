# TopNotch Sales Manager - Complete System Documentation

**Version:** 1.0  
**Last Updated:** October 2025  
**Status:** Production Ready ✅

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Core Features](#core-features)
4. [Database Schema](#database-schema)
5. [Revenue & Financial Logic](#revenue--financial-logic)
6. [Module Documentation](#module-documentation)
7. [Quick Start Guide](#quick-start-guide)

---

## System Overview

TopNotch Sales Manager is a complete **Electron-based desktop application** for managing sales, inventory, customers, invoices, orders, and returns. Built with Next.js, React, TypeScript, and SQLite.

### Key Capabilities
- 📦 **Inventory Management** - Products, stock tracking, low stock alerts
- 👥 **Customer Management** - Customer profiles, store credit, purchase history
- 💰 **Sales Management** - POS system, walk-in customers, receipt printing
- 📄 **Invoice Management** - Multiple templates, payment tracking, overpayment handling
- 🛒 **Orders Management** - Purchase orders, supplier tracking, auto-stock addition
- 🔄 **Returns Management** - Product returns, refunds, stock restoration
- 📊 **Financial Dashboard** - Revenue, profit, trends (return-adjusted)
- ⚙️ **Settings** - Company settings, preferences, customization

---

## Architecture

### Technology Stack
- **Frontend**: Next.js 14, React, TypeScript, TailwindCSS
- **Backend**: Electron (Main Process), Node.js
- **Database**: SQLite (better-sqlite3)
- **IPC**: Electron IPC (no API routes)
- **Charts**: Chart.js

### Architecture Pattern
```
┌─────────────────────────────────────────────┐
│  UI Layer (React Components)                │
│  - Pages, Forms, Tables, Charts             │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│  Service Layer (TypeScript)                 │
│  - customer.service.ts                      │
│  - product.service.ts                       │
│  - sales.service.ts                         │
│  - order.service.ts                         │
│  - return.service.ts                        │
│  - settings.service.ts                      │
└──────────────────┬──────────────────────────┘
                   │ Electron IPC
┌──────────────────▼──────────────────────────┐
│  IPC Handlers (Electron Main)               │
│  - customer-handlers.js                     │
│  - product-handlers.js                      │
│  - sales-handlers.js (+ stock deduction)    │
│  - order-handlers.js (+ stock addition)     │
│  - return-handlers.js (+ stock/credit)      │
│  - invoice-handlers.js                      │
│  - settings-handlers.js                     │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│  Database Service (SQLite)                  │
│  - CRUD operations                          │
│  - Field mapping (camelCase ↔ snake_case)   │
│  - Transaction management                   │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│  SQLite Database (topnotch-sales.db)        │
│  - All business data                        │
│  - ACID compliance                          │
│  - Foreign key constraints                  │
└─────────────────────────────────────────────┘
```

### Key Design Decisions
1. **Electron-Only**: No API routes, all communication via IPC
2. **SQLite**: Local database for desktop deployment
3. **Service Layer**: Clean separation between UI and IPC
4. **Type Safety**: Full TypeScript coverage
5. **Component Reuse**: Shared UI components (KPICard, PaginatedTableCard, etc.)

---

## Core Features

### 1. Inventory Management
**Files**: `src/app/products/`, `src/app/inventory/`

**Features:**
- Product CRUD operations
- Stock tracking with auto-depletion on sales
- Low stock alerts
- Category management
- Image support (Base64)
- SKU management
- Cost tracking for profit calculations

**Stock Management:**
```javascript
// Sales reduce stock
createSale() → products.stock -= sale.item.quantity

// Orders add stock (when delivered)
order.status = 'delivered' → products.stock += order.item.quantity

// Returns restore stock (when approved)
return.status = 'approved' → products.stock += return.item.quantity

// Validation
- Prevents overselling (stock validation before sale)
- Prevents negative stock
```

### 2. Customer Management
**Files**: `src/app/customers/`

**Features:**
- Customer profiles with contact information
- Store credit system
- Purchase history
- Invoice history
- Avatar support (Base64)
- Customer stats (total spent, orders count)

**Store Credit:**
- Auto-added when returns processed with `refundMethod = 'store_credit'`
- Can be applied to invoices and sales
- Visible on customer details page

### 3. Sales Management
**Files**: `src/app/sales/`

**Features:**
- POS-style sales creation
- Walk-in customer support (no account required)
- Multi-item sales with quantities
- Payment method tracking
- Status workflow (pending/completed/cancelled/refunded)
- Stock depletion on sale creation
- Stock validation to prevent overselling
- Thermal receipt printing
- Return indicators
- Invoice generation from sales

**Walk-in Customer:**
- No customer selection required
- Visual feedback in UI
- Displays as "Walk-in Customer" in reports

### 4. Invoice Management
**Files**: `src/app/invoices/`

**Features:**
- Multiple professional templates
- Invoice creation (standalone or from sales)
- Payment tracking
- Overpayment handling
- Store credit application
- PDF generation
- Email support
- Status workflow (draft/pending/sent/paid/overdue/cancelled)
- Types: invoice, proforma, quote, credit_note, debit_note

**Smart Invoice Logic:**
- If sale has existing invoice → updates instead of creating new
- Preserves payment data on updates
- Overpayment detection and handling
- Links to sales via `saleId`

### 5. Orders Management ✨ NEW
**Files**: `src/app/orders/`

**Features:**
- Purchase order creation
- Supplier management
- Status tracking (pending/confirmed/shipped/delivered/cancelled)
- Payment status (unpaid/partial/paid)
- Expected and actual delivery dates
- Auto-adds stock when status = "delivered"
- Smart stock reversal on cancellation

**Stock Addition:**
```javascript
order.status changes to 'delivered':
  → For each item: product.stock += item.quantity
  
order deleted (if was delivered):
  → For each item: product.stock -= item.quantity
```

### 6. Returns Management ✨ NEW
**Files**: `src/app/returns/`

**Features:**
- Return processing with approval workflow
- Link to original sales (optional)
- Item condition tracking (unopened/opened/defective/damaged)
- Return reason per item (required)
- Refund methods: cash, store_credit, original_payment, exchange
- Auto-restores stock when approved/completed
- Auto-adds store credit if applicable
- Status workflow (pending/approved/rejected/completed)

**Stock & Credit Logic:**
```javascript
return.status = 'approved' OR 'completed':
  → For each item: product.stock += item.quantity
  
  IF return.refundMethod = 'store_credit':
    → customer.storeCredit += return.refundAmount
```

### 7. Financial Dashboard
**Files**: `src/app/dashboard.tsx`

**Metrics:**
- **Net Revenue** - After return deductions
- **Total Sales** - Count of sales
- **Total Customers** - Active customers
- **Total Invoices** - Invoice count
- **Weekly Sales** - Last 7 days trend
- **Monthly Profit** - With returns factored in
- **Profit Margin %** - Accurate margin
- **Top Customers** - By spending
- **Sales by Category** - Category breakdown
- **Recent Sales** - Last 10 transactions

**Return-Adjusted Calculations:**
- Only cash/original_payment refunds reduce revenue
- Store credit and exchange returns don't impact revenue
- Monthly and weekly profits account for returns
- Profit margins calculated on net revenue

---

## Database Schema

### Tables Overview
- **customers** - Customer information and store credit
- **products** - Inventory with stock levels
- **sales** - Sales transactions with items (JSON)
- **invoices** - Invoices with payment tracking
- **orders** - Purchase orders for restocking
- **returns** - Product returns and refunds
- **invoice_templates** - Customizable invoice templates
- **company_settings** - Business configuration
- **deals** - CRM/Pipeline (optional, disabled by default)

### Key Relationships
```sql
sales.customer_id → customers.id
sales.invoice_id → invoices.id

invoices.customer_id → customers.id
invoices.sale_id → sales.id

orders.supplier_id → (future suppliers table)

returns.sale_id → sales.id
returns.customer_id → customers.id
```

### Field Mapping
The system uses **camelCase** in JavaScript/TypeScript and **snake_case** in SQLite:

```javascript
// Frontend (JS/TS)          // Database (SQL)
customerId          →        customer_id
customerName        →        customer_name
paymentMethod       →        payment_method
paidAmount          →        paid_amount
storeCredit         →        store_credit
createdAt           →        created_at
updatedAt           →        updated_at
```

---

## Revenue & Financial Logic

### Revenue Calculation (Return-Aware)

```javascript
// Step 1: Calculate Gross Revenue
Gross Revenue = Sales Revenue + Paid Independent Invoices

// Step 2: Calculate Return Impact
Revenue-Reducing Returns = Returns where:
  ✅ status = 'completed' OR 'approved'
  ✅ refundMethod = 'cash' OR 'original_payment'

Return Deduction = Sum of revenue-reducing returns

// Step 3: Calculate Net Revenue
Net Revenue = Gross Revenue - Return Deduction
```

### Why Store Credit Doesn't Reduce Revenue

**Store Credit Returns:**
- Money stays with the business
- Creates a liability, not a revenue loss
- Customer can use credit on future purchases
- Represents future revenue opportunity

**Exchange Returns:**
- No cash leaves the business
- Product swap maintains value
- No revenue impact

**Only Cash-Based Refunds Reduce Revenue:**
- Cash refunds = actual money out
- Original payment refunds = actual money out
- These are true revenue losses

### Profit Calculations

```javascript
// Monthly Profit
= (Sales Revenue + Paid Independent Invoices - Return Deductions)
  - Cost of Goods Sold
  - Return Amounts

// Profit Margin %
= ((Net Revenue - COGS) / Net Revenue) × 100

// Weekly Profit Trend
= Profit calculated per week with returns distributed by week
```

### Invoice Revenue (No Double-Counting)

```javascript
// Invoices linked to sales
invoice.saleId !== null → Already counted in sales revenue

// Independent invoices (not linked to sales)
invoice.saleId === null → Add to revenue if paid

// Result: No double-counting
Total Revenue = Sales + Independent Paid Invoices - Returns
```

---

## Module Documentation

### Backend Modules

#### Database Service (`electron/services/database-service.js`)
**Purpose**: Core database operations with SQLite

**Methods:**
- Customer CRUD: `getCustomers`, `getCustomerById`, `createCustomer`, `updateCustomer`, `deleteCustomer`
- Product CRUD: `getProducts`, `getProductById`, `createProduct`, `updateProduct`, `deleteProduct`
- Sales CRUD: `getSales`, `getSaleById`, `createSale`, `updateSale`, `deleteSale`
- Invoice CRUD: `getInvoices`, `getInvoiceById`, `createInvoice`, `updateInvoice`, `deleteInvoice`
- Order CRUD: `getOrders`, `getOrderById`, `createOrder`, `updateOrder`, `deleteOrder`
- Return CRUD: `getReturns`, `getReturnById`, `createReturn`, `updateReturn`, `deleteReturn`
- Utility: `exportData`, `importData`, `getCompanySettings`, `updateCompanySettings`

**Features:**
- Automatic field mapping (camelCase ↔ snake_case)
- JSON serialization for complex fields (items, bankDetails)
- Boolean to integer conversion (for SQLite)
- Transaction support
- Error handling

#### IPC Handlers (`electron/handlers/`)

**Sales Handlers** (`sales-handlers.js`):
- Stock deduction on sale creation
- Stock validation to prevent overselling
- Stock restoration on sale deletion
- Smart stock adjustment on sale updates
- Customer credit application

**Order Handlers** (`order-handlers.js`):
- Stock addition when order delivered
- Stock removal if order cancelled after delivery
- Payment and delivery tracking

**Return Handlers** (`return-handlers.js`):
- Stock restoration when return approved/completed
- Store credit addition if refundMethod = 'store_credit'
- Reversal of changes on deletion
- Approval workflow support

**Invoice Handlers** (`invoice-handlers.js`):
- Invoice creation (standalone or from sale)
- Update existing invoice if sale already has one
- Payment tracking
- Overpayment handling
- Store credit application
- PDF generation

**Customer/Product/Settings Handlers**:
- Standard CRUD operations
- Data validation
- Search and filter support

### Frontend Modules

#### Services (`src/lib/services/`)

All services follow the same pattern:
1. Call Electron IPC handler
2. Handle response
3. Return standardized ApiResponse
4. Provide helper methods (search, filter, etc.)

**Services:**
- `customer.service.ts` - Customer operations
- `product.service.ts` - Product/inventory operations
- `sales.service.ts` - Sales operations
- `order.service.ts` - Order operations
- `return.service.ts` - Return operations
- `settings.service.ts` - Settings operations

#### UI Components (`src/components/ui/`)

**Dashboard Components:**
- `KPICard` - Statistics display with icon
- `PaginatedTableCard` - Data tables with pagination, search, sort
- `ChartCard` - Chart container
- `ListCard` - List items display

**Form Components:**
- `Input` - Text, number, date inputs
- `Select` - Dropdown selection
- `Textarea` - Multi-line text
- `Button` - Actions

**Other Components:**
- `Toast` - Notifications
- `ConfirmationDialog` - Confirmation prompts
- `ReceiptPreview` - Thermal receipt printing

---

## Core Features

### Smart Stock Management

**Automatic Stock Depletion (Sales):**
```javascript
// When creating a sale
1. Validate: Check if stock >= quantity for all items
2. If insufficient: Block sale, show error with available qty
3. If sufficient: Create sale and deduct stock
4. On delete: Restore stock
5. On update: Restore old quantities, validate new, deduct new
```

**Automatic Stock Addition (Orders):**
```javascript
// When order delivered
order.status = 'delivered' → Add quantities to stock

// When order cancelled after delivery
Restore stock to pre-delivery levels

// On delete (if was delivered)
Remove added stock
```

**Automatic Stock Restoration (Returns):**
```javascript
// When return approved/completed
return.status = 'approved' OR 'completed' → Restore stock

// On delete (if was approved/completed)
Remove restored stock
```

### Store Credit System

**Credit Addition:**
```javascript
// From Returns
IF return.refundMethod = 'store_credit'
AND return.status = 'approved' OR 'completed'
→ customer.storeCredit += return.refundAmount

// From Invoices (Overpayment)
IF invoice.paidAmount > invoice.total
→ Can convert overpayment to store credit
```

**Credit Application:**
```javascript
// To Invoices
Apply credit → Reduces balance, deducts from customer.storeCredit

// To Sales
Apply credit → Acts as discount, deducts from customer.storeCredit
```

### Payment Tracking

**Invoice Payments:**
- Tracks `paidAmount` vs `total`
- Calculates `balance` automatically
- Status auto-updates based on payment
- Handles overpayments (can convert to credit)

**Sale Payments:**
- Single payment method per sale
- Options: cash, card, bank_transfer, other
- Status based on payment state

**Order Payments:**
- Payment status: unpaid, partial, paid
- Payment method tracking
- Independent of delivery status

### Thermal Receipt Printing

**Features:**
- Direct print from sales pages
- Opens in new window (400x600px)
- Auto-triggers print dialog
- Thermal printer optimized
- Shows company info, customer, items, totals
- Payment method display

**Trigger:**
- "Print Receipt" button on new/edit sales pages
- Works before OR after saving sale
- Uses current sale data

---

## Database Schema

### Customers Table
```sql
CREATE TABLE customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  country TEXT,
  company TEXT,
  notes TEXT,
  is_active INTEGER DEFAULT 1,
  store_credit REAL DEFAULT 0,
  avatar TEXT,  -- Base64 image
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Products Table
```sql
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL CHECK (price > 0),
  cost REAL CHECK (cost > 0),
  sku TEXT,
  category TEXT,
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  min_stock INTEGER CHECK (min_stock >= 0),
  is_active INTEGER DEFAULT 1,
  image TEXT,  -- Base64 image
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Sales Table
```sql
CREATE TABLE sales (
  id TEXT PRIMARY KEY,
  customer_id TEXT REFERENCES customers(id),
  customer_name TEXT,
  items TEXT NOT NULL,  -- JSON: [{productId, productName, quantity, unitPrice, total}]
  subtotal REAL NOT NULL CHECK (subtotal >= 0),
  tax REAL NOT NULL CHECK (tax >= 0),
  discount REAL NOT NULL CHECK (discount >= 0),
  total REAL NOT NULL CHECK (total >= 0),
  status TEXT NOT NULL CHECK (status IN ('pending','completed','cancelled','refunded')),
  payment_method TEXT NOT NULL,
  invoice_id TEXT,
  invoice_number TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Invoices Table
```sql
CREATE TABLE invoices (
  id TEXT PRIMARY KEY,
  number TEXT NOT NULL UNIQUE,
  customer_id TEXT REFERENCES customers(id),
  customer_name TEXT,
  customer_email TEXT,
  customer_address TEXT,
  customer_phone TEXT,
  items TEXT NOT NULL,  -- JSON: [{id, description, quantity, rate, amount}]
  subtotal REAL NOT NULL,
  tax REAL NOT NULL,
  discount REAL NOT NULL,
  total REAL NOT NULL,
  paid_amount REAL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('draft','sent','paid','overdue','cancelled')),
  invoice_type TEXT NOT NULL,
  currency TEXT NOT NULL,
  due_date TEXT,
  notes TEXT,
  terms TEXT,
  bank_details TEXT,  -- JSON
  sale_id TEXT REFERENCES sales(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Orders Table
```sql
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  supplier_id TEXT,
  supplier_name TEXT NOT NULL,
  items TEXT NOT NULL,  -- JSON: [{productId, productName, quantity, unitPrice, total}]
  subtotal REAL NOT NULL,
  tax REAL NOT NULL,
  discount REAL NOT NULL,
  total REAL NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending','confirmed','shipped','delivered','cancelled')),
  payment_status TEXT NOT NULL CHECK (payment_status IN ('unpaid','partial','paid')),
  payment_method TEXT,
  expected_delivery_date TEXT,
  actual_delivery_date TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Returns Table
```sql
CREATE TABLE returns (
  id TEXT PRIMARY KEY,
  return_number TEXT NOT NULL UNIQUE,
  sale_id TEXT REFERENCES sales(id),
  customer_id TEXT REFERENCES customers(id),
  customer_name TEXT,
  items TEXT NOT NULL,  -- JSON: [{productId, productName, quantity, unitPrice, total, reason, condition}]
  subtotal REAL NOT NULL,
  tax REAL NOT NULL,
  total REAL NOT NULL,
  refund_amount REAL NOT NULL,
  refund_method TEXT NOT NULL CHECK (refund_method IN ('cash','store_credit','original_payment','exchange')),
  status TEXT NOT NULL CHECK (status IN ('pending','approved','rejected','completed')),
  processed_by TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## Quick Start Guide

### Development Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development**
   ```bash
   npm run dev
   ```
   This starts both Next.js dev server and Electron app.

3. **Access Application**
   - Electron window opens automatically
   - Dev server runs on http://localhost:3000

### Creating Your First Sale

1. Navigate to **Sales** → **New Sale**
2. Select customer (or leave blank for walk-in)
3. Add products with quantities
4. Select payment method
5. Click **Create Sale**
6. Stock automatically deducted
7. Optionally print thermal receipt

### Processing a Return

1. Navigate to **Returns** → **New Return**
2. Optionally link to original sale (auto-fills items)
3. Or manually add products
4. Enter reason for each item (required)
5. Select item condition
6. Choose refund method
7. Click **Create Return**
8. If status = approved/completed:
   - Stock automatically restored
   - Store credit added if applicable

### Creating a Purchase Order

1. Navigate to **Orders** → **New Order**
2. Enter supplier name
3. Add products with quantities
4. Set expected delivery date
5. Click **Create Order**
6. When order arrives, change status to "delivered"
7. Stock automatically added to inventory

### Managing Invoices

1. **From Sale**: Edit sale → "Create Invoice" button
2. **Standalone**: Invoices → New Invoice
3. Track payments in invoice details
4. Handle overpayments (convert to credit)
5. Apply customer credit to reduce balance
6. Generate PDF for sending to customers

---

## Feature Highlights

### ✅ Implemented Features
- ✅ Complete CRUD for all entities
- ✅ Automatic stock management
- ✅ Store credit system
- ✅ Payment tracking
- ✅ Return processing
- ✅ Purchase orders
- ✅ Invoice generation
- ✅ Thermal receipt printing
- ✅ Revenue & profit analytics (return-adjusted)
- ✅ Search & filter capabilities
- ✅ Responsive design
- ✅ Dark/light theme support
- ✅ Data export/import
- ✅ Multiple invoice templates
- ✅ Walk-in customer support
- ✅ Overpayment handling

### 🔐 Data Integrity
- ✅ Foreign key constraints
- ✅ Check constraints for valid values
- ✅ Transaction support
- ✅ Automatic timestamps
- ✅ Stock validation
- ✅ ACID compliance

### 📊 Reports & Analytics
- ✅ Real-time dashboard
- ✅ Weekly sales trends
- ✅ Monthly profit tracking
- ✅ Profit margin analysis
- ✅ Top customers
- ✅ Category breakdown
- ✅ Return rate tracking
- ✅ Low stock alerts

---

## File Structure

```
topnotch-sales-manager/
├── electron/
│   ├── handlers/
│   │   ├── customer-handlers.js
│   │   ├── product-handlers.js
│   │   ├── sales-handlers.js
│   │   ├── invoice-handlers.js
│   │   ├── order-handlers.js
│   │   ├── return-handlers.js
│   │   ├── settings-handlers.js
│   │   ├── data-handlers.js
│   │   ├── email-handlers.js
│   │   ├── pdf-handlers.js
│   │   └── index.js
│   ├── services/
│   │   └── database-service.js
│   ├── main.js
│   └── preload.js
├── src/
│   ├── app/
│   │   ├── customers/
│   │   │   ├── page.tsx (list)
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx (details)
│   │   ├── products/
│   │   │   ├── page.tsx (list)
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx (details)
│   │   ├── sales/
│   │   │   ├── page.tsx (list)
│   │   │   ├── new/page.tsx
│   │   │   ├── [id]/page.tsx (details)
│   │   │   └── [id]/edit/page.tsx
│   │   ├── invoices/
│   │   │   ├── page.tsx (list)
│   │   │   ├── new/page.tsx
│   │   │   ├── templates/page.tsx
│   │   │   ├── [id]/page.tsx (details)
│   │   │   └── [id]/edit/page.tsx
│   │   ├── orders/
│   │   │   ├── page.tsx (list)
│   │   │   ├── new/page.tsx
│   │   │   ├── [id]/page.tsx (details)
│   │   │   └── [id]/edit/page.tsx
│   │   ├── returns/
│   │   │   ├── page.tsx (list)
│   │   │   ├── new/page.tsx
│   │   │   ├── [id]/page.tsx (details)
│   │   │   └── [id]/edit/page.tsx
│   │   ├── dashboard.tsx
│   │   ├── inventory/page.tsx
│   │   ├── reports/page.tsx
│   │   └── settings/page.tsx
│   ├── components/
│   │   ├── layouts/
│   │   │   └── app-layout.tsx
│   │   └── ui/
│   │       ├── core/ (Button, Toast, etc.)
│   │       ├── forms/ (Input, Select, etc.)
│   │       ├── dashboard/ (KPICard, TableCard, etc.)
│   │       ├── dialogs/
│   │       └── invoice/ (templates, renderers)
│   ├── lib/
│   │   ├── services/ (frontend services)
│   │   ├── types/ (TypeScript interfaces)
│   │   ├── hooks/ (React hooks)
│   │   └── database/ (schema definitions)
│   └── contexts/
│       ├── SettingsContext.tsx
│       ├── ThemeContext.tsx
│       └── SalesContext.tsx
├── topnotch-sales.db (SQLite database)
└── package.json
```

---

## Critical Implementation Notes

### 1. No API Routes
This is an **Electron-only desktop application**. All API routes have been disabled (moved to `_disabled_api_routes`). All communication happens via Electron IPC.

### 2. Field Mapping
Always use the field mapping when working with database:
- Frontend: camelCase
- Database: snake_case
- Service layer handles conversion

### 3. JSON Fields
These fields are stored as JSON strings in SQLite:
- `items` (in sales, invoices, orders, returns)
- `bankDetails` (in invoices)
- Must be stringified on save, parsed on read

### 4. Boolean Fields
SQLite doesn't have boolean type:
- Store as INTEGER (0 or 1)
- Convert when reading/writing
- Examples: `is_active`, `layout_show_logo`

### 5. Stock Management
Stock changes happen in **handlers**, not database service:
- Handlers orchestrate business logic
- Database service only does CRUD
- Ensures proper transaction management

### 6. Revenue Rules
- **Sales revenue**: Always counted
- **Invoice revenue**: Only if NOT linked to sale
- **Return impact**: Only cash/original_payment refunds
- **Store credit**: Liability, not revenue loss

---

## Troubleshooting

### Issue: Stock not updating
**Solution**: Restart Electron app. Handler changes require restart.

### Issue: Revenue seems wrong
**Check**:
1. Are there linked invoices being double-counted? (should not happen)
2. Are store credit returns reducing revenue? (should not happen)
3. Check console logs for revenue calculation breakdown

### Issue: Returns not restoring stock
**Check**:
1. Is return status 'approved' or 'completed'?
2. Check console logs for stock restoration messages
3. Restart Electron app if handlers were recently updated

### Issue: Database locked
**Solution**: Close all connections. SQLite uses WAL mode for better concurrency.

### Issue: TypeScript errors
**Common fixes**:
- Check field name casing (camelCase vs snake_case)
- Ensure proper type imports
- Check nullable fields have `?` or `| null`

---

## Performance Considerations

### Database Optimization
- ✅ Indexes on frequently queried columns
- ✅ WAL mode for better concurrency
- ✅ Foreign key enforcement
- ✅ Check constraints for data validity

### UI Optimization
- ✅ Pagination on all large lists
- ✅ useMemo for expensive calculations
- ✅ Lazy loading where appropriate
- ✅ Optimistic UI updates

### IPC Optimization
- ✅ Batch operations where possible
- ✅ Async/await throughout
- ✅ Error boundaries
- ✅ Loading states

---

## Security Considerations

### Data Security
- ✅ Local database (no network exposure)
- ✅ Electron main process isolation
- ✅ Context isolation in renderer
- ✅ No eval or unsafe code

### Input Validation
- ✅ Type checking with TypeScript
- ✅ SQLite constraints
- ✅ Frontend form validation
- ✅ Backend validation in handlers

---

## Future Enhancement Opportunities

### High Priority
- [ ] Barcode scanning for products
- [ ] Bulk product import/export
- [ ] Advanced reporting (PDF reports)
- [ ] Email invoices directly from app
- [ ] Supplier management system
- [ ] Multi-currency support

### Medium Priority
- [ ] User authentication & roles
- [ ] Audit logs
- [ ] Backup automation
- [ ] Dashboard customization
- [ ] Advanced analytics
- [ ] Inventory forecasting

### Low Priority
- [ ] Mobile app sync
- [ ] Cloud backup
- [ ] Multi-location support
- [ ] Integration with accounting software
- [ ] API for third-party integrations

---

## Change Log

### Latest Session (October 2025)
- ✅ Implemented complete Orders management system
- ✅ Implemented complete Returns management system
- ✅ Added return-adjusted revenue calculations
- ✅ Updated sales page with return indicators
- ✅ Fixed all ESLint errors
- ✅ Added thermal receipt printing
- ✅ Enhanced walk-in customer support
- ✅ Cleaned up API route dependencies

### Previous Sessions
- Migrated from API routes to Electron IPC
- Implemented stock depletion system
- Added store credit functionality
- Fixed revenue double-counting
- Implemented overpayment handling
- Created invoice template system
- Added payment tracking

---

## Support & Maintenance

### Database Location
```
Development: ./topnotch-sales.db
Production: [user-data]/topnotch-sales.db
```

### Logs Location
Check Electron console for:
- IPC handler logs
- Database operation logs
- Stock management logs
- Error messages

### Backup Recommendation
Regular database backups recommended:
```bash
# Manual backup
cp topnotch-sales.db topnotch-sales.backup.db

# Or use built-in export feature
Settings → Export Data
```

---

## Conclusion

TopNotch Sales Manager is a **complete, production-ready desktop application** for managing all aspects of a retail/wholesale business. The system features:

- ✅ Robust stock management
- ✅ Comprehensive financial tracking
- ✅ Smart revenue calculations
- ✅ Complete order and return workflows
- ✅ Store credit system
- ✅ Professional invoicing
- ✅ Real-time analytics

**All systems are fully implemented, tested, and connected to the database.**

---

*Documentation Version: 1.0*  
*System Status: Production Ready*  
*Last Updated: October 13, 2025*

