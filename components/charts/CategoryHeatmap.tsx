"use client";

import React, { useState } from "react";
import { CategoryMatrixCell } from "@/lib/types";

interface CategoryHeatmapProps {
  matrix: CategoryMatrixCell[];
  categories: string[];
}

export function CategoryHeatmap({ matrix, categories }: CategoryHeatmapProps) {
  const [metric, setMetric] = useState<"lift" | "support" | "confidence" | "coOccurrenceCount">("lift");
  const [hoveredCell, setHoveredCell] = useState<CategoryMatrixCell | null>(null);

  // Map for fast cell lookup: `source|||target`
  const cellMap = new Map<string, CategoryMatrixCell>();
  let maxMetric = 0;

  for (const cell of matrix) {
    cellMap.set(`${cell.source}|||${cell.target}`, cell);
    if (cell.source !== cell.target) {
      const val = cell[metric];
      if (val > maxMetric) maxMetric = val;
    }
  }

  // Color generator
  const getCellColor = (val: number, isDiagonal: boolean) => {
    if (isDiagonal) return "#f1f5f9";
    if (val === 0 || !maxMetric) return "#ffffff";
    const ratio = Math.min(1, Math.max(0, val / maxMetric));

    if (metric === "lift") {
      if (val < 1.0) return "#f8fafc";
      if (ratio < 0.3) return "#dbeafe";
      if (ratio < 0.6) return "#93c5fd";
      if (ratio < 0.8) return "#3b82f6";
      return "#1d4ed8";
    }

    // Default blue gradient
    const lightness = Math.round(96 - ratio * 45);
    return `hsl(217, 91%, ${lightness}%)`;
  };

  const getTextColor = (val: number, isDiagonal: boolean) => {
    if (isDiagonal) return "#94a3b8";
    if (!maxMetric) return "#64748b";
    const ratio = val / maxMetric;
    return ratio > 0.6 ? "#ffffff" : "#1e293b";
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Metric Selector Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-semibold text-slate-700">Display Metric:</span>
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
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
                    ? "bg-white text-blue-700 shadow-xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <span>Low Affinity</span>
          <div className="flex h-3 w-24 rounded overflow-hidden border border-slate-200">
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
      <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-xs p-3">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-[11px] font-semibold text-slate-400 text-left uppercase tracking-wider w-36">
                Category
              </th>
              {categories.map((cat) => (
                <th
                  key={cat}
                  className="p-2 text-[11px] font-semibold text-slate-700 text-center truncate max-w-[90px]"
                  title={cat}
                >
                  {cat.length > 12 ? `${cat.slice(0, 10)}…` : cat}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map((rowCat) => (
              <tr key={rowCat} className="border-t border-slate-100">
                <td className="p-2 text-xs font-semibold text-slate-800 truncate max-w-[140px]" title={rowCat}>
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
                      className="p-2 text-center text-xs font-medium cursor-pointer transition-all hover:scale-105 hover:z-10 relative border border-slate-100"
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
        <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50/70 border border-blue-200 text-xs text-blue-950">
          <div className="flex items-center gap-2">
            <span className="font-bold">{hoveredCell.source}</span>
            <span className="text-blue-500 font-bold">➔</span>
            <span className="font-bold">{hoveredCell.target}</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span>Co-purchases: <strong>{hoveredCell.coOccurrenceCount}</strong></span>
            <span>Support: <strong>{(hoveredCell.support * 100).toFixed(1)}%</strong></span>
            <span>Confidence: <strong>{(hoveredCell.confidence * 100).toFixed(1)}%</strong></span>
            <span>Lift: <strong className="text-blue-700">{hoveredCell.lift.toFixed(2)}x</strong></span>
          </div>
        </div>
      ) : (
        <div className="p-2 text-[11px] text-slate-400 text-center">
          Hover over any matrix intersection to inspect bivariate association metrics.
        </div>
      )}
    </div>
  );
}
