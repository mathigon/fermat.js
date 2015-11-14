// ============================================================================
// Fermat.js | Number Theory
// (c) 2015 Mathigon
// ============================================================================



// -----------------------------------------------------------------------------
// Simple Functions

export function nearlyEquals(x, y, tolerance = 0.0000001) {
    return Math.abs(x - y) < tolerance;
}

export function sign(x) {
    return nearlyEquals(x, 0) ? 0 : (x > 0 ? 1 : -1);
}

export function square(x) {
    return x * x;
}

export function cube(x) {
    return x * x * x;
}


// -----------------------------------------------------------------------------
// String Conversion

let numRegex = /(\d+)(\d{3})/;

// Adds ','s as thousands seperators to a number
export function numberFormat(x) {
    x = ('' + x).split('.');
    let n = x[0];
    while (numRegex.test(n)) {
        n = n.replace(numRegex, '$1,$2');
    }
    return n + (x.length > 1 ? '.' + x[1] : '');
}

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


// -----------------------------------------------------------------------------
// Rounding, Decimals and Decimals

// digits(376) = [6, 7, 3]
export function digits(n) {
    let str = '' + Math.abs(x);
    return str.split('').reverse().map(x => +x);
}

// decimalDigits(3.456) = [4, 5, 6]
export function fractionalDigits(n) {
    let str = '' + Math.abs(n - Math.floor(n));
    return str.split('').map(x => +x);
}

// Returns the number of digits after the decimal place
export function decimalPlaces(n) {
    let str = '' + Math.abs(n);
    str = str.split('.');
    return str.length === 1 ? 0 : str[1].length;
}

export function round(n, precision = 0) {
    let factor = Math.pow(10, precision);
    return Math.round(n * factor) / factor;
}

// Round a number n to the nearest multiple of increment
export function roundTo(n, increment = 1) {
    return Math.round(n / increment) * increment;
}

export function roundTowardsZero(x) {
    // Add 0.00001 because of floating points uncertainty
    return x < 0 ? Math.ceil(x - 0.00001) : Math.floor(x + 0.00001);
}

// Returns an [numerator, denominator] array
// See http://en.wikipedia.org/wiki/Continued_fraction
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

// The JS implementation of the % operator returns the symmetric modulo.
// Both are identical if a >= 0 and m >= 0 but the results differ if a or m < 0.
export function mod(a, m) {
    return ((a % m) + a) % m;
}

export function log(x, b = null) {
    return (b == null) ? Math.log(x) : Math.log(x) / Math.log(b);
}
