"use client";

import React, { useState, useMemo } from "react";
import { AssociationRule } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { Search, Sliders, Maximize2, RotateCcw } from "lucide-react";

interface AssociationNetworkProps {
  categories: string[];
  rules: AssociationRule[];
  selectedClusterName?: string;
}

interface Node {
  id: string;
  name: string;
  x: number;
  y: number;
  radius: number;
  connections: number;
  color: string;
}

interface Edge {
  source: string;
  target: string;
  lift: number;
  confidence: number;
  support: number;
  ruleObj?: AssociationRule;
}

const CATEGORY_COLORS = [
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ef4444", // Rose
  "#06b6d4", // Cyan
  "#ec4899", // Pink
  "#6366f1", // Indigo
];

export function AssociationNetwork({
  categories,
  rules,
  selectedClusterName = "All Segments",
}: AssociationNetworkProps) {
  const { setSelectedRuleForDrawer } = useAppStore();
  const [minLift, setMinLift] = useState<number>(1.2);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<Edge | null>(null);
  const [categorySearch, setCategorySearch] = useState("");

  const width = 640;
  const height = 480;
  const centerX = width / 2;
  const centerY = height / 2;
  const layoutRadius = Math.min(centerX, centerY) - 75;

  // Compute connections per category and construct directed edges
  const { edges, nodeConnections } = useMemo(() => {
    const edgeList: Edge[] = [];
    const connMap = new Map<string, number>();

    rules.forEach((r) => {
      if (r.lift >= minLift) {
        r.antecedent.forEach((ant) => {
          r.consequent.forEach((cons) => {
            edgeList.push({
              source: ant,
              target: cons,
              lift: r.lift,
              confidence: r.confidence,
              support: r.support,
              ruleObj: r,
            });

            connMap.set(ant, (connMap.get(ant) || 0) + 1);
            connMap.set(cons, (connMap.get(cons) || 0) + 1);
          });
        });
      }
    });

    return { edges: edgeList, nodeConnections: connMap };
  }, [rules, minLift]);

  // Circular layout of nodes
  const nodes: Node[] = useMemo(() => {
    const total = categories.length || 1;
    const step = (2 * Math.PI) / total;

    return categories.map((cat, idx) => {
      const angle = idx * step - Math.PI / 2;
      const x = centerX + layoutRadius * Math.cos(angle);
      const y = centerY + layoutRadius * Math.sin(angle);
      const conns = nodeConnections.get(cat) || 0;
      const radius = Math.min(24, Math.max(12, 12 + conns * 1.5));

      return {
        id: cat,
        name: cat,
        x,
        y,
        radius,
        connections: conns,
        color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
      };
    });
  }, [categories, centerX, centerY, layoutRadius, nodeConnections]);

  const nodeMap = useMemo(() => {
    const map = new Map<string, Node>();
    nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [nodes]);

  const maxLift = Math.max(...edges.map((e) => e.lift), 3);

  return (
    <div className="flex flex-col space-y-3">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Min Lift Threshold:</span>
            <input
              type="range"
              min="1.0"
              max="3.5"
              step="0.05"
              value={minLift}
              onChange={(e) => setMinLift(parseFloat(e.target.value))}
              className="w-28 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <span className="text-xs font-mono font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
              {minLift.toFixed(2)}x
            </span>
          </div>

          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Find category..."
              value={categorySearch}
              onChange={(e) => {
                setCategorySearch(e.target.value);
                if (e.target.value) {
                  const match = categories.find((c) =>
                    c.toLowerCase().includes(e.target.value.toLowerCase())
                  );
                  setActiveCategory(match || null);
                } else {
                  setActiveCategory(null);
                }
              }}
              className="pl-8 pr-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 w-36 shadow-2xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeCategory && (
            <button
              onClick={() => {
                setActiveCategory(null);
                setCategorySearch("");
              }}
              className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 underline font-medium"
            >
              Reset Isolation ({activeCategory})
            </button>
          )}
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {edges.length} active directed ties ({selectedClusterName})
          </span>
        </div>
      </div>

      {/* Interactive SVG Network */}
      <div className="relative border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-2xs overflow-hidden flex items-center justify-center p-3">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto max-h-[520px] select-none"
        >
          {/* Arrowhead marker definition */}
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#3b82f6" />
            </marker>
            <marker
              id="arrow-muted"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#64748b" />
            </marker>
          </defs>

          {/* Background concentric guidelines */}
          <circle
            cx={centerX}
            cy={centerY}
            r={layoutRadius}
            fill="none"
            className="stroke-slate-100 dark:stroke-slate-800"
            strokeWidth="1.5"
            strokeDasharray="4,4"
          />
          <circle
            cx={centerX}
            cy={centerY}
            r={layoutRadius * 0.65}
            fill="none"
            className="stroke-slate-100/50 dark:stroke-slate-800/50"
            strokeWidth="1"
          />

          {/* Center Brand Core */}
          <circle
            cx={centerX}
            cy={centerY}
            r={28}
            className="fill-slate-50 dark:fill-slate-800 stroke-slate-200 dark:stroke-slate-700"
            strokeWidth="1.5"
          />
          <text
            x={centerX}
            y={centerY + 3}
            textAnchor="middle"
            className="text-[9px] font-bold fill-slate-400 dark:fill-slate-500 uppercase tracking-widest pointer-events-none"
          >
            Catalog
          </text>

          {/* Network Edges (Directed Arcs) */}
          {edges.map((edge, idx) => {
            const srcNode = nodeMap.get(edge.source);
            const tgtNode = nodeMap.get(edge.target);
            if (!srcNode || !tgtNode) return null;

            const isHighlighted =
              !activeCategory ||
              activeCategory === edge.source ||
              activeCategory === edge.target;

            const strokeWidth = Math.max(1.5, Math.min(5.5, (edge.lift / maxLift) * 5));
            const opacity = isHighlighted ? (activeCategory ? 0.95 : 0.65) : 0.08;
            const isHighLift = edge.lift >= 2.0;

            const strokeColor = isHighlighted
              ? isHighLift
                ? "#2563eb"
                : "#64748b"
              : "#475569";

            return (
              <g key={`edge-${idx}`}>
                <line
                  x1={srcNode.x}
                  y1={srcNode.y}
                  x2={tgtNode.x}
                  y2={tgtNode.y}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  opacity={opacity}
                  markerEnd={isHighlighted ? "url(#arrow)" : "url(#arrow-muted)"}
                  className="transition-all duration-150 cursor-pointer"
                  onMouseEnter={() => setHoveredEdge(edge)}
                  onMouseLeave={() => setHoveredEdge(null)}
                  onClick={() => edge.ruleObj && setSelectedRuleForDrawer(edge.ruleObj)}
                />
              </g>
            );
          })}

          {/* Network Nodes */}
          {nodes.map((node) => {
            const isSelected = activeCategory === node.id;
            const isConnected =
              !activeCategory ||
              edges.some(
                (e) =>
                  (e.source === activeCategory && e.target === node.id) ||
                  (e.target === activeCategory && e.source === node.id)
              );

            const opacity = isSelected || isConnected ? 1 : 0.25;

            return (
              <g
                key={node.id}
                className="cursor-pointer transition-transform duration-150"
                onClick={() => setActiveCategory(activeCategory === node.id ? null : node.id)}
              >
                {/* Outer Glow Ring on selected */}
                {isSelected && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.radius + 7}
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2.5"
                    strokeDasharray="4,4"
                    className="animate-spin-slow origin-center"
                  />
                )}

                {/* Node Circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.radius}
                  fill={node.color}
                  opacity={opacity}
                  className="stroke-white dark:stroke-slate-900 shadow-sm hover:scale-110 transition-transform"
                  strokeWidth={2.5}
                />

                {/* Node Label */}
                <text
                  x={node.x}
                  y={node.y + node.radius + 14}
                  textAnchor="middle"
                  className={`text-[11px] font-semibold transition-colors ${
                    isSelected ? "fill-blue-700 dark:fill-blue-400 font-bold" : "fill-slate-700 dark:fill-slate-300"
                  }`}
                  style={{ pointerEvents: "none" }}
                >
                  {node.name}
                </text>

                {/* Connection Badge Inside Node */}
                <text
                  x={node.x}
                  y={node.y + 3.5}
                  textAnchor="middle"
                  className="text-[10px] font-bold fill-white"
                  style={{ pointerEvents: "none" }}
                >
                  {node.connections}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hovered Edge Tooltip with Click to Inspect Hint */}
        {hoveredEdge && (
          <div className="absolute bottom-4 left-4 bg-slate-900/95 text-white p-3.5 rounded-xl shadow-xl text-xs space-y-1.5 backdrop-blur border border-slate-700 pointer-events-none">
            <div className="flex items-center gap-2">
              <span className="font-bold text-blue-300">{hoveredEdge.source}</span>
              <span className="text-slate-400">➔</span>
              <span className="font-bold text-indigo-300">{hoveredEdge.target}</span>
            </div>
            <div className="flex gap-4 text-slate-300 text-[11px]">
              <span>Lift: <strong className="text-emerald-400 font-mono">{hoveredEdge.lift.toFixed(2)}x</strong></span>
              <span>Confidence: <strong className="text-white font-mono">{(hoveredEdge.confidence * 100).toFixed(1)}%</strong></span>
              <span>Support: <strong className="text-white font-mono">{(hoveredEdge.support * 100).toFixed(1)}%</strong></span>
            </div>
            <div className="text-[10px] text-blue-300 pt-1 border-t border-slate-800">
              💡 Click edge to open Deep Inspector Drawer
            </div>
          </div>
        )}
      </div>

      <div className="text-[11px] text-slate-400 dark:text-slate-500 flex justify-between items-center px-1">
        <span>Arrows indicate purchase causality (Antecedent ➔ Consequent)</span>
        <span>Click any node to isolate bonds • Click any link to open Deep Inspector</span>
      </div>
    </div>
  );
}
