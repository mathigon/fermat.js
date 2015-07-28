// ============================================================================
// Fermat.js | Number Theory
// (c) 2015 Mathigon
// ============================================================================



import isInt from 'utilities'
import unique from 'arrays'


const smallPrimes = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97];


function gcd(first, ...rest) {
    if (rest.length > 1) {
        return gcd(a, gcd.apply(null, rest));
    }

    let mod;
    let a = Math.abs(first);
    let b = Math.abs(rest[0]);

    while (b) {
        mod = a % b;
        a = b;
        b = mod;
    }

    return a;
}

function lcm(first, ...rest) {
    if (rest.length > 1) {
        return lcm(a, lcm.apply(null, rest));
    }

    let a = Math.abs(first);
    let b = Math.abs(rest[0]);

    return Math.abs(a * b) / gcd(a, b);
}

function isPrime(n) {
    if (n <= 1 || !isInt(n)) return false;
    if (n < 101) return (smallPrimes.indexOf(n) >= 0);
    if (n % 2 === 0) return false;

    let sqrt = Math.sqrt(n);
    for (let i = 3; i <= sqrt; i += 2) {
        if (n % i === 0) return false;
    }

    return true;
}

function primeFactorisation(n) {
    if (n === 1) return [];
    if (isPrime(n)) return [n];

    var maxf = Math.sqrt(n);
    for (let f = 2; f <= maxf; ++f) {
        if (n % f === 0) return primeFactorisation(f).concat(primeFactorisation(n / f));
    }
}

function primeFactors(n) {
    return unique(primeFactorisation(n));
}

function listPrimes(n = 100) {
    if (n < 2) return [];
    let result = [2];

    for (let i = 3; i <= n; i++) {
        let notMultiple = false;
        for (let r of result) {
            notMultiple = notMultiple || (0 === i % r);
        }
        if (!notMultiple) result.push(i);
    }

    return result;
}


export default { gcd, lcm, isPrime, primeFactorisation, primefactors, listPrimes };

