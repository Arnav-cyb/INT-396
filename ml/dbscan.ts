/**
 * Density-Based Spatial Clustering of Applications with Noise (DBSCAN)
 */

function euclideanDistance(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

export interface DBSCANResult {
  labels: number[];
  numClusters: number;
  noiseCount: number;
}

export function runDBSCAN(
  data: number[][],
  eps: number = 1.8,
  minSamples: number = 4
): DBSCANResult {
  const n = data.length;
  if (n === 0) return { labels: [], numClusters: 0, noiseCount: 0 };

  // -2: unvisited, -1: noise, >= 0: cluster id
  const labels: number[] = new Array(n).fill(-2);
  let currentCluster = 0;

  function regionQuery(pointIdx: number): number[] {
    const neighbors: number[] = [];
    const pt = data[pointIdx];
    for (let i = 0; i < n; i++) {
      if (euclideanDistance(pt, data[i]) <= eps) {
        neighbors.push(i);
      }
    }
    return neighbors;
  }

  for (let i = 0; i < n; i++) {
    if (labels[i] !== -2) continue; // already visited

    const neighbors = regionQuery(i);

    if (neighbors.length < minSamples) {
      labels[i] = -1; // mark as noise (can be overridden later if border point)
    } else {
      // Start a new cluster
      labels[i] = currentCluster;
      const seedQueue = [...neighbors];

      let qIdx = 0;
      while (qIdx < seedQueue.length) {
        const neighborIdx = seedQueue[qIdx];
        qIdx++;

        if (labels[neighborIdx] === -1) {
          // Border point previously labeled noise
          labels[neighborIdx] = currentCluster;
        }

        if (labels[neighborIdx] !== -2) continue;

        labels[neighborIdx] = currentCluster;
        const subNeighbors = regionQuery(neighborIdx);

        if (subNeighbors.length >= minSamples) {
          for (const sn of subNeighbors) {
            if (!seedQueue.includes(sn)) {
              seedQueue.push(sn);
            }
          }
        }
      }

      currentCluster++;
    }
  }

  let noiseCount = 0;
  for (let i = 0; i < n; i++) {
    if (labels[i] === -1) noiseCount++;
  }

  return {
    labels,
    numClusters: currentCluster,
    noiseCount,
  };
}
