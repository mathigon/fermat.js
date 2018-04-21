// ============================================================================
// Fermat.js | Statistics
// (c) 2017 Mathigon
// ============================================================================



import { total, square } from '@mathigon/core';


// -----------------------------------------------------------------------------
// Mean, Media and Mode

/**
 * Calculates the mean of an array of numbers.
 * @param {number[]} values
 * @returns {?number}
 */
export function mean(values) {
  return values.length ? total(values) / values.length : null;
}

/**
 * Calculates the median of an array of numbers.
 * @param {number[]} values
 * @returns {?number}
 */
export function median(values) {
  let n = values.length;
  if (!n) return 0;

  let sorted = values.slice(0).sort();
  return (n % 2 === 1) ? sorted[Math.floor(n/2)] : (sorted[n/2 - 1] + sorted[n/2]) / 2;
}

/**
 * Calculates the mode of an array of numbers. Returns null if no mode exists,
 * i.e. there are multiple values with the same largest count.
 * @param {number[]} values
 * @returns {?number}
 */
export function mode(values) {
  let counts = new Map();

  let modeCount = -1;
  let result;

  for (let v of values) {
    if (!counts.has(v)) {
      counts.set(v, 1);
    } else {
      let newCount = counts.get(v) + 1;
      counts.set(v, newCount);
      if (newCount > modeCount) {
        modeCount = newCount;
        result = v;
      }
    }
  }

  // iterate again to check for 'no mode'
  for (let i of counts.entries()) {
    if (i[1] === modeCount && i[0] !== result) {
      return null;
    }
  }

  return result;
}


// -----------------------------------------------------------------------------
// Variance

/**
 * Calculates the variance of an array of numbers.
 * @param {number[]} values
 * @returns {number}
 */
export function variance(values) {
  if (!values.length) return null;
  let mean = mean(values);

  let sum = 0;
  for (let v of values) sum += square(v - mean);
  return sum / (values.length - 1);
}

/**
 * Calculates the standard deviation of an array of numbers.
 * @param {number[]} values
 * @returns {number}
 */
export function stdDev(values) {
  return Math.sqrt(variance(values));
}

/**
 * Calculates the covariance of the numbers in two arrays aX and aY.
 * @param {number[]} aX
 * @param {number[]} aY
 * @returns {number}
 */
export function covariance(aX, aY) {
  if (aX.length !== aY.length) throw new Error('Array length mismatch.');
  let n = aX.length;
  let total = 0;
  for (let i = 0; i < n; i++) total += aX[i] * aY[i];
  return (total - total(aX) * total(aY) / n) / n;
}

/**
 * Calculates the correlation between the numbers in two arrays aX and aY.
 * @param {number[]} aX
 * @param {number[]} aY
 * @returns {number}
 */
export function correlation(aX, aY) {
  if (aX.length !== aY.length) throw new Error('Array length mismatch.');
  let covarXY = covariance(aX, aY);
  let stdDevX = stdDev(aX);
  let stdDevY = stdDev(aY);
  return covarXY / (stdDevX * stdDevY);
}
