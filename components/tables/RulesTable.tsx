"use client";

import React, { useState, useMemo } from "react";
import { AssociationRule } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { Badge } from "../ui/Badge";
import { ArrowRight, Search, ArrowUpDown, Sparkles, ExternalLink } from "lucide-react";

interface RulesTableProps {
  rules: AssociationRule[];
  title?: string;
}

type SortField = "lift" | "confidence" | "support" | "leverage" | "conviction";

export function RulesTable({ rules, title = "Discovered Association Rules" }: RulesTableProps) {
  const { setSelectedRuleForDrawer } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("lift");
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [presetFilter, setPresetFilter] = useState<"all" | "high_lift" | "stat_sig" | "global" | "cohort">("all");
  const pageSize = 8;

  // Filter and sort rules
  const filteredRules = useMemo(() => {
    return rules
      .filter((r) => {
        // Preset filter
        if (presetFilter === "high_lift" && r.lift < 2.0) return false;
        if (presetFilter === "stat_sig" && r.pValue !== undefined && r.pValue > 0.05) return false;
        if (presetFilter === "global" && r.clusterId !== "global") return false;
        if (presetFilter === "cohort" && r.clusterId === "global") return false;

        const query = searchTerm.toLowerCase();
        const antMatch = r.antecedent.some((a) => a.toLowerCase().includes(query));
        const consMatch = r.consequent.some((c) => c.toLowerCase().includes(query));
        const clusterMatch = r.clusterName.toLowerCase().includes(query);
        return antMatch || consMatch || clusterMatch;
      })
      .sort((a, b) => {
        const diff = b[sortField] - a[sortField];
        return sortAsc ? -diff : diff;
      });
  }, [rules, searchTerm, sortField, sortAsc, presetFilter]);

  const totalPages = Math.ceil(filteredRules.length / pageSize) || 1;
  const paginatedRules = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRules.slice(start, start + pageSize);
  }, [filteredRules, currentPage]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="flex flex-col space-y-3">
      {/* Search and Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by category or segment..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-56 shadow-2xs"
            />
          </div>

          {/* Quick Filter Presets */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => { setPresetFilter("all"); setCurrentPage(1); }}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                presetFilter === "all"
                  ? "bg-slate-900 text-white font-semibold"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Rules
            </button>
            <button
              onClick={() => { setPresetFilter("high_lift"); setCurrentPage(1); }}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                presetFilter === "high_lift"
                  ? "bg-emerald-600 text-white font-semibold"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              High Lift (≥2.0x)
            </button>
            <button
              onClick={() => { setPresetFilter("stat_sig"); setCurrentPage(1); }}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                presetFilter === "stat_sig"
                  ? "bg-blue-600 text-white font-semibold"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Stat. Significant (p&lt;0.05)
            </button>
            <button
              onClick={() => { setPresetFilter("cohort"); setCurrentPage(1); }}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                presetFilter === "cohort"
                  ? "bg-purple-600 text-white font-semibold"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Cohort Specific
            </button>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <span className="font-medium">Sort:</span>
          {(["lift", "confidence", "support", "leverage", "conviction"] as SortField[]).map((f) => (
            <button
              key={f}
              onClick={() => handleSort(f)}
              className={`px-2 py-1 rounded text-xs capitalize transition-colors ${
                sortField === f
                  ? "bg-blue-100 text-blue-700 font-semibold"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {f} {sortField === f ? (sortAsc ? "↑" : "↓") : ""}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
        <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
          <thead className="bg-slate-50 font-semibold text-slate-700">
            <tr>
              <th className="px-4 py-3">Antecedent (If Bought)</th>
              <th className="px-2 py-3 w-6 text-center"></th>
              <th className="px-4 py-3">Consequent (Also Buys)</th>
              <th className="px-3 py-3">Segment Scope</th>
              <th className="px-3 py-3 text-right cursor-pointer" onClick={() => handleSort("support")}>
                Support
              </th>
              <th className="px-3 py-3 text-right cursor-pointer" onClick={() => handleSort("confidence")}>
                Confidence
              </th>
              <th className="px-3 py-3 text-right cursor-pointer" onClick={() => handleSort("lift")}>
                <div className="inline-flex items-center gap-1 text-blue-700">
                  <span>Lift</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="px-3 py-3 text-right">Leverage</th>
              <th className="px-3 py-3 text-right">Conviction</th>
              <th className="px-4 py-3">Actionable Merchandising</th>
              <th className="px-3 py-3 text-center">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedRules.length > 0 ? (
              paginatedRules.map((rule) => {
                const isHighLift = rule.lift >= 2.0;

                return (
                  <tr
                    key={rule.id}
                    onClick={() => setSelectedRuleForDrawer(rule)}
                    className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                  >
                    {/* Antecedent */}
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <div className="flex flex-wrap gap-1">
                        {rule.antecedent.map((ant) => (
                          <span
                            key={ant}
                            className="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-semibold"
                          >
                            {ant}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Arrow */}
                    <td className="px-2 py-3 text-center text-slate-400">
                      <ArrowRight className="h-3.5 w-3.5 inline text-slate-400" />
                    </td>

                    {/* Consequent */}
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <div className="flex flex-wrap gap-1">
                        {rule.consequent.map((cons) => (
                          <span
                            key={cons}
                            className="inline-flex items-center px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-semibold"
                          >
                            {cons}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Cluster Scope */}
                    <td className="px-3 py-3">
                      <Badge
                        variant={rule.clusterId === "global" ? "default" : "primary"}
                        size="sm"
                      >
                        {rule.clusterName.replace("Cluster ", "C")}
                      </Badge>
                    </td>

                    {/* Support */}
                    <td className="px-3 py-3 text-right font-mono text-slate-600">
                      {(rule.support * 100).toFixed(1)}%
                    </td>

                    {/* Confidence */}
                    <td className="px-3 py-3 text-right font-mono text-slate-600">
                      {(rule.confidence * 100).toFixed(1)}%
                    </td>

                    {/* Lift */}
                    <td className="px-3 py-3 text-right font-mono">
                      <span
                        className={`font-bold px-1.5 py-0.5 rounded ${
                          isHighLift
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {rule.lift.toFixed(2)}x
                      </span>
                    </td>

                    {/* Leverage */}
                    <td className="px-3 py-3 text-right font-mono text-slate-500">
                      {rule.leverage > 0 ? `+${rule.leverage.toFixed(3)}` : rule.leverage.toFixed(3)}
                    </td>

                    {/* Conviction */}
                    <td className="px-3 py-3 text-right font-mono text-slate-500">
                      {rule.conviction >= 99 ? "∞" : rule.conviction.toFixed(2)}
                    </td>

                    {/* Business Action */}
                    <td className="px-4 py-3 text-slate-600 text-[11px] max-w-[220px]">
                      <div className="flex items-start gap-1">
                        {isHighLift && <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />}
                        <span className="line-clamp-2">{rule.businessAction}</span>
                      </div>
                    </td>

                    {/* Detail Icon */}
                    <td className="px-3 py-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRuleForDrawer(rule);
                        }}
                        className="p-1 rounded text-slate-400 group-hover:text-blue-600 hover:bg-blue-100 transition-colors"
                        title="Open Deep Inspector"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={11} className="px-4 py-8 text-center text-slate-400">
                  No association rules match the specified search or filter thresholds.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-2 pt-1 text-xs text-slate-500">
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
