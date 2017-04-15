// =============================================================================
// Fermat.js | Regression functions
// (c) 2017 Mathigon
// =============================================================================



import { square, noop } from 'utilities';
import * as matrix from 'matrix';
import { list } from 'arrays';


// -----------------------------------------------------------------------------
// Regression Functions

export function linear(data) {
  let sX = 0, sY = 0, sXX = 0, sXY = 0;
  let len = data.length;

  for (let n = 0; n < len; n++) {
    sX += data[n][0];
    sY += data[n][1];
    sXX += data[n][0] * data[n][0];
    sXY += data[n][0] * data[n][1];
  }

  let gradient = (len * sXY - sX * sY) / (len  * sXX - sX * sX);
  let intercept = (sY / len) - (gradient * sX) / len;
  return [intercept, gradient];  // y = gx + i
}

export function linearThroughOrigin(data) {
  let sXX = 0, sXY = 0;
  let n = data.length;

  for (let i = 0; i < n; i++) {
    sXX += data[i][0] * data[i][0];  // sumSqX
    sXY += data[i][0] * data[i][1];  // sumXY
  }

  let gradient = sXY / sXX;
  return [0, gradient];  // y = gx
}

export function exponential(data) {
  let sum = [0, 0, 0, 0, 0, 0];

  for (let n = 0; n < data.length; n++) {
    sum[0] += data[n][0];
    sum[1] += data[n][1];
    sum[2] += data[n][0] * data[n][0] * data[n][1];
    sum[3] += data[n][1] * Math.log(data[n][1]);
    sum[4] += data[n][0] * data[n][1] * Math.log(data[n][1]);
    sum[5] += data[n][0] * data[n][1];
  }

  let denominator = (sum[1] * sum[2] - sum[5] * sum[5]);
  let a = Math.exp((sum[2] * sum[3] - sum[5] * sum[4]) / denominator);
  let b = (sum[1] * sum[4] - sum[5] * sum[3]) / denominator;

  return [a, b];  // y = a * e^(bx)
}

export function logarithmic(data) {
  let sum = [0, 0, 0, 0];
  let len = data.length;

  for (let n = 0; n < len; n++) {
    sum[0] += Math.log(data[n][0]);
    sum[1] += data[n][1] * Math.log(data[n][0]);
    sum[2] += data[n][1];
    sum[3] += Math.pow(Math.log(data[n][0]), 2);
  }

  let b = (len * sum[1] - sum[2] * sum[0]) / (len * sum[3] - sum[0] * sum[0]);
  let a = (sum[2] - coeffB * sum[0]) / len;

  return [a, b];  // y = a + b * log(x)
}

export function power(data) {
  let sum = [0, 0, 0, 0];
  let len = data.length;

  for (let n = 0; n < len; n++) {
    sum[0] += Math.log(data[n][0]);
    sum[1] += Math.log(data[n][1]) * Math.log(data[n][0]);
    sum[2] += Math.log(data[n][1]);
    sum[3] += Math.pow(Math.log(data[n][0]), 2);
  }

  let b = (len * sum[1] - sum[2] * sum[0]) / (len * sum[3] - sum[0] * sum[0]);
  let a = Math.exp((sum[2] - coeffB * sum[0]) / len);

  return [a, b];  // y = a * x^b
}

export function polynomial(data, order=2) {
  // X = [[1, x1, x1^2], [1, x2, x2^2], [1, x3, x3^2]
  // y = [y1, y2, y3]

  let X = data.map(d => list(order + 1).map(p => Math.pow(d[0], p)));
  let XT = matrix.transpose(X);
  let y = data.map(d => [d[1]]);

  let XTX = matrix.product(XT, X);     // XT*X
  let inv = matrix.inverse(XTX);       // (XT*X)^(-1)
  let r = matrix.product(inv, XT, y);  // (XT*X)^(-1) * XT * y

  return r.map(x => x[0]);  // Flatten matrix
}


// -----------------------------------------------------------------------------
// Regression Coefficient

export function coefficient(data, fn) {
  let total = data.reduce((sum, d) => sum + d[1], 0);
  let mean = total / data.length;

  // Sum of squares of differences from the mean in the dependent variable
  let ssyy = data.reduce((sum, d) =>  sum + square(d[1] - mean), 0);

  // Sum of squares of residuals
  let sse = data.reduce((sum, d) => sum + square(d[1] - fn(d[0])), 0);

  return 1 - (sse / ssyy);
}


// -----------------------------------------------------------------------------
// Multi-Regression

const types = [{
  name: 'linear',
  regression: linear,
  fn(p, x) { return p[0] + x * p[1]; },
}, {
  name: 'quadratic',
  regression: polynomial,
  fn(p, x) { return p[0] + x * p[1] + x * x * p[2]; },
}, {
  name: 'cubic',
  regression(data) { return polynomial(data, 3); },
  fn(p, x) { return p[0] + x * p[1] + x * x * p[2] + x * x * x * p[3]; },
}, {
  name: 'exponential',
  regression: exponential,
  fn(p, x) { return p[0] * Math.pow(Math.E, p[1] * x); },
}];

export function find(data, threshold = 0.9) {
  if (data.length > 1) {
    for (let t of types) {
      let params = t.regression(data);
      let fn = t.fn.bind(null, params);
      let coeff = coefficient(data, fn);
      if (coeff > threshold) return {type: t.name, fn, params, coeff};
    }
  }

  return { type: null, fn: noop, params: [] }
}
