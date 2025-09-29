'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { 
  DashboardLayout, 
  DashboardHeader, 
  DashboardSidebar, 
  MobileDrawer 
} from '@/components/ui/dashboard';
import { defaultSidebarItems } from '@/components/ui/dashboard/dashboard-sidebar';
import { useDarkMode } from '@/lib/hooks/useDarkMode';

interface AppLayoutProps {
  children: React.ReactNode;
}

function AppLayoutContent({ children }: AppLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pageTitle, setPageTitle] = useState('TopNotch Sales Manager');
  const pathname = usePathname();
  
  // Apply dark mode from settings
  useDarkMode();

  // Get current page title from route
  const getCurrentPageTitle = useCallback(() => {
    if (pathname === '/') return 'Overview';
    if (pathname.startsWith('/sales')) return 'Sales';
    if (pathname.startsWith('/pipeline')) return 'Sales Pipeline';
    if (pathname.startsWith('/invoices')) return 'Invoices';
    if (pathname.startsWith('/orders')) return 'Orders';
    if (pathname.startsWith('/products')) return 'Products';
    if (pathname.startsWith('/customers')) return 'Customers';
    if (pathname.startsWith('/inventory')) return 'Inventory';
    if (pathname.startsWith('/shipping')) return 'Shipping';
    if (pathname.startsWith('/returns')) return 'Returns';
    if (pathname.startsWith('/reports')) return 'Reports';
    if (pathname.startsWith('/settings')) {
      return 'Settings';
    }
    return 'TopNotch Sales Manager';
  }, [pathname]);

  // Update page title when route or search params change
  useEffect(() => {
    setPageTitle(getCurrentPageTitle());
  }, [getCurrentPageTitle]);

  const handleSidebarSelect = (name: string) => {
    // Map sidebar names to routes
    const routeMap: Record<string, string> = {
      'Overview': '/',
      'Sales': '/sales',
      'Pipeline': '/pipeline',
      'Invoices': '/invoices',
      'Orders': '/orders',
      'Products': '/products',
      'Customers': '/customers',
      'Inventory': '/inventory',
      'Shipping': '/shipping',
      'Returns': '/returns',
      'Reports': '/reports',
      'Settings': '/settings',
      // Simplified settings sub-menus
      'Company Info': '/settings?tab=company',
      'Tax Settings': '/settings?tab=tax',
      'Data Backup': '/settings?tab=backup',
      'Preferences': '/settings?tab=preferences',
    };

    const route = routeMap[name];
    if (route && route !== pathname) {
      window.location.href = route;
    }
    setIsMobileMenuOpen(false);
  };

  const handleMobileMenuToggle = () => {
    const drawer = document.getElementById('mobile-drawer') as HTMLDialogElement;
    if (drawer) {
      if (isMobileMenuOpen) {
        drawer.close();
      } else {
        drawer.showModal();
      }
      setIsMobileMenuOpen(!isMobileMenuOpen);
    }
  };

  const handleMobileSidebarSelect = (name: string) => {
    handleSidebarSelect(name);
    setIsMobileMenuOpen(false);
  };

  const getHeaderActions = () => {
    // Different actions based on current page
    if (pathname === '/sales') {
      return (
        <>
          <button 
            className="btn btn-ghost"
            onClick={() => window.location.href = '/sales/new'}
          >
            New Sale
          </button>
        </>
      );
    }
    
    if (pathname === '/invoices') {
      return (
        <>
          <button 
            className="btn btn-ghost"
            onClick={() => window.location.href = '/invoices/new'}
          >
            New Invoice
          </button>
        </>
      );
    }
    
    if (pathname === '/pipeline') {
      return (
        <>
          <button 
            className="btn btn-ghost"
            onClick={() => console.log('Add new deal')}
          >
            New Deal
          </button>
        </>
      );
    }
    
    if (pathname === '/customers') {
      return (
        <>
          <button 
            className="btn btn-ghost"
            onClick={() => window.location.href = '/customers/new'}
          >
            New Customer
          </button>
        </>
      );
    }
    
    if (pathname === '/products') {
      return (
        <>
          <button 
            className="btn btn-ghost"
            onClick={() => window.location.href = '/products/new'}
          >
            New Product
          </button>
        </>
      );
    }

    return null;
  };

  return (
    <DashboardLayout
      sidebar={
        <DashboardSidebar 
          active={pageTitle}
          onSelect={handleSidebarSelect}
          items={defaultSidebarItems}
        />
      }
          header={
            <DashboardHeader
              title={pageTitle}
              onMenuClick={handleMobileMenuToggle}
              actions={getHeaderActions()}
            />
          }
      mobileDrawer={
        <MobileDrawer id="mobile-drawer" title="Navigation">
          <DashboardSidebar 
            active={pageTitle}
            onSelect={handleMobileSidebarSelect}
            items={defaultSidebarItems}
            drawer
          />
        </MobileDrawer>
      }
    >
      {children}
    </DashboardLayout>
  );
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AppLayoutContent>{children}</AppLayoutContent>
    </Suspense>
  );
}