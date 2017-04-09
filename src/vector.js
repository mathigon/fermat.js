// =============================================================================
// Fermat.js | Vector
// (c) 2017 Mathigon
// =============================================================================



import { square } from 'utilities';
import { map } from 'arrays';


export default class Vector {

  constructor(...args) {

    if (args.length === 1) {
      if (Array.isArray(args[0])) {
        args = args[0];
      } else {
        args = new Array(args[0]).fill(0);
      }
    }

    this.length = args.length;
    for (let i = 0; i < args.length; ++i) this[i] = args[i];
  }


  // -------------------------------------------------------------------------
  // Properties and Methods

  get total() {
    let total = 0;
    for (let i = 0; i < this.length; ++i) total += (+this[i] || 0);
    return total;
  }

  get average() {
    return this.total() / this.length;
  }

  get norm() {
    let squares = 0;
    for (let i = 0; i < this.length; ++i) squares += square(this[i]);
    return Math.sqrt(squares);
  }

  get first() { return this[0]; }
  get last() { return this[this.length - 1]; }
  get min() { return Math.min(...this); }
  get max() { return Math.max(...this); }
  get range() { return [this.min, this.max]; }

  map(fn) {
    let array = [];
    for (let i = 0; i < this.length; ++i) array.push(fn(this[i], i));
    return new Vector(array);
  }

  shift(q = 0) {
    return this.map(x => q + x);
  }

  scale(q = 1) {
    return this.map(x => q * x);
  }

  normalise() {
    return this.scale(1 / this.norm);
  }

  toString() {
    let html = '(';
    for (let i = 0; i < this.length - 1; ++i) html += this[i] + ', ';
    html += this[this.length - 1] + ')';
    return html;  // '(' + this.join(', ') + ')';
  }


  // -------------------------------------------------------------------------
  // Static Functions

  static sum(v1, v2) {
    // TODO multidimensional vectors
    let a = map((a,b) => a + b, v1, v2);
    return new Vector(a);
  }

  static difference(v1, v2) {
    // TODO multidimensional vectors
    return Vector.sum(v1, v2.scaled(-1));
  }

  static dot(v1, v2) {
    let n = Math.min(v1.length, v2.length);
    let d = 0;
    for (let i = 0; i < n; ++i) d += (v1[i] || 0) * (v2[i] || 0);
    return d;
  }

  static cross2D(x, y) {
    return x[0] * y[1] - x[1] * y[0];
  }

  static cross(v1, v2) {
    return new Vector([v1[1] * v2[2] - v1[2] * v2[1],
      v1[2] * v2[0] - v1[0] * v2[2],
      v1[0] * v2[1] - v1[1] * v2[0]]);
  }

  static product(v1, v2) {
    // TODO multidimensional vectors
    let a = map((a,b) => a * b, v1, v2);
    return new Vector(a);
  }

  static equals(v1, v2) {
    // TODO multidimensional vectors
    let n = v1.length;
    if (n !== v2.length) return false;
    for (let i = 0; i < n; ++i) if (v1[i] !== v2[i]) return false;
    return true;
  }

}
