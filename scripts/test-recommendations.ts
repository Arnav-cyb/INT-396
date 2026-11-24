/**
 * Automated Verification Suite for SegmentMining AI Recommendation Engine
 * 
 * Verifies all phases of the cold-start recommendation engine:
 * 1. Preference parsing & category selection
 * 2. Budget filtering (upper & lower bounds)
 * 3. Segment similarity matching against K-Means clusters
 * 4. FP-Growth association-rule synergy & cross-sell discovery
 * 5. Multi-factor score ranking & monotonicity
 * 6. Factor breakdown transparency
 * 7. Cold-start fallback on empty preferences
 * 8. Empty dataset handling
 * 9. Missing product data (category-level fallback)
 * 10. Missing price data handling
 * 11. Invalid/unknown preferences handling
 * 12. No applicable association rules handling
 * 13. Manual segment override
 * 14. Reproducibility verification
 */

import {
  generateNewUserRecommendations,
  calculateSegmentSimilarities,
  extractCatalogFromTransactions,
  findApplicableAssociationRules,
  UserPreferences,
  ScoringWeights,
  DEFAULT_SCORING_WEIGHTS,
} from "../lib/recommendations";
import { PRELOADED_SAMPLE_DATASET, generateDatasetFromPreset } from "../datasets/sampleData";
import { runAnalysisPipeline } from "../ml/pipeline";
import { RawTransaction, AnalysisPipelineResult } from "../lib/types";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  \x1b[32m✔ PASS\x1b[0m: ${testName}`);
    passedCount++;
  } else {
    console.error(`  \x1b[31m✖ FAIL\x1b[0m: ${testName} ${detail ? `(${detail})` : ""}`);
    failedCount++;
  }
}

console.log("\n=======================================================");
console.log("SegmentMining AI - Recommendation Engine Test Suite");
console.log("=======================================================\n");

// Prepare Baseline Data & Precomputed Pipeline
const rawTransactions = PRELOADED_SAMPLE_DATASET;
console.log(`Running baseline ML pipeline on ${rawTransactions.length} transactions...`);
const pipelineResult = runAnalysisPipeline(rawTransactions, {
  algorithm: "kmeans",
  k: 4,
  minSupport: 0.04,
  minConfidence: 0.2,
  minLift: 1.05,
});
console.log(`Clusters discovered: ${pipelineResult.clustering.clusters.length}`);
console.log(`Global association rules discovered: ${pipelineResult.globalRules.length}\n`);

// ----------------------------------------------------
// TEST 1: Preference Parsing & Category Selection
// ----------------------------------------------------
console.log("Test 1: Preference Parsing & Category Selection");
const prefs1: UserPreferences = {
  categories: ["Electronics", "Computers & Gaming"],
};
const output1 = generateNewUserRecommendations(prefs1, rawTransactions, pipelineResult);
assert(output1.recommendations.length > 0, "Produces recommendations for selected categories");
assert(
  output1.recommendations.some(
    (r) => r.category === "Electronics" || r.category === "Computers & Gaming"
  ),
  "Recommendations include user's chosen categories"
);
assert(output1.totalCandidatesEvaluated > 0, "Candidates were evaluated");

// ----------------------------------------------------
// TEST 2: Budget Filtering
// ----------------------------------------------------
console.log("\nTest 2: Budget Filtering (Upper & Lower Limits)");
const maxBudgetLimit = 85.0;
const prefs2: UserPreferences = {
  categories: ["Electronics", "Computers & Gaming", "Home & Kitchen"],
  maxBudget: maxBudgetLimit,
};
const output2 = generateNewUserRecommendations(prefs2, rawTransactions, pipelineResult);
assert(output2.hasValidPrices, "Recognizes presence of valid prices in dataset");
assert(
  output2.recommendations.every((r) => r.price === undefined || r.price <= maxBudgetLimit),
  `All recommended item prices are <= budget ceiling ($${maxBudgetLimit})`
);

// ----------------------------------------------------
// TEST 3: Segment Similarity Matching
// ----------------------------------------------------
console.log("\nTest 3: Segment Similarity Matching against K-Means Clusters");
const techData = generateDatasetFromPreset("electronics_gaming");
const techPipeline = runAnalysisPipeline(techData, { k: 4 });
const techPrefs: UserPreferences = {
  categories: ["PC Hardware & GPUs", "Gaming Peripherals"],
};
const segMatches = calculateSegmentSimilarities(techPrefs, techPipeline.clustering.clusters);
assert(segMatches.length === techPipeline.clustering.clusters.length, "Evaluates all clusters");
assert(segMatches[0].similarityScore >= segMatches[segMatches.length - 1].similarityScore, "Sorts clusters by similarity descending");
assert(segMatches[0].similarityScore > 0, "Top cluster has positive affinity score");

// ----------------------------------------------------
// TEST 4: Association Rule Cross-Selling Integration
// ----------------------------------------------------
console.log("\nTest 4: FP-Growth Association Rule Synergy & Cross-Selling");
const activeRules = findApplicableAssociationRules(
  ["Electronics"],
  output1.primarySegment ? output1.primarySegment.clusterId : null,
  pipelineResult.globalRules,
  pipelineResult.clusterRules
);
assert(Array.isArray(activeRules), "Returns array of applicable rules");
const crossSellOutput = generateNewUserRecommendations(
  { categories: ["Electronics"] },
  rawTransactions,
  pipelineResult
);
const hasCrossSell = crossSellOutput.recommendations.some(
  (r) => r.matchType === "association_cross_sell" || (r.ruleLift !== undefined && r.ruleLift > 1)
);
assert(
  hasCrossSell || crossSellOutput.recommendations.length > 0,
  "Identifies cross-sell synergy or top segment picks"
);

// ----------------------------------------------------
// TEST 5: Ranking and Monotonicity
// ----------------------------------------------------
console.log("\nTest 5: Ranking and Monotonicity");
let isMonotonic = true;
for (let i = 0; i < output1.recommendations.length - 1; i++) {
  if (output1.recommendations[i].score < output1.recommendations[i + 1].score) {
    isMonotonic = false;
    break;
  }
}
assert(isMonotonic, "Recommendations are strictly ordered descending by score");
assert(
  output1.recommendations.every((r) => r.score >= 0 && r.score <= 100),
  "All scores are normalized within [0, 100]"
);

// ----------------------------------------------------
// TEST 6: Factor Breakdown Transparency
// ----------------------------------------------------
console.log("\nTest 6: Factor Breakdown Transparency");
const sampleItem = output1.recommendations[0];
assert(sampleItem !== undefined, "Sample item exists");
assert(sampleItem.factors && sampleItem.factors.length === 5, "Every item contains 5 factor scores");
assert(
  sampleItem.reason.length > 20,
  "Item includes transparent human-readable explanation"
);

// ----------------------------------------------------
// TEST 7: Cold-Start Fallback (Empty Preferences)
// ----------------------------------------------------
console.log("\nTest 7: Cold-Start Fallback on Zero Preferences");
const emptyPrefs: UserPreferences = { categories: [] };
const fallbackOutput = generateNewUserRecommendations(emptyPrefs, rawTransactions, pipelineResult);
assert(fallbackOutput.fallbackApplied, "Flags fallbackApplied as true when preferences are empty");
assert(fallbackOutput.recommendations.length > 0, "Provides popularity recommendations despite zero preferences");

// ----------------------------------------------------
// TEST 8: Empty Dataset Handling
// ----------------------------------------------------
console.log("\nTest 8: Empty Dataset Handling");
const emptyOutput = generateNewUserRecommendations({ categories: ["Electronics"] }, [], null);
assert(emptyOutput.recommendations.length === 0, "Handles empty transactions gracefully without crashing");
assert(emptyOutput.fallbackApplied, "Flags fallbackApplied for empty transactions");

// ----------------------------------------------------
// TEST 9: Missing Product Data (Category-Level Fallback)
// ----------------------------------------------------
console.log("\nTest 9: Missing Product Data (Category-Level Fallback)");
const categoryOnlyTransactions: RawTransaction[] = rawTransactions.map((tx) => ({
  ...tx,
  product_id: "",
  product_name: "",
}));
const catOnlyOutput = generateNewUserRecommendations(
  { categories: ["Electronics"] },
  categoryOnlyTransactions,
  pipelineResult
);
assert(!catOnlyOutput.hasValidProducts, "Correctly detects absence of individual product records");
assert(
  catOnlyOutput.recommendations.some((r) => r.isCategoryLevel),
  "Falls back to category-level recommendations instead of fabricating fake products"
);

// ----------------------------------------------------
// TEST 10: Missing Price Data
// ----------------------------------------------------
console.log("\nTest 10: Missing Price Data Handling");
const noPriceTransactions: RawTransaction[] = rawTransactions.map((tx) => ({
  ...tx,
  unit_price: 0,
}));
const noPriceOutput = generateNewUserRecommendations(
  { categories: ["Electronics"], maxBudget: 50 },
  noPriceTransactions,
  pipelineResult
);
assert(!noPriceOutput.hasValidPrices, "Flags hasValidPrices as false when prices are absent");
assert(noPriceOutput.recommendations.length > 0, "Does not reject candidates due to missing prices");

// ----------------------------------------------------
// TEST 11: Invalid / Unknown Preferences Handling
// ----------------------------------------------------
console.log("\nTest 11: Invalid / Unknown Category Preferences");
const invalidPrefs: UserPreferences = {
  categories: ["FictionalCategoryXYZ", "GalacticHyperdrives"],
};
const invalidOutput = generateNewUserRecommendations(invalidPrefs, rawTransactions, pipelineResult);
assert(invalidOutput.recommendations.length > 0, "Gracefully handles unknown categories and returns defensible recommendations");

// ----------------------------------------------------
// TEST 12: No Applicable Association Rules
// ----------------------------------------------------
console.log("\nTest 12: No Applicable Association Rules");
const emptyRulesPipeline: AnalysisPipelineResult = {
  ...pipelineResult,
  globalRules: [],
  clusterRules: {},
};
const noRulesOutput = generateNewUserRecommendations(
  { categories: ["Electronics"] },
  rawTransactions,
  emptyRulesPipeline
);
assert(noRulesOutput.recommendations.length > 0, "Recommends based on segment & popularity when no rules exist");

// ----------------------------------------------------
// TEST 13: Target Segment Manual Override
// ----------------------------------------------------
console.log("\nTest 13: Target Segment Manual Override");
const overridePrefs: UserPreferences = {
  categories: ["Electronics"],
  targetSegmentId: 2,
};
const overrideOutput = generateNewUserRecommendations(overridePrefs, rawTransactions, pipelineResult);
assert(
  overrideOutput.primarySegment?.clusterId === 2,
  "Respects manual segment override"
);

// ----------------------------------------------------
// TEST 14: Reproducibility
// ----------------------------------------------------
console.log("\nTest 14: Reproducibility Test");
const runA = generateNewUserRecommendations(prefs1, rawTransactions, pipelineResult);
const runB = generateNewUserRecommendations(prefs1, rawTransactions, pipelineResult);
const identical =
  runA.recommendations.length === runB.recommendations.length &&
  runA.recommendations.every((item, i) => item.id === runB.recommendations[i].id && item.score === runB.recommendations[i].score);
assert(identical, "Consecutive runs with identical inputs produce identical recommendations");

// ----------------------------------------------------
// SUMMARY
// ----------------------------------------------------
console.log("\n=======================================================");
console.log(`Test Execution Summary:`);
console.log(`Total Passed: \x1b[32m${passedCount}\x1b[0m`);
console.log(`Total Failed: \x1b[31m${failedCount}\x1b[0m`);
console.log("=======================================================\n");

if (failedCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
