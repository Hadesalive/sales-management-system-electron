import React from "react";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-150 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 hover:transform hover:-translate-y-0.5 active:transform active:translate-y-0",
          {
            "h-10 px-4 py-2": size === "default",
            "h-9 rounded-md px-3": size === "sm",
            "h-11 rounded-md px-8": size === "lg",
            "h-10 w-10": size === "icon",
            // Variant styles with CSS variables
            "bg-orange-500 text-white hover:bg-orange-600": variant === "default",
            "bg-red-500 text-white hover:bg-red-600": variant === "destructive",
          },
          className
        )}
        style={{
          backgroundColor: variant === "outline" ? 'var(--background)' :
                          variant === "secondary" ? 'var(--muted)' : 
                          variant === "ghost" || variant === "link" ? 'transparent' : undefined,
          color: variant === "outline" || variant === "secondary" ? 'var(--foreground)' :
                 variant === "link" ? '#ea580c' : 
                 variant === "ghost" ? 'var(--foreground)' : undefined,
          border: variant === "outline" ? '1px solid var(--border)' : undefined,
        }}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
