// ============================================================================
// Fermat.js | Number Theory
// (c) Mathigon
// ============================================================================



// -----------------------------------------------------------------------------
// Simple Functions

const tolerance = 0.000001;

/**
 * Checks if two numbers are nearly equals.
 * @param {number} x
 * @param {number} y
 * @param {?number} t The allowed tolerance
 * @returns {boolean}
 */
export function nearlyEquals(x, y, t = tolerance) {
  return Math.abs(x - y) < t;
}

/**
 * Checks if a number x is between two numbers a and b.
 * @param {number} x
 * @param {number} a
 * @param {number} b
 * @param {?number} t
 * @returns {boolean}
 */
export function isBetween(x, a, b, t = tolerance) {
  // TODO Simplify this code after https://github.com/babel/babel/issues/8528
  const [min, max] = (a > b) ? [b, a] : [a, b];
  return x > min + t && x < max - t;
}

/**
 * Returns the sign of a number x, as +1, 0 or –1.
 * @param {number} x
 * @param {?number} t
 * @returns {number}
 */
export function sign(x, t = tolerance) {
  return nearlyEquals(x, 0, t) ? 0 : (x > 0 ? 1 : -1);
}


// -----------------------------------------------------------------------------
// String Conversion

const NUM_REGEX = /(\d+)(\d{3})/;
const POWER_SUFFIX = ['', 'k', 'm', 'b', 't', 'q'];

function addThousandSeparators(x) {
  x = ('' + x).split('.');
  let n = x[0];
  while (NUM_REGEX.test(n)) {
    n = n.replace(NUM_REGEX, '$1,$2');
  }
  return n + (x.length > 1 ? '.' + x[1] : '');
}

function addPowerSuffix(n, places) {
  if (!places) return n;

  // Trim short numbers to the appropriate number of decimal places.
  const d = ('' + Math.abs(Math.floor(n))).length;
  const m = n < 0 ? 1 : 0;
  if (d <= places - m) return round(n, places - d - m - 1);

  // Append a power suffix to longer numbers.
  const x = Math.floor(Math.log10(Math.abs(n)) / 3);
  return (round(n / Math.pow(10, 3 * x), places - ((d % 3) || 3) - m - 1))
      + POWER_SUFFIX[x];
}

/**
 * Converts a number to a clean string, by rounding, adding power suffixes, and
 * adding thousand separators.
 * @param {number} n
 * @param {?number} places The number of digits to show in the result.
 * @returns {string}
 */
export function numberFormat(n, places) {
  return addThousandSeparators(addPowerSuffix(n, places)).replace('-', '–');
}

/**
 * Converts a number to an ordinal.
 * @param {number} x
 * @returns {string}
 */
export function toOrdinal(x) {
  if (Math.abs(x) % 100 >= 11 && Math.abs(x) % 100 <= 13)
    return x + 'th';

  switch(x % 10) {
    case 1: return x + 'st';
    case 2: return x + 'nd';
    case 3: return x + 'rd';
    default: return x + 'th';
  }
}

const ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven',
  'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen',
  'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];

const TENS = ['', '', 'twenty', 'thirty', 'fourty', 'fifty', 'sixty',
  'seventy', 'eighty', 'ninety'];

const MULTIPLIERS = ['', 'thousand', 'million', 'billion', 'trillion',
  'quadrillion', 'quintillion', 'sextillion'];

function fmt(n) {
  let [h, t, o] = ('00' + n).substr(-3);
  return [
    Number(h) === 0 ? '' : ONES[h] + ' hundred ',
    Number(o) === 0 ? TENS[t] : TENS[t] && TENS[t] + '-' || '',
    ONES[t+o] || ONES[o]
  ].join('');
}

function cons(xs, x, g) {
  return x ? [x, g && ' ' + g || '', ' ', xs].join('') : xs;
}

/**
 * Spells a number as an English word.
 * @param {number} n
 * @returns {string}
 */
export function toWord(n) {
  if (!n) return 'zero';

  let str = '';
  let i = 0;

  while (n) {
    str = cons(str, fmt(n % 1000), MULTIPLIERS[i]);
    i += 1;
    n = n / 1000 | 0;
  }

  return str.trim();
}


// -----------------------------------------------------------------------------
// Rounding, Decimals and Decimals

/**
 * Returns the digits of a number n.
 * @param {number} n
 * @returns {number[]}
 */
export function digits(n) {
  let str = '' + Math.abs(n);
  return str.split('').reverse().map(x => +x);
}

/**
 * Returns the decimal digits of a number n.
 * @param {number} n
 * @returns {number[]}
 */
export function fractionalDigits(n) {
  let str = '' + Math.abs(n - Math.floor(n));
  return str.split('').map(x => +x);
}

/**
 * Returns the number of decimal places in a number n.
 * @param {number} n
 * @returns {number}
 */
export function decimalPlaces(n) {
  let str = '' + Math.abs(n);
  str = str.split('.');
  return str.length === 1 ? 0 : str[1].length;
}

/**
 * Rounds a number `n` to `precision` decimal places.
 * @param {number} n
 * @param {?number} precision
 * @returns {number}
 */
export function round(n, precision = 0) {
  let factor = Math.pow(10, precision);
  return Math.round(n * factor) / factor;
}

/**
 * Round a number `n` to the nearest multiple of `increment`.
 * @param {number} n
 * @param {number} increment
 * @returns {number}
 */
export function roundTo(n, increment = 1) {
  return Math.round(n / increment) * increment;
}

/**
 * Returns an [numerator, denominator] array that approximated a `decimal` to
 * `precision`. See http://en.wikipedia.org/wiki/Continued_fraction
 * @param {number} decimal
 * @param {number} precision
 * @returns {number[]}
 */
export function toFraction(decimal, precision = 0.0001) {
  let n = [1, 0], d = [0, 1];
  let a = Math.floor(decimal);
  let rem = decimal - a;

  while (d[0] <= 1/precision) {
    if (nearlyEquals(n[0] / d[0], precision)) return [n[0], d[0]];
    n = [a * n[0] + n[1], n[0]];
    d = [a * d[0] + d[1], d[0]];
    a = Math.floor(1 / rem);
    rem = 1/rem - a;
  }

  // No nice rational representation so return an irrational "fraction"
  return [decimal, 1];
}


// -----------------------------------------------------------------------------
// Operations

/**
 * Calculates `a mod m`. The JS implementation of the % operator returns the
 * symmetric modulo. Both are identical if a >= 0 and m >= 0 but the results
 * differ if a or m < 0.
 * @param {number} a
 * @param {number} m
 * @returns {number}
 */
export function mod(a, m) {
  return ((a % m) + a) % m;
}

/**
 * Calculates the logarithm of `x` with base `b`.
 * @param {number} x
 * @param {number} b
 * @returns {number}
 */
export function log(x, b = null) {
  return (b == null) ? Math.log(x) : Math.log(x) / Math.log(b);
}
