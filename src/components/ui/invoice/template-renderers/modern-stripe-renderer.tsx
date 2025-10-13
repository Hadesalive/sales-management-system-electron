import React from 'react';
import { InvoiceTemplate } from '../invoice-templates';
import { paginateInvoiceItems, PageBreak, ItemsRangeIndicator } from '../multi-page-utils';

interface InvoiceItem {
  id: string;
  description: string;
  itemDescription?: string; // Additional item-specific description
  quantity: number;
  rate: number;
  amount: number;
}

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  invoiceType?: 'invoice' | 'proforma' | 'quote' | 'credit_note' | 'debit_note';
  currency?: string;
  paidAmount?: number;
  balance?: number;
  status?: 'draft' | 'pending' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  company: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
    email: string;
    logo?: string;
  };
  customer: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    phone?: string;
    email?: string;
  };
  items: InvoiceItem[];
  notes?: string;
  terms?: string;
  taxRate: number;
  discount: number;
  bankDetails?: {
    bankName: string;
    accountName?: string;
    accountNumber: string;
    routingNumber?: string;
    swiftCode?: string;
  };
}

interface TemplateRendererProps {
  data: InvoiceData;
  template: InvoiceTemplate;
  brandLogos?: string[];
}

// Add print styles to ensure proper layout when printed
const printStyles = `
  @media print {
    /* Zero page margins - clean print */
    @page {
      size: A4;
      margin: 0; /* No CSS margins - template has internal padding */
    }

    .print-invoice * {
      -webkit-print-color-adjust: exact !important;
      color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    .print-invoice {
      margin: 0 !important; /* Let @page handle margins */
      box-shadow: none !important;
    }
    
    /* Hide info banner when printing */
    .pagination-controls {
      display: none !important;
    }
  }
  
  /* Fix for html2canvas lab() color parsing error */
  @media screen {
    .print-invoice {
      color-scheme: light;
    }
  }
`;

export function ModernStripeRenderer({ data, template, brandLogos = [] }: TemplateRendererProps) {
  const subtotal = data.items.reduce((sum, i) => sum + i.amount, 0);
  const tax = subtotal * (data.taxRate / 100);
  const total = subtotal + tax - data.discount;
  const currency = data.currency || 'USD';

  const formatCurrency = (amount: number) => {
    const currencySymbols: Record<string, string> = {
      'USD': '$',
      'SLL': 'Le',
      'EUR': '€',
      'GBP': '£',
      'CAD': 'C$',
      'AUD': 'A$'
    };
    
    const symbol = currencySymbols[currency] || currency;
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Helper function to convert relative paths to absolute URLs
  const getImageUrl = (src: string) => {
    if (src.startsWith('/')) {
      return `${window.location.origin}${src}`;
    }
    return src;
  };

  // Footer component
  const InvoiceFooter = () => (
    <footer className="pt-4 border-t" style={{ borderColor: template.colors.secondary }}>
      {data.notes && (
        <div className="mb-3">
          <div className="font-semibold mb-1 text-sm" style={{ color: template.colors.primary }}>Notes</div>
          <div className="text-xs">{data.notes}</div>
        </div>
      )}
      {data.terms && (
        <div className="mb-3">
          <div className="font-semibold mb-1 text-sm" style={{ color: template.colors.primary }}>Terms</div>
          <div className="text-xs">{data.terms}</div>
        </div>
      )}
      
      {/* Bank Details */}
      {data.bankDetails && (
        <div className="mb-3 p-3 rounded" style={{ backgroundColor: `${template.colors.primary}05` }}>
          <div className="font-semibold mb-1 text-sm" style={{ color: template.colors.primary }}>Bank Details</div>
          <div className="text-xs">
            <div>Bank: {data.bankDetails.bankName}</div>
            {data.bankDetails.accountName && <div>Account: {data.bankDetails.accountName}</div>}
            <div>Account #: {data.bankDetails.accountNumber}</div>
            {data.bankDetails.routingNumber && <div>Routing #: {data.bankDetails.routingNumber}</div>}
            {data.bankDetails.swiftCode && <div>SWIFT: {data.bankDetails.swiftCode}</div>}
          </div>
        </div>
      )}
      
      {brandLogos.length > 0 && (
        <div className="flex items-center gap-3 mt-2">
          {brandLogos.map((logo, i) => {
            const logoSrc = getImageUrl(logo);
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                key={i} 
                src={logoSrc} 
                alt={`Brand ${i + 1}`} 
                className="h-6 w-auto object-contain opacity-80"
                onError={(e) => {
                  // Hide broken images in PDF
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            );
          })}
        </div>
      )}
    </footer>
  );

  // Dynamic pagination for Modern Stripe template
  const adjustedPages = paginateInvoiceItems(data.items, { 
    templateType: 'compact',
    // Modern Stripe has compact design but needs more spacing
    firstPageCapacity: 0.85,
    lastPageCapacity: 0.75,
    separateTotalsThreshold: 8
  });
  
  // Determine if we need a separate totals page using dynamic threshold
  const needsSeparateTotalsPage = adjustedPages.length > 0 &&
    adjustedPages[adjustedPages.length - 1].items.length > 8;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />
      
      {/* Multi-page info banner (screen only) */}
      {(adjustedPages.length > 1 || needsSeparateTotalsPage) && (
        <div className="pagination-controls mb-4 p-3 rounded-lg border text-center" style={{ backgroundColor: `${template.colors.primary}10`, borderColor: template.colors.primary }}>
          <div className="text-sm font-medium" style={{ color: template.colors.primary }}>
            📄 This invoice has {adjustedPages.length + (needsSeparateTotalsPage ? 1 : 0)} pages ({data.items.length} items)
            {needsSeparateTotalsPage && <span className="text-xs ml-2">(+ separate totals page)</span>}
          </div>
        </div>
      )}

      {/* Render each page as a complete A4 container */}
      {adjustedPages.map((page, pageIdx) => (
        <React.Fragment key={page.pageNumber}>
          <div
            className="relative overflow-hidden print-invoice"
            style={{
              width: '210mm',
              backgroundColor: template.colors.background,
              color: template.colors.text,
              fontFamily: `${template.fonts.primary}, 'Helvetica Neue', Arial, sans-serif`,
              // Remove external margins - @page has zero margins
              margin: '0mm',
              marginBottom: pageIdx < adjustedPages.length - 1 ? '5mm' : '0mm',
              // Proper internal padding for template design breathing room
              padding: '10mm',
              paddingTop: '8mm',
              paddingBottom: '10mm',
              overflow: 'visible',
              display: 'flex',
              flexDirection: 'column',
              // Full A4 height (297mm) - no @page margins
              minHeight: '297mm',
              height: '297mm',
              maxHeight: '297mm'
            }}
          >
            {/* Right Accent Stripe - Fixed */}
            <div
              className="absolute top-0 right-0 h-full z-0"
              style={{ width: 96, background: `linear-gradient(180deg, ${template.colors.primary}, ${template.colors.secondary})` }}
            />

            {/* Page Container with Flexbox */}
            <div className="relative z-10 flex-grow flex flex-col">
              {/* Header - only on first page */}
              {page.isFirstPage && (
                <>
                  <div className="mb-6 flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      {template.layout.showLogo && data.company.logo && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={getImageUrl(data.company.logo)} 
                          alt="Logo" 
                          className="h-12 w-auto object-contain"
                          onError={(e) => {
                            // Hide broken images in PDF
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      )}
                      <div>
                        <div className="text-xl font-bold" style={{ color: template.colors.text }}>{data.company.name}</div>
                        <div className="text-sm" style={{ color: template.colors.secondary }}>{data.company.phone} • {data.company.email}</div>
                        <div className="text-sm" style={{ color: template.colors.secondary }}>{data.company.address}, {data.company.city}, {data.company.state} {data.company.zip}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="inline-block px-3 py-1 rounded text-white font-semibold" style={{ backgroundColor: template.colors.primary }}>
                        {data.invoiceType === 'proforma' ? 'PROFORMA' : 
                         data.invoiceType === 'quote' ? 'QUOTE' :
                         data.invoiceType === 'credit_note' ? 'CREDIT NOTE' :
                         data.invoiceType === 'debit_note' ? 'DEBIT NOTE' :
                         'INVOICE'}
                      </div>
                      <div className="mt-2 text-sm" style={{ color: template.colors.text }}>
                        <div><span className="font-medium">No:</span> {data.invoiceNumber}</div>
                        <div><span className="font-medium">Date:</span> {new Date(data.date).toLocaleDateString()}</div>
                        <div><span className="font-medium">Due:</span> {new Date(data.dueDate).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>

                  {/* Bill To + Summary */}
                  <div className="mb-6 grid grid-cols-3 gap-6">
                    <div className="col-span-2">
                      <div className="text-sm font-semibold mb-1" style={{ color: template.colors.primary }}>Bill To</div>
                      <div className="text-sm">
                        <div className="font-medium">{data.customer.name}</div>
                        <div>{data.customer.address}</div>
                        <div>{data.customer.city}, {data.customer.state} {data.customer.zip}</div>
                        {data.customer.phone && <div>{data.customer.phone}</div>}
                        {data.customer.email && <div>{data.customer.email}</div>}
                      </div>
                    </div>
                    <div>
                      <div className="rounded p-3 border" style={{ borderColor: `${template.colors.secondary}55`, backgroundColor: `${template.colors.primary}08` }}>
                        <div className="text-xs" style={{ color: template.colors.secondary }}>Amount Due</div>
                        <div className="text-2xl font-extrabold" style={{ color: template.colors.text }}>{formatCurrency(total)}</div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Page indicator for continuation pages */}
              {!page.isFirstPage && (
                <div className="mb-4 text-center text-xs text-gray-500">
                  Page {page.pageNumber} of {page.totalPages} (continued)
                </div>
              )}

              {/* Items Table */}
              <div className="mb-6 flex-grow">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-semibold" style={{ color: template.colors.primary }}>
                    Items {page.totalPages > 1 ? `(Page ${page.pageNumber} of ${page.totalPages})` : ''}
                  </div>
                  {page.totalPages > 1 && (
                    <ItemsRangeIndicator 
                      start={page.itemsRange.start} 
                      end={page.itemsRange.end} 
                      total={data.items.length}
                    />
                  )}
                </div>
                
                <div className="grid grid-cols-12 text-sm font-semibold py-2" style={{ color: template.colors.primary, borderBottom: `2px solid ${template.colors.secondary}` }}>
                  <div className="col-span-7">Description</div>
                  <div className="col-span-2 text-right">Qty</div>
                  <div className="col-span-1 text-right">Rate</div>
                  <div className="col-span-2 text-right">Amount</div>
                </div>
                {page.items.map((item, idx) => (
                  <div key={item.id} className="grid grid-cols-12 py-3 text-sm" style={{ borderBottom: `1px solid ${template.colors.secondary}33`, backgroundColor: idx % 2 ? `${template.colors.primary}05` : 'transparent' }}>
                    <div className="col-span-7 pr-4">
                    <div>{item.description}</div>
                    {item.itemDescription && (
                      <div className="text-xs opacity-75 mt-1" style={{ color: template.colors.secondary }}>
                        {item.itemDescription}
                      </div>
                    )}
                  </div>
                    <div className="col-span-2 text-right">{item.quantity}</div>
                    <div className="col-span-1 text-right">{formatCurrency(item.rate)}</div>
                    <div className="col-span-2 text-right font-medium">{formatCurrency(item.amount)}</div>
                  </div>
                ))}
                
                {/* Show "Continued on next page" if not the last page */}
                {!page.isLastPage && (
                  <div className="text-xs text-gray-500 italic mt-2 text-right">
                    Continued on next page...
                  </div>
                )}
              </div>

              {/* Totals - only on last page if there's room */}
              {page.isLastPage && !needsSeparateTotalsPage && (
                <div className="mb-6 flex justify-end">
                  <div className="w-full max-w-sm text-sm">
                    <div className="flex justify-between py-1"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                    {data.taxRate > 0 && (
                      <div className="flex justify-between py-1"><span>Tax ({data.taxRate}%)</span><span>{formatCurrency(tax)}</span></div>
                    )}
                    {data.discount > 0 && (
                      <div className="flex justify-between py-1"><span>Discount</span><span>- {formatCurrency(data.discount)}</span></div>
                    )}
                    <div className="mt-2 pt-2 flex justify-between items-center border-t" style={{ borderColor: template.colors.secondary }}>
                      <div className="text-lg font-bold" style={{ color: template.colors.primary }}>Total</div>
                      <div className="text-2xl font-extrabold" style={{ color: template.colors.text }}>{formatCurrency(total)}</div>
                    </div>
                    
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
                  </div>
                </div>
              )}

              {/* Footer - only on last page if there's room */}
              {page.isLastPage && !needsSeparateTotalsPage && (
                <div className="mt-auto flex-shrink-0">
                  <InvoiceFooter />
                </div>
              )}
            </div>
          </div>
          
          {/* Page break for print (between pages) */}
          {!page.isLastPage && <PageBreak />}
        </React.Fragment>
      ))}

      {/* Separate Totals Page - only if needed */}
      {needsSeparateTotalsPage && (
        <>
          <PageBreak />
          <div
            className="relative overflow-hidden print-invoice"
            style={{
              width: '210mm',
              backgroundColor: template.colors.background,
              color: template.colors.text,
              fontFamily: `${template.fonts.primary}, 'Helvetica Neue', Arial, sans-serif`,
              // Remove external margins - @page has zero margins
              margin: '0mm',
              // Proper internal padding for template design breathing room
              padding: '10mm',
              paddingTop: '8mm',
              paddingBottom: '10mm',
              overflow: 'visible',
              display: 'flex',
              flexDirection: 'column',
              // Full A4 height (297mm) - no @page margins
              minHeight: '297mm',
              height: '297mm',
              maxHeight: '297mm'
            }}
          >
            {/* Right Accent Stripe - Fixed */}
            <div
              className="absolute top-0 right-0 h-full z-0"
              style={{ width: 96, background: `linear-gradient(180deg, ${template.colors.primary}, ${template.colors.secondary})` }}
            />

            {/* Page Container with Flexbox */}
            <div className="relative z-10 flex-grow flex flex-col">
              <div className="mb-4 text-center text-xs text-gray-500" style={{ flex: 'none' }}>
                Page {adjustedPages.length + 1} of {adjustedPages.length + 1} - Invoice Summary
              </div>

              {/* Totals Section */}
              <div className="mb-6 flex justify-end" style={{ flex: 'none' }}>
                <div className="w-full max-w-sm text-sm">
                  <div className="flex justify-between py-1"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                  {data.taxRate > 0 && (
                    <div className="flex justify-between py-1"><span>Tax ({data.taxRate}%)</span><span>{formatCurrency(tax)}</span></div>
                  )}
                  {data.discount > 0 && (
                    <div className="flex justify-between py-1"><span>Discount</span><span>- {formatCurrency(data.discount)}</span></div>
                  )}
                  <div className="mt-2 pt-2 flex justify-between items-center border-t" style={{ borderColor: template.colors.secondary }}>
                    <div className="text-lg font-bold" style={{ color: template.colors.primary }}>Total</div>
                    <div className="text-2xl font-extrabold" style={{ color: template.colors.text }}>{formatCurrency(total)}</div>
                  </div>
                  
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
                </div>
              </div>

              {/* Footer */}
              <div className="mt-auto flex-shrink-0">
                <InvoiceFooter />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
