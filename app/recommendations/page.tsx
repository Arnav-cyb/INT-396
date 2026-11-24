"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAppStore } from "@/lib/store";
import {
  UserPreferences,
  ScoringWeights,
  DEFAULT_SCORING_WEIGHTS,
  generateNewUserRecommendations,
  RecommendationEngineOutput,
  RecommendedItem,
} from "@/lib/recommendations";
import { PreferenceBuilder } from "@/components/recommendations/PreferenceBuilder";
import { RecommendationCard } from "@/components/recommendations/RecommendationCard";
import { RecommendationPipelineVisualizer } from "@/components/recommendations/RecommendationPipelineVisualizer";
import {
  Sparkles,
  ShoppingBag,
  Download,
  Filter,
  Search,
  SlidersHorizontal,
  Layers,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Tag,
  ArrowUpDown,
  FileSpreadsheet,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function RecommendationsPage() {
  const { result, rawTransactions, datasetName, isLoading: isPipelineLoading } = useAppStore();

  const [preferences, setPreferences] = useState<UserPreferences>({
    categories: [],
    targetSegmentId: "auto",
  });

  const [weights, setWeights] = useState<ScoringWeights>(DEFAULT_SCORING_WEIGHTS);
  const [isEngineRunning, setIsEngineRunning] = useState<boolean>(false);
  const [output, setOutput] = useState<RecommendationEngineOutput | null>(null);

  // Filters & Sorting for Results
  const [matchTypeFilter, setMatchTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"score" | "price_asc" | "price_desc" | "popularity" | "lift">("score");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = useMemo(() => {
    if (result?.datasetMetadata.categories && result.datasetMetadata.categories.length > 0) {
      return result.datasetMetadata.categories;
    }
    const catSet = new Set<string>();
    for (const tx of rawTransactions) {
      if (tx.product_category) catSet.add(tx.product_category);
    }
    return Array.from(catSet).sort();
  }, [result, rawTransactions]);

  const clusters = useMemo(() => {
    return result?.clustering.clusters || [];
  }, [result]);

  // Execute recommendation computation
  const runEngine = (prefs = preferences, w = weights) => {
    setIsEngineRunning(true);
    // Simulate slight async for UI responsiveness & animations
    setTimeout(() => {
      try {
        const out = generateNewUserRecommendations(prefs, rawTransactions, result, {
          limit: 12,
          weights: w,
        });
        setOutput(out);
      } catch (err) {
        console.error("Error generating recommendations:", err);
      } finally {
        setIsEngineRunning(false);
      }
    }, 120);
  };

  // Run on initial load and when result/transactions update
  useEffect(() => {
    if (rawTransactions && rawTransactions.length > 0) {
      // Pick first 2 categories as friendly default if not yet set
      if (preferences.categories.length === 0 && categories.length > 0) {
        const defaultCats = categories.slice(0, 2);
        const initialPrefs = { ...preferences, categories: defaultCats };
        setPreferences(initialPrefs);
        runEngine(initialPrefs, weights);
      } else {
        runEngine(preferences, weights);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawTransactions, result]);

  const handleReset = () => {
    const freshPrefs: UserPreferences = {
      categories: [],
      maxBudget: undefined,
      minBudget: undefined,
      ageGroup: undefined,
      region: undefined,
      targetSegmentId: "auto",
    };
    setPreferences(freshPrefs);
    setWeights(DEFAULT_SCORING_WEIGHTS);
    runEngine(freshPrefs, DEFAULT_SCORING_WEIGHTS);
  };

  // Filtered and sorted recommendations
  const filteredRecommendations = useMemo(() => {
    if (!output) return [];

    let list = output.recommendations.filter((item) => {
      const matchType =
        matchTypeFilter === "all" || item.matchType === matchTypeFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q);
      return matchType && matchSearch;
    });

    list = [...list].sort((a, b) => {
      if (sortBy === "score") return b.score - a.score;
      if (sortBy === "price_asc") return (a.price || 0) - (b.price || 0);
      if (sortBy === "price_desc") return (b.price || 0) - (a.price || 0);
      if (sortBy === "popularity") return b.segmentPopularity - a.segmentPopularity;
      if (sortBy === "lift") return (b.ruleLift || 0) - (a.ruleLift || 0);
      return 0;
    });

    return list;
  }, [output, matchTypeFilter, sortBy, searchQuery]);

  // CSV Export Handler
  const handleExportCSV = () => {
    if (!output || output.recommendations.length === 0) return;

    const headers = [
      "rank",
      "item_id",
      "item_name",
      "category",
      "unit_price",
      "match_type",
      "recommendation_score",
      "matched_segment",
      "rule_lift",
      "rule_confidence",
      "associated_categories",
      "explanation_reason",
    ];

    const rows = output.recommendations.map((r) => [
      r.rank,
      `"${r.id}"`,
      `"${r.name.replace(/"/g, '""')}"`,
      `"${r.category}"`,
      r.price !== undefined ? r.price.toFixed(2) : "N/A",
      `"${r.matchType}"`,
      r.score,
      `"${r.matchedSegmentName || "Global"}"`,
      r.ruleLift !== undefined ? r.ruleLift.toFixed(2) : "N/A",
      r.ruleConfidence !== undefined ? (r.ruleConfidence * 100).toFixed(1) + "%" : "N/A",
      `"${r.associatedCategories.join("; ")}"`,
      `"${r.reason.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `new_user_recommendations_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Title & Metadata Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <Sparkles className="h-3 w-3" />
              <span>Cold-Start Engine</span>
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Active Dataset: <strong className="text-slate-800 dark:text-slate-200">{datasetName}</strong>
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            First-Time Shopper Product Recommendations
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Personalized product and category discovery for new users with zero prior transactions, driven by K-Means clustering and FP-Growth association rules.
          </p>
        </div>

        {output && output.recommendations.length > 0 && (
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-2xs transition-all self-start sm:self-auto"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
        )}
      </div>

      {/* Preference Builder Component */}
      <PreferenceBuilder
        categories={categories}
        clusters={clusters}
        availablePriceRange={output?.availablePriceRange}
        hasValidPrices={output?.hasValidPrices ?? true}
        preferences={preferences}
        weights={weights}
        isLoading={isEngineRunning || isPipelineLoading}
        onPreferencesChange={(p) => setPreferences(p)}
        onWeightsChange={(w) => setWeights(w)}
        onGenerate={() => runEngine(preferences, weights)}
        onReset={handleReset}
      />

      {/* Recommendation Pipeline & Explainability Engine */}
      {output && (
        <RecommendationPipelineVisualizer
          preferences={preferences}
          matchedSegments={output.matchedSegments}
          primarySegment={output.primarySegment}
          activeRules={output.activeRules}
          totalEvaluated={output.totalCandidatesEvaluated}
          totalReturned={output.recommendations.length}
        />
      )}

      {/* Fallback Notice Banner (if triggered) */}
      {output?.fallbackApplied && output.fallbackReason && (
        <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30 flex items-start gap-3">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <div className="text-xs text-amber-900 dark:text-amber-200 space-y-0.5">
            <span className="font-bold">Cold-Start Fallback Applied:</span>
            <p className="text-amber-800/90 dark:text-amber-300/90">{output.fallbackReason}</p>
          </div>
        </div>
      )}

      {/* Recommendations Results Section */}
      <div className="space-y-4">
        {/* Results Filter & Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mr-1">
              Filter:
            </span>
            {[
              { id: "all", label: "All Items" },
              { id: "direct_preference", label: "Direct Preferences" },
              { id: "association_cross_sell", label: "Cross-Sell Synergies" },
              { id: "segment_top_pick", label: "Segment Top-Picks" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setMatchTypeFilter(tab.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                  matchTypeFilter === tab.id
                    ? "bg-blue-600 text-white font-semibold shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search results..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 w-36 sm:w-44"
              />
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-medium"
              >
                <option value="score">Sort by Recommendation Score</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="popularity">Segment Order Frequency</option>
                <option value="lift">Association Rule Lift</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        {filteredRecommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecommendations.map((item) => (
              <RecommendationCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              No matching recommendations found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              The currently applied budget constraints, category filters, or search terms are too restrictive.
              Try clearing budget caps or selecting additional categories.
            </p>
            <button
              onClick={handleReset}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
