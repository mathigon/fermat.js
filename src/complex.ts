// =============================================================================
// Fermat.js | Complex Numbers
// (c) Mathigon
// =============================================================================


import {round} from './arithmetic';


const absStr = (n: number, suffix?: string) => {
  const prefix = n < 0 ? '–' : '';
  if (Math.abs(n) === 1 && suffix) return prefix + suffix;
  return prefix + Math.abs(n) + (suffix || '');
};


/**  Complex number class. */
export class Complex {

  constructor(public re = 0, public im = 0) {}

  get modulus() {
    return Math.sqrt(this.re * this.re + this.im * this.im);
  }

  get argument() {
    return Math.atan2(this.im, this.re);
  }

  get conjugate() {
    return new Complex(this.re, -this.im);
  }

  /** Returns the ith nth-root of this complex number. */
  root(n: number, i = 0) {
    const r = Math.pow(this.modulus, 1/n);
    const th = (this.argument + i * 2 * Math.PI) / n;
    return new Complex(r * Math.cos(th), r * Math.sin(th));
  }

  toString(precision = 2) {
    const re = round(this.re, precision);
    const im = round(this.im, precision);

    if (im === 0) return absStr(re);
    if (re === 0) return absStr(im, 'i');
    return [absStr(re), im < 0 ? '–' : '+', absStr(Math.abs(im), 'i')].join(' ');
  }

  // ---------------------------------------------------------------------------

  add(a: Complex|number) {
    return Complex.sum(this, a);
  }

  subtract(a: Complex|number) {
    return Complex.difference(this, a);
  }

  multiply(a: Complex|number) {
    return Complex.product(this, a);
  }

  divide(a: Complex|number) {
    return Complex.quotient(this, a);
  }

  /** Calculates the sum of two complex numbers c1 and c2. */
  static sum(c1: Complex|number, c2: Complex|number) {
    if (typeof c1 === 'number') c1 = new Complex(c1, 0);
    if (typeof c2 === 'number') c2 = new Complex(c2, 0);

    return new Complex(c1.re + c2.re, c1.im + c2.im);
  }

  /** Calculates the difference of two complex numbers c1 and c2. */
  static difference(c1: Complex|number, c2: Complex|number) {
    if (typeof c1 === 'number') c1 = new Complex(c1, 0);
    if (typeof c2 === 'number') c2 = new Complex(c2, 0);

    return new Complex(c1.re - c2.re, c1.im - c2.im);
  }

  /** Calculates the product of two complex numbers c1 and c2. */
  static product(c1: Complex|number, c2: Complex|number) {
    if (typeof c1 === 'number') c1 = new Complex(c1, 0);
    if (typeof c2 === 'number') c2 = new Complex(c2, 0);

    const re = c1.re * c2.re - c1.im * c2.im;
    const im = c1.im * c2.re + c1.re * c2.im;
    return new Complex(re, im);
  }

  /** Calculates the quotient of two complex numbers c1 and c2. */
  static quotient(c1: Complex|number, c2: Complex|number) {
    if (typeof c1 === 'number') c1 = new Complex(c1, 0);
    if (typeof c2 === 'number') c2 = new Complex(c2, 0);

    if (Math.abs(c2.re) < Number.EPSILON || Math.abs(c2.im) < Number.EPSILON) {
      return new Complex(Infinity, Infinity);
    }

    const denominator = c2.re * c2.re + c2.im * c2.im;
    const re = (c1.re * c2.re + c1.im * c2.im) / denominator;
    const im = (c1.im * c2.re - c1.re * c2.im) / denominator;

    return new Complex(re, im);
  }

  /** Calculates e^c for a complex number c. */
  static exp(c: Complex|number) {
    if (typeof c === 'number') c = new Complex(c, 0);
    const r = Math.exp(c.re);
    return new Complex(r * Math.cos(c.im), r * Math.sin(c.im));
  }
}
