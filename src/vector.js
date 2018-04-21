// =============================================================================
// Fermat.js | Vectors
// (c) Mathigon
// =============================================================================



import { square, map , run} from '@mathigon/core';
import { nearlyEquals } from './arithmetic';

export function V(...args) {
  return new Vector(...args);
}

/**
 * A n-dimensional Vector class.
 */
export class Vector {

  constructor(...args) {
    if (args.length === 1) {
      if (Array.isArray(args[0])) {
        args = args[0];
      } else {
        args = new Array(args[0]).fill(0);
      }
    }

    /** @type {number} */
    this.length = args.length;

    for (let i = 0; i < args.length; ++i) this[i] = args[i];
  }

  /**
   * Creates an `n`-dimensional vector filled with `value`.
   * @param {number} n
   * @param value
   * @returns {Vector}
   */
  static fill(n, value) {
    return new Vector(new Array(n).map((_, i) => run(value, i)));
  }


  // -------------------------------------------------------------------------
  // Properties and Methods

  /** @returns {number} */
  get magnitude() {
    let squares = 0;
    for (let i = 0; i < this.length; ++i) squares += square(this[i]);
    return Math.sqrt(squares);
  }

  /** @returns {Vector} */
  get normal() { return this.scale(1 / this.magnitude); }

  /**
   * Scales this vector by a factor q.
   * @param {number} q
   * @returns {Vector}
   */
  scale(q) {
    return this.map(x => q * x);
  }

  /**
   * @param {Function} fn
   * @returns {Vector}
   */
  map(fn) {
    let array = [];
    for (let i = 0; i < this.length; ++i) array.push(fn(this[i], i));
    return new Vector(array);
  }


  // -------------------------------------------------------------------------
  // Static Functions

  /**
   * Calculates the sum of two vectors v1 and v2.
   * @param {Vector} v1
   * @param {Vector} v2
   * @returns {Vector}
   */
  static sum(v1, v2) {
    let x = map((a,b) => a + b, v1, v2);
    return new Vector(x);
  }

  /**
   * Calculates the difference of two vectors v1 and v2.
   * @param {Vector} v1
   * @param {Vector} v2
   * @returns {Vector}
   */
  static difference(v1, v2) {
    let x = map((a,b) => a - b, v1, v2);
    return new Vector(x);
  }

  /**
   * Calculates the element-wise product of two vectors v1 and v2.
   * @param {Vector} v1
   * @param {Vector} v2
   * @returns {Vector}
   */
  static product(v1, v2) {
    let x = map((a,b) => a * b, v1, v2);
    return new Vector(x);
  }

  /**
   * Calculates the dot product of two vectors v1 and v2.
   * @param {Vector} v1
   * @param {Vector} v2
   * @returns {number}
   */
  static dot(v1, v2) {
    let n = Math.min(v1.length, v2.length);
    let d = 0;
    for (let i = 0; i < n; ++i) d += (v1[i] || 0) * (v2[i] || 0);
    return d;
  }

  /**
   * Finds the cross product of two 3-dimensional vectors v1 and v2.
   * @param {Vector} v1
   * @param {Vector} v2
   * @returns {Vector}
   */
  static cross(v1, v2) {
    return new Vector([v1[1] * v2[2] - v1[2] * v2[1],
      v1[2] * v2[0] - v1[0] * v2[2],
      v1[0] * v2[1] - v1[1] * v2[0]]);
  }

  /**
   * Checks if two vectors are equal.
   * @param {Vector} v1
   * @param {Vector} v2
   * @returns {boolean}
   */
  static equals(v1, v2) {
    let n = v1.length;
    if (n !== v2.length) return false;
    for (let i = 0; i < n; ++i) if (!nearlyEquals(v1[i], v2[i])) return false;
    return true;
  }

}
