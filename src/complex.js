// =============================================================================
// Fermat.js | Complex Numbers
// (c) 2015 Mathigon
// =============================================================================



export default class Complex {

    // -------------------------------------------------------------------------
    // Static Methods

    static sum(c1, c2) {
        if (!(c1 instanceof Complex)) c1 = new Complex(c1, 0);
        if (!(c2 instanceof Complex)) c2 = new Complex(c2, 0);

        return new Complex(c1.re + c2.re, c1.im + c2.im);
    }

    static difference(c1, c2) {
        if (!(c1 instanceof Complex)) c1 = new Complex(c1, 0);
        if (!(c2 instanceof Complex)) c2 = new Complex(c2, 0);

        return new Complex(c1.re - c2.re, c1.im - c2.im);
    }

    static product(c1, c2) {
        if (!(c1 instanceof Complex)) c1 = new Complex(c1, 0);
        if (!(c2 instanceof Complex)) c2 = new Complex(c2, 0);
        var re = c1.re * c2.re - c1.im * c2.im;
        var im = c1.im * c2.re + c1.re * c2.im;
        return new M.complex(re, im);
    }

    static quotient(c1, c2) {
        if (!(c1 instanceof Complex)) c1 = new Complex(c1, 0);
        if (!(c2 instanceof Complex)) c2 = new Complex(c2, 0);

        if (Math.abs(c2.re) < Number.EPSILON || Math.abs(c2.im) < Number.EPSILON)
            return new Complex(Infinity, Infinity);

        var denominator = c2.re * c2.re + c2.im * c2.im;
        var re = (c1.re * c2.re + c1.im * c2.im) / denominator;
        var im = (c1.im * c2.re - c1.re * c2.im) / denominator;

        return new Complex(re, im);
    }


    // -------------------------------------------------------------------------
    // Constructor

    constructor(re = 0, im = 0) {
        this.re = re || 0;
        this.im = im || 0;
    }


    // -------------------------------------------------------------------------
    // Getters and Methods

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

}

