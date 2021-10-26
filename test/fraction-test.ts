// =============================================================================
// Fermat.js | Fraction Tests
// (c) Mathigon
// =============================================================================


import tape from 'tape';
import {Fraction} from '../src';

tape('fromString', (test) => {
  test.deepEqual(Fraction.fromString('1/2'), new Fraction(1, 2));
  test.deepEqual(Fraction.fromString('1/3'), new Fraction(1, 3));
  test.deepEqual(Fraction.fromString('1/10'), new Fraction(1, 10));
  test.deepEqual(Fraction.fromString('1/11'), new Fraction(1, 11));
  test.deepEqual(Fraction.fromString('1/0'), new Fraction(1, 0));
  test.deepEqual(Fraction.fromString('0/1'), new Fraction(0, 1));
  test.deepEqual(Fraction.fromString('0/0'), new Fraction(0, 0));
  test.deepEqual(Fraction.fromString('/0'), new Fraction(0, 1));
  test.deepEqual(Fraction.fromString('/'), new Fraction(0, 1));
  test.deepEqual(Fraction.fromString('0/'), new Fraction(0, 1));
  test.deepEqual(Fraction.fromString('5'), new Fraction(0, 1));
  test.deepEqual(Fraction.fromString('$'), new Fraction(0, 1));
  test.end();
});

tape('fromDecimal', (test) => {
  test.deepEqual(Fraction.fromDecimal(0.5), new Fraction(1, 2));
  test.deepEqual(Fraction.fromDecimal(0.25), new Fraction(1, 4));
  test.deepEqual(Fraction.fromDecimal(0), new Fraction(0, 1));
  test.deepEqual(Fraction.fromDecimal(0.33333), new Fraction(1, 3));
  test.deepEqual(Fraction.fromDecimal(0.33), new Fraction(1, 3));
  test.deepEqual(Fraction.fromDecimal(0.3), new Fraction(3, 10));
  test.deepEqual(Fraction.fromDecimal(0.033), new Fraction(0, 1));
  test.deepEqual(Fraction.fromDecimal(0.05), new Fraction(1, 20));
  test.deepEqual(Fraction.fromDecimal(0.04761904762), new Fraction(1, 20)); // 1/21
  test.deepEqual(Fraction.fromDecimal(-5), new Fraction(0, 1)); // 1/21
  test.end();
});
