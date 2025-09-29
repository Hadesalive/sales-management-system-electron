# UI Components Organization

This directory contains all UI components organized by functionality into logical folders.

## Folder Structure

### `/core` - Basic UI Components
- `button.tsx` - Button component with variants
- `alert.tsx` - Alert and Toast notifications
- `badge.tsx` - Badge and StatusBadge components
- `modal.tsx` - Modal and ConfirmModal components
- `tabs.tsx` - Tabs navigation component
- `empty-state.tsx` - Empty state display component

### `/dashboard` - Dashboard Layout Components
- `dashboard-header.tsx` - Dashboard header with navigation
- `dashboard-layout.tsx` - Main dashboard layout wrapper
- `dashboard-sidebar.tsx` - Dashboard sidebar navigation
- `mobile-drawer.tsx` - Mobile navigation drawer
- `kpi-card.tsx` - Key Performance Indicator cards
- `chart-card.tsx` - Chart display cards
- `list-card.tsx` - List display cards
- `table-card.tsx` - Table display cards

### `/invoice` - Invoice System Components
- `invoice-form.tsx` - Invoice creation/edit form (simplified)
- `invoice-details.tsx` - Invoice detail view with actions
- `invoice-preview.tsx` - Invoice preview with templates
- `invoice-types.tsx` - Invoice table and type selector
- `invoice-utils.ts` - Shared invoice utilities

### `/customer` - Customer Management Components
- `customer-profile-card.tsx` - Customer profile display cards

### `/sales` - Sales Management Components
- `sales-pipeline-card.tsx` - Sales pipeline visualization
- `search-filter.tsx` - Search and filtering components

### `/forms` - Form Components
- `input.tsx` - Text input component
- `textarea.tsx` - Textarea component
- `select.tsx` - Select dropdown component
- `checkbox.tsx` - Checkbox component
- `radio.tsx` - Radio button component
- `switch.tsx` - Toggle switch component
- `date-picker.tsx` - Date picker component
- `form-card.tsx` - Form container card
- `form-section.tsx` - Form section wrapper
- `form-actions.tsx` - Form action buttons

## Usage

Import components from their respective folders:

```tsx
// Core components
import { Button, Alert, Badge } from "@/components/ui/core";

// Dashboard components
import { DashboardLayout, KpiCard } from "@/components/ui/dashboard";

// Invoice components
import { InvoiceBuilder, InvoicePreview } from "@/components/ui/invoice";

// Customer components
import { CustomerProfileCard } from "@/components/ui/customer";

// Sales components
import { SalesPipelineCard, SearchFilter } from "@/components/ui/sales";

// Form components
import { Input, Select, DatePicker } from "@/components/ui/forms";
```

Or import everything from the main index:

```tsx
import { Button, DashboardLayout, InvoiceBuilder } from "@/components/ui";
```

## Benefits

- **Logical grouping**: Components are organized by functionality
- **Easier navigation**: Find components quickly by their purpose
- **Cleaner imports**: Import only what you need from specific folders
- **Scalability**: Easy to add new components to appropriate folders
- **Maintainability**: Related components are grouped together
