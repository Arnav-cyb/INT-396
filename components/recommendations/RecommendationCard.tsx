"use client";

import React, { useState } from "react";
import { RecommendedItem } from "@/lib/recommendations";
import { formatCurrency } from "@/lib/utils";
import {
  Sparkles,
  Tag,
  Users2,
  GitBranch,
  TrendingUp,
  CheckCircle,
  Copy,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";

interface RecommendationCardProps {
  item: RecommendedItem;
  onSelectCategory?: (category: string) => void;
  onSelectRule?: (ruleId: string) => void;
}

export function RecommendationCard({
  item,
  onSelectCategory,
  onSelectRule,
}: RecommendationCardProps) {
  const [showFactors, setShowFactors] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(item.id);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800";
    if (score >= 70) return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800";
    if (score >= 50) return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800";
    return "text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700";
  };

  const getMatchTypeBadge = (type: RecommendedItem["matchType"]) => {
    switch (type) {
      case "direct_preference":
        return {
          label: "Direct Preference",
          className: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
          icon: Tag,
        };
      case "association_cross_sell":
        return {
          label: "Cross-Sell Synergy",
          className: "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
          icon: GitBranch,
        };
      case "segment_top_pick":
        return {
          label: "Segment Top-Pick",
          className: "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
          icon: Users2,
        };
      case "catalog_popular":
      default:
        return {
          label: "Catalog Top-Performer",
          className: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
          icon: TrendingUp,
        };
    }
  };

  const matchBadge = getMatchTypeBadge(item.matchType);
  const MatchIcon = matchBadge.icon;

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group">
      {/* Top Banner with Rank & Score */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold font-mono flex items-center justify-center shadow-xs">
              #{item.rank}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${matchBadge.className}`}
            >
              <MatchIcon className="h-3 w-3" />
              <span>{matchBadge.label}</span>
            </span>
          </div>

          <div
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border text-xs font-extrabold font-mono shadow-2xs ${getScoreColor(
              item.score
            )}`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{item.score} / 100</span>
          </div>
        </div>

        {/* Item Title & Price */}
        <div className="mt-3.5">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {item.name}
            </h3>
            {item.price !== undefined && (
              <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400 shrink-0">
                {formatCurrency(item.price)}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              <Tag className="h-3 w-3" />
              <span>{item.category}</span>
            </span>

            {item.id !== item.category && (
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 bg-slate-50 dark:bg-slate-950 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 transition-colors"
                title="Click to copy SKU ID"
              >
                {isCopied ? <CheckCircle className="h-2.5 w-2.5 text-emerald-500" /> : <Copy className="h-2.5 w-2.5" />}
                <span>{item.id}</span>
              </button>
            )}

            {item.matchedSegmentName && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200/50 dark:border-blue-800">
                <Users2 className="h-3 w-3 text-blue-500" />
                <span>{item.matchedSegmentName}</span>
              </span>
            )}
          </div>
        </div>

        {/* Association Rule Metrics (if cross-sell) */}
        {item.ruleLift && item.ruleLift > 1 && (
          <div className="mt-3 p-2.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/60 text-xs">
            <div className="flex items-center justify-between text-purple-900 dark:text-purple-200 font-semibold mb-1">
              <div className="flex items-center gap-1.5">
                <GitBranch className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                <span>FP-Growth Association Synergy</span>
              </div>
              <span className="font-mono text-purple-700 dark:text-purple-300">
                Lift: {item.ruleLift.toFixed(2)}x
              </span>
            </div>
            <p className="text-[11px] text-purple-800/80 dark:text-purple-300/80 leading-relaxed">
              Triggered by preference in{" "}
              <strong className="text-purple-900 dark:text-purple-100">
                {item.associatedCategories.join(", ") || "catalog"}
              </strong>
              {item.ruleConfidence ? ` (${Math.round(item.ruleConfidence * 100)}% co-purchase rate)` : ""}
            </p>
          </div>
        )}

        {/* Human-Readable Explanation */}
        <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>{item.reason}</p>
        </div>
      </div>

      {/* Factor Breakdown Accordion */}
      <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30">
        <button
          onClick={() => setShowFactors(!showFactors)}
          className="flex items-center justify-between w-full text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
            <span>Score Factor Breakdown ({item.factors.length} signals)</span>
          </span>
          {showFactors ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {showFactors && (
          <div className="mt-3 space-y-2 text-xs animate-in fade-in-50 duration-150">
            {item.factors.map((factor) => (
              <div key={factor.name} className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">
                    {factor.name}
                  </span>
                  <span className="font-mono text-slate-900 dark:text-slate-100 font-semibold">
                    +{factor.contribution.toFixed(1)} pts
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, factor.score * 100)}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
                  {factor.description}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
