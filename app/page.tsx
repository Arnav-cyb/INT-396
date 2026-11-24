"use client";

import React from "react";
import { useAppStore } from "@/lib/store";
import { MetricCard } from "@/components/ui/MetricCard";
import {
  Receipt,
  Users,
  Layers,
  Sparkles,
  GitBranch,
  TrendingUp,
  Percent,
  Compass,
  ArrowUpRight,
  ShieldCheck,
  Cpu,
  Clock,
  Play,
  Share2,
  FileSpreadsheet,
  CheckCircle2,
  Network,
} from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { ClusterScatterPlot } from "@/components/charts/ClusterScatterPlot";
import { RulesTable } from "@/components/tables/RulesTable";
import Link from "next/link";

export default function OverviewDashboard() {
  const {
    result,
    isLoading,
    selectedClusterId,
    setSelectedClusterId,
    runAnalysis,
    loadPresetDataset,
    datasetName,
  } = useAppStore();

  if (isLoading || !result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[460px] space-y-4">
        <div className="relative">
          <div className="h-12 w-12 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <Sparkles className="h-4 w-4 text-blue-600 absolute inset-0 m-auto" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Running Machine Learning Pipeline...
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Clustering customer transaction vectors and mining frequent category rules
          </p>
        </div>
      </div>
    );
  }

  const meta = result.datasetMetadata;
  const rules = result.globalRules;
  const clusters = result.clustering.clusters;

  const avgLift =
    rules.length > 0
      ? (rules.reduce((sum, r) => sum + r.lift, 0) / rules.length).toFixed(2)
      : "1.00";
  const avgConf =
    rules.length > 0
      ? ((rules.reduce((sum, r) => sum + r.confidence, 0) / rules.length) * 100).toFixed(1)
      : "0.0";
  const avgSupp =
    rules.length > 0
      ? ((rules.reduce((sum, r) => sum + r.support, 0) / rules.length) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="space-y-6">
      {/* Enterprise Executive Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50/80 dark:bg-blue-950/60 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800">
              <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
              <span>Category Association Discovery & Segment Mining Engine</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Cross-Cluster Retail Association Intelligence
            </h1>

            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Uncovering non-trivial cross-selling affinities across customer cohorts using{" "}
              <strong className="text-slate-800 dark:text-slate-200">K-Means</strong>,{" "}
              <strong className="text-slate-800 dark:text-slate-200">DBSCAN</strong>,{" "}
              <strong className="text-slate-800 dark:text-slate-200">PCA dimensionality reduction</strong>, and{" "}
              <strong className="text-slate-800 dark:text-slate-200">FP-Growth rule mining</strong>.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {meta.validRowCount.toLocaleString()} Rows Cleaned
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                Latency: {result.clustering.executionTimeMs}ms
              </span>
              <span>•</span>
              <span>Catalog: {datasetName}</span>
            </div>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
            <Link
              href="/recommendations"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Product Recommendations</span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-bold">NEW</span>
            </Link>

            <Link
              href="/cross-cluster"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-4 py-2 text-xs font-semibold transition-colors"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Cross-Cluster Discovery</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>

            <Link
              href="/network"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 text-xs font-semibold transition-colors"
            >
              <Network className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
              <span>Category Network Graph</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Transactions"
          value={formatNumber(meta.uniqueTransactions)}
          subtitle={`${formatNumber(meta.validRowCount)} line items processed`}
          icon={Receipt}
          colorScheme="blue"
          trend={{ value: "100% Validated", positive: true }}
        />
        <MetricCard
          title="Customer Segments"
          value={clusters.length}
          subtitle={`Silhouette: ${result.clustering.silhouetteScore.toFixed(3)}`}
          icon={Users}
          colorScheme="purple"
          badge={result.clustering.algorithm.toUpperCase()}
        />
        <MetricCard
          title="Product Categories"
          value={meta.uniqueCategories}
          subtitle={`${meta.uniqueProducts} catalog products`}
          icon={Layers}
          colorScheme="emerald"
        />
        <MetricCard
          title="Association Rules"
          value={rules.length}
          subtitle={`Avg Lift: ${avgLift}x across catalog`}
          icon={GitBranch}
          colorScheme="amber"
          trend={{ value: `${rules.filter((r) => r.lift >= 2).length} High-Lift`, positive: true }}
        />
      </div>

      {/* New-User Product Recommendation Engine Spotlight */}
      <div className="rounded-2xl border border-blue-200/80 dark:border-blue-900/50 bg-gradient-to-r from-blue-50/70 via-indigo-50/30 to-purple-50/30 dark:from-slate-900 dark:via-blue-950/20 dark:to-indigo-950/20 p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider bg-blue-100/60 dark:bg-blue-900/60 px-2.5 py-0.5 rounded-full border border-blue-200/60 dark:border-blue-800">
            <Sparkles className="h-3 w-3" />
            <span>New Feature • Cold-Start Intelligence</span>
          </div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
            First-Time Shopper Recommendation Engine
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Personalize recommendations for shoppers with zero prior transactions by mapping category preferences to K-Means customer archetypes and expanding basket synergies via FP-Growth association rules.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/recommendations"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors"
          >
            <span>Launch Discovery Engine</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Diagnostic Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
              Mean Rule Lift
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1 font-mono">{avgLift}x</div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Baseline independence = 1.0x</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/60 ring-1 ring-blue-500/10">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
              Mean Confidence
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1 font-mono">{avgConf}%</div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Average conditional purchase probability</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/60 ring-1 ring-emerald-500/10">
            <Percent className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
              Catalog Revenue
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1 font-mono">{formatCurrency(meta.totalRevenue)}</div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Timeline: {meta.dateRange.start} - {meta.dateRange.end}</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/60 ring-1 ring-indigo-500/10">
            <Compass className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Cluster Scatter Plot & Model Diagnostics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Customer Segments (PCA 2D Projection Space)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Eigenvector reduction of customer wallet share, basket size, and frequency vectors.
              </p>
            </div>
            <Link
              href="/segmentation"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 inline-flex items-center gap-1"
            >
              <span>Full Model Details</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <ClusterScatterPlot
            clustering={result.clustering}
            selectedClusterId={selectedClusterId}
            onSelectCluster={setSelectedClusterId}
          />
        </div>

        {/* Discovered Cluster Profiles Card */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
              Discovered Archetypes
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Identified behavioral customer segments.
            </p>

            <div className="space-y-3">
              {clusters.map((c) => (
                <div
                  key={c.clusterId}
                  onClick={() => setSelectedClusterId(c.clusterId)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedClusterId === c.clusterId
                      ? "border-blue-400 dark:border-blue-500 bg-blue-50/60 dark:bg-blue-950/60 shadow-2xs ring-1 ring-blue-400/40"
                      : "border-slate-200/70 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{c.archetype}</span>
                    <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">
                      {c.percentage}% ({c.customerCount})
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
                    <span>Avg Spend: {formatCurrency(c.avgCustomerSpend)}</span>
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">Top: {c.topCategories[0]?.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <ShieldCheck className="h-4 w-4" />
              DB Index: {result.clustering.daviesBouldinIndex.toFixed(2)}
            </span>
            <span>Exec: {result.clustering.executionTimeMs}ms</span>
          </div>
        </div>
      </div>

      {/* Top Discovered Association Rules Preview */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Highest-Lift Association Rules
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Discovered cross-category affinities where purchasing itemset A drastically increases likelihood of purchasing itemset B. Click any rule to open the Deep Inspector.
            </p>
          </div>
          <Link
            href="/association-rules"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 inline-flex items-center gap-1"
          >
            <span>View All Rules ({rules.length})</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        <RulesTable rules={rules.slice(0, 10)} />
      </div>
    </div>
  );
}
