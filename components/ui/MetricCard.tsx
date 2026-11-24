import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  badge?: string;
  colorScheme?: "blue" | "purple" | "emerald" | "amber" | "indigo";
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  badge,
  colorScheme = "blue",
}: MetricCardProps) {
  const schemes = {
    blue: {
      iconBg: "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/60 ring-1 ring-blue-500/10",
      accent: "text-blue-600 dark:text-blue-400",
    },
    purple: {
      iconBg: "bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/60 ring-1 ring-purple-500/10",
      accent: "text-purple-600 dark:text-purple-400",
    },
    emerald: {
      iconBg: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/60 ring-1 ring-emerald-500/10",
      accent: "text-emerald-600 dark:text-emerald-400",
    },
    amber: {
      iconBg: "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/60 ring-1 ring-amber-500/10",
      accent: "text-amber-600 dark:text-amber-400",
    },
    indigo: {
      iconBg: "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/60 ring-1 ring-indigo-500/10",
      accent: "text-indigo-600 dark:text-indigo-400",
    },
  };

  const scheme = schemes[colorScheme];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs transition-all duration-200 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
          {title}
        </p>
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl border", scheme.iconBg)}>
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 font-mono">
            {value}
          </span>
          {badge && (
            <span className="inline-flex items-center rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider border border-slate-200/60 dark:border-slate-700 font-mono">
              {badge}
            </span>
          )}
        </div>

        {(subtitle || trend) && (
          <div className="mt-2 flex items-center gap-2 text-xs">
            {trend && (
              <span
                className={cn(
                  "font-bold inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px]",
                  trend.positive
                    ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800"
                    : "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800"
                )}
              >
                {trend.positive ? "↑" : "↓"} {trend.value}
              </span>
            )}
            {subtitle && <span className="text-slate-500 dark:text-slate-400 truncate">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
