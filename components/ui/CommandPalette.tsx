"use client";

import React, { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  Database,
  Users2,
  GitBranch,
  Share2,
  Network,
  Lightbulb,
  FileSpreadsheet,
  Settings,
  Play,
  Download,
  RotateCcw,
  Sparkles,
  Command,
} from "lucide-react";

export function CommandPalette() {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    loadPresetDataset,
    runAnalysis,
    updateConfig,
    config,
  } = useAppStore();

  const router = useRouter();
  const [query, setQuery] = useState("");

  if (!isCommandPaletteOpen) return null;

  const actions = [
    // Navigation
    { id: "nav-overview", title: "Go to Overview Dashboard", icon: LayoutDashboard, category: "Navigation", run: () => router.push("/") },
    { id: "nav-datasets", title: "Go to Dataset Management", icon: Database, category: "Navigation", run: () => router.push("/datasets") },
    { id: "nav-segments", title: "Go to Customer Segments", icon: Users2, category: "Navigation", run: () => router.push("/segmentation") },
    { id: "nav-rules", title: "Go to Association Rules", icon: GitBranch, category: "Navigation", run: () => router.push("/association-rules") },
    { id: "nav-cross", title: "Go to Cross-Cluster Mining", icon: Share2, category: "Navigation", run: () => router.push("/cross-cluster") },
    { id: "nav-network", title: "Go to Category Network Graph", icon: Network, category: "Navigation", run: () => router.push("/network") },
    { id: "nav-insights", title: "Go to Business Insights & Merchandising", icon: Lightbulb, category: "Navigation", run: () => router.push("/insights") },
    { id: "nav-reports", title: "Go to Reports & PDF Export", icon: FileSpreadsheet, category: "Navigation", run: () => router.push("/reports") },
    { id: "nav-settings", title: "Go to Settings & Configuration", icon: Settings, category: "Navigation", run: () => router.push("/settings") },

    // Datasets
    { id: "ds-omni", title: "Load Omnichannel Retail Dataset (1,850 tx)", icon: Sparkles, category: "Dataset Presets", run: () => loadPresetDataset("omnichannel") },
    { id: "ds-tech", title: "Load Tech & Gaming Ecosystem (2,100 tx)", icon: Sparkles, category: "Dataset Presets", run: () => loadPresetDataset("electronics_gaming") },
    { id: "ds-cpg", title: "Load CPG Supermarket & Grocery (2,400 tx)", icon: Sparkles, category: "Dataset Presets", run: () => loadPresetDataset("supermarket_cpg") },
    { id: "ds-lux", title: "Load Luxury Fashion & Boutique (1,500 tx)", icon: Sparkles, category: "Dataset Presets", run: () => loadPresetDataset("luxury_fashion") },

    // Pipeline Actions
    { id: "act-run", title: "Run / Re-cluster Mining Pipeline", icon: Play, category: "Pipeline Control", run: () => runAnalysis() },
    { id: "act-kmeans", title: "Switch to K-Means Clustering", icon: Users2, category: "Pipeline Control", run: () => updateConfig({ algorithm: "kmeans" }) },
    { id: "act-dbscan", title: "Switch to DBSCAN Density Clustering", icon: Users2, category: "Pipeline Control", run: () => updateConfig({ algorithm: "dbscan" }) },
    { id: "act-fpgrowth", title: "Switch to FP-Growth Algorithm", icon: GitBranch, category: "Pipeline Control", run: () => updateConfig({ ruleAlgorithm: "fpgrowth" }) },
    { id: "act-apriori", title: "Switch to Apriori Algorithm", icon: GitBranch, category: "Pipeline Control", run: () => updateConfig({ ruleAlgorithm: "apriori" }) },
  ];

  const filtered = actions.filter((a) =>
    a.title.toLowerCase().includes(query.toLowerCase()) ||
    a.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20 flex items-start justify-center">
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCommandPaletteOpen(false)}
      />

      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in fade-in-0 zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200">
          <Search className="h-5 w-5 text-slate-400 mr-3 shrink-0" />
          <input
            type="text"
            placeholder="Type a command, page name, or dataset preset..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm placeholder-slate-400 text-slate-900 focus:outline-none"
          />
          <kbd className="hidden sm:inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 font-mono">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1 text-xs">
          {filtered.length > 0 ? (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    item.run();
                    setIsCommandPaletteOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-slate-400 group-hover:text-blue-600 shrink-0" />
                    <span className="font-medium text-slate-900 group-hover:text-blue-700">
                      {item.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded font-mono group-hover:bg-blue-100 group-hover:text-blue-700">
                    {item.category}
                  </span>
                </button>
              );
            })
          ) : (
            <div className="py-8 text-center text-slate-400">
              No matching commands or actions found.
            </div>
          )}
        </div>

        {/* Footer tip */}
        <div className="p-2.5 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-400 flex items-center justify-between px-4">
          <span>Navigate with mouse or keyboard</span>
          <span>Antigravity AI Omnichannel Engine</span>
        </div>
      </div>
    </div>
  );
}
