import { runKMeans } from "./kmeans";
import { computeSilhouetteScore } from "./metrics";

export interface ElbowPoint {
  k: number;
  inertia: number;
  silhouette: number;
  isOptimal?: boolean;
}

export function computeElbowCurve(scaledMatrix: number[][], minK: number = 2, maxK: number = 7): {
  points: ElbowPoint[];
  optimalK: number;
} {
  const points: ElbowPoint[] = [];
  let bestSilhouette = -1;
  let optimalK = 4;

  const n = scaledMatrix.length;
  if (n <= 2) {
    return { points: [], optimalK: 2 };
  }

  const effectiveMaxK = Math.min(maxK, Math.floor(n / 2));

  for (let k = minK; k <= effectiveMaxK; k++) {
    const kmeans = runKMeans(scaledMatrix, k, 60, 3);
    const sil = computeSilhouetteScore(scaledMatrix, kmeans.labels);

    points.push({
      k,
      inertia: Math.round(kmeans.inertia),
      silhouette: Math.round(sil * 1000) / 1000,
    });

    if (sil > bestSilhouette) {
      bestSilhouette = sil;
      optimalK = k;
    }
  }

  // Mark optimal
  points.forEach((p) => {
    if (p.k === optimalK) p.isOptimal = true;
  });

  return { points, optimalK };
}
