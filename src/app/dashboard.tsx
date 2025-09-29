'use client';

import React, { useState, useEffect } from 'react';
import { 
  KPICard,
  ChartCard,
  ListCard,
  PaginatedTableCard
} from "@/components/ui/dashboard";
import { salesService, customerService, productService } from '@/lib/services';
import { Sale } from '@/lib/types/core';
import { Line, Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import type { ChartOptions } from "chart.js";
import { formatCurrency } from "@/lib/utils";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend);

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalSales: 0,
    totalCustomers: 0,
    totalProducts: 0,
  });
  const [loading, setLoading] = useState(true);
  
  // Get accent color from CSS variables
  const accent = (typeof window !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue('--accent') : '') || '#ff6b00';

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [salesRes, customersRes, productsRes] = await Promise.all([
        salesService.getAllSales(),
        customerService.getAllCustomers(),
        productService.getAllProducts()
      ]);

      if (salesRes.success && salesRes.data) {
        const totalRevenue = salesRes.data.reduce((sum: number, sale: Sale) => sum + sale.total, 0);
        setStats(prev => ({
          ...prev,
          totalRevenue,
          totalSales: salesRes.data!.length,
        }));
      }

      if (customersRes.success && customersRes.data) {
        setStats(prev => ({
          ...prev,
          totalCustomers: customersRes.data!.length,
        }));
      }

      if (productsRes.success && productsRes.data) {
        setStats(prev => ({
          ...prev,
          totalProducts: productsRes.data!.length,
        }));
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Chart options
  const lineOptions: ChartOptions<'line'> = { 
    responsive: true, 
    plugins: { legend: { display: false } }, 
    scales: { 
      x: { grid: { display: false } }, 
      y: { grid: { color: 'rgba(127,127,127,0.2)' } } 
    } 
  };

  const doughnutOptions: ChartOptions<'doughnut'> = { 
    plugins: { legend: { display: false } } 
  };

  const barOptions: ChartOptions<'bar'> = { 
    plugins: { legend: { display: false } }, 
    scales: { 
      x: { grid: { display: false } }, 
      y: { grid: { color: 'rgba(127,127,127,0.2)' } } 
    } 
  };

  // Mock data for charts (replace with real data from stats)
  const weeklySales = [1200, 1900, 700, 1500, 2200, 1800, 2400];
  const orderStatus = { completed: 52, pending: 35, cancelled: 13 };
  const categorySales = { mac: 14, iphone: 19, ipad: 11, watch: 7, audio: 9, accessories: 15 };

  // Enhanced mock data for top customers (top 10)
  const topCustomers = [
    { id: '1', label: 'Sarah Johnson', value: '$2,450.00' },
    { id: '2', label: 'Mike Chen', value: '$1,890.00' },
    { id: '3', label: 'Emily Rodriguez', value: '$1,650.00' },
    { id: '4', label: 'David Kim', value: '$1,420.00' },
    { id: '5', label: 'Lisa Wang', value: '$1,280.00' },
    { id: '6', label: 'James Wilson', value: '$1,150.00' },
    { id: '7', label: 'Maria Garcia', value: '$980.00' },
    { id: '8', label: 'Robert Brown', value: '$850.00' },
    { id: '9', label: 'Jennifer Lee', value: '$750.00' },
    { id: '10', label: 'Alex Thompson', value: '$650.00' }
  ];

  const tableColumns = [
    { key: 'id', label: 'Sale ID' },
    { key: 'customer', label: 'Customer' },
    { key: 'total', label: 'Total' },
    { key: 'status', label: 'Status' },
    { key: 'date', label: 'Date' }
  ];

  // Enhanced mock data for recent sales table
  const tableData = [
    {
      id: 'TN001234',
      customer: 'Sarah Johnson',
      total: '$2,450.00',
      status: (
        <span 
          className="px-2 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            color: 'rgb(34, 197, 94)'
          }}
        >
          Completed
        </span>
      ),
      date: '2024-01-15'
    },
    {
      id: 'TN001235',
      customer: 'Mike Chen',
      total: '$1,890.00',
      status: (
        <span 
          className="px-2 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            color: 'rgb(34, 197, 94)'
          }}
        >
          Completed
        </span>
      ),
      date: '2024-01-15'
    },
    {
      id: 'TN001236',
      customer: 'Emily Rodriguez',
      total: '$1,650.00',
      status: (
        <span 
          className="px-2 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: 'rgba(251, 191, 36, 0.1)',
            color: 'rgb(251, 191, 36)'
          }}
        >
          Pending
        </span>
      ),
      date: '2024-01-14'
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard grid */}
      <section className="grid grid-cols-1 md:grid-cols-6 gap-4">
        {/* KPI cards */}
        <KPICard 
          title="Total Revenue" 
          value={formatCurrency(stats.totalRevenue)} 
          className="md:col-span-2" 
        />
        <KPICard 
          title="Total Sales" 
          value={stats.totalSales.toString()} 
          className="md:col-span-2" 
        />
        <KPICard 
          title="Customers" 
          value={stats.totalCustomers.toString()} 
          className="md:col-span-2" 
        />

        {/* Charts */}
        <ChartCard 
          title="Sales (last 7 days)" 
          className="md:col-span-4"
        >
          <Line
            data={{
              labels: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
              datasets: [{
                label: "Sales",
                data: weeklySales.map(v=>v/100),
                borderColor: accent,
                backgroundColor: 'transparent',
                tension: 0.35,
              }]
            }}
            options={lineOptions}
          />
        </ChartCard>

        <ChartCard 
          title="Order Status" 
          className="md:col-span-2"
        >
          <Doughnut
            data={{
              labels: ['Completed','Pending','Cancelled'],
              datasets: [{
                data: [orderStatus.completed, orderStatus.pending, orderStatus.cancelled],
                backgroundColor: [
                  accent,
                  'rgba(127,127,127,0.35)',
                  'rgba(127,127,127,0.2)'
                ],
                borderWidth: 0,
              }]
            }}
            options={{ ...doughnutOptions, cutout: '70%' }}
          />
        </ChartCard>

        {/* Lists and charts */}
        <ListCard 
          title="Top Customers" 
          items={topCustomers}
          className="md:col-span-3"
          itemsPerPage={0}
        />
        <ChartCard 
          title="Sales by Category" 
          className="md:col-span-3"
        >
          <Bar
            data={{
              labels: ['Mac','iPhone','iPad','Watch','Audio','Accessories'],
              datasets: [{
                label: 'Category Sales',
                data: [categorySales.mac, categorySales.iphone, categorySales.ipad, categorySales.watch, categorySales.audio, categorySales.accessories],
                backgroundColor: accent,
                borderRadius: 6,
              }]
            }}
            options={barOptions}
          />
        </ChartCard>

        {/* Recent Sales table */}
        <PaginatedTableCard 
          title="Recent Sales" 
          columns={tableColumns}
          data={tableData}
          className="md:col-span-6"
        />
      </section>
    </div>
  );
}

