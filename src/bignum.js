// =============================================================================
// Fermat.js | Bignum
// (c) 2016 Mathigon
// =============================================================================



// -----------------------------------------------------------------------------
// Setup and Helper Functions

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

function zeros(length) {
    return new Array(length).fill(0);
}


// -----------------------------------------------------------------------------
// Integer Class

export default class Integer {

    constructor(n, base = 10) {
        if (!Array.isArray(n)) {
            if (typeof n === 'number') n = n.toString(base);
            n = n.split('').reverse().map(function (x) { return LETTERS.indexOf(x); });
            n = changeBase(n, POWER, base);
        }

        this.n = [];
        this.length = arrayPaddedLength(n);
    }


    // -------------------------------------------------------------------------
    // Utilities

    toString(base = 10) {
        if (!this.length) return '0';
        return changeBase(this.n, base, POWER).reverse().join('');
    }

    valueOf(base = 10) {
        return +this.toString(base);
    }

    isUnit() {
        return this.length === 1 && n[0] === 1;
    }

    isZero() {
        return this.length === 0;
    }


    // -------------------------------------------------------------------------
    // Comparisons

    static equals(a, b) {
        if (a.length !== b.length) return false;

        for (let i = 0; i < a.length; ++i) {
            if (a[i] !== b[i]) return false;
        }

        return true;
    }

    static less(a, b) {
        if (a.length < b.length) return true;

        for (var i = a.length-1; i >= 0; --i) {
            if (a[i] < b[i]) return true;
            if (a[i] > b[i]) return false;
        }

        return false;
    }

    static lessOrEqual(a, b) {
        return Integer.equals(a, b) || Integer.less(a, b);
    }

    static greater(a, b) {
        if (a.length > b.length) return true;
        if (a.length < b.length) return false;

        for (var i = a.length - 1; i >= 0; --i) {
            if (a[i] > b[i]) return true;
            if (a[i] < b[i]) return false;
        }

        return false;
    }

    static greaterOrEqual(a, b) {
        return Integer.equals(a, b) || Integer.greater(a, b);
    }


    // -------------------------------------------------------------------------
    // Simple Arithmetic

    addTo(i, add) {
        var sum = this.n[i] + add;
        this.n[i] = sum % POWER;
        var carry = sum >> BASE;
        if (carry) this.addTo(i+1, carry);
    }

    static add(a, b) {

        var l = Math.max(a.length, b.length);
        var result = new Array(l + 1);
        var sum, carry = 0;

        for (var i=0; i<l; ++i) {
            sum = (a.n[i] || 0) + (b.n[i] || 0) + carry;
            carry = sum >> BASE;
            result[i] = sum % POWER;
        }

        result[l] = carry;
        return new Integer(result);
    }

    static subtract(a, b) {

        var al = a.length;
        var bl = b.length;

        if (Integer.less(a, b)) {
            var tmp = a;
            a = b;
            b = tmp;
        }

        var l = Math.max(al, bl);
        var result = new Array(l+1);
        var diff, carry = 0;

        for (var i=0; i<l; ++i) {
            diff = (a.n[i] || 0) - (b.n[i] || 0) - carry;
            carry = (diff < -POWER) ? 2 : (diff < 0) ? 1 : 0;
            result[i] = diff + carry * POWER;
        }

        result[l] = carry;
        return new Integer(result);
    }

    static multiply(a, b) {

        var al = a.length;
        var bl = b.length;
        var result = zeros(al+bl);

        for (var i=0; i < al; ++i) {
            for (var j=0; j < bl; ++j) {
                let prod = a.n[i] * b.n[j];
                result.addTo(i + j, prod);
            }
        }

        return new Integer(result);
    }

    static multiply2(a, b) {

        var al = a.length;
        var bl = b.length;

        if (al == 0 || bl == 0) {
            return new Integer(0);
        }

        if (a.xlength == 1 && b.xlength == 1) {
            var prod = a[0] * b[0];
            return new Integer([prod % POWER, prod >> BASE]);
        }

        var l = Math.ceil(Math.max(al, bl)/2);

        var a1 = new Integer( a.n.slice(0,l) );
        var a2 = new Integer( a.n.slice(l) );
        var b1 = new Integer( b.n.slice(0,l) );
        var b2 = new Integer( b.n.slice(l) );

        var z0 = Integer.multiply2(a1, b1);
        var z1 = Integer.multiply2(Integer.add(a1, a2), Integer.add(b1, b2));
        var z2 = Integer.multiply2(a2, b2);
        var z3 = Integer.subtract(Integer.subtract(z1,z2), z0);

        var result = new Array(2*l + z2.length);

        for (let i=0; i<z1.length; ++i) result.n[i] = z1.n[i];
        for (let i=0; i<z3.length; ++i) result.n[l+i] += z3.n[i];
        for (let i=0; i<z2.length; ++i) result.n[2*l+i] += z2.n[i];

        return new Integer(result);
    }

    // Returns [quotient, remainder]
    static divideHelper(a, b) {

        if (Integer.greater(b,a)) return [0, b];

        var bx = new Integer(b);
        var by = new Integer(0);
        var c = 0;

        // TODO This can be made a lot more efficient

        while (Integer.greaterOrEqual(a, bx)) {
            by = bx;
            bx = Integer.add(bx, b);
            ++c;
        }

        return [c, Integer.subtract(a, by)];
    }

    // Returns [ (Integer) Math.floor(a/b), (Number) a%b ]
    static divide(a, b) {

        if (Integer.less(a, b))  return [new Integer(0), b];
        if (Integer.equals(a, b)) return [new Integer(1), new Integer(0)];
        if (b.isZero()) return [Infinity, null];

        var resultLength = a.length - b.length + 1;
        var result = new Array(resultLength);
        var a1 = a;

        for (var i = resultLength-1; i >= 0; --i) {

            var subA = new Integer(a1.slice(i));
            var tmp = Integer.divideHelper(subA, b);

            result[i] = tmp[0];
            a1 = new Integer([].concat.apply(a1.n.slice(0,i), tmp[1]));
        }

        return [new Integer(result), a1];
    }

    static modulus(a,b) {
        return Integer.divide(a,b)[1];
    }


    // -------------------------------------------------------------------------
    // Advanced Arithmetic

    factorial() {
        if (this.isUnit() || this.isZero(n)) return new Integer(1);
        return Integer.multiply(this, Integer.subtract(n, new Integer(1)).factorial());
    }

    sqrt() {
        // TODO
    }

    power(a) {
        // TODO
    }

    static lcm(a, b) {
        // TODO
    }

    static gcd(a, b) {
        // TODO
    }

}
