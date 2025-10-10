/**
 * Multi-Page Invoice Utilities
 * 
 * Industry standard approach for handling invoices with many items:
 * - Automatic page breaks based on A4 paper size
 * - Repeated table headers on each page
 * - Page numbers and continuation indicators
 * - Totals only on the last page
 */

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface PageConfig {
  /** Maximum number of items per page (default: 12 for A4) */
  itemsPerPage?: number;
  /** Whether to show page numbers (default: true) */
  showPageNumbers?: boolean;
  /** Whether to show "Continued..." on overflow pages (default: true) */
  showContinuedLabel?: boolean;
}

export interface InvoicePage {
  pageNumber: number;
  totalPages: number;
  items: InvoiceItem[];
  isFirstPage: boolean;
  isLastPage: boolean;
  itemsRange: {
    start: number; // 1-based index for display
    end: number;   // 1-based index for display
  };
}

/**
 * Split invoice items into pages for multi-page rendering
 *
 * Industry standard: 10-15 items per A4 page (we use 12 as default)
 * This accounts for header, company info, totals, and footer space
 *
 * The key insight: The last page needs space for totals section, so it should have fewer items
 */
export function paginateInvoiceItems(
  items: InvoiceItem[],
  config: PageConfig = {}
): InvoicePage[] {
  const {
    itemsPerPage = 12, // Industry standard for A4 invoices
  } = config;

  if (items.length === 0) {
    // Return single empty page
    return [{
      pageNumber: 1,
      totalPages: 1,
      items: [],
      isFirstPage: true,
      isLastPage: true,
      itemsRange: { start: 0, end: 0 }
    }];
  }

  // Calculate how many items can fit on each page
  // Last page needs extra space for totals section (~80mm)
  const regularPageItems = itemsPerPage; // Full pages can have max items
  const lastPageItems = Math.max(1, itemsPerPage - 3); // Last page needs room for totals

  // If we have very few items, just put them on one page
  if (items.length <= regularPageItems) {
    return [{
      pageNumber: 1,
      totalPages: 1,
      items: [...items],
      isFirstPage: true,
      isLastPage: true,
      itemsRange: { start: 1, end: items.length }
    }];
  }

  // Calculate how many pages we need
  const itemsWithoutLastPage = items.length - lastPageItems;
  const regularPages = Math.ceil(itemsWithoutLastPage / regularPageItems);
  const totalPages = regularPages + 1;

  const pages: InvoicePage[] = [];

  // Fill regular pages (all except last)
  for (let pageNum = 1; pageNum <= regularPages; pageNum++) {
    const startIdx = (pageNum - 1) * regularPageItems;
    const endIdx = Math.min(startIdx + regularPageItems, items.length - lastPageItems);
    const pageItems = items.slice(startIdx, endIdx);

    pages.push({
      pageNumber: pageNum,
      totalPages,
      items: pageItems,
      isFirstPage: pageNum === 1,
      isLastPage: false,
      itemsRange: {
        start: startIdx + 1,
        end: endIdx
      }
    });
  }

  // Add the last page with remaining items (fewer items to make room for totals)
  const lastPageStartIdx = items.length - lastPageItems;
  const lastPageItemsSlice = items.slice(lastPageStartIdx);

  pages.push({
    pageNumber: totalPages,
    totalPages,
    items: lastPageItemsSlice,
    isFirstPage: false,
    isLastPage: true,
    itemsRange: {
      start: lastPageStartIdx + 1,
      end: items.length
    }
  });

  return pages;
}

/**
 * Calculate if an invoice will span multiple pages
 */
export function isMultiPageInvoice(itemCount: number, itemsPerPage: number = 12): boolean {
  return itemCount > itemsPerPage;
}

/**
 * Get recommended items per page based on template type
 */
export function getRecommendedItemsPerPage(templateType: 'compact' | 'standard' | 'detailed'): number {
  switch (templateType) {
    case 'compact':
      return 8;  // More items, less spacing
    case 'detailed':
      return 4;  // Fewer items, more details/spacing
    case 'standard':
    default:
      return 6;  // Conservative - fits nicely on A4
  }
}

/**
 * Page break component for print media
 * Ensures clean breaks between pages when printing
 */
export function PageBreak() {
  return (
    <div 
      className="page-break" 
      style={{ 
        pageBreakAfter: 'always',
        breakAfter: 'page',
        height: '0',
        overflow: 'hidden'
      }} 
    />
  );
}

/**
 * Page number component - industry standard placement
 */
export function PageNumber({ 
  current, 
  total, 
  className = '' 
}: { 
  current: number; 
  total: number; 
  className?: string;
}) {
  if (total <= 1) return null; // Don't show page numbers for single-page invoices
  
  return (
    <div className={`text-xs text-gray-500 text-center ${className}`}>
      Page {current} of {total}
    </div>
  );
}

/**
 * Continuation label - shown on pages that continue from previous page
 */
export function ContinuationLabel({ 
  className = '' 
}: { 
  className?: string;
}) {
  return (
    <div className={`text-xs text-gray-500 italic ${className}`}>
      (Continued...)
    </div>
  );
}

/**
 * Items range indicator - shows "Items 1-12 of 45"
 */
export function ItemsRangeIndicator({ 
  start, 
  end, 
  total,
  className = '' 
}: { 
  start: number; 
  end: number; 
  total: number;
  className?: string;
}) {
  if (total <= 12) return null; // Don't show for small invoices
  
  return (
    <div className={`text-xs text-gray-600 ${className}`}>
      Items {start}–{end} of {total}
    </div>
  );
}

