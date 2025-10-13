# TopNotch Sales Manager

**Complete Desktop Sales & Inventory Management Application**

A powerful Electron-based desktop application for managing sales, inventory, customers, invoices, orders, and returns with real-time financial analytics.

![Status](https://img.shields.io/badge/status-production%20ready-brightgreen)
![Version](https://img.shields.io/badge/version-1.0-blue)
![Platform](https://img.shields.io/badge/platform-desktop-orange)

---

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
This starts both the Next.js dev server and Electron app automatically.

### Build for Production
```bash
npm run build
```

---

## ✨ Key Features

### 📦 **Inventory Management**
- Product catalog with images
- Real-time stock tracking
- Automatic stock depletion on sales
- Stock validation (prevents overselling)
- Low stock alerts
- Category organization

### 💰 **Sales Management**
- Quick POS-style sales creation
- Walk-in customer support
- Multi-item transactions
- Payment method tracking
- Thermal receipt printing
- Stock auto-deduction
- Return tracking indicators

### 👥 **Customer Management**
- Customer profiles with contact info
- Purchase history tracking
- Store credit system
- Avatar support
- Customer statistics

### 📄 **Invoice Management**
- 5 professional invoice templates
- Standalone or sales-linked invoices
- Payment tracking
- Overpayment handling
- Store credit application
- PDF generation
- Multiple invoice types

### 🛒 **Orders Management** ✨ NEW
- Purchase order creation
- Supplier tracking
- Delivery date management
- Auto-adds stock when delivered
- Payment status tracking
- Order lifecycle management

### 🔄 **Returns Management** ✨ NEW
- Product return processing
- Approval workflow
- Stock auto-restoration
- Store credit automation
- Reason & condition tracking
- Multiple refund methods
- Link to original sales

### 📊 **Financial Dashboard**
- Real-time revenue tracking (return-adjusted)
- Monthly profit analysis
- Weekly sales trends
- Profit margin calculations
- Top customers analytics
- Category breakdown
- Recent sales overview

---

## 🏗️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Desktop**: Electron
- **Database**: SQLite (better-sqlite3)
- **Styling**: TailwindCSS
- **Charts**: Chart.js
- **Icons**: Heroicons
- **Forms**: Custom form components

---

## 📖 Documentation

### **Complete System Documentation**
See [`SYSTEM_DOCUMENTATION.md`](./SYSTEM_DOCUMENTATION.md) for:
- Detailed architecture explanation
- Database schema reference
- Revenue & financial logic
- Module documentation
- API reference
- Troubleshooting guide

### **Settings Guide**
See [`SETTINGS_README.md`](./SETTINGS_README.md) for:
- Company settings configuration
- User preferences
- Theme customization

---

## 🎯 Core Concepts

### Smart Stock Management
- **Sales**: Automatically deduct stock with validation
- **Orders**: Auto-add stock when marked as "delivered"
- **Returns**: Auto-restore stock when approved/completed
- **Validation**: Prevents overselling, maintains data integrity

### Return-Adjusted Revenue
```
Net Revenue = (Sales + Paid Invoices) - Cash Refunds

Store credit and exchange returns don't reduce revenue
Only cash and original payment refunds impact revenue
```

### Store Credit System
- Auto-added from approved returns (if refund method = store credit)
- Can be applied to invoices and sales
- Reduces customer balance
- Tracked in customer profile

---

## 📁 Project Structure

```
topnotch-sales-manager/
├── electron/              # Electron main process
│   ├── handlers/          # IPC handlers (10 modules)
│   ├── services/          # Database service
│   └── main.js            # Entry point
├── src/
│   ├── app/               # Next.js pages (30+ pages)
│   │   ├── customers/
│   │   ├── products/
│   │   ├── sales/
│   │   ├── invoices/
│   │   ├── orders/        # New
│   │   ├── returns/       # New
│   │   └── dashboard.tsx
│   ├── components/        # Reusable UI components
│   ├── lib/               # Services, types, utilities
│   └── contexts/          # React contexts
├── topnotch-sales.db      # SQLite database
└── package.json
```

---

## 🔧 Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Environment
- Uses SQLite (no external database needed)
- Electron for desktop deployment
- Next.js for UI rendering

### Key Commands
```bash
npm run dev          # Start development
npm run build        # Build for production
npm run lint         # Run ESLint
npm run electron     # Run Electron only
```

---

## 📊 Database

### Tables
- `customers` - Customer information & store credit
- `products` - Inventory with stock levels
- `sales` - Sales transactions
- `invoices` - Invoice records
- `orders` - Purchase orders
- `returns` - Product returns
- `invoice_templates` - Template configurations
- `company_settings` - Business settings

### Relationships
- Sales ↔ Invoices (bidirectional link)
- Returns → Sales (optional link)
- Returns → Customers (store credit)
- All tables have proper foreign keys

---

## 🎨 UI Components

### Dashboard Components
- `KPICard` - Statistics display
- `PaginatedTableCard` - Data tables with search/filter
- `ChartCard` - Chart containers
- `ListCard` - List displays

### Form Components
- `Input`, `Select`, `Textarea`
- `Button`, `Toast`
- `ConfirmationDialog`

### Specialized
- `ReceiptPreview` - Thermal receipt printing
- Invoice template renderers (5 templates)
- Customer/Product forms with image upload

---

## 💡 Tips & Best Practices

### Creating Sales
1. Use product search for quick item addition
2. Leave customer blank for walk-in sales
3. Print receipt for customer records
4. Stock automatically deducted

### Processing Returns
1. Link to original sale when possible (auto-fills items)
2. Always enter return reason (required)
3. Select appropriate condition
4. Choose store credit to keep money in business
5. Stock automatically restored when approved

### Managing Orders
1. Mark as "delivered" when stock arrives
2. Stock automatically added to inventory
3. Track payment separately from delivery

### Financial Accuracy
- Revenue automatically adjusts for returns
- Only cash refunds reduce revenue
- Store credit stays as business asset
- Check dashboard for accurate metrics

---

## 🔐 Security

- Local database (no network exposure)
- Electron process isolation
- No API routes (Electron IPC only)
- Input validation throughout
- SQLite constraints for data integrity

---

## 📞 Support

For issues, questions, or feature requests:
1. Check `SYSTEM_DOCUMENTATION.md` for detailed guides
2. Review console logs in Electron DevTools
3. Check database directly with SQLite browser if needed

---

## 📄 License

Proprietary - All rights reserved

---

## 🎉 Status

**Production Ready** - All core features implemented and tested

- ✅ Complete inventory management
- ✅ Sales & customer tracking
- ✅ Invoice generation & payment
- ✅ Orders & returns processing
- ✅ Financial analytics
- ✅ Store credit system
- ✅ Receipt printing
- ✅ 0 ESLint errors

---

*Built with ❤️ for TopNotch Electronics*
