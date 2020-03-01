// =============================================================================
// Fermat.js | Arithmetic Tests
// (c) Mathigon
// =============================================================================


import * as tape from 'tape';
import {parseNumber, toWord} from '../src/arithmetic';


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
