"use client";

import React, { useMemo, useState } from "react";
import { useAppStore } from "@/lib/store";
import { computeElbowCurve, ElbowPoint } from "@/ml/optimizer";
import { cleanTransactions, StandardScaler } from "@/ml/preprocessing";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  CartesianGrid,
  Legend,
} from "recharts";
import { Sparkles, Sliders, CheckCircle2, Zap } from "lucide-react";
import { launchConfetti } from "@/lib/confetti";

export function ElbowCurveChart() {
  const { rawTransactions, config, updateConfig, runAnalysis, isLoading } = useAppStore();
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Compute elbow curve points
  const { points, optimalK } = useMemo(() => {
    try {
      const { customerProfiles } = cleanTransactions(rawTransactions);
      const matrix = customerProfiles.map((c) => c.features);
      const scaler = new StandardScaler();
      const scaled = scaler.fitTransform(matrix);
      return computeElbowCurve(scaled, 2, 7);
    } catch {
      return { points: [], optimalK: 4 };
    }
  }, [rawTransactions]);

  const handleApplyOptimal = async () => {
    setIsOptimizing(true);
    launchConfetti();
    updateConfig({ algorithm: "kmeans", k: optimalK });
    setTimeout(async () => {
      await runAnalysis();
      setIsOptimizing(false);
    }, 100);
  };

  const optimalPoint = points.find((p) => p.k === optimalK);

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white dark:bg-slate-900 p-5 shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-0.5">
            <Zap className="h-4 w-4" />
            <span>Hyperparameter Optimization Engine</span>
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Elbow Method & Silhouette Optimization Curve
          </h3>
          <p className="text-xs text-slate-500">
            Automated mathematical evaluation of inertia and cluster separation across $k \in [2, 7]$.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Recommended $k^* = {optimalK}$</span>
          </div>

          <button
            onClick={handleApplyOptimal}
            disabled={isOptimizing || isLoading || config.k === optimalK}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{config.k === optimalK ? "Active $k^*$" : `Apply $k^* = ${optimalK}$`}</span>
          </button>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ top: 15, right: 25, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3,3" stroke="#e2e8f0" />
            <XAxis
              dataKey="k"
              label={{ value: "Number of Clusters (k)", position: "insideBottom", offset: -5, fontSize: 11, fill: "#64748b" }}
              tick={{ fontSize: 11, fill: "#64748b" }}
            />
            {/* Left Y-Axis: Inertia */}
            <YAxis
              yAxisId="left"
              label={{ value: "Inertia (SSE)", angle: -90, position: "insideLeft", fontSize: 11, fill: "#2563eb", fontWeight: 600 }}
              tick={{ fontSize: 10, fill: "#2563eb" }}
            />
            {/* Right Y-Axis: Silhouette */}
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[-0.1, 1]}
              label={{ value: "Silhouette Score", angle: 90, position: "insideRight", fontSize: 11, fill: "#059669", fontWeight: 600 }}
              tick={{ fontSize: 10, fill: "#059669" }}
            />
            <Tooltip
              formatter={(val: any, name: any) => [
                name === "Inertia" ? Number(val).toLocaleString() : Number(val).toFixed(3),
                name,
              ]}
              labelFormatter={(lbl) => `k = ${lbl} Clusters`}
              contentStyle={{ fontSize: 11, borderRadius: 8 }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="inertia"
              name="Inertia (SSE)"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="silhouette"
              name="Silhouette Score"
              stroke="#059669"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            {optimalPoint && (
              <ReferenceDot
                yAxisId="right"
                x={optimalPoint.k}
                y={optimalPoint.silhouette}
                r={8}
                fill="#059669"
                stroke="#ffffff"
                strokeWidth={2}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 font-mono">
        <span>Optimal $k$ maximizes Silhouette cohesion while preserving elbow inflection</span>
        <span>Active model config: k={config.k}</span>
      </div>
    </div>
  );
}
