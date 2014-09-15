// Fermat Mathematics Tools
// (c) 2014, Mathigon / Philipp Legner
// MIT License (https://github.com/Mathigon/fermat.js/blob/master/LICENSE)

 (function() {
if (typeof M !== 'object' || !M.tesla) throw new Error('fermat.js requires tesla.js.');
M.fermat = true;

// Epsilon/tolerance value used by default
var EPS = 0.000001;

M.setPrecision = function(eps) {
    EPS = eps || 0.000001;
};

var _arrayJoin = Array.prototype.join;
var _arrayPush = Array.prototype.push;

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
;(function() {

    // ---------------------------------------------------------------------------------------------
    // Array Generatora

    function tabulateWith(fn, vals, args) {
        var result = [], i;
        if (args.length === 1) {
            for (i=0; i<args[0]; ++i) result.push( fn.apply(null, vals.concat([i])) );
        } else {
            var newArgs = Array.prototype.slice.call(args, 0);
            var myX = newArgs.pop();
            for (i=0; i<myX; ++i) result.push( tabulateWith(fn, vals.concat([i]), newArgs ) );
        }
        return result;
    }

    M.tabulate = function(fn, x, y, z) {
        var indices = [];
        _arrayPush.apply(indices, arguments);
        indices.shift();
        return tabulateWith(fn, [], indices);
    };

    M.list = function(a, b, step) {
        if (!step) step = 1;
        var arr = [], i;

        if (b == null && a >= 0) {
            for (i=0; i<a; i += step) arr.push(i);
        } else if (b == null) {
            for (i=0; i>a; i -= step) arr.push(i);
        } else if (a <= b) {
            for (i=a; i<=b; i += step) arr.push(i);
        } else {
            for (i=a; i>=b; i -= step) arr.push(i);
        }

        return arr;
    };


    // ---------------------------------------------------------------------------------------------
    // Simple Array Functions

    // Finds the smallest and the largest value in the arra a
    M.range = function(a) {
        return [M.min(a), M.max(a)];
    };

    // Removes any null or undefined values in array a
    M.clean = function(a) {
        var b = [], n = a.length;
        for (var i = 0; i < n; ++i)
            if (a[i] != null) b.push(a[i]);
        return b;
    };

    // Removes duplicates in an array a
    M.unique = function(a) {
        var b = [], n = a.length;
        for (var i = 0; i < n; ++i)
            if (b.indexOf(a[i]) === -1) b.push(a[i]);
        return b;
    };

    // Removes all occurrences of x from the array a
    M.without = function(a, x) {
        var b = [], n = a.length;
        for (var i = 0; i < n; ++i)
            if (a[i] !== x) b.push(a[i]);
        return b;
    };

    // Breaks an array a into chunks of size at most n
    M.chunk = function(a, n) {
        var chunks = [];
        var lastChunk = [];
        var count = 0, l = a.length;

        for (var i = 0; i < l; ++i) {
            lastChunk.push(a[i]);
            ++count;
            if (count >= n) {
                chunks.push(lastChunk);
                lastChunk = [];
                count = 0;
            }
        }

        if (lastChunk.length) chunks.push(lastChunk);
        return chunks;
    };

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

    // Rotates the elements of an array by offset
    M.arrayRotate = function(a, offset) {
        var n = a.length;
        offset = ((offset % n) + n) % n; // offset could initially be negative...
        var start = a.slice(0, offset);
        var end = a.slice(offset);
        _arrayPush.apply(end, start);
        return end;
    };

})();
;(function() {

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

    // Returns the decimal digits of a number
    // decimalDigits(3.456) = [4, 5, 6]
    M.decimalDigits= function(n) {
        var str = '' + Math.abs(n - Math.floor(n));
        return toNumberArray(str.split(''));
    };

    // Returns the number of digits after the decimal place
    M.decimalPlaces = function(n) {
        var str = '' + Math.abs(n);
        str = str.split('.');
        return str.length === 1 ? 0 : str[1].length;
    };

    M.roundTowardsZero = function(x) {
        // Add 0.0001 because of floating points uncertainty
        return x < 0 ? Math.ceil(x - 0.0001) : Math.floor(x + 0.0001);
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

    M.toFixed = function(n, precision) {
        var fixed = n.toFixed(precision);
        return M.nearlyEquals(n, +fixed) ? fixed : '~ ' + fixed;
    };

    // Returns a [numerator, denominator] array rational representation of `decimal`
    // See http://en.wikipedia.org/wiki/Continued_fraction for implementation details
    // toFraction(4/8) => [1, 2]
    // toFraction(0.66) => [33, 50]
    // toFraction(0.66, 0.01) => [2/3]
    M.toFraction = function(decimal, maxDenominator) {
        maxDenominator = maxDenominator || 1000;

        var n = [1, 0], d = [0, 1];
        var a = Math.floor(decimal);
        var rem = decimal - a;

        while (d[0] <= maxDenominator) {
            if (M.nearlyEquals(n[0] / d[0], decimal)) return [n[0], d[0]];
            n = [a*n[0] + n[1], n[0]];
            d = [a*d[0] + d[1], d[0]];
            a = Math.floor(1 / rem);
            rem = 1/rem - a;
        }

        // Failed to find a nice rational representation so return an irrational "fraction"
        return [decimal, 1];
    };


    // ---------------------------------------------------------------------------------------------
    // Special Functions

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
;(function() {

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
            if (n % f === 0) return concatArray(fact(f), fact(n / f));
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
;(function() {

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
            var a2 = subsets[i].clone();
            a2.push(last);
            result.push(subsets[i], a2);
        }
        return result;
    }

    // Returns all subsets of arr (of given length)
    M.subsets = function (arr, length) {
        var myArr = arr.clone();
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
;(function() {

    M.random = {};

    M.random.integer = function(a, b) {
        return Math.floor(a + (b == null ? 1 : b-a+1) * Math.random());
    };

    /*
    TODO
    // Get an array of unique random numbers between min and max
    randRangeUnique: function(min, max, count) {
        if (count == null) {
            return KhanUtil.randRange(min, max);
        } else {
            var toReturn = [];
            for (var i = min; i <= max; i++) {
                toReturn.push(i);
            }

            return KhanUtil.shuffle(toReturn, count);
        }
    },

    // Get a random integer between min and max with a perc chance of hitting
    // target (which is assumed to be in the range, but it doesn't have to be).
    randRangeWeighted: function(min, max, target, perc) {
        if (KhanUtil.random() < perc || (target === min && target === max)) {
            return target;
        } else {
            return KhanUtil.randRangeExclude(min, max, [target]);
        }
    }
    */

    M.random.integerArray = function(n) {
        var a = [];
        for (var i=0; i<n; ++i) a.push(i);
        return a.shuffle();
    };

    // =============================================================================================

    M.random.bernoulli = function(p) {
        p = Math.max(0,Math.min(1,p));
        return (Math.random() < p ? 1 : 0);
    };

    M.random.binomial = function(n,p) {
        var t = 0;
        for (var i=0; i<n; ++i) t += M.random.bernoulli(p);
        return t;
    };

    M.random.poisson = function(l) {
        if (l <= 0) return 0;
        var L = Math.exp(-l), p = 1;
        for (var k = 0; p > L; ++k) p = p * Math.random();
        return k-1;
    };

    // =============================================================================================

    M.random.uniform = function(a, b) {
        return a + (b-a) * Math.random();
    };

    M.random.normal = function() {
        var u1 = Math.random();
        var u2 = Math.random();
        return Math.sqrt( -2 * Math.log(u1) ) * Math.cos( 2 * Math.PI * u2 );
    };

    M.random.exponential = function(l) {
        if (l <= 0) return 0;
        return -Math.log(Math.random()) / l;
    };

    M.random.geometric = function(p) {
        if (p <= 0 || p > 0) return null;
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

    M.normalPDF = function(mean, stddev, x) {
        return (1 / Math.sqrt(2 * Math.PI * stddev * stddev)) *
            Math.exp(-((x - mean) * (x - mean)) / (2 * stddev * stddev));
    };

})();
;(function() {

    M.mean = M.average = function(a) {
        return a.length ? M.total(a) / a.length : 0;

    };

    M.median = function(values) {
        var n = values.length;
        if (!n) return 0;

        var sorted = values.slice(0).sort();
        return (len % 2 === 1) ? sorted[Math.floor(n/2)] : (sorted[n/2 - 1] + sorted[n/2]) / 2;
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
;(function() {


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

    M.complex.sub = function(c1, c2) {
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
;(function() {

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
            for (var i = 0; i < n; ++i) a.push(a[i]/total);
            return M.Vector(a);
        },

        toString: function() {
            return '(' + Array.join.call(this, ', ') + ')';
        }

    }, true);


    // ---------------------------------------------------------------------------------------------


    M.vector = {};

    M.vector.add = function(v1, v2) {
        var n = Math.max(v1.length, v2.length);
        var a = [];
        for (var i=0; i<n; ++i) a.push(v1[i] + v2[i]);
        return M.Vector(a);
    };

    M.vector.subt = function(v1, v2) {
        var n = Math.max(v1.length, v2.length);
        var a = [];
        for (var i=0; i<n; ++i) a.push(v1[i] - v2[i]);
        return M.Vector(a);
    };

    M.vector.dot = function(v1, v2) {
        var n = Math.max(v1.length, v2.length);
        var d = 0;
        for (var i=0; i<n; ++i) d += (v1[i] || 0) * (v2[i] || 0);
        return d;
    };

    M.vector.mult = function(v1, v2) {
        // TODO
    };

    M.vector.cross2D = function(x, y) {
        return x[0] * y[1] - x[1] * y[0];
    };

    M.vector.cross = function(v1, v2) {
        return M.Vector([v1[1] * v2[2] - v1[2] * v2[1],
                         v1[2] * v2[0] - v1[0] * v2[2],
                         v1[0] * v2[1] - v1[1] * v2[0]]);
    };

    M.vector.angle = function(a, b) {
        // TODO
    };

    M.vector.project = function(a, b) {
        // TODO
    };


})();
;(function() {

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

        for (var col = 0; col < cols; ++col) {
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
    M.matrix.identity = function(n) {
        var x = new M.Matrix(n, m, 0);
        for (var i = 0; i < Math.min(n, m); ++i) x[i][i] = 1;
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
;(function() {

    M.geo = {};

    // TODO  M.geo.Curve class (length, area)
    // circle-circle and circle-polygon intersections


    // ---------------------------------------------------------------------------------------------
    // Types

    M.geo.Point = function(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    };

    // Defines a line that goes through two M.Points p1 and p2
    M.geo.Line = function(p1, p2) {
        this.p1 = p1;
        this.p2 = p2;
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
        var a = new M.geo.Point(this.x,     this.y);
        var b = new M.geo.Point(this.x + w, this.y);
        var c = new M.geo.Point(this.x + w, this.y + h);
        var d = new M.geo.Point(this.x,     this.y + h);
        return new M.geo.Polygon([a, b, c, d]);
    };

    M.geo.isParallel = function(l1, l2) {
        var x1 = l1.p2.x - l1.p1.x;
        var y1 = l1.p2.y - l1.p1.y;
        var x2 = l2.p2.x - l2.p1.x;
        var y2 = l2.p2.y - l2.p1.y;

        return (x1 === 0 && x2 === 0) || (y1 === 0 && y2 === 0) || M.nearlyEquals(y1/x1, y2/x2);
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

    M.geo.Circle.prototype.circumference = function() {
        return 2 * Math.PI * this.r;
    };

    M.geo.Rect.prototype.circumference = function() {
        return 2 * w + 2 * h;
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

    var signedTriangleArea = function(a, b, c) {
        return ((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)) / 2;
    };

    // Polygon has to be non-intersecting
    M.geo.Polygon.prototype.area = function() {
        var A = 0, p = this.points, n = p.length;
        for (var i = 1; i < n; ++i) A += p[i - 1].x * p[i].y - p[i].x * p[i - 1].y;
        A += p[0].x * p[n - 1].y - p[n - 1].x * p[0].y;
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

    // Finds the reflection of a point p in a line l
    var reflectPoint = function(p, l) {
        var v = l.p2.x - l.p1.x;
        var w = l.p2.y - l.p1.y;

        var x0 = p.x - p1.x;
        var y0 = p.y - p1.y;

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
        /*var x, y, c, z;

        // Special case: point is the first point of the line
        if (M.geo.same(p === l.p1)) {
            x = a.x + b.y - a.y;
            y = a.y - b.x + a.x;
            z = A[0] * B[0];

            if (Math.abs(z) < EPS) {
                x =  B[2];
                y = -B[1];
            }
            c = [z, x, y];

        // Special case: point is the second point of the line
        } else if (M.geo.same(p === l.p2)) {
            x = B[1] + A[2] - B[2];
            y = B[2] - A[1] + B[1];
            z = A[0] * B[0];

            if (Math.abs(z) < Mat.eps) {
                x =  A[2];
                y = -A[1];
            }
            c = [z, x, y];

        // special case: point lies somewhere else on the line
        } else if (Math.abs(Mat.innerProduct(C, line.stdform, 3)) < EPS) {
            x = C[1] + B[2] - C[2];
            y = C[2] - B[1] + C[1];
            z = B[0];

            if (Math.abs(z) < Mat.eps) {
                x =  B[2];
                y = -B[1];
            }

            if (Math.abs(z) > EPS && Math.abs(x - C[1]) < EPS && Math.abs(y - C[2]) < EPS) {
                x = C[1] + A[2] - C[2];
                y = C[2] - A[1] + C[1];
            }
            c = [z, x, y];

        // general case: point does not lie on the line
        // -> calculate the foot of the dropped perpendicular
        } else {
            c = [0, line.stdform[1], line.stdform[2]];
            c = Mat.crossProduct(c, C);                  // perpendicuar to line
            c = Mat.crossProduct(c, line.stdform);       // intersection of line and perpendicular
        }

        return [new Coords(Type.COORDS_BY_USER, c, board), change];*/
    };

    // Returns the circumcenter of the circumcircle two three points a, b and c
    M.geo.circumcenter = function(a, b, c) {
        // TODO
    };


    // ---------------------------------------------------------------------------------------------
    // Computational Geometry

    M.geo.sortVertices = function() {
        // TODO
    };

    M.geo.convexHull = function() {
        // TODO
    };

    M.geo.travellingSalesman = function() {
        // TODO
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

    };

    var pointCircleIntersect = function(p, c) {

    };

    var pointPolygonIntersect = function(p1, p2) {

    };

    var lineLineIntersect = function(l1, l2) {

        /* TODO
        var da = M.vector.diff(a2, a1);
        var db = M.vector.diff(b2, b1);
        var ab = M.vector.diff(a1, b1);

        var denominator = M.vector.cross(db, da);
        if (denominator === 0) return;  // -> colinear

        var numeratorA = db[1] * ab[0] - db[0] * ab[1];
        var numeratorB = da[1] * ab[0] - da[0] * ab[1];

        var A = numeratorA / denominator;
        var B = numeratorB / denominator;

        if (M.bound(A,0,1) && M.bound(B,0,1)) {
            var intersectionX = a1[0] + A * (a2[0] - a1[0]);
            var intersectionY = a1[1] + B * (a2[1] - a1[1]);
            return [intersectionX, intersectionY];
        }
        */
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
            return lcm(x, M.geo.intersect.apply(null, rest));
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

        throw new Error('Can\'t intersect ' + typeX + 's and ' + typeY + '.');
    };


    // ---------------------------------------------------------------------------------------------
    // Projections

    M.geo.projectPointOnLine = function() {
        // TODO
    };

    M.geo.projectLineOnLine = function() {
        // TODO
    };

    // TODO More Projections Functions

})();
;(function() {



})();
;(function() {

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
;(function() {


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
;(function() {



})();


})();