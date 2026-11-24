"use client";

import React, { useState } from "react";
import {
  SegmentMatchResult,
  UserPreferences,
} from "@/lib/recommendations";
import { AssociationRule } from "@/lib/types";
import {
  Layers,
  ArrowRight,
  Sparkles,
  GitBranch,
  Users2,
  CheckCircle2,
  Sliders,
  TrendingUp,
  BarChart3,
  Info,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface RecommendationPipelineVisualizerProps {
  preferences: UserPreferences;
  matchedSegments: SegmentMatchResult[];
  primarySegment: SegmentMatchResult | null;
  activeRules: AssociationRule[];
  totalEvaluated: number;
  totalReturned: number;
}

export function RecommendationPipelineVisualizer({
  preferences,
  matchedSegments,
  primarySegment,
  activeRules,
  totalEvaluated,
  totalReturned,
}: RecommendationPipelineVisualizerProps) {
  const [activeTab, setActiveTab] = useState<"flow" | "segments" | "rules">("flow");

  const chartData = matchedSegments.map((s) => ({
    name: s.archetype.length > 18 ? s.archetype.substring(0, 16) + "..." : s.archetype,
    fullArchetype: s.archetype,
    similarity: Math.round(s.similarityScore * 100),
    color: s.color || "#3b82f6",
    isPrimary: primarySegment?.clusterId === s.clusterId,
  }));

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      {/* Header with Tab Navigation */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Recommendation Pipeline & Explainability Engine
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Trace how cold-start user preferences flow through clustering, FP-Growth rules, and ranking.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
          <button
            onClick={() => setActiveTab("flow")}
            className={`px-3 py-1 font-semibold rounded-lg transition-all ${
              activeTab === "flow"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            4-Stage Pipeline
          </button>
          <button
            onClick={() => setActiveTab("segments")}
            className={`px-3 py-1 font-semibold rounded-lg transition-all ${
              activeTab === "segments"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            Segment Match ({matchedSegments.length})
          </button>
          <button
            onClick={() => setActiveTab("rules")}
            className={`px-3 py-1 font-semibold rounded-lg transition-all ${
              activeTab === "rules"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            Rules Triggered ({activeRules.length})
          </button>
        </div>
      </div>

      <div className="p-5">
        {/* TAB 1: 4-STAGE PIPELINE FLOW */}
        {activeTab === "flow" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Step 1 */}
              <div className="p-3.5 rounded-xl border border-blue-200/70 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-blue-700 dark:text-blue-300">
                  <span>Stage 1: Preferences</span>
                  <span className="font-mono text-[10px] bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded">
                    INPUT
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {preferences.categories?.length || 0} Categories Selected
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  {preferences.categories && preferences.categories.length > 0
                    ? preferences.categories.slice(0, 3).join(", ") +
                      (preferences.categories.length > 3
                        ? ` +${preferences.categories.length - 3} more`
                        : "")
                    : "Zero preferences (cold-start baseline)"}
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-3.5 rounded-xl border border-indigo-200/70 dark:border-indigo-900/50 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-indigo-700 dark:text-indigo-300">
                  <span>Stage 2: Segment Match</span>
                  <span className="font-mono text-[10px] bg-indigo-100 dark:bg-indigo-900 px-1.5 py-0.5 rounded">
                    AFFINITY
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {primarySegment ? primarySegment.archetype : "Dataset Baseline"}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  {primarySegment
                    ? `${Math.round(primarySegment.similarityScore * 100)}% behavioral affinity score`
                    : "Universal cluster default"}
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-3.5 rounded-xl border border-purple-200/70 dark:border-purple-900/50 bg-purple-50/40 dark:bg-purple-950/20 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-purple-700 dark:text-purple-300">
                  <span>Stage 3: FP-Growth</span>
                  <span className="font-mono text-[10px] bg-purple-100 dark:bg-purple-900 px-1.5 py-0.5 rounded">
                    MINING
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {activeRules.length} Association Rules Active
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  {activeRules.length > 0
                    ? `Max synergy lift: ${Math.max(...activeRules.map((r) => r.lift)).toFixed(2)}x`
                    : "No matching antecedent rules"}
                </p>
              </div>

              {/* Step 4 */}
              <div className="p-3.5 rounded-xl border border-emerald-200/70 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  <span>Stage 4: Ranking</span>
                  <span className="font-mono text-[10px] bg-emerald-100 dark:bg-emerald-900 px-1.5 py-0.5 rounded">
                    SCORED
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {totalReturned} Recommendations Produced
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Filtered from {totalEvaluated} candidates via 5-factor scoring
                </p>
              </div>
            </div>

            {/* Formula Callout */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
              <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300">
                <p className="font-bold text-slate-900 dark:text-slate-100">
                  Multi-Factor Ranking Formula
                </p>
                <p className="font-mono text-[11px] text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800">
                  Score = 100 × [ (0.35 × S_segment) + (0.25 × L_norm_rule) + (0.20 × P_norm_pop) + (0.15 × M_pref) + (0.05 × B_budget) ]
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Signals are strictly bounded between 0 and 1 before multiplication. Rule lifts are normalized via saturation scaling to prevent extreme rule outliers from distorting rankings.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SEGMENT SIMILARITY COMPARISON */}
        {activeTab === "segments" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                Behavioral Affinity to Customer Segments (0 - 100%)
              </span>
              {primarySegment && (
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  Top Match: {primarySegment.archetype} ({Math.round(primarySegment.similarityScore * 100)}%)
                </span>
              )}
            </div>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "#64748b" }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} width={120} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                    formatter={(val: any, _name: any, item: any) => [
                      `${val}% affinity`,
                      item.payload.fullArchetype,
                    ]}
                  />
                  <Bar dataKey="similarity" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.isPrimary ? "#2563eb" : entry.color || "#64748b"}
                        opacity={entry.isPrimary ? 1 : 0.65}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-2">
              {matchedSegments.map((s) => (
                <div
                  key={s.clusterId}
                  className={`p-2.5 rounded-lg border text-xs ${
                    primarySegment?.clusterId === s.clusterId
                      ? "border-blue-400 dark:border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 font-semibold"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate text-slate-800 dark:text-slate-200">{s.archetype}</span>
                    <span className="font-mono text-blue-600 dark:text-blue-400">
                      {Math.round(s.similarityScore * 100)}%
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                    <span>Cat: {Math.round(s.categoryAffinity * 100)}%</span>
                    <span>Demo: {Math.round(s.demographicAffinity * 100)}%</span>
                    <span>Spend: {Math.round(s.spendAffinity * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: ACTIVE ASSOCIATION RULES */}
        {activeTab === "rules" && (
          <div className="space-y-3">
            {activeRules.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {activeRules.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 rounded-xl border border-purple-200/80 dark:border-purple-900/50 bg-purple-50/40 dark:bg-purple-950/20 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {r.antecedent.join(" & ")}
                      </span>
                      <ArrowRight className="h-3 w-3 text-purple-600 dark:text-purple-400 shrink-0" />
                      <span className="font-bold text-purple-700 dark:text-purple-300">
                        {r.consequent.join(" & ")}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      <span>Lift: <strong className="text-purple-700 dark:text-purple-300">{r.lift.toFixed(2)}x</strong></span>
                      <span>Conf: <strong>{Math.round(r.confidence * 100)}%</strong></span>
                      <span>Supp: <strong>{(r.support * 100).toFixed(1)}%</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500">
                No FP-Growth association rules matched the currently selected categories. Recommendations will utilize direct preference overlap and segment popularity.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
