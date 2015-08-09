// =============================================================================
// Fermat.js | Bignum Library
// *** EXPERIMENTAL ***
// (c) 2015 Mathigon
// =============================================================================



/*

const BASE = 12;
const POWER = Math.pow(2,BASE);
const LETTERS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQUSTUVWXYZ";

function changeBase(number, targetBase, originalBase) {

    if (number == 0) return [];
    if (!originalBase) originalBase = 10;

    var result = [];
    while (number.length > 0) {
        var remainingToConvert = [], resultDigit = 0;
        for (var position = number.length-1; position >= 0; --position) {
            var idx = number[position];
            var currentValue = idx + resultDigit * originalBase;
            var remainDigit = Math.floor(currentValue / targetBase);
            resultDigit = currentValue % targetBase;
            if (remainingToConvert.length || remainDigit) {
                remainingToConvert.unshift(remainDigit);
            }
        }
        number = remainingToConvert;
        result.push(resultDigit);
    }

    return result;
}

// Gets the length of an array without trailing 0 elements
function arrayPaddedLength(a) {
    var trailingZeros = 0;
    var length = a.length;
    for (var i=length-1; i>= 0; --i) {
        if (a[i] === 0) {
            ++trailingZeros;
        } else {
            return length - trailingZeros;
        }
    }
    return 0;
}

function typedArrayConcat(a1, a2) {
    var x = new Uint16Array(a1.length + a2.length);
    x.set(a1);
    x.set(a2, a1.length);
    return x;
}

var ZEROS = [];
(function() { for (var i=0; i<100; ++i) ZEROS.push(0); })();

function zeroArray(length) {
    return ZEROS.slice(0, length);
}


// -----------------------------------------------------------------------------
// INTEGERS

function Integer(n, base) {

    if (!Array.isArray(n)) {
        if (!base) base = 10;
        if (typeof n == 'number') n = n.toString(base);
        n = n.split('').reverse().map(function(x) { return LETTERS.indexOf(x); });
        n = changeBase(n, POWER, base);
    }

    n.xlength = arrayPaddedLength(n);
    return n;
}

IntegerToString = function(n, base) {
    if (!n.xlength) return '0';
    if (!base) base = 10;
    return changeBase(n, base, POWER).reverse().join('');
}

IntegerValueOf = function(n, base) {
    return +IntegerToString(n, base);
}

IntegerIsUnit = function(n) {
    return n.xlength == 1 && n[0] == 1;
}

IntegerIsZero = function(n) {
    return n.xlength == 0;
}

IntegerToDecimal = function(n) {
    // TODO
}

// -----------------------------------------------------------------------------

function IntegerEqual(a, b) {

    if (a.xlength !== b.xlength) return false;

    for (var i=0; i<a.xlength; ++i) {
        if (a[i] !== b[i]) return false;
    }

    return true;
}

function IntegerLess(a, b) {

    if (a.xlength < b.xlength) return true;

    for (var i = a.xlength-1; i >= 0; --i) {
        if (a[i] < b[i]) return true;
        if (a[i] > b[i]) return false;
    }

    return false;
}

function IntegerLessOrEqual(a, b) {
    return IntegerEqual(a, b) || IntegerLess(a, b);
}

function IntegerGreater(a, b) {

    if (a.xlength > b.xlength) return true;
    if (a.xlength < b.xlength) return false;

    for (var i = a.xlength-1; i >= 0; --i) {
        if (a[i] > b[i]) return true;
        if (a[i] < b[i]) return false;
    }

    return false;
}

function IntegerGreaterOrEqual(a, b) {
    return IntegerEqual(a, b) || IntegerGreater(a, b);
}

// -----------------------------------------------------------------------------

// The decimal part of decimals is internally stored as an integer.
// When adding two decimal parts, digits need to be carried in reverse order

function IntegerAdd(a, b) {

    var l = Math.max(a.xlength, b.xlength);
    var result = new Array(l+1);
    var sum, carry = 0;

    for (var i=0; i<l; ++i) {
        sum = (a[i] || 0) + (b[i] || 0) + carry;
        carry = sum >> BASE;
        result[i] = sum % POWER;
    }

    result[l] = carry;
    return Integer(result);
}


function DecimalPartAdd(a, b) {

    var l = Math.max(a.xlength, b.xlength);
    var result = new Array(l);
    var sum, t, carry = 0;

    for (var i=l-1; i>=0; --i) {
        sum = (a[i] || 0) + (b[i] || 0) + carry;
        carry = sum >> BASE;
        result[i] = sum % POWER;
    }

    return [carry, Integer(result)];
}


function IntegerSubtract(a, b) {

    var al = a.xlength;
    var bl = b.xlength;

    if (IntegerLess(a, b)) {
        var tmp = a;
        a = b;
        b = tmp;
    }

    var l = Math.max(al, bl)
    var result = new Array(l+1);
    var diff, carry = 0;

    for (var i=0; i<l; ++i) {
        diff = (a[i] || 0) - (b[i] || 0) - carry;
        carry = (diff < -POWER) ? 2 : (diff < 0) ? 1 : 0;
        result[i] = diff + carry * POWER;
    }

    result[l] = carry;
    return Integer(result);
}

function addTo(result, i, add) {
    var sum = result[i] + add;
    result[i] = sum % POWER;
    var carry = sum >> BASE;
    if (carry) addTo(result, i+1, carry);
}

function IntegerMultiply(a, b) {

    var al = a.xlength;
    var bl = b.xlength;
    var result = zeroArray(al+bl);
    var carry, prod;

    for (var i=0; i<al; ++i) {
        for (var j=0; j<bl; ++j) {
            prod = a[i] * b[j];
            addTo(result, i+j, prod);
        }
    }

    return Integer(result);
}

function IntegerMultiply_new(a, b) {

    var al = a.xlength;
    var bl = b.xlength;
    var result;

    if (al == 0 || bl == 0) {
        return Integer(0);
    }

    if (a.xlength == 1 && b.xlength == 1) {
        var prod = a[0] * b[0];
        return Integer(new Array(prod % POWER, prod >> BASE));
    }

    var l = Math.ceil(Math.max(al, bl)/2);

    var a1 = Integer( a.slice(0,l) );
    var a2 = Integer( a.slice(l) );
    var b1 = Integer( b.slice(0,l) );
    var b2 = Integer( b.slice(l) );

    var z0 = IntegerMultiply_new(a1, b1);
    var z1 = IntegerMultiply_new(IntegerAdd(a1, a2), IntegerAdd(b1, b2));
    var z2 = IntegerMultiply_new(a2, b2);
    var z3 = IntegerSubtract(IntegerSubtract(z1,z2), z0);

    var result = new Array(2*l + z2.length);

    for (var i=0; i<z1.xlength; ++i) result[i] = z1[i];
    for (var i=0; i<z3.xlength; ++i) result[l+i] += z3[i];
    for (var i=0; i<z2.xlength; ++i) result[2*l+i] += z2[i];

    return Integer(result);
}

// Returns [quotient, remainer]
function IntegerDivideHelper(a, b) {

    if (IntegerGreater(b,a)) return [0, b];

    var bx = Integer(b);
    var by = Integer(0);
    var c = 0;

    // TODO This can be made a lot more efficient

    while (IntegerGreaterOrEqual(a, bx)) {
        by = bx;
        bx = IntegerAdd(bx, b);
        ++c;
    }

    return [c, IntegerSubtract(a, by)]
}

// Returns [ (Integer) Math.floor(a/b), (Number) a%b ]
function IntegerDivide(a, b) {

    if (IntegerLess(a, b))  return [Integer(0), b];
    if (IntegerEqual(a, b)) return [Integer(1), Integer(0)];
    if (IntegerIsZero(b)) return [Infinity, null];

    var resultLength = a.xlength - b.xlength + 1;
    var result = new Array(resultLength);
    var a1 = a;

    for (var i=resultLength-1; i>=0; --i) {

        var subA = Integer(a1.slice(i));
        var tmp = IntegerDivideHelper(subA, b);

        result[i] = tmp[0];
        a1 = Integer([].concat.apply(a1.slice(0,i), tmp[1]));
    }

    return [Integer(result), a1];
}

function IntegerModulus(a,b) {
    return IntegerDivide(a,b)[1];
}

// -----------------------------------------------------------------------------

function IntegerFactorial(n) {
    if (IntegerIsUnit(n) || IntegerIsZero(n)) return Integer(1);
    return IntegerMultiply(n, IntegerFactorial( IntegerSubtract(n, Integer(1)) ));
}

function IntegerSqrt(n) {
    // TODO
}

function IntegerPower(n, a) {
    // TODO
}

function IntegerLCM(n) {
    // TODO
}

function IntegerGCD(n) {
    // TODO
}


// -----------------------------------------------------------------------------
// DECIMALS

function Decimal(i, d, base) {

    if (!base) base = 10;

    if (i instanceof Integer) {
        this._i = i;
    } else {
        if (typeof i == 'number') i = i.toString(base);
        i = i.split('').reverse().map(function(x) { return LETTERS.indexOf(x); });
        this._i = new Integer(new Uint16Array(changeBase(i, POWER, base)));
    }

    if (d instanceof Integer) {
        this._d = d;
    } else {
        if (typeof d == 'number') d = d.toString(base);
        d = d.split('').map(function(x) { return LETTERS.indexOf(x); });
        this._d = new Integer(new Uint16Array(changeBase(d, POWER, base)));
    }
}

Decimal.prototype.toString = function(base) {
    var iStr = this._i.toString();
    var dStr = this._d.toString();
    return (iStr || '0') + (dStr ? '.' + dStr.split('').reverse().join('') : '');
}

Decimal.prototype.valueOf = function(base) {
    return +this.toString(base);
}

Decimal.prototype.isUnit = function() {
    // TODO
}

Decimal.prototype.integerPart = function() {
    // TODO
}

Decimal.prototype.decimalPart = function() {
    // TODO
}

Decimal.prototype.round = function() {
    // TODO
}

Decimal.prototype.floor = function() {
    // TODO
}

Decimal.prototype.ceil = function() {
    // TODO
}

Decimal.prototype.toFraction = function(precision) {
    // TODO
}

Decimal.prototype.isZero = function() {
    return this._i.isZero() && this._d.isZero();
}

// -----------------------------------------------------------------------------

function DecimalEquals() {
}

function DecimalLess() {
}

function DecimalLessOrEqual() {
}

function DecimalGreater() {
}

function DecimalGreaterOrEqual() {
}

// -----------------------------------------------------------------------------

function DecimalAdd(a, b) {
    var dSum = DecimalPartAdd(a._d, b._d);
    var iSum = IntegerAdd(a._i, b._i);
    if (dSum[0]) iSum = IntegerAdd(iSum, dSum[0])
    return new Decimal(iSum, dSum[1]);
}

function DecimalSubtract() {
}

function DecimalMultiply() {
}

function DecimalDivide() {
}

// -----------------------------------------------------------------------------

function DecimalSqrt() {
}

function DecimalPower() {
}


// -----------------------------------------------------------------------------
// FRACTIONS

function Fractions() {

}

// TODO Fraction Functions



// -----------------------------------------------------------------------------
// EXPORTED NUMBER CLASS

function N(n, base) {

    if (base != null) {
        if (base < 1) throw new RangeError('The base '+base+' has to be >= 1.');
        if (base !== Math.round(base)) throw new TypeError('The base '+base+' has to be an integer.');
    }

    if (n instanceof N) {
        this = n.copy();

    } else if (n == null) {

    } else if (n === Infinity) {

    } else {
        if (!typeof n == 'string') n = n.toString();

        if (!(/^-?\d*.?\d+(\/-?\d+.?\d*)?$/).test(n)) {
            throw new TypeError('Invalid argument '+n+'.');
        }


    }

    // n can be a string (-1.2/5.7), a number, Infinity, null or another N
    // b can be undefined or a integer >= 1
}

N.prototype.copy = function() {
    return new N();
}

N.prototype.toString = function(base) {
}

N.prototype.valueOf = function(base) {
}

N.prototype.round = function(option) {
}

N.prototype.toInteger = function() {
}

N.prototype.toDecimal = function() {
}

N.prototype.toFraction = function(precision) {
}

// -----------------------------------------------------------------------------

N.prototype.isUnit = function() {
}

N.prototype.isZero = function() {
}

N.prototype.equals = function() {
}

N.prototype.lessThan = function() {
}

N.prototype.lessThanOrEqual = function() {
}

N.prototype.greaterThan = function() {
}

N.prototype.greaterThanOrEqual = function() {
}


// -----------------------------------------------------------------------------
// NMATH FUNCTIONS

var NMath = {};

NMath.sum = function sum(s1, s2) {

    if (arguments.length == 0) return NMath.ZERO;
    if (arguments.length == 1) return new N(s1);
    if (arguments.length > 2) {
        var first = arguments.pop();
        return NMath.sum(first, NMath.sum.apply(null, arguments));
    }

    if (!(s1 instanceof N)) s1 = new N(s1);
    if (!(s2 instanceof N)) s2 = new N(s2);

    // convert s1 and s2 to decimals if necessary

    // check if s1 or s2 are negative, the subtract

}

NMath.diff = function(d1, d2) {
}

NMath.prod = function(m1, m2) {
}

NMath.quot = function(q1, q2) {
}

// -----------------------------------------------------------------------------

NMath.factorial = function(n) {
}

NMath.exp = function(d, base) {
}

NMath.log = function(d, base) {
}

NMath.sin = function(d) {
}

NMath.cos = function(d) {
}

NMath.tan = function(d) {
}

NMath.cot = function(d) {
}

NMath.arcSin = function(d) {
}

NMath.arcCos = function(d) {
}

NMath.arcTan = function(d) {
}

NMath.arcTanh = function(d) {
}


// -----------------------------------------------------------------------------
// CONSTANTS

NMath.ZERO = new N(0);

NMath.ONE = new N(1);

NMath.INFINITY = new N(Infinity);

NMath.E = function(precision) {
}

NMath.PI = function(precision) {
}

NMath.PHI = function(precision) {
}

NMath.GAMMA = function(precision) {
}


// -----------------------------------------------------------------------------
// EXPORT

export default { N, NMath };

*/
