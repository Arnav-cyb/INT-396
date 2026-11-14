/**
 * Principal Component Analysis (PCA)
 * Computes the top 2 principal components using Covariance Matrix & Power Iteration with Deflation.
 */

export interface PCAResult {
  projected: [number, number][];
  explainedVarianceRatio: [number, number];
  components: number[][];
}

export function computePCA(data: number[][], numComponents: number = 2): PCAResult {
  if (data.length === 0 || data[0].length === 0) {
    return {
      projected: [],
      explainedVarianceRatio: [0, 0],
      components: [],
    };
  }

  const n = data.length;
  const p = data[0].length;

  // 1. Center the data (mean 0)
  const means = new Array(p).fill(0);
  for (let j = 0; j < p; j++) {
    let sum = 0;
    for (let i = 0; i < n; i++) {
      sum += data[i][j];
    }
    means[j] = sum / n;
  }

  const centered: number[][] = data.map((row) =>
    row.map((val, j) => val - means[j])
  );

  // 2. Compute Covariance Matrix: (X^T * X) / (n - 1)
  const cov: number[][] = Array.from({ length: p }, () => new Array(p).fill(0));
  const denom = n > 1 ? n - 1 : 1;

  for (let j1 = 0; j1 < p; j1++) {
    for (let j2 = j1; j2 < p; j2++) {
      let dot = 0;
      for (let i = 0; i < n; i++) {
        dot += centered[i][j1] * centered[i][j2];
      }
      cov[j1][j2] = dot / denom;
      cov[j2][j1] = cov[j1][j2];
    }
  }

  // Total variance (trace of covariance matrix)
  let totalVar = 0;
  for (let j = 0; j < p; j++) {
    totalVar += cov[j][j];
  }
  if (totalVar <= 0) totalVar = 1;

  // 3. Power Iteration with Deflation to get top eigenvalues and eigenvectors
  const components: number[][] = [];
  const eigenvalues: number[] = [];

  // Working copy of covariance matrix
  const A: number[][] = cov.map((row) => [...row]);

  for (let c = 0; c < numComponents; c++) {
    // Random initial unit vector
    let v: number[] = new Array(p).fill(0).map(() => Math.random() - 0.5);
    let norm = Math.hypot(...v);
    if (norm < 1e-9) norm = 1;
    v = v.map((x) => x / norm);

    let lambda = 0;
    const maxIters = 60;

    for (let iter = 0; iter < maxIters; iter++) {
      // Multiply: w = A * v
      const w: number[] = new Array(p).fill(0);
      for (let i = 0; i < p; i++) {
        let sum = 0;
        for (let j = 0; j < p; j++) {
          sum += A[i][j] * v[j];
        }
        w[i] = sum;
      }

      norm = Math.hypot(...w);
      if (norm < 1e-9) break;

      lambda = norm;
      v = w.map((x) => x / norm);
    }

    eigenvalues.push(lambda);
    components.push(v);

    // Deflate: A = A - lambda * (v * v^T)
    for (let i = 0; i < p; i++) {
      for (let j = 0; j < p; j++) {
        A[i][j] -= lambda * v[i] * v[j];
      }
    }
  }

  // 4. Project centered data onto top 2 components
  const projected: [number, number][] = centered.map((row) => {
    let pc1 = 0;
    let pc2 = 0;
    for (let j = 0; j < p; j++) {
      pc1 += row[j] * (components[0]?.[j] || 0);
      pc2 += row[j] * (components[1]?.[j] || 0);
    }
    return [Math.round(pc1 * 100) / 100, Math.round(pc2 * 100) / 100];
  });

  const ev1 = Math.min(1, Math.max(0, (eigenvalues[0] || 0) / totalVar));
  const ev2 = Math.min(1 - ev1, Math.max(0, (eigenvalues[1] || 0) / totalVar));

  return {
    projected,
    explainedVarianceRatio: [
      Math.round(ev1 * 1000) / 1000,
      Math.round(ev2 * 1000) / 1000,
    ],
    components,
  };
}
