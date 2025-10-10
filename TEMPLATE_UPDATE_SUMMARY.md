# Template Renderer Updates

## Features Added to All Renderers:

### Interface Updates:
```typescript
interface InvoiceData {
  // ... existing fields ...
  invoiceType?: 'invoice' | 'proforma' | 'quote' | 'credit_note' | 'debit_note';
  currency?: string;
  paidAmount?: number;
  balance?: number;
  status?: 'draft' | 'pending' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  bankDetails?: {
    bankName: string;
    accountName?: string;
    accountNumber: string;
    routingNumber?: string;
    swiftCode?: string;
  };
}
```

### Currency Formatting:
```typescript
const currency = data.currency || 'USD';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};
```

### Payment Information Display:
```typescript
{/* Payment Information */}
{data.paidAmount !== undefined && data.paidAmount > 0 && (
  <>
    <div className="flex justify-between items-center mt-2 py-1" style={{ color: '#10b981' }}>
      <span className="font-semibold">Paid:</span>
      <span className="font-bold">-{formatCurrency(data.paidAmount)}</span>
    </div>
    <div 
      className="flex justify-between items-center mt-2 pt-2 border-t-2 font-extrabold" 
      style={{ 
        borderColor: data.balance && data.balance > 0 ? '#f59e0b' : '#10b981',
        color: data.balance && data.balance > 0 ? '#f59e0b' : '#10b981'
      }}
    >
      <span>Balance Due:</span>
      <span>{formatCurrency(data.balance || 0)}</span>
    </div>
  </>
)}
```

## Status:

- ✅ Pro Corporate Renderer - Complete (already had features)
- ✅ Modern Stripe Renderer - Complete
- ✅ Elegant Dark Renderer - Complete
- ⏳ Minimal Outline Renderer - In Progress
- ⏳ Classic Column Renderer - Pending
- ⏳ Gradient Modern Renderer - Pending
- ⏳ Classic Header Renderer - Pending
- ⏳ Wave Design Renderer - Pending
- ⏳ Custom Schema Renderer - Pending

## Next Steps:
Apply the same pattern to all remaining renderers:
1. Update interface
2. Add currency variable and formatCurrency function
3. Replace all $ amounts with formatCurrency calls
4. Add payment information section after Total

