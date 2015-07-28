// ============================================================================
// Fermat.js | Random
// (c) 2015 Mathigon / Philipp Legner
// ============================================================================



import { tabulate, each, square, some } from 'utilities.js';


// -----------------------------------------------------------------------------
// Simple Random Number Generators

function int(a, b = null) {
    let start = (b == null ? 0 : a);
    let length = (b == null ? a : b - a + 1)
    return start + Math.floor(length * Math.random());
};

function intArray(n) {
    let a = [];
    for (let i = 0; i < n; ++i) a.push(i);
    return shuffle(a);
};

// Choses a random value from weights [2, 5, 3] or { a: 2, b: 5, c: 3 }
// Total is optional to specify the total of the weights.
// This is useful if the function is called repeatedly.
function weighted(obj, setTotal = null) {
    let total = 0;
    if (setTotal == null) {
        each(obj, function(x) { total += (+x); });
    } else {
        total = setTotal;
    }

    let rand = Math.random() * total;
    let curr = 0;

    return some(obj, function(x, i) {
        curr += obj[i];
        if (rand <= curr) return i;
    });
};



// -----------------------------------------------------------------------------
// Smart Random Number Generators

const smartRandomCache = new Map();

// Avoids returning the same number multiple times in a row
function smart(n, id) {
    if (!smartRandomCache.has(id)) smartRandomCache.set(id, tabulate(1, n));

    let cache = smartRandomCache.get(id);
    let x = weighted(cache.map(x => x * x));

    cache[x] -= 1;
    if (cache[x] <= 0) smartRandomCache.set(id, cache.map(x => x + 1));

    return x;
}


// -----------------------------------------------------------------------------
// Array Shuffle

    // Randomly shuffles the elements in an array
function shuffle(a) {
    a = Array.prototype.slice.call(a, 0); // create copy
    let j, tmp;
    for (let i = a.length - 1; i; --i) {
        j = Math.floor(Math.random() * (i+1));
        tmp = a[j];
        a[j] = a[i];
        a[i] = tmp;
    }
    return a;
}


// -----------------------------------------------------------------------------
// Discrete Distribution

function bernoulli(p = 0.5) {
    p = Math.max(0,Math.min(1,p));
    return (Math.random() < p ? 1 : 0);
}

function binomial(n = 1, p = 0.5) {
    let t = 0;
    for (let i = 0; i < n; ++i) t += bernoulli(p);
    return t;
};

function poisson(l = 1) {
    if (l <= 0) return 0;
    let L = Math.exp(-l), p = 1;
    for (let k = 0; p > L; ++k) p *= Math.random();
    return k - 1;
}


// -----------------------------------------------------------------------------
// Continuous Distribution

function uniform(a = 0, b = 1) {
    return a + (b-a) * Math.random();
}

function normal(m = 0, v = 1) {
    let u1 = Math.random();
    let u2 = Math.random();
    let rand = Math.sqrt( -2 * Math.log(u1) ) * Math.cos( 2 * Math.PI * u2 );

    return rand * Math.sqrt(v) + m;
}

function exponential(l = 1) {
    return l <= 0 ? 0 : -Math.log(Math.random()) / l;
}

function geometric(p = 0.5) {
    if (p <= 0 || p > 1) return null;
    return Math.floor( Math.log(Math.random()) / Math.log(1-p) );
}

function cauchy() {
    let rr, v1, v2;
    do {
        v1 = 2 * Math.random() - 1;
        v2 = 2 * Math.random() - 1;
        rr = v1 * v1 + v2 * v2;
    } while (rr >= 1);
    return v1/v2;
}

function normalPDF(x, m = 1, v = 0) {
    return Math.exp(-square(x - m) / (2 * v)) / Math.sqrt(2 * Math.PI * v);
}

// -----------------------------------------------------------------------------

export default {
    int, intArray, weighted, smart, shuffle, bernoulli, binomial, poisson,
    uniform, normal, exponential, geometric, cauchy, normalPDF
}

