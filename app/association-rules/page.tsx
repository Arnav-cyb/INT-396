"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import { RulesTable } from "@/components/tables/RulesTable";
import { RuleScatterPlot } from "@/components/charts/RuleScatterPlot";
import { GitBranch, Sliders, Play, Layers, Sparkles, Filter, ScatterChart as ScatterIcon, Table } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AssociationRulesPage() {
  const { config, updateConfig, runAnalysis, isLoading, result } = useAppStore();
  const [selectedClusterScope, setSelectedClusterScope] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"table" | "scatter">("table");

  if (!result) return null;

  const globalRules = result.globalRules;
  const clusterRulesMap = result.clusterRules;
  const clusters = result.clustering.clusters;

  // Determine active rule list based on scope filter
  let displayRules = globalRules;
  if (selectedClusterScope !== "all" && selectedClusterScope !== "global") {
    const cId = parseInt(selectedClusterScope);
    displayRules = clusterRulesMap[cId] || [];
  } else if (selectedClusterScope === "all") {
    const combined = [...globalRules];
    Object.values(clusterRulesMap).forEach((rList) => {
      combined.push(...rList);
    });
    const seen = new Set<string>();
    displayRules = combined.filter((r) => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });
  }

  const frequentItemsets = result.frequentItemsets.global || [];

  return (
    <div className="space-y-6">
      {/* Header & Controls Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Association Rule Mining Engine
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Discover frequent category itemsets and extract predictive purchase associations using FP-Growth or Apriori algorithms.
          </p>
        </div>

        {/* Hyperparameters Config */}
        <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Algorithm:</span>
            <select
              value={config.ruleAlgorithm}
              onChange={(e) => updateConfig({ ruleAlgorithm: e.target.value as any })}
              className="text-xs font-medium border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="fpgrowth">FP-Growth (Fast Prefix Tree)</option>
              <option value="apriori">Apriori (Candidate Generation)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-600 dark:text-slate-400">Min Supp:</span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max="0.5"
              value={config.minSupport}
              onChange={(e) => updateConfig({ minSupport: parseFloat(e.target.value) || 0.04 })}
              className="w-16 text-xs font-mono border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-center bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-600 dark:text-slate-400">Min Conf:</span>
            <input
              type="number"
              step="0.05"
              min="0.1"
              max="1.0"
              value={config.minConfidence}
              onChange={(e) => updateConfig({ minConfidence: parseFloat(e.target.value) || 0.2 })}
              className="w-16 text-xs font-mono border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-center bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-600 dark:text-slate-400">Min Lift:</span>
            <input
              type="number"
              step="0.05"
              min="1.0"
              max="5.0"
              value={config.minLift}
              onChange={(e) => updateConfig({ minLift: parseFloat(e.target.value) || 1.05 })}
              className="w-16 text-xs font-mono border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-center bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <Button
            size="sm"
            onClick={runAnalysis}
            isLoading={isLoading}
            className="shadow-2xs font-semibold"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Mine Rules</span>
          </Button>
        </div>
      </div>

      {/* Scope Selector, View Toggle & Quick Summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Cohort Scope:</span>
            <select
              value={selectedClusterScope}
              onChange={(e) => setSelectedClusterScope(e.target.value)}
              className="text-xs font-medium border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Rules Combined ({displayRules.length})</option>
              <option value="global">Global Catalog Wide ({globalRules.length})</option>
              {clusters.map((c) => (
                <option key={c.clusterId} value={c.clusterId}>
                  {c.name} ({clusterRulesMap[c.clusterId]?.length || 0} rules)
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium">
            <button
              onClick={() => setActiveTab("table")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                activeTab === "table"
                  ? "bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 font-bold shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Table className="h-3.5 w-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setActiveTab("scatter")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                activeTab === "scatter"
                  ? "bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 font-bold shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <ScatterIcon className="h-3.5 w-3.5" />
              <span>2D Bubble Chart</span>
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-4 font-mono">
          <span>
            Frequent Itemsets: <strong className="text-slate-900 dark:text-slate-100">{frequentItemsets.length}</strong>
          </span>
          <span>
            Active Rules: <strong className="text-blue-700 dark:text-blue-400">{displayRules.length}</strong>
          </span>
        </div>
      </div>

      {/* Main Content: Table or Scatter Bubble Plot */}
      {activeTab === "table" ? (
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs">
          <RulesTable rules={displayRules} />
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Association Rule Diagnostic Bubble Plot (Support vs Confidence vs Lift)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Gold standard analytical visualization. Bubbles in upper-right quadrant represent high-support, high-confidence rules; bubble diameter represents Lift multiplier.
            </p>
          </div>
          <RuleScatterPlot rules={displayRules} />
        </div>
      )}

      {/* Frequent Itemsets Grid Card */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
          <Layers className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <span>Top Frequent Category Itemsets (Support &gt;= {(config.minSupport * 100).toFixed(0)}%)</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Category combinations that appear together in customer shopping baskets most frequently.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {frequentItemsets.slice(0, 12).map((itemset, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/60 flex flex-col justify-between space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <div className="flex flex-wrap gap-1">
                {itemset.items.map((it) => (
                  <span
                    key={it}
                    className="px-2 py-0.5 rounded bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-600 text-[11px] font-semibold shadow-2xs"
                  >
                    {it}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/40 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 font-mono">
                  {itemset.count.toLocaleString()} baskets
                </span>
                <span className="font-mono font-bold text-blue-700 dark:text-blue-400">
                  {(itemset.support * 100).toFixed(1)}% Supp
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
