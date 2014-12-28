// Fermat Mathematics Tools
// (c) 2014, Mathigon / Philipp Legner
// MIT License (https://github.com/Mathigon/fermat.js/blob/master/LICENSE)

 (function() {
if (typeof M !== 'object' || !M.core) throw new Error('fermat.js requires core.js.');
M.fermat = true;

// Epsilon/tolerance value used by default
var EPS = 0.000001;

// Constants
M.PHI = 1.618033988749895;
M.SQRT2 = 1.4142135623730951;

M.setPrecision = function(eps) {
    EPS = eps || 0.000001;
};

var _arrayJoin = Array.prototype.join;
var _arrayPush = Array.prototype.push;
var _arraySlice = Array.prototype.slice;

// The function remembers previously evaluated values, avoiding repetitive calculations
// http://blog.thejit.org/2008/09/05/memoization-in-javascript/
function caching(fn) {
    if (fn.memo) return fn.memo;
    var cache = {};

    fn.memo = function() {
        var key = _arrayJoin.call(arguments);
        return (cache[key] !== undefined) ? cache[key] : cache[key] = fn.apply(this, arguments);
    };

    return fn.memo;
}

// This function tries to convert all elements in an array to a number
function toNumberArray(array) {
    var newArray = [];
    for (var i=0, n=array.length; i<n; ++i) newArray.push(+array[i]);
    return newArray;
}

function findInArray(array, x) {
    for (var i=0, n=array.length; i<n; ++i) if (array[i] === x) return i;
    return -1;
}

function concatArrays(a1, a2) {
    return Array.prototype.concat.apply(a1, a2);
}

(function() {

    // ---------------------------------------------------------------------------------------------
    // Simple Functions

    M.nearlyEquals = function(x, y, tolerance) {
        return Math.abs(x - y) < (tolerance || EPS);
    };

    M.sign = Math.sign || function(x) {
        return x > 0 ? 1 : x < 0 ? -1 : 0;
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

(function() {

    var smallPrimes = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97];


    M.gcd = function gcd(a, b) {
        if (arguments.length > 2) {
            var rest = [].slice.call(arguments, 1);
            return gcd(a, gcd.apply(null, rest));
        }

        var mod;
        a = Math.abs(a);
        b = Math.abs(b);

        while (b) {
            mod = a % b;
            a = b;
            b = mod;
        }

        return a;
    };


    M.lcm = function lcm(a, b) {
        if (arguments.length > 2) {
            var rest = [].slice.call(arguments, 1);
            return lcm(a, lcm.apply(null, rest));
        }

        return Math.abs(a * b) / M.gcd(a, b);
    };


    M.isPrime = function(n) {
        if (n <= 1 || !M.isInt(n)) return false;
        if (n < 101) return (findInArray(smallPrimes, n) >= 0);
        if (n % 2 === 0) return false;

        var sqrt = Math.sqrt(n);
        for (var i = 3; i <= sqrt; i += 2) {
            if (n % i === 0) return false;
        }

        return true;
    };


    M.isOdd = function(n) {
        return n % 2 === 1;
    };


    M.isEven = function(n) {
        return n % 2 === 0;
    };


    M.primeFactorization = function fact(n) {
        if (n === 1) return [];
        if (M.isPrime(n)) return [n];

        var maxf = Math.sqrt(n);
        for (var f = 2; f <= maxf; ++f) {
            if (n % f === 0) return concatArrays(fact(f), fact(n / f));
        }
    };


    M.primeFactors = function(n) {
        return M.primeFactorization(n).unique();
    };


    // Returns an array of all primes below n
    M.listPrimes = function(n) {
        if (n < 2) return [];
        var result = [2];

        for (var i = 3; i <= n; i++) {
            var notMultiple = false;
            for (var j in result) {
                if (M.has(result, j)) notMultiple = notMultiple || (0 === i % result[j]);
            }
            if (!notMultiple) result.push(i);
        }

        return result;
    };

})();

(function() {

    M.factorial = caching(function(x) {
        if (x < 0) return NaN;
        if (x === 0) return 1;
        if (x <= 1) return x;
        return x * M.factorial(x - 1);
    });


    // Returns binomial coefficient (n choose k)
    M.binomial = caching(function(n, k) {
        if (k === 0) {
            return 1;
        } else if (2 * k > n) {
            return M.binomial(n, n - k);
        } else {
            var coeff = 1;
            for (var i = k; i > 0; --i) {
                coeff *= (n - i + 1);
                coeff /= i;
            }
            return coeff;
        }
    });

    /*
    if (k > n || k < 0) return NaN;

    k = Math.round(k);
    n = Math.round(n);

    if (k === 0 || k === n) return 1;

    var b = 1;

    for (var i = 0; i < k; i++) {
        b *= (n - i);
        b /= (i + 1);
    }

    return b;
    */


    // Returns an array of all the permutationsof arr.
    // permutations(arr)[0] == arr
    // http://stackoverflow.com/questions/9960908/permutations-in-javascript
    M.permutations = function(arr) {
        var permArr = [];
        var usedChars = [];
        function permute(input) {
            for (var i = 0; i < input.length; i++) {
                var term = input.splice(i, 1)[0];
                usedChars.push(term);
                if (input.length === 0) {
                    permArr.push(usedChars.slice());
                }
                permute(input);
                input.splice(i, 0, term);
                usedChars.pop();
            }
            return permArr;
        }
        return permute(arr);
    };


    function getSubsets(arr) {
        if (arr.length === 1) return [[], arr];
        var last = arr.pop();
        var subsets = getSubsets(arr);
        var result = [];
        for (var i=0; i<subsets.length; ++i) {
            var a2 = _arraySlice.call(subsets[i], 0);
            a2.push(last);
            result.push(subsets[i], a2);
        }
        return result;
    }

    // Returns all subsets of arr (of given length)
    M.subsets = function(arr, length) {
        var myArr = _arraySlice.call(arr, 0);
        var subsets = getSubsets(myArr);
        if (length) subsets = subsets.filter(function(x) { return x.length === length; });
        return subsets;
        // FUTURE Sorting of Subsets Results
    };


    // Returns a string of n coin flips like 'HTTHTHTTHTT'
    M.coinFlips = function(n) {
        var str = '';
        for (var i=0; i<n; ++i) {
            str += (Math.random() >= 0.5) ? 'H' : 'T';
        }
        return str;
    };

})();

(function() {

    M.random = {};


    // ---------------------------------------------------------------------------------------------
    // Simple Random Number Generators

    M.random.integer = function(a, b) {
        return (b == null ? 0 : a) +  Math.floor((b == null ? a : b - a + 1) * Math.random());
    };

    M.random.integerArray = function(n) {
        var a = [];
        for (var i=0; i<n; ++i) a.push(i);
        return M.shuffle(a);
    };

    // Choses a random value from weights [2, 5, 3] or { a: 2, b: 5, c: 3 }
    // Total is optional to specify the total of the weights, if the function is called repeatedly
    M.random.weighted = function(obj, setTotal) {
        var total = 0;
        if (setTotal == null) {
            M.each(obj, function(x) { total += (+x); });
        } else {
            total = setTotal;
        }

        var rand = Math.random() * total;
        var curr = 0;

        return M.some(obj, function(x, i) {
            curr += obj[i];
            if (rand <= curr) return i;
        });
    };


    // ---------------------------------------------------------------------------------------------
    // Array Shuffle

    // Randomly shuffles the elements in an array
    M.shuffle = function(a) {
        a = _arraySlice.call(a, 0); // create copy
        var j, tmp;
        for (var i = a.length - 1; i; --i) {
            j = Math.floor(Math.random() * (i+1));
            tmp = a[j];
            a[j] = a[i];
            a[i] = tmp;
        }
        return a;
    };


    // ---------------------------------------------------------------------------------------------
    // Discrete Distribution

    M.random.bernoulli = function(p) {
        if (p == null) p = 0.5;
        p = Math.max(0,Math.min(1,p));
        return (Math.random() < p ? 1 : 0);
    };

    M.random.binomial = function(n,p) {
        if (n == null) n = 1;
        if (p == null) p = 0.5;
        var t = 0;
        for (var i=0; i<n; ++i) t += M.random.bernoulli(p);
        return t;
    };

    M.random.poisson = function(l) {
        if (l == null) l = 1;
        if (l <= 0) return 0;
        var L = Math.exp(-l), p = 1;
        for (var k = 0; p > L; ++k) p = p * Math.random();
        return k - 1;
    };


    // ---------------------------------------------------------------------------------------------
    // Continuous Distribution

    M.random.uniform = function(a, b) {
        if (a == null) a = 0;
        if (b == null) b = 1;
        return a + (b-a) * Math.random();
    };

    M.random.normal = function(m, v) {
        if (m == null) m = 0;
        if (v == null) v = 1;

        var u1 = Math.random();
        var u2 = Math.random();
        var rand = Math.sqrt( -2 * Math.log(u1) ) * Math.cos( 2 * Math.PI * u2 );

        return rand * Math.sqrt(v) + m;
    };

    M.random.exponential = function(l) {
        if (l == null) l = 1;
        return l <= 0 ? 0 : -Math.log(Math.random()) / l;
    };

    M.random.geometric = function(p) {
        if (p == null) p = 0.5;
        if (p <= 0 || p > 1) return null;
        return Math.floor( Math.log(Math.random()) / Math.log(1-p) );
    };

    M.random.cauchy = function() {
        var rr, v1, v2;
        do {
            v1 = 2 * Math.random() - 1;
            v2 = 2 * Math.random() - 1;
            rr = v1 * v1 + v2 * v2;
        } while (rr >= 1);
        return v1/v2;
    };


    // ---------------------------------------------------------------------------------------------
    // PDFs

    M.normalPDF = function(x, m, v) {
        return Math.exp(-M.square(x - m) / (2 * v)) / Math.sqrt(2 * Math.PI * v);
    };

})();

(function() {

    M.mean = M.average = function(a) {
        return a.length ? M.total(a) / a.length : 0;

    };

    M.median = function(values) {
        var n = values.length;
        if (!n) return 0;

        var sorted = values.slice(0).sort();
        return (n % 2 === 1) ? sorted[Math.floor(n/2)] : (sorted[n/2 - 1] + sorted[n/2]) / 2;
    };


    // Returns 'null' if no mode exists (multiple values with the same largest count)
    M.mode = function(values) {
        var numInstances = [];
        var modeInstances = -1;

        var mode;
        for (var i = 0; i < values.length; i++) {
            if (!numInstances[values[i]]) {
                numInstances[values[i]] = 1;
            } else {
                numInstances[values[i]] += 1;
                if (numInstances[values[i]] > modeInstances) {
                    modeInstances = numInstances[values[i]];
                    mode = values[i];
                }
            }
        }

        // iterate again to check for 'no mode'
        for (i = 0; i < numInstances.length; i++) {
            if (numInstances[i]) {
                if (i !== mode && numInstances[i] >= modeInstances) {
                    return null;
                }
            }
        }

        return mode;
    };


    M.variance = function(values) {
        var n = values.length;
        if (!n) return 0;

        var mean = M.mean(values);

        var sum = 0;
        for (var i=0; i<n; ++i) sum += M.square(values[i] - mean);

        return sum / (n - 1);
    };


    M.stdDev = function(values) {
        return Math.sqrt(M.variance(values));
    };


    // Determines the covariance of the numbers in two arrays aX and aY
    M.covariance = function(aX, aY) {
        if (aX.length !== aY.length) throw new Error('Array length mismatch');
        var n = aX.length;
        var total = 0;
        for (var i = 0; i < n; i++) total += aX[i] * aY[i];
        return (total - aX.total() * aY.total() / n) / n;
    };


    M.correlation = function(aX, aY) {
        if (aX.length !== aY.length) throw new Error('Array length mismatch');
        var covarXY = M.covariance(aX, aY);
        var stdDevX = aX.standardDev();
        var stdDevY = aY.standardDev();
        return covarXY / (stdDevX * stdDevY);
    };


    M.rSquared = function(source, regression) {

        var residualSumOfSquares = source.each(function(d, i) {
            return M.square(d - regression[i]);
        }).sum();

        var totalSumOfSquares = source.each(function(d) {
            return M.square(d - source.average());
        }).sum();

        return 1 - (residualSumOfSquares / totalSumOfSquares);
    };


    M.linearRegression = function(aX, aY) {
        var n = aX.length;

        var sumX = aX.sum();
        var sumY = aY.sum();
        var sumXY = aX.each(function(d, i) { return d * aY[i]; }).sum();
        var sumXSquared = aX.each(function(d) { return d * d; }).sum();

        var meanX = aX.average();
        var meanY = aY.average();

        var b = (sumXY - 1 / n * sumX * sumY) / (sumXSquared - 1 / n * (sumX * sumX));
        var a = meanY - b * meanX;

        return function(x) { return a + b * x; };
    };


})();

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

(function() {

    var setPrototype = Object.setPrototypeOf ||
                       function(obj, proto) { obj.__proto__ = proto; }; // jshint ignore:line


    // M.Vector([1, 2, 3]) = [1, 2, 3]
    // M.Vector(3) = [null, null, null]
    // M.Vector(3, 1) = [1, 1, 1]

    // M.Vector is a subclass of the native JS Array type and contains all usual Arraymethods.
    // For very long or very large numbers of vectors, native Arrays perform significantly better.
    // All functions in M.vector work with M.Vector objects as well as native arrays

    M.Vector = function(a, b) {

        var array;

        if (Array.isArray(a)) {
            // Reduces performance, but we don't want to modify arguments passed in:
            array = a.slice(0);
        } else {
            array = [];
            if (b === undefined) b = null;
            for (var i=0; i<a; ++i) array.push(b);
        }

        // Reduces performance and violates JS best practices, but seems to be neccessary:
        setPrototype(array, M.Vector.prototype);

        return array;
    };

    M.Vector.prototype = new Array; // jshint ignore:line

    /* Alternate Array Subclass (doesn't use Object.setPrototypeOf but is slower):
       var M.Vector = function(array) { this.push.apply(this, array); };
       M.Vector.prototype = Object.create(Array.prototype);
       M.Vector.prototype.constructor = M.Vector; */

    M.extend(M.Vector.prototype, {

        total: function() {
            return M.total(this);
        },

        average: function() {
            return this.total() / this.length;
        },

        norm: function() {
            var n = 0;
            for (var i=0; i<this.length; ++i) n += M.square(this[i]);
            return Math.sqrt(n);
        },

        normalize: function() {
            var a = [], n = this.length;
            var total = this.norm();
            for (var i = 0; i < n; ++i) a.push(this[i]/total);
            return M.Vector(a);
        },

        toString: function() {
            return '(' + _arrayJoin.call(this, ', ') + ')';
        }

    }, true);

    // ---------------------------------------------------------------------------------------------

    M.vector = {};

    M.vector.dot = function(v1, v2) {
        var n = Math.max(v1.length, v2.length);
        var d = 0;
        for (var i=0; i<n; ++i) d += (v1[i] || 0) * (v2[i] || 0);
        return d;
    };

    M.vector.cross2D = function(x, y) {
        return x[0] * y[1] - x[1] * y[0];
    };

    M.vector.cross = function(v1, v2) {
        return M.Vector([v1[1] * v2[2] - v1[2] * v2[1],
                         v1[2] * v2[0] - v1[0] * v2[2],
                         v1[0] * v2[1] - v1[1] * v2[0]]);
    };

    M.vector.mult = function(v, s) {
        return M.Vector(M.map(function(x) { return x * s; }, v));
    };

})();

(function() {

    // M.Matrix([[1,2],[3,4]]) = [[1,2],[3,4]];
    // M.Matrix(2) = [[0,0],[0,0]];
    // M.Matrix(2,3) = [[0,0,0],[0,0,0]]
    // M.Matrix(2,3,1) = [[1,1,1],[1,1,1]]

    M.Matrix = function(a, b, c) {
        if (!(this instanceof M.Matrix)) return new M.Matrix(a, b, c);

        var isArray = M.isArray(a);
        this.rows = isArray ? a.length : a;
        this.columns = isArray ? Math.max.call(Math, a.map(function(x) { return x.length; }))
                               : (b != null) ? b : a;

        for (var i=0; i<this.rows; ++i) {
            this[i] = [];
            for (var j=0; j<this.columns; ++j) {
                var val = isArray ? a[i][j] : c;
                this[i][j] = (val != null) ? val : null;
            }
        }
    };

    // ---------------------------------------------------------------------------------------------

    M.Matrix.prototype.isSquare = function() {
        return this.rows === this.cols;
    };

    M.Matrix.prototype.row = function(i) {
        return new M.Vector(this[i]);
    };

    M.Matrix.prototype.column = function(j) {
        var c = [];
        for (var i=0; i<this.rows; ++i) c.push(this[i][j]);
        return new M.Vector(c);
    };

    M.Matrix.prototype.transpose = function() {
        var newMatrix = [];

        for (var i=0; i<this.columns; ++i) {
            this[i] = [];
            for (var j=0; j<this.rows; ++j) {
                newMatrix[i][j] = this[j][i];
            }
        }

        return new M.Matrix(newMatrix);
    };

    M.Matrix.prototype.determinant = function() {
        if (!this.isSquare()) throw new Error('Not a square matrix.');
        var n = this.rows, det = 0;

        if (n === 1) {
            return this[0][0];
        } else if (n === 2) {
            return this[0][0] * this[1][1] - this[0][1] * this[1][0];
        }

        for (var col = 0; col < this.cols; ++col) {
            var diagLeft  = this[0][col];
            var diagRight = this[0][col];

            for(var row=1; row < rows; ++row) {
                diagRight *= this[row][M.mod(col + row, n)];
                diagLeft  *= this[row][M.mod(col - row, n)];
            }

            det += diagRight - diagLeft;
        }

        return det;
    };

    M.Matrix.prototype.scalarMultiply = function(val) {
        var result = [];
        for (var i = 0; i < this.rows; i++) {
            result[i] = [];
            for (var j = 0; j < this.columns; j++) {
                result[i][j] = val * this[i][j];
            }
        }
        return M.Matrix(result);
    };

    M.Matrix.prototype.inverse = function() {
        // TODO
    };

    // ---------------------------------------------------------------------------------------------

    M.matrix = {};

    // Create an identity matrix of dimension n x n
    M.matrix.identity = function() {
        var x = new M.Matrix(n, n, 0);
        for (var i = 0; i < n; ++i) x[i][i] = 1;
        return x;
    };

    M.matrix.add = function(m1, m2) {
        if (m1.rows !== m2.rows || m1.cols !== m2.cols) throw new Error('Matrix size mismatch');

        var result = [];

        for (var i = 0; i < m1.length; ++i) {
            result[i] = [];
            for (var j = 0; j < m1[i].length; ++j) {
                result[i][j] = m1[i][j] + m2[i][j];
            }
        }

        return M.Matrix(result);
    };

    M.matrix.rotation = function(angle) {
        // TODO
    };

    M.matrix.shear = function() {
        // TODO
    };

    M.matrix.reflection = function() {
        // TODO
    };

    // Orthogonal Projection
    M.matrix.projection = function() {
        // TODO
    };

    var vMultM = function(v, m) {
        return mMultV(m.transpose(), v);
    };

    var mMultV = function(m, v) {
        // TODO
    };

    var mMultM = function(m1, m2) {
        // TODO
    };

    M.matrix.mult = function(a, b) {
        if (a instanceof M.Vector && b instanceof M.Matrix) {
            return vMultM(a, b);
        } else if (a instanceof M.Matrix && b instanceof M.Vector) {
            return mMultV(a, b);
        } else if (a instanceof M.Matrix && b instanceof M.Matrix) {
            return mMultM(a, b);
        } else {
            throw new Error('Can\'t multiply two vectors; use .dot or .cross instead.');
        }
    };

})();

(function() {

    M.geo = {};

    // TODO  M.geo.Curve class (length, area)
    // TODO circle-circle and circle-polygon intersections
    // TODO Advanced projections functions


    // ---------------------------------------------------------------------------------------------
    // Types

    M.geo.Point = function(x, y) {
        this.x = this[0] = (+x || 0);
        this.y = this[1] = (+y || 0);
        this.length = 2;
    };

    // Defines a line that goes through two M.Points p1 and p2
    M.geo.Line = function(p1, p2) {
        this.p1 = p1;
        this.p2 = p2;
    };

    // Defines a cubic bezier curve from p1 to p2 with control points q1 and q2
    M.geo.Curve = function(p1, p2, q1, q2) {
        if (q1 == null) q1 = p1;
        if (q2 == null) q1 = p2;

        this.p1 = p1;
        this.p2 = p2;
        this.q1 = q1;
        this.q2 = q2;
    };

    // Defines a circle
    M.geo.Circle = function(c, r) {
        this.c = (r == null) ? new M.Point(0,0) : c;
        this.r = (r == null) ? 1 : r;
    };

    // Defines a rectangle
    M.geo.Rect = function(x, y, w, h) {
        this.x = x || 0;
        this.y = y || 0;
        this.w = (w == null) ? w : 1;
        this.h = (h == null) ? h : 1;
    };

    // Defines a polygon
    M.geo.Polygon = function(points) {
        this.points = points;
    };

    var getGeoType = function(x) {
        if (x instanceof M.geo.Point) return 'point';
        if (x instanceof M.geo.Line) return 'line';
        if (x instanceof M.geo.Circle) return 'circle';
        if (x instanceof M.geo.Rect) return 'rect';
        if (x instanceof M.geo.Polygon) return 'polygon';
        return '';
    };


    // ---------------------------------------------------------------------------------------------
    // Basic Properties

    M.geo.angle = function (a, b, c) {
        var phiA = Math.atan2(a.y - b.y, a.x - b.x);
        var phiC = Math.atan2(c.y - b.y, c.x - b.x);
        var phi = phiC - phiA;

        if (phi < 0) phi += 2 * Math.PI;
        return phi;
    };

    M.geo.Rect.prototype.toPolygon = function() {
        var a = new M.geo.Point(this.x, this.y);
        var b = new M.geo.Point(this.x + this.w, this.y);
        var c = new M.geo.Point(this.x + this.w, this.y + this.h);
        var d = new M.geo.Point(this.x, this.y + this.h);
        return new M.geo.Polygon([a, b, c, d]);
    };

    M.geo.isParallel = function(l1, l2) {
        var x1 = l1.p2.x - l1.p1.x;
        var y1 = l1.p2.y - l1.p1.y;
        var x2 = l2.p2.x - l2.p1.x;
        var y2 = l2.p2.y - l2.p1.y;

        return (x1 === 0 && x2 === 0) || (y1 === 0 && y2 === 0) || M.nearlyEquals(y1/x1, y2/x2);
    };

    M.geo.Line.prototype.contains = function(p) {
        var grad1 = (this.p2.y - this.p1.y) / (this.p2.x - this.p1.x);
        var grad2 = (p.y - this.p1.y) / (p - this.p1.x);
        return M.nearlyEquals(grad1, grad2);
    };

    M.geo.Line.prototype.normalVector = function() {
        var l = this.length();
        var x = (this.p2.x - this.p1.x) / l;
        var y = (this.p2.y - this.p1.y) / l;
        return new M.Point(x, y);
    };

    M.geo.project = function(p, l) {
        var k = M.vector.dot(M.vector.subtr(p, l.p1), l.normalVector());
        return new M.geo.Point(l.p1.x + k.x, l.p1.y + k.y);
    };

    M.geo.lineToPointDistance = function(p, l) {
        return M.geo.distance(p, M.geo.project(p, l));
    };

    M.geo.Polygon.prototype.centroid = function() {
        // TODO
    };


    // ---------------------------------------------------------------------------------------------
    // Interpolation

    M.geo.Line.prototype.at = function(t) {
        var x = t * this.p1.x + (1-t) * this.p2.x;
        var y = t * this.p1.y + (1-t) * this.p2.y;
        return new M.geo.Point(x, y);
    };

    M.geo.Circle.prototype.at = function() {
        // TODO
    };

    M.geo.Rect.prototype.at = function() {
        // TODO
    };

    M.geo.Polygon.prototype.at = function() {
        // TODO
    };

    M.geo.Curve.prototype.at = function(t) {
        var x = M.cube(1-t)*this.p1.x + 3*t*(1-t)*(1-t)*this.q1.x +
                    3*t*t*(1-t)*this.q2.x + M.cube(t)*this.p2.x;
        var y = M.cube(1-t)*this.p1.y + 3*t*(1-t)*(1-t)*this.q1.y +
                    3*t*t*(1-t)*this.q2.y + M.cube(t)*this.p2.y;
        return new M.geo.Point(x, y);
    };


    // ---------------------------------------------------------------------------------------------
    // Distances

    M.geo.distance = function(p1, p2) {
        return Math.sqrt(M.square(p1.x - p2.x) + M.square(p1.y - p2.y));
    };

    M.geo.manhatten = function(p1, p2) {
        return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
    };

    M.geo.Line.prototype.length = function() {
        return M.geo.distance(this.p1, this.p2);
    };

    M.geo.Curve.prototype.length = function() {
        // TODO
    };

    M.geo.Circle.prototype.circumference = function() {
        return 2 * Math.PI * this.r;
    };

    M.geo.Rect.prototype.circumference = function() {
        return 2 * this.w + 2 * this.h;
    };

    M.geo.Polygon.prototype.circumference = function() {
        var C = 0, p = this.points, n = p.length;
        for (var i = 1; i < n; ++i) C += M.geo.distance(p[i - 1], p[i]);
        C += M.geo.distance(p[n-1], p[0]);
        return C;
    };


    // ---------------------------------------------------------------------------------------------
    // Areas

    M.geo.Circle.prototype.area = function() {
        return Math.PI * M.square(this.r);
    };

    M.geo.Rect.prototype.area = function() {
        return Math.abs(this.w * this.h);
    };

    // Polygon has to be non-intersecting
    M.geo.Polygon.prototype.area = function() {
        var p = this.points;
        var n = p.length;
        var A = p[0].x * p[n - 1].y - p[n - 1].x * p[0].y;

        for (var i = 1; i < n; ++i)
            A += p[i - 1].x * p[i].y - p[i].x * p[i - 1].y;

        return Math.abs(A/2);
    };


    // ---------------------------------------------------------------------------------------------
    // Equivalence Checks

    var same = {

        point: function(p1, p2) {
            return M.nearlyEquals(p1.x, p2.x) && M.nearlyEquals(p1.y, p2.y);
        },

        line: function(l1, l2, unoriented) {
            return (same.point(l1.p1, l2.p1) && same.point(l1.p2, l2.p2)) ||
                   (unoriented && same.point(l1.p1, l2.p2) && same.point(l1.p2, l2.p1));
        },

        rect: function(r1, r2, unoriented) {
            // TODO
        },

        circle: function(c1, c2, unoriented) {
            // TODO
        },

        polygon: function(p1, p2, unoriented) {
            // TODO
        }

    };

    M.geo.same = function same(a, b, unOriented) {
        var type = getGeoType(a);
        if (type !== getGeoType(b)) return false;
        var sameFn = same[type];
        if (sameFn) return sameFn(a, b, unOriented);
    };


    // ---------------------------------------------------------------------------------------------
    // Transformations

    var scalePoint = function(p, sx, sy) {
        return new M.geo.Point(p.x * sx, p.y * sy);
    };

    M.geo.scale = function(x, sx, sy) {
        if (sy == null) sy = sx;

        if (x instanceof M.geo.Rect) x = x.toPolygon();
        var type = getGeoType(x);

        switch (type) {
            case 'point':   return scalePoint(x, sx, sy);
            case 'line':    return new M.geo.Line(scalePoint(x.p1, sx, sy),
                                                  scalePoint(x.p2, sx, sy));
            case 'circle':  return new M.geo.Circle(scalePoint(x.c, sx, sy), x.r * (sx + sy) / 2);
            case 'polygon': return new M.geo.Polygon(x.points.map(function(p) {
                                                                return scalePoint(p, sx, sy); }));
        }
    };

    // Finds the reflection of a point p in a line l
    var reflectPoint = function(p, l) {
        var v = l.p2.x - l.p1.x;
        var w = l.p2.y - l.p1.y;

        var x0 = p.x - l.p1.x;
        var y0 = p.y - l.p1.y;

        var mu = (v * y0 - w * x0) / (v * v + w * w);

        var x = p.x + 2 * mu * w;
        var y = p.y - 2 * mu * v;
        return new M.geo.Point(x, y);
    };

    M.geo.reflection = function(x, l) {
        if (x instanceof M.geo.Rect) x = x.toPolygon();
        var type = getGeoType(x);

        switch (type) {
            case 'point':   return reflectPoint(x, l);
            case 'line':    return new M.geo.Line(reflectPoint(x.p1, l), reflectPoint(x.p2, l));
            case 'circle':  return new M.geo.Circle(reflectPoint(x.c, l), x.r);
            case 'polygon': return new M.geo.Polygon(x.points.map(function(p) {
                                                                return reflectPoint(p, l); }));
        }
    };

    // Finds the rotation of a point p around a center c by an angle phi
    var rotatePoint = function(p, c, phi) {
        var x0 = p.x - c.x;
        var y0 = p.y - c.y;

        var cos = Math.cos(phi);
        var sin = Math.sin(phi);

        var x = x0 * cos - y0 * sin + c.x;
        var y = x0 * sin + y0 * cos + c.y;
        return new M.geo.Point(x, y);
    };

    M.geo.rotation = function(x, c, phi) {
        if (x instanceof M.geo.Rect) x = x.toPolygon();
        var type = getGeoType(x);

        switch (type) {
            case 'point':   return rotatePoint(x, c, phi);
            case 'line':    return new M.geo.Line(rotatePoint(x.p1, c, phi),
                                                  rotatePoint(x.p2, c, phi));
            case 'circle':  return new M.geo.Circle(rotatePoint(x.c, c, phi),  x.r);
            case 'polygon': return new M.geo.Polygon(x.points.map(function(p) {
                                                            return rotatePoint(p, c, phi); }));
        }
    };


    // ---------------------------------------------------------------------------------------------
    // Constructions

    // Calculates the angle bisector of the angle a, b, c.
    // The result is a line which goes through b
    M.geo.angleBisector = function(a, b, c) {
        var phiA =  Math.atan2(a.y - b.y, a.x - b.x);
        var phiC =  Math.atan2(c.y - b.y, c.x - b.x);
        var phi = (phiA + phiC) / 2;

        if (phiA > phiC) phi += Math.PI;

        var x = Math.cos(phi) + b.x;
        var y = Math.sin(phi) + b.y;
        return new M.geo.Point(x, y);
    };

    // Finds a perpendicular to the line l which goes through a point p.
    M.geo.perpendicular = function(l, p) {
        var dx, dy;

        // Special case: point is the first point of the line
        if (M.geo.same(p, l.p1)) {
            dx = l.p2.y - l.p1.y;
            dy = l.p1.x - l.p2.x;

        // Special case: point is the second point of the line
        } else if (M.geo.same(p === l.p2)) {
            dx = l.p1.y - l.p2.y;
            dy = l.p2.x - l.p1.x;

        // special case: point lies somewhere else on the line
        } else if (l.contains(p)) {
            dx = l.p1.y - p.y;
            dy = p.x - l.p1.x;

        // general case: point does not lie on the line
        } else {
            var b = M.geo.project(p, l);
            dx = b.x;
            dy = b.y;
        }

        return new M.geo.Line(new M.geo.Point(p.x, p.y), new M.geo.Point(p.x + dx, p.y + dy));
    };

    // TODO More Constructions


    // ---------------------------------------------------------------------------------------------
    // Computational Geometry

    M.geo.sortVertices = function() {
        // TODO
    };

    M.geo.convexHull = function() {
        // TODO
    };

    M.geo.travellingSalesman = function(dist) {
        var n = dist.length;
        var cities = M.list(n);

        var minLength = Infinity;
        var minPath = null;

        M.permutations(cities).each(function(path) {
            var length = 0;
            for (var i=0; i<n-1; ++i) {
                length += dist[path[i]][path[i+1]];
                if (length > minLength) return;
            }
            if (length < minLength) minLength = length;
            minPath = path;
        });

        return { path: minPath, length: minLength };
    };


    // ---------------------------------------------------------------------------------------------
    // Intersections and Overlaps

    var pointPointIntersect = function(p1, p2) {
        return M.geo.same(p1, p2) ? [new M.geo.Point(p1.x, p2.x)] : [];
    };

    var pointLineIntersect = function(p, l) {
        // TODO check that p lies on l
    };

    var pointRectIntersect = function(p, r) {
        // TODO
    };

    var pointCircleIntersect = function(p, c) {
        // TODO
    };

    var pointPolygonIntersect = function(p1, p2) {
        // TODO
    };

    var lineLineIntersect = function(l1, l2) {

        var d1 = [l1.p2.x - l1.p1.x, l1.p2.y - l1.p1.y];
        var d2 = [l2.p2.x - l2.p1.x, l2.p2.y - l2.p1.y];
        var d  = [l2.p1.x - l1.p1.x, l2.p1.y - l1.p1.y];

        var denominator = M.vector.cross2D(d2, d1);
        if (denominator === 0) return;  // -> colinear

        var n1 = M.vector.cross2D(d1, d);
        var n2 = M.vector.cross2D(d2, d);

        var x = n2 / denominator;
        var y = n1 / denominator;

        if (M.between(x,0,1) && M.between(y,0,1)) {
            var intersectionX = l1.p1.x + x * (l1.p2.x - l1.p1.x);
            var intersectionY = l1.p1.y + y * (l1.p2.y - l1.p1.y);
            return [intersectionX, intersectionY];
        }
    };

    var lineCircleIntersect = function(l, c) {
        // TODO
    };

    var linePolygonIntersect = function(l, c) {
        // TODO
    };

    var rectRectIntersect = function() {
        // TODO
    };

    var polygonPolygonIntersect = function() {
        // TODO
    };

    M.geo.intersect = function(x, y) {

        if (arguments.length > 2) {
            var rest = _arraySlice.call(arguments, 1);
            return M.geo.intersect(x, M.geo.intersect.apply(null, rest));
        }

        // Handle Rectangles
        if (x instanceof M.geo.Rect && y instanceof M.geo.Rect) return rectRectIntersect(x, y);
        if (x instanceof M.geo.Rect) x = x.toPolygon();
        if (y instanceof M.geo.Rect) y = y.toPolygon();

        switch (getGeoType(x) + '-' + getGeoType(y)) {
            case 'line-line':       return lineLineIntersect(x, y);
            case 'line-circle':     return lineCircleIntersect(x, y);
            case 'line-polygon':    return linePolygonIntersect(x, y);
            case 'circle-line':     return lineCircleIntersect(y, x);
            case 'polygon-line':    return linePolygonIntersect(y, x);
            case 'polygon-polygon': return polygonPolygonIntersect(x, y);
        }

        throw new Error('Can\'t intersect ' + getGeoType(x) + 's and ' + getGeoType(y) + '.');
    };

})();

(function() {

    var LOWER_CASE = 'abcdefghijklmnopqrstuvwxyz';
    var UPPER_CASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    var ENGLISH_FREQUENCY = {
        a: 0.08167, b: 0.01492, c: 0.02782, d: 0.04253, e: 0.12702, f: 0.02228, g: 0.02015,
        h: 0.06094, i: 0.06966, j: 0.00154, k: 0.00772, l: 0.04024, m: 0.02406, n: 0.06749,
        o: 0.07507, p: 0.01929, q: 0.00095, r: 0.05987, s: 0.06327, t: 0.09056, u: 0.02758,
        v: 0.00978, w: 0.02360, x: 0.00150, y: 0.01974, z: 0.00074
    };


    M.caesarCypher = function(msg, shift) {
        var cipher = '';

        for (var i = 0, len = msg.length; i < len; i++) {
            if (msg[i] >= 'a' && msg[i] <= 'z') {
                cipher = cipher + LOWER_CASE[(LOWER_CASE.indexOf(msg[i]) + shift) % 26];
            } else if (msg[i] >= 'A' && msg[i] <= 'Z') {
                cipher = cipher + UPPER_CASE[(UPPER_CASE.indexOf(msg[i]) + shift) % 26];
            } else {
                cipher = cipher + msg[i];
            }
        }

        return cipher;
    };


    // Apply Vigenere cipher shift to a string,
    M.vigenereCypher = function(msg, key) {

        var cipher = '';
        var shift = 0;
        var count = 0;  // Don't count spaces when iterating the key word
        var k = key.toLowerCase();

        for (var i = 0, len = msg.length, keyLen = k.length; i < len; i++) {
            // Grab shift for the current sequence of the key word
            shift = LOWER_CASE.indexOf(k[count % keyLen]);

            if (msg[i] >= 'a' && msg[i] <= 'z') {
                cipher = cipher + LOWER_CASE[(LOWER_CASE.indexOf(msg[i]) + shift) % 26];
                count++;
            }
            else if (msg[i] >= 'A' && msg[i] <= 'Z') {
                cipher = cipher + UPPER_CASE[(UPPER_CASE.indexOf(msg[i]) + shift) % 26];
                count++;
            }
            else {
                cipher = cipher + msg[i];
            }
        }

        return cipher;
    };


    // Returns the probability of a given letter in english
    M.letterFreqency = function(letter) {
        return ENGLISH_FREQUENCY[letter.toLowerCase()];
    };


    // Count Cipher letter frequency
    M.cipherLetterFreq = function(cipher) {
        var msg = cipher.toLowerCase();
        var freq = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

        for (var i = 0, len = msg.length; i < len; ++i) {
            if (msg[i] >= 'a' && msg[i] <= 'z') {
                freq[LOWER_CASE.indexOf(msg[i])]++;
            }
        }

        return freq;
    };

})();

(function() {


    // M.bisect(function(x){ return Math.cos(x/2); }, 10) => Pi
    M.bisect = function(fn, precision, l, h) {

        if (precision == null) precision = 3;
        var p = Math.pow(10, -precision);
        var q = Math.pow(10,  precision);

        if (!l) l = 0;
        var lf = fn(l);
        var ls = Math.sign(lf);
        if (ls === 0) return l;
        var hf, hs;

        if (h == null) {
            h = 0.5;
            do {
                h *= 2;
                hf = fn(h);
                hs = Math.sign(hf);
            } while (hs === ls);
            if (hs === 0) return h;
        }

        var x = 0;
        while (Math.abs(lf) > p && x < 200) {

            var c = (l + h) / 2;
            var cf = fn(c);
            var cs = Math.sign(cf);
            if (cs === 0) return c;

            if (cs === ls) {
                l = c;
                lf = cf;
            } else {
                h = c;
                hf = cf;
            }

            ++x;
        }

        return Math.round(l*q)*p;
    };


})();

(function() {

    // ---------------------------------------------------------------------------------------------
    // Configuration

    var prefixes = {
        da: { name: 'deca',  value: 1e1 },
        h:  { name: 'hecto', value: 1e2 },
        k:  { name: 'kilo',  value: 1e3 },
        M:  { name: 'mega',  value: 1e6 },
        G:  { name: 'giga',  value: 1e9 },
        T:  { name: 'tera',  value: 1e12 },
        P:  { name: 'peta',  value: 1e15 },
        E:  { name: 'exa',   value: 1e18 },
        Z:  { name: 'zetta', value: 1e21 },
        Y:  { name: 'yotta', value: 1e24 },

        d:  { name: 'deci',  value: 1e-1 },
        c:  { name: 'centi', value: 1e-2 },
        m:  { name: 'milli', value: 1e-3 },
        u:  { name: 'micro', value: 1e-6 },
        n:  { name: 'nano',  value: 1e-9 },
        p:  { name: 'pico',  value: 1e-12 },
        f:  { name: 'femto', value: 1e-15 },
        a:  { name: 'atto',  value: 1e-18 },
        z:  { name: 'zepto', value: 1e-21 },
        y:  { name: 'yocto', value: 1e-24 }
    };

    var baseUnits = {
        length: 'm',
        surface: 'm2',
        volume: 'm3',
        mass: 'kg',
        time: 's',
        angle: 'rad',
        current: 'a',
        temperature: 'K',
        substance: 'mol',
        force: 'N',
        bit: 'b'
    };

    var units = {

        // Length
        m:  { name: 'meter',    type: 'length', value: 1 },
        in: { name: 'inch',     type: 'length', value: 0.0254 },
        ft: { name: 'foot',     type: 'length', value: 0.3048 },
        yd: { name: 'yard',     type: 'length', value: 0.9144 },
        mi: { name: 'mile',     type: 'length', value: 1609.344 },
        AA: { name: 'angstrom', type: 'length', value: 1e-10 },

        // Surface
        m2:    { name: 'm2',    type: 'surface', power: 2, value: 1 },
        sqin:  { name: 'sqin',  type: 'surface', power: 2, value: 0.00064516 },
        sqft:  { name: 'sqft',  type: 'surface', power: 2, value: 0.09290304 },
        sqyd:  { name: 'sqyd',  type: 'surface', power: 2, value: 0.83612736 },
        sqmi:  { name: 'sqmi',  type: 'surface', power: 2, value: 2589988.110336 },

        // Volume
        m3:     { name: 'm3',     type: 'volume', value: 1 },
        l:      { name: 'litre',  type: 'volume', value: 0.001 },
        cup:    { name: 'cup',    type: 'volume', value: 0.0002365882 },
        pint:   { name: 'pint',   type: 'volume', value: 0.0004731765 },
        quart:  { name: 'quart',  type: 'volume', value: 0.0009463529 },
        gallon: { name: 'gallon', type: 'volume', value: 0.003785412},
        barrel: { name: 'barrel', type: 'volume', value: 0.1589873 },

        // Mass
        g:   { name: 'gram',  type: 'mass', value: 0.001 },
        ton: { name: 'ton',   type: 'mass', value: 907.18474 },
        oz:  { name: 'ounce', type: 'mass', value: 28.349523125e-3 },
        lbm: { name: 'pound', type: 'mass', value: 453.59237e-3 },

        // Time
        s:   { name: 'second', type: 'time', value: 1 },
        min: { name: 'minute', type: 'time', value: 60 },
        h:   { name: 'hour',   type: 'time', value: 3600 },
        d:   { name: 'day',    type: 'time', value: 86400 },
        w:   { name: 'week',   type: 'time', value: 604800 },
        mon: { name: 'month',  type: 'time', value: 2629740 },
        y:   { name: 'year',   type: 'time', value: 31556900 },

        // Angle
        rad:  { name: 'rad',   type: 'angle', value: 1 },
        deg:  { name: 'deg',   type: 'angle', value: 0.017453292519943295769236907684888 },
        grad: { name: 'grad',  type: 'angle', value: 0.015707963267948966192313216916399 },
        cyc:  { name: 'cycle', type: 'angle', value: 6.2831853071795864769252867665793 },

        // Electric Current
        A: {name: 'ampere', type: 'current', value: 1 },

        // Temperature
        K:    { name: 'kelvin',     type: 'temperature', value: 1 },
        degC: { name: 'celsius',    type: 'temperature', value: 1, offset: 273.15 },
        degF: { name: 'fahrenheit', type: 'temperature', value: 1/1.8, offset: 459.67 },

        // Amount of Substance
        mol: { name: 'mole', type: 'substance', value: 1 },

        // Force
        N:   { name: 'newton',     type: 'force', value: 1 },
        lbf: { name: 'poundforce', type: 'force', value: 4.4482216152605 },

        // Binary
        b: {name: 'bits',  type: 'data', value: 1 },
        B: {name: 'bytes', type: 'data', value: 8 }
    };


    // ---------------------------------------------------------------------------------------------
    // Create Regex

    M.unit = {};

    var prefixRegexp = M.object.keys(prefixes).join('|');
    var unitRegexp = M.object.keys(units).join('|');
    var regexp = new RegExp('^(' + prefixRegexp + ')?(' + unitRegexp + ')$');

    M.unit.to = function(val, from, to) {

        var f = from.match(regexp);
        var prefix = f[1];
        var unit = f[2];

        var prefixValue = prefix ? (prefixes[prefix].value || 0) : 1;
        var unitValue = units[unit].value || 1;
        var unitOffset = units[unit].offset || 0;

        var newVal = (val * unitValue + unitOffset) * prefixValue;
        if (to == null) return newVal;

        f = to.match(regexp);
        prefix = f[1];
        unit = f[2];

        prefixValue = prefix ? (prefixes[prefix].value || 0) : 1;
        unitValue = units[unit].value || 1;
        unitOffset = units[unit].offset || 0;

        return (newVal / prefixValue - unitOffset) / unitValue;
    };

    // ---------------------------------------------------------------------------------------------

    M.unit.define = function(unit) {
        unit = unit.match(regexp);
        var prefix = unit[1] ? prefixes[unit[1]].name : '';
        var name = units[unit[2]].name;
        return prefix + name;
    };

})();

(function() {

    // TODO fix parser errors + test
    // TODO + and * with multiple arguments
    // TODO Simplify expressions
    // TODO More error messages: 1(1), "str"(10), %(x)

    // ---------------------------------------------------------------------------------------------
    // Expression Parser

    var brackets = { '(': ')', '[': ']', '{': '}', '|': '|' };

    function bracketsMatch(a, b) {
        return brackets[a] === b || brackets[b] === a;
    }

    function ExpressionParser() {
        this.current = '';
        this.result = [];

        this.currentParser = null;
        this.currentBracket = null;
        this.currentFn = null;
    }

    // Pushes a new letter to the expression parser
    ExpressionParser.prototype.send = function(x) {

        // Handle Strings
        if (this.currentBracket === '"' && x !== '"') {
            this.current += x;

        // Closing Strings
    } else if (!this.currentBracket && x === '"') {
            this.pushCurrent();
            this.currentBracket = '"';

        // Opening Strings
    } else if (this.currentBracket === '"' && x === '"') {
            this.result.push(new Expression('"', [this.current]));

        // Handle Invalid Characters
        } else if (('@&\\?<>=~`±§').contains(x)) {
            throw new Error('Unexpected "' + x + '".');

        // Handle Content for CHild parsers
        } else if (this.currentParser) {

            if ((')]}|').contains(x) && this.currentParser.isReady()) {

                if (!bracketsMatch(x,this.currentBracket))
                    throw new Error('Unexpected "' + x + '".');

                var completed = this.currentParser.complete();
                if (this.currentFn) {
                    this.result.push(new ExpressionFn(this.currentFn, completed));
                } else if (x === ']') {
                    this.result.push(new ExpressionFn('[]', completed));
                } else if (x === '|') {
                    this.result.push(new ExpressionFn('abs', completed));
                } else {
                    if (completed.length !== 1) throw new Error('Unexpected ",".');
                    this.result.push(new ExpressionVal(completed[0]));
                }
                this.current = '';
                this.currentBracket = this.currentParser = this.currentFn = null;

            } else {
                this.currentParser.send(x);
            }

        // Handle Open Brackets
        } else if (('([{|').contains(x)) {
            if (x === '(' && isNaN(+this.current) && !('+-*/!^%,').contains(this.current)) {
                this.currentFn = this.current;
                this.current = '';
            } else {
                this.pushCurrent();
            }
            this.currentParser = new ExpressionParser();
            this.currentBracket = x;

        } else if (('+-*/!^%,').contains(x)) {
            this.pushCurrent();
            if (x !== ',') this.result.push(x);

        } else if (x.match(/\s\n\t/)) {
            this.pushCurrent();

        } else {
            this.current += x.trim();
        }
    };

    ExpressionParser.prototype.isReady = function() {
        return this.currentParser == null;
    };

    // Adds a new letter, number or expression to the results object
    ExpressionParser.prototype.pushCurrent = function() {
        if (!this.current) return;
        var num = +this.current;
        this.result.push(new ExpressionVal(num === num ? num : this.current));
        this.current = '';
    };

    // Completes the expression and returns a new expression
    ExpressionParser.prototype.complete = function(x) {

        this.pushCurrent();
        var i;

        // Handle Factorials and Percentages
        for (i=0; i<this.result.length; ++i) {
            if (this.result[i] === '!') {
                this.result.splice(i-1, 2, new ExpressionFn('!', [this.result[i-1]]));
                i -= 1;
            } else if (this.result[i] === '%') {
                this.result.splice(i-1, 2, new ExpressionFn('/', [this.result[i-1], 100]));
                i -= 1;
            }
        }

        // Handle Powers
        for (i=0; i<this.result.length; ++i) {
            if (this.result[i] === '^') {
                this.result.splice(i-1, 3, new ExpressionFn('^', [this.result[i-1], this.result[i+1]]));
                i -= 2;
            }
        }

        // Handle Leading -
        if (this.result[0] === '-') this.result.splice(0, 2, new ExpressionFn('-', [this.result[1]]));

        // Handle Multiplication and Division
        for (i=0; i<this.result.length; ++i) {
            if (this.result[i] === '/') {
                this.result.splice(i-1, 3, new ExpressionFn('/', [this.result[i-1], this.result[i+1]]));
                i -= 2;
            } else if (this.result[i] === '*') {
                this.result.splice(i-1, 3, new ExpressionFn('*', [this.result[i-1], this.result[i+1]]));
                i -= 2;
            }
        }

        // Handle Addition and Subtraction
        for (i=0; i<this.result.length; ++i) {
            if (this.result[i] === '-') {
                this.result.splice(i-1, 3, new ExpressionFn('-', [this.result[i-1], this.result[i+1]]));
                i -= 2;
            } else if (this.result[i] === '+') {
                this.result.splice(i-1, 3, new ExpressionFn('+', [this.result[i-1], this.result[i+1]]));
                i -= 2;
            }
        }

        return this.result;
    };


    // ---------------------------------------------------------------------------------------------
    // Expressions

    function ExpressionFn(fn, args) {
        this.fn = fn;
        this.args = args;
    }

    ExpressionFn.prototype.simplify = function() {
        // TODO !!!
        return this;
    };

    ExpressionFn.prototype.toString = function() {
        var newArgs = [];
        for (var i=0; i<this.args.length; ++i) newArgs.push(this.args[i].toString());

        var fn = strings[this.fn];
        return fn ? fn.apply(null, newArgs) : this.fn + '(' + this.args.join(', ') + ')';
    };

    ExpressionFn.prototype.evaluate = function(vars) {
        if (vars == null) vars = {};

        var newArgs = [];
        for (var i=0; i<this.args.length; ++i) {
            var newArg = this.args[i].evaluate();
            if (newArg instanceof Expression) return this;
            newArgs.push(newArg);
        }

        var fn = vars[this.fn] || functions[this.fn] || Math[this.fn] || M[this.fn];
        return (fn instanceof Function) ? fn.apply(null, newArgs) : this;
    };


    function ExpressionVal(val) {
        this.val = val;
    }

    ExpressionVal.prototype.simplify = function() {
        return this;
    };

    ExpressionVal.prototype.toString = function() {
        return this.val.toString();
    };

    ExpressionVal.prototype.evaluate = function(vars) {
        if (vars == null) vars = {};
        // TODO return numbers if possible?
        return (vars[this.val] === undefined) ? this.val : vars[this.val];
    };


    // ---------------------------------------------------------------------------------------------
    // Expression Functions

    var functions = {
        '+': function(a, b) { return a + b; },
        '-': function(a, b) { return (b === undefined) ? -a : a - b; },
        '*': function(a, b) { return a * b; },
        '/': function(a, b) { return a / b; },
        '!': function(n) { return M.factorial(n); },
        '^': function(a, b) { return Math.pow(a, b); },
        '[]': function() { return arguments; },
        '"': function(str) { return '' + str; },
        'mod': function(a, b) { return M.mod(a, b); }
    };

    var strings = {
        '+': function() { return M.toArray(arguments).join(' + '); },
        '-': function(a, b) { return (b === undefined) ? '-' + a : a + ' - ' + b; },
        '*': function() { return M.toArray(arguments).join(' * '); },
        '/': function(a, b) { return a + ' / ' + b; },
        '!': function(n) { return n + '!'; },
        '^': function(a, b) { return a + ' ^ ' + b; },
        '[]': function() { return '[' + M.toArray(arguments).join(', ') + ']'; },
        '"': function(str) { return '"' + str + '"'; },
        'mod': function(a, b) { return a + ' mod ' + b; }
    };


    // ---------------------------------------------------------------------------------------------
    // Public Interface

    M.expression = {};

    M.expression.parse = function(str) {

        var parser = new ExpressionParser();

        var n = str.length;
        for (var i=0; i<n; ++i) parser.send(str[i]);

        return parser.complete()[0].simplify();
    };

})();


})();