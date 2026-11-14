import { FrequentItemset } from "../lib/types";

/**
 * Apriori Algorithm for Frequent Itemset Mining
 */

export function runApriori(
  transactions: string[][],
  minSupport: number = 0.05
): FrequentItemset[] {
  const n = transactions.length;
  if (n === 0) return [];

  const minCount = Math.ceil(minSupport * n);
  const frequentItemsets: FrequentItemset[] = [];

  // Step 1: Count 1-itemsets
  const itemCounts = new Map<string, number>();
  for (const tx of transactions) {
    const uniqueItems = Array.from(new Set(tx));
    for (const item of uniqueItems) {
      itemCounts.set(item, (itemCounts.get(item) || 0) + 1);
    }
  }

  // Filter frequent 1-itemsets
  let currentFreq: string[][] = [];
  itemCounts.forEach((count, item) => {
    if (count >= minCount) {
      currentFreq.push([item]);
      frequentItemsets.push({
        items: [item],
        support: Math.round((count / n) * 1000) / 1000,
        count,
      });
    }
  });

  // Step 2: Iteratively find k-itemsets
  let k = 2;
  while (currentFreq.length > 0 && k <= 5) {
    const candidates = generateCandidates(currentFreq, k);
    if (candidates.length === 0) break;

    // Count support for candidates
    const candidateCounts = new Map<string, number>();
    for (const tx of transactions) {
      const txSet = new Set(tx);
      for (const cand of candidates) {
        if (cand.every((item) => txSet.has(item))) {
          const key = cand.join("|||");
          candidateCounts.set(key, (candidateCounts.get(key) || 0) + 1);
        }
      }
    }

    const nextFreq: string[][] = [];
    candidateCounts.forEach((count, key) => {
      if (count >= minCount) {
        const items = key.split("|||");
        nextFreq.push(items);
        frequentItemsets.push({
          items,
          support: Math.round((count / n) * 1000) / 1000,
          count,
        });
      }
    });

    currentFreq = nextFreq;
    k++;
  }

  return frequentItemsets.sort((a, b) => b.support - a.support);
}

function generateCandidates(prevFreq: string[][], k: number): string[][] {
  const candidates: string[][] = [];
  const len = prevFreq.length;

  for (let i = 0; i < len; i++) {
    for (let j = i + 1; j < len; j++) {
      const itemset1 = prevFreq[i];
      const itemset2 = prevFreq[j];

      // Join if first (k - 2) elements match
      let canJoin = true;
      for (let m = 0; m < k - 2; m++) {
        if (itemset1[m] !== itemset2[m]) {
          canJoin = false;
          break;
        }
      }

      if (canJoin) {
        const newItem = itemset2[k - 2];
        if (!itemset1.includes(newItem)) {
          const newCandidate = [...itemset1, newItem].sort();
          if (!candidates.some((c) => arraysEqual(c, newCandidate))) {
            candidates.push(newCandidate);
          }
        }
      }
    }
  }

  return candidates;
}

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
