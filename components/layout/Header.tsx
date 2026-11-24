"use client";

import React, { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { DATASET_PRESETS } from "@/datasets/sampleData";
import { PipelineConsoleDrawer } from "../drawers/PipelineConsoleDrawer";
import {
  Play,
  RotateCcw,
  Database,
  Search,
  Sparkles,
  Command,
  ChevronDown,
  Layers,
  Cpu,
  ShoppingBag,
  Gem,
  Store,
  CheckCircle2,
  Terminal,
  Sun,
  Moon,
  Menu,
  X,
} from "lucide-react";
import { Button } from "../ui/Button";

export function Header({
  isSidebarOpen: propIsSidebarOpen,
  onToggleSidebar: propOnToggleSidebar,
}: {
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
} = {}) {
  const {
    datasetName,
    activePresetId,
    loadPresetDataset,
    config,
    isLoading,
    pipelineStep,
    error,
    updateConfig,
    runAnalysis,
    setIsCommandPaletteOpen,
    result,
    theme,
    toggleTheme,
    isSidebarOpen: storeIsSidebarOpen,
    toggleSidebar: storeToggleSidebar,
  } = useAppStore();

  const isSidebarOpen = propIsSidebarOpen !== undefined ? propIsSidebarOpen : storeIsSidebarOpen;
  const onToggleSidebar = propOnToggleSidebar || storeToggleSidebar;

  const [isPresetMenuOpen, setIsPresetMenuOpen] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const isDark = theme === "dark";

  const getPresetIcon = (id: string) => {
    switch (id) {
      case "electronics_gaming":
        return Cpu;
      case "supermarket_cpg":
        return ShoppingBag;
      case "luxury_fashion":
        return Gem;
      default:
        return Store;
    }
  };

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-2 border-b border-slate-200/80 bg-white/95 px-3 backdrop-blur dark:bg-slate-950/95 sm:px-6">
        {/* Left: Hamburger Sidebar Toggle & Dataset Switcher */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            aria-label={isSidebarOpen ? "Collapse navigation sidebar" : "Open navigation sidebar"}
            title={isSidebarOpen ? "Collapse sidebar (Click to hide)" : "Open sidebar (Click to show)"}
            aria-expanded={isSidebarOpen}
            aria-controls="primary-navigation"
            onClick={onToggleSidebar}
            className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
              isSidebarOpen ? "text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-300"
            }`}
          >
            <Menu className="h-4.5 w-4.5" />
          </button>
          {/* Dataset Preset Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setIsPresetMenuOpen(!isPresetMenuOpen)}
              className="flex max-w-[174px] items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 sm:max-w-none sm:px-3"
            >
              <Database className="h-3.5 w-3.5 text-blue-600" />
              <span className="truncate sm:max-w-[220px]">{datasetName}</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {isPresetMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsPresetMenuOpen(false)}
                />
                <div className="absolute left-0 mt-2 w-72 rounded-xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 z-30 animate-in fade-in-0 zoom-in-95 duration-100">
                  <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                    Select Benchmark Catalog
                  </div>
                  {DATASET_PRESETS.map((preset) => {
                    const Icon = getPresetIcon(preset.id);
                    const isSelected = activePresetId === preset.id;

                    return (
                      <button
                        key={preset.id}
                        onClick={() => {
                          loadPresetDataset(preset.id);
                          setIsPresetMenuOpen(false);
                        }}
                        className={`w-full flex items-start gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors ${
                          isSelected
                            ? "bg-blue-50 dark:bg-blue-950 text-blue-900 dark:text-blue-100 font-semibold"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${isSelected ? "text-blue-600" : "text-slate-400"}`} />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium truncate flex items-center justify-between">
                            <span>{preset.name}</span>
                            {isSelected && <CheckCircle2 className="h-3 w-3 text-blue-600 shrink-0" />}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate mt-0.5">
                            {preset.targetRows.toLocaleString()} tx • {preset.categories.length} categories
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Global Search / Command Palette Trigger */}
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 text-xs transition-colors shadow-2xs"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="text-slate-600 dark:text-slate-400">Quick actions...</span>
            <kbd className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-400 font-mono border border-slate-200 dark:border-slate-700">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Toolbar */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
          {/* ML Telemetry Terminal Button */}
          <button
            onClick={() => setIsConsoleOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300 transition-colors shadow-2xs"
            title="Open Live ML Telemetry Console"
          >
            <Terminal className="h-3.5 w-3.5 text-blue-600" />
            <span className="hidden sm:inline">Telemetry</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs"
            title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
          >
            {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
          </button>

          {/* Diagnostic Score Pills */}
          {result && (
            <div className="hidden xl:flex items-center gap-1.5 text-[11px] font-mono">
              <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800 font-bold" title="Silhouette Score">
                Sil: {result.clustering.silhouetteScore.toFixed(2)}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 font-bold" title="Davies-Bouldin Index">
                DB: {result.clustering.daviesBouldinIndex.toFixed(2)}
              </span>
            </div>
          )}

          {/* Quick Algorithm Switcher */}
          <div className="hidden lg:flex items-center bg-slate-100 dark:bg-slate-900 rounded-lg p-0.5 text-xs border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => updateConfig({ algorithm: "kmeans" })}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                config.algorithm === "kmeans"
                  ? "bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 shadow-2xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              K-Means ({config.k})
            </button>
            <button
              onClick={() => updateConfig({ algorithm: "dbscan" })}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                config.algorithm === "dbscan"
                  ? "bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 shadow-2xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              DBSCAN
            </button>
          </div>

          {/* Run ML Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={runAnalysis}
            isLoading={isLoading}
            className="shadow-sm font-semibold gap-1.5"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>{isLoading ? "Mining..." : "Run ML"}</span>
          </Button>
        </div>
      </header>

      {/* Floating Telemetry Console Drawer */}
      <PipelineConsoleDrawer
        isOpen={isConsoleOpen}
        onClose={() => setIsConsoleOpen(false)}
      />
    </>
  );
}
