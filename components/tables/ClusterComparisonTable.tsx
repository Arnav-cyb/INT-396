"use client";

import React from "react";
import { ClusterSummary } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Users, Tag, ChevronRight } from "lucide-react";

interface ClusterComparisonTableProps {
  clusters: ClusterSummary[];
  selectedClusterId: number | "all";
  onSelectCluster: (id: number | "all") => void;
}

export function ClusterComparisonTable({
  clusters,
  selectedClusterId,
  onSelectCluster,
}: ClusterComparisonTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-xs">
        <thead className="bg-slate-50/90 dark:bg-slate-950/90 font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] font-mono">
          <tr>
            <th className="px-4 py-3">Cluster Archetype</th>
            <th className="px-3 py-3 text-right">Customer Count</th>
            <th className="px-3 py-3 text-right">Share of Base</th>
            <th className="px-3 py-3 text-right">Total Revenue</th>
            <th className="px-3 py-3 text-right">Avg Customer Spend</th>
            <th className="px-3 py-3 text-right">Basket Depth</th>
            <th className="px-4 py-3">Top Product Categories</th>
            <th className="px-3 py-3">Demographic Core</th>
            <th className="px-3 py-3 text-center">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {clusters.map((cluster) => {
            const isSelected = selectedClusterId === cluster.clusterId;

            return (
              <tr
                key={cluster.clusterId}
                className={`transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-blue-50/60 dark:bg-blue-950/40"
                    : "hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
                }`}
                onClick={() => onSelectCluster(cluster.clusterId)}
              >
                {/* Archetype Name */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="h-3 w-3 rounded-full shrink-0 ring-2 ring-white dark:ring-slate-900 shadow-2xs"
                      style={{ backgroundColor: cluster.color }}
                    />
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">{cluster.archetype}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">Cluster #{cluster.clusterId + 1}</div>
                    </div>
                  </div>
                </td>

                {/* Customer Count */}
                <td className="px-3 py-3.5 text-right font-mono font-medium text-slate-700 dark:text-slate-300">
                  <div className="inline-flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    <span>{cluster.customerCount.toLocaleString()}</span>
                  </div>
                </td>

                {/* Share */}
                <td className="px-3 py-3.5 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                  {cluster.percentage}%
                </td>

                {/* Total Spend */}
                <td className="px-3 py-3.5 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                  {formatCurrency(cluster.totalSpend)}
                </td>

                {/* Avg Spend */}
                <td className="px-3 py-3.5 text-right font-mono text-blue-700 dark:text-blue-400 font-bold">
                  {formatCurrency(cluster.avgCustomerSpend)}
                </td>

                {/* Basket Size */}
                <td className="px-3 py-3.5 text-right font-mono text-slate-600 dark:text-slate-300 font-semibold">
                  {cluster.avgBasketSize.toFixed(1)} items
                </td>

                {/* Top Categories */}
                <td className="px-4 py-3.5">
                  <div className="flex flex-wrap gap-1 max-w-[260px]">
                    {cluster.topCategories.slice(0, 3).map((cat) => (
                      <span
                        key={cat.category}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 font-medium"
                      >
                        <Tag className="h-2.5 w-2.5 text-slate-400" />
                        <span>{cat.category}</span>
                        <span className="text-slate-400 dark:text-slate-500 font-mono">({cat.share}%)</span>
                      </span>
                    ))}
                  </div>
                </td>

                {/* Demographics */}
                <td className="px-3 py-3.5 text-slate-600 dark:text-slate-400">
                  <div className="text-xs font-medium text-slate-800 dark:text-slate-200">{cluster.dominantAgeGroup}</div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500">{cluster.dominantRegion}</div>
                </td>

                {/* Action button */}
                <td className="px-3 py-3.5 text-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCluster(cluster.clusterId);
                    }}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-2xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {isSelected ? "Filtered" : "Inspect"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
