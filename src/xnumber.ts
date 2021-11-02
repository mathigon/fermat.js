// =============================================================================
// Fermat.js | Extended Number Class
// (c) Mathigon
// =============================================================================


import {isInteger, nearlyEquals, numberFormat} from './arithmetic';
import {gcd} from './number-theory';


/**  Extended Number class. */
export class XNumber {
  num: number;  /** Used for all number types (decimals, fractions, units, ...). */
  den?: number;  /** Only used for fractions and always ≥ 0. */

  constructor(num: number, den?: number, public unit?: '%'|'π') {
    // Ensure that den is always positive
    this.num = (den !== undefined && den < 0) ? -num : num;
    if (den !== undefined && Math.abs(den) !== 1 && num !== 0) this.den = Math.abs(den);
  }

  valueOf() {
    return this.value;
  }

  toString() {
    let num = `${numberFormat(this.num, 6)}`;
    if (this.den !== undefined) num = `${num}/${numberFormat(this.den, 6)}`;
    if (this.unit === 'π') {
      if (num === '1') return 'π';
      if (num === '0') return '0';
      if (num === '–1') return '–π'
    }
    return `${num}${this.unit ? this.unit : ''}`;
  }

  toMathML() {
    let str = `<mn>${this.num}</mn>`;
    if (this.den !== undefined) str = `<mfrac>${str}<mn>${this.den}</mn></mfrac>`;
    if (this.unit) str += (this.unit === 'π') ? `<mi>π</mi>` : `<mo>%</mo>`
    return str;
  }

  // ---------------------------------------------------------------------------

  get value() {
    if (this.den !== undefined) return this.num / this.den;
    if (this.unit === '%') return this.num / 100;
    if (this.unit === 'π') return this.num * Math.PI;
    return this.num;
  }

  get sign() {
    return Math.sign(this.num);
  }

  get simplified(): XNumber {
    if (!this.den) return this;
    const factor = gcd(Math.abs(this.num), this.den);
    return new XNumber(this.num / factor, this.den / factor, this.unit);
  }

  get inverse() {
    if (this.den !== undefined) return new XNumber(this.den, this.num);
    return new XNumber(1 / this.num, undefined, this.unit);
  }

  get negative() {
    return new XNumber(-this.num, this.den, this.unit);
  }

  // ---------------------------------------------------------------------------

  static fromString(s: string) {
    // Replace whitespace and unit suffixes
    s = s.replace(/\s/g, '').replace('–', '-');
    const unit = s.endsWith('%') ? '%' : s.endsWith('π') ? 'π' : undefined;
    if (unit) s = s.replace(unit, '');

    // Handle integers or decimals
    if (!s.includes('/')) return isNaN(+s) ? undefined : new XNumber(+s, undefined, unit);

    // Handle fractions
    const [num, den] = s.split('/').map(x => +x);
    if (isNaN(num) || isNaN(den) || nearlyEquals(den, 0)) return;
    if (!isInteger(num) || !isInteger(den)) return new XNumber(num / den, undefined, unit);
    return new XNumber(num, den, unit);

  }

  static fractionFromDecimal(x: number, maxDen = 100) {
    const sign = Math.sign(x);
    const whole = Math.floor(Math.abs(x));
    x = Math.abs(x) - whole;

    let a = 0;
    let b = 1;
    let c = 1;
    let d = 1;

    while (b <= maxDen && d <= maxDen) {
      const mediant = (a + c) / (b + d);
      if (x === mediant) {
        if (b + d <= maxDen) {
          return new XNumber(sign * (whole * (b + d) + a + c), b + d);
        } else if (d > b) {
          return new XNumber(sign * (whole * d + c), d);
        } else {
          return new XNumber(sign * (whole * b + a), b);
        }
      } else if (x > mediant) {
        [a, b] = [a + c, b + d];
      } else {
        [c, d] = [a + c, b + d];
      }
    }

    if (b > maxDen) return new XNumber(sign * (whole * d + c), d);
    return new XNumber(sign * (whole * b + a), b);
  }

  // ---------------------------------------------------------------------------

  add(a: XNumber|number) {
    return XNumber.sum(this, a);
  }

  subtract(a: XNumber|number) {
    return XNumber.difference(this, a);
  }

  multiply(a: XNumber|number) {
    return XNumber.product(this, a);
  }

  divide(a: XNumber|number) {
    return XNumber.quotient(this, a);
  }

  /** Calculates the sum of two fractions a and b. */
  static sum(a: XNumber, b: XNumber|number): XNumber {
    if (typeof b === 'number') b = new XNumber(b);

    // If units are different, always convert to a decimal
    // TODO Maybe have special handling for fraction + percentage?
    if (a.unit !== b.unit) return new XNumber(a.value + b.value);

    // Neither a nor b are fractions
    if (a.den === undefined && b.den === undefined) return new XNumber(a.num + b.num, undefined, a.unit);

    // Ensure that a is always a fraction
    if (a.den === undefined) [a, b] = [b, a];

    // Trying to add a decimal to a fraction.
    // TODO Maybe try XNumber.fractionFromDecimal?
    if (!isInteger(b.num)) return new XNumber(a.value + b.value, undefined, a.unit);

    return new XNumber(a.num * (b.den || 1) + b.num * a.den!, a.den! * (b.den || 1), a.unit).simplified;
  }

  /** Calculates the difference of two numbers a and b. */
  static difference(a: XNumber, b: XNumber|number) {
    if (typeof b === 'number') b = new XNumber(b);
    return XNumber.sum(a, b.negative);
  }

  /** Calculates the product of two numbers a and b. */
  static product(a: XNumber, b: XNumber|number) {
    if (typeof b === 'number') b = new XNumber(b);

    // Handle simple integer multiplication
    if (!a.unit && !a.den && isInteger(a.num)) return new XNumber(a.num * b.num, b.den, b.unit).simplified;
    if (!b.unit && !b.den && isInteger(b.num)) return new XNumber(a.num * b.num, a.den, a.unit).simplified;

    // Decimals or units that need to be converted
    if (a.unit === 'π' || b.unit === 'π' || !isInteger(a.num) || !isInteger(b.num)) return new XNumber(a.value * b.value);

    // Fraction multiplication
    const units = (a.unit === '%' ? 100 : 1) * (b.unit === '%' ? 100 : 1);
    return new XNumber(a.num * b.num, (a.den || 1) * (b.den || 1) * units);
  }

  /** Calculates the quotient of two fractions a and b. */
  static quotient(a: XNumber, b: XNumber|number) {
    if (typeof b === 'number') b = new XNumber(b);
    return XNumber.product(a, b.inverse);
  }
}
