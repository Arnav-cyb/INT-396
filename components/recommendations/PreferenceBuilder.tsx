"use client";

import React, { useState } from "react";
import {
  UserPreferences,
  ScoringWeights,
  DEFAULT_SCORING_WEIGHTS,
} from "@/lib/recommendations";
import { ClusterSummary } from "@/lib/types";
import {
  Sparkles,
  RotateCcw,
  Sliders,
  DollarSign,
  Tag,
  UserCheck,
  Globe,
  Layers,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PreferenceBuilderProps {
  categories: string[];
  clusters: ClusterSummary[];
  availablePriceRange?: { min: number; max: number };
  hasValidPrices: boolean;
  preferences: UserPreferences;
  weights: ScoringWeights;
  isLoading: boolean;
  onPreferencesChange: (newPrefs: UserPreferences) => void;
  onWeightsChange: (newWeights: ScoringWeights) => void;
  onGenerate: () => void;
  onReset: () => void;
}

export function PreferenceBuilder({
  categories,
  clusters,
  availablePriceRange,
  hasValidPrices,
  preferences,
  weights,
  isLoading,
  onPreferencesChange,
  onWeightsChange,
  onGenerate,
  onReset,
}: PreferenceBuilderProps) {
  const [showAdvancedWeights, setShowAdvancedWeights] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");

  const selectedCategories = new Set(preferences.categories || []);

  const toggleCategory = (cat: string) => {
    const updated = new Set(selectedCategories);
    if (updated.has(cat)) {
      updated.delete(cat);
    } else {
      updated.add(cat);
    }
    onPreferencesChange({ ...preferences, categories: Array.from(updated) });
  };

  const handleSelectAllCategories = () => {
    onPreferencesChange({ ...preferences, categories: [...categories] });
  };

  const handleClearCategories = () => {
    onPreferencesChange({ ...preferences, categories: [] });
  };

  const filteredCategories = categories.filter((c) =>
    c.toLowerCase().includes(categorySearch.toLowerCase())
  );

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-blue-50/50 via-indigo-50/20 to-white dark:from-slate-800/40 dark:via-slate-900 dark:to-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shadow-blue-500/20">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Cold-Start Preference Profiler
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Define the first-time shopper&apos;s interests, budget constraints, and persona to match cluster patterns.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onReset}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
            <button
              onClick={onGenerate}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-600/20 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Get Recommendations</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Section 1: Product Categories */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                1. Product Categories of Interest ({selectedCategories.size} selected)
              </label>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={handleSelectAllCategories}
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Select All
              </button>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <button
                onClick={handleClearCategories}
                className="text-slate-500 dark:text-slate-400 hover:underline"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Search categories if large */}
          {categories.length > 6 && (
            <input
              type="text"
              placeholder="Search catalog categories..."
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          )}

          {/* Chips */}
          <div className="flex flex-wrap gap-2 pt-1">
            {filteredCategories.map((cat) => {
              const isSelected = selectedCategories.has(cat);
              return (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    isSelected
                      ? "bg-blue-50 dark:bg-blue-950/60 border-blue-400 dark:border-blue-600 text-blue-800 dark:text-blue-200 font-semibold shadow-xs"
                      : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isSelected ? "bg-blue-600 dark:bg-blue-400" : "bg-slate-300 dark:bg-slate-600"
                    }`}
                  />
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Budget Filter (Only if valid price data exists) */}
        {hasValidPrices && availablePriceRange ? (
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  2. Budget Ceiling & Price Thresholds
                </label>
              </div>
              <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                {preferences.maxBudget
                  ? `Max: ${formatCurrency(preferences.maxBudget)}`
                  : "No Maximum Limit"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                  Maximum Item Price ({formatCurrency(availablePriceRange.min)} - {formatCurrency(availablePriceRange.max)})
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={availablePriceRange.min}
                    max={availablePriceRange.max}
                    step={5}
                    value={preferences.maxBudget || availablePriceRange.max}
                    onChange={(e) =>
                      onPreferencesChange({
                        ...preferences,
                        maxBudget: parseFloat(e.target.value),
                      })
                    }
                    className="w-full accent-blue-600 dark:accent-blue-500 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <input
                    type="number"
                    min={availablePriceRange.min}
                    max={availablePriceRange.max}
                    value={preferences.maxBudget || ""}
                    placeholder="None"
                    onChange={(e) => {
                      const val = e.target.value ? parseFloat(e.target.value) : undefined;
                      onPreferencesChange({ ...preferences, maxBudget: val });
                    }}
                    className="w-24 px-2.5 py-1 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-col justify-end">
                <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                  Budget Tiers
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() =>
                      onPreferencesChange({
                        ...preferences,
                        maxBudget: Math.round(availablePriceRange.max * 0.25),
                      })
                    }
                    className="px-2.5 py-1 text-[11px] rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                  >
                    Economy (&lt; ${Math.round(availablePriceRange.max * 0.25)})
                  </button>
                  <button
                    onClick={() =>
                      onPreferencesChange({
                        ...preferences,
                        maxBudget: Math.round(availablePriceRange.max * 0.6),
                      })
                    }
                    className="px-2.5 py-1 text-[11px] rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                  >
                    Mid-Tier (&lt; ${Math.round(availablePriceRange.max * 0.6)})
                  </button>
                  <button
                    onClick={() =>
                      onPreferencesChange({ ...preferences, maxBudget: undefined })
                    }
                    className="px-2.5 py-1 text-[11px] rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                  >
                    Unconstrained
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
            <Info className="h-4 w-4" />
            <span>Budget filtering omitted: Current dataset does not contain individual unit prices.</span>
          </div>
        )}

        {/* Section 3: Demographic & Persona Targets */}
        <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              3. Shopper Persona & Segment Matching (Optional)
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Age Group */}
            <div>
              <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                Target Age Group
              </label>
              <select
                value={preferences.ageGroup || ""}
                onChange={(e) =>
                  onPreferencesChange({
                    ...preferences,
                    ageGroup: e.target.value || undefined,
                  })
                }
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              >
                <option value="">Any Age Group (Auto-match)</option>
                <option value="18-24">18-24 (Gen Z)</option>
                <option value="25-34">25-34 (Young Professionals)</option>
                <option value="35-44">35-44 (Family & Career)</option>
                <option value="45-54">45-54 (Established)</option>
                <option value="55+">55+ (Senior Shoppers)</option>
              </select>
            </div>

            {/* Region */}
            <div>
              <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                Target Region
              </label>
              <select
                value={preferences.region || ""}
                onChange={(e) =>
                  onPreferencesChange({
                    ...preferences,
                    region: e.target.value || undefined,
                  })
                }
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              >
                <option value="">Any Region (Auto-match)</option>
                <option value="North America">North America</option>
                <option value="Europe">Europe</option>
                <option value="Asia-Pacific">Asia-Pacific</option>
                <option value="Latin America">Latin America</option>
              </select>
            </div>

            {/* Target Segment */}
            <div>
              <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                Segment Affinity Mode
              </label>
              <select
                value={
                  typeof preferences.targetSegmentId === "number"
                    ? preferences.targetSegmentId
                    : "auto"
                }
                onChange={(e) => {
                  const val =
                    e.target.value === "auto"
                      ? "auto"
                      : parseInt(e.target.value, 10);
                  onPreferencesChange({ ...preferences, targetSegmentId: val });
                }}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-medium"
              >
                <option value="auto">Auto-Detect Closest Segment</option>
                {clusters.map((c) => (
                  <option key={c.clusterId} value={c.clusterId}>
                    Cluster {c.clusterId}: {c.archetype} ({c.percentage}%)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Advanced Scoring Weights */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setShowAdvancedWeights(!showAdvancedWeights)}
            className="flex items-center justify-between w-full text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          >
            <div className="flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5" />
              <span>Advanced Recommendation Scoring Weights</span>
            </div>
            {showAdvancedWeights ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {showAdvancedWeights && (
            <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in-50 duration-150">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Configure the relative importance of each signal in the multi-factor ranking algorithm.
                Weights are automatically normalized to sum to 1.0.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                {/* Segment Relevance */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Segment Fit</span>
                    <span className="font-mono text-blue-600 dark:text-blue-400">
                      {Math.round(weights.segmentRelevance * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={weights.segmentRelevance}
                    onChange={(e) =>
                      onWeightsChange({
                        ...weights,
                        segmentRelevance: parseFloat(e.target.value),
                      })
                    }
                    className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-800 rounded"
                  />
                </div>

                {/* Rule Synergy */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Rule Synergy</span>
                    <span className="font-mono text-purple-600 dark:text-purple-400">
                      {Math.round(weights.ruleSynergy * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={weights.ruleSynergy}
                    onChange={(e) =>
                      onWeightsChange({
                        ...weights,
                        ruleSynergy: parseFloat(e.target.value),
                      })
                    }
                    className="w-full accent-purple-600 h-1.5 bg-slate-200 dark:bg-slate-800 rounded"
                  />
                </div>

                {/* Segment Popularity */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Segment Orders</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">
                      {Math.round(weights.segmentPopularity * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={weights.segmentPopularity}
                    onChange={(e) =>
                      onWeightsChange({
                        ...weights,
                        segmentPopularity: parseFloat(e.target.value),
                      })
                    }
                    className="w-full accent-emerald-600 h-1.5 bg-slate-200 dark:bg-slate-800 rounded"
                  />
                </div>

                {/* Preference Match */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Direct Category</span>
                    <span className="font-mono text-amber-600 dark:text-amber-400">
                      {Math.round(weights.preferenceMatch * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={weights.preferenceMatch}
                    onChange={(e) =>
                      onWeightsChange({
                        ...weights,
                        preferenceMatch: parseFloat(e.target.value),
                      })
                    }
                    className="w-full accent-amber-600 h-1.5 bg-slate-200 dark:bg-slate-800 rounded"
                  />
                </div>

                {/* Budget Fit */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Budget Match</span>
                    <span className="font-mono text-cyan-600 dark:text-cyan-400">
                      {Math.round(weights.budgetFit * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={weights.budgetFit}
                    onChange={(e) =>
                      onWeightsChange({
                        ...weights,
                        budgetFit: parseFloat(e.target.value),
                      })
                    }
                    className="w-full accent-cyan-600 h-1.5 bg-slate-200 dark:bg-slate-800 rounded"
                  />
                </div>
              </div>

              {/* Weight Presets */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px]">
                <span className="text-slate-400">Presets:</span>
                <button
                  onClick={() => onWeightsChange(DEFAULT_SCORING_WEIGHTS)}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Balanced (Default)
                </button>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <button
                  onClick={() =>
                    onWeightsChange({
                      segmentRelevance: 0.2,
                      ruleSynergy: 0.45,
                      segmentPopularity: 0.15,
                      preferenceMatch: 0.15,
                      budgetFit: 0.05,
                    })
                  }
                  className="text-purple-600 dark:text-purple-400 hover:underline"
                >
                  Cross-Sell Focused
                </button>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <button
                  onClick={() =>
                    onWeightsChange({
                      segmentRelevance: 0.5,
                      ruleSynergy: 0.15,
                      segmentPopularity: 0.2,
                      preferenceMatch: 0.1,
                      budgetFit: 0.05,
                    })
                  }
                  className="text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Segment-Loyal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
