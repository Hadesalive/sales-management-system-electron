"use client";

import React, { useState } from "react";

import { 
  Squares2X2Icon,
  CubeIcon,
  UsersIcon,
  ChartBarIcon,
  TagIcon,
  AdjustmentsVerticalIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  TruckIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  FunnelIcon} from "@heroicons/react/24/outline";
import { useTheme } from "@/contexts/ThemeContext";
import Image from "next/image";

// Types for sidebar items
interface SubMenuItem {
  id: string;
  name: string;
}

interface SubMenuCategory {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  subMenus: SubMenuItem[];
}

interface SidebarItem {
  name: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  subMenus?: SubMenuCategory[];
}

export const defaultSidebarItems = [
  { name: "Overview", icon: Squares2X2Icon },
  { name: "Sales", icon: CurrencyDollarIcon },
  { name: "Pipeline", icon: FunnelIcon },
  { name: "Invoices", icon: DocumentTextIcon },
  { name: "Orders", icon: ClipboardDocumentListIcon },
  { name: "Products", icon: CubeIcon },
  { name: "Customers", icon: UsersIcon },
  { name: "Inventory", icon: TagIcon },
  { name: "Shipping", icon: TruckIcon },
  { name: "Returns", icon: ArrowPathIcon },
  { name: "Reports", icon: ChartBarIcon },
  { name: "Settings", icon: AdjustmentsVerticalIcon },
];

export function DashboardSidebar({
  active,
  onSelect,
  items = defaultSidebarItems,
  drawer = false,
}: {
  active: string;
  onSelect: (name: string) => void;
  items?: SidebarItem[];
  drawer?: boolean;
}) {
  const { theme } = useTheme();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [expandedSubItems, setExpandedSubItems] = useState<Set<string>>(new Set());

  
  const wrapperClasses = drawer
    ? "px-3 pt-3 pb-4 h-full overflow-auto"
    : "px-3 lg:px-4 h-full overflow-y-auto pt-3.5 border-r";

  const toggleExpanded = (itemName: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemName)) {
      newExpanded.delete(itemName);
      // Also collapse any expanded sub-items
      const newExpandedSub = new Set(expandedSubItems);
      const item = items.find(i => i.name === itemName);
      if (item?.subMenus) {
        item.subMenus.forEach(subMenu => {
          newExpandedSub.delete(subMenu.id);
        });
      }
      setExpandedSubItems(newExpandedSub);
    } else {
      newExpanded.add(itemName);
    }
    setExpandedItems(newExpanded);
  };


  const handleItemClick = (item: SidebarItem) => {
    if (item.subMenus) {
      toggleExpanded(item.name);
    } else {
      onSelect(item.name);
    }
  };


  const renderSubMenus = (subMenus: SubMenuCategory[]) => {
    return subMenus.map((subMenu) => {
      const isActive = active === subMenu.name;

      return (
        <div key={subMenu.id}>
          <button
            onClick={() => onSelect(subMenu.name)}
            className={`relative w-full flex items-center gap-3 py-2.5 rounded-md text-left transition-colors duration-200 text-sm font-medium pl-8 pr-3 ${
              isActive ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
            }`}
            style={{ color: isActive ? 'var(--accent)' : 'var(--color-foreground)' }}
            aria-current={isActive ? "page" : undefined}
          >
            {subMenu.icon && (
              <subMenu.icon 
                className="h-4 w-4 transition-colors duration-200" 
                style={{ color: isActive ? 'var(--accent)' : 'var(--color-foreground)' }} 
              />
            )}
            <span className={`transition-colors duration-200 ${isActive ? 'font-semibold' : ''}`}>
              {subMenu.name}
            </span>
          </button>
        </div>
      );
    });
  };

  return (
    <aside 
      className={wrapperClasses} 
      style={{ 
        borderColor: drawer ? undefined : 'var(--color-border)',
        background: 'var(--background)'
      }}
    >
      <div className="h-12 flex items-center mb-2 px-1">
        <Image
          key={theme === 'dark' ? "dark" : "light"}
          src={theme === 'dark' ? "/Assets/topnotch-logo-light.png" : "/Assets/topnotch-logo-dark.png"}
          alt="TopNotch Electronics"
          width={120}
          height={120}
          className="h-16 sm:h-20 md:h-24 lg:h-28 xl:h-32 w-auto"
        />
      </div>
      <nav className="space-y-0.5 mt-2">
        {items.map((item) => {
          const hasSubMenus = item.subMenus && item.subMenus.length > 0;
          const isExpanded = expandedItems.has(item.name);
          const isActive = active === item.name || (hasSubMenus && isExpanded);

          return (
            <div key={item.name}>
              <button
                onClick={() => handleItemClick(item)}
                className={`relative w-full flex items-center gap-3 pl-4 pr-3 py-2.5 rounded-md text-left transition-colors duration-200 text-[--color-foreground] text-sm md:text-[15px]`}
                aria-current={isActive ? "page" : undefined}
              >
                <span 
                  className="absolute left-1 top-1/2 -translate-y-1/2 h-6 rounded-full transition-all duration-300" 
                  style={{ width: isActive ? '3px' : '0px', background: 'var(--accent)' }} 
                />
                {hasSubMenus && (
                  <span className="flex-shrink-0">
                    {isExpanded ? (
                      <ChevronDownIcon className="h-4 w-4" />
                    ) : (
                      <ChevronRightIcon className="h-4 w-4" />
                    )}
                  </span>
                )}
                <item.icon 
                  className="h-5 w-5 transition-colors duration-200" 
                  style={{ color: isActive ? 'var(--accent)' : 'var(--color-foreground)' }} 
                />
                <span className={`transition-colors duration-200 ${isActive ? 'font-semibold' : ''}`}>
                  {item.name}
                </span>
              </button>
              
              {/* Render sub-menus */}
              {hasSubMenus && isExpanded && item.subMenus && (
                <div className="ml-2 mt-1 space-y-1">
                  {renderSubMenus(item.subMenus)}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
