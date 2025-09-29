import React from "react";

import { ReactNode } from "react";

interface DashboardLayoutProps {
  sidebar: ReactNode;
  header: ReactNode;
  children: ReactNode;
  mobileDrawer?: ReactNode;
  className?: string;
}

export function DashboardLayout({ 
  sidebar, 
  header, 
  children, 
  mobileDrawer,
  className = "" 
}: DashboardLayoutProps) {
  return (
    <div className={`min-h-screen ${className}`}>
      <div className="flex">
        {/* Left Sidebar (desktop) - Fixed */}
        <div className="hidden lg:block fixed left-0 top-0 h-screen w-60 z-10">
          {sidebar}
        </div>
        
        {/* Main Column - Offset for fixed sidebar */}
        <main className="flex-1 lg:ml-60">
          <div className="py-6 px-4 md:px-8 lg:px-10 space-y-8">
            {header}
            {children}
          </div>
        </main>
      </div>
      
      {/* Mobile drawer */}
      {mobileDrawer}
    </div>
  );
}
