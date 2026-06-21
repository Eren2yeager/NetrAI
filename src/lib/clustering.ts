// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — Clustering Helpers
// Text similarity utilities for duplicate complaint grouping.
// Used by /api/ai/cluster before the Gemini call to pre-filter candidates.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normalises a string for comparison:
 * lowercase, strip punctuation, collapse whitespace.
 */
export function normalise(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Splits text into a Set of word n-grams (bigrams by default).
 * Used for Jaccard similarity scoring.
 */
export function ngrams(text: string, n = 2): Set<string> {
  const words  = normalise(text).split(' ')
  const result = new Set<string>()
  for (let i = 0; i <= words.length - n; i++) {
    result.add(words.slice(i, i + n).join(' '))
  }
  return result
}

/**
 * Jaccard similarity between two texts using bigrams.
 * Returns 0–1: 1 = identical, 0 = no overlap.
 */
export function jaccardSimilarity(a: string, b: string): number {
  const setA = ngrams(a)
  const setB = ngrams(b)

  if (setA.size === 0 || setB.size === 0) return 0

  let intersection = 0
  for (const gram of setA) {
    if (setB.has(gram)) intersection++
  }

  const union = setA.size + setB.size - intersection
  return union === 0 ? 0 : intersection / union
}

/**
 * Returns true if two complaints are likely duplicates based on
 * text similarity alone (before Gemini confirmation).
 * Threshold: 0.25 Jaccard — intentionally low to cast a wide net
 * for Gemini to then confirm or reject.
 */
export function areLikelySimilar(
  titleA: string,
  descA:  string,
  titleB: string,
  descB:  string,
  threshold = 0.25
): boolean {
  // Compare titles first (faster)
  const titleSim = jaccardSimilarity(titleA, titleB)
  if (titleSim >= threshold) return true

  // Fall back to description comparison
  const descSim = jaccardSimilarity(descA, descB)
  return descSim >= threshold
}
