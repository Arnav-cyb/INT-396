import { AssociationRule, FrequentItemset } from "../lib/types";

export function generateAssociationRules(
  itemsets: FrequentItemset[],
  totalTransactions: number,
  clusterId: number | "global" = "global",
  clusterName: string = "All Customers",
  minConfidence: number = 0.2,
  minLift: number = 1.05
): AssociationRule[] {
  if (itemsets.length === 0 || totalTransactions === 0) return [];

  // Map itemsets to support for fast lookup
  const supportMap = new Map<string, number>();
  for (const itemset of itemsets) {
    const key = [...itemset.items].sort().join("|||");
    supportMap.set(key, itemset.support);
  }

  const rules: AssociationRule[] = [];

  for (const itemset of itemsets) {
    if (itemset.items.length < 2) continue;

    const items = itemset.items;
    const itemsetSupport = itemset.support;
    const subsets = getAllSubsets(items);

    for (const antecedent of subsets) {
      if (antecedent.length === 0 || antecedent.length === items.length) continue;

      const consequent = items.filter((x) => !antecedent.includes(x)).sort();
      if (consequent.length === 0) continue;

      const antKey = [...antecedent].sort().join("|||");
      const antSupport = supportMap.get(antKey);
      if (!antSupport || antSupport <= 0) continue;

      const consKey = [...consequent].sort().join("|||");
      const consSupport = supportMap.get(consKey);
      if (!consSupport || consSupport <= 0) continue;

      const confidence = itemsetSupport / antSupport;
      if (confidence < minConfidence) continue;

      const lift = confidence / consSupport;
      if (lift < minLift) continue;

      const leverage = itemsetSupport - antSupport * consSupport;
      const conviction =
        confidence >= 1
          ? 99.99
          : (1 - consSupport) / Math.max(1e-4, 1 - confidence);

      const ruleId = `rule-${clusterId}-${antecedent.join("_")}-to-${consequent.join("_")}`;

      // Chi-Square Test of Independence on 2x2 Contingency Table
      // O11: Antecedent & Consequent
      // O10: Antecedent & NOT Consequent
      // O01: NOT Antecedent & Consequent
      // O00: NOT Antecedent & NOT Consequent
      const o11 = Math.round(itemsetSupport * totalTransactions);
      const o10 = Math.max(0, Math.round(antSupport * totalTransactions) - o11);
      const o01 = Math.max(0, Math.round(consSupport * totalTransactions) - o11);
      const o00 = Math.max(0, totalTransactions - o11 - o10 - o01);

      const num = totalTransactions * Math.pow(Math.abs(o11 * o00 - o10 * o01), 2);
      const denom = (o11 + o10) * (o01 + o00) * (o11 + o01) * (o10 + o00);
      const chiSquare = denom > 0 ? Math.round((num / denom) * 100) / 100 : 0;

      let pValue = 1.0;
      let significanceLabel = "Not Significant";
      if (chiSquare >= 10.828) {
        pValue = 0.001;
        significanceLabel = "p < 0.001 (Highly Significant)";
      } else if (chiSquare >= 6.635) {
        pValue = 0.01;
        significanceLabel = "p < 0.01 (Very Significant)";
      } else if (chiSquare >= 3.841) {
        pValue = 0.05;
        significanceLabel = "p < 0.05 (Statistically Significant)";
      }

      let businessAction = `Cross-promote ${consequent.join(" & ")} whenever customers buy ${antecedent.join(" & ")}.`;
      if (lift > 2.0) {
        businessAction = `High-affinity bundle: Create a combo package featuring ${antecedent.join(" & ")} with ${consequent.join(" & ")} offering a 10% bundle discount.`;
      } else if (confidence > 0.6) {
        businessAction = `Checkout prompt: Recommend ${consequent.join(" & ")} in the cart review step when ${antecedent.join(" & ")} is added.`;
      }

      rules.push({
        id: ruleId,
        clusterId,
        clusterName,
        antecedent: [...antecedent].sort(),
        consequent: [...consequent].sort(),
        support: Math.round(itemsetSupport * 1000) / 1000,
        confidence: Math.round(confidence * 1000) / 1000,
        lift: Math.round(lift * 100) / 100,
        leverage: Math.round(leverage * 1000) / 1000,
        conviction: Math.round(Math.min(conviction, 99.99) * 100) / 100,
        antecedentSupport: Math.round(antSupport * 1000) / 1000,
        consequentSupport: Math.round(consSupport * 1000) / 1000,
        count: itemset.count,
        totalTransactions,
        businessAction,
        chiSquare,
        pValue,
        significanceLabel,
      });
    }
  }

  // Sort descending by lift, then confidence
  return rules.sort((a, b) => b.lift - a.lift || b.confidence - a.confidence);
}

function getAllSubsets<T>(array: T[]): T[][] {
  const result: T[][] = [[]];
  for (const element of array) {
    const len = result.length;
    for (let i = 0; i < len; i++) {
      result.push([...result[i], element]);
    }
  }
  return result;
}
