/**
 * util/similarity.ts
 *
 * Cosine similarity and distance utilities for drift detection
 */

/**
 * Compute cosine similarity between two vectors
 *
 * Returns value between -1 and 1:
 * - 1.0 = identical
 * - 0.0 = orthogonal
 * - -1.0 = opposite
 */
export function computeCosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`Vector dimension mismatch: ${a.length} vs ${b.length}`);
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
}

/**
 * Compute cosine distance (1 - similarity)
 */
export function computeCosineDistance(a: number[], b: number[]): number {
  return 1 - computeCosineSimilarity(a, b);
}

/**
 * Compute Euclidean distance
 */
export function computeEuclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`Vector dimension mismatch: ${a.length} vs ${b.length}`);
  }

  let sumSquares = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sumSquares += diff * diff;
  }

  return Math.sqrt(sumSquares);
}

/**
 * Normalize vector to unit length
 */
export function normalizeVector(vector: number[]): number[] {
  const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));

  if (norm === 0) {
    return vector;
  }

  return vector.map(val => val / norm);
}

/**
 * Compute weighted average of vectors
 */
export function weightedAverage(
  vectors: number[][],
  weights: number[]
): number[] {
  if (vectors.length !== weights.length) {
    throw new Error('Number of vectors must match number of weights');
  }

  if (vectors.length === 0) {
    return [];
  }

  const dimension = vectors[0].length;
  const result = new Array(dimension).fill(0);

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  for (let i = 0; i < vectors.length; i++) {
    const vector = vectors[i];
    const weight = weights[i] / totalWeight;

    for (let j = 0; j < dimension; j++) {
      result[j] += weight * vector[j];
    }
  }

  return result;
}

/**
 * Find nearest vector from a set
 */
export function findNearest(
  query: number[],
  candidates: number[][]
): { index: number; similarity: number } {
  let maxSim = -Infinity;
  let maxIdx = -1;

  for (let i = 0; i < candidates.length; i++) {
    const sim = computeCosineSimilarity(query, candidates[i]);
    if (sim > maxSim) {
      maxSim = sim;
      maxIdx = i;
    }
  }

  return {
    index: maxIdx,
    similarity: maxSim,
  };
}

/**
 * Batch compute similarities
 */
export function batchComputeSimilarities(
  query: number[],
  candidates: number[][]
): number[] {
  return candidates.map(candidate => computeCosineSimilarity(query, candidate));
}
