"use client";

import React, { useState } from "react";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { DollarSign, TrendingUp, Percent, Sparkles, Sliders, Calculator, ArrowUpRight } from "lucide-react";

export function ROISimulator() {
  const [monthlyCheckouts, setMonthlyCheckouts] = useState<number>(35000);
  const [adoptionRate, setAdoptionRate] = useState<number>(14); // 14%
  const [bundleAOV, setBundleAOV] = useState<number>(45); // $45
  const [profitMargin, setProfitMargin] = useState<number>(36); // 36%

  // Computations
  const monthlyConvertedBaskets = Math.round(monthlyCheckouts * (adoptionRate / 100));
  const monthlyIncrementalRevenue = monthlyConvertedBaskets * bundleAOV;
  const annualIncrementalRevenue = monthlyIncrementalRevenue * 12;
  const annualIncrementalProfit = annualIncrementalRevenue * (profitMargin / 100);

  const applyPreset = (preset: "conservative" | "balanced" | "aggressive") => {
    if (preset === "conservative") {
      setAdoptionRate(8);
      setBundleAOV(35);
      setProfitMargin(30);
    } else if (preset === "balanced") {
      setAdoptionRate(14);
      setBundleAOV(45);
      setProfitMargin(36);
    } else {
      setAdoptionRate(22);
      setBundleAOV(65);
      setProfitMargin(42);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-0.5">
            <Calculator className="h-4 w-4" />
            <span>Interactive Financial Impact Engine</span>
          </div>
          <h2 className="text-base font-bold text-slate-900">
            What-If Basket Attachment & Revenue Uplift Simulator
          </h2>
          <p className="text-xs text-slate-500">
            Simulate the projected monetary impact of deploying mined cross-cluster bundles directly to customer checkout prompts.
          </p>
        </div>

        {/* Strategy Presets */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs font-medium">
          <button
            onClick={() => applyPreset("conservative")}
            className="px-2.5 py-1 rounded-md text-slate-600 hover:text-slate-900 transition-colors"
          >
            Conservative
          </button>
          <button
            onClick={() => applyPreset("balanced")}
            className="px-2.5 py-1 rounded-md bg-white text-blue-700 font-bold shadow-2xs"
          >
            Target Baseline
          </button>
          <button
            onClick={() => applyPreset("aggressive")}
            className="px-2.5 py-1 rounded-md text-slate-600 hover:text-slate-900 transition-colors"
          >
            Aggressive
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Sliders Input Column */}
        <div className="lg:col-span-7 space-y-4 text-xs">
          {/* Monthly Checkouts */}
          <div className="space-y-1.5">
            <div className="flex justify-between font-medium">
              <span className="text-slate-700">Monthly Store Transaction Volume:</span>
              <span className="font-mono font-bold text-slate-900">
                {monthlyCheckouts.toLocaleString()} orders/mo
              </span>
            </div>
            <input
              type="range"
              min="5000"
              max="150000"
              step="5000"
              value={monthlyCheckouts}
              onChange={(e) => setMonthlyCheckouts(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Bundle Attachment Rate */}
          <div className="space-y-1.5">
            <div className="flex justify-between font-medium">
              <span className="text-slate-700">Target Segment Bundle Conversion Rate:</span>
              <span className="font-mono font-bold text-blue-600">{adoptionRate}% adoption</span>
            </div>
            <input
              type="range"
              min="2"
              max="35"
              step="1"
              value={adoptionRate}
              onChange={(e) => setAdoptionRate(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Average Bundle AOV */}
          <div className="space-y-1.5">
            <div className="flex justify-between font-medium">
              <span className="text-slate-700">Average Incremental Attached Basket Value:</span>
              <span className="font-mono font-bold text-slate-900">${bundleAOV}.00</span>
            </div>
            <input
              type="range"
              min="15"
              max="150"
              step="5"
              value={bundleAOV}
              onChange={(e) => setBundleAOV(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Gross Margin */}
          <div className="space-y-1.5">
            <div className="flex justify-between font-medium">
              <span className="text-slate-700">Blended Product Category Gross Margin:</span>
              <span className="font-mono font-bold text-emerald-600">{profitMargin}% margin</span>
            </div>
            <input
              type="range"
              min="15"
              max="70"
              step="1"
              value={profitMargin}
              onChange={(e) => setProfitMargin(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </div>

        {/* Calculated Financial Output Box */}
        <div className="lg:col-span-5 p-5 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/80 to-indigo-50/40 space-y-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700 font-mono">
            Projected Financial Yield
          </div>

          <div className="space-y-2">
            <div>
              <div className="text-xs text-slate-500">Projected Annual Revenue Uplift</div>
              <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                {formatCurrency(annualIncrementalRevenue)}
              </div>
            </div>

            <div className="pt-2 border-t border-blue-200/60 grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="text-slate-500 text-[11px]">Annual Gross Profit</div>
                <div className="text-lg font-bold text-emerald-700 font-mono">
                  {formatCurrency(annualIncrementalProfit)}
                </div>
              </div>

              <div>
                <div className="text-slate-500 text-[11px]">Monthly Attached Baskets</div>
                <div className="text-lg font-bold text-blue-700 font-mono">
                  +{monthlyConvertedBaskets.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-white border border-blue-100 text-[11px] text-slate-600 leading-relaxed shadow-2xs">
            ✨ Based on {monthlyConvertedBaskets.toLocaleString()} cross-promoted orders monthly with an average incremental value of ${bundleAOV}.
          </div>
        </div>
      </div>
    </div>
  );
}
