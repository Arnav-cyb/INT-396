"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import { ROISimulator } from "@/components/simulators/ROISimulator";
import {
  Lightbulb,
  Sparkles,
  ShoppingBag,
  TrendingUp,
  Target,
  ArrowRight,
  Package,
  Layers,
  Award,
  Copy,
  CheckCircle,
  Zap,
  Tag,
  Calculator,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function BusinessInsightsPage() {
  const { result, setSelectedRuleForDrawer, isLoading } = useAppStore();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (isLoading || !result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[460px] space-y-4">
        <div className="relative">
          <div className="h-12 w-12 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <Sparkles className="h-4 w-4 text-blue-600 absolute inset-0 m-auto" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Synthesizing Business & Merchandising Insights...
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Extracting cross-cluster pricing strategies, bundling opportunities, and revenue impact
          </p>
        </div>
      </div>
    );
  }

  const clusters = result.clustering.clusters;
  const comparisons = result.crossClusterComparisons;
  const globalRules = result.globalRules;

  // Extract top bundling opportunities
  const topBundles = globalRules
    .filter((r) => r.lift >= 1.5 && r.confidence >= 0.22)
    .slice(0, 4);

  // Extract cluster-specific opportunities
  const clusterSpecificOpportunities = comparisons
    .filter((c) => c.type === "cluster_specific")
    .slice(0, 4);

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Actionable Business Intelligence & Merchandising Playbook
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Data-driven product bundling configurations, segment-specific checkout upsells, and financial ROI simulator.
        </p>
      </div>

      {/* Hero Recommendation Banner */}
      <div className="rounded-2xl border border-blue-200/80 dark:border-blue-900/60 bg-gradient-to-br from-blue-50/60 via-indigo-50/30 to-white dark:from-slate-900 dark:via-blue-950/20 dark:to-slate-900 p-6 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider bg-blue-100/60 dark:bg-blue-900/50 px-2.5 py-0.5 rounded-full border border-blue-200/60 dark:border-blue-800">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Highest-Impact Strategy Formulated</span>
          </div>
          <h2 className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-slate-100">
            Segmented Cross-Selling Yields Expected +24.6% Basket Value
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Generic site-wide recommendations underperform because customer cohorts have diametrically opposite category affinities. Deploying targeted cluster rules directly to personalized cart recommendations increases conversion by over 2.4x.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 text-center shadow-2xs min-w-[100px]">
            <div className="text-2xl font-extrabold text-blue-700 dark:text-blue-400 font-mono">{topBundles.length}</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Core Bundles</div>
          </div>
          <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 text-center shadow-2xs min-w-[100px]">
            <div className="text-2xl font-extrabold text-purple-700 dark:text-purple-400 font-mono">
              {clusterSpecificOpportunities.length}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Niche Synergies</div>
          </div>
        </div>
      </div>

      {/* Financial ROI Simulator */}
      <ROISimulator />

      {/* 1. High-Affinity Product Bundles */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>High-Affinity Automated Product Bundles</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pre-packaged category combinations designed for combo packaging, cross-merchandising, and cart checkout prompts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topBundles.map((b, idx) => {
            const promoCode = `BUNDLE-${b.antecedent[0]?.slice(0, 3).toUpperCase()}${b.consequent[0]?.slice(0, 3).toUpperCase()}`;
            const isCopied = copiedId === b.id;

            return (
              <div
                key={b.id || idx}
                className="p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-3.5 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <span className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                    <span>Bundle Package #{idx + 1}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-800">
                    {b.lift.toFixed(2)}x Lift Multiplier
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-900 dark:text-blue-200 text-xs font-bold border border-blue-200/60 dark:border-blue-800 shadow-2xs">
                    {b.antecedent.join(" + ")}
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 font-bold">➔</span>
                  <span className="px-3 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-900 dark:text-indigo-200 text-xs font-bold border border-indigo-200/60 dark:border-indigo-800 shadow-2xs">
                    {b.consequent.join(" + ")}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {b.businessAction}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 dark:border-slate-800">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    Supp: {(b.support * 100).toFixed(1)}% • Conf: {(b.confidence * 100).toFixed(1)}%
                  </div>
                  <button
                    onClick={() => handleCopyCode(b.id, promoCode)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs"
                  >
                    {isCopied ? <CheckCircle className="h-3 w-3 text-emerald-600" /> : <Tag className="h-3 w-3 text-blue-600 dark:text-blue-400" />}
                    <span>{isCopied ? "Copied" : promoCode}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Targeted Cross-Selling by Customer Segment */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span>Segment-Specific Cross-Selling Playbook</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Category pairings that demonstrate massive affinity within specific cohorts but are ineffective site-wide.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clusterSpecificOpportunities.map((opp, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl border border-purple-200/80 dark:border-purple-900/60 bg-purple-50/20 dark:bg-purple-950/20 space-y-3.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-purple-600 dark:bg-purple-400" />
                  <span>Target: {opp.dominantClusterName}</span>
                </span>
                <span className="text-xs font-mono font-bold text-purple-700 dark:text-purple-300 bg-purple-100/80 dark:bg-purple-900/60 px-2 py-0.5 rounded border border-purple-200/60 dark:border-purple-800">
                  Peak Lift: {opp.maxLift.toFixed(2)}x
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">{opp.antecedent.join(" & ")}</span>
                <ArrowRight className="h-3.5 w-3.5 text-purple-500" />
                <span className="font-bold text-purple-700 dark:text-purple-300 text-xs">{opp.consequent.join(" & ")}</span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {opp.crossSellingOpportunity}
              </p>

              <div className="text-[11px] text-purple-900 dark:text-purple-200 font-medium bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-purple-100 dark:border-purple-800 shadow-2xs">
                Strategy Prescription: {opp.actionRecommendation}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Customer Segment Growth Blueprints */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Award className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span>Customer Segment Growth Blueprints</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tailored growth strategies formulated for each discovered customer segment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {clusters.map((cluster) => (
            <div
              key={cluster.clusterId}
              className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40 space-y-3 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-slate-900"
                    style={{ backgroundColor: cluster.color }}
                  />
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {cluster.archetype}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200/40 dark:border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400 dark:text-slate-500">Base Share:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{cluster.percentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 dark:text-slate-500">Avg Spend:</span>
                    <span className="font-mono font-bold text-blue-700 dark:text-blue-400">{formatCurrency(cluster.avgCustomerSpend)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 dark:text-slate-500">Avg Basket:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">{cluster.avgBasketSize.toFixed(1)} items</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2.5 line-clamp-3 leading-relaxed">
                  {cluster.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                Demographic: {cluster.dominantAgeGroup} ({cluster.dominantRegion})
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
