// =============================================================================
// Fermat.js | Regression Functions
// (c) Mathigon
// =============================================================================


import {list} from '@mathigon/core';
import * as Matrix from './matrix';


function evaluatePolynomial(regression: number[], x: number) {
  let xs = 1;
  let t = regression[0];
  for (let i = 1; i < regression.length; ++i) {
    xs *= x;
    t += xs * regression[i];
  }
  return t;
}

type Coordinate = [number, number];

/**
 * Finds a linear regression that best approximates a set of data. The result
 * will be an array [c, m], where y = m * x + c.
 */
export function linear(data: Coordinate[], throughOrigin = false) {
  let sX = 0; let sY = 0; let sXX = 0; let sXY = 0;
  const len = data.length;

  for (let n = 0; n < len; n++) {
    sX += data[n][0];
    sY += data[n][1];
    sXX += data[n][0] * data[n][0];
    sXY += data[n][0] * data[n][1];
  }

  if (throughOrigin) {
    const gradient = sXY / sXX;
    return [0, gradient];
  }

  const gradient = (len * sXY - sX * sY) / (len * sXX - sX * sX);
  const intercept = (sY / len) - (gradient * sX) / len;
  return [intercept, gradient];
}


/**
 * Finds an exponential regression that best approximates a set of data. The
 * result will be an array [a, b], where y = a * e^(bx).
 */
export function exponential(data: Coordinate[]) {
  const sum = [0, 0, 0, 0, 0, 0];

  for (const d of data) {
    sum[0] += d[0];
    sum[1] += d[1];
    sum[2] += d[0] * d[0] * d[1];
    sum[3] += d[1] * Math.log(d[1]);
    sum[4] += d[0] * d[1] * Math.log(d[1]);
    sum[5] += d[0] * d[1];
  }

  const denominator = (sum[1] * sum[2] - sum[5] * sum[5]);
  const a = Math.exp((sum[2] * sum[3] - sum[5] * sum[4]) / denominator);
  const b = (sum[1] * sum[4] - sum[5] * sum[3]) / denominator;

  return [a, b];
}

/**
 * Finds a logarithmic regression that best approximates a set of data. The
 * result will be an array [a, b], where y = a + b * log(x).
 */
export function logarithmic(data: Coordinate[]) {
  const sum = [0, 0, 0, 0];
  const len = data.length;

  for (const d of data) {
    sum[0] += Math.log(d[0]);
    sum[1] += d[1] * Math.log(d[0]);
    sum[2] += d[1];
    sum[3] += Math.pow(Math.log(d[0]), 2);
  }

  const b = (len * sum[1] - sum[2] * sum[0]) /
            (len * sum[3] - sum[0] * sum[0]);
  const a = (sum[2] - b * sum[0]) / len;
  return [a, b];
}

/**
 * Finds a power regression that best approximates a set of data. The result
 * will be an array [a, b], where y = a * x^b.
 */
export function power(data: Coordinate[]) {
  const sum = [0, 0, 0, 0];
  const len = data.length;

  for (const d of data) {
    sum[0] += Math.log(d[0]);
    sum[1] += Math.log(d[1]) * Math.log(d[0]);
    sum[2] += Math.log(d[1]);
    sum[3] += Math.pow(Math.log(d[0]), 2);
  }

  const b = (len * sum[1] - sum[2] * sum[0]) /
            (len * sum[3] - sum[0] * sum[0]);
  const a = Math.exp((sum[2] - b * sum[0]) / len);
  return [a, b];
}

/**
 * Finds a polynomial regression of given `order` that best approximates a set
 * of data. The result will be an array giving the coefficients of the
 * resulting polynomial.
 */
export function polynomial(data: Coordinate[], order = 2) {
  // X = [[1, x1, x1^2], [1, x2, x2^2], [1, x3, x3^2]
  // y = [y1, y2, y3]

  const X = data.map(d => list(order + 1).map(p => Math.pow(d[0], p)));
  const XT = Matrix.transpose(X);
  const y = data.map(d => [d[1]]);

  const XTX = Matrix.product(XT, X);     // XT*X
  const inv = Matrix.inverse(XTX);       // (XT*X)^(-1)
  const r = Matrix.product(inv, XT, y);  // (XT*X)^(-1) * XT * y

  return r.map(x => x[0]);  // Flatten matrix
}


// ---------------------------------------------------------------------------
// Regression Coefficient

/**
 * Finds the regression coefficient of a given data set and regression
 * function.
 */
export function coefficient(data: Coordinate[], fn: (x: number) => number) {
  const total = data.reduce((sum, d) => sum + d[1], 0);
  const mean = total / data.length;

  // Sum of squares of differences from the mean in the dependent variable
  const ssyy = data.reduce((sum, d) => sum + (d[1] - mean) ** 2, 0);

  // Sum of squares of residuals
  const sse = data.reduce((sum, d) => sum + (d[1] - fn(d[0])) ** 2, 0);

  return 1 - (sse / ssyy);
}


// ---------------------------------------------------------------------------
// Multi-Regression

/** Finds the most suitable polynomial regression for a given dataset. */
export function bestPolynomial(data: Coordinate[], threshold = 0.85, maxOrder = 8) {
  if (data.length <= 1) return undefined;

  for (let i = 1; i < maxOrder; ++i) {
    const reg = polynomial(data, i);
    const fn = (x: number) => evaluatePolynomial(reg, x);
    const coeff = coefficient(data, fn);
    if (coeff >= threshold) return {order: i, coefficients: reg, fn};
  }

  return undefined;
}
