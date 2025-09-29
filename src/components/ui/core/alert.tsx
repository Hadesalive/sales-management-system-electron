"use client";

import React from "react";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

interface AlertProps {
  variant?: "info" | "success" | "warning" | "error";
  title?: string;
  children: ReactNode;
  className?: string;
  onClose?: () => void;
  dismissible?: boolean;
}

const variants = {
  info: {
    iconColor: "#3b82f6",
    icon: InformationCircleIcon
  },
  success: {
    iconColor: "#10b981",
    icon: CheckCircleIcon
  },
  warning: {
    iconColor: "#f59e0b",
    icon: ExclamationTriangleIcon
  },
  error: {
    iconColor: "#ef4444",
    icon: XCircleIcon
  }
};

export function Alert({ 
  variant = "info",
  title, 
  children, 
  className = "", 
  onClose, 
  dismissible = false 
}: AlertProps) {
  const config = variants[variant];
  const Icon = config.icon;

  return (
    <div 
      className={cn(
        "rounded-xl shadow-sm p-4 flex items-start gap-3 max-w-lg",
        className
      )}
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)'
      }}
    >
      <Icon 
        className="h-5 w-5 flex-shrink-0 mt-0.5" 
        style={{ color: config.iconColor }}
      />
      <div className="flex-1 min-w-0">
        {title && (
          <h4 
            className="text-sm font-medium mb-1"
            style={{ color: "var(--foreground)" }}
          >
            {title}
          </h4>
        )}
        <div 
          className="text-sm leading-relaxed"
          style={{ color: "var(--muted-foreground)" }}
        >
          {children}
        </div>
      </div>
      {dismissible && onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 rounded-md hover:bg-black/5 transition-colors"
          style={{ color: "var(--muted-foreground)" }}
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

// Toast variant for temporary notifications - Apple style
interface ToastProps extends Omit<AlertProps, 'className'> {
  duration?: number;
}

export function Toast({ ...props }: ToastProps) {
  return (
    <div className="fixed top-6 right-6 z-50 max-w-sm animate-in slide-in-from-right-full duration-300">
      <Alert 
        {...props}
        className="shadow-lg"
        dismissible={true}
      />
    </div>
  );
}
