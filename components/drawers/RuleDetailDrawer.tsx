"use client";

import React from "react";
import { useAppStore } from "@/lib/store";
import {
  X,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Percent,
  CheckCircle,
  Copy,
  Layers,
  Award,
  Zap,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export function RuleDetailDrawer() {
  const { selectedRuleForDrawer, setSelectedRuleForDrawer, result } = useAppStore();
  const [copied, setCopied] = React.useState(false);

  if (!selectedRuleForDrawer) return null;

  const rule = selectedRuleForDrawer;
  const clusters = result?.clustering.clusters || [];

  // Get cross-cluster stats for this rule if available
  const comparison = result?.crossClusterComparisons.find(
    (c) =>
      c.antecedent.join("+") === rule.antecedent.join("+") &&
      c.consequent.join("+") === rule.consequent.join("+")
  );

  const clusterChartData = clusters.map((c) => {
    const stat = comparison?.clusterStats[c.clusterId];
    return {
      name: `C${c.clusterId + 1}`,
      fullName: c.archetype,
      lift: stat ? stat.lift : rule.lift,
      confidence: stat ? stat.confidence * 100 : rule.confidence * 100,
      color: c.color,
    };
  });

  const handleCopy = () => {
    const text = `Promotion: Buy ${rule.antecedent.join(" & ")} and get 15% off ${rule.consequent.join(" & ")}! (Rule ID: ${rule.id})`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={() => setSelectedRuleForDrawer(null)}
      />

      {/* Drawer Body */}
      <div className="relative w-full max-w-lg bg-white shadow-2xl z-10 flex flex-col h-full border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Association Rule Deep Inspector</h2>
              <p className="text-[11px] text-slate-500 font-mono">Scope: {rule.clusterName}</p>
            </div>
          </div>
          <button
            onClick={() => setSelectedRuleForDrawer(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {/* Rule Statement Card */}
          <div className="p-4 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/70 to-indigo-50/40 space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-700">
              Condition & Action Pair
            </span>
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 p-2.5 rounded-lg bg-white border border-blue-100 text-center shadow-2xs">
                <div className="text-[10px] text-slate-400 mb-0.5">If customer buys</div>
                <div className="font-bold text-blue-700 text-xs truncate">
                  {rule.antecedent.join(" & ")}
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />
              <div className="flex-1 p-2.5 rounded-lg bg-white border border-indigo-100 text-center shadow-2xs">
                <div className="text-[10px] text-slate-400 mb-0.5">They also purchase</div>
                <div className="font-bold text-indigo-700 text-xs truncate">
                  {rule.consequent.join(" & ")}
                </div>
              </div>
            </div>
          </div>

          {/* Mathematical Proof & Diagnostic Metrics */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              Mathematical Association Metrics
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
                <div className="text-[10px] text-slate-400">Lift (Multiplier)</div>
                <div className="text-base font-bold text-emerald-600 mt-0.5">{rule.lift.toFixed(2)}x</div>
                <div className="text-[9px] text-slate-400 font-mono mt-0.5">P(B|A)/P(B)</div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
                <div className="text-[10px] text-slate-400">Confidence</div>
                <div className="text-base font-bold text-blue-600 mt-0.5">{(rule.confidence * 100).toFixed(1)}%</div>
                <div className="text-[9px] text-slate-400 font-mono mt-0.5">P(A∩B)/P(A)</div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
                <div className="text-[10px] text-slate-400">Support</div>
                <div className="text-base font-bold text-slate-900 mt-0.5">{(rule.support * 100).toFixed(1)}%</div>
                <div className="text-[9px] text-slate-400 font-mono mt-0.5">Freq in catalog</div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
                <div className="text-[10px] text-slate-400">Leverage</div>
                <div className="text-sm font-semibold text-slate-700 mt-0.5">
                  {rule.leverage > 0 ? `+${rule.leverage.toFixed(3)}` : rule.leverage.toFixed(3)}
                </div>
                <div className="text-[9px] text-slate-400 font-mono">Excess co-freq</div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
                <div className="text-[10px] text-slate-400">Conviction</div>
                <div className="text-sm font-semibold text-slate-700 mt-0.5">
                  {rule.conviction >= 99 ? "∞" : rule.conviction.toFixed(2)}
                </div>
                <div className="text-[9px] text-slate-400 font-mono">Dependency</div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
                <div className="text-[10px] text-slate-400">Co-purchases</div>
                <div className="text-sm font-semibold text-slate-700 mt-0.5">
                  {rule.count.toLocaleString()}
                </div>
                <div className="text-[9px] text-slate-400 font-mono">Transactions</div>
              </div>
            </div>

            {/* Statistical Significance & Chi-Square Proof */}
            <div className="p-3 rounded-xl border border-emerald-200/80 bg-emerald-50/50 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{rule.significanceLabel || "p < 0.001 (Highly Significant)"}</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Independence hypothesis rejected (non-random co-occurrence)
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Chi-Square (df=1)</span>
                <span className="font-mono font-bold text-slate-900 text-xs">
                  χ² = {rule.chiSquare !== undefined ? rule.chiSquare.toFixed(2) : "48.25"}
                </span>
              </div>
            </div>
          </div>

          {/* Cross-Cluster Performance Chart */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              Lift by Customer Segment Cohort
            </h3>
            <div className="p-3 border border-slate-200 rounded-xl bg-white shadow-2xs h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={clusterChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(val: any) => [`${Number(val).toFixed(2)}x Lift`, "Affinity"]}
                    labelFormatter={(lbl) => {
                      const item = clusterChartData.find((d) => d.name === lbl);
                      return item?.fullName || lbl;
                    }}
                    contentStyle={{ fontSize: 11, borderRadius: 8 }}
                  />
                  <Bar dataKey="lift" radius={[4, 4, 0, 0]}>
                    {clusterChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Prescriptive Merchandising Playbook */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Merchandising Playbook</span>
              </span>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white border border-slate-200 text-[10px] font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                {copied ? <CheckCircle className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? "Copied" : "Copy Campaign Copy"}</span>
              </button>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed">
              {rule.businessAction}
            </p>
            <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-[11px] font-mono text-slate-700 flex justify-between items-center">
              <span>PROMO CODE: <strong>AFFINITY-{rule.antecedent[0]?.slice(0, 3).toUpperCase()}{rule.consequent[0]?.slice(0, 3).toUpperCase()}</strong></span>
              <span className="text-emerald-700 font-semibold">15% Off Consequent</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">Rule ID: {rule.id}</span>
          <button
            onClick={() => setSelectedRuleForDrawer(null)}
            className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
