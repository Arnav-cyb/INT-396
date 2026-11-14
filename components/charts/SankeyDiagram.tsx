"use client";

import React, { useState, useMemo } from "react";
import { AssociationRule, ClusterSummary, CrossClusterComparisonRule } from "@/lib/types";

interface SankeyDiagramProps {
  comparisons: CrossClusterComparisonRule[];
  clusters: ClusterSummary[];
  categories: string[];
}

interface Ribbon {
  id: string;
  sourceName: string;
  clusterName: string;
  targetName: string;
  lift: number;
  width: number;
  sourceY: number;
  clusterY: number;
  targetY: number;
  color: string;
}

const CLUSTER_COLORS = ["#2563eb", "#7c3aed", "#059669", "#d97706", "#ec4899", "#0891b2"];

export function SankeyDiagram({ comparisons, clusters, categories }: SankeyDiagramProps) {
  const [hoveredRibbon, setHoveredRibbon] = useState<Ribbon | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const width = 760;
  const height = 440;
  const col1X = 60;
  const col2X = 380;
  const col3X = 700;

  // Take top 8 representative associations
  const topComps = useMemo(() => {
    return comparisons.slice(0, 7);
  }, [comparisons]);

  // Unique sources and targets
  const sources = useMemo(() => {
    const set = new Set<string>();
    topComps.forEach((c) => set.add(c.antecedent[0]));
    return Array.from(set);
  }, [topComps]);

  const targets = useMemo(() => {
    const set = new Set<string>();
    topComps.forEach((c) => set.add(c.consequent[0]));
    return Array.from(set);
  }, [topComps]);

  // Compute node Y positions
  const sourceYMap = useMemo(() => {
    const map = new Map<string, number>();
    const step = height / (sources.length + 1);
    sources.forEach((s, idx) => map.set(s, step * (idx + 1)));
    return map;
  }, [sources, height]);

  const clusterYMap = useMemo(() => {
    const map = new Map<number, number>();
    const step = height / (clusters.length + 1);
    clusters.forEach((c, idx) => map.set(c.clusterId, step * (idx + 1)));
    return map;
  }, [clusters, height]);

  const targetYMap = useMemo(() => {
    const map = new Map<string, number>();
    const step = height / (targets.length + 1);
    targets.forEach((t, idx) => map.set(t, step * (idx + 1)));
    return map;
  }, [targets, height]);

  // Compute Ribbons
  const ribbons: Ribbon[] = useMemo(() => {
    return topComps.map((comp, idx) => {
      const src = comp.antecedent[0];
      const tgt = comp.consequent[0];
      const cId = comp.dominantClusterId;
      const cObj = clusters.find((c) => c.clusterId === cId);
      const color = CLUSTER_COLORS[cId % CLUSTER_COLORS.length];

      return {
        id: `ribbon-${idx}`,
        sourceName: src,
        clusterName: cObj ? cObj.archetype : `Cluster ${cId + 1}`,
        targetName: tgt,
        lift: comp.maxLift,
        width: Math.max(3, Math.min(14, comp.maxLift * 3.5)),
        sourceY: sourceYMap.get(src) || height / 2,
        clusterY: clusterYMap.get(cId) || height / 2,
        targetY: targetYMap.get(tgt) || height / 2,
        color,
      };
    });
  }, [topComps, clusters, sourceYMap, clusterYMap, targetYMap, height]);

  return (
    <div className="space-y-3">
      {/* Visual Title */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Alluvial Category Transaction Flow (Antecedent ➔ Segment Router ➔ Consequent)
          </h3>
          <p className="text-xs text-slate-500">
            Interactive multi-stage flow mapping showing how source purchases route through customer lifestyle segments into destination cross-sells.
          </p>
        </div>

        {selectedNode && (
          <button
            onClick={() => setSelectedNode(null)}
            className="text-xs text-rose-600 hover:text-rose-700 font-semibold underline"
          >
            Clear Filter ({selectedNode})
          </button>
        )}
      </div>

      {/* SVG Canvas */}
      <div className="relative border border-slate-200/80 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 p-4 shadow-2xs overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[460px] select-none">
          {/* Column Headers */}
          <text x={col1X} y={24} textAnchor="middle" className="text-[11px] font-bold fill-slate-400 uppercase tracking-wider font-mono">
            1. Antecedent Category
          </text>
          <text x={col2X} y={24} textAnchor="middle" className="text-[11px] font-bold fill-blue-600 uppercase tracking-wider font-mono">
            2. Customer Lifestyle Segment
          </text>
          <text x={col3X} y={24} textAnchor="middle" className="text-[11px] font-bold fill-indigo-600 uppercase tracking-wider font-mono">
            3. Consequent Cross-Sell
          </text>

          {/* Flow Ribbons: Column 1 to Column 2 */}
          {ribbons.map((rib) => {
            const isMatch =
              !selectedNode ||
              selectedNode === rib.sourceName ||
              selectedNode === rib.clusterName ||
              selectedNode === rib.targetName;

            const opacity = isMatch ? (hoveredRibbon?.id === rib.id ? 0.9 : 0.45) : 0.08;
            const midX1 = (col1X + col2X) / 2;
            const midX2 = (col2X + col3X) / 2;

            // Path 1: Source to Cluster
            const path1 = `M ${col1X + 20} ${rib.sourceY} C ${midX1} ${rib.sourceY}, ${midX1} ${rib.clusterY}, ${col2X - 50} ${rib.clusterY}`;
            // Path 2: Cluster to Target
            const path2 = `M ${col2X + 50} ${rib.clusterY} C ${midX2} ${rib.clusterY}, ${midX2} ${rib.targetY}, ${col3X - 20} ${rib.targetY}`;

            return (
              <g
                key={rib.id}
                className="cursor-pointer transition-all duration-150"
                onMouseEnter={() => setHoveredRibbon(rib)}
                onMouseLeave={() => setHoveredRibbon(null)}
              >
                <path
                  d={path1}
                  fill="none"
                  stroke={rib.color}
                  strokeWidth={rib.width}
                  opacity={opacity}
                />
                <path
                  d={path2}
                  fill="none"
                  stroke={rib.color}
                  strokeWidth={rib.width}
                  opacity={opacity}
                />
              </g>
            );
          })}

          {/* Column 1 Nodes (Sources) */}
          {sources.map((src) => {
            const y = sourceYMap.get(src) || 0;
            const isSelected = selectedNode === src;

            return (
              <g
                key={src}
                className="cursor-pointer"
                onClick={() => setSelectedNode(selectedNode === src ? null : src)}
              >
                <rect
                  x={col1X - 50}
                  y={y - 14}
                  width={100}
                  height={28}
                  rx={6}
                  fill={isSelected ? "#2563eb" : "#f1f5f9"}
                  stroke={isSelected ? "#1d4ed8" : "#cbd5e1"}
                  strokeWidth={1.5}
                  className="shadow-2xs transition-colors"
                />
                <text
                  x={col1X}
                  y={y + 3.5}
                  textAnchor="middle"
                  className={`text-[10px] font-bold ${isSelected ? "fill-white" : "fill-slate-800"}`}
                >
                  {src.length > 13 ? `${src.slice(0, 11)}…` : src}
                </text>
              </g>
            );
          })}

          {/* Column 2 Nodes (Clusters) */}
          {clusters.map((c, i) => {
            const y = clusterYMap.get(c.clusterId) || 0;
            const color = CLUSTER_COLORS[i % CLUSTER_COLORS.length];
            const isSelected = selectedNode === c.archetype;

            return (
              <g
                key={c.clusterId}
                className="cursor-pointer"
                onClick={() => setSelectedNode(selectedNode === c.archetype ? null : c.archetype)}
              >
                <rect
                  x={col2X - 70}
                  y={y - 16}
                  width={140}
                  height={32}
                  rx={8}
                  fill={isSelected ? color : "#ffffff"}
                  stroke={color}
                  strokeWidth={2}
                  className="shadow-2xs transition-all"
                />
                <text
                  x={col2X}
                  y={y + 3.5}
                  textAnchor="middle"
                  className={`text-[10px] font-extrabold ${isSelected ? "fill-white" : "fill-slate-900"}`}
                >
                  {c.archetype.length > 17 ? `${c.archetype.slice(0, 15)}…` : c.archetype}
                </text>
              </g>
            );
          })}

          {/* Column 3 Nodes (Targets) */}
          {targets.map((tgt) => {
            const y = targetYMap.get(tgt) || 0;
            const isSelected = selectedNode === tgt;

            return (
              <g
                key={tgt}
                className="cursor-pointer"
                onClick={() => setSelectedNode(selectedNode === tgt ? null : tgt)}
              >
                <rect
                  x={col3X - 50}
                  y={y - 14}
                  width={100}
                  height={28}
                  rx={6}
                  fill={isSelected ? "#4f46e5" : "#f1f5f9"}
                  stroke={isSelected ? "#4338ca" : "#cbd5e1"}
                  strokeWidth={1.5}
                  className="shadow-2xs transition-colors"
                />
                <text
                  x={col3X}
                  y={y + 3.5}
                  textAnchor="middle"
                  className={`text-[10px] font-bold ${isSelected ? "fill-white" : "fill-slate-800"}`}
                >
                  {tgt.length > 13 ? `${tgt.slice(0, 11)}…` : tgt}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hovered Ribbon Info Pill */}
        {hoveredRibbon ? (
          <div className="absolute bottom-3 left-4 right-4 bg-slate-900/95 text-white p-2.5 rounded-xl shadow-xl text-xs flex items-center justify-between backdrop-blur border border-slate-700">
            <div className="flex items-center gap-2">
              <span className="font-bold text-blue-400">{hoveredRibbon.sourceName}</span>
              <span className="text-slate-400">➔ routed through</span>
              <span className="font-bold text-amber-300">{hoveredRibbon.clusterName}</span>
              <span className="text-slate-400">➔ unlocks</span>
              <span className="font-bold text-indigo-400">{hoveredRibbon.targetName}</span>
            </div>
            <div className="font-mono font-bold text-emerald-400">
              Synergy Lift: {hoveredRibbon.lift.toFixed(2)}x
            </div>
          </div>
        ) : (
          <div className="text-[11px] text-slate-400 text-center pt-2">
            Hover over any ribbon or click any node box to trace cross-cluster causality flow
          </div>
        )}
      </div>
    </div>
  );
}
