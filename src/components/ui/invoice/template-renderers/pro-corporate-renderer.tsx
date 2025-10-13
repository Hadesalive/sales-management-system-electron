/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { InvoiceTemplate } from '../invoice-templates';
import { paginateInvoiceItems, PageBreak, ItemsRangeIndicator, needsSeparateTotalsPage } from '../multi-page-utils';

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
      border: inherit !important;
    }

    .print-invoice header {
      margin-bottom: 2rem !important;
    }

    .print-invoice .invoice-header-section {
      display: flex !important;
      align-items: flex-start !important;
      justify-content: space-between !important;
      margin-bottom: 1.5rem !important;
    }

    .print-invoice .badge-row {
      display: grid !important;
      grid-template-columns: 1fr auto 1fr !important;
      align-items: center !important;
      gap: 1.5rem !important;
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
  currency?: string; // e.g., 'USD', 'SLL', 'EUR'
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

export function ProCorporateRenderer({ data, template, brandLogos = [] }: TemplateRendererProps) {
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


  // Header component to be reused
  const InvoiceHeader = () => (
    <header className="mb-8">
      {/* Top Section: Logo + Company Name Left, Contact Info Right */}
      <div className="flex justify-between items-start mb-8">
        {/* Left: Logo Only - Absolute positioned with NO layout impact */}
        <div className="relative" style={{ width: 0, height: 0 }}>
          {data.company.logo && (
            <img
              src={data.company.logo.startsWith('/') ? `${window.location.origin}${data.company.logo}` : data.company.logo}
              alt="Company Logo"
              className="absolute object-contain"
              style={{
                maxWidth: '280px',
                maxHeight: '160px',
                width: 'auto',
                height: 'auto',
                top: 0,
                left: 0,
                display: 'block',
                margin: 0,
                padding: 0,
                verticalAlign: 'top',
                lineHeight: 0,
                fontSize: 0,
                objectFit: 'contain',
                zIndex: 1
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
        </div>

        {/* Right: Company Contact Information */}
        <div className="text-right text-sm" style={{ color: template.colors.text }}>
          <div className="font-bold mb-1 text-base">{data.company.name}</div>
          <div>{data.company.address}</div>
          <div>{data.company.city}, {data.company.state} {data.company.zip}</div>
          <div className="mt-2">Mobile: {data.company.phone}</div>
          <div>{data.company.email}</div>
        </div>
      </div>


      {/* Clean Print-Friendly Invoice Type Indicator */}
      <div className="my-8">
        {/* Simple centered design with clean lines */}
        <div className="flex items-center justify-center">
          {/* Left line */}
          <div 
            className="flex-1 h-px"
            style={{ backgroundColor: template.colors.primary }}
          />
          
          {/* Central badge */}
          <div className="mx-8">
            <div 
              className="px-8 py-3 font-bold text-base tracking-wide uppercase text-center"
              style={{
                color: template.colors.primary,
                backgroundColor: 'white',
                border: `2px solid ${template.colors.primary}`,
                borderRadius: '6px',
                whiteSpace: 'nowrap',
                letterSpacing: '0.1em',
                minWidth: '120px'
              }}
            >
              {data.invoiceType === 'proforma' ? 'PROFORMA' :
               data.invoiceType === 'quote' ? 'QUOTE' :
               data.invoiceType === 'credit_note' ? 'CREDIT NOTE' :
               data.invoiceType === 'debit_note' ? 'DEBIT NOTE' :
               'INVOICE'}
            </div>
          </div>
          
          {/* Right line */}
          <div 
            className="flex-1 h-px"
            style={{ backgroundColor: template.colors.primary }}
          />
        </div>
      </div>

      {/* Bottom Section: Bill To Left, Invoice Details Right */}
      <div className="flex justify-between items-start">
        {/* Left: Bill To */}
        <div>
          <div className="text-sm font-semibold mb-2" style={{ color: template.colors.secondary }}>BILL TO</div>
          <div className="text-sm" style={{ color: template.colors.text }}>
            <div className="font-bold">{data.customer.name}</div>
            <div>{data.customer.address}</div>
            <div>{[data.customer.city, data.customer.state, data.customer.zip].filter(Boolean).join(', ')}</div>
            {data.customer.phone && <div>Mobile: {data.customer.phone}</div>}
            {data.customer.email && <div>{data.customer.email}</div>}
          </div>
        </div>

        {/* Right: Invoice Details */}
        <div className="text-right text-sm" style={{ color: template.colors.text }}>
          <div><span className="font-semibold">Invoice Number:</span> {data.invoiceNumber}</div>
          <div><span className="font-semibold">Invoice Date:</span> {new Date(data.date).toLocaleDateString()}</div>
          <div><span className="font-semibold">Payment Due:</span> {new Date(data.dueDate).toLocaleDateString()}</div>
          <div
            className="mt-2 px-4 py-2 font-bold rounded"
            style={{
              backgroundColor: `${template.colors.secondary}15`,
              color: template.colors.text,
              border: `1px solid ${template.colors.secondary}30`
            }}
          >
            Amount Due ({currency}): {formatCurrency(total)}
          </div>
        </div>
      </div>
    </header>
  );

  // Footer component to be reused
  const InvoiceFooter = () => (
    <footer className="pt-4 border-t-2" style={{ borderColor: template.colors.accent }}>
      {/* Notes & Terms */}
      <div className="grid grid-cols-2 gap-4 mb-3">
        {data.notes && (
          <div>
            <div className="font-semibold mb-1 text-xs" style={{ color: template.colors.primary }}>Notes</div>
            <div className="text-xs">{data.notes}</div>
          </div>
        )}
        {data.terms && (
          <div>
            <div className="font-semibold mb-1 text-xs" style={{ color: template.colors.primary }}>Terms</div>
            <div className="text-xs">{data.terms}</div>
          </div>
        )}
      </div>

      {/* Bank Payment Details - Single horizontal line */}
      {data.bankDetails && (
        <div className="pt-2 border-t border-gray-200">
          <div className="text-xs">
            Bank Details Bank : {data.bankDetails.bankName} BBAN#: {data.bankDetails.accountNumber} Account#: {data.bankDetails.accountName}
          </div>
        </div>
      )}

      {/* Brand Logos */}
      {brandLogos.length > 0 && (
        <div className="flex items-center justify-center flex-wrap gap-2 mt-2 pt-2 border-t" style={{ borderColor: template.colors.secondary }}>
          {brandLogos.map((logo, i) => {
            // Convert relative paths to absolute URLs for PDF rendering
            const logoSrc = logo.startsWith('/') ? `${window.location.origin}${logo}` : logo;
            return (
               
              <img 
                key={i} 
                src={logoSrc} 
                alt={`Brand ${i + 1}`} 
                className="h-5 w-auto object-contain opacity-80"
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

  // Dynamic pagination: Automatically calculates optimal page layout
  const adjustedPages = paginateInvoiceItems(data.items, { 
    templateType: 'standard',
    // Pro-corporate can handle more items due to compact design
    firstPageCapacity: 0.9,  // More space for items on first page
    lastPageCapacity: 0.8,   // More space for items on last page
    separateTotalsThreshold: 10 // Higher threshold for separate totals
  });
  
  // Determine if we need a separate totals page using dynamic threshold
  const needsSeparateTotals = needsSeparateTotalsPage(adjustedPages, 10, 'standard');

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />
      
      {/* Multi-page info banner (screen only) */}
      {(adjustedPages.length > 1 || needsSeparateTotals) && (
        <div className="pagination-controls mb-4 p-3 rounded-lg border text-center" style={{ backgroundColor: `${template.colors.primary}10`, borderColor: template.colors.primary }}>
          <div className="text-sm font-medium" style={{ color: template.colors.primary }}>
            📄 This invoice has {adjustedPages.length + (needsSeparateTotals ? 1 : 0)} pages ({data.items.length} items)
            {needsSeparateTotals && <span className="text-xs ml-2">(+ separate totals page)</span>}
          </div>
        </div>
      )}

      {/* Render each page as a complete A4 container */}
      {adjustedPages.map((page, pageIdx) => (
        <React.Fragment key={page.pageNumber}>
          <div
            style={{
              width: '210mm',
              backgroundColor: 'white',
              color: template.colors.text,
              fontFamily: `${template.fonts.primary}, 'Helvetica Neue', Arial, sans-serif`,
              // Smaller border - safe from clipping
              border: 'none', // No border for clean print/PDF
              borderRadius: '0px',
              boxSizing: 'border-box',
              position: 'relative',
              boxShadow: 'none', // No shadow for clean print/PDF
              // Remove external margins - @page has zero margins
              margin: '0mm',
              marginBottom: pageIdx < adjustedPages.length - 1 ? '5mm' : '0mm',
              // Proper internal padding for template design breathing room
              padding: '12mm',
              paddingTop: '10mm',
              paddingBottom: '12mm',
              overflow: 'visible',
              display: 'flex',
              flexDirection: 'column',
              // Full A4 height (297mm) - no @page margins
              minHeight: '297mm',
              height: '297mm',
              maxHeight: '297mm'
            }}
            className="print-invoice"
          >
            {/* Full-Page Watermark */}
            {data.company.logo && (
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{ 
                  zIndex: 1, // Below content but above background
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <img 
                  src={data.company.logo.startsWith('/') ? `${window.location.origin}${data.company.logo}` : data.company.logo} 
                  alt="Watermark" 
                  className="object-contain" 
                  style={{ 
                    opacity: 0.15, // Brighter opacity
                    maxWidth: '85%', // Bigger size
                    maxHeight: '85%',
                    width: 'auto',
                    height: 'auto',
                    transform: 'rotate(-15deg)' // Apply rotation to image
                  }}
                  onError={(e) => {
                    // Hide broken watermarks
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
            
            {/* Main Content - Above Watermark */}
            <div style={{ position: 'relative', zIndex: 2, backgroundColor: 'transparent', display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header - only on first page */}
            {page.isFirstPage && (
              <InvoiceHeader />
            )}

            {/* Page indicator for continuation pages */}
            {!page.isFirstPage && (
              <div className="mb-4 text-center text-xs text-gray-500">
                Page {page.pageNumber} of {page.totalPages} (continued)
              </div>
            )}

            {/* Items Table */}
            <section style={{ flexGrow: 1, marginBottom: '12px' }}>
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
              
              <table className="w-full border-collapse">
                <thead>
                  <tr style={{ backgroundColor: template.colors.primary, color: '#fff' }}>
                    <th className="text-left py-1 px-2 font-semibold text-xs">Description</th>
                    <th className="text-center py-1 px-2 font-semibold text-xs">Quantity</th>
                    <th className="text-right py-1 px-2 font-semibold text-xs">Price</th>
                    <th className="text-right py-1 px-2 font-semibold text-xs">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {page.items.filter(item => item && item.id).map((item, idx) => (
                    <tr key={item.id} style={{ backgroundColor: idx % 2 ? '#00000005' : 'transparent' }}>
                      <td className="py-1 px-2 text-xs" style={{ borderBottom: `1px solid ${template.colors.secondary}30` }}>
                        <div>{item.description || 'No description'}</div>
                        {item.itemDescription && (
                          <div className="text-xs opacity-75 mt-1" style={{ color: template.colors.secondary }}>
                            {item.itemDescription}
                          </div>
                        )}
                      </td>
                      <td className="py-1 px-2 text-center text-xs" style={{ borderBottom: `1px solid ${template.colors.secondary}30` }}>{item.quantity}</td>
                      <td className="py-1 px-2 text-right text-xs" style={{ borderBottom: `1px solid ${template.colors.secondary}30` }}>{formatCurrency(item.rate)}</td>
                      <td className="py-1 px-2 text-right text-xs font-medium" style={{ borderBottom: `1px solid ${template.colors.secondary}30` }}>{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Show "Continued on next page" if not the last page */}
              {!page.isLastPage && (
                <div className="text-xs text-gray-500 italic mt-2 text-right">
                  Continued on next page...
                </div>
              )}
            </section>

            {/* Totals - only on last page if there's room */}
            {page.isLastPage && !needsSeparateTotals && (
              <section className="mb-4 flex justify-end">
                <div className="w-full max-w-xs">
                  <div className="flex justify-between py-1 text-sm">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  {data.taxRate > 0 && (
                    <div className="flex justify-between py-1 text-sm">
                      <span>{currency === 'USD' ? 'GST' : 'Tax'} {data.taxRate}%:</span>
                      <span>{formatCurrency(tax)}</span>
                    </div>
                  )}
                  {data.discount > 0 && (
                    <div className="flex justify-between py-1 text-sm">
                      <span>Discount:</span>
                      <span>- {formatCurrency(data.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center mt-2 pt-2 border-t-2" style={{ borderColor: template.colors.accent }}>
                    <div className="text-base font-bold" style={{ color: template.colors.primary }}>Total:</div>
                    <div className="text-xl font-extrabold" style={{ color: template.colors.accent }}>{formatCurrency(total)}</div>
                  </div>
                  <div className="flex justify-between items-center mt-1 py-1 text-sm" style={{ backgroundColor: `${template.colors.accent}10` }}>
                    <span className="font-semibold">Amount Due ({currency}):</span>
                    <span className="font-bold" style={{ color: template.colors.accent }}>{formatCurrency(total)}</span>
                  </div>

                </div>
              </section>
            )}

                {/* Footer - only on last page if there's room */}
                {page.isLastPage && !needsSeparateTotals && (
                  <div style={{ marginTop: 'auto', marginBottom: '5mm', flexShrink: 0 }}>
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
      {needsSeparateTotals && (
        <>
          <PageBreak />
          <div
            style={{
              width: '210mm',
              backgroundColor: 'white',
              color: template.colors.text,
              fontFamily: `${template.fonts.primary}, 'Helvetica Neue', Arial, sans-serif`,
              // Smaller border - safe from clipping
              border: 'none', // No border for clean print/PDF
              borderRadius: '0px',
              boxSizing: 'border-box',
              position: 'relative',
              boxShadow: 'none', // No shadow for clean print/PDF
              // Remove external margins - @page has zero margins
              margin: '0mm',
              // Proper internal padding for template design breathing room
              padding: '12mm',
              paddingTop: '10mm',
              paddingBottom: '12mm',
              overflow: 'visible',
              display: 'flex',
              flexDirection: 'column',
              // Full A4 height (297mm) - no @page margins
              minHeight: '297mm',
              height: '297mm',
              maxHeight: '297mm'
            }}
            className="print-invoice"
          >
            {/* Full-Page Watermark - Separate Totals Page */}
            {data.company.logo && (
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{ 
                  zIndex: 1, // Below content but above background
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <img 
                  src={data.company.logo.startsWith('/') ? `${window.location.origin}${data.company.logo}` : data.company.logo} 
                  alt="Watermark" 
                  className="object-contain" 
                  style={{ 
                    opacity: 0.15, // Brighter opacity
                    maxWidth: '85%', // Bigger size
                    maxHeight: '85%',
                    width: 'auto',
                    height: 'auto',
                    transform: 'rotate(-15deg)' // Apply rotation to image
                  }}
                  onError={(e) => {
                    // Hide broken watermarks
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
            
            {/* Main Content - Above Watermark */}
            <div style={{ position: 'relative', zIndex: 2, backgroundColor: 'transparent', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="mb-4 text-center text-xs text-gray-500" style={{ flex: 'none' }}>
              Page {adjustedPages.length + 1} of {adjustedPages.length + 1} - Invoice Summary
            </div>

            {/* Totals Section */}
            <section style={{ marginBottom: '12px', flex: 'none', display: 'flex', justifyContent: 'flex-end' }}>
              <div className="w-full max-w-xs">
                <div className="flex justify-between py-0.5 text-xs">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {data.taxRate > 0 && (
                  <div className="flex justify-between py-0.5 text-xs">
                    <span>{currency === 'USD' ? 'GST' : 'Tax'} {data.taxRate}%:</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                )}
                {data.discount > 0 && (
                  <div className="flex justify-between py-0.5 text-xs">
                    <span>Discount:</span>
                    <span>- {formatCurrency(data.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center mt-1 pt-1 border-t-2" style={{ borderColor: template.colors.accent }}>
                  <div className="text-sm font-bold" style={{ color: template.colors.primary }}>Total:</div>
                  <div className="text-lg font-extrabold" style={{ color: template.colors.accent }}>{formatCurrency(total)}</div>
                </div>
                <div className="flex justify-between items-center mt-0.5 py-0.5 text-xs" style={{ backgroundColor: `${template.colors.accent}10` }}>
                  <span className="font-semibold">Amount Due ({currency}):</span>
                  <span className="font-bold" style={{ color: template.colors.accent }}>{formatCurrency(total)}</span>
                </div>

              </div>
            </section>

                {/* Footer */}
                <div style={{ marginTop: 'auto', marginBottom: '5mm', flexShrink: 0 }}>
                  <InvoiceFooter />
                </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
