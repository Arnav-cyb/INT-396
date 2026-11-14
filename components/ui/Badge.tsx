import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "secondary" | "success" | "warning" | "danger" | "outline";
  size?: "sm" | "md";
}

export function Badge({
  children,
  className,
  variant = "default",
  size = "md",
  ...props
}: BadgeProps) {
  const variants = {
    default: "bg-slate-100 text-slate-800 border-slate-200",
    primary: "bg-blue-50 text-blue-700 border-blue-200",
    secondary: "bg-purple-50 text-purple-700 border-purple-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
    outline: "border-slate-300 text-slate-700 bg-transparent",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs font-medium",
    md: "px-2.5 py-1 text-xs font-semibold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border transition-colors",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
