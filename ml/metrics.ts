/**
 * Clustering Evaluation Metrics
 * Silhouette Score & Davies-Bouldin Index
 */

function euclideanDistance(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

export function computeSilhouetteScore(
  data: number[][],
  labels: number[]
): number {
  const n = data.length;
  if (n <= 1) return 0;

  // Group indices by cluster
  const clusterMap = new Map<number, number[]>();
  for (let i = 0; i < n; i++) {
    const lbl = labels[i];
    if (lbl === -1) continue; // Skip noise in DBSCAN
    if (!clusterMap.has(lbl)) clusterMap.set(lbl, []);
    clusterMap.get(lbl)!.push(i);
  }

  const clusters = Array.from(clusterMap.keys());
  if (clusters.length <= 1) return 0;

  let totalSilhouette = 0;
  let validPointsCount = 0;

  // For very large datasets, sample up to 500 points for real-time responsiveness
  const sampleIndices =
    n > 600
      ? Array.from({ length: 600 }, () => Math.floor(Math.random() * n))
      : Array.from({ length: n }, (_, i) => i);

  for (const i of sampleIndices) {
    const myCluster = labels[i];
    if (myCluster === -1) continue;

    const myClusterIndices = clusterMap.get(myCluster)!;

    // a(i): mean intra-cluster distance
    let a_i = 0;
    if (myClusterIndices.length > 1) {
      let sumDist = 0;
      for (const idx of myClusterIndices) {
        if (idx !== i) {
          sumDist += euclideanDistance(data[i], data[idx]);
        }
      }
      a_i = sumDist / (myClusterIndices.length - 1);
    }

    // b(i): min mean distance to other clusters
    let b_i = Infinity;
    for (const otherCluster of clusters) {
      if (otherCluster === myCluster) continue;
      const otherIndices = clusterMap.get(otherCluster)!;
      if (otherIndices.length === 0) continue;

      let sumDist = 0;
      for (const idx of otherIndices) {
        sumDist += euclideanDistance(data[i], data[idx]);
      }
      const meanDist = sumDist / otherIndices.length;
      if (meanDist < b_i) {
        b_i = meanDist;
      }
    }

    const maxDenom = Math.max(a_i, b_i);
    const s_i = maxDenom > 0 ? (b_i - a_i) / maxDenom : 0;
    totalSilhouette += s_i;
    validPointsCount++;
  }

  return validPointsCount > 0
    ? Math.round((totalSilhouette / validPointsCount) * 1000) / 1000
    : 0;
}

export function computeDaviesBouldinIndex(
  data: number[][],
  labels: number[],
  centroids?: number[][]
): number {
  const clusterMap = new Map<number, number[]>();
  for (let i = 0; i < data.length; i++) {
    const lbl = labels[i];
    if (lbl === -1) continue; // skip noise
    if (!clusterMap.has(lbl)) clusterMap.set(lbl, []);
    clusterMap.get(lbl)!.push(i);
  }

  const clusters = Array.from(clusterMap.keys());
  const k = clusters.length;
  if (k <= 1) return 0;

  // Compute centroids if not provided
  const computedCentroids: number[][] = [];
  const dim = data[0].length;

  for (const c of clusters) {
    const indices = clusterMap.get(c)!;
    const center = new Array(dim).fill(0);
    for (const idx of indices) {
      for (let d = 0; d < dim; d++) {
        center[d] += data[idx][d];
      }
    }
    for (let d = 0; d < dim; d++) {
      center[d] /= indices.length;
    }
    computedCentroids.push(center);
  }

  // Compute cluster dispersion S_i: average distance of points in cluster i to center i
  const S: number[] = [];
  for (let i = 0; i < k; i++) {
    const indices = clusterMap.get(clusters[i])!;
    let sumDist = 0;
    for (const idx of indices) {
      sumDist += euclideanDistance(data[idx], computedCentroids[i]);
    }
    S.push(indices.length > 0 ? sumDist / indices.length : 0);
  }

  // Compute DB index: (1/k) * sum_i(max_{j != i} (S_i + S_j) / dist(c_i, c_j))
  let dbSum = 0;
  for (let i = 0; i < k; i++) {
    let maxR = 0;
    for (let j = 0; j < k; j++) {
      if (i === j) continue;
      const d_ij = euclideanDistance(computedCentroids[i], computedCentroids[j]);
      if (d_ij > 1e-9) {
        const R_ij = (S[i] + S[j]) / d_ij;
        if (R_ij > maxR) maxR = R_ij;
      }
    }
    dbSum += maxR;
  }

  return Math.round((dbSum / k) * 1000) / 1000;
}
