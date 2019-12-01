// ============================================================================
// Fermat.js | Random Numbers
// (c) Mathigon
// ============================================================================


import {uid, total, repeat} from '@mathigon/core';


export namespace Random {

  /** Randomly shuffles the elements in an array a. */
  export function shuffle<T = any>(a: T[]): T[] {
    a = a.slice(0); // create copy
    for (let i = a.length - 1; i > 0; --i) {
      let j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /** Generates a random integer between 0 and a, or between a and b. */
  export function integer(a: number, b?: number) {
    let start = (b === undefined ? 0 : a);
    let length = (b === undefined ? a : b - a + 1);
    return start + Math.floor(length * Math.random());
  }

  /** Chooses a random index value from weights [2, 5, 3] */
  export function weighted(weights: number[]) {
    const x = Math.random() * total(weights);

    let cum = 0;
    return weights.findIndex((w) => (cum += w) >= x);
  }


  // ---------------------------------------------------------------------------
  // Smart Random Number Generators

  const SMART_RANDOM_CACHE = new Map<string, number[]>();

  /**
   * Returns a random number between 0 and n, but avoids returning the same
   * number multiple times in a row.
   */
  export function smart(n: number, id: string) {
    if (!id) id = uid();
    if (!SMART_RANDOM_CACHE.has(id)) SMART_RANDOM_CACHE.set(id, repeat(1, n));

    const cache = SMART_RANDOM_CACHE.get(id)!;
    const x = weighted(cache.map(x => x * x));

    cache[x] -= 1;
    if (cache[x] <= 0) SMART_RANDOM_CACHE.set(id, cache.map(x => x + 1));

    return x;
  }


  // ---------------------------------------------------------------------------
  // Probability Distribution

  /** Generates a Bernoulli random variable. */
  export function bernoulli(p = 0.5) {
    return (Math.random() < p ? 1 : 0);
  }

  /** Generates a Binomial random variable. */
  export function binomial(n = 1, p = 0.5) {
    let t = 0;
    for (let i = 0; i < n; ++i) t += bernoulli(p);
    return t;
  }

  /** Generates a Poisson random variable. */
  export function poisson(l = 1) {
    if (l <= 0) return 0;
    const L = Math.exp(-l);
    let p = 1;

    let k = 0;
    for (; p > L; ++k) p *= Math.random();
    return k - 1;
  }

  /** Generates a uniform random variable. */
  export function uniform(a = 0, b = 1) {
    return a + (b - a) * Math.random();
  }

  /** Generates a normal random variable with mean m and variance v. */
  export function normal(m = 0, v = 1) {
    const u1 = Math.random();
    const u2 = Math.random();
    const rand = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return rand * Math.sqrt(v) + m;
  }

  /** Generates an exponential random variable. */
  export function exponential(l = 1) {
    return l <= 0 ? 0 : -Math.log(Math.random()) / l;
  }

  /** Generates a geometric random variable. */
  export function geometric(p = 0.5) {
    if (p <= 0 || p > 1) return undefined;
    return Math.floor(Math.log(Math.random()) / Math.log(1 - p));
  }

  /** Generates an Cauchy random variable. */
  export function cauchy() {
    let rr, v1, v2;
    do {
      v1 = 2 * Math.random() - 1;
      v2 = 2 * Math.random() - 1;
      rr = v1 * v1 + v2 * v2;
    } while (rr >= 1);
    return v1 / v2;
  }


  // ---------------------------------------------------------------------------
  // PDFs and CDFs

  /** Generates pdf(x) for the normal distribution with mean m and variance v. */
  export function normalPDF(x: number, m = 1, v = 0) {
    return Math.exp(-((x - m) ** 2) / (2 * v)) / Math.sqrt(2 * Math.PI * v);
  }

  const G = 7;
  const P = [
    0.99999999999980993,
    676.5203681218851,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.13857109526572012,
    9.9843695780195716e-6,
    1.5056327351493116e-7
  ];

  function gamma(z: number): number {
    if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));

    z -= 1;
    let x = P[0];
    for (let i = 1; i < G + 2; i++) x += P[i] / (z + i);
    let t = z + G + 0.5;

    return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
  }

  /** Riemann-integrates fn(x) from xMin to xMax with an interval size dx. */
  export function integrate(fn: (x: number) => number, xMin: number,
                            xMax: number, dx = 1) {
    let result = 0;
    for (let x = xMin; x < xMax; x += dx) {
      result += (fn(x) * dx || 0);
    }
    return result;
  }

  /** The chi CDF function. */
  export function chiCDF(chi: number, deg: number) {
    let int = integrate(t => Math.pow(t, (deg - 2) / 2) * Math.exp(-t / 2), 0,
        chi);
    return 1 - int / Math.pow(2, deg / 2) / gamma(deg / 2);
  }
}
