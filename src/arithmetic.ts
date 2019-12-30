// ============================================================================
// Fermat.js | Utility Functions
// (c) Mathigon
// ============================================================================


const PRECISION = 0.000001;


// -----------------------------------------------------------------------------
// Checks and Comparisons

/** Checks if two numbers are nearly equals. */
export function nearlyEquals(x: number, y: number, t = PRECISION) {
  if (isNaN(x) || isNaN(y)) return false;
  return Math.abs(x - y) < t;
}

/* Checks if an object is an integer. */
export function isInteger(x: number, t = PRECISION) {
  return nearlyEquals(x % 1, 0, t);
}

/** Checks if a number x is between two numbers a and b. */
export function isBetween(x: number, a: number, b: number, t = PRECISION) {
  if (a > b) [a, b] = [b, a];
  return x > a + t && x < b - t;
}

/** Returns the sign of a number x, as +1, 0 or –1. */
export function sign(x: number, t = PRECISION) {
  return nearlyEquals(x, 0, t) ? 0 : (x > 0 ? 1 : -1);
}


// -----------------------------------------------------------------------------
// String Conversion

const NUM_REGEX = /(\d+)(\d{3})/;
const POWER_SUFFIX = ['', 'k', 'm', 'b', 't', 'q'];

function addThousandSeparators(x: string) {
  let [n, dec] = x.split('.');
  while (NUM_REGEX.test(n)) {
    n = n.replace(NUM_REGEX, '$1,$2');
  }
  return n + (dec ? '.' + dec : '');
}

function addPowerSuffix(n: number, places = 6) {
  if (!places) return '' + n;

  // Trim short numbers to the appropriate number of decimal places.
  const d = ('' + Math.abs(Math.floor(n))).length;
  const m = n < 0 ? 1 : 0;
  if (d <= places - m) return '' + round(n, places - d - m - 1);

  // Append a power suffix to longer numbers.
  const x = Math.floor(Math.log10(Math.abs(n)) / 3);
  return (round(n / Math.pow(10, 3 * x), places - ((d % 3) || 3) - m - 1))
         + POWER_SUFFIX[x];
}

/**
 * Converts a number to a clean string, by rounding, adding power suffixes, and
 * adding thousands separators. `places` is the number of digits to show in the
 * result.
 */
export function numberFormat(n: number, places = 0, seperators = true) {
  const str = addPowerSuffix(n, places).replace('-', '–');
  return seperators ? addThousandSeparators(str) : str;
}

// Numbers like 0,123 are decimals, even though they mach POINT_DECIMAL.
const SPECIAL_DECIMAL = /^-?0,[0-9]+$/;

// Points as decimal points, Commas as 1k separators, allow starting .
const POINT_DECIMAL = /^-?([0-9]+(,[0-9]{3})*)?\.?[0-9]*$/;

// Commas as decimal points, Points as 1k separators, don't allow starting ,
const COMMA_DECIMAL = /^-?[0-9]+(\.[0-9]{3})*,?[0-9]*$/;

/**
 * Converts a number to a string, including . or , decimal points and
 * thousands separators.
 * @param {string} str
 * @returns {number}
 */
export function parseNumber(str: string) {
  str = str.replace(/^–/, '-').trim();
  if (!str || str.match(/[^0-9.,-]/)) return NaN;

  if (SPECIAL_DECIMAL.test(str))
    return parseFloat(str.replace(/,/, '.'));

  if (POINT_DECIMAL.test(str))
    return parseFloat(str.replace(/,/g, ''));

  if (COMMA_DECIMAL.test(str))
    return parseFloat(str.replace(/\./g, '').replace(/,/, '.'));

  return NaN;
}

/**
 * Converts a number to an ordinal.
 * @param {number} x
 * @returns {string}
 */
export function toOrdinal(x: number) {
  if (Math.abs(x) % 100 >= 11 && Math.abs(x) % 100 <= 13)
    return x + 'th';

  switch (x % 10) {
    case 1:
      return x + 'st';
    case 2:
      return x + 'nd';
    case 3:
      return x + 'rd';
    default:
      return x + 'th';
  }
}

// TODO Translate this function into other languages.

const ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven',
  'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen',
  'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];

const TENS = ['', '', 'twenty', 'thirty', 'fourty', 'fifty', 'sixty',
  'seventy', 'eighty', 'ninety'];

const MULTIPLIERS = ['', 'thousand', 'million', 'billion', 'trillion',
  'quadrillion', 'quintillion', 'sextillion'];

function fmt(n: number) {
  let [h, t, o] = ('00' + n).substr(-3).split('');
  return [
    +h === 0 ? '' : ONES[+h] + ' hundred ',
    +o === 0 ? TENS[+t] : TENS[+t] && TENS[+t] + '-' || '',
    ONES[(+t) + (+o)] || ONES[+o]
  ].join('');
}

function cons(xs: string, x: string, g: string) {
  return x ? [x, g && ' ' + g || '', ' ', xs].join('') : xs;
}

/** Spells a number as an English word. */
export function toWord(n: number) {
  if (n === 0) return 'zero';

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

/** Returns the digits of a number n. */
export function digits(n: number) {
  let str = '' + Math.abs(n);
  return str.split('').reverse().map(x => +x);
}

/** Rounds a number `n` to `precision` decimal places. */
export function round(n: number, precision = 0) {
  let factor = Math.pow(10, precision);
  return Math.round(n * factor) / factor;
}

/** Round a number `n` to the nearest multiple of `increment`. */
export function roundTo(n: number, increment = 1) {
  return Math.round(n / increment) * increment;
}

/**
 * Returns an [numerator, denominator] array that approximated a `decimal` to
 * `precision`. See http://en.wikipedia.org/wiki/Continued_fraction
 */
export function toFraction(decimal: number, precision = PRECISION) {
  let n = [1, 0], d = [0, 1];
  let a = Math.floor(decimal);
  let rem = decimal - a;

  while (d[0] <= 1 / precision) {
    if (nearlyEquals(n[0] / d[0], precision)) return [n[0], d[0]];
    n = [a * n[0] + n[1], n[0]];
    d = [a * d[0] + d[1], d[0]];
    a = Math.floor(1 / rem);
    rem = 1 / rem - a;
  }

  // No nice rational representation so return an irrational "fraction"
  return [decimal, 1];
}


// -----------------------------------------------------------------------------
// Simple Operations

/** Bounds a number between a lower and an upper limit. */
export function clamp(x: number, min = -Infinity, max = Infinity) {
  return Math.min(max, Math.max(min, x));
}

/** Linear interpolation */
export function lerp(a: number, b: number, t = 0.5) {
  return a + (b - a) * t;
}

/** Squares a number. */
export function square(x: number) {
  return x * x;
}

/** Cubes a number. */
export function cube(x: number) {
  return x * x * x;
}

/**
 * Calculates `a mod m`. The JS implementation of the % operator returns the
 * symmetric modulo. Both are identical if a >= 0 and m >= 0 but the results
 * differ if a or m < 0.
 */
export function mod(a: number, m: number) {
  return ((a % m) + a) % m;
}

/** Calculates the logarithm of `x` with base `b`. */
export function log(x: number, b?: number) {
  return (b === undefined) ? Math.log(x) : Math.log(x) / Math.log(b);
}

/** Solves the quadratic equation a x^2 + b x + c = 0 */
export function quadratic(a: number, b: number, c: number) {
  const p = -b / 2 / a;
  const q = Math.sqrt(b * b - 4 * a * c) / 2 / a;
  return [p + q, p - q];
}
