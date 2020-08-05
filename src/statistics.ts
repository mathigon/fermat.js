// ============================================================================
// Fermat.ts | Statistics
// (c) Mathigon
// ============================================================================


import {total} from '@mathigon/core';


/** Calculates the mean of an array of numbers. */
export function mean(values: number[]) {
  return values.length ? total(values) / values.length : 0;
}

/** Calculates the median of an array of numbers. */
export function median(values: number[]) {
  const n = values.length;
  if (!n) return 0;

  const sorted = values.slice(0).sort();
  return (n % 2 === 1) ? sorted[Math.floor(n / 2)] :
         (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
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
