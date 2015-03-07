// =================================================================================================
// Fermat.js | Complex
// (c) 2015 Mathigon / Philipp Legner
// =================================================================================================


(function() {


    M.Complex = function(re, im) {
        this.re = re || 0;
        this.im = im || 0;
    };


    M.extend(M.Complex.prototype, {

        toString: function() {
            if (!this.real) return this.imaginary + 'i';
            if (!this.imaginary) return this.real;
            return this.real + ' + ' + this.imaginary + 'i';
        },

        magnitude: function () {
            return Math.sqrt(this.re * this.re + this.im * this.im);
        },

        phase: function () {
            return Math.atan2(this.im, this.re);
        },

        conjugate: function() {
            return new M.complex(this.re, -this.im);
        }

    }, true);


    M.complex = {};

    M.complex.add = function(c1, c2) {
        if (!(c1 instanceof M.Complex)) c1 = new M.Complex(c1, 0);
        if (!(c2 instanceof M.Complex)) c2 = new M.Complex(c2, 0);
        return new M.Complex(c1.re + c2.re, c1.im + c2.im);
    };

    M.complex.subtr = function(c1, c2) {
        if (!(c1 instanceof M.Complex)) c1 = new M.Complex(c1, 0);
        if (!(c2 instanceof M.Complex)) c2 = new M.Complex(c2, 0);
        return new M.Complex(c1.re - c2.re, c1.im - c2.im);
    };

    M.complex.mult = function(c1, c2) {
        if (!(c1 instanceof M.Complex)) c1 = new M.Complex(c1, 0);
        if (!(c2 instanceof M.Complex)) c2 = new M.Complex(c2, 0);
        var re = c1.re * c2.re - c1.im * c2.im;
        var im = c1.im * c2.re + c1.re * c2.im;
        return new M.complex(re, im);
    };

    M.complex.div = function(c1, c2) {
        if (!(c1 instanceof M.Complex)) c1 = new M.Complex(c1, 0);
        if (!(c2 instanceof M.Complex)) c2 = new M.Complex(c2, 0);

        if (Math.abs(c2.re) < EPS && Math.abs(c2.im) < EPS)
            return new M.Complex(Infinity, Infinity);

        var denominator = c2.re * c2.re + c2.im * c2.im;
        var re = (c1.re * c2.re + c1.im * c2.im) / denominator;
        var im = (c1.im * c2.re - c1.re * c2.im) / denominator;
        return new M.Complex(re, im);
    };


})();
