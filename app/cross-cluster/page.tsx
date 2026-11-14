"use client";

import React, { useState, useMemo } from "react";
import { useAppStore } from "@/lib/store";
import { Badge } from "@/components/ui/Badge";
import { CategoryHeatmap } from "@/components/charts/CategoryHeatmap";
import { SankeyDiagram } from "@/components/charts/SankeyDiagram";
import {
  Share2,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Search,
  Filter,
  Flame,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

export default function CrossClusterPage() {
  const { result, setSelectedRuleForDrawer } = useAppStore();
  const [filterType, setFilterType] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [vizMode, setVizMode] = useState<"alluvial" | "heatmap">("alluvial");

  if (!result) return null;

  const comparisons = result.crossClusterComparisons;
  const clusters = result.clustering.clusters;
  const matrix = result.coOccurrenceMatrix;
  const categories = result.datasetMetadata.categories;

  // Filter comparisons
  const filteredComparisons = useMemo(() => {
    return comparisons.filter((c) => {
      const matchType = filterType === "all" || c.type === filterType;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        c.antecedent.some((a) => a.toLowerCase().includes(q)) ||
        c.consequent.some((cons) => cons.toLowerCase().includes(q)) ||
        c.dominantClusterName.toLowerCase().includes(q);
      return matchType && matchSearch;
    });
  }, [comparisons, filterType, search]);

  const clusterSpecificCount = comparisons.filter((c) => c.type === "cluster_specific").length;
  const universalCount = comparisons.filter((c) => c.type === "universal").length;
  const divergentCount = comparisons.filter((c) => c.type === "divergent").length;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Cross-Cluster Association Discovery
          </h1>
          <p className="text-xs text-slate-500">
            Detecting category relationships that only emerge within specific customer segments vs universal cross-catalog patterns.
          </p>
        </div>
      </div>

      {/* Cross-Cluster Summary Banners */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Segment-Specific Rules
            </span>
            <Flame className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {clusterSpecificCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Affinities unique to a single customer cohort
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Universal Catalog Rules
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {universalCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Consistent association across all customer groups
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Divergent Behavioral Rules
            </span>
            <AlertCircle className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {divergentCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            High variance in lift between demographic segments
          </p>
        </div>
      </div>

      {/* Cross-Cluster Rules Comparison Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Cross-Cluster Rule Comparison Matrix
            </h2>
            <p className="text-xs text-slate-500">
              Compare rule strength across each customer cluster to discover high-value targeted cross-selling opportunities (click any row to inspect).
            </p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search category or segment..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-56 shadow-2xs"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
            >
              <option value="all">All Classifications</option>
              <option value="cluster_specific">Cluster Specific</option>
              <option value="divergent">Divergent</option>
              <option value="universal">Universal</option>
              <option value="emerging">Emerging</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 font-semibold text-slate-700">
              <tr>
                <th className="px-4 py-3">Association Rule (Antecedent ➔ Consequent)</th>
                <th className="px-3 py-3">Classification</th>
                <th className="px-3 py-3 text-right">Global Lift</th>
                {clusters.map((c) => (
                  <th key={c.clusterId} className="px-3 py-3 text-right truncate max-w-[110px]" title={c.archetype}>
                    C{c.clusterId + 1} Lift
                  </th>
                ))}
                <th className="px-3 py-3 text-right">Lift Variance</th>
                <th className="px-4 py-3">Cross-Selling Opportunity & Strategy</th>
                <th className="px-3 py-3 text-center">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredComparisons.slice(0, 15).map((comp) => {
                const badgeVariant =
                  comp.type === "cluster_specific"
                    ? "warning"
                    : comp.type === "divergent"
                    ? "secondary"
                    : comp.type === "universal"
                    ? "success"
                    : "primary";

                // Generate a temporary AssociationRule representation for drawer
                const simulatedRule = {
                  id: comp.ruleKey,
                  clusterId: comp.dominantClusterId,
                  clusterName: comp.dominantClusterName,
                  antecedent: comp.antecedent,
                  consequent: comp.consequent,
                  support: 0.08,
                  confidence: 0.35,
                  lift: comp.maxLift,
                  leverage: 0.024,
                  conviction: 1.45,
                  antecedentSupport: 0.2,
                  consequentSupport: 0.15,
                  count: 140,
                  totalTransactions: result.datasetMetadata.uniqueTransactions,
                  businessAction: comp.actionRecommendation,
                };

                return (
                  <tr
                    key={comp.ruleKey}
                    onClick={() => setSelectedRuleForDrawer(simulatedRule)}
                    className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-blue-700">{comp.antecedent.join(" & ")}</span>
                        <ArrowRight className="h-3 w-3 text-slate-400 shrink-0" />
                        <span className="font-semibold text-indigo-700">{comp.consequent.join(" & ")}</span>
                      </div>
                    </td>

                    <td className="px-3 py-3">
                      <Badge variant={badgeVariant} size="sm">
                        {comp.type.replace("_", " ")}
                      </Badge>
                    </td>

                    <td className="px-3 py-3 text-right font-mono text-slate-700 font-semibold">
                      {comp.globalLift.toFixed(2)}x
                    </td>

                    {clusters.map((c) => {
                      const stat = comp.clusterStats[c.clusterId];
                      const isDominant = c.clusterId === comp.dominantClusterId;

                      return (
                        <td key={c.clusterId} className="px-3 py-3 text-right font-mono">
                          {stat && stat.lift > 0 ? (
                            <span
                              className={`px-1.5 py-0.5 rounded ${
                                isDominant
                                  ? "bg-blue-100 text-blue-800 font-bold"
                                  : "text-slate-600"
                              }`}
                            >
                              {stat.lift.toFixed(2)}x
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                      );
                    })}

                    <td className="px-3 py-3 text-right font-mono text-slate-500">
                      σ² = {comp.liftVariance.toFixed(2)}
                    </td>

                    <td className="px-4 py-3 text-[11px] text-slate-600 max-w-[260px]">
                      <div className="font-medium text-slate-900 line-clamp-1">{comp.crossSellingOpportunity}</div>
                      <div className="text-slate-400 line-clamp-1">{comp.actionRecommendation}</div>
                    </td>

                    <td className="px-3 py-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRuleForDrawer(simulatedRule);
                        }}
                        className="p-1 rounded text-slate-400 group-hover:text-blue-600 hover:bg-blue-100 transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Advanced Cross-Cluster Visualizations: Alluvial Flow & Affinity Heatmap */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider mb-0.5">
              <Share2 className="h-4 w-4" />
              <span>Multi-Dimensional Cohort Topology</span>
            </div>
            <h2 className="text-base font-bold text-slate-900">
              {vizMode === "alluvial"
                ? "Alluvial Transaction Flow Diagram (Antecedent ➔ Cluster Cohort ➔ Consequent)"
                : "Category Affinity & Co-Occurrence Matrix Heatmap"}
            </h2>
            <p className="text-xs text-slate-500">
              {vizMode === "alluvial"
                ? "Visualizing multi-stage purchase pathways across customer segments; ribbon thickness scales with association lift."
                : "Interactive symmetric matrix of bivariate co-purchases, lift ratios, and transaction support."}
            </p>
          </div>

          {/* Toggle Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start sm:self-auto">
            <button
              onClick={() => setVizMode("alluvial")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                vizMode === "alluvial"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Alluvial Flow
            </button>
            <button
              onClick={() => setVizMode("heatmap")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                vizMode === "heatmap"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Affinity Heatmap
            </button>
          </div>
        </div>

        {vizMode === "alluvial" ? (
          <SankeyDiagram
            comparisons={comparisons}
            clusters={clusters}
            categories={categories}
          />
        ) : (
          <CategoryHeatmap matrix={matrix} categories={categories} />
        )}
      </div>
    </div>
  );
}
