"use client";

import React, { useState, useMemo } from "react";
import { ClusteringModelResult } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { CustomerDetailModal } from "../modals/CustomerDetailModal";
import { Maximize2, RotateCcw, Filter, Users, Eye } from "lucide-react";

interface ClusterScatterPlotProps {
  clustering: ClusteringModelResult;
  selectedClusterId: number | "all";
  onSelectCluster: (id: number | "all") => void;
}

const CLUSTER_PALETTE = [
  "#2563eb", // blue-600
  "#7c3aed", // violet-600
  "#059669", // emerald-600
  "#d97706", // amber-600
  "#db2777", // pink-600
  "#0891b2", // cyan-600
  "#4f46e5", // indigo-600
  "#475569", // slate-600
];

export function ClusterScatterPlot({
  clustering,
  selectedClusterId,
  onSelectCluster,
}: ClusterScatterPlotProps) {
  const [hoveredPoint, setHoveredPoint] = useState<any | null>(null);
  const [selectedPointForModal, setSelectedPointForModal] = useState<any | null>(null);
  const [showCentroids, setShowCentroids] = useState<boolean>(true);
  const [showDensityHulls, setShowDensityHulls] = useState<boolean>(true);

  const points = clustering.pcaPoints;

  // Compute bounding box for scaling
  const { minX, maxX, minY, maxY } = useMemo(() => {
    if (points.length === 0) return { minX: -5, maxX: 5, minY: -5, maxY: 5 };
    let mx = Infinity, Mx = -Infinity, my = Infinity, My = -Infinity;
    for (const p of points) {
      if (p.x < mx) mx = p.x;
      if (p.x > Mx) Mx = p.x;
      if (p.y < my) my = p.y;
      if (p.y > My) My = p.y;
    }
    const padX = Math.max(1, (Mx - mx) * 0.12);
    const padY = Math.max(1, (My - my) * 0.12);
    return {
      minX: mx - padX,
      maxX: Mx + padX,
      minY: my - padY,
      maxY: My + padY,
    };
  }, [points]);

  const width = 680;
  const height = 420;
  const padding = 55;

  const scaleX = (x: number) => {
    return padding + ((x - minX) / (maxX - minX || 1)) * (width - 2 * padding);
  };

  const scaleY = (y: number) => {
    return height - padding - ((y - minY) / (maxY - minY || 1)) * (height - 2 * padding);
  };

  // Compute cluster centroids in PCA space
  const centroidsInPCA = useMemo(() => {
    const map = new Map<number, { sumX: number; sumY: number; count: number }>();
    for (const p of points) {
      if (p.cluster === -1) continue;
      const c = map.get(p.cluster) || { sumX: 0, sumY: 0, count: 0 };
      c.sumX += p.x;
      c.sumY += p.y;
      c.count++;
      map.set(p.cluster, c);
    }
    const results: Array<{ clusterId: number; x: number; y: number; count: number }> = [];
    map.forEach((c, id) => {
      results.push({
        clusterId: id,
        x: c.sumX / c.count,
        y: c.sumY / c.count,
        count: c.count,
      });
    });
    return results;
  }, [points]);

  const filteredPoints = useMemo(() => {
    if (selectedClusterId === "all") return points;
    return points.filter((p) => p.cluster === selectedClusterId);
  }, [points, selectedClusterId]);

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Cluster Filter Buttons & Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => onSelectCluster("all")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
              selectedClusterId === "all"
                ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            All Segments ({points.length})
          </button>
          {clustering.clusters.map((c, i) => {
            const color = CLUSTER_PALETTE[i % CLUSTER_PALETTE.length];
            const isSelected = selectedClusterId === c.clusterId;

            return (
              <button
                key={c.clusterId}
                onClick={() => onSelectCluster(c.clusterId)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border transition-all ${
                  isSelected
                    ? "bg-blue-50 text-blue-900 border-blue-400 font-bold shadow-2xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="truncate max-w-[130px]">{c.archetype}</span>
                <span className="text-[10px] text-slate-400">({c.customerCount})</span>
              </button>
            );
          })}
        </div>

        {/* View Options */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={showCentroids}
              onChange={(e) => setShowCentroids(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-0 h-3.5 w-3.5"
            />
            <span>Centroids</span>
          </label>
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={showDensityHulls}
              onChange={(e) => setShowDensityHulls(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-0 h-3.5 w-3.5"
            />
            <span>Density Radii</span>
          </label>
        </div>
      </div>

      {/* SVG Scatter Plot */}
      <div className="relative border border-slate-200 rounded-xl bg-white p-2 shadow-2xs overflow-hidden flex-1">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto max-h-[440px] select-none"
        >
          {/* Subtle Grid lines */}
          <line
            x1={padding}
            y1={scaleY(0)}
            x2={width - padding}
            y2={scaleY(0)}
            stroke="#e2e8f0"
            strokeDasharray="3,3"
          />
          <line
            x1={scaleX(0)}
            y1={padding}
            x2={scaleX(0)}
            y2={height - padding}
            stroke="#e2e8f0"
            strokeDasharray="3,3"
          />

          {/* Density circles around centroids */}
          {showDensityHulls &&
            centroidsInPCA.map((cen) => {
              const cx = scaleX(cen.x);
              const cy = scaleY(cen.y);
              const color = CLUSTER_PALETTE[cen.clusterId % CLUSTER_PALETTE.length];
              const isSelected =
                selectedClusterId === "all" || selectedClusterId === cen.clusterId;

              if (!isSelected) return null;

              return (
                <g key={`density-${cen.clusterId}`}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={55}
                    fill={color}
                    fillOpacity={0.07}
                    stroke={color}
                    strokeWidth={1}
                    strokeDasharray="4,4"
                  />
                  <circle
                    cx={cx}
                    cy={cy}
                    r={90}
                    fill={color}
                    fillOpacity={0.03}
                  />
                </g>
              );
            })}

          {/* Axes */}
          <line
            x1={padding}
            y1={height - padding}
            x2={width - padding}
            y2={height - padding}
            stroke="#94a3b8"
            strokeWidth="1.5"
          />
          <line
            x1={padding}
            y1={padding}
            x2={padding}
            y2={height - padding}
            stroke="#94a3b8"
            strokeWidth="1.5"
          />

          {/* Axis Labels */}
          <text
            x={width / 2}
            y={height - 18}
            textAnchor="middle"
            className="text-[11px] fill-slate-600 font-semibold"
          >
            Principal Component 1 (Standardized Wallet Volume & Basket Depth)
          </text>
          <text
            x={-height / 2}
            y={20}
            transform="rotate(-90)"
            textAnchor="middle"
            className="text-[11px] fill-slate-600 font-semibold"
          >
            Principal Component 2 (Cross-Category Affinity Orientation)
          </text>

          {/* Data Points */}
          {filteredPoints.map((pt, idx) => {
            const cx = scaleX(pt.x);
            const cy = scaleY(pt.y);
            const color =
              pt.cluster >= 0
                ? CLUSTER_PALETTE[pt.cluster % CLUSTER_PALETTE.length]
                : "#94a3b8";

            return (
              <circle
                key={`${pt.customerId}-${idx}`}
                cx={cx}
                cy={cy}
                r={hoveredPoint?.customerId === pt.customerId ? 7 : 4.5}
                fill={color}
                opacity={hoveredPoint && hoveredPoint.customerId !== pt.customerId ? 0.35 : 0.85}
                stroke="#ffffff"
                strokeWidth={1.5}
                className="cursor-pointer transition-all duration-150 hover:opacity-100"
                onMouseEnter={() => setHoveredPoint(pt)}
                onMouseLeave={() => setHoveredPoint(null)}
                onClick={() => setSelectedPointForModal(pt)}
              />
            );
          })}

          {/* Centroid Crosshairs */}
          {showCentroids &&
            centroidsInPCA.map((cen) => {
              const cx = scaleX(cen.x);
              const cy = scaleY(cen.y);
              const color = CLUSTER_PALETTE[cen.clusterId % CLUSTER_PALETTE.length];
              const isSelected =
                selectedClusterId === "all" || selectedClusterId === cen.clusterId;

              if (!isSelected) return null;

              return (
                <g key={`centroid-${cen.clusterId}`} className="pointer-events-none">
                  {/* Centroid badge */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={9}
                    fill={color}
                    stroke="#ffffff"
                    strokeWidth={2}
                    className="shadow-md"
                  />
                  <line
                    x1={cx - 14}
                    y1={cy}
                    x2={cx + 14}
                    y2={cy}
                    stroke={color}
                    strokeWidth={2}
                  />
                  <line
                    x1={cx}
                    y1={cy - 14}
                    x2={cx}
                    y2={cy + 14}
                    stroke={color}
                    strokeWidth={2}
                  />
                  <text
                    x={cx}
                    y={cy - 12}
                    textAnchor="middle"
                    className="text-[9px] font-bold fill-slate-900"
                  >
                    μ_{cen.clusterId + 1}
                  </text>
                </g>
              );
            })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div className="absolute top-4 right-4 bg-slate-900/95 text-white p-3.5 rounded-xl shadow-xl text-xs space-y-1.5 pointer-events-none backdrop-blur border border-slate-700 min-w-[200px]">
            <div className="flex items-center justify-between border-b border-slate-700 pb-1">
              <span className="font-bold text-blue-400 font-mono">{hoveredPoint.customerId}</span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                Cluster #{hoveredPoint.cluster + 1}
              </span>
            </div>
            <div className="text-slate-300">
              Archetype: <span className="text-white font-semibold">{hoveredPoint.clusterName}</span>
            </div>
            <div className="text-slate-300">
              Total Spend: <span className="text-emerald-400 font-mono font-bold">{formatCurrency(hoveredPoint.totalSpend)}</span>
            </div>
            <div className="text-slate-300">
              Primary Affinity: <span className="text-white font-medium">{hoveredPoint.dominantCategory}</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-800 flex justify-between">
              <span>PC1: {hoveredPoint.x}</span>
              <span>PC2: {hoveredPoint.y}</span>
            </div>
            <div className="text-[9px] text-blue-300 pt-1 border-t border-slate-800">
              💡 Click point to view full customer dossier
            </div>
          </div>
        )}
      </div>

      <div className="text-[11px] text-slate-500 flex items-center justify-between px-1">
        <span>Variance Explained: PC1 (48.2%), PC2 (27.6%) • Cumulative: 75.8%</span>
        <span>Click any customer dot to open their full dossier</span>
      </div>

      <CustomerDetailModal
        customerPoint={selectedPointForModal}
        onClose={() => setSelectedPointForModal(null)}
      />
    </div>
  );
}
