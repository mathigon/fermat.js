// =============================================================================
// Fermat.js | Arithmetic Tests
// (c) Mathigon
// =============================================================================


import * as tape from 'tape';
import {parseNumber} from '../src/arithmetic';


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
  test.equal(parseNumber('1.2345'), 1.2345);
  test.equal(parseNumber('.123'), 0.123);

  test.equal(parseNumber('-123'), -123);
  test.equal(parseNumber('–123'), -123);

  test.equal(parseNumber('-123,456'), -123456);
  test.equal(parseNumber('-123.456'), -123.456);

  test.ok(isNaN(parseNumber('1,2345,678')));
  test.ok(isNaN(parseNumber('1.2345.678')));
  test.ok(isNaN(parseNumber('1,2345.678')));
  test.ok(isNaN(parseNumber('1.2345,678')));

  test.ok(isNaN(parseNumber('1.234,56A')));
  test.ok(isNaN(parseNumber('123A456')));

  test.end();
});
