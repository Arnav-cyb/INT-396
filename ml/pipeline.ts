import {
  AnalysisPipelineResult,
  AssociationRule,
  CategoryMatrixCell,
  ClusterSummary,
  FrequentItemset,
  RawTransaction,
} from "../lib/types";
import { runApriori } from "./apriori";
import { generateAssociationRules } from "./association";
import { compareRulesAcrossClusters } from "./crossCluster";
import { runDBSCAN } from "./dbscan";
import { runFPGrowth } from "./fpgrowth";
import { runKMeans } from "./kmeans";
import { computeDaviesBouldinIndex, computeSilhouetteScore } from "./metrics";
import { computePCA } from "./pca";
import { cleanTransactions, StandardScaler } from "./preprocessing";

export interface PipelineOptions {
  datasetName?: string;
  algorithm?: "kmeans" | "dbscan";
  k?: number;
  eps?: number;
  minSamples?: number;
  ruleAlgorithm?: "fpgrowth" | "apriori";
  minSupport?: number;
  minConfidence?: number;
  minLift?: number;
}

const CLUSTER_COLORS = [
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#6366f1", // Indigo
  "#64748b", // Slate
];

export function runAnalysisPipeline(
  rawTransactions: RawTransaction[],
  options: PipelineOptions = {}
): AnalysisPipelineResult {
  const startTime = Date.now();
  const {
    datasetName = "Retail Transactions",
    algorithm = "kmeans",
    k = 4,
    eps = 1.8,
    minSamples = 4,
    ruleAlgorithm = "fpgrowth",
    minSupport = 0.04,
    minConfidence = 0.2,
    minLift = 1.05,
  } = options;

  // 1. Clean transactions and build customer vectors
  const { cleaned, summary, basketsByTransaction, customerProfiles } = cleanTransactions(rawTransactions);

  if (cleaned.length === 0 || customerProfiles.length === 0) {
    throw new Error("Dataset contains no valid transactions after cleaning.");
  }

  // 2. Standardize customer feature vectors
  const featureMatrix = customerProfiles.map((c) => c.features);
  const scaler = new StandardScaler();
  const scaledMatrix = scaler.fitTransform(featureMatrix);

  // 3. Run Clustering
  let labels: number[] = [];
  let inertia: number | undefined;
  let noiseCount = 0;
  let clusterIds: number[] = [];

  if (algorithm === "kmeans") {
    const kmeansResult = runKMeans(scaledMatrix, k, 100, 5);
    labels = kmeansResult.labels;
    inertia = kmeansResult.inertia;
    clusterIds = Array.from(new Set(labels)).sort((a, b) => a - b);
  } else {
    const dbscanResult = runDBSCAN(scaledMatrix, eps, minSamples);
    labels = dbscanResult.labels;
    noiseCount = dbscanResult.noiseCount;
    clusterIds = Array.from(new Set(labels.filter((l) => l >= 0))).sort((a, b) => a - b);
    if (clusterIds.length === 0) {
      // Fallback to single cluster if dbscan found all noise
      labels = labels.map(() => 0);
      clusterIds = [0];
    }
  }

  // 4. Compute PCA (2D Coordinates)
  const pcaResult = computePCA(scaledMatrix, 2);
  for (let i = 0; i < customerProfiles.length; i++) {
    customerProfiles[i].pcaCoords = pcaResult.projected[i];
    customerProfiles[i].cluster = labels[i];
  }

  // 5. Cluster Evaluation Metrics
  const silhouetteScore = computeSilhouetteScore(scaledMatrix, labels);
  const daviesBouldinIndex = computeDaviesBouldinIndex(scaledMatrix, labels);

  // 6. Cluster Archetypes and Profiles
  const clusters: ClusterSummary[] = [];
  const customerClusterMap: Record<string, number> = {};

  for (let i = 0; i < customerProfiles.length; i++) {
    customerClusterMap[customerProfiles[i].customerId] = labels[i];
  }

  for (let idx = 0; idx < clusterIds.length; idx++) {
    const cId = clusterIds[idx];
    const memberProfiles = customerProfiles.filter((p) => p.cluster === cId);
    if (memberProfiles.length === 0) continue;

    const custCount = memberProfiles.length;
    const pct = Math.round((custCount / customerProfiles.length) * 1000) / 10;
    const totalSpend = memberProfiles.reduce((sum, p) => sum + p.totalSpend, 0);
    const avgCustSpend = Math.round((totalSpend / custCount) * 100) / 100;
    const avgBasket = Math.round((memberProfiles.reduce((s, p) => s + p.avgBasketSize, 0) / custCount) * 10) / 10;
    const avgTx = Math.round((memberProfiles.reduce((s, p) => s + p.transactionCount, 0) / custCount) * 10) / 10;

    // Category breakdown
    const catTotals: Record<string, number> = {};
    for (const cat of summary.categories) {
      catTotals[cat] = 0;
    }
    for (const p of memberProfiles) {
      for (const cat of summary.categories) {
        catTotals[cat] += p.categorySpend[cat] || 0;
      }
    }

    const topCategories = summary.categories
      .map((cat) => ({
        category: cat,
        share: totalSpend > 0 ? Math.round((catTotals[cat] / totalSpend) * 1000) / 10 : 0,
        avgSpend: Math.round((catTotals[cat] / custCount) * 100) / 100,
      }))
      .sort((a, b) => b.share - a.share);

    // Dominant demographic
    const ageCounts: Record<string, number> = {};
    const regionCounts: Record<string, number> = {};
    for (const p of memberProfiles) {
      ageCounts[p.ageGroup] = (ageCounts[p.ageGroup] || 0) + 1;
      regionCounts[p.region] = (regionCounts[p.region] || 0) + 1;
    }
    const dominantAgeGroup =
      Object.entries(ageCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "All Ages";
    const dominantRegion =
      Object.entries(regionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Global";

    // Dynamic Archetype detection
    const topCatName = topCategories[0]?.category || "General";
    let archetype = `${topCatName} Segment`;
    let desc = `Customers with primary spending affinity towards ${topCatName}.`;

    if (avgCustSpend > 500) {
      archetype = `Premium ${topCatName} & VIP`;
      desc = `High-value buyers generating significant basket sizes ($${avgCustSpend.toFixed(
        0
      )} avg). Strong recurring engagement.`;
    } else if (avgBasket > 4) {
      archetype = `Bulk & Multi-Category Buyers`;
      desc = `Shoppers purchasing diverse cross-category baskets with high item counts (${avgBasket.toFixed(
        1
      )} items/tx).`;
    } else if (topCategories[0]?.share > 45) {
      archetype = `Specialized ${topCatName} Enthusiasts`;
      desc = `Focused category specialists allocating ${topCategories[0].share}% of their wallet to ${topCatName}.`;
    } else {
      archetype = `Balanced Everyday Shoppers`;
      desc = `Omnichannel regular customers with moderate purchase frequency across everyday categories.`;
    }

    clusters.push({
      clusterId: cId,
      name: `Cluster ${cId + 1}: ${archetype}`,
      archetype,
      customerCount: custCount,
      percentage: pct,
      totalSpend: Math.round(totalSpend * 100) / 100,
      avgCustomerSpend: avgCustSpend,
      avgBasketSize: avgBasket,
      avgTransactions: avgTx,
      topCategories,
      dominantAgeGroup,
      dominantRegion,
      description: desc,
      color: CLUSTER_COLORS[idx % CLUSTER_COLORS.length],
    });
  }

  // 7. Group transaction baskets by cluster
  const globalBaskets: string[][] = [];
  const clusterBasketsMap: Record<number, string[][]> = {};
  for (const c of clusters) {
    clusterBasketsMap[c.clusterId] = [];
  }

  basketsByTransaction.forEach((basket) => {
    const categoriesArray = Array.from(basket.categories);
    globalBaskets.push(categoriesArray);

    const cId = customerClusterMap[basket.customerId];
    if (cId !== undefined && clusterBasketsMap[cId]) {
      clusterBasketsMap[cId].push(categoriesArray);
    }
  });

  // 8. Frequent Itemset Mining
  const itemsetMiner = ruleAlgorithm === "fpgrowth" ? runFPGrowth : runApriori;
  const globalItemsets = itemsetMiner(globalBaskets, minSupport);

  const frequentItemsetsByScope: Record<string, FrequentItemset[]> = {
    global: globalItemsets,
  };

  const clusterRules: Record<number, AssociationRule[]> = {};

  for (const c of clusters) {
    const cBaskets = clusterBasketsMap[c.clusterId] || [];
    if (cBaskets.length > 5) {
      const cItemsets = itemsetMiner(cBaskets, Math.max(0.02, minSupport * 0.8));
      frequentItemsetsByScope[`cluster_${c.clusterId}`] = cItemsets;

      clusterRules[c.clusterId] = generateAssociationRules(
        cItemsets,
        cBaskets.length,
        c.clusterId,
        c.name,
        minConfidence,
        minLift
      );
    } else {
      clusterRules[c.clusterId] = [];
    }
  }

  // 9. Global Association Rules
  const globalRules = generateAssociationRules(
    globalItemsets,
    globalBaskets.length,
    "global",
    "All Customers",
    minConfidence,
    minLift
  );

  // 10. Cross-Cluster Comparison
  const crossClusterComparisons = compareRulesAcrossClusters(
    globalRules,
    clusterRules,
    clusters
  );

  // 11. Co-occurrence Matrix
  const coOccurrenceCounts: Record<string, Record<string, number>> = {};
  for (const cat1 of summary.categories) {
    coOccurrenceCounts[cat1] = {};
    for (const cat2 of summary.categories) {
      coOccurrenceCounts[cat1][cat2] = 0;
    }
  }

  for (const basket of globalBaskets) {
    for (let i = 0; i < basket.length; i++) {
      for (let j = 0; j < basket.length; j++) {
        const cat1 = basket[i];
        const cat2 = basket[j];
        if (coOccurrenceCounts[cat1] && coOccurrenceCounts[cat1][cat2] !== undefined) {
          coOccurrenceCounts[cat1][cat2]++;
        }
      }
    }
  }

  const coOccurrenceMatrix: CategoryMatrixCell[] = [];
  const totalBaskets = globalBaskets.length || 1;

  for (const cat1 of summary.categories) {
    const s1 = (coOccurrenceCounts[cat1]?.[cat1] || 0) / totalBaskets;
    for (const cat2 of summary.categories) {
      const pairCount = coOccurrenceCounts[cat1]?.[cat2] || 0;
      const s2 = (coOccurrenceCounts[cat2]?.[cat2] || 0) / totalBaskets;
      const support = pairCount / totalBaskets;
      const confidence = s1 > 0 ? support / s1 : 0;
      const lift = s1 > 0 && s2 > 0 ? support / (s1 * s2) : 0;

      coOccurrenceMatrix.push({
        source: cat1,
        target: cat2,
        coOccurrenceCount: pairCount,
        support: Math.round(support * 1000) / 1000,
        confidence: Math.round(confidence * 1000) / 1000,
        lift: Math.round(lift * 100) / 100,
      });
    }
  }

  // PCA points formatting
  const pcaPoints = customerProfiles.map((p) => {
    const cId = p.cluster ?? 0;
    const clusterObj = clusters.find((c) => c.clusterId === cId);
    const topCat = Object.entries(p.categorySpend).sort((a, b) => b[1] - a[1])[0]?.[0] || "General";

    return {
      customerId: p.customerId,
      x: p.pcaCoords?.[0] || 0,
      y: p.pcaCoords?.[1] || 0,
      cluster: cId,
      clusterName: clusterObj ? clusterObj.archetype : `Cluster ${cId}`,
      totalSpend: p.totalSpend,
      dominantCategory: topCat,
    };
  });

  const executionTimeMs = Date.now() - startTime;

  // Find date range
  const dates = cleaned.map((t) => t.transaction_date).sort();
  const dateRange = {
    start: dates[0] || "2024-01-01",
    end: dates[dates.length - 1] || "2024-12-31",
  };

  return {
    datasetMetadata: {
      name: datasetName,
      rowCount: summary.totalRawRows,
      validRowCount: summary.validRows,
      uniqueCustomers: summary.uniqueCustomers,
      uniqueTransactions: summary.uniqueTransactions,
      uniqueProducts: new Set(cleaned.map((t) => t.product_id)).size,
      uniqueCategories: summary.categories.length,
      categories: summary.categories,
      dateRange,
      totalRevenue: summary.revenueTotal,
    },
    clustering: {
      algorithm,
      k,
      eps,
      minSamples,
      clusters,
      customerAssignments: customerClusterMap,
      silhouetteScore,
      daviesBouldinIndex,
      inertia,
      noiseCount,
      executionTimeMs,
      pcaPoints,
    },
    globalRules,
    clusterRules,
    frequentItemsets: frequentItemsetsByScope,
    crossClusterComparisons,
    coOccurrenceMatrix,
    timestamp: new Date().toISOString(),
  };
}
