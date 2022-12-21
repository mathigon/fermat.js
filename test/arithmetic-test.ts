// =============================================================================
// Fermat.js | Arithmetic Tests
// (c) Mathigon
// =============================================================================


import tape from 'tape';
import {numberFormat, parseNumber, toWord} from '../src';


tape('numberFormat', (test) => {
  test.equal(numberFormat(1234, 5, true), '1,234');
  test.equal(numberFormat(1234, 4, true), '1,234');
  test.equal(numberFormat(1234, 3, true), '1.23k');
  test.equal(numberFormat(12345.6, 3, true), '12.3k');
  test.equal(numberFormat(12345.6, 4, true), '12.35k');
  test.equal(numberFormat(-1234, 6, true), '–1,234');
  test.equal(numberFormat(-1234, 4, true), '–1,234');
  test.equal(numberFormat(-1234, 3, true), '–1.23k');
  test.equal(numberFormat(-1000, 3, true), '–1k');

  test.equal(numberFormat(10001, 5, true), '10,001');
  test.equal(numberFormat(10001, 4, true), '10k');
  test.equal(numberFormat(-10001, 5, true), '–10,001');
  test.equal(numberFormat(-10001, 4, true), '–10k');
  test.equal(numberFormat(100001, 6, true), '100,001');
  test.equal(numberFormat(100001, 5, true), '100k');
  test.equal(numberFormat(-100001, 6, true), '–100,001');
  test.equal(numberFormat(-100001, 5, true), '–100k');
  test.equal(numberFormat(1000001, 7, true), '1,000,001');
  test.equal(numberFormat(1000001, 6, true), '1m');
  test.equal(numberFormat(-1000001, 7, true), '–1,000,001');
  test.equal(numberFormat(-1000001, 6, true), '–1m');

  test.equal(numberFormat(0.11, 2, true), '0.11');
  test.equal(numberFormat(0.11, 1, true), '0.1');
  test.equal(numberFormat(-0.11, 2, true), '–0.11');
  test.equal(numberFormat(-0.11, 1, true), '–0.1');
  test.equal(numberFormat(0.0111, 3, true), '0.0111');
  test.equal(numberFormat(0.011, 2, true), '0.011');
  test.equal(numberFormat(-0.011, 2, true), '–0.011');
  test.equal(numberFormat(-0.011, 1, true), '–0.01');
  test.equal(numberFormat(0.0011, 2, true), '0.0011');
  test.equal(numberFormat(0.0011, 1, true), '0.001');
  test.equal(numberFormat(-0.0011, 2, true), '–0.0011');
  test.equal(numberFormat(-0.0011, 1, true), '–0.001');
  test.equal(numberFormat(1000.11, 8, true, 'de'), '1.000,11');
  test.equal(numberFormat(1000.11, 8, true, 'es'), '1000,11');
  test.equal(numberFormat(10000.11, 8, true, 'es'), '10.000,11');
  test.end();
});

tape('parseNumber', (test) => {
  test.equal(parseNumber('1234'), 1234);
  test.equal(parseNumber('1.234,56'), 1.23456);
  test.equal(parseNumber('1,23456', 'de'), 1.23456);
  test.equal(parseNumber('1,23456', 'es'), 1.23456);
  test.equal(parseNumber('1,234.56'), 1234.56);
  test.equal(parseNumber('1.234,56', 'de'), 1234.56);
  test.equal(parseNumber('1.234,56', 'es'), 1234.56);
  test.equal(parseNumber('1,234,567'), 1234567);
  test.equal(parseNumber('1.234.567', 'de'), 1234567);
  test.equal(parseNumber('1.234.567', 'es'), 1234567);
  test.equal(parseNumber('1,234.567'), 1234.567);
  test.equal(parseNumber('1.234,567', 'de'), 1234.567);
  test.equal(parseNumber('1.234,567', 'es'), 1234.567);
  test.equal(parseNumber('1.234'), 1.234);
  test.equal(parseNumber('1,234', 'de'), 1.234);
  test.equal(parseNumber('1,234', 'es'), 1.234);
  test.equal(parseNumber('1,234'), 1234);
  test.equal(parseNumber('1.234', 'de'), 1234);
  test.equal(parseNumber('1.234', 'es'), 1234);
  test.equal(parseNumber('0.123'), 0.123);
  test.equal(parseNumber('0,123', 'de'), 0.123);
  test.equal(parseNumber('0,123', 'es'), 0.123);
  test.equal(parseNumber('1.23'), 1.23);
  test.equal(parseNumber('1,23'), 123);
  test.equal(parseNumber('1,23', 'de'), 1.23);
  test.equal(parseNumber('1.23', 'de'), 123);
  test.equal(parseNumber('1.2345'), 1.2345);
  test.equal(parseNumber('.123'), 0.123);

  test.equal(parseNumber('-123'), -123);
  test.equal(parseNumber('–123'), -123);

  test.notOk(isNaN(parseNumber('1,2345,678')));
  test.ok(isNaN(parseNumber('1.2345.678')));
  test.notOk(isNaN(parseNumber('1,2345.678')));
  test.notOk(isNaN(parseNumber('1.2345,678')));

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
