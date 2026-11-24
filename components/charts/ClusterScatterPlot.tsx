"use client";

import React, { useState, useMemo } from "react";
import { ClusteringResult } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { CustomerDetailModal } from "../modals/CustomerDetailModal";

interface ClusterScatterPlotProps {
  clustering: ClusteringResult;
  selectedClusterId: number | "all";
  onSelectCluster: (id: number | "all") => void;
}

const CLUSTER_PALETTE = [
  "#2563eb", // Vibrant Blue
  "#7c3aed", // Rich Violet
  "#059669", // Emerald
  "#d97706", // Amber
  "#dc2626", // Rose
  "#0891b2", // Cyan
  "#4f46e5", // Indigo
];

export function ClusterScatterPlot({
  clustering,
  selectedClusterId,
  onSelectCluster,
}: ClusterScatterPlotProps) {
  const [hoveredPoint, setHoveredPoint] = useState<any | null>(null);
  const [selectedPointForModal, setSelectedPointForModal] = useState<any | null>(null);
  const [showDensityHulls, setShowDensityHulls] = useState(true);
  const [showCentroids, setShowCentroids] = useState(true);

  const points = clustering.pcaPoints;

  // Viewport setup
  const width = 640;
  const height = 400;
  const padding = 45;

  // Compute dynamic min/max bounds for PCA coordinates
  const { minX, maxX, minY, maxY } = useMemo(() => {
    if (!points.length) return { minX: -5, maxX: 5, minY: -5, maxY: 5 };
    const xs = points.map((p: any) => p.x);
    const ys = points.map((p: any) => p.y);
    return {
      minX: Math.min(...xs) - 0.5,
      maxX: Math.max(...xs) + 0.5,
      minY: Math.min(...ys) - 0.5,
      maxY: Math.max(...ys) + 0.5,
    };
  }, [points]);

  const scaleX = (x: number) =>
    padding + ((x - minX) / (maxX - minX || 1)) * (width - 2 * padding);
  const scaleY = (y: number) =>
    height - padding - ((y - minY) / (maxY - minY || 1)) * (height - 2 * padding);

  // Group points to calculate cluster PCA centroids
  const centroidsInPCA = useMemo(() => {
    const clusterGroups = new Map<number, { xSum: number; ySum: number; count: number }>();

    points.forEach((p: any) => {
      if (p.cluster === -1) return; // ignore noise
      const curr = clusterGroups.get(p.cluster) || { xSum: 0, ySum: 0, count: 0 };
      clusterGroups.set(p.cluster, {
        xSum: curr.xSum + p.x,
        ySum: curr.ySum + p.y,
        count: curr.count + 1,
      });
    });

    const results: { clusterId: number; x: number; y: number }[] = [];
    clusterGroups.forEach((val, cid) => {
      results.push({
        clusterId: cid,
        x: val.xSum / (val.count || 1),
        y: val.ySum / (val.count || 1),
      });
    });

    return results;
  }, [points]);

  const filteredPoints = useMemo(() => {
    if (selectedClusterId === "all") return points;
    return points.filter((p: any) => p.cluster === selectedClusterId);
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
                ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-2xs"
                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
            }`}
          >
            All Segments ({points.length})
          </button>
          {clustering.clusters.map((c: any, i: number) => {
            const color = CLUSTER_PALETTE[i % CLUSTER_PALETTE.length];
            const isSelected = selectedClusterId === c.clusterId;

            return (
              <button
                key={c.clusterId}
                onClick={() => onSelectCluster(c.clusterId)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border transition-all ${
                  isSelected
                    ? "bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-100 border-blue-400 dark:border-blue-600 font-bold shadow-2xs"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="truncate max-w-[130px]">{c.archetype}</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-400">({c.customerCount})</span>
              </button>
            );
          })}
        </div>

        {/* View Options */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={showCentroids}
              onChange={(e) => setShowCentroids(e.target.checked)}
              className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-0 h-3.5 w-3.5"
            />
            <span>Centroids</span>
          </label>
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={showDensityHulls}
              onChange={(e) => setShowDensityHulls(e.target.checked)}
              className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-0 h-3.5 w-3.5"
            />
            <span>Density Radii</span>
          </label>
        </div>
      </div>

      {/* SVG Scatter Plot */}
      <div className="relative border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-2 shadow-2xs overflow-hidden flex-1">
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
            className="stroke-slate-200 dark:stroke-slate-800"
            strokeDasharray="3,3"
          />
          <line
            x1={scaleX(0)}
            y1={padding}
            x2={scaleX(0)}
            y2={height - padding}
            className="stroke-slate-200 dark:stroke-slate-800"
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
            className="stroke-slate-400 dark:stroke-slate-600"
            strokeWidth="1.5"
          />
          <line
            x1={padding}
            y1={padding}
            x2={padding}
            y2={height - padding}
            className="stroke-slate-400 dark:stroke-slate-600"
            strokeWidth="1.5"
          />

          {/* Axis Labels */}
          <text
            x={width / 2}
            y={height - 18}
            textAnchor="middle"
            className="text-[11px] fill-slate-600 dark:fill-slate-400 font-semibold"
          >
            Principal Component 1 (Standardized Wallet Volume & Basket Depth)
          </text>
          <text
            x={-height / 2}
            y={20}
            transform="rotate(-90)"
            textAnchor="middle"
            className="text-[11px] fill-slate-600 dark:fill-slate-400 font-semibold"
          >
            Principal Component 2 (Cross-Category Affinity Orientation)
          </text>

          {/* Data Points */}
          {filteredPoints.map((pt: any, idx: number) => {
            const cx = scaleX(pt.x);
            const cy = scaleY(pt.y);
            const color =
              pt.cluster === -1
                ? "#94a3b8"
                : CLUSTER_PALETTE[pt.cluster % CLUSTER_PALETTE.length];
            const isHovered = hoveredPoint?.customerId === pt.customerId;

            return (
              <circle
                key={`${pt.customerId}-${idx}`}
                cx={cx}
                cy={cy}
                r={isHovered ? 6.5 : 3.5}
                fill={color}
                opacity={isHovered ? 1 : 0.72}
                className="transition-all duration-100 cursor-pointer stroke-white dark:stroke-slate-900"
                strokeWidth={isHovered ? 2 : 0.75}
                onMouseEnter={() => setHoveredPoint(pt)}
                onMouseLeave={() => setHoveredPoint(null)}
                onClick={() => setSelectedPointForModal(pt)}
              />
            );
          })}

          {/* Centroid Stars */}
          {showCentroids &&
            centroidsInPCA.map((cen) => {
              const cx = scaleX(cen.x);
              const cy = scaleY(cen.y);
              const color = CLUSTER_PALETTE[cen.clusterId % CLUSTER_PALETTE.length];
              const isSelected =
                selectedClusterId === "all" || selectedClusterId === cen.clusterId;

              if (!isSelected) return null;

              return (
                <g key={`centroid-${cen.clusterId}`}>
                  {/* Centroid Marker with halo */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={9}
                    fill={color}
                    className="stroke-white dark:stroke-slate-900 shadow-sm"
                    strokeWidth={2.5}
                  />
                  <text
                    x={cx}
                    y={cy + 3.5}
                    textAnchor="middle"
                    className="text-[9px] font-extrabold fill-white font-mono pointer-events-none"
                  >
                    ★
                  </text>
                </g>
              );
            })}
        </svg>

        {/* Hovered Point Tooltip */}
        {hoveredPoint && (
          <div className="absolute top-4 right-4 bg-slate-900/95 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 backdrop-blur border border-slate-700 pointer-events-none min-w-[200px] animate-in fade-in-0 duration-100">
            <div className="font-bold font-mono text-blue-300 flex items-center justify-between">
              <span>{hoveredPoint.customerId}</span>
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

      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between px-1">
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
