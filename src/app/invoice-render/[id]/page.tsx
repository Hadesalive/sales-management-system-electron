import { TemplateRenderer } from '@/components/ui/invoice/template-renderers';
import { allTemplates } from '@/components/ui/invoice/templates';

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
    phone: string;
    email: string;
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

async function getInvoiceData(id: string): Promise<InvoiceData> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/invoices/${id}`, {
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error('Invoice not found');
  }

  const invoiceData = await response.json();

  return {
    invoiceNumber: invoiceData.number,
    date: invoiceData.issueDate,
    dueDate: invoiceData.dueDate,
    invoiceType: invoiceData.invoiceType || 'invoice',
    currency: invoiceData.currency || 'USD',
    paidAmount: invoiceData.paidAmount,
    balance: invoiceData.balance,
    status: invoiceData.status,
    company: {
      name: "TopNotch Electronics LTD",
      address: "Pultney Street Freetown",
      city: "San Francisco",
      state: "CA",
      zip: "94105",
      phone: "+232 74762243",
      email: "company@topnotch.com",
    },
    customer: {
      name: invoiceData.customerName || 'Customer',
      address: invoiceData.customerAddress || '',
      city: '',
      state: '',
      zip: '',
      phone: invoiceData.customerPhone || 'N/A',
      email: invoiceData.customerEmail || '',
    },
    items: invoiceData.items || [],
    notes: invoiceData.notes || 'Thank you for your business!',
    terms: invoiceData.terms || 'Payment due within 30 days.',
    taxRate: invoiceData.subtotal > 0 ? (invoiceData.tax / invoiceData.subtotal) * 100 : 0,
    discount: invoiceData.discount,
    bankDetails: invoiceData.bankDetails || {
      bankName: "TopNotch Bank",
      accountName: "TopNotch Electronics LTD",
      accountNumber: "1234567890",
      routingNumber: "987654321",
      swiftCode: "TNBKUS33"
    },
  };
}

export default async function InvoiceRenderPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ id: string }>;
  searchParams: Promise<{ template?: string }>;
}) {
  const { id } = await params;
  const { template: templateId = 'pro-corporate' } = await searchParams;
  
  try {
    const data = await getInvoiceData(id);
    const template = allTemplates.find(t => t.id === templateId) || allTemplates[0];

    return (
      <div className="invoice-pdf-render">
        <TemplateRenderer 
          data={data} 
          template={template} 
          brandLogos={[]} 
        />
      </div>
    );
  } catch {
    return (
      <div className="error">
        <h1>Error loading invoice</h1>
        <p>Invoice not found or error occurred.</p>
      </div>
    );
  }
}
