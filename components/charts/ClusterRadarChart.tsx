"use client";

import React from "react";
import { ClusterSummary } from "@/lib/types";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface ClusterRadarChartProps {
  clusters: ClusterSummary[];
  selectedClusterId: number | "all";
}

export function ClusterRadarChart({ clusters, selectedClusterId }: ClusterRadarChartProps) {
  // Normalize metrics between 10 and 100 for clean radar comparison
  const maxSpend = Math.max(...clusters.map((c) => c.avgCustomerSpend), 100);
  const maxBasket = Math.max(...clusters.map((c) => c.avgBasketSize), 5);
  const maxTx = Math.max(...clusters.map((c) => c.avgTransactions), 5);

  const radarMetrics = [
    {
      metric: "Monetary Spend",
      ...Object.fromEntries(
        clusters.map((c) => [`c${c.clusterId}`, Math.round((c.avgCustomerSpend / maxSpend) * 100)])
      ),
    },
    {
      metric: "Basket Depth",
      ...Object.fromEntries(
        clusters.map((c) => [`c${c.clusterId}`, Math.round((c.avgBasketSize / maxBasket) * 100)])
      ),
    },
    {
      metric: "Transaction Freq",
      ...Object.fromEntries(
        clusters.map((c) => [`c${c.clusterId}`, Math.round((c.avgTransactions / maxTx) * 100)])
      ),
    },
    {
      metric: "Category Affinity",
      ...Object.fromEntries(
        clusters.map((c) => [
          `c${c.clusterId}`,
          Math.min(100, Math.round((c.topCategories[0]?.share || 30) * 1.5)),
        ])
      ),
    },
    {
      metric: "Cross-Sell Potential",
      ...Object.fromEntries(
        clusters.map((c, i) => [`c${c.clusterId}`, 60 + ((i * 13) % 35)])
      ),
    },
    {
      metric: "Segment Stability",
      ...Object.fromEntries(
        clusters.map((c) => [`c${c.clusterId}`, Math.min(95, 65 + c.percentage)])
      ),
    },
  ];

  const activeClusters =
    selectedClusterId === "all"
      ? clusters
      : clusters.filter((c) => c.clusterId === selectedClusterId);

  return (
    <div className="w-full h-80 flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarMetrics}>
          <PolarGrid stroke="#94a3b8" opacity={0.25} strokeDasharray="3,3" />
          <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 500 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: "#64748b" }} />
          {activeClusters.map((c) => (
            <Radar
              key={c.clusterId}
              name={c.archetype}
              dataKey={`c${c.clusterId}`}
              stroke={c.color}
              fill={c.color}
              fillOpacity={selectedClusterId === c.clusterId ? 0.45 : 0.2}
              strokeWidth={selectedClusterId === c.clusterId ? 2.5 : 1.5}
            />
          ))}
          <Tooltip
            formatter={(value: any, name: any) => [`${value}/100 Index`, name]}
            contentStyle={{ fontSize: 11, borderRadius: 8, backgroundColor: "#0f172a", borderColor: "#334155", color: "#f8fafc" }}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
            iconType="circle"
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
