"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Zap,
  TrendingUp,
  Package,
  Layers,
  ChevronRight,
  HelpCircle,
  Copy,
  CheckCircle2,
} from "lucide-react";

interface CopilotMessage {
  id: string;
  sender: "user" | "copilot";
  text: string;
  bullets?: string[];
  metrics?: { label: string; value: string }[];
  timestamp: string;
}

export function InsightCopilot({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { result, datasetName, config } = useAppStore();
  const [inputQuery, setInputQuery] = useState("");
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: "init",
      sender: "copilot",
      text: `Hello! I am your Category Mining AI Copilot. I've analyzed "${datasetName}" across ${result?.clustering.clusters.length || 4} customer cohorts and mined ${result?.globalRules.length || 0} association rules. What would you like to uncover?`,
      timestamp: "Just now",
    },
  ]);

  if (!isOpen || !result) return null;

  const clusters = result.clustering.clusters;
  const globalRules = result.globalRules;
  const comparisons = result.crossClusterComparisons;

  const quickPrompts = [
    "What are the top 3 high-impact bundles to launch?",
    "Which cluster generates the highest customer value?",
    "Identify niche rules that only work for a single cohort.",
    "How can we increase average basket size by 15%?",
  ];

  const handleSendPrompt = (query: string) => {
    if (!query.trim()) return;

    const userMsg: CopilotMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: "Just now",
    };

    // Synthesize explainable answer based on active pipeline data
    let copilotAnswer: CopilotMessage;
    const qLower = query.toLowerCase();

    if (qLower.includes("bundle") || qLower.includes("package") || qLower.includes("launch")) {
      const top3 = globalRules.slice(0, 3);
      copilotAnswer = {
        id: `c-${Date.now()}`,
        sender: "copilot",
        text: `Based on your frequent itemset mining, here are the top 3 statistical category bundles with peak lift:`,
        bullets: top3.map(
          (r, i) =>
            `#${i + 1} [${r.antecedent.join(" + ")}] with [${r.consequent.join(" + ")}] • Lift: ${r.lift.toFixed(
              2
            )}x • Conf: ${(r.confidence * 100).toFixed(1)}%`
        ),
        metrics: [
          { label: "Top Rule Lift", value: `${top3[0]?.lift.toFixed(2)}x` },
          { label: "Catalog Attachment", value: `+${((top3[0]?.confidence || 0.3) * 100).toFixed(0)}%` },
        ],
        timestamp: "Just now",
      };
    } else if (qLower.includes("cluster") || qLower.includes("cohort") || qLower.includes("value") || qLower.includes("spend")) {
      const highestSpendCluster = [...clusters].sort((a, b) => b.avgCustomerSpend - a.avgCustomerSpend)[0];
      copilotAnswer = {
        id: `c-${Date.now()}`,
        sender: "copilot",
        text: `Segment Analysis: "${highestSpendCluster.archetype}" (Cluster #${highestSpendCluster.clusterId + 1}) is your highest-value cohort.`,
        bullets: [
          `Average spend per customer: ${formatCurrency(highestSpendCluster.avgCustomerSpend)}`,
          `Average basket depth: ${highestSpendCluster.avgBasketSize.toFixed(1)} items/tx`,
          `Primary category affinity: ${highestSpendCluster.topCategories[0]?.category} (${highestSpendCluster.topCategories[0]?.share}% wallet share)`,
          `Core demographic: ${highestSpendCluster.dominantAgeGroup} in ${highestSpendCluster.dominantRegion}`,
        ],
        metrics: [
          { label: "Cohort Revenue", value: formatCurrency(highestSpendCluster.totalSpend) },
          { label: "Customer Share", value: `${highestSpendCluster.percentage}%` },
        ],
        timestamp: "Just now",
      };
    } else if (qLower.includes("niche") || qLower.includes("specific") || qLower.includes("single")) {
      const nicheRules = comparisons.filter((c) => c.type === "cluster_specific").slice(0, 3);
      copilotAnswer = {
        id: `c-${Date.now()}`,
        sender: "copilot",
        text: `Cross-cluster differential analysis identified ${nicheRules.length} niche rules that are highly effective ONLY in specific segments:`,
        bullets: nicheRules.map(
          (nr) =>
            `Target "${nr.dominantClusterName}": [${nr.antecedent.join(" & ")}] ➔ [${nr.consequent.join(
              " & "
            )}] (Lift: ${nr.maxLift.toFixed(2)}x vs global: ${nr.globalLift.toFixed(2)}x)`
        ),
        timestamp: "Just now",
      };
    } else {
      copilotAnswer = {
        id: `c-${Date.now()}`,
        sender: "copilot",
        text: `Merchandising Strategy Insight for ${datasetName}:`,
        bullets: [
          `Active clustering partitioned your ${result.datasetMetadata.uniqueCustomers} customers into ${clusters.length} segments with a Silhouette score of ${result.clustering.silhouetteScore.toFixed(3)}.`,
          `Mined ${globalRules.length} rules with minimum lift of ${config.minLift}x.`,
          `Applying targeted bundles at cart checkout is projected to generate over +20% higher attachment rates compared to untargeted banners.`,
        ],
        timestamp: "Just now",
      };
    }

    setMessages((prev) => [...prev, userMsg, copilotAnswer]);
    setInputQuery("");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Copilot Drawer */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 shadow-2xl z-10 flex flex-col h-full border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-50/70 to-indigo-50/40 dark:from-slate-900 dark:to-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm ring-1 ring-blue-500/20">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <span>Mining AI Copilot</span>
                <span className="text-[9px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-1.5 py-0.2 rounded uppercase">
                  Active
                </span>
              </h2>
              <p className="text-[11px] text-slate-500">Natural Language Category Analyst</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Conversation Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.sender === "copilot" && (
                <div className="h-7 w-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 space-y-2 leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white font-medium"
                    : "bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-2xs"
                }`}
              >
                <p>{msg.text}</p>

                {msg.bullets && (
                  <ul className="space-y-1.5 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                    {msg.bullets.map((b, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                        <ChevronRight className="h-3 w-3 text-blue-500 shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {msg.metrics && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                    {msg.metrics.map((m, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-center">
                        <div className="text-[10px] text-slate-400 uppercase font-mono">{m.label}</div>
                        <div className="text-sm font-bold text-blue-600 font-mono mt-0.5">{m.value}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Suggested Quick Prompts */}
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-wrap gap-1.5">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSendPrompt(qp)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600 transition-colors shadow-2xs text-left"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask Copilot about rules, lift, or clusters..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendPrompt(inputQuery)}
            className="flex-1 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => handleSendPrompt(inputQuery)}
            className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-2xs cursor-pointer"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
