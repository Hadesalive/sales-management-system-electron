# 🏢 TopNotch Sales Manager - Settings & Configuration

## 📋 Overview

The TopNotch Sales Manager includes a comprehensive settings system with **8 configuration categories** and **29+ customizable preferences**. All settings are stored locally in a persistent database and work completely offline.

## 🎯 Settings Architecture

### 🗄️ Database Structure
```json
{
  "settings": { /* Company Information */ },
  "preferences": { /* Application Preferences */ },
  "customers": [],
  "products": [],
  "sales": []
}
```

### 💾 Storage Location
- **Development**: `~/.topnotch-sales-manager/data.json`
- **Production**: Electron userData directory
- **Format**: JSON with immediate persistence

## 🎨 User Interface

### 📱 Navigation Design
- **Clean horizontal tabs** at the top of the settings page
- **8 tabbed sections** with icons and descriptions
- **Orange accent color** for active states
- **Responsive design** with horizontal scroll on smaller screens
- **Professional card layout** with shadow and borders

### 🔄 State Management
- **TypeScript interfaces** for type safety
- **Real-time validation** with error handling
- **Toast notifications** for user feedback
- **Immediate persistence** to database on changes

## 📊 Complete Settings Categories

### 1. 🏢 Company Information
**Purpose**: Store business details for invoices and receipts

| Setting | Type | Description | Required |
|---------|------|-------------|----------|
| Company Name | Text | Business name | ✅ Yes |
| Email Address | Email | Contact email | ❌ No |
| Phone Number | Text | Business phone | ❌ No |
| Address | Textarea | Business address | ❌ No |

**Validation Rules**:
- Company name is required
- Email format validation
- No character limits

---

### 2. 💰 Tax & Currency Settings
**Purpose**: Configure tax rates and currency display

| Setting | Type | Options | Default |
|---------|------|---------|---------|
| Tax Rate | Number | 0-100% | 15% |
| Currency | Select | 11 currencies | USD |
| Currency Position | Select | Before/After | Before |
| Decimal Places | Number | 0-4 places | 2 |

**Supported Currencies**:
- NLE (New Leones) 🇸🇱
- USD (US Dollar) 🇺🇸
- EUR (Euro) 🇪🇺
- GBP (British Pound) 🇬🇧
- CAD, AUD, JPY, CHF, CNY, INR, BRL

---

### 3. 🏪 Business Settings
**Purpose**: Configure invoices, receipts, and business workflows

| Setting | Type | Options | Default |
|---------|------|---------|---------|
| Default Payment Method | Select | Cash, Card, Bank Transfer, Other | Cash |
| Invoice Number Format | Text | Custom format with placeholders | INV-{YYYY}-{MM}-{####} |
| Receipt Footer Message | Textarea | Custom message for receipts | "Thank you for your business!" |

**Invoice Format Placeholders**:
- `{YYYY}` - Current year
- `{MM}` - Current month
- `{####}` - Sequential number

---

### 4. 📦 Inventory Management
**Purpose**: Control product and stock management features

| Setting | Type | Description | Default |
|---------|------|-------------|---------|
| Inventory Tracking | Toggle | Automatically track stock levels | ✅ On |
| Show Product Images | Toggle | Display images in inventory lists | ✅ On |
| Low Stock Alerts | Toggle | Show alerts when inventory is low | ✅ On |
| Barcode Scanning | Toggle | Enable camera barcode scanning | ❌ Off |

**Features**:
- Real-time stock tracking
- Visual inventory management
- Low stock notifications
- Camera-based barcode support

---

### 5. 💳 Sales Process Settings
**Purpose**: Configure sales workflow and automation

| Setting | Type | Options | Default |
|---------|------|---------|---------|
| Default Invoice Status | Select | Pending, Completed, Cancelled, Refunded | Completed |
| Default Discount % | Number | 0-100% | 0% |
| Auto-calculate Tax | Toggle | Automatic tax calculation | ✅ On |
| Show Tax Breakdown | Toggle | Detailed tax info on receipts | ✅ On |
| Show Profit Margin | Toggle | Display profit information | ❌ Off |
| Require Customer Info | Toggle | Mandatory customer details | ❌ Off |
| Print Receipts | Toggle | Auto-print after sales | ✅ On |

**Automation Features**:
- Automatic tax calculation
- Default discount application
- Receipt printing automation
- Customer validation

---

### 6. 🎨 Display & Formatting
**Purpose**: Customize UI appearance and data presentation

| Setting | Type | Options | Default |
|---------|------|---------|---------|
| Date Format | Select | MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD, DD-MM-YYYY | MM/DD/YYYY |
| Time Format | Select | 12-hour (AM/PM), 24-hour | 12-hour |
| Receipt Paper Size | Select | A4, Letter, Thermal (80mm) | A4 |
| Language | Select | English, Spanish, French, German | English |
| Dark Mode | Toggle | Use dark theme interface | ❌ Off |
| Sound Effects | Toggle | Audio feedback for actions | ✅ On |

**Localization Support**:
- Multiple date/time formats
- International language support
- Regional paper size preferences
- Theme customization

---

### 7. 💾 Data Backup & Export
**Purpose**: Manage data backup, export, and security

| Setting | Type | Options | Default |
|---------|------|---------|---------|
| Auto Backup | Toggle | Automatic local backups | ✅ On |
| Backup Frequency | Select | Daily, Weekly, Monthly | Daily |
| Auto Logout | Toggle | Session timeout security | ❌ Off |
| Session Timeout | Number | 5-480 minutes | 30 minutes |
| Export All Data | Button | Manual data export | - |
| Import Data | Button | Manual data import | - |

**Backup Features**:
- Automated local backups
- Configurable backup frequency
- Session security with auto-logout
- Manual export/import capabilities
- JSON format for portability

---

### 8. ⚙️ Application Preferences
**Purpose**: Configure application behavior and user experience

| Setting | Type | Description | Default |
|---------|------|-------------|---------|
| Auto-save Drafts | Toggle | Save form progress automatically | ✅ On |
| Confirm Before Delete | Toggle | Safety confirmation dialogs | ✅ On |
| Show Animations | Toggle | Enable smooth animations | ✅ On |

**UX Features**:
- Automatic draft saving
- Safety confirmations
- Smooth animations and transitions
- Enhanced user experience

## 🔧 Technical Implementation

### 🏗️ Architecture Components

#### Frontend (React/Next.js)
- **Settings Page**: `src/app/settings/page.tsx`
- **UI Components**: Form inputs, switches, selects
- **State Management**: React hooks with TypeScript
- **Validation**: Real-time form validation

#### Backend Services
- **Settings Service**: `src/lib/services/settings.service.ts`
- **Database Service**: Electron main process
- **IPC Communication**: Secure renderer-main bridge

#### Database Layer
- **Main Process**: `electron/main.js`
- **Storage**: JSON file with immediate persistence
- **API Handlers**: IPC handlers for all operations

### 🔌 API Methods

#### Company Settings
```typescript
// Get company information
getCompanySettings(): Promise<ApiResponse<CompanySettings>>

// Update company information
updateCompanySettings(settings: Partial<CompanySettings>): Promise<ApiResponse<CompanySettings>>
```

#### Preferences
```typescript
// Get all preferences
getPreferences(): Promise<ApiResponse<Preferences>>

// Update preferences
updatePreferences(preferences: Partial<Preferences>): Promise<ApiResponse<Preferences>>
```

#### Data Management
```typescript
// Export all data
exportData(): Promise<ApiResponse<ExportResult>>

// Import data from file
importData(): Promise<ApiResponse<ImportResult>>
```

### 🛡️ Data Persistence

#### Storage Strategy
- **Immediate Persistence**: Settings save instantly on change
- **Atomic Operations**: All-or-nothing updates
- **Error Handling**: Graceful fallbacks and recovery
- **Backup Safety**: Automatic backup before major changes

#### File Structure
```
~/.topnotch-sales-manager/
├── data.json (main database)
└── backups/ (automatic backups)
```

## 🚀 Usage Examples

### 💼 Business Setup
```typescript
// Configure company information
const companySettings = {
  companyName: "TopNotch Electronics",
  email: "sales@topnotch.com",
  phone: "+232 747 62243",
  address: "123 Main Street, Freetown, Sierra Leone",
  taxRate: 0.15,
  currency: "NLE"
};
```

### 🎨 UI Customization
```typescript
// Configure display preferences
const displayPreferences = {
  dateFormat: "DD/MM/YYYY",
  timeFormat: "24h",
  currencyPosition: "after",
  decimalPlaces: 2,
  language: "en",
  darkMode: false
};
```

### 💳 Sales Automation
```typescript
// Configure sales process
const salesPreferences = {
  defaultPaymentMethod: "cash",
  autoCalculateTax: true,
  showTaxBreakdown: true,
  printReceipts: true,
  defaultInvoiceStatus: "completed"
};
```

## 🔒 Security & Privacy

### 🛡️ Data Protection
- **Local Storage**: All data stored locally on user's device
- **No Cloud Sync**: Complete offline functionality
- **Encrypted Backups**: Secure backup file handling
- **Session Security**: Configurable auto-logout

### 🔐 Privacy Features
- **No Telemetry**: No data collection or tracking
- **User Control**: Complete control over all settings
- **Export Capability**: Users can export their data anytime
- **Transparent Storage**: Clear file locations and formats

## 🎯 Future Enhancements

### 📈 Planned Features
- **Settings Profiles**: Multiple configuration profiles
- **Import/Export Profiles**: Share settings between installations
- **Advanced Validation**: More sophisticated form validation
- **Settings Search**: Quick search through all settings
- **Bulk Operations**: Mass update capabilities

### 🔧 Technical Improvements
- **Settings Migration**: Automatic migration between versions
- **Conflict Resolution**: Handle settings conflicts gracefully
- **Performance Optimization**: Faster settings loading
- **Accessibility**: Enhanced accessibility features

## 📞 Support & Troubleshooting

### 🔍 Common Issues

#### Settings Not Saving
1. Check Electron app permissions
2. Verify database file location
3. Review console for errors

#### Import/Export Failures
1. Verify file format (JSON)
2. Check file permissions
3. Ensure valid data structure

#### UI Display Issues
1. Clear browser cache
2. Restart Electron application
3. Check for conflicting settings

### 🆘 Getting Help
- **Console Logs**: Check browser/Electron console
- **Database File**: Inspect `~/.topnotch-sales-manager/data.json`
- **Reset Settings**: Delete database file to reset to defaults

---

## 📝 Summary

The TopNotch Sales Manager settings system provides:

✅ **8 comprehensive configuration categories**  
✅ **29+ customizable preferences**  
✅ **Complete offline functionality**  
✅ **Professional tabbed interface**  
✅ **Type-safe implementation**  
✅ **Immediate persistence**  
✅ **Export/import capabilities**  
✅ **Multi-language support**  
✅ **Regional customization**  
✅ **Business automation features**  

This robust settings system ensures users can fully customize their sales management experience while maintaining data privacy and offline functionality.
