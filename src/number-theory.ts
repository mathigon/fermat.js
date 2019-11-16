// ============================================================================
// Fermat.js | Number Theory
// (c) Mathigon
// ============================================================================


import {unique} from '@mathigon/core';


/** Calculates the greatest common divisor of multiple numbers. */
export function gcd(...numbers: number[]): number {
  const [first, ...rest] = numbers;
  if (rest.length > 1) return gcd(first, gcd(...rest));

  let a = Math.abs(first);
  let b = Math.abs(rest[0]);

  while (b) [a, b] = [b, a % b];
  return a;
}

/** Calculates the lowest common multiple of multiple numbers. */
export function lcm(...numbers: number[]): number {
  const [first, ...rest] = numbers;
  if (rest.length > 1) return lcm(first, lcm(...rest));

  return Math.abs(first * rest[0]) / gcd(first, rest[0]);
}

/** Checks if a number n is prime. */
export function isPrime(n: number) {
  if (n % 1 !== 0 || n < 2) return false;

  if (n % 2 === 0) return (n === 2);
  if (n % 3 === 0) return (n === 3);

  const m = Math.sqrt(n);
  for (let i = 5; i <= m; i += 6) {
    if (n % i === 0) return false;
    if (n % (i + 2) === 0) return false;
  }

  return true;
}

/** Finds the prime factorisation of a number n. */
export function primeFactorisation(n: number): number[] {
  if (n === 1) return [];
  if (isPrime(n)) return [n];

  let maxf = Math.sqrt(n);
  for (let f = 2; f <= maxf; ++f) {
    if (n % f === 0) {
      return primeFactorisation(f).concat(primeFactorisation(n / f));
    }
  }

  return [];
}

/** Finds all prime factors of a number n. */
export function primeFactors(n: number) {
  return unique(primeFactorisation(n));
}

/** Lists all prime numbers between 0 and n. */
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

/** Generates a random prime number with d digits, where 2 <= d <= 16. */
export function generatePrime(d: number) {
  if (d < 2 || d > 16) throw new Error('Invalid number of digits.');

  const lastDigit = [1, 3, 7, 9];
  const pow = Math.pow(10, d - 2);

  while (true) {
    const n = Math.floor(Math.random() * 9 * pow) + pow;
    const x = 10 * n + lastDigit[Math.floor(4 * Math.random())];
    if (isPrime(x)) return x;
  }
}

/** Tries to write a number x as the sum of two primes. */
export function goldbach(x: number) {
  if (x === 4) return [2, 2];

  let a = x / 2;
  let b = x / 2;

  if (a % 2 === 0) {
    a--;
    b++;
  }

  while (a >= 3) {
    if (isPrime(a) && isPrime(b)) return [a, b];
    a -= 2;
    b += 2;
  }
}

/** Computes Euler's totient function (phi) for a given natural number x. */
export function eulerPhi(x: number) {
  if (x <= 0) throw Error('Number should be greater than zero');

  let n = x;
  for (const p of primeFactors(x)) n *= (p - 1) / p;
  return n;
}
