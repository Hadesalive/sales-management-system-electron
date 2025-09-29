"use client";

import React from "react";

import { ReactNode } from "react";
import { Bars3Icon, SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import { useTheme } from "@/contexts/ThemeContext";

interface DashboardHeaderProps {
  title: string;
  onMenuClick?: () => void;
  searchPlaceholder?: string;
  actions?: ReactNode;
  className?: string;
}

export function DashboardHeader({ 
  title, 
  onMenuClick, 
  searchPlaceholder = "Search…", 
  actions,
  className = "" 
}: DashboardHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <header 
      className={`sticky top-0 z-10 pb-3 bg-[--background]/80 backdrop-blur supports-[backdrop-filter]:bg-[--background]/70 border-b ${className}`} 
      style={{ borderColor: 'var(--color-border)' }}
    >
      <div className="flex items-center justify-between py-3">
        <div className="flex items-center gap-2">
          {onMenuClick && (
            <button
              className="lg:hidden inline-flex items-center justify-center h-9 w-9 rounded-md border border-[--color-border]"
              onClick={onMenuClick}
              aria-label="Open navigation"
            >
              <Bars3Icon className="h-5 w-5" />
            </button>
          )}
          <h1 className="text-xl md:text-2xl font-semibold">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <input
            placeholder={searchPlaceholder}
            className="h-9 w-44 md:w-64 rounded-md px-3 bg-[--color-card] text-[--color-foreground] border border-[--color-border]"
          />
          <button
            onClick={toggleTheme}
            className="h-9 w-9 rounded-md flex items-center justify-center border border-[--color-border]"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
          </button>
          {actions}
        </div>
      </div>
    </header>
  );
}
