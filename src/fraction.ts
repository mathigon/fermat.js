// =============================================================================
// Fermat.js | Fractions
// (c) Mathigon
// =============================================================================


import {isInteger, nearlyEquals} from './arithmetic';
import {lcm} from './number-theory';


/**  Fraction class. */
export class Fraction {

  constructor(public n: number, public d: number = 1) {}

  get decimal() {
    return this.n / this.d;
  }

  get sign() {
    if (this.n === 0 || this.d === 0) return 0;
    if (this.n < 0 && this.d < 0) return 1;
    if (this.n < 0 || this.d < 0) return -1;
    return 1;
  }

  get simplified() {
    const n = Math.abs(this.n);
    const d = Math.abs(this.d);
    const factor = lcm(n, d);
    return new Fraction(this.sign * n / factor, d / factor);
  }

  get inverse() {
    return new Fraction(this.d, this.n);
  }

  toMathML() {
    return `<mfrac><mn>${this.n}</mn><mn>${this.d}</mn></mfrac>`;
  }

  toString() {
    const minus = this.sign < 0 ? '–' : '';
    if (Math.abs(this.d) === 1) return `${minus}${Math.abs(this.n)}`;
    return `${minus}${Math.abs(this.n)}/${Math.abs(this.d)}`;
  }

  // ---------------------------------------------------------------------------

  static fromDecimal(x: number, max = 100) {
    const sign = Math.sign(x);
    const whole = Math.floor(Math.abs(x));
    x = Math.abs(x) - whole;

    let a = 0;
    let b = 1;
    let c = 1;
    let d = 1;

    while (b <= max && d <= max) {
      const mediant = (a + c) / (b + d);
      if (x === mediant) {
        if (b + d <= max) {
          return new Fraction(sign * (whole * (b + d) + a + c), b + d);
        } else if (d > b) {
          return new Fraction(sign * (whole * d + c), d);
        } else {
          return new Fraction(sign * (whole * b + a), b);
        }
      } else if (x > mediant) {
        [a, b] = [a + c, b + d];
      } else {
        [c, d] = [a + c, b + d];
      }
    }

    if (b > max) return new Fraction(sign * (whole * d + c), d);
    return new Fraction(sign * (whole * b + a), b);
  }

  static fromString(s: string) {
    if (!s.includes('/')) return isNaN(+s) ? undefined : Fraction.fromDecimal(+s);
    const [num, den] = s.split('/').map(x => +x);
    if (isNaN(num) || isNaN(den) || nearlyEquals(den, 0)) return;
    if (!isInteger(num) || !isInteger(num)) return Fraction.fromDecimal(num / den);
    return new Fraction(num, den);
  }

  // ---------------------------------------------------------------------------

  add(a: Fraction|number) {
    return Fraction.sum(this, a);
  }

  subtract(a: Fraction|number) {
    return Fraction.difference(this, a);
  }

  multiply(a: Fraction|number) {
    return Fraction.product(this, a);
  }

  divide(a: Fraction|number) {
    return Fraction.quotient(this, a);
  }

  /** Calculates the sum of two fractions a and b. */
  static sum(a: Fraction|number, b: Fraction|number) {
    if (typeof a === 'number') a = new Fraction(a);
    if (typeof b === 'number') b = new Fraction(b);
    return new Fraction(a.n * b.d + b.n * a.d, a.d * b.d).simplified;
  }

  /** Calculates the difference of two fractions a and b. */
  static difference(a: Fraction|number, b: Fraction|number) {
    if (typeof a === 'number') a = new Fraction(a);
    if (typeof b === 'number') b = new Fraction(b);
    return new Fraction(a.n * b.d - b.n * a.d, a.d * b.d).simplified;
  }

  /** Calculates the product of two fractions a and b. */
  static product(a: Fraction|number, b: Fraction|number) {
    if (typeof a === 'number') a = new Fraction(a);
    if (typeof b === 'number') b = new Fraction(b);
    return new Fraction(a.n * b.n, a.d * b.d).simplified;
  }

  /** Calculates the quotient of two fractions a and b. */
  static quotient(a: Fraction|number, b: Fraction|number) {
    if (typeof a === 'number') a = new Fraction(a);
    if (typeof b === 'number') b = new Fraction(b);
    return new Fraction(a.n * b.d, a.d * b.n).simplified;
  }
}
