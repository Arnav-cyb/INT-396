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
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in fade-in-0 zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-indigo-50/30">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-mono">
                {customerPoint.customerId}
              </h3>
              <p className="text-xs text-blue-700 font-semibold">
                {customerPoint.clusterName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                Lifetime Spend
              </div>
              <div className="text-lg font-extrabold text-slate-900 font-mono mt-0.5">
                {formatCurrency(customerPoint.totalSpend)}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                Primary Category
              </div>
              <div className="text-sm font-bold text-blue-700 truncate mt-1">
                {customerPoint.dominantCategory}
              </div>
            </div>
          </div>

          {/* PCA Coordinates */}
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
              PCA Coordinate Vector
            </div>
            <div className="flex justify-between text-slate-700 font-mono text-[11px]">
              <span>Principal Component 1: <strong>{customerPoint.x}</strong></span>
              <span>Principal Component 2: <strong>{customerPoint.y}</strong></span>
            </div>
          </div>

          {/* AI Cross-Sell Prompt */}
          <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              <span>Next Recommended Action</span>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed">
              Based on affinity cluster #{customerPoint.cluster + 1}, recommend products from{" "}
              <strong>{customerPoint.dominantCategory}</strong> complementary sets on their next storefront visit.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
