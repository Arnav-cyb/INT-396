"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Database,
  Users2,
  GitBranch,
  Network,
  Share2,
  Lightbulb,
  FileSpreadsheet,
  Settings,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Cpu,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

interface NavGroup {
  label: string;
  items: {
    label: string;
    href: string;
    icon: React.ElementType;
    badge?: string;
  }[];
}

const navGroups: NavGroup[] = [
  {
    label: "Core Analytics",
    items: [
      { label: "Overview", href: "/", icon: LayoutDashboard },
      { label: "Dataset Management", href: "/datasets", icon: Database },
    ],
  },
  {
    label: "Machine Learning Engine",
    items: [
      { label: "Customer Segments", href: "/segmentation", icon: Users2 },
      { label: "Association Rules", href: "/association-rules", icon: GitBranch },
      { label: "Cross-Cluster Mining", href: "/cross-cluster", icon: Share2, badge: "CORE" },
    ],
  },
  {
    label: "Intelligence & Visuals",
    items: [
      { label: "Product Recommendations", href: "/recommendations", icon: Sparkles, badge: "NEW" },
      { label: "Network Graph", href: "/network", icon: Network },
      { label: "Business Insights", href: "/insights", icon: Lightbulb },
      { label: "Reports & Export", href: "/reports", icon: FileSpreadsheet },
    ],
  },
  {
    label: "Configuration",
    items: [{ label: "Settings", href: "/settings", icon: Settings }],
  },
];

export function Sidebar({
  isOpen,
  onNavigate,
}: {
  isOpen: boolean;
  onNavigate: () => void;
}) {
  const pathname = usePathname();
  const { result, config } = useAppStore();

  return (
    <aside
      id="primary-navigation"
      className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64 shrink-0 flex-col border-r border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-[1px_0_4px_rgba(0,0,0,0.02)] transition-transform duration-200 lg:sticky lg:top-0 lg:z-30 lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 border-b border-slate-100 dark:border-slate-800 gap-3">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 ring-1 ring-blue-500/20">
          <Sparkles className="h-4.5 w-4.5" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-slate-100 leading-tight truncate">
            SegmentMining AI
          </span>
          <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            Enterprise Analytics
          </span>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
              {group.label}
            </div>

            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "group relative flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all duration-150",
                    isActive
                      ? "bg-blue-50/80 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold shadow-2xs"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200"
                  )}
                >
                  {/* Active Indicator Bar on Left */}
                  {isActive && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-blue-600 dark:bg-blue-500" />
                  )}

                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={cn(
                        "h-4 w-4 transition-colors",
                        isActive
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                      )}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge ? (
                    <span className="bg-blue-100/80 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wider border border-blue-200/50 dark:border-blue-800">
                      {item.badge}
                    </span>
                  ) : isActive ? (
                    <ChevronRight className="h-3.5 w-3.5 text-blue-400 dark:text-blue-500" />
                  ) : null}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Model Engine Live Status Pill */}
      <div className="p-3 mx-3 mb-2 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300">
            <Cpu className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>ML Engine</span>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-800">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Ready
          </span>
        </div>

        <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 pt-1 border-t border-slate-200/40 dark:border-slate-800">
          <div className="flex justify-between">
            <span className="text-slate-400 dark:text-slate-500">Algorithm:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">
              {config.algorithm} (k={config.k})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 dark:text-slate-500">Rules Engine:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300 uppercase text-[10px]">
              {config.ruleAlgorithm}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 dark:text-slate-500">Silhouette:</span>
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
              {result ? result.clustering.silhouetteScore.toFixed(3) : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* User / Workspace Footer */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between px-4 text-xs bg-white dark:bg-slate-950">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-[11px] text-slate-700 dark:text-slate-300">
            AI
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] leading-tight">
              Enterprise Lead
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">Retail Analytics</span>
          </div>
        </div>
        <span className="h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-50 dark:ring-emerald-950/60" title="System Operational" />
      </div>
    </aside>
  );
}
