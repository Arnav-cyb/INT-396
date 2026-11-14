/**
 * K-Means Clustering with K-Means++ Initialization
 */

function euclideanDistance(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

export interface KMeansResult {
  labels: number[];
  centroids: number[][];
  inertia: number;
  iterations: number;
}

export function runKMeans(
  data: number[][],
  k: number = 4,
  maxIter: number = 100,
  nInit: number = 5
): KMeansResult {
  const n = data.length;
  if (n === 0) {
    return { labels: [], centroids: [], inertia: 0, iterations: 0 };
  }

  // Adjust k if larger than data points
  k = Math.max(1, Math.min(k, n));
  const dim = data[0].length;

  let bestInertia = Infinity;
  let bestLabels: number[] = [];
  let bestCentroids: number[][] = [];
  let bestIters = 0;

  for (let initRound = 0; initRound < nInit; initRound++) {
    // 1. K-Means++ Initialization
    const centroids: number[][] = [];
    const firstIdx = Math.floor(Math.random() * n);
    centroids.push([...data[firstIdx]]);

    while (centroids.length < k) {
      const distSq: number[] = new Array(n).fill(0);
      let totalDistSq = 0;

      for (let i = 0; i < n; i++) {
        let minDist = Infinity;
        for (const c of centroids) {
          const d = euclideanDistance(data[i], c);
          if (d < minDist) minDist = d;
        }
        distSq[i] = minDist * minDist;
        totalDistSq += distSq[i];
      }

      // Sample next centroid proportional to distSq
      const target = Math.random() * totalDistSq;
      let cumulative = 0;
      let nextIdx = 0;
      for (let i = 0; i < n; i++) {
        cumulative += distSq[i];
        if (cumulative >= target) {
          nextIdx = i;
          break;
        }
      }
      centroids.push([...data[nextIdx]]);
    }

    // 2. Iterations
    let labels = new Array(n).fill(0);
    let iter = 0;

    for (iter = 0; iter < maxIter; iter++) {
      let changed = false;

      // Assignment step
      for (let i = 0; i < n; i++) {
        let minD = Infinity;
        let bestC = 0;
        for (let c = 0; c < k; c++) {
          const d = euclideanDistance(data[i], centroids[c]);
          if (d < minD) {
            minD = d;
            bestC = c;
          }
        }
        if (labels[i] !== bestC) {
          labels[i] = bestC;
          changed = true;
        }
      }

      if (!changed && iter > 0) break;

      // Update step
      const counts = new Array(k).fill(0);
      const newCentroids = Array.from({ length: k }, () => new Array(dim).fill(0));

      for (let i = 0; i < n; i++) {
        const c = labels[i];
        counts[c]++;
        for (let d = 0; d < dim; d++) {
          newCentroids[c][d] += data[i][d];
        }
      }

      for (let c = 0; c < k; c++) {
        if (counts[c] > 0) {
          for (let d = 0; d < dim; d++) {
            centroids[c][d] = newCentroids[c][d] / counts[c];
          }
        } else {
          // Reinitialize empty cluster centroid
          centroids[c] = [...data[Math.floor(Math.random() * n)]];
        }
      }
    }

    // Compute Inertia (Sum of squared distances to closest centroid)
    let inertia = 0;
    for (let i = 0; i < n; i++) {
      const d = euclideanDistance(data[i], centroids[labels[i]]);
      inertia += d * d;
    }

    if (inertia < bestInertia) {
      bestInertia = inertia;
      bestLabels = [...labels];
      bestCentroids = centroids.map((c) => [...c]);
      bestIters = iter;
    }
  }

  return {
    labels: bestLabels,
    centroids: bestCentroids,
    inertia: Math.round(bestInertia * 100) / 100,
    iterations: bestIters,
  };
}
