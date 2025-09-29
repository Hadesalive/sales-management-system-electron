'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '@/components/layouts/app-layout';
import { PaginatedTableCard, KPICard } from '@/components/ui/dashboard';
import { Button, Toast } from '@/components/ui/core';
import { Input } from '@/components/ui/forms';
import { useSettings } from '@/contexts/SettingsContext';
import { useRouter } from 'next/navigation';
import { 
  PlusIcon, 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

// Mock invoice data - in real app, this would come from a service
const mockInvoices = [
  {
    id: 'inv_001',
    number: 'INV-2024-001',
    type: 'standard' as const,
    status: 'paid' as const,
    customerName: 'Acme Corporation',
    customerEmail: 'billing@acme.com',
    issueDate: '2024-01-15',
    dueDate: '2024-02-15',
    paidDate: '2024-02-10',
    subtotal: 2500.00,
    tax: 212.50,
    total: 2712.50,
    paidAmount: 2712.50,
    balance: 0.00,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-02-10T14:30:00Z'
  },
  {
    id: 'inv_002',
    number: 'INV-2024-002',
    type: 'standard' as const,
    status: 'pending' as const,
    customerName: 'Tech Solutions Inc',
    customerEmail: 'finance@techsolutions.com',
    issueDate: '2024-01-20',
    dueDate: '2024-02-20',
    paidDate: null,
    subtotal: 1800.00,
    tax: 153.00,
    total: 1953.00,
    paidAmount: 0.00,
    balance: 1953.00,
    createdAt: '2024-01-20T09:30:00Z',
    updatedAt: '2024-01-20T09:30:00Z'
  },
  {
    id: 'inv_003',
    number: 'INV-2024-003',
    type: 'proforma' as const,
    status: 'draft' as const,
    customerName: 'Startup Ventures',
    customerEmail: 'admin@startupventures.com',
    issueDate: '2024-01-25',
    dueDate: '2024-02-25',
    paidDate: null,
    subtotal: 3200.00,
    tax: 272.00,
    total: 3472.00,
    paidAmount: 0.00,
    balance: 3472.00,
    createdAt: '2024-01-25T16:45:00Z',
    updatedAt: '2024-01-25T16:45:00Z'
  },
  {
    id: 'inv_004',
    number: 'INV-2024-004',
    type: 'standard' as const,
    status: 'overdue' as const,
    customerName: 'Global Industries',
    customerEmail: 'accounts@globalind.com',
    issueDate: '2024-01-10',
    dueDate: '2024-02-10',
    paidDate: null,
    subtotal: 4500.00,
    tax: 382.50,
    total: 4882.50,
    paidAmount: 1000.00,
    balance: 3882.50,
    createdAt: '2024-01-10T11:20:00Z',
    updatedAt: '2024-02-15T08:15:00Z'
  }
];

export default function InvoicesPage() {
  const router = useRouter();
  const { formatCurrency, formatDate } = useSettings();
  
  const [invoices, setInvoices] = useState(mockInvoices);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState<'issueDate' | 'dueDate' | 'total' | 'customerName'>('issueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter and sort invoices
  const filteredAndSortedInvoices = useMemo(() => {
    let filtered = invoices.filter(invoice => {
      const matchesSearch = !searchTerm || 
        invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = !statusFilter || invoice.status === statusFilter;
      const matchesType = !typeFilter || invoice.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });

    // Sort invoices
    filtered.sort((a, b) => {
      let aValue: string | number | Date = a[sortBy];
      let bValue: string | number | Date = b[sortBy];
      
      if (sortBy === 'issueDate' || sortBy === 'dueDate') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [invoices, searchTerm, statusFilter, typeFilter, sortBy, sortOrder]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
    const pendingInvoices = invoices.filter(inv => inv.status === 'pending').length;
    const overdueInvoices = invoices.filter(inv => inv.status === 'overdue').length;
    const totalRevenue = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0);
    const pendingAmount = invoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.balance, 0);
    const overdueAmount = invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.balance, 0);
    
    return {
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      overdueInvoices,
      totalRevenue,
      pendingAmount,
      overdueAmount
    };
  }, [invoices]);

  const handleDeleteInvoice = (invoiceId: string) => {
    // In real app, this would call an API
    setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
    setToast({ message: 'Invoice deleted successfully', type: 'success' });
  };

  const handleViewInvoice = (invoiceId: string) => {
    router.push(`/invoices/${invoiceId}`);
  };

  const handleEditInvoice = (invoiceId: string) => {
    router.push(`/invoices/${invoiceId}/edit`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case 'overdue':
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      case 'draft':
        return <DocumentTextIcon className="h-4 w-4 text-gray-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Table configuration
  const tableColumns = [
    { key: 'number', label: 'Invoice #', sortable: true },
    { key: 'customer', label: 'Customer', sortable: true },
    { key: 'type', label: 'Type', sortable: false },
    { key: 'status', label: 'Status', sortable: false },
    { key: 'total', label: 'Total', sortable: true },
    { key: 'balance', label: 'Balance', sortable: false },
    { key: 'dueDate', label: 'Due Date', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false }
  ];

  const tableData = filteredAndSortedInvoices.map(invoice => ({
    number: invoice.number,
    customer: (
      <div>
        <div className="font-medium" style={{ color: 'var(--foreground)' }}>
          {invoice.customerName}
        </div>
        <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
          {invoice.customerEmail}
        </div>
      </div>
    ),
    type: (
      <span className="capitalize text-sm" style={{ color: 'var(--foreground)' }}>
        {invoice.type.replace('_', ' ')}
      </span>
    ),
    status: (
      <div className="flex items-center gap-2">
        {getStatusIcon(invoice.status)}
        <span 
          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}
        >
          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
        </span>
      </div>
    ),
    total: formatCurrency(invoice.total),
    balance: invoice.balance > 0 ? formatCurrency(invoice.balance) : (
      <span className="text-green-600 font-medium">Paid</span>
    ),
    dueDate: formatDate(invoice.dueDate),
    actions: (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => handleViewInvoice(invoice.id)}>
          <EyeIcon className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => handleEditInvoice(invoice.id)}>
          <PencilIcon className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => console.log('Download invoice')}>
          <ArrowDownTrayIcon className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => handleDeleteInvoice(invoice.id)}
          className="text-red-600 hover:text-red-700"
        >
          <TrashIcon className="h-4 w-4" />
        </Button>
      </div>
    )
  }));

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
              Invoices
            </h1>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Manage your invoices and billing
            </p>
          </div>
          <Button onClick={() => router.push('/invoices/new')} className="flex items-center gap-2">
            <PlusIcon className="h-4 w-4" />
            New Invoice
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <KPICard 
            title="Total Revenue" 
            value={formatCurrency(stats.totalRevenue)}
            icon={<CurrencyDollarIcon className="h-6 w-6" style={{ color: 'var(--accent)' }} />}
          />
          <KPICard 
            title="Paid Invoices" 
            value={stats.paidInvoices.toString()}
            icon={<CheckCircleIcon className="h-6 w-6 text-green-500" />}
          />
          <KPICard 
            title="Pending Amount" 
            value={formatCurrency(stats.pendingAmount)}
            icon={<ClockIcon className="h-6 w-6 text-yellow-500" />}
          />
          <KPICard 
            title="Overdue Amount" 
            value={formatCurrency(stats.overdueAmount)}
            icon={<XCircleIcon className="h-6 w-6 text-red-500" />}
          />
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
              <Input
                placeholder="Search invoices by number, customer, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="min-w-[120px] px-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="min-w-[140px] px-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            >
              <option value="">All Types</option>
              <option value="standard">Standard</option>
              <option value="proforma">Proforma</option>
              <option value="credit_note">Credit Note</option>
              <option value="debit_note">Debit Note</option>
              <option value="quote">Quote</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'issueDate' | 'dueDate' | 'total' | 'customerName')}
              className="min-w-[120px] px-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            >
              <option value="issueDate">Sort by Issue Date</option>
              <option value="dueDate">Sort by Due Date</option>
              <option value="total">Sort by Total</option>
              <option value="customerName">Sort by Customer</option>
            </select>
            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm" style={{ color: 'var(--muted-foreground)' }}>
          <span>
            Showing {filteredAndSortedInvoices.length} of {invoices.length} invoices
            {searchTerm && ` matching "${searchTerm}"`}
            {statusFilter && ` with status "${statusFilter}"`}
            {typeFilter && ` of type "${typeFilter}"`}
          </span>
        </div>

        {/* Invoices Table */}
        <PaginatedTableCard 
          title="All Invoices"
          columns={tableColumns}
          data={tableData}
          itemsPerPage={10}
          headerActions={
            <div className="flex items-center gap-2">
              {searchTerm && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  &quot;{searchTerm}&quot;
                </span>
              )}
              {statusFilter && (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  {statusFilter}
                </span>
              )}
              {typeFilter && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                  {typeFilter}
                </span>
              )}
            </div>
          }
        />

        {/* Toast Notifications */}
        {toast && (
          <Toast
            title={toast.message}
            variant={toast.type}
            onClose={() => setToast(null)}
          >
            {toast.message}
          </Toast>
        )}
      </div>
    </AppLayout>
  );
}
