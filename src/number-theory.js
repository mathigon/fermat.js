// ============================================================================
// Fermat.js | Number Theory
// (c) Mathigon
// ============================================================================



import { unique } from '@mathigon/core';


/**
 * Calculates the greatest common divisor of multiple numbers.
 * @param {...number} numbers
 * @returns {number}
 */
export function gcd(numbers) {
  const [first, ...rest] = numbers;
  if (rest.length > 1) return gcd(first, gcd(...rest));

  let a = Math.abs(first);
  let b = Math.abs(rest[0]);

  while (b) [a, b] = [b, a % b];
  return a;
}

/**
 * Calculates the lowest common multiple of multiple numbers.
 * @param {...number} numbers
 * @returns {number}
 */
export function lcm(numbers) {
  const [first, ...rest] = numbers;
  if (rest.length > 1) return lcm(first, lcm(...rest));

  return Math.abs(first * rest[0]) / gcd(first, rest[0]);
}

/**
 * Checks if a number n is prime. Contains no dependencies, so that this
 * function can easily be stringified and run in a web worker.
 * @param {number} n
 * @returns {boolean}
 */
export function isPrime(n) {
  const M = Math;
  if (n % 1 !== 0 || n < 2) return false;

  if (n % 2 === 0) return (n === 2);
  if (n % 3 === 0) return (n === 3);

  let m = M.sqrt(n);
  for (let i = 5;i <= m;i += 6) {
    if (n % i === 0)     return false;
    if (n % (i+2) === 0) return false;
  }

  return true;
}

/**
 * Finds the prime factorisation of a number n.
 * @param {number} n
 * @returns {number[]}
 */
export function primeFactorisation(n) {
  if (n === 1) return [];
  if (isPrime(n)) return [n];

  let maxf = Math.sqrt(n);
  for (let f = 2; f <= maxf; ++f) {
    if (n % f === 0) return primeFactorisation(f).concat(primeFactorisation(n / f));
  }
}

/**
 * Finds all prime factors of a number n.
 * @param {number} n
 * @returns {number[]}
 */
export function primeFactors(n) {
  return unique(primeFactorisation(n));
}

/**
 * Lists all prime numbers between 0 and n.
 * @param {number} n
 * @returns {number[]}
 */
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

/**
 * Generates a random prime number with d digits, where 2 <= d <= 16. Contains
 * no dependencies, so that this function can easily be stringified and run in
 * a web worker.
 * @param {number} d
 * @returns {number}
 */
export function generatePrime(d) {
  const M = Math;
  if (d < 2 || d > 16) throw new Error('Invalid number of digits.');

  let lastDigit = [1, 3, 7, 9];
  function randomInt(d) {
    let pow = M.pow(10, d - 2);
    let n = M.floor(M.random() * 9 * pow) + pow;
    return 10 * n + lastDigit[M.floor(4 * M.random())];
  }

  function isPrime(n) {
    let sqrt = M.sqrt(n);
    for (let i = 3; i <= sqrt; i += 2) if (n % i === 0) return false;
    return true;
  }

  let x;
  do { x = randomInt(d); } while (!isPrime(x));
  return x;
}

/**
 * Tries to write a number x as the sum of two primes. Contains no dependencies,
 * so that this function can easily be stringified and run in a web worker.
 * @param {number} x
 * @returns {number[]}
 */
export function goldbach(x) {
  const M = Math;

  function isPrime(n) {
    let sqrt = M.sqrt(n);
    for (let i = 3; i <= sqrt; i += 2) if (n % i === 0) return false;
    return true;
  }

  if (x === 4) return [2, 2];

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
