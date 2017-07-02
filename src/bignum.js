// =============================================================================
// Fermat.js | Bignum
// (c) Mathigon
// *** EXPERIMENTAL ***
// =============================================================================



// -----------------------------------------------------------------------------
// Setup and Helper Functions

const BASE = 12;
const POWER = Math.pow(2, BASE);
const LETTERS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQUSTUVWXYZ';

function changeBase(number, targetBase, originalBase) {

  if (number == 0) return [];
  if (!originalBase) originalBase = 10;

  let result = [];
  while (number.length > 0) {
    let remainingToConvert = [], resultDigit = 0;
    for (let position = number.length-1; position >= 0; --position) {
      let idx = number[position];
      let currentValue = idx + resultDigit * originalBase;
      let remainDigit = Math.floor(currentValue / targetBase);
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
  let trailingZeros = 0;
  let length = a.length;
  for (let i = length - 1; i >= 0; --i) {
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

export class Integer {

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
    return this.length === 1 && this.n[0] === 1;
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

    for (let i = a.length-1; i >= 0; --i) {
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

    for (let i = a.length - 1; i >= 0; --i) {
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
    let sum = this.n[i] + add;
    this.n[i] = sum % POWER;
    let carry = sum >> BASE;
    if (carry) this.addTo(i+1, carry);
  }

  static add(a, b) {
    let l = Math.max(a.length, b.length);
    let result = new Array(l + 1);
    let sum, carry = 0;

    for (let i=0; i<l; ++i) {
      sum = (a.n[i] || 0) + (b.n[i] || 0) + carry;
      carry = sum >> BASE;
      result[i] = sum % POWER;
    }

    result[l] = carry;
    return new Integer(result);
  }

  static subtract(a, b) {
    let al = a.length;
    let bl = b.length;

    if (Integer.less(a, b)) {
      let tmp = a;
      a = b;
      b = tmp;
    }

    let l = Math.max(al, bl);
    let result = new Array(l+1);
    let diff, carry = 0;

    for (let i=0; i<l; ++i) {
      diff = (a.n[i] || 0) - (b.n[i] || 0) - carry;
      carry = (diff < -POWER) ? 2 : (diff < 0) ? 1 : 0;
      result[i] = diff + carry * POWER;
    }

    result[l] = carry;
    return new Integer(result);
  }

  static multiply(a, b) {
    let al = a.length;
    let bl = b.length;
    let result = zeros(al+bl);

    for (let i=0; i < al; ++i) {
      for (let j=0; j < bl; ++j) {
        let prod = a.n[i] * b.n[j];
        result.addTo(i + j, prod);
      }
    }

    return new Integer(result);
  }

  static multiply2(a, b) {
    let al = a.length;
    let bl = b.length;

    if (al == 0 || bl == 0) {
      return new Integer(0);
    }

    if (a.xlength == 1 && b.xlength == 1) {
      let prod = a[0] * b[0];
      return new Integer([prod % POWER, prod >> BASE]);
    }

    let l = Math.ceil(Math.max(al, bl)/2);

    let a1 = new Integer( a.n.slice(0,l) );
    let a2 = new Integer( a.n.slice(l) );
    let b1 = new Integer( b.n.slice(0,l) );
    let b2 = new Integer( b.n.slice(l) );

    let z0 = Integer.multiply2(a1, b1);
    let z1 = Integer.multiply2(Integer.add(a1, a2), Integer.add(b1, b2));
    let z2 = Integer.multiply2(a2, b2);
    let z3 = Integer.subtract(Integer.subtract(z1,z2), z0);

    let result = new Array(2*l + z2.length);

    for (let i=0; i<z1.length; ++i) result.n[i] = z1.n[i];
    for (let i=0; i<z3.length; ++i) result.n[l+i] += z3.n[i];
    for (let i=0; i<z2.length; ++i) result.n[2*l+i] += z2.n[i];

    return new Integer(result);
  }

  // Returns [quotient, remainder]
  static divideHelper(a, b) {

    if (Integer.greater(b,a)) return [0, b];

    let bx = new Integer(b);
    let by = new Integer(0);
    let c = 0;

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

    let resultLength = a.length - b.length + 1;
    let result = new Array(resultLength);
    let a1 = a;

    for (let i = resultLength-1; i >= 0; --i) {

      let subA = new Integer(a1.slice(i));
      let tmp = Integer.divideHelper(subA, b);

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
    if (this.isUnit() || this.isZero()) return new Integer(1);
    return Integer.multiply(this, Integer.subtract(this.n, new Integer(1))
                  .factorial());
  }

  sqrt() {
    // TODO
  }

  power(_a) {
    // TODO
  }

  static lcm(_a, _b) {
    // TODO
  }

  static gcd(_a, _b) {
    // TODO
  }

}
