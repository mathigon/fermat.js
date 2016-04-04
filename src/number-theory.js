// ============================================================================
// Fermat.js | Number Theory
// (c) 2015 Mathigon
// ============================================================================



import { isInteger } from 'types';
import { unique } from 'arrays';


const smallPrimes = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,
    73,79,83,89,97];


export function gcd(first, ...rest) {
    if (rest.length > 1) return gcd(first, gcd(...rest));

    let a = Math.abs(first);
    let b = Math.abs(rest[0]);

    while (b) [a, b] = [b, a % b];
    return a;
}

export function lcm(first, ...rest) {
    if (rest.length > 1) return lcm(first, lcm(...rest));

    return Math.abs(first * rest[0]) / gcd(first, rest[0]);
}

// Contains no dependencies, so that this function can easily be stringified
// and run in a web worker.
export function isPrime(n) {
    if (n % 1 !== 0 || n < 2) return false;

    if (n % 2 === 0) return (n == 2);
    if (n % 3 === 0) return (n == 3);

    let m = Math.sqrt(n);
    for (let i = 5;i <= m;i += 6) {
        if (n % i === 0)     return false;
        if (n % (i+2) === 0) return false;
    }

    return true;
}

export function primeFactorisation(n) {
    if (n === 1) return [];
    if (isPrime(n)) return [n];

    var maxf = Math.sqrt(n);
    for (let f = 2; f <= maxf; ++f) {
        if (n % f === 0) return primeFactorisation(f).concat(primeFactorisation(n / f));
    }
}

export function primeFactors(n) {
    return unique(primeFactorisation(n));
}

export function listPrimes(n = 100) {
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

// Contains no dependencies, so that this function can easily be stringified
// and run in a web worker. Number of digits 2 <= d <= 16.
export function generatePrime(d) {
    if (d < 2 || d > 16) throw new Error('Invalid number of digits.');

    let lastDigit = [1, 3, 7, 9];
    function randomInt(d) {
        let pow = Math.pow(10, d - 2);
        let n = Math.floor(Math.random() * 9 * pow) + pow;
        return 10 * n + lastDigit[Math.floor(4 * Math.random())];
    }

    function isPrime(n) {
        let sqrt = Math.sqrt(n);
        for (let i = 3; i <= sqrt; i += 2) if (n % i === 0) return false;
        return true;
    }

    let x;
    do { x = randomInt(d); } while (!isPrime(x));
    return x;
}

// Contains no dependencies, so that this function can easily be stringified
// and run in a web worker.
export function goldbach(x) {

    function isPrime(n) {
        let sqrt = Math.sqrt(n);
        for (let i = 3; i <= sqrt; i += 2) if (n % i === 0) return false;
        return true;
    }

    let a = x / 2;
    let b = x / 2;

    if (a % 2 === 0){
        a--;
        b++;
    }

    while (a >= 3){
        if (isPrime(a) && isPrime(b)) return [a, b];
        a -= 2;
        b += 2;
    }
}
