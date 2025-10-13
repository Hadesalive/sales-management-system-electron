"use client";

import React from "react";

import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

interface TableColumn {
  key: string;
  label: string;
  className?: string;
  sortable?: boolean;
}

interface TableRow {
  [key: string]: string | number | ReactNode;
}

interface TableCardProps {
  title: string;
  columns: TableColumn[];
  data: TableRow[];
  className?: string;
  headerActions?: ReactNode;
  itemsPerPage?: number;
}

export function PaginatedTableCard({ title, columns, data, className = "", headerActions, itemsPerPage = 10 }: TableCardProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Sort data based on current sort settings
  const sortedData = [...data].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    
    // Handle different data types
    let comparison = 0;
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      comparison = aValue.localeCompare(bValue);
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      comparison = aValue - bValue;
    } else {
      comparison = String(aValue).localeCompare(String(bValue));
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });
  
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = sortedData.slice(startIndex, endIndex);
  
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };
  
  return (
    <div className={cn("rounded-xl overflow-hidden", className)} style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      <div className="p-5 font-medium flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
        <span style={{ color: 'var(--foreground)' }}>{title}</span>
        {headerActions && <div>{headerActions}</div>}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left" style={{ color: 'var(--muted-foreground)', borderBottom: '1px solid var(--border)' }}>
              {columns.map((column) => (
                <th 
                  key={column.key} 
                  className={cn(
                    "px-5 py-3 select-none",
                    column.sortable !== false && "cursor-pointer hover:bg-black/5 transition-colors",
                    column.className
                  )}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.label}</span>
                    {column.sortable !== false && (
                      <div className="flex flex-col">
                        <ChevronUpIcon 
                          className={cn(
                            "h-3 w-3 -mb-1 transition-colors",
                            sortColumn === column.key && sortDirection === 'asc' 
                              ? "text-orange-500" 
                              : "text-gray-400"
                          )}
                        />
                        <ChevronDownIcon 
                          className={cn(
                            "h-3 w-3 transition-colors",
                            sortColumn === column.key && sortDirection === 'desc' 
                              ? "text-orange-500" 
                              : "text-gray-400"
                          )}
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentData.map((row, index) => (
              <tr key={index} style={{ borderBottom: '1px solid var(--border)' }}>
                {columns.map((column) => (
                  <td key={column.key} className={cn("px-5 py-3", column.className)}>
                    {row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Showing {startIndex + 1} to {Math.min(endIndex, sortedData.length)} of {sortedData.length} results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                color: 'var(--foreground)',
                border: '1px solid var(--border)'
              }}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`px-2 py-1 text-sm rounded-md ${
                    currentPage === page 
                      ? 'text-white' 
                      : 'hover:opacity-80'
                  }`}
                  style={{
                    backgroundColor: currentPage === page ? 'var(--accent)' : 'transparent',
                    color: currentPage === page ? 'white' : 'var(--foreground)',
                    border: '1px solid var(--border)'
                  }}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                color: 'var(--foreground)',
                border: '1px solid var(--border)'
              }}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
