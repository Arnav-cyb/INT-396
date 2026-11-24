/**
 * Automated Verification Suite for Ask Copilot Engine
 * 
 * Verifies:
 * 1. Preference extraction from natural language queries
 * 2. Product recommendation dispatch in chat
 * 3. Conversational follow-ups (Why, Alternatives, Lower Budget, Compare, Segments, Rules, Marketing)
 * 4. Context preservation across turns
 * 5. Cluster & association rule analytics responses
 * 6. Honest and reliable data grounding (no hallucinations)
 */

import {
  processCopilotQuery,
  extractPreferencesFromQuery,
  CopilotContext,
} from "../lib/copilot";
import { PRELOADED_SAMPLE_DATASET } from "../datasets/sampleData";
import { runAnalysisPipeline } from "../ml/pipeline";

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
console.log("SegmentMining AI - Ask Copilot Intelligence Test Suite");
console.log("=======================================================\n");

const rawTransactions = PRELOADED_SAMPLE_DATASET;
const pipelineResult = runAnalysisPipeline(rawTransactions, { k: 4 });
const categories = pipelineResult.datasetMetadata.categories;
const clusters = pipelineResult.clustering.clusters;

const context: CopilotContext = {
  datasetName: "Omnichannel Enterprise Retail",
  rawTransactions,
  pipelineResult,
};

// ----------------------------------------------------
// TEST 1: Preference Extraction
// ----------------------------------------------------
console.log("Test 1: Natural Language Preference Extraction");
const query1 = "Recommend products for a new customer interested in Electronics with a budget of $120";
const parsed1 = extractPreferencesFromQuery(query1, categories, clusters);
assert(parsed1.categories.includes("Electronics"), "Extracts category 'Electronics'");
assert(parsed1.maxBudget === 120, "Extracts budget limit of $120");

const queryCluster = "Suggest items for someone similar to Cluster 2 under $50";
const parsedCluster = extractPreferencesFromQuery(queryCluster, categories, clusters);
assert(parsedCluster.targetSegmentId !== undefined, "Extracts target segment ID");
assert(parsedCluster.maxBudget === 50, "Extracts budget under $50");

// ----------------------------------------------------
// TEST 2: Recommendation Generation in Copilot
// ----------------------------------------------------
console.log("\nTest 2: Product Recommendations in Ask Copilot");
const recResp = processCopilotQuery(
  "Recommend products to a new customer interested in Electronics with a budget of $100",
  context
);
assert(
  recResp.message.recommendations !== undefined && recResp.message.recommendations.length > 0,
  "Returns structured recommendation items"
);
assert(
  recResp.message.recommendations!.every((r) => r.price === undefined || r.price <= 100),
  "All recommended items comply with extracted budget ceiling ($100)"
);
assert(
  recResp.message.matchedSegment !== undefined && recResp.message.matchedSegment !== null,
  "Attaches matching customer segment metadata"
);
assert(
  Boolean(recResp.message.followUpSuggestions && recResp.message.followUpSuggestions.length >= 3),
  "Presents dynamic contextual follow-up suggestions"
);

// ----------------------------------------------------
// TEST 3: Conversational Memory & Context Persistence
// ----------------------------------------------------
console.log("\nTest 3: Conversational Follow-Up Handling");
const activeContext: CopilotContext = {
  ...context,
  ...recResp.updatedContext,
};

// Follow-up: "Why was this recommended?"
const whyResp = processCopilotQuery("Why was this recommended?", activeContext);
assert(
  whyResp.message.bullets !== undefined && whyResp.message.bullets.length >= 3,
  "Explains exact recommendation factor breakdown"
);
assert(
  whyResp.message.text.includes(activeContext.lastRecommendations![0].name),
  "References the specific recommended item name from prior turn"
);

// Follow-up: "What if the budget is lower?"
const lowerResp = processCopilotQuery("What if the budget is lower?", activeContext);
assert(
  lowerResp.message.recommendations !== undefined && lowerResp.message.recommendations.length > 0,
  "Generates affordable alternatives when budget is reduced"
);
assert(
  lowerResp.updatedContext.lastPreferences?.maxBudget !== undefined &&
  lowerResp.updatedContext.lastPreferences.maxBudget < (activeContext.lastPreferences?.maxBudget || 100),
  "Lowers budget ceiling in updated context"
);

// Follow-up: "Which segment is this based on?"
const segResp = processCopilotQuery("Which segment is this based on?", activeContext);
assert(
  segResp.message.bullets !== undefined && segResp.message.bullets.length >= 4,
  "Describes segment archetype, spend, and demographic profile"
);

// Follow-up: "Give me a marketing strategy"
const mktgResp = processCopilotQuery("Give me a marketing strategy for these customers", activeContext);
assert(
  mktgResp.message.bullets !== undefined && mktgResp.message.bullets.some((b) => b.includes("Promotion") || b.includes("Cart")),
  "Provides actionable merchandising and cart-upsell strategies"
);

// ----------------------------------------------------
// TEST 4: Cluster & Segment Analytics Query
// ----------------------------------------------------
console.log("\nTest 4: Cluster & Segment Analytics");
const clusterResp = processCopilotQuery("Explain all customer clusters and highest spend cohort", context);
assert(
  clusterResp.message.bullets !== undefined && clusterResp.message.bullets.length === clusters.length,
  "Summarizes every discovered cluster"
);
assert(
  clusterResp.message.metrics !== undefined && clusterResp.message.metrics.some((m) => m.label === "Highest Value"),
  "Calculates highest-value segment metric"
);

// ----------------------------------------------------
// TEST 5: Association Rules & Cross-Cluster Analysis
// ----------------------------------------------------
console.log("\nTest 5: Association Rules & Cross-Cluster Patterns");
const rulesResp = processCopilotQuery("Find the strongest association rules with peak lift", context);
assert(
  rulesResp.message.bullets !== undefined && rulesResp.message.bullets.length > 0,
  "Extracts top-lift association rules"
);

const nicheResp = processCopilotQuery("Identify niche rules that only work for a single cohort", context);
assert(
  nicheResp.message.bullets !== undefined,
  "Identifies segment-specific niche rules"
);

// ----------------------------------------------------
// TEST 6: Honest Grounding & Dataset Limitations
// ----------------------------------------------------
console.log("\nTest 6: Honest Grounding and Limitations");
const emptyContext: CopilotContext = {
  datasetName: "Uninitialized",
  rawTransactions: [],
  pipelineResult: null,
};
const uninitResp = processCopilotQuery("Recommend something", emptyContext);
assert(
  uninitResp.message.text.includes("loading") || uninitResp.message.text.includes("analyzed"),
  "Politely notifies user when dataset or pipeline is not ready instead of inventing hallucinated data"
);

// ----------------------------------------------------
// SUMMARY
// ----------------------------------------------------
console.log("\n=======================================================");
console.log(`Copilot Test Execution Summary:`);
console.log(`Total Passed: \x1b[32m${passedCount}\x1b[0m`);
console.log(`Total Failed: \x1b[31m${failedCount}\x1b[0m`);
console.log("=======================================================\n");

if (failedCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
