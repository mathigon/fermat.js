// =============================================================================
// Fermat.js | Statistic Tests
// (c) Mathigon
// =============================================================================


import tape from 'tape';
import {mode, quantile} from '../src';


tape('mode', (test) => {
  test.equal(mode([]), undefined);
  test.equal(mode([2]), 2);
  test.equal(mode([2, 3]), undefined);
  test.equal(mode([2, 3, 3]), 3);
  test.equal(mode([2, 2, 3, 3, 4]), undefined);
  test.equal(mode([2, 2, 2, 3, 3, 4]), 2);

  test.end();
});

tape('quantile', (test) => {
  test.equal(quantile([], 0.5), 0);

  const evenPopulation = [1, 2, 3, 4, 5];
  test.equal(quantile(evenPopulation, 0), 1);
  test.equal(quantile(evenPopulation, 0.25), 1.75);
  test.equal(quantile(evenPopulation, 0.5), 3);
  test.equal(quantile(evenPopulation, 0.75), 4.25);
  test.equal(quantile(evenPopulation, 1), 5);

  const oddPopulation = [1, 2, 3, 4, 5, 6];
  test.equal(quantile(oddPopulation, 0), 1);
  test.equal(quantile(oddPopulation, 0.25), 2);
  test.equal(quantile(oddPopulation, 0.5), 3.5);
  test.equal(quantile(oddPopulation, 0.75), 5);
  test.equal(quantile(oddPopulation, 1), 6);
  test.end();
});
