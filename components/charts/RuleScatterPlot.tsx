"use client";

import React, { useState } from "react";
import { AssociationRule } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from "recharts";

interface RuleScatterPlotProps {
  rules: AssociationRule[];
}

export function RuleScatterPlot({ rules }: RuleScatterPlotProps) {
  const { setSelectedRuleForDrawer, config } = useAppStore();
  const [hoveredRule, setHoveredRule] = useState<any | null>(null);

  const data = rules.map((r) => ({
    x: Math.round(r.support * 1000) / 10, // support in %
    y: Math.round(r.confidence * 1000) / 10, // confidence in %
    z: r.lift,
    rule: r,
    label: `${r.antecedent.join("+")} ➔ ${r.consequent.join("+")}`,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const pt = payload[0].payload;
      const r: AssociationRule = pt.rule;
      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 backdrop-blur border border-slate-700 min-w-[200px]">
          <div className="font-bold text-blue-300">
            {r.antecedent.join(" & ")} ➔ {r.consequent.join(" & ")}
          </div>
          <div className="text-slate-300 text-[11px] space-y-0.5">
            <div>
              Lift: <strong className="text-emerald-400 font-mono">{r.lift.toFixed(2)}x</strong>
            </div>
            <div>
              Confidence: <strong className="text-white font-mono">{(r.confidence * 100).toFixed(1)}%</strong>
            </div>
            <div>
              Support: <strong className="text-white font-mono">{(r.support * 100).toFixed(1)}%</strong>
            </div>
            <div className="text-[10px] text-slate-400">Cohort: {r.clusterName}</div>
          </div>
          <div className="text-[9px] text-blue-300 pt-1 border-t border-slate-800">
            💡 Click point to open Deep Inspector Drawer
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full flex flex-col space-y-2">
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 15, right: 20, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3,3" stroke="#e2e8f0" />
            <XAxis
              type="number"
              dataKey="x"
              name="Support"
              unit="%"
              tick={{ fontSize: 10, fill: "#64748b" }}
              label={{
                value: "Rule Support (Frequency in Catalog %)",
                position: "insideBottom",
                offset: -10,
                fontSize: 11,
                fill: "#64748b",
                fontWeight: 600,
              }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Confidence"
              unit="%"
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: "#64748b" }}
              label={{
                value: "Confidence (Conditional Probability %)",
                angle: -90,
                position: "insideLeft",
                fontSize: 11,
                fill: "#64748b",
                fontWeight: 600,
              }}
            />
            <ZAxis type="number" dataKey="z" range={[50, 400]} name="Lift" />
            <ReferenceLine
              y={config.minConfidence * 100}
              stroke="#ef4444"
              strokeDasharray="4,4"
              label={{
                value: `Min Conf (${(config.minConfidence * 100).toFixed(0)}%)`,
                position: "right",
                fill: "#ef4444",
                fontSize: 9,
              }}
            />
            <ReferenceLine
              x={config.minSupport * 100}
              stroke="#ef4444"
              strokeDasharray="4,4"
              label={{
                value: `Min Supp (${(config.minSupport * 100).toFixed(0)}%)`,
                position: "top",
                fill: "#ef4444",
                fontSize: 9,
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Scatter
              data={data}
              fill="#2563eb"
              fillOpacity={0.7}
              stroke="#1d4ed8"
              strokeWidth={1.5}
              onClick={(pt: any) => pt?.rule && setSelectedRuleForDrawer(pt.rule)}
              cursor="pointer"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 px-2">
        <span>Bubble area is scaled proportional to Rule Lift (larger = stronger synergy)</span>
        <span>Red dashed lines indicate your active algorithmic pruning thresholds</span>
      </div>
    </div>
  );
}
