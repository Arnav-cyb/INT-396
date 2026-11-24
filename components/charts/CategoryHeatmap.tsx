"use client";

import React, { useState, useMemo } from "react";
import { CoOccurrenceCell } from "@/lib/types";

interface CategoryHeatmapProps {
  categories: string[];
  matrix: CoOccurrenceCell[];
}

export function CategoryHeatmap({ categories, matrix }: CategoryHeatmapProps) {
  const [metric, setMetric] = useState<"lift" | "confidence" | "support" | "coOccurrenceCount">("lift");
  const [hoveredCell, setHoveredCell] = useState<CoOccurrenceCell | null>(null);

  // Map pairs to fast dictionary
  const cellMap = useMemo(() => {
    const map = new Map<string, CoOccurrenceCell>();
    matrix.forEach((cell) => {
      map.set(`${cell.source}|||${cell.target}`, cell);
    });
    return map;
  }, [matrix]);

  // Metric scaling for heatmap coloring
  const maxLift = 3.5;
  const maxSupport = 0.25;
  const maxConfidence = 0.6;
  const maxCount = Math.max(...matrix.map((c) => c.coOccurrenceCount), 50);

  const getCellColor = (val: number, isDiagonal: boolean) => {
    if (isDiagonal) return "#f1f5f9"; // muted grey diagonal

    let ratio = 0;
    if (metric === "lift") ratio = Math.min(1, Math.max(0, (val - 0.8) / (maxLift - 0.8)));
    else if (metric === "confidence") ratio = Math.min(1, val / maxConfidence);
    else if (metric === "support") ratio = Math.min(1, val / maxSupport);
    else ratio = Math.min(1, val / maxCount);

    // Blue-indigo gradient steps
    if (ratio === 0) return "#f8fafc";
    if (ratio < 0.2) return "#eff6ff";
    if (ratio < 0.4) return "#bfdbfe";
    if (ratio < 0.6) return "#60a5fa";
    if (ratio < 0.8) return "#2563eb";
    return "#1e40af";
  };

  const getTextColor = (val: number, isDiagonal: boolean) => {
    if (isDiagonal) return "#94a3b8";
    if (metric === "lift") return val >= 2.0 ? "#ffffff" : "#1e293b";
    if (metric === "confidence") return val >= 0.35 ? "#ffffff" : "#1e293b";
    return val > (maxCount * 0.5) ? "#ffffff" : "#1e293b";
  };

  return (
    <div className="space-y-4">
      {/* Metric Selector Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Display Metric:</span>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            {[
              { id: "lift", label: "Lift (Strength)" },
              { id: "confidence", label: "Confidence" },
              { id: "support", label: "Support" },
              { id: "coOccurrenceCount", label: "Co-Purchases" },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setMetric(btn.id as any)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  metric === btn.id
                    ? "bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
          <span>Low Affinity</span>
          <div className="flex h-3 w-24 rounded overflow-hidden border border-slate-200 dark:border-slate-700">
            <span className="flex-1 bg-blue-50"></span>
            <span className="flex-1 bg-blue-200"></span>
            <span className="flex-1 bg-blue-400"></span>
            <span className="flex-1 bg-blue-600"></span>
            <span className="flex-1 bg-blue-800"></span>
          </div>
          <span>High Affinity</span>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-xs p-3">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-[11px] font-semibold text-slate-400 dark:text-slate-400 text-left uppercase tracking-wider w-36">
                Category
              </th>
              {categories.map((cat) => (
                <th
                  key={cat}
                  className="p-2 text-[11px] font-semibold text-slate-700 dark:text-slate-300 text-center truncate max-w-[90px]"
                  title={cat}
                >
                  {cat.length > 12 ? `${cat.slice(0, 10)}…` : cat}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map((rowCat) => (
              <tr key={rowCat} className="border-t border-slate-100 dark:border-slate-800">
                <td className="p-2 text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[140px]" title={rowCat}>
                  {rowCat}
                </td>
                {categories.map((colCat) => {
                  const cell = cellMap.get(`${rowCat}|||${colCat}`);
                  const isDiagonal = rowCat === colCat;
                  const val = cell ? cell[metric] : 0;
                  const formatted =
                    metric === "lift"
                      ? `${val.toFixed(2)}x`
                      : metric === "coOccurrenceCount"
                      ? val.toLocaleString()
                      : `${(val * 100).toFixed(1)}%`;

                  return (
                    <td
                      key={colCat}
                      onMouseEnter={() => cell && setHoveredCell(cell)}
                      onMouseLeave={() => setHoveredCell(null)}
                      style={{
                        backgroundColor: getCellColor(val, isDiagonal),
                        color: getTextColor(val, isDiagonal),
                      }}
                      className="p-2 text-center text-xs font-medium cursor-pointer transition-all hover:scale-105 hover:z-10 relative border border-slate-100 dark:border-slate-800"
                    >
                      {isDiagonal ? "—" : formatted}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Hovered Cell Detail Strip */}
      {hoveredCell ? (
        <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50/70 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs text-blue-950 dark:text-blue-100">
          <div className="flex items-center gap-2">
            <span className="font-bold">{hoveredCell.source}</span>
            <span className="text-blue-500 font-bold">➔</span>
            <span className="font-bold">{hoveredCell.target}</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span>Co-purchases: <strong>{hoveredCell.coOccurrenceCount}</strong></span>
            <span>Support: <strong>{(hoveredCell.support * 100).toFixed(1)}%</strong></span>
            <span>Confidence: <strong>{(hoveredCell.confidence * 100).toFixed(1)}%</strong></span>
            <span>Lift: <strong className="text-blue-700 dark:text-blue-400">{hoveredCell.lift.toFixed(2)}x</strong></span>
          </div>
        </div>
      ) : (
        <div className="p-2 text-[11px] text-slate-400 dark:text-slate-500 text-center">
          Hover over any matrix intersection to inspect bivariate association metrics.
        </div>
      )}
    </div>
  );
}
