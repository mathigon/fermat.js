// =============================================================================
// Fermat.js | Arithmetic Tests
// (c) Mathigon
// =============================================================================


import tape from 'tape';
import {numberFormat, parseNumber, toWord} from '../src';


tape('numberFormat', (test) => {
  type t = [number, string, string];
  const positiveIntegers: t[] = [
    [1000, '1,000', '1k'],
    [10000, '10,000', '10k'],
    [100000, '100,000', '100k'],
    [1000000, '1,000,000', '1m']
  ];
  for (const [val, str1, str2] of positiveIntegers.slice()) {
    const str = str1.slice(0, str1.length - 1) + '1';
    positiveIntegers.push([val + 1, str, str2]);
  }
  const positiveRationals: t[] = [
    [0.1, '0.1', '0'],
    [0.01, '0.01', '0'],
    [0.001, '0.001', '0']
  ];
  const makeNegative = ([val, str1, str2]: t) => [-1 * val, `–${str1}`, str2 === '0' ? str2 : `–${str2}`] as t;
  const doSingleNumberFormatTest = (val: number, digits: number, expect: string) => {
    const result = numberFormat(val, digits);
    test.equal(result, expect, `:: numberFormat(${val}, ${digits}) === "${expect}"`);
  };
  const doNumberFormatTests = ([val, str1, str2]: t) => {
    const strlen = val.toString().replace('.', '').length;
    doSingleNumberFormatTest(val, val >= 0 ? strlen + 1 : strlen, str1);
    doSingleNumberFormatTest(val, val >= 0 ? strlen : strlen - 1, str1);
    doSingleNumberFormatTest(val, val >= 0 ? strlen - 1 : strlen - 2, str2);
  }
  for (const e of positiveIntegers) {
    doNumberFormatTests(e);
    doNumberFormatTests(makeNegative(e));
  }
  for (const e of positiveRationals) {
    doNumberFormatTests(e);
    doNumberFormatTests(makeNegative(e));
  }
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
