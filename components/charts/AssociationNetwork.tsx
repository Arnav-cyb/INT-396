"use client";

import React, { useState, useMemo } from "react";
import { AssociationRule } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { Search, Zap, Filter, Sparkles, Layers, Sliders } from "lucide-react";

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
  color: string;
  connections: number;
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
  "#2563eb", // blue-600
  "#7c3aed", // violet-600
  "#059669", // emerald-600
  "#d97706", // amber-600
  "#db2777", // pink-600
  "#0891b2", // cyan-600
  "#4f46e5", // indigo-600
  "#14b8a6", // teal-600
  "#ea580c", // orange-600
  "#65a30d", // lime-600
];

export function AssociationNetwork({
  categories,
  rules,
  selectedClusterName = "All Clusters",
}: AssociationNetworkProps) {
  const { setSelectedRuleForDrawer } = useAppStore();
  const [minLift, setMinLift] = useState<number>(1.2);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<Edge | null>(null);
  const [categorySearch, setCategorySearch] = useState<string>("");

  const width = 720;
  const height = 500;
  const centerX = width / 2;
  const centerY = height / 2;
  const layoutRadius = 195;

  // Process Edges from rules
  const edges: Edge[] = useMemo(() => {
    const edgeList: Edge[] = [];
    const seen = new Set<string>();

    for (const rule of rules) {
      if (rule.lift >= minLift && rule.antecedent.length === 1 && rule.consequent.length === 1) {
        const src = rule.antecedent[0];
        const tgt = rule.consequent[0];
        const key = `${src}==>${tgt}`;

        if (!seen.has(key)) {
          seen.add(key);
          edgeList.push({
            source: src,
            target: tgt,
            lift: rule.lift,
            confidence: rule.confidence,
            support: rule.support,
            ruleObj: rule,
          });
        }
      }
    }
    return edgeList;
  }, [rules, minLift]);

  // Build Nodes arranged radially with adaptive spacing
  const nodes: Node[] = useMemo(() => {
    const total = categories.length || 1;
    return categories.map((cat, idx) => {
      const angle = (idx / total) * 2 * Math.PI - Math.PI / 2;
      const x = centerX + layoutRadius * Math.cos(angle);
      const y = centerY + layoutRadius * Math.sin(angle);

      // Count connections
      const conns = edges.filter((e) => e.source === cat || e.target === cat).length;
      const radius = Math.min(32, Math.max(18, 18 + conns * 2.2));

      return {
        id: cat,
        name: cat,
        x,
        y,
        radius,
        color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
        connections: conns,
      };
    });
  }, [categories, edges, centerX, centerY]);

  const nodeMap = useMemo(() => {
    const map = new Map<string, Node>();
    nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [nodes]);

  const maxLift = useMemo(() => {
    return edges.reduce((max, e) => Math.max(max, e.lift), 1.5);
  }, [edges]);

  return (
    <div className="flex flex-col space-y-3">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/80 p-3 rounded-xl border border-slate-200">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Sliders className="h-3.5 w-3.5 text-blue-600" />
            <span className="text-xs font-semibold text-slate-700">Min Lift Filter:</span>
            <input
              type="range"
              min="1.0"
              max="3.0"
              step="0.05"
              value={minLift}
              onChange={(e) => setMinLift(parseFloat(e.target.value))}
              className="w-28 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
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
              className="pl-8 pr-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 w-36 shadow-2xs"
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
              className="text-xs text-rose-600 hover:text-rose-700 underline font-medium"
            >
              Reset Isolation ({activeCategory})
            </button>
          )}
          <span className="text-xs text-slate-500">
            {edges.length} active directed ties ({selectedClusterName})
          </span>
        </div>
      </div>

      {/* Interactive SVG Network */}
      <div className="relative border border-slate-200 rounded-xl bg-white shadow-2xs overflow-hidden flex items-center justify-center p-3">
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
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#cbd5e1" />
            </marker>
          </defs>

          {/* Background concentric guidelines */}
          <circle
            cx={centerX}
            cy={centerY}
            r={layoutRadius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="1.5"
            strokeDasharray="4,4"
          />
          <circle
            cx={centerX}
            cy={centerY}
            r={layoutRadius * 0.65}
            fill="none"
            stroke="#f8fafc"
            strokeWidth="1"
          />

          {/* Center Brand Core */}
          <circle
            cx={centerX}
            cy={centerY}
            r={28}
            fill="#f8fafc"
            stroke="#e2e8f0"
            strokeWidth="1.5"
          />
          <text
            x={centerX}
            y={centerY + 3}
            textAnchor="middle"
            className="text-[9px] font-bold fill-slate-400 uppercase tracking-widest pointer-events-none"
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
              : "#e2e8f0";

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
                  stroke="#ffffff"
                  strokeWidth={2.5}
                  className="shadow-sm hover:scale-110 transition-transform"
                />

                {/* Node Label */}
                <text
                  x={node.x}
                  y={node.y + node.radius + 14}
                  textAnchor="middle"
                  className={`text-[11px] font-semibold transition-colors ${
                    isSelected ? "fill-blue-700 font-bold" : "fill-slate-700"
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

      <div className="text-[11px] text-slate-400 flex justify-between items-center px-1">
        <span>Arrows indicate purchase causality (Antecedent ➔ Consequent)</span>
        <span>Click any node to isolate bonds • Click any link to open Deep Inspector</span>
      </div>
    </div>
  );
}
