// =================================================================================================
// Fermat.js | Number Theory
// (c) 2015 Mathigon / Philipp Legner
// =================================================================================================


(function() {

    // ---------------------------------------------------------------------------------------------
    // Simple Functions

    M.nearlyEquals = function(x, y, tolerance) {
        return Math.abs(x - y) < (tolerance || EPS);
    };

    M.sign = function(x) {
        return M.nearlyEquals(x, 0) ? 0 : (x > 0 ? 1 : -1);
    };

    M.square = function(x) {
        return x * x;
    };

    M.cube = function(x) {
        return x * x * x;
    };

    M.bound = function(x, min, max) {
        if (max == null) max = Infinity;
        if (min == null) min = -Infinity;
        return Math.min(max, Math.max(min, x));
    };

    M.between = function(x, a, b) {
        return x >= a && x <= b;
    };


    // ---------------------------------------------------------------------------------------------
    // String Conversion

    // Adds ','s as thousands seperators to a number
    M.numberFormat = function(x) {
        x = ('' + x).split('.');
        var n = x[0];
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(n)) {
            n = n.replace(rgx, '$1' + ',' + '$2');
        }
        return n + (x.length > 1 ? '.' + x[1] : '');
    };

    M.toOrdinal = function(x) {
        if(Math.abs(x) % 100 >= 11 && Math.abs(x) % 100 <= 13)
            return x + 'th';

        switch(x % 10) {
            case 1: return x + 'st';
            case 2: return x + 'nd';
            case 3: return x + 'rd';
            default: return x + 'th';
        }
    };


    // ---------------------------------------------------------------------------------------------
    // Rounding, Decimals and Decimals

    // Returns the array of the integer digits of a number n
    // digits(376) = [6, 7, 3]
    M.digits = function(n) {
        if (n === 0) return [0];
        var digits = [];
        while (n > 0) {
            digits.push(n % 10);
            n = Math.floor(n / 10);
        }
        return digits;
    };

    // Returns the fractional digits of a number
    // decimalDigits(3.456) = [4, 5, 6]
    M.fractionalDigits= function(n) {
        var str = '' + Math.abs(n - Math.floor(n));
        return toNumberArray(str.split(''));
    };

    // Returns the number of digits after the decimal place
    M.decimalPlaces = function(n) {
        var str = '' + Math.abs(n);
        str = str.split('.');
        return str.length === 1 ? 0 : str[1].length;
    };

    // Round a number to a certain number of decimal places
    M.round = function(n, precision) {
        var factor = Math.pow(10, precision || 0);
        return Math.round(n * factor) / factor;
    };

    // Round a number n to the nearest increment (or 1)
    // round(70, 30) = 60, round(45,30) = 60, round(20.6) = 21
    M.roundTo = function(n, increment) {
        if (!increment) increment = 1;
        return Math.round(n / increment) * increment;
    };

    M.roundTowardsZero = function(x) {
        // Add 0.00001 because of floating points uncertainty
        // TODO use x|0;
        return x < 0 ? Math.ceil(x - 0.00001) : Math.floor(x + 0.00001);
    };

    // Returns a [numerator, denominator] array rational representation of `decimal`
    // See http://en.wikipedia.org/wiki/Continued_fraction for implementation details
    M.toFraction = function(decimal, precision) {
        precision = precision || 0.0001;

        var n = [1, 0], d = [0, 1];
        var a = Math.floor(decimal);
        var rem = decimal - a;

        while (d[0] <= 1/precision) {
            if (M.nearlyEquals(n[0] / d[0], precision)) return [n[0], d[0]];
            n = [a*n[0] + n[1], n[0]];
            d = [a*d[0] + d[1], d[0]];
            a = Math.floor(1 / rem);
            rem = 1/rem - a;
        }

        // Failed to find a nice rational representation so return an irrational "fraction"
        return [decimal, 1];
    };


    // ---------------------------------------------------------------------------------------------
    // Operations

    M.add = function() {
        var sum = 0;
        for (var i=0; i<arguments.length; ++i) sum += (+arguments[i] || 0);
        return sum;
    };

    M.mult = function() {
        var sum = 0;
        for (var i=0; i<arguments.length; ++i) sum *= (+arguments[i] || 1);
        return sum;
    };

    M.subtr = function(a, b) {
        return a - b;
    };

    M.div = function(a, b) {
        return a / b;
    };

    // The JS implementation of the % operator returns the symmetric modulo.
    // Both are identical if a >= 0 and m >= 0 but the results differ if a or m < 0.
    M.mod = function(a, m) {
        return ((a % m) + a) % m;
    };

    M.log = function(x, b) {
        return M.isNumber(b) ? Math.log(x) / Math.log(b) : Math.log(x);
    };

    M.log10 = Math.log10 || function (x) {
        return Math.log(x) / Math.log(10);
    };

    M.log2 = Math.log2 || function (x) {
        return Math.log(x) / Math.log(2);
    };

    M.cosh = Math.cosh || function (x) {
        return (Math.exp(x) + Math.exp(-x)) / 2;
    };

    M.sinh = Math.sinh || function (x) {
        return (Math.exp(x) - Math.exp(-x)) / 2;
    };

})();
