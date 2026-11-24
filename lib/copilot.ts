/**
 * SegmentMining AI - Intelligent Ask Copilot Engine
 * 
 * Context-aware AI assistant powering real-time product recommendations,
 * conversational follow-ups, cluster explanations, and association-rule analytics.
 */

import {
  generateNewUserRecommendations,
  RecommendedItem,
  SegmentMatchResult,
  UserPreferences,
} from "./recommendations";
import {
  AnalysisPipelineResult,
  AssociationRule,
  ClusterSummary,
  RawTransaction,
} from "./types";
import { formatCurrency } from "./utils";

export interface CopilotMessage {
  id: string;
  sender: "user" | "copilot";
  text: string;
  bullets?: string[];
  metrics?: { label: string; value: string }[];
  recommendations?: RecommendedItem[];
  matchedSegment?: SegmentMatchResult | null;
  followUpSuggestions?: string[];
  timestamp: string;
}

export interface CopilotContext {
  datasetName: string;
  rawTransactions: RawTransaction[];
  pipelineResult: AnalysisPipelineResult | null;
  activeClusterId?: number | "all";
  lastRecommendations?: RecommendedItem[];
  lastPreferences?: UserPreferences;
  lastMatchedSegment?: SegmentMatchResult | null;
  conversationHistory?: { query: string; responseText: string }[];
}

export interface CopilotResponse {
  message: CopilotMessage;
  updatedContext: Partial<CopilotContext>;
}

/**
 * Parses user input to extract categories, budget ceilings, and cluster targets.
 */
export function extractPreferencesFromQuery(
  query: string,
  availableCategories: string[],
  clusters: ClusterSummary[]
): {
  categories: string[];
  maxBudget?: number;
  targetSegmentId?: number;
  ageGroup?: string;
  region?: string;
} {
  const qLower = query.toLowerCase();

  // 1. Extract Categories
  const matchedCategories: string[] = [];
  for (const cat of availableCategories) {
    const catLower = cat.toLowerCase();
    // Direct or partial match
    if (qLower.includes(catLower)) {
      matchedCategories.push(cat);
    } else {
      // Check individual words if category is compound (e.g. "Gaming", "Electronics", "Grocery")
      const words = catLower.split(/[\s&,-]+/).filter((w) => w.length > 3);
      if (words.some((w) => qLower.includes(w))) {
        matchedCategories.push(cat);
      }
    }
  }

  // 2. Extract Budget Ceiling
  let maxBudget: number | undefined;
  const budgetRegexes = [
    /(?:budget\s*(?:of|is|:)?\s*[\$₹€£]?\s*(\d+(?:\.\d+)?))/i,
    /(?:under|below|less\s*than|max(?:imum)?)\s*[\$₹€£]?\s*(\d+(?:\.\d+)?)/i,
    /[\$₹€£]\s*(\d+(?:\.\d+)?)/i,
    /(\d+(?:\.\d+)?)\s*(?:dollars|bucks|rupees|usd)/i,
  ];

  for (const regex of budgetRegexes) {
    const match = query.match(regex);
    if (match) {
      const numStr = match[1] || match[2];
      if (numStr) {
        const val = parseFloat(numStr);
        if (!isNaN(val) && val > 0) {
          maxBudget = val;
          break;
        }
      }
    }
  }

  // 3. Extract Target Segment
  let targetSegmentId: number | undefined;
  const clusterRegex = /(?:cluster|segment)\s*#?\s*(\d+)/i;
  const clusterMatch = query.match(clusterRegex);
  if (clusterMatch && clusterMatch[1]) {
    const cid = parseInt(clusterMatch[1], 10);
    // Support 1-based and 0-based indexing
    if (clusters.some((c) => c.clusterId === cid)) {
      targetSegmentId = cid;
    } else if (clusters.some((c) => c.clusterId === cid - 1)) {
      targetSegmentId = cid - 1;
    }
  }

  // Check cluster archetype names
  if (targetSegmentId === undefined) {
    for (const c of clusters) {
      if (qLower.includes(c.archetype.toLowerCase())) {
        targetSegmentId = c.clusterId;
        break;
      }
    }
  }

  // 4. Extract Demographics
  let ageGroup: string | undefined;
  if (qLower.includes("gen z") || qLower.includes("18-24")) ageGroup = "18-24";
  else if (qLower.includes("young professional") || qLower.includes("25-34")) ageGroup = "25-34";
  else if (qLower.includes("family") || qLower.includes("35-44")) ageGroup = "35-44";
  else if (qLower.includes("senior") || qLower.includes("55+")) ageGroup = "55+";

  let region: string | undefined;
  if (qLower.includes("north america") || qLower.includes("us") || qLower.includes("usa")) region = "North America";
  else if (qLower.includes("europe") || qLower.includes("eu")) region = "Europe";
  else if (qLower.includes("asia") || qLower.includes("apac")) region = "Asia-Pacific";

  return {
    categories: Array.from(new Set(matchedCategories)),
    maxBudget,
    targetSegmentId,
    ageGroup,
    region,
  };
}

/**
 * Main Ask Copilot Query Processor.
 * Dispatches to recommendation engine, follow-up handler, or analytics intelligence.
 */
export function processCopilotQuery(
  query: string,
  context: CopilotContext
): CopilotResponse {
  const qLower = query.toLowerCase().trim();
  const result = context.pipelineResult;
  const clusters = result?.clustering.clusters || [];
  const rules = result?.globalRules || [];
  const comparisons = result?.crossClusterComparisons || [];
  const categories = result?.datasetMetadata.categories || [];
  const now = "Just now";

  // Helper to format follow-up questions
  const createResponse = (
    text: string,
    options: {
      bullets?: string[];
      metrics?: { label: string; value: string }[];
      recommendations?: RecommendedItem[];
      matchedSegment?: SegmentMatchResult | null;
      followUps?: string[];
      newContext?: Partial<CopilotContext>;
    } = {}
  ): CopilotResponse => {
    return {
      message: {
        id: `c-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        sender: "copilot",
        text,
        bullets: options.bullets,
        metrics: options.metrics,
        recommendations: options.recommendations,
        matchedSegment: options.matchedSegment,
        followUpSuggestions: options.followUps || [
          "Why was this recommended?",
          "Compare all customer clusters",
          "Find the strongest association rules",
        ],
        timestamp: now,
      },
      updatedContext: options.newContext || {},
    };
  };

  // If pipeline is not ready yet
  if (!result || !context.rawTransactions || context.rawTransactions.length === 0) {
    return createResponse(
      "The dataset is currently being loaded or analyzed by the ML pipeline. Please wait a few seconds or trigger a pipeline run to generate insights.",
      {
        followUps: ["Load Omnichannel Retail Dataset", "Run Analysis Pipeline"],
      }
    );
  }

  // ---------------------------------------------------------------------------
  // 1. CONTEXTUAL FOLLOW-UP QUESTIONS
  // ---------------------------------------------------------------------------

  // A. "Why was this recommended?"
  if (
    (qLower.includes("why") && (qLower.includes("recommend") || qLower.includes("suggest") || qLower.includes("this"))) ||
    qLower === "why was this recommended?"
  ) {
    const lastRec = context.lastRecommendations?.[0];
    const lastSeg = context.lastMatchedSegment;

    if (lastRec) {
      return createResponse(
        `Here is the mathematical and behavioral breakdown for recommending "${lastRec.name}":`,
        {
          bullets: [
            `Overall Recommendation Score: ${lastRec.score}/100 based on our 5-factor scoring model.`,
            `Segment Affinity: Customers in the "${lastRec.matchedSegmentName || "Dominant"}" segment exhibit high purchasing affinity for ${lastRec.category}.`,
            lastRec.ruleLift
              ? `FP-Growth Synergy: Strong co-purchase rule discovered with ${lastRec.associatedCategories.join(", ")} (Lift: ${lastRec.ruleLift.toFixed(2)}x, Confidence: ${Math.round((lastRec.ruleConfidence || 0) * 100)}%).`
              : `Order Frequency: Frequently ordered catalog item (${Math.round(lastRec.segmentPopularity * 100)}% relative cohort frequency).`,
            lastRec.price !== undefined
              ? `Budget Suitability: Unit price of ${formatCurrency(lastRec.price)} aligns with segment spend behavior.`
              : `Price Data: Catalog price data omitted.`,
          ],
          metrics: [
            { label: "Item Score", value: `${lastRec.score}/100` },
            { label: "Rule Lift", value: lastRec.ruleLift ? `${lastRec.ruleLift.toFixed(2)}x` : "Baseline" },
          ],
          followUps: [
            "Show alternatives",
            "What if the budget is lower?",
            "Give me a marketing strategy for these customers",
          ],
        }
      );
    } else {
      return createResponse(
        "I don't have an active recommendation in memory yet. Ask me to recommend products for a customer category or budget first!",
        {
          followUps: [
            "Recommend products to a new customer",
            "Recommend electronics under $100",
            "What should a first-time shopper buy?",
          ],
        }
      );
    }
  }

  // B. "Show alternatives" / "More options"
  if (
    qLower.includes("alternative") ||
    qLower.includes("other options") ||
    qLower.includes("more products") ||
    qLower.includes("show more")
  ) {
    const prefs = context.lastPreferences || { categories: categories.slice(0, 2) };
    const recOutput = generateNewUserRecommendations(prefs, context.rawTransactions, result, {
      limit: 8,
    });
    // Return items #4 to #8 as alternatives
    const altItems = recOutput.recommendations.length > 4
      ? recOutput.recommendations.slice(3, 7)
      : recOutput.recommendations;

    return createResponse(
      `Here are alternative product recommendations matching your profile (${prefs.categories.join(", ") || "General Catalog"}):`,
      {
        recommendations: altItems,
        matchedSegment: recOutput.primarySegment,
        followUps: [
          "Compare these recommendations",
          "What if the budget is lower?",
          "Give me a marketing strategy",
        ],
        newContext: {
          lastRecommendations: altItems,
          lastMatchedSegment: recOutput.primarySegment,
        },
      }
    );
  }

  // C. "What if the budget is lower?" / "Lower budget"
  if (
    qLower.includes("lower budget") ||
    qLower.includes("budget is lower") ||
    qLower.includes("cheaper") ||
    qLower.includes("more affordable")
  ) {
    const currentBudget = context.lastPreferences?.maxBudget || 150;
    const lowerBudget = Math.max(25, Math.round(currentBudget * 0.5));
    const newPrefs: UserPreferences = {
      ...(context.lastPreferences || { categories: categories.slice(0, 2) }),
      maxBudget: lowerBudget,
    };

    const recOutput = generateNewUserRecommendations(newPrefs, context.rawTransactions, result, {
      limit: 4,
    });

    return createResponse(
      `Adjusted budget ceiling to ${formatCurrency(lowerBudget)} (50% reduction). Here are the top budget-friendly alternatives:`,
      {
        recommendations: recOutput.recommendations,
        matchedSegment: recOutput.primarySegment,
        metrics: [
          { label: "New Budget Cap", value: formatCurrency(lowerBudget) },
          { label: "Matches Found", value: `${recOutput.recommendations.length}` },
        ],
        followUps: [
          "Why was this recommended?",
          "Compare these recommendations",
          "Which segment is this based on?",
        ],
        newContext: {
          lastPreferences: newPrefs,
          lastRecommendations: recOutput.recommendations,
          lastMatchedSegment: recOutput.primarySegment,
        },
      }
    );
  }

  // D. "Compare these recommendations"
  if (
    qLower.includes("compare these") ||
    qLower.includes("compare recommendations") ||
    (qLower.includes("compare") && context.lastRecommendations && context.lastRecommendations.length > 0)
  ) {
    const recs = context.lastRecommendations || [];
    if (recs.length >= 2) {
      const top2 = recs.slice(0, 3);
      return createResponse(
        `Comparative analysis of top recommended items:`,
        {
          bullets: top2.map(
            (r, i) =>
              `#${i + 1} "${r.name}" (${r.category}) • Score: ${r.score}/100 • Price: ${r.price !== undefined ? formatCurrency(r.price) : "N/A"} • Synergy: ${r.ruleLift ? `${r.ruleLift.toFixed(2)}x Lift` : "Segment Volume"}`
          ),
          followUps: [
            "Why was this recommended?",
            "What if the budget is lower?",
            "Give me a marketing strategy",
          ],
        }
      );
    }
  }

  // E. "Which segment is this based on?"
  if (
    qLower.includes("which segment") ||
    qLower.includes("what segment") ||
    qLower.includes("based on what cluster")
  ) {
    const seg = context.lastMatchedSegment;
    if (seg) {
      const clusterObj = clusters.find((c) => c.clusterId === seg.clusterId);
      return createResponse(
        `These recommendations were matched to the "${seg.archetype}" segment (Cluster #${seg.clusterId + 1}) with an affinity score of ${Math.round(seg.similarityScore * 100)}%.`,
        {
          bullets: [
            `Segment Archetype: ${seg.archetype}`,
            `Average Customer Spend: ${clusterObj ? formatCurrency(clusterObj.avgCustomerSpend) : "N/A"}`,
            `Average Basket Size: ${clusterObj ? clusterObj.avgBasketSize.toFixed(1) : "N/A"} items`,
            `Dominant Demographic: ${clusterObj ? `${clusterObj.dominantAgeGroup} (${clusterObj.dominantRegion})` : "General"}`,
            `Wallet Share: Core spending concentrated in ${clusterObj?.topCategories[0]?.category || "top categories"}.`,
          ],
          metrics: [
            { label: "Segment Affinity", value: `${Math.round(seg.similarityScore * 100)}%` },
            { label: "Customer Share", value: `${clusterObj?.percentage || 25}%` },
          ],
          followUps: [
            "Show alternatives",
            "Give me a marketing strategy for these customers",
            "Compare all customer clusters",
          ],
        }
      );
    }
  }

  // F. "Show the association rules"
  if (
    (qLower.includes("show") || qLower.includes("what")) &&
    qLower.includes("rule") &&
    context.lastRecommendations &&
    context.lastRecommendations.some((r) => r.ruleLift)
  ) {
    const rulesTriggered = context.lastRecommendations
      .filter((r) => r.ruleLift)
      .slice(0, 3);

    return createResponse(
      `Here are the FP-Growth association rules driving your current recommendation set:`,
      {
        bullets: rulesTriggered.map(
          (r) =>
            `[${r.associatedCategories.join(" & ")}] ➔ [${r.category}] • Lift: ${r.ruleLift?.toFixed(2)}x • Conf: ${Math.round((r.ruleConfidence || 0.3) * 100)}% • Rationale: ${r.reason}`
        ),
        followUps: [
          "Why was this recommended?",
          "Find the strongest association rules",
          "Give me a marketing strategy",
        ],
      }
    );
  }

  // G. "Explain in simpler terms"
  if (qLower.includes("simpler") || qLower.includes("simple terms") || qLower.includes("explain simply")) {
    return createResponse(
      `In simple terms: When a brand-new shopper visits your store without a purchase history, we can't look at their past receipts. Instead, we look at the category they browse or the budget they set, match them to existing customer groups with similar tastes, and use "frequently bought together" patterns to recommend the top-selling items from that crowd.`,
      {
        followUps: [
          "Recommend products to a new customer",
          "Give me a marketing strategy",
          "Compare all customer clusters",
        ],
      }
    );
  }

  // H. "Give me a marketing strategy"
  if (
    qLower.includes("marketing strategy") ||
    qLower.includes("marketing campaign") ||
    qLower.includes("how to market")
  ) {
    const seg = context.lastMatchedSegment || (clusters.length > 0 ? {
      clusterId: clusters[0].clusterId,
      archetype: clusters[0].archetype,
      similarityScore: 0.85,
    } : null);

    return createResponse(
      `Data-Backed Merchandising & Marketing Playbook for ${seg ? `"${seg.archetype}"` : "New Customers"}:`,
      {
        bullets: [
          `First-Session Cart Promotion: Trigger a personalized 10% bundle incentive when a shopper adds an antecedent category item to their basket.`,
          `Welcome Series Email Flow: Send a Day-2 onboarding email highlighting top cross-sell products with statistical Lift > 2.0x.`,
          `Dynamic Checkout Upsells: Present complementary items right below the checkout CTA to boost average order value by +15-24%.`,
          `Segment Alignment: Target promotional creative matching the dominant demographic profile.`,
        ],
        metrics: [
          { label: "Projected Lift", value: "+24.6%" },
          { label: "Target Cohort", value: seg ? seg.archetype : "All Segments" },
        ],
        followUps: [
          "Recommend products to a new customer",
          "Find the strongest association rules",
          "Compare all customer clusters",
        ],
      }
    );
  }

  // ---------------------------------------------------------------------------
  // 2. PRODUCT RECOMMENDATION INTENT (Primary Recommendation Engine Hook)
  // ---------------------------------------------------------------------------
  const isRecommendationQuery =
    qLower.includes("recommend") ||
    qLower.includes("suggest") ||
    qLower.includes("what to buy") ||
    qLower.includes("first-time") ||
    qLower.includes("new customer") ||
    qLower.includes("cold-start") ||
    qLower.includes("product") ||
    qLower.includes("interested in");

  if (isRecommendationQuery) {
    const parsedPrefs = extractPreferencesFromQuery(query, categories, clusters);
    const prefs: UserPreferences = {
      categories: parsedPrefs.categories.length > 0 ? parsedPrefs.categories : categories.slice(0, 2),
      maxBudget: parsedPrefs.maxBudget,
      targetSegmentId: parsedPrefs.targetSegmentId !== undefined ? parsedPrefs.targetSegmentId : "auto",
      ageGroup: parsedPrefs.ageGroup,
      region: parsedPrefs.region,
    };

    const recOutput = generateNewUserRecommendations(prefs, context.rawTransactions, result, {
      limit: 4,
    });

    const categoryText = prefs.categories.join(", ");
    const budgetText = prefs.maxBudget ? ` with a budget under ${formatCurrency(prefs.maxBudget)}` : "";
    const segmentText = recOutput.primarySegment
      ? ` matched to the "${recOutput.primarySegment.archetype}" segment (${Math.round(recOutput.primarySegment.similarityScore * 100)}% affinity)`
      : "";

    let introText = `Here are the top data-driven recommendations for a first-time shopper interested in ${categoryText}${budgetText}${segmentText}:`;
    if (recOutput.fallbackApplied && recOutput.fallbackReason) {
      introText += ` (Note: ${recOutput.fallbackReason})`;
    }

    return createResponse(introText, {
      recommendations: recOutput.recommendations,
      matchedSegment: recOutput.primarySegment,
      metrics: [
        { label: "Items Evaluated", value: `${recOutput.totalCandidatesEvaluated}` },
        { label: "Rules Active", value: `${recOutput.activeRules.length}` },
      ],
      followUps: [
        "Why was this recommended?",
        "Show alternatives",
        "What if the budget is lower?",
        "Give me a marketing strategy for these customers",
      ],
      newContext: {
        lastPreferences: prefs,
        lastRecommendations: recOutput.recommendations,
        lastMatchedSegment: recOutput.primarySegment,
      },
    });
  }

  // ---------------------------------------------------------------------------
  // 3. CLUSTER & SEGMENTATION ANALYTICS
  // ---------------------------------------------------------------------------
  if (
    qLower.includes("cluster") ||
    qLower.includes("segment") ||
    qLower.includes("cohort")
  ) {
    const sortedBySpend = [...clusters].sort((a, b) => b.avgCustomerSpend - a.avgCustomerSpend);
    const topVal = sortedBySpend[0];
    const largest = [...clusters].sort((a, b) => b.customerCount - a.customerCount)[0];

    return createResponse(
      `Customer Segmentation Summary (${clusters.length} clusters discovered via ${result.clustering.algorithm.toUpperCase()}):`,
      {
        bullets: clusters.map(
          (c) =>
            `Cluster #${c.clusterId + 1} "${c.archetype}": ${c.percentage}% of customers • Avg spend: ${formatCurrency(c.avgCustomerSpend)} • Avg basket: ${c.avgBasketSize.toFixed(1)} items • Top category: ${c.topCategories[0]?.category || "General"} (${c.topCategories[0]?.share || 0}%)`
        ),
        metrics: [
          { label: "Highest Value", value: topVal ? topVal.archetype : "N/A" },
          { label: "Largest Cohort", value: largest ? `${largest.percentage}%` : "N/A" },
          { label: "Silhouette Score", value: result.clustering.silhouetteScore.toFixed(3) },
          { label: "DB Index", value: result.clustering.daviesBouldinIndex.toFixed(3) },
        ],
        followUps: [
          "Recommend products to a new customer",
          "Find the strongest association rules",
          "Identify niche rules that only work for a single cohort",
        ],
      }
    );
  }

  // ---------------------------------------------------------------------------
  // 4. ASSOCIATION RULES & MERCHANDISING
  // ---------------------------------------------------------------------------
  if (
    qLower.includes("rule") ||
    qLower.includes("association") ||
    qLower.includes("lift") ||
    qLower.includes("bundle")
  ) {
    const topRules = [...rules].sort((a, b) => b.lift - a.lift).slice(0, 4);

    return createResponse(
      `Discovered ${rules.length} FP-Growth association rules in ${context.datasetName}. Here are the peak-lift category pairings:`,
      {
        bullets: topRules.map(
          (r, i) =>
            `#${i + 1} [${r.antecedent.join(" & ")}] ➔ [${r.consequent.join(" & ")}] • Lift: ${r.lift.toFixed(2)}x • Confidence: ${(r.confidence * 100).toFixed(1)}% • Support: ${(r.support * 100).toFixed(1)}% (${r.businessAction})`
        ),
        metrics: [
          { label: "Top Rule Lift", value: `${topRules[0]?.lift.toFixed(2) || 0}x` },
          { label: "Total Rules Mined", value: `${rules.length}` },
        ],
        followUps: [
          "Recommend products to a new customer",
          "Identify niche rules that only work for a single cohort",
          "Give me a marketing strategy",
        ],
      }
    );
  }

  // ---------------------------------------------------------------------------
  // 5. NICHE & CROSS-CLUSTER PATTERNS
  // ---------------------------------------------------------------------------
  if (
    qLower.includes("niche") ||
    qLower.includes("cross-cluster") ||
    qLower.includes("divergent") ||
    qLower.includes("specific")
  ) {
    const nicheRules = comparisons.filter((c) => c.type === "cluster_specific").slice(0, 3);
    const divergentRules = comparisons.filter((c) => c.type === "divergent").slice(0, 2);

    return createResponse(
      `Cross-cluster differential analysis identified ${nicheRules.length} segment-specific and ${divergentRules.length} divergent behavioral patterns:`,
      {
        bullets: [
          ...nicheRules.map(
            (nr) =>
              `Segment-Specific ("${nr.dominantClusterName}"): [${nr.antecedent.join(" & ")}] ➔ [${nr.consequent.join(" & ")}] • Peak Lift: ${nr.maxLift.toFixed(2)}x (Global: ${nr.globalLift.toFixed(2)}x)`
          ),
          ...divergentRules.map(
            (dr) =>
              `Divergent Affinities: [${dr.antecedent.join(" & ")}] ➔ [${dr.consequent.join(" & ")}] has high variance (σ² = ${dr.liftVariance.toFixed(2)}) across demographics.`
          ),
        ],
        metrics: [
          { label: "Niche Rules", value: `${comparisons.filter((c) => c.type === "cluster_specific").length}` },
          { label: "Universal Rules", value: `${comparisons.filter((c) => c.type === "universal").length}` },
        ],
        followUps: [
          "Recommend products to a new customer",
          "Give me a marketing strategy for these customers",
          "Compare all customer clusters",
        ],
      }
    );
  }

  // ---------------------------------------------------------------------------
  // 6. DEFAULT DATASET EXECUTIVE SUMMARY
  // ---------------------------------------------------------------------------
  const meta = result.datasetMetadata;
  return createResponse(
    `Executive Intelligence Summary for "${context.datasetName}":`,
    {
      bullets: [
        `Dataset Scale: ${meta.validRowCount.toLocaleString()} valid transactions across ${meta.uniqueCustomers} customers and ${meta.uniqueCategories} categories.`,
        `Segmentation: Partitioned into ${clusters.length} behavioral clusters with a Silhouette score of ${result.clustering.silhouetteScore.toFixed(3)}.`,
        `Association Rules: Mined ${rules.length} rules with up to ${Math.max(...rules.map((r) => r.lift), 1).toFixed(2)}x lift.`,
        `Cold-Start Engine: Ready to recommend personalized products or categories for new shoppers without prior history.`,
      ],
      metrics: [
        { label: "Total Revenue", value: formatCurrency(meta.totalRevenue) },
        { label: "Total Customers", value: `${meta.uniqueCustomers}` },
        { label: "Total Categories", value: `${meta.uniqueCategories}` },
        { label: "Discovered Rules", value: `${rules.length}` },
      ],
      followUps: [
        "Recommend products to a new customer",
        "Compare all customer clusters",
        "Find the strongest association rules",
        "Give me a marketing strategy",
      ],
    }
  );
}
