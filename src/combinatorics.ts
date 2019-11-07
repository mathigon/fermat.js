// ============================================================================
// Fermat.js | Combinatorics
// (c) Mathigon
// ============================================================================


/** Calculates the factorial of a number x. */
export function factorial(x: number) {
  if (x === 0) return 1;
  if (x < 0) return NaN;

  let n = 1;
  for (let i = 2; i <= x; ++i) n *= i;
  return n;
}


/** Calculates the binomial coefficient nCk of two numbers n and k. */
export function binomial(n: number, k: number): number {
  if (k === 0) {
    return 1;
  } else if (2 * k > n) {
    return binomial(n, n - k);
  } else {
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
export function permutations<T>(arr: T[]): T[][] {
  const permArr: T[][] = [];
  const usedChars: T[] = [];
  permuteHelper<T>(arr, permArr, usedChars);
  return permArr;
}

function permuteHelper<T>(input: T[], permArr: T[][], usedChars: T[]) {
  for (let i = 0; i < input.length; i++) {
    const term = input.splice(i, 1)[0];
    usedChars.push(term);
    if (input.length === 0) {
      permArr.push(usedChars.slice());
    }
    permuteHelper<T>(input, permArr, usedChars);
    input.splice(i, 0, term);
    usedChars.pop();
  }
}


/**
 * Returns an array of all possible subsets of an input array (of given length).
 */
export function subsets<T>(array: T[], length = 0) {
  const copy = array.slice(0);
  const results = subsetsHelper<T>(copy);
  return length ? results.filter(x => x.length === length) : results;
}

function subsetsHelper<T>(array: T[]) {
  if (array.length === 1) return [[], array];

  const last = array.pop()!;
  const subsets = subsetsHelper<T>(array);

  const result: T[][] = [];
  for (const s of subsets) {
    result.push(s, [...s, last]);
  }
  return result;
}
