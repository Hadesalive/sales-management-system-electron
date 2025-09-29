import React from "react";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  children: ReactNode;
  className?: string;
  headerActions?: ReactNode;
}

export function ChartCard({ title, children, className = "", headerActions }: ChartCardProps) {
  return (
    <div className={cn("p-5 rounded-xl shadow-sm", className)} style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{title}</h3>
        {headerActions && <div>{headerActions}</div>}
      </div>
      {children}
    </div>
  );
}
