'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '@/components/layouts/app-layout';
import { PaginatedTableCard, KPICard } from '@/components/ui/dashboard';
import { SalesPipeline } from '@/components/ui/sales/sales-pipeline';
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
  ChartBarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

// Mock pipeline data
const mockPipelineStages = [
  {
    id: 'lead',
    name: 'Lead',
    deals: [
      {
        id: 'deal_001',
        title: 'Enterprise Software License',
        customer: 'Acme Corporation',
        value: 50000,
        stage: 'lead',
        probability: 20,
        createdDate: '2024-01-15'
      },
      {
        id: 'deal_002',
        title: 'Cloud Infrastructure Setup',
        customer: 'TechStart Inc',
        value: 25000,
        stage: 'lead',
        probability: 15,
        createdDate: '2024-01-20'
      }
    ],
    color: 'bg-blue-500'
  },
  {
    id: 'qualified',
    name: 'Qualified',
    deals: [
      {
        id: 'deal_003',
        title: 'Digital Transformation Project',
        customer: 'Global Industries',
        value: 75000,
        stage: 'qualified',
        probability: 40,
        createdDate: '2024-01-10'
      },
      {
        id: 'deal_004',
        title: 'Security Audit & Compliance',
        customer: 'Finance Corp',
        value: 35000,
        stage: 'qualified',
        probability: 35,
        createdDate: '2024-01-18'
      }
    ],
    color: 'bg-yellow-500'
  },
  {
    id: 'proposal',
    name: 'Proposal',
    deals: [
      {
        id: 'deal_005',
        title: 'E-commerce Platform Development',
        customer: 'RetailMax',
        value: 120000,
        stage: 'proposal',
        probability: 60,
        createdDate: '2024-01-05'
      }
    ],
    color: 'bg-orange-500'
  },
  {
    id: 'negotiation',
    name: 'Negotiation',
    deals: [
      {
        id: 'deal_006',
        title: 'AI-Powered Analytics Suite',
        customer: 'DataTech Solutions',
        value: 90000,
        stage: 'negotiation',
        probability: 75,
        createdDate: '2024-01-12'
      }
    ],
    color: 'bg-purple-500'
  },
  {
    id: 'closed-won',
    name: 'Closed Won',
    deals: [
      {
        id: 'deal_007',
        title: 'Mobile App Development',
        customer: 'StartupVentures',
        value: 65000,
        stage: 'closed-won',
        probability: 100,
        createdDate: '2024-01-08'
      }
    ],
    color: 'bg-green-500'
  }
];

export default function PipelinePage() {
  const router = useRouter();
  const { formatCurrency } = useSettings();
  
  const [pipelineStages, setPipelineStages] = useState(mockPipelineStages);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [viewMode, setViewMode] = useState<'pipeline' | 'table'>('pipeline');

  // Calculate pipeline stats
  const stats = useMemo(() => {
    const allDeals = pipelineStages.flatMap(stage => stage.deals);
    const totalDeals = allDeals.length;
    const totalValue = allDeals.reduce((sum, deal) => sum + deal.value, 0);
    const weightedValue = allDeals.reduce((sum, deal) => sum + (deal.value * deal.probability / 100), 0);
    const closedWonDeals = pipelineStages.find(stage => stage.id === 'closed-won')?.deals.length || 0;
    const closedWonValue = pipelineStages.find(stage => stage.id === 'closed-won')?.deals.reduce((sum, deal) => sum + deal.value, 0) || 0;
    
    return {
      totalDeals,
      totalValue,
      weightedValue,
      closedWonDeals,
      closedWonValue,
      averageDealSize: totalDeals > 0 ? totalValue / totalDeals : 0
    };
  }, [pipelineStages]);

  // Filter deals for table view
  const filteredDeals = useMemo(() => {
    const allDeals = pipelineStages.flatMap(stage => 
      stage.deals.map(deal => ({ ...deal, stageName: stage.name }))
    );
    
    if (!searchTerm) return allDeals;
    
    return allDeals.filter(deal =>
      deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.customer.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [pipelineStages, searchTerm]);

  const handleAddDeal = (stageId: string) => {
    // In a real app, this would open a modal or navigate to a form
    console.log('Add deal to stage:', stageId);
    setToast({ message: `Add deal to ${pipelineStages.find(s => s.id === stageId)?.name} stage`, type: 'success' });
  };

  const handleMoveDeal = (dealId: string, fromStage: string, toStage: string) => {
    // In a real app, this would call an API
    console.log('Move deal:', dealId, 'from', fromStage, 'to', toStage);
    setToast({ message: 'Deal moved successfully', type: 'success' });
  };

  const handleDeleteDeal = (dealId: string) => {
    setPipelineStages(prev => prev.map(stage => ({
      ...stage,
      deals: stage.deals.filter(deal => deal.id !== dealId)
    })));
    setToast({ message: 'Deal deleted successfully', type: 'success' });
  };

  // Table configuration for deals
  const tableColumns = [
    { key: 'title', label: 'Deal Title', sortable: true },
    { key: 'customer', label: 'Customer', sortable: true },
    { key: 'stage', label: 'Stage', sortable: false },
    { key: 'value', label: 'Value', sortable: true },
    { key: 'probability', label: 'Probability', sortable: true },
    { key: 'expectedValue', label: 'Expected Value', sortable: true },
    { key: 'createdDate', label: 'Created', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false }
  ];

  const tableData = filteredDeals.map(deal => ({
    title: deal.title,
    customer: deal.customer,
    stage: (
      <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${pipelineStages.find(s => s.id === deal.stage)?.color}`}>
        {deal.stageName}
      </span>
    ),
    value: formatCurrency(deal.value),
    probability: `${deal.probability}%`,
    expectedValue: formatCurrency(deal.value * deal.probability / 100),
    createdDate: new Date(deal.createdDate).toLocaleDateString(),
    actions: (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => console.log('View deal:', deal.id)}>
          <EyeIcon className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => console.log('Edit deal:', deal.id)}>
          <PencilIcon className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => handleDeleteDeal(deal.id)}
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
              Sales Pipeline
            </h1>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Track and manage your sales opportunities
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <Button
                variant={viewMode === 'pipeline' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('pipeline')}
                className="px-3"
              >
                <ChartBarIcon className="h-4 w-4 mr-1" />
                Pipeline
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="px-3"
              >
                Table
              </Button>
            </div>
            <Button onClick={() => console.log('Add new deal')} className="flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              New Deal
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <KPICard 
            title="Total Pipeline Value" 
            value={formatCurrency(stats.totalValue)}
            icon={<CurrencyDollarIcon className="h-6 w-6" style={{ color: 'var(--accent)' }} />}
          />
          <KPICard 
            title="Expected Value" 
            value={formatCurrency(stats.weightedValue)}
            icon={<ChartBarIcon className="h-6 w-6 text-blue-500" />}
          />
          <KPICard 
            title="Closed Won" 
            value={stats.closedWonDeals.toString()}
            icon={<CheckCircleIcon className="h-6 w-6 text-green-500" />}
          />
          <KPICard 
            title="Active Deals" 
            value={stats.totalDeals.toString()}
            icon={<UserGroupIcon className="h-6 w-6 text-purple-500" />}
          />
        </div>

        {/* Pipeline View */}
        {viewMode === 'pipeline' ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border p-6" style={{ borderColor: 'var(--border)' }}>
            <SalesPipeline
              stages={pipelineStages}
              onAddDeal={handleAddDeal}
              onMoveDeal={handleMoveDeal}
              className="w-full"
            />
          </div>
        ) : (
          /* Table View */
          <div className="space-y-4">
            {/* Search */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
                  <Input
                    placeholder="Search deals by title or customer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Results Summary */}
            <div className="flex items-center justify-between text-sm" style={{ color: 'var(--muted-foreground)' }}>
              <span>
                Showing {filteredDeals.length} deals
                {searchTerm && ` matching "${searchTerm}"`}
              </span>
            </div>

            {/* Deals Table */}
            <PaginatedTableCard 
              title="All Deals"
              columns={tableColumns}
              data={tableData}
              itemsPerPage={10}
              headerActions={
                searchTerm && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    &quot;{searchTerm}&quot;
                  </span>
                )
              }
            />
          </div>
        )}

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
