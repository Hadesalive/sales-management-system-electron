import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AppLayout } from '@/components/layouts/app-layout'

// Import all your existing page components
import HomePage from './pages/HomePage'
import OnboardingPage from './pages/OnboardingPage'
import CustomersPage from './pages/CustomersPage'
import CustomerDetailPage from './pages/CustomerDetailPage'
import CustomerNewPage from './pages/CustomerNewPage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import ProductNewPage from './pages/ProductNewPage'
import InvoicesPage from './pages/InvoicesPage'
import InvoiceDetailPage from './pages/InvoiceDetailPage'
import InvoiceEditPage from './pages/InvoiceEditPage'
import InvoiceNewPage from './pages/InvoiceNewPage'
import InvoiceTemplatesPage from './pages/InvoiceTemplatesPage'
import SalesPage from './pages/SalesPage'
import SaleDetailPage from './pages/SaleDetailPage'
import SaleEditPage from './pages/SaleEditPage'
import SaleNewPage from './pages/SaleNewPage'
import OrdersPage from './pages/OrdersPage'
import OrderDetailPage from './pages/OrderDetailPage'
import OrderEditPage from './pages/OrderEditPage'
import OrderNewPage from './pages/OrderNewPage'
import ReturnsPage from './pages/ReturnsPage'
import ReturnDetailPage from './pages/ReturnDetailPage'
import ReturnEditPage from './pages/ReturnEditPage'
import ReturnNewPage from './pages/ReturnNewPage'
import ReportsPage from './pages/ReportsPage'
import SettingsPage from './pages/SettingsPage'
import InventoryPage from './pages/InventoryPage'
import TestPage from './pages/TestPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="onboarding" element={<OnboardingPage />} />
        
        {/* Customers */}
        <Route path="customers" element={<CustomersPage />} />
        <Route path="customers/new" element={<CustomerNewPage />} />
        <Route path="customers/:id" element={<CustomerDetailPage />} />
        
        {/* Products */}
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/new" element={<ProductNewPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        
        {/* Invoices */}
        <Route path="invoices" element={<InvoicesPage />} />
        <Route path="invoices/new" element={<InvoiceNewPage />} />
        <Route path="invoices/templates" element={<InvoiceTemplatesPage />} />
        <Route path="invoices/:id" element={<InvoiceDetailPage />} />
        <Route path="invoices/:id/edit" element={<InvoiceEditPage />} />
        
        {/* Sales */}
        <Route path="sales" element={<SalesPage />} />
        <Route path="sales/new" element={<SaleNewPage />} />
        <Route path="sales/:id" element={<SaleDetailPage />} />
        <Route path="sales/:id/edit" element={<SaleEditPage />} />
        
        {/* Orders */}
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/new" element={<OrderNewPage />} />
        <Route path="orders/:id" element={<OrderDetailPage />} />
        <Route path="orders/:id/edit" element={<OrderEditPage />} />
        
        {/* Returns */}
        <Route path="returns" element={<ReturnsPage />} />
        <Route path="returns/new" element={<ReturnNewPage />} />
        <Route path="returns/:id" element={<ReturnDetailPage />} />
        <Route path="returns/:id/edit" element={<ReturnEditPage />} />
        
        {/* Other pages */}
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="test" element={<TestPage />} />
      </Route>
    </Routes>
  )
}

export default App
