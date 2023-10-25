// =============================================================================
// Fermat.js | Arithmetic Tests
// (c) Mathigon
// =============================================================================


import tape from 'tape';
import {numberFormat, parseNumber, scientificFormat, toWord} from '../src';


tape('numberFormat', (test) => {
  test.equal(numberFormat(1234, 5), '1,234', ':: numberFormat(1234, 5)');
  test.equal(numberFormat(1234, 4), '1,234', ':: numberFormat(1234, 4)');
  test.equal(numberFormat(1234, 3), '1.2k', ':: numberFormat(1234, 3)');
  test.equal(numberFormat(1000, 3), '1k', ':: numberFormat(1000, 3)');
  test.equal(numberFormat(-1234, 6), '–1,234', ':: numberFormat(-1234, 6)');
  test.equal(numberFormat(-1234, 5), '–1,234', ':: numberFormat(-1234, 5)');
  test.equal(numberFormat(-1234, 4), '–1.2k', ':: numberFormat(-1234, 4)');
  test.equal(numberFormat(-1000, 4), '–1k', ':: numberFormat(-1000, 4)');

  test.equal(numberFormat(10001, 5), '10,001', ':: numberFormat(10001, 5)');
  test.equal(numberFormat(10001, 4), '10k', ':: numberFormat(10001, 4)');
  test.equal(numberFormat(-10001, 6), '–10,001', ':: numberFormat(-10001, 6)');
  test.equal(numberFormat(-10001, 5), '–10k', ':: numberFormat(-10001, 5)');
  test.equal(numberFormat(100001, 6), '100,001', ':: numberFormat(100001, 6)');
  test.equal(numberFormat(100001, 5), '100k', ':: numberFormat(100001, 5)');
  test.equal(numberFormat(-100001, 7), '–100,001', ':: numberFormat(-100001, 7)');
  test.equal(numberFormat(-100001, 6), '–100k', ':: numberFormat(-100001, 6)');
  test.equal(numberFormat(1000001, 7), '1,000,001', ':: numberFormat(1000001, 7)');
  test.equal(numberFormat(1000001, 6), '1m', ':: numberFormat(1000001, 6)');
  test.equal(numberFormat(-1000001, 8), '–1,000,001', ':: numberFormat(-1000001, 8)');
  test.equal(numberFormat(-1000001, 7), '–1m', ':: numberFormat(-1000001, 7)');

  test.equal(numberFormat(0.1, 2), '0.1', ':: numberFormat(0.1, 2)');
  test.equal(numberFormat(0.1, 1), '0', ':: numberFormat(0.1, 1)');
  test.equal(numberFormat(-0.1, 3), '–0.1', ':: numberFormat(-0.1, 3)');
  test.equal(numberFormat(-0.1, 2), '0', ':: numberFormat(-0.1, 2)');
  test.equal(numberFormat(0.01, 3), '0.01', ':: numberFormat(0.01, 3)');
  test.equal(numberFormat(0.01, 2), '0', ':: numberFormat(0.01, 2)');
  test.equal(numberFormat(-0.01, 4), '–0.01', ':: numberFormat(-0.01, 4)');
  test.equal(numberFormat(-0.01, 3), '0', ':: numberFormat(-0.01, 3)');
  test.equal(numberFormat(0.001, 4), '0.001', ':: numberFormat(0.001, 4)');
  test.equal(numberFormat(0.001, 3), '0', ':: numberFormat(0.001, 3)');
  test.equal(numberFormat(-0.001, 5), '–0.001', ':: numberFormat(-0.001, 5)');
  test.equal(numberFormat(-0.001, 4), '0', ':: numberFormat(-0.001, 4)');

  test.equal(scientificFormat(123123123, 6), '1.231 × 10^8');
  test.equal(scientificFormat(123123, 6), '123,123');
  test.equal(scientificFormat(-123123123, 6), '-1.23 × 10^8');

  test.equal(scientificFormat(0.000123, 6), '0.00012');
  test.equal(scientificFormat(0.000000123, 6), '1.23 × 10^(–7)');
  test.equal(scientificFormat(-0.000000123, 6), '-1.23 × 10^(–7)');

  test.equal(scientificFormat(-Number.MAX_VALUE * 10, 6), '–∞');
  test.equal(scientificFormat(-Number.MIN_VALUE / 10, 6), '0');

  test.end();
});

tape('parseNumber', (test) => {
  test.equal(parseNumber('1234'), 1234);
  test.equal(parseNumber('1.234,56'), 1234.56);
  test.equal(parseNumber('1,234.56'), 1234.56);
  test.equal(parseNumber('1,234,567'), 1234567);
  test.equal(parseNumber('1.234.567'), 1234567);
  test.equal(parseNumber('1,234.567'), 1234.567);
  test.equal(parseNumber('1.234,567'), 1234.567);
  test.equal(parseNumber('1.234'), 1.234);  // ambiguous!
  test.equal(parseNumber('1,234'), 1234);  // ambiguous!
  test.equal(parseNumber('0,123'), 0.123);  // ambiguous!
  test.equal(parseNumber('1,23'), 1.23);
  test.equal(parseNumber('1.2345'), 1.2345);
  test.equal(parseNumber('.123'), 0.123);

  test.equal(parseNumber('-123'), -123);
  test.equal(parseNumber('–123'), -123);

  test.equal(parseNumber('-123,456'), -123456);  // ambiguous!
  test.equal(parseNumber('-123.456'), -123.456);  // ambiguous!

  test.ok(isNaN(parseNumber('1,2345,678')));
  test.ok(isNaN(parseNumber('1.2345.678')));
  test.ok(isNaN(parseNumber('1,2345.678')));
  test.ok(isNaN(parseNumber('1.2345,678')));

  test.ok(isNaN(parseNumber('1.234,56A')));
  test.ok(isNaN(parseNumber('123A456')));

  test.end();
});


tape('parseNumber', (test) => {
  test.equal(toWord(0), 'zero');
  test.equal(toWord(1), 'one');
  test.equal(toWord(2), 'two');
  test.equal(toWord(10), 'ten');
  test.equal(toWord(11), 'eleven');
  test.equal(toWord(20), 'twenty');
  test.equal(toWord(45), 'forty-five');
  test.equal(toWord(99), 'ninety-nine');
  test.equal(toWord(105), 'one hundred five');
  test.equal(toWord(35783), 'thirty-five thousand seven hundred eighty-three');
  test.equal(toWord(1000000), 'one million');
  test.equal(toWord(10000011), 'ten million eleven');

  test.end();
});
