// =============================================================================
// Fermat.js | Complex Numbers
// (c) Mathigon
// =============================================================================


/**  Complex number class. */
export class Complex {

  constructor(public re = 0, public im = 0) {}

  get magnitude() {
    return Math.sqrt(this.re * this.re + this.im * this.im);
  }

  get phase() {
    return Math.atan2(this.im, this.re);
  }

  get conjugate() {
    return new Complex(this.re, -this.im);
  }

  toString() {
    if (!this.re) return this.im + 'i';
    if (!this.im) return this.re;
    return this.re + ' + ' + this.im + 'i';
  }

  // ---------------------------------------------------------------------------

  /** Calculates the sum of two complex numbers c1 and c2. */
  static sum(c1: Complex|number, c2: Complex|number) {
    if (!(c1 instanceof Complex)) c1 = new Complex(c1, 0);
    if (!(c2 instanceof Complex)) c2 = new Complex(c2, 0);

    return new Complex(c1.re + c2.re, c1.im + c2.im);
  }

  /** Calculates the difference of two complex numbers c1 and c2. */
  static difference(c1: Complex|number, c2: Complex|number) {
    if (!(c1 instanceof Complex)) c1 = new Complex(c1, 0);
    if (!(c2 instanceof Complex)) c2 = new Complex(c2, 0);

    return new Complex(c1.re - c2.re, c1.im - c2.im);
  }

  /** Calculates the product of two complex numbers c1 and c2. */
  static product(c1: Complex|number, c2: Complex|number) {
    if (!(c1 instanceof Complex)) c1 = new Complex(c1, 0);
    if (!(c2 instanceof Complex)) c2 = new Complex(c2, 0);

    let re = c1.re * c2.re - c1.im * c2.im;
    let im = c1.im * c2.re + c1.re * c2.im;
    return new Complex(re, im);
  }

  /** Calculates the sum of two quotient numbers c1 and c2. */
  static quotient(c1: Complex|number, c2: Complex|number) {
    if (!(c1 instanceof Complex)) c1 = new Complex(c1, 0);
    if (!(c2 instanceof Complex)) c2 = new Complex(c2, 0);

    if (Math.abs(c2.re) < Number.EPSILON || Math.abs(c2.im) < Number.EPSILON)
      return new Complex(Infinity, Infinity);

    let denominator = c2.re * c2.re + c2.im * c2.im;
    let re = (c1.re * c2.re + c1.im * c2.im) / denominator;
    let im = (c1.im * c2.re - c1.re * c2.im) / denominator;

    return new Complex(re, im);
  }
}
