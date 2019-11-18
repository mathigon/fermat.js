'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

// ============================================================================
// Fermat.js | Utility Functions
// (c) Mathigon
// ============================================================================
const PRECISION = 0.000001;
// -----------------------------------------------------------------------------
// Checks and Comparisons
/** Checks if two numbers are nearly equals. */
function nearlyEquals(x, y, t = PRECISION) {
    if (isNaN(x) || isNaN(y))
        return false;
    return Math.abs(x - y) < t;
}
/* Checks if an object is an integer. */
function isInteger(x, t = PRECISION) {
    return nearlyEquals(x % 1, 0, t);
}
/** Checks if a number x is between two numbers a and b. */
function isBetween(x, a, b, t = PRECISION) {
    if (a > b)
        [a, b] = [b, a];
    return x > a + t && x < b - t;
}
/** Returns the sign of a number x, as +1, 0 or –1. */
function sign(x, t = PRECISION) {
    return nearlyEquals(x, 0, t) ? 0 : (x > 0 ? 1 : -1);
}
// -----------------------------------------------------------------------------
// String Conversion
const NUM_REGEX = /(\d+)(\d{3})/;
const POWER_SUFFIX = ['', 'k', 'm', 'b', 't', 'q'];
function addThousandSeparators(x) {
    let [n, dec] = ('' + x).split('.');
    while (NUM_REGEX.test(n)) {
        n = n.replace(NUM_REGEX, '$1,$2');
    }
    return n + (dec ? '.' + dec : '');
}
function addPowerSuffix(n, places = 6) {
    if (!places)
        return n;
    // Trim short numbers to the appropriate number of decimal places.
    const d = ('' + Math.abs(Math.floor(n))).length;
    const m = n < 0 ? 1 : 0;
    if (d <= places - m)
        return round(n, places - d - m - 1);
    // Append a power suffix to longer numbers.
    const x = Math.floor(Math.log10(Math.abs(n)) / 3);
    return (round(n / Math.pow(10, 3 * x), places - ((d % 3) || 3) - m - 1))
        + POWER_SUFFIX[x];
}
/**
 * Converts a number to a clean string, by rounding, adding power suffixes, and
 * adding thousand separators. `places` is the number of digits to show in the
 * result.
 */
function numberFormat(n, places = 0) {
    return addThousandSeparators(addPowerSuffix(n, places)).replace('-', '–');
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
function parseNumber(str) {
    str = str.replace(/^–/, '-').trim();
    if (!str || str.match(/[^0-9.,-]/))
        return NaN;
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
function toOrdinal(x) {
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
function fmt(n) {
    let [h, t, o] = ('00' + n).substr(-3).split('');
    return [
        +h === 0 ? '' : ONES[+h] + ' hundred ',
        +o === 0 ? TENS[+t] : TENS[+t] && TENS[+t] + '-' || '',
        ONES[(+t) + (+o)] || ONES[+o]
    ].join('');
}
function cons(xs, x, g) {
    return x ? [x, g && ' ' + g || '', ' ', xs].join('') : xs;
}
/** Spells a number as an English word. */
function toWord(n) {
    if (n === 0)
        return 'zero';
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
function digits(n) {
    let str = '' + Math.abs(n);
    return str.split('').reverse().map(x => +x);
}
/** Rounds a number `n` to `precision` decimal places. */
function round(n, precision = 0) {
    let factor = Math.pow(10, precision);
    return Math.round(n * factor) / factor;
}
/** Round a number `n` to the nearest multiple of `increment`. */
function roundTo(n, increment = 1) {
    return Math.round(n / increment) * increment;
}
/**
 * Returns an [numerator, denominator] array that approximated a `decimal` to
 * `precision`. See http://en.wikipedia.org/wiki/Continued_fraction
 */
function toFraction(decimal, precision = PRECISION) {
    let n = [1, 0], d = [0, 1];
    let a = Math.floor(decimal);
    let rem = decimal - a;
    while (d[0] <= 1 / precision) {
        if (nearlyEquals(n[0] / d[0], precision))
            return [n[0], d[0]];
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
function clamp(x, min = -Infinity, max = Infinity) {
    return Math.min(max, Math.max(min, x));
}
/** Linear interpolation */
function lerp(a, b, t = 0.5) {
    return a + (b - a) * t;
}
/** Squares a number. */
function square(x) {
    return x * x;
}
/** Cubes a number. */
function cube(x) {
    return x * x * x;
}
/**
 * Calculates `a mod m`. The JS implementation of the % operator returns the
 * symmetric modulo. Both are identical if a >= 0 and m >= 0 but the results
 * differ if a or m < 0.
 */
function mod(a, m) {
    return ((a % m) + a) % m;
}
/** Calculates the logarithm of `x` with base `b`. */
function log(x, b) {
    return (b === undefined) ? Math.log(x) : Math.log(x) / Math.log(b);
}
/** Solves the quadratic equation a x^2 + b x + c = 0 */
function quadratic(a, b, c) {
    const p = -b / 2 / a;
    const q = Math.sqrt(b * b - 4 * a * c) / 2 / a;
    return [p + q, p - q];
}

// ============================================================================
// Fermat.js | Combinatorics
// (c) Mathigon
// ============================================================================
/** Calculates the factorial of a number x. */
function factorial(x) {
    if (x === 0)
        return 1;
    if (x < 0)
        return NaN;
    let n = 1;
    for (let i = 2; i <= x; ++i)
        n *= i;
    return n;
}
/** Calculates the binomial coefficient nCk of two numbers n and k. */
function binomial(n, k) {
    if (k === 0) {
        return 1;
    }
    else if (2 * k > n) {
        return binomial(n, n - k);
    }
    else {
        let coeff = 1;
        for (let i = k; i > 0; --i) {
            coeff *= (n - i + 1);
            coeff /= i;
        }
        return coeff;
    }
}
/**
 * Returns an array of all possible permutations of an input array arr. In this
 * implementation, we always have permutations(arr)[0] == arr. From
 * http://stackoverflow.com/questions/9960908/permutations-in-javascript
 */
function permutations(arr) {
    const permArr = [];
    const usedChars = [];
    permuteHelper(arr, permArr, usedChars);
    return permArr;
}
function permuteHelper(input, permArr, usedChars) {
    for (let i = 0; i < input.length; i++) {
        const term = input.splice(i, 1)[0];
        usedChars.push(term);
        if (input.length === 0) {
            permArr.push(usedChars.slice());
        }
        permuteHelper(input, permArr, usedChars);
        input.splice(i, 0, term);
        usedChars.pop();
    }
}
/**
 * Returns an array of all possible subsets of an input array (of given length).
 */
function subsets(array, length = 0) {
    const copy = array.slice(0);
    const results = subsetsHelper(copy);
    return length ? results.filter(x => x.length === length) : results;
}
function subsetsHelper(array) {
    if (array.length === 1)
        return [[], array];
    const last = array.pop();
    const subsets = subsetsHelper(array);
    const result = [];
    for (const s of subsets) {
        result.push(s, [...s, last]);
    }
    return result;
}

// =============================================================================
// Fermat.js | Complex Numbers
// (c) Mathigon
// =============================================================================
/**  Complex number class. */
class Complex {
    constructor(re = 0, im = 0) {
        this.re = re;
        this.im = im;
    }
    get magnitude() {
        return Math.sqrt(this.re * this.re + this.im * this.im);
    }
    get phase() {
        return Math.atan2(this.im, this.re);
    }
    get conjugate() {
        return new Complex(this.re, -this.im);
    }
    toString() {
        if (!this.re)
            return this.im + 'i';
        if (!this.im)
            return this.re;
        return this.re + ' + ' + this.im + 'i';
    }
    // ---------------------------------------------------------------------------
    /** Calculates the sum of two complex numbers c1 and c2. */
    static sum(c1, c2) {
        if (!(c1 instanceof Complex))
            c1 = new Complex(c1, 0);
        if (!(c2 instanceof Complex))
            c2 = new Complex(c2, 0);
        return new Complex(c1.re + c2.re, c1.im + c2.im);
    }
    /** Calculates the difference of two complex numbers c1 and c2. */
    static difference(c1, c2) {
        if (!(c1 instanceof Complex))
            c1 = new Complex(c1, 0);
        if (!(c2 instanceof Complex))
            c2 = new Complex(c2, 0);
        return new Complex(c1.re - c2.re, c1.im - c2.im);
    }
    /** Calculates the product of two complex numbers c1 and c2. */
    static product(c1, c2) {
        if (!(c1 instanceof Complex))
            c1 = new Complex(c1, 0);
        if (!(c2 instanceof Complex))
            c2 = new Complex(c2, 0);
        let re = c1.re * c2.re - c1.im * c2.im;
        let im = c1.im * c2.re + c1.re * c2.im;
        return new Complex(re, im);
    }
    /** Calculates the sum of two quotient numbers c1 and c2. */
    static quotient(c1, c2) {
        if (!(c1 instanceof Complex))
            c1 = new Complex(c1, 0);
        if (!(c2 instanceof Complex))
            c2 = new Complex(c2, 0);
        if (Math.abs(c2.re) < Number.EPSILON || Math.abs(c2.im) < Number.EPSILON)
            return new Complex(Infinity, Infinity);
        let denominator = c2.re * c2.re + c2.im * c2.im;
        let re = (c1.re * c2.re + c1.im * c2.im) / denominator;
        let im = (c1.im * c2.re - c1.re * c2.im) / denominator;
        return new Complex(re, im);
    }
}

// =============================================================================
// Core.ts | Utility Functions
// (c) Mathigon
// =============================================================================
/** Creates a random UID string of a given length. */
function uid(n = 10) {
    return Math.random().toString(36).substr(2, n);
}
/** Checks if x is strictly equal to any one of the following arguments. */
function isOneOf(x, ...values) {
    for (let v of values) {
        if (x === v)
            return true;
    }
    return false;
}

// =============================================================================
// Core.ts | Array Functions
// (c) Mathigon
// =============================================================================
/** Creates an array of size `n`, containing `value` at every entry. */
function repeat(value, n) {
    return new Array(n).fill(value);
}
/** Creates a matrix of size `x` by `y`, containing `value` at every entry. */
function repeat2D(value, x, y) {
    const result = [];
    for (let i = 0; i < x; ++i) {
        result.push(repeat(value, y));
    }
    return result;
}
/** Creates an array of size `n`, with the result of `fn(i)` at position i. */
function tabulate(fn, n) {
    const result = [];
    for (let i = 0; i < n; ++i) {
        result.push(fn(i));
    }
    return result;
}
/**
 * Creates a matrix of size `x` by `y`, with the result of `fn(i, j)` at
 * position (i, j.
 */
function tabulate2D(fn, x, y) {
    const result = [];
    for (let i = 0; i < x; ++i) {
        const row = [];
        for (let j = 0; j < y; ++j) {
            row.push(fn(i, j));
        }
        result.push(row);
    }
    return result;
}
/** Creates an array of numbers from 0 to a, or from a to b. */
function list(a, b, step = 1) {
    const arr = [];
    if (b === undefined && a >= 0) {
        for (let i = 0; i < a; i += step)
            arr.push(i);
    }
    else if (b === undefined) {
        for (let i = 0; i > a; i -= step)
            arr.push(i);
    }
    else if (a <= b) {
        for (let i = a; i <= b; i += step)
            arr.push(i);
    }
    else {
        for (let i = a; i >= b; i -= step)
            arr.push(i);
    }
    return arr;
}
/** Finds the sum of all elements in an numeric array. */
function total(array) {
    return array.reduce((t, v) => t + v, 0);
}
/** Filters all duplicate elements from an array. */
function unique(array) {
    return array.filter((a, i) => array.indexOf(a) === i);
}
/** Flattens a nested array into a single list. */
function flatten(array) {
    return array.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []);
}
/** Converts an array to a linked list data structure. */
function toLinkedList(array) {
    const result = array.map(a => ({ val: a, next: undefined }));
    const n = result.length;
    for (let i = 0; i < n - 1; ++i) {
        result[i].next = result[i + 1];
    }
    result[n - 1].next = result[0];
    return result;
}

// ============================================================================
const LOWER_CASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPER_CASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const ENGLISH_FREQUENCY = {
    a: 0.08167, b: 0.01492, c: 0.02782, d: 0.04253, e: 0.12702, f: 0.02228,
    g: 0.02015, h: 0.06094, i: 0.06966, j: 0.00154, k: 0.00772, l: 0.04024,
    m: 0.02406, n: 0.06749, o: 0.07507, p: 0.01929, q: 0.00095, r: 0.05987,
    s: 0.06327, t: 0.09056, u: 0.02758, v: 0.00978, w: 0.02360, x: 0.00150,
    y: 0.01974, z: 0.00074
};
/**
 * Enciphers a string by shifting every letter by a certain offset through the
 * alphabet.
 */
function caesarCipher(msg, shift = 0) {
    let cipher = '';
    for (let l of msg) {
        if (l >= 'a' && l <= 'z') {
            cipher += LOWER_CASE[(LOWER_CASE.indexOf(l) + shift) % 26];
        }
        else if (l >= 'A' && l <= 'Z') {
            cipher += UPPER_CASE[(UPPER_CASE.indexOf(l) + shift) % 26];
        }
        else {
            cipher += l;
        }
    }
    return cipher;
}
/** Enciphers a string using a Vigenere cipher with a give key. */
function vigenereCipher(msg, key) {
    let cipher = '';
    let count = 0;
    let keyLength = key.length;
    key = key.toLowerCase();
    for (let l of msg) {
        // The shift changes after every iteration, based on the key word
        let shift = LOWER_CASE.indexOf(key[count % keyLength]);
        if (l >= 'a' && l <= 'z') {
            cipher += LOWER_CASE[(LOWER_CASE.indexOf(l) + shift) % 26];
            count++;
        }
        else if (l >= 'A' && l <= 'Z') {
            cipher += UPPER_CASE[(UPPER_CASE.indexOf(l) + shift) % 26];
            count++;
        }
        else {
            cipher += l;
        }
    }
    return cipher;
}
/** Returns the relative frequency of a given letter in the English language. */
function letterFrequency(letter) {
    return ENGLISH_FREQUENCY[letter.toLowerCase()] || 0;
}
/** Counts how often every letter occurs in a given cipher. */
function cipherLetterFreq(cipher) {
    let msg = cipher.toLowerCase();
    let freq = repeat(0, 26);
    for (let l of msg) {
        if (l >= 'a' && l <= 'z')
            freq[LOWER_CASE.indexOf(l)] += 1;
    }
    return freq;
}

// =============================================================================
// -----------------------------------------------------------------------------
// Points
/** A single point class defined by two coordinates x and y. */
class Point {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
        this.type = 'point';
    }
    get unitVector() {
        if (nearlyEquals(this.length, 0))
            return new Point(1, 0);
        return this.scale(1 / this.length);
    }
    get length() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }
    get inverse() {
        return new Point(-this.x, -this.y);
    }
    get flip() {
        return new Point(this.y, this.x);
    }
    get perpendicular() {
        return new Point(-this.y, this.x);
    }
    get array() {
        return [this.x, this.y];
    }
    /** Finds the perpendicular distance between this point and a line. */
    distanceFromLine(l) {
        return Point.distance(this, l.project(this));
    }
    /** Clamps this point between given x and y values. */
    clamp(xMin, xMax, yMin, yMax) {
        return new Point(clamp(this.x, xMin, xMax), clamp(this.y, yMin, yMax));
    }
    /** Transforms this point using a 2x3 matrix m. */
    transform(m) {
        const x = m[0][0] * this.x + m[0][1] * this.y + m[0][2];
        const y = m[1][0] * this.x + m[1][1] * this.y + m[1][2];
        return new Point(x, y);
    }
    /** Rotates this point by a given angle (in radians) around c. */
    rotate(angle, c = ORIGIN) {
        const x0 = this.x - c.x;
        const y0 = this.y - c.y;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const x = x0 * cos - y0 * sin + c.x;
        const y = x0 * sin + y0 * cos + c.y;
        return new Point(x, y);
    }
    /** Reflects this point across a line l. */
    reflect(l) {
        let v = l.p2.x - l.p1.x;
        let w = l.p2.y - l.p1.y;
        let x0 = this.x - l.p1.x;
        let y0 = this.y - l.p1.y;
        let mu = (v * y0 - w * x0) / (v * v + w * w);
        let x = this.x + 2 * mu * w;
        let y = this.y - 2 * mu * v;
        return new Point(x, y);
    }
    scale(sx, sy = sx) {
        return new Point(this.x * sx, this.y * sy);
    }
    shift(x, y = x) {
        return new Point(this.x + x, this.y + y);
    }
    translate(p) {
        return this.shift(p.x, p.y); // Alias for .add()
    }
    changeCoordinates(originCoords, targetCoords) {
        const x = targetCoords.xMin + (this.x - originCoords.xMin) /
            (originCoords.dx) * (targetCoords.dx);
        const y = targetCoords.yMin + (this.y - originCoords.yMin) /
            (originCoords.dy) * (targetCoords.dy);
        return new Point(x, y);
    }
    add(p) {
        return Point.sum(this, p);
    }
    subtract(p) {
        return Point.difference(this, p);
    }
    equals(other) {
        return nearlyEquals(this.x, other.x) && nearlyEquals(this.y, other.y);
    }
    round(inc = 1) {
        return new Point(roundTo(this.x, inc), roundTo(this.y, inc));
    }
    floor() {
        return new Point(Math.floor(this.x), Math.floor(this.y));
    }
    mod(x, y = x) {
        return new Point(this.x % x, this.y % y);
    }
    angle(c = ORIGIN) {
        return rad(this, c);
    }
    /** Calculates the average of multiple points. */
    static average(...points) {
        let x = total(points.map(p => p.x)) / points.length;
        let y = total(points.map(p => p.y)) / points.length;
        return new Point(x, y);
    }
    /** Calculates the dot product of two points p1 and p2. */
    static dot(p1, p2) {
        return p1.x * p2.x + p1.y * p2.y;
    }
    static sum(p1, p2) {
        return new Point(p1.x + p2.x, p1.y + p2.y);
    }
    static difference(p1, p2) {
        return new Point(p1.x - p2.x, p1.y - p2.y);
    }
    /** Returns the Euclidean distance between two points p1 and p2. */
    static distance(p1, p2) {
        return Math.sqrt(square(p1.x - p2.x) + square(p1.y - p2.y));
    }
    /** Returns the Manhattan distance between two points p1 and p2. */
    static manhattan(p1, p2) {
        return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
    }
    /** Interpolates two points p1 and p2 by a factor of t. */
    static interpolate(p1, p2, t = 0.5) {
        return new Point(lerp(p1.x, p2.x, t), lerp(p1.y, p2.y, t));
    }
    /** Interpolates a list of multiple points. */
    static interpolateList(points, t = 0.5) {
        const n = points.length - 1;
        const a = Math.floor(clamp(t, 0, 1) * n);
        return Point.interpolate(points[a], points[a + 1], n * t - a);
    }
    /** Creates a point from polar coordinates. */
    static fromPolar(angle, r = 1) {
        return new Point(r * Math.cos(angle), r * Math.sin(angle));
    }
}
const ORIGIN = new Point(0, 0);
// -----------------------------------------------------------------------------
// Bounds
class Bounds {
    constructor(xMin, xMax, yMin, yMax) {
        this.xMin = xMin;
        this.xMax = xMax;
        this.yMin = yMin;
        this.yMax = yMax;
    }
    get dx() {
        return this.xMax - this.xMin;
    }
    get dy() {
        return this.yMax - this.yMin;
    }
}
// -----------------------------------------------------------------------------
// Angles
const TWO_PI = 2 * Math.PI;
/** A 2-dimensional angle class, defined by three points. */
class Angle {
    constructor(a, b, c) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.type = 'angle';
    }
    transform(m) {
        return new Angle(this.a.transform(m), this.b.transform(m), this.c.transform(m));
    }
    /** The size, in radians, of this angle. */
    get rad() {
        let phiA = Math.atan2(this.a.y - this.b.y, this.a.x - this.b.x);
        let phiC = Math.atan2(this.c.y - this.b.y, this.c.x - this.b.x);
        let phi = phiC - phiA;
        if (phi < 0)
            phi += TWO_PI;
        return phi;
    }
    /** The size, in degrees, of this angle. */
    get deg() {
        return this.rad * 180 / Math.PI;
    }
    /** Checks if this angle is right-angled. */
    get isRight() {
        return nearlyEquals(this.rad, Math.PI / 2, 0.01);
    }
    /** The bisector of this angle. */
    get bisector() {
        let phiA = Math.atan2(this.a.y - this.b.y, this.a.x - this.b.x);
        let phiC = Math.atan2(this.c.y - this.b.y, this.c.x - this.b.x);
        let phi = (phiA + phiC) / 2;
        if (phiA > phiC)
            phi += Math.PI;
        let x = Math.cos(phi) + this.b.x;
        let y = Math.sin(phi) + this.b.y;
        return new Line(this.b, new Point(x, y));
    }
    /** Returns the smaller one of this and its supplementary angle. */
    get sup() {
        return (this.rad < Math.PI) ? this : new Angle(this.c, this.b, this.a);
    }
    /** Returns the Arc element corresponding to this angle. */
    get arc() {
        return new Arc(this.b, this.a, this.rad);
    }
    equals(a) {
        return false; // TODO
    }
}
function rad(p, c = ORIGIN) {
    const a = Math.atan2(p.y - c.y, p.x - c.x);
    return (a + TWO_PI) % TWO_PI;
}
// -----------------------------------------------------------------------------
// Lines, Rays and Line Segments
/** An infinite straight line that goes through two points. */
class Line {
    constructor(p1, p2) {
        this.p1 = p1;
        this.p2 = p2;
        this.type = 'line';
    }
    make(p1, p2) {
        return new Line(p1, p2);
    }
    /* The distance between the two points defining this line. */
    get length() {
        return Point.distance(this.p1, this.p2);
    }
    /** The midpoint of this line. */
    get midpoint() {
        return Point.average(this.p1, this.p2);
    }
    /** The slope of this line. */
    get slope() {
        return (this.p2.y - this.p1.y) / (this.p2.x - this.p1.x);
    }
    /** The y-axis intercept of this line. */
    get intercept() {
        return this.p1.y + this.slope * this.p1.x;
    }
    /** The angle formed between this line and the x-axis. */
    get angle() {
        return rad(this.p2, this.p1);
    }
    /** The point representing a unit vector along this line. */
    get unitVector() {
        return this.p2.subtract(this.p1).unitVector;
    }
    /** The point representing the perpendicular vector of this line. */
    get perpendicularVector() {
        return new Point(this.p2.y - this.p1.y, this.p1.x - this.p2.x).unitVector;
    }
    /** Finds the line parallel to this one, going though point p. */
    parallel(p) {
        const q = Point.sum(p, Point.difference(this.p2, this.p1));
        return new Line(p, q);
    }
    /** Finds the line perpendicular to this one, going though point p. */
    perpendicular(p) {
        return new Line(p, Point.sum(p, this.perpendicularVector));
    }
    /** The perpendicular bisector of this line. */
    get perpendicularBisector() {
        return this.perpendicular(this.midpoint);
    }
    /** Projects this point onto the line `l`. */
    project(p) {
        const a = Point.difference(this.p2, this.p1);
        const b = Point.difference(p, this.p1);
        const proj = a.scale(Point.dot(a, b) / this.length ** 2);
        return Point.sum(this.p1, proj);
    }
    /** Checks if a point p lies on this line. */
    contains(p) {
        // det([[p.x, p.y, 1],[p1.x, p1.y, 1],[p2.x, ,p2.y 1]])
        const det = p.x * (this.p1.y - this.p2.y) + this.p1.x * (this.p2.y - p.y)
            + this.p2.x * (p.y - this.p1.y);
        return nearlyEquals(det, 0);
    }
    at(t) {
        return Point.interpolate(this.p1, this.p2, t);
    }
    transform(m) {
        return new this.constructor(this.p1.transform(m), this.p2.transform(m));
    }
    rotate(a, c = ORIGIN) {
        return new this.constructor(this.p1.rotate(a, c), this.p2.rotate(a, c));
    }
    reflect(l) {
        return new this.constructor(this.p1.reflect(l), this.p2.reflect(l));
    }
    scale(sx, sy = sx) {
        return this.make(this.p1.scale(sx, sy), this.p2.scale(sx, sy));
    }
    shift(x, y = x) {
        return this.make(this.p1.shift(x, y), this.p2.shift(x, y));
    }
    translate(p) {
        return this.shift(p.x, p.y);
    }
    equals(other) {
        return this.contains(other.p1) && this.contains(other.p2);
    }
}
/** An infinite ray defined by an endpoint and another point on the ray. */
class Ray extends Line {
    constructor() {
        super(...arguments);
        this.type = 'ray';
    }
    make(p1, p2) {
        return new Ray(p1, p2);
    }
    equals(other) {
        if (other.type !== 'ray')
            return false;
        return this.p1.equals(other.p1) && this.contains(other.p2);
    }
}
/** A finite line segment defined by its two endpoints. */
class Segment extends Line {
    constructor() {
        super(...arguments);
        this.type = 'segment';
    }
    contains(p) {
        if (!Line.prototype.contains.call(this, p))
            return false;
        if (nearlyEquals(this.p1.x, this.p2.x)) {
            return isBetween(p.y, this.p1.y, this.p2.y);
        }
        else {
            return isBetween(p.x, this.p1.x, this.p2.x);
        }
    }
    make(p1, p2) {
        return new Segment(p1, p2);
    }
    project(p) {
        const a = Point.difference(this.p2, this.p1);
        const b = Point.difference(p, this.p1);
        const q = clamp(Point.dot(a, b) / square(this.length), 0, 1);
        return Point.sum(this.p1, a.scale(q));
    }
    /** Contracts (or expands) a line by a specific ratio. */
    contract(x) {
        return new Segment(this.at(x), this.at(1 - x));
    }
    equals(other, oriented = false) {
        if (other.type !== 'segment')
            return false;
        return (this.p1.equals(other.p1) && this.p2.equals(other.p2)) ||
            (!oriented && this.p1.equals(other.p2) && this.p2.equals(other.p1));
    }
    /** Finds the intersection of two line segments l1 and l2 (or undefined). */
    static intersect(s1, s2) {
        return intersections(s1, s2)[0] || undefined;
    }
}
// -----------------------------------------------------------------------------
// Circles, Ellipses and Arcs
/** A circle with a given center and radius. */
class Circle {
    constructor(c = ORIGIN, r = 1) {
        this.c = c;
        this.r = r;
        this.type = 'circle';
    }
    /** The length of the circumference of this circle. */
    get circumference() {
        return TWO_PI * this.r;
    }
    /** The area of this circle. */
    get area() {
        return Math.PI * this.r ** 2;
    }
    get arc() {
        let start = this.c.shift(this.r, 0);
        return new Arc(this.c, start, TWO_PI);
    }
    transform(m) {
        return new Circle(this.c.transform(m), this.r * (m[0][0] + m[1][1]) / 2);
    }
    rotate(a, c = ORIGIN) {
        return new Circle(this.c.rotate(a, c), this.r);
    }
    reflect(l) {
        return new Circle(this.c.reflect(l), this.r);
    }
    scale(sx, sy = sx) {
        return new Circle(this.c.scale(sx, sy), this.r * (sx + sy) / 2);
    }
    shift(x, y = x) {
        return new Circle(this.c.shift(x, y), this.r);
    }
    translate(p) {
        return this.shift(p.x, p.y);
    }
    contains(p) {
        return Point.distance(p, this.c) <= this.r;
    }
    equals(other) {
        return nearlyEquals(this.r, other.r) && this.c.equals(other.c);
    }
    project(p) {
        const proj = p.subtract(this.c).unitVector.scale(this.r);
        return Point.sum(this.c, proj);
    }
    at(t) {
        const a = 2 * Math.PI * t;
        return this.c.shift(this.r * Math.cos(a), this.r * Math.sin(a));
    }
    tangentAt(t) {
        const p1 = this.at(t);
        const p2 = this.c.rotate(Math.PI / 2, p1);
        return new Line(p1, p2);
    }
}
/** An arc segment of a circle, with given center, start point and angle. */
class Arc {
    constructor(c, start, angle) {
        this.c = c;
        this.start = start;
        this.angle = angle;
        this.type = 'arc';
    }
    get radius() {
        return Point.distance(this.c, this.start);
    }
    get end() {
        return this.start.rotate(this.angle, this.c);
    }
    transform(m) {
        return new this.constructor(this.c.transform(m), this.start.transform(m), this.angle);
    }
    get startAngle() {
        return rad(this.start, this.c);
    }
    project(p) {
        let start = this.startAngle;
        let end = start + this.angle;
        let angle = rad(p, this.c);
        if (end > TWO_PI && angle < end - TWO_PI)
            angle += TWO_PI;
        angle = clamp(angle, start, end);
        return this.c.shift(this.radius, 0).rotate(angle, this.c);
    }
    at(t) {
        return this.start.rotate(this.angle * t, this.c);
    }
    contract(p) {
        return new this.constructor(this.c, this.at(p / 2), this.angle * (1 - p));
    }
    get minor() {
        if (this.angle <= Math.PI)
            return this;
        return new this.constructor(this.c, this.end, 2 * Math.PI - this.angle);
    }
    get major() {
        if (this.angle >= Math.PI)
            return this;
        return new this.constructor(this.c, this.end, 2 * Math.PI - this.angle);
    }
    get center() {
        return this.at(0.5);
    }
    equals() {
        // TODO Implement
        return false;
    }
}
class Sector extends Arc {
    constructor() {
        super(...arguments);
        this.type = 'sector';
    }
}
// -----------------------------------------------------------------------------
// Polygons
/** A polygon defined by its vertex points. */
class Polygon {
    constructor(...points) {
        this.type = 'polygon';
        this.points = points;
    }
    get circumference() {
        let C = 0;
        for (let i = 1; i < this.points.length; ++i) {
            C += Point.distance(this.points[i - 1], this.points[i]);
        }
        return C;
    }
    /**
     * The (signed) area of this polygon. The result is positive if the vertices
     * are ordered clockwise, and negative otherwise.
     */
    get signedArea() {
        let p = this.points;
        let n = p.length;
        let A = p[n - 1].x * p[0].y - p[0].x * p[n - 1].y;
        for (let i = 1; i < n; ++i) {
            A += p[i - 1].x * p[i].y - p[i].x * p[i - 1].y;
        }
        return A / 2;
    }
    get area() {
        return Math.abs(this.signedArea);
    }
    get centroid() {
        let p = this.points;
        let n = p.length;
        let Cx = 0;
        for (let i = 0; i < n; ++i)
            Cx += p[i].x;
        let Cy = 0;
        for (let i = 0; i < n; ++i)
            Cy += p[i].y;
        return new Point(Cx / n, Cy / n);
    }
    get edges() {
        let p = this.points;
        let n = p.length;
        let edges = [];
        for (let i = 0; i < n; ++i)
            edges.push(new Segment(p[i], p[(i + 1) % n]));
        return edges;
    }
    get radius() {
        const c = this.centroid;
        const radii = this.points.map(p => Point.distance(p, c));
        return Math.max(...radii);
    }
    transform(m) {
        return new this.constructor(...this.points.map(p => p.transform(m)));
    }
    rotate(a, center = ORIGIN) {
        const points = this.points.map(p => p.rotate(a, center));
        return new this.constructor(...points);
    }
    reflect(line) {
        const points = this.points.map(p => p.reflect(line));
        return new this.constructor(...points);
    }
    scale(sx, sy = sx) {
        const points = this.points.map(p => p.scale(sx, sy));
        return new this.constructor(...points);
    }
    shift(x, y = x) {
        const points = this.points.map(p => p.shift(x, y));
        return new this.constructor(...points);
    }
    translate(p) {
        return this.shift(p.x, p.y);
    }
    /** Checks if a point p lies inside this polygon. */
    contains(p) {
        let n = this.points.length;
        let inside = false;
        for (let i = 0; i < n; ++i) {
            const q1 = this.points[i];
            const q2 = this.points[(i + 1) % n];
            const x = (q1.y > p.y) !== (q2.y > p.y);
            const y = p.x < (q2.x - q1.x) * (p.y - q1.y) / (q2.y - q1.y) + q1.x;
            if (x && y)
                inside = !inside;
        }
        return inside;
    }
    equals(other) {
        // TODO Implement
        return false;
    }
    project(p) {
        // TODO Implement
        return ORIGIN;
    }
    at(t) {
        return Point.interpolateList([...this.points, this.points[0]], t);
    }
    /** The oriented version of this polygon (vertices in clockwise order). */
    get oriented() {
        if (this.signedArea >= 0)
            return this;
        const points = [...this.points].reverse();
        return new this.constructor(...points);
    }
    /**
     * The intersection of this and another polygon, calculated using the
     * Weiler–Atherton clipping algorithm
     */
    intersect(polygon) {
        // TODO Support intersections with multiple disjoint overlapping areas.
        // TODO Support segments intersecting at their endpoints
        const points = [toLinkedList(this.oriented.points),
            toLinkedList(polygon.oriented.points)];
        const max = this.points.length + polygon.points.length;
        const result = [];
        let which = 0;
        let active = points[which].find(p => polygon.contains(p.val));
        if (!active)
            return undefined; // No intersection
        while (active.val !== result[0] && result.length < max) {
            result.push(active.val);
            const nextEdge = new Segment(active.val, active.next.val);
            active = active.next;
            for (let p of points[1 - which]) {
                const testEdge = new Segment(p.val, p.next.val);
                const intersect = intersections(nextEdge, testEdge)[0];
                if (intersect) {
                    which = 1 - which; // Switch active polygon
                    active = { val: intersect, next: p.next };
                    break;
                }
            }
        }
        return new Polygon(...result);
    }
    /** Checks if two polygons p1 and p2 collide. */
    static collision(p1, p2) {
        // Check if any of the edges overlap.
        for (let e1 of p1.edges) {
            for (let e2 of p2.edges) {
                if (Segment.intersect(e1, e2))
                    return true;
            }
        }
        // Check if one of the vertices is in one of the the polygons.
        for (let v of p1.points)
            if (p2.contains(v))
                return true;
        for (let v of p2.points)
            if (p1.contains(v))
                return true;
        return false;
    }
    /** Creates a regular polygon. */
    static regular(n, radius = 1) {
        const da = 2 * Math.PI / n;
        const a0 = Math.PI / 2 - da / 2;
        const points = tabulate((i) => Point.fromPolar(a0 + da * i, radius), n);
        return new Polygon(...points);
    }
    /** Interpolates the points of two polygons */
    static interpolate(p1, p2, t = 0.5) {
        // TODO support interpolating polygons with different numbers of points
        const points = p1.points.map((p, i) => Point.interpolate(p, p2.points[i], t));
        return new Polygon(...points);
    }
}
/** A polyline defined by its vertex points. */
class Polyline extends Polygon {
    constructor() {
        super(...arguments);
        this.type = 'polyline';
        // TODO Other methods and properties
    }
    /** @returns {Segment[]} */
    get edges() {
        let edges = [];
        for (let i = 0; i < this.points.length - 1; ++i)
            edges.push(new Segment(this.points[i], this.points[i + 1]));
        return edges;
    }
}
/** A triangle defined by its three vertices. */
class Triangle extends Polygon {
    constructor() {
        super(...arguments);
        this.type = 'triangle';
    }
    get circumcircle() {
        const [a, b, c] = this.points;
        const d = 2 * (a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y));
        const ux = (a.x ** 2 + a.y ** 2) * (b.y - c.y) +
            (b.x ** 2 + b.y ** 2) * (c.y - a.y) +
            (c.x ** 2 + c.y ** 2) * (a.y - b.y);
        const uy = (a.x ** 2 + a.y ** 2) * (c.x - b.x) +
            (b.x ** 2 + b.y ** 2) * (a.x - c.x) +
            (c.x ** 2 + c.y ** 2) * (b.x - a.x);
        const center = new Point(ux / d, uy / d);
        const radius = Point.distance(center, this.points[0]);
        return new Circle(center, radius);
    }
    get incircle() {
        const edges = this.edges;
        const sides = edges.map(e => e.length);
        const total = sides[0] + sides[1] + sides[2];
        const [a, b, c] = this.points;
        const ux = sides[1] * a.x + sides[2] * b.x + sides[0] * c.x;
        const uy = sides[1] * a.y + sides[2] * b.y + sides[0] * c.y;
        const center = new Point(ux / total, uy / total);
        const radius = center.distanceFromLine(edges[0]);
        return new Circle(center, radius);
    }
    get orthocenter() {
        const [a, b, c] = this.points;
        const h1 = new Line(a, b).perpendicular(c);
        const h2 = new Line(a, c).perpendicular(b);
        return intersections(h1, h2)[0];
    }
}
// -----------------------------------------------------------------------------
// Rectangles and Squares
/** A rectangle, defined by its top left vertex, width and height. */
class Rectangle {
    constructor(p, w = 1, h = w) {
        this.p = p;
        this.w = w;
        this.h = h;
        this.type = 'rectangle';
    }
    static aroundPoints(...points) {
        const xs = points.map(p => p.x);
        const ys = points.map(p => p.y);
        const x = Math.min(...xs);
        const w = Math.max(...xs) - x;
        const y = Math.min(...ys);
        const h = Math.max(...ys) - y;
        return new Rectangle(new Point(x, y), w, h);
    }
    get center() {
        return new Point(this.p.x + this.w / 2, this.p.y + this.h / 2);
    }
    get circumference() {
        return 2 * Math.abs(this.w) + 2 * Math.abs(this.h);
    }
    get area() {
        return Math.abs(this.w * this.h);
    }
    /** @returns {Segment[]} */
    get edges() {
        return this.polygon.edges;
    }
    /** @returns {Point[]} */
    get points() {
        return this.polygon.points;
    }
    /**
     * A polygon class representing this rectangle.
     * @returns {Polygon}
     */
    get polygon() {
        let b = new Point(this.p.x + this.w, this.p.y);
        let c = new Point(this.p.x + this.w, this.p.y + this.h);
        let d = new Point(this.p.x, this.p.y + this.h);
        return new Polygon(this.p, b, c, d);
    }
    transform(m) {
        return this.polygon.transform(m);
    }
    rotate(a, c = ORIGIN) {
        return this.polygon.rotate(a, c);
    }
    reflect(l) {
        return this.polygon.reflect(l);
    }
    scale(sx, sy = sx) {
        return new Rectangle(this.p.scale(sx, sy), this.w * sx, this.h * sy);
    }
    shift(x, y = x) {
        return new Rectangle(this.p.shift(x, y), this.w, this.h);
    }
    translate(p) {
        return this.shift(p.x, p.y);
    }
    contains(p) {
        return isBetween(p.x, this.p.x, this.p.x + this.w) &&
            isBetween(p.y, this.p.y, this.p.y + this.h);
    }
    equals(other) {
        // TODO Implement
        return false;
    }
    project(p) {
        // TODO Use the generic intersections() function
        // bottom right corner of rect
        let rect1 = { x: this.p.x + this.w, y: this.p.y + this.h };
        let center = { x: this.p.x + this.w / 2, y: this.p.y + this.h / 2 };
        let m = (center.y - p.y) / (center.x - p.x);
        if (p.x <= center.x) { // check left side
            let y = m * (this.p.x - p.x) + p.y;
            if (this.p.y < y && y < rect1.y)
                return new Point(this.p.x, y);
        }
        if (p.x >= center.x) { // check right side
            let y = m * (rect1.x - p.x) + p.y;
            if (this.p.y < y && y < rect1.y)
                return new Point(rect1.x, y);
        }
        if (p.y <= center.y) { // check top side
            let x = (this.p.y - p.y) / m + p.x;
            if (this.p.x < x && x < rect1.x)
                return new Point(x, this.p.y);
        }
        if (p.y >= center.y) { // check bottom side
            let x = (rect1.y - p.y) / m + p.x;
            if (this.p.x < x && x < rect1.x)
                return new Point(x, rect1.y);
        }
    }
    at(t) {
        // TODO Implement
    }
}
// -----------------------------------------------------------------------------
// Intersections
function liesOnSegment(s, p) {
    if (nearlyEquals(s.p1.x, s.p2.x))
        return isBetween(p.y, s.p1.y, s.p2.y);
    return isBetween(p.x, s.p1.x, s.p2.x);
}
function liesOnRay(r, p) {
    if (nearlyEquals(r.p1.x, r.p2.x))
        return (p.y - r.p1.y) / (r.p2.y - r.p1.y) >
            0;
    return (p.x - r.p1.x) / (r.p2.x - r.p1.x) > 0;
}
function lineLineIntersection(l1, l2) {
    const d1x = l1.p1.x - l1.p2.x;
    const d1y = l1.p1.y - l1.p2.y;
    const d2x = l2.p1.x - l2.p2.x;
    const d2y = l2.p1.y - l2.p2.y;
    const d = d1x * d2y - d1y * d2x;
    if (nearlyEquals(d, 0))
        return []; // Colinear lines never intersect
    const q1 = l1.p1.x * l1.p2.y - l1.p1.y * l1.p2.x;
    const q2 = l2.p1.x * l2.p2.y - l2.p1.y * l2.p2.x;
    const x = q1 * d2x - d1x * q2;
    const y = q1 * d2y - d1y * q2;
    return [new Point(x / d, y / d)];
}
function circleCircleIntersection(c1, c2) {
    const d = Point.distance(c1.c, c2.c);
    // Circles are separate:
    if (d > c1.r + c2.r)
        return [];
    // One circles contains the other:
    if (d < Math.abs(c1.r - c2.r))
        return [];
    // Circles are the same:
    if (nearlyEquals(d, 0) && nearlyEquals(c1.r, c2.r))
        return [];
    // Circles touch:
    if (nearlyEquals(d, c1.r + c2.r))
        return [new Line(c1.c, c2.c).midpoint];
    const a = (square(c1.r) - square(c2.r) + square(d)) / (2 * d);
    const b = Math.sqrt(square(c1.r) - square(a));
    const px = (c2.c.x - c1.c.x) * a / d + (c2.c.y - c1.c.y) * b / d + c1.c.x;
    const py = (c2.c.y - c1.c.y) * a / d - (c2.c.x - c1.c.x) * b / d + c1.c.y;
    const qx = (c2.c.x - c1.c.x) * a / d - (c2.c.y - c1.c.y) * b / d + c1.c.x;
    const qy = (c2.c.y - c1.c.y) * a / d + (c2.c.x - c1.c.x) * b / d + c1.c.y;
    return [new Point(px, py), new Point(qx, qy)];
}
// From http://mathworld.wolfram.com/Circle-LineIntersection.html
function lineCircleIntersection(l, c) {
    const dx = l.p2.x - l.p1.x;
    const dy = l.p2.y - l.p1.y;
    const dr2 = square(dx) + square(dy);
    const cx = c.c.x;
    const cy = c.c.y;
    const D = (l.p1.x - cx) * (l.p2.y - cy) - (l.p2.x - cx) * (l.p1.y - cy);
    const disc = square(c.r) * dr2 - square(D);
    if (disc < 0)
        return []; // No solution
    const xa = D * dy / dr2;
    const ya = -D * dx / dr2;
    if (nearlyEquals(disc, 0))
        return [c.c.shift(xa, ya)]; // One solution
    const xb = dx * (dy < 0 ? -1 : 1) * Math.sqrt(disc) / dr2;
    const yb = Math.abs(dy) * Math.sqrt(disc) / dr2;
    return [c.c.shift(xa + xb, ya + yb), c.c.shift(xa - xb, ya - yb)];
}
function isPolygonLike(shape) {
    return isOneOf(shape.type, 'polygon', 'polyline', 'rectangle');
}
function isLineLike(shape) {
    return isOneOf(shape.type, 'line', 'ray', 'segment');
}
function isCircle(shape) {
    return shape.type === 'circle';
}
/** Returns the intersection of two or more geometry objects. */
function intersections(...elements) {
    if (elements.length < 2)
        return [];
    if (elements.length > 2)
        return flatten(subsets(elements, 2).map(e => intersections(...e)));
    let [a, b] = elements;
    if (isPolygonLike(b))
        [a, b] = [b, a];
    if (isPolygonLike(a)) {
        // This hack is necessary to capture intersections between a line and a
        // vertex of a polygon. There are more edge cases to consider!
        const vertices = isLineLike(b) ?
            a.points.filter(p => b.contains(p)) : [];
        return [...vertices, ...intersections(b, ...a.edges)];
    }
    // TODO Handle arcs, sectors and angles!
    return simpleIntersection(a, b);
}
/** Finds the intersection of two lines or circles. */
function simpleIntersection(a, b) {
    let results = [];
    // TODO Handle Arcs and Rays
    if (isLineLike(a) && isLineLike(b)) {
        results = lineLineIntersection(a, b);
    }
    else if (isLineLike(a) && isCircle(b)) {
        results = lineCircleIntersection(a, b);
    }
    else if (isCircle(a) && isLineLike(b)) {
        results = lineCircleIntersection(b, a);
    }
    else if (isCircle(a) && isCircle(b)) {
        results = circleCircleIntersection(a, b);
    }
    for (const x of [a, b]) {
        if (x.type === 'segment')
            results =
                results.filter(i => liesOnSegment(x, i));
        if (x.type === 'ray')
            results = results.filter(i => liesOnRay(x, i));
    }
    return results;
}

// =============================================================================
(function (Matrix) {
    // ---------------------------------------------------------------------------
    // Constructors
    /** Fills a matrix of size x, y with a given value. */
    function fill(value, x, y) {
        return repeat2D(value, x, y);
    }
    Matrix.fill = fill;
    /** Returns the identity matrix of size n. */
    function identity(n = 2) {
        const x = fill(0, n, n);
        for (let i = 0; i < n; ++i)
            x[i][i] = 1;
        return x;
    }
    Matrix.identity = identity;
    function rotation(angle) {
        const sin = Math.sin(angle);
        const cos = Math.cos(angle);
        return [[cos, -sin], [sin, cos]];
    }
    Matrix.rotation = rotation;
    function shear(lambda) {
        return [[1, lambda], [0, 1]];
    }
    Matrix.shear = shear;
    function reflection(angle) {
        const sin = Math.sin(2 * angle);
        const cos = Math.cos(2 * angle);
        return [[cos, sin], [sin, -cos]];
    }
    Matrix.reflection = reflection;
    // ---------------------------------------------------------------------------
    // Matrix Operations
    /** Calculates the sum of two or more matrices. */
    function sum(...matrices) {
        const [M1, ...rest] = matrices;
        const M2 = rest.length > 1 ? sum(...rest) : rest[0];
        if (M1.length !== M2.length || M1[0].length !== M2[0].length)
            throw new Error('Matrix sizes don’t match');
        const S = [];
        for (let i = 0; i < M1.length; ++i) {
            const row = [];
            for (let j = 0; j < M1[i].length; ++j) {
                row.push(M1[i][j] + M2[i][j]);
            }
            S.push(row);
        }
        return S;
    }
    Matrix.sum = sum;
    /** Multiplies a matrix M by a scalar v. */
    function scalarProduct(M, v) {
        return M.map(row => row.map((x, i) => x * v));
    }
    Matrix.scalarProduct = scalarProduct;
    /** Calculates the matrix product of multiple matrices. */
    function product(...matrices) {
        let [M1, ...rest] = matrices;
        let M2 = rest.length > 1 ? product(...rest) : rest[0];
        if (M1[0].length !== M2.length)
            throw new Error('Matrix sizes don’t match.');
        let P = [];
        for (let i = 0; i < M1.length; ++i) {
            let row = [];
            for (let j = 0; j < M2[0].length; ++j) {
                let value = 0;
                for (let k = 0; k < M2.length; ++k) {
                    value += M1[i][k] * M2[k][j];
                }
                row.push(value);
            }
            P.push(row);
        }
        return P;
    }
    Matrix.product = product;
    // ---------------------------------------------------------------------------
    // Matrix Properties
    /** Calculates the transpose of a matrix M. */
    function transpose(M) {
        let T = [];
        for (let j = 0; j < M[0].length; ++j) {
            let row = [];
            for (let i = 0; i < M.length; ++i) {
                row.push(M[i][j]);
            }
            T.push(row);
        }
        return T;
    }
    Matrix.transpose = transpose;
    /** Calculates the determinant of a matrix M. */
    function determinant(M) {
        if (M.length !== M[0].length)
            throw new Error('Not a square matrix.');
        let n = M.length;
        // Shortcuts for small n
        if (n === 1)
            return M[0][0];
        if (n === 2)
            return M[0][0] * M[1][1] - M[0][1] * M[1][0];
        let det = 0;
        for (let j = 0; j < n; ++j) {
            let diagLeft = M[0][j];
            let diagRight = M[0][j];
            for (let i = 1; i < n; ++i) {
                diagRight *= M[i][j + i % n];
                diagLeft *= M[i][j - i % n];
            }
            det += diagRight - diagLeft;
        }
        return det;
    }
    Matrix.determinant = determinant;
    /** Calculates the inverse of a matrix M. */
    function inverse(M) {
        // Perform Gaussian elimination:
        // (1) Apply the same operations to both I and C.
        // (2) Turn C into the identity, thereby turning I into the inverse of C.
        let n = M.length;
        if (n !== M[0].length)
            throw new Error('Not a square matrix.');
        let I = identity(n);
        let C = tabulate2D((x, y) => M[x][y], n, n); // Copy of original matrix
        for (let i = 0; i < n; ++i) {
            // Loop over the elements e in along the diagonal of C.
            let e = C[i][i];
            // If e is 0, we need to swap this row with a lower row.
            if (!e) {
                for (let ii = i + 1; ii < n; ++ii) {
                    if (C[ii][i] !== 0) {
                        for (let j = 0; j < n; ++j) {
                            [C[ii][j], C[i][j]] = [C[i][j], C[ii][j]];
                            [I[ii][j], I[i][j]] = [I[i][j], I[ii][j]];
                        }
                        break;
                    }
                }
                e = C[i][i];
                if (!e)
                    throw new Error('Matrix not invertible.');
            }
            // Scale row by e, so that we have a 1 on the diagonal.
            for (let j = 0; j < n; ++j) {
                C[i][j] = C[i][j] / e;
                I[i][j] = I[i][j] / e;
            }
            // Subtract a multiple of this row from all other rows,
            // so that they end up having 0s in this column.
            for (let ii = 0; ii < n; ++ii) {
                if (ii === i)
                    continue;
                let f = C[ii][i];
                for (let j = 0; j < n; ++j) {
                    C[ii][j] -= f * C[i][j];
                    I[ii][j] -= f * I[i][j];
                }
            }
        }
        return I;
    }
    Matrix.inverse = inverse;
})(exports.Matrix || (exports.Matrix = {}));

// ============================================================================
/** Calculates the greatest common divisor of multiple numbers. */
function gcd(...numbers) {
    const [first, ...rest] = numbers;
    if (rest.length > 1)
        return gcd(first, gcd(...rest));
    let a = Math.abs(first);
    let b = Math.abs(rest[0]);
    while (b)
        [a, b] = [b, a % b];
    return a;
}
/** Calculates the lowest common multiple of multiple numbers. */
function lcm(...numbers) {
    const [first, ...rest] = numbers;
    if (rest.length > 1)
        return lcm(first, lcm(...rest));
    return Math.abs(first * rest[0]) / gcd(first, rest[0]);
}
/** Checks if a number n is prime. */
function isPrime(n) {
    if (n % 1 !== 0 || n < 2)
        return false;
    if (n % 2 === 0)
        return (n === 2);
    if (n % 3 === 0)
        return (n === 3);
    const m = Math.sqrt(n);
    for (let i = 5; i <= m; i += 6) {
        if (n % i === 0)
            return false;
        if (n % (i + 2) === 0)
            return false;
    }
    return true;
}
/** Finds the prime factorisation of a number n. */
function primeFactorisation(n) {
    if (n === 1)
        return [];
    if (isPrime(n))
        return [n];
    let maxf = Math.sqrt(n);
    for (let f = 2; f <= maxf; ++f) {
        if (n % f === 0) {
            return primeFactorisation(f).concat(primeFactorisation(n / f));
        }
    }
    return [];
}
/** Finds all prime factors of a number n. */
function primeFactors(n) {
    return unique(primeFactorisation(n));
}
/** Lists all prime numbers between 0 and n. */
function listPrimes(n = 100) {
    if (n < 2)
        return [];
    let result = [2];
    for (let i = 3; i <= n; i++) {
        let notMultiple = false;
        for (let r of result) {
            notMultiple = notMultiple || (0 === i % r);
        }
        if (!notMultiple)
            result.push(i);
    }
    return result;
}
/** Generates a random prime number with d digits, where 2 <= d <= 16. */
function generatePrime(d) {
    if (d < 2 || d > 16)
        throw new Error('Invalid number of digits.');
    const lastDigit = [1, 3, 7, 9];
    const pow = Math.pow(10, d - 2);
    while (true) {
        const n = Math.floor(Math.random() * 9 * pow) + pow;
        const x = 10 * n + lastDigit[Math.floor(4 * Math.random())];
        if (isPrime(x))
            return x;
    }
}
/** Tries to write a number x as the sum of two primes. */
function goldbach(x) {
    if (x === 4)
        return [2, 2];
    let a = x / 2;
    let b = x / 2;
    if (a % 2 === 0) {
        a--;
        b++;
    }
    while (a >= 3) {
        if (isPrime(a) && isPrime(b))
            return [a, b];
        a -= 2;
        b += 2;
    }
}
/** Computes Euler's totient function (phi) for a given natural number x. */
function eulerPhi(x) {
    if (x <= 0)
        throw Error('Number should be greater than zero');
    let n = x;
    for (const p of primeFactors(x))
        n *= (p - 1) / p;
    return n;
}

// ============================================================================
(function (Random) {
    /** Randomly shuffles the elements in an array a. */
    function shuffle(a) {
        a = a.slice(0); // create copy
        for (let i = a.length - 1; i > 0; --i) {
            let j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }
    Random.shuffle = shuffle;
    /** Generates a random integer between 0 and a, or between a and b. */
    function integer(a, b) {
        let start = (b === undefined ? 0 : a);
        let length = (b === undefined ? a : b - a + 1);
        return start + Math.floor(length * Math.random());
    }
    Random.integer = integer;
    /** Generates an array of the integers from 0 to n in random order. */
    function intArray(n) {
        let a = [];
        for (let i = 0; i < n; ++i)
            a.push(i);
        return shuffle(a);
    }
    Random.intArray = intArray;
    /** Chooses a random index value from weights [2, 5, 3] */
    function weighted(weights) {
        const x = Math.random() * total(weights);
        let cum = 0;
        return weights.findIndex((w) => (cum += w) >= x);
    }
    Random.weighted = weighted;
    // ---------------------------------------------------------------------------
    // Smart Random Number Generators
    const SMART_RANDOM_CACHE = new Map();
    /**
     * Returns a random number between 0 and n, but avoids returning the same
     * number multiple times in a row.
     */
    function smart(n, id) {
        if (!id)
            id = uid();
        if (!SMART_RANDOM_CACHE.has(id))
            SMART_RANDOM_CACHE.set(id, repeat(1, n));
        const cache = SMART_RANDOM_CACHE.get(id);
        const x = weighted(cache.map(x => x * x));
        cache[x] -= 1;
        if (cache[x] <= 0)
            SMART_RANDOM_CACHE.set(id, cache.map(x => x + 1));
        return x;
    }
    Random.smart = smart;
    // ---------------------------------------------------------------------------
    // Probability Distribution
    /** Generates a Bernoulli random variable. */
    function bernoulli(p = 0.5) {
        return (Math.random() < p ? 1 : 0);
    }
    Random.bernoulli = bernoulli;
    /** Generates a Binomial random variable. */
    function binomial(n = 1, p = 0.5) {
        let t = 0;
        for (let i = 0; i < n; ++i)
            t += bernoulli(p);
        return t;
    }
    Random.binomial = binomial;
    /** Generates a Poisson random variable. */
    function poisson(l = 1) {
        if (l <= 0)
            return 0;
        const L = Math.exp(-l);
        let p = 1;
        let k = 0;
        for (; p > L; ++k)
            p *= Math.random();
        return k - 1;
    }
    Random.poisson = poisson;
    /** Generates a uniform random variable. */
    function uniform(a = 0, b = 1) {
        return a + (b - a) * Math.random();
    }
    Random.uniform = uniform;
    /** Generates a normal random variable with mean m and variance v. */
    function normal(m = 0, v = 1) {
        const u1 = Math.random();
        const u2 = Math.random();
        const rand = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        return rand * Math.sqrt(v) + m;
    }
    Random.normal = normal;
    /** Generates an exponential random variable. */
    function exponential(l = 1) {
        return l <= 0 ? 0 : -Math.log(Math.random()) / l;
    }
    Random.exponential = exponential;
    /** Generates a geometric random variable. */
    function geometric(p = 0.5) {
        if (p <= 0 || p > 1)
            return undefined;
        return Math.floor(Math.log(Math.random()) / Math.log(1 - p));
    }
    Random.geometric = geometric;
    /** Generates an Cauchy random variable. */
    function cauchy() {
        let rr, v1, v2;
        do {
            v1 = 2 * Math.random() - 1;
            v2 = 2 * Math.random() - 1;
            rr = v1 * v1 + v2 * v2;
        } while (rr >= 1);
        return v1 / v2;
    }
    Random.cauchy = cauchy;
    // ---------------------------------------------------------------------------
    // PDFs and CDFs
    /** Generates pdf(x) for the normal distribution with mean m and variance v. */
    function normalPDF(x, m = 1, v = 0) {
        return Math.exp(-((x - m) ** 2) / (2 * v)) / Math.sqrt(2 * Math.PI * v);
    }
    Random.normalPDF = normalPDF;
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
    function gamma(z) {
        if (z < 0.5)
            return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
        z -= 1;
        let x = P[0];
        for (let i = 1; i < G + 2; i++)
            x += P[i] / (z + i);
        let t = z + G + 0.5;
        return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
    }
    /** Riemann-integrates fn(x) from xMin to xMax with an interval size dx. */
    function integrate(fn, xMin, xMax, dx = 1) {
        let result = 0;
        for (let x = xMin; x < xMax; x += dx) {
            result += (fn(x) * dx || 0);
        }
        return result;
    }
    Random.integrate = integrate;
    /** The chi CDF function. */
    function chiCDF(chi, deg) {
        let int = integrate(t => Math.pow(t, (deg - 2) / 2) * Math.exp(-t / 2), 0, chi);
        return 1 - int / Math.pow(2, deg / 2) / gamma(deg / 2);
    }
    Random.chiCDF = chiCDF;
})(exports.Random || (exports.Random = {}));

// =============================================================================
(function (Regression) {
    /**
     * Finds a linear regression that best approximates a set of data. The result
     * will be an array [c, m], where y = m * x + c.
     */
    function linear(data, throughOrigin = false) {
        let sX = 0, sY = 0, sXX = 0, sXY = 0;
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
    Regression.linear = linear;
    /**
     * Finds an exponential regression that best approximates a set of data. The
     * result will be an array [a, b], where y = a * e^(bx).
     */
    function exponential(data) {
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
    Regression.exponential = exponential;
    /**
     * Finds a logarithmic regression that best approximates a set of data. The
     * result will be an array [a, b], where y = a + b * log(x).
     */
    function logarithmic(data) {
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
    Regression.logarithmic = logarithmic;
    /**
     * Finds a power regression that best approximates a set of data. The result
     * will be an array [a, b], where y = a * x^b.
     */
    function power(data) {
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
    Regression.power = power;
    /**
     * Finds a polynomial regression of given `order` that best approximates a set
     * of data. The result will be an array giving the coefficients of the
     * resulting polynomial.
     */
    function polynomial(data, order = 2) {
        // X = [[1, x1, x1^2], [1, x2, x2^2], [1, x3, x3^2]
        // y = [y1, y2, y3]
        let X = data.map(d => list(order + 1).map(p => Math.pow(d[0], p)));
        let XT = exports.Matrix.transpose(X);
        let y = data.map(d => [d[1]]);
        let XTX = exports.Matrix.product(XT, X); // XT*X
        let inv = exports.Matrix.inverse(XTX); // (XT*X)^(-1)
        let r = exports.Matrix.product(inv, XT, y); // (XT*X)^(-1) * XT * y
        return r.map(x => x[0]); // Flatten matrix
    }
    Regression.polynomial = polynomial;
    // ---------------------------------------------------------------------------
    // Regression Coefficient
    /**
     * Finds the regression coefficient of a given data set and regression
     * function.
     */
    function coefficient(data, fn) {
        let total = data.reduce((sum, d) => sum + d[1], 0);
        let mean = total / data.length;
        // Sum of squares of differences from the mean in the dependent variable
        let ssyy = data.reduce((sum, d) => sum + (d[1] - mean) ** 2, 0);
        // Sum of squares of residuals
        let sse = data.reduce((sum, d) => sum + (d[1] - fn(d[0])) ** 2, 0);
        return 1 - (sse / ssyy);
    }
    Regression.coefficient = coefficient;
    const types = [{
            name: 'linear',
            regression: linear,
            fn: (p, x) => p[0] + x * p[1]
        }, {
            name: 'quadratic',
            regression: polynomial,
            fn: (p, x) => p[0] + x * p[1] + x * x * p[2]
        }, {
            name: 'cubic',
            regression: (data) => polynomial(data, 3),
            fn: (p, x) => p[0] + x * p[1] + x * x * p[2] + x * x * x *
                p[3]
        }, {
            name: 'exponential',
            regression: exponential,
            fn: (p, x) => p[0] * Math.pow(Math.E, p[1] * x)
        }];
    /** Finds the most suitable regression for a given dataset. */
    function find(data, threshold = 0.9) {
        if (data.length > 1) {
            for (const t of types) {
                const params = t.regression(data);
                const fn = t.fn.bind(undefined, params);
                const coeff = coefficient(data, fn);
                if (coeff > threshold)
                    return { type: t.name, fn, params, coeff };
            }
        }
        return { type: undefined, fn: () => { }, params: [], coeff: undefined };
    }
    Regression.find = find;
})(exports.Regression || (exports.Regression = {}));

// ============================================================================
/** Calculates the mean of an array of numbers. */
function mean(values) {
    return values.length ? total(values) / values.length : 0;
}
/** Calculates the median of an array of numbers. */
function median(values) {
    let n = values.length;
    if (!n)
        return 0;
    let sorted = values.slice(0).sort();
    return (n % 2 === 1) ? sorted[Math.floor(n / 2)] :
        (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
}
/**
 * Calculates the mode of an array of numbers. Returns undefined if no mode
 * exists, i.e. there are multiple values with the same largest count.
 */
function mode(values) {
    const counts = new Map();
    let maxCount = -1;
    let result = undefined;
    for (const v of values) {
        if (!counts.has(v)) {
            counts.set(v, 1);
        }
        else {
            let newCount = counts.get(v) + 1;
            counts.set(v, newCount);
            if (newCount === maxCount) {
                result = undefined;
            }
            else if (newCount > maxCount) {
                maxCount = newCount;
                result = v;
            }
        }
    }
    return result;
}
/** Calculates the variance of an array of numbers. */
function variance(values) {
    if (!values.length)
        return undefined;
    const m = mean(values);
    const sum = values.reduce((a, v) => a + (v - m) ** 2, 0);
    return sum / (values.length - 1);
}
/** Calculates the standard deviation of an array of numbers. */
function stdDev(values) {
    const v = variance(values);
    return v ? Math.sqrt(v) : 0;
}
/** Calculates the covariance of the numbers in two arrays aX and aY. */
function covariance(aX, aY) {
    if (aX.length !== aY.length)
        throw new Error('Array length mismatch.');
    const sum = aX.reduce((a, v, i) => a + v * aY[i], 0);
    return (sum - total(aX) * total(aY) / aX.length) / aX.length;
}
/** Calculates the correlation between the numbers in two arrays aX and aY. */
function correlation(aX, aY) {
    if (aX.length !== aY.length)
        throw new Error('Array length mismatch.');
    const covarXY = covariance(aX, aY);
    const stdDevX = stdDev(aX);
    const stdDevY = stdDev(aY);
    return covarXY / (stdDevX * stdDevY);
}

// =============================================================================
/** A n-dimensional Vector class. */
class Vector extends Array {
    constructor(...args) {
        super();
        for (const i of args)
            this.push(i);
    }
    /** Returns the magnitude of the Vector */
    get magnitude() {
        let squares = 0;
        for (let i = 0; i < this.length; ++i)
            squares += this[i] ** 2;
        return Math.sqrt(squares);
    }
    /** Returns the unitVector of the Vector */
    get unitVector() {
        return this.scale(1 / this.magnitude);
    }
    /** Scales this vector by a factor q. */
    scale(q) {
        return this.map((x) => q * x);
    }
    // -------------------------------------------------------------------------
    /** Calculates the sum of two vectors v1 and v2. */
    static sum(v1, v2) {
        if (v1.length !== v2.length)
            throw new Error('Mismatched vector sizes.');
        return v1.map((v, i) => v + v2[i]);
    }
    /** Calculates the difference of two vectors v1 and v2. */
    static difference(v1, v2) {
        if (v1.length !== v2.length)
            throw new Error('Mismatched vector sizes.');
        return v1.map((v, i) => v - v2[i]);
    }
    /** Calculates the element-wise product of two vectors v1 and v2. */
    static product(v1, v2) {
        if (v1.length !== v2.length)
            throw new Error('Mismatched vector sizes.');
        return v1.map((v, i) => v * v2[i]);
    }
    /** Calculates the dot product of two vectors v1 and v2. */
    static dot(v1, v2) {
        return total(Vector.product(v1, v2));
    }
    /** Finds the cross product of two 3-dimensional vectors v1 and v2. */
    static cross(v1, v2) {
        if (v1.length !== 3 || v2.length !== 3)
            throw new Error('Cross product requires vectors of size 3.');
        return new Vector(v1[1] * v2[2] - v1[2] * v2[1], v1[2] * v2[0] - v1[0] * v2[2], v1[0] * v2[1] - v1[1] * v2[0]);
    }
    /** Checks if two vectors are equal. */
    static equals(v1, v2) {
        const n = v1.length;
        if (n !== v2.length)
            return false;
        for (let i = 0; i < n; ++i)
            if (!nearlyEquals(v1[i], v2[i]))
                return false;
        return true;
    }
}

exports.Angle = Angle;
exports.Arc = Arc;
exports.Bounds = Bounds;
exports.Circle = Circle;
exports.Complex = Complex;
exports.Line = Line;
exports.Point = Point;
exports.Polygon = Polygon;
exports.Polyline = Polyline;
exports.Ray = Ray;
exports.Rectangle = Rectangle;
exports.Sector = Sector;
exports.Segment = Segment;
exports.Triangle = Triangle;
exports.Vector = Vector;
exports.binomial = binomial;
exports.caesarCipher = caesarCipher;
exports.cipherLetterFreq = cipherLetterFreq;
exports.clamp = clamp;
exports.correlation = correlation;
exports.covariance = covariance;
exports.cube = cube;
exports.digits = digits;
exports.eulerPhi = eulerPhi;
exports.factorial = factorial;
exports.gcd = gcd;
exports.generatePrime = generatePrime;
exports.goldbach = goldbach;
exports.intersections = intersections;
exports.isBetween = isBetween;
exports.isCircle = isCircle;
exports.isInteger = isInteger;
exports.isLineLike = isLineLike;
exports.isPolygonLike = isPolygonLike;
exports.isPrime = isPrime;
exports.lcm = lcm;
exports.lerp = lerp;
exports.letterFrequency = letterFrequency;
exports.listPrimes = listPrimes;
exports.log = log;
exports.mean = mean;
exports.median = median;
exports.mod = mod;
exports.mode = mode;
exports.nearlyEquals = nearlyEquals;
exports.numberFormat = numberFormat;
exports.parseNumber = parseNumber;
exports.permutations = permutations;
exports.primeFactorisation = primeFactorisation;
exports.primeFactors = primeFactors;
exports.quadratic = quadratic;
exports.round = round;
exports.roundTo = roundTo;
exports.sign = sign;
exports.simpleIntersection = simpleIntersection;
exports.square = square;
exports.stdDev = stdDev;
exports.subsets = subsets;
exports.toFraction = toFraction;
exports.toOrdinal = toOrdinal;
exports.toWord = toWord;
exports.variance = variance;
exports.vigenereCipher = vigenereCipher;
