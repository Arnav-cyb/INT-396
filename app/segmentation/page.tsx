"use client";

import React from "react";
import { useAppStore } from "@/lib/store";
import { ClusterScatterPlot } from "@/components/charts/ClusterScatterPlot";
import { ClusterComparisonTable } from "@/components/tables/ClusterComparisonTable";
import { ClusterRadarChart } from "@/components/charts/ClusterRadarChart";
import { ElbowCurveChart } from "@/components/charts/ElbowCurveChart";
import { Users2, Sliders, Play, Award, Activity, Compass, PieChart, ShieldCheck, Zap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function SegmentationPage() {
  const {
    config,
    updateConfig,
    runAnalysis,
    isLoading,
    result,
    selectedClusterId,
    setSelectedClusterId,
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
            Clustering Customer Segments & Behavioral Cohorts...
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Evaluating Silhouette Score, Davies-Bouldin Index, and PCA Eigenvectors
          </p>
        </div>
      </div>
    );
  }

  const clustering = result.clustering;
  const activeCluster =
    selectedClusterId !== "all"
      ? clustering.clusters.find((c) => c.clusterId === selectedClusterId)
      : null;

  return (
    <div className="space-y-6">
      {/* Title & Algorithm Configuration Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Customer & Transaction Segmentation
          </h1>
          <p className="text-xs text-slate-500">
            Partitioning shoppers into distinct behavioral segments using multi-dimensional feature standard scaling, K-Means, and DBSCAN.
          </p>
        </div>

        {/* Algorithm Hyperparameter Toolbar */}
        <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Algorithm:</span>
            <select
              value={config.algorithm}
              onChange={(e) => updateConfig({ algorithm: e.target.value as any })}
              className="text-xs font-medium border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="kmeans">K-Means Clustering</option>
              <option value="dbscan">DBSCAN (Density-Based)</option>
            </select>
          </div>

          {config.algorithm === "kmeans" ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600 dark:text-slate-400">Clusters (k):</span>
              <input
                type="number"
                min="2"
                max="8"
                value={config.k}
                onChange={(e) => updateConfig({ k: parseInt(e.target.value) || 4 })}
                className="w-14 text-xs font-mono border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-center bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-600 dark:text-slate-400">Eps:</span>
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="5.0"
                  value={config.eps}
                  onChange={(e) => updateConfig({ eps: parseFloat(e.target.value) || 1.8 })}
                  className="w-14 text-xs font-mono border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-center bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-600 dark:text-slate-400">MinPts:</span>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={config.minSamples}
                  onChange={(e) => updateConfig({ minSamples: parseInt(e.target.value) || 4 })}
                  className="w-14 text-xs font-mono border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-center bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          )}

          <Button
            size="sm"
            onClick={runAnalysis}
            isLoading={isLoading}
            className="shadow-2xs font-semibold"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Re-cluster</span>
          </Button>
        </div>
      </div>

      {/* Model Quality Assessment Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium font-mono">
            <span>Silhouette Score</span>
            <Award className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1 font-mono">
            {clustering.silhouetteScore.toFixed(3)}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Range: -1 to +1 (Score &gt; 0.4 indicates solid separation)
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium font-mono">
            <span>Davies-Bouldin Index</span>
            <Activity className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1 font-mono">
            {clustering.daviesBouldinIndex.toFixed(3)}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Lower is better (Closer to 0 means tighter clusters)
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium font-mono">
            <span>{config.algorithm === "kmeans" ? "Model Inertia" : "Noise Outliers"}</span>
            <Sliders className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1 font-mono">
            {config.algorithm === "kmeans"
              ? clustering.inertia?.toLocaleString() ?? "—"
              : `${clustering.noiseCount} points`}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {config.algorithm === "kmeans" ? "Sum of squared errors (SSE)" : "Unclustered anomaly customers"}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium font-mono">
            <span>Discovered Clusters</span>
            <Users2 className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1 font-mono">
            {clustering.clusters.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Covering 100% of validated customers
          </p>
        </div>
      </div>

      {/* Automated Elbow Method & Silhouette Optimizer Curve */}
      <ElbowCurveChart />

      {/* Main Visualizations: 2D PCA Space + Multi-Dimensional Radar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PCA Scatter Plot */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Principal Component Space (PCA 2D Projection)
              </h2>
              <p className="text-xs text-slate-500">
                Customers grouped by spending volume, basket size, and category preference vectors. Click any dot to inspect customer dossier.
              </p>
            </div>
          </div>

          <ClusterScatterPlot
            clustering={clustering}
            selectedClusterId={selectedClusterId}
            onSelectCluster={setSelectedClusterId}
          />
        </div>

        {/* Multi-Dimensional Cluster Radar Chart */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Cohort Radar Archetype
              </h2>
              <Compass className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-xs text-slate-500 mb-2">
              Behavioral fingerprint across 6 dimensions.
            </p>

            <ClusterRadarChart
              clusters={clustering.clusters}
              selectedClusterId={selectedClusterId}
            />
          </div>

          {activeCluster ? (
            <div className="mt-2 p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs space-y-1">
              <div className="font-bold text-blue-900 dark:text-blue-100">{activeCluster.name}</div>
              <p className="text-blue-800 dark:text-blue-300 text-[11px] leading-relaxed">{activeCluster.description}</p>
            </div>
          ) : (
            <div className="mt-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-[11px] text-slate-400 text-center">
              Select a cluster above to inspect its focused radar polygon.
            </div>
          )}
        </div>
      </div>

      {/* Segment Comparison & Characteristics Table */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Discovered Segment Characteristics & Profile Comparison
            </h2>
            <p className="text-xs text-slate-500">
              Comparative matrix showing customer count, wallet share, average transaction spend, and category affinities.
            </p>
          </div>
        </div>

        <ClusterComparisonTable
          clusters={clustering.clusters}
          selectedClusterId={selectedClusterId}
          onSelectCluster={setSelectedClusterId}
        />
      </div>
    </div>
  );
}
