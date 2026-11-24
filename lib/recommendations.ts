/**
 * SegmentMining AI - New-User Cold-Start Recommendation Engine
 * 
 * Production-ready recommendation module for first-time shoppers with no historical
 * transaction record or user profile. Reuses existing K-Means/DBSCAN customer
 * segmentation, cluster behavioral profiles, and FP-Growth/Apriori association rules.
 */

import {
  AnalysisPipelineResult,
  AssociationRule,
  ClusterSummary,
  RawTransaction,
} from "./types";

export interface UserPreferences {
  /** Selected product categories of interest (from dataset) */
  categories: string[];
  /** Maximum allowable budget (if price data exists) */
  maxBudget?: number;
  /** Minimum budget floor (if price data exists) */
  minBudget?: number;
  /** Optional customer demographic cohort (e.g. "25-34", "18-24") */
  ageGroup?: string;
  /** Optional regional market cohort (e.g. "North America", "Europe") */
  region?: string;
  /** Target specific customer segment manually, or "auto" for cluster similarity */
  targetSegmentId?: number | "auto";
}

export interface ScoringWeights {
  /** Weight for matching segment relevance / centroid affinity (default: 0.35) */
  segmentRelevance: number;
  /** Weight for FP-Growth association-rule synergy (lift & confidence) (default: 0.25) */
  ruleSynergy: number;
  /** Weight for historical transaction volume / popularity within segment (default: 0.20) */
  segmentPopularity: number;
  /** Weight for direct user category preference match (default: 0.15) */
  preferenceMatch: number;
  /** Weight for price/budget suitability (default: 0.05) */
  budgetFit: number;
}

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  segmentRelevance: 0.35,
  ruleSynergy: 0.25,
  segmentPopularity: 0.20,
  preferenceMatch: 0.15,
  budgetFit: 0.05,
};

export interface CatalogItem {
  id: string;
  name: string;
  category: string;
  unitPrice: number;
  transactionCount: number;
  totalQuantity: number;
  totalRevenue: number;
  segmentTransactions: Record<number, number>;
}

export interface SegmentMatchResult {
  clusterId: number;
  clusterName: string;
  archetype: string;
  similarityScore: number; // 0.0 to 1.0
  categoryAffinity: number;
  demographicAffinity: number;
  spendAffinity: number;
  color: string;
}

export interface RecommendationFactor {
  name: string;
  score: number; // 0.0 to 1.0
  weight: number;
  contribution: number; // score * weight * 100
  description: string;
}

export interface RecommendedItem {
  id: string;
  name: string;
  category: string;
  isCategoryLevel: boolean;
  price?: number;
  rank: number;
  score: number; // 0 to 100
  matchType: "direct_preference" | "association_cross_sell" | "segment_top_pick" | "catalog_popular";
  matchedSegmentId: number | null;
  matchedSegmentName: string | null;
  segmentPopularity: number; // 0.0 to 1.0
  associatedCategories: string[];
  ruleLift?: number;
  ruleConfidence?: number;
  ruleAntecedent?: string[];
  factors: RecommendationFactor[];
  reason: string;
}

export interface RecommendationEngineOutput {
  recommendations: RecommendedItem[];
  matchedSegments: SegmentMatchResult[];
  primarySegment: SegmentMatchResult | null;
  activeRules: AssociationRule[];
  fallbackApplied: boolean;
  fallbackReason?: string;
  availablePriceRange?: { min: number; max: number };
  hasValidPrices: boolean;
  hasValidProducts: boolean;
  executionTimeMs: number;
  totalCandidatesEvaluated: number;
}

export interface RecommendationEngineOptions {
  limit?: number;
  weights?: Partial<ScoringWeights>;
  includeCategoryLevelFallback?: boolean;
}

/**
 * Extracts and aggregates catalog product records from transactions.
 * Gracefully determines whether valid product SKUs and unit prices exist.
 */
export function extractCatalogFromTransactions(
  rawTransactions: RawTransaction[],
  customerClusterMap?: Record<string, number>
): {
  items: CatalogItem[];
  categories: string[];
  hasValidProducts: boolean;
  hasValidPrices: boolean;
  minPrice: number;
  maxPrice: number;
} {
  const itemMap = new Map<string, CatalogItem>();
  const categorySet = new Set<string>();
  let validPriceCount = 0;
  let minPrice = Infinity;
  let maxPrice = -Infinity;

  for (const tx of rawTransactions) {
    const category = String(tx.product_category || "").trim();
    if (!category) continue;
    categorySet.add(category);

    const productId = String(tx.product_id || "").trim();
    const productName = String(tx.product_name || "").trim();

    // Check if distinct product identifiers exist
    const key = productId || productName || category;
    const name = productName || productId || category;

    const rawPrice = parseFloat(String(tx.unit_price));
    const price = !isNaN(rawPrice) && rawPrice > 0 ? rawPrice : 0;
    if (price > 0) {
      validPriceCount++;
      if (price < minPrice) minPrice = price;
      if (price > maxPrice) maxPrice = price;
    }

    const rawQty = parseFloat(String(tx.quantity));
    const qty = !isNaN(rawQty) && rawQty > 0 ? rawQty : 1;

    let existing = itemMap.get(key);
    if (!existing) {
      existing = {
        id: productId || key,
        name: name,
        category: category,
        unitPrice: price,
        transactionCount: 0,
        totalQuantity: 0,
        totalRevenue: 0,
        segmentTransactions: {},
      };
      itemMap.set(key, existing);
    }

    existing.transactionCount++;
    existing.totalQuantity += qty;
    existing.totalRevenue += price * qty;
    if (price > 0 && existing.unitPrice === 0) {
      existing.unitPrice = price;
    }

    if (customerClusterMap && tx.customer_id) {
      const cId = customerClusterMap[tx.customer_id];
      if (typeof cId === "number") {
        existing.segmentTransactions[cId] = (existing.segmentTransactions[cId] || 0) + 1;
      }
    }
  }

  const items = Array.from(itemMap.values());
  const hasValidProducts = items.some((i) => i.id !== i.category);
  const hasValidPrices = validPriceCount > 0 && isFinite(minPrice) && isFinite(maxPrice);

  return {
    items,
    categories: Array.from(categorySet).sort(),
    hasValidProducts,
    hasValidPrices,
    minPrice: isFinite(minPrice) ? minPrice : 0,
    maxPrice: isFinite(maxPrice) ? maxPrice : 0,
  };
}

/**
 * Calculates similarity between a new user's preferences and all customer segments.
 * Uses category spend/share distribution, demographic cohorts, and spend levels.
 */
export function calculateSegmentSimilarities(
  preferences: UserPreferences,
  clusters: ClusterSummary[]
): SegmentMatchResult[] {
  if (!clusters || clusters.length === 0) return [];

  const userCats = new Set((preferences.categories || []).map((c) => c.toLowerCase().trim()));
  const hasCategories = userCats.size > 0;

  const results: SegmentMatchResult[] = clusters.map((c) => {
    // 1. Category Affinity: Measure overlap between user's categories and cluster's top categories
    let categoryAffinity = 0;
    if (hasCategories && c.topCategories && c.topCategories.length > 0) {
      let matchedShareSum = 0;
      let totalTopShareSum = 0;

      for (const catEntry of c.topCategories) {
        totalTopShareSum += catEntry.share;
        if (userCats.has(catEntry.category.toLowerCase().trim())) {
          matchedShareSum += catEntry.share;
        }
      }

      categoryAffinity = totalTopShareSum > 0
        ? Math.min(1.0, (matchedShareSum / totalTopShareSum) * 1.5)
        : 0;
    } else {
      // Neutral prior if user specified no categories
      categoryAffinity = 0.5;
    }

    // 2. Demographic Affinity: Compare user age group & region to dominant demographics
    let demographicAffinity = 0.5; // neutral baseline
    let demoChecks = 0;
    let demoMatches = 0;

    if (preferences.ageGroup) {
      demoChecks++;
      if (c.dominantAgeGroup && preferences.ageGroup.toLowerCase() === c.dominantAgeGroup.toLowerCase()) {
        demoMatches++;
      }
    }
    if (preferences.region) {
      demoChecks++;
      if (c.dominantRegion && preferences.region.toLowerCase() === c.dominantRegion.toLowerCase()) {
        demoMatches++;
      }
    }

    if (demoChecks > 0) {
      demographicAffinity = demoMatches / demoChecks;
    }

    // 3. Spend Affinity: Compare user's budget ceiling to cluster average spend
    let spendAffinity = 0.5;
    if (preferences.maxBudget && preferences.maxBudget > 0 && c.avgCustomerSpend > 0) {
      const ratio = preferences.maxBudget / c.avgCustomerSpend;
      // Proximity metric: 1.0 when budget matches average spend, diminishing as ratio diverges
      spendAffinity = Math.max(0, 1.0 - Math.abs(Math.log10(Math.max(0.1, ratio))) * 0.75);
    }

    // Composite similarity score
    const similarityScore = Math.min(
      1.0,
      Math.max(
        0.0,
        categoryAffinity * 0.65 + demographicAffinity * 0.20 + spendAffinity * 0.15
      )
    );

    return {
      clusterId: c.clusterId,
      clusterName: c.name,
      archetype: c.archetype,
      similarityScore: Math.round(similarityScore * 1000) / 1000,
      categoryAffinity: Math.round(categoryAffinity * 1000) / 1000,
      demographicAffinity: Math.round(demographicAffinity * 1000) / 1000,
      spendAffinity: Math.round(spendAffinity * 1000) / 1000,
      color: c.color,
    };
  });

  return results.sort((a, b) => b.similarityScore - a.similarityScore);
}

/**
 * Searches FP-Growth association rules for cross-selling synergies
 * triggered by user's chosen categories.
 */
export function findApplicableAssociationRules(
  userCategories: string[],
  primaryClusterId: number | null,
  globalRules: AssociationRule[],
  clusterRules: Record<number, AssociationRule[]>
): AssociationRule[] {
  if (!userCategories || userCategories.length === 0) {
    return [];
  }

  const userCatSet = new Set(userCategories.map((c) => c.toLowerCase().trim()));

  // Consider rules from primary cluster first, complemented by global rules
  const candidateRules: AssociationRule[] = [];
  if (primaryClusterId !== null && clusterRules && clusterRules[primaryClusterId]) {
    candidateRules.push(...clusterRules[primaryClusterId]);
  }
  if (globalRules && globalRules.length > 0) {
    candidateRules.push(...globalRules);
  }

  // Filter rules where at least one antecedent category is selected by user
  const matchingRules = candidateRules.filter((rule) => {
    return rule.antecedent.some((ant) => userCatSet.has(ant.toLowerCase().trim()));
  });

  // Deduplicate and rank by lift * confidence
  const seen = new Set<string>();
  const deduplicated: AssociationRule[] = [];

  for (const rule of matchingRules) {
    const key = `${rule.antecedent.sort().join(";")}=>${rule.consequent.sort().join(";")}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduplicated.push(rule);
    }
  }

  return deduplicated.sort((a, b) => (b.lift * b.confidence) - (a.lift * a.confidence));
}

/**
 * Generates transparent, human-readable explanations explaining why
 * a candidate item or category was recommended to the first-time user.
 */
export function generateRecommendationExplanation(
  item: { name: string; category: string; matchType: string; isCategoryLevel: boolean },
  segment: SegmentMatchResult | null,
  matchedRule: AssociationRule | null,
  isDirectPreference: boolean
): string {
  const targetNoun = item.isCategoryLevel ? `The "${item.category}" category` : `"${item.name}"`;

  if (matchedRule && matchedRule.antecedent.length > 0) {
    const antText = matchedRule.antecedent.join(" & ");
    const liftFormatted = matchedRule.lift.toFixed(2);
    const confFormatted = Math.round(matchedRule.confidence * 100);

    return `${targetNoun} is recommended as a high-synergy cross-sell. Our FP-Growth rule mining discovered that shoppers interested in ${antText} frequently purchase ${item.category} together (Lift: ${liftFormatted}x, ${confFormatted}% co-purchase confidence).`;
  }

  if (isDirectPreference && segment) {
    const simPct = Math.round(segment.similarityScore * 100);
    return `${targetNoun} aligns directly with your preferred category and is a top-performing selection among customers in the "${segment.archetype}" segment (${simPct}% behavioral profile affinity).`;
  }

  if (segment) {
    return `${targetNoun} is popular among shoppers in the "${segment.archetype}" customer segment (${Math.round(segment.similarityScore * 100)}% match), which shares your demographic and catalog preferences.`;
  }

  return `${targetNoun} is an overall catalog top-performer with consistently high purchase frequency across all customer cohorts.`;
}

/**
 * Main New-User Cold-Start Recommendation Algorithm.
 * 
 * Takes:
 * - User Preferences (categories, budget, demographics)
 * - Raw Transactions from dataset
 * - Existing ML AnalysisPipelineResult (Clusters, FP-Growth rules)
 * - Configurable weights & options
 * 
 * Returns:
 * - Ranked recommendations with multi-factor score breakdown
 * - Segment affinity distribution
 * - Active association rules
 * - Transparent explanation strings
 */
export function generateNewUserRecommendations(
  preferences: UserPreferences,
  rawTransactions: RawTransaction[],
  pipelineResult: AnalysisPipelineResult | null,
  options: RecommendationEngineOptions = {}
): RecommendationEngineOutput {
  const startTime = Date.now();
  const { limit = 8, weights: customWeights, includeCategoryLevelFallback = true } = options;
  const weights: ScoringWeights = { ...DEFAULT_SCORING_WEIGHTS, ...customWeights };

  // Normalize weights so sum = 1.0
  const totalWeight =
    weights.segmentRelevance +
    weights.ruleSynergy +
    weights.segmentPopularity +
    weights.preferenceMatch +
    weights.budgetFit;
  const normWeights: ScoringWeights = {
    segmentRelevance: weights.segmentRelevance / totalWeight,
    ruleSynergy: weights.ruleSynergy / totalWeight,
    segmentPopularity: weights.segmentPopularity / totalWeight,
    preferenceMatch: weights.preferenceMatch / totalWeight,
    budgetFit: weights.budgetFit / totalWeight,
  };

  // If raw transactions are completely empty
  if (!rawTransactions || rawTransactions.length === 0) {
    return {
      recommendations: [],
      matchedSegments: [],
      primarySegment: null,
      activeRules: [],
      fallbackApplied: true,
      fallbackReason: "Dataset contains zero transactions.",
      hasValidPrices: false,
      hasValidProducts: false,
      executionTimeMs: Date.now() - startTime,
      totalCandidatesEvaluated: 0,
    };
  }

  // Extract catalog items and metrics
  const customerClusterMap = pipelineResult?.clustering.customerAssignments;
  const catalog = extractCatalogFromTransactions(rawTransactions, customerClusterMap);

  const clusters = pipelineResult?.clustering.clusters || [];
  const globalRules = pipelineResult?.globalRules || [];
  const clusterRules = pipelineResult?.clusterRules || {};

  // 1. Match User Profile to Existing Customer Segments
  let matchedSegments = calculateSegmentSimilarities(preferences, clusters);

  let primarySegment: SegmentMatchResult | null = null;
  if (typeof preferences.targetSegmentId === "number") {
    primarySegment = matchedSegments.find((s) => s.clusterId === preferences.targetSegmentId) || null;
  }
  if (!primarySegment && matchedSegments.length > 0) {
    primarySegment = matchedSegments[0];
  }

  // 2. Discover Applicable Association Rules
  const activeRules = findApplicableAssociationRules(
    preferences.categories || [],
    primarySegment ? primarySegment.clusterId : null,
    globalRules,
    clusterRules
  );

  // Build a map of category -> best matching association rule
  const ruleByConsequentCategory = new Map<string, AssociationRule>();
  for (const rule of activeRules) {
    for (const cons of rule.consequent) {
      const key = cons.toLowerCase().trim();
      const existing = ruleByConsequentCategory.get(key);
      if (!existing || (rule.lift * rule.confidence > existing.lift * existing.confidence)) {
        ruleByConsequentCategory.set(key, rule);
      }
    }
  }

  // User category set
  const userCategorySet = new Set((preferences.categories || []).map((c) => c.toLowerCase().trim()));
  const hasUserCategories = userCategorySet.size > 0;

  // Track max transaction counts for normalization
  const maxCatalogTx = Math.max(...catalog.items.map((i) => i.transactionCount), 1);
  let maxSegmentTx = 1;
  if (primarySegment) {
    const sId = primarySegment.clusterId;
    maxSegmentTx = Math.max(
      ...catalog.items.map((i) => i.segmentTransactions[sId] || 0),
      1
    );
  }

  // 3. Evaluate & Score Candidates
  let candidates: Array<{
    item: CatalogItem | { id: string; name: string; category: string; unitPrice: number; transactionCount: number; segmentTransactions: Record<number, number> };
    isCategoryLevel: boolean;
    rule: AssociationRule | null;
    score: number;
    matchType: RecommendedItem["matchType"];
    factors: RecommendationFactor[];
    segmentPopularityNorm: number;
  }> = [];

  let totalCandidatesEvaluated = 0;
  let fallbackApplied = false;
  let fallbackReason: string | undefined;

  // Decide if we recommend individual products or category-level items
  const useProducts = catalog.hasValidProducts && catalog.items.length > catalog.categories.length;

  if (useProducts) {
    for (const item of catalog.items) {
      totalCandidatesEvaluated++;

      // Budget filter
      if (catalog.hasValidPrices) {
        if (typeof preferences.maxBudget === "number" && preferences.maxBudget > 0 && item.unitPrice > preferences.maxBudget) {
          continue;
        }
        if (typeof preferences.minBudget === "number" && preferences.minBudget > 0 && item.unitPrice < preferences.minBudget) {
          continue;
        }
      }

      const itemCatLower = item.category.toLowerCase().trim();
      const isDirectPref = userCategorySet.has(itemCatLower);
      const rule = ruleByConsequentCategory.get(itemCatLower) || null;

      // Match type determination
      let matchType: RecommendedItem["matchType"] = "catalog_popular";
      if (isDirectPref) {
        matchType = "direct_preference";
      } else if (rule) {
        matchType = "association_cross_sell";
      } else if (primarySegment && (item.segmentTransactions[primarySegment.clusterId] || 0) > 0) {
        matchType = "segment_top_pick";
      }

      // Factor 1: Segment Relevance (0 to 1)
      const segmentRelScore = primarySegment ? primarySegment.similarityScore : 0.5;

      // Factor 2: Rule Synergy (0 to 1)
      let ruleScore = 0;
      if (rule) {
        // Normalize lift: 1.0 is neutral, 3.0+ is very high
        const normLift = Math.min(1.0, Math.max(0, (rule.lift - 1.0) / 2.0));
        ruleScore = Math.min(1.0, normLift * 0.6 + rule.confidence * 0.4);
      }

      // Factor 3: Segment Popularity (0 to 1)
      let segPopScore = 0;
      if (primarySegment) {
        const segTx = item.segmentTransactions[primarySegment.clusterId] || 0;
        segPopScore = Math.min(1.0, segTx / maxSegmentTx);
      } else {
        segPopScore = Math.min(1.0, item.transactionCount / maxCatalogTx);
      }

      // Factor 4: Preference Match (0 to 1)
      const prefScore = isDirectPref ? 1.0 : (rule ? 0.65 : 0.2);

      // Factor 5: Budget Fit (0 to 1)
      let budgetScore = 0.8; // default healthy baseline
      if (catalog.hasValidPrices && preferences.maxBudget && preferences.maxBudget > 0) {
        const ratio = item.unitPrice / preferences.maxBudget;
        if (ratio <= 1.0) {
          // Sweet spot is 40%-90% of budget
          budgetScore = ratio >= 0.3 ? 1.0 : 0.85;
        } else {
          budgetScore = Math.max(0, 1.0 - (ratio - 1.0));
        }
      }

      // Final composite score (0 to 100)
      const compositeNorm =
        segmentRelScore * normWeights.segmentRelevance +
        ruleScore * normWeights.ruleSynergy +
        segPopScore * normWeights.segmentPopularity +
        prefScore * normWeights.preferenceMatch +
        budgetScore * normWeights.budgetFit;

      const score = Math.round(Math.min(100, Math.max(0, compositeNorm * 100)));

      const factors: RecommendationFactor[] = [
        {
          name: "Segment Affinity",
          score: Math.round(segmentRelScore * 100) / 100,
          weight: normWeights.segmentRelevance,
          contribution: Math.round(segmentRelScore * normWeights.segmentRelevance * 1000) / 10,
          description: primarySegment
            ? `${Math.round(segmentRelScore * 100)}% match to "${primarySegment.archetype}"`
            : "Dataset-wide baseline",
        },
        {
          name: "Rule Synergy",
          score: Math.round(ruleScore * 100) / 100,
          weight: normWeights.ruleSynergy,
          contribution: Math.round(ruleScore * normWeights.ruleSynergy * 1000) / 10,
          description: rule
            ? `FP-Growth Lift: ${rule.lift.toFixed(2)}x (Conf: ${Math.round(rule.confidence * 100)}%)`
            : "No active cross-sell rule",
        },
        {
          name: "Segment Popularity",
          score: Math.round(segPopScore * 100) / 100,
          weight: normWeights.segmentPopularity,
          contribution: Math.round(segPopScore * normWeights.segmentPopularity * 1000) / 10,
          description: `${Math.round(segPopScore * 100)}% relative order frequency`,
        },
        {
          name: "Preference Alignment",
          score: Math.round(prefScore * 100) / 100,
          weight: normWeights.preferenceMatch,
          contribution: Math.round(prefScore * normWeights.preferenceMatch * 1000) / 10,
          description: isDirectPref ? "Direct category selection" : (rule ? "Associated cross-sell" : "Segment recommendation"),
        },
        {
          name: "Budget Fit",
          score: Math.round(budgetScore * 100) / 100,
          weight: normWeights.budgetFit,
          contribution: Math.round(budgetScore * normWeights.budgetFit * 1000) / 10,
          description: catalog.hasValidPrices ? `Unit price: $${item.unitPrice.toFixed(2)}` : "Price data omitted",
        },
      ];

      candidates.push({
        item,
        isCategoryLevel: false,
        rule,
        score,
        matchType,
        factors,
        segmentPopularityNorm: segPopScore,
      });
    }
  }

  // If no candidates found (e.g. strict budget filter or dataset lacks individual products)
  if (candidates.length === 0 && includeCategoryLevelFallback) {
    fallbackApplied = true;
    fallbackReason = useProducts
      ? "Budget or category filters produced no product matches. Recommending top categories instead."
      : "Dataset contains category-level transactions without distinct product SKUs. Recommending categories.";

    // Fall back to category-level candidates
    for (const cat of catalog.categories) {
      totalCandidatesEvaluated++;
      const catLower = cat.toLowerCase().trim();
      const isDirectPref = userCategorySet.has(catLower);
      const rule = ruleByConsequentCategory.get(catLower) || null;

      // Find category share in primary segment
      let catShare = 0;
      if (primarySegment && clusters.length > 0) {
        const cluster = clusters.find((c) => c.clusterId === primarySegment!.clusterId);
        const topCat = cluster?.topCategories.find((tc) => tc.category.toLowerCase().trim() === catLower);
        if (topCat) catShare = topCat.share / 100;
      }

      let ruleScore = 0;
      if (rule) {
        ruleScore = Math.min(1.0, Math.max(0, (rule.lift - 1.0) / 2.0));
      }

      const segmentRelScore = primarySegment ? primarySegment.similarityScore : 0.5;
      const prefScore = isDirectPref ? 1.0 : (rule ? 0.7 : 0.3);

      const score = Math.round(
        Math.min(
          100,
          (segmentRelScore * 0.35 + ruleScore * 0.30 + catShare * 0.20 + prefScore * 0.15) * 100
        )
      );

      const matchType: RecommendedItem["matchType"] = isDirectPref
        ? "direct_preference"
        : (rule ? "association_cross_sell" : "segment_top_pick");

      const factors: RecommendationFactor[] = [
        {
          name: "Segment Affinity",
          score: segmentRelScore,
          weight: 0.35,
          contribution: Math.round(segmentRelScore * 350) / 10,
          description: primarySegment ? `Archetype: ${primarySegment.archetype}` : "Global",
        },
        {
          name: "Rule Synergy",
          score: ruleScore,
          weight: 0.30,
          contribution: Math.round(ruleScore * 300) / 10,
          description: rule ? `Rule Lift: ${rule.lift.toFixed(2)}x` : "No rule active",
        },
        {
          name: "Category Share",
          score: catShare,
          weight: 0.20,
          contribution: Math.round(catShare * 200) / 10,
          description: `${Math.round(catShare * 100)}% segment spend share`,
        },
        {
          name: "Preference Alignment",
          score: prefScore,
          weight: 0.15,
          contribution: Math.round(prefScore * 150) / 10,
          description: isDirectPref ? "Direct selection" : "Derived recommendation",
        },
      ];

      candidates.push({
        item: {
          id: `CAT-${cat}`,
          name: `${cat} (Category)`,
          category: cat,
          unitPrice: 0,
          transactionCount: 0,
          segmentTransactions: {},
        },
        isCategoryLevel: true,
        rule,
        score,
        matchType,
        factors,
        segmentPopularityNorm: catShare,
      });
    }
  }

  // Sort candidates by score descending
  candidates.sort((a, b) => b.score - a.score);

  // If user provided NO preferences at all, note cold-start fallback
  if (!hasUserCategories && !preferences.maxBudget && !preferences.ageGroup && !preferences.region) {
    fallbackApplied = true;
    fallbackReason = "No user preferences supplied. Utilizing catalog-wide popularity and dominant segment defaults.";
  }

  // Select top N candidates and build output
  const topCandidates = candidates.slice(0, limit);

  const recommendations: RecommendedItem[] = topCandidates.map((c, index) => {
    const isDirectPref = userCategorySet.has(c.item.category.toLowerCase().trim());
    const reason = generateRecommendationExplanation(
      {
        name: c.item.name,
        category: c.item.category,
        matchType: c.matchType,
        isCategoryLevel: c.isCategoryLevel,
      },
      primarySegment,
      c.rule,
      isDirectPref
    );

    const associatedCategories: string[] = [];
    if (c.rule) {
      associatedCategories.push(...c.rule.antecedent);
    }

    return {
      id: c.item.id,
      name: c.item.name,
      category: c.item.category,
      isCategoryLevel: c.isCategoryLevel,
      price: catalog.hasValidPrices && c.item.unitPrice > 0 ? c.item.unitPrice : undefined,
      rank: index + 1,
      score: c.score,
      matchType: c.matchType,
      matchedSegmentId: primarySegment ? primarySegment.clusterId : null,
      matchedSegmentName: primarySegment ? primarySegment.archetype : null,
      segmentPopularity: Math.round(c.segmentPopularityNorm * 100) / 100,
      associatedCategories,
      ruleLift: c.rule ? c.rule.lift : undefined,
      ruleConfidence: c.rule ? c.rule.confidence : undefined,
      ruleAntecedent: c.rule ? c.rule.antecedent : undefined,
      factors: c.factors,
      reason,
    };
  });

  return {
    recommendations,
    matchedSegments,
    primarySegment,
    activeRules,
    fallbackApplied,
    fallbackReason,
    availablePriceRange: catalog.hasValidPrices
      ? { min: Math.floor(catalog.minPrice), max: Math.ceil(catalog.maxPrice) }
      : undefined,
    hasValidPrices: catalog.hasValidPrices,
    hasValidProducts: catalog.hasValidProducts,
    executionTimeMs: Date.now() - startTime,
    totalCandidatesEvaluated,
  };
}
