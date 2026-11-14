import { FrequentItemset } from "../lib/types";

/**
 * FP-Growth Algorithm for Frequent Itemset Mining
 * Uses FP-Tree (Frequent Pattern Tree) structure for fast pattern mining without candidate generation.
 */

class FPNode {
  item: string;
  count: number;
  parent: FPNode | null;
  children: Map<string, FPNode>;
  nodeLink: FPNode | null;

  constructor(item: string, count: number, parent: FPNode | null = null) {
    this.item = item;
    this.count = count;
    this.parent = parent;
    this.children = new Map();
    this.nodeLink = null;
  }
}

export function runFPGrowth(
  transactions: string[][],
  minSupport: number = 0.05
): FrequentItemset[] {
  const n = transactions.length;
  if (n === 0) return [];

  const minCount = Math.ceil(minSupport * n);

  // 1. Calculate item frequencies
  const itemCounts = new Map<string, number>();
  for (const tx of transactions) {
    const unique = Array.from(new Set(tx));
    for (const item of unique) {
      itemCounts.set(item, (itemCounts.get(item) || 0) + 1);
    }
  }

  // Filter infrequent items
  const frequentItems = new Map<string, number>();
  itemCounts.forEach((count, item) => {
    if (count >= minCount) {
      frequentItems.set(item, count);
    }
  });

  if (frequentItems.size === 0) return [];

  // Sort items descending by frequency
  const itemOrder = Array.from(frequentItems.keys()).sort(
    (a, b) => frequentItems.get(b)! - frequentItems.get(a)!
  );
  const rankMap = new Map<string, number>();
  itemOrder.forEach((item, idx) => rankMap.set(item, idx));

  // 2. Build FP-Tree
  const root = new FPNode("ROOT", 0);
  const headerTable = new Map<string, FPNode | null>();
  itemOrder.forEach((item) => headerTable.set(item, null));

  for (const tx of transactions) {
    // Filter and sort items according to global frequency
    const filtered = tx
      .filter((item) => frequentItems.has(item))
      .sort((a, b) => rankMap.get(a)! - rankMap.get(b)!);

    // Remove duplicates inside transaction
    const uniqueFiltered = Array.from(new Set(filtered));

    let current = root;
    for (const item of uniqueFiltered) {
      let child = current.children.get(item);
      if (!child) {
        child = new FPNode(item, 1, current);
        current.children.set(item, child);

        // Link in header table
        const head = headerTable.get(item);
        if (!head) {
          headerTable.set(item, child);
        } else {
          let currLink = head;
          while (currLink.nodeLink) {
            currLink = currLink.nodeLink;
          }
          currLink.nodeLink = child;
        }
      } else {
        child.count++;
      }
      current = child;
    }
  }

  // 3. Mine FP-Tree recursively
  const frequentPatterns: Array<{ items: string[]; count: number }> = [];

  function mineTree(
    header: Map<string, FPNode | null>,
    prefix: string[]
  ) {
    // Traverse header table in reverse order (least frequent first)
    const items = Array.from(header.keys()).reverse();

    for (const item of items) {
      let itemSupport = 0;
      let node = header.get(item);
      while (node) {
        itemSupport += node.count;
        node = node.nodeLink;
      }

      if (itemSupport >= minCount) {
        const newPattern = [...prefix, item];
        frequentPatterns.push({ items: newPattern, count: itemSupport });

        // Build conditional pattern base
        const conditionalTransactions: Array<{ path: string[]; count: number }> = [];
        node = header.get(item);
        while (node) {
          const path: string[] = [];
          let p = node.parent;
          while (p && p.item !== "ROOT") {
            path.push(p.item);
            p = p.parent;
          }
          if (path.length > 0) {
            conditionalTransactions.push({ path: path.reverse(), count: node.count });
          }
          node = node.nodeLink;
        }

        // Count frequencies in conditional pattern base
        const condCounts = new Map<string, number>();
        for (const { path, count } of conditionalTransactions) {
          for (const pi of path) {
            condCounts.set(pi, (condCounts.get(pi) || 0) + count);
          }
        }

        // Filter cond header
        const condHeader = new Map<string, FPNode | null>();
        const condOrder = Array.from(condCounts.keys())
          .filter((k) => condCounts.get(k)! >= minCount)
          .sort((a, b) => condCounts.get(b)! - condCounts.get(a)!);

        if (condOrder.length > 0) {
          condOrder.forEach((k) => condHeader.set(k, null));
          const condRoot = new FPNode("ROOT", 0);

          for (const { path, count } of conditionalTransactions) {
            const filteredPath = path.filter((k) => condHeader.has(k));
            let cNode = condRoot;
            for (const pi of filteredPath) {
              let child = cNode.children.get(pi);
              if (!child) {
                child = new FPNode(pi, count, cNode);
                cNode.children.set(pi, child);

                const head = condHeader.get(pi);
                if (!head) {
                  condHeader.set(pi, child);
                } else {
                  let l = head;
                  while (l.nodeLink) l = l.nodeLink;
                  l.nodeLink = child;
                }
              } else {
                child.count += count;
              }
              cNode = child;
            }
          }

          mineTree(condHeader, newPattern);
        }
      }
    }
  }

  mineTree(headerTable, []);

  // Format and sort
  const results: FrequentItemset[] = frequentPatterns.map((fp) => ({
    items: fp.items.sort(),
    support: Math.round((fp.count / n) * 1000) / 1000,
    count: fp.count,
  }));

  return results.sort((a, b) => b.support - a.support);
}
