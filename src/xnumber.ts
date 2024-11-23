// =============================================================================
// Fermat.js | Extended Number Class
// (c) Mathigon
// =============================================================================


import {isInteger, nearlyEquals, numberFormat, sign} from './arithmetic';
import {gcd, lcm} from './number-theory';


const FORMAT = /^([0-9\-.]*)([%πkmbtq]?)(\/([0-9\-.]+))?([%π]?)$/;
const tooBig = (x: number) => x >= Number.MAX_SAFE_INTEGER;
type Suffix = '%'|'π'|undefined;


/**  Extended Number class. */
export class XNumber {
  num: number;  /** Used for all number types (decimals, fractions, units, ...). */
  den?: number;  /** Only used for fractions and always ≥ 0. */

  constructor(num: number, den?: number, public unit?: Suffix) {
    // Ensure that den is always positive
    this.num = (den !== undefined && den < 0) ? -num : num;
    if (den !== undefined && Math.abs(den) !== 1 && num !== 0) this.den = Math.abs(den);
  }

  valueOf() {
    return this.value;
  }

  toMixed() {
    if (!this.den || this.unit) return this.toString();
    const part = Math.abs(this.num) % this.den;
    const whole = Math.abs(Math.trunc(this.value));
    if (!whole) return this.toString();
    return `${this.sign < 0 ? '–' : ''}${whole} ${part}/${this.den}`;
  }

  toExpr(type?: 'decimal'|'fraction'|'mixed'|'scientific', precision = 4) {
    const v = this.value;
    // TODO Decide if we really want to return infinity here...
    if (Math.abs(v) >= Number.MAX_VALUE) return '∞';
    if (tooBig(this.num) || this.den && tooBig(this.den)) type = 'decimal';

    // In scientific notation, we try to return a number in the form a × 10^b
    if (type === 'scientific' || Math.abs(v) >= Number.MAX_SAFE_INTEGER) {
      const [base, power] = this.value.toExponential(precision - 1).split('e');
      if (Math.abs(+power) >= precision) {
        const isNeg = power.startsWith('-');
        const exp = `${isNeg ? '(' : ''}${isNeg ? power : power.slice(1)}${isNeg ? ')' : ''}`;
        return `${base.replace(/\.?0+$/, '')} × 10^${exp}${this.unit || ''}`;
      }
    }

    if ((!this.unit && !this.den) || type === 'decimal' || type === 'scientific') {
      const formatted = numberFormat(this.value, precision);
      // For non-standard number formatting, we add quotes for expr parsing.
      return (formatted.match(/^[\d.]+$/g) ? formatted : `"${formatted}"`);
    } else {
      return type === 'mixed' ? this.toMixed() : this.toString();
    }
  }

  toString(digits: number | 'auto' = 4, locale = 'en') {
    // If this is a fraction or has a unit then we do not want separators; otherwise we go with the locale default
    const separators = (this.den || this.unit) ? false : 'auto';
    // If this is a fraction then we do not accept a manually specified value for the length of the numerator
    const actualDigits = this.den ? 'auto' : digits;
    let num = numberFormat(this.num, actualDigits, separators, locale);
    let unit = this.unit || '';
    const den = this.den ? `/${numberFormat(this.den, 'auto', false)}` : '';
    if (num === '0') unit = '';
    if (unit === 'π' && !this.den && (num === '1' || num === '–1')) num = num.replace('1', '');
    return `${num}${den}${unit}`;
  }

  toMathML() {
    let str = `<mn>${this.num}</mn>`;
    if (this.den !== undefined) str = `<mfrac>${str}<mn>${this.den}</mn></mfrac>`;
    if (this.unit) str += (this.unit === 'π') ? `<mi>π</mi>` : `<mo>%</mo>`;
    return str;
  }

  // ---------------------------------------------------------------------------

  /**
   * Returns the value of this number as a decimal. For example, 2/5 and 40%
   * would both return 0.4.
   */
  get value() {
    const unit = (this.unit === '%') ? 1/100 : (this.unit === 'π') ? Math.PI : 1;
    return this.num * unit / (this.den || 1);
  }

  get sign() {
    return Math.sign(this.num);
  }

  /** Simplifies fractions, e.g. 4/8 would become 1/2. */
  get simplified(): XNumber {
    if (!this.den) return this;
    const factor = gcd(Math.abs(this.num), this.den);
    return new XNumber(this.num / factor, this.den / factor, this.unit);
  }

  /** Returns 1/x of this number. */
  get inverse() {
    if (!this.den) return new XNumber(this.den!, this.num);
    return new XNumber(1 / this.num, undefined, this.unit);
  }

  /** Returns -x of this number. */
  get negative() {
    return new XNumber(-this.num, this.den, this.unit);
  }

  get fraction() {
    if (this.unit || !isInteger(this.num)) return;
    return [this.num, this.den || 1];
  }

  // ---------------------------------------------------------------------------

  /** Parses a number string, e.g. '1/2' or '20.7%'. */
  static fromString(s: string) {
    s = s.toLowerCase().replace(/[\s,"]/g, '').replace('–', '-').replace('pi', 'π');
    const match = s.match(FORMAT);
    if (!match) return;

    let suffix = (match[2] || match[5] || undefined) as Suffix;
    let num = match[1] ? +match[1] : undefined;
    const den = match[4] ? +match[4] : undefined;

    // Special handling for π and -π
    if (suffix === 'π' && (!match[1] || match[1] === '-')) num = match[1] ? -1 : 1;
    if (num === undefined || isNaN(num)) return;

    // Handle larger power suffixes
    const power = suffix ? 'kmbtq'.indexOf(suffix) : -1;
    if (power >= 0) {
      num *= 1000 ** (power + 1);
      suffix = undefined;
    }

    // Create XNumber instances
    if (den === undefined) return new XNumber(num, undefined, suffix);
    if (isNaN(den) || nearlyEquals(den, 0)) return;
    if (!isInteger(num) || !isInteger(den)) return new XNumber(num / den, undefined, suffix);
    return new XNumber(num, den, suffix);
  }

  /** Converts a decimal into the closest fraction with a given maximum denominator. */
  static fractionFromDecimal(x: number, maxDen = 1000, precision = 1e-12) {
    let n = [1, 0];
    let d = [0, 1];
    const absX = Math.abs(x);
    let rem = absX;

    while (Math.abs(n[0] / d[0] - absX) > precision) {
      const a = Math.floor(rem);
      n = [a * n[0] + n[1], n[0]];
      d = [a * d[0] + d[1], d[0]];
      if (d[0] > maxDen) return new XNumber(x);
      rem = 1 / (rem - a);
    }

    if (!nearlyEquals(n[0] / d[0], absX, precision)) return new XNumber(x);
    return new XNumber(sign(x) * n[0], d[0] === 1 ? undefined : d[0]);
  }

  // ---------------------------------------------------------------------------

  clamp(min?: number, max?: number) {
    const v = this.value;
    if (min !== undefined && v < min) return new XNumber(min);
    if (max !== undefined && v > max) return new XNumber(max);
    return this;
  }

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
    if (a.num === 0) return b;

    // If units are different, always convert to a decimal
    // TODO Maybe have special handling for fraction + percentage?
    if (a.unit !== b.unit) return new XNumber(a.value + b.value);

    // Neither a nor b are fractions
    if (!a.den && !b.den) return new XNumber(a.num + b.num, undefined, a.unit);

    // Ensure that a is always a fraction
    if (!a.den) [a, b] = [b, a];

    // Trying to add a decimal to a fraction.
    // TODO Maybe try XNumber.fractionFromDecimal?
    if (!isInteger(b.num)) return new XNumber(a.value + b.value, undefined, a.unit);

    const common = lcm(a.den!, b.den ||1);
    const fa = common / a.den!;
    const fb = common / (b.den || 1);
    return new XNumber(a.num * fa + b.num * fb, common, a.unit);
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
    if (!a.unit && !a.den && isInteger(a.num)) return new XNumber(a.num * b.num, b.den, b.unit);
    if (!b.unit && !b.den && isInteger(b.num)) return new XNumber(a.num * b.num, a.den, a.unit);

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
