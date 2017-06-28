// ============================================================================
// Fermat.js | Statistics
// (c) 2017 Mathigon
// ============================================================================



import { total } from '@mathigon/core';
import { square } from './arithmetic';


// -----------------------------------------------------------------------------
// Mean, Media and Mode

export function mean(a) {
  return a.length ? total(a) / a.length : null;
}

export function median(values) {
  let n = values.length;
  if (!n) return 0;

  let sorted = values.slice(0).sort();
  return (n % 2 === 1) ? sorted[Math.floor(n/2)] : (sorted[n/2 - 1] + sorted[n/2]) / 2;
}

// Returns 'null' if no mode exists (multiple values with the same largest count)
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

export function variance(values) {
  if (!values.length) return null;
  let mean = mean(values);

  let sum = 0;
  for (let v of values) sum += square(v - mean);
  return sum / (values.length - 1);
}

export function stdDev(values) {
  return Math.sqrt(variance(values));
}

// Determines the covariance of the numbers in two arrays aX and aY
export function covariance(aX, aY) {
  if (aX.length !== aY.length) throw new Error('Array length mismatch.');
  let n = aX.length;
  let total = 0;
  for (let i = 0; i < n; i++) total += aX[i] * aY[i];
  return (total - total(aX) * total(aY) / n) / n;
}

export function correlation(aX, aY) {
  if (aX.length !== aY.length) throw new Error('Array length mismatch.');
  let covarXY = covariance(aX, aY);
  let stdDevX = stdDev(aX);
  let stdDevY = stdDev(aY);
  return covarXY / (stdDevX * stdDevY);
}


// -----------------------------------------------------------------------------
// Regression

export function rSquared(source, regression) {
  let sourceMean = mean(source);

  let residualSquares = source.map((d, i) => square(d - regression[i]));
  let totalSquares = source.map(d => square(d - sourceMean));

  return 1 - total(residualSquares) / total(totalSquares);
}

export function linearRegression(aX, aY) {
  let n = aX.length;

  let sumX = total(aX);
  let sumY = total(aY);
  let sumXY = total(aX.map((d, i) => d * aY[i]));
  let sumXSquared = total(aX.map(d => d * d));

  let meanX = mean(aX);
  let meanY = mean(aY);

  let b = (sumXY - 1 / n * sumX * sumY) / (sumXSquared - 1 / n * (sumX * sumX));
  let a = meanY - b * meanX;

  return (x) => (a + b * x);
}
