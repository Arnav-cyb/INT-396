"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import { AssociationNetwork } from "@/components/charts/AssociationNetwork";
import { Network, Filter, Info, Sparkles } from "lucide-react";

export default function NetworkGraphPage() {
  const { result, isLoading } = useAppStore();
  const [selectedClusterScope, setSelectedClusterScope] = useState<string>("all");

  if (isLoading || !result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[460px] space-y-4">
        <div className="relative">
          <div className="h-12 w-12 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <Sparkles className="h-4 w-4 text-blue-600 absolute inset-0 m-auto" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Constructing Category Network Topology...
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Calculating node degree centrality, modularity, and force-directed graph edges
          </p>
        </div>
      </div>
    );
  }

  const categories = result.datasetMetadata.categories;
  const clusters = result.clustering.clusters;
  const globalRules = result.globalRules;
  const clusterRulesMap = result.clusterRules;

  let activeRules = globalRules;
  let activeClusterName = "Global All-Customer Catalog";

  if (selectedClusterScope !== "all") {
    const cId = parseInt(selectedClusterScope);
    activeRules = clusterRulesMap[cId] || [];
    const matchedCluster = clusters.find((c) => c.clusterId === cId);
    if (matchedCluster) {
      activeClusterName = matchedCluster.name;
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Category Association Network Graph
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Topological graph visualization of product categories and co-purchase affinities.
          </p>
        </div>

        {/* Scope Switcher */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <Filter className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Scope:</span>
          <select
            value={selectedClusterScope}
            onChange={(e) => setSelectedClusterScope(e.target.value)}
            className="text-xs font-medium border-0 bg-transparent focus:ring-0 text-slate-900 dark:text-slate-100 cursor-pointer"
          >
            <option value="all" className="dark:bg-slate-900">Global Catalog (All Segments)</option>
            {clusters.map((c) => (
              <option key={c.clusterId} value={c.clusterId} className="dark:bg-slate-900">
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Network Container Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Interactive Category Affinity Topology
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Nodes represent product categories. Connected links indicate statistically significant association rules.
            </p>
          </div>
        </div>

        <AssociationNetwork
          categories={categories}
          rules={activeRules}
          selectedClusterName={activeClusterName}
        />
      </div>

      {/* Legend & Guide Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-600"></span>
            <span>Node Sizing</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Larger nodes indicate categories with higher number of cross-category association links in the current cohort.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
            <span className="h-2 w-8 rounded-full bg-blue-600"></span>
            <span>Edge Thickness</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Thicker, darker lines represent higher lift ratios (e.g. Lift &gt; 2.0x denotes stronger than 2x random co-purchase probability).
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Interactive Filtering</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Click any category node to isolate its connected bonds. Adjust the Min Lift slider to focus on high-conviction partnerships.
          </p>
        </div>
      </div>
    </div>
  );
}
