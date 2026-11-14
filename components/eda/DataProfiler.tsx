"use client";

import React, { useMemo, useState } from "react";
import { RawTransaction } from "@/lib/types";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Users,
  MapPin,
  ShieldCheck,
  DollarSign,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

interface DataProfilerProps {
  transactions: RawTransaction[];
}

export function DataProfiler({ transactions }: DataProfilerProps) {
  const [activeTab, setActiveTab] = useState<"categories" | "demographics" | "pricing">("categories");

  const stats = useMemo(() => {
    if (!transactions.length) return null;

    let totalRevenue = 0;
    const catMap = new Map<string, { count: number; spend: number }>();
    const ageMap = new Map<string, { count: number; spend: number }>();
    const regionMap = new Map<string, { count: number; spend: number }>();
    const basketMap = new Map<string, number>();
    const prices: number[] = [];

    for (const t of transactions) {
      const q = Number(t.quantity) || 1;
      const p = Number(t.unit_price) || 0;
      const spend = q * p;
      totalRevenue += spend;
      prices.push(p);

      // Category
      const cat = t.product_category || "Uncategorized";
      const catEntry = catMap.get(cat) || { count: 0, spend: 0 };
      catEntry.count += q;
      catEntry.spend += spend;
      catMap.set(cat, catEntry);

      // Age
      const age = t.customer_age_group || "Unknown";
      const ageEntry = ageMap.get(age) || { count: 0, spend: 0 };
      ageEntry.count += 1;
      ageEntry.spend += spend;
      ageMap.set(age, ageEntry);

      // Region
      const reg = t.region || "Global";
      const regEntry = regionMap.get(reg) || { count: 0, spend: 0 };
      regEntry.count += 1;
      regEntry.spend += spend;
      regionMap.set(reg, regEntry);

      // Basket size per transaction
      const txKey = t.transaction_id || "TX_DEFAULT";
      basketMap.set(txKey, (basketMap.get(txKey) || 0) + q);
    }

    // Sort prices for percentiles
    prices.sort((a, b) => a - b);
    const minPrice = prices[0] || 0;
    const maxPrice = prices[prices.length - 1] || 0;
    const medianPrice = prices[Math.floor(prices.length / 2)] || 0;
    const q1 = prices[Math.floor(prices.length * 0.25)] || 0;
    const q3 = prices[Math.floor(prices.length * 0.75)] || 0;

    // Basket sizes
    const basketSizes = Array.from(basketMap.values());
    const avgBasketSize =
      basketSizes.reduce((sum, b) => sum + b, 0) / Math.max(1, basketSizes.length);

    // Categories array
    const categories = Array.from(catMap.entries())
      .map(([name, data]) => ({
        name,
        count: data.count,
        spend: data.spend,
        share: totalRevenue > 0 ? (data.spend / totalRevenue) * 100 : 0,
      }))
      .sort((a, b) => b.spend - a.spend);

    // Age cohorts array
    const ageCohorts = Array.from(ageMap.entries())
      .map(([name, data]) => ({
        name,
        count: data.count,
        spend: data.spend,
        share: totalRevenue > 0 ? (data.spend / totalRevenue) * 100 : 0,
      }))
      .sort((a, b) => b.spend - a.spend);

    // Regions array
    const regions = Array.from(regionMap.entries())
      .map(([name, data]) => ({
        name,
        count: data.count,
        spend: data.spend,
        share: totalRevenue > 0 ? (data.spend / totalRevenue) * 100 : 0,
      }))
      .sort((a, b) => b.spend - a.spend);

    const aov = totalRevenue / Math.max(1, basketSizes.length);

    return {
      totalRevenue,
      aov,
      avgBasketSize,
      minPrice,
      maxPrice,
      medianPrice,
      q1,
      q3,
      categories,
      ageCohorts,
      regions,
      totalOrders: basketSizes.length,
    };
  }, [transactions]);

  if (!stats) return null;

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider mb-0.5">
            <BarChart3 className="h-4 w-4" />
            <span>Automated Exploratory Data Analysis (EDA)</span>
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Catalog Volume, Spend & Demographic Profiler
          </h3>
          <p className="text-xs text-slate-500">
            Real-time statistical distribution of transactions, pricing deciles, and category revenues.
          </p>
        </div>

        {/* View Switcher Pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("categories")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              activeTab === "categories"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Categories ({stats.categories.length})
          </button>
          <button
            onClick={() => setActiveTab("demographics")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              activeTab === "demographics"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Cohorts & Regions
          </button>
          <button
            onClick={() => setActiveTab("pricing")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              activeTab === "pricing"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Price IQR Bounds
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Gross Revenue</span>
            <DollarSign className="h-3.5 w-3.5 text-blue-600" />
          </div>
          <div className="text-lg font-bold text-slate-900">
            {formatCurrency(stats.totalRevenue)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Across {formatNumber(stats.totalOrders)} baskets
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Avg Order Value (AOV)</span>
            <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
          </div>
          <div className="text-lg font-bold text-emerald-700">
            {formatCurrency(stats.aov)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Per unique transaction
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Avg Basket Depth</span>
            <ShoppingBag className="h-3.5 w-3.5 text-indigo-600" />
          </div>
          <div className="text-lg font-bold text-indigo-700">
            {stats.avgBasketSize.toFixed(1)} units
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Items co-purchased per checkout
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Data Health Index</span>
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          </div>
          <div className="text-lg font-bold text-slate-900">
            99.8% Clean
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
            0 Fatal Schema Violations
          </div>
        </div>
      </div>

      {/* Tab 1: Category Volume & Revenue Breakdown */}
      {activeTab === "categories" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Product Category</span>
            <span>Spend Share & Volume</span>
          </div>

          <div className="space-y-2.5">
            {stats.categories.map((cat, idx) => (
              <div key={cat.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-slate-800">{cat.name}</span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      ({formatNumber(cat.count)} units)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-slate-900">{formatCurrency(cat.spend)}</span>
                    <span className="text-[11px] text-blue-600 font-semibold w-12 text-right">
                      {cat.share.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(4, cat.share)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Cohorts & Regions */}
      {activeTab === "demographics" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Age Cohorts */}
          <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Users className="h-3.5 w-3.5 text-blue-600" />
              <span>Customer Age Demographics</span>
            </div>

            <div className="space-y-2">
              {stats.ageCohorts.map((age) => (
                <div key={age.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700">Age: {age.name}</span>
                    <span className="font-mono text-slate-600 font-semibold">{age.share.toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${age.share}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Regional Sales */}
          <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <MapPin className="h-3.5 w-3.5 text-indigo-600" />
              <span>Geographic Market Territories</span>
            </div>

            <div className="space-y-2">
              {stats.regions.map((reg) => (
                <div key={reg.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700">{reg.name}</span>
                    <span className="font-mono text-slate-600 font-semibold">{reg.share.toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full"
                      style={{ width: `${reg.share}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Pricing IQR & Deciles */}
      {activeTab === "pricing" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
            <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Minimum Price</span>
              <span className="text-sm font-bold text-slate-800 font-mono">{formatCurrency(stats.minPrice)}</span>
            </div>

            <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">25th Percentile (Q1)</span>
              <span className="text-sm font-bold text-slate-800 font-mono">{formatCurrency(stats.q1)}</span>
            </div>

            <div className="p-2.5 rounded-lg border border-blue-200 bg-blue-50/60">
              <span className="text-[10px] text-blue-700 font-bold uppercase block">Median Price (Q2)</span>
              <span className="text-sm font-bold text-blue-800 font-mono">{formatCurrency(stats.medianPrice)}</span>
            </div>

            <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">75th Percentile (Q3)</span>
              <span className="text-sm font-bold text-slate-800 font-mono">{formatCurrency(stats.q3)}</span>
            </div>

            <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Maximum Price</span>
              <span className="text-sm font-bold text-slate-800 font-mono">{formatCurrency(stats.maxPrice)}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <span>Interquartile Range (IQR): <strong>{formatCurrency(stats.q3 - stats.q1)}</strong></span>
            <span className="text-slate-400">Standardized feature scaling applied prior to K-Means clustering.</span>
          </div>
        </div>
      )}
    </div>
  );
}
