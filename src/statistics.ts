// ============================================================================
// Fermat.ts | Statistics
// (c) Mathigon
// ============================================================================


import {total} from '@mathigon/core';


/** Calculates the mean of an array of numbers. */
export function mean(values: number[]) {
  return values.length ? total(values) / values.length : 0;
}

/** Calculates the quantile of an array of numbers for the cumulative
 * probability p. This method excludes the median in calculation, i.e.
 * `quantile((1, 2, 3, 4, 5), 0.25) === 2`
 * @param p Cumultive probability, 0 <= p <= 1
 */
export function quantile(values: number[], p: number): number {
  const n = values.length;
  if (!n) return 0;

  const sorted = values.slice(0).sort((a, b) => (a - b));
  if (p === 1) return sorted[n - 1];

  const index = n * p;
  if (Number.isInteger(index)) {
    return (sorted[index - 1] + sorted[index]) / 2;
  } else {
    return sorted[Math.floor(index)];
  }
}

/** Calculates the median of an array of numbers. */
export function median(values: number[]) {
  return quantile(values, 0.5);
}

/**
 * Calculates the mode of an array of numbers. Returns undefined if no mode
 * exists, i.e. there are multiple values with the same largest count.
 */
export function mode(values: number[]) {
  const counts = new Map<number, number>();

  let maxCount = -1;
  let result: number|undefined = undefined;

  for (const v of values) {
    if (!counts.has(v)) {
      counts.set(v, 1);
    } else {
      const newCount = counts.get(v)! + 1;
      counts.set(v, newCount);
      if (newCount === maxCount) {
        result = undefined;
      } else if (newCount > maxCount) {
        maxCount = newCount;
        result = v;
      }
    }
  }

  return result;
}

/** Calculates the variance of an array of numbers. */
export function variance(values: number[]) {
  if (!values.length) return undefined;
  const m = mean(values);

  const sum = values.reduce((a, v) => a + (v - m) ** 2, 0);
  return sum / (values.length - 1);
}

/** Calculates the standard deviation of an array of numbers. */
export function stdDev(values: number[]) {
  const v = variance(values);
  return v ? Math.sqrt(v) : 0;
}

/** Calculates the covariance of the numbers in two arrays aX and aY. */
export function covariance(aX: number[], aY: number[]) {
  if (aX.length !== aY.length) throw new Error('Array length mismatch.');
  const sum = aX.reduce((a, v, i) => a + v * aY[i], 0);
  return (sum - total(aX) * total(aY) / aX.length) / aX.length;
}

/** Calculates the correlation between the numbers in two arrays aX and aY. */
export function correlation(aX: number[], aY: number[]) {
  if (aX.length !== aY.length) throw new Error('Array length mismatch.');
  const covarXY = covariance(aX, aY);
  const stdDevX = stdDev(aX);
  const stdDevY = stdDev(aY);
  return covarXY / (stdDevX * stdDevY);
}
