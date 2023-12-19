// =============================================================================
// Fermat.js | Extended Number Tests
// (c) Mathigon
// =============================================================================


import tape from 'tape';
import {XNumber} from '../src';


const n = (n: number, d?: number, u?: '%'|'π') => new XNumber(n, d, u);
const str = (s: string) => XNumber.fromString(s)?.toString();
const dec = (s: number) => XNumber.fractionFromDecimal(s)?.toString();
const expr = (s: number, type: 'decimal'|'fraction'|'mixed'|'scientific') => XNumber.fractionFromDecimal(s)?.toExpr(type);

tape('XNumber Constructors', (test) => {
  test.equal(n(2.5).toString(), '2.5');
  test.equal(n(4, -2).toString(), '–4/2');
  test.equal(n(-2, -3).toString(), '2/3');
  test.equal(n(10, undefined, '%').toString(), '10%');
  test.equal(n(1, 2, 'π').toString(), '1/2π');
  test.equal(n(-1, undefined, 'π').toString(), '–π');
  test.equal(n(0, 2, 'π').toString(), '0');
  test.equal(n(10000, 20000).toString(), '10000/20000');
  test.end();
});

tape('Fraction Simplification', (test) => {
  test.equal(n(4, 8).simplified.toString(), '1/2');
  test.equal(n(-3, 9).simplified.toString(), '–1/3');
  test.end();
});

tape('XNumber Arithmetic', (test) => {
  test.equal(n(2).add(n(3)).toString(), '5');
  test.equal(n(-2).add(3).toString(), '1');
  test.equal(n(2).add(n(-3)).toString(), '–1');
  test.equal(n(-2).add(-3).toString(), '–5');
  test.equal(n(2.4).add(1.2).toString(), '3.6');
  test.equal(n(1, 2).add(1.2).toString(), '1.7');
  test.equal(n(1, 2).add(2).toString(), '5/2');
  test.equal(n(1, 4).add(0.5).toString(), '0.75');  // Maybe should be 3/4?
  test.equal(n(20, undefined, '%').add(0.2).toString(), '0.4');
  test.equal(n(20, undefined, '%').add(n(30, undefined, '%')).toString(), '50%');
  test.equal(n(1, 2, 'π').add(n(3, 2, 'π')).simplified.toString(), '2π');
  test.equal(n(0).add(n(2, undefined, 'π')).toString(), '2π');
  test.equal(n(0).add(n(5, 10).multiply(3)).toString(), '15/10');
  test.equal(n(3, 3).toString(), '3/3');
  test.equal(n(6, 3).toString(), '6/3');
  test.equal(n(3, 3).simplified.toString(), '1');
  test.equal(n(6, 3).simplified.toString(), '2');
  test.equal(n(0).add(n(3, 3)).toString(), n(3, 3).toString());
  test.end();
});

tape('Fraction simplification', (test) => {
  test.equal(n(1, 4).add(n(2, 4)).toString(), '3/4');
  test.equal(n(1, 4).add(n(1, 2)).toString(), '3/4');
  test.equal(n(1, 4).add(n(1, 3)).toString(), '7/12');
  test.end();
});

tape('Thousands Separators', (test) => {
  test.equal(XNumber.fromString('1,000')?.add(XNumber.fromString('1/2')!).toString(), '2001/2');
  test.equal(XNumber.fromString('1/2')?.add(XNumber.fromString('1,000')!).toString(), '2001/2');
  test.equal(str('1000π'), '1000π');
  test.end();
});

tape('XNumber Parsing', (test) => {
  test.equal(str('1/3'), '1/3');
  test.equal(str('1/0'), undefined);
  test.equal(str('-1/1'), '–1');
  test.equal(str('1/-2'), '–1/2');
  test.equal(str('0/2'), '0');
  test.equal(str('0/0'), undefined);
  test.equal(str('/0'), undefined);
  test.equal(str('/'), undefined);
  test.equal(str('0/'), undefined);
  test.equal(str('0.2'), '0.2');
  test.equal(str('10%'), '10%');
  test.equal(str(' 2/3 π  '), '2/3π');
  test.equal(str('π'), 'π');
  test.equal(str('-π'), '–π');
  test.equal(str('-π/2'), '–1/2π');
  test.equal(str('$'), undefined);
  test.equal(str('1,000/3000'), '1000/3000');
  test.end();
});

tape('XNumber Power Suffixes', (test) => {
  test.equal(str('1k'), '1,000');
  test.equal(str('10m'), '10m');
  test.equal(str('1.2m'), '1.2m');
  test.equal(str('1.b'), '1b');
  test.equal(str('.5b'), '500m');
  test.end();
});

tape('Decimal to String', (test) => {
  test.equal(dec(0.5), '1/2');
  test.equal(dec(-0.25), '–1/4');
  test.equal(dec(0), '0');
  test.equal(dec(1), '1');
  test.equal(dec(-1), '–1');
  test.equal(dec(2.5), '5/2');
  test.equal(dec(-2.5), '–5/2');
  test.equal(dec(0.33), '33/100');
  test.equal(dec(0.333), '333/1000');
  test.equal(dec(0.333333333333), '1/3');
  test.equal(dec(0.0333333333333), '1/30');
  test.equal(dec(0.05), '1/20');
  test.equal(dec(0.04761904762), '1/21');
  test.equal(dec(-5), '–5');

  test.equal(dec(0.333333333333), '1/3');
  test.equal(dec(-0.333333333333), '–1/3');
  test.equal(dec(0.999999999999), '1');
  test.equal(dec(0.833333333333), '5/6');
  test.equal(dec(0.171717171717), '17/99');

  test.end();
});

tape('Mixed numbers', (test) => {
  test.deepEqual(expr(1.999999999999, 'mixed'), '2');
  test.deepEqual(expr(0.333333333333, 'mixed'), '1/3');
  test.deepEqual(expr(1.333333333333, 'mixed'), '1 1/3');
  test.deepEqual(expr(-1.333333333333, 'mixed'), '–1 1/3');
  test.end();
});

tape('Scientific notation', (test) => {
  test.deepEqual(expr(0.000002, 'scientific'), '2 × 10^(-6)');
  test.deepEqual(expr(0.00012, 'scientific'), '1.2 × 10^(-4)');
  test.deepEqual(expr(1234.3, 'scientific'), '"1,234"');
  test.deepEqual(expr(12343.2, 'decimal'), '"12.3k"');
  test.deepEqual(expr(12343.2, 'scientific'), '1.234 × 10^4');
  test.deepEqual(expr(123432.1, 'scientific'), '1.234 × 10^5');
  test.end();
});
