// ============================================================================
// Fermat.js | Numeric Mathematics
// (c) Mathigon
// ============================================================================



/**
 * Uses interval bisection to find a solution to fn(x) = 0. For example,
 * bisect(function(x){ return Math.cos(x/2); }, 10) => Pi
 * @param {Function} fn
 * @param {number} precision
 * @param {number} l
 * @param {number} h
 * @returns {number}
 */
export function bisect(fn, precision = 3, l = 0, h = null) {

  let p = Math.pow(10, -precision);
  let q = Math.pow(10,  precision);

  let lf = fn(l);
  let ls = Math.sign(lf);
  if (ls === 0) return l;
  let hf, hs;

  if (h == null) {
    h = 0.5;
    do {
      h *= 2;
      hf = fn(h);
      hs = Math.sign(hf);
    } while (hs === ls);
    if (hs === 0) return h;
  }

  let x = 0;
  while (Math.abs(lf) > p && x < 200) {
    let c = (l + h) / 2;
    let cf = fn(c);
    let cs = Math.sign(cf);
    if (cs === 0) return c;

    if (cs === ls) {
      l = c;
      lf = cf;
    } else {
      h = c;
      hf = cf;
    }

    ++x;
  }

  return Math.round(l * q) * p;
}

/**
 * Riemann-integrates a function fn from xMin to xMax, with an interval size dx.
 * @param {Function} fn
 * @param {number} xMin
 * @param {number} xMax
 * @param {?number} dx
 * @returns {number}
 */
export function integrate(fn, xMin, xMax, dx = 1) {
  let result = 0;
  for (let x = xMin; x < xMax; x += dx) {
    result += (fn(x) * dx || 0);
  }
  return result;
}
