import React from 'react';
import { InvoiceTemplate } from '../invoice-templates';
import { paginateInvoiceItems, PageBreak, ItemsRangeIndicator } from '../multi-page-utils';

// Add print styles to ensure proper layout when printed
const printStyles = `
  @media print {
    .print-invoice * {
      -webkit-print-color-adjust: exact !important;
      color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    .print-invoice {
      margin: 0 !important;
      box-shadow: none !important;
      border: none !important;
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
  const invoiceType = data.invoiceType || 'invoice';

  const formatCurrency = (amount: number) => {
    return `${currency === 'USD' ? '$' : ''}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getInvoiceTypeLabel = () => {
    switch (invoiceType) {
      case 'proforma': return 'Proforma';
      case 'quote': return 'Quotation';
      case 'credit_note': return 'Credit Note';
      case 'debit_note': return 'Debit Note';
      default: return 'Invoice';
    }
  };

  // Header component to be reused
  const InvoiceHeader = () => (
    <header className="mb-8">
      {/* Company Info & Logo */}
      <div className="invoice-header-section flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          {template.layout.showLogo && data.company.logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.company.logo} alt="Logo" className="h-16 w-auto object-contain" />
          )}
          <div>
            <h1 className="text-2xl font-bold" style={{ color: template.colors.primary }}>{data.company.name}</h1>
            <div className="text-xs mt-1" style={{ color: template.colors.secondary }}>
              <div>{data.company.address}</div>
              <div>{data.company.city}, {data.company.state} {data.company.zip}</div>
              <div className="mt-1">{data.company.phone}</div>
              <div>{data.company.email}</div>
            </div>
          </div>
        </div>

        {/* Compact Metadata Block */}
        <div className="text-right min-w-[200px]">
          <div className="text-xs space-y-1">
            <div className="flex justify-between gap-6">
              <span className="font-semibold">Invoice Number:</span>
              <span>{data.invoiceNumber}</span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="font-semibold">Invoice Date:</span>
              <span>{new Date(data.date).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="font-semibold">Payment Date:</span>
              <span>{new Date(data.dueDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between gap-6 mt-2 pt-2 border-t" style={{ borderColor: template.colors.secondary }}>
              <span className="font-bold">Amount Due ({currency}):</span>
              <span className="font-bold" style={{ color: template.colors.accent }}>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Type Badge - Matching Proforma Design Exactly */}
      <div className="badge-row my-8" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '1.5rem' }}>
        {/* Left horizontal line */}
        <div className="h-1" style={{ backgroundColor: template.colors.accent }}></div>

        {/* Badge container with ornate frame design */}
        <div className="relative" style={{ marginInline: '2rem' }}>
          {/* Main badge with sophisticated border */}
          <div
            className="px-8 py-3 relative"
            style={{
              backgroundColor: 'white',
              position: 'relative',
              zIndex: 10
            }}
          >
            {/* Top border line */}
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{ backgroundColor: template.colors.accent }}
            ></div>
            {/* Bottom border line */}
            <div
              className="absolute bottom-0 left-0 right-0 h-1"
              style={{ backgroundColor: template.colors.accent }}
            ></div>
            {/* Left border line */}
            <div
              className="absolute top-0 bottom-0 left-0 w-1"
              style={{ backgroundColor: template.colors.accent }}
            ></div>
            {/* Right border line */}
            <div
              className="absolute top-0 bottom-0 right-0 w-1"
              style={{ backgroundColor: template.colors.accent }}
            ></div>

            {/* Corner decorative elements - Top Left */}
            <div
              className="absolute -top-1 -left-1 w-4 h-4"
              style={{
                borderTop: `2px solid ${template.colors.accent}`,
                borderLeft: `2px solid ${template.colors.accent}`,
                borderTopLeftRadius: '8px',
                backgroundColor: 'white'
              }}
            ></div>
            {/* Corner decorative elements - Top Right */}
            <div
              className="absolute -top-1 -right-1 w-4 h-4"
              style={{
                borderTop: `2px solid ${template.colors.accent}`,
                borderRight: `2px solid ${template.colors.accent}`,
                borderTopRightRadius: '8px',
                backgroundColor: 'white'
              }}
            ></div>
            {/* Corner decorative elements - Bottom Left */}
            <div
              className="absolute -bottom-1 -left-1 w-4 h-4"
              style={{
                borderBottom: `2px solid ${template.colors.accent}`,
                borderLeft: `2px solid ${template.colors.accent}`,
                borderBottomLeftRadius: '8px',
                backgroundColor: 'white'
              }}
            ></div>
            {/* Corner decorative elements - Bottom Right */}
            <div
              className="absolute -bottom-1 -right-1 w-4 h-4"
              style={{
                borderBottom: `2px solid ${template.colors.accent}`,
                borderRight: `2px solid ${template.colors.accent}`,
                borderBottomRightRadius: '8px',
                backgroundColor: 'white'
              }}
            ></div>

            {/* Invoice type text */}
            <span className="text-xl font-bold tracking-wide relative z-20" style={{ color: template.colors.accent }}>
              {getInvoiceTypeLabel()}
            </span>
          </div>
        </div>

        {/* Right horizontal line */}
        <div className="h-1" style={{ backgroundColor: template.colors.accent }}></div>
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
        <div className="flex items-center gap-3 mt-2 pt-2 border-t" style={{ borderColor: template.colors.secondary }}>
          {brandLogos.map((logo, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={logo} alt={`Brand ${i + 1}`} className="h-6 w-auto object-contain opacity-80" />
          ))}
        </div>
      )}
    </footer>
  );

  // Optimized for A4: Maximize items per page (18 items for better space usage)
  // If totals don't fit on last page with items, they get their own page
  const adjustedPages = paginateInvoiceItems(data.items, { itemsPerPage: 18 });
  
  // Determine if we need a separate totals page
  // If last page has more than 5 items, totals/footer need their own page
  const needsSeparateTotalsPage = adjustedPages.length > 0 &&
    adjustedPages[adjustedPages.length - 1].items.length > 5;

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
            style={{
              width: '210mm',
              height: '297mm',
              backgroundColor: 'white',
              color: template.colors.text,
              fontFamily: `${template.fonts.primary}, 'Helvetica Neue', Arial, sans-serif`,
              border: template.layout.showBorder ? `6px solid ${template.colors.accent}` : 'none',
              borderRadius: template.layout.showBorder ? '8px' : '0px',
              boxSizing: 'border-box',
              position: 'relative',
              boxShadow: template.layout.showBorder ? `0 6px 25px rgba(0,0,0,0.18)` : 'none',
              margin: template.layout.showBorder ? '5mm' : '0mm',
              marginBottom: pageIdx < adjustedPages.length - 1 ? '10mm' : '0',
              padding: '15mm',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
            className="print-invoice"
          >
            {/* Header - only on first page */}
            {page.isFirstPage && (
              <>
                <InvoiceHeader />
                {/* Bill To */}
                <section className="mb-6">
                  <div className="text-sm font-semibold mb-2" style={{ color: template.colors.primary }}>Bill To:</div>
                  <div className="text-xs">
                    <div className="font-bold text-sm mb-1">{data.customer.name}</div>
                    <div>{data.customer.address}</div>
                    <div>{data.customer.city}, {data.customer.state} {data.customer.zip}</div>
                    {data.customer.phone && <div>{data.customer.phone}</div>}
                    {data.customer.email && <div>{data.customer.email}</div>}
                  </div>
                </section>
              </>
            )}

            {/* Page indicator for continuation pages */}
            {!page.isFirstPage && (
              <div className="mb-4 text-center text-xs text-gray-500">
                Page {page.pageNumber} of {page.totalPages} (continued)
              </div>
            )}

            {/* Items Table */}
            <section className="mb-6 flex-grow">
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
                    <th className="text-left py-2 px-4 font-semibold text-xs">Description</th>
                    <th className="text-center py-2 px-4 font-semibold text-xs">Quantity</th>
                    <th className="text-right py-2 px-4 font-semibold text-xs">Price</th>
                    <th className="text-right py-2 px-4 font-semibold text-xs">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {page.items.map((item, idx) => (
                    <tr key={item.id} style={{ backgroundColor: idx % 2 ? '#00000005' : 'transparent' }}>
                      <td className="py-2 px-4 text-xs" style={{ borderBottom: `1px solid ${template.colors.secondary}30` }}>{item.description}</td>
                      <td className="py-2 px-4 text-center text-xs" style={{ borderBottom: `1px solid ${template.colors.secondary}30` }}>{item.quantity}</td>
                      <td className="py-2 px-4 text-right text-xs" style={{ borderBottom: `1px solid ${template.colors.secondary}30` }}>{formatCurrency(item.rate)}</td>
                      <td className="py-2 px-4 text-right text-xs font-medium" style={{ borderBottom: `1px solid ${template.colors.secondary}30` }}>{formatCurrency(item.amount)}</td>
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
            {page.isLastPage && !needsSeparateTotalsPage && (
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

                  {/* Payment Information */}
                  {data.paidAmount !== undefined && data.paidAmount > 0 && (
                    <>
                      <div className="flex justify-between items-center mt-2 py-1 text-sm" style={{ color: '#10b981' }}>
                        <span className="font-semibold">Paid:</span>
                        <span className="font-bold">-{formatCurrency(data.paidAmount)}</span>
                      </div>
                      <div 
                        className="flex justify-between items-center mt-2 pt-2 border-t-2 text-lg font-extrabold" 
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
              </section>
            )}

            {/* Footer - only on last page if there's room */}
            {page.isLastPage && !needsSeparateTotalsPage && (
              <div className="mt-auto">
                <InvoiceFooter />
              </div>
            )}
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
            style={{
              width: '210mm',
              height: '297mm',
              backgroundColor: 'white',
              color: template.colors.text,
              fontFamily: `${template.fonts.primary}, 'Helvetica Neue', Arial, sans-serif`,
              border: template.layout.showBorder ? `6px solid ${template.colors.accent}` : 'none',
              borderRadius: template.layout.showBorder ? '8px' : '0px',
              boxSizing: 'border-box',
              position: 'relative',
              boxShadow: template.layout.showBorder ? `0 6px 25px rgba(0,0,0,0.18)` : 'none',
              margin: template.layout.showBorder ? '5mm' : '0mm',
              padding: '15mm',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
            className="print-invoice"
          >
            <div className="mb-4 text-center text-xs text-gray-500">
              Page {adjustedPages.length + 1} of {adjustedPages.length + 1} - Invoice Summary
            </div>

            {/* Totals Section */}
            <section className="mb-6 flex justify-end">
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

                {/* Payment Information */}
                {data.paidAmount !== undefined && data.paidAmount > 0 && (
                  <>
                    <div className="flex justify-between items-center mt-2 py-1 text-sm" style={{ color: '#10b981' }}>
                      <span className="font-semibold">Paid:</span>
                      <span className="font-bold">-{formatCurrency(data.paidAmount)}</span>
                    </div>
                    <div 
                      className="flex justify-between items-center mt-2 pt-2 border-t-2 text-lg font-extrabold" 
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
            </section>

            {/* Footer */}
            <div className="mt-auto">
              <InvoiceFooter />
            </div>
          </div>
        </>
      )}
    </>
  );
}
