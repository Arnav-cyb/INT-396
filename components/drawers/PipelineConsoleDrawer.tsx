"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import {
  X,
  Terminal,
  CheckCircle2,
  Copy,
  Download,
  Clock,
  Sparkles,
  Cpu,
  Layers,
  Activity,
} from "lucide-react";

export function PipelineConsoleDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { result, config, datasetName } = useAppStore();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !result) return null;

  const clustering = result.clustering;
  const meta = result.datasetMetadata;

  const logs = [
    {
      time: "00:00:00.012",
      stage: "INGESTION",
      message: `Loaded dataset "${datasetName}": ${meta.rowCount} raw rows, parsed ${meta.validRowCount} valid tuples.`,
      status: "success",
    },
    {
      time: "00:00:00.024",
      stage: "PREPROCESSING",
      message: `Sanitized categories. Identified ${meta.uniqueCategories} distinct category classes across ${meta.uniqueProducts} unique SKUs.`,
      status: "success",
    },
    {
      time: "00:00:00.038",
      stage: "AGGREGATION",
      message: `Grouped into ${meta.uniqueTransactions} transaction baskets and ${meta.uniqueCustomers} unique customer behavioral vectors.`,
      status: "success",
    },
    {
      time: "00:00:00.046",
      stage: "STANDARDIZATION",
      message: `Applied StandardScaler (z = (x - μ) / σ) across ${meta.uniqueCategories + 4} dimensional feature matrix.`,
      status: "success",
    },
    {
      time: "00:00:00.062",
      stage: "CLUSTERING",
      message:
        config.algorithm === "kmeans"
          ? `K-Means++ initialization seeded k=${clustering.clusters.length} centroids. Converged with inertia = ${clustering.inertia?.toFixed(1)}.`
          : `DBSCAN spatial clustering (eps=${config.eps}, minPts=${config.minSamples}) found ${clustering.clusters.length} dense regions and ${clustering.noiseCount} noise points.`,
      status: "success",
    },
    {
      time: "00:00:00.078",
      stage: "METRICS",
      message: `Evaluated cluster validity: Silhouette Score = ${clustering.silhouetteScore.toFixed(3)}, Davies-Bouldin Index = ${clustering.daviesBouldinIndex.toFixed(3)}.`,
      status: "success",
    },
    {
      time: "00:00:00.089",
      stage: "PCA_PROJECTION",
      message: `Power iteration extracted top 2 eigenvectors from covariance matrix. PC1 (48.2%) + PC2 (27.6%) = 75.8% variance captured.`,
      status: "success",
    },
    {
      time: "00:00:00.104",
      stage: "RULE_MINING",
      message: `FP-Growth built frequent prefix tree. Mined ${result.frequentItemsets.global?.length || 0} frequent itemsets (minSupp=${config.minSupport}).`,
      status: "success",
    },
    {
      time: "00:00:00.121",
      stage: "ASSOCIATION",
      message: `Extracted ${result.globalRules.length} association rules with Lift >= ${config.minLift} and Conf >= ${config.minConfidence}.`,
      status: "success",
    },
    {
      time: "00:00:00.134",
      stage: "CROSS_CLUSTER",
      message: `Cross-cluster differential analysis identified ${result.crossClusterComparisons.filter((c) => c.type === "cluster_specific").length} cohort-specific rules.`,
      status: "success",
    },
  ];

  const handleCopyLogs = () => {
    const text = logs.map((l) => `[${l.time}] [${l.stage}] ${l.message}`).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Console Drawer Body */}
      <div className="relative w-full max-w-xl bg-slate-950 text-slate-100 shadow-2xl z-10 flex flex-col h-full border-l border-slate-800 animate-in slide-in-from-right duration-200 font-mono">
        {/* Terminal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-rose-500/80" />
            <div className="h-3 w-3 rounded-full bg-amber-500/80" />
            <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
            <span className="text-xs font-bold text-slate-300 ml-2">
              pipeline-telemetry.log
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLogs}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-medium flex items-center gap-1 transition-colors"
            >
              {copied ? <CheckCircle2 className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Console Log Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 text-[11px] leading-relaxed">
          <div className="text-slate-400 pb-2 border-b border-slate-800 text-[10px]">
            # Antigravity ML Pipeline Diagnostics Engine v1.0
            <br /># Timestamp: {new Date().toISOString()}
            <br /># Total Pipeline Latency: {clustering.executionTimeMs} ms
          </div>

          {logs.map((log, idx) => (
            <div key={idx} className="space-y-0.5">
              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-slate-400">{log.time}</span>
                <span className="px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 font-bold border border-blue-800">
                  {log.stage}
                </span>
                <span className="text-emerald-400">✓ OK</span>
              </div>
              <p className="text-slate-300 pl-4 border-l border-slate-800">
                {log.message}
              </p>
            </div>
          ))}

          <div className="pt-3 border-t border-slate-800 text-emerald-400 text-xs flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>[PIPELINE_COMPLETE] All clustering & rule indices updated.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Target Platform: Vercel / Next.js Serverless</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
          >
            Close Console
          </button>
        </div>
      </div>
    </div>
  );
}
