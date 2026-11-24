"use client";

import React from "react";
import { formatCurrency } from "@/lib/utils";
import { X, User, ShoppingBag, DollarSign, Calendar, MapPin, Tag, Sparkles, ArrowRight } from "lucide-react";

interface CustomerDetailModalProps {
  customerPoint: any | null;
  onClose: () => void;
}

export function CustomerDetailModal({
  customerPoint,
  onClose,
}: CustomerDetailModalProps) {
  if (!customerPoint) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 animate-in fade-in-0 zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-indigo-50/30 dark:from-slate-800 dark:to-slate-850">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono">
                {customerPoint.customerId}
              </h3>
              <p className="text-xs text-blue-700 dark:text-blue-300 font-semibold">
                {customerPoint.clusterName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                Lifetime Spend
              </div>
              <div className="text-lg font-extrabold text-slate-900 dark:text-slate-100 font-mono mt-0.5">
                {formatCurrency(customerPoint.totalSpend)}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                Primary Category
              </div>
              <div className="text-sm font-bold text-blue-700 dark:text-blue-300 truncate mt-1">
                {customerPoint.dominantCategory}
              </div>
            </div>
          </div>

          {/* PCA Coordinates */}
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
              PCA Coordinate Vector
            </div>
            <div className="flex justify-between text-slate-700 dark:text-slate-300 font-mono text-[11px]">
              <span>Principal Component 1: <strong>{customerPoint.x}</strong></span>
              <span>Principal Component 2: <strong>{customerPoint.y}</strong></span>
            </div>
          </div>

          {/* AI Cross-Sell Prompt */}
          <div className="p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/40 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 dark:text-indigo-200">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Next Recommended Action</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
              Based on affinity cluster #{customerPoint.cluster + 1}, recommend products from{" "}
              <strong>{customerPoint.dominantCategory}</strong> complementary sets on their next storefront visit.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-800 text-white dark:text-slate-100 font-semibold text-xs hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
