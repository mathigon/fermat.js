// =============================================================================
// Fermat.js | Vectors
// (c) Mathigon
// =============================================================================


import {total} from '@mathigon/core';
import {nearlyEquals} from './arithmetic';


/** A n-dimensional Vector class. */
export class Vector extends Array<number> {

  constructor(...args: number[]) {
    super();
    for (const i of args) this.push(i);
  }

  /** Returns the magnitude of the Vector */
  get magnitude() {
    let squares = 0;
    for (let i = 0; i < this.length; ++i) squares += this[i] ** 2;
    return Math.sqrt(squares);
  }

  /** Returns the unitVector of the Vector */
  get unitVector() {
    return this.scale(1 / this.magnitude);
  }

  /** Scales this vector by a factor q. */
  scale(q: number) {
    return this.map((x: number) => q * x);
  }

  // -------------------------------------------------------------------------

  /** Calculates the sum of two vectors v1 and v2. */
  static sum(v1: Vector, v2: Vector) {
    if (v1.length !== v2.length) throw new Error('Mismatched vector sizes.');
    return v1.map((v, i) => v + v2[i]);
  }

  /** Calculates the difference of two vectors v1 and v2. */
  static difference(v1: Vector, v2: Vector) {
    if (v1.length !== v2.length) throw new Error('Mismatched vector sizes.');
    return v1.map((v, i) => v - v2[i]);
  }

  /** Calculates the element-wise product of two vectors v1 and v2. */
  static product(v1: Vector, v2: Vector) {
    if (v1.length !== v2.length) throw new Error('Mismatched vector sizes.');
    return v1.map((v, i) => v * v2[i]);
  }

  /** Calculates the dot product of two vectors v1 and v2. */
  static dot(v1: Vector, v2: Vector) {
    return total(Vector.product(v1, v2));
  }

  /** Finds the cross product of two 3-dimensional vectors v1 and v2. */
  static cross(v1: Vector, v2: Vector) {
    if (v1.length !== 3 || v2.length !== 3)
      throw new Error('Cross product requires vectors of size 3.');
    return new Vector(v1[1] * v2[2] - v1[2] * v2[1],
        v1[2] * v2[0] - v1[0] * v2[2],
        v1[0] * v2[1] - v1[1] * v2[0]);
  }

  /** Checks if two vectors are equal. */
  static equals(v1: Vector, v2: Vector) {
    const n = v1.length;
    if (n !== v2.length) return false;
    for (let i = 0; i < n; ++i) if (!nearlyEquals(v1[i], v2[i])) return false;
    return true;
  }
}
