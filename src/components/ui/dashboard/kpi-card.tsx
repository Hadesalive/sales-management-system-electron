import React from "react";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  className?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function KPICard({ title, value, icon, className = "", trend }: KPICardProps) {
  return (
    <div className={cn("p-6 rounded-xl shadow-sm relative", className)} style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      <div className="h-2 w-16 rounded-full mb-4" style={{ background: 'var(--accent)' }} />
      <div className="text-sm font-medium mb-2" style={{ color: 'var(--muted-foreground)' }}>{title}</div>
      <div className="text-xl md:text-2xl font-bold mb-4 break-words overflow-hidden" style={{ color: 'var(--foreground)' }}>{value}</div>
      {trend && (
        <div className={cn(
          "text-sm mb-4 flex items-center gap-1",
          trend.isPositive ? "text-green-600" : "text-red-600"
        )}>
          <span>{trend.isPositive ? "↗" : "↘"}</span>
          <span>{Math.abs(trend.value)}%</span>
        </div>
      )}
      {icon && (
        <div className="absolute bottom-4 right-4">
          {icon}
        </div>
      )}
    </div>
  );
}
