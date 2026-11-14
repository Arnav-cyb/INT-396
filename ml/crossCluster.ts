import { AssociationRule, ClusterSummary, CrossClusterComparisonRule } from "../lib/types";

export function compareRulesAcrossClusters(
  globalRules: AssociationRule[],
  clusterRulesMap: Record<number, AssociationRule[]>,
  clusters: ClusterSummary[]
): CrossClusterComparisonRule[] {
  // Collect all unique rule keys (antecedent -> consequent)
  const ruleKeyMap = new Map<
    string,
    {
      antecedent: string[];
      consequent: string[];
      globalRule?: AssociationRule;
      clusterRules: Map<number, AssociationRule>;
    }
  >();

  // Add global rules
  for (const gr of globalRules) {
    const key = `${gr.antecedent.join("+")} => ${gr.consequent.join("+")}`;
    if (!ruleKeyMap.has(key)) {
      ruleKeyMap.set(key, {
        antecedent: gr.antecedent,
        consequent: gr.consequent,
        globalRule: gr,
        clusterRules: new Map(),
      });
    } else {
      ruleKeyMap.get(key)!.globalRule = gr;
    }
  }

  // Add cluster-specific rules
  for (const cluster of clusters) {
    const cRules = clusterRulesMap[cluster.clusterId] || [];
    for (const cr of cRules) {
      const key = `${cr.antecedent.join("+")} => ${cr.consequent.join("+")}`;
      if (!ruleKeyMap.has(key)) {
        ruleKeyMap.set(key, {
          antecedent: cr.antecedent,
          consequent: cr.consequent,
          clusterRules: new Map(),
        });
      }
      ruleKeyMap.get(key)!.clusterRules.set(cluster.clusterId, cr);
    }
  }

  const comparisons: CrossClusterComparisonRule[] = [];

  ruleKeyMap.forEach(({ antecedent, consequent, globalRule, clusterRules }, ruleKey) => {
    const clusterStats: CrossClusterComparisonRule["clusterStats"] = {};
    const lifts: number[] = [];
    let maxLift = -Infinity;
    let minLift = Infinity;
    let dominantClusterId = clusters[0]?.clusterId ?? 0;
    let dominantClusterName = clusters[0]?.name ?? "General";
    let activeInClustersCount = 0;

    for (const cluster of clusters) {
      const cId = cluster.clusterId;
      const matchedRule = clusterRules.get(cId);

      if (matchedRule) {
        activeInClustersCount++;
        lifts.push(matchedRule.lift);
        if (matchedRule.lift > maxLift) {
          maxLift = matchedRule.lift;
          dominantClusterId = cId;
          dominantClusterName = cluster.name;
        }
        if (matchedRule.lift < minLift) {
          minLift = matchedRule.lift;
        }

        clusterStats[cId] = {
          clusterName: cluster.name,
          support: matchedRule.support,
          confidence: matchedRule.confidence,
          lift: matchedRule.lift,
          isSignificant: matchedRule.lift > 1.25 && matchedRule.confidence > 0.25,
        };
      } else {
        lifts.push(0);
        minLift = Math.min(minLift, 0);
        clusterStats[cId] = {
          clusterName: cluster.name,
          support: 0,
          confidence: 0,
          lift: 0,
          isSignificant: false,
        };
      }
    }

    if (maxLift === -Infinity) maxLift = globalRule ? globalRule.lift : 1;
    if (minLift === Infinity) minLift = 0;

    // Calculate lift variance
    const meanLift = lifts.length > 0 ? lifts.reduce((a, b) => a + b, 0) / lifts.length : 0;
    const liftVariance =
      lifts.length > 1
        ? lifts.reduce((sum, l) => sum + Math.pow(l - meanLift, 2), 0) / (lifts.length - 1)
        : 0;

    // Rule classification
    let type: CrossClusterComparisonRule["type"] = "universal";
    if (activeInClustersCount === 1) {
      type = "cluster_specific";
    } else if (liftVariance > 0.8 || maxLift - minLift > 1.2) {
      type = "divergent";
    } else if (activeInClustersCount > 1 && activeInClustersCount < clusters.length) {
      type = "emerging";
    }

    // Generate Business Recommendation
    let crossSellingOpportunity = `Promote ${consequent.join(", ")} to customers browsing ${antecedent.join(", ")}.`;
    let actionRecommendation = `Implement automated recommendations for this pair across all customer segments.`;

    if (type === "cluster_specific") {
      crossSellingOpportunity = `Targeted upsell for "${dominantClusterName}": strong segment affinity (Lift: ${maxLift.toFixed(
        2
      )}x).`;
      actionRecommendation = `Target specifically to ${dominantClusterName} via personalized newsletter emails and customized home page carousel banners.`;
    } else if (type === "divergent") {
      crossSellingOpportunity = `Segment divergence detected: high responsiveness in ${dominantClusterName} (Lift: ${maxLift.toFixed(
        2
      )}x), but ineffective in other segments.`;
      actionRecommendation = `Avoid generic cross-selling: display recommendation only when user belongs to ${dominantClusterName} segment to preserve conversion rates.`;
    } else if (type === "universal") {
      crossSellingOpportunity = `Broad market synergy: consistent co-purchase across all segments.`;
      actionRecommendation = `Create a flagship permanent bundle and display it in main product navigation.`;
    }

    comparisons.push({
      ruleKey,
      antecedent,
      consequent,
      type,
      dominantClusterId,
      dominantClusterName,
      globalLift: globalRule ? globalRule.lift : Math.round(meanLift * 100) / 100,
      maxLift: Math.round(maxLift * 100) / 100,
      minLift: Math.round(minLift * 100) / 100,
      liftVariance: Math.round(liftVariance * 100) / 100,
      clusterStats,
      crossSellingOpportunity,
      actionRecommendation,
    });
  });

  return comparisons.sort((a, b) => b.maxLift - a.maxLift);
}
